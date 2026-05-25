import "server-only";

import { slugify, naturalCompare } from "@/lib/utils";
import type { LibraryImage, LibraryResponse, Volume, VolumeResponse } from "@/types/manga";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  imageMediaMetadata?: {
    width?: number;
    height?: number;
  };
};

type DriveListResponse = {
  files: DriveFile[];
  nextPageToken?: string;
};

const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder";
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const CACHE_TTL_MS = 1000 * 60 * 5;

const globalCache = globalThis as typeof globalThis & {
  __driveLibraryCache?: Map<string, { expiresAt: number; data: LibraryResponse }>;
  __driveVolumeCache?: Map<string, { expiresAt: number; data: VolumeResponse }>;
};

function getLibraryCache() {
  if (!globalCache.__driveLibraryCache) {
    globalCache.__driveLibraryCache = new Map();
  }

  return globalCache.__driveLibraryCache;
}

function getVolumeCache() {
  if (!globalCache.__driveVolumeCache) {
    globalCache.__driveVolumeCache = new Map();
  }

  return globalCache.__driveVolumeCache;
}

function getApiKey() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("La variable GOOGLE_API_KEY est manquante.");
  }

  return apiKey;
}

export function extractDriveFolderId(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Ajoute un lien Google Drive ou un folder ID.");
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }

  const patterns = [
    /folders\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  throw new Error("Impossible d'extraire le folder ID depuis cette entrée.");
}

function createVolumeSlug(name: string, id: string) {
  return `${slugify(name)}-${id.slice(-6).toLowerCase()}`;
}

function buildImageUrl(fileId: string) {
  return `/api/drive/file/${fileId}`;
}

function buildThumbnailUrl(file: DriveFile) {
  return buildImageUrl(file.id);
}

async function driveRequest<T>(params: Record<string, string>, fileId?: string): Promise<T> {
  const url = new URL(fileId ? `${DRIVE_API_URL}/${fileId}` : DRIVE_API_URL);
  const apiKey = getApiKey();

  Object.entries({
    ...params,
    key: apiKey,
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  }).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Drive API a renvoyé ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

async function getFolderMetadata(folderId: string): Promise<DriveFile> {
  return driveRequest<DriveFile>(
    {
      fields: "id,name,mimeType",
    },
    folderId,
  );
}

async function listAllFiles(parentId: string, mode: "folders" | "images") {
  const files: DriveFile[] = [];
  let nextPageToken = "";

  const filters =
    mode === "folders"
      ? `mimeType='${DRIVE_FOLDER_MIME}'`
      : `(${IMAGE_MIME_TYPES.map((mime) => `mimeType='${mime}'`).join(" or ")})`;

  do {
    const data = await driveRequest<DriveListResponse>({
      q: `'${parentId}' in parents and trashed=false and ${filters}`,
      fields:
        "nextPageToken,files(id,name,mimeType,thumbnailLink,imageMediaMetadata(width,height))",
      orderBy: mode === "folders" ? "folder,name_natural" : "name_natural",
      pageSize: "1000",
      pageToken: nextPageToken,
    });

    files.push(...data.files);
    nextPageToken = data.nextPageToken ?? "";
  } while (nextPageToken);

  return files;
}

export async function fetchDriveFileBinary(fileId: string) {
  const apiKey = getApiKey();
  const url = new URL(`${DRIVE_API_URL}/${fileId}`);

  url.searchParams.set("alt", "media");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("supportsAllDrives", "true");

  const response = await fetch(url, {
    next: { revalidate: 86400 },
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new Error(`Impossible de charger l'image Google Drive (${response.status}): ${text}`);
  }

  return response;
}

function mapImage(file: DriveFile): LibraryImage {
  return {
    id: file.id,
    name: file.name,
    imageUrl: buildImageUrl(file.id),
    thumbnailUrl: buildThumbnailUrl(file),
    width: file.imageMediaMetadata?.width ?? null,
    height: file.imageMediaMetadata?.height ?? null,
  };
}

function mapVolume(folder: DriveFile, images: DriveFile[], includeImages: boolean): Volume {
  const sortedImages = [...images]
    .sort((left, right) => naturalCompare(left.name, right.name))
    .map(mapImage);

  return {
    id: folder.id,
    name: folder.name,
    slug: createVolumeSlug(folder.name, folder.id),
    pageCount: sortedImages.length,
    coverImage: sortedImages[0] ?? null,
    images: includeImages ? sortedImages : [],
  };
}

function mapVolumePreview(folder: DriveFile, coverFile: DriveFile | null): Volume {
  return {
    id: folder.id,
    name: folder.name,
    slug: createVolumeSlug(folder.name, folder.id),
    pageCount: null,
    coverImage: coverFile ? mapImage(coverFile) : null,
    images: [],
  };
}

async function listPreviewImage(parentId: string) {
  const data = await driveRequest<DriveListResponse>({
    q: `'${parentId}' in parents and trashed=false and (${IMAGE_MIME_TYPES.map((mime) => `mimeType='${mime}'`).join(" or ")})`,
    fields: "files(id,name,mimeType,thumbnailLink,imageMediaMetadata(width,height))",
    orderBy: "name_natural",
    pageSize: "1",
  });

  return data.files[0] ?? null;
}

async function mapConcurrent<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(values.length);
  let cursor = 0;

  async function run() {
    while (cursor < values.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(values[currentIndex]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, values.length) }, () => run());
  await Promise.all(workers);
  return results;
}

export async function getLibraryFromDrive(
  source: string,
  options: { includeImages?: boolean } = {},
): Promise<LibraryResponse> {
  const includeImages = options.includeImages ?? false;
  const folderId = extractDriveFolderId(source);
  const cacheKey = `${folderId}:${includeImages ? "full" : "library"}`;
  const cache = getLibraryCache();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const rootFolder = await getFolderMetadata(folderId);

  if (rootFolder.mimeType !== DRIVE_FOLDER_MIME) {
    throw new Error("L'entrée fournie n'est pas un dossier Google Drive.");
  }

  const folderVolumes = await listAllFiles(folderId, "folders");
  let volumes: Volume[] = [];

  if (folderVolumes.length === 0) {
    const rootImages = await listAllFiles(folderId, "images");

    if (rootImages.length > 0) {
      volumes = [mapVolume(rootFolder, rootImages, includeImages)];
    }
  } else if (includeImages) {
    const orderedFolders = folderVolumes.sort((left, right) => naturalCompare(left.name, right.name));

    volumes = (
      await mapConcurrent(orderedFolders, 6, async (folder) => {
        const images = await listAllFiles(folder.id, "images");
        return images.length > 0 ? mapVolume(folder, images, true) : null;
      })
    ).filter((volume): volume is Volume => volume !== null);
  } else {
    const orderedFolders = folderVolumes.sort((left, right) => naturalCompare(left.name, right.name));

    volumes = (
      await mapConcurrent(orderedFolders, 10, async (folder) => {
        const cover = await listPreviewImage(folder.id);
        return cover ? mapVolumePreview(folder, cover) : null;
      })
    ).filter((volume): volume is Volume => volume !== null);
  }

  if (volumes.length === 0) {
    throw new Error("Aucune image JPG, PNG ou WEBP trouvée dans ce dossier.");
  }

  const data: LibraryResponse = {
    source,
    folderId,
    title: rootFolder.name,
    volumes,
    generatedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data,
  });

  return data;
}

export async function getVolumeFromDrive(source: string, slug: string): Promise<VolumeResponse> {
  const folderId = extractDriveFolderId(source);
  const cacheKey = `${folderId}:${slug}`;
  const cache = getVolumeCache();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const library = await getLibraryFromDrive(source, { includeImages: true });
  const volume = library.volumes.find((item) => item.slug === slug);

  if (!volume) {
    throw new Error("Ce tome est introuvable.");
  }

  const data: VolumeResponse = {
    source: library.source,
    folderId: library.folderId,
    title: library.title,
    volume,
    generatedAt: library.generatedAt,
  };

  cache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data,
  });

  return data;
}

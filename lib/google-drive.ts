import "server-only";

import { slugify, naturalCompare } from "@/lib/utils";
import type { LibraryImage, LibraryResponse, Volume } from "@/types/manga";

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
};

function getCache() {
  if (!globalCache.__driveLibraryCache) {
    globalCache.__driveLibraryCache = new Map();
  }

  return globalCache.__driveLibraryCache;
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
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function buildThumbnailUrl(file: DriveFile) {
  if (file.thumbnailLink) {
    return file.thumbnailLink.replace(/=s\d+$/, "=s1200");
  }

  return buildImageUrl(file.id);
}

async function driveRequest<T>(
  params: Record<string, string>,
  fileId?: string,
): Promise<T> {
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

function mapVolume(folder: DriveFile, images: DriveFile[]): Volume {
  const sortedImages = [...images]
    .sort((left, right) => naturalCompare(left.name, right.name))
    .map(mapImage);

  return {
    id: folder.id,
    name: folder.name,
    slug: createVolumeSlug(folder.name, folder.id),
    pageCount: sortedImages.length,
    coverImage: sortedImages[0] ?? null,
    images: sortedImages,
  };
}

export async function getLibraryFromDrive(source: string): Promise<LibraryResponse> {
  const folderId = extractDriveFolderId(source);
  const cache = getCache();
  const cached = cache.get(folderId);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const rootFolder = await getFolderMetadata(folderId);

  if (rootFolder.mimeType !== DRIVE_FOLDER_MIME) {
    throw new Error("L'entrée fournie n'est pas un dossier Google Drive.");
  }

  const folderVolumes = await listAllFiles(folderId, "folders");
  const volumes: Volume[] = [];

  if (folderVolumes.length === 0) {
    const rootImages = await listAllFiles(folderId, "images");

    if (rootImages.length > 0) {
      volumes.push(mapVolume(rootFolder, rootImages));
    }
  } else {
    for (const folder of folderVolumes.sort((left, right) => naturalCompare(left.name, right.name))) {
      const images = await listAllFiles(folder.id, "images");

      if (images.length > 0) {
        volumes.push(mapVolume(folder, images));
      }
    }
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

  cache.set(folderId, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data,
  });

  return data;
}

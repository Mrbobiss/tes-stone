export type LibraryImage = {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
};

export type Volume = {
  id: string;
  name: string;
  slug: string;
  pageCount: number;
  coverImage: LibraryImage | null;
  images: LibraryImage[];
};

export type LibraryResponse = {
  source: string;
  folderId: string;
  title: string;
  volumes: Volume[];
  generatedAt: string;
};

export type VolumeResponse = {
  source: string;
  folderId: string;
  title: string;
  volume: Volume;
  generatedAt: string;
};

export type ProgressMap = Record<string, number>;

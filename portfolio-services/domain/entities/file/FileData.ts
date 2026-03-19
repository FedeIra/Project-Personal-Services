export interface FileData {
  key: string;
  size: number;
  lastModified: Date;
  storageClass?: string;
}

export interface FileMetadata {
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  eTag?: string;
}

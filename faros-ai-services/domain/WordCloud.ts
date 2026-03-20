// Domain types for the Faros AI Word Cloud service:

export interface WordEntry {
  word: string;
  count: number;
}

export interface ProcessedUrl {
  url: string;
  status: UrlStatus;
  createdAt: string;
  updatedAt: string;
}

export enum UrlStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PROCESSED = 'PROCESSED',
  ERROR = 'ERROR',
}

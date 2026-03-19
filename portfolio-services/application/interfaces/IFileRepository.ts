import { FileData, FileMetadata } from '../../domain/entities/file/FileData';

export interface IFileRepository {
  uploadFile(
    fileName: string,
    fileContent: Buffer,
    contentType: string
  ): Promise<void>;
  getFilesData(): Promise<FileData[]>;
  getFileData(fileName: string): Promise<FileMetadata>;
  getFileUrl(fileName: string): Promise<string>;
  downloadFile(fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
}

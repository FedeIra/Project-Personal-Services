import { IFileRepository } from '../interfaces/IFileRepository';
import { FileMetadata } from '../../domain/entities/file/FileData';

export class GetFileDataUseCase {
  constructor(private readonly repository: IFileRepository) {}

  async execute(fileName: string): Promise<FileMetadata> {
    return this.repository.getFileData(fileName);
  }
}

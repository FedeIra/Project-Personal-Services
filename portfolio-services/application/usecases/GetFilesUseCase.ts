import { IFileRepository } from '../interfaces/IFileRepository';
import { FileData } from '../../domain/entities/file/FileData';

export class GetFilesUseCase {
  constructor(private readonly repository: IFileRepository) {}

  async execute(): Promise<FileData[]> {
    return this.repository.getFilesData();
  }
}

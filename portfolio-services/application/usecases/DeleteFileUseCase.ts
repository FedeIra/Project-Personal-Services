import { IFileRepository } from '../interfaces/IFileRepository';

export class DeleteFileUseCase {
  constructor(private readonly repository: IFileRepository) {}

  async execute(fileName: string): Promise<void> {
    return this.repository.deleteFile(fileName);
  }
}

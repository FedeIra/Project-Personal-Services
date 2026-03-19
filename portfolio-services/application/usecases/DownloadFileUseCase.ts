import { IFileRepository } from '../interfaces/IFileRepository';

export class DownloadFileUseCase {
  constructor(private readonly repository: IFileRepository) {}

  async execute(fileName: string): Promise<string> {
    return this.repository.downloadFile(fileName);
  }
}

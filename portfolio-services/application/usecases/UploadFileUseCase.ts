import { IFileRepository } from '../interfaces/IFileRepository';

export class UploadFileUseCase {
  constructor(private readonly repository: IFileRepository) {}

  async execute(
    fileName: string,
    fileContent: Buffer,
    contentType: string
  ): Promise<void> {
    return this.repository.uploadFile(fileName, fileContent, contentType);
  }
}

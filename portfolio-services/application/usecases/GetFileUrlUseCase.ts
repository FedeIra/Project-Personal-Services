import { IFileRepository } from '../interfaces/IFileRepository';

export class GetFileUrlUseCase {
  constructor(private readonly repository: IFileRepository) {}

  async execute(fileName: string): Promise<string> {
    return this.repository.getFileUrl(fileName);
  }
}

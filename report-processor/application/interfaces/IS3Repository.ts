// External Dependencies:
import { MultipartFile } from '@fastify/multipart';

// Interface for S3 repository operations:
export interface IS3Repository {
  getFile(key: string): Promise<Buffer>;
  uploadCSVFile(key: string, file: MultipartFile): Promise<void>;
}

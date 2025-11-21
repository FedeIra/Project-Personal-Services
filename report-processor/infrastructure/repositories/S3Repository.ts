import { S3 } from 'aws-sdk';
import { MultipartFile } from '@fastify/multipart';

// S3 Repository for file operations:
export class S3Repository {
  constructor(
    private readonly s3: S3,
    private readonly bucketName: string
  ) {}

  // Get file from S3 as Buffer:
  async getFile(key: string): Promise<Buffer> {
    try {
      const result = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();

      if (!result.Body) {
        throw new Error(`File not found or empty: ${key}`);
      }

      return result.Body as Buffer;
    } catch (err) {
      throw new Error(
        `Error getting file from S3 (key: ${key}): ${(err as Error).message}`
      );
    }
  }

  // Upload CSV file to S3:
  async uploadCSVFile(key: string, file: MultipartFile): Promise<void> {
    const buffer = await file.toBuffer();

    if (!buffer || buffer.length === 0) {
      throw new Error('CSV file is empty.');
    }

    try {
      await this.s3
        .putObject({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: 'text/csv',
        })
        .promise();
    } catch (err) {
      throw new Error('Error uploading file to S3: ' + (err as Error).message);
    }
  }
}

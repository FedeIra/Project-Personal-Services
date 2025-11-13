import { S3 } from 'aws-sdk';
import { MultipartFile } from '@fastify/multipart';

export class S3Repository {
  constructor(
    private readonly s3: S3,
    private readonly bucketName: string
  ) {}

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

  async getFileUrl(key: string): Promise<string> {
    try {
      const url = this.s3.getSignedUrl('getObject', {
        Bucket: this.bucketName,
        Key: key,
        Expires: 60 * 60,
      });
      return url;
    } catch (err) {
      throw new Error(
        'Error generating file URL from S3: ' + (err as Error).message
      );
    }
  }
}

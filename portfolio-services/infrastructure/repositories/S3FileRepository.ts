import { S3 } from 'aws-sdk';
import { IFileRepository } from '../../application/interfaces/IFileRepository';
import { FileData, FileMetadata } from '../../domain/entities/file/FileData';

const BUCKET = process.env.PORTFOLIO_S3_BUCKET || '';
const PREFIX = 'portfolio/';

export class S3FileRepository implements IFileRepository {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3();
  }

  async uploadFile(
    fileName: string,
    fileContent: Buffer,
    contentType: string
  ): Promise<void> {
    await this.s3
      .putObject({
        Bucket: BUCKET,
        Key: `${PREFIX}${fileName}`,
        Body: fileContent,
        ContentType: contentType,
      })
      .promise();
  }

  async getFilesData(): Promise<FileData[]> {
    const result = await this.s3
      .listObjectsV2({
        Bucket: BUCKET,
        Prefix: PREFIX,
      })
      .promise();

    return (result.Contents || []).map((obj) => ({
      key: obj.Key || '',
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
      storageClass: obj.StorageClass,
    }));
  }

  async getFileData(fileName: string): Promise<FileMetadata> {
    const result = await this.s3
      .headObject({
        Bucket: BUCKET,
        Key: `${PREFIX}${fileName}`,
      })
      .promise();

    return {
      contentType: result.ContentType,
      contentLength: result.ContentLength,
      lastModified: result.LastModified,
      eTag: result.ETag,
    };
  }

  async getFileUrl(fileName: string): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: BUCKET,
      Key: `${PREFIX}${fileName}`,
      Expires: 600,
    });
  }

  async downloadFile(fileName: string): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: BUCKET,
      Key: `${PREFIX}${fileName}`,
      Expires: 600,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: BUCKET,
        Key: `${PREFIX}${fileName}`,
      })
      .promise();
  }
}

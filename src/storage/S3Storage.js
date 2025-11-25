import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import createHttpError from 'http-errors';
import logger from '../utils/logger.js';

class S3Storage {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async save(filename, stream) {
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: filename,
          Body: stream,
        },
      });

      await upload.done();
      logger.info(`File ${filename} uploaded to S3 successfully.`);
      return `s3://${this.bucketName}/${filename}`;
    } catch (error) {
      throw createHttpError(500, `Failed to upload file to S3: ${filename}`, { cause: error });
    }
  }

  async delete(filename) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      });
      await this.s3Client.send(command);
      logger.info(`File ${filename} deleted from S3 successfully.`);
    } catch (error) {
      throw createHttpError(500, `Failed to delete file from S3: ${filename}`, { cause: error });
    }
  }
}

export default S3Storage;

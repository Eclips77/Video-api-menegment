import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import config from '../config/index.js';

class LocalStorage {
  constructor() {
    this.basePath = path.resolve(config.storage.videos.filesPath);
  }

  _getFullPath(filename) {
    return path.join(this.basePath, filename);
  }

  async save(filename, stream) {
    const filePath = this._getFullPath(filename);
    const writeStream = createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      stream.pipe(writeStream);
      stream.on('error', (error) => {
        writeStream.end();
        reject(createHttpError(500, 'Error during file stream save.', { cause: error }));
      });
      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', (error) => {
        stream.unpipe(writeStream);
        if (error.code === 'ENOSPC') {
          reject(createHttpError(507, 'Insufficient storage.', { cause: error }));
        } else {
          reject(createHttpError(500, 'Error writing file to disk.', { cause: error }));
        }
      });
    });
  }

  async delete(filename) {
    const filePath = this._getFullPath(filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        // Don't throw if the file doesn't exist, but throw for other errors.
        throw createHttpError(500, `Failed to delete file: ${filename}`, { cause: error });
      }
    }
  }
}

export default LocalStorage;

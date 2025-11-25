import { promises as fs } from 'fs';
import createHttpError from 'http-errors';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();

class JsonStorage {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw createHttpError(500, 'Error reading from storage');
    }
  }

  async write(data) {
    const release = await mutex.acquire();
    try {
      const currentData = await this.read();
      const updatedData = Array.isArray(data) ? data : { ...currentData, ...data };
      await fs.writeFile(this.filePath, JSON.stringify(updatedData, null, 2));
    } catch (error) {
      throw createHttpError(500, 'Error writing to storage');
    } finally {
      release();
    }
  }
}

export default JsonStorage;

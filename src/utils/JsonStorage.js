import { promises as fs } from 'fs';
import createHttpError from 'http-errors';
import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';

const mutex = new Mutex();

class JsonStorage {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async _readData() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      if (error instanceof SyntaxError) {
        throw createHttpError(500, `Corrupted data file: ${this.filePath}`, { cause: error });
      }
      throw createHttpError(500, `Error reading storage file: ${this.filePath}`, { cause: error });
    }
  }

  async _writeData(data) {
    const release = await mutex.acquire();
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      if (error.code === 'ENOSPC') {
        throw createHttpError(507, 'Insufficient storage.', { cause: error });
      }
      throw createHttpError(500, `Error writing to storage file: ${this.filePath}`, { cause: error });
    } finally {
      release();
    }
  }

  async create(item) {
    const data = await this._readData();
    const newItem = { id: uuidv4(), ...item };
    data.push(newItem);
    await this._writeData(data);
    return newItem;
  }

  async findAll() {
    return this._readData();
  }

  async findById(id) {
    const data = await this._readData();
    return data.find((item) => item.id === id) || null;
  }

  async update(id, updates) {
    const data = await this._readData();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const updatedItem = { ...data[index], ...updates };
    data[index] = updatedItem;
    await this._writeData(data);
    return updatedItem;
  }

  async deleteById(id) {
    const data = await this._readData();
    const initialLength = data.length;
    const newData = data.filter((item) => item.id !== id);
    if (newData.length === initialLength) {
      return false;
    }
    await this._writeData(newData);
    return true;
  }
}

export default JsonStorage;

import { promises as fs } from 'fs';
import path from 'path';
import config from '../config/index.js';
import logger from './logger.js';

export const ensureStorageDirs = async () => {
  try {
    const videoFilesPath = path.resolve(config.storage.videos.filesPath);
    const metadataPath = path.resolve(path.dirname(config.storage.videos.metadataPath));

    await fs.mkdir(videoFilesPath, { recursive: true });
    await fs.mkdir(metadataPath, { recursive: true });

    logger.info('Storage directories are ready.');
  } catch (error) {
    logger.error('Failed to create storage directories:', error);
    process.exit(1);
  }
};

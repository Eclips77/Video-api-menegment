import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { ensureStorageDirs } from './utils/storage.js';

const { port } = config;

const startServer = async () => {
  await ensureStorageDirs();
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
};

startServer();

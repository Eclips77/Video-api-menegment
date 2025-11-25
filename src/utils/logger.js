import config from '../config/index.js';

const { nodeEnv } = config;

const logger = {
  info: (message) => {
    if (nodeEnv !== 'test') {
      console.log(`[INFO] ${message}`);
    }
  },
  error: (message) => {
    if (nodeEnv !== 'test') {
      console.error(`[ERROR] ${message}`);
    }
  },
};

export default logger;

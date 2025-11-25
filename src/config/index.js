import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  storage: {
    videos: {
      metadataPath: process.env.VIDEOS_METADATA_PATH,
      filesPath: process.env.VIDEO_FILES_PATH,
    },
    playlists: {
      metadataPath: process.env.PLAYLISTS_METADATA_PATH,
    },
    genres: {
      metadataPath: process.env.GENRES_METADATA_PATH,
    },
  },
  uploads: {
    maxVideoFileSize: parseInt(process.env.MAX_VIDEO_FILE_SIZE, 10) || 104857600, // 100MB
  },
};

export default config;

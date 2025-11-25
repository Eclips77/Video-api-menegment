import busboy from 'busboy';
import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import createHttpError from 'http-errors';
import config from '../config/index.js';
import { createVideoSchema } from '../models/video.model.js';

const upload = (req, res, next) => {
  const bb = busboy({
    headers: req.headers,
    limits: {
      fileSize: config.uploads.maxVideoFileSize,
    },
  });
  const metadata = {};
  let videoFilePath;

  req.pipe(bb);

  bb.on('field', (name, val) => {
    metadata[name] = val;
  });

  bb.on('file', (name, file, info) => {
    if (name !== 'videoFile') {
      return file.resume();
    }

    try {
      const { mimeType } = info;
      if (!mimeType.startsWith('video/')) {
        return next(createHttpError(400, 'Invalid file type, only videos are allowed.'));
      }

      const fileExtension = path.extname(info.filename) || '.mp4';
      const newFilename = `${uuidv4()}${fileExtension}`;
      const saveTo = path.join(config.storage.videos.filesPath, newFilename);
      videoFilePath = saveTo;

      const writeStream = createWriteStream(saveTo);
      file.pipe(writeStream);

      file.on('error', (err) => {
        next(createHttpError(500, 'Error during file upload.', err));
      });
    } catch (error) {
      next(error);
    }
  });

  bb.on('finish', async () => {
    try {
      if (!videoFilePath) {
        return next(createHttpError(400, 'Video file is required.'));
      }

      if (metadata.genres && typeof metadata.genres === 'string') {
        metadata.genres = JSON.parse(metadata.genres);
      }

      const parsed = createVideoSchema.safeParse(metadata);

      if (!parsed.success) {
        await fs.unlink(videoFilePath);
        const validationErrors = parsed.error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return next(createHttpError(400, 'Validation failed', { errors: validationErrors }));
      }

      req.body = parsed.data;
      req.body.videoFile = path.basename(videoFilePath);
      next();
    } catch (error) {
      if (videoFilePath) {
        await fs.unlink(videoFilePath).catch(err => console.error('Failed to cleanup file:', err));
      }
      if (error.name === 'SyntaxError') {
        return next(createHttpError(400, 'Invalid JSON in genres field.'));
      }
      next(createHttpError(400, 'Invalid metadata.', { errors: error.errors }));
    }
  });

  bb.on('error', (err) => {
    next(createHttpError(500, 'Busboy error.', err));
  });
};

export default upload;

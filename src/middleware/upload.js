import busboy from 'busboy';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import createHttpError from 'http-errors';
import config from '../config/index.js';
import { createVideoSchema, internalVideoSchema } from '../models/video.model.js';
import LocalStorage from '../utils/LocalStorage.js';
import { validateVideoFile } from '../utils/videoValidator.js';

const fileStorage = new LocalStorage();

const upload = (req, res, next) => {
  let isNextCalled = false;
  const nextOnce = (err) => {
    if (!isNextCalled) {
      isNextCalled = true;
      next(err);
    }
  };

  const bb = busboy({
    headers: req.headers,
    limits: {
      fileSize: config.uploads.maxVideoFileSize,
    },
  });

  const metadata = {};
  let uploadedFilename;

  req.pipe(bb);

  bb.on('field', (name, val) => {
    metadata[name] = val;
  });

  bb.on('file', async (name, file, info) => {
    if (name !== 'videoFile') {
      return file.resume();
    }

    try {
      const { filename } = info;
      const fileExtension = path.extname(filename) || '.mp4';
      const newFilename = `${uuidv4()}${fileExtension}`;

      const filePath = await fileStorage.save(newFilename, file);
      uploadedFilename = newFilename;

      const duration = await validateVideoFile(filename, filePath);

      metadata.fileName = filename;
      metadata.uploadTime = new Date().toISOString();
      metadata.duration = Math.round(duration);

    } catch (error) {
      if (uploadedFilename) {
        await fileStorage.delete(uploadedFilename).catch(err => console.error('Failed to cleanup file after validation error:', err));
      }
      nextOnce(error);
    }
  });

  bb.on('finish', async () => {
    try {
      if (!uploadedFilename) {
        return nextOnce(createHttpError(400, 'Video file is required.'));
      }

      if (metadata.genres && typeof metadata.genres === 'string') {
        metadata.genres = JSON.parse(metadata.genres);
      }

      const userMetadataParsed = createVideoSchema.safeParse(metadata);

      if (!userMetadataParsed.success) {
        await fileStorage.delete(uploadedFilename);
        const validationErrors = userMetadataParsed.error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return nextOnce(createHttpError(400, 'Validation failed', { errors: validationErrors }));
      }

      const fullVideoData = {
        ...userMetadataParsed.data,
        videoFile: uploadedFilename,
        fileName: metadata.fileName,
        uploadTime: metadata.uploadTime,
        duration: metadata.duration,
      };

      const finalParsed = internalVideoSchema.safeParse(fullVideoData);

      if (!finalParsed.success) {
        await fileStorage.delete(uploadedFilename);
        const validationErrors = finalParsed.error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        return nextOnce(createHttpError(500, 'Internal validation failed', { errors: validationErrors }));
      }

      req.body = finalParsed.data;
      nextOnce();
    } catch (error) {
      if (uploadedFilename) {
        await fileStorage.delete(uploadedFilename).catch(err => console.error('Failed to cleanup file:', err));
      }
      if (error.name === 'SyntaxError') {
        return nextOnce(createHttpError(400, 'Invalid JSON in genres field.'));
      }
      nextOnce(createHttpError(400, 'Invalid metadata.', { errors: error.errors }));
    }
  });

  bb.on('error', (err) => {
    nextOnce(createHttpError(500, 'Busboy error.', err));
  });
};

export default upload;

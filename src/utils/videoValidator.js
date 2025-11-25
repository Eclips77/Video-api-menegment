import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import createHttpError from 'http-errors';

const VALID_VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv'];

const validateVideoFileExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (!VALID_VIDEO_EXTENSIONS.includes(ext)) {
    throw createHttpError(400, `Invalid file extension. Allowed extensions are: ${VALID_VIDEO_EXTENSIONS.join(', ')}`);
  }
};

const probeVideoFile = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(createHttpError(400, 'File is not a valid video or is corrupted.', { cause: err }));
      }
      if (!metadata.streams || !metadata.streams.some(s => s.codec_type === 'video')) {
        return reject(createHttpError(400, 'File does not contain a valid video stream.'));
      }
      resolve(metadata);
    });
  });
};

export const validateVideoFile = async (filename, filePath) => {
  validateVideoFileExtension(filename);
  const metadata = await probeVideoFile(filePath);
  return metadata.format.duration;
};

import { Router } from 'express';
import VideoController from '../controllers/video.controller.js';
import VideoService from '../services/video.service.js';
import JsonStorage from '../utils/JsonStorage.js';
import config from '../config/index.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { updateVideoSchema } from '../models/video.model.js';
import { z } from 'zod';

const router = Router();

const videoStorage = new JsonStorage(config.storage.videos.metadataPath);
const genreStorage = new JsonStorage(config.storage.genres.metadataPath);
const playlistStorage = new JsonStorage(config.storage.playlists.metadataPath);
const videoService = new VideoService(videoStorage, genreStorage, playlistStorage);
const videoController = new VideoController(videoService);

const idSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.get('/', videoController.getAll);
router.post('/', upload, videoController.create);
router.get('/:id', validate(idSchema), videoController.getById);
router.put('/:id', validate(idSchema.merge(z.object({ body: updateVideoSchema }))), videoController.update);
router.delete('/:id', validate(idSchema), videoController.delete);

export default router;

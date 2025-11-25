import { Router } from 'express';
import PlaylistController from '../controllers/playlist.controller.js';
import PlaylistService from '../services/playlist.service.js';
import JsonStorage from '../utils/JsonStorage.js';
import config from '../config/index.js';
import validate from '../middleware/validate.js';
import { createPlaylistSchema, updatePlaylistSchema } from '../models/playlist.model.js';
import { z } from 'zod';

const router = Router();

const playlistStorage = new JsonStorage(config.storage.playlists.metadataPath);
const videoStorage = new JsonStorage(config.storage.videos.metadataPath);
const playlistService = new PlaylistService(playlistStorage, videoStorage);
const playlistController = new PlaylistController(playlistService);

const idSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.get('/', playlistController.getAll);
router.post('/', validate(z.object({ body: createPlaylistSchema })), playlistController.create);
router.get('/:id', validate(idSchema), playlistController.getById);
router.put('/:id', validate(idSchema.merge(z.object({ body: updatePlaylistSchema }))), playlistController.update);
router.delete('/:id', validate(idSchema), playlistController.delete);

export default router;

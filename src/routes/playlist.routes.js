import { Router } from 'express';
import PlaylistController from '../controllers/playlist.controller.js';
import { playlistService } from './index.js';
import validate from '../middleware/validate.js';
import { createPlaylistSchema, updatePlaylistSchema, playlistIdSchema } from '../models/playlist.model.js';
import { z } from 'zod';

const router = Router();

const playlistController = new PlaylistController(playlistService);

router.get('/', playlistController.getAll);
router.post('/', validate(z.object({ body: createPlaylistSchema })), playlistController.create);
router.get('/:id', validate(playlistIdSchema), playlistController.getById);
router.put('/:id', validate(playlistIdSchema.merge(z.object({ body: updatePlaylistSchema }))), playlistController.update);
router.delete('/:id', validate(playlistIdSchema), playlistController.delete);

export default router;

import { Router } from 'express';
import GenreController from '../controllers/genre.controller.js';
import GenreService from '../services/genre.service.js';
import JsonStorage from '../utils/JsonStorage.js';
import config from '../config/index.js';
import validate from '../middleware/validate.js';
import { createGenreSchema, updateGenreSchema } from '../models/genre.model.js';
import { z } from 'zod';

const router = Router();

const genreStorage = new JsonStorage(config.storage.genres.metadataPath);
const videoStorage = new JsonStorage(config.storage.videos.metadataPath);
const genreService = new GenreService(genreStorage, videoStorage);
const genreController = new GenreController(genreService);

const idSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.get('/', genreController.getAll);
router.post('/', validate(z.object({ body: createGenreSchema })), genreController.create);
router.get('/:id', validate(idSchema), genreController.getById);
router.put('/:id', validate(idSchema.merge(z.object({ body: updateGenreSchema }))), genreController.update);
router.delete('/:id', validate(idSchema), genreController.delete);

export default router;

import { Router } from 'express';
import GenreController from '../controllers/genre.controller.js';
import { genreService } from './index.js';
import validate from '../middleware/validate.js';
import { createGenreSchema, updateGenreSchema, genreIdSchema } from '../models/genre.model.js';
import { z } from 'zod';

const router = Router();

const genreController = new GenreController(genreService);

router.get('/', genreController.getAll);
router.post('/', validate(z.object({ body: createGenreSchema })), genreController.create);
router.get('/:id', validate(genreIdSchema), genreController.getById);
router.put('/:id', validate(genreIdSchema.merge(z.object({ body: updateGenreSchema }))), genreController.update);
router.delete('/:id', validate(genreIdSchema), genreController.delete);

export default router;

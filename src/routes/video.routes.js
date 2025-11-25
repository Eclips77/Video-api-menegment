import { Router } from 'express';
import VideoController from '../controllers/video.controller.js';
import { videoService } from './index.js';
import upload from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { updateVideoSchema, videoIdSchema } from '../models/video.model.js';
import { z } from 'zod';

const router = Router();

const videoController = new VideoController(videoService);

router.get('/', videoController.getAll);
router.post('/', upload, videoController.create);
router.get('/:id', validate(videoIdSchema), videoController.getById);
router.put('/:id', validate(videoIdSchema.merge(z.object({ body: updateVideoSchema }))), videoController.update);
router.delete('/:id', validate(videoIdSchema), videoController.delete);

export default router;

import { z } from 'zod';

const videoSchema = z.object({
  id: z.string().uuid(),
  creator: z.string().min(1, 'Creator is required'),
  language: z.string().min(1, 'Language is required'),
  title: z.string().min(1, 'Title is required'),
  genres: z.array(z.string().uuid()).min(1, 'At least one genre is required'),
  videoFile: z.string().min(1, 'Video file is required'),
});

export const createVideoSchema = videoSchema.omit({ id: true, videoFile: true });
export const updateVideoSchema = createVideoSchema.partial();

export default videoSchema;

import { z } from 'zod';

const genreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
});

export const createGenreSchema = genreSchema.omit({ id: true });
export const updateGenreSchema = genreSchema.partial();

export const genreIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export default genreSchema;

import { z } from 'zod';

const playlistSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  videoIds: z.array(z.string().uuid()),
});

export const createPlaylistSchema = playlistSchema.omit({ id: true });
export const updatePlaylistSchema = playlistSchema.partial();

export default playlistSchema;

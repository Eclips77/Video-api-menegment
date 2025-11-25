import express from 'express';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Video Management API');
});

import videoRoutes from './routes/video.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import genreRoutes from './routes/genre.routes.js';

app.use('/api/videos', videoRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/genres', genreRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

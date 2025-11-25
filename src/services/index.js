import config from '../config/index.js';
import JsonStorage from '../utils/JsonStorage.js';
import LocalStorage from '../utils/LocalStorage.js';

import GenreService from './genre.service.js';
import PlaylistService from './playlist.service.js';
import VideoService from './video.service.js';

const genreStorage = new JsonStorage(config.storage.genres.metadataPath);
const playlistStorage = new JsonStorage(config.storage.playlists.metadataPath);
const videoStorage = new JsonStorage(config.storage.videos.metadataPath);
const fileStorage = new LocalStorage();

export const genreService = new GenreService(genreStorage, videoStorage);
export const playlistService = new PlaylistService(playlistStorage, videoStorage);
export const videoService = new VideoService(videoStorage, genreStorage, playlistStorage, fileStorage);

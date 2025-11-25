import { v4 as uuidv4 } from 'uuid';
import createHttpError from 'http-errors';
import { promises as fs } from 'fs';
import path from 'path';
import config from '../config/index.js';

class VideoService {
  constructor(videoStorage, genreStorage, playlistStorage) {
    this.videoStorage = videoStorage;
    this.genreStorage = genreStorage;
    this.playlistStorage = playlistStorage;
  }

  async getAll(query) {
    let videos = await this.videoStorage.read();
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      videos = videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm) ||
        video.creator.toLowerCase().includes(searchTerm)
      );
    }
    return videos;
  }

  async getById(id) {
    const videos = await this.videoStorage.read();
    const video = videos.find((v) => v.id === id);
    if (!video) {
      throw createHttpError(404, 'Video not found');
    }
    return video;
  }

  async create(videoData) {
    const videos = await this.videoStorage.read();
    const genres = await this.genreStorage.read();
    const allGenresExist = videoData.genres.every(genreId => genres.some(g => g.id === genreId));
    if (!allGenresExist) {
      await this._rollbackFileUpload(videoData.videoFile);
      throw createHttpError(400, 'One or more genres do not exist');
    }

    const newVideo = { id: uuidv4(), ...videoData };
    videos.push(newVideo);

    try {
      await this.videoStorage.write(videos);
    } catch (error) {
      await this._rollbackFileUpload(videoData.videoFile);
      throw createHttpError(500, 'Failed to save video metadata');
    }

    return newVideo;
  }

  async update(id, videoData) {
    const videos = await this.videoStorage.read();
    const index = videos.findIndex((v) => v.id === id);
    if (index === -1) {
      throw createHttpError(404, 'Video not found');
    }

    if (videoData.genres) {
      const genres = await this.genreStorage.read();
      const allGenresExist = videoData.genres.every(genreId => genres.some(g => g.id === genreId));
      if (!allGenresExist) {
        throw createHttpError(400, 'One or more genres do not exist');
      }
    }

    const updatedVideo = { ...videos[index], ...videoData };
    videos[index] = updatedVideo;
    await this.videoStorage.write(videos);
    return updatedVideo;
  }

  async delete(id) {
    const videos = await this.videoStorage.read();
    const videoToDelete = videos.find(v => v.id === id);
    if (!videoToDelete) {
      throw createHttpError(404, 'Video not found');
    }

    const videoFilePath = path.join(config.storage.videos.filesPath, videoToDelete.videoFile);

    try {
      await fs.unlink(videoFilePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw createHttpError(500, 'Failed to delete video file');
      }
    }

    const filteredVideos = videos.filter((v) => v.id !== id);
    await this.videoStorage.write(filteredVideos);

    const playlists = await this.playlistStorage.read();
    playlists.forEach(playlist => {
      playlist.videoIds = playlist.videoIds.filter(videoId => videoId !== id);
    });
    await this.playlistStorage.write(playlists);
  }

  async _rollbackFileUpload(filename) {
    if (filename) {
      const filePath = path.join(config.storage.videos.filesPath, filename);
      await fs.unlink(filePath).catch(err => console.error('Failed to rollback file upload:', err));
    }
  }
}

export default VideoService;

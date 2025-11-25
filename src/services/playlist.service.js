import { v4 as uuidv4 } from 'uuid';
import createHttpError from 'http-errors';

class PlaylistService {
  constructor(playlistStorage, videoStorage) {
    this.playlistStorage = playlistStorage;
    this.videoStorage = videoStorage;
  }

  async getAll() {
    return this.playlistStorage.read();
  }

  async getById(id) {
    const playlists = await this.playlistStorage.read();
    const playlist = playlists.find((p) => p.id === id);
    if (!playlist) {
      throw createHttpError(404, 'Playlist not found');
    }
    return playlist;
  }

  async create(playlistData) {
    await this._validateVideoIds(playlistData.videoIds);
    const playlists = await this.playlistStorage.read();
    const newPlaylist = { id: uuidv4(), ...playlistData };
    playlists.push(newPlaylist);
    await this.playlistStorage.write(playlists);
    return newPlaylist;
  }

  async update(id, playlistData) {
    if (playlistData.videoIds) {
      await this._validateVideoIds(playlistData.videoIds);
    }

    const playlists = await this.playlistStorage.read();
    const index = playlists.findIndex((p) => p.id === id);
    if (index === -1) {
      throw createHttpError(404, 'Playlist not found');
    }
    const updatedPlaylist = { ...playlists[index], ...playlistData };
    playlists[index] = updatedPlaylist;
    await this.playlistStorage.write(playlists);
    return updatedPlaylist;
  }

  async delete(id) {
    const playlists = await this.playlistStorage.read();
    const filteredPlaylists = playlists.filter((p) => p.id !== id);
    if (playlists.length === filteredPlaylists.length) {
      throw createHttpError(404, 'Playlist not found');
    }
    await this.playlistStorage.write(filteredPlaylists);
  }

  async _validateVideoIds(videoIds) {
    if (!videoIds || videoIds.length === 0) {
      return;
    }
    const videos = await this.videoStorage.read();
    const allVideosExist = videoIds.every(videoId => videos.some(v => v.id === videoId));
    if (!allVideosExist) {
      throw createHttpError(400, 'One or more videos do not exist');
    }
  }
}

export default PlaylistService;

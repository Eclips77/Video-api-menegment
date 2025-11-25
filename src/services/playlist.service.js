import createHttpError from 'http-errors';

class PlaylistService {
  constructor(playlistStorage, videoStorage) {
    this.playlistStorage = playlistStorage;
    this.videoStorage = videoStorage;
  }

  async getAll() {
    return this.playlistStorage.findAll();
  }

  async getById(id) {
    const playlist = await this.playlistStorage.findById(id);
    if (!playlist) {
      throw createHttpError(404, 'Playlist not found');
    }
    return playlist;
  }

  async create(playlistData) {
    await this._validateVideoIds(playlistData.videoIds);
    return this.playlistStorage.create(playlistData);
  }

  async update(id, playlistData) {
    if (playlistData.videoIds) {
      await this._validateVideoIds(playlistData.videoIds);
    }
    const updatedPlaylist = await this.playlistStorage.update(id, playlistData);
    if (!updatedPlaylist) {
      throw createHttpError(404, 'Playlist not found');
    }
    return updatedPlaylist;
  }

  async delete(id) {
    const deleted = await this.playlistStorage.deleteById(id);
    if (!deleted) {
      throw createHttpError(404, 'Playlist not found');
    }
  }

  async _validateVideoIds(videoIds) {
    if (!videoIds || videoIds.length === 0) {
      return;
    }
    const videos = await this.videoStorage.findAll();
    const videoIdSet = new Set(videos.map(v => v.id));
    const invalidVideoIds = videoIds.filter(id => !videoIdSet.has(id));
    if (invalidVideoIds.length > 0) {
      throw createHttpError(400, `Invalid video IDs: ${invalidVideoIds.join(', ')}`);
    }
  }
}

export default PlaylistService;

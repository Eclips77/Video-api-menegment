import createHttpError from 'http-errors';
import Fuse from 'fuse.js';

class VideoService {
  constructor(videoStorage, genreStorage, playlistStorage, fileStorage) {
    this.videoStorage = videoStorage;
    this.genreStorage = genreStorage;
    this.playlistStorage = playlistStorage;
    this.fileStorage = fileStorage;
  }

  _applyFuzzySearch(videos, query) {
    if (!query.fuzzy) {
      return videos;
    }
    const fuse = new Fuse(videos, {
      keys: ['title', 'creator'],
      threshold: 0.4,
    });
    return fuse.search(query.fuzzy).map(result => result.item);
  }

  _applyFieldSearch(videos, query) {
    const searchableFields = ['creator', 'language', 'title'];
    let filteredVideos = videos;
    for (const field of searchableFields) {
      if (query[field]) {
        filteredVideos = filteredVideos.filter(video =>
          video[field]?.toLowerCase() === query[field].toLowerCase()
        );
      }
    }
    return filteredVideos;
  }

  _applyRangeSearch(videos, query) {
    let filteredVideos = videos;
    if (query.uploadDateFrom) {
      filteredVideos = filteredVideos.filter(video => new Date(video.uploadTime) >= new Date(query.uploadDateFrom));
    }
    if (query.uploadDateTo) {
      filteredVideos = filteredVideos.filter(video => new Date(video.uploadTime) <= new Date(query.uploadDateTo));
    }
    if (query.durationMin) {
      filteredVideos = filteredVideos.filter(video => video.duration >= parseInt(query.durationMin, 10));
    }
    if (query.durationMax) {
      filteredVideos = filteredVideos.filter(video => video.duration <= parseInt(query.durationMax, 10));
    }
    return filteredVideos;
  }

  async getAll(query) {
    const allVideos = await this.videoStorage.findAll();
    const fuzzySearched = this._applyFuzzySearch(allVideos, query);
    const fieldSearched = this._applyFieldSearch(fuzzySearched, query);
    const rangeSearched = this._applyRangeSearch(fieldSearched, query);
    return rangeSearched;
  }

  async getById(id) {
    const video = await this.videoStorage.findById(id);
    if (!video) {
      throw createHttpError(404, 'Video not found');
    }
    return video;
  }

  async create(videoData) {
    await this._validateGenres(videoData.genres);
    const videoDataWithTimestamp = {
      ...videoData,
      lastModified: new Date().toISOString(),
    };
    try {
      return await this.videoStorage.create(videoDataWithTimestamp);
    } catch (error) {
      await this.fileStorage.delete(videoData.videoFile);
      throw createHttpError(500, 'Failed to save video metadata');
    }
  }

  async update(id, videoData) {
    if (videoData.genres) {
      await this._validateGenres(videoData.genres);
    }
    const videoDataWithTimestamp = {
      ...videoData,
      lastModified: new Date().toISOString(),
    };
    const updatedVideo = await this.videoStorage.update(id, videoDataWithTimestamp);
    if (!updatedVideo) {
      throw createHttpError(404, 'Video not found');
    }
    return updatedVideo;
  }

  async delete(id) {
    const videoToDelete = await this.videoStorage.findById(id);
    if (!videoToDelete) {
      throw createHttpError(404, 'Video not found');
    }

    await this.fileStorage.delete(videoToDelete.videoFile);
    await this.videoStorage.deleteById(id);

    const playlists = await this.playlistStorage.findAll();
    for (const playlist of playlists) {
      const newVideoIds = playlist.videoIds.filter(videoId => videoId !== id);
      if (newVideoIds.length !== playlist.videoIds.length) {
        await this.playlistStorage.update(playlist.id, { videoIds: newVideoIds });
      }
    }
  }

  async _validateGenres(genreIds) {
    if (!genreIds || genreIds.length === 0) {
      return;
    }
    const genres = await this.genreStorage.findAll();
    const genreIdSet = new Set(genres.map(g => g.id));
    const invalidGenreIds = genreIds.filter(id => !genreIdSet.has(id));
    if (invalidGenreIds.length > 0) {
      throw createHttpError(400, `Invalid genre IDs: ${invalidGenreIds.join(', ')}`);
    }
  }
}

export default VideoService;

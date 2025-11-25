import createHttpError from 'http-errors';

class GenreService {
  constructor(genreStorage, videoStorage) {
    this.genreStorage = genreStorage;
    this.videoStorage = videoStorage;
  }

  async getAll() {
    return this.genreStorage.findAll();
  }

  async getById(id) {
    const genre = await this.genreStorage.findById(id);
    if (!genre) {
      throw createHttpError(404, 'Genre not found');
    }
    return genre;
  }

  async create(genreData) {
    return this.genreStorage.create(genreData);
  }

  async update(id, genreData) {
    const updatedGenre = await this.genreStorage.update(id, genreData);
    if (!updatedGenre) {
      throw createHttpError(404, 'Genre not found');
    }
    return updatedGenre;
  }

  async delete(id) {
    const videos = await this.videoStorage.findAll();
    const isGenreInUse = videos.some(video => video.genres.includes(id));
    if (isGenreInUse) {
      throw createHttpError(409, 'Genre is in use and cannot be deleted');
    }

    const deleted = await this.genreStorage.deleteById(id);
    if (!deleted) {
      throw createHttpError(404, 'Genre not found');
    }
  }
}

export default GenreService;

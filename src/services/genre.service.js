import { v4 as uuidv4 } from 'uuid';
import createHttpError from 'http-errors';

class GenreService {
  constructor(genreStorage, videoStorage) {
    this.storage = genreStorage;
    this.videoStorage = videoStorage;
  }

  async getAll() {
    return this.storage.read();
  }

  async getById(id) {
    const genres = await this.storage.read();
    const genre = genres.find((g) => g.id === id);
    if (!genre) {
      throw createHttpError(404, 'Genre not found');
    }
    return genre;
  }

  async create(genreData) {
    const genres = await this.storage.read();
    const newGenre = { id: uuidv4(), ...genreData };
    genres.push(newGenre);
    await this.storage.write(genres);
    return newGenre;
  }

  async update(id, genreData) {
    const genres = await this.storage.read();
    const index = genres.findIndex((g) => g.id === id);
    if (index === -1) {
      throw createHttpError(404, 'Genre not found');
    }
    const updatedGenre = { ...genres[index], ...genreData };
    genres[index] = updatedGenre;
    await this.storage.write(genres);
    return updatedGenre;
  }

  async delete(id) {
    const videos = await this.videoStorage.read();
    const isGenreInUse = videos.some(video => video.genres.includes(id));
    if (isGenreInUse) {
      throw createHttpError(409, 'Genre is in use and cannot be deleted');
    }

    const genres = await this.storage.read();
    const filteredGenres = genres.filter((g) => g.id !== id);
    if (genres.length === filteredGenres.length) {
      throw createHttpError(404, 'Genre not found');
    }
    await this.storage.write(filteredGenres);
  }
}

export default GenreService;

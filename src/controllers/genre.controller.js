class GenreController {
  constructor(genreService) {
    this.genreService = genreService;
  }

  getAll = async (req, res, next) => {
    try {
      const genres = await this.genreService.getAll();
      res.json(genres);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const genre = await this.genreService.getById(id);
      res.json(genre);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const newGenre = await this.genreService.create(req.body);
      res.status(201).json(newGenre);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedGenre = await this.genreService.update(id, req.body);
      res.json(updatedGenre);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.genreService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default GenreController;

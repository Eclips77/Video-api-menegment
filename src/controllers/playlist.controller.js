class PlaylistController {
  constructor(playlistService) {
    this.playlistService = playlistService;
  }

  getAll = async (req, res, next) => {
    try {
      const playlists = await this.playlistService.getAll();
      res.json(playlists);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const playlist = await this.playlistService.getById(id);
      res.json(playlist);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const newPlaylist = await this.playlistService.create(req.body);
      res.status(201).json(newPlaylist);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedPlaylist = await this.playlistService.update(id, req.body);
      res.json(updatedPlaylist);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.playlistService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default PlaylistController;

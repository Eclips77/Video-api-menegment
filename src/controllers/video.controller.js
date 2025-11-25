class VideoController {
  constructor(videoService) {
    this.videoService = videoService;
  }

  getAll = async (req, res, next) => {
    try {
      const videos = await this.videoService.getAll(req.query);
      res.json(videos);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const video = await this.videoService.getById(id);
      res.json(video);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const newVideo = await this.videoService.create(req.body);
      res.status(201).json(newVideo);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedVideo = await this.videoService.update(id, req.body);
      res.json(updatedVideo);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.videoService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default VideoController;

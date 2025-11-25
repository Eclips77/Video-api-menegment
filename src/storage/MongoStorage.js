import mongoose from 'mongoose';
import createHttpError from 'http-errors';

class MongoStorage {
  constructor(model) {
    if (!model || !model.prototype || !(model.prototype instanceof mongoose.Model)) {
      throw new Error('A valid Mongoose model must be provided.');
    }
    this.model = model;
  }

  async create(item) {
    try {
      const newItem = await this.model.create(item);
      return newItem;
    } catch (error) {
      throw createHttpError(500, 'Error creating document in MongoDB', { cause: error });
    }
  }

  async findAll() {
    try {
      return await this.model.find();
    } catch (error) {
      throw createHttpError(500, 'Error finding documents in MongoDB', { cause: error });
    }
  }

  async findById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw createHttpError(500, `Error finding document with id ${id} in MongoDB`, { cause: error });
    }
  }

  async update(id, updates) {
    try {
      return await this.model.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
      throw createHttpError(500, `Error updating document with id ${id} in MongoDB`, { cause: error });
    }
  }

  async deleteById(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw createHttpError(500, `Error deleting document with id ${id} in MongoDB`, { cause: error });
    }
  }
}

export default MongoStorage;

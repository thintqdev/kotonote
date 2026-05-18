import ListeningExercise from '../models/ListeningExercise.js';

class ListeningExerciseRepository {
  async find(query = {}, sort = { displayOrder: 1, createdAt: -1 }) {
    return await ListeningExercise.find(query).sort(sort);
  }

  async findById(id) {
    return await ListeningExercise.findById(id);
  }

  async create(data) {
    const exercise = new ListeningExercise(data);
    return await exercise.save();
  }

  async update(id, data) {
    return await ListeningExercise.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await ListeningExercise.findByIdAndDelete(id);
  }
}

export default new ListeningExerciseRepository();

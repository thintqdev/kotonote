import listeningExerciseRepository from '../repositories/listeningExerciseRepository.js';

class ListeningExerciseService {
  async getAllAdmin(query = {}) {
    return await listeningExerciseRepository.find(query);
  }

  async getById(id) {
    return await listeningExerciseRepository.findById(id);
  }

  async create(data) {
    return await listeningExerciseRepository.create(data);
  }

  async update(id, data) {
    return await listeningExerciseRepository.update(id, data);
  }

  async delete(id) {
    return await listeningExerciseRepository.delete(id);
  }

  // User-facing service methods
  async getAllPublished() {
    return await listeningExerciseRepository.find({ isPublished: true });
  }
}

export default new ListeningExerciseService();

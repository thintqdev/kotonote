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
  async getAllPublished(filters = { isPublished: true }) {
    return await listeningExerciseRepository.find(filters);
  }

  async getDistinctJlptLevels(publishedOnly = true) {
    const filter = publishedOnly ? { isPublished: true } : {};
    const rows = await listeningExerciseRepository.find(filter);
    const set = new Set();
    for (const row of rows) {
      const lv = String(row.jlpt || '').trim().toUpperCase();
      if (/^N[1-5]$/.test(lv)) set.add(lv);
    }
    const order = ['N5', 'N4', 'N3', 'N2', 'N1'];
    return order.filter((lv) => set.has(lv));
  }
}

export default new ListeningExerciseService();

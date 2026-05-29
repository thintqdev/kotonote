import ListeningExercise from '../models/ListeningExercise.js';
import {
	LISTENING_DEFAULT_PAGE_SIZE,
	LISTENING_MAX_PAGE_SIZE,
} from '../constants/listening.js';

const defaultSort = { jlpt: 1, displayOrder: 1, createdAt: -1 };

const normalizePagination = ({ page = 1, limit = LISTENING_DEFAULT_PAGE_SIZE } = {}) => {
	const p = Math.max(1, parseInt(String(page), 10) || 1);
	let l = parseInt(String(limit), 10) || LISTENING_DEFAULT_PAGE_SIZE;
	l = Math.min(Math.max(1, l), LISTENING_MAX_PAGE_SIZE);
	return { page: p, limit: l, skip: (p - 1) * l };
};

class ListeningExerciseRepository {
  async find(query = {}, sort = defaultSort) {
    return await ListeningExercise.find(query).sort(sort);
  }

  async count(query = {}) {
    return await ListeningExercise.countDocuments(query);
  }

  /**
   * @param {Record<string, unknown>} query
   * @param {{ page?: number, limit?: number }} pagination
   */
  async findPaginated(query = {}, pagination = {}) {
    const { page, limit, skip } = normalizePagination(pagination);
    const [items, total] = await Promise.all([
      ListeningExercise.find(query).sort(defaultSort).skip(skip).limit(limit).lean(),
      ListeningExercise.countDocuments(query),
    ]);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
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

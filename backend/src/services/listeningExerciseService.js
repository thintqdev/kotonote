import listeningExerciseRepository from '../repositories/listeningExerciseRepository.js';
import {
	deleteExerciseMedia,
	deleteReplacedChoiceImages,
	deleteReplacedMedia,
} from './listeningMediaService.js';

/** @param {string | undefined | null} value */
function assertNotDataUrl(value, fieldLabel) {
	if (typeof value === 'string' && value.trim().startsWith('data:')) {
		throw new Error(
			`${fieldLabel} không được lưu dạng base64. Hãy tải file qua API upload (MinIO).`,
		);
	}
}

/** @param {Record<string, unknown>} data */
function rejectEmbeddedMedia(data) {
	assertNotDataUrl(/** @type {string} */ (data.audioUrl), 'audioUrl');
	assertNotDataUrl(/** @type {string} */ (data.image), 'image');
	if (Array.isArray(data.questions)) {
		for (const q of data.questions) {
			if (!q || typeof q !== 'object') continue;
			const imgs = /** @type {{ choiceImages?: string[] }} */ (q).choiceImages;
			if (!Array.isArray(imgs)) continue;
			imgs.forEach((url, i) => assertNotDataUrl(url, `questions[].choiceImages[${i}]`));
		}
	}
}

class ListeningExerciseService {
  async getAllAdmin(query = {}) {
    return await listeningExerciseRepository.find(query);
  }

  async getById(id) {
    return await listeningExerciseRepository.findById(id);
  }

  async create(data) {
    rejectEmbeddedMedia(data);
    return await listeningExerciseRepository.create(data);
  }

  async update(id, data) {
    rejectEmbeddedMedia(data);
    const prev = await listeningExerciseRepository.findById(id);
    const updated = await listeningExerciseRepository.update(id, data);
    if (prev && updated) {
      if (data.audioUrl !== undefined) {
        await deleteReplacedMedia(prev.audioUrl, data.audioUrl);
      }
      if (data.image !== undefined) {
        await deleteReplacedMedia(prev.image, data.image);
      }
      if (data.questions !== undefined) {
        await deleteReplacedChoiceImages(prev.questions, data.questions);
      }
    }
    return updated;
  }

  async delete(id) {
    const prev = await listeningExerciseRepository.findById(id);
    const deleted = await listeningExerciseRepository.delete(id);
    if (prev) {
      await deleteExerciseMedia(prev);
    }
    return deleted;
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

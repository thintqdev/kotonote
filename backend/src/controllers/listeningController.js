import listeningExerciseService from '../services/listeningExerciseService.js';
import { apiSuccess, apiError } from '../utils/response.js';

class ListeningController {
  async getAllPublished(req, res) {
    try {
      const items = await listeningExerciseService.getAllPublished();
      return apiSuccess(res, items, 'Lấy danh sách bài nghe thành công');
    } catch (error) {
      return apiError(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const item = await listeningExerciseService.getById(req.params.id);
      if (!item || !item.isPublished) {
        return apiError(res, 'Không tìm thấy bài nghe', 404);
      }
      return apiSuccess(res, item, 'Lấy bài nghe thành công');
    } catch (error) {
      return apiError(res, error.message, 500);
    }
  }
}

export default new ListeningController();

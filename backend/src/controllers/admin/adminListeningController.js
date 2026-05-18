import listeningExerciseService from '../../services/listeningExerciseService.js';
import { apiSuccess, apiError } from '../../utils/response.js';

class AdminListeningController {
  async getAll(req, res) {
    try {
      const items = await listeningExerciseService.getAllAdmin({});
      return apiSuccess(res, items, 'Lấy danh sách bài nghe thành công');
    } catch (error) {
      return apiError(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const item = await listeningExerciseService.getById(req.params.id);
      if (!item) return apiError(res, 'Không tìm thấy bài nghe', 404);
      return apiSuccess(res, item, 'Lấy bài nghe thành công');
    } catch (error) {
      return apiError(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const item = await listeningExerciseService.create(req.body);
      return apiSuccess(res, item, 'Tạo bài nghe thành công', 201);
    } catch (error) {
      return apiError(res, error.message, 500);
    }
  }

  async update(req, res) {
    try {
      const item = await listeningExerciseService.update(req.params.id, req.body);
      if (!item) return apiError(res, 'Không tìm thấy bài nghe', 404);
      return apiSuccess(res, item, 'Cập nhật bài nghe thành công');
    } catch (error) {
      return apiError(res, error.message, 500);
    }
  }

  async delete(req, res) {
    try {
      const item = await listeningExerciseService.delete(req.params.id);
      if (!item) return apiError(res, 'Không tìm thấy bài nghe', 404);
      return apiSuccess(res, item, 'Xóa bài nghe thành công');
    } catch (error) {
      return apiError(res, error.message, 500);
    }
  }
}

export default new AdminListeningController();

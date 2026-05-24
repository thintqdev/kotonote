import express from 'express';
import * as examPaperController from '../../controllers/admin/examPaperController.js';
import { validate } from '../../middlewares/validate.js';
import { examMediaUploadMiddleware } from '../../middlewares/examMediaUpload.js';
import { examPaperThumbnailUploadMiddleware } from '../../middlewares/examPaperThumbnailUpload.js';
import {
	createExamPaperSchema,
	importExamSectionsSchema,
	updateExamPaperSchema,
	updateExamSectionsSchema,
} from '../../validators/examPaperValidator.js';

const router = express.Router();

router.get('/sections/template', examPaperController.getExamSectionsTemplate);
router.post(
	'/upload-media',
	examMediaUploadMiddleware,
	examPaperController.uploadExamMedia,
);
router.post(
	'/upload-thumbnail',
	examPaperThumbnailUploadMiddleware,
	examPaperController.uploadExamPaperThumbnailDraft,
);
router.get('/', examPaperController.listAdminExamPapers);
router.post('/', validate(createExamPaperSchema), examPaperController.createExamPaper);
router.get('/:id', examPaperController.getAdminExamPaperById);
router.put(
	'/:id',
	validate(updateExamPaperSchema),
	examPaperController.updateExamPaper,
);
router.put(
	'/:id/sections',
	validate(updateExamSectionsSchema),
	examPaperController.updateExamPaperSections,
);
router.post('/:id/sections/init', examPaperController.initExamPaperSections);
router.post(
	'/:id/sections/import',
	validate(importExamSectionsSchema),
	examPaperController.importExamPaperSections,
);
router.delete('/:id', examPaperController.deleteExamPaper);

export default router;

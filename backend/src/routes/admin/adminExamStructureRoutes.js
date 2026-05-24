import express from 'express';
import * as examStructureController from '../../controllers/admin/examStructureController.js';
import { validate } from '../../middlewares/validate.js';
import { updateExamStructureSchema } from '../../validators/examStructureValidator.js';

const router = express.Router();

router.get('/part-catalog', examStructureController.getPartCatalog);
router.get('/meta', examStructureController.getExamStructureMeta);
router.post('/seed', examStructureController.seedExamStructures);
router.get('/', examStructureController.listExamStructureTemplates);
router.get('/default/:jlpt', examStructureController.getDefaultExamStructureByJlpt);
router.get('/:id', examStructureController.getExamStructureTemplate);
router.put(
	'/:id',
	validate(updateExamStructureSchema),
	examStructureController.updateExamStructureTemplate,
);
router.post('/:id/reset', examStructureController.resetExamStructureTemplate);

export default router;

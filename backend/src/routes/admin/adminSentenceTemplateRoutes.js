import express from 'express';
import * as controller from '../../controllers/sentenceTemplateAdminController.js';
import { validate } from '../../middlewares/validate.js';
import {
	specialtySchema,
	templateSchema,
} from '../../validators/sentenceTemplateValidator.js';

const router = express.Router();

router.post('/seed', controller.adminSeed);

router.get('/specialties', controller.adminListSpecialties);
router.get('/specialties/:id', controller.adminGetSpecialty);
router.post('/specialties', validate(specialtySchema), controller.adminCreateSpecialty);
router.put('/specialties/:id', validate(specialtySchema), controller.adminUpdateSpecialty);
router.delete('/specialties/:id', controller.adminDeleteSpecialty);

router.get('/templates', controller.adminListTemplates);
router.get('/templates/:id', controller.adminGetTemplate);
router.post('/templates', validate(templateSchema), controller.adminCreateTemplate);
router.put('/templates/:id', validate(templateSchema), controller.adminUpdateTemplate);
router.delete('/templates/:id', controller.adminDeleteTemplate);

export default router;

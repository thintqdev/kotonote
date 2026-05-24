import express from 'express';
import * as kaiwaContextController from '../../controllers/admin/kaiwaContextController.js';
import { validate } from '../../middlewares/validate.js';
import {
	createKaiwaContextSchema,
	updateKaiwaContextSchema,
} from '../../validators/kaiwaContextValidator.js';

const router = express.Router();

router.get('/', kaiwaContextController.listAdminContexts);
router.get('/:id', kaiwaContextController.getAdminContextById);
router.post(
	'/',
	validate(createKaiwaContextSchema),
	kaiwaContextController.createContext,
);
router.put(
	'/:id',
	validate(updateKaiwaContextSchema),
	kaiwaContextController.updateContext,
);
router.delete('/:id', kaiwaContextController.deleteContext);

export default router;

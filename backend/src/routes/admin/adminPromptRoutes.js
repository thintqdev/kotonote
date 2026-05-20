import express from 'express';
import * as promptController from '../../controllers/promptController.js';
import { validate } from '../../middlewares/validate.js';
import { promptSchema } from '../../validators/promptValidator.js';

const router = express.Router();

router.get('/', promptController.getAllPrompts);
router.get('/:id', promptController.getPromptById);
router.post('/', validate(promptSchema), promptController.createPrompt);
router.put('/:id', validate(promptSchema), promptController.updatePrompt);
router.delete('/:id', promptController.deletePrompt);

export default router;

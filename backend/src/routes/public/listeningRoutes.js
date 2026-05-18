import express from 'express';
import listeningController from '../../controllers/listeningController.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// Apply auth middleware if user needs to be logged in to access listening exercises
router.use(authenticate);

router.get('/', listeningController.getAllPublished);
router.get('/:id', listeningController.getById);

export default router;

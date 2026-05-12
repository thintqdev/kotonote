import express from 'express';
import * as quoteController from '../controllers/quoteController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { quoteSchema } from '../validators/quoteValidator.js';
import { USER_ROLE } from '../constants/userStatus.js';

const router = express.Router();

// Public routes
router.get('/active', quoteController.getActiveQuotes);
router.get('/random', quoteController.getRandomQuote);

// Admin routes - require authentication and admin role
router.get('/', authenticate, authorize(USER_ROLE.ADMIN), quoteController.getAllQuotes);
router.get('/:id', authenticate, authorize(USER_ROLE.ADMIN), quoteController.getQuoteById);
router.post('/', authenticate, authorize(USER_ROLE.ADMIN), validate(quoteSchema), quoteController.createQuote);
router.put('/:id', authenticate, authorize(USER_ROLE.ADMIN), validate(quoteSchema), quoteController.updateQuote);
router.delete('/:id', authenticate, authorize(USER_ROLE.ADMIN), quoteController.deleteQuote);

export default router;

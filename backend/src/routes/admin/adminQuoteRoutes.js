import express from 'express';
import * as quoteController from '../../controllers/quoteController.js';
import { validate } from '../../middlewares/validate.js';
import { quoteSchema } from '../../validators/quoteValidator.js';

const router = express.Router();

// Admin Quote routes
router.get('/', quoteController.getAllQuotes);
router.get('/:id', quoteController.getQuoteById);
router.post('/', validate(quoteSchema), quoteController.createQuote);
router.put('/:id', validate(quoteSchema), quoteController.updateQuote);
router.delete('/:id', quoteController.deleteQuote);

export default router;

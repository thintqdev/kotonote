import express from 'express';
import * as quoteController from '../../controllers/quoteController.js';

const router = express.Router();

// Public routes
router.get('/active', quoteController.getActiveQuotes);
router.get('/random', quoteController.getRandomQuote);

export default router;

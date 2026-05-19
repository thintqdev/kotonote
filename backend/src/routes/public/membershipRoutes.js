import express from 'express';
import * as membershipController from '../../controllers/membershipController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createCheckoutSchema } from '../../validators/membershipValidator.js';

const router = express.Router();

router.get('/plans', membershipController.listPlans);

router.get('/me', authenticate, membershipController.getMyMembership);

router.post(
	'/checkout',
	authenticate,
	validate(createCheckoutSchema),
	membershipController.createCheckout,
);

router.post(
	'/checkout/:checkoutId/confirm',
	authenticate,
	membershipController.confirmCheckout,
);

export default router;

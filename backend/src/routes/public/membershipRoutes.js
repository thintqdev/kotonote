import express from 'express';
import * as membershipController from '../../controllers/membershipController.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { webhookRateLimit } from '../../middlewares/webhookRateLimit.js';
import {
	checkoutIdParamSchema,
	createCheckoutSchema,
} from '../../validators/membershipValidator.js';

const router = express.Router();

router.get('/plans', membershipController.listPlans);

router.get('/me', authenticate, membershipController.getMyMembership);

router.get(
	'/checkout-history',
	authenticate,
	membershipController.listMyCheckoutHistory,
);

router.post(
	'/webhooks/payos',
	webhookRateLimit({ max: 100, windowMs: 60_000 }),
	membershipController.payosWebhook,
);

router.post(
	'/checkout',
	authenticate,
	validate(createCheckoutSchema),
	membershipController.createCheckout,
);

router.get(
	'/checkout/:checkoutId/status',
	authenticate,
	validate(checkoutIdParamSchema, 'params'),
	membershipController.getCheckoutStatus,
);

router.get(
	'/checkout/:checkoutId/receipt',
	authenticate,
	validate(checkoutIdParamSchema, 'params'),
	membershipController.getCheckoutReceipt,
);

router.post(
	'/checkout/:checkoutId/confirm',
	authenticate,
	validate(checkoutIdParamSchema, 'params'),
	membershipController.confirmCheckout,
);

export default router;

import asyncHandler from 'express-async-handler';
import * as membershipService from '../services/membershipService.js';
import { processPayosPaymentWebhook } from '../services/payment/payosWebhookService.js';
import { enrichUserWithBadges } from '../services/userService.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { apiSuccess } from '../utils/response.js';
import { MEMBERSHIP } from '../constants/messages.js';

/**
 * @route GET /api/membership/plans
 */
export const listPlans = asyncHandler(async (req, res) => {
	const plans = await membershipService.getMembershipPlans();
	return apiSuccess(res, { plans }, MEMBERSHIP.PLANS_FETCHED, 200);
});

/**
 * @route GET /api/membership/me
 */
export const getMyMembership = asyncHandler(async (req, res) => {
	const membership = await membershipService.getUserMembership(req.user._id);
	return apiSuccess(res, { membership }, MEMBERSHIP.FETCHED, 200);
});

/**
 * @route GET /api/membership/checkout-history
 */
export const listMyCheckoutHistory = asyncHandler(async (req, res) => {
	const result = await membershipService.listUserCheckoutHistory(
		req.user._id,
		{
			page: req.query.page,
			limit: req.query.limit,
			status: req.query.status,
		},
	);
	return apiSuccess(res, result, MEMBERSHIP.CHECKOUT_HISTORY_LISTED, 200);
});

/**
 * @route GET /api/membership/checkout/:checkoutId/status
 */
export const getCheckoutStatus = asyncHandler(async (req, res) => {
	const result = await membershipService.getCheckoutStatusForUser(
		req.user._id,
		req.params.checkoutId,
	);
	return apiSuccess(res, result, MEMBERSHIP.CHECKOUT_STATUS_FETCHED, 200);
});

/**
 * @route POST /api/membership/checkout
 * @body {{ tierId: string, billing: 'yearly'|'lifetime' }}
 */
export const createCheckout = asyncHandler(async (req, res) => {
	const { tierId, billing } = req.body;
	const checkout = await membershipService.createCheckout(
		req.user._id,
		tierId,
		billing,
	);
	return apiSuccess(res, { checkout }, MEMBERSHIP.CHECKOUT_CREATED, 201);
});

/**
 * @route POST /api/membership/checkout/:checkoutId/confirm
 * Chỉ khi PAYMENT_PROVIDER=mock.
 */
export const confirmCheckout = asyncHandler(async (req, res) => {
	const result = await membershipService.confirmCheckoutPayment(
		req.user._id,
		req.params.checkoutId,
	);

	const user = await User.findById(req.user._id);
	const userPayload = user ? await enrichUserWithBadges(user) : null;

	return apiSuccess(
		res,
		{
			...result,
			user: userPayload,
		},
		MEMBERSHIP.PAYMENT_SUCCESS,
		200,
	);
});

/**
 * @route POST /api/membership/webhooks/payos
 * Không JWT — xác minh chữ ký PayOS.
 */
export const getCheckoutReceipt = asyncHandler(async (req, res) => {
	const { getCheckoutReceiptForUser } = await import(
		'../services/membershipReceiptService.js'
	);
	const data = await getCheckoutReceiptForUser(
		req.user._id,
		req.params.checkoutId,
	);
	return apiSuccess(res, data, MEMBERSHIP.RECEIPT_FETCHED, 200);
});

export const payosWebhook = asyncHandler(async (req, res) => {
	try {
		await processPayosPaymentWebhook(req.body);
		return res.status(200).json({ success: true });
	} catch (err) {
		const msg = String(err?.message || '').toLowerCase();
		const isSignatureFailure =
			msg.includes('signature') ||
			msg.includes('integrity') ||
			msg.includes('not integrity');

		if (isSignatureFailure) {
			return res.status(401).json({
				success: false,
				messageCode: MEMBERSHIP.PAYMENT_WEBHOOK_INVALID,
			});
		}

		if (err instanceof AppError) {
			if (err.messageCode === MEMBERSHIP.PAYMENT_AMOUNT_MISMATCH) {
				console.error('[payos-webhook] amount mismatch', err.messageCode);
				return res.status(400).json({
					success: false,
					messageCode: err.messageCode,
				});
			}
			if (err.messageCode === MEMBERSHIP.CHECKOUT_NOT_FOUND) {
				return res.status(404).json({
					success: false,
					messageCode: err.messageCode,
				});
			}
		}

		console.error('[payos-webhook] unhandled', err);
		return res.status(500).json({ success: false });
	}
});

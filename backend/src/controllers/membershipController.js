import asyncHandler from 'express-async-handler';
import * as membershipService from '../services/membershipService.js';
import { enrichUserWithBadges } from '../services/userService.js';
import User from '../models/User.js';
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
 * @route GET /api/users/me/membership
 */
export const getMyMembership = asyncHandler(async (req, res) => {
	const membership = await membershipService.getUserMembership(req.user._id);
	return apiSuccess(res, { membership }, MEMBERSHIP.FETCHED, 200);
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
 * Giả lập thanh toán thành công.
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

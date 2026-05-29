import mongoose from 'mongoose';
import User from '../models/User.js';
import MembershipCheckout from '../models/MembershipCheckout.js';
import AppError from '../utils/AppError.js';
import { MEMBERSHIP } from '../constants/messages.js';
import {
	MEMBERSHIP_BILLING,
	MEMBERSHIP_TIER_IDS,
	computeMembershipExpiry,
	jlptUnlockedForTier,
	membershipPlansPayload,
} from '../constants/membership.js';
import {
	normalizeUserMembership,
} from './membershipService.js';

/**
 * @param {string} id
 */
function assertObjectId(id, label = 'id') {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new AppError(MEMBERSHIP.USER_NOT_FOUND, 400, [
			{ field: label, message: 'Invalid id' },
		]);
	}
}

/**
 * @param {Record<string, string>} query
 */
function parsePageQuery(query = {}) {
	const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(String(query.limit || '20'), 10) || 20),
	);
	return { page, limit, skip: (page - 1) * limit };
}

export async function getAdminMembershipStatistics() {
	const [tierAgg, checkoutAgg, revenueAgg] = await Promise.all([
		User.aggregate([
			{
				$group: {
					_id: '$membership.tierId',
					count: { $sum: 1 },
					active: {
						$sum: {
							$cond: [{ $eq: ['$membership.status', 'active'] }, 1, 0],
						},
					},
				},
			},
		]),
		MembershipCheckout.aggregate([
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
				},
			},
		]),
		MembershipCheckout.aggregate([
			{ $match: { status: 'paid' } },
			{
				$group: {
					_id: null,
					totalVnd: { $sum: '$amountVnd' },
					count: { $sum: 1 },
				},
			},
		]),
	]);

	const usersByTier = Object.fromEntries(
		MEMBERSHIP_TIER_IDS.map((t) => [t, { total: 0, active: 0 }]),
	);
	for (const row of tierAgg) {
		const key = MEMBERSHIP_TIER_IDS.includes(row._id) ? row._id : 'free';
		usersByTier[key] = {
			total: row.count,
			active: row.active,
		};
	}

	const checkoutsByStatus = {};
	for (const row of checkoutAgg) {
		checkoutsByStatus[row._id] = row.count;
	}

	return {
		plans: membershipPlansPayload(),
		usersByTier,
		checkoutsByStatus,
		revenue: {
			paidTotalVnd: revenueAgg[0]?.totalVnd ?? 0,
			paidCount: revenueAgg[0]?.count ?? 0,
		},
	};
}

/**
 * @param {{ tierId?: string, membershipStatus?: string, search?: string, page?: number, limit?: number }} filters
 */
export async function listMembershipUsers(filters = {}) {
	const { tierId, membershipStatus, search } = filters;
	const { page, limit, skip } = parsePageQuery(filters);

	const query = {};
	if (tierId && MEMBERSHIP_TIER_IDS.includes(tierId)) {
		query['membership.tierId'] = tierId;
	}
	if (membershipStatus === 'active' || membershipStatus === 'expired') {
		query['membership.status'] = membershipStatus;
	}
	if (search?.trim()) {
		const re = { $regex: search.trim(), $options: 'i' };
		query.$or = [{ email: re }, { name: re }];
	}

	const [users, total] = await Promise.all([
		User.find(query)
			.select('name email membership createdAt updatedAt status role')
			.sort({ 'membership.tierId': -1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		User.countDocuments(query),
	]);

	return {
		users: users.map((u) => ({
			_id: String(u._id),
			id: String(u._id),
			name: u.name,
			email: u.email,
			status: u.status,
			role: u.role,
			membership: normalizeUserMembership(u.membership),
			createdAt: u.createdAt,
			updatedAt: u.updatedAt,
		})),
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit) || 1,
		},
	};
}

/**
 * @param {{ status?: string, tierId?: string, search?: string, page?: number, limit?: number }} filters
 */
export async function listMembershipCheckouts(filters = {}) {
	const { status, tierId, search } = filters;
	const { page, limit, skip } = parsePageQuery(filters);

	const query = {};
	if (status) query.status = status;
	if (tierId) query.tierId = tierId;

	let userFilter = null;
	if (search?.trim()) {
		const re = { $regex: search.trim(), $options: 'i' };
		const matchedUsers = await User.find({
			$or: [{ email: re }, { name: re }],
		})
			.select('_id')
			.limit(200)
			.lean();
		userFilter = matchedUsers.map((u) => u._id);
		if (userFilter.length === 0) {
			return {
				checkouts: [],
				pagination: { page, limit, total: 0, pages: 1 },
			};
		}
		query.userId = { $in: userFilter };
	}

	const [rows, total] = await Promise.all([
		MembershipCheckout.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate('userId', 'name email')
			.lean(),
		MembershipCheckout.countDocuments(query),
	]);

	return {
		checkouts: rows.map((c) => ({
			_id: String(c._id),
			id: String(c._id),
			userId: c.userId?._id ? String(c.userId._id) : String(c.userId),
			user: c.userId && typeof c.userId === 'object'
				? {
						id: String(c.userId._id),
						name: c.userId.name,
						email: c.userId.email,
					}
				: null,
			tierId: c.tierId,
			billing: c.billing,
			amountVnd: c.amountVnd,
			currency: c.currency,
			status: c.status,
			provider: c.provider,
			paidAt: c.paidAt,
			refundedAt: c.refundedAt ?? null,
			refundReason: c.refundReason ?? null,
			refundRequestedAt: c.refundRequestedAt ?? null,
			refundRequestNote: c.refundRequestNote ?? null,
			sessionExpiresAt: c.sessionExpiresAt,
			createdAt: c.createdAt,
			updatedAt: c.updatedAt,
		})),
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit) || 1,
		},
	};
}

/**
 * @param {string} userId
 * @param {{ tierId: string, billing: string, status: string, expiresAt?: Date|null }} payload
 */
export async function updateUserMembershipByAdmin(userId, payload) {
	assertObjectId(userId, 'userId');

	const { tierId, billing, status } = payload;
	if (!MEMBERSHIP_TIER_IDS.includes(tierId)) {
		throw new AppError(MEMBERSHIP.INVALID_PLAN, 400);
	}

	const allowedBilling = [
		MEMBERSHIP_BILLING.FREE,
		MEMBERSHIP_BILLING.YEARLY,
		MEMBERSHIP_BILLING.LIFETIME,
	];
	if (!allowedBilling.includes(billing)) {
		throw new AppError(MEMBERSHIP.INVALID_BILLING, 400);
	}

	if (tierId === 'free' && billing !== MEMBERSHIP_BILLING.FREE) {
		throw new AppError(MEMBERSHIP.INVALID_BILLING, 400, [
			{ field: 'billing', message: 'Free tier requires free billing' },
		]);
	}

	const user = await User.findById(userId);
	if (!user) {
		throw new AppError(MEMBERSHIP.USER_NOT_FOUND, 404);
	}

	const now = new Date();
	let purchasedAt = user.membership?.purchasedAt ?? null;
	let expiresAt =
		payload.expiresAt === undefined
			? user.membership?.expiresAt ?? null
			: payload.expiresAt;

	if (tierId === 'free') {
		purchasedAt = null;
		expiresAt = null;
	} else if (status === 'active') {
		if (!purchasedAt) purchasedAt = now;
		if (
			billing === MEMBERSHIP_BILLING.LIFETIME ||
			billing === MEMBERSHIP_BILLING.FREE
		) {
			expiresAt =
				payload.expiresAt === undefined ? null : payload.expiresAt;
		} else if (billing === MEMBERSHIP_BILLING.YEARLY) {
			if (payload.expiresAt === undefined || payload.expiresAt === null) {
				expiresAt = computeMembershipExpiry(billing, purchasedAt);
			}
		}
	} else if (status === 'expired') {
		// giữ purchasedAt để admin xem lịch sử
	}

	user.membership = {
		tierId,
		billing: tierId === 'free' ? MEMBERSHIP_BILLING.FREE : billing,
		status,
		jlptUnlocked: jlptUnlockedForTier(
			status === 'expired' && tierId !== 'free' ? 'free' : tierId,
		),
		purchasedAt,
		expiresAt,
	};
	user.markModified('membership');
	await user.save();

	return {
		user: {
			_id: String(user._id),
			id: String(user._id),
			name: user.name,
			email: user.email,
			membership: normalizeUserMembership(user.membership),
		},
	};
}

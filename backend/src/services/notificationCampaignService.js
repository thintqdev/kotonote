import mongoose from 'mongoose';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import NotificationCampaign from '../models/NotificationCampaign.js';
import AppError from '../utils/AppError.js';
import { getIo } from '../config/ioRegistry.js';
import { sendNotificationToUser, sendToAdminRoom } from '../config/socket.js';

/**
 * Danh sách ObjectId người nhận theo audience.
 * @param {import('mongoose').Document} campaign
 */
export async function resolveTargetUserIds(campaign) {
	if (campaign.audience === 'all') {
		const rows = await User.find({ isActive: true }).select('_id').lean();
		return rows.map((r) => r._id);
	}
	const ids = campaign.userIds || [];
	return ids.length ? ids : [];
}

/**
 * Tạo bản ghi Notification + emit socket từng user (và phòng admin).
 * @param {import('mongoose').Document} campaign
 */
export async function deliverCampaignNotifications(campaign) {
	const io = getIo();
	const userIds = await resolveTargetUserIds(campaign);
	if (userIds.length === 0) {
		throw new AppError('No recipients', 400);
	}

	const batchId = `camp_${campaign._id.toString()}_${Date.now()}`;
	const base = {
		title: campaign.title,
		message: campaign.message,
		type: campaign.type,
		category: campaign.category,
		source: 'admin',
		batchId,
		deliveredAt: new Date(),
		actionType: campaign.actionType || 'none',
		actionData: campaign.actionData || undefined,
	};

	const docs = userIds.map((userId) => ({
		...base,
		userId,
	}));

	const inserted = await Notification.insertMany(docs, { ordered: false });

	if (io) {
		for (const n of inserted) {
			sendNotificationToUser(io, n.userId.toString(), n);
		}
		sendToAdminRoom(io, {
			type: 'campaign_sent',
			campaignId: String(campaign._id),
			batchId,
			recipientCount: inserted.length,
			title: campaign.title,
		});
	}

	return { batchId, recipientCount: inserted.length };
}

/**
 * @param {object} payload
 * @param {import('mongoose').Types.ObjectId} [adminUserId]
 */
export async function createCampaign(payload, adminUserId) {
	const {
		title,
		message,
		type,
		category,
		audience,
		userIds = [],
		scheduledAt,
		actionType,
		actionData,
	} = payload;

	const now = new Date();
	let scheduleDate = null;
	if (scheduledAt) {
		scheduleDate = new Date(scheduledAt);
		if (Number.isNaN(scheduleDate.getTime())) {
			throw new AppError('Invalid scheduledAt', 400);
		}
	}

	const isFuture = Boolean(scheduleDate && scheduleDate > now);

	if (audience === 'selected' && (!userIds || userIds.length === 0)) {
		throw new AppError('userIds required when audience is selected', 400);
	}

	const campaign = await NotificationCampaign.create({
		title,
		message,
		type: type || 'info',
		category: category || 'admin',
		audience,
		userIds:
			audience === 'selected'
				? userIds.map((id) => new mongoose.Types.ObjectId(id))
				: [],
		scheduledAt: isFuture ? scheduleDate : null,
		status: isFuture ? 'scheduled' : 'processing',
		actionType: actionType || 'none',
		actionData: actionData || undefined,
		createdBy: adminUserId || undefined,
	});

	if (!isFuture) {
		try {
			const { batchId, recipientCount } =
				await deliverCampaignNotifications(campaign);
			campaign.status = 'sent';
			campaign.sentAt = new Date();
			campaign.batchId = batchId;
			campaign.recipientCount = recipientCount;
		} catch (err) {
			campaign.status = 'failed';
			campaign.errorMessage = err.message || String(err);
		}
		await campaign.save();
	}

	return campaign;
}

export async function listCampaigns({ limit = 30, skip = 0 } = {}) {
	const lim = Math.min(Math.max(Number(limit) || 30, 1), 100);
	const sk = Math.max(Number(skip) || 0, 0);
	const [campaigns, total] = await Promise.all([
		NotificationCampaign.find()
			.sort({ createdAt: -1 })
			.skip(sk)
			.limit(lim)
			.lean(),
		NotificationCampaign.countDocuments(),
	]);
	return { campaigns, total };
}

export async function cancelCampaign(id) {
	const c = await NotificationCampaign.findById(id);
	if (!c) {
		throw new AppError('Campaign not found', 404);
	}
	if (c.status !== 'scheduled') {
		throw new AppError('Only scheduled campaigns can be cancelled', 400);
	}
	c.status = 'cancelled';
	await c.save();
	return c;
}

/**
 * Gửi broadcast / batch qua HTTP cũ — không lưu NotificationCampaign.
 */
export async function deliverStandaloneAdminNotifications({
	title,
	message,
	type = 'info',
	category = 'system',
	userIds = null,
	actionType = 'none',
	actionData = undefined,
}) {
	const syntheticId = new mongoose.Types.ObjectId();
	const campaignLike = {
		_id: syntheticId,
		title,
		message,
		type,
		category,
		audience: userIds && userIds.length ? 'selected' : 'all',
		userIds:
			userIds && userIds.length
				? userIds.map((id) => new mongoose.Types.ObjectId(id))
				: [],
		actionType,
		actionData,
	};
	return deliverCampaignNotifications(campaignLike);
}

/**
 * Gửi các chiến dịch đã đến hẹn (tối đa vài bản ghi mỗi lần gọi).
 * Một process Node đủ dùng; nhiều instance cần lock phân tán (Redis) hoặc một worker Bull.
 */
export async function processDueCampaigns() {
	const now = new Date();
	let processed = 0;
	const maxPerTick = 15;

	while (processed < maxPerTick) {
		const next = await NotificationCampaign.findOne({
			status: 'scheduled',
			scheduledAt: { $lte: now },
		}).sort({ scheduledAt: 1 });

		if (!next) break;

		const c = await NotificationCampaign.findOneAndUpdate(
			{ _id: next._id, status: 'scheduled' },
			{ $set: { status: 'processing' } },
			{ new: true }
		);

		if (!c) continue;

		processed += 1;
		try {
			const { batchId, recipientCount } =
				await deliverCampaignNotifications(c);
			c.status = 'sent';
			c.sentAt = new Date();
			c.batchId = batchId;
			c.recipientCount = recipientCount;
		} catch (err) {
			c.status = 'failed';
			c.errorMessage = err.message || String(err);
		}
		await c.save();
	}

	return { processed };
}

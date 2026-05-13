import mongoose from 'mongoose';

const notificationCampaignSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, maxlength: 200 },
		message: { type: String, required: true, maxlength: 1000 },
		type: {
			type: String,
			enum: [
				'info',
				'success',
				'warning',
				'error',
				'task_update',
				'system',
				'admin_action',
			],
			default: 'info',
		},
		category: {
			type: String,
			enum: [
				'vocabulary',
				'kanji',
				'quiz',
				'streak',
				'achievement',
				'system',
				'admin',
				'other',
			],
			default: 'admin',
		},
		/** Gửi tất cả user active hoặc danh sách chọn */
		audience: {
			type: String,
			enum: ['all', 'selected'],
			required: true,
		},
		userIds: {
			type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
			default: [],
		},
		/** null = gửi ngay trong request; có giá trị tương lai = chờ scheduler */
		scheduledAt: { type: Date, default: null, index: true },
		status: {
			type: String,
			enum: ['scheduled', 'processing', 'sent', 'failed', 'cancelled'],
			default: 'scheduled',
			index: true,
		},
		batchId: { type: String, index: true },
		recipientCount: { type: Number, default: 0 },
		sentAt: { type: Date },
		errorMessage: { type: String },
		actionType: {
			type: String,
			enum: ['none', 'view_item', 'open_page', 'download', 'confirm', 'dismiss'],
			default: 'none',
		},
		actionData: { type: mongoose.Schema.Types.Mixed },
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
);

notificationCampaignSchema.index({ status: 1, scheduledAt: 1 });

export default mongoose.model('NotificationCampaign', notificationCampaignSchema);

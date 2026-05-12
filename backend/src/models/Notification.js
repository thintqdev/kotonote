import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
	{
		// Recipient
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},

		// Notification content
		title: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},

		// Notification type
		type: {
			type: String,
			enum: [
				'info',           // General information
				'success',        // Operation successful
				'warning',        // Warning message
				'error',          // Error message
				'task_update',    // Task/job update
				'system',         // System notification
				'admin_action',   // Admin action notification
			],
			default: 'info',
			index: true,
		},

		// Category for filtering
		category: {
			type: String,
			enum: [
				'vocabulary',     // Vocabulary-related
				'kanji',          // Kanji-related
				'quiz',           // Quiz/test
				'streak',         // Streak tracking
				'achievement',    // Achievement unlocked
				'system',         // System updates
				'admin',          // Admin notifications
				'other',          // Other
			],
			default: 'other',
			index: true,
		},

		// Action data
		actionType: {
			type: String,
			enum: [
				'none',
				'view_item',
				'open_page',
				'download',
				'confirm',
				'dismiss',
			],
			default: 'none',
		},
		actionData: {
			type: mongoose.Schema.Types.Mixed,
			description: 'Additional data for action (e.g., { itemId, itemType, url })',
		},

		// Status
		isRead: {
			type: Boolean,
			default: false,
			index: true,
		},
		readAt: {
			type: Date,
		},

		// Priority
		priority: {
			type: String,
			enum: ['low', 'normal', 'high', 'urgent'],
			default: 'normal',
			index: true,
		},

		// Expiration
		expiresAt: {
			type: Date,
			description: 'Auto-delete notification after this date',
			index: true,
		},

		// Source
		source: {
			type: String,
			enum: ['system', 'admin', 'queue', 'webhook'],
			default: 'system',
		},

		// Metadata
		metadata: {
			type: mongoose.Schema.Types.Mixed,
			description: 'Additional metadata for tracking',
		},

		// Delivery tracking
		deliveredAt: {
			type: Date,
		},
		deliveryAttempts: {
			type: Number,
			default: 0,
		},
		lastDeliveryError: {
			type: String,
		},

		// Batch/Campaign tracking
		batchId: {
			type: String,
			description: 'For grouping notifications sent in batch',
			index: true,
		},
	},
	{
		timestamps: true,
		indexes: [
			{ userId: 1, createdAt: -1 },
			{ userId: 1, isRead: 1, createdAt: -1 },
			{ userId: 1, type: 1, createdAt: -1 },
			{ userId: 1, category: 1, createdAt: -1 },
			{ expiresAt: 1 },
		],
	}
);

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = async function () {
	this.isRead = true;
	this.readAt = new Date();
	return await this.save();
};

// Mark as unread
notificationSchema.methods.markAsUnread = async function () {
	this.isRead = false;
	this.readAt = null;
	return await this.save();
};

// Get unread count for user
notificationSchema.statics.getUnreadCount = async function (userId) {
	return await this.countDocuments({
		userId,
		isRead: false,
	});
};

// Get notifications for user
notificationSchema.statics.getForUser = async function (userId, options = {}) {
	const {
		limit = 20,
		skip = 0,
		isRead = null,
		type = null,
		category = null,
		priority = null,
	} = options;

	const query = { userId };

	if (isRead !== null) query.isRead = isRead;
	if (type) query.type = type;
	if (category) query.category = category;
	if (priority) query.priority = priority;

	const notifications = await this.find(query)
		.sort({ createdAt: -1 })
		.limit(limit)
		.skip(skip)
		.lean();

	const total = await this.countDocuments(query);

	return { notifications, total };
};

// Mark all as read for user
notificationSchema.statics.markAllAsRead = async function (userId) {
	return await this.updateMany(
		{ userId, isRead: false },
		{
			$set: {
				isRead: true,
				readAt: new Date(),
			},
		}
	);
};

// Delete old notifications
notificationSchema.statics.deleteOldNotifications = async function (userId, daysOld = 30) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysOld);

	return await this.deleteMany({
		userId,
		createdAt: { $lt: cutoffDate },
		isRead: true,
	});
};

export default mongoose.model('Notification', notificationSchema);

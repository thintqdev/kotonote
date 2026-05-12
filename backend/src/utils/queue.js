/**
 * Simple In-Memory Queue for Notifications
 * For production, consider using Bull, RabbitMQ, or Redis Queue
 */

class NotificationQueue {
	constructor() {
		this.queue = [];
		this.processing = false;
		this.maxRetries = 3;
		this.retryDelay = 5000; // 5 seconds
		this.batchSize = 10;
		this.processInterval = 1000; // 1 second
	}

	/**
	 * Add notification to queue
	 * @param {Object} notification - Notification data
	 */
	enqueue(notification) {
		this.queue.push({
			...notification,
			attempts: 0,
			addedAt: new Date(),
		});
	}

	/**
	 * Add multiple notifications to queue
	 * @param {Array} notifications - Array of notification data
	 */
	enqueueBatch(notifications) {
		notifications.forEach(notif => this.enqueue(notif));
	}

	/**
	 * Get queue size
	 * @returns {number} Queue size
	 */
	size() {
		return this.queue.length;
	}

	/**
	 * Start processing queue
	 * @param {Function} processor - Function to process each notification
	 */
	startProcessing(processor) {
		if (this.processing) return;

		this.processing = true;
		console.log('[Queue] Started processing notifications');

		this.processingInterval = setInterval(async () => {
			if (this.queue.length === 0) return;

			const batch = this.queue.splice(0, this.batchSize);

			for (const notification of batch) {
				try {
					await processor(notification);
					console.log(`[Queue] Processed notification: ${notification._id || 'new'}`);
				} catch (error) {
					notification.attempts++;

					if (notification.attempts < this.maxRetries) {
						console.warn(
							`[Queue] Retry ${notification.attempts}/${this.maxRetries} for notification:`,
							error.message
						);
						// Re-queue for retry
						setTimeout(() => this.enqueue(notification), this.retryDelay);
					} else {
						console.error(
							`[Queue] Failed to process notification after ${this.maxRetries} attempts:`,
							error.message
						);
						// Log failed notification
						this.logFailedNotification(notification, error);
					}
				}
			}
		}, this.processInterval);
	}

	/**
	 * Stop processing queue
	 */
	stopProcessing() {
		if (this.processingInterval) {
			clearInterval(this.processingInterval);
			this.processing = false;
			console.log('[Queue] Stopped processing notifications');
		}
	}

	/**
	 * Log failed notification
	 * @param {Object} notification - Failed notification
	 * @param {Error} error - Error object
	 */
	logFailedNotification(notification, error) {
		console.error('[Queue] Failed notification:', {
			notificationId: notification._id,
			userId: notification.userId,
			error: error.message,
			timestamp: new Date().toISOString(),
		});

		// TODO: Save to database for manual review
		// await FailedNotification.create({
		//   notificationId: notification._id,
		//   userId: notification.userId,
		//   error: error.message,
		//   data: notification,
		// });
	}

	/**
	 * Get queue stats
	 * @returns {Object} Queue statistics
	 */
	getStats() {
		return {
			queueSize: this.queue.length,
			isProcessing: this.processing,
			totalProcessed: this.totalProcessed || 0,
			totalFailed: this.totalFailed || 0,
		};
	}

	/**
	 * Clear queue
	 */
	clear() {
		this.queue = [];
		console.log('[Queue] Queue cleared');
	}
}

// Export singleton instance
export const notificationQueue = new NotificationQueue();

export default NotificationQueue;

import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		currentStreak: {
			type: Number,
			default: 0,
			min: 0,
		},
		longestStreak: {
			type: Number,
			default: 0,
			min: 0,
		},
		lastCheckInDate: {
			type: Date,
		},
		checkInDates: {
			type: [Date],
			default: [],
		},
		totalCheckIns: {
			type: Number,
			default: 0,
			min: 0,
		},
		// Freeze streak (cho phép nghỉ 1 ngày mà không mất streak)
		freezeCount: {
			type: Number,
			default: 0,
			min: 0,
		},
		lastFreezeDate: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
streakSchema.index({ userId: 1 });
streakSchema.index({ currentStreak: -1 });
streakSchema.index({ longestStreak: -1 });

// Method to check if user can check in today
streakSchema.methods.canCheckInToday = function () {
	if (!this.lastCheckInDate) return true;
	
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	const lastCheckIn = new Date(this.lastCheckInDate);
	lastCheckIn.setHours(0, 0, 0, 0);
	
	return today.getTime() !== lastCheckIn.getTime();
};

// Method to check if streak is broken
streakSchema.methods.isStreakBroken = function () {
	if (!this.lastCheckInDate) return false;
	
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	const lastCheckIn = new Date(this.lastCheckInDate);
	lastCheckIn.setHours(0, 0, 0, 0);
	
	const daysDiff = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));
	
	// Nếu quá 1 ngày (không check in hôm qua) thì streak bị break
	return daysDiff > 1;
};

// Method to perform check-in
streakSchema.methods.checkIn = async function () {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	// Check if already checked in today
	if (!this.canCheckInToday()) {
		return { success: false, alreadyCheckedIn: true };
	}
	
	// Check if streak is broken
	if (this.isStreakBroken()) {
		this.currentStreak = 0;
	}
	
	// Increment streak
	this.currentStreak += 1;
	this.totalCheckIns += 1;
	
	// Update longest streak
	if (this.currentStreak > this.longestStreak) {
		this.longestStreak = this.currentStreak;
	}
	
	// Update last check-in date
	this.lastCheckInDate = today;
	
	// Add to check-in dates (keep last 365 days only)
	this.checkInDates.push(today);
	if (this.checkInDates.length > 365) {
		this.checkInDates = this.checkInDates.slice(-365);
	}
	
	await this.save();
	
	return {
		success: true,
		currentStreak: this.currentStreak,
		longestStreak: this.longestStreak,
		totalCheckIns: this.totalCheckIns,
	};
};

// Method to use freeze (skip 1 day without breaking streak)
streakSchema.methods.useFreeze = async function () {
	if (this.freezeCount <= 0) {
		return { success: false, message: 'No freeze available' };
	}
	
	this.freezeCount -= 1;
	this.lastFreezeDate = new Date();
	
	// Extend last check-in by 1 day
	if (this.lastCheckInDate) {
		const extended = new Date(this.lastCheckInDate);
		extended.setDate(extended.getDate() + 1);
		this.lastCheckInDate = extended;
	}
	
	await this.save();
	
	return {
		success: true,
		freezeCount: this.freezeCount,
	};
};

export default mongoose.model('Streak', streakSchema);

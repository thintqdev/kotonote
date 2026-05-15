import * as streakRepository from '../repositories/streakRepository.js';
import { STREAK } from '../constants/messages.js';
import { tryUnlockStreakBadgesForCount } from './badgeUnlockService.js';

export const getUserStreak = async (userId) => {
	const streak = await streakRepository.getOrCreateStreak(userId);
	return streak;
};

export const checkIn = async (userId) => {
	const streak = await streakRepository.getOrCreateStreak(userId);
	
	// Check if already checked in today
	if (!streak.canCheckInToday()) {
		throw { messageCode: STREAK.ALREADY_CHECKED_IN, statusCode: 400 };
	}
	
	// Perform check-in
	const result = await streak.checkIn();

	if (result.success) {
		try {
			await tryUnlockStreakBadgesForCount(userId, result.currentStreak);
		} catch {
			/* không chặn check-in nếu badge/notify lỗi */
		}
	}

	return {
		...result,
		messageCode: STREAK.CHECKED_IN,
	};
};

export const useFreeze = async (userId) => {
	const streak = await streakRepository.getOrCreateStreak(userId);
	
	const result = await streak.useFreeze();
	
	if (!result.success) {
		throw { messageCode: STREAK.NO_FREEZE_AVAILABLE, statusCode: 400 };
	}
	
	return {
		...result,
		messageCode: STREAK.FREEZE_USED,
	};
};

export const getTopStreaks = async (limit = 10) => {
	return await streakRepository.getTopStreaks(limit);
};

export const getStreakStats = async () => {
	return await streakRepository.getStreakStats();
};

export const getWeeklyCheckIns = async (userId) => {
	const streak = await streakRepository.getOrCreateStreak(userId);
	
	// Get last 7 days
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	const weeklyData = [];
	for (let i = 6; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);
		
		const isCheckedIn = streak.checkInDates.some((checkInDate) => {
			const checkIn = new Date(checkInDate);
			checkIn.setHours(0, 0, 0, 0);
			return checkIn.getTime() === date.getTime();
		});
		
		weeklyData.push({
			date: date.toISOString(),
			isCheckedIn,
		});
	}
	
	return weeklyData;
};

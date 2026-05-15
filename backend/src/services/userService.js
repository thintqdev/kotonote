import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import * as userRepository from '../repositories/userRepository.js';
import { buildBadgesDisplayForUser, unlockBadgeForUser } from './badgeUnlockService.js';
import { USER } from '../constants/messages.js';
import { USER_STATUS } from '../constants/userStatus.js';

const UPLOAD_AVATAR_PREFIX = '/uploads/avatars/';

/**
 * Bổ sung `badges` (join metadata) cho payload user trả về client.
 * @param {import('mongoose').Document|object} userDoc
 */
export async function enrichUserWithBadges(userDoc) {
	const plain =
		userDoc && typeof userDoc.toJSON === 'function'
			? userDoc.toJSON()
			: { ...userDoc };
	plain.badges = await buildBadgesDisplayForUser(plain);
	return plain;
}

/**
 * Xóa file avatar cục bộ (nếu có) — chỉ khi đường dẫn nằm trong thư mục uploads/avatars.
 * @param {string | null | undefined} avatarString
 */
export async function unlinkLocalAvatarFile(avatarString) {
	if (!avatarString || typeof avatarString !== 'string') return;
	const t = avatarString.trim();
	if (!t.startsWith(UPLOAD_AVATAR_PREFIX)) return;
	const name = t.slice(UPLOAD_AVATAR_PREFIX.length);
	if (!name || name.includes('/') || name.includes('..')) return;
	const fullPath = path.join(process.cwd(), 'uploads', 'avatars', name);
	try {
		await fs.unlink(fullPath);
	} catch {
		/* file đã xóa hoặc không tồn tại */
	}
}

/**
 * Sau khi multer đã ghi file: cập nhật user.avatar = đường dẫn công khai, xóa file cũ nếu là upload cục bộ.
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {string} publicPath ví dụ `/uploads/avatars/507f...-123.jpg`
 */
export const setAvatarFromUploadedFile = async (userId, publicPath) => {
	const user = await userRepository.findUserById(userId);

	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}

	await unlinkLocalAvatarFile(user.avatar);
	user.avatar = publicPath;
	await user.save();

	return enrichUserWithBadges(user);
};

export const getCurrentUser = async (userId) => {
	const user = await userRepository.findUserById(userId);
	
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	
	return enrichUserWithBadges(user);
};

const PROFILE_PATCH_KEYS = [
	'readingName',
	'title',
	'location',
	'timeZoneLabel',
	'bio',
	'examTypeKey',
	'examLevelKey',
	'examDateIso',
	'examOtherNote',
];

/**
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {{ name?: string, avatar?: string|null, profile?: Record<string, unknown> }} updateData
 */
export const updateProfile = async (userId, updateData) => {
	const user = await userRepository.findUserById(userId);
	
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	
	if (typeof updateData.name === 'string') {
		user.name = updateData.name.trim();
	}
	
	if (Object.prototype.hasOwnProperty.call(updateData, 'avatar')) {
		if (updateData.avatar === '' || updateData.avatar === null) {
			await unlinkLocalAvatarFile(user.avatar);
			user.avatar = null;
		} else {
			const next = String(updateData.avatar).trim();
			if (user.avatar && user.avatar !== next) {
				await unlinkLocalAvatarFile(user.avatar);
			}
			user.avatar = next;
		}
	}
	
	const incoming = updateData.profile;
	if (incoming && typeof incoming === 'object') {
		user.profile = user.profile || {};
		for (const key of PROFILE_PATCH_KEYS) {
			if (!Object.prototype.hasOwnProperty.call(incoming, key)) continue;
			const v = incoming[key];
			if (v === null || v === undefined) {
				user.profile[key] = key === 'examTypeKey' ? 'jlpt' : '';
			} else {
				const s = (typeof v === 'string' ? v : String(v)).trim();
				user.profile[key] = s;
			}
		}
	}
	
	await user.save();
	
	return enrichUserWithBadges(user);
};

/**
 * QA (non-production): mở khóa badge + trả user đã gắn `badges`.
 * @param {import('mongoose').Types.ObjectId|string} userId
 * @param {string} badgeKey
 */
export const testUnlockBadgeForCurrentUser = async (userId, badgeKey) => {
	const unlock = await unlockBadgeForUser(userId, badgeKey);
	const user = await userRepository.findUserById(userId);
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	return { ...unlock, user: await enrichUserWithBadges(user) };
};

// ============ ADMIN USER MANAGEMENT ============

/**
 * Get all users with filters
 */
export const getAllUsers = async (filters = {}) => {
	return await userRepository.getAllUsers(filters);
};

/**
 * Get user by ID (admin view)
 */
export const getUserById = async (userId) => {
	const user = await userRepository.findUserByIdAdmin(userId);
	
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	
	return user;
};

/**
 * Update user status (admin only)
 */
export const updateUserStatus = async (userId, status) => {
	const validStatuses = Object.values(USER_STATUS);
	
	if (!validStatuses.includes(status)) {
		throw { messageCode: USER.UPDATED, statusCode: 400 };
	}
	
	const user = await userRepository.updateUserStatus(userId, status);
	
	if (!user) {
		throw { messageCode: USER.NOT_FOUND, statusCode: 404 };
	}
	
	return user;
};

/**
 * Cập nhật trạng thái hàng loạt (admin).
 * Bỏ qua id không phải ObjectId, id không tồn tại, và **không** áp dụng lên chính admin đang thao tác (`actorUserId`).
 * @param {string[]} userIds
 * @param {string} status
 * @param {string} [actorUserId] — req.user._id dạng string
 */
export const bulkUpdateUsersStatus = async (userIds, status, actorUserId) => {
	const validStatuses = Object.values(USER_STATUS);
	if (!validStatuses.includes(status)) {
		throw { messageCode: USER.UPDATED, statusCode: 400 };
	}

	const unique = [...new Set((userIds || []).map((id) => String(id).trim()).filter(Boolean))];

	const invalidFormatIds = [];
	const validHexIds = [];
	for (const id of unique) {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			invalidFormatIds.push(id);
			continue;
		}
		if (new mongoose.Types.ObjectId(id).toString() !== id) {
			invalidFormatIds.push(id);
			continue;
		}
		if (actorUserId && id === String(actorUserId)) {
			continue;
		}
		validHexIds.push(id);
	}

	const objectIds = validHexIds.map((id) => new mongoose.Types.ObjectId(id));
	const result = await userRepository.bulkUpdateUsersStatus(objectIds, status);

	const skippedSelfCount = actorUserId
		? unique.filter((id) => id === String(actorUserId)).length
		: 0;

	return {
		status,
		requested: unique.length,
		eligibleIdCount: validHexIds.length,
		matchedCount: result.matchedCount ?? 0,
		modifiedCount: result.modifiedCount ?? 0,
		notFoundIdCount: Math.max(0, validHexIds.length - (result.matchedCount ?? 0)),
		invalidFormatIds,
		skippedSelfCount,
	};
};

/**
 * Get user statistics
 */
export const getUserStatistics = async () => {
	return await userRepository.getUserStatistics();
};

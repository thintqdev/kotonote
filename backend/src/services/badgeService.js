import fs from 'fs/promises';
import path from 'path';
import * as badgeRepository from '../repositories/badgeRepository.js';
import { BADGE } from '../constants/messages.js';

const UPLOAD_BADGE_PREFIX = '/uploads/badges/';

export async function unlinkLocalBadgeIcon(iconString) {
	if (!iconString || typeof iconString !== 'string') return;
	const t = iconString.trim();
	if (!t.startsWith(UPLOAD_BADGE_PREFIX)) return;
	const name = t.slice(UPLOAD_BADGE_PREFIX.length);
	if (!name || name.includes('/') || name.includes('..')) return;
	const fullPath = path.join(process.cwd(), 'uploads', 'badges', name);
	try {
		await fs.unlink(fullPath);
	} catch {
		/* đã xóa hoặc không tồn tại */
	}
}

function stripIconFromBody(data) {
	if (!data || typeof data !== 'object') return data;
	const { iconImage: _i, ...rest } = data;
	return rest;
}

export const getAllBadges = async (filters = {}) => {
	return await badgeRepository.findAllBadges(filters);
};

export const getBadgeById = async (badgeId) => {
	const badge = await badgeRepository.findBadgeById(badgeId);
	if (!badge) {
		throw { messageCode: BADGE.NOT_FOUND, statusCode: 404 };
	}
	return badge;
};

export const createBadge = async (badgeData) => {
	const safe = stripIconFromBody(badgeData);
	const key = String(safe.key || '')
		.trim()
		.toLowerCase();
	const existing = await badgeRepository.findBadgeByKey(key);
	if (existing) {
		throw { messageCode: BADGE.DUPLICATE_KEY, statusCode: 409 };
	}
	try {
		return await badgeRepository.createBadge({ ...safe, key });
	} catch (error) {
		if (error.code === 11000) {
			throw { messageCode: BADGE.DUPLICATE_KEY, statusCode: 409 };
		}
		throw error;
	}
};

export const updateBadge = async (badgeId, updateData) => {
	const safe = stripIconFromBody(updateData);
	const current = await badgeRepository.findBadgeById(badgeId);
	if (!current) {
		throw { messageCode: BADGE.NOT_FOUND, statusCode: 404 };
	}
	const payload = { ...safe };
	if (safe.key !== undefined) {
		payload.key = String(safe.key).trim().toLowerCase();
		const taken = await badgeRepository.findBadgeByKey(payload.key);
		if (taken && String(taken._id) !== String(badgeId)) {
			throw { messageCode: BADGE.DUPLICATE_KEY, statusCode: 409 };
		}
	}
	try {
		const badge = await badgeRepository.updateBadge(badgeId, payload);
		if (!badge) {
			throw { messageCode: BADGE.NOT_FOUND, statusCode: 404 };
		}
		return badge;
	} catch (error) {
		if (error.code === 11000) {
			throw { messageCode: BADGE.DUPLICATE_KEY, statusCode: 409 };
		}
		throw error;
	}
};

export const deleteBadge = async (badgeId) => {
	const existing = await badgeRepository.findBadgeById(badgeId);
	if (!existing) {
		throw { messageCode: BADGE.NOT_FOUND, statusCode: 404 };
	}
	await unlinkLocalBadgeIcon(existing.iconImage);
	const badge = await badgeRepository.deleteBadge(badgeId);
	return badge;
};

/**
 * Gán icon sau upload multipart — xóa file icon cũ nếu là upload cục bộ.
 * @param {string} badgeId
 * @param {string} publicPath ví dụ `/uploads/badges/badge-...png`
 */
export const setBadgeIconFromUploadedFile = async (badgeId, publicPath) => {
	const badge = await getBadgeById(badgeId);
	await unlinkLocalBadgeIcon(badge.iconImage);
	badge.iconImage = publicPath;
	await badge.save();
	return badge;
};

/** Gỡ icon (chỉ file local trong uploads/badges). */
export const clearBadgeIcon = async (badgeId) => {
	const badge = await getBadgeById(badgeId);
	await unlinkLocalBadgeIcon(badge.iconImage);
	badge.iconImage = '';
	await badge.save();
	return badge;
};

import {
	buildExamTargetDisplay,
	formatExamDateLong,
	resolveGoalExamFields,
} from './profileExamDisplay.js';
import { resolveAvatarUrl, resolvePublicMediaUrl } from './resolveAvatarUrl.js';
import {
	normalizeProfileRegionKey,
	normalizeProfileTimeZoneKey,
} from '../constants/profileLocale.js';

/** Các key đồng bộ từ API — không ghi đè bằng localStorage sau khi đã có user */
export const SERVER_SYNCED_PROFILE_KEYS = new Set([
	'displayName',
	'email',
	'readingName',
	'title',
	'location',
	'timeZoneLabel',
	'bio',
	'examTypeKey',
	'examLevelKey',
	'examDateIso',
	'examOtherNote',
	'examTarget',
	'examDateLabel',
	'avatarDataUrl',
	'joinedLabel',
	'badges',
]);

/**
 * @param {Record<string, unknown>} overrides
 * @returns {Record<string, unknown>}
 */
export function stripServerSyncedProfileOverrides(overrides) {
	if (!overrides || typeof overrides !== 'object') return {};
	const next = { ...overrides };
	for (const k of SERVER_SYNCED_PROFILE_KEYS) {
		delete next[k];
	}
	return next;
}

/**
 * @param {object | null | undefined} user
 * @param {object} demoProfile
 * @param {import('i18next').TFunction} t
 * @param {string} language
 * @returns {Record<string, unknown>}
 */
export function buildProfileSliceFromUser(user, demoProfile, t, language) {
	if (!user) return {};

	const p = user.profile || {};
	const slice = {
		displayName: user.name?.trim() || demoProfile.displayName,
		email: user.email?.trim() || demoProfile.email,
		readingName: p.readingName ?? '',
		title: p.title ?? '',
		location: normalizeProfileRegionKey(p.location) || '',
		timeZoneLabel:
			normalizeProfileTimeZoneKey(p.timeZoneLabel, p.location) || '',
		bio: p.bio ?? '',
		examTypeKey: p.examTypeKey || 'jlpt',
		examLevelKey: p.examLevelKey ?? '',
		examDateIso: p.examDateIso ?? '',
		examOtherNote: p.examOtherNote ?? '',
	};

	slice.avatarDataUrl = resolveAvatarUrl(user.avatar);

	if (user.createdAt) {
		try {
			const d = new Date(user.createdAt);
			if (!Number.isNaN(d.getTime())) {
				slice.joinedLabel = d.toLocaleDateString(language, {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				});
			}
		} catch {
			// giữ demoProfile.joinedLabel qua merge bên ngoài
		}
	}

	const goal = resolveGoalExamFields(slice);
	slice.examTarget = buildExamTargetDisplay(t, goal);
	slice.examDateLabel = goal.examDateIso
		? formatExamDateLong(goal.examDateIso, language)
		: '';

	const rawBadges = Array.isArray(user.badges) ? user.badges : [];
	const isJa = language === 'ja';
	slice.badges = rawBadges.map((b) => {
		const key = String(b.badgeKey || b.id || '').trim();
		const labelVi = (b.labelVi != null ? String(b.labelVi) : '').trim() || key;
		const labelJa = (b.labelJa != null ? String(b.labelJa) : '').trim() || key;
		const iconRaw = (b.iconImage != null ? String(b.iconImage) : '').trim();
		return {
			id: key,
			badgeKey: key,
			emoji: (b.emoji != null ? String(b.emoji) : '').trim() || '🏅',
			label: isJa ? labelJa : labelVi,
			labelVi,
			labelJa,
			iconImage: iconRaw,
			iconUrl: iconRaw ? resolvePublicMediaUrl(iconRaw) : null,
			unlockedAt: b.unlockedAt,
		};
	});

	return slice;
}

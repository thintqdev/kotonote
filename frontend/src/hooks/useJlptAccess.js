import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth.jsx';
import { getMyMembership } from '../services/membershipService.js';
import {
	isJlptUnlocked,
	jlptUnlockedFromMembership,
	normalizeJlptLevel,
} from '../utils/jlptAccess.js';

/**
 * Quyền JLPT theo gói membership — dùng khóa tab/card và JlptLockGate.
 */
export function useJlptAccess() {
	const { user } = useAuth();
	const [membership, setMembership] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!user) {
			setMembership(null);
			return;
		}
		const fromUser = user.membership;
		if (fromUser?.jlptUnlocked?.length) {
			setMembership(fromUser);
			return;
		}
		let cancelled = false;
		setLoading(true);
		getMyMembership()
			.then((m) => {
				if (!cancelled) setMembership(m);
			})
			.catch(() => {
				if (!cancelled) setMembership(null);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [user, user?.membership]);

	const unlocked = useMemo(() => {
		const source = membership ?? user?.membership;
		return jlptUnlockedFromMembership(source);
	}, [membership, user?.membership]);

	const isUnlocked = useCallback(
		(jlpt) => isJlptUnlocked(unlocked, jlpt),
		[unlocked],
	);

	const isLocked = useCallback(
		(jlpt) => {
			const level = normalizeJlptLevel(jlpt);
			if (!level) return false;
			return !isJlptUnlocked(unlocked, level);
		},
		[unlocked],
	);

	return {
		unlocked,
		loading,
		isUnlocked,
		isLocked,
		membership: membership ?? user?.membership ?? null,
	};
}

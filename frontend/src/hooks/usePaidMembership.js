import { useMemo } from 'react';
import { useJlptAccess } from './useJlptAccess.js';
import { isPaidMembership } from '../utils/membershipAccess.js';

/** Quyền gói trả phí (pro / ultra / ultimate). */
export function usePaidMembership() {
	const { membership, loading } = useJlptAccess();
	const isPaid = useMemo(() => isPaidMembership(membership), [membership]);
	return { isPaid, loading, membership };
}

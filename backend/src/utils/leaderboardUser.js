/**
 * @param {{ _id?: unknown, name?: string, email?: string, avatar?: string } | null | undefined} user
 */
export function formatLeaderboardUser(user) {
	if (!user) {
		return { displayName: '—', avatar: '' };
	}
	const name = String(user.name || '').trim();
	const email = String(user.email || '').trim();
	const displayName = name || (email ? email.split('@')[0] : '') || '—';
	return {
		displayName,
		avatar: user.avatar ? String(user.avatar) : '',
	};
}

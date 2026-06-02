/**
 * Xóa lịch sử thi / bảng xếp hạng đấu trường (ArenaAttempt) để thi lại.
 *
 *   npm run arena:clear-attempts
 *   npm run arena:clear-attempts -- --date=2026-05-24
 *   npm run arena:clear-attempts -- --user-id=<mongoId>
 */
import 'dotenv/config';
import connectDB from '../config/database.js';
import ArenaAttempt from '../models/ArenaAttempt.js';

const dateArg = process.argv.find((a) => a.startsWith('--date='));
const userArg = process.argv.find((a) => a.startsWith('--user-id='));
const dateKey = dateArg ? dateArg.split('=')[1] : null;
const userId = userArg ? userArg.split('=')[1] : null;

await connectDB();

const filter = {};
if (dateKey) filter.dateKey = dateKey;
if (userId) filter.userId = userId;

const { deletedCount } = await ArenaAttempt.deleteMany(filter);

const scope =
	dateKey && userId
		? `dateKey=${dateKey}, userId=${userId}`
		: dateKey
			? `dateKey=${dateKey}`
			: userId
				? `userId=${userId}`
				: 'tất cả';

console.log(`[arena:clear-attempts] Đã xóa ${deletedCount} lượt thi (${scope}).`);

process.exit(0);

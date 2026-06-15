/**
 * Xóa toàn bộ lịch sử MembershipCheckout (test / dọn duplicate cũ).
 *   npm run membership:clear-checkouts
 * Giữ membership user — chỉ xóa bảng checkout. Thêm --reset-membership để hạ tất cả user về Free.
 */
import 'dotenv/config';
import connectDB from '../config/database.js';
import MembershipCheckout from '../models/MembershipCheckout.js';
import User from '../models/User.js';
import {
	MEMBERSHIP_BILLING,
	jlptUnlockedForTier,
} from '../constants/membership.js';

const resetMembership = process.argv.includes('--reset-membership');

await connectDB();

const { deletedCount } = await MembershipCheckout.deleteMany({});
console.log(`[membership:clear-checkouts] Đã xóa ${deletedCount} checkout.`);

if (resetMembership) {
	const result = await User.updateMany(
		{},
		{
			$set: {
				membership: {
					tierId: 'free',
					billing: MEMBERSHIP_BILLING.FREE,
					status: 'active',
					jlptUnlocked: jlptUnlockedForTier('free'),
					purchasedAt: null,
					expiresAt: null,
				},
			},
		},
	);
	console.log(
		`[membership:clear-checkouts] Đã reset membership về Free cho ${result.modifiedCount} user.`,
	);
}

process.exit(0);

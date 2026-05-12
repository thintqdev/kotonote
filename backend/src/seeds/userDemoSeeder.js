import User from '../models/User.js';
import {
	USER_STATUS,
	USER_ROLE,
	AUTH_PROVIDER,
} from '../constants/userStatus.js';

/** Email nhận diện bộ seed demo (dùng cho filter admin / QA). */
export const DEMO_USER_EMAIL_RE = /^seed\.demo\.user\d+@kotonote\.seed$/;

const DEMO_PASSWORD = 'User@123456';

/**
 * Danh sách user demo: tên / trạng thái / provider đa dạng (có vẻ “ngẫu nhiên” nhưng cố định để QA ổn định).
 * Mật khẩu mặc định (local): cùng `DEMO_PASSWORD` — chỉ dùng môi trường dev.
 */
const DEMO_USERS = [
	{
		email: 'seed.demo.user1@kotonote.seed',
		name: 'Nguyễn Minh Anh',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 1,
	},
	{
		email: 'seed.demo.user2@kotonote.seed',
		name: 'Trần Đức Thịnh',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: false,
		isActive: true,
		lastLoginDaysAgo: 3,
	},
	{
		email: 'seed.demo.user3@kotonote.seed',
		name: 'Lê Thu Hà',
		status: USER_STATUS.LOCKED,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 14,
	},
	{
		email: 'seed.demo.user4@kotonote.seed',
		name: 'Phạm Quốc Bảo',
		status: USER_STATUS.SUSPENDED,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: false,
		isActive: false,
		lastLoginDaysAgo: 45,
	},
	{
		email: 'seed.demo.user5@kotonote.seed',
		name: 'Hoàng Mai Chi',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 0,
	},
	{
		email: 'seed.demo.user6@kotonote.seed',
		name: 'Võ Hải Yến',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 7,
	},
	{
		email: 'seed.demo.user7@kotonote.seed',
		name: 'Đặng Tuấn Kiệt',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: false,
		isActive: true,
		lastLoginDaysAgo: null,
	},
	{
		email: 'seed.demo.user8@kotonote.seed',
		name: 'Bùi Lan Phương',
		status: USER_STATUS.LOCKED,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: false,
		lastLoginDaysAgo: 60,
	},
	{
		email: 'seed.demo.user9@kotonote.seed',
		name: 'Đỗ Nam Khánh',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 2,
	},
	{
		email: 'seed.demo.user10@kotonote.seed',
		name: 'Ngô Thị Thảo',
		status: USER_STATUS.SUSPENDED,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 30,
	},
	{
		email: 'seed.demo.user11@kotonote.seed',
		name: 'Google Seed Alpha',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.GOOGLE,
		googleId: 'seed-google-synthetic-10001',
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 1,
	},
	{
		email: 'seed.demo.user12@kotonote.seed',
		name: 'Google Seed Beta',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.GOOGLE,
		googleId: 'seed-google-synthetic-10002',
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 5,
	},
	{
		email: 'seed.demo.user13@kotonote.seed',
		name: 'Huỳnh Gia Huy',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: true,
		role: USER_ROLE.USER,
		lastLoginDaysAgo: 10,
	},
	{
		email: 'seed.demo.user14@kotonote.seed',
		name: 'Lý Bích Ngọc',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: false,
		isActive: true,
		lastLoginDaysAgo: null,
	},
	{
		email: 'seed.demo.user15@kotonote.seed',
		name: 'Châu Đình Vũ',
		status: USER_STATUS.ACTIVE,
		authProvider: AUTH_PROVIDER.LOCAL,
		isEmailVerified: true,
		isActive: true,
		lastLoginDaysAgo: 4,
	},
];

function buildPayload(row) {
	const lastLogin =
		row.lastLoginDaysAgo == null
			? undefined
			: new Date(Date.now() - row.lastLoginDaysAgo * 24 * 60 * 60 * 1000);

	const base = {
		email: row.email,
		name: row.name,
		role: row.role ?? USER_ROLE.USER,
		authProvider: row.authProvider,
		status: row.status,
		isActive: row.isActive !== false,
		isEmailVerified: !!row.isEmailVerified,
		lastLogin,
	};

	if (row.authProvider === AUTH_PROVIDER.GOOGLE) {
		return {
			...base,
			googleId: row.googleId,
		};
	}

	return {
		...base,
		password: DEMO_PASSWORD,
	};
}

export const seedDemoUsers = async () => {
	let created = 0;
	for (const row of DEMO_USERS) {
		const exists = await User.findOne({ email: row.email });
		if (exists) {
			continue;
		}
		const doc = new User(buildPayload(row));
		await doc.save();
		created += 1;
	}

	if (created > 0) {
		console.log(`✓ Seeded ${created} demo user(s) (*@kotonote.seed)`);
		console.log(`  Mật khẩu tài khoản local: ${DEMO_PASSWORD}`);
	} else {
		console.log('Demo users: all seed emails already exist, nothing to add.');
	}
};

export default seedDemoUsers;

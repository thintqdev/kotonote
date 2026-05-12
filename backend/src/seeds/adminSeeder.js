import User from '../models/User.js';
import { USER_ROLE, AUTH_PROVIDER } from '../constants/userStatus.js';

const adminUser = {
	email: 'admin@kotonote.com',
	password: 'Admin@123456', // Should be changed after first login
	name: 'Admin Kotonote',
	role: USER_ROLE.ADMIN,
	authProvider: AUTH_PROVIDER.LOCAL,
	isActive: true,
	isEmailVerified: true,
};

export const seedAdmin = async () => {
	try {
		// Check if admin already exists
		const existingAdmin = await User.findOne({ email: adminUser.email });
		
		if (existingAdmin) {
			console.log('Admin user already exists. Skipping...');
			return;
		}
		
		// Create admin user
		const admin = new User(adminUser);
		await admin.save();
		
		console.log('✓ Successfully created admin user');
		console.log(`  Email: ${adminUser.email}`);
		console.log(`  Password: ${adminUser.password}`);
		console.log('  ⚠️  Please change the password after first login!');
	} catch (error) {
		console.error('Error seeding admin:', error);
		throw error;
	}
};

export default seedAdmin;

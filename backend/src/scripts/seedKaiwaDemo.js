import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedKaiwaDemo from '../seeds/kaiwaDemoSeeder.js';

dotenv.config();

const run = async () => {
	try {
		await connectDB();
		console.log('🌱 Seeding Kaiwa demo contexts...\n');
		await seedKaiwaDemo();
		console.log('\n✅ Kaiwa demo seeding completed.');
		process.exit(0);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

run();

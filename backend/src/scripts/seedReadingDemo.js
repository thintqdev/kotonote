import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedReadingDemo from '../seeds/readingDemoSeeder.js';

dotenv.config();

const run = async () => {
	try {
		console.log('🌱 Seed bài đọc hiểu demo…\n');
		await connectDB();
		await seedReadingDemo();
		console.log('\n✅ Xong.');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Lỗi:', error);
		process.exit(1);
	}
};

run();

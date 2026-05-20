import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedListeningDemo from '../seeds/listeningDemoSeeder.js';

dotenv.config();

const run = async () => {
	try {
		console.log('🌱 Seed bài nghe demo…\n');
		await connectDB();
		await seedListeningDemo();
		console.log('\n✅ Xong.');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Lỗi:', error);
		process.exit(1);
	}
};

run();

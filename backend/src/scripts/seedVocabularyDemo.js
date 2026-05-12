import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedVocabularyDemo from '../seeds/vocabularyDemoSeeder.js';

dotenv.config();

const run = async () => {
	try {
		console.log('🌱 Seed demo từ vựng (25 deck)…\n');
		await connectDB();
		await seedVocabularyDemo();
		console.log('\n✅ Xong.');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Lỗi:', error);
		process.exit(1);
	}
};

run();

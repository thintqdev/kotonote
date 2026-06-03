import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedSentenceTemplates from '../seeds/sentenceTemplateSeed.js';

dotenv.config();

const run = async () => {
	try {
		console.log('🌱 Seeding sentence templates...\n');
		await connectDB();
		await seedSentenceTemplates();
		console.log('\n✅ Sentence template seed completed!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Error:', error);
		process.exit(1);
	}
};

run();

import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedPrompts from '../seeds/promptSeeder.js';

dotenv.config();

const run = async () => {
	try {
		console.log('🌱 Seeding AI prompts...\n');
		await connectDB();
		await seedPrompts();
		console.log('\n✅ Prompt seeding completed.');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Prompt seeding failed:', error);
		process.exit(1);
	}
};

run();

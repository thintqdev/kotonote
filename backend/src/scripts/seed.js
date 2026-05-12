import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedQuotes from '../seeds/quoteSeeder.js';
import seedAdmin from '../seeds/adminSeeder.js';
import seedKanji from '../seeds/kanjiSeeder.js';

// Load environment variables
dotenv.config();

const runSeeder = async () => {
	try {
		console.log('🌱 Starting database seeding...\n');
		
		// Connect to database
		await connectDB();
		
		// Run seeders
		await seedAdmin();
		await seedQuotes();
		await seedKanji();
		
		console.log('\n✅ Database seeding completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Error seeding database:', error);
		process.exit(1);
	}
};

runSeeder();

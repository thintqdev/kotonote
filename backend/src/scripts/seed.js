import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedQuotes from '../seeds/quoteSeeder.js';

// Load environment variables
dotenv.config();

const runSeeder = async () => {
	try {
		console.log('🌱 Starting database seeding...\n');
		
		// Connect to database
		await connectDB();
		
		// Run seeders
		await seedQuotes();
		
		console.log('\n✅ Database seeding completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Error seeding database:', error);
		process.exit(1);
	}
};

runSeeder();

import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import seedQuotes from '../seeds/quoteSeeder.js';
import seedAdmin from '../seeds/adminSeeder.js';
import seedDemoUsers from '../seeds/userDemoSeeder.js';
import seedSurveyDemo from '../seeds/surveyDemoSeeder.js';
import seedKanji from '../seeds/kanjiSeeder.js';
import seedVocabularyDemo from '../seeds/vocabularyDemoSeeder.js';
import seedBadges from '../seeds/badgeSeeder.js';
import seedGrammars from '../seeds/grammarSeeder.js';
import seedPrompts from '../seeds/promptSeeder.js';
import seedExamStructures from '../seeds/examStructureSeeder.js';

// Load environment variables
dotenv.config();

const runSeeder = async () => {
	try {
		console.log('🌱 Starting database seeding...\n');
		
		// Connect to database
		await connectDB();
		
		// Run seeders
		await seedAdmin();
		await seedDemoUsers();
		await seedSurveyDemo();
		await seedQuotes();
		await seedPrompts();
		await seedExamStructures();
		await seedGrammars();
		await seedBadges();
		await seedKanji();
		await seedVocabularyDemo();

		console.log('\n✅ Database seeding completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Error seeding database:', error);
		process.exit(1);
	}
};

runSeeder();

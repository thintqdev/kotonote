import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import { seedArena } from '../seeds/arenaSeed.js';

dotenv.config();

const run = async () => {
	await connectDB();
	const result = await seedArena();
	console.log('[seed:arena]', result);
	process.exit(0);
};

run().catch((err) => {
	console.error(err);
	process.exit(1);
});

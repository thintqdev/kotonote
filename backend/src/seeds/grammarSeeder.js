import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Grammar from '../models/Grammar.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const seedGrammars = async () => {
	const count = await Grammar.countDocuments();
	if (count > 0) {
		console.log(`⏭️  Grammar: skipped (${count} already exist)`);
		return;
	}

	const jsonPath = join(__dirname, 'grammarSeedData.json');
	const seeds = JSON.parse(readFileSync(jsonPath, 'utf8'));

	await Grammar.insertMany(seeds);
	console.log(`✅ Grammar: seeded ${seeds.length} entries`);
};

export default seedGrammars;

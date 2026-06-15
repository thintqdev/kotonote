import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
const cols = await db.listCollections().toArray();
const relevant = cols
	.map((c) => c.name)
	.filter((n) => /grammar|practice/i.test(n));

console.log('Relevant collections:', relevant);

for (const name of relevant) {
	const c = db.collection(name);
	const total = await c.countDocuments();
	const published = await c.countDocuments({ isPublished: true });
	const sample = await c.findOne({});
	console.log(`\n${name}: total=${total}, published=${published}`);
	if (sample) {
		console.log('  sample keys:', Object.keys(sample));
		console.log('  sample jlpt:', sample.jlpt, 'isPublished:', sample.isPublished);
	}
}

await mongoose.disconnect();

/**
 * Migrate grammar practice data:
 * 1. Flatten questions from legacy grammarpracticesets → grammarpracticequestions
 * 2. Publish all draft questions (isPublished: false → true)
 *
 * Usage: node src/scripts/migrateGrammarPractice.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GrammarPracticeQuestion from '../models/GrammarPracticeQuestion.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

let insertedFromSets = 0;
const sets = await db.collection('grammarpracticesets').find({}).toArray();

for (const set of sets) {
	const jlpt = set.jlpt;
	const isPublished = Boolean(set.isPublished);
	for (const q of set.questions ?? []) {
		const sig = `${jlpt}|${q.promptJa}|${(q.options ?? []).join('|')}`;
		const exists = await GrammarPracticeQuestion.findOne({
			jlpt,
			promptJa: q.promptJa,
		}).lean();
		if (exists) continue;

		await GrammarPracticeQuestion.create({
			jlpt,
			type: q.type ?? 'grammar_form',
			promptJa: q.promptJa,
			promptVi: q.promptVi ?? '',
			options: q.options,
			answerIndex: q.answerIndex,
			explainVi: q.explainVi ?? '',
			pattern: q.pattern ?? '',
			isPublished,
			source: set.source ?? 'ai',
		});
		insertedFromSets += 1;
	}
}

const publishResult = await GrammarPracticeQuestion.updateMany(
	{ isPublished: false },
	{ $set: { isPublished: true } },
);

const total = await GrammarPracticeQuestion.countDocuments();
const published = await GrammarPracticeQuestion.countDocuments({ isPublished: true });
const byJlpt = await GrammarPracticeQuestion.aggregate([
	{
		$group: {
			_id: '$jlpt',
			total: { $sum: 1 },
			published: { $sum: { $cond: ['$isPublished', 1, 0] } },
		},
	},
]);

console.log('Inserted from legacy sets:', insertedFromSets);
console.log('Published drafts:', publishResult.modifiedCount);
console.log('Pool now:', { total, published, byJlpt });

await mongoose.disconnect();

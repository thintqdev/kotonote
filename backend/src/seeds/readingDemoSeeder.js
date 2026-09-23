import ReadingArticle from '../models/ReadingArticle.js';
import { READING_DEMO_ARTICLES } from './readingDemoArticles.js';

/**
 * Nạp hoặc cập nhật bài đọc demo theo slug.
 */
export default async function seedReadingDemo() {
	let created = 0;
	let updated = 0;

	for (const row of READING_DEMO_ARTICLES) {
		const result = await ReadingArticle.updateOne(
			{ slug: row.slug },
			{ $set: row },
			{ upsert: true },
		);
		if (result.upsertedCount > 0) created += 1;
		else updated += 1;
	}

	console.log(`   Reading: ${created} created, ${updated} updated`);
	return { created, updated };
}

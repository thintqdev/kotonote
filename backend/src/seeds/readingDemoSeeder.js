import ReadingArticle from '../models/ReadingArticle.js';
import { READING_DEMO_ARTICLES } from './readingDemoArticles.js';

/**
 * Nạp bài đọc demo (bỏ qua slug đã tồn tại).
 */
export default async function seedReadingDemo() {
	let created = 0;
	let skipped = 0;

	for (const row of READING_DEMO_ARTICLES) {
		const exists = await ReadingArticle.findOne({ slug: row.slug }).lean();
		if (exists) {
			skipped += 1;
			continue;
		}
		await ReadingArticle.create(row);
		created += 1;
	}

	console.log(`   Reading: ${created} created, ${skipped} skipped`);
	return { created, skipped };
}

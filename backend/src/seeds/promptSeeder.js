import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Prompt from '../models/Prompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_ROOT = path.join(__dirname, '../../prompts');

/** Tên hiển thị trong Admin → Prompt AI */
const DISPLAY_NAMES = {
	'n5-basic': {
		vocabulary: 'N5 — Từ vựng cơ bản',
		kanji: 'N5 — Kanji cơ bản',
		grammar: 'N5 — Ngữ pháp cơ bản',
		reading: 'N5 — Đọc hiểu cơ bản',
		listening: 'N5 — Nghe hiểu cơ bản',
		kaiwa: 'N5 — Bối cảnh Kaiwa cơ bản',
	},
	'n3-daily': { vocabulary: 'N3 — Từ vựng đời sống' },
	'n3-intermediate': { kanji: 'N3 — Kanji trung cấp' },
	'n3-lesson': { grammar: 'N3 — Bài ngữ pháp' },
	'n3-article': { reading: 'N3 — Bài đọc trung cấp' },
	'n3-listening': { listening: 'N3 — Đề nghe trung cấp' },
	'n3-situation': { kaiwa: 'N3 — Bối cảnh hội thoại' },
	'n4-daily': { vocabulary: 'N4 — Từ vựng' },
	'n4-basic': { kanji: 'N4 — Kanji' },
	'n4-lesson': { grammar: 'N4 — Ngữ pháp' },
	'n4-article': { reading: 'N4 — Đọc hiểu' },
	'n4-listening': { listening: 'N4 — Nghe hiểu' },
	'n4-situation': { kaiwa: 'N4 — Bối cảnh Kaiwa' },
	'n2-daily': { vocabulary: 'N2 — Từ vựng' },
	'n2-intermediate': { kanji: 'N2 — Kanji' },
	'n2-lesson': { grammar: 'N2 — Ngữ pháp' },
	'n2-article': { reading: 'N2 — Đọc hiểu' },
	'n2-situation': { kaiwa: 'N2 — Bối cảnh Kaiwa' },
	'n1-daily': { vocabulary: 'N1 — Từ vựng' },
	'n1-situation': { kaiwa: 'N1 — Bối cảnh Kaiwa' },
};

const SEED_TYPES = [
	'vocabulary',
	'kanji',
	'grammar',
	'reading',
	'listening',
	'kaiwa',
];

function parseTemplateMeta(filename) {
	const base = filename.replace(/\.txt$/i, '').toLowerCase();
	const match = base.match(/^(n[1-5])-(.+)$/i);
	if (!match) {
		return { templateKey: base, jlptLevel: undefined, category: undefined };
	}
	return {
		templateKey: base,
		jlptLevel: match[1].toUpperCase(),
		category: match[2],
	};
}

const TYPE_LABELS = {
	vocabulary: 'Từ vựng',
	kanji: 'Kanji',
	grammar: 'Ngữ pháp',
	reading: 'Đọc hiểu',
	listening: 'Nghe hiểu',
	kaiwa: 'Kaiwa',
};

function buildDisplayName(type, templateKey) {
	return (
		DISPLAY_NAMES[templateKey]?.[type] ??
		`${TYPE_LABELS[type] ?? type} — ${templateKey}`
	);
}

function loadPromptFilesForType(type) {
	const dir = path.join(PROMPTS_ROOT, type);
	if (!fs.existsSync(dir)) {
		return [];
	}

	return fs
		.readdirSync(dir)
		.filter((name) => name.endsWith('.txt'))
		.sort()
		.map((filename, index) => {
			const meta = parseTemplateMeta(filename);
			const content = fs.readFileSync(path.join(dir, filename), 'utf-8');
			return {
				type,
				templateKey: meta.templateKey,
				name: buildDisplayName(type, meta.templateKey),
				description: `Mẫu từ prompts/${type}/${filename}`,
				content,
				jlptLevel: meta.jlptLevel,
				category: meta.category,
				isActive: true,
				displayOrder: index + 1,
			};
		});
}

export const seedPrompts = async () => {
	try {
		const records = SEED_TYPES.flatMap((type) => loadPromptFilesForType(type));

		if (records.length === 0) {
			console.log('No prompt template files found under backend/prompts/. Skipping...');
			return;
		}

		let inserted = 0;
		let updated = 0;

		for (const rec of records) {
			const result = await Prompt.findOneAndUpdate(
				{ type: rec.type, templateKey: rec.templateKey },
				{ $set: rec },
				{ upsert: true, new: true, setDefaultsOnInsert: true },
			);
			if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
				inserted += 1;
			} else {
				updated += 1;
			}
		}

		console.log(
			`✓ Prompts seed: ${inserted} mới, ${updated} cập nhật (tổng ${records.length} mẫu / ${SEED_TYPES.length} loại)`,
		);
	} catch (error) {
		console.error('Error seeding prompts:', error);
		throw error;
	}
};

export default seedPrompts;

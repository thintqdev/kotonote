import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Prompt from '../models/Prompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_ROOT = path.join(__dirname, '../../prompts');

const DISPLAY_NAMES = {
	'n5-basic': {
		vocabulary: 'N5 — Từ vựng cơ bản',
		kanji: 'N5 — Kanji cơ bản',
		grammar: 'N5 — Ngữ pháp cơ bản',
		reading: 'N5 — Đọc hiểu cơ bản',
	},
	'n3-daily': { vocabulary: 'N3 — Từ vựng đời sống hàng ngày' },
	'n3-intermediate': { kanji: 'N3 — Kanji trung cấp' },
	'n3-lesson': { grammar: 'N3 — Bài ngữ pháp' },
	'n3-article': { reading: 'N3 — Bài đọc trung cấp' },
};

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
	listening: 'Nghe',
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
				description: `Import từ prompts/${type}/${filename}`,
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
		const types = ['vocabulary', 'kanji', 'grammar', 'reading'];
		const records = types.flatMap((type) => loadPromptFilesForType(type));

		if (records.length === 0) {
			console.log('No prompt template files found under backend/prompts/. Skipping...');
			return;
		}

		let inserted = 0;
		for (const rec of records) {
			const exists = await Prompt.findOne({
				type: rec.type,
				templateKey: rec.templateKey,
			});
			if (exists) {
				continue;
			}
			await Prompt.create(rec);
			inserted += 1;
		}

		if (inserted === 0) {
			console.log('Prompts already up to date. Skipping...');
			return;
		}

		console.log(`✓ Successfully seeded ${inserted} AI prompts`);
	} catch (error) {
		console.error('Error seeding prompts:', error);
		throw error;
	}
};

export default seedPrompts;

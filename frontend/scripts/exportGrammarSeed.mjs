import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
	GRAMMAR_SLUG_ORDER,
	getGrammarDetail,
	getGrammarListMeta,
} from '../src/data/grammarMock.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(
	__dirname,
	'../../backend/src/seeds/grammarSeedData.json',
);

const metaBySlug = Object.fromEntries(
	getGrammarListMeta().map((item) => [item.slug, item]),
);

const seeds = GRAMMAR_SLUG_ORDER.map((slug) => {
	const detail = getGrammarDetail(slug);
	const meta = metaBySlug[slug] || {};
	const { meta: _drop, ...rest } = detail || {};
	return {
		slug,
		displayOrder: GRAMMAR_SLUG_ORDER.indexOf(slug),
		isPublished: true,
		jlpt: detail?.jlpt ?? meta.jlpt,
		pattern: detail?.pattern ?? meta.pattern,
		tagIds: meta.tagIds ?? [],
		teaser: meta.teaser ?? detail?.teaser ?? { ja: '', vi: '' },
		topicRibbon: meta.topicRibbon ?? { ja: '', vi: '' },
		...rest,
	};
});

writeFileSync(outPath, `${JSON.stringify(seeds, null, 2)}\n`, 'utf8');
console.log(`Wrote ${seeds.length} grammar entries to ${outPath}`);

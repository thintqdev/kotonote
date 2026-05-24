/**
 * Markup đoạn văn đề JLPT — soạn bằng plain text, render ra HTML/React.
 *
 * Ví dụ:
 *   田中さんは***先生***です。        → in đậm
 *   田中さんは___先生___です。        → gạch chân
 *   田中さんは*先生*です。            → chỗ trống (ẩn đáp án khi làm bài)
 *   田中さんは_(1)_です。             → chỗ trống đánh số (1)
 *   {漢字|かんじ}                      → furigana
 *   あした ____ ★ ____ ____ 。        → ★問題 (plain text, questionType: star_question)
 */

/** @typedef {'text' | 'bold' | 'underline' | 'highlight' | 'strike' | 'ruby' | 'blank' | 'blankNumbered' | 'sup' | 'sub'} PassageNodeType */

/**
 * @typedef {object} PassageNode
 * @property {PassageNodeType} type
 * @property {string} [value]
 * @property {string} [base]
 * @property {string} [ruby]
 * @property {string} [num]
 */

export const EXAM_PASSAGE_MARKUP_HELP = [
	{ syntax: '***từ***', example: '***先生***', desc: 'In đậm (nhấn mạnh từ vựng / ngữ pháp)' },
	{ syntax: '**từ**', example: '**重要**', desc: 'In đậm (dạng rút gọn)' },
	{ syntax: '___từ___', example: '___先生___', desc: 'Gạch chân' },
	{ syntax: '__từ__', example: '__注意__', desc: 'Gạch chân (dạng rút gọn)' },
	{ syntax: '*từ*', example: '*勉強*', desc: 'Chỗ đục lỗ — ẩn từ khi làm bài, hiện gạch chân' },
	{ syntax: '_(n)_', example: '_(1)_', desc: 'Chỗ trống đánh số (1), (2)…' },
	{ syntax: '[[từ]]', example: '[[正解]]', desc: 'Highlight / đánh dấu nền' },
	{ syntax: '==từ==', example: '==ポイント==', desc: 'Highlight (dạng khác)' },
	{ syntax: '~~từ~~', example: '~~誤り~~', desc: 'Gạch ngang (sai / loại trừ)' },
	{ syntax: '{漢|かん}', example: '{先生|せんせい}', desc: 'Furigana (ruby)' },
	{ syntax: '^chú^', example: '^※1^', desc: 'Chú thích / superscript' },
	{ syntax: '~chú~', example: '~2~', desc: 'Subscript' },
	{ syntax: '（　）', example: '（　）', desc: 'Chỗ trống toàn cỡ (gõ trực tiếp, không cần markup)' },
	{
		syntax: '____ + ★',
		example: 'あした ____ ★ ____ ____ 。',
		desc: '★問題 — gõ trực tiếp ô trống (____) và dấu ★; đặt questionType: star_question (không cần markup đặc biệt)',
	},
];

/**
 * @param {string} source
 * @returns {PassageNode[]}
 */
export function parsePassageMarkup(source) {
	if (!source) return [];
	const nodes = [];
	let i = 0;

	while (i < source.length) {
		const hit = matchMarkupAt(source, i);
		if (!hit) {
			nodes.push({ type: 'text', value: source[i] });
			i += 1;
			continue;
		}
		if (hit.index > i) {
			nodes.push({ type: 'text', value: source.slice(i, hit.index) });
		}
		nodes.push(hit.node);
		i = hit.end;
	}

	return mergeTextNodes(nodes);
}

/**
 * @param {PassageNode[]} nodes
 */
function mergeTextNodes(nodes) {
	const out = [];
	for (const n of nodes) {
		const prev = out[out.length - 1];
		if (n.type === 'text' && prev?.type === 'text') {
			prev.value += n.value ?? '';
		} else {
			out.push({ ...n });
		}
	}
	return out;
}

/**
 * @param {string} source
 * @param {number} i
 */
function matchMarkupAt(source, i) {
	const rules = [
		tryTripleBold,
		tryTripleUnderline,
		tryDoubleBold,
		tryDoubleUnderline,
		tryHighlightBracket,
		tryHighlightEquals,
		tryStrike,
		tryNumberedBlank,
		tryRuby,
		trySup,
		trySub,
		trySingleBlank,
	];

	for (const rule of rules) {
		const hit = rule(source, i);
		if (hit) return hit;
	}
	return null;
}

/** @param {string} s @param {number} i @param {string} open @param {string} close @param {PassageNodeType} type */
function tryDelimited(s, i, open, close, type) {
	if (!s.startsWith(open, i)) return null;
	const end = s.indexOf(close, i + open.length);
	if (end < 0) return null;
	return {
		index: i,
		end: end + close.length,
		node: { type, value: s.slice(i + open.length, end) },
	};
}

function tryTripleBold(s, i) {
	return tryDelimited(s, i, '***', '***', 'bold');
}

function tryTripleUnderline(s, i) {
	return tryDelimited(s, i, '___', '___', 'underline');
}

function tryDoubleBold(s, i) {
	if (s.startsWith('***', i)) return null;
	return tryDelimited(s, i, '**', '**', 'bold');
}

function tryDoubleUnderline(s, i) {
	if (s.startsWith('___', i)) return null;
	return tryDelimited(s, i, '__', '__', 'underline');
}

function tryHighlightBracket(s, i) {
	return tryDelimited(s, i, '[[', ']]', 'highlight');
}

function tryHighlightEquals(s, i) {
	return tryDelimited(s, i, '==', '==', 'highlight');
}

function tryStrike(s, i) {
	return tryDelimited(s, i, '~~', '~~', 'strike');
}

function tryNumberedBlank(s, i) {
	const m = s.slice(i).match(/^_\((\d+)\)_/);
	if (!m) return null;
	return {
		index: i,
		end: i + m[0].length,
		node: { type: 'blankNumbered', num: m[1], value: '' },
	};
}

function tryRuby(s, i) {
	if (s[i] !== '{') return null;
	const end = s.indexOf('}', i + 1);
	if (end < 0) return null;
	const inner = s.slice(i + 1, end);
	const pipe = inner.indexOf('|');
	if (pipe < 0) return null;
	return {
		index: i,
		end: end + 1,
		node: {
			type: 'ruby',
			base: inner.slice(0, pipe),
			ruby: inner.slice(pipe + 1),
		},
	};
}

function trySup(s, i) {
	if (s.startsWith('^', i) && !s.startsWith('^^', i)) {
		return tryDelimited(s, i, '^', '^', 'sup');
	}
	return null;
}

function trySub(s, i) {
	if (s.startsWith('~', i) && !s.startsWith('~~', i)) {
		return tryDelimited(s, i, '~', '~', 'sub');
	}
	return null;
}

function trySingleBlank(s, i) {
	if (s[i] !== '*') return null;
	if (s.startsWith('**', i)) return null;
	const end = s.indexOf('*', i + 1);
	if (end < 0) return null;
	return {
		index: i,
		end: end + 1,
		node: { type: 'blank', value: s.slice(i + 1, end) },
	};
}

/** @param {PassageNode[]} nodes */
export function passageHasMarkup(nodes) {
	return nodes.some((n) => n.type !== 'text');
}

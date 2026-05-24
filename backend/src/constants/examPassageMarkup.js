/**
 * Tài liệu markup đoạn văn đề JLPT (mirror frontend examPassageMarkup.js).
 * Lưu plain text trong DB; client render HTML.
 */
export const EXAM_PASSAGE_MARKUP_HELP = [
	{ syntax: '***từ***', example: '***先生***', desc: 'In đậm' },
	{ syntax: '**từ**', example: '**重要**', desc: 'In đậm (rút gọn)' },
	{ syntax: '___từ___', example: '___先生___', desc: 'Gạch chân' },
	{ syntax: '__từ__', example: '__注意__', desc: 'Gạch chân (rút gọn)' },
	{ syntax: '*từ*', example: '*勉強*', desc: 'Chỗ đục lỗ' },
	{ syntax: '_(n)_', example: '_(1)_', desc: 'Chỗ trống đánh số' },
	{ syntax: '[[từ]]', example: '[[正解]]', desc: 'Highlight' },
	{ syntax: '==từ==', example: '==ポイント==', desc: 'Highlight (alt)' },
	{ syntax: '~~từ~~', example: '~~誤り~~', desc: 'Gạch ngang' },
	{ syntax: '{漢|かん}', example: '{先生|せんせい}', desc: 'Furigana' },
	{ syntax: '^chú^', example: '^※1^', desc: 'Superscript' },
	{ syntax: '~chú~', example: '~2~', desc: 'Subscript' },
];

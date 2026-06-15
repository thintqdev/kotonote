/**
 * Parse CSV (UTF-8), hỗ trợ ô có dấu phẩy/xuống dòng trong ngoặc kép.
 * @param {string} text
 * @returns {{ headers: string[], rows: string[][] }}
 */
export function parseCsv(text) {
	const rows = [];
	let row = [];
	let cell = '';
	let inQuotes = false;
	const s = String(text ?? '').replace(/^\uFEFF/, '');

	for (let i = 0; i < s.length; i += 1) {
		const ch = s[i];
		const next = s[i + 1];

		if (inQuotes) {
			if (ch === '"' && next === '"') {
				cell += '"';
				i += 1;
			} else if (ch === '"') {
				inQuotes = false;
			} else {
				cell += ch;
			}
			continue;
		}

		if (ch === '"') {
			inQuotes = true;
		} else if (ch === ',') {
			row.push(cell);
			cell = '';
		} else if (ch === '\n' || (ch === '\r' && next === '\n')) {
			row.push(cell);
			cell = '';
			if (row.some((c) => c.trim() !== '')) rows.push(row);
			row = [];
			if (ch === '\r') i += 1;
		} else if (ch === '\r') {
			row.push(cell);
			cell = '';
			if (row.some((c) => c.trim() !== '')) rows.push(row);
			row = [];
		} else {
			cell += ch;
		}
	}

	row.push(cell);
	if (row.some((c) => c.trim() !== '')) rows.push(row);

	if (rows.length === 0) {
		return { headers: [], rows: [] };
	}

	const headers = rows[0].map((h) => h.trim());
	const dataRows = rows.slice(1);
	return { headers, rows: dataRows };
}

/**
 * @param {string[]} headers
 * @param {string[]} values
 */
export function csvRowToRecord(headers, values) {
	const record = {};
	headers.forEach((h, i) => {
		if (!h) return;
		record[h] = values[i] ?? '';
	});
	return record;
}

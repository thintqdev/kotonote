import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createAdminGrammar } from '../../services/adminGrammarService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import {
	GRAMMAR_IMPORT_CSV_BULK_SAMPLE_URL,
	parseGrammarImportCsvBulk,
} from '../../utils/grammarImportCsv.js';
import { formToGrammarPayload } from '../../utils/grammarForm.js';
import { grammarToForm } from '../../utils/grammarForm.js';

/**
 * @param {{ open: boolean; onClose: () => void; onDone: () => void }} props
 */
export default function GrammarBulkImportCsvModal({ open, onClose, onDone }) {
	const fileRef = useRef(null);
	const [text, setText] = useState('');
	const [importing, setImporting] = useState(false);

	useEffect(() => {
		if (!open) return;
		setText('');
	}, [open]);

	if (!open) return null;

	const handleFile = async (e) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		try {
			setText(await file.text());
			toast.success(`Đã đọc ${file.name}`);
		} catch {
			toast.error('Không đọc được file');
		}
	};

	const handleImport = async () => {
		const parsed = parseGrammarImportCsvBulk(text);
		if (!parsed.ok) {
			toast.error('CSV không hợp lệ', { description: parsed.error });
			return;
		}

		setImporting(true);
		let ok = 0;
		const fail = [];

		for (const data of parsed.items) {
			try {
				const payload = formToGrammarPayload(grammarToForm(data));
				await createAdminGrammar(payload);
				ok += 1;
			} catch (e) {
				const label = data.pattern || data.slug || '?';
				fail.push(`${label}: ${getApiErrorMessage(e)}`);
			}
		}

		setImporting(false);

		if (ok > 0) {
			toast.success(`Đã tạo ${ok} bài ngữ pháp`);
			onDone();
			onClose();
		}
		if (fail.length) {
			toast.error(`${fail.length} dòng lỗi`, {
				description: fail.slice(0, 3).join(' · '),
			});
		}
		if (parsed.errors?.length) {
			toast.warning('Một số dòng bỏ qua', {
				description: parsed.errors.slice(0, 2).join(' · '),
			});
		}
		if (ok === 0 && fail.length === 0) {
			toast.error('Không tạo được bài nào');
		}
	};

	const preview = text.trim() ? parseGrammarImportCsvBulk(text) : null;
	const previewCount =
		preview?.ok && preview.items ? preview.items.length : 0;

	return (
		<div
			className="admin-grammar-modal-backdrop"
			role="presentation"
			onClick={onClose}
		>
			<div
				className="admin-grammar-modal admin-grammar-modal--wide"
				role="dialog"
				aria-modal="true"
				aria-labelledby="grammar-bulk-import-title"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="admin-grammar-modal-header">
					<h2
						id="grammar-bulk-import-title"
						className="admin-grammar-modal-title"
					>
						Import CSV hàng loạt
					</h2>
					<button
						type="button"
						className="admin-grammar-modal-close"
						onClick={onClose}
						aria-label="Đóng"
					>
						×
					</button>
				</div>
				<div className="admin-grammar-modal-body admin-grammar-import-body">
					<p className="admin-grammar-import-lead">
						Mỗi dòng = một bài mới (gọi API tạo). Cột tối thiểu:{' '}
						<code>slug</code>, <code>jlpt</code>, <code>pattern</code>. Có thể
						thêm <code>teaser_ja</code>, <code>meaning_ja</code>… — xem file mẫu.
					</p>
					<div className="admin-grammar-import-toolbar">
						<input
							ref={fileRef}
							type="file"
							accept=".csv,text/csv"
							className="admin-grammar-import-file"
							onChange={(e) => void handleFile(e)}
						/>
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost"
							onClick={() => fileRef.current?.click()}
						>
							Chọn file .csv
						</button>
						<a
							href={GRAMMAR_IMPORT_CSV_BULK_SAMPLE_URL}
							download="grammar-import-bulk-sample.csv"
							className="admin-grammar-btn admin-grammar-btn--ghost admin-grammar-import-sample-link"
						>
							Tải mẫu bulk
						</a>
					</div>
					{previewCount > 0 ? (
						<p className="admin-grammar-import-preview">
							Sẵn sàng import: <strong>{previewCount}</strong> bài
						</p>
					) : null}
					<label className="admin-grammar-field admin-grammar-import-field">
						<span className="admin-grammar-label">Nội dung CSV</span>
						<textarea
							className="admin-grammar-textarea admin-grammar-textarea--import"
							rows={14}
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="slug,jlpt,pattern,..."
							spellCheck={false}
						/>
					</label>
				</div>
				<div className="admin-grammar-modal-actions admin-grammar-modal-actions--foot">
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={onClose}
						disabled={importing}
					>
						Hủy
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={() => void handleImport()}
						disabled={importing || !text.trim()}
					>
						{importing ? 'Đang tạo…' : 'Tạo các bài'}
					</button>
				</div>
			</div>
		</div>
	);
}

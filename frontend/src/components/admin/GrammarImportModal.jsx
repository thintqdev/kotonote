import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
	GRAMMAR_IMPORT_CSV_SAMPLE_URL,
	parseGrammarImportCsv,
} from '../../utils/grammarImportCsv.js';
import {
	GRAMMAR_IMPORT_SAMPLE_URL,
	parseGrammarImportJson,
} from '../../utils/grammarImportJson.js';
import { grammarToForm } from '../../utils/grammarForm.js';

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   isEdit: boolean;
 *   onApply: (form: ReturnType<import('../../utils/grammarForm.js').emptyGrammarForm>) => void;
 * }} props
 */
export default function GrammarImportModal({ open, onClose, isEdit, onApply }) {
	const fileRef = useRef(null);
	const [mode, setMode] = useState('json');
	const [text, setText] = useState('');

	useEffect(() => {
		if (!open) return;
		setText('');
		setMode('json');
	}, [open]);

	if (!open) return null;

	const accept = mode === 'json' ? '.json,application/json' : '.csv,text/csv';
	const sampleUrl =
		mode === 'json' ? GRAMMAR_IMPORT_SAMPLE_URL : GRAMMAR_IMPORT_CSV_SAMPLE_URL;
	const sampleName =
		mode === 'json' ? 'grammar-import-sample.json' : 'grammar-import-sample.csv';

	const handleFile = async (e) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		try {
			const raw = await file.text();
			setText(raw);
			toast.success(`Đã đọc ${file.name}`);
		} catch {
			toast.error('Không đọc được file');
		}
	};

	const handleApply = () => {
		const result =
			mode === 'json'
				? parseGrammarImportJson(text)
				: parseGrammarImportCsv(text);

		if (!result.ok) {
			toast.error('Import thất bại', { description: result.error });
			return;
		}

		const imported = grammarToForm(result.data);
		onApply(imported);
		toast.success(`Đã nhập ${mode.toUpperCase()} vào form`, {
			description: imported.pattern || imported.slug,
		});
		onClose();
	};

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
				aria-labelledby="grammar-import-title"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="admin-grammar-modal-header">
					<h2 id="grammar-import-title" className="admin-grammar-modal-title">
						Import ngữ pháp
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
					<div className="admin-grammar-import-tabs" role="tablist">
						<button
							type="button"
							role="tab"
							aria-selected={mode === 'json'}
							className={`admin-grammar-import-tab${mode === 'json' ? ' admin-grammar-import-tab--on' : ''}`}
							onClick={() => {
								setMode('json');
								setText('');
							}}
						>
							JSON
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={mode === 'csv'}
							className={`admin-grammar-import-tab${mode === 'csv' ? ' admin-grammar-import-tab--on' : ''}`}
							onClick={() => {
								setMode('csv');
								setText('');
							}}
						>
							CSV
						</button>
					</div>
					<p className="admin-grammar-import-lead">
						{mode === 'json' ? (
							<>
								Một object JSON đầy đủ field. Bài chia thể:{' '}
								<code>compare.sections</code>.
							</>
						) : (
							<>
								Một dòng CSV = một bài. Cột <code>*_ja</code> /{' '}
								<code>*_vi</code> cho nội dung song ngữ;{' '}
								<code>examples_json</code>, <code>practice_json</code>,{' '}
								<code>compare_json</code> là JSON trong ô (hoặc dùng{' '}
								<code>example1_ja</code>…).
							</>
						)}
						{isEdit ? (
							<>
								{' '}
								<strong>Slug giữ nguyên</strong> khi đang sửa.
							</>
						) : null}
					</p>
					<div className="admin-grammar-import-toolbar">
						<input
							ref={fileRef}
							type="file"
							accept={accept}
							className="admin-grammar-import-file"
							onChange={(e) => void handleFile(e)}
						/>
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost"
							onClick={() => fileRef.current?.click()}
						>
							Chọn file .{mode}
						</button>
						<a
							href={sampleUrl}
							download={sampleName}
							className="admin-grammar-btn admin-grammar-btn--ghost admin-grammar-import-sample-link"
						>
							Tải file mẫu
						</a>
					</div>
					<label className="admin-grammar-field admin-grammar-import-field">
						<span className="admin-grammar-label">
							Nội dung {mode.toUpperCase()}
						</span>
						<textarea
							className="admin-grammar-textarea admin-grammar-textarea--import"
							rows={16}
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder={
								mode === 'json'
									? '{ "slug": "...", "pattern": "...", ... }'
									: 'slug,jlpt,pattern,tagIds,...'
							}
							spellCheck={false}
						/>
					</label>
				</div>
				<div className="admin-grammar-modal-actions admin-grammar-modal-actions--foot">
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={onClose}
					>
						Hủy
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={handleApply}
					>
						Áp dụng vào form
					</button>
				</div>
			</div>
		</div>
	);
}

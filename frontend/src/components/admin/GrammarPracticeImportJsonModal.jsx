import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { GRAMMAR_JLPT_LEVELS } from '../../constants/grammarFieldMeta.js';
import { importAdminGrammarPracticeQuestions } from '../../services/adminGrammarPracticeService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import {
	GRAMMAR_PRACTICE_IMPORT_SAMPLE,
	parseGrammarPracticeImportJson,
} from '../../utils/grammarPracticeImportJson.js';

/**
 * @param {{ open: boolean; onClose: () => void; onDone: () => void }} props
 */
export default function GrammarPracticeImportJsonModal({ open, onClose, onDone }) {
	const fileRef = useRef(null);
	const [jlpt, setJlpt] = useState('N5');
	const [isPublished, setIsPublished] = useState(true);
	const [text, setText] = useState('');
	const [importing, setImporting] = useState(false);

	useEffect(() => {
		if (!open) return;
		setText('');
		setJlpt('N5');
		setIsPublished(true);
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;
		const onKey = (e) => {
			if (e.key === 'Escape' && !importing) onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, importing, onClose]);

	if (!open) return null;

	const preview = text.trim() ? parseGrammarPracticeImportJson(text) : null;

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
		const parsed = parseGrammarPracticeImportJson(text);
		if (!parsed.ok) {
			toast.error('JSON không hợp lệ', {
				description: parsed.error,
			});
			return;
		}

		setImporting(true);
		try {
			const data = await importAdminGrammarPracticeQuestions({
				jlpt,
				isPublished,
				items: parsed.items,
			});
			const skipped = data.skipped ?? 0;
			toast.success(`Đã import ${data.inserted ?? parsed.items.length} câu (${jlpt})`, {
				description:
					skipped > 0 ? `Bỏ qua ${skipped} dòng không hợp lệ/trùng` : undefined,
			});
			if (parsed.errors?.length) {
				toast.warning('Một số dòng bỏ qua', {
					description: parsed.errors.slice(0, 2).join(' · '),
				});
			}
			onDone();
			onClose();
		} catch (err) {
			toast.error('Import thất bại', { description: getApiErrorMessage(err) });
		} finally {
			setImporting(false);
		}
	};

	const loadSample = () => {
		setText(GRAMMAR_PRACTICE_IMPORT_SAMPLE);
	};

	return (
		<div
			className="admin-grammar-modal-backdrop"
			role="presentation"
			onClick={() => !importing && onClose()}
		>
			<div
				className="admin-grammar-modal admin-grammar-modal--wide"
				role="dialog"
				aria-modal="true"
				aria-labelledby="gp-import-json-title"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="admin-grammar-modal-header">
					<h2 id="gp-import-json-title" className="admin-grammar-modal-title">
						Import câu hỏi từ JSON
					</h2>
					<button
						type="button"
						className="admin-grammar-modal-close"
						onClick={() => !importing && onClose()}
						disabled={importing}
						aria-label="Đóng"
					>
						×
					</button>
				</div>

				<div className="admin-grammar-modal-body admin-grammar-import-body">
					<p className="admin-grammar-import-lead">
						Dán mảng JSON hoặc object <code>{'{ "questions": [...] }'}</code>. Mỗi
						câu cần <code>promptJa</code>, <code>options</code> (2–4 đáp án),{' '}
						<code>answerIndex</code> (0–3).
					</p>

					<div className="admin-grammar-row-2 admin-grammar-practice-import-row">
						<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
							<label className="admin-grammar-label" htmlFor="gp-import-jlpt">
								Cấp JLPT
							</label>
							<select
								id="gp-import-jlpt"
								className="admin-grammar-select"
								value={jlpt}
								onChange={(e) => setJlpt(e.target.value)}
								disabled={importing}
							>
								{GRAMMAR_JLPT_LEVELS.map((lv) => (
									<option key={lv} value={lv}>
										{lv}
									</option>
								))}
							</select>
						</div>
						<label className="admin-grammar-check admin-grammar-publish-row">
							<input
								type="checkbox"
								checked={isPublished}
								onChange={(e) => setIsPublished(e.target.checked)}
								disabled={importing}
							/>
							<span>Xuất bản ngay sau import</span>
						</label>
					</div>

					<div className="admin-grammar-import-toolbar">
						<input
							ref={fileRef}
							type="file"
							accept=".json,application/json"
							className="admin-grammar-import-file"
							onChange={(e) => void handleFile(e)}
						/>
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost"
							onClick={() => fileRef.current?.click()}
							disabled={importing}
						>
							Chọn file .json
						</button>
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost"
							onClick={loadSample}
							disabled={importing}
						>
							Điền mẫu
						</button>
					</div>

					{preview?.ok ? (
						<p className="admin-grammar-import-preview">
							Sẵn sàng import: <strong>{preview.items.length}</strong> câu →{' '}
							<strong>{jlpt}</strong>
							{preview.errors?.length ? (
								<>
									{' '}
									· bỏ qua {preview.errors.length} dòng
								</>
							) : null}
						</p>
					) : null}

					<label className="admin-grammar-field admin-grammar-import-field">
						<span className="admin-grammar-label">Nội dung JSON</span>
						<textarea
							className="admin-grammar-textarea admin-grammar-textarea--import"
							rows={14}
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder='[ { "promptJa": "...", "options": ["...", "..."], "answerIndex": 0 } ]'
							spellCheck={false}
							disabled={importing}
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
						disabled={importing || !preview?.ok}
						onClick={() => void handleImport()}
					>
						{importing ? 'Đang import…' : 'Import câu hỏi'}
					</button>
				</div>
			</div>
		</div>
	);
}

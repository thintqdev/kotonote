import { useEffect, useState } from 'react';
import {
	EXAM_IMPORT_VERSION,
	EXAM_SECTION_META,
	EXAM_SECTION_ORDER,
	buildExamImportSample,
} from '../../constants/examPaperStructure.js';
import ExamPassageMarkupHelp from '../../components/exam/ExamPassageMarkupHelp.jsx';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import '../../components/exam/ExamPassageText.css';

export default function ExamBulkImportModal({ isOpen, onClose, onImport, jlpt }) {
	const [text, setText] = useState('');
	const [merge, setMerge] = useState(true);
	const [errors, setErrors] = useState([]);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!isOpen) return;
		setText(JSON.stringify(buildExamImportSample(), null, 2));
		setMerge(true);
		setErrors([]);
	}, [isOpen, jlpt]);

	if (!isOpen) return null;

	const handleImport = async () => {
		setErrors([]);
		let parsed;
		try {
			parsed = JSON.parse(text);
		} catch {
			setErrors(['JSON không hợp lệ — kiểm tra dấu ngoặc, dấu phẩy']);
			return;
		}
		if (parsed.version !== EXAM_IMPORT_VERSION) {
			setErrors([`version phải là ${EXAM_IMPORT_VERSION}`]);
			return;
		}
		if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
			setErrors(['Cần mảng sections với ít nhất 1 phần']);
			return;
		}

		setSubmitting(true);
		try {
			await onImport({ ...parsed, merge });
			onClose();
		} catch (err) {
			const msg = getApiErrorMessage(err);
			const apiErrors = err?.response?.data?.errors;
			if (Array.isArray(apiErrors) && apiErrors.length) {
				setErrors(apiErrors.map((e) => e.message || String(e)));
			} else {
				setErrors([msg]);
			}
		} finally {
			setSubmitting(false);
		}
	};

	const downloadSample = () => {
		const blob = new Blob([JSON.stringify(buildExamImportSample(), null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `exam-bulk-import-v${EXAM_IMPORT_VERSION}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div
			className="admin-grammar-modal-backdrop exam-modal-backdrop exam-modal-backdrop--center"
			onClick={onClose}
			role="presentation"
		>
			<div
				className="admin-grammar-modal exam-bulk-import-modal"
				onClick={(ev) => ev.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="exam-bulk-import-title"
			>
				<header className="exam-modal-header">
					<div className="exam-modal-header-text">
						<p className="exam-modal-eyebrow">Import toàn đề</p>
						<h2 id="exam-bulk-import-title" className="exam-modal-title">
							Nhiều phần / nhiều loại cùng lúc
						</h2>
						<p className="exam-modal-lead">
							Dán JSON chứa nhiều <code>sections</code> — từ vựng, ngữ pháp, đọc,
							nghe trong một file.
						</p>
					</div>
					<button
						type="button"
						className="exam-modal-close"
						onClick={onClose}
						aria-label="Đóng"
					>
						×
					</button>
				</header>

				<div className="exam-bulk-import-layout">
					<aside className="exam-bulk-import-aside">
						<h3 className="exam-aside-title">Các khối hỗ trợ</h3>
						<ul className="exam-aside-part-list">
							{EXAM_SECTION_ORDER.map((sectionKey) => {
								const sectionMeta = EXAM_SECTION_META[sectionKey];
								return (
									<li key={sectionKey} className="exam-aside-section">
										<strong>{sectionMeta.titleVi}</strong>
										<span className="exam-aside-section-ja" lang="ja">
											{sectionMeta.titleJa}
										</span>
									</li>
								);
							})}
						</ul>
						<p className="exam-aside-note">
							Mỗi phần cần <code>sectionType</code> + <code>partType</code> đúng
							cấu trúc JLPT. Trường <code>passageJa</code>, <code>questionJa</code>,{' '}
							<code>choices</code>, <code>explainVi</code> hỗ trợ cú pháp định dạng
							(bold, gạch chân, chỗ trống…).
						</p>
						<ExamPassageMarkupHelp />
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost exam-aside-download"
							onClick={downloadSample}
						>
							Tải mẫu JSON
						</button>
					</aside>

					<div className="exam-bulk-import-main">
						<label className="exam-import-merge">
							<input
								type="checkbox"
								checked={merge}
								onChange={(e) => setMerge(e.target.checked)}
							/>
							<span>Gộp vào khung {jlpt} — giữ part chưa có trong file</span>
						</label>
						<textarea
							className="exam-import-code"
							value={text}
							onChange={(e) => setText(e.target.value)}
							spellCheck={false}
							aria-label="JSON import toàn đề"
						/>
						{errors.length > 0 ? (
							<ul className="exam-import-errors">
								{errors.map((err) => (
									<li key={err}>{err}</li>
								))}
							</ul>
						) : null}
					</div>
				</div>

				<footer className="exam-modal-footer">
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--muted"
						onClick={onClose}
						disabled={submitting}
					>
						Hủy
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={() => void handleImport()}
						disabled={submitting}
					>
						{submitting ? 'Đang import…' : 'Import toàn đề'}
					</button>
				</footer>
			</div>
		</div>
	);
}

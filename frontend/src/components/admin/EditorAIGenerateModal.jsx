import { useEffect, useId, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { listAdminPrompts } from '../../services/adminPromptService.js';
import { getAxiosErrorMessage } from '../../utils/apiErrorMessage.js';
import '../../pages/admin/AdminQuotesPage.css';

/**
 * Modal generate AI cho editor bài đơn (ngữ pháp, đọc hiểu).
 * Dùng admin-quote-modal* — cùng style modal admin (Prompt, Quote…).
 */
export default function EditorAIGenerateModal({
	open,
	onClose,
	config,
	levelKey,
	contextHint,
	onApply,
}) {
	const baseId = useId();
	const [promptOptions, setPromptOptions] = useState([]);
	const [promptsLoading, setPromptsLoading] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState('n5-basic');
	const [generateHint, setGenerateHint] = useState('');
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!open) return undefined;
		setSelectedTemplate(config.defaultTemplate(levelKey));
		setGenerateHint('');

		const onKey = (e) => {
			if (e.key === 'Escape' && !busy) onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, config, levelKey, busy, onClose]);

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		const load = async () => {
			setPromptsLoading(true);
			try {
				const data = await listAdminPrompts({
					type: config.promptType,
					isActive: true,
				});
				if (cancelled) return;
				const list = (data.prompts ?? []).sort(
					(a, b) =>
						(Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0),
				);
				setPromptOptions(list);
				const preferred = config.defaultTemplate(levelKey);
				if (list.some((p) => p.templateKey === preferred)) {
					setSelectedTemplate(preferred);
				} else if (list[0]?.templateKey) {
					setSelectedTemplate(list[0].templateKey);
				}
			} catch (e) {
				if (!cancelled) {
					toast.error('Không tải được danh sách prompt', {
						description: getAxiosErrorMessage(e),
					});
				}
			} finally {
				if (!cancelled) setPromptsLoading(false);
			}
		};
		void load();
		return () => {
			cancelled = true;
		};
	}, [open, config, levelKey]);

	const runGenerate = async () => {
		setBusy(true);
		try {
			const result = await config.generate({
				templateName: selectedTemplate,
				prompt: generateHint.trim(),
				jlpt: levelKey,
				patternHint: contextHint?.trim() ?? '',
			});
			const item = result.item ?? null;
			const resultSource = result.source ?? '';
			if (!item) {
				toast.error('AI không trả về nội dung');
				return;
			}
			onApply(item);
			const srcLabel =
				resultSource === 'gemini'
					? 'Gemini AI'
					: 'Placeholder (chưa cấu hình GEMINI_API_KEYS)';
			toast.success('Đã điền vào form', {
				description: `${srcLabel} · Kiểm tra và chỉnh sửa trước khi lưu.`,
			});
			onClose();
		} catch (err) {
			toast.error('Generate thất bại', {
				description: getAxiosErrorMessage(err),
			});
		} finally {
			setBusy(false);
		}
	};

	if (!open) return null;

	return (
		<div
			className="admin-quote-modal-backdrop"
			role="presentation"
			onClick={() => !busy && onClose()}
		>
			<div
				className="admin-quote-modal admin-quote-modal--wide admin-ai-generate-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${baseId}-gen-title`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="admin-quote-modal-header">
					<h2 id={`${baseId}-gen-title`} className="admin-quote-modal-title">
						{config.modalTitle}
					</h2>
					<button
						type="button"
						className="admin-quote-modal-close"
						aria-label="Đóng"
						disabled={busy}
						onClick={onClose}
					>
						×
					</button>
				</div>

				<div className="admin-quote-modal-body">
					<p className="admin-ai-generate-lead">
						Chọn mẫu từ <Link to="/admin/prompts">Prompt AI</Link>. Sau khi
						generate, nội dung tự điền vào form (giống Kaiwa) — bạn vẫn cần
						lưu bài.
					</p>

					<div className="admin-ai-generate-form">
						<div className="admin-quote-field">
							<label
								className="admin-quote-label"
								htmlFor={`${baseId}-gen-template`}
							>
								Mẫu prompt
							</label>
							<select
								id={`${baseId}-gen-template`}
								className="admin-quote-select"
								value={selectedTemplate}
								onChange={(e) => setSelectedTemplate(e.target.value)}
								disabled={busy || promptsLoading}
							>
								{promptOptions.length === 0 ? (
									<option value={selectedTemplate}>
										{promptsLoading ? 'Đang tải…' : selectedTemplate}
									</option>
								) : (
									promptOptions.map((p) => (
										<option key={p._id} value={p.templateKey}>
											{p.name} ({p.templateKey})
										</option>
									))
								)}
							</select>
						</div>
						<div className="admin-quote-field admin-ai-generate-field--full">
							<label
								className="admin-quote-label"
								htmlFor={`${baseId}-gen-hint`}
							>
								Ghi chú / chủ đề (tùy chọn)
							</label>
							<input
								id={`${baseId}-gen-hint`}
								className="admin-quote-input"
								type="text"
								value={generateHint}
								onChange={(e) => setGenerateHint(e.target.value)}
								placeholder="vd: chủ đề du lịch, mẫu 〜によると…"
								disabled={busy}
							/>
						</div>
					</div>

					<div className="admin-quote-modal-actions">
						<button
							type="button"
							className="admin-quote-btn admin-quote-btn--muted"
							disabled={busy}
							onClick={onClose}
						>
							Hủy
						</button>
						<button
							type="button"
							className="admin-quote-btn admin-quote-btn--primary"
							disabled={busy}
							onClick={() => void runGenerate()}
						>
							{busy ? 'Đang generate…' : 'Generate & điền form'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

EditorAIGenerateModal.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	config: PropTypes.shape({
		promptType: PropTypes.string.isRequired,
		modalTitle: PropTypes.string.isRequired,
		defaultTemplate: PropTypes.func.isRequired,
		generate: PropTypes.func.isRequired,
		previewLines: PropTypes.func.isRequired,
	}).isRequired,
	levelKey: PropTypes.string,
	contextHint: PropTypes.string,
	onApply: PropTypes.func.isRequired,
};

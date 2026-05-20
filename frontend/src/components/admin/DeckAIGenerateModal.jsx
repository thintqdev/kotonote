import { useEffect, useId, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { listAdminPrompts } from "../../services/adminPromptService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";

/**
 * Modal generate AI dùng chung cho deck từ vựng / kanji.
 */
export default function DeckAIGenerateModal({
	open,
	onClose,
	config,
	deckId,
	slotsLeft,
	levelKey,
	onApplied,
}) {
	const baseId = useId();
	const [promptOptions, setPromptOptions] = useState([]);
	const [promptsLoading, setPromptsLoading] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState("n5-basic");
	const [generateCount, setGenerateCount] = useState(10);
	const [generateHint, setGenerateHint] = useState("");
	const [busy, setBusy] = useState(false);
	const [preview, setPreview] = useState([]);
	const [source, setSource] = useState("");

	useEffect(() => {
		if (!open) return undefined;
		const preferred = config.defaultTemplate(levelKey);
		setSelectedTemplate(preferred);
		setGenerateCount(Math.min(10, slotsLeft || 10));
		setGenerateHint("");
		setPreview([]);
		setSource("");

		const onKey = (e) => {
			if (e.key === "Escape" && !busy) onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, config, levelKey, slotsLeft, busy, onClose]);

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
					toast.error("Không tải được danh sách prompt", {
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
		if (!deckId) {
			toast.error("Chưa thể generate", {
				description: "Lưu deck trước, rồi quay lại trang này.",
			});
			return;
		}
		if (slotsLeft <= 0) {
			toast.error(`Deck đã đủ ${config.maxPerDeck} ${config.unitLabel}`);
			return;
		}
		const count = Math.min(Math.max(1, Number(generateCount) || 1), slotsLeft);
		setBusy(true);
		try {
			const result = await config.generate({
				deckId,
				templateName: selectedTemplate,
				prompt: generateHint.trim(),
				count,
				autoCreate: false,
			});
			const items = result.items ?? [];
			setPreview(items);
			setSource(result.source ?? "");
			const srcLabel =
				result.source === "gemini"
					? "Gemini AI"
					: "Placeholder (chưa có GEMINI_API_KEY)";
			toast.success(`Đã generate ${items.length} ${config.unitLabel}`, {
				description: `Nguồn: ${srcLabel}`,
			});
		} catch (err) {
			toast.error("Generate thất bại", {
				description: getAxiosErrorMessage(err),
			});
		} finally {
			setBusy(false);
		}
	};

	const applyToDeck = async () => {
		if (!deckId || preview.length === 0) return;
		setBusy(true);
		try {
			const { created } = await config.importToDeck(deckId, preview);
			toast.success("Đã thêm vào deck", {
				description: `${created} ${config.unitLabel} mới.`,
			});
			onClose();
			await Promise.resolve(onApplied?.());
		} catch (err) {
			toast.error("Không thêm được vào deck", {
				description: getAxiosErrorMessage(err),
			});
		} finally {
			setBusy(false);
		}
	};

	if (!open) return null;

	return (
		<div
			className="vdeck-modal-backdrop"
			role="presentation"
			onClick={() => !busy && onClose()}
		>
			<div
				className="vdeck-modal vdeck-modal--wide"
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${baseId}-gen-title`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="vdeck-modal-header">
					<h2 id={`${baseId}-gen-title`} className="vdeck-modal-title">
						{config.modalTitle}
					</h2>
					<button
						type="button"
						className="vdeck-modal-close"
						aria-label="Đóng"
						disabled={busy}
						onClick={onClose}
					>
						×
					</button>
				</div>
				<p className="vdeck-modal-lead">
					Chọn mẫu prompt từ <Link to="/admin/prompts">Prompt AI</Link>. Còn
					thêm được <strong>{slotsLeft}</strong> {config.unitLabel} (tối đa{" "}
					{config.maxPerDeck}/deck).
				</p>

				<div className="vdeck-generate-form">
					<div className="vdeck-field">
						<label className="vdeck-label" htmlFor={`${baseId}-gen-template`}>
							Mẫu prompt
						</label>
						<select
							id={`${baseId}-gen-template`}
							className="vdeck-select"
							value={selectedTemplate}
							onChange={(e) => setSelectedTemplate(e.target.value)}
							disabled={busy || promptsLoading}
						>
							{promptOptions.length === 0 ? (
								<option value={selectedTemplate}>
									{promptsLoading ? "Đang tải…" : selectedTemplate}
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
					<div className="vdeck-field">
						<label className="vdeck-label" htmlFor={`${baseId}-gen-count`}>
							Số {config.unitLabel}
						</label>
						<input
							id={`${baseId}-gen-count`}
							className="vdeck-input"
							type="number"
							min={1}
							max={slotsLeft}
							value={generateCount}
							onChange={(e) =>
								setGenerateCount(
									Math.min(slotsLeft, Math.max(1, Number(e.target.value) || 1)),
								)
							}
							disabled={busy}
						/>
					</div>
					<div className="vdeck-field vdeck-field--full">
						<label className="vdeck-label" htmlFor={`${baseId}-gen-hint`}>
							Ghi chú thêm (tùy chọn)
						</label>
						<input
							id={`${baseId}-gen-hint`}
							className="vdeck-input"
							type="text"
							value={generateHint}
							onChange={(e) => setGenerateHint(e.target.value)}
							placeholder="vd: chủ đề du lịch, tránh trùng…"
							disabled={busy}
						/>
					</div>
				</div>

				{source ? (
					<p className="vdeck-generate-source">
						Nguồn:{" "}
						<span
							className={`vdeck-generate-chip${source === "gemini" ? " vdeck-generate-chip--ok" : ""}`}
						>
							{source === "gemini" ? "Gemini" : "Placeholder"}
						</span>
					</p>
				) : null}

				{preview.length > 0 ? (
					<div className="vdeck-generate-preview">
						<p className="vdeck-label">
							Xem trước ({preview.length})
						</p>
						<div className="vdeck-table-wrap">
							<table className="vdeck-table vdeck-table--dense">
								<thead>
									<tr>
										{config.previewColumns.map((col) => (
											<th key={col.key}>{col.label}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{preview.map((item, i) => (
										<tr key={`${item[config.previewColumns[0]?.key] ?? i}-${i}`}>
											{config.previewColumns.map((col) => (
												<td key={col.key} lang={col.lang}>
													{item[col.key]}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : null}

				<div className="vdeck-modal-actions">
					<button
						type="button"
						className="vdeck-btn vdeck-btn--muted"
						disabled={busy}
						onClick={onClose}
					>
						Hủy
					</button>
					<button
						type="button"
						className="vdeck-btn vdeck-btn--ghost"
						disabled={busy || preview.length === 0}
						onClick={() => void runGenerate()}
					>
						Generate lại
					</button>
					<button
						type="button"
						className="vdeck-btn vdeck-btn--primary"
						disabled={busy}
						onClick={() =>
							preview.length > 0 ? void applyToDeck() : void runGenerate()
						}
					>
						{busy
							? "Đang xử lý…"
							: preview.length > 0
								? "Thêm vào deck"
								: "Generate"}
					</button>
				</div>
			</div>
		</div>
	);
}

DeckAIGenerateModal.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	config: PropTypes.shape({
		promptType: PropTypes.string.isRequired,
		modalTitle: PropTypes.string.isRequired,
		unitLabel: PropTypes.string.isRequired,
		maxPerDeck: PropTypes.number.isRequired,
		defaultTemplate: PropTypes.func.isRequired,
		generate: PropTypes.func.isRequired,
		importToDeck: PropTypes.func.isRequired,
		previewColumns: PropTypes.arrayOf(
			PropTypes.shape({
				key: PropTypes.string.isRequired,
				label: PropTypes.string.isRequired,
				lang: PropTypes.string,
			}),
		).isRequired,
	}).isRequired,
	deckId: PropTypes.string,
	slotsLeft: PropTypes.number.isRequired,
	levelKey: PropTypes.string,
	onApplied: PropTypes.func,
};

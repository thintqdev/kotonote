import { useEffect, useId, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { listAdminPrompts } from "../../services/adminPromptService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";

/**
 * Modal generate AI cho deck từ vựng / kanji — tự điền form sau generate (giống Kaiwa).
 */
export default function DeckAIGenerateModal({
	open,
	onClose,
	config,
	deckId,
	slotsLeft,
	levelKey,
	deckHint,
	onApply,
}) {
	const baseId = useId();
	const [promptOptions, setPromptOptions] = useState([]);
	const [promptsLoading, setPromptsLoading] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState("n5-basic");
	const [generateCount, setGenerateCount] = useState(10);
	const [generateHint, setGenerateHint] = useState("");
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!open) return undefined;
		const preferred = config.defaultTemplate(levelKey);
		setSelectedTemplate(preferred);
		setGenerateCount(Math.min(10, slotsLeft || 10));
		setGenerateHint(String(deckHint ?? "").trim());
		const onKey = (e) => {
			if (e.key === "Escape" && !busy) onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, config, levelKey, slotsLeft, deckHint, busy, onClose]);

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
		if (slotsLeft <= 0) {
			toast.error(`Deck đã đủ ${config.maxPerDeck} ${config.unitLabel}`);
			return;
		}
		const count = Math.min(Math.max(1, Number(generateCount) || 1), slotsLeft);
		const hint = generateHint.trim() || String(deckHint ?? "").trim();
		setBusy(true);
		try {
			const result = await config.generate({
				deckId,
				templateName: selectedTemplate,
				prompt: hint,
				count,
				autoCreate: false,
			});
			const items = result.items ?? [];
			if (items.length === 0) {
				toast.error("AI không trả về mục nào");
				return;
			}
			onApply({
				items,
				deck: result.deck ?? null,
				source: result.source ?? "",
			});
			const srcLabel =
				result.source === "gemini"
					? "Gemini AI"
					: "Placeholder (chưa cấu hình GEMINI_API_KEYS)";
			toast.success("Đã điền vào form", {
				description: `${items.length} ${config.unitLabel} · ${srcLabel}`,
			});
			onClose();
		} catch (err) {
			toast.error("Generate thất bại", {
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
					Chọn mẫu từ <Link to="/admin/prompts">Prompt AI</Link>. Sau khi
					generate, tên deck và danh sách {config.unitLabel} tự điền vào form
					(giống Kaiwa) — bạn vẫn cần bấm lưu deck.
					{!deckId ? (
						<>
							{" "}
							Có thể generate ngay cả khi chưa lưu deck lần đầu.
						</>
					) : null}{" "}
					Còn thêm được <strong>{slotsLeft}</strong> {config.unitLabel} (tối đa{" "}
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
							Chủ đề / gợi ý deck (tùy chọn)
						</label>
						<input
							id={`${baseId}-gen-hint`}
							className="vdeck-input"
							type="text"
							value={generateHint}
							onChange={(e) => setGenerateHint(e.target.value)}
							placeholder="vd: đồ ăn, du lịch, JLPT N5 số đếm…"
							disabled={busy}
						/>
					</div>
				</div>

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
						className="vdeck-btn vdeck-btn--primary"
						disabled={busy}
						onClick={() => void runGenerate()}
					>
						{busy ? "Đang generate…" : "Generate & điền form"}
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
		previewColumns: PropTypes.array,
	}).isRequired,
	deckId: PropTypes.string,
	slotsLeft: PropTypes.number.isRequired,
	levelKey: PropTypes.string,
	deckHint: PropTypes.string,
	onApply: PropTypes.func.isRequired,
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
	EXAM_IMPORT_VERSION,
	EXAM_PART_META as FALLBACK_PART_META,
	EXAM_SECTION_META as FALLBACK_SECTION_META,
	EXAM_SECTION_ORDER,
	buildExamImportSample,
	countSectionQuestions,
	filterSectionsByType,
} from '../../constants/examPaperStructure.js';
import { examSessionLabel } from '../../constants/examPaperFieldMeta.js';
import ExamBulkImportModal from './ExamBulkImportModal.jsx';
import ExamEditorSortableParts from './ExamEditorSortableParts.jsx';
import ExamListeningSectionAudio from './ExamListeningSectionAudio.jsx';
import ExamPartEditModal from './ExamPartEditModal.jsx';
import ExamPassageMarkupHelp from '../../components/exam/ExamPassageMarkupHelp.jsx';
import {
	getAdminExamPaper,
	getExamSectionsTemplate,
	importAdminExamPaperSections,
	initAdminExamPaperSections,
	updateAdminExamPaperSections,
} from '../../services/adminExamPaperService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import { reorderExamPartsInSection } from '../../utils/reorderExamParts.js';
import { resolveListeningAudioUrl } from '../../utils/examListeningHelpers.js';
import './AdminGrammarPage.css';
import './AdminExamPaperEditorPage.css';
import '../../components/exam/ExamPassageText.css';

export default function AdminExamPaperEditorPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [paper, setPaper] = useState(null);
	const [structureMeta, setStructureMeta] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeSection, setActiveSection] = useState('vocabulary');
	const [showBulkImport, setShowBulkImport] = useState(false);
	const [editingPart, setEditingPart] = useState(null);
	const [resetting, setResetting] = useState(false);
	const [reordering, setReordering] = useState(false);

	const loadPaper = useCallback(async () => {
		setLoading(true);
		try {
			const { paper: loaded, structureMeta: meta } = await getAdminExamPaper(id);
			setPaper(loaded);
			setStructureMeta(meta);
		} catch (e) {
			toast.error('Không tải được đề thi', {
				description: getApiErrorMessage(e),
			});
			navigate('/admin/exam-papers', { replace: true });
		} finally {
			setLoading(false);
		}
	}, [id, navigate]);

	useEffect(() => {
		void loadPaper();
	}, [loadPaper]);

	const sectionMeta = structureMeta?.sectionMeta ?? FALLBACK_SECTION_META;
	const partMeta = structureMeta?.partMeta ?? FALLBACK_PART_META;
	const sectionOrder = structureMeta?.sectionOrder ?? EXAM_SECTION_ORDER;

	const sectionsForTab = useMemo(
		() => filterSectionsByType(paper?.sections, activeSection),
		[paper?.sections, activeSection],
	);

	const blueprintPartCount = structureMeta?.enabledPartTypes?.length ?? paper?.sections?.length ?? 0;

	const totalQuestions = useMemo(() => {
		return (paper?.sections ?? []).reduce(
			(sum, s) => sum + countSectionQuestions(s),
			0,
		);
	}, [paper?.sections]);

	const handleBulkImport = async (payload) => {
		const updated = await importAdminExamPaperSections(id, payload);
		setPaper(updated);
		toast.success('Import toàn đề thành công');
	};

	const handleSaveSections = async (sections) => {
		const updated = await updateAdminExamPaperSections(id, sections);
		setPaper(updated);
		return updated;
	};

	const handleReorderParts = async (fromIndex, toIndex) => {
		if (!paper?.sections?.length) return;
		const next = reorderExamPartsInSection(
			paper.sections,
			activeSection,
			fromIndex,
			toIndex,
		);
		setReordering(true);
		try {
			const updated = await updateAdminExamPaperSections(id, next);
			setPaper(updated);
			toast.success('Đã đổi thứ tự part');
		} catch (e) {
			toast.error('Không lưu được thứ tự', { description: getApiErrorMessage(e) });
		} finally {
			setReordering(false);
		}
	};

	const handleDownloadSample = () => {
		const blob = new Blob([JSON.stringify(buildExamImportSample(), null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `exam-import-sample-v${EXAM_IMPORT_VERSION}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleDownloadTemplate = async () => {
		try {
			const template = await getExamSectionsTemplate(paper.jlpt);
			const payload = {
				version: EXAM_IMPORT_VERSION,
				merge: false,
				sections: (template?.sections ?? []).map((s) => ({
					...s,
					questions: [],
				})),
			};
			const blob = new Blob([JSON.stringify(payload, null, 2)], {
				type: 'application/json',
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `exam-frame-${paper.jlpt}-v${EXAM_IMPORT_VERSION}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			toast.error('Không tải được khung mẫu', { description: getApiErrorMessage(e) });
		}
	};

	const handleResetFrame = async () => {
		if (
			!window.confirm(
				'Reset khung đề theo cấu trúc JLPT? Toàn bộ câu hỏi hiện tại sẽ bị xóa.',
			)
		) {
			return;
		}
		setResetting(true);
		try {
			const updated = await initAdminExamPaperSections(id);
			setPaper(updated);
			toast.success('Đã tạo lại khung đề từ blueprint DB');
			await loadPaper();
		} catch (e) {
			toast.error('Không reset được', { description: getApiErrorMessage(e) });
		} finally {
			setResetting(false);
		}
	};

	if (loading) {
		return <p className="admin-grammar-status">Đang tải đề thi…</p>;
	}

	if (!paper) return null;

	return (
		<div className="admin-stub-main admin-grammar-page exam-editor-page">
			<Link to="/admin/exam-papers" className="exam-editor-back">
				← Danh sách đề thi
			</Link>

			<div className="exam-editor-head">
				<div className="exam-editor-head-main">
					<h1>{paper.titleVi}</h1>
					<p className="exam-editor-meta">
						{paper.jlpt} · {paper.year} · {examSessionLabel(paper.session)} ·{' '}
						{totalQuestions} câu · {blueprintPartCount} part (khung DB)
					</p>
					{structureMeta?.name ? (
						<p className="exam-editor-meta exam-editor-blueprint-meta">
							Khung: <strong>{structureMeta.name}</strong>
							{structureMeta.version ? ` · v${structureMeta.version}` : ''}
							{' · '}
							<Link to="/admin/exam-structures" className="exam-editor-blueprint-link">
								Tuỳ chỉnh khung
							</Link>
						</p>
					) : null}
					{paper.titleJa ? (
						<p className="exam-editor-meta" lang="ja">
							{paper.titleJa}
						</p>
					) : null}
				</div>
				<div className="exam-editor-actions">
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() => void handleDownloadTemplate()}
					>
						Tải khung {paper.jlpt}
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={handleDownloadSample}
					>
						Mẫu JSON
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={() => setShowBulkImport(true)}
					>
						Import toàn đề
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() => void handleResetFrame()}
						disabled={resetting}
					>
						{resetting ? 'Đang reset…' : 'Reset khung'}
					</button>
				</div>
			</div>

			<p className="exam-editor-hint">
				Danh sách part lấy từ <strong>khung cấu trúc DB</strong> (JLPT {paper.jlpt}) — nội
				dung câu hỏi giữ từ đề đã lưu.{' '}
				<strong>Import toàn đề</strong> — nhiều phần cùng lúc.{' '}
				<strong>Soạn từng part</strong> — nhập tay hoặc import JSON riêng.{' '}
				<strong>Kéo ⠿</strong> để đổi thứ tự trong khối. Đoạn văn / câu hỏi / lựa chọn
				dùng cú pháp <code>***đậm***</code>, <code>*trống*</code>, <code>{'{漢|かん}'}</code>…
			</p>
			<ExamPassageMarkupHelp />

			<div className="exam-editor-tabs" role="tablist">
				{sectionOrder.map((key) => {
					const meta = sectionMeta[key] ?? {};
					const count = filterSectionsByType(paper.sections, key).reduce(
						(n, s) => n + countSectionQuestions(s),
						0,
					);
					return (
						<button
							key={key}
							type="button"
							role="tab"
							className={`exam-editor-tab${activeSection === key ? ' exam-editor-tab--active' : ''}`}
							onClick={() => setActiveSection(key)}
						>
							{meta.titleVi} ({count})
						</button>
					);
				})}
			</div>

			{activeSection === 'listening' ? (
				<ExamListeningSectionAudio
					paperId={id}
					audioUrl={resolveListeningAudioUrl(paper)}
					onSaved={(url) =>
						setPaper((prev) => (prev ? { ...prev, listeningAudioUrl: url } : prev))
					}
				/>
			) : null}

			{sectionsForTab.length === 0 ? (
				<p className="admin-grammar-status">Không có phần nào trong khối này.</p>
			) : (
				<ExamEditorSortableParts
					parts={sectionsForTab}
					partMeta={partMeta}
					onReorder={(from, to) => void handleReorderParts(from, to)}
					onEdit={setEditingPart}
					reordering={reordering}
				/>
			)}
			<ExamPartEditModal
				isOpen={Boolean(editingPart)}
				onClose={() => setEditingPart(null)}
				sections={paper.sections ?? []}
				sectionType={editingPart?.sectionType ?? ''}
				partType={editingPart?.partType ?? ''}
				partMetaMap={partMeta}
				sectionMetaMap={sectionMeta}
				onSave={handleSaveSections}
			/>
			<ExamBulkImportModal
				isOpen={showBulkImport}
				onClose={() => setShowBulkImport(false)}
				onImport={handleBulkImport}
				jlpt={paper.jlpt}
			/>
		</div>
	);
}

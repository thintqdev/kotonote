import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { GRAMMAR_JLPT_LEVELS } from '../../constants/grammarFieldMeta.js';
import {
	deleteAdminGrammarPracticeQuestion,
	generateAdminGrammarPracticeQuestions,
	getAdminGrammarPracticeQuestion,
	listAdminGrammarPracticeQuestions,
	updateAdminGrammarPracticeQuestion,
} from '../../services/adminGrammarPracticeService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import GrammarPracticeImportJsonModal from '../../components/admin/GrammarPracticeImportJsonModal.jsx';
import './AdminGrammarPage.css';

const COUNT_PRESETS = [5, 10, 15, 20, 25];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const TYPE_LABELS = {
	grammar_form: 'Ngữ pháp',
	particle: 'Trợ từ',
	conjugation: 'Chia động từ',
	usage: 'Cách dùng',
};

function truncateText(text, max = 72) {
	const s = String(text ?? '').trim();
	if (s.length <= max) return s;
	return `${s.slice(0, max)}…`;
}

export default function AdminGrammarPracticePage() {
	const [jlpt, setJlpt] = useState('');
	const [published, setPublished] = useState('all');
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [items, setItems] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const [generateOpen, setGenerateOpen] = useState(false);
	const [importOpen, setImportOpen] = useState(false);
	const [genJlpt, setGenJlpt] = useState('N5');
	const [genCount, setGenCount] = useState(10);
	const [genPublish, setGenPublish] = useState(true);
	const [generating, setGenerating] = useState(false);

	const [detailId, setDetailId] = useState('');
	const [detail, setDetail] = useState(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [togglingId, setTogglingId] = useState('');
	const [deletingId, setDeletingId] = useState('');

	const queryParams = useMemo(() => {
		const p = { page, limit: pageSize };
		if (jlpt) p.jlpt = jlpt;
		if (published === 'true') p.isPublished = 'true';
		if (published === 'false') p.isPublished = 'false';
		return p;
	}, [jlpt, published, page, pageSize]);

	const fetchList = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const data = await listAdminGrammarPracticeQuestions(queryParams);
			setItems(data.items ?? []);
			setPagination(data.pagination);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			setError(msg);
			toast.error('Không tải được danh sách câu hỏi', { description: msg });
		} finally {
			setLoading(false);
		}
	}, [queryParams]);

	useEffect(() => {
		void fetchList();
	}, [fetchList]);

	useEffect(() => {
		if (loading || error || !pagination) return;
		if (pagination.total > 0 && items.length === 0 && page > 1) {
			setPage(1);
		}
	}, [loading, error, pagination, items.length, page]);

	const pageRange = useMemo(() => {
		if (!pagination?.total) return null;
		const start = (pagination.page - 1) * pagination.limit + 1;
		const end = Math.min(pagination.page * pagination.limit, pagination.total);
		return { start, end, total: pagination.total };
	}, [pagination]);

	const openDetail = useCallback(async (id) => {
		setDetailId(id);
		setDetail(null);
		setDetailLoading(true);
		try {
			const question = await getAdminGrammarPracticeQuestion(id);
			setDetail(question);
		} catch (e) {
			toast.error('Không mở được chi tiết câu', { description: getApiErrorMessage(e) });
			setDetailId('');
		} finally {
			setDetailLoading(false);
		}
	}, []);

	const closeDetail = useCallback(() => {
		setDetailId('');
		setDetail(null);
	}, []);

	useEffect(() => {
		if (!generateOpen) return undefined;
		const onKey = (e) => {
			if (e.key === 'Escape' && !generating) setGenerateOpen(false);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [generateOpen, generating]);

	useEffect(() => {
		if (!detailId) return undefined;
		const onKey = (e) => {
			if (e.key === 'Escape') closeDetail();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [detailId, closeDetail]);

	const handleGenerate = async (e) => {
		e.preventDefault();
		setGenerating(true);
		try {
			const data = await generateAdminGrammarPracticeQuestions({
				jlpt: genJlpt,
				count: genCount,
				isPublished: genPublish,
			});
			toast.success(`Đã tạo ${data.inserted ?? genCount} câu hỏi`);
			setGenerateOpen(false);
			setPage(1);
			await fetchList();
		} catch (err) {
			toast.error('Không tạo được câu hỏi', { description: getApiErrorMessage(err) });
		} finally {
			setGenerating(false);
		}
	};

	const handleTogglePublish = async (row) => {
		if (!row?._id) return;
		setTogglingId(row._id);
		try {
			await updateAdminGrammarPracticeQuestion(String(row._id), {
				isPublished: !row.isPublished,
			});
			toast.success(row.isPublished ? 'Đã gỡ xuất bản' : 'Đã xuất bản câu hỏi');
			await fetchList();
			if (detailId === row._id) {
				await openDetail(row._id);
			}
		} catch (e) {
			toast.error('Không cập nhật được', { description: getApiErrorMessage(e) });
		} finally {
			setTogglingId('');
		}
	};

	const handleDelete = async (row) => {
		if (!row?._id) return;
		if (!window.confirm('Xóa câu hỏi này?')) return;
		setDeletingId(row._id);
		try {
			await deleteAdminGrammarPracticeQuestion(String(row._id));
			toast.success('Đã xóa câu hỏi');
			if (detailId === row._id) closeDetail();
			await fetchList();
		} catch (e) {
			toast.error('Không xóa được', { description: getApiErrorMessage(e) });
		} finally {
			setDeletingId('');
		}
	};

	return (
		<div className="admin-stub-main admin-grammar-page">
			<h1 className="admin-grammar-title">Câu hỏi luyện ngữ pháp</h1>
			<p className="admin-grammar-lead">
				Quản lý từng câu hỏi trắc nghiệm — khi thi thử, hệ thống random theo JLPT và số câu
				người học chọn.
			</p>

			<div className="admin-grammar-toolbar">
				<div className="admin-grammar-filters">
					<div className="admin-grammar-field">
						<label htmlFor="gp-jlpt">JLPT</label>
						<select
							id="gp-jlpt"
							value={jlpt}
							onChange={(e) => {
								setJlpt(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{GRAMMAR_JLPT_LEVELS.map((lv) => (
								<option key={lv} value={lv}>
									{lv}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="gp-pub">Xuất bản</label>
						<select
							id="gp-pub"
							value={published}
							onChange={(e) => {
								setPublished(e.target.value);
								setPage(1);
							}}
						>
							<option value="all">Tất cả</option>
							<option value="true">Đã xuất bản</option>
							<option value="false">Nháp</option>
						</select>
					</div>
				</div>
				<div className="admin-grammar-actions">
					{!loading && !error && pagination && pagination.total > 0 ? (
						<label className="admin-grammar-field admin-grammar-page-size">
							<span>Mỗi trang</span>
							<select
								value={pageSize}
								onChange={(e) => {
									setPageSize(Number(e.target.value));
									setPage(1);
								}}
								aria-label="Số câu mỗi trang"
							>
								{PAGE_SIZE_OPTIONS.map((n) => (
									<option key={n} value={n}>
										{n}
									</option>
								))}
							</select>
						</label>
					) : null}
					<Link to="/admin/grammar" className="admin-grammar-btn admin-grammar-btn--ghost">
						← Bài ngữ pháp
					</Link>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() => void fetchList()}
						disabled={loading}
					>
						Làm mới
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() => setImportOpen(true)}
					>
						Import JSON
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={() => setGenerateOpen(true)}
					>
						Tạo câu AI
					</button>
				</div>
			</div>

			{loading ? (
				<p className="admin-grammar-status">Đang tải…</p>
			) : error ? (
				<p className="admin-grammar-status admin-grammar-status--error" role="alert">
					{error}
				</p>
			) : items.length === 0 ? (
				<p className="admin-grammar-status">
					Chưa có câu hỏi nào. Bấm「Tạo câu AI」để sinh vào kho câu.
				</p>
			) : (
				<div className="admin-grammar-table-wrap">
					<table className="admin-grammar-table">
						<thead>
							<tr>
								<th>Câu hỏi (JA)</th>
								<th>JLPT</th>
								<th>Loại</th>
								<th>Nguồn</th>
								<th>Xuất bản</th>
								<th>Cập nhật</th>
								<th>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{items.map((row) => (
								<tr key={row._id}>
									<td lang="ja">{truncateText(row.promptJa)}</td>
									<td>{row.jlpt}</td>
									<td>{TYPE_LABELS[row.type] ?? row.type ?? '—'}</td>
									<td>{row.source === 'ai' ? 'AI' : 'Thủ công'}</td>
									<td>
										<span
											className={`admin-grammar-chip${row.isPublished === false ? ' admin-grammar-chip--off' : ''}`}
										>
											{row.isPublished === false ? 'Nháp' : 'Bật'}
										</span>
									</td>
									<td>
										{row.updatedAt
											? new Date(row.updatedAt).toLocaleString('vi-VN')
											: '—'}
									</td>
									<td>
										<div className="admin-grammar-row-actions">
											<button
												type="button"
												className="admin-grammar-btn admin-grammar-btn--ghost"
												onClick={() => void openDetail(row._id)}
											>
												Xem
											</button>
											<button
												type="button"
												className="admin-grammar-btn admin-grammar-btn--ghost"
												disabled={togglingId === row._id}
												onClick={() => void handleTogglePublish(row)}
											>
												{row.isPublished ? 'Gỡ' : 'Xuất bản'}
											</button>
											<button
												type="button"
												className="admin-grammar-btn admin-grammar-btn--danger"
												disabled={deletingId === row._id}
												onClick={() => void handleDelete(row)}
											>
												Xóa
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{!loading && !error && pagination && pagination.total > 0 ? (
				<nav className="admin-grammar-pagination" aria-label="Phân trang câu hỏi">
					<button
						type="button"
						disabled={page <= 1 || loading}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						Trước
					</button>
					<span>
						{pageRange
							? `${pageRange.start}–${pageRange.end} / ${pageRange.total} câu`
							: null}
						<span className="admin-grammar-pagination-sep" aria-hidden>
							{' '}
							·{' '}
						</span>
						Trang {pagination.page} / {Math.max(1, pagination.pages)}
					</span>
					<button
						type="button"
						disabled={page >= pagination.pages || loading}
						onClick={() =>
							setPage((p) =>
								pagination.pages ? Math.min(pagination.pages, p + 1) : p + 1,
							)
						}
					>
						Sau
					</button>
				</nav>
			) : null}

			{generateOpen ? (
				<div
					className="admin-grammar-modal-backdrop"
					role="presentation"
					onClick={() => !generating && setGenerateOpen(false)}
				>
					<div
						className="admin-grammar-modal admin-grammar-modal--narrow admin-grammar-practice-gen-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="gp-gen-title"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="admin-grammar-modal-header">
							<h2 id="gp-gen-title" className="admin-grammar-modal-title">
								Tạo câu hỏi bằng AI
							</h2>
							<button
								type="button"
								className="admin-grammar-modal-close"
								onClick={() => !generating && setGenerateOpen(false)}
								disabled={generating}
								aria-label="Đóng"
							>
								×
							</button>
						</div>

						<form onSubmit={(e) => void handleGenerate(e)}>
							<div className="admin-grammar-modal-body admin-grammar-modal-body--tight-foot">
								<div className="admin-grammar-form-stack">
									<p className="admin-grammar-practice-gen-lead">
										AI sinh từng câu trắc nghiệm và lưu riêng vào kho. Khi thi thử,
										người học chọn số câu — hệ thống lấy ngẫu nhiên từ kho đã xuất bản.
									</p>

									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<label className="admin-grammar-label" htmlFor="gp-gen-jlpt">
											Cấp JLPT
										</label>
										<select
											id="gp-gen-jlpt"
											className="admin-grammar-select"
											value={genJlpt}
											onChange={(e) => setGenJlpt(e.target.value)}
											disabled={generating}
										>
											{GRAMMAR_JLPT_LEVELS.map((lv) => (
												<option key={lv} value={lv}>
													{lv}
												</option>
											))}
										</select>
									</div>

									<div className="admin-grammar-field" style={{ marginBottom: 0 }}>
										<span className="admin-grammar-label" id="gp-gen-count-label">
											Số câu tạo
										</span>
										<div
											className="admin-grammar-count-pick"
											role="group"
											aria-labelledby="gp-gen-count-label"
										>
											{COUNT_PRESETS.map((n) => (
												<button
													key={n}
													type="button"
													className={`admin-grammar-count-pick__btn${genCount === n ? ' is-active' : ''}`}
													disabled={generating}
													aria-pressed={genCount === n}
													onClick={() => setGenCount(n)}
												>
													{n}
												</button>
											))}
										</div>
									</div>

									<label className="admin-grammar-check admin-grammar-publish-row">
										<input
											type="checkbox"
											checked={genPublish}
											onChange={(e) => setGenPublish(e.target.checked)}
											disabled={generating}
										/>
										<span>Xuất bản ngay sau khi tạo</span>
									</label>
								</div>
							</div>

							<div className="admin-grammar-modal-actions admin-grammar-modal-actions--foot">
								<button
									type="button"
									className="admin-grammar-btn admin-grammar-btn--ghost"
									disabled={generating}
									onClick={() => setGenerateOpen(false)}
								>
									Hủy
								</button>
								<button
									type="submit"
									className="admin-grammar-btn admin-grammar-btn--primary"
									disabled={generating}
								>
									{generating ? 'AI đang tạo câu…' : 'Tạo & lưu'}
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			{detailId ? (
				<div className="admin-grammar-modal-backdrop" role="presentation" onClick={closeDetail}>
					<div
						className="admin-grammar-modal admin-grammar-modal--wide admin-grammar-practice-detail-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="gp-detail-title"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="admin-grammar-modal-header">
							<h2 id="gp-detail-title" className="admin-grammar-modal-title">
								Chi tiết câu hỏi
							</h2>
							<button
								type="button"
								className="admin-grammar-modal-close"
								onClick={closeDetail}
								aria-label="Đóng"
							>
								×
							</button>
						</div>

						{detailLoading ? (
							<div className="admin-grammar-modal-body">
								<p className="admin-grammar-status">Đang tải…</p>
							</div>
						) : detail ? (
							<>
								<div className="admin-grammar-modal-body admin-grammar-modal-body--tight-foot">
									<p className="admin-grammar-practice-detail-meta">
										<span className="admin-grammar-chip">{detail.jlpt}</span>
										<span>{TYPE_LABELS[detail.type] ?? detail.type}</span>
										<span
											className={`admin-grammar-chip${detail.isPublished === false ? ' admin-grammar-chip--off' : ''}`}
										>
											{detail.isPublished ? 'Đã xuất bản' : 'Nháp'}
										</span>
									</p>
									<p lang="ja" className="admin-grammar-practice-prompt">
										{detail.promptJa}
									</p>
									{detail.promptVi ? (
										<p className="admin-grammar-practice-prompt-vi">{detail.promptVi}</p>
									) : null}
									<ul className="admin-grammar-practice-options">
										{(detail.options ?? []).map((opt, oi) => (
											<li
												key={`detail-opt-${oi}`}
												className={
													oi === detail.answerIndex
														? 'admin-grammar-practice-correct'
														: undefined
												}
											>
												<span className="admin-grammar-practice-opt-label">
													{String.fromCharCode(65 + oi)}.
												</span>
												{opt}
												{oi === detail.answerIndex ? (
													<span className="admin-grammar-practice-opt-mark">✓</span>
												) : null}
											</li>
										))}
									</ul>
									{detail.explainVi ? (
										<p className="admin-grammar-practice-explain">{detail.explainVi}</p>
									) : null}
									{detail.pattern ? (
										<p className="admin-grammar-practice-explain">
											Pattern: <strong>{detail.pattern}</strong>
										</p>
									) : null}
								</div>
								<div className="admin-grammar-modal-actions admin-grammar-modal-actions--foot">
									<button
										type="button"
										className="admin-grammar-btn admin-grammar-btn--ghost"
										onClick={closeDetail}
									>
										Đóng
									</button>
								</div>
							</>
						) : null}
					</div>
				</div>
			) : null}

			<GrammarPracticeImportJsonModal
				open={importOpen}
				onClose={() => setImportOpen(false)}
				onDone={() => {
					setPage(1);
					void fetchList();
				}}
			/>
		</div>
	);
}

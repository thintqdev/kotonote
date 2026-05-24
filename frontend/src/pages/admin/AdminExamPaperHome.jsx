import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
	EXAM_JLPT_LEVELS,
	EXAM_SESSION_OPTIONS,
	examSessionLabel,
	examSourceLabel,
	examYearOptions,
} from '../../constants/examPaperFieldMeta.js';
import {
	createAdminExamPaper,
	deleteAdminExamPaper,
	listAdminExamPapers,
	updateAdminExamPaper,
} from '../../services/adminExamPaperService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import ExamPaperFormModal from './ExamPaperFormModal.jsx';
import './AdminGrammarPage.css';

export default function AdminExamPaperHome() {
	const [jlpt, setJlpt] = useState('');
	const [year, setYear] = useState('');
	const [session, setSession] = useState('');
	const [published, setPublished] = useState('all');
	const [q, setQ] = useState('');
	const [qDraft, setQDraft] = useState('');
	const [page, setPage] = useState(1);
	const [items, setItems] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [deletingId, setDeletingId] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState(null);

	const yearOptions = useMemo(() => examYearOptions(2010), []);

	const queryParams = useMemo(() => {
		const p = { page, limit: 20 };
		if (jlpt) p.jlpt = jlpt;
		if (year) p.year = year;
		if (session) p.session = session;
		if (q) p.q = q;
		if (published === 'true') p.isPublished = 'true';
		if (published === 'false') p.isPublished = 'false';
		return p;
	}, [jlpt, year, session, q, published, page]);

	const fetchList = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const data = await listAdminExamPapers(queryParams);
			setItems(data.items ?? []);
			setPagination(data.pagination);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			setError(msg);
			toast.error('Không tải được danh sách đề thi', { description: msg });
		} finally {
			setLoading(false);
		}
	}, [queryParams]);

	useEffect(() => {
		void fetchList();
	}, [fetchList]);

	const submitSearch = (e) => {
		e.preventDefault();
		setQ(qDraft.trim());
		setPage(1);
	};

	const openCreate = () => {
		setEditingItem(null);
		setShowModal(true);
	};

	const openEdit = (row) => {
		setEditingItem(row);
		setShowModal(true);
	};

	const handleSubmit = async (payload) => {
		if (editingItem?._id) {
			await updateAdminExamPaper(String(editingItem._id), payload);
			toast.success('Đã cập nhật đề thi');
		} else {
			await createAdminExamPaper(payload);
			toast.success('Đã tạo đề thi');
		}
		await fetchList();
	};

	const handleDelete = async (row) => {
		if (!row?._id) return;
		const label = row.titleVi || `${row.jlpt} ${row.year}`;
		if (!window.confirm(`Xóa đề「${label}」?`)) return;
		setDeletingId(row._id);
		try {
			await deleteAdminExamPaper(String(row._id));
			toast.success('Đã xóa đề thi');
			await fetchList();
		} catch (e) {
			toast.error('Không xóa được', { description: getApiErrorMessage(e) });
		} finally {
			setDeletingId('');
		}
	};

	return (
		<div className="admin-stub-main admin-grammar-page">
			<h1 className="admin-grammar-title">JLPT — Quản lý đề thi</h1>
			<p className="admin-grammar-lead">
				Thêm đề thi theo cấp JLPT và năm (kỳ tháng 7 / tháng 12). Nhấn «Soạn đề» để
				mở khung câu hỏi chuẩn JLPT và import JSON theo từng phần.
			</p>

			<div className="admin-grammar-toolbar">
				<div className="admin-grammar-filters">
					<div className="admin-grammar-field">
						<label htmlFor="epf-jlpt">JLPT</label>
						<select
							id="epf-jlpt"
							value={jlpt}
							onChange={(e) => {
								setJlpt(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{EXAM_JLPT_LEVELS.map((lv) => (
								<option key={lv} value={lv}>
									{lv}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="epf-year">Năm</label>
						<select
							id="epf-year"
							value={year}
							onChange={(e) => {
								setYear(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{yearOptions.map((y) => (
								<option key={y} value={y}>
									{y}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="epf-session">Kỳ thi</label>
						<select
							id="epf-session"
							value={session}
							onChange={(e) => {
								setSession(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{EXAM_SESSION_OPTIONS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="epf-pub">Xuất bản</label>
						<select
							id="epf-pub"
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
					<form className="admin-grammar-search" onSubmit={submitSearch}>
						<label htmlFor="epf-q">Tìm kiếm</label>
						<input
							id="epf-q"
							type="search"
							value={qDraft}
							onChange={(e) => setQDraft(e.target.value)}
							placeholder="Tiêu đề, slug…"
							autoComplete="off"
						/>
						<button type="submit" className="admin-grammar-search__submit">
							Lọc
						</button>
					</form>
				</div>
				<div className="admin-grammar-actions">
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() => void fetchList()}
						disabled={loading}
					>
						Làm mới
					</button>
					<Link
						to="/admin/exam-structures"
						className="admin-grammar-btn admin-grammar-btn--ghost"
					>
						Khung cấu trúc
					</Link>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={openCreate}
					>
						+ Thêm đề thi
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
				<p className="admin-grammar-status">Chưa có đề thi nào.</p>
			) : (
				<div className="admin-grammar-table-wrap">
					<table className="admin-grammar-table">
						<thead>
							<tr>
								<th>Tiêu đề</th>
								<th>JLPT</th>
								<th>Năm / Kỳ</th>
								<th>Câu hỏi</th>
								<th>Nguồn</th>
								<th>Trạng thái</th>
								<th>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{items.map((row) => (
								<tr key={row._id}>
									<td>
										<div className="admin-grammar-cell-text">{row.titleVi}</div>
										{row.titleJa ? (
											<div
												style={{
													fontSize: '0.78rem',
													color: 'var(--admin-ink-soft)',
												}}
												lang="ja"
											>
												{row.titleJa}
											</div>
										) : null}
										<div
											style={{
												fontSize: '0.72rem',
												color: 'var(--admin-ink-soft)',
												marginTop: '0.2rem',
											}}
										>
											{row.slug}
										</div>
									</td>
									<td>{row.jlpt}</td>
									<td>
										{row.year}
										<br />
										<span style={{ fontSize: '0.85rem' }}>
											{examSessionLabel(row.session)}
										</span>
									</td>
									<td>
										{row.questionCount ?? 0}
										{row.durationMinutes ? (
											<div style={{ fontSize: '0.78rem', opacity: 0.75 }}>
												{row.durationMinutes} phút
											</div>
										) : null}
									</td>
									<td>{examSourceLabel(row.sourceType)}</td>
									<td>
										<span
											className={`admin-grammar-chip${row.isPublished ? '' : ' admin-grammar-chip--off'}`}
										>
											{row.isPublished ? 'Xuất bản' : 'Nháp'}
										</span>
									</td>
									<td>
										<div className="admin-grammar-row-actions">
											<Link
												to={`/admin/exam-papers/${row._id}/edit`}
												className="admin-grammar-btn admin-grammar-btn--ghost"
											>
												Soạn đề
											</Link>
											<button
												type="button"
												className="admin-grammar-btn admin-grammar-btn--ghost"
												onClick={() => openEdit(row)}
											>
												Sửa
											</button>
											<button
												type="button"
												className="admin-grammar-btn admin-grammar-btn--danger"
												disabled={deletingId === row._id}
												onClick={() => void handleDelete(row)}
											>
												{deletingId === row._id ? '…' : 'Xóa'}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{pagination && pagination.pages > 1 ? (
				<nav className="admin-grammar-pagination" aria-label="Phân trang đề thi">
					<button
						type="button"
						disabled={page <= 1 || loading}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						Trước
					</button>
					<span>
						Trang {pagination.page} / {pagination.pages}
					</span>
					<button
						type="button"
						disabled={page >= pagination.pages || loading}
						onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
					>
						Sau
					</button>
				</nav>
			) : null}

			<ExamPaperFormModal
				isOpen={showModal}
				onClose={() => {
					setShowModal(false);
					setEditingItem(null);
				}}
				initialData={editingItem}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}

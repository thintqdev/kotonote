import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { READING_JLPT_LEVELS } from '../../utils/readingForm.js';
import {
	deleteAdminReadingArticle,
	listAdminReadingArticles,
} from '../../services/adminReadingService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import './AdminGrammarPage.css';

export default function AdminReadingHome() {
	const [jlpt, setJlpt] = useState('');
	const [published, setPublished] = useState('all');
	const [q, setQ] = useState('');
	const [qDraft, setQDraft] = useState('');
	const [page, setPage] = useState(1);
	const [items, setItems] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [deletingId, setDeletingId] = useState('');

	const queryParams = useMemo(() => {
		const p = { page, limit: 20 };
		if (jlpt) p.jlpt = jlpt;
		if (q) p.q = q;
		if (published === 'true') p.isPublished = 'true';
		if (published === 'false') p.isPublished = 'false';
		return p;
	}, [jlpt, q, published, page]);

	const fetchList = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const data = await listAdminReadingArticles(queryParams);
			setItems(data.items ?? []);
			setPagination(data.pagination);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			setError(msg);
			toast.error('Không tải được danh sách đọc hiểu', { description: msg });
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

	const handleDelete = async (row) => {
		if (!row?._id) return;
		if (!window.confirm(`Xóa bài「${row.titleJa}」?`)) return;
		setDeletingId(row._id);
		try {
			await deleteAdminReadingArticle(String(row._id));
			toast.success('Đã xóa bài đọc');
			await fetchList();
		} catch (e) {
			toast.error('Không xóa được', { description: getApiErrorMessage(e) });
		} finally {
			setDeletingId('');
		}
	};

	return (
		<div className="admin-stub-main admin-grammar-page">
			<h1 className="admin-grammar-title">Đọc hiểu (Reading)</h1>
			<p className="admin-grammar-lead">
				Quản lý bài đọc, từ vựng và câu hỏi hiểu bài cho người học.
			</p>

			<div className="admin-grammar-toolbar">
				<div className="admin-grammar-filters">
					<div className="admin-grammar-field">
						<label htmlFor="ar-jlpt">JLPT</label>
						<select
							id="ar-jlpt"
							value={jlpt}
							onChange={(e) => {
								setJlpt(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{READING_JLPT_LEVELS.map((lv) => (
								<option key={lv} value={lv}>
									{lv}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="ar-pub">Xuất bản</label>
						<select
							id="ar-pub"
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
						<label htmlFor="ar-q">Tìm kiếm</label>
						<input
							id="ar-q"
							type="search"
							name="q"
							value={qDraft}
							onChange={(e) => setQDraft(e.target.value)}
							placeholder="Tiêu đề, slug, snippet…"
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
						to="/admin/reading/new"
						className="admin-grammar-btn admin-grammar-btn--primary"
					>
						Thêm bài đọc
					</Link>
				</div>
			</div>

			{loading ? (
				<p className="admin-grammar-status">Đang tải…</p>
			) : error ? (
				<p className="admin-grammar-status admin-grammar-status--error" role="alert">
					{error}
				</p>
			) : items.length === 0 ? (
				<p className="admin-grammar-status">Chưa có bài nào khớp bộ lọc.</p>
			) : (
				<div className="admin-grammar-table-wrap">
					<table className="admin-grammar-table">
						<thead>
							<tr>
								<th>Thứ tự</th>
								<th>Tiêu đề</th>
								<th>Slug</th>
								<th>JLPT</th>
								<th>Phút</th>
								<th>Nổi bật</th>
								<th>Xuất bản</th>
								<th>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{items.map((row) => (
								<tr key={row._id}>
									<td>{Number(row.displayOrder) || 0}</td>
									<td lang="ja">{row.titleJa}</td>
									<td>
										<code>{row.slug}</code>
									</td>
									<td>{row.jlpt}</td>
									<td>{row.readingMinutes}</td>
									<td>{row.featured ? '✓' : '—'}</td>
									<td>
										<span
											className={`admin-grammar-chip${row.isPublished === false ? ' admin-grammar-chip--off' : ''}`}
										>
											{row.isPublished === false ? 'Nháp' : 'Bật'}
										</span>
									</td>
									<td>
										<div className="admin-grammar-row-actions">
											<Link
												to={`/admin/reading/${row._id}/edit`}
												className="admin-grammar-btn admin-grammar-btn--ghost"
											>
												Sửa
											</Link>
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

			{pagination && pagination.pages > 1 ? (
				<nav className="admin-grammar-pagination" aria-label="Phân trang">
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
						onClick={() => setPage((p) => p + 1)}
					>
						Sau
					</button>
				</nav>
			) : null}
		</div>
	);
}

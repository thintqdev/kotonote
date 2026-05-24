import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
	KAIWA_CATEGORY_OPTIONS,
	KAIWA_JLPT_LEVELS,
	kaiwaCategoryLabel,
} from '../../constants/kaiwaFieldMeta.js';
import {
	deleteAdminKaiwaContext,
	listAdminKaiwaContexts,
} from '../../services/adminKaiwaService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import './AdminGrammarPage.css';

export default function AdminKaiwaHome() {
	const [jlpt, setJlpt] = useState('');
	const [category, setCategory] = useState('');
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
		if (category) p.category = category;
		if (q) p.q = q;
		if (published === 'true') p.isPublished = 'true';
		if (published === 'false') p.isPublished = 'false';
		return p;
	}, [jlpt, category, q, published, page]);

	const fetchList = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const data = await listAdminKaiwaContexts(queryParams);
			setItems(data.items ?? []);
			setPagination(data.pagination);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			setError(msg);
			toast.error('Không tải được danh sách Kaiwa', { description: msg });
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
		if (!window.confirm(`Xóa bối cảnh「${row.titleVi}」?`)) return;
		setDeletingId(row._id);
		try {
			await deleteAdminKaiwaContext(String(row._id));
			toast.success('Đã xóa bối cảnh');
			await fetchList();
		} catch (e) {
			toast.error('Không xóa được', { description: getApiErrorMessage(e) });
		} finally {
			setDeletingId('');
		}
	};

	return (
		<div className="admin-stub-main admin-grammar-page">
			<h1 className="admin-grammar-title">Kaiwa — Bối cảnh hội thoại</h1>
			<p className="admin-grammar-lead">
				Tạo context (tình huống, vai trò, cụm từ) để sau này dựng kịch bản luyện nói.
				Có thể generate bằng AI khi soạn bối cảnh.
			</p>

			<div className="admin-grammar-toolbar">
				<div className="admin-grammar-filters">
					<div className="admin-grammar-field">
						<label htmlFor="kw-jlpt">JLPT</label>
						<select
							id="kw-jlpt"
							value={jlpt}
							onChange={(e) => {
								setJlpt(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{KAIWA_JLPT_LEVELS.map((lv) => (
								<option key={lv} value={lv}>
									{lv}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="kw-cat">Chủ đề</label>
						<select
							id="kw-cat"
							value={category}
							onChange={(e) => {
								setCategory(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{KAIWA_CATEGORY_OPTIONS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="kw-pub">Xuất bản</label>
						<select
							id="kw-pub"
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
						<label htmlFor="kw-q">Tìm kiếm</label>
						<input
							id="kw-q"
							type="search"
							value={qDraft}
							onChange={(e) => setQDraft(e.target.value)}
							placeholder="Tiêu đề, tình huống…"
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
						className="admin-grammar-btn admin-grammar-btn--primary"
						to="/admin/kaiwa/new"
					>
						+ Tạo bối cảnh
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
				<p className="admin-grammar-status">Chưa có bối cảnh nào.</p>
			) : (
				<div className="admin-grammar-table-wrap">
					<table className="admin-grammar-table">
						<thead>
							<tr>
								<th>Tiêu đề</th>
								<th>JLPT</th>
								<th>Chủ đề</th>
								<th>Tình huống</th>
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
									</td>
									<td>{row.jlpt}</td>
									<td>{kaiwaCategoryLabel(row.category)}</td>
									<td className="admin-grammar-cell-clamp">
										{row.situationVi || '—'}
									</td>
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
												className="admin-grammar-btn admin-grammar-btn--ghost"
												to={`/admin/kaiwa/${encodeURIComponent(row._id)}/edit`}
											>
												Sửa
											</Link>
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
				<nav className="admin-grammar-pagination" aria-label="Phân trang Kaiwa">
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
						onClick={() =>
							setPage((p) => Math.min(pagination.pages, p + 1))
						}
					>
						Sau
					</button>
				</nav>
			) : null}
		</div>
	);
}

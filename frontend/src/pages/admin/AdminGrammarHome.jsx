import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
	GRAMMAR_JLPT_LEVELS,
	GRAMMAR_TAG_IDS,
} from '../../constants/grammarFieldMeta.js';
import {
	deleteAdminGrammar,
	listAdminGrammars,
} from '../../services/adminGrammarService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import GrammarBulkImportCsvModal from '../../components/admin/GrammarBulkImportCsvModal.jsx';
import './AdminGrammarPage.css';

export default function AdminGrammarHome() {
	const [jlpt, setJlpt] = useState('');
	const [tag, setTag] = useState('');
	const [published, setPublished] = useState('all');
	const [q, setQ] = useState('');
	const [qDraft, setQDraft] = useState('');
	const [page, setPage] = useState(1);
	const [items, setItems] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [deletingId, setDeletingId] = useState('');
	const [bulkImportOpen, setBulkImportOpen] = useState(false);

	const queryParams = useMemo(() => {
		const p = { page, limit: 20 };
		if (jlpt) p.jlpt = jlpt;
		if (tag) p.tag = tag;
		if (q) p.q = q;
		if (published === 'true') p.isPublished = 'true';
		if (published === 'false') p.isPublished = 'false';
		return p;
	}, [jlpt, tag, q, published, page]);

	const fetchList = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const data = await listAdminGrammars(queryParams);
			setItems(data.items ?? []);
			setPagination(data.pagination);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			setError(msg);
			toast.error('Không tải được danh sách ngữ pháp', { description: msg });
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
		if (!window.confirm(`Xóa mục「${row.pattern}」?`)) return;
		setDeletingId(row._id);
		try {
			await deleteAdminGrammar(String(row._id));
			toast.success('Đã xóa ngữ pháp');
			await fetchList();
		} catch (e) {
			toast.error('Không xóa được', { description: getApiErrorMessage(e) });
		} finally {
			setDeletingId('');
		}
	};

	return (
		<div className="admin-stub-main admin-grammar-page">
			<h1 className="admin-grammar-title">Ngữ pháp (Grammar)</h1>
			<p className="admin-grammar-lead">
				Quản lý bài ngữ pháp hiển thị cho người học.
			</p>

			<div className="admin-grammar-toolbar">
				<div className="admin-grammar-filters">
					<div className="admin-grammar-field">
						<label htmlFor="ag-jlpt">JLPT</label>
						<select
							id="ag-jlpt"
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
						<label htmlFor="ag-tag">Tag</label>
						<select
							id="ag-tag"
							value={tag}
							onChange={(e) => {
								setTag(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{GRAMMAR_TAG_IDS.map((tid) => (
								<option key={tid} value={tid}>
									{tid}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="ag-pub">Xuất bản</label>
						<select
							id="ag-pub"
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
						<label htmlFor="ag-q">Tìm kiếm</label>
						<input
							id="ag-q"
							type="search"
							name="q"
							value={qDraft}
							onChange={(e) => setQDraft(e.target.value)}
							placeholder="Pattern, slug, teaser…"
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
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() => setBulkImportOpen(true)}
					>
						Import CSV
					</button>
					<Link
						to="/admin/grammar/new"
						className="admin-grammar-btn admin-grammar-btn--primary"
					>
						Thêm ngữ pháp
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
				<p className="admin-grammar-status">Chưa có mục nào khớp bộ lọc.</p>
			) : (
				<div className="admin-grammar-table-wrap">
					<table className="admin-grammar-table">
						<thead>
							<tr>
								<th>Thứ tự</th>
								<th>Pattern</th>
								<th>Slug</th>
								<th>JLPT</th>
								<th>Tags</th>
								<th>Xuất bản</th>
								<th>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{items.map((row) => (
								<tr key={row._id}>
									<td>{Number(row.displayOrder) || 0}</td>
									<td lang="ja">{row.pattern}</td>
									<td>
										<code>{row.slug}</code>
									</td>
									<td>{row.jlpt}</td>
									<td>{(row.tagIds || []).join(', ') || '—'}</td>
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
												to={`/admin/grammar/${row._id}/edit`}
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

			<GrammarBulkImportCsvModal
				open={bulkImportOpen}
				onClose={() => setBulkImportOpen(false)}
				onDone={() => void fetchList()}
			/>
		</div>
	);
}

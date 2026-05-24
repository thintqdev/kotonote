import { useState, useEffect, useMemo, useCallback, useRef, Fragment } from 'react';
import { toast } from 'sonner';
import ListeningFormModal from './ListeningFormModal.jsx';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import { resolvePublicMediaUrl } from '../../utils/resolveAvatarUrl.js';
import {
	LISTENING_JLPT_LEVELS,
	LISTENING_TYPES,
	getListeningTypeLabel,
} from '../../constants/listeningFieldMeta.js';
import adminListeningService from '../../services/adminListeningService.js';
import './AdminGrammarPage.css';
import './AdminListeningPage.css';

const ITEMS_PER_PAGE = 20;

const getYoutubeId = (url) => {
	if (!url) return null;
	const regExp =
		/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
};

const formatDuration = (sec) => {
	const n = Number(sec);
	if (!Number.isFinite(n) || n <= 0) return '—';
	const m = Math.floor(n / 60);
	const s = Math.floor(n % 60);
	return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function AdminListeningHome() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [deletingId, setDeletingId] = useState('');

	const [jlpt, setJlpt] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [published, setPublished] = useState('all');
	const [q, setQ] = useState('');
	const [qDraft, setQDraft] = useState('');
	const [page, setPage] = useState(1);

	const [expandedRowId, setExpandedRowId] = useState(null);
	const [detailTab, setDetailTab] = useState('ja');
	const [playingId, setPlayingId] = useState(null);
	const audioRef = useRef(new Audio());

	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState(null);

	const fetchList = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const response = await adminListeningService.getAll();
			setItems(response.success ? response.data ?? [] : []);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			setError(msg);
			toast.error('Không tải được danh sách luyện nghe', { description: msg });
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchList();
	}, [fetchList]);

	useEffect(() => {
		return () => {
			audioRef.current.pause();
		};
	}, []);

	const togglePlayAudio = useCallback((id, url) => {
		if (!url || String(url).startsWith('data:')) {
			toast.error('Audio chưa có URL MinIO hợp lệ. Hãy sửa bài và tải lại file.');
			return;
		}
		if (playingId === id) {
			audioRef.current.pause();
			setPlayingId(null);
			return;
		}
		audioRef.current.pause();
		audioRef.current.src = resolvePublicMediaUrl(url) ?? url;
		audioRef.current.load();
		audioRef.current
			.play()
			.then(() => setPlayingId(id))
			.catch(() => {
				toast.error('Không phát được audio. Kiểm tra URL hoặc MinIO.');
			});
	}, [playingId]);

	const submitSearch = (e) => {
		e.preventDefault();
		setQ(qDraft.trim());
		setPage(1);
	};

	const handleDelete = async (row) => {
		if (!row?._id) return;
		if (!window.confirm(`Xóa bài「${row.titleVi}」?`)) return;
		setDeletingId(row._id);
		try {
			await adminListeningService.delete(row._id);
			toast.success('Đã xóa bài nghe');
			if (playingId === row._id) {
				audioRef.current.pause();
				setPlayingId(null);
			}
			await fetchList();
		} catch (e) {
			toast.error('Không xóa được', { description: getApiErrorMessage(e) });
		} finally {
			setDeletingId('');
		}
	};

	const handleSubmitForm = async (payload) => {
		try {
			if (editingItem) {
				await adminListeningService.update(editingItem._id, payload);
				toast.success('Đã cập nhật bài luyện nghe');
			} else {
				await adminListeningService.create(payload);
				toast.success('Đã tạo bài luyện nghe');
			}
			setShowModal(false);
			await fetchList();
		} catch (e) {
			toast.error('Không lưu được', { description: getApiErrorMessage(e) });
		}
	};

	const filteredItems = useMemo(() => {
		return items
			.filter((item) => {
				if (jlpt && item.jlpt !== jlpt) return false;
				if (typeFilter && item.type !== typeFilter) return false;
				if (published === 'true' && !item.isPublished) return false;
				if (published === 'false' && item.isPublished !== false) return false;
				if (q) {
					const query = q.toLowerCase();
					const hay = [
						item.titleVi,
						item.titleJa,
						item.scriptJa,
						item.scriptVi,
					]
						.filter(Boolean)
						.join(' ')
						.toLowerCase();
					if (!hay.includes(query)) return false;
				}
				return true;
			})
			.sort(
				(a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0),
			);
	}, [items, jlpt, typeFilter, published, q]);

	const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
	const paginatedItems = useMemo(() => {
		const start = (page - 1) * ITEMS_PER_PAGE;
		return filteredItems.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredItems, page]);

	useEffect(() => {
		if (page > totalPages) setPage(totalPages);
	}, [page, totalPages]);

	return (
		<div className="admin-stub-main admin-grammar-page">
			<h1 className="admin-grammar-title">Luyện nghe (Listening)</h1>
			<p className="admin-grammar-lead">
				Quản lý bài nghe JLPT: audio (MinIO), kịch bản song ngữ và câu hỏi trắc
				nghiệm.
			</p>

			<div className="admin-grammar-toolbar">
				<div className="admin-grammar-filters">
					<div className="admin-grammar-field">
						<label htmlFor="al-jlpt">JLPT</label>
						<select
							id="al-jlpt"
							value={jlpt}
							onChange={(e) => {
								setJlpt(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{LISTENING_JLPT_LEVELS.map((lv) => (
								<option key={lv} value={lv}>
									{lv}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="al-type">Dạng bài</label>
						<select
							id="al-type"
							value={typeFilter}
							onChange={(e) => {
								setTypeFilter(e.target.value);
								setPage(1);
							}}
						>
							<option value="">Tất cả</option>
							{LISTENING_TYPES.map((t) => (
								<option key={t.key} value={t.key}>
									{getListeningTypeLabel(t.key)}
								</option>
							))}
						</select>
					</div>
					<div className="admin-grammar-field">
						<label htmlFor="al-pub">Xuất bản</label>
						<select
							id="al-pub"
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
						<label htmlFor="al-q">Tìm kiếm</label>
						<input
							id="al-q"
							type="search"
							value={qDraft}
							onChange={(e) => setQDraft(e.target.value)}
							placeholder="Tiêu đề, kịch bản…"
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
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={() => {
							setEditingItem(null);
							setShowModal(true);
						}}
					>
						Thêm bài nghe
					</button>
				</div>
			</div>

			{loading ? (
				<p className="admin-grammar-status">Đang tải…</p>
			) : error ? (
				<p className="admin-grammar-status admin-grammar-status--error" role="alert">
					{error}
				</p>
			) : filteredItems.length === 0 ? (
				<p className="admin-grammar-status">Chưa có bài nào khớp bộ lọc.</p>
			) : (
				<div className="admin-grammar-table-wrap">
					<table className="admin-grammar-table">
						<thead>
							<tr>
								<th>Thứ tự</th>
								<th>JLPT</th>
								<th>Dạng bài</th>
								<th>Tiêu đề</th>
								<th>Thời lượng</th>
								<th>Câu hỏi</th>
								<th>Xuất bản</th>
								<th>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{paginatedItems.map((row) => {
								const isExpanded = expandedRowId === row._id;
								const typeMeta = LISTENING_TYPES.find((x) => x.key === row.type);
								const ytId = getYoutubeId(row.audioUrl);
								const canPreview =
									ytId ||
									(row.audioUrl &&
										!String(row.audioUrl).startsWith('data:'));

								return (
									<Fragment key={row._id}>
										<tr>
											<td>{Number(row.displayOrder) || 0}</td>
											<td>{row.jlpt}</td>
											<td>
												<span className="admin-listening-type-chip">
													{typeMeta?.labelJa ?? row.type}
												</span>
											</td>
											<td>
												<div className="admin-grammar-cell-text">
													{row.titleVi}
												</div>
												{row.titleJa ? (
													<div
														className="admin-grammar-cell-text admin-grammar-cell-text--ja"
														lang="ja"
													>
														{row.titleJa}
													</div>
												) : null}
											</td>
											<td>
												{canPreview ? (
													<button
														type="button"
														className={`admin-listening-preview-btn${playingId === row._id ? ' admin-listening-preview-btn--active' : ''}`}
														onClick={() =>
															ytId
																? window.open(
																		`https://www.youtube.com/watch?v=${ytId}`,
																		'_blank',
																		'noopener',
																	)
																: togglePlayAudio(row._id, row.audioUrl)
														}
													>
														{ytId
															? 'YouTube'
															: playingId === row._id
																? 'Dừng'
																: 'Nghe thử'}
													</button>
												) : (
													<span style={{ fontSize: '0.78rem', color: 'var(--admin-ink-soft)' }}>
														{formatDuration(row.duration)}
													</span>
												)}
											</td>
											<td>{row.questions?.length ?? 0}</td>
											<td>
												<span
													className={`admin-grammar-chip${row.isPublished === false ? ' admin-grammar-chip--off' : ''}`}
												>
													{row.isPublished === false ? 'Nháp' : 'Bật'}
												</span>
											</td>
											<td>
												<div className="admin-grammar-row-actions">
													<button
														type="button"
														className="admin-grammar-btn admin-grammar-btn--ghost"
														onClick={() =>
															setExpandedRowId(isExpanded ? null : row._id)
														}
													>
														{isExpanded ? 'Ẩn' : 'Chi tiết'}
													</button>
													<button
														type="button"
														className="admin-grammar-btn admin-grammar-btn--ghost"
														onClick={() => {
															setEditingItem(row);
															setShowModal(true);
														}}
													>
														Sửa
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
										{isExpanded ? (
											<tr className="admin-listening-detail-row">
												<td colSpan={8}>
													<div className="admin-listening-detail">
														<div className="admin-listening-detail-panel">
															<h3>Kịch bản</h3>
															<div className="admin-listening-detail-tabs">
																<button
																	type="button"
																	className={`admin-listening-detail-tab${detailTab === 'ja' ? ' admin-listening-detail-tab--active' : ''}`}
																	onClick={() => setDetailTab('ja')}
																>
																	Tiếng Nhật
																</button>
																<button
																	type="button"
																	className={`admin-listening-detail-tab${detailTab === 'vi' ? ' admin-listening-detail-tab--active' : ''}`}
																	onClick={() => setDetailTab('vi')}
																>
																	Tiếng Việt
																</button>
															</div>
															{row.image ? (
																<div className="admin-listening-image-preview" style={{ marginBottom: 10 }}>
																	<img
																		src={resolvePublicMediaUrl(row.image) ?? row.image}
																		alt=""
																		decoding="async"
																	/>
																</div>
															) : null}
															<pre
																className="admin-listening-script"
																lang={detailTab === 'ja' ? 'ja' : 'vi'}
															>
																{detailTab === 'ja'
																	? row.scriptJa || '—'
																	: row.scriptVi || '—'}
															</pre>
														</div>
														<div className="admin-listening-detail-panel">
															<h3>
																Câu hỏi ({row.questions?.length ?? 0})
															</h3>
															<div className="admin-listening-questions-scroll">
																{(row.questions ?? []).map((question, qi) => (
																	<div key={qi} className="admin-listening-q-item">
																		<strong>
																			Câu {qi + 1}: {question.questionVi}
																		</strong>
																		{question.questionJa ? (
																			<div lang="ja" style={{ fontSize: '0.8rem', color: 'var(--admin-ink-soft)', marginTop: 4 }}>
																				{question.questionJa}
																			</div>
																		) : null}
																		{(question.choices ?? []).map((choice, ci) => (
																			<div
																				key={ci}
																				className={`admin-listening-choice${ci === question.answerIndex ? ' admin-listening-choice--correct' : ''}`}
																			>
																				<span className="admin-listening-choice-num">
																					{ci + 1}
																				</span>
																				<span>{choice || '(ảnh)'}</span>
																			</div>
																		))}
																		{question.explainVi ? (
																			<p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--admin-ink-soft)' }}>
																				<strong>Giải thích:</strong> {question.explainVi}
																			</p>
																		) : null}
																	</div>
																))}
															</div>
														</div>
													</div>
												</td>
											</tr>
										) : null}
									</Fragment>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{totalPages > 1 ? (
				<nav className="admin-grammar-pagination" aria-label="Phân trang luyện nghe">
					<button
						type="button"
						disabled={page <= 1 || loading}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						Trước
					</button>
					<span>
						Trang {page} / {totalPages}
					</span>
					<button
						type="button"
						disabled={page >= totalPages || loading}
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					>
						Sau
					</button>
				</nav>
			) : null}

			<ListeningFormModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				initialData={editingItem}
				onSubmit={handleSubmitForm}
			/>
		</div>
	);
}

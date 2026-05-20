import { useState, useEffect, useMemo, useCallback, useRef, Fragment } from 'react';
import { toast } from 'sonner';
import ListeningFormModal from './ListeningFormModal.jsx';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import './AdminGrammarPage.css';
import './KaiwaListPage.css';

import adminListeningService from '../../services/adminListeningService';
import { LISTENING_ASSETS } from '../../constants/listeningAssets.js';

// JLPT levels
const JLPT_LEVELS = ['N1', 'N2', 'N3', 'N4', 'N5'];

// 5 standard listening question types in JLPT
const LISTENING_TYPES = [
	{ key: 'task', labelVi: 'Hiểu nhiệm vụ', labelJa: '課題理解' },
	{ key: 'point', labelVi: 'Hiểu chi tiết', labelJa: 'ポイント理解' },
	{ key: 'summary', labelVi: 'Hiểu khái quát', labelJa: '概要理解' },
	{ key: 'utterance', labelVi: 'Biểu đạt tình huống', labelJa: '発話表現' },
	{ key: 'response', labelVi: 'Phản xạ nhanh', labelJa: '即時応答' }
];

const getYoutubeId = (url) => {
	if (!url) return null;
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	return (match && match[2].length === 11) ? match[2] : null;
};

export default function KaiwaListPage() {
	// List of items from API
	const [items, setItems] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	// Filters and Search states
	const [jlptFilter, setJlptFilter] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [searchDraft, setSearchDraft] = useState('');
	const [page, setPage] = useState(1);
	const itemsPerPage = 5;

	// View Details Expansion
	const [expandedRowId, setExpandedRowId] = useState(null);
	const [detailTab, setDetailTab] = useState('ja'); // 'ja' or 'vi'

	// HTML5 Audio Custom Player State
	const [playingId, setPlayingId] = useState(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef(new Audio());

	// Modal Form State
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [formIsPublished, setFormIsPublished] = useState(true);
	const [formQuestions, setFormQuestions] = useState([]);

	const loadData = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await adminListeningService.getAll();
			if (response.success) {
				setItems(response.data);
			}
		} catch (error) {
			toast.error('Không thể tải dữ liệu bài nghe: ' + getApiErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Sync custom player with audio events
	useEffect(() => {
		const audio = audioRef.current;
		const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
		const handleLoadedMetadata = () => setDuration(audio.duration);
		const handleAudioEnded = () => {
			setPlayingId(null);
			setCurrentTime(0);
		};

		audio.addEventListener('timeupdate', handleTimeUpdate);
		audio.addEventListener('loadedmetadata', handleLoadedMetadata);
		audio.addEventListener('ended', handleAudioEnded);

		return () => {
			audio.removeEventListener('timeupdate', handleTimeUpdate);
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
			audio.removeEventListener('ended', handleAudioEnded);
		};
	}, []);

	// Pause audio player when changing views
	useEffect(() => {
		return () => {
			audioRef.current.pause();
		};
	}, []);

	// Toggle Custom Audio Player
	const togglePlayAudio = useCallback((id, url) => {
		if (playingId === id) {
			audioRef.current.pause();
			setPlayingId(null);
		} else {
			audioRef.current.pause();
			audioRef.current.src = url;
			audioRef.current.load();
			audioRef.current.play()
				.then(() => {
					setPlayingId(id);
				})
				.catch(() => {
					toast.error('Không thể phát file âm thanh này. Hãy kiểm tra lại liên kết hoặc tệp upload.');
				});
		}
	}, [playingId]);

	// Tua nhạc
	const handlePlayerSliderChange = (e) => {
		const val = Number(e.target.value);
		audioRef.current.currentTime = val;
		setCurrentTime(val);
	};

	// Convert base64 uploading helpers
	const handleAudioFileUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.size > 8 * 1024 * 1024) {
			toast.error('File âm thanh quá lớn! Giới hạn tối đa là 8MB để tránh vượt dung lượng LocalStorage.');
			return;
		}
		const reader = new FileReader();
		reader.onload = (uploadEvent) => {
			setFormAudioUrl(uploadEvent.target.result);
			toast.success('Đã tải và đính kèm file âm thanh thành công!');
		};
		reader.readAsDataURL(file);
	};

	const handleImageFileUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error('Ảnh minh họa quá lớn! Giới hạn tối đa là 2MB.');
			return;
		}
		const reader = new FileReader();
		reader.onload = (uploadEvent) => {
			setFormImage(uploadEvent.target.result);
			toast.success('Đã tải ảnh minh họa bài nghe thành công!');
		};
		reader.readAsDataURL(file);
	};

	const handleChoiceImageUpload = (qIndex, cIndex, e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error('Ảnh đáp án quá lớn! Giới hạn tối đa là 2MB.');
			return;
		}
		const reader = new FileReader();
		reader.onload = (uploadEvent) => {
			const updated = [...formQuestions];
			if (!updated[qIndex].choiceImages) {
				updated[qIndex].choiceImages = ['', '', '', ''];
			}
			updated[qIndex].choiceImages[cIndex] = uploadEvent.target.result;
			setFormQuestions(updated);
			toast.success(`Đã tải ảnh cho đáp án ${cIndex + 1} thành công!`);
		};
		reader.readAsDataURL(file);
	};

	const handleOpenAdd = () => {
		setEditingItem(null);
		setShowModal(true);
	};

	const handleOpenEdit = (item) => {
		setEditingItem(item);
		setShowModal(true);
	};

	const handleDelete = async (item) => {
		if (window.confirm(`Bạn có chắc chắn muốn xóa bài nghe "${item.titleVi}" không?`)) {
			try {
				const res = await adminListeningService.delete(item._id);
				if (res.success) {
					toast.success('Xóa bài nghe thành công!');
					loadData();
					if (playingId === item._id) {
						audioRef.current.pause();
						setPlayingId(null);
					}
				}
			} catch (error) {
				toast.error('Lỗi khi xóa: ' + getApiErrorMessage(error));
			}
		}
	};

	const handleSubmitForm = async (payload) => {
		try {
			if (editingItem) {
				const res = await adminListeningService.update(editingItem._id, payload);
				if (res.success) {
					toast.success('Cập nhật bài luyện nghe thành công!');
					loadData();
					setShowModal(false);
				}
			} else {
				const res = await adminListeningService.create(payload);
				if (res.success) {
					toast.success('Thêm bài luyện nghe mới thành công!');
					loadData();
					setShowModal(false);
				}
			}
		} catch (error) {
			toast.error('Lỗi lưu bài nghe: ' + getApiErrorMessage(error));
		}
	};

	// Search operations
	const submitSearch = (e) => {
		e.preventDefault();
		setSearchQuery(searchDraft.trim());
		setPage(1);
	};

	const handleRefresh = () => {
		setSearchDraft('');
		setSearchQuery('');
		setJlptFilter('');
		setTypeFilter('');
		setStatusFilter('all');
		setPage(1);
		toast.success('Đã khôi phục bộ lọc mặc định.');
	};

	// Statistics Dashboard logic
	const stats = useMemo(() => {
		const total = items.length;
		const published = items.filter(x => x.isPublished).length;
		const drafts = total - published;
		
		const levelCounts = { N1: 0, N2: 0, N3: 0, N4: 0, N5: 0 };
		const typeCounts = { task: 0, point: 0, summary: 0, utterance: 0, response: 0 };
		let totalSeconds = 0;
		
		items.forEach(item => {
			if (levelCounts[item.jlpt] !== undefined) levelCounts[item.jlpt]++;
			if (typeCounts[item.type] !== undefined) typeCounts[item.type]++;
			totalSeconds += Number(item.duration) || 0;
		});
		
		return {
			total,
			published,
			drafts,
			levelCounts,
			typeCounts,
			totalMinutes: Math.round(totalSeconds / 60)
		};
	}, [items]);

	// Filtered & Paginated items
	const filteredItems = useMemo(() => {
		return items.filter(item => {
			const matchesJlpt = !jlptFilter || item.jlpt === jlptFilter;
			const matchesType = !typeFilter || item.type === typeFilter;
			
			let matchesStatus = true;
			if (statusFilter === 'published') matchesStatus = item.isPublished;
			if (statusFilter === 'draft') matchesStatus = !item.isPublished;

			let matchesSearch = true;
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const tVi = (item.titleVi || '').toLowerCase();
				const tJa = (item.titleJa || '').toLowerCase();
				const scrJa = (item.scriptJa || '').toLowerCase();
				const scrVi = (item.scriptVi || '').toLowerCase();
				matchesSearch = tVi.includes(query) || tJa.includes(query) || scrJa.includes(query) || scrVi.includes(query);
			}

			return matchesJlpt && matchesType && matchesStatus && matchesSearch;
		}).sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));
	}, [items, jlptFilter, typeFilter, statusFilter, searchQuery]);

	const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	const paginatedItems = useMemo(() => {
		const start = (page - 1) * itemsPerPage;
		return filteredItems.slice(start, start + itemsPerPage);
	}, [filteredItems, page]);

	// Time utilities
	const formatAudioTime = (sec) => {
		if (isNaN(sec) || sec === null) return '0:00';
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	};

	return (
		<div className="admin-grammar-container kaiwa-page-container">
			{/* Admin Header Title */}
			<div className="admin-grammar-header">
				<h1 className="admin-grammar-title">QUẢN TRỊ BÀI LUYỆN NGHE CHOUKAI (JLPT)</h1>
				<p className="admin-grammar-subtitle">
					Thiết lập kho lưu trữ các bài nghe trắc nghiệm âm thanh, kịch bản furigana song ngữ và minh họa trực quan.
				</p>
			</div>

			{/* KPI Dashboard Cards */}
			<div className="kaiwa-stats-grid">
				<div className="kaiwa-stat-card">
					<span className="kaiwa-stat-title">TỔNG SỐ BÀI NGHE</span>
					<span className="kaiwa-stat-value">{stats.total}</span>
					<span className="kaiwa-stat-subtitle">
						🟢 {stats.published} Đã bật &nbsp;&nbsp; ⚪ {stats.drafts} Nháp
					</span>
				</div>

				<div className="kaiwa-stat-card">
					<span className="kaiwa-stat-title">PHÂN BỐ TRÌNH ĐỘ JLPT</span>
					<div className="kaiwa-stat-levels">
						<span className="kaiwa-level-badge kaiwa-level-badge--n1">N1: {stats.levelCounts.N1}</span>
						<span className="kaiwa-level-badge kaiwa-level-badge--n2">N2: {stats.levelCounts.N2}</span>
						<span className="kaiwa-level-badge kaiwa-level-badge--n3">N3: {stats.levelCounts.N3}</span>
						<span className="kaiwa-level-badge kaiwa-level-badge--n4">N4: {stats.levelCounts.N4}</span>
						<span className="kaiwa-level-badge kaiwa-level-badge--n5">N5: {stats.levelCounts.N5}</span>
					</div>
					<span className="kaiwa-stat-subtitle" style={{ marginTop: '10px' }}>Đủ cấp độ từ căn bản tới nâng cao</span>
				</div>

				<div className="kaiwa-stat-card">
					<span className="kaiwa-stat-title">PHÂN LOẠI DẠNG BÀI</span>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: '6px' }}>
						<span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Nhiệm vụ: {stats.typeCounts.task}</span>
						<span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Chi tiết: {stats.typeCounts.point}</span>
						<span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Khái quát: {stats.typeCounts.summary}</span>
						<span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Tình huống: {stats.typeCounts.utterance}</span>
					</div>
					<span style={{ fontSize: '0.74rem', fontWeight: 600, marginTop: '2px' }}>Phản xạ: {stats.typeCounts.response}</span>
				</div>

				<div className="kaiwa-stat-card">
					<span className="kaiwa-stat-title">THỜI LƯỢNG NỘI DUNG</span>
					<span className="kaiwa-stat-value">~ {stats.totalMinutes} phút</span>
					<span className="kaiwa-stat-subtitle">Tổng thời gian băng ghi âm gốc</span>
				</div>
			</div>

			{/* Filters and Actions Toolbar */}
			<div className="admin-grammar-toolbar">
				<div className="admin-grammar-filters">
					<div className="admin-grammar-field">
						<label htmlFor="k-jlpt">Cấp độ JLPT</label>
						<select
							id="k-jlpt"
							value={jlptFilter}
							onChange={(e) => setJlptFilter(e.target.value)}
						>
							<option value="">Tất cả</option>
							{JLPT_LEVELS.map((lv) => (
								<option key={lv} value={lv}>{lv}</option>
							))}
						</select>
					</div>

					<div className="admin-grammar-field">
						<label htmlFor="k-type">Dạng bài nghe</label>
						<select
							id="k-type"
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
						>
							<option value="">Tất cả dạng bài</option>
							{LISTENING_TYPES.map((t) => (
								<option key={t.key} value={t.key}>{t.labelVi} ({t.labelJa})</option>
							))}
						</select>
					</div>

					<div className="admin-grammar-field">
						<label htmlFor="k-status">Trạng thái</label>
						<select
							id="k-status"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Tất cả</option>
							<option value="published">Đang hiển thị</option>
							<option value="draft">Bản nháp</option>
						</select>
					</div>

					<form className="admin-grammar-search" onSubmit={submitSearch}>
						<label htmlFor="k-q">Tìm kiếm bài nghe</label>
						<input
							id="k-q"
							type="search"
							value={searchDraft}
							onChange={(e) => setSearchDraft(e.target.value)}
							placeholder="Nhập tiêu đề, kịch bản..."
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
						onClick={handleRefresh}
					>
						Làm mới
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={handleOpenAdd}
					>
						Thêm bài nghe
					</button>
				</div>
			</div>

			{/* Main Exercises Table */}
			{filteredItems.length === 0 ? (
				<p className="admin-grammar-status">Không tìm thấy bài nghe nào khớp với bộ lọc.</p>
			) : (
				<div className="admin-grammar-table-wrap">
					<table className="admin-grammar-table">
						<thead>
							<tr>
								<th style={{ width: '60px' }}>Thứ tự</th>
								<th style={{ width: '80px' }}>JLPT</th>
								<th style={{ width: '180px' }}>Dạng bài</th>
								<th>Tiêu đề</th>
								<th style={{ width: '130px' }}>Thời lượng</th>
								<th style={{ width: '90px' }}>Số câu hỏi</th>
								<th style={{ width: '90px' }}>Trạng thái</th>
								<th style={{ width: '220px' }}>Thao tác</th>
							</tr>
						</thead>
						<tbody>
							{paginatedItems.map((row) => {
								const isExpanded = expandedRowId === row._id;
								const currentType = LISTENING_TYPES.find(x => x.key === row.type);
								
								return (
									<Fragment key={row._id}>
										{/* Standard Row */}
										<tr>
											<td>{row.displayOrder || 1}</td>
											<td>
												<span className={`kaiwa-level-badge kaiwa-level-badge--${String(row.jlpt).toLowerCase()}`}>
													{row.jlpt}
												</span>
											</td>
											<td>
												<span className={`kaiwa-type-chip kaiwa-type--${row.type}`}>
													{currentType ? currentType.labelJa : row.type}
												</span>
											</td>
											<td>
												<div style={{ fontWeight: 700, color: 'var(--admin-ink)' }}>{row.titleVi}</div>
												<div lang="ja" style={{ fontSize: '0.78rem', color: 'var(--admin-ink-soft)', fontFamily: 'var(--font-jp)' }}>
													{row.titleJa}
												</div>
											</td>
											<td>
												<button
													type="button"
													className={`kaiwa-audio-trigger ${playingId === row._id ? 'kaiwa-audio-trigger--playing' : ''}`}
													onClick={() => togglePlayAudio(row._id, row.audioUrl)}
												>
													<img
														src={playingId === row._id ? LISTENING_ASSETS.iconPause : LISTENING_ASSETS.iconPlay}
														alt=""
														width={14}
														height={14}
														decoding="async"
													/>
													<span>{playingId === row._id ? 'Tạm dừng' : 'Nghe thử'}</span>
													<span style={{ fontSize: '0.7rem', opacity: 0.8 }}> ({formatAudioTime(row.duration)})</span>
												</button>
											</td>
											<td style={{ fontWeight: 700, textAlign: 'center' }}>
												{row.questions ? row.questions.length : 0}
											</td>
											<td>
												<span className={`admin-grammar-chip ${!row.isPublished ? 'admin-grammar-chip--off' : ''}`}>
													{row.isPublished ? 'Hiển thị' : 'Bản nháp'}
												</span>
											</td>
											<td>
												<div className="admin-grammar-row-actions">
													<button
														type="button"
														className="admin-grammar-btn admin-grammar-btn--ghost"
														onClick={() => setExpandedRowId(isExpanded ? null : row._id)}
														style={{ background: isExpanded ? 'rgba(107, 126, 95, 0.15)' : '' }}
													>
														{isExpanded ? 'Ẩn chi tiết' : 'Chi tiết'}
													</button>
													<button
														type="button"
														className="admin-grammar-btn admin-grammar-btn--ghost"
														onClick={() => handleOpenEdit(row)}
													>
														Sửa
													</button>
													<button
														type="button"
														className="admin-grammar-btn admin-grammar-btn--danger"
														onClick={() => handleDelete(row)}
													>
														Xóa
													</button>
												</div>
											</td>
										</tr>

										{/* Expanded Details Row */}
										{isExpanded && (
											<tr className="kaiwa-detail-row">
												<td colSpan="8" className="kaiwa-detail-cell">
													<div className="kaiwa-detail-container">
														
														{/* Left Column: Script and Translation */}
														<div className="kaiwa-detail-panel">
															<div className="kaiwa-panel-title">
																<span>BĂNG HỘI THOẠI & DỊCH NGHĨA</span>
																<div className="kaiwa-detail-tabs">
																	<button
																		type="button"
																		className={`kaiwa-tab-btn ${detailTab === 'ja' ? 'kaiwa-tab-btn--active' : ''}`}
																		onClick={() => setDetailTab('ja')}
																	>
																		Bản gốc tiếng Nhật
																	</button>
																	<button
																		type="button"
																		className={`kaiwa-tab-btn ${detailTab === 'vi' ? 'kaiwa-tab-btn--active' : ''}`}
																		onClick={() => setDetailTab('vi')}
																	>
																		Bản dịch tiếng Việt
																	</button>
																</div>
															</div>

															{/* Custom Player or YouTube embed inside details */}
															{(() => {
																const ytId = getYoutubeId(row.audioUrl);
																if (ytId) {
																	return (
																		<div className="kaiwa-youtube-player-wrapper" style={{ marginBottom: '14px' }}>
																			<iframe 
																				width="100%" 
																				height="140" 
																				src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0&showinfo=0`}
																				title="YouTube Audio Player" 
																				frameBorder="0" 
																				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
																				allowFullScreen
																				style={{ borderRadius: '12px', border: '1px solid rgba(107, 126, 95, 0.2)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}
																			/>
																			<div style={{ fontSize: '0.7rem', color: 'var(--admin-ink-soft)', marginTop: '4px', textAlign: 'center', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
																				<img src={LISTENING_ASSETS.iconAudio} alt="" width={16} height={16} decoding="async" />
																				<span>Phát âm thanh bài nghe từ YouTube tích hợp</span>
																			</div>
																		</div>
																	);
																} else if (playingId === row._id) {
																	return (
																		<div className="kaiwa-custom-player" style={{ marginBottom: '14px' }}>
																			<button
																				type="button"
																				className="kaiwa-player-btn"
																				onClick={() => togglePlayAudio(row._id, row.audioUrl)}
																				aria-label="Tạm dừng"
																			>
																				<img src={LISTENING_ASSETS.iconPause} alt="" width={20} height={20} decoding="async" />
																			</button>
																			<div className="kaiwa-player-progress-container">
																				<span className="kaiwa-player-time">{formatAudioTime(currentTime)}</span>
																				<input
																					type="range"
																					className="kaiwa-player-slider"
																					min="0"
																					max={duration || row.duration || 100}
																					value={currentTime}
																					onChange={handlePlayerSliderChange}
																				/>
																				<span className="kaiwa-player-time">{formatAudioTime(duration || row.duration)}</span>
																			</div>
																		</div>
																	);
																}
																return null;
															})()}

															{/* Exercise Attachment Image */}
															{row.image && (
																<div className="kaiwa-script-image-wrap" style={{ marginBottom: '14px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(107, 126, 95, 0.15)', textAlign: 'center', background: '#fff', padding: '8px' }}>
																	<img src={row.image} alt="Bản vẽ minh họa bài nghe" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
																</div>
															)}

															<div 
																className={`kaiwa-script-content ${detailTab === 'ja' ? 'kaiwa-script-content--ja' : ''}`}
																lang={detailTab === 'ja' ? 'ja' : 'vi'}
															>
																{detailTab === 'ja' ? row.scriptJa : row.scriptVi}
															</div>
														</div>

														{/* Right Column: Questions, Choices, Answers */}
														<div className="kaiwa-detail-panel">
															<div className="kaiwa-panel-title">
																<span>CÂU HỎI TRẮC NGHIỆM ({row.questions?.length || 0})</span>
															</div>

															<div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
																{(row.questions || []).map((q, qIndex) => (
																	<div key={qIndex} className="kaiwa-detail-question-item">
																		<div className="kaiwa-dq-title">
																			Câu {qIndex + 1}: {q.questionVi}
																			{q.questionJa && (
																				<div lang="ja" style={{ fontSize: '0.8rem', color: 'var(--admin-ink-soft)', marginTop: '2px', fontFamily: 'var(--font-jp)' }}>
																					{q.questionJa}
																				</div>
																			)}
																		</div>

																		<div className="kaiwa-dq-choices">
																			{(() => {
																				const hasChoiceImages = (q.choiceImages || []).some(img => !!img);
																				if (hasChoiceImages) {
																					return (
																						<div className="kaiwa-dq-choices-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px', marginBottom: '8px' }}>
																							{(q.choices || []).map((c, cIndex) => {
																								const isCorrect = cIndex === q.answerIndex;
																								const choiceImg = q.choiceImages?.[cIndex];
																								return (
																									<div 
																										key={cIndex}
																										className={`kaiwa-dq-choice-card ${isCorrect ? 'kaiwa-dq-choice-card--correct' : ''}`}
																										style={{ 
																											border: isCorrect ? '2px solid #28a745' : '1px solid rgba(90, 107, 56, 0.2)',
																											borderRadius: '10px',
																											padding: '8px',
																											background: isCorrect ? 'rgba(40, 167, 69, 0.04)' : '#fff',
																											textAlign: 'center',
																											display: 'flex',
																											flexDirection: 'column',
																											justifyContent: 'space-between',
																											gap: '4px',
																											position: 'relative',
																											minHeight: '120px'
																										}}
																									>
																										<span 
																											className="kaiwa-dq-choice-num" 
																											style={{ 
																												position: 'absolute', 
																												top: '6px', 
																												left: '6px',
																												backgroundColor: isCorrect ? '#28a745' : 'rgba(90, 107, 56, 0.1)',
																												color: isCorrect ? '#fff' : 'var(--admin-ink)',
																												width: '20px',
																												height: '20px',
																												fontSize: '0.72rem',
																												display: 'flex',
																												alignItems: 'center',
																												justifyContent: 'center',
																												borderRadius: '50%',
																												fontWeight: 'bold'
																											}}
																										>
																											{cIndex + 1}
																										</span>
																										
																										<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
																											{choiceImg ? (
																												<img 
																													src={choiceImg} 
																													alt={`Đáp án ${cIndex + 1}`} 
																													style={{ height: '70px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
																												/>
																											) : (
																												<div style={{ fontSize: '0.7rem', color: '#999', fontStyle: 'italic' }}>
																													(Đáp án chữ)
																												</div>
																											)}
																										</div>
																										
																										{c && (
																											<div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--admin-ink)', marginTop: '4px' }}>
																												{c}
																											</div>
																										)}
																									</div>
																								);
																							})}
																						</div>
																					);
																				} else {
																					return (q.choices || []).map((c, cIndex) => {
																						const isCorrect = cIndex === q.answerIndex;
																						return (
																							<div
																								key={cIndex}
																								className={`kaiwa-dq-choice-row ${isCorrect ? 'kaiwa-dq-choice-row--correct' : ''}`}
																							>
																								<span className="kaiwa-dq-choice-num">{cIndex + 1}</span>
																								<span>{c}</span>
																							</div>
																						);
																					});
																				}
																			})()}
																		</div>

																		{(q.explainVi || q.explainJa) && (
																			<div className="kaiwa-dq-explain">
																				<strong>Giải thích:</strong> {q.explainVi || q.explainJa}
																			</div>
																		)}
																	</div>
																))}
															</div>
														</div>

													</div>
												</td>
											</tr>
										)}
									</Fragment>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<nav className="admin-grammar-pagination" aria-label="Phân trang bài nghe">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage(p => Math.max(1, p - 1))}
					>
						Trước
					</button>
					<span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--admin-ink-soft)' }}>
						Trang {page} / {totalPages}
					</span>
					<button
						type="button"
						disabled={page >= totalPages}
						onClick={() => setPage(p => Math.min(totalPages, p + 1))}
					>
						Sau
					</button>
				</nav>
			)}

			{/* Premium Multi-Tab Add/Edit Modal */}
			<ListeningFormModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				initialData={editingItem}
				onSubmit={handleSubmitForm}
			/>
		</div>
	);
}
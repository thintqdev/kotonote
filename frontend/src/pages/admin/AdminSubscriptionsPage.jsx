import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AdminCheckoutReceiptModal from '../../components/admin/AdminCheckoutReceiptModal.jsx';
import AdminMembershipEditModal from '../../components/admin/AdminMembershipEditModal.jsx';
import {
	CHECKOUT_STATUS_OPTIONS,
	MEMBERSHIP_TIER_OPTIONS,
	checkoutStatusLabel,
	membershipTierLabel,
} from '../../constants/adminMembershipFieldMeta.js';
import { formatVnd } from '../../constants/membershipPlans.js';
import {
	getAdminMembershipStatistics,
	listAdminMembershipCheckouts,
	listAdminMembershipUsers,
	refundAdminCheckout,
} from '../../services/adminMembershipService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import './AdminGrammarPage.css';
import './AdminUsersPage.css';
import './AdminSubscriptionsPage.css';
import '../VocabularyPages.css';
import '../ReadingListPage.css';

const PAGE_LIMIT = 15;

function formatShortDate(v) {
	if (!v) return '—';
	try {
		return new Date(v).toLocaleString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return '—';
	}
}

function checkoutStatusClass(status) {
	if (status === 'paid') return 'admin-subs-checkout-status--paid';
	if (status === 'pending') return 'admin-subs-checkout-status--pending';
	if (status === 'refunded') return 'admin-subs-checkout-status--refunded';
	if (status === 'expired' || status === 'cancelled') {
		return 'admin-subs-checkout-status--expired';
	}
	return '';
}

export default function AdminSubscriptionsPage() {
	const [activeTab, setActiveTab] = useState('users');

	const [stats, setStats] = useState(null);
	const [statsLoading, setStatsLoading] = useState(true);

	const [tierFilter, setTierFilter] = useState('');
	const [membershipStatus, setMembershipStatus] = useState('');
	const [userSearch, setUserSearch] = useState('');
	const [userSearchDraft, setUserSearchDraft] = useState('');
	const [userPage, setUserPage] = useState(1);
	const [users, setUsers] = useState([]);
	const [userPagination, setUserPagination] = useState(null);
	const [usersLoading, setUsersLoading] = useState(true);
	const [usersError, setUsersError] = useState('');

	const [checkoutStatus, setCheckoutStatus] = useState('');
	const [checkoutSearch, setCheckoutSearch] = useState('');
	const [checkoutSearchDraft, setCheckoutSearchDraft] = useState('');
	const [checkoutPage, setCheckoutPage] = useState(1);
	const [checkouts, setCheckouts] = useState([]);
	const [checkoutPagination, setCheckoutPagination] = useState(null);
	const [checkoutsLoading, setCheckoutsLoading] = useState(true);
	const [checkoutsError, setCheckoutsError] = useState('');

	const [editOpen, setEditOpen] = useState(false);
	const [editUser, setEditUser] = useState(null);
	const [refundingId, setRefundingId] = useState('');
	const [receiptCheckoutId, setReceiptCheckoutId] = useState('');

	const loadStats = useCallback(async () => {
		setStatsLoading(true);
		try {
			const data = await getAdminMembershipStatistics();
			setStats(data);
		} catch (e) {
			toast.error('Không tải thống kê', { description: getApiErrorMessage(e) });
		} finally {
			setStatsLoading(false);
		}
	}, []);

	const userQuery = useMemo(() => {
		const p = { page: userPage, limit: PAGE_LIMIT };
		if (tierFilter) p.tierId = tierFilter;
		if (membershipStatus) p.membershipStatus = membershipStatus;
		if (userSearch.trim()) p.search = userSearch.trim();
		return p;
	}, [userPage, tierFilter, membershipStatus, userSearch]);

	const loadUsers = useCallback(async () => {
		setUsersLoading(true);
		setUsersError('');
		try {
			const data = await listAdminMembershipUsers(userQuery);
			setUsers(data.users ?? []);
			setUserPagination(data.pagination ?? null);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			setUsersError(msg);
			setUsers([]);
		} finally {
			setUsersLoading(false);
		}
	}, [userQuery]);

	const checkoutQuery = useMemo(() => {
		const p = { page: checkoutPage, limit: PAGE_LIMIT };
		if (checkoutStatus) p.status = checkoutStatus;
		if (checkoutSearch.trim()) p.search = checkoutSearch.trim();
		return p;
	}, [checkoutPage, checkoutStatus, checkoutSearch]);

	const handleRefundCheckout = async (checkoutId) => {
		const reason = window.prompt(
			'Lý do hoàn tiền (tuỳ chọn). Hoàn tiền PayOS thực tế cần xử lý trên dashboard PayOS.',
			'',
		);
		if (reason === null) return;
		setRefundingId(checkoutId);
		try {
			const result = await refundAdminCheckout(checkoutId, {
				reason: reason.trim() || undefined,
				revokeMembership: true,
			});
			toast.success('Đã ghi nhận hoàn tiền', {
				description: result.membershipRevoked
					? 'Đã thu hồi gói membership của user.'
					: 'Checkout đã đánh dấu refunded.',
			});
			void loadCheckouts();
			void loadUsers();
		} catch (e) {
			toast.error('Hoàn tiền thất bại', { description: getApiErrorMessage(e) });
		} finally {
			setRefundingId('');
		}
	};

	const loadCheckouts = useCallback(async () => {
		setCheckoutsLoading(true);
		setCheckoutsError('');
		try {
			const data = await listAdminMembershipCheckouts(checkoutQuery);
			setCheckouts(data.checkouts ?? []);
			setCheckoutPagination(data.pagination ?? null);
		} catch (e) {
			const msg = getApiErrorMessage(e);
			setCheckoutsError(msg);
			setCheckouts([]);
		} finally {
			setCheckoutsLoading(false);
		}
	}, [checkoutQuery]);

	useEffect(() => {
		void loadStats();
	}, [loadStats]);

	useEffect(() => {
		if (activeTab !== 'users') return;
		void loadUsers();
	}, [activeTab, loadUsers]);

	useEffect(() => {
		if (activeTab !== 'checkouts') return;
		void loadCheckouts();
	}, [activeTab, loadCheckouts]);

	useEffect(() => {
		setUserPage(1);
	}, [tierFilter, membershipStatus, userSearch]);

	useEffect(() => {
		setCheckoutPage(1);
	}, [checkoutStatus, checkoutSearch]);

	const submitUserSearch = (e) => {
		e.preventDefault();
		setUserSearch(userSearchDraft.trim());
	};

	const submitCheckoutSearch = (e) => {
		e.preventDefault();
		setCheckoutSearch(checkoutSearchDraft.trim());
	};

	const statCards = useMemo(() => {
		if (!stats?.usersByTier) return [];
		return [
			{ label: 'Free', value: stats.usersByTier.free?.active ?? 0 },
			{ label: 'Pro', value: stats.usersByTier.pro?.active ?? 0 },
			{ label: 'Ultra', value: stats.usersByTier.ultra?.active ?? 0 },
			{ label: 'Ultimate', value: stats.usersByTier.ultimate?.active ?? 0 },
			{
				label: 'Doanh thu (đã TT)',
				value: formatVnd(stats.revenue?.paidTotalVnd ?? 0),
			},
			{
				label: 'Checkout chờ',
				value: stats.checkoutsByStatus?.pending ?? 0,
			},
		];
	}, [stats]);

	return (
		<div className="admin-stub-main admin-subs-page admin-grammar-page">
			<h1 className="admin-grammar-title">Gói membership (Subscription)</h1>
			<p className="admin-grammar-lead">
				Quản lý gói người dùng, JLPT mở khóa và lịch sử thanh toán checkout.
			</p>

			{statsLoading ? (
				<p className="admin-grammar-status">Đang tải thống kê…</p>
			) : (
				<div className="admin-users-stats">
					{statCards.map((c) => (
						<div key={c.label} className="admin-users-stat">
							<div className="admin-users-stat-value">{c.value}</div>
							<div className="admin-users-stat-label">{c.label}</div>
						</div>
					))}
				</div>
			)}

			<div
				className="vocab-tabs reading-jlpt-tabs"
				role="tablist"
				aria-label="Phần quản lý subscription"
			>
				<button
					type="button"
					role="tab"
					aria-selected={activeTab === 'users'}
					className={`vocab-tab${activeTab === 'users' ? ' vocab-tab--active' : ''}`}
					onClick={() => setActiveTab('users')}
				>
					Người dùng & gói
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={activeTab === 'checkouts'}
					className={`vocab-tab${activeTab === 'checkouts' ? ' vocab-tab--active' : ''}`}
					onClick={() => setActiveTab('checkouts')}
				>
					Lịch sử checkout
				</button>
			</div>

			{activeTab === 'users' && (
				<>
					<div className="admin-grammar-toolbar">
						<div className="admin-grammar-filters">
							<div className="admin-grammar-field">
								<label htmlFor="subs-tier">Gói</label>
								<select
									id="subs-tier"
									value={tierFilter}
									onChange={(e) => setTierFilter(e.target.value)}
								>
									<option value="">Tất cả</option>
									{MEMBERSHIP_TIER_OPTIONS.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
							</div>
							<div className="admin-grammar-field">
								<label htmlFor="subs-mstatus">Trạng thái gói</label>
								<select
									id="subs-mstatus"
									value={membershipStatus}
									onChange={(e) => setMembershipStatus(e.target.value)}
								>
									<option value="">Tất cả</option>
									<option value="active">Đang hoạt động</option>
									<option value="expired">Hết hạn</option>
								</select>
							</div>
							<form className="admin-grammar-search" onSubmit={submitUserSearch}>
								<label htmlFor="subs-uq">Tìm kiếm</label>
								<input
									id="subs-uq"
									type="search"
									value={userSearchDraft}
									onChange={(e) => setUserSearchDraft(e.target.value)}
									placeholder="Email, tên…"
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
								onClick={() => void loadUsers()}
								disabled={usersLoading}
							>
								Làm mới
							</button>
						</div>
					</div>

					{usersLoading ? (
						<p className="admin-grammar-status">Đang tải…</p>
					) : usersError ? (
						<p className="admin-grammar-status admin-grammar-status--error" role="alert">
							{usersError}
						</p>
					) : users.length === 0 ? (
						<p className="admin-grammar-status">Không có người dùng khớp bộ lọc.</p>
					) : (
						<div className="admin-grammar-table-wrap">
							<table className="admin-grammar-table">
								<thead>
									<tr>
										<th>Người dùng</th>
										<th>Gói</th>
										<th>Thanh toán</th>
										<th>JLPT</th>
										<th>Trạng thái</th>
										<th>Hết hạn</th>
										<th>Thao tác</th>
									</tr>
								</thead>
								<tbody>
									{users.map((row) => {
										const m = row.membership ?? {};
										return (
											<tr key={row.id ?? row._id}>
												<td>
													<div className="admin-grammar-cell-text">{row.name}</div>
													<div style={{ fontSize: '0.78rem', color: 'var(--admin-ink-soft)' }}>
														{row.email}
													</div>
												</td>
												<td>
													<span
														className={`admin-subs-tier-chip admin-subs-tier-chip--${m.tierId || 'free'}`}
													>
														{membershipTierLabel(m.tierId)}
													</span>
												</td>
												<td>{m.billing || '—'}</td>
												<td>{(m.jlptUnlocked || []).join(', ') || '—'}</td>
												<td>
													<span
														className={`admin-grammar-chip${m.status === 'expired' ? ' admin-grammar-chip--off' : ''}`}
													>
														{m.status === 'expired' ? 'Hết hạn' : 'Hoạt động'}
													</span>
												</td>
												<td>{formatShortDate(m.expiresAt)}</td>
												<td>
													<button
														type="button"
														className="admin-grammar-btn admin-grammar-btn--ghost"
														onClick={() => {
															setEditUser(row);
															setEditOpen(true);
														}}
													>
														Chỉnh gói
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}

					{userPagination && userPagination.pages > 1 ? (
						<nav className="admin-grammar-pagination" aria-label="Phân trang người dùng">
							<button
								type="button"
								disabled={userPage <= 1 || usersLoading}
								onClick={() => setUserPage((p) => Math.max(1, p - 1))}
							>
								Trước
							</button>
							<span>
								Trang {userPagination.page} / {userPagination.pages}
							</span>
							<button
								type="button"
								disabled={userPage >= userPagination.pages || usersLoading}
								onClick={() =>
									setUserPage((p) => Math.min(userPagination.pages, p + 1))
								}
							>
								Sau
							</button>
						</nav>
					) : null}
				</>
			)}

			{activeTab === 'checkouts' && (
				<>
					<div className="admin-grammar-toolbar">
						<div className="admin-grammar-filters">
							<div className="admin-grammar-field">
								<label htmlFor="subs-cstatus">Trạng thái checkout</label>
								<select
									id="subs-cstatus"
									value={checkoutStatus}
									onChange={(e) => setCheckoutStatus(e.target.value)}
								>
									{CHECKOUT_STATUS_OPTIONS.map((o) => (
										<option key={o.value || 'all'} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
							</div>
							<form className="admin-grammar-search" onSubmit={submitCheckoutSearch}>
								<label htmlFor="subs-cq">Tìm người dùng</label>
								<input
									id="subs-cq"
									type="search"
									value={checkoutSearchDraft}
									onChange={(e) => setCheckoutSearchDraft(e.target.value)}
									placeholder="Email, tên…"
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
								onClick={() => void loadCheckouts()}
								disabled={checkoutsLoading}
							>
								Làm mới
							</button>
						</div>
					</div>

					{checkoutsLoading ? (
						<p className="admin-grammar-status">Đang tải…</p>
					) : checkoutsError ? (
						<p className="admin-grammar-status admin-grammar-status--error" role="alert">
							{checkoutsError}
						</p>
					) : checkouts.length === 0 ? (
						<p className="admin-grammar-status">Chưa có checkout nào.</p>
					) : (
						<div className="admin-grammar-table-wrap">
							<table className="admin-grammar-table">
								<thead>
									<tr>
										<th>Thời gian</th>
										<th>Người dùng</th>
										<th>Gói</th>
										<th>Số tiền</th>
										<th>Trạng thái</th>
										<th>Thanh toán lúc</th>
										<th>Thao tác</th>
									</tr>
								</thead>
								<tbody>
									{checkouts.map((c) => (
										<tr key={c.id ?? c._id}>
											<td>{formatShortDate(c.createdAt)}</td>
											<td>
												<div className="admin-grammar-cell-text">
													{c.user?.name ?? '—'}
												</div>
												<div style={{ fontSize: '0.78rem', color: 'var(--admin-ink-soft)' }}>
													{c.user?.email ?? c.userId}
												</div>
											</td>
											<td>
												{membershipTierLabel(c.tierId)} · {c.billing}
											</td>
											<td>{formatVnd(c.amountVnd)}</td>
											<td>
												<span
													className={`admin-subs-checkout-status ${checkoutStatusClass(c.status)}`}
												>
													{checkoutStatusLabel(c.status)}
												</span>
											</td>
											<td>{formatShortDate(c.paidAt)}</td>
											<td className="admin-subs-actions">
												{(c.status === 'paid' ||
													c.status === 'refunded') && (
													<button
														type="button"
														className="admin-subs-link"
														onClick={() =>
															setReceiptCheckoutId(c.id ?? c._id)
														}
													>
														Biên lai
													</button>
												)}
												{c.status === 'paid' ? (
													<button
														type="button"
														className="admin-subs-link admin-subs-link--danger"
														disabled={
															refundingId === (c.id ?? c._id)
														}
														onClick={() =>
															void handleRefundCheckout(
																c.id ?? c._id,
															)
														}
													>
														{refundingId === (c.id ?? c._id)
															? '…'
															: 'Hoàn tiền'}
													</button>
												) : null}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{checkoutPagination && checkoutPagination.pages > 1 ? (
						<nav className="admin-grammar-pagination" aria-label="Phân trang checkout">
							<button
								type="button"
								disabled={checkoutPage <= 1 || checkoutsLoading}
								onClick={() => setCheckoutPage((p) => Math.max(1, p - 1))}
							>
								Trước
							</button>
							<span>
								Trang {checkoutPagination.page} / {checkoutPagination.pages}
							</span>
							<button
								type="button"
								disabled={checkoutPage >= checkoutPagination.pages || checkoutsLoading}
								onClick={() =>
									setCheckoutPage((p) => Math.min(checkoutPagination.pages, p + 1))
								}
							>
								Sau
							</button>
						</nav>
					) : null}
				</>
			)}

			<AdminMembershipEditModal
				open={editOpen}
				user={editUser}
				onClose={() => {
					setEditOpen(false);
					setEditUser(null);
				}}
				onSaved={() => {
					void loadUsers();
					void loadStats();
				}}
			/>

			<AdminCheckoutReceiptModal
				checkoutId={receiptCheckoutId}
				open={Boolean(receiptCheckoutId)}
				onClose={() => setReceiptCheckoutId('')}
			/>
		</div>
	);
}

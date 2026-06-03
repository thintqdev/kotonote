import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
	deleteAdminSentenceSpecialty,
	deleteAdminSentenceTemplate,
	listAdminSentenceSpecialties,
	listAdminSentenceTemplates,
	seedAdminSentenceTemplates,
} from '../../services/adminSentenceTemplateService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import './AdminGrammarPage.css';
import './AdminSentencePage.css';

export default function AdminSentencePage() {
	const [specialties, setSpecialties] = useState([]);
	const [templates, setTemplates] = useState([]);
	const [specialtyFilter, setSpecialtyFilter] = useState('');
	const [loading, setLoading] = useState(true);
	const [seeding, setSeeding] = useState(false);
	const [deletingId, setDeletingId] = useState('');

	const fetchAll = useCallback(async () => {
		setLoading(true);
		try {
			const [spRows, tplRows] = await Promise.all([
				listAdminSentenceSpecialties(),
				listAdminSentenceTemplates(
					specialtyFilter ? { specialtyId: specialtyFilter } : {},
				),
			]);
			setSpecialties(spRows);
			setTemplates(tplRows);
		} catch (e) {
			toast.error('Không tải được dữ liệu', {
				description: getApiErrorMessage(e),
			});
		} finally {
			setLoading(false);
		}
	}, [specialtyFilter]);

	useEffect(() => {
		void fetchAll();
	}, [fetchAll]);

	const specialtyMap = useMemo(
		() => Object.fromEntries(specialties.map((s) => [String(s._id), s])),
		[specialties],
	);

	const handleSeed = async () => {
		setSeeding(true);
		try {
			const result = await seedAdminSentenceTemplates();
			toast.success('Đã seed mẫu câu IT', {
				description: `${result.templateCount ?? 0} câu`,
			});
			await fetchAll();
		} catch (e) {
			toast.error('Seed thất bại', { description: getApiErrorMessage(e) });
		} finally {
			setSeeding(false);
		}
	};

	const handleDeleteTemplate = async (row) => {
		if (!row?._id) return;
		if (!window.confirm(`Xóa câu「${row.sentenceJa}」?`)) return;
		setDeletingId(row._id);
		try {
			await deleteAdminSentenceTemplate(String(row._id));
			toast.success('Đã xóa câu');
			await fetchAll();
		} catch (e) {
			toast.error('Không xóa được', { description: getApiErrorMessage(e) });
		} finally {
			setDeletingId('');
		}
	};

	const handleDeleteSpecialty = async (row) => {
		if (!row?._id) return;
		if (
			!window.confirm(
				`Xóa chuyên ngành「${row.nameVi}」 và toàn bộ câu liên quan?`,
			)
		) {
			return;
		}
		setDeletingId(row._id);
		try {
			await deleteAdminSentenceSpecialty(String(row._id));
			toast.success('Đã xóa chuyên ngành');
			setSpecialtyFilter('');
			await fetchAll();
		} catch (e) {
			toast.error('Không xóa được', { description: getApiErrorMessage(e) });
		} finally {
			setDeletingId('');
		}
	};

	return (
		<div className="admin-stub-main admin-grammar-page admin-sentence-page">
			<h1 className="admin-grammar-title">Mẫu câu chuyên ngành</h1>
			<p className="admin-grammar-lead">
				Quản lý chuyên ngành và mẫu câu tiếng Nhật theo tình huống công việc.
				Dùng seed để nạp bộ IT mẫu.
			</p>

			<div className="admin-grammar-toolbar admin-sentence-toolbar">
				<button
					type="button"
					className="admin-grammar-btn admin-grammar-btn--primary"
					disabled={seeding}
					onClick={handleSeed}
				>
					{seeding ? 'Đang seed…' : 'Seed bộ IT (10 câu)'}
				</button>
				<div className="admin-grammar-field">
					<label htmlFor="sp-filter">Chuyên ngành</label>
					<select
						id="sp-filter"
						value={specialtyFilter}
						onChange={(e) => setSpecialtyFilter(e.target.value)}
					>
						<option value="">Tất cả</option>
						{specialties.map((sp) => (
							<option key={sp._id} value={sp._id}>
								{sp.nameVi}
							</option>
						))}
					</select>
				</div>
			</div>

			{loading ? (
				<p>Đang tải…</p>
			) : (
				<>
					<section className="admin-sentence-section">
						<h2>Chuyên ngành ({specialties.length})</h2>
						{specialties.length === 0 ? (
							<p className="admin-sentence-empty">
								Chưa có chuyên ngành — bấm Seed bộ IT.
							</p>
						) : (
							<table className="admin-grammar-table">
								<thead>
									<tr>
										<th>Code</th>
										<th>Tên (VI)</th>
										<th>Tên (JA)</th>
										<th>Trạng thái</th>
										<th />
									</tr>
								</thead>
								<tbody>
									{specialties.map((sp) => (
										<tr key={sp._id}>
											<td>
												<code>{sp.code}</code>
											</td>
											<td>{sp.nameVi}</td>
											<td lang="ja">{sp.nameJa}</td>
											<td>{sp.isActive ? 'Active' : 'Ẩn'}</td>
											<td>
												<button
													type="button"
													className="admin-grammar-link-btn admin-grammar-link-btn--danger"
													disabled={deletingId === sp._id}
													onClick={() => handleDeleteSpecialty(sp)}
												>
													Xóa
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</section>

					<section className="admin-sentence-section">
						<h2>Mẫu câu ({templates.length})</h2>
						{templates.length === 0 ? (
							<p className="admin-sentence-empty">Chưa có mẫu câu.</p>
						) : (
							<table className="admin-grammar-table">
								<thead>
									<tr>
										<th>Chuyên ngành</th>
										<th>Tình huống</th>
										<th>Câu (JA)</th>
										<th>Cloze</th>
										<th />
									</tr>
								</thead>
								<tbody>
									{templates.map((tpl) => {
										const sp = specialtyMap[String(tpl.specialtyId?._id ?? tpl.specialtyId)];
										return (
											<tr key={tpl._id}>
												<td>{sp?.nameVi ?? '—'}</td>
												<td>{tpl.situationVi}</td>
												<td lang="ja">{tpl.sentenceJa}</td>
												<td lang="ja">{tpl.clozePart}</td>
												<td>
													<button
														type="button"
														className="admin-grammar-link-btn admin-grammar-link-btn--danger"
														disabled={deletingId === tpl._id}
														onClick={() => handleDeleteTemplate(tpl)}
													>
														Xóa
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						)}
					</section>
				</>
			)}
		</div>
	);
}

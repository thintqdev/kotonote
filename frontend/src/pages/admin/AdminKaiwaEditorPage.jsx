import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import GrammarLocFields from '../../components/admin/GrammarLocFields.jsx';
import {
	buildKaiwaAIGeneratePayload,
	KAIWA_AI_GENERATE,
} from '../../constants/editorAiGenerateConfig.js';
import {
	KAIWA_CATEGORY_OPTIONS,
	KAIWA_JLPT_LEVELS,
} from '../../constants/kaiwaFieldMeta.js';
import {
	createAdminKaiwaContext,
	getAdminKaiwaContext,
	updateAdminKaiwaContext,
} from '../../services/adminKaiwaService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import {
	contextToForm,
	emptyKaiwaKeyPhrase,
	emptyKaiwaRole,
	emptyKaiwaForm,
	formToContextPayload,
	mergeKaiwaAIIntoForm,
} from '../../utils/kaiwaForm.js';
import './AdminGrammarPage.css';
import './AdminKaiwaPage.css';

export default function AdminKaiwaEditorPage() {
	const { id } = useParams();
	const isEdit = Boolean(id && id !== 'new');
	const navigate = useNavigate();

	const [form, setForm] = useState(emptyKaiwaForm);
	const [loading, setLoading] = useState(isEdit);
	const [saving, setSaving] = useState(false);
	const [generating, setGenerating] = useState(false);

	useEffect(() => {
		if (!isEdit) return;
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const ctx = await getAdminKaiwaContext(id);
				if (!cancelled) setForm(contextToForm(ctx));
			} catch (e) {
				toast.error('Không tải được bối cảnh', {
					description: getApiErrorMessage(e),
				});
				navigate('/admin/kaiwa', { replace: true });
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [id, isEdit, navigate]);

	const setField = (key, value) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const updateRole = (index, field, value) => {
		setForm((prev) => {
			const roles = [...prev.roles];
			roles[index] = { ...roles[index], [field]: value };
			return { ...prev, roles };
		});
	};

	const addRole = () => {
		if (form.roles.length >= 6) {
			toast.message('Tối đa 6 vai trò');
			return;
		}
		setForm((prev) => ({
			...prev,
			roles: [...prev.roles, emptyKaiwaRole()],
		}));
	};

	const removeRole = (index) => {
		setForm((prev) => {
			const next = prev.roles.filter((_, i) => i !== index);
			return { ...prev, roles: next.length ? next : [emptyKaiwaRole()] };
		});
	};

	const updatePhrase = (index, field, value) => {
		setForm((prev) => {
			const keyPhrases = [...prev.keyPhrases];
			keyPhrases[index] = { ...keyPhrases[index], [field]: value };
			return { ...prev, keyPhrases };
		});
	};

	const addPhrase = () => {
		if (form.keyPhrases.length >= 30) {
			toast.message('Tối đa 30 cụm từ');
			return;
		}
		setForm((prev) => ({
			...prev,
			keyPhrases: [...prev.keyPhrases, emptyKaiwaKeyPhrase()],
		}));
	};

	const removePhrase = (index) => {
		setForm((prev) => ({
			...prev,
			keyPhrases: prev.keyPhrases.filter((_, i) => i !== index),
		}));
	};

	const handleGenerateAI = async () => {
		const titleVi = form.titleVi.trim();
		if (!titleVi) {
			toast.error('Nhập tiêu đề (VI) trước khi Generate AI', {
				description: 'Tiêu đề dùng làm gợi ý chủ đề cho mẫu prompt đã đăng ký theo JLPT.',
			});
			return;
		}
		setGenerating(true);
		try {
			const payload = buildKaiwaAIGeneratePayload(form);
			const { item, source } = await KAIWA_AI_GENERATE.generate(payload);
			if (!item) {
				toast.error('AI không trả về bối cảnh');
				return;
			}
			const titleViLocked = form.titleVi.trim();
			setForm((prev) => ({
				...mergeKaiwaAIIntoForm(prev, item),
				titleVi: titleViLocked,
				jlpt: prev.jlpt,
				category: prev.category,
			}));
			const srcLabel =
				source === 'gemini'
					? 'Gemini AI'
					: 'Placeholder (chưa có GEMINI_API_KEY)';
			toast.success('Đã điền bối cảnh từ AI', {
				description: `${srcLabel} · mẫu ${payload.templateName}`,
			});
		} catch (err) {
			toast.error('Generate thất bại', {
				description: getApiErrorMessage(err),
			});
		} finally {
			setGenerating(false);
		}
	};

	const handleSave = async (e) => {
		e.preventDefault();
		if (!form.titleVi.trim()) {
			toast.error('Vui lòng nhập tiêu đề (VI)');
			return;
		}
		if (!form.situationVi.trim()) {
			toast.error('Vui lòng mô tả tình huống (VI)');
			return;
		}
		setSaving(true);
		try {
			const payload = formToContextPayload(form);
			if (isEdit) {
				await updateAdminKaiwaContext(id, payload);
				toast.success('Đã lưu bối cảnh');
			} else {
				await createAdminKaiwaContext(payload);
				toast.success('Đã tạo bối cảnh');
				navigate('/admin/kaiwa', { replace: true });
			}
		} catch (err) {
			toast.error('Không lưu được', {
				description: getApiErrorMessage(err),
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="admin-stub-main admin-grammar-page">
				<p className="admin-grammar-status">Đang tải…</p>
			</div>
		);
	}

	return (
		<div className="admin-stub-main admin-grammar-page admin-kaiwa-editor">
			<nav className="admin-kaiwa-breadcrumb" aria-label="Breadcrumb">
				<Link to="/admin/kaiwa">Kaiwa</Link>
				<span aria-hidden> › </span>
				<span>{isEdit ? 'Chỉnh sửa bối cảnh' : 'Tạo bối cảnh mới'}</span>
			</nav>

			<header className="admin-kaiwa-editor-head">
				<div>
					<h1 className="admin-grammar-title">
						{isEdit ? 'Sửa bối cảnh Kaiwa' : 'Tạo bối cảnh Kaiwa'}
					</h1>
					<p className="admin-grammar-lead">
						Mô tả tình huống, vai trò và cụm từ gợi ý — chưa cần viết hội thoại
						chi tiết.
					</p>
				</div>
				<button
					type="button"
					className="admin-grammar-btn admin-grammar-btn--ghost"
					disabled={generating || saving}
					onClick={() => void handleGenerateAI()}
				>
					{generating ? 'Đang generate…' : 'Generate AI'}
				</button>
			</header>

			<form className="admin-kaiwa-form" onSubmit={handleSave}>
				<section className="admin-grammar-form-section">
					<h2>Thông tin chung</h2>
					<div className="admin-grammar-grid">
						<label className="admin-grammar-field admin-grammar-field--full">
							<span>Tiêu đề (VI) *</span>
							<input
								className="admin-grammar-input"
								value={form.titleVi}
								onChange={(e) => setField('titleVi', e.target.value)}
								maxLength={200}
								required
							/>
							<span className="admin-kaiwa-hint">
								Dùng cho Generate AI — mẫu prompt tự chọn theo JLPT (không mở
								modal).
							</span>
						</label>
						<label className="admin-grammar-field admin-grammar-field--full">
							<span>Tiêu đề (JP)</span>
							<input
								className="admin-grammar-input"
								value={form.titleJa}
								onChange={(e) => setField('titleJa', e.target.value)}
								lang="ja"
								maxLength={200}
							/>
						</label>
						<label className="admin-grammar-field">
							<span>JLPT</span>
							<select
								className="admin-grammar-select"
								value={form.jlpt}
								onChange={(e) => setField('jlpt', e.target.value)}
							>
								{KAIWA_JLPT_LEVELS.map((lv) => (
									<option key={lv} value={lv}>
										{lv}
									</option>
								))}
							</select>
						</label>
						<label className="admin-grammar-field">
							<span>Chủ đề</span>
							<select
								className="admin-grammar-select"
								value={form.category}
								onChange={(e) => setField('category', e.target.value)}
							>
								{KAIWA_CATEGORY_OPTIONS.map((o) => (
									<option key={o.value} value={o.value}>
										{o.label}
									</option>
								))}
							</select>
						</label>
						<label className="admin-grammar-field">
							<span>Thứ tự</span>
							<input
								className="admin-grammar-input"
								type="number"
								min={0}
								value={form.displayOrder}
								onChange={(e) =>
									setField('displayOrder', Number(e.target.value) || 0)
								}
							/>
						</label>
						<div className="admin-grammar-field">
							<span className="admin-grammar-label">Xuất bản</span>
							<div className="admin-grammar-switch-wrap">
								<button
									type="button"
									className={`admin-grammar-switch${form.isPublished ? ' admin-grammar-switch--on' : ''}`}
									role="switch"
									aria-checked={form.isPublished}
									onClick={() => setField('isPublished', !form.isPublished)}
								>
									<span className="admin-grammar-switch-thumb" aria-hidden />
								</button>
								<span className="admin-grammar-switch-caption">
									{form.isPublished ? 'Công khai' : 'Nháp'}
								</span>
							</div>
						</div>
					</div>
				</section>

				<section className="admin-grammar-form-section">
					<h2>Địa điểm / bối cảnh</h2>
					<GrammarLocFields
						label="Bối cảnh (địa điểm)"
						rows={2}
						value={{ vi: form.settingVi, ja: form.settingJa }}
						onChange={(loc) => {
							setField('settingVi', loc.vi ?? '');
							setField('settingJa', loc.ja ?? '');
						}}
					/>
				</section>

				<section className="admin-grammar-form-section">
					<h2>Tình huống *</h2>
					<p className="admin-kaiwa-hint">
						Phần quan trọng nhất — mô tả chi tiết để AI/người soạn dựng kịch bản
						hội thoại sau.
					</p>
					<GrammarLocFields
						label="Mô tả tình huống"
						rows={5}
						value={{ vi: form.situationVi, ja: form.situationJa }}
						onChange={(loc) => {
							setField('situationVi', loc.vi ?? '');
							setField('situationJa', loc.ja ?? '');
						}}
					/>
				</section>

				<section className="admin-grammar-form-section">
					<div className="admin-kaiwa-section-head">
						<h2>Vai trò</h2>
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost"
							onClick={addRole}
						>
							+ Thêm vai
						</button>
					</div>
					{form.roles.map((role, idx) => (
						<div key={idx} className="admin-kaiwa-role-card">
							<div className="admin-grammar-grid">
								<label className="admin-grammar-field">
									<span>Tên (VI)</span>
									<input
										className="admin-grammar-input"
										value={role.nameVi}
										onChange={(e) =>
											updateRole(idx, 'nameVi', e.target.value)
										}
									/>
								</label>
								<label className="admin-grammar-field">
									<span>Tên (JP)</span>
									<input
										className="admin-grammar-input"
										value={role.nameJa}
										onChange={(e) =>
											updateRole(idx, 'nameJa', e.target.value)
										}
										lang="ja"
									/>
								</label>
								<label className="admin-grammar-field admin-grammar-field--full">
									<span>Mô tả (VI)</span>
									<textarea
										className="admin-grammar-textarea"
										rows={2}
										value={role.descriptionVi}
										onChange={(e) =>
											updateRole(idx, 'descriptionVi', e.target.value)
										}
									/>
								</label>
							</div>
							{form.roles.length > 1 ? (
								<button
									type="button"
									className="admin-grammar-btn admin-grammar-btn--danger admin-kaiwa-remove"
									onClick={() => removeRole(idx)}
								>
									Xóa vai
								</button>
							) : null}
						</div>
					))}
				</section>

				<section className="admin-grammar-form-section">
					<h2>Mục tiêu luyện tập</h2>
					<GrammarLocFields
						label="Mục tiêu"
						rows={3}
						value={{ vi: form.objectivesVi, ja: form.objectivesJa }}
						onChange={(loc) => {
							setField('objectivesVi', loc.vi ?? '');
							setField('objectivesJa', loc.ja ?? '');
						}}
					/>
				</section>

				<section className="admin-grammar-form-section">
					<div className="admin-kaiwa-section-head">
						<h2>Cụm từ gợi ý</h2>
						<button
							type="button"
							className="admin-grammar-btn admin-grammar-btn--ghost"
							onClick={addPhrase}
						>
							+ Thêm cụm
						</button>
					</div>
					{form.keyPhrases.length === 0 ? (
						<p className="admin-kaiwa-hint">Chưa có cụm từ — có thể thêm sau khi generate AI.</p>
					) : (
						<div className="admin-grammar-table-wrap">
							<table className="admin-grammar-table">
								<thead>
									<tr>
										<th>Tiếng Nhật</th>
										<th>Đọc</th>
										<th>Nghĩa VI</th>
										<th />
									</tr>
								</thead>
								<tbody>
									{form.keyPhrases.map((p, idx) => (
										<tr key={idx}>
											<td>
												<input
													className="admin-grammar-input"
													value={p.phraseJa}
													onChange={(e) =>
														updatePhrase(idx, 'phraseJa', e.target.value)
													}
													lang="ja"
												/>
											</td>
											<td>
												<input
													className="admin-grammar-input"
													value={p.reading}
													onChange={(e) =>
														updatePhrase(idx, 'reading', e.target.value)
													}
												/>
											</td>
											<td>
												<input
													className="admin-grammar-input"
													value={p.meaningVi}
													onChange={(e) =>
														updatePhrase(idx, 'meaningVi', e.target.value)
													}
												/>
											</td>
											<td>
												<button
													type="button"
													className="admin-grammar-btn admin-grammar-btn--danger"
													onClick={() => removePhrase(idx)}
												>
													Xóa
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>

				<section className="admin-grammar-form-section">
					<h2>Lưu ý văn hóa</h2>
					<GrammarLocFields
						label="Ghi chú"
						rows={3}
						value={{
							vi: form.culturalNotesVi,
							ja: form.culturalNotesJa,
						}}
						onChange={(loc) => {
							setField('culturalNotesVi', loc.vi ?? '');
							setField('culturalNotesJa', loc.ja ?? '');
						}}
					/>
				</section>

				<footer className="admin-kaiwa-form-footer">
					<Link
						className="admin-grammar-btn admin-grammar-btn--muted"
						to="/admin/kaiwa"
					>
						Hủy
					</Link>
					<button
						type="submit"
						className="admin-grammar-btn admin-grammar-btn--primary"
						disabled={saving}
					>
						{saving ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo bối cảnh'}
					</button>
				</footer>
			</form>
		</div>
	);
}

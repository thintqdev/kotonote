import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { EXAM_JLPT_LEVELS } from '../../constants/examPaperFieldMeta.js';
import {
	listExamStructureTemplates,
	seedExamStructures,
} from '../../services/adminExamStructureService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import './AdminGrammarPage.css';
import './AdminExamPaperEditorPage.css';

export default function AdminExamStructureHome() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [seeding, setSeeding] = useState(false);

	const fetchList = useCallback(async () => {
		setLoading(true);
		try {
			const data = await listExamStructureTemplates();
			setItems(data);
		} catch (e) {
			toast.error('Không tải được khung cấu trúc', {
				description: getApiErrorMessage(e),
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchList();
	}, [fetchList]);

	const byJlpt = useMemo(() => {
		const map = {};
		for (const t of items) {
			map[t.jlpt] = t;
		}
		return map;
	}, [items]);

	const handleSeed = async () => {
		setSeeding(true);
		try {
			await seedExamStructures();
			toast.success('Đã seed khung JLPT vào database');
			await fetchList();
		} catch (e) {
			toast.error('Seed thất bại', { description: getApiErrorMessage(e) });
		} finally {
			setSeeding(false);
		}
	};

	return (
		<div className="admin-stub-main admin-grammar-page exam-structure-home">
			<h1 className="admin-grammar-title">Khung cấu trúc đề JLPT</h1>
			<p className="admin-grammar-lead">
				Blueprint lưu trong database — tuỳ chỉnh part, thứ tự, nhãn theo từng cấp JLPT.
				Đề thi mới sẽ dùng khung này; đề cũ giữ snapshot riêng.
			</p>

			<div className="exam-editor-actions" style={{ marginBottom: '1rem' }}>
				<button
					type="button"
					className="admin-grammar-btn admin-grammar-btn--ghost"
					onClick={() => void handleSeed()}
					disabled={seeding}
				>
					{seeding ? 'Đang seed…' : 'Seed / làm mới từ mặc định'}
				</button>
				<Link to="/admin/exam-papers" className="admin-grammar-btn admin-grammar-btn--ghost">
					← Quản lý đề thi
				</Link>
			</div>

			{loading ? (
				<p className="admin-grammar-status">Đang tải…</p>
			) : (
				<div className="exam-structure-grid">
					{EXAM_JLPT_LEVELS.map((jlpt) => {
						const tpl = byJlpt[jlpt];
						const enabled = (tpl?.sections ?? []).filter((s) => s.isEnabled !== false);
						return (
							<article key={jlpt} className="exam-structure-card">
								<header className="exam-structure-card-head">
									<h2>{jlpt}</h2>
									<span className="exam-structure-card-badge">
										{enabled.length} part
									</span>
								</header>
								<p className="exam-structure-card-name">
									{tpl?.name ?? 'Chưa có — nhấn Seed'}
								</p>
								<p className="exam-structure-card-meta">
									v{tpl?.version ?? '—'} · {tpl?.code ?? '—'}
								</p>
								{tpl?._id ? (
									<Link
										to={`/admin/exam-structures/${tpl._id}/edit`}
										className="admin-grammar-btn admin-grammar-btn--primary exam-structure-card-btn"
									>
										Tuỳ chỉnh khung
									</Link>
								) : (
									<button
										type="button"
										className="admin-grammar-btn admin-grammar-btn--muted exam-structure-card-btn"
										onClick={() => void handleSeed()}
									>
										Tạo khung
									</button>
								)}
							</article>
						);
					})}
				</div>
			)}
		</div>
	);
}

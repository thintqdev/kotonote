import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
	EXAM_PART_META,
	EXAM_SECTION_ORDER,
	buildBlueprintSection,
	getAvailablePartsForSection,
	nextBlueprintOrder,
} from '../../constants/examPaperStructure.js';
import { useListDragReorder } from '../../hooks/useListDragReorder.js';
import {
	getExamStructureTemplate,
	resetExamStructureTemplate,
	updateExamStructureTemplate,
} from '../../services/adminExamStructureService.js';
import { getApiErrorMessage } from '../../utils/apiErrorMessage.js';
import { reorderExamPartsInSection } from '../../utils/reorderExamParts.js';
import './AdminGrammarPage.css';
import './AdminExamPaperEditorPage.css';

const SECTION_LABELS = {
	vocabulary: 'Từ vựng',
	grammar: 'Ngữ pháp',
	reading: 'Đọc hiểu',
	listening: 'Nghe hiểu',
};

function StructureSwitch({ checked, onChange, label }) {
	return (
		<div className="admin-grammar-switch-wrap exam-structure-switch-wrap">
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				className={`admin-grammar-switch${checked ? ' admin-grammar-switch--on' : ''}`}
				onClick={() => onChange(!checked)}
			>
				<span className="admin-grammar-switch-thumb" aria-hidden />
			</button>
		</div>
	);
}

function AddPartControl({ sectionType, sections, onAdd }) {
	const available = useMemo(
		() => getAvailablePartsForSection(sectionType, sections),
		[sectionType, sections],
	);
	const [selected, setSelected] = useState('');

	useEffect(() => {
		setSelected(available[0] ?? '');
	}, [available]);

	if (available.length === 0) {
		return (
			<span className="exam-structure-add-empty">Đã thêm hết part trong catalog</span>
		);
	}

	return (
		<div className="exam-structure-add-row">
			<select
				className="admin-grammar-input exam-structure-add-select"
				value={selected}
				onChange={(e) => setSelected(e.target.value)}
			>
				{available.map((pt) => {
					const meta = EXAM_PART_META[pt] ?? {};
					return (
						<option key={pt} value={pt}>
							{meta.titleVi ?? pt} ({pt})
						</option>
					);
				})}
			</select>
			<button
				type="button"
				className="admin-grammar-btn admin-grammar-btn--ghost exam-structure-add-btn"
				onClick={() => {
					if (!selected) return;
					onAdd(sectionType, selected);
				}}
			>
				+ Thêm part
			</button>
		</div>
	);
}

function normalizeBlueprintRow(s) {
	return {
		...s,
		needsMedia: s.needsMedia ?? s.needsAudio ?? false,
	};
}

function SectionPartsTable({
	sectionType,
	rows,
	sections,
	setSections,
	onRemove,
}) {
	const sortedRows = useMemo(
		() => [...rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		[rows],
	);

	const handleReorder = useCallback(
		(fromIndex, toIndex) => {
			setSections((prev) =>
				reorderExamPartsInSection(prev, sectionType, fromIndex, toIndex),
			);
			toast.success('Đã đổi thứ tự part');
		},
		[sectionType, setSections],
	);

	const { createDragHandleProps, createRowProps } =
		useListDragReorder(handleReorder);

	const findGlobalIndex = (partType) =>
		sections.findIndex(
			(s) => s.sectionType === sectionType && s.partType === partType,
		);

	const patchSection = (index, patch) => {
		setSections((prev) =>
			prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
		);
	};

	return (
		<div className="exam-structure-table-wrap">
			<table className="admin-grammar-table exam-structure-table">
				<thead>
					<tr>
						<th className="exam-dnd-col" aria-label="Kéo thả" />
						<th>#</th>
						<th>Bật</th>
						<th>partType</th>
						<th>Tiêu đề (VI)</th>
						<th>Tiêu đề (JA)</th>
						<th>Passage</th>
						<th>Media</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{sortedRows.map((row, rowIndex) => {
						const gi = findGlobalIndex(row.partType);
						const rowProps = createRowProps(rowIndex);
						const handleProps = createDragHandleProps(rowIndex);
						return (
							<tr
								key={`${row.sectionType}-${row.partType}`}
								{...rowProps}
								className={rowProps.className}
							>
								<td className="exam-dnd-col">
									<button
										type="button"
										className="exam-dnd-handle"
										title="Kéo để sắp xếp"
										{...handleProps}
									>
										<span aria-hidden>⠿</span>
									</button>
								</td>
								<td className="exam-structure-order-cell">{row.order ?? rowIndex + 1}</td>
								<td>
									<StructureSwitch
										checked={row.isEnabled !== false}
										onChange={(on) => patchSection(gi, { isEnabled: on })}
										label={`Bật part ${row.partType}`}
									/>
								</td>
								<td>
									<code>{row.partType}</code>
								</td>
								<td>
									<input
										className="admin-grammar-input"
										value={row.titleVi ?? ''}
										onChange={(e) =>
											patchSection(gi, { titleVi: e.target.value })
										}
									/>
								</td>
								<td>
									<input
										className="admin-grammar-input"
										value={row.titleJa ?? ''}
										onChange={(e) =>
											patchSection(gi, { titleJa: e.target.value })
										}
										lang="ja"
									/>
								</td>
								<td>
									<StructureSwitch
										checked={Boolean(row.needsPassage)}
										onChange={(on) => patchSection(gi, { needsPassage: on })}
										label={`Passage ${row.partType}`}
									/>
								</td>
								<td>
									<StructureSwitch
										checked={Boolean(row.needsMedia)}
										onChange={(on) => patchSection(gi, { needsMedia: on })}
										label={`Media ${row.partType}`}
									/>
								</td>
								<td>
									<button
										type="button"
										className="admin-grammar-btn admin-grammar-btn--danger exam-structure-remove-btn"
										onClick={() => onRemove(row.sectionType, row.partType)}
									>
										Xóa
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export default function AdminExamStructureEditPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [template, setTemplate] = useState(null);
	const [sections, setSections] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [resetting, setResetting] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			const tpl = await getExamStructureTemplate(id);
			setTemplate(tpl);
			setSections(
				[...(tpl.sections ?? [])]
					.map(normalizeBlueprintRow)
					.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
			);
		} catch (e) {
			toast.error('Không tải được khung', { description: getApiErrorMessage(e) });
			navigate('/admin/exam-structures', { replace: true });
		} finally {
			setLoading(false);
		}
	}, [id, navigate]);

	useEffect(() => {
		void load();
	}, [load]);

	const grouped = useMemo(() => {
		const map = {};
		for (const key of EXAM_SECTION_ORDER) {
			map[key] = sections
				.filter((s) => s.sectionType === key)
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
		}
		return map;
	}, [sections]);

	const handleAddPart = (sectionType, partType) => {
		const order = nextBlueprintOrder(sections);
		const next = buildBlueprintSection(sectionType, partType, order);
		setSections((prev) =>
			[...prev, next].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		);
		toast.success(`Đã thêm part ${partType}`);
	};

	const handleRemovePart = (sectionType, partType) => {
		const meta = EXAM_PART_META[partType];
		const label = meta?.titleVi ?? partType;
		if (!window.confirm(`Xóa part「${label}」khỏi khung ${template?.jlpt}?`)) {
			return;
		}
		setSections((prev) => {
			const filtered = prev.filter(
				(s) => !(s.sectionType === sectionType && s.partType === partType),
			);
			return filtered
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
				.map((s, idx) => ({ ...s, order: idx + 1 }));
		});
	};

	const handleSave = async () => {
		if (sections.length === 0) {
			toast.error('Khung cần ít nhất 1 part');
			return;
		}
		setSaving(true);
		try {
			const payload = {
				name: template.name,
				description: template.description,
				isActive: template.isActive,
				sections: sections.map((s, idx) => ({
					sectionType: s.sectionType,
					partType: s.partType,
					titleVi: s.titleVi,
					titleJa: s.titleJa,
					descriptionVi: s.descriptionVi,
					order: Number(s.order) >= 0 ? Number(s.order) : idx + 1,
					isEnabled: s.isEnabled !== false,
					needsPassage: Boolean(s.needsPassage),
					needsMedia: Boolean(s.needsMedia),
				})),
			};
			const updated = await updateExamStructureTemplate(id, payload);
			setTemplate(updated);
			setSections(
				[...(updated.sections ?? [])]
					.map(normalizeBlueprintRow)
					.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
			);
			toast.success('Đã lưu khung cấu trúc');
		} catch (e) {
			toast.error('Không lưu được', { description: getApiErrorMessage(e) });
		} finally {
			setSaving(false);
		}
	};

	const handleReset = async () => {
		if (
			!window.confirm(
				`Reset khung ${template?.jlpt} về mặc định từ seed? Mọi tuỳ chỉnh sẽ mất.`,
			)
		) {
			return;
		}
		setResetting(true);
		try {
			const updated = await resetExamStructureTemplate(id);
			setTemplate(updated);
			setSections(
				[...(updated.sections ?? [])]
					.map(normalizeBlueprintRow)
					.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
			);
			toast.success('Đã reset khung');
		} catch (e) {
			toast.error('Reset thất bại', { description: getApiErrorMessage(e) });
		} finally {
			setResetting(false);
		}
	};

	if (loading) return <p className="admin-grammar-status">Đang tải khung…</p>;
	if (!template) return null;

	return (
		<div className="admin-stub-main admin-grammar-page exam-structure-edit">
			<Link to="/admin/exam-structures" className="exam-editor-back">
				← Danh sách khung
			</Link>

			<div className="exam-editor-head">
				<div>
					<h1 className="admin-grammar-title">{template.name}</h1>
					<p className="exam-editor-meta">
						{template.jlpt} · v{template.version} · {sections.length} part ·{' '}
						{sections.filter((s) => s.isEnabled !== false).length} bật · kéo ⠿ để
						đổi thứ tự
					</p>
				</div>
				<div className="exam-editor-actions">
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--ghost"
						onClick={() => void handleReset()}
						disabled={resetting || saving}
					>
						{resetting ? 'Đang reset…' : 'Reset mặc định'}
					</button>
					<button
						type="button"
						className="admin-grammar-btn admin-grammar-btn--primary"
						onClick={() => void handleSave()}
						disabled={saving}
					>
						{saving ? 'Đang lưu…' : 'Lưu khung'}
					</button>
				</div>
			</div>

			{EXAM_SECTION_ORDER.map((sectionType) => {
				const rows = grouped[sectionType] ?? [];
				return (
					<section key={sectionType} className="exam-structure-group">
						<div className="exam-structure-group-head">
							<h2 className="exam-structure-group-title">{SECTION_LABELS[sectionType]}</h2>
							<AddPartControl
								sectionType={sectionType}
								sections={sections}
								onAdd={handleAddPart}
							/>
						</div>

						{rows.length === 0 ? (
							<p className="exam-structure-group-empty">
								Chưa có part nào — chọn part ở trên và nhấn «+ Thêm part».
							</p>
						) : (
							<SectionPartsTable
								sectionType={sectionType}
								rows={rows}
								sections={sections}
								setSections={setSections}
								onRemove={handleRemovePart}
							/>
						)}
					</section>
				);
			})}
		</div>
	);
}

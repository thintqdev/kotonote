import PropTypes from 'prop-types';
import { grammarLine } from '../../data/grammarMock.js';
import { hasGrammarCompareContent } from '../../utils/grammarCompareNormalize.js';

function GrammarJpViTd({ loc, lang }) {
	const { primary, secondary } = grammarLine(loc, lang);
	return (
		<>
			<span className="grammar-td-jp">{primary}</span>
			{secondary ? <span className="grammar-td-vi">{secondary}</span> : null}
		</>
	);
}

GrammarJpViTd.propTypes = {
	loc: PropTypes.shape({ ja: PropTypes.string, vi: PropTypes.string }),
	lang: PropTypes.string.isRequired,
};

function CompareTable({ colLabels, rows, lang, tableKey }) {
	return (
		<table>
			<thead>
				<tr>
					<th scope="col" />
					{(colLabels || []).map((col, i) => (
						<th key={`${tableKey}-ch-${i}`} scope="col">
							<GrammarJpViTd loc={col} lang={lang} />
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, ri) => (
					<tr key={`${tableKey}-cr-${ri}`}>
						<th scope="row">
							<GrammarJpViTd loc={row.label} lang={lang} />
						</th>
						{(row.cells || []).map((cell, ci) => (
							<td key={`${tableKey}-cc-${ri}-${ci}`}>
								<GrammarJpViTd loc={cell} lang={lang} />
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

CompareTable.propTypes = {
	colLabels: PropTypes.arrayOf(
		PropTypes.shape({ ja: PropTypes.string, vi: PropTypes.string }),
	),
	rows: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.shape({ ja: PropTypes.string, vi: PropTypes.string }),
			cells: PropTypes.arrayOf(
				PropTypes.shape({ ja: PropTypes.string, vi: PropTypes.string }),
			),
		}),
	).isRequired,
	lang: PropTypes.string.isRequired,
	tableKey: PropTypes.string.isRequired,
};

function SectionIntro({ intro, lang }) {
	if (!intro?.ja?.trim() && !intro?.vi?.trim()) return null;
	const { primary, secondary } = grammarLine(intro, lang);
	return (
		<p className="grammar-compare-section-intro">
			{primary}
			{secondary ? (
				<span className="grammar-compare-section-intro-vi">{secondary}</span>
			) : null}
		</p>
	);
}

SectionIntro.propTypes = {
	intro: PropTypes.shape({ ja: PropTypes.string, vi: PropTypes.string }),
	lang: PropTypes.string.isRequired,
};

/**
 * Bảng compare: sections (chia thể I/II/III + quy tắc con) hoặc rows phẳng (legacy).
 */
export default function GrammarCompareTables({ compare, lang, slug = 'g' }) {
	if (!hasGrammarCompareContent(compare)) return null;

	const colLabels = compare.colLabels || [];
	const sections = compare.sections || [];

	if (sections.length > 0) {
		return (
			<div className="grammar-compare grammar-compare--sections">
				{sections.map((sec, si) => {
					const titleLn = grammarLine(sec.title, lang);
					const sectionKey = sec.id || `sec-${si}`;
					return (
						<div
							key={`${slug}-cmp-sec-${sectionKey}`}
							className="grammar-compare-section"
						>
							{titleLn.primary || titleLn.secondary ? (
								<h3 className="grammar-compare-section-title">
									{titleLn.primary}
									{titleLn.secondary ? (
										<span className="grammar-compare-section-title-vi">
											{titleLn.secondary}
										</span>
									) : null}
								</h3>
							) : null}
							<SectionIntro intro={sec.intro} lang={lang} />
							<CompareTable
								colLabels={colLabels}
								rows={sec.rows}
								lang={lang}
								tableKey={`${slug}-${sectionKey}`}
							/>
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<div className="grammar-compare">
			<CompareTable
				colLabels={colLabels}
				rows={compare.rows}
				lang={lang}
				tableKey={slug}
			/>
		</div>
	);
}

GrammarCompareTables.propTypes = {
	compare: PropTypes.shape({
		colLabels: PropTypes.array,
		rows: PropTypes.array,
		sections: PropTypes.array,
	}),
	lang: PropTypes.string.isRequired,
	slug: PropTypes.string,
};

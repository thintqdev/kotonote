import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { paginationPageNumbers } from '../../utils/vocabularyListNav.js';

/**
 * Phân trang danh sách học (đọc, nghe, Kaiwa, đề thi, …).
 * @param {{
 *   i18nKey: string,
 *   page: number,
 *   totalPages: number,
 *   total: number,
 *   pageSize: number,
 *   getPageHref: (page: number) => string,
 * }} props
 */
export default function StudyListPagination({
	i18nKey,
	page,
	totalPages,
	total,
	pageSize,
	getPageHref,
}) {
	const { t } = useTranslation();

	const fromIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const toIndex = total === 0 ? 0 : Math.min(page * pageSize, total);

	const pageNumbers = useMemo(
		() => paginationPageNumbers(page, totalPages),
		[page, totalPages],
	);

	if (total <= 0) return null;

	const summaryText = t(`${i18nKey}.pageSummary`, {
		from: fromIndex,
		to: toIndex,
		total,
	});
	const positionText = t(`${i18nKey}.pagePosition`, {
		current: page,
		totalPages,
	});

	return (
		<nav
			className="grammar-pagination"
			aria-label={t(`${i18nKey}.paginationLabel`)}
		>
			<p className="grammar-pagination-meta">
				{summaryText}
				{' · '}
				{positionText}
			</p>
			<div className="grammar-pagination-nav">
				<Link
					className="grammar-page-btn"
					to={getPageHref(1)}
					aria-disabled={page <= 1}
					tabIndex={page <= 1 ? -1 : 0}
					style={
						page <= 1
							? { pointerEvents: 'none', opacity: 0.45 }
							: undefined
					}
					title={t(`${i18nKey}.firstPage`)}
				>
					«
				</Link>
				<Link
					className="grammar-page-btn"
					to={getPageHref(page - 1)}
					aria-disabled={page <= 1}
					tabIndex={page <= 1 ? -1 : 0}
					style={
						page <= 1
							? { pointerEvents: 'none', opacity: 0.45 }
							: undefined
					}
				>
					{t(`${i18nKey}.prevPage`)}
				</Link>

				{pageNumbers.map((n) => (
					<Link
						key={n}
						to={getPageHref(n)}
						className={`grammar-page-btn${n === page ? ' grammar-page-btn--active' : ''}`}
						aria-current={n === page ? 'page' : undefined}
						title={t(`${i18nKey}.goToPage`, { n })}
					>
						{n}
					</Link>
				))}

				<Link
					className="grammar-page-btn"
					to={getPageHref(page + 1)}
					aria-disabled={page >= totalPages}
					tabIndex={page >= totalPages ? -1 : 0}
					style={
						page >= totalPages
							? { pointerEvents: 'none', opacity: 0.45 }
							: undefined
					}
				>
					{t(`${i18nKey}.nextPage`)}
				</Link>
				<Link
					className="grammar-page-btn"
					to={getPageHref(totalPages)}
					aria-disabled={page >= totalPages}
					tabIndex={page >= totalPages ? -1 : 0}
					style={
						page >= totalPages
							? { pointerEvents: 'none', opacity: 0.45 }
							: undefined
					}
					title={t(`${i18nKey}.lastPage`)}
				>
					»
				</Link>
			</div>
		</nav>
	);
}

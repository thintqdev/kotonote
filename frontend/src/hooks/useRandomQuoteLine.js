import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as quoteService from '../services/quoteService.js';

/**
 * Lấy một dòng quote ngẫu nhiên từ API; lỗi / rỗng → `t(fallbackI18nKey)`.
 * Nếu `staticText` khác rỗng: không gọi API, chỉ trả về chuỗi tĩnh (ưu tiên override trang).
 *
 * @param {object} opts
 * @param {string} opts.fallbackI18nKey — key i18n khi API thất bại
 * @param {string | undefined} [opts.staticText] — khi có: bỏ qua API
 */
export function useRandomQuoteLine({ fallbackI18nKey, staticText }) {
	const { i18n, t } = useTranslation();
	const hasStatic = typeof staticText === 'string' && staticText.trim() !== '';

	const [line, setLine] = useState(() =>
		hasStatic ? staticText.trim() : t(fallbackI18nKey),
	);

	useEffect(() => {
		if (hasStatic) {
			setLine(staticText.trim());
			return undefined;
		}

		const ac = new AbortController();
		(async () => {
			try {
				const data = await quoteService.getRandomQuote({ signal: ac.signal });
				const picked = quoteService.pickQuoteLineForLanguage(
					data?.quote,
					i18n.language,
				);
				if (!ac.signal.aborted) {
					setLine(picked || t(fallbackI18nKey));
				}
			} catch {
				if (!ac.signal.aborted) {
					setLine(t(fallbackI18nKey));
				}
			}
		})();

		return () => ac.abort();
	}, [hasStatic, staticText, fallbackI18nKey, i18n.language, t]);

	return line;
}

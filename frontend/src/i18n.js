import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANG_STORAGE_KEY = 'kotonote-lang';

function savedLanguage() {
	if (typeof window === 'undefined') return 'vi';
	return localStorage.getItem(LANG_STORAGE_KEY) || 'vi';
}

function normalizeLng(lng) {
	return String(lng || '').toLowerCase().startsWith('ja') ? 'ja' : 'vi';
}

async function loadTranslationBundle(lng) {
	const code = normalizeLng(lng);
	const mod = await import(`./lang/${code}.json`);
	return mod.default;
}

/** Tải bundle ngôn ngữ nếu chưa có (trước khi đổi ngôn ngữ). */
export async function ensureLanguageLoaded(lng) {
	const code = normalizeLng(lng);
	if (!i18n.hasResourceBundle(code, 'translation')) {
		const bundle = await loadTranslationBundle(code);
		i18n.addResourceBundle(code, 'translation', bundle, true, true);
	}
}

/**
 * Khởi tạo i18n — chỉ tải JSON ngôn ngữ đang dùng (vi hoặc ja).
 * Ngôn ngữ còn lại lazy-load khi đổi ngôn ngữ.
 */
export async function initI18n() {
	const lng = normalizeLng(savedLanguage());
	const translation = await loadTranslationBundle(lng);

	await i18n.use(initReactI18next).init({
		resources: {
			[lng]: { translation },
		},
		lng,
		fallbackLng: 'vi',
		interpolation: { escapeValue: false },
		react: {
			useSuspense: false,
		},
	});

	if (typeof document !== 'undefined') {
		document.documentElement.lang = lng === 'ja' ? 'ja' : 'vi';
	}

	i18n.on('languageChanged', (newLng) => {
		const code = normalizeLng(newLng);
		localStorage.setItem(LANG_STORAGE_KEY, code);
		document.documentElement.lang = code === 'ja' ? 'ja' : 'vi';
	});
}

export default i18n;

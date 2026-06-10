import { useTranslation } from 'react-i18next';
import './RouteFallback.css';

/** Placeholder khi lazy route đang tải chunk. */
export default function RouteFallback() {
	const { t } = useTranslation();
	return (
		<div className="route-fallback" role="status" aria-live="polite">
			<span className="route-fallback-spinner" aria-hidden />
			<span>{t('common.loading')}</span>
		</div>
	);
}

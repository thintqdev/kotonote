import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAdminStudioSettings } from '../../services/adminSettingsService.js';
import { getAxiosErrorMessage } from '../../utils/apiErrorMessage.js';
import './AdminGrammarPage.css';
import './AdminQuotesPage.css';
import './AdminSettingsPage.css';

function SettingsCard({ title, children }) {
	return (
		<section className="admin-settings-card profile-card">
			<h2 className="admin-settings-card-title">{title}</h2>
			<dl className="admin-settings-dl">{children}</dl>
		</section>
	);
}

function Row({ label, value }) {
	return (
		<>
			<dt>{label}</dt>
			<dd>{value ?? '—'}</dd>
		</>
	);
}

export default function AdminSettingsPage() {
	const { t } = useTranslation();
	const [settings, setSettings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const load = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const data = await getAdminStudioSettings();
			setSettings(data);
		} catch (err) {
			const msg = getAxiosErrorMessage(err, t);
			setError(msg);
			toast.error(t('adminSettings.loadError'), { description: msg });
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		void load();
	}, [load]);

	return (
		<div className="admin-stub-main admin-settings-page">
			<h1 className="admin-quotes-title">{t('adminSettings.title')}</h1>
			<p className="admin-quotes-lead">{t('adminSettings.lead')}</p>

			<div className="admin-quotes-toolbar">
				<button
					type="button"
					className="admin-quotes-btn admin-quotes-btn--ghost"
					onClick={() => void load()}
					disabled={loading}
				>
					{loading ? t('adminSettings.loading') : t('adminSettings.refresh')}
				</button>
			</div>

			{error ? (
				<p className="admin-grammar-status admin-grammar-status--error" role="alert">
					{error}
				</p>
			) : null}

			{loading && !settings ? (
				<p className="admin-grammar-status">{t('adminSettings.loading')}</p>
			) : null}

			{settings ? (
				<div className="admin-settings-grid">
					<SettingsCard title={t('adminSettings.sections.app')}>
						<Row label={t('adminSettings.nodeEnv')} value={settings.app?.nodeEnv} />
						<Row
							label={t('adminSettings.clientUrl')}
							value={settings.app?.clientUrl}
						/>
						<Row
							label={t('adminSettings.apiPublicUrl')}
							value={settings.app?.apiPublicUrl}
						/>
					</SettingsCard>

					<SettingsCard title={t('adminSettings.sections.payment')}>
						<Row
							label={t('adminSettings.paymentProvider')}
							value={settings.payment?.provider}
						/>
						<Row
							label={t('adminSettings.payosConfigured')}
							value={
								settings.payment?.payosConfigured
									? t('adminSettings.yes')
									: t('adminSettings.no')
							}
						/>
						<Row
							label={t('adminSettings.webhookUrl')}
							value={settings.payment?.webhookUrl}
						/>
						<Row
							label={t('adminSettings.mockConfirm')}
							value={
								settings.payment?.mockConfirmEnabled
									? t('adminSettings.yes')
									: t('adminSettings.no')
							}
						/>
					</SettingsCard>

					<SettingsCard title={t('adminSettings.sections.ai')}>
						<Row
							label={t('adminSettings.gemini')}
							value={
								settings.ai?.geminiConfigured
									? t('adminSettings.yes')
									: t('adminSettings.no')
							}
						/>
						<Row label={t('adminSettings.geminiModel')} value={settings.ai?.model} />
					</SettingsCard>

					<SettingsCard title={t('adminSettings.sections.storage')}>
						<Row
							label={t('adminSettings.storageDriver')}
							value={settings.storage?.driver}
						/>
					</SettingsCard>

					<SettingsCard title={t('adminSettings.sections.membership')}>
						<Row
							label={t('adminSettings.expiryJob')}
							value={t('adminSettings.expiryJobHint', {
								hours: settings.membership?.expiryJobIntervalHours ?? 1,
							})}
						/>
					</SettingsCard>
				</div>
			) : null}

			<p className="admin-settings-note">{t('adminSettings.note')}</p>
		</div>
	);
}

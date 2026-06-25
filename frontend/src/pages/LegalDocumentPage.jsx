import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import LegalLayout from '../components/legal/LegalLayout.jsx';
import './LegalPage.css';

/**
 * @param {{ doc: 'terms' | 'privacy' }} props
 */
const LegalDocumentPage = ({ doc }) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const baseKey = `legal.${doc}`;
	const sections = t(`${baseKey}.sections`, { returnObjects: true });
	const sectionList = Array.isArray(sections) ? sections : [];
	const backTo = user ? '/' : '/login';
	const backLabel = user ? t('legal.backHome') : t('legal.backLogin');

	return (
		<LegalLayout>
			<article className="legal-doc">
				<header className="legal-doc-header">
					<Link to={backTo} className="legal-back">
						← {backLabel}
					</Link>
					<h1 className="legal-doc-title">{t(`${baseKey}.title`)}</h1>
					<p className="legal-doc-meta">{t(`${baseKey}.updated`)}</p>
					<p className="legal-doc-intro">{t(`${baseKey}.intro`)}</p>
				</header>

				<div className="legal-doc-body">
					{sectionList.map((section, index) => {
						if (!section || typeof section !== 'object') return null;
						const title =
							typeof section.title === 'string' ? section.title : '';
						const body =
							typeof section.body === 'string' ? section.body : '';
						if (!title && !body) return null;
						return (
							<section key={title || index} className="legal-section">
								{title ? (
									<h2 className="legal-section-title">{title}</h2>
								) : null}
								{body ? <p className="legal-section-body">{body}</p> : null}
							</section>
						);
					})}
				</div>

				<footer className="legal-doc-footer">
					{doc === 'terms' ? (
						<Link to="/privacy" className="legal-cross-link">
							{t('legal.viewPrivacy')}
						</Link>
					) : (
						<Link to="/terms" className="legal-cross-link">
							{t('legal.viewTerms')}
						</Link>
					)}
				</footer>
			</article>
		</LegalLayout>
	);
};

LegalDocumentPage.propTypes = {
	doc: PropTypes.oneOf(['terms', 'privacy']).isRequired,
};

export const TermsPage = () => <LegalDocumentPage doc="terms" />;
export const PrivacyPage = () => <LegalDocumentPage doc="privacy" />;

export default LegalDocumentPage;

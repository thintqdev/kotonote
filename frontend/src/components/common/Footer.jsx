import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = ({ quote }) => {
  const { t } = useTranslation();
  return (
  <footer className="dash-page-footer">
    <div className="dash-page-footer-inner">
      <img
        className="dash-page-footer-deco dash-page-footer-deco--book"
        src="/assets/decorates/book.png"
        alt=""
        width="120"
        height="120"
        decoding="async"
      />
      <img
        className="dash-page-footer-deco dash-page-footer-deco--case"
        src="/assets/decorates/case.png"
        alt=""
        width="100"
        height="100"
        decoding="async"
      />
      <div className="dash-page-footer-text-block">
        <p className="dash-page-footer-quote">{quote}</p>
        <p className="dash-page-footer-copyright">
          {t('footer.dashQuote')}
        </p>
      </div>
    </div>
  </footer>
  );
};

Footer.propTypes = {
  quote: PropTypes.string.isRequired,
};

export default Footer;

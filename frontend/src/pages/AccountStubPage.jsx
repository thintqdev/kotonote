import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

/** Trang tạm cho tài khoản — thay bằng trang thật khi triển khai. */
const AccountStubPage = ({ titleKey }) => {
  const { t } = useTranslation();
  return (
    <main className="account-stub-page">
      <h1 className="account-stub-page-title">{t(titleKey)}</h1>
      <p className="account-stub-page-hint">
        {t("accountStub.hint")}
      </p>
      <Link to="/" className="account-stub-page-back">
        {t("accountStub.back")}
      </Link>
    </main>
  );
};

AccountStubPage.propTypes = {
  titleKey: PropTypes.string.isRequired,
};

export default AccountStubPage;

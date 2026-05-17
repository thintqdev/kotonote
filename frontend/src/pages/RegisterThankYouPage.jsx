import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { resendVerificationEmail } from '../services/authService.js';
import { getAxiosErrorMessage } from '../utils/apiErrorMessage.js';

const RegisterThankYouPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const email = (location.state?.email || '').trim();
  const [isResending, setIsResending] = useState(false);

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      toast.success(t('registerThankYou.resendSuccess'));
    } catch (err) {
      toast.error(t('registerThankYou.resendFailed'), {
        description: getAxiosErrorMessage(err),
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-section">
        <div className="form-title-wrap form-title-wrap--center">
          <div className="form-title-row">
            <h2 className="form-title-main">{t('registerThankYou.title')}</h2>
            <span className="form-title-pencil" aria-hidden="true">
              ✉
            </span>
          </div>
          <p className="auth-forgot-lead">{t('registerThankYou.lead', { email })}</p>
        </div>

        <div className="auth-forgot-success">
          <p className="auth-forgot-success-lead">{t('registerThankYou.hint')}</p>
          <button
            type="button"
            className="btn-primary btn-primary--stack"
            disabled={isResending}
            onClick={() => void handleResend()}
          >
            {isResending ? (
              <span className="btn-loading">...</span>
            ) : (
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t('registerThankYou.resend')}</span>
              </span>
            )}
          </button>
          <Link to="/login" className="auth-switch-link auth-switch-link--login">
            {t('registerThankYou.backToLogin')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterThankYouPage;

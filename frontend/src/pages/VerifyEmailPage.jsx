import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { resendVerificationEmail } from '../services/authService.js';
import { getAxiosErrorMessage } from '../utils/apiErrorMessage.js';

const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeEmailVerification } = useAuth();
  const token = (searchParams.get('token') || '').trim();

  const [status, setStatus] = useState(token ? 'ready' : 'missing');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (!token || isVerifying) return;
    setIsVerifying(true);
    setErrorMessage('');
    try {
      await completeEmailVerification(token);
      setStatus('success');
      toast.success(t('verifyEmail.successToast'));
      navigate('/survey', { replace: true });
    } catch (err) {
      setStatus('error');
      setErrorMessage(getAxiosErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const email = resendEmail.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
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

  if (status === 'missing') {
    return (
      <AuthLayout>
        <div className="auth-form-section">
          <h2 className="form-title-main">{t('verifyEmail.missingTitle')}</h2>
          <p className="auth-forgot-lead">{t('verifyEmail.missingLead')}</p>
          <Link to="/register/thank-you" className="auth-switch-link">
            {t('registerThankYou.resend')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'ready') {
    return (
      <AuthLayout>
        <div className="auth-form-section">
          <div className="form-title-wrap form-title-wrap--center">
            <div className="form-title-row">
              <h2 className="form-title-main">{t('verifyEmail.confirmTitle')}</h2>
              <span className="form-title-pencil" aria-hidden="true">
                ✉
              </span>
            </div>
            <p className="auth-forgot-lead">{t('verifyEmail.confirmLead')}</p>
          </div>
          <button
            type="button"
            className="btn-primary btn-primary--stack"
            disabled={isVerifying}
            onClick={() => void handleVerify()}
          >
            {isVerifying ? (
              <span className="btn-loading">...</span>
            ) : (
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t('verifyEmail.confirmButton')}</span>
                <span className="btn-arrow">→</span>
              </span>
            )}
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-form-section">
        <div className="form-title-wrap form-title-wrap--center">
          <h2 className="form-title-main">{t('verifyEmail.errorTitle')}</h2>
          <p className="auth-forgot-lead">
            {errorMessage || t('verifyEmail.errorLead')}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleResend} noValidate>
          <div className="field-group">
            <label className="field-label" htmlFor="verify-resend-email">
              <span className="auth-label-text">{t('register.email')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input
                id="verify-resend-email"
                type="email"
                className="sketch-input"
                placeholder="example@email.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={isResending}
                autoComplete="email"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary btn-primary--stack"
            disabled={isResending}
          >
            {isResending ? (
              <span className="btn-loading">...</span>
            ) : (
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t('registerThankYou.resend')}</span>
              </span>
            )}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: 16 }}>
          <Link to="/login" className="auth-switch-link auth-switch-link--login">
            {t('registerThankYou.backToLogin')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;

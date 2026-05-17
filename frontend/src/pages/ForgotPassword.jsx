import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { requestPasswordReset } from '../services/authService.js';
import { getAxiosErrorMessage } from '../utils/apiErrorMessage.js';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: '' }));
  };

  const validate = () => {
    const next = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = t('forgotPassword.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(trimmed)) {
      next.email = t('forgotPassword.errors.emailInvalid');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const trimmed = email.trim();
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    try {
      await requestPasswordReset(trimmed);
      setSubmittedEmail(trimmed);
      toast.success(t('forgotPassword.successToast'));
    } catch (err) {
      const msg = getAxiosErrorMessage(err);
      setErrors((prev) => ({ ...prev, general: msg }));
      toast.error(t('forgotPassword.errors.submitFailed'), { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedEmail) {
    return (
      <AuthLayout>
        <div className="auth-form-section">
          <div className="form-title-wrap form-title-wrap--center">
            <div className="form-title-row">
              <h2 className="form-title-main">{t('forgotPassword.successTitle')}</h2>
              <span className="form-title-pencil" aria-hidden="true">
                ✉
              </span>
            </div>
          </div>
          <div className="auth-forgot-success">
            <p className="auth-forgot-success-lead">
              {t('forgotPassword.successLead', { email: submittedEmail })}
            </p>
            <Link to="/login" className="btn-primary btn-primary--stack auth-forgot-back-btn">
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t('forgotPassword.backToLogin')}</span>
                <span className="btn-arrow">→</span>
              </span>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-form-section">
        <div className="form-title-wrap form-title-wrap--center">
          <div className="form-title-row">
            <h2 className="form-title-main">{t('forgotPassword.title')}</h2>
            <span className="form-title-pencil" aria-hidden="true">
              ✏
            </span>
          </div>
          <p className="auth-forgot-lead">{t('forgotPassword.lead')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {errors.general ? (
            <div className="field-group" role="alert">
              <span className="error-msg">{errors.general}</span>
            </div>
          ) : null}

          <div className="field-group">
            <label className="field-label" htmlFor="forgot-email">
              <span className="auth-label-text">{t('forgotPassword.email')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input
                id="forgot-email"
                type="email"
                name="email"
                className={`sketch-input ${errors.email ? 'input-error' : ''}`}
                placeholder="example@email.com"
                value={email}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary btn-login btn-primary--stack"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading">...</span>
            ) : (
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t('forgotPassword.submit')}</span>
                <span className="btn-arrow">→</span>
              </span>
            )}
          </button>

          <div className="auth-switch">
            <div className="auth-switch-intro">
              <span className="auth-switch-line" aria-hidden="true" />
              <span className="auth-switch-hint">{t('forgotPassword.rememberPassword')}</span>
              <span className="auth-switch-line" aria-hidden="true" />
            </div>
            <div className="auth-switch-link-wrap">
              <Link to="/login" className="auth-switch-link auth-switch-link--login">
                {t('forgotPassword.backToLogin')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;

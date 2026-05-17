import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import * as authService from '../services/authService.js';
import { getAxiosErrorMessage } from '../utils/apiErrorMessage.js';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = (searchParams.get('token') || '').trim();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const next = {};
    if (!tokenFromUrl) next.token = t('resetPassword.errors.tokenMissing');
    if (!newPassword) next.newPassword = t('resetPassword.errors.passwordRequired');
    else if (newPassword.length < 6) {
      next.newPassword = t('resetPassword.errors.passwordShort');
    }
    if (!confirmPassword) {
      next.confirmPassword = t('resetPassword.errors.confirmRequired');
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = t('resetPassword.errors.confirmMismatch');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    try {
      await authService.resetPassword({
        token: tokenFromUrl,
        newPassword,
      });
      setDone(true);
      toast.success(t('resetPassword.successToast'));
    } catch (err) {
      const msg = getAxiosErrorMessage(err);
      setErrors((prev) => ({ ...prev, general: msg }));
      toast.error(t('resetPassword.errors.submitFailed'), { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tokenFromUrl) {
    return (
      <AuthLayout>
        <div className="auth-form-section">
          <div className="form-title-wrap form-title-wrap--center">
            <h2 className="form-title-main">{t('resetPassword.title')}</h2>
          </div>
          <p className="auth-forgot-lead">{t('resetPassword.errors.tokenMissing')}</p>
          <Link to="/forgot-password" className="auth-switch-link">
            {t('resetPassword.requestNewLink')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="auth-form-section">
          <div className="form-title-wrap form-title-wrap--center">
            <div className="form-title-row">
              <h2 className="form-title-main">{t('resetPassword.successTitle')}</h2>
              <span className="form-title-pencil" aria-hidden="true">
                ✓
              </span>
            </div>
          </div>
          <div className="auth-forgot-success">
            <p className="auth-forgot-success-lead">{t('resetPassword.successLead')}</p>
            <button
              type="button"
              className="btn-primary btn-primary--stack"
              onClick={() => navigate('/login', { replace: true })}
            >
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t('resetPassword.backToLogin')}</span>
                <span className="btn-arrow">→</span>
              </span>
            </button>
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
            <h2 className="form-title-main">{t('resetPassword.title')}</h2>
            <span className="form-title-pencil" aria-hidden="true">
              ✏
            </span>
          </div>
          <p className="auth-forgot-lead">{t('resetPassword.lead')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {errors.general ? (
            <div className="field-group" role="alert">
              <span className="error-msg">{errors.general}</span>
            </div>
          ) : null}

          <div className="field-group">
            <label className="field-label" htmlFor="reset-new-password">
              <span className="auth-label-text">{t('resetPassword.newPassword')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                className={`sketch-input ${errors.newPassword ? 'input-error' : ''}`}
                placeholder={t('resetPassword.passwordPlaceholder')}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors((p) => ({ ...p, newPassword: '' }));
                  }
                }}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={t('login.showPassword')}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.newPassword && (
              <span className="error-msg">{errors.newPassword}</span>
            )}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="reset-confirm-password">
              <span className="auth-label-text">{t('resetPassword.confirmPassword')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                className={`sketch-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder={t('resetPassword.confirmPlaceholder')}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((p) => ({ ...p, confirmPassword: '' }));
                  }
                }}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={t('login.showPassword')}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-msg">{errors.confirmPassword}</span>
            )}
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
                <span className="btn-primary-main">{t('resetPassword.submit')}</span>
                <span className="btn-arrow">→</span>
              </span>
            )}
          </button>

          <div className="auth-switch">
            <div className="auth-switch-link-wrap">
              <Link to="/login" className="auth-switch-link auth-switch-link--login">
                {t('resetPassword.backToLogin')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;

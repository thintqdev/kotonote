import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { getAxiosErrorMessage } from '../utils/apiErrorMessage.js';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  const validate = () => {
    const next = {};
    if (!data.username.trim()) next.username = t('register.errors.username');
    else if (data.username.trim().length < 2) {
      next.username = t('register.errors.usernameShort');
    }
    if (!data.email.trim()) next.email = t('register.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(data.email)) next.email = t('register.errors.emailInvalid');
    if (!data.password) next.password = t('register.errors.passwordRequired');
    else if (data.password.length < 6) next.password = t('register.errors.passwordShort');
    if (!data.confirmPassword) next.confirmPassword = t('register.errors.confirmRequired');
    else if (data.password !== data.confirmPassword) next.confirmPassword = t('register.errors.confirmMismatch');
    if (!agreeTerms) next.terms = t('register.errors.terms');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    try {
      await register(
        data.username.trim(),
        data.email.trim(),
        data.password,
        rememberMe,
      );
      toast.success(t('register.success'));
      navigate('/survey', { replace: true });
    } catch (err) {
      const msg = getAxiosErrorMessage(err);
      setErrors((prev) => ({ ...prev, general: msg }));
      toast.error(t('register.errors.submitFailed'), { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-section">
        <div className="form-title-wrap form-title-wrap--center">
          <h2 className="form-title-main">{t('register.title')}</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {errors.general ? (
            <div className="field-group" role="alert">
              <span className="error-msg">{errors.general}</span>
            </div>
          ) : null}
          <div className="field-group">
            <label className="field-label" htmlFor="reg-username">
              <span className="auth-label-text">{t('register.username')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input
                id="reg-username"
                type="text"
                name="username"
                className={`sketch-input ${errors.username ? 'input-error' : ''}`}
                placeholder={t('register.usernamePh')}
                value={data.username}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="username"
              />
            </div>
            {errors.username && <span className="error-msg">{errors.username}</span>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="reg-email">
              <span className="auth-label-text">{t('register.email')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input
                id="reg-email"
                type="email"
                name="email"
                className={`sketch-input ${errors.email ? 'input-error' : ''}`}
                placeholder="example@email.com"
                value={data.email}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="reg-password">
              <span className="auth-label-text">{t('register.password')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`sketch-input ${errors.password ? 'input-error' : ''}`}
                placeholder={t('register.passwordPh')}
                value={data.password}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={t('register.showPassword')}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="reg-confirm">
              <span className="auth-label-text">{t('register.confirmPassword')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="reg-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`sketch-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder={t('register.confirmPh')}
                value={data.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={t('register.showPassword')}
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
          </div>

          <div className="form-extras">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-text">{t('login.remember')}</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary btn-register btn-primary--stack"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading">...</span>
            ) : (
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t('register.submit')}</span>
                <span className="btn-arrow">→</span>
              </span>
            )}
          </button>

          <label className={`checkbox-label terms-label ${errors.terms ? 'terms-error' : ''}`}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.terms) setErrors((p) => ({ ...p, terms: '' }));
              }}
            />
            <span className="checkbox-text">
              {t('register.termsPrefix')}{' '}
              <a href="#" className="terms-link">{t('register.terms')}</a>
              {' '}{t('register.termsAnd')}{' '}
              <a href="#" className="terms-link">{t('register.privacy')}</a>
            </span>
          </label>
          {errors.terms && <span className="error-msg">{errors.terms}</span>}

          <div className="auth-switch">
            <div className="auth-switch-intro">
              <span className="auth-switch-line" aria-hidden="true" />
              <span className="auth-switch-hint">{t('register.hasAccount')}</span>
              <span className="auth-switch-line" aria-hidden="true" />
            </div>
            <div className="auth-switch-link-wrap">
              <Link to="/login" className="auth-switch-link auth-switch-link--login">
                {t('register.login')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;

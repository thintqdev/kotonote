import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { getAxiosErrorMessage } from '../utils/apiErrorMessage.js';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  const validate = () => {
    const next = {};
    if (!loginData.email.trim()) next.email = t('login.errors.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) next.email = t('login.errors.emailInvalid');
    if (!loginData.password) next.password = t('login.errors.passwordRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    try {
      await login(loginData.email.trim(), loginData.password, rememberMe);
      toast.success(t('login.success'));
      const from = location.state?.from?.pathname;
      const safePath =
        typeof from === 'string' && from.startsWith('/') && !from.startsWith('/login')
          ? from
          : '/';
      navigate(safePath, { replace: true });
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'messageCode' in err
          ? /** @type {{ messageCode?: string }} */ (err).messageCode
          : undefined;
      if (code === 'MSG_113') {
        toast.info(t('login.verifyRequired'));
        navigate('/register/thank-you', {
          replace: true,
          state: { email: loginData.email.trim() },
        });
        return;
      }
      const msg = getAxiosErrorMessage(err, t);
      setErrors((prev) => ({ ...prev, general: msg }));
      toast.error(t('login.errors.submitFailed'), { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-section">
        <div className="form-title-wrap form-title-wrap--center">
          <div className="form-title-row">
            <h2 className="form-title-main">{t('login.title')}</h2>
            <span className="form-title-pencil" aria-hidden="true">
              ✏
            </span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {errors.general ? (
            <div className="field-group" role="alert">
              <span className="error-msg">{errors.general}</span>
            </div>
          ) : null}
          <div className="field-group">
            <label className="field-label" htmlFor="login-email">
              <span className="auth-label-text">{t('login.email')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input
                id="login-email"
                type="email"
                name="email"
                className={`sketch-input ${errors.email ? 'input-error' : ''}`}
                placeholder="example@email.com"
                value={loginData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="login-password">
              <span className="auth-label-text">{t('login.password')}</span>
            </label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`sketch-input ${errors.password ? 'input-error' : ''}`}
                placeholder={t('login.passwordPlaceholder')}
                value={loginData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="current-password"
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
            {errors.password && <span className="error-msg">{errors.password}</span>}
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
            <Link to="/forgot-password" className="forgot-link">
              {t('login.forgot')}
            </Link>
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
                <span className="btn-primary-main">{t('login.submit')}</span>
                <span className="btn-arrow">→</span>
              </span>
            )}
          </button>

          <div className="divider">
            <span>{t('login.divider')}</span>
          </div>

          <button type="button" className="btn-google">
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('login.google')}
          </button>

          <div className="auth-switch">
            <div className="auth-switch-intro">
              <span className="auth-switch-line" aria-hidden="true" />
              <span className="auth-switch-hint">{t('login.noAccount')}</span>
              <span className="auth-switch-line" aria-hidden="true" />
            </div>
            <div className="auth-switch-link-wrap">
              <Link to="/register" className="auth-switch-link">
                {t('login.register')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

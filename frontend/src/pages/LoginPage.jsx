import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import GoogleSignInButton from '../components/auth/GoogleSignInButton.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { getAxiosErrorMessage } from '../utils/apiErrorMessage.js';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
      navigateAfterAuth();
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

  const navigateAfterAuth = () => {
    const from = location.state?.from?.pathname;
    const safePath =
      typeof from === 'string' && from.startsWith('/') && !from.startsWith('/login')
        ? from
        : '/';
    navigate(safePath, { replace: true });
  };

  const handleGoogleCredential = async (credential) => {
    setGoogleLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    try {
      await loginWithGoogle(credential, rememberMe);
      toast.success(t('login.success'));
      navigateAfterAuth();
    } catch (err) {
      const msg = getAxiosErrorMessage(err, t);
      setErrors((prev) => ({ ...prev, general: msg }));
      toast.error(t('login.errors.googleFailed'), { description: msg });
    } finally {
      setGoogleLoading(false);
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
                disabled={isSubmitting || googleLoading}
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
                disabled={isSubmitting || googleLoading}
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
            disabled={isSubmitting || googleLoading}
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

          <GoogleSignInButton
            disabled={isSubmitting}
            loading={googleLoading}
            onCredential={handleGoogleCredential}
          />

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

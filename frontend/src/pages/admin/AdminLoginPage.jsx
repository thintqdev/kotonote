import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { adminLogin } from "../../services/adminAuthService.js";
import {
  getAdminToken,
  setAdminToken,
} from "../../services/tokenStorage.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./AdminLoginPage.css";

function IconSprout({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 22V12M12 12c-2-4-6-5-8-2 2-6 8-5 8 2M12 12c2-4 6-5 8-2-2-6-8-5-8-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zm0 0l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 11V8a4 4 0 018 0v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconEye({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.3 10.3 0 0112 5c6 0 10 7 10 7a18.5 18.5 0 01-5.1 5.1M6.3 6.3C4.1 7.8 2 12 2 12s4 7 10 7a9.7 9.7 0 004.5-1.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (getAdminToken()) {
    return <Navigate to="/admin" replace />;
  }

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Email không hợp lệ.";
    if (!password) next.password = "Vui lòng nhập mật khẩu.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { token } = await adminLogin({ email, password });
      setAdminToken(token, remember);
      toast.success("Đăng nhập thành công", {
        description: "Chào mừng bạn đến Kotonote Studio.",
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error("Đăng nhập thất bại", {
        description: getAxiosErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-inner">
        <div className="admin-login-brand">
          <img
            src="/assets/admin/logo.png"
            alt="Kotonote"
            className="admin-login-logo-img"
          />
        </div>

        <div className="admin-login-card">
          <h1 className="admin-login-title">Đăng nhập Admin</h1>
          <p className="admin-login-sub">
            Truy cập Kotonote Studio để tiếp tục
          </p>

          <form className="admin-login-form" onSubmit={onSubmit} noValidate>
            <div className="admin-login-field">
              <label htmlFor="admin-login-email">Email</label>
              <div
                className={
                  errors.email
                    ? "admin-login-input-wrap admin-login-input-wrap--error"
                    : "admin-login-input-wrap"
                }
              >
                <span className="admin-login-input-icon">
                  <IconMail />
                </span>
                <input
                  id="admin-login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(ev) => {
                    setEmail(ev.target.value);
                    if (errors.email) setErrors((o) => ({ ...o, email: "" }));
                  }}
                  disabled={submitting}
                />
              </div>
              {errors.email ? (
                <span className="admin-login-error">{errors.email}</span>
              ) : null}
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-login-password">Mật khẩu</label>
              <div
                className={
                  errors.password
                    ? "admin-login-input-wrap admin-login-input-wrap--error"
                    : "admin-login-input-wrap"
                }
              >
                <span className="admin-login-input-icon">
                  <IconLock />
                </span>
                <input
                  id="admin-login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(ev) => {
                    setPassword(ev.target.value);
                    if (errors.password)
                      setErrors((o) => ({ ...o, password: "" }));
                  }}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="admin-login-toggle-pw"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <IconEye open={showPassword} />
                </button>
              </div>
              {errors.password ? (
                <span className="admin-login-error">{errors.password}</span>
              ) : null}
            </div>

            <div className="admin-login-row">
              <label className="admin-login-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={submitting}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#forgot" className="admin-login-forgot">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="admin-login-submit"
              disabled={submitting}
            >
              <IconSprout />
              {submitting ? "Đang xử lý…" : "Đăng nhập"}
            </button>
          </form>
        </div>

        <p className="admin-login-copy">
          Kotonote Studio © {new Date().getFullYear()}
          <br />
          Made with ♡ for Japanese learners
        </p>
      </div>
    </div>
  );
}

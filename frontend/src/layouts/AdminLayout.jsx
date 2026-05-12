import PropTypes from "prop-types";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ADMIN_SIDEBAR_SECTIONS } from "../constants/adminNav.js";
import { USER_ROLE } from "../constants/userRole.js";
import { fetchAdminSession } from "../services/adminAuthService.js";
import { clearAdminToken, getAdminToken } from "../services/tokenStorage.js";
import "./AdminLayout.css";

function isCanceledRequest(err) {
  return (
    err?.code === "ERR_CANCELED" ||
    err?.name === "CanceledError" ||
    err?.name === "AbortError"
  );
}

function AdminNavIcon({ item }) {
  if (item.iconSrc) {
    return (
      <img
        src={item.iconSrc}
        alt=""
        className="admin-nav-icon-img"
        width={22}
        height={22}
        decoding="async"
      />
    );
  }
  if (item.icon === "audio") {
    return (
      <svg
        className="admin-nav-icon-svg"
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 5v14M9 8H6a2 2 0 00-2 2v4a2 2 0 002 2h3l5 3V5l-5 3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M16 9c1.5 1.2 1.5 4.8 0 6M18 7c2.8 2.2 2.8 7.8 0 10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (item.icon === "image") {
    return (
      <svg
        className="admin-nav-icon-svg"
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
        <path
          d="M21 15l-5-5-4 4-3-3-6 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (item.icon === "doc") {
    return (
      <svg
        className="admin-nav-icon-svg"
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M7 3h8l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v4h4M8 13h8M8 17h6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (item.icon === "user") {
    return (
      <svg
        className="admin-nav-icon-svg"
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          cx="12"
          cy="9"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return <span className="admin-nav-icon-fallback" aria-hidden />;
}

AdminNavIcon.propTypes = {
  item: PropTypes.shape({
    iconSrc: PropTypes.string,
    icon: PropTypes.oneOf(["audio", "image", "doc", "user"]),
  }).isRequired,
};

function initialsFromUser(user) {
  const name = String(user?.name || "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const email = String(user?.email || "").trim();
  return email.slice(0, 2).toUpperCase() || "?";
}

function isAvatarSrc(s) {
  const t = String(s || "").trim();
  if (!t) return false;
  return (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.startsWith("data:image/") ||
    t.startsWith("/")
  );
}

function AdminSidebar() {
  const { t } = useTranslation();

  return (
    <aside className="admin-sidebar" aria-label={t("adminLayout.sidebar.aria")}>
      <div className="admin-sidebar-spine" aria-hidden="true" />
      <div className="admin-sidebar-bg" aria-hidden="true" />
      <div className="admin-sidebar-inner">
        <div className="admin-sidebar-brand">
          <img
            className="admin-sidebar-logo"
            src="/assets/admin/logo.png"
            alt=""
            width={160}
            height={48}
            decoding="async"
          />
        </div>

        <nav className="admin-sidebar-nav" id="admin-sidebar-nav">
          {ADMIN_SIDEBAR_SECTIONS.map((section) => (
            <div key={section.id} className="admin-nav-section">
              {section.titleKey ? (
                <p className="admin-nav-section-title">{t(section.titleKey)}</p>
              ) : null}
              <ul className="admin-nav-list">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.to}
                      end={Boolean(item.end)}
                      className={({ isActive }) =>
                        [
                          "admin-nav-link",
                          isActive ? "admin-nav-link--active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")
                      }
                    >
                      <span className="admin-nav-link-icon">
                        <AdminNavIcon item={item} />
                      </span>
                      <span className="admin-nav-link-label">
                        {t(item.labelKey)}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-help">
          <div className="admin-sidebar-help-deco" aria-hidden="true">
            🪴
          </div>
          <p className="admin-sidebar-help-title">
            {t("adminLayout.help.title")}
          </p>
          <a className="admin-sidebar-help-link" href="#admin-guide">
            {t("adminLayout.help.link")}
          </a>
        </div>
      </div>
    </aside>
  );
}

function AdminAccountMenu({ user, verifying, onLogout }) {
  const { t } = useTranslation();
  const menuId = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    setImgBroken(false);
  }, [user?._id, user?.avatar]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const avatarUrl =
    user && isAvatarSrc(user.avatar) && !imgBroken ? user.avatar.trim() : null;
  const initials = user ? initialsFromUser(user) : "";

  return (
    <div className="admin-account-menu" ref={rootRef}>
      <button
        type="button"
        className={`admin-account-trigger${verifying ? " admin-account-trigger--busy" : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        disabled={verifying || !user}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="admin-account-avatar" aria-hidden>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="admin-account-avatar-img"
              onError={() => setImgBroken(true)}
            />
          ) : (
            <span className="admin-account-avatar-fallback">
              {verifying ? "…" : initials}
            </span>
          )}
        </span>
        <span className="admin-account-chevron" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open && user ? (
        <div
          className="admin-account-dropdown"
          id={menuId}
          role="menu"
          aria-label={t("adminLayout.accountMenu.aria")}
        >
          <div className="admin-account-dropdown-head">
            <p className="admin-account-dropdown-name">{user.name || "—"}</p>
            <p className="admin-account-dropdown-email">{user.email}</p>
            <p className="admin-account-dropdown-role">
              {t("adminLayout.accountMenu.roleAdmin")}
            </p>
          </div>
          <button
            type="button"
            className="admin-account-dropdown-logout"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            {t("header.logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

AdminAccountMenu.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
    role: PropTypes.string,
  }),
  verifying: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

function AdminMainHeader({ adminUser, verifying, onLogout }) {
  const { t } = useTranslation();
  return (
    <header
      className="admin-main-header"
      aria-label={t("adminLayout.mainHeader.aria")}
    >
      <div className="admin-main-header-actions">
        <Link className="admin-main-header-link" to="/">
          {t("adminLayout.mainHeader.backToApp")}
        </Link>
        <AdminAccountMenu
          user={adminUser}
          verifying={verifying}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}

AdminMainHeader.propTypes = {
  adminUser: PropTypes.object,
  verifying: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

function AdminMainFooter() {
  const { t } = useTranslation();
  return (
    <footer
      className="admin-main-footer"
      aria-label={t("adminLayout.mainFooter.aria")}
    >
      {/* HTML tags are not allowed in the translation keys */}
      <p className="admin-main-footer-copy">
        {t("adminLayout.mainFooter.copy").replace(
          "<a href='https://github.com/thintqdev' target='_blank'>Thin TQ</a>",
          "<a href='https://github.com/thintqdev' target='_blank'>Thin TQ</a>",
        )}
      </p>
    </footer>
  );
}

/**
 * Layout khu vực Studio / Admin: sidebar + header (phiên admin) / nội dung / footer.
 */
function AdminLayout({ children = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(null);
  const [verifying, setVerifying] = useState(true);

  const logout = useCallback(() => {
    clearAdminToken();
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const ac = new AbortController();

    const run = async () => {
      if (!getAdminToken()) {
        navigate("/admin/login", { replace: true });
        setVerifying(false);
        return;
      }

      setVerifying(true);
      try {
        const { user } = await fetchAdminSession({ signal: ac.signal });
        if (ac.signal.aborted) return;
        if (!user || user.role !== USER_ROLE.ADMIN) {
          clearAdminToken();
          navigate("/admin/login", { replace: true });
          return;
        }
        setAdminUser(user);
      } catch (e) {
        if (ac.signal.aborted || isCanceledRequest(e)) return;
        clearAdminToken();
        navigate("/admin/login", { replace: true });
      } finally {
        if (!ac.signal.aborted) {
          setVerifying(false);
        }
      }
    };

    void run();
    return () => ac.abort();
  }, [location.pathname, navigate]);

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminMainHeader
          adminUser={adminUser}
          verifying={verifying}
          onLogout={logout}
        />
        <div className="admin-main-scroll">{children}</div>
        <AdminMainFooter />
      </div>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node,
};

export default AdminLayout;

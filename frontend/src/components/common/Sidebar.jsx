import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_NAV_ITEMS } from '../../constants/dashboardNav.js';
import { useSidebarCollapse } from '../../context/SidebarCollapseContext.jsx';
import './Sidebar.css';

function IconSidebarCollapseChevron({ expanded }) {
  return (
    <svg
      className="dash-sidebar-collapse-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {expanded ? (
        <path
          d="M14 7l-5 5 5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M10 7l5 5-5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

IconSidebarCollapseChevron.propTypes = {
  expanded: PropTypes.bool.isRequired,
};

function NavIcon({ src }) {
  return (
    <img
      src={src}
      alt=""
      className="dash-nav-icon-img"
      width={28}
      height={28}
      decoding="async"
    />
  );
}

NavIcon.propTypes = {
  src: PropTypes.string.isRequired,
};

const MOBILE_NAV_MQ = '(max-width: 960px)';

function useMobileNavLayout() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_NAV_MQ).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_NAV_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return isMobile;
}

const Sidebar = () => {
  const { t } = useTranslation();
  const { collapsed, toggle } = useSidebarCollapse();
  const isMobile = useMobileNavLayout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  const sidebarClass = [
    'dash-sidebar',
    collapsed ? 'dash-sidebar--collapsed' : '',
    isMobile && !mobileMenuOpen ? 'dash-sidebar--mobile-nav-closed' : '',
    isMobile && mobileMenuOpen ? 'dash-sidebar--mobile-nav-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside
      className={sidebarClass}
      aria-label={t('sidebar.ariaNav')}
    >
      <button
        type="button"
        className="dash-sidebar-collapse"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-controls="dash-sidebar-nav"
        title={collapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
        aria-label={collapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
      >
        <IconSidebarCollapseChevron expanded={!collapsed} />
      </button>
      <div className="dash-sidebar-inner">
        {isMobile ? (
          <div className="dash-sidebar-mobile-bar">
            <a
              href="/"
              className="dash-sidebar-logo dash-sidebar-logo--mobile-bar"
              title={import.meta.env.VITE_APP_NAME}
            >
              <span className="dash-sidebar-logo-crop">
                <img
                  src="/assets/logo.png"
                  alt={import.meta.env.VITE_APP_NAME}
                  className="dash-sidebar-logo-img"
                  decoding="async"
                />
              </span>
            </a>
            <button
              type="button"
              className="dash-sidebar-mobile-toggle"
              aria-expanded={mobileMenuOpen}
              aria-controls="dash-sidebar-nav"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen
                ? t('sidebar.closeMenu')
                : t('sidebar.openMenu')}
            </button>
          </div>
        ) : null}
        <a
          href="/"
          className={`dash-sidebar-logo${isMobile ? ' dash-sidebar-logo--desktop-hidden' : ''}`}
          title={import.meta.env.VITE_APP_NAME}
        >
          <span className="dash-sidebar-logo-crop">
            <img
              src="/assets/logo.png"
              alt={import.meta.env.VITE_APP_NAME}
              className="dash-sidebar-logo-img"
              decoding="async"
            />
          </span>
        </a>

        <nav
          id="dash-sidebar-nav"
          className="dash-sidebar-nav"
          aria-label={t('sidebar.ariaMenu')}
        >
          <ul className="dash-sidebar-list">
            {DASHBOARD_NAV_ITEMS.map((item) => {
              const label = t(`nav.${item.id}`);
              return (
              <li key={item.id}>
                {item.to ? (
                  <NavLink
                    to={item.to}
                    end={item.end}
                    title={label}
                    onClick={() => {
                      if (isMobile) setMobileMenuOpen(false);
                    }}
                    className={({ isActive }) =>
                      `dash-nav-item${
                        isActive ? ' dash-nav-item--active' : ''
                      }`
                    }
                  >
                    <span className="dash-nav-icon" aria-hidden="true">
                      <NavIcon src={item.iconSrc} />
                    </span>
                    <span className="dash-nav-text">
                      <span className="dash-nav-label">{label}</span>
                    </span>
                  </NavLink>
                ) : (
                  <span
                    className="dash-nav-item dash-nav-item--soon"
                    title={t('nav.soon', { label })}
                  >
                    <span className="dash-nav-icon" aria-hidden="true">
                      <NavIcon src={item.iconSrc} />
                    </span>
                    <span className="dash-nav-text">
                      <span className="dash-nav-label">{label}</span>
                    </span>
                  </span>
                )}
              </li>
            );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

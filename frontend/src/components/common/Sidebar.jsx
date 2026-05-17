import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_NAV_ITEMS } from '../../constants/dashboardNav.js';
import { useSidebarCollapse } from '../../context/SidebarCollapseContext.jsx';
import StreakCard from '../dashboard/StreakCard.jsx';
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

const Sidebar = ({ streakDays }) => {
  const { t } = useTranslation();
  const { collapsed, toggle } = useSidebarCollapse();

  return (
    <aside
      className={`dash-sidebar${collapsed ? ' dash-sidebar--collapsed' : ''}`}
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
        <a
          href="/"
          className="dash-sidebar-logo"
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

        <div className="dash-sidebar-streak-wrap">
          <StreakCard days={streakDays} />
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  streakDays: PropTypes.number,
};

export default Sidebar;

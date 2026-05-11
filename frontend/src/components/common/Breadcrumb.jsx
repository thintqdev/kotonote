import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import './Breadcrumb.css';

const itemPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  /** Bắt buộc với các mục cha (không phải mục cuối) */
  to: PropTypes.string,
  /** Cho `NavLink` tới `/` khớp đúng trang chủ */
  end: PropTypes.bool,
});

/**
 * Breadcrumb — nhãn một dòng (tiếng Việt).
 * Mục cuối là trang hiện tại (`<h1>`, không phải link).
 */
function Breadcrumb({ items }) {
  if (!items?.length) return null;

  return (
    <nav className="dash-breadcrumb" aria-label="Breadcrumb">
      <ol className="dash-breadcrumb-list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          const key = last
            ? `current-${item.label}`
            : `${item.to ?? 'seg'}-${index}`;

          return (
            <li key={key} className="dash-breadcrumb-item">
              {last ? (
                <h1 className="dash-breadcrumb-heading">
                  <span className="dash-breadcrumb-label">
                    <span className="dash-breadcrumb-text">{item.label}</span>
                  </span>
                </h1>
              ) : (
                <NavLink
                  end={Boolean(item.end)}
                  to={item.to}
                  className={({ isActive }) =>
                    `dash-breadcrumb-link${
                      isActive ? ' dash-breadcrumb-link--active' : ''
                    }`
                  }
                >
                  <span className="dash-breadcrumb-label">
                    <span className="dash-breadcrumb-text">{item.label}</span>
                  </span>
                </NavLink>
              )}
              {!last ? (
                <span className="dash-breadcrumb-chev" aria-hidden="true">
                  ›
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(itemPropType).isRequired,
};

export default Breadcrumb;

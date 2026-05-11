import PropTypes from 'prop-types';
import { SidebarCollapseProvider } from '../context/SidebarCollapseContext.jsx';
import './Layout.css';

const Layout = ({ children }) => (
  <SidebarCollapseProvider>
    <div className="dash-shell">
      <div className="dash-shell-bg" aria-hidden="true" />
      {children}
    </div>
  </SidebarCollapseProvider>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;

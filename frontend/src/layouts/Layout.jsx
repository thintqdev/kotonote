import PropTypes from "prop-types";
import { SidebarCollapseProvider } from "../context/SidebarCollapseContext.jsx";
import { Sidebar, Header, Footer } from "../components/common";
import "./Layout.css";

/**
 * Vỏ dashboard: Sidebar + Header + vùng nội dung + Footer.
 * Các trang chỉ cần truyền props chung và đặt nội dung (breadcrumb, article…) vào children.
 */
function Layout({
  children,
  userName,
  notificationCount,
  footerQuote,
  streakDays,
  pageClassName = "",
  mainInnerClassName = "",
}) {
  const pageClasses = ["dash-page", pageClassName].filter(Boolean).join(" ");
  const innerClasses = ["dash-main-inner", mainInnerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <SidebarCollapseProvider>
      <div className="dash-shell">
        <div className="dash-shell-bg" aria-hidden="true" />
        <div className={pageClasses}>
          <Sidebar streakDays={streakDays} />
          <div className="dash-main">
            <Header
              userName={userName}
              notificationCount={notificationCount}
            />
            <div className={innerClasses}>
              {children}
              <Footer quote={footerQuote} />
            </div>
          </div>
        </div>
      </div>
    </SidebarCollapseProvider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  userName: PropTypes.string.isRequired,
  notificationCount: PropTypes.number.isRequired,
  footerQuote: PropTypes.string.isRequired,
  streakDays: PropTypes.number.isRequired,
  pageClassName: PropTypes.string,
  mainInnerClassName: PropTypes.string,
};

export default Layout;

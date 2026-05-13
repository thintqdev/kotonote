import PropTypes from "prop-types";
import { SidebarCollapseProvider } from "../context/SidebarCollapseContext.jsx";
import { useUserNotifications } from "../context/UserNotificationContext.jsx";
import { Sidebar, Header, Footer } from "../components/common";
import "./Layout.css";

/**
 * Vỏ dashboard: Sidebar + Header + vùng nội dung + Footer.
 * Các trang chỉ cần truyền props chung và đặt nội dung (breadcrumb, article…) vào children.
 */
function Layout({
  children,
  userName,
  footerQuote,
  streakDays,
  pageClassName = "",
  mainInnerClassName = "",
}) {
  const { unreadCount } = useUserNotifications();
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
            <Header userName={userName} notificationCount={unreadCount} />
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
  footerQuote: PropTypes.string.isRequired,
  streakDays: PropTypes.number.isRequired,
  pageClassName: PropTypes.string,
  mainInnerClassName: PropTypes.string,
};

export default Layout;

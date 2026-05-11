import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';

export const SIDEBAR_COLLAPSED_STORAGE_KEY = 'kotonote-sidebar-collapsed';

const SidebarCollapseContext = createContext(null);

function readStoredCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function SidebarCollapseProvider({ children }) {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY,
        collapsed ? '1' : '0',
      );
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const sync = () => {
      if (mq.matches) setCollapsed(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const value = useMemo(
    () => ({ collapsed, setCollapsed, toggle }),
    [collapsed, toggle],
  );

  return (
    <SidebarCollapseContext.Provider value={value}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}

SidebarCollapseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Dùng trong Header / Sidebar. Nếu thiếu Provider → coi như sidebar mở, toggle no-op.
 */
export function useSidebarCollapse() {
  const ctx = useContext(SidebarCollapseContext);
  if (!ctx) {
    return {
      collapsed: false,
      setCollapsed: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

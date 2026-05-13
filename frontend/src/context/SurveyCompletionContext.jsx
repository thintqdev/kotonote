import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth.jsx";
import { fetchSurveyCompletionStatus } from "../services/surveyUserService.js";

const SurveyCompletionContext = createContext(null);

/**
 * Trạng thái khảo sát đã gửi hay chưa — phục vụ guard sau đăng nhập.
 */
export function SurveyCompletionProvider({ children }) {
  const { user } = useAuth();
  const [completed, setCompleted] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCompleted(null);
      setReady(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchSurveyCompletionStatus();
      setCompleted(Boolean(data?.completed));
    } catch {
      setCompleted(false);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      completed,
      ready,
      loading,
      refresh,
    }),
    [completed, ready, loading, refresh],
  );

  return (
    <SurveyCompletionContext.Provider value={value}>
      {children}
    </SurveyCompletionContext.Provider>
  );
}

SurveyCompletionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useSurveyCompletion() {
  const ctx = useContext(SurveyCompletionContext);
  if (!ctx) {
    throw new Error("useSurveyCompletion must be used within SurveyCompletionProvider");
  }
  return ctx;
}

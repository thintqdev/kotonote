import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getLeaderboards } from "../services/leaderboardService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";

const PREVIEW_LIMIT = 3;

/**
 * Top 3 cho widget Dashboard (không block render trang chủ).
 * @param {{ enabled: boolean, jlpt: string }} opts
 */
export function useLeaderboardPreview({ enabled, jlpt }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError("");
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getLeaderboards({ jlpt, limit: PREVIEW_LIMIT });
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, t));
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [enabled, jlpt, t]);

  return { data, loading, error, limit: PREVIEW_LIMIT };
}

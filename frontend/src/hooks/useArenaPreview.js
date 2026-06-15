import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getArenaStatus } from "../services/arenaService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";

/**
 * @param {{ enabled?: boolean }} opts
 */
export function useArenaPreview({ enabled = true } = {}) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      const res = await getArenaStatus();
      setData(res);
    } catch (err) {
      setData(null);
      setError(getApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [enabled, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [enabled, load]);

  return { data, loading, error, reload: load };
}

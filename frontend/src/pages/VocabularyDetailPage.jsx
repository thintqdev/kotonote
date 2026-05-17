import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import { findVocabularyWordMeta } from "../services/vocabularyService.js";
import { getApiErrorMessage } from "../utils/apiErrorMessage.js";

/**
 * Trang chi tiết từ đơn lẻ được gộp vào trang bài (flashcard + kiểm tra).
 * Luôn chuyển tới /vocabulary/lesson/:n?jlpt= theo deck chứa từ đó.
 */
export default function VocabularyDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const found = await findVocabularyWordMeta(id);
        if (!cancelled) setMeta(found);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, t));
          setMeta(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user, t]);

  if (!id) {
    return <Navigate to="/vocabulary/browse" replace />;
  }

  if (loading) {
    return null;
  }

  if (error) {
    return <Navigate to="/vocabulary/browse" replace />;
  }

  if (!meta) {
    return <Navigate to="/vocabulary/browse" replace />;
  }

  const jlpt = encodeURIComponent(meta.jlpt);
  return (
    <Navigate
      to={`/vocabulary/lesson/${meta.lessonNo}?jlpt=${jlpt}`}
      replace
    />
  );
}

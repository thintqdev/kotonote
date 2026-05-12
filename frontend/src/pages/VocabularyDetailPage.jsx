import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  VOCAB_ITEMS,
  mergeVocabMarks,
  findLessonMetaByVocabId,
} from "../data/vocabularyMock.js";

/**
 * Trang chi tiết từ đơn lẻ được gộp vào trang bài (flashcard + kiểm tra).
 * Luôn chuyển tới /vocabulary/lesson/:n?jlpt= theo bài chứa từ đó.
 */
export default function VocabularyDetailPage() {
  const { id } = useParams();
  const [marks] = useState(() => ({}));
  const merged = useMemo(() => mergeVocabMarks(VOCAB_ITEMS, marks), [marks]);
  const meta = useMemo(
    () => (id ? findLessonMetaByVocabId(merged, id) : null),
    [merged, id],
  );

  if (!id) {
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

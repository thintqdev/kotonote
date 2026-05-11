import {
  EXAM_LEVEL_KEYS_BY_TYPE,
  defaultLevelForType,
} from "../constants/profileExamGoals.js";
import { formatIsoDateLong } from "./dateIso.js";

/**
 * @param {(k: string) => string} t
 * @param {{ examTypeKey: string, examLevelKey: string, examOtherNote?: string }} fields
 */
export function buildExamTargetDisplay(t, fields) {
  const { examTypeKey, examLevelKey, examOtherNote } = fields;
  const note = String(examOtherNote || "").trim();

  if (examTypeKey === "other") {
    return note || t("profile.examTypes.other");
  }

  const typeLabel = t(`profile.examTypes.${examTypeKey}`);
  const levels = EXAM_LEVEL_KEYS_BY_TYPE[examTypeKey];
  if (!levels?.length) {
    return typeLabel;
  }
  const levelLabel = t(`profile.examLevels.${examTypeKey}.${examLevelKey}`);
  return `${typeLabel} · ${levelLabel}`;
}

/**
 * @param {string} isoDate YYYY-MM-DD
 * @param {string} language i18n language code
 */
export function formatExamDateLong(isoDate, language) {
  return formatIsoDateLong(isoDate, language);
}

/**
 * Gộp dữ liệu profile + override để luôn có đủ trường chọn kỳ thi / cấp / ngày.
 * @param {object} p
 */
export function resolveGoalExamFields(p) {
  const typeKey =
    p.examTypeKey && String(p.examTypeKey).length ? p.examTypeKey : "jlpt";

  let levelKey = p.examLevelKey || "";
  const allowed = EXAM_LEVEL_KEYS_BY_TYPE[typeKey] || [];

  if (typeKey !== "other" && allowed.length) {
    if (!levelKey || !allowed.includes(levelKey)) {
      levelKey = defaultLevelForType(typeKey);
    }
  } else if (typeKey === "other") {
    levelKey = "";
  }

  let dateIso = p.examDateIso || "";
  if (dateIso && !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    dateIso = "";
  }

  const otherNote = String(p.examOtherNote || "");

  return {
    examTypeKey: typeKey,
    examLevelKey: levelKey,
    examDateIso: dateIso,
    examOtherNote: otherNote,
  };
}

import { resolveGoalExamFields } from "./profileExamDisplay.js";

/** @type {Record<string, string>} */
const JLPT_KEY_TO_LABEL = {
  n5: "N5",
  n4: "N4",
  n3: "N3",
  n2: "N2",
  n1: "N1",
};

/**
 * Cấp JLPT từ mục tiêu kỳ thi trên profile (mặc định N5).
 * @param {object} [profile]
 * @returns {string}
 */
export function jlptLevelFromProfile(profile) {
  const { examTypeKey, examLevelKey } = resolveGoalExamFields(profile || {});
  if (examTypeKey !== "jlpt") return "N5";
  return JLPT_KEY_TO_LABEL[examLevelKey] || "N5";
}

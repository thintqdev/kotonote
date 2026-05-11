/**
 * Mục tiêu kỳ thi trên Profile — mã ổn định cho localStorage / draft.
 */
export const EXAM_TYPE_ORDER = [
  "jlpt",
  "nat",
  "jtest",
  "topj",
  "eju",
  "other",
];

/** @type {Record<string, string[]>} */
export const EXAM_LEVEL_KEYS_BY_TYPE = {
  jlpt: ["n5", "n4", "n3", "n2", "n1"],
  nat: ["q5", "q4", "q3", "q2", "q1"],
  jtest: ["a", "b", "c", "d"],
  topj: ["shokyu", "chukyu", "junkyu", "jokyu"],
  eju: ["nihongo", "full"],
  other: [],
};

export function defaultLevelForType(typeKey) {
  const keys = EXAM_LEVEL_KEYS_BY_TYPE[typeKey];
  return keys?.length ? keys[0] : "";
}

export function isValidLevelForType(typeKey, levelKey) {
  const keys = EXAM_LEVEL_KEYS_BY_TYPE[typeKey];
  if (!keys?.length) return true;
  return keys.includes(levelKey);
}

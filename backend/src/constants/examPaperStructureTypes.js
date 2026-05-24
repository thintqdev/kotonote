/**
 * @typedef {Object} ExamQuestion
 * @property {number} [questionNumber]
 * @property {string} [questionJa]
 * @property {string} [questionVi]
 * @property {string} [questionType]
 * @property {string[]} [choices]
 * @property {string[]} [choiceImages]
 * @property {number} [answerIndex]
 * @property {string} [explainVi]
 * @property {string} [explainJa]
 * @property {number} [points]
 */

/**
 * @typedef {Object} ExamSection
 * @property {string} sectionType
 * @property {string} partType
 * @property {string} [titleVi]
 * @property {string} [titleJa]
 * @property {string} [descriptionVi]
 * @property {number} [order]
 * @property {number} [timeLimitMinutes]
 * @property {string} [passageJa]
 * @property {string} [passageVi]
 * @property {string} [audioUrl]
 * @property {string} [imageUrl]
 * @property {ExamQuestion[]} [questions]
 */

export {};

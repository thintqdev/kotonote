/**
 * @typedef {Object} DashboardHomeSubject
 * @property {string} id
 * @property {string} route
 * @property {number} progress
 * @property {number} totalCount
 * @property {'cream'|'yellow'|'pink'|'blue'|'green'} tint
 * @property {'default'|'binder'} [variant]
 */

/**
 * @typedef {Object} DashboardHomeTodayTask
 * @property {string} subjectId
 * @property {string} detailKey
 * @property {number} target
 * @property {number} completed
 */

/**
 * @typedef {Object} DashboardHomeData
 * @property {{ days: number }} streak
 * @property {DashboardHomeSubject[]} subjects
 * @property {{ percent: number, tasks: DashboardHomeTodayTask[] }} today
 */

export {};

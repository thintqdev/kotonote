/** localStorage / sessionStorage keys — tránh magic string rải rác */

export const STORAGE_KEYS = {
	USER_TOKEN: 'token',
	/** Admin JWT — có thể nằm ở localStorage (ghi nhớ) hoặc sessionStorage */
	ADMIN_TOKEN: 'adminToken',
};

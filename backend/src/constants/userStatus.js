// User Status Constants
export const USER_STATUS = {
	ACTIVE: 'active',
	LOCKED: 'locked',
	SUSPENDED: 'suspended',
};

// User Role Constants
export const USER_ROLE = {
	USER: 'user',
	ADMIN: 'admin',
};

// Auth Provider Constants
export const AUTH_PROVIDER = {
	LOCAL: 'local',
	GOOGLE: 'google',
};

// Login Attempt Constants
export const LOGIN_ATTEMPT = {
	MAX_ATTEMPTS: 5,
	LOCK_TIME: 15 * 60 * 1000, // 15 minutes in milliseconds
};

// Token Expiry Constants
export const TOKEN_EXPIRY = {
	EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
	PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
};

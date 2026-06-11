/**
 * Custom Application Error class
 * Extends built-in Error to provide structured error handling
 */
class AppError extends Error {
	/**
	 * @param {string} messageCode
	 * @param {number} [statusCode]
	 * @param {unknown} [errors]
	 */
	constructor(messageCode, statusCode = 500, errors = null) {
		super(messageCode);
		this.messageCode = messageCode;
		this.statusCode = statusCode;
		this.errors = errors;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;

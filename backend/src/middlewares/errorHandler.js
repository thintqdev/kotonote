import { COMMON } from '../constants/messages.js';

/**
 * Error handling middleware
 * Must be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const msg = String(err.message ?? '');
	const messageCode =
		err.messageCode ||
		(/^MSG_\d+$/i.test(msg) ? msg : null) ||
		COMMON.SERVER_ERROR;

	res.status(statusCode).json({
		success: false,
		messageCode,
		...(err.errors != null ? { errors: err.errors } : {}),
		...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
	});
};

export default errorHandler;

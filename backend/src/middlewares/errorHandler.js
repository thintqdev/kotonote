import { COMMON } from '../constants/messages.js';

/**
 * Error handling middleware
 * Must be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const messageCode = err.messageCode || COMMON.SERVER_ERROR;

	res.status(statusCode).json({
		success: false,
		messageCode,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	});
};

export default errorHandler;

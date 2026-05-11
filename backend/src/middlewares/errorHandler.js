/**
 * Error handling middleware
 * Must be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || 'Server Error';

	res.status(statusCode).json({
		success: false,
		message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack })
	});
};

export default errorHandler;

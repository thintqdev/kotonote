export const apiSuccess = (res, data = null, messageCode = 'MSG_SUCCESS', statusCode = 200) => {
	const response = {
		success: true,
		messageCode
	};
	if (data) response.data = data;
	
	return res.status(statusCode).json(response);
};

export const apiError = (res, messageCode = 'MSG_SERVER_ERROR', statusCode = 500, errors = null) => {
	const response = {
		success: false,
		messageCode
	};
	if (errors) response.errors = errors;
	
	return res.status(statusCode).json(response);
};

export const apiPaginated = (res, data, pagination, messageCode = 'MSG_SUCCESS', statusCode = 200) => {
	return res.status(statusCode).json({
		success: true,
		messageCode,
		data,
		pagination
	});
};

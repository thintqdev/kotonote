export const apiSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
	const response = {
		success: true,
		message
	};
	if (data) response.data = data;
	
	return res.status(statusCode).json(response);
};

export const apiError = (res, message = 'Server Error', statusCode = 500, errors = null) => {
	const response = {
		success: false,
		message
	};
	if (errors) response.errors = errors;
	
	return res.status(statusCode).json(response);
};

export const apiPaginated = (res, data, pagination, message = 'Success', statusCode = 200) => {
	return res.status(statusCode).json({
		success: true,
		message,
		data,
		pagination
	});
};

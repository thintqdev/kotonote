/** Cấu hình axios khi gửi FormData (để browser tự set boundary). */
export const multipartAxiosConfig = {
	transformRequest: [
		(data, headers) => {
			if (typeof FormData !== 'undefined' && data instanceof FormData) {
				delete headers['Content-Type'];
			}
			return data;
		},
	],
};

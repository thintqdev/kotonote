const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

export const adminListeningUploadPaths = {
	'/api/admin/listening/upload/audio': {
		post: {
			tags: ['Admin - Listening'],
			summary: 'Upload listening audio file (Admin)',
			description: 'Multipart field `audio` — lưu MinIO folder `listening/audio`, trả URL công khai',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							required: ['audio'],
							properties: {
								audio: { type: 'string', format: 'binary' },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Audio uploaded',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_960' },
									data: {
										type: 'object',
										properties: {
											url: {
												type: 'string',
												example:
													'http://localhost:9000/kotonote-uploads/listening/audio/audio-123.mp3',
											},
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
	'/api/admin/listening/upload/image': {
		post: {
			tags: ['Admin - Listening'],
			summary: 'Upload listening image (Admin)',
			description:
				'Multipart field `image` — ảnh minh họa hoặc ảnh đáp án; folder `listening/images`',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							required: ['image'],
							properties: {
								image: { type: 'string', format: 'binary' },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Image uploaded',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_961' },
									data: {
										type: 'object',
										properties: {
											url: {
												type: 'string',
												example:
													'http://localhost:9000/kotonote-uploads/listening/images/img-123.jpg',
											},
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
};

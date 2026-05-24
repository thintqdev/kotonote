const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'404': { $ref: '#/components/responses/NotFound' },
};

export const notebookPaths = {
	'/api/notebook/notes': {
		get: {
			tags: ['Notebook'],
			summary: 'List my notes',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 } },
				{ name: 'q', in: 'query', schema: { type: 'string', maxLength: 120 }, description: 'Search title/content' },
			],
			responses: {
				'200': {
					description: 'Notes listed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1201' },
									data: {
										type: 'object',
										properties: {
											notes: {
												type: 'array',
												items: { $ref: '#/components/schemas/NotebookNote' },
											},
											pagination: {
												type: 'object',
												properties: {
													page: { type: 'integer' },
													limit: { type: 'integer' },
													total: { type: 'integer' },
													pages: { type: 'integer' },
												},
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
		post: {
			tags: ['Notebook'],
			summary: 'Create note',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string', maxLength: 200 },
								contentHtml: { type: 'string', maxLength: 500000 },
								coverColor: { type: 'string', example: 'sakura' },
								isPinned: { type: 'boolean' },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Note created',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1202' },
									data: {
										type: 'object',
										properties: {
											note: { $ref: '#/components/schemas/NotebookNote' },
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
	'/api/notebook/notes/{id}': {
		get: {
			tags: ['Notebook'],
			summary: 'Get note by ID',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Note retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1203' },
									data: {
										type: 'object',
										properties: {
											note: { $ref: '#/components/schemas/NotebookNote' },
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
		put: {
			tags: ['Notebook'],
			summary: 'Update note',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							minProperties: 1,
							properties: {
								title: { type: 'string', maxLength: 200 },
								contentHtml: { type: 'string' },
								coverColor: { type: 'string' },
								isPinned: { type: 'boolean' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Note updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1204' },
									data: {
										type: 'object',
										properties: {
											note: { $ref: '#/components/schemas/NotebookNote' },
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
		delete: {
			tags: ['Notebook'],
			summary: 'Delete note',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Note deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1205' },
									data: {
										type: 'object',
										properties: {
											deleted: { type: 'boolean', example: true },
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
	},
	'/api/notebook/images': {
		post: {
			tags: ['Notebook'],
			summary: 'Upload note image',
			description: 'Multipart field `image`; returns public URL path',
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
									messageCode: { type: 'string', example: 'MSG_1206' },
									data: {
										type: 'object',
										properties: {
											url: { type: 'string', example: '/uploads/notebook/userId/file.jpg' },
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

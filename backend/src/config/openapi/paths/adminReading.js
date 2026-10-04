const adminListParams = [
	{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
	{
		name: 'limit',
		in: 'query',
		schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
	},
	{
		name: 'jlpt',
		in: 'query',
		schema: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
	},
	{ name: 'q', in: 'query', schema: { type: 'string' } },
	{
		name: 'isPublished',
		in: 'query',
		schema: { type: 'string', enum: ['true', 'false'] },
	},
];

const adminAuth = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

export const adminReadingPaths = {
	'/api/admin/reading/upload-cover': {
		post: {
			tags: ['Reading - Admin'],
			summary: 'Upload cover image (draft, before article exists)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							required: ['cover'],
							properties: {
								cover: { type: 'string', format: 'binary' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Returns imageUrl path',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_939' },
									data: {
										type: 'object',
										properties: {
											imageUrl: {
												type: 'string',
												example: '/uploads/reading/reading-draft-123.jpg',
											},
										},
									},
								},
							},
						},
					},
				},
				...adminAuth,
			},
		},
	},
	'/api/admin/reading': {
		get: {
			tags: ['Reading - Admin'],
			summary: 'List reading articles (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: adminListParams,
			responses: {
				'200': {
					description: 'Article list',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_935' },
									data: {
										type: 'object',
										properties: {
											items: {
												type: 'array',
												items: { $ref: '#/components/schemas/ReadingArticle' },
											},
										},
									},
									pagination: { $ref: '#/components/schemas/Pagination' },
								},
							},
						},
					},
				},
				...adminAuth,
			},
		},
		post: {
			tags: ['Reading - Admin'],
			summary: 'Create reading article',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ReadingArticleInput' },
					},
				},
			},
			responses: {
				'201': {
					description: 'Created',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_930' },
									data: {
										type: 'object',
										properties: {
											article: { $ref: '#/components/schemas/ReadingArticle' },
										},
									},
								},
							},
						},
					},
				},
				...adminAuth,
			},
		},
	},
	'/api/admin/reading/{id}': {
		get: {
			tags: ['Reading - Admin'],
			summary: 'Get article by ID (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Article',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									data: {
										type: 'object',
										properties: {
											article: { $ref: '#/components/schemas/ReadingArticle' },
										},
									},
								},
							},
						},
					},
				},
				...adminAuth,
			},
		},
		put: {
			tags: ['Reading - Admin'],
			summary: 'Update article',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ReadingArticleInput' },
					},
				},
			},
			responses: {
				'200': { description: 'Updated' },
				...adminAuth,
			},
		},
		delete: {
			tags: ['Reading - Admin'],
			summary: 'Delete article',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': { description: 'Deleted' },
				...adminAuth,
			},
		},
	},
	'/api/admin/reading/{id}/sentence-analysis': {
		get: {
			tags: ['Reading - Admin'],
			summary: 'Sentence analysis cache status',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Status',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_941' },
									data: {
										type: 'object',
										properties: {
											status: { $ref: '#/components/schemas/ReadingSentenceAnalysisStatus' },
										},
									},
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				...adminAuth,
			},
		},
	},
	'/api/admin/reading/{id}/sentence-analysis/regenerate': {
		post: {
			tags: ['Reading - Admin'],
			summary: 'Discard and regenerate sentence analysis with AI',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Regenerated (sentences that AI failed on stay missing and are generated lazily later)',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_942' },
									data: {
										type: 'object',
										properties: {
											status: { $ref: '#/components/schemas/ReadingSentenceAnalysisStatus' },
										},
									},
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				'503': { description: 'Gemini not configured (MSG_943)' },
				...adminAuth,
			},
		},
	},
	'/api/admin/reading/{id}/cover': {
		post: {
			tags: ['Reading - Admin'],
			summary: 'Upload cover image for existing article',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							required: ['cover'],
							properties: {
								cover: { type: 'string', format: 'binary' },
							},
						},
					},
				},
			},
			responses: {
				'200': { description: 'Cover uploaded and article updated' },
				...adminAuth,
			},
		},
	},
};

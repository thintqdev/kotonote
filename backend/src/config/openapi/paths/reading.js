const listQueryParams = [
	{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
	{
		name: 'limit',
		in: 'query',
		schema: { type: 'integer', minimum: 1, maximum: 50, default: 12 },
	},
	{
		name: 'jlpt',
		in: 'query',
		schema: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
	},
	{
		name: 'mode',
		in: 'query',
		schema: { type: 'string', enum: ['all', 'suggested', 'review'], default: 'all' },
	},
];

const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
};

/** Reading API for logged-in users */
export const readingPaths = {
	'/api/reading/summary': {
		get: {
			tags: ['Reading - User'],
			summary: 'Reading progress summary',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Weekly progress',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_938' },
									data: { $ref: '#/components/schemas/ReadingSummary' },
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
	'/api/reading': {
		get: {
			tags: ['Reading - User'],
			summary: 'List published reading articles',
			security: [{ bearerAuth: [] }],
			parameters: listQueryParams,
			responses: {
				'200': {
					description: 'Article list with user status',
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
												items: { $ref: '#/components/schemas/ReadingListItem' },
											},
											jlptLevels: {
												type: 'array',
												items: { type: 'string' },
											},
										},
									},
									pagination: { $ref: '#/components/schemas/Pagination' },
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
	'/api/reading/{slug}': {
		get: {
			tags: ['Reading - User'],
			summary: 'Get article detail by slug',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Full article',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_933' },
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
				'404': { $ref: '#/components/responses/NotFound' },
				...authResponses,
			},
		},
	},
	'/api/reading/{slug}/progress': {
		put: {
			tags: ['Reading - User'],
			summary: 'Save reading progress',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ReadingProgressInput' },
					},
				},
			},
			responses: {
				'200': {
					description: 'Progress saved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_937' },
									data: {
										type: 'object',
										properties: {
											progress: { $ref: '#/components/schemas/ReadingProgress' },
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

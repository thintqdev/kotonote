const adminListParams = [
	{
		name: 'page',
		in: 'query',
		schema: { type: 'integer', minimum: 1, default: 1 },
	},
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
	{
		name: 'tag',
		in: 'query',
		schema: {
			type: 'string',
			enum: ['hearsay', 'formal', 'conjecture', 'purpose', 'goal', 'change'],
		},
	},
	{ name: 'q', in: 'query', schema: { type: 'string' } },
	{
		name: 'isPublished',
		in: 'query',
		schema: { type: 'string', enum: ['true', 'false'] },
	},
];

/** Admin grammar CRUD paths */
export const adminGrammarPaths = {
	'/api/admin/grammar': {
		get: {
			tags: ['Grammar - Admin'],
			summary: 'List all grammar points (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: adminListParams,
			responses: {
				'200': {
					description: 'Grammar list',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_918' },
									data: {
										type: 'object',
										properties: {
											items: {
												type: 'array',
												items: { $ref: '#/components/schemas/Grammar' },
											},
										},
									},
									pagination: {
										type: 'object',
										properties: {
											page: { type: 'number' },
											limit: { type: 'number' },
											total: { type: 'number' },
											pages: { type: 'number' },
										},
									},
								},
							},
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
		post: {
			tags: ['Grammar - Admin'],
			summary: 'Create grammar point (Admin)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/GrammarInput' },
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
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_913' },
									data: {
										type: 'object',
										properties: {
											grammar: { $ref: '#/components/schemas/Grammar' },
										},
									},
								},
							},
						},
					},
				},
				'409': {
					description: 'Slug already exists',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
	'/api/admin/grammar/{id}': {
		get: {
			tags: ['Grammar - Admin'],
			summary: 'Get grammar by ID (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': {
					description: 'Grammar detail',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_916' },
									data: {
										type: 'object',
										properties: {
											grammar: { $ref: '#/components/schemas/Grammar' },
										},
									},
								},
							},
						},
					},
				},
				'404': {
					description: 'Not found',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
		put: {
			tags: ['Grammar - Admin'],
			summary: 'Update grammar (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/GrammarInput' },
					},
				},
			},
			responses: {
				'200': {
					description: 'Updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_914' },
									data: {
										type: 'object',
										properties: {
											grammar: { $ref: '#/components/schemas/Grammar' },
										},
									},
								},
							},
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
		delete: {
			tags: ['Grammar - Admin'],
			summary: 'Delete grammar (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': {
					description: 'Deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_915' },
								},
							},
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
};

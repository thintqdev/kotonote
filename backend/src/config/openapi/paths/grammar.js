const listQueryParams = [
	{
		name: 'page',
		in: 'query',
		schema: { type: 'integer', minimum: 1, default: 1 },
	},
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
		name: 'tag',
		in: 'query',
		schema: {
			type: 'string',
			enum: ['hearsay', 'formal', 'conjecture', 'purpose', 'goal', 'change'],
		},
	},
	{ name: 'q', in: 'query', schema: { type: 'string' } },
];

const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

const paginatedGrammarListResponse = {
	'200': {
		description: 'Grammar list retrieved',
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
								jlptLevels: {
									type: 'array',
									items: { type: 'string' },
									example: ['N4', 'N3'],
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
	...authResponses,
};

/** Grammar API for logged-in app users (Bearer JWT) */
export const grammarPaths = {
	'/api/grammar': {
		get: {
			tags: ['Grammar - User'],
			summary: 'List published grammar points (User)',
			description:
				'Requires authentication. Returns paginated published grammar entries with optional JLPT, tag, and search filters.',
			security: [{ bearerAuth: [] }],
			parameters: listQueryParams,
			responses: paginatedGrammarListResponse,
		},
	},
	'/api/grammar/{slug}': {
		get: {
			tags: ['Grammar - User'],
			summary: 'Get grammar detail by slug (User)',
			description:
				'Requires authentication. Returns a single published grammar entry.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'slug',
					in: 'path',
					required: true,
					schema: { type: 'string', example: 'ni-yoru-to' },
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
				...authResponses,
			},
		},
	},
};

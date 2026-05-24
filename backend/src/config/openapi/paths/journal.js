const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'404': { $ref: '#/components/responses/NotFound' },
};

export const journalPaths = {
	'/api/journal/quota': {
		get: {
			tags: ['Journal'],
			summary: 'Daily AI analysis quota',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': { description: 'Quota retrieved' },
				...authResponses,
			},
		},
	},
	'/api/journal/entries': {
		get: {
			tags: ['Journal'],
			summary: 'List my journal entries',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 30 } },
			],
			responses: {
				'200': { description: 'Entries listed' },
				...authResponses,
			},
		},
	},
	'/api/journal/entries/analyze': {
		post: {
			tags: ['Journal'],
			summary: 'Analyze diary text with AI and save (max 3/day)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['contentJa'],
							properties: {
								contentJa: { type: 'string', maxLength: 4000 },
								title: { type: 'string', maxLength: 200 },
								jlpt: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
							},
						},
					},
				},
			},
			responses: {
				'201': { description: 'Entry analyzed and saved' },
				'429': { description: 'Daily limit reached' },
				...authResponses,
			},
		},
	},
	'/api/journal/entries/{id}': {
		get: {
			tags: ['Journal'],
			summary: 'Get journal entry by ID',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': { description: 'Entry retrieved' },
				...authResponses,
				'404': authResponses['404'],
			},
		},
		delete: {
			tags: ['Journal'],
			summary: 'Delete journal entry',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': { description: 'Entry deleted' },
				...authResponses,
				'404': authResponses['404'],
			},
		},
	},
};

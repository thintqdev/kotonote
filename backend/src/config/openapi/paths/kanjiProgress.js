const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

export const kanjiProgressPaths = {
	'/api/kanji/progress': {
		get: {
			tags: ['Kanji - Progress'],
			summary: 'List my kanji deck progress',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'jlpt',
					in: 'query',
					schema: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
				},
			],
			responses: {
				'200': {
					description: 'Progress list retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_904' },
									data: {
										type: 'object',
										properties: {
											progress: {
												type: 'array',
												items: { $ref: '#/components/schemas/DeckGrowthProgress' },
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
	'/api/kanji/progress/{deckId}': {
		get: {
			tags: ['Kanji - Progress'],
			summary: 'Get kanji deck progress',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'deckId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': {
					description: 'Progress retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_905' },
									data: { $ref: '#/components/schemas/DeckGrowthProgress' },
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
	'/api/kanji/progress/{deckId}/advance': {
		post: {
			tags: ['Kanji - Progress'],
			summary: 'Advance kanji deck progress',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'deckId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': {
					description: 'Progress advanced',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_906' },
									data: { $ref: '#/components/schemas/DeckGrowthProgress' },
								},
							},
						},
					},
				},
				'403': {
					description: 'JLPT or lesson locked',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				...authResponses,
			},
		},
	},
};

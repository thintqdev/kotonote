const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

export const vocabularyProgressPaths = {
	'/api/vocabulary/progress': {
		get: {
			tags: ['Vocabulary - Progress'],
			summary: 'List my deck growth progress',
			description: 'Growth stages (0–3) per vocabulary deck for the current user',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'jlpt',
					in: 'query',
					schema: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
					description: 'Filter by JLPT level',
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
									messageCode: { type: 'string', example: 'MSG_710' },
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
	'/api/vocabulary/progress/{deckId}': {
		get: {
			tags: ['Vocabulary - Progress'],
			summary: 'Get deck growth progress',
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
									messageCode: { type: 'string', example: 'MSG_711' },
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
	'/api/vocabulary/progress/{deckId}/advance': {
		post: {
			tags: ['Vocabulary - Progress'],
			summary: 'Advance deck growth stage',
			description:
				'Increment growth stage after a perfect quiz. Requires JLPT unlock and lesson unlock rules.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'deckId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
				{
					name: 'lessonNo',
					in: 'query',
					schema: { type: 'integer', minimum: 1 },
					description: 'Optional lesson number for unlock check',
				},
			],
			responses: {
				'200': {
					description: 'Stage advanced or unchanged at max',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_712' },
									data: { $ref: '#/components/schemas/DeckGrowthProgress' },
								},
							},
						},
					},
				},
				'403': {
					description: 'JLPT locked or lesson locked (MSG_1113 / MSG_716)',
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

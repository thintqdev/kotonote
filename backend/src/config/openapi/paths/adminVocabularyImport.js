const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

export const adminVocabularyImportPaths = {
	'/api/admin/vocabulary/decks/{deckId}/import': {
		post: {
			tags: ['Admin - Vocabulary Import'],
			summary: 'Import vocabulary from JSON (Admin)',
			description: 'Bulk create words in a deck from a JSON array',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'deckId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['deckId', 'vocabularyList'],
							properties: {
								deckId: { type: 'string' },
								vocabularyList: {
									type: 'array',
									items: {
										type: 'object',
										properties: {
											word: { type: 'string', example: '学校' },
											reading: { type: 'string', example: 'がっこう' },
											meaning: { type: 'string', example: 'trường học' },
											partOfSpeech: { type: 'string' },
											displayOrder: { type: 'integer' },
										},
									},
								},
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Words imported',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_707' },
									data: {
										type: 'object',
										properties: {
											created: { type: 'integer' },
											vocabulary: {
												type: 'array',
												items: { $ref: '#/components/schemas/Vocabulary' },
											},
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Deck full or validation error',
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

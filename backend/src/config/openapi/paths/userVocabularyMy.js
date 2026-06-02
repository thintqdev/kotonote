const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

const deckIdParam = {
	name: 'id',
	in: 'path',
	required: true,
	schema: { type: 'string' },
	description: 'User deck ID',
};

/** API `/api/vocabulary/my/*` — bộ từ vựng riêng (Pro+) */
export const userVocabularyMyPaths = {
	'/api/vocabulary/my/decks': {
		get: {
			tags: ['Vocabulary - My Decks'],
			summary: 'List my vocabulary decks',
			description:
				'Requires authentication. Returns decks owned by the current user plus quota metadata.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 50 } },
			],
			responses: {
				'200': {
					description: 'User decks list (MSG_717)',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_717' },
									data: {
										type: 'object',
										properties: {
											decks: {
												type: 'array',
												items: { $ref: '#/components/schemas/VocabularyDeckListItem' },
											},
											quota: {
												type: 'object',
												properties: {
													used: { type: 'integer' },
													maxDecks: { type: 'integer' },
													tierId: { type: 'string' },
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
			tags: ['Vocabulary - My Decks'],
			summary: 'Create my vocabulary deck',
			description: 'Requires Pro+ membership. Quota per tier; max 25 words per deck.',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['title', 'level'],
							properties: {
								title: { type: 'string' },
								titleJa: { type: 'string' },
								description: { type: 'string' },
								level: {
									type: 'string',
									enum: ['n5', 'n4', 'n3', 'n2', 'n1'],
								},
								category: { type: 'string' },
							},
						},
					},
				},
			},
			responses: {
				'201': { description: 'Deck created' },
				'403': { description: 'Quota reached (MSG_718)' },
				...authResponses,
			},
		},
	},
	'/api/vocabulary/my/decks/{id}': {
		get: {
			tags: ['Vocabulary - My Decks'],
			summary: 'Get my deck by ID',
			security: [{ bearerAuth: [] }],
			parameters: [deckIdParam],
			responses: {
				'200': { description: 'Deck detail' },
				'404': { $ref: '#/components/responses/NotFound' },
				...authResponses,
			},
		},
		put: {
			tags: ['Vocabulary - My Decks'],
			summary: 'Update my deck',
			security: [{ bearerAuth: [] }],
			parameters: [deckIdParam],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string' },
								titleJa: { type: 'string' },
								description: { type: 'string' },
								level: {
									type: 'string',
									enum: ['n5', 'n4', 'n3', 'n2', 'n1'],
								},
							},
						},
					},
				},
			},
			responses: {
				'200': { description: 'Deck updated' },
				'403': { description: 'Pro+ required' },
				...authResponses,
			},
		},
		delete: {
			tags: ['Vocabulary - My Decks'],
			summary: 'Delete my deck',
			security: [{ bearerAuth: [] }],
			parameters: [deckIdParam],
			responses: {
				'200': { description: 'Deck deleted' },
				'403': { description: 'Pro+ required' },
				...authResponses,
			},
		},
	},
	'/api/vocabulary/my/decks/{id}/vocabulary': {
		get: {
			tags: ['Vocabulary - My Decks'],
			summary: 'Get my deck with vocabulary',
			security: [{ bearerAuth: [] }],
			parameters: [deckIdParam],
			responses: {
				'200': { description: 'Deck and words' },
				...authResponses,
			},
		},
	},
	'/api/vocabulary/my/decks/{deckId}/words': {
		post: {
			tags: ['Vocabulary - My Decks'],
			summary: 'Add word to my deck',
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
				'201': { description: 'Word created' },
				...authResponses,
			},
		},
	},
	'/api/vocabulary/my/decks/{deckId}/import': {
		post: {
			tags: ['Vocabulary - My Decks'],
			summary: 'Import words into my deck (JSON array, max 25 total)',
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
				'200': { description: 'Import result' },
				...authResponses,
			},
		},
	},
	'/api/vocabulary/my/words/{vocabId}': {
		put: {
			tags: ['Vocabulary - My Decks'],
			summary: 'Update word in my deck',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'vocabId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': { description: 'Word updated' },
				...authResponses,
			},
		},
		delete: {
			tags: ['Vocabulary - My Decks'],
			summary: 'Delete word from my deck',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'vocabId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': { description: 'Word deleted' },
				...authResponses,
			},
		},
	},
};

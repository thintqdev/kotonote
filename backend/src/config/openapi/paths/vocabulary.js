const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

export const vocabularyPaths = {
	'/api/vocabulary/decks': {
		get: {
			tags: ['Vocabulary - User'],
			summary: 'Get all vocabulary decks (User)',
			description:
				'Requires authentication. Danh sách deck có phân trang; mỗi phần tử có `wordCount` và `totalWords`.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'level', in: 'query', schema: { type: 'string', enum: ['n5', 'n4', 'n3', 'n2', 'n1'] } },
				{
					name: 'category',
					in: 'query',
					schema: {
						type: 'string',
						enum: ['basic', 'grammar', 'kanji', 'conversation', 'business', 'other'],
					},
				},
				{ name: 'isActive', in: 'query', schema: { type: 'boolean' } },
				{
					name: 'page',
					in: 'query',
					schema: { type: 'integer', minimum: 1, default: 1 },
					description: 'Trang (mặc định 1)',
				},
				{
					name: 'limit',
					in: 'query',
					schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
					description: 'Số deck mỗi trang (mặc định 50, tối đa 100)',
				},
			],
			responses: {
				'200': {
					description: 'Decks retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_706' },
									data: {
										type: 'object',
										properties: {
											decks: {
												type: 'array',
												items: { $ref: '#/components/schemas/VocabularyDeckListItem' },
											},
											pagination: { $ref: '#/components/schemas/DeckListPagination' },
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
	'/api/vocabulary/decks/{id}': {
		get: {
			tags: ['Vocabulary - User'],
			summary: 'Get deck by ID (User)',
			description: 'Requires authentication.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Deck ID',
				},
			],
			responses: {
				'200': {
					description: 'Deck retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_704' },
									data: {
										type: 'object',
										properties: {
											deck: { $ref: '#/components/schemas/VocabularyDeck' },
										},
									},
								},
							},
						},
					},
				},
				'404': {
					description: 'Deck not found',
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
	'/api/vocabulary/decks/{id}/vocabulary': {
		get: {
			tags: ['Vocabulary - User'],
			summary: 'Get deck with vocabulary (User)',
			description:
				'Requires authentication. Vocabulary sorted by displayOrder ascending (oldest first), then createdAt, _id.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Deck ID',
				},
			],
			responses: {
				'200': {
					description: 'Deck with vocabulary retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_704' },
									data: {
										type: 'object',
										properties: {
											deck: { $ref: '#/components/schemas/VocabularyDeck' },
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
				'404': {
					description: 'Deck not found',
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
	'/api/vocabulary/deck/{deckId}/words': {
		get: {
			tags: ['Vocabulary - User'],
			summary: 'Get vocabulary by deck (User)',
			description: 'Requires authentication.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'deckId',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Deck ID',
				},
			],
			responses: {
				'200': {
					description: 'Vocabulary retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_706' },
									data: {
										type: 'object',
										properties: {
											vocabulary: {
												type: 'array',
												items: { $ref: '#/components/schemas/Vocabulary' },
											},
											total: { type: 'number', example: 25 },
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

	// Admin routes
	'/api/admin/vocabulary/decks': {
		post: {
			tags: ['Vocabulary - Admin'],
			summary: 'Create vocabulary deck (Admin only)',
			description: 'Create a new vocabulary deck',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['title', 'level'],
							properties: {
								title: { type: 'string', example: 'Từ vựng cơ bản N5' },
								titleJa: { type: 'string', example: 'N5基本語彙' },
								description: { type: 'string', example: 'Từ vựng cơ bản cho người mới bắt đầu' },
								descriptionJa: { type: 'string', example: '初心者向けの基本語彙' },
								level: { type: 'string', enum: ['n5', 'n4', 'n3', 'n2', 'n1'], example: 'n5' },
								category: {
									type: 'string',
									enum: ['basic', 'grammar', 'kanji', 'conversation', 'business', 'other'],
									example: 'basic',
								},
								thumbnail: { type: 'string', example: 'https://example.com/cover.jpg' },
								displayOrder: { type: 'number', example: 1 },
								isActive: { type: 'boolean', example: true },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Deck created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_701' },
									data: {
										type: 'object',
										properties: {
											deck: { $ref: '#/components/schemas/VocabularyDeck' },
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
	},
	'/api/admin/vocabulary/decks/{id}': {
		put: {
			tags: ['Vocabulary - Admin'],
			summary: 'Update vocabulary deck (Admin only)',
			description: 'Update an existing vocabulary deck',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Deck ID',
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								title: { type: 'string' },
								titleJa: { type: 'string' },
								description: { type: 'string' },
								descriptionJa: { type: 'string' },
								level: { type: 'string', enum: ['n5', 'n4', 'n3', 'n2', 'n1'] },
								category: {
									type: 'string',
									enum: ['basic', 'grammar', 'kanji', 'conversation', 'business', 'other'],
								},
								thumbnail: { type: 'string' },
								displayOrder: { type: 'number' },
								isActive: { type: 'boolean' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Deck updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_702' },
									data: {
										type: 'object',
										properties: {
											deck: { $ref: '#/components/schemas/VocabularyDeck' },
										},
									},
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
			},
		},
		delete: {
			tags: ['Vocabulary - Admin'],
			summary: 'Delete vocabulary deck (Admin only)',
			description: 'Delete a vocabulary deck',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Deck ID',
				},
			],
			responses: {
				'200': {
					description: 'Deck deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_703' },
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
			},
		},
	},
	'/api/admin/vocabulary/words': {
		post: {
			tags: ['Vocabulary - Admin'],
			summary: 'Create vocabulary word (Admin only)',
			description: 'Create a new vocabulary word',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['deckId', 'word', 'reading', 'meaning'],
							properties: {
								deckId: { type: 'string', example: '507f1f77bcf86cd799439011' },
								word: { type: 'string', example: '学生' },
								reading: { type: 'string', example: 'がくせい' },
								meaning: { type: 'string', example: 'học sinh, sinh viên' },
								meaningJa: { type: 'string', example: '学校で勉強する人' },
								partOfSpeech: {
									type: 'string',
									enum: ['noun', 'verb', 'adjective', 'adverb', 'particle', 'other'],
								},
								example: { type: 'string', example: '私は学生です。' },
								exampleReading: { type: 'string', example: 'わたしはがくせいです。' },
								exampleMeaning: { type: 'string', example: 'Tôi là sinh viên.' },
								audioUrl: { type: 'string' },
								imageUrl: { type: 'string' },
								displayOrder: { type: 'number', example: 1 },
								isActive: { type: 'boolean', example: true },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Vocabulary created successfully',
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
											vocab: { $ref: '#/components/schemas/Vocabulary' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Deck is full (max 25 words)',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
	},
	'/api/admin/vocabulary/words/{id}': {
		put: {
			tags: ['Vocabulary - Admin'],
			summary: 'Update vocabulary word (Admin only)',
			description: 'Update an existing vocabulary word',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Vocabulary ID',
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								word: { type: 'string' },
								reading: { type: 'string' },
								meaning: { type: 'string' },
								meaningJa: { type: 'string' },
								partOfSpeech: {
									type: 'string',
									enum: ['noun', 'verb', 'adjective', 'adverb', 'particle', 'other'],
								},
								example: { type: 'string' },
								exampleReading: { type: 'string' },
								exampleMeaning: { type: 'string' },
								audioUrl: { type: 'string' },
								imageUrl: { type: 'string' },
								displayOrder: { type: 'number' },
								isActive: { type: 'boolean' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Vocabulary updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_708' },
									data: {
										type: 'object',
										properties: {
											vocab: { $ref: '#/components/schemas/Vocabulary' },
										},
									},
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
			},
		},
		delete: {
			tags: ['Vocabulary - Admin'],
			summary: 'Delete vocabulary word (Admin only)',
			description: 'Delete a vocabulary word',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Vocabulary ID',
				},
			],
			responses: {
				'200': {
					description: 'Vocabulary deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_709' },
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
			},
		},
	},
};

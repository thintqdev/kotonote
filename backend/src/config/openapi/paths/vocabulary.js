export const vocabularyPaths = {
	// Public routes
	'/api/vocabulary/decks': {
		get: {
			tags: ['Vocabulary'],
			summary: 'Get all vocabulary decks (Public)',
			description: 'Get all available vocabulary decks',
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
												items: { $ref: '#/components/schemas/VocabularyDeck' },
											},
											total: { type: 'number', example: 10 },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
	'/api/vocabulary/decks/{id}': {
		get: {
			tags: ['Vocabulary'],
			summary: 'Get deck by ID (Public)',
			description: 'Get a specific vocabulary deck by ID',
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
			},
		},
	},
	'/api/vocabulary/decks/{id}/vocabulary': {
		get: {
			tags: ['Vocabulary'],
			summary: 'Get deck with vocabulary (Public)',
			description: 'Get a deck with all its vocabulary words',
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
			},
		},
	},
	'/api/vocabulary/deck/{deckId}/words': {
		get: {
			tags: ['Vocabulary'],
			summary: 'Get vocabulary by deck (Public)',
			description: 'Get all vocabulary words in a specific deck',
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
							required: ['titleVi', 'titleJa', 'level'],
							properties: {
								titleVi: { type: 'string', example: 'Từ vựng cơ bản N5' },
								titleJa: { type: 'string', example: 'N5基本語彙' },
								descriptionVi: { type: 'string', example: 'Từ vựng cơ bản cho người mới bắt đầu' },
								descriptionJa: { type: 'string', example: '初心者向けの基本語彙' },
								level: { type: 'string', enum: ['n5', 'n4', 'n3', 'n2', 'n1'], example: 'n5' },
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
								titleVi: { type: 'string' },
								titleJa: { type: 'string' },
								descriptionVi: { type: 'string' },
								descriptionJa: { type: 'string' },
								level: { type: 'string', enum: ['n5', 'n4', 'n3', 'n2', 'n1'] },
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
							required: ['deckId', 'word', 'reading', 'meaningVi'],
							properties: {
								deckId: { type: 'string', example: '507f1f77bcf86cd799439011' },
								word: { type: 'string', example: '学生' },
								reading: { type: 'string', example: 'がくせい' },
								meaningVi: { type: 'string', example: 'học sinh, sinh viên' },
								meaningJa: { type: 'string', example: '学校で勉強する人' },
								exampleSentence: { type: 'string', example: '私は学生です。' },
								exampleMeaning: { type: 'string', example: 'Tôi là sinh viên.' },
								displayOrder: { type: 'number', example: 1 },
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
									messageCode: { type: 'string', example: 'MSG_701' },
									data: {
										type: 'object',
										properties: {
											vocabulary: { $ref: '#/components/schemas/Vocabulary' },
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
								meaningVi: { type: 'string' },
								meaningJa: { type: 'string' },
								exampleSentence: { type: 'string' },
								exampleMeaning: { type: 'string' },
								displayOrder: { type: 'number' },
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
									messageCode: { type: 'string', example: 'MSG_702' },
									data: {
										type: 'object',
										properties: {
											vocabulary: { $ref: '#/components/schemas/Vocabulary' },
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
};

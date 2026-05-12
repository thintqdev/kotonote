export const kanjiPaths = {
	// ============ PUBLIC KANJI ROUTES ============
	'/api/kanji/decks': {
		get: {
			tags: ['Kanji'],
			summary: 'Get all kanji decks',
			description: 'Get all kanji decks with optional filters',
			parameters: [
				{
					name: 'jlpt',
					in: 'query',
					schema: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
					description: 'Filter by JLPT level',
				},
				{
					name: 'isActive',
					in: 'query',
					schema: { type: 'boolean' },
					description: 'Filter by active status',
				},
				{
					name: 'page',
					in: 'query',
					schema: { type: 'integer', minimum: 1, default: 1 },
					description: 'Page number',
				},
				{
					name: 'limit',
					in: 'query',
					schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
					description: 'Page size',
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
									messageCode: { type: 'string', example: 'MSG_906' },
									data: {
										type: 'object',
										properties: {
											decks: {
												type: 'array',
												items: { $ref: '#/components/schemas/KanjiDeck' },
											},
											pagination: {
												type: 'object',
												properties: {
													page: { type: 'integer' },
													limit: { type: 'integer' },
													total: { type: 'integer' },
													pages: { type: 'integer' },
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
		},
	},
	'/api/kanji/decks/{id}': {
		get: {
			tags: ['Kanji'],
			summary: 'Get kanji deck by ID',
			description: 'Get detailed information about a specific kanji deck',
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
									messageCode: { type: 'string', example: 'MSG_904' },
									data: {
										type: 'object',
										properties: {
											deck: { $ref: '#/components/schemas/KanjiDeck' },
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
	},
	'/api/kanji/decks/{id}/kanji': {
		get: {
			tags: ['Kanji'],
			summary: 'Get deck with all kanji',
			description: 'Get deck information along with all kanji characters in the deck',
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
					description: 'Deck with kanji retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_906' },
									data: {
										type: 'object',
										properties: {
											deck: { $ref: '#/components/schemas/KanjiDeck' },
											kanji: {
												type: 'array',
												items: { $ref: '#/components/schemas/Kanji' },
											},
											total: { type: 'number', example: 25 },
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
	},
	'/api/kanji/deck/{deckId}/kanji': {
		get: {
			tags: ['Kanji'],
			summary: 'Get kanji by deck',
			description: 'Get all kanji characters in a specific deck',
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
					description: 'Kanji retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_906' },
									data: {
										type: 'object',
										properties: {
											kanji: {
												type: 'array',
												items: { $ref: '#/components/schemas/Kanji' },
											},
											total: { type: 'number', example: 25 },
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
	},
	'/api/kanji/{id}': {
		get: {
			tags: ['Kanji'],
			summary: 'Get kanji by ID',
			description: 'Get detailed information about a specific kanji character',
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Kanji ID',
				},
			],
			responses: {
				'200': {
					description: 'Kanji retrieved successfully',
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
											kanji: { $ref: '#/components/schemas/Kanji' },
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
	},

	// ============ ADMIN KANJI ROUTES ============
	'/api/admin/kanji/decks': {
		post: {
			tags: ['Admin - Kanji Management'],
			summary: 'Create kanji deck (Admin)',
			description: 'Create a new kanji deck',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['titleVi', 'titleJa', 'level'],
							properties: {
								titleVi: { type: 'string', example: 'Kanji cơ bản N5' },
								titleJa: { type: 'string', example: 'N5基本漢字' },
								descriptionVi: { type: 'string', example: 'Kanji cơ bản cho người mới bắt đầu' },
								descriptionJa: { type: 'string', example: '初心者向けの基本漢字' },
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
									messageCode: { type: 'string', example: 'MSG_901' },
									data: {
										type: 'object',
										properties: {
											deck: { $ref: '#/components/schemas/KanjiDeck' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error',
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
	'/api/admin/kanji/decks/{id}': {
		put: {
			tags: ['Admin - Kanji Management'],
			summary: 'Update kanji deck (Admin)',
			description: 'Update an existing kanji deck',
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
								titleVi: { type: 'string', example: 'Kanji cơ bản N5' },
								titleJa: { type: 'string', example: 'N5基本漢字' },
								descriptionVi: { type: 'string', example: 'Kanji cơ bản cho người mới bắt đầu' },
								descriptionJa: { type: 'string', example: '初心者向けの基本漢字' },
								level: { type: 'string', enum: ['n5', 'n4', 'n3', 'n2', 'n1'], example: 'n5' },
								displayOrder: { type: 'number', example: 1 },
								isActive: { type: 'boolean', example: true },
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
									messageCode: { type: 'string', example: 'MSG_902' },
									data: {
										type: 'object',
										properties: {
											deck: { $ref: '#/components/schemas/KanjiDeck' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
		delete: {
			tags: ['Admin - Kanji Management'],
			summary: 'Delete kanji deck (Admin)',
			description: 'Delete a kanji deck and all its kanji',
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
									messageCode: { type: 'string', example: 'MSG_903' },
									data: { type: 'null' },
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
	'/api/admin/kanji/kanji': {
		post: {
			tags: ['Admin - Kanji Management'],
			summary: 'Create kanji (Admin)',
			description: 'Create a new kanji character',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['deckId', 'char', 'meaningVi'],
							properties: {
								deckId: { type: 'string', example: '507f1f77bcf86cd799439011' },
								char: { type: 'string', example: '学' },
								onYomi: { type: 'string', example: 'ガク' },
								kunYomi: { type: 'string', example: 'まな.ぶ' },
								hanViet: { type: 'string', example: 'Học' },
								meaningVi: { type: 'string', example: 'học, học tập' },
								vocabJa: { type: 'string', example: '学生（がくせい）、学校（がっこう）' },
								exampleJa: { type: 'string', example: '学校で勉強します。' },
								exampleVi: { type: 'string', example: 'Học ở trường.' },
								displayOrder: { type: 'number', example: 1 },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Kanji created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_901' },
									data: {
										type: 'object',
										properties: {
											kanji: { $ref: '#/components/schemas/Kanji' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error',
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
	'/api/admin/kanji/kanji/{id}': {
		put: {
			tags: ['Admin - Kanji Management'],
			summary: 'Update kanji (Admin)',
			description: 'Update an existing kanji character',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Kanji ID',
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								char: { type: 'string', example: '学' },
								onYomi: { type: 'string', example: 'ガク' },
								kunYomi: { type: 'string', example: 'まな.ぶ' },
								hanViet: { type: 'string', example: 'Học' },
								meaningVi: { type: 'string', example: 'học, học tập' },
								vocabJa: { type: 'string', example: '学生（がくせい）、学校（がっこう）' },
								exampleJa: { type: 'string', example: '学校で勉強します。' },
								exampleVi: { type: 'string', example: 'Học ở trường.' },
								displayOrder: { type: 'number', example: 1 },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Kanji updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_902' },
									data: {
										type: 'object',
										properties: {
											kanji: { $ref: '#/components/schemas/Kanji' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
		delete: {
			tags: ['Admin - Kanji Management'],
			summary: 'Delete kanji (Admin)',
			description: 'Delete a kanji character',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Kanji ID',
				},
			],
			responses: {
				'200': {
					description: 'Kanji deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_903' },
									data: { type: 'null' },
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
	'/api/admin/kanji/decks/{deckId}/bulk': {
		post: {
			tags: ['Admin - Kanji Management'],
			summary: 'Bulk create kanji (Admin)',
			description: 'Create multiple kanji characters at once',
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
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['kanjiList'],
							properties: {
								kanjiList: {
									type: 'array',
									items: {
										type: 'object',
										required: ['char', 'meaningVi'],
										properties: {
											char: { type: 'string', example: '学' },
											onYomi: { type: 'string', example: 'ガク' },
											kunYomi: { type: 'string', example: 'まな.ぶ' },
											hanViet: { type: 'string', example: 'Học' },
											meaningVi: { type: 'string', example: 'học, học tập' },
											vocabJa: { type: 'string', example: '学生（がくせい）' },
											exampleJa: { type: 'string', example: '学校で勉強します。' },
											exampleVi: { type: 'string', example: 'Học ở trường.' },
											displayOrder: { type: 'number', example: 1 },
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
					description: 'Kanji created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_901' },
									data: {
										type: 'object',
										properties: {
											created: { type: 'number', example: 10 },
											kanji: {
												type: 'array',
												items: { $ref: '#/components/schemas/Kanji' },
											},
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
	'/api/admin/kanji/decks/{deckId}/import': {
		post: {
			tags: ['Admin - Kanji Management'],
			summary: 'Import kanji from JSON (Admin)',
			description: 'Import kanji characters from JSON data',
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
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['kanjiList'],
							properties: {
								kanjiList: {
									type: 'array',
									items: {
										type: 'object',
										required: ['char', 'meaningVi'],
										properties: {
											char: { type: 'string', example: '学' },
											onYomi: { type: 'string', example: 'ガク' },
											kunYomi: { type: 'string', example: 'まな.ぶ' },
											hanViet: { type: 'string', example: 'Học' },
											meaningVi: { type: 'string', example: 'học, học tập' },
											vocabJa: { type: 'string', example: '学生（がくせい）' },
											exampleJa: { type: 'string', example: '学校で勉強します。' },
											exampleVi: { type: 'string', example: 'Học ở trường.' },
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
					description: 'Kanji imported successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_901' },
									data: {
										type: 'object',
										properties: {
											created: { type: 'number', example: 10 },
											kanji: {
												type: 'array',
												items: { $ref: '#/components/schemas/Kanji' },
											},
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
	// NOTE: AI generation endpoint has been moved to /api/admin/ai/generate/kanji
	// See ai.js for AI-related endpoint documentation
};

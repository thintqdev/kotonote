export const kanaPaths = {
	// Public routes
	'/api/kana/script/{script}': {
		get: {
			tags: ['Kana'],
			summary: 'Get kana by script (Public)',
			description: 'Get all kana characters for a specific script (hiragana or katakana)',
			parameters: [
				{
					name: 'script',
					in: 'path',
					required: true,
					schema: { type: 'string', enum: ['hiragana', 'katakana'] },
					description: 'Script type',
				},
			],
			responses: {
				'200': {
					description: 'Kana retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_806' },
									data: {
										type: 'object',
										properties: {
											kana: {
												type: 'array',
												items: { $ref: '#/components/schemas/Kana' },
											},
											total: { type: 'number', example: 46 },
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
	'/api/kana/script/{script}/grouped': {
		get: {
			tags: ['Kana'],
			summary: 'Get kana grouped by row (Public)',
			description: 'Get kana characters grouped by row (a-row, ka-row, etc.)',
			parameters: [
				{
					name: 'script',
					in: 'path',
					required: true,
					schema: { type: 'string', enum: ['hiragana', 'katakana'] },
					description: 'Script type',
				},
			],
			responses: {
				'200': {
					description: 'Grouped kana retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_806' },
									data: {
										type: 'object',
										properties: {
											grouped: {
												type: 'object',
												additionalProperties: {
													type: 'array',
													items: { $ref: '#/components/schemas/Kana' },
												},
												example: {
													'a-row': [],
													'ka-row': [],
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

	// Admin routes
	'/api/admin/kana': {
		get: {
			tags: ['Kana - Admin'],
			summary: 'Get all kana (Admin only)',
			description: 'Get all kana characters with optional filters',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'script',
					in: 'query',
					schema: { type: 'string', enum: ['hiragana', 'katakana'] },
					description: 'Filter by script',
				},
				{
					name: 'row',
					in: 'query',
					schema: { type: 'string' },
					description: 'Filter by row',
				},
			],
			responses: {
				'200': {
					description: 'Kana retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_806' },
									data: {
										type: 'object',
										properties: {
											kana: {
												type: 'array',
												items: { $ref: '#/components/schemas/Kana' },
											},
											total: { type: 'number', example: 92 },
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
			tags: ['Kana - Admin'],
			summary: 'Create kana (Admin only)',
			description: 'Create a new kana character',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['character', 'romaji', 'script', 'row'],
							properties: {
								character: { type: 'string', example: 'あ' },
								romaji: { type: 'string', example: 'a' },
								script: { type: 'string', enum: ['hiragana', 'katakana'], example: 'hiragana' },
								row: { type: 'string', example: 'a-row' },
								isDiacritical: { type: 'boolean', example: false },
								displayOrder: { type: 'number', example: 1 },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Kana created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_801' },
									data: {
										type: 'object',
										properties: {
											kana: { $ref: '#/components/schemas/Kana' },
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
	'/api/admin/kana/bulk': {
		post: {
			tags: ['Kana - Admin'],
			summary: 'Bulk create kana (Admin only)',
			description: 'Create multiple kana characters at once',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['kanaList'],
							properties: {
								kanaList: {
									type: 'array',
									items: {
										type: 'object',
										required: ['character', 'romaji', 'script', 'row'],
										properties: {
											character: { type: 'string' },
											romaji: { type: 'string' },
											script: { type: 'string', enum: ['hiragana', 'katakana'] },
											row: { type: 'string' },
											isDiacritical: { type: 'boolean' },
											displayOrder: { type: 'number' },
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
					description: 'Kana created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_801' },
									data: {
										type: 'object',
										properties: {
											created: { type: 'number', example: 46 },
											kana: {
												type: 'array',
												items: { $ref: '#/components/schemas/Kana' },
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
	'/api/admin/kana/{id}': {
		get: {
			tags: ['Kana - Admin'],
			summary: 'Get kana by ID (Admin only)',
			description: 'Get a specific kana character by ID',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Kana ID',
				},
			],
			responses: {
				'200': {
					description: 'Kana retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_804' },
									data: {
										type: 'object',
										properties: {
											kana: { $ref: '#/components/schemas/Kana' },
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
		put: {
			tags: ['Kana - Admin'],
			summary: 'Update kana (Admin only)',
			description: 'Update an existing kana character',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Kana ID',
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								character: { type: 'string' },
								romaji: { type: 'string' },
								script: { type: 'string', enum: ['hiragana', 'katakana'] },
								row: { type: 'string' },
								isDiacritical: { type: 'boolean' },
								displayOrder: { type: 'number' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Kana updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_802' },
									data: {
										type: 'object',
										properties: {
											kana: { $ref: '#/components/schemas/Kana' },
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
			tags: ['Kana - Admin'],
			summary: 'Delete kana (Admin only)',
			description: 'Delete a kana character',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Kana ID',
				},
			],
			responses: {
				'200': {
					description: 'Kana deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_803' },
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

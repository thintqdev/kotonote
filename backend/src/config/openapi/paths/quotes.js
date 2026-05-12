export const quotePaths = {
	'/api/quotes/active': {
		get: {
			tags: ['Quote'],
			summary: 'Get active quotes (Public)',
			description: 'Get all active motivational quotes',
			responses: {
				'200': {
					description: 'Quotes retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_406' },
									data: {
										type: 'object',
										properties: {
											quotes: {
												type: 'array',
												items: { $ref: '#/components/schemas/Quote' },
											},
											total: { type: 'number', example: 12 },
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
	'/api/quotes/random': {
		get: {
			tags: ['Quote'],
			summary: 'Get random quote (Public)',
			description: 'Get a random motivational quote',
			responses: {
				'200': {
					description: 'Quote retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_404' },
									data: {
										type: 'object',
										properties: {
											quote: { $ref: '#/components/schemas/Quote' },
										},
									},
								},
							},
						},
					},
				},
				'404': {
					description: 'No quotes found',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
	},
	'/api/quotes': {
		get: {
			tags: ['Quote'],
			summary: 'Get all quotes (Admin only)',
			description: 'Get all quotes with optional filters',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'category',
					in: 'query',
					schema: {
						type: 'string',
						enum: ['motivation', 'learning', 'wisdom', 'perseverance', 'success'],
					},
					description: 'Filter by category',
				},
				{
					name: 'isActive',
					in: 'query',
					schema: { type: 'boolean' },
					description: 'Filter by active status',
				},
			],
			responses: {
				'200': {
					description: 'Quotes retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_406' },
									data: {
										type: 'object',
										properties: {
											quotes: {
												type: 'array',
												items: { $ref: '#/components/schemas/Quote' },
											},
											total: { type: 'number', example: 12 },
										},
									},
								},
							},
						},
					},
				},
				'401': {
					description: 'Unauthorized',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'403': {
					description: 'Forbidden - Admin only',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
		post: {
			tags: ['Quote'],
			summary: 'Create quote (Admin only)',
			description: 'Create a new motivational quote',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['quoteVi', 'quoteJa'],
							properties: {
								quoteVi: { type: 'string', example: 'Học tập là món quà dành cho chính bạn trong tương lai.' },
								quoteJa: { type: 'string', example: '学ぶことは、未来の自分への贈り物です。' },
								author: { type: 'string', example: 'Lão Tử' },
								category: {
									type: 'string',
									enum: ['motivation', 'learning', 'wisdom', 'perseverance', 'success'],
									example: 'learning',
								},
								isActive: { type: 'boolean', example: true },
								displayOrder: { type: 'number', example: 1 },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Quote created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_401' },
									data: {
										type: 'object',
										properties: {
											quote: { $ref: '#/components/schemas/Quote' },
										},
									},
								},
							},
						},
					},
				},
				'401': {
					description: 'Unauthorized',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'403': {
					description: 'Forbidden - Admin only',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
	},
	'/api/quotes/{id}': {
		get: {
			tags: ['Quote'],
			summary: 'Get quote by ID (Admin only)',
			description: 'Get a specific quote by ID',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Quote ID',
				},
			],
			responses: {
				'200': {
					description: 'Quote retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_404' },
									data: {
										type: 'object',
										properties: {
											quote: { $ref: '#/components/schemas/Quote' },
										},
									},
								},
							},
						},
					},
				},
				'404': {
					description: 'Quote not found',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
		put: {
			tags: ['Quote'],
			summary: 'Update quote (Admin only)',
			description: 'Update an existing quote',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Quote ID',
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								quoteVi: { type: 'string' },
								quoteJa: { type: 'string' },
								author: { type: 'string' },
								category: {
									type: 'string',
									enum: ['motivation', 'learning', 'wisdom', 'perseverance', 'success'],
								},
								isActive: { type: 'boolean' },
								displayOrder: { type: 'number' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Quote updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_402' },
									data: {
										type: 'object',
										properties: {
											quote: { $ref: '#/components/schemas/Quote' },
										},
									},
								},
							},
						},
					},
				},
				'404': {
					description: 'Quote not found',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
		delete: {
			tags: ['Quote'],
			summary: 'Delete quote (Admin only)',
			description: 'Delete a quote',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'Quote ID',
				},
			],
			responses: {
				'200': {
					description: 'Quote deleted successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_403' },
								},
							},
						},
					},
				},
				'404': {
					description: 'Quote not found',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
	},
};

const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
	'404': { $ref: '#/components/responses/NotFound' },
};

const badgeBodySchema = {
	type: 'object',
	required: ['key', 'nameVi', 'nameJa'],
	properties: {
		key: { type: 'string', pattern: '^[a-z0-9_]{2,64}$', example: 'streak_7' },
		nameVi: { type: 'string', example: '7 ngày liên tiếp' },
		nameJa: { type: 'string', example: '7日連続' },
		descriptionVi: { type: 'string' },
		descriptionJa: { type: 'string' },
		emoji: { type: 'string', nullable: true },
		category: {
			type: 'string',
			enum: ['streak', 'vocabulary', 'kanji', 'grammar', 'reading', 'listening', 'quiz', 'general', 'other'],
		},
		rarity: { type: 'string', enum: ['common', 'rare', 'epic', 'legendary'] },
		isActive: { type: 'boolean' },
		displayOrder: { type: 'integer', minimum: 0 },
	},
};

export const adminBadgePaths = {
	'/api/admin/badges': {
		get: {
			tags: ['Admin - Badge Management'],
			summary: 'List all badges (Admin)',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Badges retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											badges: {
												type: 'array',
												items: { $ref: '#/components/schemas/Badge' },
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
			tags: ['Admin - Badge Management'],
			summary: 'Create badge (Admin)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: badgeBodySchema,
					},
				},
			},
			responses: {
				'201': {
					description: 'Badge created',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											badge: { $ref: '#/components/schemas/Badge' },
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
	'/api/admin/badges/{id}': {
		get: {
			tags: ['Admin - Badge Management'],
			summary: 'Get badge by ID (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Badge retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											badge: { $ref: '#/components/schemas/Badge' },
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
		put: {
			tags: ['Admin - Badge Management'],
			summary: 'Update badge (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: badgeBodySchema,
					},
				},
			},
			responses: {
				'200': {
					description: 'Badge updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											badge: { $ref: '#/components/schemas/Badge' },
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
		delete: {
			tags: ['Admin - Badge Management'],
			summary: 'Delete badge (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Badge deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
	},
	'/api/admin/badges/{id}/icon': {
		post: {
			tags: ['Admin - Badge Management'],
			summary: 'Upload badge icon (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							required: ['icon'],
							properties: {
								icon: { type: 'string', format: 'binary' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Icon uploaded',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											badge: { $ref: '#/components/schemas/Badge' },
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
		delete: {
			tags: ['Admin - Badge Management'],
			summary: 'Delete badge icon (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Icon removed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											badge: { $ref: '#/components/schemas/Badge' },
										},
									},
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
	},
};

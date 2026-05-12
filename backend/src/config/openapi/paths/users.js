export const userPaths = {
	'/api/users/me': {
		get: {
			tags: ['User'],
			summary: 'Get current user',
			description: 'Get authenticated user information',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'User information retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_206' },
									data: {
										type: 'object',
										properties: {
											user: { $ref: '#/components/schemas/User' },
										},
									},
								},
							},
						},
					},
				},
				'401': {
					description: 'Unauthorized - Invalid or missing token',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
		put: {
			tags: ['User'],
			summary: 'Update current user profile',
			description: 'Update authenticated user information',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								name: { type: 'string', example: 'Nguyen Van B' },
								avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Profile updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_202' },
									data: {
										type: 'object',
										properties: {
											user: { $ref: '#/components/schemas/User' },
										},
									},
								},
							},
						},
					},
				},
				'401': {
					description: 'Unauthorized - Invalid or missing token',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
	},
	'/api/admin/users': {
		get: {
			tags: ['Admin - User Management'],
			summary: 'Get all users (Admin)',
			description: 'Get all users with filters and pagination',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'status',
					in: 'query',
					schema: { type: 'string', enum: ['active', 'locked', 'suspended'] },
					description: 'Filter by user status',
				},
				{
					name: 'role',
					in: 'query',
					schema: { type: 'string', enum: ['user', 'admin'] },
					description: 'Filter by user role',
				},
				{
					name: 'authProvider',
					in: 'query',
					schema: { type: 'string', enum: ['local', 'google'] },
					description: 'Filter by authentication provider',
				},
				{
					name: 'search',
					in: 'query',
					schema: { type: 'string' },
					description: 'Search by email or name',
				},
				{
					name: 'page',
					in: 'query',
					schema: { type: 'number', default: 1 },
					description: 'Page number',
				},
				{
					name: 'limit',
					in: 'query',
					schema: { type: 'number', default: 20 },
					description: 'Items per page',
				},
			],
			responses: {
				'200': {
					description: 'Users retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_207' },
									data: {
										type: 'object',
										properties: {
											users: {
												type: 'array',
												items: { $ref: '#/components/schemas/User' },
											},
											total: { type: 'number', example: 1250 },
											page: { type: 'number', example: 1 },
											totalPages: { type: 'number', example: 63 },
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
	'/api/admin/users/statistics': {
		get: {
			tags: ['Admin - User Management'],
			summary: 'Get user statistics (Admin)',
			description: 'Get aggregated user statistics',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Statistics retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_206' },
									data: {
										type: 'object',
										properties: {
											statistics: { $ref: '#/components/schemas/UserStatistics' },
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
	'/api/admin/users/{id}': {
		get: {
			tags: ['Admin - User Management'],
			summary: 'Get user by ID (Admin)',
			description: 'Get detailed user information by ID',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'User ID',
				},
			],
			responses: {
				'200': {
					description: 'User retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_206' },
									data: {
										type: 'object',
										properties: {
											user: { $ref: '#/components/schemas/User' },
										},
									},
								},
							},
						},
					},
				},
				'404': {
					description: 'User not found',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
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
	'/api/admin/users/{id}/status': {
		patch: {
			tags: ['Admin - User Management'],
			summary: 'Update user status (Admin)',
			description: 'Update user status (active, locked, suspended)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
					description: 'User ID',
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['status'],
							properties: {
								status: {
									type: 'string',
									enum: ['active', 'locked', 'suspended'],
									example: 'active',
									description: 'New user status',
								},
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'User status updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_202' },
									data: {
										type: 'object',
										properties: {
											user: { $ref: '#/components/schemas/User' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Invalid status value',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'404': {
					description: 'User not found',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
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
};

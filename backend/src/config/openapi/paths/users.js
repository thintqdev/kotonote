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
							required: ['name'],
							properties: {
								name: { type: 'string', example: 'Nguyen Van B' },
								avatar: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
								profile: { $ref: '#/components/schemas/UserProfile' },
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
	'/api/users/me/focus-areas': {
		get: {
			tags: ['User'],
			summary: 'Get study focus areas',
			description: 'Selected subject keys and available options for profile focus tags',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Focus areas retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_209' },
									data: {
										type: 'object',
										properties: {
											focus: { $ref: '#/components/schemas/ProfileFocusAreas' },
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
			},
		},
		put: {
			tags: ['User'],
			summary: 'Update study focus areas',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['focusAreaKeys'],
							properties: {
								focusAreaKeys: {
									type: 'array',
									items: {
										type: 'string',
										enum: ['grammar', 'vocab', 'kanji', 'reading', 'listening'],
									},
									maxItems: 4,
								},
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Focus areas updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_210' },
									data: {
										type: 'object',
										properties: {
											focus: { $ref: '#/components/schemas/ProfileFocusAreas' },
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
			},
		},
	},
	'/api/users/me/settings': {
		get: {
			tags: ['User'],
			summary: 'Get user app settings',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Settings retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_211' },
									data: {
										type: 'object',
										properties: {
											settings: { $ref: '#/components/schemas/UserSettings' },
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
			},
		},
		put: {
			tags: ['User'],
			summary: 'Update user app settings',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UserSettings' },
					},
				},
			},
			responses: {
				'200': {
					description: 'Settings updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_212' },
									data: {
										type: 'object',
										properties: {
											settings: { $ref: '#/components/schemas/UserSettings' },
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
			},
		},
	},
	'/api/users/me/dashboard-home': {
		get: {
			tags: ['User'],
			summary: 'Dashboard home data',
			description: 'Subjects, streak, and today progress for home screen',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Dashboard home retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_209' },
									data: {
										type: 'object',
										properties: {
											home: { $ref: '#/components/schemas/DashboardHome' },
										},
									},
								},
							},
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
			},
		},
	},
	'/api/users/me/avatar': {
		post: {
			tags: ['User'],
			summary: 'Upload avatar',
			description: 'Multipart form upload; field name `avatar`',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							required: ['avatar'],
							properties: {
								avatar: { type: 'string', format: 'binary' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Avatar updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_203' },
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
				'401': { $ref: '#/components/responses/Unauthorized' },
			},
		},
	},
	'/api/users/me/badges/test-unlock': {
		post: {
			tags: ['User'],
			summary: 'Test unlock badge (non-production)',
			description: 'Development helper to unlock a badge by key',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['badgeKey'],
							properties: {
								badgeKey: { type: 'string', example: 'streak_7' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Badge unlocked for testing',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_210' },
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
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': {
					description: 'Not allowed in production',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
	},
	'/api/users/me/learning-summary': {
		get: {
			tags: ['User'],
			summary: 'Get learning summary for profile',
			description:
				'Aggregated study stats: streak, weekly check-ins, exam countdown, badges, active library counts',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Learning summary retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_208' },
									data: {
										type: 'object',
										properties: {
											summary: { $ref: '#/components/schemas/LearningSummary' },
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
	'/api/admin/users/bulk/status': {
		patch: {
			tags: ['Admin - User Management'],
			summary: 'Bulk update user status (Admin)',
			description:
				'Set the same status for many users. Invalid ObjectIds are ignored. The authenticated admin’s own user ID is never updated. Max 100 IDs per request.',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['userIds', 'status'],
							properties: {
								userIds: {
									type: 'array',
									items: { type: 'string' },
									minItems: 1,
									maxItems: 100,
									description: 'MongoDB ObjectId strings (duplicates removed)',
								},
								status: {
									type: 'string',
									enum: ['active', 'locked', 'suspended'],
									example: 'active',
								},
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Bulk status update completed (see counts in payload)',
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
											status: { type: 'string', example: 'active' },
											requested: { type: 'number', example: 5 },
											eligibleIdCount: { type: 'number', example: 4 },
											matchedCount: { type: 'number', example: 4 },
											modifiedCount: { type: 'number', example: 4 },
											notFoundIdCount: { type: 'number', example: 0 },
											invalidFormatIds: {
												type: 'array',
												items: { type: 'string' },
											},
											skippedSelfCount: { type: 'number', example: 1 },
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

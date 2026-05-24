const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'404': { $ref: '#/components/responses/NotFound' },
};

export const notificationPaths = {
	'/api/notifications': {
		get: {
			tags: ['Notifications - User'],
			summary: 'List my notifications',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
				{ name: 'skip', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
				{ name: 'isRead', in: 'query', schema: { type: 'boolean' } },
				{
					name: 'type',
					in: 'query',
					schema: {
						type: 'string',
						enum: ['info', 'success', 'warning', 'error', 'task_update', 'system', 'admin_action'],
					},
				},
				{
					name: 'category',
					in: 'query',
					schema: {
						type: 'string',
						enum: ['vocabulary', 'kanji', 'quiz', 'streak', 'achievement', 'system', 'admin', 'other'],
					},
				},
				{
					name: 'priority',
					in: 'query',
					schema: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
				},
			],
			responses: {
				'200': {
					description: 'Notifications retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											notifications: {
												type: 'array',
												items: { $ref: '#/components/schemas/Notification' },
											},
											total: { type: 'integer' },
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
	'/api/notifications/unread-count': {
		get: {
			tags: ['Notifications - User'],
			summary: 'Unread notification count',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Count retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											count: { type: 'integer', example: 3 },
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
	'/api/notifications/stats': {
		get: {
			tags: ['Notifications - User'],
			summary: 'My notification statistics',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Stats retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											stats: { type: 'object' },
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
	'/api/notifications/mark-all-read': {
		put: {
			tags: ['Notifications - User'],
			summary: 'Mark all notifications as read',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'All marked read',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
	'/api/notifications/clear-old': {
		delete: {
			tags: ['Notifications - User'],
			summary: 'Clear old notifications',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'daysOld',
					in: 'query',
					schema: { type: 'integer', minimum: 1, default: 30 },
					description: 'Delete notifications older than this many days',
				},
			],
			responses: {
				'200': {
					description: 'Old notifications cleared',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											deletedCount: { type: 'integer', example: 12 },
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
	'/api/notifications/{id}': {
		get: {
			tags: ['Notifications - User'],
			summary: 'Get notification by ID',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Notification retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											notification: { $ref: '#/components/schemas/Notification' },
										},
									},
								},
							},
						},
					},
				},
				'404': authResponses['404'],
				...authResponses,
			},
		},
		delete: {
			tags: ['Notifications - User'],
			summary: 'Delete notification',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Notification deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
								},
							},
						},
					},
				},
				'404': authResponses['404'],
				...authResponses,
			},
		},
	},
	'/api/notifications/{id}/read': {
		put: {
			tags: ['Notifications - User'],
			summary: 'Mark notification as read',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Marked as read',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											notification: { $ref: '#/components/schemas/Notification' },
										},
									},
								},
							},
						},
					},
				},
				'404': authResponses['404'],
				...authResponses,
			},
		},
	},
};

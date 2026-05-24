const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
	'404': { $ref: '#/components/responses/NotFound' },
};

const notificationBodyProps = {
	title: { type: 'string', maxLength: 200 },
	message: { type: 'string', maxLength: 1000 },
	description: { type: 'string', maxLength: 2000 },
	type: {
		type: 'string',
		enum: ['info', 'success', 'warning', 'error', 'task_update', 'system', 'admin_action'],
		default: 'info',
	},
	category: {
		type: 'string',
		enum: ['vocabulary', 'kanji', 'quiz', 'streak', 'achievement', 'system', 'admin', 'other'],
	},
	priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
	actionType: {
		type: 'string',
		enum: ['none', 'view_item', 'open_page', 'download', 'confirm', 'dismiss'],
		default: 'none',
	},
	actionData: { type: 'object', nullable: true },
	metadata: { type: 'object' },
};

export const adminNotificationPaths = {
	'/api/admin/notifications/campaigns': {
		get: {
			tags: ['Admin - Notifications'],
			summary: 'List notification campaigns',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'limit', in: 'query', schema: { type: 'integer', maximum: 100, default: 30 } },
				{ name: 'skip', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
			],
			responses: {
				'200': {
					description: 'Campaigns listed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: { type: 'object' },
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
		post: {
			tags: ['Admin - Notifications'],
			summary: 'Create notification campaign',
			description: 'Send immediately or schedule for later',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['title', 'message', 'audience'],
							properties: {
								...notificationBodyProps,
								audience: { type: 'string', enum: ['all', 'selected'] },
								userIds: { type: 'array', items: { type: 'string' } },
								scheduledAt: { type: 'string', format: 'date-time', nullable: true },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Campaign created',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											campaign: { type: 'object' },
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
	'/api/admin/notifications/campaigns/{campaignId}/cancel': {
		patch: {
			tags: ['Admin - Notifications'],
			summary: 'Cancel scheduled campaign',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'campaignId', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Campaign cancelled',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											campaign: { type: 'object' },
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
	'/api/admin/notifications/stats': {
		get: {
			tags: ['Admin - Notifications'],
			summary: 'Global notification statistics (Admin)',
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
									data: {
										type: 'object',
										properties: {
											stats: {
												type: 'object',
												properties: {
													totalCount: { type: 'integer' },
													unreadCount: { type: 'integer' },
													readCount: { type: 'integer' },
													byType: { type: 'object' },
													byCategory: { type: 'object' },
													bySource: { type: 'object' },
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
	},
	'/api/admin/notifications': {
		get: {
			tags: ['Admin - Notifications'],
			summary: 'List all notifications (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
				{ name: 'skip', in: 'query', schema: { type: 'integer', default: 0 } },
				{ name: 'userId', in: 'query', schema: { type: 'string' } },
				{ name: 'type', in: 'query', schema: { type: 'string' } },
				{ name: 'category', in: 'query', schema: { type: 'string' } },
				{ name: 'isRead', in: 'query', schema: { type: 'boolean' } },
			],
			responses: {
				'200': {
					description: 'Notifications listed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
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
	'/api/admin/notifications/send': {
		post: {
			tags: ['Admin - Notifications'],
			summary: 'Send notification to one user',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['userId', 'title', 'message'],
							properties: {
								userId: { type: 'string' },
								...notificationBodyProps,
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Notification sent',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
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
				...authResponses,
			},
		},
	},
	'/api/admin/notifications/send-batch': {
		post: {
			tags: ['Admin - Notifications'],
			summary: 'Send notification to multiple users',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['userIds', 'title', 'message'],
							properties: {
								userIds: { type: 'array', items: { type: 'string' }, minItems: 1 },
								...notificationBodyProps,
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Batch sent',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											count: { type: 'integer' },
											notifications: {
												type: 'array',
												items: { $ref: '#/components/schemas/Notification' },
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
	},
	'/api/admin/notifications/broadcast': {
		post: {
			tags: ['Admin - Notifications'],
			summary: 'Broadcast notification',
			description: 'All users or optional userIds subset',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['title', 'message'],
							properties: {
								userIds: { type: 'array', items: { type: 'string' } },
								...notificationBodyProps,
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Broadcast delivered',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'object',
										properties: {
											count: { type: 'integer', example: 150 },
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
	'/api/admin/notifications/{id}': {
		delete: {
			tags: ['Admin - Notifications'],
			summary: 'Delete notification (Admin)',
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

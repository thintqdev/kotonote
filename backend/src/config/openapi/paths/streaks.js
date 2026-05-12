export const streakPaths = {
	// Public routes
	'/api/streaks/leaderboard': {
		get: {
			tags: ['Streak'],
			summary: 'Get streak leaderboard (Public)',
			description: 'Get top users by streak count',
			parameters: [
				{
					name: 'limit',
					in: 'query',
					schema: { type: 'number', default: 10 },
					description: 'Number of users to return',
				},
			],
			responses: {
				'200': {
					description: 'Leaderboard retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_506' },
									data: {
										type: 'object',
										properties: {
											leaderboard: {
												type: 'array',
												items: {
													type: 'object',
													properties: {
														userId: { type: 'string' },
														userName: { type: 'string' },
														currentStreak: { type: 'number' },
														longestStreak: { type: 'number' },
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
	},

	// User routes (require authentication)
	'/api/streaks/me': {
		get: {
			tags: ['Streak - User'],
			summary: 'Get my streak',
			description: 'Get current user streak information',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Streak retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_504' },
									data: {
										type: 'object',
										properties: {
											streak: { $ref: '#/components/schemas/Streak' },
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
	'/api/streaks/check-in': {
		post: {
			tags: ['Streak - User'],
			summary: 'Daily check-in',
			description: 'Perform daily check-in to maintain streak',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Check-in successful',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_501' },
									data: {
										type: 'object',
										properties: {
											streak: { $ref: '#/components/schemas/Streak' },
											isNewRecord: { type: 'boolean', example: false },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Already checked in today',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
			},
		},
	},
	'/api/streaks/freeze': {
		post: {
			tags: ['Streak - User'],
			summary: 'Use streak freeze',
			description: 'Use a streak freeze to protect streak',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Freeze used successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_502' },
									data: {
										type: 'object',
										properties: {
											streak: { $ref: '#/components/schemas/Streak' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'No freezes available or not needed',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
			},
		},
	},
	'/api/streaks/weekly': {
		get: {
			tags: ['Streak - User'],
			summary: 'Get weekly check-ins',
			description: 'Get check-in history for the current week',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Weekly check-ins retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_506' },
									data: {
										type: 'object',
										properties: {
											checkIns: {
												type: 'array',
												items: {
													type: 'object',
													properties: {
														date: { type: 'string', format: 'date' },
														checkedIn: { type: 'boolean' },
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
				'401': { $ref: '#/components/responses/Unauthorized' },
			},
		},
	},

	// Admin routes
	'/api/admin/streaks/stats': {
		get: {
			tags: ['Streak - Admin'],
			summary: 'Get streak statistics (Admin only)',
			description: 'Get aggregated streak statistics',
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
									messageCode: { type: 'string', example: 'MSG_506' },
									data: {
										type: 'object',
										properties: {
											stats: {
												type: 'object',
												properties: {
													totalUsers: { type: 'number', example: 150 },
													activeStreaks: { type: 'number', example: 85 },
													averageStreak: { type: 'number', example: 12.5 },
													longestStreak: { type: 'number', example: 365 },
												},
											},
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
};

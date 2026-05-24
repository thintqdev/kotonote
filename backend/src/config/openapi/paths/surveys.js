export const surveyPaths = {
	'/api/surveys': {
		post: {
			tags: ['Survey'],
			summary: 'Submit survey',
			description: 'Submit or update user survey (first-time questionnaire)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['level', 'goal', 'dailyTime'],
							properties: {
								level: { type: 'string', enum: ['begin', 'n5', 'n4', 'n3', 'n2up'], example: 'n3' },
								goal: { type: 'string', enum: ['jlpt', 'travel', 'work', 'school', 'hobby'], example: 'jlpt' },
								dailyTime: { type: 'string', enum: ['lt15', '15-30', '30-60', 'gt60'], example: '30-60' },
								weakAreas: {
									type: 'array',
									items: { type: 'string', enum: ['grammar', 'vocab', 'kanji', 'listen', 'read'] },
									example: ['grammar', 'kanji'],
								},
								discovery: { type: 'string', enum: ['friend', 'sns', 'search', 'other'], example: 'search' },
								discoveryNote: { type: 'string', maxLength: 500, example: 'Found via Google search' },
								freeNote: { type: 'string', maxLength: 1000, example: 'Looking forward to learning' },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Survey created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_301' },
									data: {
										type: 'object',
										properties: {
											survey: { $ref: '#/components/schemas/Survey' },
										},
									},
								},
							},
						},
					},
				},
				'200': {
					description: 'Survey updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_302' },
									data: {
										type: 'object',
										properties: {
											survey: { $ref: '#/components/schemas/Survey' },
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
	'/api/surveys/me/status': {
		get: {
			tags: ['Survey'],
			summary: 'Survey completion status',
			description: 'Whether the authenticated user has submitted the onboarding survey',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Status retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_303' },
									data: { $ref: '#/components/schemas/SurveyCompletionStatus' },
								},
							},
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
			},
		},
	},
	'/api/surveys/me': {
		get: {
			tags: ['Survey'],
			summary: 'Get my survey',
			description: 'Get current user survey',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Survey retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_303' },
									data: {
										type: 'object',
										properties: {
											survey: { $ref: '#/components/schemas/Survey' },
										},
									},
								},
							},
						},
					},
				},
				'404': {
					description: 'Survey not found',
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
			},
		},
	},
	'/api/admin/surveys': {
		get: {
			tags: ['Survey - Admin'],
			summary: 'Get all surveys (Admin only)',
			description: 'Get all user surveys with optional filters',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'level',
					in: 'query',
					schema: { type: 'string', enum: ['begin', 'n5', 'n4', 'n3', 'n2up'] },
					description: 'Filter by level',
				},
				{
					name: 'goal',
					in: 'query',
					schema: { type: 'string', enum: ['jlpt', 'travel', 'work', 'school', 'hobby'] },
					description: 'Filter by goal',
				},
			],
			responses: {
				'200': {
					description: 'Surveys retrieved successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_303' },
									data: {
										type: 'object',
										properties: {
											surveys: {
												type: 'array',
												items: { $ref: '#/components/schemas/Survey' },
											},
											total: { type: 'number', example: 150 },
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
	'/api/admin/surveys/stats': {
		get: {
			tags: ['Survey - Admin'],
			summary: 'Get survey statistics (Admin only)',
			description:
				'Aggregated counts per dimension for charts: byLevel, byGoal, byDailyTime, byDiscovery, byWeakArea. Each array is ordered and includes zeros.',
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
									messageCode: { type: 'string', example: 'MSG_303' },
									data: {
										type: 'object',
										properties: {
											stats: { $ref: '#/components/schemas/SurveyStatistics' },
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
};

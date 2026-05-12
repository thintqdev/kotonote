export const openApiSpec = {
	openapi: '3.1.0',
	info: {
		title: 'Kotonote Nihongo API',
		version: '1.0.0',
		description: 'API documentation for Kotonote Nihongo application',
	},
	servers: [
		{
			url: 'http://localhost:5000',
			description: 'Development server',
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		schemas: {
			Error: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: false },
					messageCode: { type: 'string', example: 'MSG_002' },
					errors: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								field: { type: 'string' },
								message: { type: 'string' },
							},
						},
					},
				},
			},
			User: {
				type: 'object',
				properties: {
					_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
					email: { type: 'string', example: 'user@example.com' },
					name: { type: 'string', example: 'Nguyen Van A' },
					avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
					authProvider: { type: 'string', enum: ['local', 'google'], example: 'local' },
					role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
					status: { type: 'string', enum: ['active', 'locked', 'suspended'], example: 'active' },
					isActive: { type: 'boolean', example: true },
					lastLogin: { type: 'string', format: 'date-time' },
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
				},
			},
			Survey: {
				type: 'object',
				properties: {
					_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
					userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
					level: { type: 'string', enum: ['begin', 'n5', 'n4', 'n3', 'n2up'], example: 'n3' },
					goal: { type: 'string', enum: ['jlpt', 'travel', 'work', 'school', 'hobby'], example: 'jlpt' },
					dailyTime: { type: 'string', enum: ['lt15', '15-30', '30-60', 'gt60'], example: '30-60' },
					weakAreas: { 
						type: 'array', 
						items: { type: 'string', enum: ['grammar', 'vocab', 'kanji', 'listen', 'read'] },
						example: ['grammar', 'kanji']
					},
					discovery: { type: 'string', enum: ['friend', 'sns', 'search', 'other'], example: 'search' },
					discoveryNote: { type: 'string', example: 'Found via Google search' },
					freeNote: { type: 'string', example: 'Looking forward to learning Japanese' },
					completedAt: { type: 'string', format: 'date-time' },
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
				},
			},
		},
	},
	paths: {
		'/api/auth/register': {
			post: {
				tags: ['Authentication'],
				summary: 'Register new user',
				description: 'Create a new user account',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['email', 'password', 'name'],
								properties: {
									email: { type: 'string', format: 'email', example: 'user@example.com' },
									password: { type: 'string', minLength: 6, example: 'password123' },
									name: { type: 'string', minLength: 2, example: 'Nguyen Van A' },
								},
							},
						},
					},
				},
				responses: {
					'201': {
						description: 'User registered successfully',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										messageCode: { type: 'string', example: 'MSG_104' },
										data: {
											type: 'object',
											properties: {
												user: { $ref: '#/components/schemas/User' },
												token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
											},
										},
									},
								},
							},
						},
					},
					'400': {
						description: 'Validation error or user already exists',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/Error' },
							},
						},
					},
				},
			},
		},
		'/api/auth/login': {
			post: {
				tags: ['Authentication'],
				summary: 'Login user',
				description: 'Authenticate user and return JWT token',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['email', 'password'],
								properties: {
									email: { type: 'string', format: 'email', example: 'user@example.com' },
									password: { type: 'string', example: 'password123' },
								},
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Login successful',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										messageCode: { type: 'string', example: 'MSG_101' },
										data: {
											type: 'object',
											properties: {
												user: { $ref: '#/components/schemas/User' },
												token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
											},
										},
									},
								},
							},
						},
					},
					'401': {
						description: 'Invalid credentials',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/Error' },
							},
						},
					},
				},
			},
		},
		'/api/auth/google': {
			post: {
				tags: ['Authentication'],
				summary: 'Google OAuth login',
				description: 'Authenticate user with Google OAuth token',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['token'],
								properties: {
									token: { type: 'string', example: 'google_id_token_here' },
								},
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Google login successful',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										messageCode: { type: 'string', example: 'MSG_101' },
										data: {
											type: 'object',
											properties: {
												user: { $ref: '#/components/schemas/User' },
												token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
											},
										},
									},
								},
							},
						},
					},
					'401': {
						description: 'Google authentication failed',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/Error' },
							},
						},
					},
				},
			},
		},
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
										example: ['grammar', 'kanji']
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
			get: {
				tags: ['Survey'],
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
		'/api/surveys/stats': {
			get: {
				tags: ['Survey'],
				summary: 'Get survey statistics (Admin only)',
				description: 'Get aggregated survey statistics',
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
												stats: {
													type: 'object',
													properties: {
														totalSurveys: { type: 'number', example: 150 },
														levelDistribution: { type: 'array', items: { type: 'string' } },
														goalDistribution: { type: 'array', items: { type: 'string' } },
													},
												},
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
		'/health': {
			get: {
				tags: ['System'],
				summary: 'Health check',
				description: 'Check if server is running',
				responses: {
					'200': {
						description: 'Server is healthy',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean', example: true },
										message: { type: 'string', example: 'Server is running' },
										timestamp: { type: 'string', format: 'date-time' },
									},
								},
							},
						},
					},
				},
			},
		},
	},
};

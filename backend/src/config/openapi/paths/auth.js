export const authPaths = {
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
};

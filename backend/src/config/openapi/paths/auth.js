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
	'/api/auth/admin/login': {
		post: {
			tags: ['Authentication'],
			summary: 'Admin login',
			description: 'Authenticate admin user (simplified login without rate limiting)',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['email', 'password'],
							properties: {
								email: { type: 'string', format: 'email', example: 'admin@kotonote.com' },
								password: { type: 'string', example: 'Admin@123456' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Admin login successful',
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
				'403': {
					description: 'Not an admin account',
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
	'/api/auth/change-password': {
		post: {
			tags: ['Authentication'],
			summary: 'Change password',
			description: 'Authenticated user changes password',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['currentPassword', 'newPassword'],
							properties: {
								currentPassword: { type: 'string', example: 'oldpass123' },
								newPassword: { type: 'string', minLength: 6, example: 'newpass456' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Password changed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_105' },
								},
							},
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
			},
		},
	},
	'/api/auth/forgot-password': {
		post: {
			tags: ['Authentication'],
			summary: 'Request password reset',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['email'],
							properties: {
								email: { type: 'string', format: 'email', example: 'user@example.com' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Reset email sent if account exists',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_106' },
								},
							},
						},
					},
				},
			},
		},
	},
	'/api/auth/reset-password': {
		post: {
			tags: ['Authentication'],
			summary: 'Reset password with token',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['token', 'newPassword'],
							properties: {
								token: { type: 'string', example: 'reset_token_from_email' },
								newPassword: { type: 'string', minLength: 6, example: 'newpass456' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Password reset successful',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_107' },
								},
							},
						},
					},
				},
				'400': {
					description: 'Invalid or expired token',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
	},
	'/api/auth/verify-email': {
		get: {
			tags: ['Authentication'],
			summary: 'Verify email (link)',
			description: 'Verify email via query token from email link',
			parameters: [
				{
					name: 'token',
					in: 'query',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': {
					description: 'Email verified',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_108' },
								},
							},
						},
					},
				},
			},
		},
		post: {
			tags: ['Authentication'],
			summary: 'Verify email (API)',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['token'],
							properties: {
								token: { type: 'string', minLength: 32 },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Email verified',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_108' },
								},
							},
						},
					},
				},
			},
		},
	},
	'/api/auth/resend-verification': {
		post: {
			tags: ['Authentication'],
			summary: 'Resend verification email',
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['email'],
							properties: {
								email: { type: 'string', format: 'email' },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Verification email sent if applicable',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_109' },
								},
							},
						},
					},
				},
			},
		},
	},
};

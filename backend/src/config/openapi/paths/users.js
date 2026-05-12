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
};

export const systemPaths = {
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
};

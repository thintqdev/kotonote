const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
	'404': { $ref: '#/components/responses/NotFound' },
};

export const adminListeningPaths = {
	'/api/admin/listening': {
		get: {
			tags: ['Admin - Listening'],
			summary: 'List all listening exercises (Admin)',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Exercises retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: {
										type: 'array',
										items: { $ref: '#/components/schemas/ListeningExercise' },
									},
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
		post: {
			tags: ['Admin - Listening'],
			summary: 'Create listening exercise (Admin)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['titleVi', 'audioUrl'],
							properties: {
								titleVi: { type: 'string' },
								titleJa: { type: 'string' },
								jlpt: { type: 'string', enum: ['N1', 'N2', 'N3', 'N4', 'N5'] },
								type: {
									type: 'string',
									enum: ['task', 'point', 'summary', 'utterance', 'response'],
								},
								duration: { type: 'number' },
								audioUrl: { type: 'string' },
								image: { type: 'string' },
								scriptJa: { type: 'string' },
								scriptVi: { type: 'string' },
								isPublished: { type: 'boolean' },
								displayOrder: { type: 'integer' },
								questions: { type: 'array', items: { type: 'object' } },
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Exercise created',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: { $ref: '#/components/schemas/ListeningExercise' },
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
	'/api/admin/listening/{id}': {
		get: {
			tags: ['Admin - Listening'],
			summary: 'Get listening exercise (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Exercise retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: { $ref: '#/components/schemas/ListeningExercise' },
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
		put: {
			tags: ['Admin - Listening'],
			summary: 'Update listening exercise (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { type: 'object' },
					},
				},
			},
			responses: {
				'200': {
					description: 'Exercise updated',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: { $ref: '#/components/schemas/ListeningExercise' },
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
		delete: {
			tags: ['Admin - Listening'],
			summary: 'Delete listening exercise (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Exercise deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									data: { $ref: '#/components/schemas/ListeningExercise' },
								},
							},
						},
					},
				},
				...authResponses,
				'404': authResponses['404'],
			},
		},
	},
};

const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

export const listeningPaths = {
	'/api/listening': {
		get: {
			tags: ['Listening'],
			summary: 'List published listening exercises',
			description: 'Requires authentication. Items may include jlptLocked when plan does not include level.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'jlpt',
					in: 'query',
					schema: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
				},
			],
			responses: {
				'200': {
					description: 'List retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1301' },
									data: {
										type: 'object',
										properties: {
											items: {
												type: 'array',
												items: { $ref: '#/components/schemas/ListeningExercise' },
											},
											jlptLevels: {
												type: 'array',
												items: { type: 'string' },
											},
											jlptAccess: { type: 'object' },
											requestedJlptLocked: { type: 'boolean' },
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
	'/api/listening/{id}': {
		get: {
			tags: ['Listening'],
			summary: 'Get listening exercise by ID',
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
									messageCode: { type: 'string', example: 'MSG_1302' },
									data: {
										type: 'object',
										properties: {
											item: { $ref: '#/components/schemas/ListeningExercise' },
											jlptAccess: { type: 'object' },
										},
									},
								},
							},
						},
					},
				},
				'403': {
					description: 'JLPT level not unlocked (MSG_1113)',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				...authResponses,
			},
		},
	},
};

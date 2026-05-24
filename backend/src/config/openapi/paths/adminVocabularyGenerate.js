const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
};

export const adminVocabularyGeneratePaths = {
	'/api/admin/vocabulary/generate': {
		post: {
			tags: ['Admin - Vocabulary Generate'],
			summary: 'Generate vocabulary with AI (Admin vocabulary route)',
			description: 'Uses vocabulary service AI templates (distinct from /api/admin/ai/generate/vocabulary)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								deckId: { type: 'string', description: 'Target deck when autoCreate is true' },
								prompt: { type: 'string', example: 'School and classroom words' },
								templateName: { type: 'string', example: 'n5-basic', default: 'n5-basic' },
								count: { type: 'integer', minimum: 1, maximum: 25, default: 10 },
								autoCreate: { type: 'boolean', default: false },
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Generated preview (autoCreate=false)',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_707' },
									data: {
										type: 'object',
										properties: {
											vocabulary: {
												type: 'array',
												items: { $ref: '#/components/schemas/Vocabulary' },
											},
											count: { type: 'integer' },
										},
									},
								},
							},
						},
					},
				},
				'201': {
					description: 'Generated and saved (autoCreate=true)',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_707' },
									data: { type: 'object' },
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
};

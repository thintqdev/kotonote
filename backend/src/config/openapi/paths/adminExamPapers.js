const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
	'403': { $ref: '#/components/responses/Forbidden' },
	'404': { $ref: '#/components/responses/NotFound' },
};

export const adminExamPaperPaths = {
	'/api/admin/exam-papers': {
		get: {
			tags: ['Admin - Exam Papers'],
			summary: 'List JLPT exam papers',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
				{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
				{ name: 'jlpt', in: 'query', schema: { type: 'string', enum: ['N1', 'N2', 'N3', 'N4', 'N5'] } },
				{ name: 'year', in: 'query', schema: { type: 'integer' } },
				{ name: 'session', in: 'query', schema: { type: 'string', enum: ['july', 'december'] } },
				{ name: 'q', in: 'query', schema: { type: 'string', maxLength: 120 } },
				{ name: 'isPublished', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
			],
			responses: {
				'200': { description: 'Exam papers listed' },
				...authResponses,
			},
		},
		post: {
			tags: ['Admin - Exam Papers'],
			summary: 'Create exam paper',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['year', 'session', 'jlpt'],
							properties: {
								titleVi: { type: 'string', maxLength: 200 },
								titleJa: { type: 'string', maxLength: 200 },
								year: { type: 'integer', example: 2024 },
								session: { type: 'string', enum: ['july', 'december'] },
								jlpt: { type: 'string', enum: ['N1', 'N2', 'N3', 'N4', 'N5'] },
								durationMinutes: { type: 'integer', example: 140 },
								thumbnailUrl: { type: 'string', maxLength: 500 },
								isPublished: { type: 'boolean' },
							},
						},
					},
				},
			},
			responses: {
				'201': { description: 'Exam paper created' },
				'409': { description: 'Duplicate jlpt/year/session' },
				...authResponses,
			},
		},
	},
	'/api/admin/exam-papers/upload-thumbnail': {
		post: {
			tags: ['Admin - Exam Papers'],
			summary: 'Upload exam paper thumbnail (draft)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							type: 'object',
							required: ['thumbnail'],
							properties: {
								thumbnail: { type: 'string', format: 'binary' },
							},
						},
					},
				},
			},
			responses: {
				'200': { description: 'Thumbnail uploaded' },
				...authResponses,
			},
		},
	},
	'/api/admin/exam-papers/{id}': {
		get: {
			tags: ['Admin - Exam Papers'],
			summary: 'Get exam paper by ID',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': { description: 'Exam paper retrieved' },
				...authResponses,
				'404': authResponses['404'],
			},
		},
		put: {
			tags: ['Admin - Exam Papers'],
			summary: 'Update exam paper',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': { description: 'Exam paper updated' },
				...authResponses,
				'404': authResponses['404'],
				'409': { description: 'Duplicate jlpt/year/session' },
			},
		},
		delete: {
			tags: ['Admin - Exam Papers'],
			summary: 'Delete exam paper',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'id', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': { description: 'Exam paper deleted' },
				...authResponses,
				'404': authResponses['404'],
			},
		},
	},
};

const promptTypeEnum = ['vocabulary', 'kanji', 'grammar', 'reading', 'listening', 'other'];
const jlptEnum = ['N5', 'N4', 'N3', 'N2', 'N1'];

const promptBodySchema = {
	type: 'object',
	required: ['type', 'templateKey', 'name', 'content'],
	properties: {
		type: { type: 'string', enum: promptTypeEnum, example: 'vocabulary' },
		templateKey: { type: 'string', example: 'n5-basic' },
		name: { type: 'string', example: 'N5 — Từ vựng cơ bản' },
		description: { type: 'string', example: 'Prompt generate từ vựng JLPT N5' },
		content: {
			type: 'string',
			example: 'Generate {{count}} Japanese vocabulary words for JLPT N5...',
		},
		jlptLevel: { type: 'string', enum: jlptEnum, example: 'N5' },
		category: { type: 'string', example: 'basic' },
		isActive: { type: 'boolean', example: true },
		displayOrder: { type: 'number', example: 1 },
	},
};

const promptListResponse = {
	type: 'object',
	properties: {
		success: { type: 'boolean', example: true },
		messageCode: { type: 'string', example: 'MSG_456' },
		data: {
			type: 'object',
			properties: {
				prompts: {
					type: 'array',
					items: { $ref: '#/components/schemas/Prompt' },
				},
				total: { type: 'number', example: 4 },
			},
		},
	},
};

const promptItemResponse = {
	type: 'object',
	properties: {
		success: { type: 'boolean', example: true },
		messageCode: { type: 'string', example: 'MSG_454' },
		data: {
			type: 'object',
			properties: {
				prompt: { $ref: '#/components/schemas/Prompt' },
			},
		},
	},
};

export const adminPromptPaths = {
	'/api/admin/prompts': {
		get: {
			tags: ['Prompt - Admin'],
			summary: 'List AI prompts (Admin)',
			description:
				'Danh sách mẫu prompt dùng khi generate dữ liệu (từ vựng, kanji, …).',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'type',
					in: 'query',
					schema: { type: 'string', enum: promptTypeEnum },
					description: 'Lọc theo loại nội dung',
				},
				{
					name: 'jlptLevel',
					in: 'query',
					schema: { type: 'string', enum: jlptEnum },
					description: 'Lọc theo cấp JLPT',
				},
				{
					name: 'isActive',
					in: 'query',
					schema: { type: 'boolean' },
					description: 'Lọc theo trạng thái đang dùng',
				},
			],
			responses: {
				'200': {
					description: 'Prompt list',
					content: { 'application/json': { schema: promptListResponse } },
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
		post: {
			tags: ['Prompt - Admin'],
			summary: 'Create AI prompt (Admin)',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': { schema: promptBodySchema },
				},
			},
			responses: {
				'201': {
					description: 'Created',
					content: {
						'application/json': {
							schema: {
								...promptItemResponse,
								properties: {
									...promptItemResponse.properties,
									messageCode: { type: 'string', example: 'MSG_451' },
								},
							},
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
				'409': {
					description: 'Duplicate type + templateKey',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
	},
	'/api/admin/prompts/{id}': {
		get: {
			tags: ['Prompt - Admin'],
			summary: 'Get AI prompt by ID (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': {
					description: 'Prompt detail',
					content: { 'application/json': { schema: promptItemResponse } },
				},
				'404': { $ref: '#/components/responses/NotFound' },
			},
		},
		put: {
			tags: ['Prompt - Admin'],
			summary: 'Update AI prompt (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': { schema: promptBodySchema },
				},
			},
			responses: {
				'200': {
					description: 'Updated',
					content: {
						'application/json': {
							schema: {
								...promptItemResponse,
								properties: {
									...promptItemResponse.properties,
									messageCode: { type: 'string', example: 'MSG_452' },
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				'409': {
					description: 'Duplicate type + templateKey',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
			},
		},
		delete: {
			tags: ['Prompt - Admin'],
			summary: 'Delete AI prompt (Admin)',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: { type: 'string' },
				},
			],
			responses: {
				'200': {
					description: 'Deleted',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_453' },
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
			},
		},
	},
};

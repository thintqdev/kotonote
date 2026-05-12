export const schemas = {
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
				example: ['grammar', 'kanji'],
			},
			discovery: { type: 'string', enum: ['friend', 'sns', 'search', 'other'], example: 'search' },
			discoveryNote: { type: 'string', example: 'Found via Google search' },
			freeNote: { type: 'string', example: 'Looking forward to learning Japanese' },
			completedAt: { type: 'string', format: 'date-time' },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
	Quote: {
		type: 'object',
		properties: {
			_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
			quoteVi: { type: 'string', example: 'Học tập là món quà dành cho chính bạn trong tương lai.' },
			quoteJa: { type: 'string', example: '学ぶことは、未来の自分への贈り物です。' },
			author: { type: 'string', example: 'Lão Tử' },
			category: {
				type: 'string',
				enum: ['motivation', 'learning', 'wisdom', 'perseverance', 'success'],
				example: 'learning',
			},
			isActive: { type: 'boolean', example: true },
			displayOrder: { type: 'number', example: 1 },
			createdAt: { type: 'string', format: 'date-time' },
			updatedAt: { type: 'string', format: 'date-time' },
		},
	},
};

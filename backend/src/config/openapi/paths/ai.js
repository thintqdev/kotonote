export const aiPaths = {
	'/api/admin/ai/generate/vocabulary': {
		post: {
			tags: ['Admin - AI Generation'],
			summary: 'Generate vocabulary with AI (Admin)',
			description: 'Generate vocabulary using AI with customizable prompts and templates',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['prompt'],
							properties: {
								deckId: { 
									type: 'string', 
									example: '507f1f77bcf86cd799439011',
									description: 'Target deck ID (optional, required if autoCreate=true)',
								},
								templateName: { 
									type: 'string', 
									example: 'n3-daily',
									default: 'n3-daily',
									description: 'AI prompt template name',
								},
								prompt: { 
									type: 'string', 
									example: 'Generate vocabulary related to daily activities',
									description: 'Custom prompt for AI generation',
								},
								count: { 
									type: 'number', 
									example: 10,
									minimum: 1,
									maximum: 25,
									default: 10,
									description: 'Number of vocabulary items to generate',
								},
								autoCreate: { 
									type: 'boolean', 
									example: false,
									default: false,
									description: 'Automatically create vocabulary in deck',
								},
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Vocabulary generated and created successfully (if autoCreate=true)',
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
											created: { type: 'number', example: 10 },
											vocabulary: {
												type: 'array',
												items: { $ref: '#/components/schemas/Vocabulary' },
											},
											source: { 
												type: 'string', 
												enum: ['gemini', 'placeholder'],
												example: 'gemini',
												description: 'Source of generated data',
											},
											promptUsed: { 
												type: 'string', 
												example: 'Generate 10 N3 vocabulary...',
												description: 'The actual prompt sent to AI',
											},
											templateName: { 
												type: 'string', 
												example: 'n3-daily',
												description: 'Template used for generation',
											},
										},
									},
								},
							},
						},
					},
				},
				'200': {
					description: 'Vocabulary generated successfully (if autoCreate=false)',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											vocabulary: {
												type: 'array',
												items: {
													type: 'object',
													properties: {
														word: { type: 'string', example: '勉強' },
														reading: { type: 'string', example: 'べんきょう' },
														meaningVi: { type: 'string', example: 'học tập' },
														meaningJa: { type: 'string', example: '学ぶこと' },
														exampleSentence: { type: 'string', example: '毎日勉強します。' },
														exampleMeaning: { type: 'string', example: 'Tôi học mỗi ngày.' },
													},
												},
											},
											count: { type: 'number', example: 10 },
											source: { type: 'string', example: 'gemini' },
											promptUsed: { type: 'string', example: 'Generate 10 N3 vocabulary...' },
											templateName: { type: 'string', example: 'n3-daily' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error - empty prompt',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
	'/api/admin/ai/generate/kanji': {
		post: {
			tags: ['Admin - AI Generation'],
			summary: 'Generate kanji with AI (Admin)',
			description: 'Generate kanji characters using AI with customizable prompts and templates',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['prompt'],
							properties: {
								deckId: { 
									type: 'string', 
									example: '507f1f77bcf86cd799439011',
									description: 'Target deck ID (optional, required if autoCreate=true)',
								},
								templateName: { 
									type: 'string', 
									example: 'n3-intermediate',
									default: 'n3-intermediate',
									description: 'AI prompt template name',
								},
								prompt: { 
									type: 'string', 
									example: 'Generate kanji related to nature and weather',
									description: 'Custom prompt for AI generation',
								},
								count: { 
									type: 'number', 
									example: 10,
									minimum: 1,
									maximum: 25,
									default: 10,
									description: 'Number of kanji to generate',
								},
								autoCreate: { 
									type: 'boolean', 
									example: false,
									default: false,
									description: 'Automatically create kanji in deck',
								},
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Kanji generated and created successfully (if autoCreate=true)',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_901' },
									data: {
										type: 'object',
										properties: {
											created: { type: 'number', example: 10 },
											kanji: {
												type: 'array',
												items: { $ref: '#/components/schemas/Kanji' },
											},
											source: { 
												type: 'string', 
												enum: ['gemini', 'placeholder'],
												example: 'gemini',
												description: 'Source of generated data',
											},
											promptUsed: { 
												type: 'string', 
												example: 'Generate 10 N3 kanji...',
												description: 'The actual prompt sent to AI',
											},
											templateName: { 
												type: 'string', 
												example: 'n3-intermediate',
												description: 'Template used for generation',
											},
										},
									},
								},
							},
						},
					},
				},
				'200': {
					description: 'Kanji generated successfully (if autoCreate=false)',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											kanji: {
												type: 'array',
												items: {
													type: 'object',
													properties: {
														char: { type: 'string', example: '学' },
														onYomi: { type: 'string', example: 'ガク' },
														kunYomi: { type: 'string', example: 'まな.ぶ' },
														hanViet: { type: 'string', example: 'Học' },
														meaningVi: { type: 'string', example: 'học, học tập' },
														vocabJa: { type: 'string', example: '学生（がくせい）' },
														exampleJa: { type: 'string', example: '学校で勉強します。' },
														exampleVi: { type: 'string', example: 'Học ở trường.' },
													},
												},
											},
											count: { type: 'number', example: 10 },
											source: { type: 'string', example: 'gemini' },
											promptUsed: { type: 'string', example: 'Generate 10 N3 kanji...' },
											templateName: { type: 'string', example: 'n3-intermediate' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error - empty prompt',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
	'/api/admin/ai/translate': {
		post: {
			tags: ['Admin - AI Generation'],
			summary: 'Translate text with AI (Admin)',
			description: 'Translate text between languages using AI',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['text'],
							properties: {
								text: { 
									type: 'string', 
									example: 'こんにちは、元気ですか？',
									description: 'Text to translate',
								},
								sourceLang: { 
									type: 'string', 
									example: 'ja',
									default: 'ja',
									description: 'Source language code (ja, vi, en)',
								},
								targetLang: { 
									type: 'string', 
									example: 'vi',
									default: 'vi',
									description: 'Target language code (ja, vi, en)',
								},
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Translation successful',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											original: { 
												type: 'string', 
												example: 'こんにちは、元気ですか？',
												description: 'Original text',
											},
											translation: { 
												type: 'string', 
												example: 'Xin chào, bạn khỏe không?',
												description: 'Translated text',
											},
											sourceLang: { 
												type: 'string', 
												example: 'ja',
												description: 'Source language',
											},
											targetLang: { 
												type: 'string', 
												example: 'vi',
												description: 'Target language',
											},
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Validation error - empty text',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
	'/api/admin/ai/test': {
		get: {
			tags: ['Admin - AI Generation'],
			summary: 'Test AI connection (Admin)',
			description: 'Check if AI service (Gemini) is configured and ready',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'AI service status retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_001' },
									data: {
										type: 'object',
										properties: {
											configured: { 
												type: 'boolean', 
												example: true,
												description: 'Whether GEMINI_API_KEY is configured',
											},
											provider: { 
												type: 'string', 
												example: 'Gemini AI',
												description: 'AI provider name',
											},
											message: { 
												type: 'string', 
												example: 'AI service is configured and ready',
												description: 'Status message',
											},
										},
									},
								},
							},
						},
					},
				},
				'401': { $ref: '#/components/responses/Unauthorized' },
				'403': { $ref: '#/components/responses/Forbidden' },
			},
		},
	},
};

const listQueryParams = [
	{ name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
	{
		name: 'limit',
		in: 'query',
		schema: { type: 'integer', minimum: 1, maximum: 50, default: 12 },
	},
	{
		name: 'jlpt',
		in: 'query',
		schema: { type: 'string', enum: ['N5', 'N4', 'N3', 'N2', 'N1'] },
	},
	{
		name: 'mode',
		in: 'query',
		schema: { type: 'string', enum: ['all', 'suggested', 'review'], default: 'all' },
	},
];

const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
};

/** Reading API for logged-in users */
export const readingPaths = {
	'/api/reading/summary': {
		get: {
			tags: ['Reading - User'],
			summary: 'Reading progress summary',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Weekly progress',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_938' },
									data: { $ref: '#/components/schemas/ReadingSummary' },
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
	'/api/reading': {
		get: {
			tags: ['Reading - User'],
			summary: 'List published reading articles',
			security: [{ bearerAuth: [] }],
			parameters: listQueryParams,
			responses: {
				'200': {
					description: 'Article list with user status',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_935' },
									data: {
										type: 'object',
										properties: {
											items: {
												type: 'array',
												items: { $ref: '#/components/schemas/ReadingListItem' },
											},
											jlptLevels: {
												type: 'array',
												items: { type: 'string' },
											},
										},
									},
									pagination: { $ref: '#/components/schemas/Pagination' },
								},
							},
						},
					},
				},
				...authResponses,
			},
		},
	},
	'/api/reading/{slug}': {
		get: {
			tags: ['Reading - User'],
			summary: 'Get article detail by slug',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
			],
			responses: {
				'200': {
					description: 'Full article',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_933' },
									data: {
										type: 'object',
										properties: {
											article: { $ref: '#/components/schemas/ReadingArticle' },
										},
									},
								},
							},
						},
					},
				},
				'404': { $ref: '#/components/responses/NotFound' },
				...authResponses,
			},
		},
	},
	'/api/reading/{slug}/sentence-feedback': {
		post: {
			tags: ['Reading - User'],
			summary: 'Grade sentence-by-sentence translations',
			description:
				'Returns AI feedback plus subject/predicate and grammar analysis, only for submitted sentences. Analysis is cached per article. Rate limited: 60 requests / 15 min per user.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['items'],
							properties: {
								items: {
									type: 'array',
									minItems: 1,
									maxItems: 10,
									items: {
										type: 'object',
										required: ['index', 'translationVi'],
										properties: {
											index: { type: 'integer', minimum: 0 },
											translationVi: { type: 'string', maxLength: 1000 },
										},
									},
								},
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Feedback per sentence',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_940' },
									data: {
										type: 'object',
										properties: {
											source: { type: 'string', enum: ['gemini', 'placeholder'] },
											results: {
												type: 'array',
												items: {
													type: 'object',
													properties: {
														index: { type: 'integer' },
														translationVi: { type: 'string' },
														feedback: {
															nullable: true,
															allOf: [{ $ref: '#/components/schemas/ReadingSentenceFeedback' }],
														},
														analysis: {
															nullable: true,
															allOf: [{ $ref: '#/components/schemas/ReadingSentenceAnalysis' }],
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
				'400': { description: 'Invalid items or sentence index out of range' },
				'404': { $ref: '#/components/responses/NotFound' },
				...authResponses,
			},
		},
	},
	'/api/reading/{slug}/translation-summary': {
		post: {
			tags: ['Reading - User'],
			summary: 'AI overall summary after every sentence has been graded',
			description:
				'items must cover every sentence of the article (index 0..n-1), each with the graded translation and score. Shares the sentence-feedback rate limit.',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['items'],
							properties: {
								items: {
									type: 'array',
									minItems: 1,
									maxItems: 120,
									items: {
										type: 'object',
										required: ['index', 'translationVi', 'score'],
										properties: {
											index: { type: 'integer', minimum: 0 },
											translationVi: { type: 'string', maxLength: 1000 },
											score: { type: 'number', minimum: 0, maximum: 100 },
										},
									},
								},
							},
						},
					},
				},
			},
			responses: {
				'200': {
					description: 'Summary (null when AI is unavailable)',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_944' },
									data: {
										type: 'object',
										properties: {
											source: { type: 'string', enum: ['gemini', 'placeholder'] },
											summary: {
												type: 'object',
												nullable: true,
												properties: {
													summaryVi: { type: 'string' },
													strengthsVi: { type: 'array', items: { type: 'string' } },
													weaknessesVi: { type: 'array', items: { type: 'string' } },
													grammarToReview: {
														type: 'array',
														items: {
															type: 'object',
															properties: {
																pattern: { type: 'string' },
																reasonVi: { type: 'string' },
															},
														},
													},
													adviceVi: { type: 'array', items: { type: 'string' } },
												},
											},
										},
									},
								},
							},
						},
					},
				},
				'400': { description: 'Not every sentence is included (MSG_945)' },
				'404': { $ref: '#/components/responses/NotFound' },
				...authResponses,
			},
		},
	},
	'/api/reading/{slug}/progress': {
		put: {
			tags: ['Reading - User'],
			summary: 'Save reading progress',
			security: [{ bearerAuth: [] }],
			parameters: [
				{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ReadingProgressInput' },
					},
				},
			},
			responses: {
				'200': {
					description: 'Progress saved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									messageCode: { type: 'string', example: 'MSG_937' },
									data: {
										type: 'object',
										properties: {
											progress: { $ref: '#/components/schemas/ReadingProgress' },
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
};

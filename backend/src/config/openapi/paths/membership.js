const authResponses = {
	'401': { $ref: '#/components/responses/Unauthorized' },
};

export const membershipPaths = {
	'/api/membership/plans': {
		get: {
			tags: ['Membership'],
			summary: 'List membership plans',
			description: 'Public catalog of tiers, pricing, and JLPT unlock levels',
			responses: {
				'200': {
					description: 'Plans retrieved',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1101' },
									data: {
										type: 'object',
										properties: {
											plans: {
												type: 'array',
												items: { $ref: '#/components/schemas/MembershipPlan' },
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
	'/api/membership/me': {
		get: {
			tags: ['Membership'],
			summary: 'Get my membership',
			security: [{ bearerAuth: [] }],
			responses: {
				'200': {
					description: 'Current membership',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1102' },
									data: {
										type: 'object',
										properties: {
											membership: { $ref: '#/components/schemas/UserMembership' },
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
	'/api/membership/checkout': {
		post: {
			tags: ['Membership'],
			summary: 'Create checkout session',
			description: 'Mock checkout for paid tier upgrade',
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['tierId', 'billing'],
							properties: {
								tierId: {
									type: 'string',
									enum: ['pro', 'ultra', 'ultimate'],
									example: 'pro',
								},
								billing: {
									type: 'string',
									enum: ['yearly', 'lifetime'],
									example: 'yearly',
								},
							},
						},
					},
				},
			},
			responses: {
				'201': {
					description: 'Checkout created',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1103' },
									data: {
										type: 'object',
										properties: {
											checkout: {
												type: 'object',
												properties: {
													id: { type: 'string' },
													tierId: { type: 'string' },
													billing: { type: 'string' },
													amountVnd: { type: 'integer' },
													expiresAt: { type: 'string', format: 'date-time' },
												},
											},
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
	'/api/membership/checkout/{checkoutId}/confirm': {
		post: {
			tags: ['Membership'],
			summary: 'Confirm checkout payment',
			description: 'Simulated successful payment; returns updated user with badges',
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'checkoutId',
					in: 'path',
					required: true,
					schema: { type: 'string', pattern: '^[a-f0-9]{24}$' },
				},
			],
			responses: {
				'200': {
					description: 'Payment confirmed',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean', example: true },
									messageCode: { type: 'string', example: 'MSG_1104' },
									data: {
										type: 'object',
										properties: {
											membership: { $ref: '#/components/schemas/UserMembership' },
											user: { $ref: '#/components/schemas/User' },
										},
									},
								},
							},
						},
					},
				},
				'400': {
					description: 'Invalid or expired checkout',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Error' },
						},
					},
				},
				...authResponses,
			},
		},
	},
};

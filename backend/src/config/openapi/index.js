import { schemas } from './schemas.js';
import { authPaths } from './paths/auth.js';
import { userPaths } from './paths/users.js';
import { surveyPaths } from './paths/surveys.js';
import { quotePaths } from './paths/quotes.js';
import { systemPaths } from './paths/system.js';

export const openApiSpec = {
	openapi: '3.1.0',
	info: {
		title: 'Kotonote Nihongo API',
		version: '1.0.0',
		description: 'API documentation for Kotonote Nihongo application',
	},
	servers: [
		{
			url: 'http://localhost:5000',
			description: 'Development server',
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		schemas,
	},
	paths: {
		...authPaths,
		...userPaths,
		...surveyPaths,
		...quotePaths,
		...systemPaths,
	},
};

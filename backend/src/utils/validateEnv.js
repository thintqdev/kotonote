/**
 * Validate required environment variables on startup
 */
const validateEnv = () => {
	const requiredEnvs = [
		'MONGODB_URI',
		'JWT_SECRET',
		'PORT'
	];

	const missing = requiredEnvs.filter(env => !process.env[env]);

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
};

export default validateEnv;

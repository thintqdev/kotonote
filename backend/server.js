import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { apiReference } from '@scalar/express-api-reference';
import connectDB from './src/config/database.js';
import validateEnv from './src/utils/validateEnv.js';
import errorHandler from './src/middlewares/errorHandler.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import surveyRoutes from './src/routes/surveyRoutes.js';
import quoteRoutes from './src/routes/quoteRoutes.js';
import { openApiSpec } from './src/config/openapi/index.js';

// Load environment variables
dotenv.config();

// Validate environment
validateEnv();

// Connect to database
await connectDB();

const app = express();

// Security & Performance Middlewares
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
				'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
				'img-src': ["'self'", 'data:', 'cdn.jsdelivr.net'],
			},
		},
	})
);
app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'Server is running',
		timestamp: new Date().toISOString()
	});
});

// API Documentation
app.use(
	'/api/docs',
	apiReference({
		spec: {
			content: openApiSpec,
		},
		theme: 'purple',
	})
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/quotes', quoteRoutes);

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route not found'
	});
});

// Error Handler (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV}`);
	console.log(`API Docs: http://localhost:${PORT}/api/docs`);
});

export default app;

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @throws {Error} If connection fails
 */
const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			serverSelectionTimeoutMS: 10_000,
			socketTimeoutMS: 45_000,
		});

		mongoose.connection.on('disconnected', () => {
			console.warn('[MongoDB] Disconnected');
		});
		mongoose.connection.on('reconnected', () => {
			console.log('[MongoDB] Reconnected');
		});

		console.log(`MongoDB Connected: ${conn.connection.host}`);
		return conn;
	} catch (error) {
		console.error(`Error connecting to MongoDB: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB;

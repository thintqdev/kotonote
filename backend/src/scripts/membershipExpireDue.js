/**
 * Chạy một lần: hết hạn các gói yearly quá expiresAt.
 *   npm run membership:expire-due
 */
import 'dotenv/config';
import connectDB from '../config/database.js';
import { expireDueMemberships } from '../services/membershipExpiryService.js';

await connectDB();
const result = await expireDueMemberships();
console.log('[membership:expire-due]', result);
process.exit(0);

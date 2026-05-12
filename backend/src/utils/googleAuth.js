import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		
		const payload = ticket.getPayload();
		
		return {
			googleId: payload.sub,
			email: payload.email,
			name: payload.name,
			avatar: payload.picture,
			emailVerified: payload.email_verified,
		};
	} catch (error) {
		return null;
	}
};

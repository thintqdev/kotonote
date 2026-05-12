import transporter from '../config/email.js';
import { verifyEmailTemplate } from '../templates/emails/verifyEmail.js';

export const sendVerificationEmail = async (email, name, verificationToken) => {
	const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
	
	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: email,
		subject: 'Xác thực tài khoản Kotonote Nihongo',
		html: verifyEmailTemplate(name, verificationUrl),
	};
	
	try {
		await transporter.sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Email sending error:', error);
		return false;
	}
};

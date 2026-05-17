import { sendMail } from '../config/email.js';
import { verifyEmailTemplate } from '../templates/emails/verifyEmail.js';
import { resetPasswordTemplate } from '../templates/emails/resetPassword.js';

const defaultFrom =
	process.env.EMAIL_FROM || 'Kotonote Nihongo <noreply@localhost>';

export const sendVerificationEmail = async (email, name, verificationToken) => {
	const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${encodeURIComponent(verificationToken)}`;
	
	const mailOptions = {
		from: defaultFrom,
		to: email,
		subject: 'Xác thực tài khoản Kotonote Nihongo',
		html: verifyEmailTemplate(name, verificationUrl),
	};
	
	try {
		await sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Email sending error:', error);
		return false;
	}
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
	const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

	const mailOptions = {
		from: defaultFrom,
		to: email,
		subject: 'Đặt lại mật khẩu — Kotonote Nihongo',
		html: resetPasswordTemplate(name, resetUrl),
	};

	try {
		await sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Password reset email error:', error);
		return false;
	}
};

import { sendMail } from '../config/email.js';
import { verifyEmailTemplate } from '../templates/emails/verifyEmail.js';
import { resetPasswordTemplate } from '../templates/emails/resetPassword.js';
import { dailyDigestEmailTemplate } from '../templates/emails/dailyDigestEmail.js';

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

/**
 * @param {{
 *   email: string,
 *   name: string,
 *   useJa: boolean,
 *   stats: { label: string, value: string }[],
 *   dashboardUrl: string,
 *   isWeekly?: boolean,
 * }} payload
 */
export const sendDailyDigestEmail = async (payload) => {
	const { email, name, useJa, stats, dashboardUrl, isWeekly = false } =
		payload;

	const subject = isWeekly
		? useJa
			? '【Kotonote】週間レポート'
			: '【Kotonote】Báo cáo tuần học tập'
		: useJa
			? '【Kotonote】今日の学習サマリー'
			: '【Kotonote】Tóm tắt học tập hôm nay';

	const mailOptions = {
		from: defaultFrom,
		to: email,
		subject,
		html: dailyDigestEmailTemplate({
			name,
			useJa,
			stats,
			dashboardUrl,
			isWeekly,
		}),
	};

	try {
		await sendMail(mailOptions);
		return true;
	} catch (error) {
		console.error('Daily digest email error:', error);
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

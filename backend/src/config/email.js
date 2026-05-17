import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function buildTransportOptions() {
	const port = Number(process.env.SMTP_PORT) || 587;
	const transportOptions = {
		host: process.env.SMTP_HOST || 'localhost',
		port,
		secure: port === 465,
	};

	if (process.env.SMTP_USER) {
		transportOptions.auth = {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		};
	}

	return transportOptions;
}

let transporter;

/**
 * Lazy — đọc SMTP_* sau khi .env đã load (tránh ESM import trước dotenv trong server.js).
 */
export function getTransporter() {
	if (!transporter) {
		transporter = nodemailer.createTransport(buildTransportOptions());
	}
	return transporter;
}

/** @param {nodemailer.SendMailOptions} options */
export const sendMail = (options) => getTransporter().sendMail(options);

export default { sendMail, getTransporter };

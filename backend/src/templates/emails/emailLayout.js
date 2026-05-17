/**
 * Layout email đồng bộ UI auth (giấy washi, viền #c4a882, nút xanh #a8b58a).
 * Table-based để tương thích client mail.
 */

const BRAND_NAME = process.env.EMAIL_APP_NAME || 'Kotonote Nihongo';
const YEAR = new Date().getFullYear();

/**
 * @param {string} value
 */
export function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * @param {{
 *   preheader: string,
 *   title: string,
 *   greetingName: string,
 *   intro: string,
 *   ctaLabel: string,
 *   ctaUrl: string,
 *   steps?: string[],
 *   note?: string,
 *   linkFallbackLabel?: string,
 * }} options
 */
export function buildAuthEmail(options) {
	const {
		preheader,
		title,
		greetingName,
		intro,
		ctaLabel,
		ctaUrl,
		steps = [],
		note = '',
		linkFallbackLabel = 'Hoặc mở link sau trong trình duyệt:',
	} = options;

	const safeName = escapeHtml(greetingName);
	const safeTitle = escapeHtml(title);
	const safeIntro = escapeHtml(intro);
	const safeNote = note ? escapeHtml(note) : '';
	const safeCta = escapeHtml(ctaLabel);
	const safeUrl = escapeHtml(ctaUrl);
	const safePreheader = escapeHtml(preheader);

	const stepsHtml =
		steps.length > 0
			? `
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0 0;border-collapse:collapse;">
				<tr>
					<td style="padding:14px 16px;background-color:#f5e6a3;border:1px solid #d4c078;border-radius:3px;font-family:'M PLUS Rounded 1c',Verdana,Arial,sans-serif;font-size:13px;line-height:1.65;color:#3a3028;">
						${steps.map((s, i) => `<div style="margin:${i ? '10px 0 0' : '0'};"><strong>${i + 1}.</strong> ${escapeHtml(s)}</div>`).join('')}
					</td>
				</tr>
			</table>`
			: '';

	const noteHtml = safeNote
		? `
			<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 0;border-collapse:collapse;">
				<tr>
					<td style="padding-top:20px;border-top:1px dashed #c4a882;font-family:'M PLUS Rounded 1c',Verdana,Arial,sans-serif;font-size:12px;line-height:1.65;color:#7a6a5a;">
						${safeNote}
					</td>
				</tr>
			</table>`
		: '';

	return `<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>${safeTitle}</title>
	<!--[if mso]>
	<noscript>
		<xml>
			<o:OfficeDocumentSettings>
				<o:PixelsPerInch>96</o:PixelsPerInch>
			</o:OfficeDocumentSettings>
		</xml>
	</noscript>
	<![endif]-->
	<style>
		@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;600;700&display=swap');
	</style>
</head>
<body style="margin:0;padding:0;background-color:#f0e9dc;-webkit-text-size-adjust:100%;">
	<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${safePreheader}</div>
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0e9dc;border-collapse:collapse;">
		<tr>
			<td align="center" style="padding:32px 16px 40px;">
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;border-collapse:collapse;">
					<!-- Sticky kicker -->
					<tr>
						<td align="center" style="padding:0 0 14px;">
							<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
								<tr>
									<td style="padding:8px 14px;background-color:#f5e6a3;border:1px solid #d4c078;border-radius:2px;transform:rotate(-2deg);font-family:'M PLUS Rounded 1c',Verdana,Arial,sans-serif;font-size:12px;font-weight:600;color:#3a3028;line-height:1.5;">
										✎ ${escapeHtml(BRAND_NAME)}
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<!-- Card -->
					<tr>
						<td style="background-color:#faf6ef;border:2px solid #c4a882;border-radius:4px;box-shadow:3px 4px 0 rgba(61,52,42,0.08);">
							<!-- Banner -->
							<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
								<tr>
									<td align="center" style="padding:18px 24px 14px;background-color:#f0e9d6;border-bottom:1.5px dashed #c4a882;">
										<p style="margin:0 0 6px;font-family:'M PLUS Rounded 1c',Verdana,Arial,sans-serif;font-size:11px;font-weight:600;color:#8a7055;letter-spacing:0.04em;">
											☆ Cùng nhau cố gắng nhé!
										</p>
										<h1 style="margin:0;font-family:'M PLUS Rounded 1c',Verdana,Arial,sans-serif;font-size:22px;font-weight:700;color:#2b2b2b;line-height:1.25;letter-spacing:0.02em;">
											${escapeHtml(BRAND_NAME)}
										</h1>
									</td>
								</tr>
							</table>
							<!-- Body -->
							<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
								<tr>
									<td style="padding:28px 28px 24px;font-family:'M PLUS Rounded 1c',Verdana,Arial,sans-serif;">
										<h2 style="margin:0 0 14px;font-size:20px;font-weight:700;color:#2b2b2b;line-height:1.3;">
											${safeTitle}
										</h2>
										<p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#3d3428;line-height:1.5;">
											Xin chào ${safeName}!
										</p>
										<p style="margin:0;font-size:14px;line-height:1.7;color:#4a4036;">
											${safeIntro}
										</p>
										${stepsHtml}
										<!-- CTA -->
										<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 0;border-collapse:collapse;">
											<tr>
												<td align="center" style="border-radius:3px;background-color:#a8b58a;border:2px solid #8a9870;">
													<a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 32px;font-family:'M PLUS Rounded 1c',Verdana,Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
														${safeCta} →
													</a>
												</td>
											</tr>
										</table>
										<p style="margin:22px 0 8px;font-size:12px;line-height:1.5;color:#7a6a5a;text-align:center;">
											${escapeHtml(linkFallbackLabel)}
										</p>
										<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
											<tr>
												<td style="padding:12px 14px;background-color:#fffdf8;border:1.5px dashed #c4a882;border-radius:3px;font-family:Consolas,'Courier New',monospace;font-size:11px;line-height:1.55;color:#5c7a4a;word-break:break-all;">
													<a href="${ctaUrl}" style="color:#5c7a4a;text-decoration:underline;">${safeUrl}</a>
												</td>
											</tr>
										</table>
										${noteHtml}
									</td>
								</tr>
							</table>
							<!-- Footer -->
							<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
								<tr>
									<td align="center" style="padding:16px 24px 20px;background-color:rgba(247,241,232,0.9);border-top:1.5px dashed #c4a882;font-family:'M PLUS Rounded 1c',Verdana,Arial,sans-serif;font-size:11px;line-height:1.6;color:#9a8070;">
										© ${YEAR} ${escapeHtml(BRAND_NAME)} · Học tiếng Nhật theo nhịp của bạn
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}

export const verifyEmailTemplate = (name, verificationUrl) => {
	return `
<!DOCTYPE html>
<html lang="vi">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Xác thực Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
	<table role="presentation" style="width: 100%; border-collapse: collapse;">
		<tr>
			<td align="center" style="padding: 40px 0;">
				<table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
					<!-- Header with Logo -->
					<tr>
						<td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
							<div style="background-color: white; width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
								<h1 style="margin: 0; color: #667eea; font-size: 32px; font-weight: bold;">言</h1>
							</div>
							<h2 style="margin: 20px 0 0; color: #ffffff; font-size: 28px; font-weight: 600;">Kotonote Nihongo</h2>
						</td>
					</tr>
					
					<!-- Content -->
					<tr>
						<td style="padding: 40px;">
							<h3 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Xin chào ${name}!</h3>
							<p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
								Cảm ơn bạn đã đăng ký tài khoản tại <strong>Kotonote Nihongo</strong>. Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn vào nút bên dưới.
							</p>
							
							<!-- CTA Button -->
							<table role="presentation" style="margin: 30px 0;">
								<tr>
									<td align="center">
										<a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
											Xác thực Email
										</a>
									</td>
								</tr>
							</table>
							
							<p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
								Hoặc copy và paste link sau vào trình duyệt:
							</p>
							<p style="margin: 10px 0 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px; color: #667eea; font-size: 13px; word-break: break-all;">
								${verificationUrl}
							</p>
							
							<div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
								<p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
									<strong>Lưu ý:</strong> Link xác thực này sẽ hết hạn sau <strong>24 giờ</strong>. Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.
								</p>
							</div>
						</td>
					</tr>
					
					<!-- Footer -->
					<tr>
						<td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
							<p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
								Bạn cần hỗ trợ? <a href="mailto:support@kotonote.com" style="color: #667eea; text-decoration: none;">Liên hệ với chúng tôi</a>
							</p>
							<p style="margin: 0; color: #999999; font-size: 12px;">
								© 2026 Kotonote Nihongo. All rights reserved.
							</p>
							<div style="margin-top: 15px;">
								<a href="#" style="display: inline-block; margin: 0 8px; color: #999999; text-decoration: none; font-size: 12px;">Privacy Policy</a>
								<span style="color: #cccccc;">|</span>
								<a href="#" style="display: inline-block; margin: 0 8px; color: #999999; text-decoration: none; font-size: 12px;">Terms of Service</a>
							</div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
	`;
};

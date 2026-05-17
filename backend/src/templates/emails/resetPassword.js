import { buildAuthEmail } from './emailLayout.js';

export const resetPasswordTemplate = (name, resetUrl) =>
	buildAuthEmail({
		preheader: 'Yêu cầu đặt lại mật khẩu Kotonote Nihongo — link có hiệu lực 1 giờ.',
		title: 'Đặt lại mật khẩu',
		greetingName: name,
		intro:
			'Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để chọn mật khẩu mới trên trang web.',
		ctaLabel: 'Đặt lại mật khẩu',
		ctaUrl: resetUrl,
		note:
			'Link hết hạn sau 1 giờ. Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email — tài khoản vẫn an toàn.',
	});

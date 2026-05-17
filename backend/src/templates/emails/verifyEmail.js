import { buildAuthEmail } from './emailLayout.js';

export const verifyEmailTemplate = (name, verificationUrl) =>
	buildAuthEmail({
		preheader: 'Mở link và nhấn nút xác nhận để hoàn tất đăng ký Kotonote Nihongo.',
		title: 'Xác thực email',
		greetingName: name,
		intro:
			'Cảm ơn bạn đã đăng ký. Để bắt đầu học, hãy xác nhận địa chỉ email của bạn theo các bước bên dưới.',
		ctaLabel: 'Mở trang xác nhận',
		ctaUrl: verificationUrl,
		steps: [
			'Nhấn nút xanh phía trên (hoặc dán link vào trình duyệt).',
			'Trên trang web, nhấn nút「Xác nhận email」— không tự xác nhận khi chỉ mở link.',
			'Sau khi xác nhận, đăng nhập và hoàn thành khảo sát ngắn.',
		],
		note:
			'Lưu ý: Link hết hạn sau 24 giờ. Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email.',
	});

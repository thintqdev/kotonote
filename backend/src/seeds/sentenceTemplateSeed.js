import * as specialtyRepository from '../repositories/sentenceSpecialtyRepository.js';
import * as templateRepository from '../repositories/sentenceTemplateRepository.js';

const IT_SPECIALTY = {
	code: 'it',
	nameVi: 'Công nghệ thông tin (IT)',
	nameJa: 'IT・エンジニア',
	descriptionVi:
		'Câu tiếng Nhật thường dùng trong môi trường làm việc IT: họp, báo cáo lỗi, review code, triển khai.',
	descriptionJa:
		'開発・運用現場でよく使う日本語フレーズ：会議、バグ報告、コードレビュー、デプロイなど。',
	isActive: true,
	displayOrder: 1,
};

const IT_TEMPLATES = [
	{
		code: 'confirm-deploy-steps',
		situationVi: 'Bạn muốn xác nhận lại các bước deploy với team',
		situationJa: 'デプロイ手順をチームに確認したい',
		sentenceJa: 'デプロイの手順について確認させてください。',
		sentenceVi: 'Xin phép được xác nhận lại các bước deploy.',
		reading: 'デプロイのてじゅんについてかくにんさせてください。',
		clozePart: '確認させてください',
		politenessLevel: 'polite',
		noteVi: 'Dùng khi cần xác nhận quy trình trước khi triển khai.',
		noteJa: '作業前に手順を確認する丁寧な言い方。',
		displayOrder: 1,
	},
	{
		code: 'investigating-bug',
		situationVi: 'Bạn đang báo với sếp/team là đang điều tra nguyên nhân bug',
		situationJa: 'バグの原因を調査中であることを報告する',
		sentenceJa: 'バグの原因を調査中です。進捗があり次第、共有します。',
		sentenceVi: 'Đang điều tra nguyên nhân bug. Sẽ cập nhật khi có tiến triển.',
		reading: 'バグのげんいんをちょうさちゅうです。しんちょくがありしだい、きょうゆうします。',
		clozePart: '調査中です',
		politenessLevel: 'polite',
		noteVi: '「調査中」 = đang điều tra.',
		noteJa: '',
		displayOrder: 2,
	},
	{
		code: 'prod-impact-priority',
		situationVi: 'Bug ảnh hưởng production, bạn cần ưu tiên xử lý',
		situationJa: '本番影響があるため優先対応を伝える',
		sentenceJa: '本番環境に影響があるため、優先度を上げて対応します。',
		sentenceVi: 'Vì ảnh hưởng môi trường production nên sẽ ưu tiên xử lý.',
		reading: 'ほんかんかんきょうにえいきょうがあるため、ゆうせんどをあげてたいおうします。',
		clozePart: '優先度を上げて対応します',
		politenessLevel: 'polite',
		noteVi: '本番環境 = môi trường production.',
		noteJa: '',
		displayOrder: 3,
	},
	{
		code: 'please-review-pr',
		situationVi: 'Bạn nhờ đồng nghiệp review pull request',
		situationJa: 'PRのレビューを依頼する',
		sentenceJa: 'お手すきの際にレビューをお願いできますでしょうか。',
		sentenceVi: 'Khi rảnh, bạn review giúp mình được không?',
		reading: 'おてすきのさいにレビューをおねがいできますでしょうか。',
		clozePart: 'レビューをお願いできますでしょうか',
		politenessLevel: 'keigo',
		noteVi: 'Cách nhờ lịch sự trong công ty.',
		noteJa: '丁寧な依頼表現。',
		displayOrder: 4,
	},
	{
		code: 'fix-by-tomorrow',
		situationVi: 'Bạn cam kết sẽ xử lý xong trước ngày mai',
		situationJa: '明日までに対応完了する予定を伝える',
		sentenceJa: '明日までに対応完了する予定です。',
		sentenceVi: 'Dự kiến xử lý xong trước ngày mai.',
		reading: 'あしたまでにたいおうかんりょうするよていです。',
		clozePart: '対応完了する予定です',
		politenessLevel: 'polite',
		noteVi: '対応 = xử lý / phản hồi ticket.',
		noteJa: '',
		displayOrder: 5,
	},
	{
		code: 'updated-spec',
		situationVi: 'Bạn thông báo đã cập nhật tài liệu spec',
		situationJa: '仕様書を更新したことを共有する',
		sentenceJa: '仕様書を更新しました。ご確認ください。',
		sentenceVi: 'Đã cập nhật tài liệu spec. Nhờ mọi người xác nhận.',
		reading: 'しようしょをこうしんしました。ごかくにんください。',
		clozePart: '仕様書を更新しました',
		politenessLevel: 'polite',
		noteVi: '仕様書 = tài liệu đặc tả / spec.',
		noteJa: '',
		displayOrder: 6,
	},
	{
		code: 'reproduced-in-staging',
		situationVi: 'Bạn báo đã tái hiện được bug trên môi trường test',
		situationJa: 'テスト環境で再現できたことを報告する',
		sentenceJa: 'テスト環境で再現できました。',
		sentenceVi: 'Đã tái hiện được trên môi trường test.',
		reading: 'テストかんきょうでさいげんできました。',
		clozePart: '再現できました',
		politenessLevel: 'polite',
		noteVi: '再現 = reproduce bug.',
		noteJa: '',
		displayOrder: 7,
	},
	{
		code: 'please-confirm-formal',
		situationVi: 'Bạn nhờ xác nhận chính thức qua email/chat công ty',
		situationJa: '正式に確認を依頼する',
		sentenceJa: 'ご確認のほど、よろしくお願いいたします。',
		sentenceVi: 'Rất mong được mọi người xác nhận.',
		reading: 'ごかくにんのほど、よろしくおねがいいたします。',
		clozePart: 'ご確認のほど、よろしくお願いいたします',
		politenessLevel: 'keigo',
		noteVi: 'Câu kết email/chát rất phổ biến.',
		noteJa: 'メール締めの定番表現。',
		displayOrder: 8,
	},
	{
		code: 'merge-after-approval',
		situationVi: 'Bạn nói sẽ merge sau khi được approve',
		situationJa: '承認後にマージする予定を伝える',
		sentenceJa: '承認いただき次第、マージします。',
		sentenceVi: 'Ngay khi được duyệt sẽ merge.',
		reading: 'しょうにんいただきしだい、マージします。',
		clozePart: '承認いただきしだい',
		politenessLevel: 'keigo',
		noteVi: '〜いただき次第 = ngay khi nhận được (từ người trên).',
		noteJa: '',
		displayOrder: 9,
	},
	{
		code: 'standup-blocked',
		situationVi: 'Trong daily standup, bạn báo đang bị block',
		situationJa: 'スタンドアップでブロックされていることを伝える',
		sentenceJa: '現在、外部APIの仕様確認待ちでブロックされています。',
		sentenceVi: 'Hiện đang bị block vì chờ xác nhận spec API bên ngoài.',
		reading: 'げんざい、がいぶエーピーアイのしようかくにんまちでブロックされています。',
		clozePart: 'ブロックされています',
		politenessLevel: 'polite',
		noteVi: 'Block = bị kẹt, không tiến triển được task.',
		noteJa: 'カタカナ語「ブロック」',
		displayOrder: 10,
	},
];

export async function seedSentenceTemplates() {
	console.log('  → Seeding sentence templates (IT)...');

	const specialty = await specialtyRepository.upsertSpecialtyByCode(
		IT_SPECIALTY.code,
		IT_SPECIALTY,
	);

	let created = 0;
	for (const tpl of IT_TEMPLATES) {
		await templateRepository.upsertTemplateBySpecialtyAndCode(
			specialty._id,
			tpl.code,
			{ ...tpl, specialtyId: specialty._id, isActive: true },
		);
		created += 1;
	}

	console.log(`  ✓ Sentence specialty "${specialty.code}" with ${created} templates`);
	return { specialty, templateCount: created };
}

export default seedSentenceTemplates;

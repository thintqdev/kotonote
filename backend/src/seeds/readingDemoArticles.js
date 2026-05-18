/** Dữ liệu demo — khớp slug frontend mock (`readingMock.js`). */

const listMeta = [
	{
		slug: 'r-seasons',
		jlpt: 'N3',
		titleJa: '日本の四季',
		snippetJa:
			'春は桜、夏は祭り。日本では季節の移り変わりを大切にする文化がある……',
		wordCount: 620,
		readingMinutes: 6,
		rating: 4.8,
		imageUrl:
			'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=480&h=300&fit=crop&q=80',
		featured: true,
		displayOrder: 1,
	},
	{
		slug: 'r-myday',
		jlpt: 'N4',
		titleJa: '私の一日',
		snippetJa: '朝六時に起きて、顔を洗います。そのあとで朝ごはんを食べます……',
		wordCount: 410,
		readingMinutes: 5,
		rating: 4.6,
		imageUrl:
			'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=480&h=300&fit=crop&q=80',
		displayOrder: 2,
	},
	{
		slug: 'r-cat',
		jlpt: 'N2',
		titleJa: '猫と暮らす',
		snippetJa: 'うちには猫が二匹います。一匹は白くて、もう一匹は三毛猫です……',
		wordCount: 890,
		readingMinutes: 9,
		rating: 4.9,
		imageUrl:
			'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=480&h=300&fit=crop&q=80',
		displayOrder: 3,
	},
	{
		slug: 'r-train',
		jlpt: 'N3',
		titleJa: '電車で通勤する',
		snippetJa:
			'毎朝、満員電車に乗って会社へ行きます。駅では多くの人が急いでいます……',
		wordCount: 540,
		readingMinutes: 6,
		rating: 4.5,
		imageUrl:
			'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=480&h=300&fit=crop&q=80',
		displayOrder: 4,
	},
	{
		slug: 'r-cafe',
		jlpt: 'N5',
		titleJa: 'カフェで注文する',
		snippetJa: 'すみません、ホットコーヒーを一つお願いします。サイズはMで……',
		wordCount: 220,
		readingMinutes: 3,
		rating: 4.7,
		imageUrl:
			'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=480&h=300&fit=crop&q=80',
		displayOrder: 5,
	},
	{
		slug: 'r-onsen',
		jlpt: 'N1',
		titleJa: '温泉文化について',
		snippetJa:
			'日本の温泉は単なる入浴施設ではなく、地域の歴史や自然と結びついた文化である……',
		wordCount: 1200,
		readingMinutes: 12,
		rating: 4.9,
		imageUrl:
			'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=480&h=300&fit=crop&q=80',
		displayOrder: 6,
	},
	{
		slug: 'r-library',
		jlpt: 'N4',
		titleJa: '図書館の利用',
		snippetJa:
			'図書館では静かにしなければなりません。本を借りるときはカードが必要です……',
		wordCount: 380,
		readingMinutes: 4,
		rating: 4.4,
		imageUrl:
			'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=480&h=300&fit=crop&q=80',
		featured: true,
		displayOrder: 7,
	},
];

const stubBody = (snippet) => ({
	paragraphsJa: [snippet, '（管理者 có thể bổ sung nội dung đầy đủ trong Studio.）'],
	vocabulary: [],
	questions: [],
});

const fullBodies = {
	'r-seasons': {
		paragraphsJa: [
			'日本にははっきりした四季がある。春になると、桜の開花がニュースになり、多くの人がお花見に出かける。公園や川べりは、花びらの下で弁当を広げる人たちでにぎわう。',
			'夏は各地で祭りが行われ、夜空には大きな花火が打ち上げられる。秋は山や庭が紅葉で染まり、冬は静かな雪景色が心を落ち着かせる。',
			'こうした季節の移り変わりは、食べ物や年中行事にも深く関わっている。だからこそ、日本人は四季を大切にしてきたのだろう。',
		],
		vocabulary: [
			{ termJa: '四季（しき）', gloss: { vi: 'bốn mùa', ja: '春夏秋冬のこと' } },
			{ termJa: '花見（はなみ）', gloss: { vi: 'ngắm hoa anh đào, dã ngoại mùa xuân' } },
		],
		questions: [
			{
				questionJa: '筆者が最も強調しているのはどのようなことか。',
				choicesJa: [
					'花火大会の規模について述べている。',
					'四季の変化が文化や生活と結びついていること。',
					'ニュースで桜の開花が報じられる仕組みについて。',
				],
				answerIndex: 1,
				explainPerChoice: {
					ja: ['花火は夏の例。', '正解。', '桜のニュースは導入のみ。'],
					vi: ['Ví dụ mùa hè.', 'Đúng.', 'Không phải luận điểm chính.'],
				},
			},
		],
	},
	'r-myday': {
		paragraphsJa: [
			'私は毎朝六時ごろに起きる。まず顔を洗って、軽くストレッチをする。そのあとでキッチンへ行き、トーストとコーヒーで簡単な朝ごはんを食べる。',
			'八時前には家を出て、バス停へ向かう。バスに乗れば、車窓から街の景色が流れていく。',
			'夕方は買い物をして帰り、夜は本を読んだりテレビを見たりして過ごす。',
		],
		vocabulary: [{ termJa: '朝ごはん（あさごはん）', gloss: { vi: 'bữa sáng' } }],
		questions: [
			{
				questionJa: '筆者が最初にすることとして正しいのはどれか。',
				choicesJa: [
					'すぐにバス停へ行く。',
					'顔を洗ってから軽くストレッチをする。',
					'会社で朝ごはんを食べる。',
				],
				answerIndex: 1,
				explainPerChoice: {
					ja: ['後の行動。', '正解。', '自宅で食べる。'],
					vi: ['Sau đó.', 'Đúng.', 'Ăn ở nhà.'],
				},
			},
		],
	},
};

export const READING_DEMO_ARTICLES = listMeta.map((meta, index) => {
	const body = fullBodies[meta.slug] ?? stubBody(meta.snippetJa);
	return {
		...meta,
		isPublished: true,
		displayOrder: meta.displayOrder ?? index + 1,
		...body,
	};
});

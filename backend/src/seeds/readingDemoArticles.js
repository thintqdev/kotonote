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

const levelArticles = [
	{
		slug: 'r-n5-sunday', jlpt: 'N5', titleJa: '日曜日の買い物',
		snippetJa: '日曜日、ゆきさんはお母さんとスーパーへ行きました。',
		wordCount: 170, readingMinutes: 3, rating: 4.7, displayOrder: 8, featured: true,
		paragraphsJa: [
			'日曜日、ゆきさんはお母さんとスーパーへ行きました。スーパーは家の近くにあります。二人は歩いて行きました。',
			'ゆきさんはりんごを三つと牛乳を一本買いました。お母さんは魚と野菜を買いました。',
			'買い物のあと、二人はパン屋へ行きました。ゆきさんは小さいパンを食べて、家へ帰りました。',
		],
		vocabulary: [
			{ termJa: '近く（ちかく）', gloss: { vi: 'gần, khu vực gần', ja: '遠くない場所' } },
			{ termJa: '買い物（かいもの）', gloss: { vi: 'việc mua sắm', ja: '物を買うこと' } },
		],
		questions: [{
			questionJa: 'ゆきさんは何を三つ買いましたか。',
			choicesJa: ['パン', 'りんご', '魚'], answerIndex: 1,
			explainPerChoice: { ja: ['パンの数は書いていない。', '正解。', '魚はお母さんが買った。'], vi: ['Không nói số bánh mì.', 'Đúng.', 'Mẹ mua cá.'] },
		}],
	},
	{
		slug: 'r-n4-library-card', jlpt: 'N4', titleJa: '図書館で本を借りる',
		snippetJa: '町の図書館では、一人五冊まで本を借りることができます。',
		wordCount: 310, readingMinutes: 4, rating: 4.7, displayOrder: 9,
		paragraphsJa: [
			'町の図書館では、一人五冊まで本を借りることができます。借りる期間は二週間です。初めて利用する人は、住所が分かる物を持って受付へ行きます。',
			'読みたい本が貸し出し中のときは、予約することもできます。本が戻ったら、図書館からメールが来ます。',
			'返す日は図書館が休みでも、入口の横にある箱へ入れれば大丈夫です。ただし、CDは壊れやすいので受付へ返してください。',
		],
		vocabulary: [
			{ termJa: '貸し出し中（かしだしちゅう）', gloss: { vi: 'đang được cho mượn' } },
			{ termJa: '受付（うけつけ）', gloss: { vi: 'quầy tiếp nhận' } },
		],
		questions: [{
			questionJa: '図書館が休みの日に返せない物はどれですか。',
			choicesJa: ['本', 'CD', '雑誌'], answerIndex: 1,
			explainPerChoice: { ja: ['箱に返せる。', '正解。受付へ返す。', '箱に返せる。'], vi: ['Có thể bỏ vào hộp.', 'Đúng, phải trả tại quầy.', 'Có thể bỏ vào hộp.'] },
		}],
	},
	{
		slug: 'r-n3-remote-work', jlpt: 'N3', titleJa: '在宅勤務で変わったこと',
		snippetJa: '在宅勤務を始めて、通勤時間がなくなった一方、仕事と生活の区別が難しくなった。',
		wordCount: 520, readingMinutes: 6, rating: 4.8, displayOrder: 10, featured: true,
		paragraphsJa: [
			'去年から週に三日、家で働くようになった。以前は通勤に往復二時間かかっていたが、その時間を家事や運動に使えるようになった。朝も落ち着いて仕事を始められる。',
			'しかし、良いことばかりではない。家にいると仕事を終えるきっかけがなく、夜までパソコンを見てしまうことがある。また、同僚との短い会話から得られる情報も少なくなった。',
			'そこで私は、仕事を始める時刻と終える時刻を決め、昼休みには必ず外を歩くことにした。在宅勤務を快適にするには、自分で生活のリズムを作る必要があると思う。',
		],
		vocabulary: [
			{ termJa: '往復（おうふく）', gloss: { vi: 'đi và về, khứ hồi' } },
			{ termJa: 'きっかけ', gloss: { vi: 'dịp, nguyên nhân khởi đầu' } },
		],
		questions: [{
			questionJa: '筆者が在宅勤務の問題を減らすためにしていることは何ですか。',
			choicesJa: ['夜まで働く', '勤務時間を決めて昼に外を歩く', '毎日会社へ行く'], answerIndex: 1,
			explainPerChoice: { ja: ['問題そのもの。', '正解。', '週三日は在宅勤務。'], vi: ['Đó chính là vấn đề.', 'Đúng.', 'Ba ngày mỗi tuần làm tại nhà.'] },
		}],
	},
	{
		slug: 'r-n2-food-loss', jlpt: 'N2', titleJa: '食品ロスを減らすには',
		snippetJa: '食べられるにもかかわらず廃棄される食品を減らすには、消費者の判断も問われている。',
		wordCount: 820, readingMinutes: 9, rating: 4.9, displayOrder: 11,
		paragraphsJa: [
			'まだ食べられるにもかかわらず捨てられる食品、いわゆる「食品ロス」が社会的な課題となっている。店側が売れ残りを減らす工夫をするだけでなく、私たち消費者の買い方も見直さなければならない。',
			'例えば、商品棚の奥から期限の長い商品を選ぶ行動は、一見すると合理的に思える。しかし、すぐに食べる予定なら手前の商品でも問題はない。皆が期限の長い物だけを取れば、手前の商品は売れ残り、廃棄につながる。',
			'もちろん、必要以上に買わないことが基本である。ただし、単に我慢を求めるだけでは長続きしない。期限表示の意味を理解し、自分の予定に合わせて選ぶことが、無理なく続けられる対策ではないだろうか。',
		],
		vocabulary: [
			{ termJa: 'にもかかわらず', gloss: { vi: 'mặc dù, bất chấp' } },
			{ termJa: '廃棄（はいき）', gloss: { vi: 'sự vứt bỏ, tiêu hủy' } },
			{ termJa: '見直す（みなおす）', gloss: { vi: 'xem xét lại' } },
		],
		questions: [{
			questionJa: '筆者が最も勧めている行動はどれですか。',
			choicesJa: ['常に期限が最も長い商品を買う', '買い物を完全にやめる', '食べる予定に応じて必要な商品を選ぶ', '店だけに対策を任せる'], answerIndex: 2,
			explainPerChoice: { ja: ['廃棄を増やす場合がある。', 'そのような主張ではない。', '正解。', '消費者の行動も必要。'], vi: ['Có thể làm tăng lãng phí.', 'Không phải lập luận của tác giả.', 'Đúng.', 'Người tiêu dùng cũng phải hành động.'] },
		}],
	},
	{
		slug: 'r-n1-efficiency-paradox', jlpt: 'N1', titleJa: '効率化がもたらす逆説',
		snippetJa: '技術によって作業時間が短縮されても、必ずしも私たちの余暇が増えるとは限らない。',
		wordCount: 1250, readingMinutes: 13, rating: 4.9, displayOrder: 12, featured: true,
		paragraphsJa: [
			'技術の進歩によって一つの作業に要する時間が短縮されれば、私たちの自由な時間は増えるはずだ。ところが現実には、効率化が進むほど忙しさを訴える人も少なくない。この食い違いは、空いた時間がそのまま余暇になるという前提に問題があることを示している。',
			'連絡が瞬時に届くようになると、返答に許される時間まで短くなる。資料を容易に作成できれば、求められる資料の量や質が上がる。つまり、技術は既存の作業を軽減する一方で、これまで存在しなかった期待や仕事を生み出すのである。効率化によって生じた余裕は、しばしば新たな要求によって埋められてしまう。',
			'だからといって、技術を遠ざければよいわけではない。重要なのは、何を速くできるかだけでなく、何のために速くするのかを問い直すことだ。生み出された時間の使い道を意識的に決めない限り、効率化は目的ではなく、際限のない加速そのものになりかねない。',
		],
		vocabulary: [
			{ termJa: '食い違い（くいちがい）', gloss: { vi: 'sự bất nhất, chênh lệch' } },
			{ termJa: '際限がない（さいげんがない）', gloss: { vi: 'không có giới hạn' } },
			{ termJa: '〜になりかねない', gloss: { vi: 'có nguy cơ trở thành…' } },
		],
		questions: [{
			questionJa: '筆者によれば、効率化しても余暇が増えない主な理由は何ですか。',
			choicesJa: ['技術が作業を遅くするから', '空いた時間に新しい期待や仕事が生じるから', '人々が技術を全く使わないから', '資料の質が低下するから'], answerIndex: 1,
			explainPerChoice: { ja: ['反対に作業は速くなる。', '正解。', '本文と異なる。', '要求される質は上がる。'], vi: ['Ngược lại, công việc nhanh hơn.', 'Đúng.', 'Trái với bài.', 'Chất lượng được kỳ vọng cao hơn.'] },
		}],
	},
];

export const READING_DEMO_ARTICLES = [...listMeta, ...levelArticles].map((meta, index) => {
	const body = meta.paragraphsJa
		? {
			paragraphsJa: meta.paragraphsJa,
			vocabulary: meta.vocabulary ?? [],
			questions: meta.questions ?? [],
		}
		: (fullBodies[meta.slug] ?? stubBody(meta.snippetJa));
	return {
		...meta,
		isPublished: true,
		displayOrder: meta.displayOrder ?? index + 1,
		...body,
	};
});

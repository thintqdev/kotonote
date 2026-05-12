import Vocabulary from '../models/Vocabulary.js';
import VocabularyDeck from '../models/VocabularyDeck.js';

/** Tiền tố tiêu đề — xóa cũ trước khi seed lại để không trùng khi chạy nhiều lần */
export const DEMO_VOCAB_TITLE_PREFIX = '[Demo]';

const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const CATEGORIES = ['basic', 'grammar', 'kanji', 'conversation', 'business', 'other'];

const THUMBS = [
	'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=480&h=320&fit=crop&q=75',
	'https://images.unsplash.com/photo-1528164344705-47542687000d?w=480&h=320&fit=crop&q=75',
	'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=480&h=320&fit=crop&q=75',
	'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=480&h=320&fit=crop&q=75',
	'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&h=320&fit=crop&q=75',
];

/**
 * Ngân hàng từ mẫu (xoay vòng nhiều deck, không trùng từ trong cùng một deck).
 */
const WORD_POOL = [
	{ word: '学生', reading: 'がくせい', meaning: 'học sinh, sinh viên', meaningJa: '学校に通う人', example: '私は学生です。', exampleMeaning: 'Tôi là học sinh.', partOfSpeech: 'noun' },
	{ word: '学校', reading: 'がっこう', meaning: 'trường học', meaningJa: '勉強する場所', example: '学校に行きます。', exampleMeaning: 'Tôi đi học.', partOfSpeech: 'noun' },
	{ word: '先生', reading: 'せんせい', meaning: 'giáo viên', meaningJa: '教える人', example: '先生は優しいです。', exampleMeaning: 'Thầy cô rất tốt.', partOfSpeech: 'noun' },
	{ word: '本', reading: 'ほん', meaning: 'sách', meaningJa: '読むもの', example: '本を読みます。', exampleMeaning: 'Tôi đọc sách.', partOfSpeech: 'noun' },
	{ word: '水', reading: 'みず', meaning: 'nước', meaningJa: '飲み物', example: '水を飲みます。', exampleMeaning: 'Tôi uống nước.', partOfSpeech: 'noun' },
	{ word: '食べる', reading: 'たべる', meaning: 'ăn', meaningJa: '食事をする', example: 'ご飯を食べます。', exampleMeaning: 'Tôi ăn cơm.', partOfSpeech: 'verb' },
	{ word: '飲む', reading: 'のむ', meaning: 'uống', meaningJa: '液体を摂る', example: 'お茶を飲みます。', exampleMeaning: 'Tôi uống trà.', partOfSpeech: 'verb' },
	{ word: '行く', reading: 'いく', meaning: 'đi', meaningJa: '移動する', example: '駅へ行きます。', exampleMeaning: 'Tôi đến nhà ga.', partOfSpeech: 'verb' },
	{ word: '来る', reading: 'くる', meaning: 'đến', meaningJa: '近づく', example: '友達が来ます。', exampleMeaning: 'Bạn tôi sẽ đến.', partOfSpeech: 'verb' },
	{ word: '見る', reading: 'みる', meaning: 'xem, nhìn', meaningJa: '目で確認する', example: '映画を見ます。', exampleMeaning: 'Tôi xem phim.', partOfSpeech: 'verb' },
	{ word: '聞く', reading: 'きく', meaning: 'nghe', meaningJa: '耳で感知する', example: '音楽を聞きます。', exampleMeaning: 'Tôi nghe nhạc.', partOfSpeech: 'verb' },
	{ word: '話す', reading: 'はなす', meaning: 'nói, trò chuyện', meaningJa: '言葉を交わす', example: '日本語で話します。', exampleMeaning: 'Tôi nói tiếng Nhật.', partOfSpeech: 'verb' },
	{ word: '読む', reading: 'よむ', meaning: 'đọc', meaningJa: '文字を理解する', example: '新聞を読みます。', exampleMeaning: 'Tôi đọc báo.', partOfSpeech: 'verb' },
	{ word: '書く', reading: 'かく', meaning: 'viết', meaningJa: '文字を残す', example: '手紙を書きます。', exampleMeaning: 'Tôi viết thư.', partOfSpeech: 'verb' },
	{ word: '買う', reading: 'かう', meaning: 'mua', meaningJa: '代金を払って得る', example: 'パンを買います。', exampleMeaning: 'Tôi mua bánh mì.', partOfSpeech: 'verb' },
	{ word: '大きい', reading: 'おおきい', meaning: 'to, lớn', meaningJa: 'サイズが大きい', example: '大きい家です。', exampleMeaning: 'Nhà lớn.', partOfSpeech: 'adjective' },
	{ word: '小さい', reading: 'ちいさい', meaning: 'nhỏ', meaningJa: 'サイズが小さい', example: '小さい犬です。', exampleMeaning: 'Con chó nhỏ.', partOfSpeech: 'adjective' },
	{ word: '新しい', reading: 'あたらしい', meaning: 'mới', meaningJa: 'できたばかり', example: '新しい靴です。', exampleMeaning: 'Đôi giày mới.', partOfSpeech: 'adjective' },
	{ word: '古い', reading: 'ふるい', meaning: 'cũ', meaningJa: '経年した', example: '古い建物です。', exampleMeaning: 'Tòa nhà cũ.', partOfSpeech: 'adjective' },
	{ word: '暑い', reading: 'あつい', meaning: 'nóng (trời)', meaningJa: '気温が高い', example: '今日は暑いです。', exampleMeaning: 'Hôm nay trời nóng.', partOfSpeech: 'adjective' },
	{ word: '寒い', reading: 'さむい', meaning: 'lạnh (trời)', meaningJa: '気温が低い', example: '冬は寒いです。', exampleMeaning: 'Mùa đông lạnh.', partOfSpeech: 'adjective' },
	{ word: '今日', reading: 'きょう', meaning: 'hôm nay', meaningJa: 'この日', example: '今日は日曜日です。', exampleMeaning: 'Hôm nay là chủ nhật.', partOfSpeech: 'noun' },
	{ word: '明日', reading: 'あした', meaning: 'ngày mai', meaningJa: '次の日', example: '明日会いましょう。', exampleMeaning: 'Mai gặp nhé.', partOfSpeech: 'noun' },
	{ word: '昨日', reading: 'きのう', meaning: 'hôm qua', meaningJa: '前の日', example: '昨日雨でした。', exampleMeaning: 'Hôm qua trời mưa.', partOfSpeech: 'noun' },
	{ word: '時間', reading: 'じかん', meaning: 'thời gian', meaningJa: '時の長さ', example: '時間がありません。', exampleMeaning: 'Không còn thời gian.', partOfSpeech: 'noun' },
	{ word: '友達', reading: 'ともだち', meaning: 'bạn bè', meaningJa: '仲良い人', example: '友達と遊びます。', exampleMeaning: 'Tôi chơi với bạn.', partOfSpeech: 'noun' },
	{ word: '家族', reading: 'かぞく', meaning: 'gia đình', meaningJa: '親族の集まり', example: '家族で旅行します。', exampleMeaning: 'Cả nhà đi du lịch.', partOfSpeech: 'noun' },
	{ word: '仕事', reading: 'しごと', meaning: 'công việc', meaningJa: '職業の仕事', example: '仕事が忙しいです。', exampleMeaning: 'Công việc bận.', partOfSpeech: 'noun' },
	{ word: '会社', reading: 'かいしゃ', meaning: 'công ty', meaningJa: '勤務先', example: '会社へ行きます。', exampleMeaning: 'Tôi đi công ty.', partOfSpeech: 'noun' },
	{ word: '電車', reading: 'でんしゃ', meaning: 'tàu điện', meaningJa: '鉄道の車両', example: '電車に乗ります。', exampleMeaning: 'Tôi lên tàu.', partOfSpeech: 'noun' },
	{ word: '駅', reading: 'えき', meaning: 'nhà ga', meaningJa: '列車が止まる所', example: '駅で待ちます。', exampleMeaning: 'Tôi đợi ở ga.', partOfSpeech: 'noun' },
	{ word: '家', reading: 'いえ', meaning: 'nhà, gia đình', meaningJa: '住む建物', example: '家に帰ります。', exampleMeaning: 'Tôi về nhà.', partOfSpeech: 'noun' },
	{ word: '部屋', reading: 'へや', meaning: 'căn phòng', meaningJa: '建物内の空間', example: '部屋を掃除します。', exampleMeaning: 'Tôi dọn phòng.', partOfSpeech: 'noun' },
	{ word: 'ドア', reading: 'ドア', meaning: 'cửa', meaningJa: '出入口', example: 'ドアを閉めます。', exampleMeaning: 'Tôi đóng cửa.', partOfSpeech: 'noun' },
	{ word: '窓', reading: 'まど', meaning: 'cửa sổ', meaningJa: '光が入る開口', example: '窓を開けます。', exampleMeaning: 'Tôi mở cửa sổ.', partOfSpeech: 'noun' },
	{ word: '机', reading: 'つくえ', meaning: 'bàn (học)', meaningJa: '仕事用の台', example: '机の上に本があります。', exampleMeaning: 'Trên bàn có sách.', partOfSpeech: 'noun' },
	{ word: '椅子', reading: 'いす', meaning: 'ghế', meaningJa: '座る家具', example: '椅子に座ります。', exampleMeaning: 'Tôi ngồi ghế.', partOfSpeech: 'noun' },
	{ word: '電気', reading: 'でんき', meaning: 'điện, đèn', meaningJa: '電力・照明', example: '電気を消します。', exampleMeaning: 'Tôi tắt đèn.', partOfSpeech: 'noun' },
	{ word: '朝', reading: 'あさ', meaning: 'buổi sáng', meaningJa: '一日の始まり', example: '朝ごはんを食べます。', exampleMeaning: 'Tôi ăn sáng.', partOfSpeech: 'noun' },
	{ word: '晩', reading: 'ばん', meaning: 'buổi tối', meaningJa: '一日の終わり', example: '晩ご飯は何ですか。', exampleMeaning: 'Tối ăn gì?', partOfSpeech: 'noun' },
	{ word: '好き', reading: 'すき', meaning: 'thích', meaningJa: '好ましい', example: '音楽が好きです。', exampleMeaning: 'Tôi thích nhạc.', partOfSpeech: 'adjective' },
	{ word: '上手', reading: 'じょうず', meaning: 'giỏi, khéo', meaningJa: '技術が高い', example: '絵が上手です。', exampleMeaning: 'Vẽ giỏi.', partOfSpeech: 'adjective' },
	{ word: '下手', reading: 'へた', meaning: 'kém, vụng', meaningJa: '技術が低い', example: '料理が下手です。', exampleMeaning: 'Nấu ăn kém.', partOfSpeech: 'adjective' },
	{ word: '速い', reading: 'はやい', meaning: 'nhanh', meaningJa: 'スピードが高い', example: '電車は速いです。', exampleMeaning: 'Tàu nhanh.', partOfSpeech: 'adjective' },
	{ word: '遅い', reading: 'おそい', meaning: 'chậm', meaningJa: 'スピードが低い', example: 'バスは遅いです。', exampleMeaning: 'Xe buýt chậm.', partOfSpeech: 'adjective' },
	{ word: '多い', reading: 'おおい', meaning: 'nhiều', meaningJa: '数量が大きい', example: '人が多いです。', exampleMeaning: 'Đông người.', partOfSpeech: 'adjective' },
	{ word: '少ない', reading: 'すくない', meaning: 'ít', meaningJa: '数量が小さい', example: 'お金が少ないです。', exampleMeaning: 'Tiền ít.', partOfSpeech: 'adjective' },
	{ word: '町', reading: 'まち', meaning: 'thị trấn, phố', meaningJa: '人が集まる地域', example: '町を歩きます。', exampleMeaning: 'Tôi đi dạo phố.', partOfSpeech: 'noun' },
	{ word: '国', reading: 'くに', meaning: 'đất nước', meaningJa: '主権を持つ地域', example: '日本は島国です。', exampleMeaning: 'Nhật là quốc đảo.', partOfSpeech: 'noun' },
	{ word: '天気', reading: 'てんき', meaning: 'thời tiết', meaningJa: '空の状態', example: '天気がいいです。', exampleMeaning: 'Trời đẹp.', partOfSpeech: 'noun' },
	{ word: '雨', reading: 'あめ', meaning: 'mưa', meaningJa: '降水', example: '雨が降っています。', exampleMeaning: 'Trời đang mưa.', partOfSpeech: 'noun' },
	{ word: '雪', reading: 'ゆき', meaning: 'tuyết', meaningJa: '冬の降水', example: '雪が積もりました。', exampleMeaning: 'Tuyết tích tụ.', partOfSpeech: 'noun' },
	{ word: '風', reading: 'かぜ', meaning: 'gió / cảm cúm', meaningJa: '空気の流れ', example: '風が強いです。', exampleMeaning: 'Gió mạnh.', partOfSpeech: 'noun' },
	{ word: '海', reading: 'うみ', meaning: 'biển', meaningJa: '塩水の広がり', example: '海で泳ぎます。', exampleMeaning: 'Tôi bơi ở biển.', partOfSpeech: 'noun' },
	{ word: '山', reading: 'やま', meaning: 'núi', meaningJa: '高い地形', example: '山に登ります。', exampleMeaning: 'Tôi leo núi.', partOfSpeech: 'noun' },
	{ word: '川', reading: 'かわ', meaning: 'sông', meaningJa: '流れる水', example: '川のそばを歩きます。', exampleMeaning: 'Tôi đi dọc sông.', partOfSpeech: 'noun' },
	{ word: '木', reading: 'き', meaning: 'cây, gỗ', meaningJa: '植物の幹', example: '木の下で休みます。', exampleMeaning: 'Nghỉ dưới gốc cây.', partOfSpeech: 'noun' },
	{ word: '花', reading: 'はな', meaning: 'hoa', meaningJa: '植物の花', example: '花を買います。', exampleMeaning: 'Tôi mua hoa.', partOfSpeech: 'noun' },
	{ word: '赤い', reading: 'あかい', meaning: 'màu đỏ', meaningJa: '色の名前', example: '赤いりんごです。', exampleMeaning: 'Táo đỏ.', partOfSpeech: 'adjective' },
	{ word: '青い', reading: 'あおい', meaning: 'màu xanh lam', meaningJa: '色の名前', example: '青い空です。', exampleMeaning: 'Trời xanh.', partOfSpeech: 'adjective' },
	{ word: '白い', reading: 'しろい', meaning: 'màu trắng', meaningJa: '色の名前', example: '白い雲です。', exampleMeaning: 'Mây trắng.', partOfSpeech: 'adjective' },
	{ word: '黒い', reading: 'くろい', meaning: 'màu đen', meaningJa: '色の名前', example: '黒い猫です。', exampleMeaning: 'Mèo đen.', partOfSpeech: 'adjective' },
	{ word: '駅前', reading: 'えきまえ', meaning: 'khu trước nhà ga', meaningJa: '駅の手前', example: '駅前で会いましょう。', exampleMeaning: 'Gặp trước ga nhé.', partOfSpeech: 'noun' },
	{ word: '空港', reading: 'くうこう', meaning: 'sân bay', meaningJa: '飛行機が発着する所', example: '空港へ向かいます。', exampleMeaning: 'Tôi đi sân bay.', partOfSpeech: 'noun' },
	{ word: '地図', reading: 'ちず', meaning: 'bản đồ', meaningJa: '位置の図', example: '地図を見ます。', exampleMeaning: 'Tôi xem bản đồ.', partOfSpeech: 'noun' },
	{ word: '切符', reading: 'きっぷ', meaning: 'vé', meaningJa: '乗車券', example: '切符を買います。', exampleMeaning: 'Tôi mua vé.', partOfSpeech: 'noun' },
	{ word: 'お金', reading: 'おかね', meaning: 'tiền', meaningJa: '通貨', example: 'お金を払います。', exampleMeaning: 'Tôi trả tiền.', partOfSpeech: 'noun' },
	{ word: '銀行', reading: 'ぎんこう', meaning: 'ngân hàng', meaningJa: '金融機関', example: '銀行へ行きます。', exampleMeaning: 'Tôi đến ngân hàng.', partOfSpeech: 'noun' },
	{ word: '病院', reading: 'びょういん', meaning: 'bệnh viện', meaningJa: '医療の施設', example: '病院に行きます。', exampleMeaning: 'Tôi đến bệnh viện.', partOfSpeech: 'noun' },
	{ word: '薬', reading: 'くすり', meaning: 'thuốc', meaningJa: '治療のための物', example: '薬を飲みます。', exampleMeaning: 'Tôi uống thuốc.', partOfSpeech: 'noun' },
	{ word: '運動', reading: 'うんどう', meaning: 'vận động, thể dục', meaningJa: '体を動かす', example: '運動します。', exampleMeaning: 'Tôi tập thể dục.', partOfSpeech: 'noun' },
	{ word: '寝る', reading: 'ねる', meaning: 'ngủ', meaningJa: '眠る', example: '早く寝ます。', exampleMeaning: 'Tôi ngủ sớm.', partOfSpeech: 'verb' },
	{ word: '起きる', reading: 'おきる', meaning: 'thức dậy', meaningJa: '眠りから覚める', example: '六時に起きます。', exampleMeaning: 'Tôi dậy lúc 6 giờ.', partOfSpeech: 'verb' },
	{ word: '働く', reading: 'はたらく', meaning: 'làm việc', meaningJa: '職業に従事', example: '会社で働きます。', exampleMeaning: 'Tôi làm ở công ty.', partOfSpeech: 'verb' },
	{ word: '休む', reading: 'やすむ', meaning: 'nghỉ', meaningJa: '労を止める', example: '日曜日に休みます。', exampleMeaning: 'Chủ nhật tôi nghỉ.', partOfSpeech: 'verb' },
	{ word: '教える', reading: 'おしえる', meaning: 'dạy, chỉ bảo', meaningJa: '知識を伝える', example: '先生が教えます。', exampleMeaning: 'Giáo viên dạy.', partOfSpeech: 'verb' },
	{ word: '習う', reading: 'ならう', meaning: 'học (từ người khác)', meaningJa: '技を身につける', example: 'ピアノを習います。', exampleMeaning: 'Tôi học piano.', partOfSpeech: 'verb' },
	{ word: '分かる', reading: 'わかる', meaning: 'hiểu', meaningJa: '理解する', example: '意味が分かります。', exampleMeaning: 'Tôi hiểu nghĩa.', partOfSpeech: 'verb' },
	{ word: '忘れる', reading: 'わすれる', meaning: 'quên', meaningJa: '記憶から失う', example: '名前を忘れました。', exampleMeaning: 'Tôi quên tên.', partOfSpeech: 'verb' },
	{ word: '思う', reading: 'おもう', meaning: 'nghĩ, cảm thấy', meaningJa: '心に浮かべる', example: 'そう思います。', exampleMeaning: 'Tôi nghĩ vậy.', partOfSpeech: 'verb' },
	{ word: '知る', reading: 'しる', meaning: 'biết', meaningJa: '情報を得る', example: '結果を知ります。', exampleMeaning: 'Tôi biết kết quả.', partOfSpeech: 'verb' },
	{ word: '会う', reading: 'あう', meaning: 'gặp', meaningJa: '顔を合わせる', example: '友達に会います。', exampleMeaning: 'Tôi gặp bạn.', partOfSpeech: 'verb' },
	{ word: '待つ', reading: 'まつ', meaning: 'chờ', meaningJa: '時間を過ごす', example: 'バスを待ちます。', exampleMeaning: 'Tôi chờ xe buýt.', partOfSpeech: 'verb' },
	{ word: '送る', reading: 'おくる', meaning: 'gửi, tiễn', meaningJa: '物や人を移す', example: '手紙を送ります。', exampleMeaning: 'Tôi gửi thư.', partOfSpeech: 'verb' },
	{ word: 'もらう', reading: 'もらう', meaning: 'nhận', meaningJa: '他者から得る', example: 'プレゼントをもらいます。', exampleMeaning: 'Tôi nhận quà.', partOfSpeech: 'verb' },
	{ word: 'あげる', reading: 'あげる', meaning: 'cho, tặng', meaningJa: '他者に渡す', example: '花をあげます。', exampleMeaning: 'Tôi tặng hoa.', partOfSpeech: 'verb' },
	{ word: 'くれる', reading: 'くれる', meaning: 'cho (tôi)', meaningJa: '話し手側へ与える', example: '先生が本をくれました。', exampleMeaning: 'Thầy cho tôi sách.', partOfSpeech: 'verb' },
	{ word: '借りる', reading: 'かりる', meaning: 'mượn', meaningJa: '返す前提で得る', example: '本を借ります。', exampleMeaning: 'Tôi mượn sách.', partOfSpeech: 'verb' },
	{ word: '貸す', reading: 'かす', meaning: 'cho mượn', meaningJa: '返却を期待して渡す', example: '傘を貸します。', exampleMeaning: 'Tôi cho mượn ô.', partOfSpeech: 'verb' },
	{ word: '開ける', reading: 'あける', meaning: 'mở', meaningJa: '閉じたものを開く', example: '窓を開けます。', exampleMeaning: 'Tôi mở cửa sổ.', partOfSpeech: 'verb' },
	{ word: '閉める', reading: 'しめる', meaning: 'đóng', meaningJa: '開いたものを閉じる', example: 'ドアを閉めます。', exampleMeaning: 'Tôi đóng cửa.', partOfSpeech: 'verb' },
	{ word: '入る', reading: 'はいる', meaning: 'vào', meaningJa: '中へ移動', example: '部屋に入ります。', exampleMeaning: 'Tôi vào phòng.', partOfSpeech: 'verb' },
	{ word: '出る', reading: 'でる', meaning: 'ra, xuất hiện', meaningJa: '外へ移動', example: '家を出ます。', exampleMeaning: 'Tôi ra khỏi nhà.', partOfSpeech: 'verb' },
	{ word: '座る', reading: 'すわる', meaning: 'ngồi', meaningJa: '腰を下ろす', example: '椅子に座ります。', exampleMeaning: 'Tôi ngồi ghế.', partOfSpeech: 'verb' },
	{ word: '立つ', reading: 'たつ', meaning: 'đứng', meaningJa: '足で支える', example: 'バス停で立ちます。', exampleMeaning: 'Tôi đứng ở trạm xe.', partOfSpeech: 'verb' },
	{ word: '走る', reading: 'はしる', meaning: 'chạy', meaningJa: '速く歩く', example: '公園を走ります。', exampleMeaning: 'Tôi chạy trong công viên.', partOfSpeech: 'verb' },
	{ word: '歩く', reading: 'あるく', meaning: 'đi bộ', meaningJa: '足で進む', example: '学校まで歩きます。', exampleMeaning: 'Tôi đi bộ đến trường.', partOfSpeech: 'verb' },
	{ word: '乗る', reading: 'のる', meaning: 'lên (xe)', meaningJa: '乗り物に上がる', example: 'バスに乗ります。', exampleMeaning: 'Tôi lên xe buýt.', partOfSpeech: 'verb' },
	{ word: '降りる', reading: 'おりる', meaning: 'xuống (xe)', meaningJa: '乗り物から下りる', example: '次の駅で降ります。', exampleMeaning: 'Tôi xuống ga sau.', partOfSpeech: 'verb' },
	{ word: '使う', reading: 'つかう', meaning: 'dùng', meaningJa: '道具を用いる', example: 'パソコンを使います。', exampleMeaning: 'Tôi dùng máy tính.', partOfSpeech: 'verb' },
	{ word: '作る', reading: 'つくる', meaning: 'làm, chế tạo', meaningJa: '新しく生み出す', example: '料理を作ります。', exampleMeaning: 'Tôi nấu món ăn.', partOfSpeech: 'verb' },
	{ word: '始まる', reading: 'はじまる', meaning: 'bắt đầu', meaningJa: '起こり始める', example: '授業が始まります。', exampleMeaning: 'Giờ học bắt đầu.', partOfSpeech: 'verb' },
	{ word: '終わる', reading: 'おわる', meaning: 'kết thúc', meaningJa: '完結する', example: '映画が終わります。', exampleMeaning: 'Phim kết thúc.', partOfSpeech: 'verb' },
	{ word: '忙しい', reading: 'いそがしい', meaning: 'bận', meaningJa: '時間が足りない', example: '最近忙しいです。', exampleMeaning: 'Dạo này bận.', partOfSpeech: 'adjective' },
	{ word: '暇', reading: 'ひま', meaning: 'rảnh, nhàn rỗi', meaningJa: '空いた時間', example: '今日は暇です。', exampleMeaning: 'Hôm nay rảnh.', partOfSpeech: 'noun' },
	{ word: '簡単', reading: 'かんたん', meaning: 'đơn giản', meaningJa: '難しくない', example: 'この問題は簡単です。', exampleMeaning: 'Bài này dễ.', partOfSpeech: 'adjective' },
	{ word: '難しい', reading: 'むずかしい', meaning: 'khó', meaningJa: '理解しにくい', example: '漢字は難しいです。', exampleMeaning: 'Kanji khó.', partOfSpeech: 'adjective' },
	{ word: '便利', reading: 'べんり', meaning: 'tiện lợi', meaningJa: '使いやすい', example: 'スマホは便利です。', exampleMeaning: 'Điện thoại tiện.', partOfSpeech: 'adjective' },
	{ word: '不便', reading: 'ふべん', meaning: 'bất tiện', meaningJa: '使いにくい', example: 'この道は不便です。', exampleMeaning: 'Con đường bất tiện.', partOfSpeech: 'adjective' },
	{ word: '安全', reading: 'あんぜん', meaning: 'an toàn', meaningJa: '危険がない', example: '安全運転です。', exampleMeaning: 'Lái xe an toàn.', partOfSpeech: 'adjective' },
	{ word: '危険', reading: 'きけん', meaning: 'nguy hiểm', meaningJa: '害がありそう', example: '危険です。', exampleMeaning: 'Nguy hiểm.', partOfSpeech: 'noun' },
	{ word: '静か', reading: 'しずか', meaning: 'yên tĩnh', meaningJa: '音が少ない', example: '図書館は静かです。', exampleMeaning: 'Thư viện yên tĩnh.', partOfSpeech: 'adjective' },
	{ word: '賑やか', reading: 'にぎやか', meaning: 'nhộn nhịp', meaningJa: '人が多い', example: '街は賑やかです。', exampleMeaning: 'Phố nhộn nhịp.', partOfSpeech: 'adjective' },
	{ word: '親切', reading: 'しんせつ', meaning: 'tốt bụng', meaningJa: '思いやりがある', example: '親切な人です。', exampleMeaning: 'Người tốt bụng.', partOfSpeech: 'adjective' },
	{ word: '元気', reading: 'げんき', meaning: 'khỏe mạnh', meaningJa: '体調が良い', example: '元気ですか。', exampleMeaning: 'Bạn khỏe không?', partOfSpeech: 'adjective' },
	{ word: '大丈夫', reading: 'だいじょうぶ', meaning: 'ổn, không sao', meaningJa: '問題ない', example: '大丈夫です。', exampleMeaning: 'Không sao.', partOfSpeech: 'adjective' },
	{ word: '問題', reading: 'もんだい', meaning: 'vấn đề', meaningJa: '解くべき課題', example: '問題を解きます。', exampleMeaning: 'Tôi giải bài.', partOfSpeech: 'noun' },
	{ word: '答え', reading: 'こたえ', meaning: 'câu trả lời', meaningJa: '問いへの返事', example: '答えを書きます。', exampleMeaning: 'Tôi viết đáp án.', partOfSpeech: 'noun' },
	{ word: '質問', reading: 'しつもん', meaning: 'câu hỏi', meaningJa: '聞きたいこと', example: '質問があります。', exampleMeaning: 'Tôi có câu hỏi.', partOfSpeech: 'noun' },
	{ word: '説明', reading: 'せつめい', meaning: 'giải thích', meaningJa: '分かりやすく伝える', example: '説明します。', exampleMeaning: 'Tôi giải thích.', partOfSpeech: 'noun' },
	{ word: '練習', reading: 'れんしゅう', meaning: 'luyện tập', meaningJa: '繰り返して身につける', example: '練習が大切です。', exampleMeaning: 'Luyện tập quan trọng.', partOfSpeech: 'noun' },
	{ word: '試験', reading: 'しけん', meaning: 'kỳ thi', meaningJa: '学力の検査', example: '試験があります。', exampleMeaning: 'Có kỳ thi.', partOfSpeech: 'noun' },
	{ word: '宿題', reading: 'しゅくだい', meaning: 'bài tập về nhà', meaningJa: '家でする課題', example: '宿題をします。', exampleMeaning: 'Tôi làm bài tập.', partOfSpeech: 'noun' },
	{ word: '鉛筆', reading: 'えんぴつ', meaning: 'bút chì', meaningJa: '書く道具', example: '鉛筆で書きます。', exampleMeaning: 'Tôi viết bút chì.', partOfSpeech: 'noun' },
	{ word: '消しゴム', reading: 'けしゴム', meaning: 'tẩy', meaningJa: '字を消す道具', example: '消しゴムを使います。', exampleMeaning: 'Tôi dùng tẩy.', partOfSpeech: 'noun' },
	{ word: '辞書', reading: 'じしょ', meaning: 'từ điển', meaningJa: '語の意味を調べる本', example: '辞書を引きます。', exampleMeaning: 'Tô tra từ điển.', partOfSpeech: 'noun' },
	{ word: 'ノート', reading: 'ノート', meaning: 'vở ghi', meaningJa: 'メモ用紙の綴り', example: 'ノートに書きます。', exampleMeaning: 'Tôi ghi vào vở.', partOfSpeech: 'noun' },
	{ word: '教室', reading: 'きょうしつ', meaning: 'lớp học', meaningJa: '授業の部屋', example: '教室に入ります。', exampleMeaning: 'Tôi vào lớp.', partOfSpeech: 'noun' },
	{ word: '廊下', reading: 'ろうか', meaning: 'hành lang', meaningJa: '建物の通路', example: '廊下を歩きます。', exampleMeaning: 'Tôi đi hành lang.', partOfSpeech: 'noun' },
	{ word: '階段', reading: 'かいだん', meaning: 'cầu thang', meaningJa: '上下の段', example: '階段を上がります。', exampleMeaning: 'Tôi leo cầu thang.', partOfSpeech: 'noun' },
	{ word: 'エレベーター', reading: 'エレベーター', meaning: 'thang máy', meaningJa: '昇降機', example: 'エレベーターに乗ります。', exampleMeaning: 'Tôi đi thang máy.', partOfSpeech: 'noun' },
	{ word: 'エスカレーター', reading: 'エスカレーター', meaning: 'thang cuốn', meaningJa: '動く階段', example: 'エスカレーターを使います。', exampleMeaning: 'Tôi dùng thang cuốn.', partOfSpeech: 'noun' },
	{ word: '信号', reading: 'しんごう', meaning: 'đèn giao thông', meaningJa: '交通の合図', example: '信号を待ちます。', exampleMeaning: 'Tôi chờ đèn.', partOfSpeech: 'noun' },
	{ word: '橋', reading: 'はし', meaning: 'cầu', meaningJa: '川をまたぐ構造物', example: '橋を渡ります。', exampleMeaning: 'Tôi qua cầu.', partOfSpeech: 'noun' },
	{ word: '公園', reading: 'こうえん', meaning: 'công viên', meaningJa: '市民の緑地', example: '公園で散歩します。', exampleMeaning: 'Tôi dạo công viên.', partOfSpeech: 'noun' },
	{ word: 'デパート', reading: 'デパート', meaning: 'cửa hàng bách hóa', meaningJa: '大型小売店', example: 'デパートへ行きます。', exampleMeaning: 'Tôi đi siêu thị.', partOfSpeech: 'noun' },
	{ word: 'スーパー', reading: 'スーパー', meaning: 'siêu thị thực phẩm', meaningJa: '食品中心の店', example: 'スーパーで買い物します。', exampleMeaning: 'Tôi mua đồ ở siêu thị.', partOfSpeech: 'noun' },
	{ word: 'レストラン', reading: 'レストラン', meaning: 'nhà hàng', meaningJa: '食事の店', example: 'レストランで食べます。', exampleMeaning: 'Tôi ăn ở nhà hàng.', partOfSpeech: 'noun' },
	{ word: 'コーヒー', reading: 'コーヒー', meaning: 'cà phê', meaningJa: '飲み物', example: 'コーヒーを飲みます。', exampleMeaning: 'Tôi uống cà phê.', partOfSpeech: 'noun' },
	{ word: 'お茶', reading: 'おちゃ', meaning: 'trà', meaningJa: '茶葉の飲み物', example: 'お茶をいれます。', exampleMeaning: 'Tôi pha trà.', partOfSpeech: 'noun' },
	{ word: 'パン', reading: 'パン', meaning: 'bánh mì', meaningJa: '小麦粉の焼き物', example: 'パンを食べます。', exampleMeaning: 'Tôi ăn bánh mì.', partOfSpeech: 'noun' },
	{ word: 'ご飯', reading: 'ごはん', meaning: 'cơm / bữa ăn', meaningJa: '米の食事', example: 'ご飯を炊きます。', exampleMeaning: 'Tôi nấu cơm.', partOfSpeech: 'noun' },
	{ word: '肉', reading: 'にく', meaning: 'thịt', meaningJa: '動物の食肉', example: '肉を買います。', exampleMeaning: 'Tôi mua thịt.', partOfSpeech: 'noun' },
	{ word: '魚', reading: 'さかな', meaning: 'cá (thực phẩm)', meaningJa: '水産物', example: '魚を焼きます。', exampleMeaning: 'Tôi nướng cá.', partOfSpeech: 'noun' },
	{ word: '野菜', reading: 'やさい', meaning: 'rau', meaningJa: '植物性食材', example: '野菜を切ります。', exampleMeaning: 'Tôi thái rau.', partOfSpeech: 'noun' },
	{ word: '果物', reading: 'くだもの', meaning: 'hoa quả', meaningJa: '甘い植物の実', example: '果物が好きです。', exampleMeaning: 'Tôi thích trái cây.', partOfSpeech: 'noun' },
	{ word: '卵', reading: 'たまご', meaning: 'trứng', meaningJa: '鶏の卵', example: '卵を割ります。', exampleMeaning: 'Tôi đập trứng.', partOfSpeech: 'noun' },
	{ word: '牛乳', reading: 'ぎゅうにゅう', meaning: 'sữa bò', meaningJa: '乳飲料', example: '牛乳を飲みます。', exampleMeaning: 'Tôi uống sữa.', partOfSpeech: 'noun' },
	{ word: '砂糖', reading: 'さとう', meaning: 'đường', meaningJa: '甘味料', example: '砂糖を入れます。', exampleMeaning: 'Tôi cho đường.', partOfSpeech: 'noun' },
	{ word: '塩', reading: 'しお', meaning: 'muối', meaningJa: '調味料', example: '塩を少し入れます。', exampleMeaning: 'Tôi cho ít muối.', partOfSpeech: 'noun' },
	{ word: '油', reading: 'あぶら', meaning: 'dầu mỡ', meaningJa: '調理用油', example: '油で炒めます。', exampleMeaning: 'Tôi xào bằng dầu.', partOfSpeech: 'noun' },
	{ word: '皿', reading: 'さら', meaning: 'đĩa', meaningJa: '食器', example: '皿を洗います。', exampleMeaning: 'Tôi rửa đĩa.', partOfSpeech: 'noun' },
	{ word: 'コップ', reading: 'コップ', meaning: 'cốc', meaningJa: '飲み物用', example: 'コップに水を入れます。', exampleMeaning: 'Tôi rót nước vào cốc.', partOfSpeech: 'noun' },
	{ word: '箸', reading: 'はし', meaning: 'đũa', meaningJa: '食事用具', example: '箸で食べます。', exampleMeaning: 'Tôi ăn bằng đũa.', partOfSpeech: 'noun' },
	{ word: 'スプーン', reading: 'スプーン', meaning: 'thìa', meaningJa: '食事用具', example: 'スプーンを使います。', exampleMeaning: 'Tôi dùng thìa.', partOfSpeech: 'noun' },
	{ word: 'フォーク', reading: 'フォーク', meaning: 'nĩa', meaningJa: '食事用具', example: 'フォークで食べます。', exampleMeaning: 'Tôi ăn bằng nĩa.', partOfSpeech: 'noun' },
	{ word: 'ナイフ', reading: 'ナイフ', meaning: 'dao', meaningJa: '切る道具', example: 'ナイフで切ります。', exampleMeaning: 'Tôi cắt bằng dao.', partOfSpeech: 'noun' },
	{ word: '冷蔵庫', reading: 'れいぞうこ', meaning: 'tủ lạnh', meaningJa: '食品を冷やす箱', example: '冷蔵庫に入れます。', exampleMeaning: 'Tôi cho vào tủ lạnh.', partOfSpeech: 'noun' },
	{ word: '洗濯', reading: 'せんたく', meaning: 'giặt giũ', meaningJa: '衣類を洗う', example: '洗濯をします。', exampleMeaning: 'Tôi giặt đồ.', partOfSpeech: 'noun' },
	{ word: '掃除', reading: 'そうじ', meaning: 'dọn dẹp', meaningJa: '汚れを取る', example: '掃除を手伝います。', exampleMeaning: 'Tôi giúp dọn.', partOfSpeech: 'noun' },
	{ word: 'ゴミ', reading: 'ごみ', meaning: 'rác', meaningJa: '不要物', example: 'ゴミを出します。', exampleMeaning: 'Tôi đổ rác.', partOfSpeech: 'noun' },
	{ word: '箱', reading: 'はこ', meaning: 'hộp, thùng', meaningJa: '物を入れる容器', example: '箱に詰めます。', exampleMeaning: 'Tôi cho vào hộp.', partOfSpeech: 'noun' },
	{ word: '袋', reading: 'ふくろ', meaning: 'túi, bao', meaningJa: '柔らかい容器', example: '袋を持ちます。', exampleMeaning: 'Tôi cầm túi.', partOfSpeech: 'noun' },
	{ word: '財布', reading: 'さいふ', meaning: 'ví tiền', meaningJa: '金を入れる物', example: '財布を忘れました。', exampleMeaning: 'Tôi quên ví.', partOfSpeech: 'noun' },
	{ word: '鍵', reading: 'かぎ', meaning: 'chìa khóa', meaningJa: '施錠の道具', example: '鍵をかけます。', exampleMeaning: 'Tôi khóa cửa.', partOfSpeech: 'noun' },
	{ word: '時計', reading: 'とけい', meaning: 'đồng hồ', meaningJa: '時間を示す', example: '時計を見ます。', exampleMeaning: 'Tôi xem đồng hồ.', partOfSpeech: 'noun' },
	{ word: 'カレンダー', reading: 'カレンダー', meaning: 'lịch', meaningJa: '日付の表', example: 'カレンダーを確認します。', exampleMeaning: 'Tôi xem lịch.', partOfSpeech: 'noun' },
	{ word: '写真', reading: 'しゃしん', meaning: 'ảnh', meaningJa: '画像の記録', example: '写真を撮ります。', exampleMeaning: 'Tôi chụp ảnh.', partOfSpeech: 'noun' },
	{ word: '映画', reading: 'えいが', meaning: 'phim', meaningJa: '映像作品', example: '映画を見に行きます。', exampleMeaning: 'Tôi đi xem phim.', partOfSpeech: 'noun' },
	{ word: '音楽', reading: 'おんがく', meaning: 'âm nhạc', meaningJa: '聴く芸術', example: '音楽を聴きます。', exampleMeaning: 'Tôi nghe nhạc.', partOfSpeech: 'noun' },
	{ word: '歌', reading: 'うた', meaning: 'bài hát', meaningJa: '旋律と言葉', example: '歌を歌います。', exampleMeaning: 'Tôi hát.', partOfSpeech: 'noun' },
	{ word: 'スポーツ', reading: 'スポーツ', meaning: 'thể thao', meaningJa: '身体を鍛える競技', example: 'スポーツをします。', exampleMeaning: 'Tôi chơi thể thao.', partOfSpeech: 'noun' },
	{ word: 'サッカー', reading: 'サッカー', meaning: 'bóng đá', meaningJa: '球技', example: 'サッカーをします。', exampleMeaning: 'Tôi đá bóng.', partOfSpeech: 'noun' },
	{ word: '野球', reading: 'やきゅう', meaning: 'bóng chày', meaningJa: '球技', example: '野球が好きです。', exampleMeaning: 'Tôi thích bóng chày.', partOfSpeech: 'noun' },
	{ word: '泳ぐ', reading: 'およぐ', meaning: 'bơi', meaningJa: '水中を進む', example: 'プールで泳ぎます。', exampleMeaning: 'Tôi bơi ở hồ.', partOfSpeech: 'verb' },
	{ word: '遊ぶ', reading: 'あそぶ', meaning: 'chơi', meaningJa: '楽しむ', example: '公園で遊びます。', exampleMeaning: 'Tôi chơi ở công viên.', partOfSpeech: 'verb' },
	{ word: '笑う', reading: 'わらう', meaning: 'cười', meaningJa: '声を出して喜ぶ', example: 'よく笑います。', exampleMeaning: 'Tôi hay cười.', partOfSpeech: 'verb' },
	{ word: '泣く', reading: 'なく', meaning: 'khóc', meaningJa: '涙を流す', example: '赤ちゃんが泣きます。', exampleMeaning: 'Em bé khóc.', partOfSpeech: 'verb' },
	{ word: '怒る', reading: 'おこる', meaning: 'tức giận', meaningJa: '感情が高ぶる', example: 'あまり怒りません。', exampleMeaning: 'Tôi ít khi giận.', partOfSpeech: 'verb' },
	{ word: '心配', reading: 'しんぱい', meaning: 'lo lắng', meaningJa: '不安になる', example: '心配しないでください。', exampleMeaning: 'Đừng lo.', partOfSpeech: 'noun' },
	{ word: '安心', reading: 'あんしん', meaning: 'yên tâm', meaningJa: '不安がない', example: '安心しました。', exampleMeaning: 'Tôi yên tâm rồi.', partOfSpeech: 'noun' },
	{ word: '準備', reading: 'じゅんび', meaning: 'chuẩn bị', meaningJa: '事前の支度', example: '準備をします。', exampleMeaning: 'Tôi chuẩn bị.', partOfSpeech: 'noun' },
	{ word: '予約', reading: 'よやく', meaning: 'đặt chỗ', meaningJa: '事前の取り決め', example: 'レストランを予約します。', exampleMeaning: 'Tôi đặt bàn nhà hàng.', partOfSpeech: 'noun' },
	{ word: '招待', reading: 'しょうたい', meaning: 'mời', meaningJa: '来てもらう依頼', example: 'パーティーに招待します。', exampleMeaning: 'Tôi mời dự tiệc.', partOfSpeech: 'noun' },
	{ word: '約束', reading: 'やくそく', meaning: 'hứa, lời hẹn', meaningJa: '守るべき合意', example: '約束を守ります。', exampleMeaning: 'Tôi giữ lời hứa.', partOfSpeech: 'noun' },
	{ word: '遅刻', reading: 'ちこく', meaning: 'đến muộn', meaningJa: '時間に遅れる', example: '遅刻しないようにします。', exampleMeaning: 'Tôi cố không muộn.', partOfSpeech: 'noun' },
	{ word: '早い', reading: 'はやい', meaning: 'sớm', meaningJa: '時間が前にある', example: '早いですね。', exampleMeaning: 'Sớm quá nhỉ.', partOfSpeech: 'adjective' },
	{ word: '夜', reading: 'よる', meaning: 'đêm, buổi tối', meaningJa: '日が暮れた後', example: '夜は静かです。', exampleMeaning: 'Đêm yên tĩnh.', partOfSpeech: 'noun' },
];

const DECK_COUNT = 25;

function pickWordsForDeck(deckIndex, count) {
	const poolLen = WORD_POOL.length;
	const used = new Set();
	const out = [];
	let offset = (deckIndex * 17) % poolLen;
	while (out.length < count && used.size < poolLen) {
		const w = WORD_POOL[offset % poolLen];
		offset += 1;
		if (used.has(w.word)) continue;
		used.add(w.word);
		out.push({ ...w });
	}
	return out;
}

/**
 * Xóa deck demo cũ (theo tiêu đề) và từ liên quan, rồi tạo lại ~25 deck + từ vựng.
 */
const seedVocabularyDemo = async () => {
	const titleRegex = new RegExp(`^${DEMO_VOCAB_TITLE_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
	const oldDecks = await VocabularyDeck.find({ title: titleRegex }).select('_id').lean();
	const oldIds = oldDecks.map((d) => d._id);
	if (oldIds.length) {
		await Vocabulary.deleteMany({ deckId: { $in: oldIds } });
		await VocabularyDeck.deleteMany({ _id: { $in: oldIds } });
		console.log(`✓ Đã xóa ${oldIds.length} deck demo cũ và từ liên quan`);
	}

	let createdDecks = 0;
	let createdWords = 0;

	for (let i = 1; i <= DECK_COUNT; i += 1) {
		const level = LEVELS[(i - 1) % LEVELS.length];
		const category = CATEGORIES[(i - 1) % CATEGORIES.length];
		const title = `${DEMO_VOCAB_TITLE_PREFIX} ${level.toUpperCase()} · Bài ${String(i).padStart(2, '0')}`;
		const titleJa = `デモ ${level.toUpperCase()} 第${i}課`;
		const wordCount = 5 + ((i * 3) % 8);
		const thumb = THUMBS[(i - 1) % THUMBS.length];

		const deck = await VocabularyDeck.create({
			title,
			titleJa,
			description: `Bộ từ demo (${wordCount} mục) — JLPT ${level.toUpperCase()}, chủ đề ${category}.`,
			descriptionJa: `デモ用語リスト（${wordCount}語）`,
			level,
			category,
			thumbnail: thumb,
			displayOrder: i,
			isActive: i % 9 !== 0,
			totalWords: 0,
		});

		const templates = pickWordsForDeck(i, wordCount);
		const rows = templates.map((t, j) => ({
			deckId: deck._id,
			word: t.word,
			reading: t.reading,
			meaning: t.meaning,
			meaningJa: t.meaningJa,
			example: t.example,
			exampleMeaning: t.exampleMeaning,
			partOfSpeech: t.partOfSpeech,
			displayOrder: j,
			isActive: true,
		}));

		await Vocabulary.insertMany(rows);
		await VocabularyDeck.findByIdAndUpdate(deck._id, { totalWords: rows.length });

		createdDecks += 1;
		createdWords += rows.length;
	}

	console.log(`✓ Demo từ vựng: ${createdDecks} deck, ${createdWords} từ vựng`);
};

export default seedVocabularyDemo;

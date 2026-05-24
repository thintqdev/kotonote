import { EXAM_PASSAGE_MARKUP_HELP } from '../../utils/examPassageMarkup.js';
import './ExamPassageText.css';

export default function ExamPassageMarkupHelp() {
	return (
		<details className="exam-passage-markup-help">
			<summary>Cú pháp định dạng (passage, câu hỏi, lựa chọn)</summary>
			<table className="exam-passage-markup-table">
				<thead>
					<tr>
						<th>Cú pháp</th>
						<th>Ví dụ</th>
						<th>Hiển thị</th>
					</tr>
				</thead>
				<tbody>
					{EXAM_PASSAGE_MARKUP_HELP.map((row) => (
						<tr key={row.syntax}>
							<td>
								<code>{row.syntax}</code>
							</td>
							<td lang="ja">
								<code>{row.example}</code>
							</td>
							<td>{row.desc}</td>
						</tr>
					))}
				</tbody>
			</table>
		</details>
	);
}

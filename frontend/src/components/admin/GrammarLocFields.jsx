import PropTypes from 'prop-types';
import './GrammarLocFields.css';

export default function GrammarLocFields({ label, value, onChange, rows = 3 }) {
	return (
		<fieldset className="admin-grammar-loc">
			<legend className="admin-grammar-loc__legend">{label}</legend>
			<div className="admin-grammar-loc__grid">
				<label className="admin-grammar-loc__field">
					<span className="admin-grammar-loc__tag admin-grammar-loc__tag--ja">JA</span>
					<textarea
						className="admin-grammar-textarea admin-grammar-loc__textarea"
						rows={rows}
						value={value?.ja ?? ''}
						onChange={(e) => onChange({ ...value, ja: e.target.value })}
						placeholder="Tiếng Nhật…"
						lang="ja"
					/>
				</label>
				<label className="admin-grammar-loc__field">
					<span className="admin-grammar-loc__tag admin-grammar-loc__tag--vi">VI</span>
					<textarea
						className="admin-grammar-textarea admin-grammar-loc__textarea"
						rows={rows}
						value={value?.vi ?? ''}
						onChange={(e) => onChange({ ...value, vi: e.target.value })}
						placeholder="Tiếng Việt (tùy chọn)…"
					/>
				</label>
			</div>
		</fieldset>
	);
}

GrammarLocFields.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.shape({
		ja: PropTypes.string,
		vi: PropTypes.string,
	}).isRequired,
	onChange: PropTypes.func.isRequired,
	rows: PropTypes.number,
};

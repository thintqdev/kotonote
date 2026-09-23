import PropTypes from 'prop-types';

const ICON_ROOT = '/assets/ui-icons';

export default function UiIcon({ name, size = 20, className = '' }) {
	return (
		<img
			src={`${ICON_ROOT}/${name}.png`}
			alt=""
			aria-hidden="true"
			className={`ui-icon ${className}`.trim()}
			width={size}
			height={size}
			decoding="async"
		/>
	);
}

UiIcon.propTypes = {
	name: PropTypes.string.isRequired,
	size: PropTypes.number,
	className: PropTypes.string,
};

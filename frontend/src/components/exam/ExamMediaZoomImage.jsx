import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './ExamMediaZoomImage.css';

/**
 * Ảnh tài liệu đề thi — click để phóng to (lightbox).
 */
export default function ExamMediaZoomImage({
	src,
	alt = 'Tài liệu minh họa',
	className = 'reading-detail-cover-img',
}) {
	const [open, setOpen] = useState(false);

	const close = useCallback(() => setOpen(false), []);
	const openLightbox = useCallback(() => {
		if (src) setOpen(true);
	}, [src]);

	useEffect(() => {
		if (!open) return undefined;
		const onKey = (e) => {
			if (e.key === 'Escape') close();
		};
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener('keydown', onKey);
		};
	}, [open, close]);

	if (!src) return null;

	return (
		<>
			<button
				type="button"
				className="exam-media-zoom-trigger"
				onClick={openLightbox}
				title="Nhấn để phóng to"
				aria-label="Phóng to ảnh tài liệu"
			>
				<img
					className={className}
					src={src}
					alt={alt}
					decoding="async"
					loading="lazy"
				/>
				<span className="exam-media-zoom-hint" aria-hidden>
					🔍 Phóng to
				</span>
			</button>

			{open ? (
				<div
					className="exam-media-zoom-lightbox"
					role="dialog"
					aria-modal="true"
					aria-label="Ảnh tài liệu phóng to"
					onClick={close}
				>
					<button
						type="button"
						className="exam-media-zoom-close"
						onClick={close}
						aria-label="Đóng"
					>
						×
					</button>
					<img
						className="exam-media-zoom-lightbox-img"
						src={src}
						alt={alt}
						decoding="async"
						onClick={(e) => e.stopPropagation()}
					/>
				</div>
			) : null}
		</>
	);
}

ExamMediaZoomImage.propTypes = {
	src: PropTypes.string.isRequired,
	alt: PropTypes.string,
	className: PropTypes.string,
};

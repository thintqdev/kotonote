import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { LISTENING_ASSETS } from '../../constants/listeningAssets.js';
import './ExamListeningAudioPlayer.css';

function formatAudioTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function ExamListeningAudioPlayer({
	src,
	label,
	className = '',
	variant = 'default',
}) {
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		setIsPlaying(false);
		setCurrentTime(0);
		setDuration(0);
	}, [src]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return undefined;

		const syncDuration = () => {
			if (Number.isFinite(audio.duration)) {
				setDuration(audio.duration);
			}
		};
		const onTimeUpdate = () => setCurrentTime(audio.currentTime);
		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);
		const onEnded = () => setIsPlaying(false);

		audio.addEventListener('loadedmetadata', syncDuration);
		audio.addEventListener('durationchange', syncDuration);
		audio.addEventListener('timeupdate', onTimeUpdate);
		audio.addEventListener('play', onPlay);
		audio.addEventListener('pause', onPause);
		audio.addEventListener('ended', onEnded);

		return () => {
			audio.removeEventListener('loadedmetadata', syncDuration);
			audio.removeEventListener('durationchange', syncDuration);
			audio.removeEventListener('timeupdate', onTimeUpdate);
			audio.removeEventListener('play', onPlay);
			audio.removeEventListener('pause', onPause);
			audio.removeEventListener('ended', onEnded);
		};
	}, [src]);

	const togglePlay = useCallback(() => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) {
			void audio.play().catch(() => setIsPlaying(false));
		} else {
			audio.pause();
		}
	}, []);

	const handleSeek = useCallback((event) => {
		const value = Number(event.target.value);
		setCurrentTime(value);
		if (audioRef.current) {
			audioRef.current.currentTime = value;
		}
	}, []);

	if (!src) return null;

	const progressMax = duration > 0 ? duration : 100;
	const progressValue = duration > 0 ? currentTime : 0;
	const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
	const rootClass = [
		'exam-audio-player',
		variant === 'admin' ? 'exam-audio-player--admin' : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={rootClass} role="group" aria-label={label || 'Audio nghe hiểu'}>
			{label ? <p className="exam-audio-player__label">{label}</p> : null}
			<div
				className={`exam-audio-player__shell${isPlaying ? ' exam-audio-player__shell--playing' : ''}`}
			>
				<div className="exam-audio-player__wave" aria-hidden="true">
					{Array.from({ length: 5 }, (_, index) => (
						<span
							key={`wave-${index}`}
							className="exam-audio-player__wave-bar"
							style={{ animationDelay: `${index * 0.12}s` }}
						/>
					))}
				</div>
				<button
					type="button"
					className="exam-audio-player__play"
					onClick={togglePlay}
					aria-label={isPlaying ? 'Tạm dừng' : 'Phát audio'}
				>
					<img
						src={isPlaying ? LISTENING_ASSETS.iconPause : LISTENING_ASSETS.iconPlay}
						alt=""
						width={22}
						height={22}
						decoding="async"
					/>
				</button>
				<div className="exam-audio-player__main">
					<div className="exam-audio-player__progress-wrap">
						<div className="exam-audio-player__progress-track" aria-hidden="true">
							<div
								className="exam-audio-player__progress-fill"
								style={{ width: `${progressPct}%` }}
							/>
						</div>
						<input
							type="range"
							className="exam-audio-player__range"
							min={0}
							max={progressMax}
							step={0.1}
							value={progressValue}
							onChange={handleSeek}
							aria-label="Tiến độ phát audio"
							aria-valuemin={0}
							aria-valuemax={progressMax}
							aria-valuenow={progressValue}
						/>
					</div>
					<div className="exam-audio-player__times">
						<span>{formatAudioTime(currentTime)}</span>
						<span>{formatAudioTime(duration)}</span>
					</div>
				</div>
			</div>
			<audio
				ref={audioRef}
				className="exam-audio-player__native"
				src={src}
				preload="metadata"
			/>
		</div>
	);
}

ExamListeningAudioPlayer.propTypes = {
	src: PropTypes.string,
	label: PropTypes.string,
	className: PropTypes.string,
	variant: PropTypes.oneOf(['default', 'admin']),
};

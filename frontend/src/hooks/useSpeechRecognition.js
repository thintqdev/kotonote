import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Web Speech API — nhận diện giọng nói.
 * commitOnStop: gộp transcript khi bấm dừng (không gửi từng đoạn).
 * @param {{ lang?: string, commitOnStop?: boolean, onTranscriptReady?: (text: string) => void }} [options]
 */
export function useSpeechRecognition(options = {}) {
	const {
		lang = 'ja-JP',
		commitOnStop = false,
		onTranscriptReady,
	} = options;
	const [supported, setSupported] = useState(false);
	const [listening, setListening] = useState(false);
	const [interim, setInterim] = useState('');
	const recognitionRef = useRef(null);
	const bufferRef = useRef('');
	const interimRef = useRef('');
	const onReadyRef = useRef(onTranscriptReady);
	onReadyRef.current = onTranscriptReady;

	useEffect(() => {
		const SR =
			typeof window !== 'undefined'
				? window.SpeechRecognition || window.webkitSpeechRecognition
				: null;
		setSupported(Boolean(SR));
		if (!SR) return undefined;

		const rec = new SR();
		rec.lang = lang;
		rec.interimResults = true;
		rec.continuous = Boolean(commitOnStop);
		rec.maxAlternatives = 1;

		rec.onresult = (event) => {
			let finalChunk = '';
			let interimText = '';
			for (let i = event.resultIndex; i < event.results.length; i += 1) {
				const t = event.results[i][0]?.transcript ?? '';
				if (event.results[i].isFinal) finalChunk += t;
				else interimText += t;
			}
			if (commitOnStop) {
				if (finalChunk.trim()) {
					const next = `${bufferRef.current}${finalChunk}`.trim();
					bufferRef.current = next ? `${next} ` : '';
				}
				interimRef.current = interimText.trim();
				setInterim(interimRef.current);
			} else {
				setInterim(interimText);
				if (finalChunk.trim()) {
					onReadyRef.current?.(finalChunk.trim());
					setInterim('');
				}
			}
		};

		rec.onend = () => {
			setListening(false);
			if (commitOnStop) {
				const text = `${bufferRef.current}${interimRef.current ? interimRef.current : ''}`
					.trim()
					.replace(/\s+/g, ' ');
				bufferRef.current = '';
				interimRef.current = '';
				setInterim('');
				if (text) onReadyRef.current?.(text);
			}
		};

		rec.onerror = () => {
			setListening(false);
			bufferRef.current = '';
			interimRef.current = '';
			setInterim('');
		};

		recognitionRef.current = rec;
		return () => {
			try {
				rec.abort();
			} catch {
				/* ignore */
			}
		};
	}, [lang, commitOnStop]);

	const start = useCallback(() => {
		const rec = recognitionRef.current;
		if (!rec || listening) return;
		bufferRef.current = '';
		interimRef.current = '';
		setInterim('');
		try {
			rec.start();
			setListening(true);
		} catch {
			setListening(false);
		}
	}, [listening]);

	const stop = useCallback(() => {
		const rec = recognitionRef.current;
		if (!rec) return;
		try {
			rec.stop();
		} catch {
			/* ignore */
		}
		if (!commitOnStop) {
			setListening(false);
		}
	}, [commitOnStop]);

	return { supported, listening, interim, start, stop };
}

/** @param {string} text @param {string} [lang] */
export function speakJapanese(text, lang = 'ja-JP') {
	if (typeof window === 'undefined' || !window.speechSynthesis) return;
	const u = new SpeechSynthesisUtterance(text);
	u.lang = lang;
	window.speechSynthesis.cancel();
	window.speechSynthesis.speak(u);
}

import { useCallback, useEffect, useRef, useState } from 'react';

const CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

/** @type {Promise<void> | null} */
let loadPromise = null;

function loadGoogleGis() {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('Google GIS unavailable'));
	}
	if (window.google?.accounts?.id) {
		return Promise.resolve();
	}
	if (!loadPromise) {
		loadPromise = new Promise((resolve, reject) => {
			const existing = document.querySelector('script[data-google-gis]');
			if (existing) {
				if (window.google?.accounts?.id) {
					resolve();
					return;
				}
				existing.addEventListener('load', () => resolve(), { once: true });
				existing.addEventListener(
					'error',
					() => reject(new Error('Google GIS script failed')),
					{ once: true },
				);
				return;
			}
			const script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.async = true;
			script.defer = true;
			script.dataset.googleGis = '1';
			script.onload = () => resolve();
			script.onerror = () =>
				reject(new Error('Failed to load Google Identity Services'));
			document.head.appendChild(script);
		});
	}
	return loadPromise;
}

export function isGoogleSignInConfigured() {
	return Boolean(CLIENT_ID);
}

function measureButtonWidth(container) {
	const parent = container?.parentElement;
	return Math.max(
		parent?.offsetWidth ?? 0,
		container?.offsetWidth ?? 0,
		280,
	);
}

/**
 * Google Identity Services — render nút đăng nhập (trả ID token qua callback).
 * @param {{ onCredential: (idToken: string) => void, onError?: (err: Error) => void }} options
 */
export function useGoogleSignIn({ onCredential, onError }) {
	const containerRef = useRef(null);
	const [ready, setReady] = useState(false);
	const [error, setError] = useState(null);
	const onCredentialRef = useRef(onCredential);
	const onErrorRef = useRef(onError);
	const renderedRef = useRef(false);

	onCredentialRef.current = onCredential;
	onErrorRef.current = onError;

	const renderGoogleButton = useCallback(() => {
		const el = containerRef.current;
		if (!el || !window.google?.accounts?.id || renderedRef.current) return;

		const width = measureButtonWidth(el);
		el.innerHTML = '';
		window.google.accounts.id.renderButton(el, {
			type: 'standard',
			theme: 'outline',
			size: 'large',
			width,
			text: 'continue_with',
			shape: 'rectangular',
			locale: 'vi',
		});
		renderedRef.current = true;
		setReady(true);
		setError(null);
	}, []);

	useEffect(() => {
		if (!CLIENT_ID) return undefined;

		let cancelled = false;
		renderedRef.current = false;
		setReady(false);
		setError(null);

		loadGoogleGis()
			.then(() => {
				if (cancelled) return;

				window.google.accounts.id.initialize({
					client_id: CLIENT_ID,
					callback: (response) => {
						if (response?.credential) {
							onCredentialRef.current(response.credential);
						} else {
							const err = new Error('Google did not return a credential');
							setError(err);
							onErrorRef.current?.(err);
						}
					},
				});

				// Đợi layout xong để có width > 0
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						if (!cancelled) renderGoogleButton();
					});
				});
			})
			.catch((err) => {
				if (cancelled) return;
				const e = err instanceof Error ? err : new Error(String(err));
				setError(e);
				onErrorRef.current?.(e);
			});

		return () => {
			cancelled = true;
		};
	}, [renderGoogleButton]);

	return {
		containerRef,
		ready,
		error,
		configured: Boolean(CLIENT_ID),
	};
}

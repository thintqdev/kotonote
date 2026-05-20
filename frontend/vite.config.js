import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const apiProxyTarget =
		env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000';

	return {
		plugins: [react()],
		server: {
			port: 5173,
			open: true,
			proxy: {
				'/api': {
					target: apiProxyTarget,
					changeOrigin: true,
				},
				'/uploads': {
					target: apiProxyTarget,
					changeOrigin: true,
				},
			},
		},
		build: {
			outDir: 'dist',
			sourcemap: false,
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ['react', 'react-dom', 'axios'],
					},
				},
			},
		},
	};
});

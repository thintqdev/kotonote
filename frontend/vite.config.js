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
					manualChunks(id) {
						if (!id.includes('node_modules')) return undefined;
						if (
							id.includes('react-router') ||
							id.includes('react-dom') ||
							id.includes('/react/')
						) {
							return 'vendor-react';
						}
						if (id.includes('i18next') || id.includes('react-i18next')) {
							return 'vendor-i18n';
						}
						if (id.includes('recharts')) return 'vendor-charts';
						if (id.includes('socket.io-client')) return 'vendor-socket';
						if (id.includes('axios')) return 'vendor-axios';
						return undefined;
					},
				},
			},
		},
	};
});

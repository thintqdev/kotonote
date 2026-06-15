import React from 'react';
import ReactDOM from 'react-dom/client';
import { initI18n } from './i18n.js';
import App from './App.jsx';
import './styles/index.css';

initI18n().then(() => {
	ReactDOM.createRoot(document.getElementById('root')).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
});

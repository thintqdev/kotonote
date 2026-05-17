import { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { resolvePublicMediaUrl } from '../../utils/resolveAvatarUrl.js';
import './NotebookRichEditor.css';

function exec(cmd, value = null) {
	try {
		document.execCommand(cmd, false, value);
	} catch {
		/* ignore */
	}
}

const TABLE_HTML = `<table class="nb-table"><thead><tr><th></th><th></th></tr></thead><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table><p><br></p>`;

export default function NotebookRichEditor({
	value,
	onChange,
	onUploadImage,
	disabled,
}) {
	const { t } = useTranslation();
	const editorRef = useRef(null);
	const fileRef = useRef(null);
	const lastHtml = useRef(value || '');

	useEffect(() => {
		const el = editorRef.current;
		if (!el) return;
		if (value !== lastHtml.current) {
			el.innerHTML = value || '';
			lastHtml.current = value || '';
		}
	}, [value]);

	const emitChange = useCallback(() => {
		const el = editorRef.current;
		if (!el) return;
		const html = el.innerHTML;
		lastHtml.current = html;
		onChange(html);
	}, [onChange]);

	const handleInput = () => {
		emitChange();
	};

	const handleToolbar = (action) => {
		if (disabled) return;
		editorRef.current?.focus();
		switch (action) {
			case 'bold':
				exec('bold');
				break;
			case 'italic':
				exec('italic');
				break;
			case 'underline':
				exec('underline');
				break;
			case 'h2':
				exec('formatBlock', 'h2');
				break;
			case 'h3':
				exec('formatBlock', 'h3');
				break;
			case 'ul':
				exec('insertUnorderedList');
				break;
			case 'ol':
				exec('insertOrderedList');
				break;
			case 'quote':
				exec('formatBlock', 'blockquote');
				break;
			case 'hr':
				exec('insertHorizontalRule');
				break;
			case 'link': {
				const url = window.prompt(t('notebook.editorLinkPrompt'));
				if (url) exec('createLink', url);
				break;
			}
			case 'table':
				exec('insertHTML', TABLE_HTML);
				break;
			case 'image':
				fileRef.current?.click();
				break;
			default:
				break;
		}
		emitChange();
	};

	const onImagePicked = async (e) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file || !file.type.startsWith('image/') || disabled) return;
		try {
			const path = await onUploadImage(file);
			const src = resolvePublicMediaUrl(path);
			if (!src) return;
			editorRef.current?.focus();
			exec(
				'insertHTML',
				`<figure class="nb-figure"><img src="${src}" alt="" class="nb-img" /></figure><p><br></p>`,
			);
			emitChange();
		} catch {
			/* parent handles toast */
		}
	};

	const tools = [
		{ id: 'bold', label: 'B', title: t('notebook.toolBold') },
		{ id: 'italic', label: 'I', title: t('notebook.toolItalic') },
		{ id: 'underline', label: 'U', title: t('notebook.toolUnderline') },
		{ id: 'h2', label: 'H2', title: t('notebook.toolH2') },
		{ id: 'h3', label: 'H3', title: t('notebook.toolH3') },
		{ id: 'ul', label: '•', title: t('notebook.toolList') },
		{ id: 'ol', label: '1.', title: t('notebook.toolOrdered') },
		{ id: 'quote', label: '❝', title: t('notebook.toolQuote') },
		{ id: 'table', label: '▦', title: t('notebook.toolTable') },
		{ id: 'hr', label: '—', title: t('notebook.toolHr') },
		{ id: 'link', label: '🔗', title: t('notebook.toolLink') },
		{ id: 'image', label: '🖼', title: t('notebook.toolImage') },
	];

	return (
		<div className={`nb-editor${disabled ? ' nb-editor--disabled' : ''}`}>
			<div className="nb-editor-toolbar" role="toolbar" aria-label={t('notebook.editorToolbar')}>
				{tools.map((tool) => (
					<button
						key={tool.id}
						type="button"
						className="nb-editor-tool"
						title={tool.title}
						disabled={disabled}
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => handleToolbar(tool.id)}
					>
						{tool.label}
					</button>
				))}
			</div>
			<div
				ref={editorRef}
				className="nb-editor-surface"
				contentEditable={!disabled}
				role="textbox"
				aria-multiline="true"
				aria-label={t('notebook.editorAria')}
				data-placeholder={t('notebook.editorPlaceholder')}
				suppressContentEditableWarning
				onInput={handleInput}
			/>
			<input
				ref={fileRef}
				type="file"
				accept="image/jpeg,image/png,image/gif,image/webp"
				className="nb-editor-file"
				tabIndex={-1}
				aria-hidden
				onChange={onImagePicked}
			/>
		</div>
	);
}

NotebookRichEditor.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onUploadImage: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};

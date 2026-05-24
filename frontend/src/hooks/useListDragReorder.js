import { useCallback, useState } from 'react';

/**
 * HTML5 drag-and-drop reorder — kéo bằng handle, thả lên dòng đích.
 * @param {(fromIndex: number, toIndex: number) => void} onReorder
 */
export function useListDragReorder(onReorder) {
	const [dragIndex, setDragIndex] = useState(null);
	const [overIndex, setOverIndex] = useState(null);

	const createDragHandleProps = useCallback(
		(index) => ({
			draggable: true,
			onDragStart: (e) => {
				setDragIndex(index);
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('text/plain', String(index));
				const row = e.currentTarget.closest('[data-dnd-row]');
				if (row instanceof HTMLElement) {
					e.dataTransfer.setDragImage(row, 28, 20);
				}
			},
			onDragEnd: () => {
				setDragIndex(null);
				setOverIndex(null);
			},
		}),
		[],
	);

	const createRowProps = useCallback(
		(index) => {
			const rowClass = [
				dragIndex === index ? 'exam-dnd-row--dragging' : '',
				overIndex === index && dragIndex !== index ? 'exam-dnd-row--drop-target' : '',
			]
				.filter(Boolean)
				.join(' ');

			return {
				'data-dnd-row': true,
				onDragOver: (e) => {
					e.preventDefault();
					e.dataTransfer.dropEffect = 'move';
					if (dragIndex != null && dragIndex !== index) {
						setOverIndex(index);
					}
				},
				onDragLeave: () => {
					setOverIndex((prev) => (prev === index ? null : prev));
				},
				onDrop: (e) => {
					e.preventDefault();
					const raw = e.dataTransfer.getData('text/plain');
					const from = dragIndex ?? Number(raw);
					if (Number.isNaN(from) || from === index) return;
					onReorder(from, index);
					setDragIndex(null);
					setOverIndex(null);
				},
				className: rowClass || undefined,
			};
		},
		[dragIndex, overIndex, onReorder],
	);

	return {
		createDragHandleProps,
		createRowProps,
		isDragging: dragIndex != null,
	};
}

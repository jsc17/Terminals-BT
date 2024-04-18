export function createDraggableList() {
	let dragStartIndex: number, dragEnterIndex: number, dropIndex: number;

	return {
		handleDrop(list: any[]) {
			if (dragStartIndex == dragEnterIndex) return;
			const draggedItem = list[dragStartIndex];
			const newList = [...list];
			newList.splice(dragStartIndex, 1);
			newList.splice(dropIndex, 0, draggedItem);
			return newList;
		},

		handleDragOver(e: any) {
			const targetTop = e.target.getBoundingClientRect().top;
			const targetHeight = e.target.getBoundingClientRect().height;
			const yLoc = e.clientY - targetTop;
			if (yLoc < targetHeight / 2) {
				// top half - replace item at index
				dropIndex = dragEnterIndex;
			} else {
				// bottom half - place after item
				dropIndex = dragEnterIndex + 1;
			}
		},

		handleDragStart(index: number) {
			dragStartIndex = index;
		},

		handleDragEnter(index: number) {
			dragEnterIndex = index;
		}
	};
}

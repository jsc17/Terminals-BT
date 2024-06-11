export class DraggableList<T> {
	items = $state<T[]>([]);
	dragStartIndex = $state(-1);
	dragEnterIndex = $state(-1);
	dropIndex = $state(-1);

	handleDrop() {
		if (this.dragStartIndex == this.dragEnterIndex) return;
		const draggedItem = this.items[this.dragStartIndex];
		const newList = [...this.items];
		newList.splice(this.dragStartIndex, 1);
		newList.splice(this.dropIndex, 0, draggedItem);
		this.items = newList;
		this.dropIndex = -1;
	}

	handleDragOver(e: any) {
		const targetTop = e.target.getBoundingClientRect().top;
		const targetHeight = e.target.getBoundingClientRect().height;
		const yLoc = e.clientY - targetTop;
		if (yLoc < targetHeight / 2) {
			// top half - replace item at index
			this.dropIndex = this.dragEnterIndex;
		} else {
			// bottom half - place after item
			this.dropIndex = this.dragEnterIndex + 1;
		}
	}

	handleDragStart(index: number) {
		this.dragStartIndex = index;
	}

	handleDragEnter(index: number) {
		this.dragEnterIndex = index;
	}
}

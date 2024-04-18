function createAppWindow() {
	let windowWidth = $state(0);
	let isMobile = $derived(windowWidth < 500);
	let isNarrow = $derived(windowWidth < 875);

	return {
		get isMobile() {
			return isMobile;
		},
		get isNarrow() {
			return isNarrow;
		},
		set windowWidth(newWidth: number) {
			windowWidth = newWidth;
		},
		get windowWidth() {
			return windowWidth;
		}
	};
}

export const appWindow = createAppWindow();

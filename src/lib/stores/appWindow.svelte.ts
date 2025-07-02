import { innerWidth } from "svelte/reactivity/window";

function createAppWindow() {
	let isMobile = $derived.by(() => {
		if (innerWidth.current) {
			return innerWidth.current < 500;
		} else {
			return false;
		}
	});
	let isNarrow = $derived.by(() => {
		if (innerWidth.current) {
			return innerWidth.current < 875;
		} else {
			return false;
		}
	});

	return {
		get isMobile() {
			return isMobile;
		},
		get isNarrow() {
			return isNarrow;
		}
	};
}

export const appWindow = createAppWindow();

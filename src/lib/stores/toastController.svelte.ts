import { Map } from "svelte/reactivity";

type toastOptions = {
	message: string;
	timeout: number;
	dismissable: boolean;
};

class ToastController {
	toasts = new Map<string, toastOptions>();

	addToast(message: string, timeout: number = 3000, dismissable: boolean = true) {
		const toast: toastOptions = { message, timeout, dismissable };
		const id: string = crypto.randomUUID();
		this.toasts.set(id, toast);
		this.timeout(id, timeout);
	}

	dismissToast(id: string) {
		this.toasts.delete(id);
	}

	async timeout(id: string, timeout: number) {
		await new Promise((resolve) => setTimeout(resolve, timeout));
		if (this.toasts.get(id)) {
			this.toasts.delete(id);
		}
	}
}

export const toastController = new ToastController();

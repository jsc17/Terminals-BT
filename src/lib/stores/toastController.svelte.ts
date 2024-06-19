import { Map } from "svelte/reactivity";

type toastOptions = {
	message: string;
	timeout: number;
	dismissable: boolean;
};

class Toast {
	message;
	timeout;
	dismissable;
	timeRemaining;
	background = $state<number>(100);
	timer;

	constructor(message: string, timeout: number, dismissable: boolean) {
		this.message = message;
		this.timeout = timeout;
		this.timeRemaining = timeout;
		this.dismissable = dismissable;

		this.timer = setInterval(() => {
			this.timeRemaining = this.timeRemaining - 25;
			this.background = (this.timeRemaining / timeout) * 100;

			if (this.timeRemaining == 0) {
				clearInterval(this.timer);
			}
		}, 25);
	}
}

class ToastController {
	toasts = new Map<string, Toast>();

	addToast(message: string, timeout: number = 3000, dismissable: boolean = true) {
		const toast = new Toast(message, timeout, dismissable);
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

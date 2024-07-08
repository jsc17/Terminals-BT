let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

export function getTextWidth(text: string): number {
	if (!canvas) {
		canvas = document.createElement("canvas");
		context = canvas.getContext("2d")!;
		context.font = "16px arial";
	}

	return Math.ceil(context!.measureText(text).width);
}

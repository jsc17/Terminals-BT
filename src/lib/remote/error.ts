import * as v from "valibot";
import { command } from "$app/server";

export const logError = command(v.string(), async (message) => {
	console.log(message);
});

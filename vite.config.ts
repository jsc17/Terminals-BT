import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";
// @ts-ignore
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";
import fs from "fs";

export default defineConfig({
	plugins: [crossOriginIsolation(), sveltekit(), sveltePhosphorOptimize()],
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp"
		},
		https: {
			key: fs.readFileSync("localhost-key.pem"),
			cert: fs.readFileSync("localhost.pem")
		}, // same as "--https" flag
		host: true, // same as "--host" flag
		fs: {
			strict: false
		}
	},
	build: {
		rollupOptions: {
			external: ["playwright-core"]
		}
	},
	optimizeDeps: {
		exclude: ["chromium-bidi", "@sqlite.org/sqlite-wasm"]
	}
});

import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";

export default defineConfig({
	plugins: [sveltekit(), basicSsl(), sveltePhosphorOptimize()],
	server: {
		https: {}, // same as "--https" flag
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
		exclude: ["chromium-bidi"]
	}
});

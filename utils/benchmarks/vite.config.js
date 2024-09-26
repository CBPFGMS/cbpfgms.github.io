import { defineConfig } from "vite";

export default defineConfig({
	build: {
		target: "node14",
		outDir: "dist",
		entry: "src/main.ts",
		rollupOptions: {
			input: "src/main.ts",
			output: {
				name: "benchmark",
				format: "cjs",
				entryFileNames: "main.js",
				chunkFileNames: "main.js",
			},
		},
	},
});

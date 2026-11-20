import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "attribution.js",
				assetFileNames: "[name][extname]", // No hash, keeps original name
			},
		},
	},
});

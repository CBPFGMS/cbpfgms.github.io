import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "fund-attribution.js",
				assetFileNames: assetInfo => {
					if (assetInfo.names?.some(name => name.endsWith(".css"))) {
						return "fund-attribution.css";
					}
					return "[name][extname]"; // No hash, keeps original name
				},
			},
		},
	},
});

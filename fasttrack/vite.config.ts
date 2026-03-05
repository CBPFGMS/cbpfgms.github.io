import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				assetFileNames: "[name][extname]", // No hash, keeps original name
			},
		},
	},
});

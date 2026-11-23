import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "progress.js",
				assetFileNames: assetInfo => {
					if (assetInfo.name?.endsWith(".css")) {
						return "progress.css";
					}
					return "[name][extname]"; // No hash, keeps original name
				},
			},
		},
	},
});

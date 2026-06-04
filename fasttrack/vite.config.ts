import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				// assetFileNames: "[name][extname]", // No hash, keeps original name
				assetFileNames: assetInfo => {
					let extType = assetInfo.name?.split(".").at(-1);
					if (
						extType === "png" ||
						extType === "jpg" ||
						extType === "jpeg"
					) {
						extType = "img";
					}
					// Places images in assets/img/[name]-[hash].[ext]
					return `assets/${extType}/[name][extname]`;
				},
			},
		},
	},
	experimental: {
		renderBuiltUrl(filename, { type }) {
			if (type === "asset") {
				// Forces the output in the JS to be exactly "./assets/img/filename.jpg"
				return "./" + filename;
			}
			return { relative: true };
		},
	},
});

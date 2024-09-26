/* global process */
import { build } from "esbuild";

build({
	entryPoints: ["src/main.ts"], // Adjust this to your entry point
	bundle: true,
	platform: "node", // For Node.js
	outdir: "dist",
	sourcemap: true, // Optional: generates source maps
	minify: true, // Optional: minifies the output
}).catch(() => process.exit(1));

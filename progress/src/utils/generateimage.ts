import { toPng } from "html-to-image";
import { RefObject } from "react";

type Mode = "download" | "copy";

function generateImage(
	ref: RefObject<HTMLDivElement>,
	iconsRef: RefObject<HTMLDivElement>,
	mode: Mode,
	fileName: string
): Promise<void> {
	if (iconsRef.current) {
		iconsRef.current.classList.add("hiddenElement");
	}
	return new Promise((resolve, reject) => {
		if (ref.current) {
			toPng(ref.current, { backgroundColor: "white", pixelRatio: 2 })
				.then(dataUrl => {
					if (mode === "download") {
						const link = document.createElement("a");
						link.download = `${fileName}.png`;
						link.href = dataUrl;
						link.click();
						resolve();
					}
					if (mode === "copy") {
						fetch(dataUrl)
							.then(response => response.blob())
							.then(blob => {
								const item = new ClipboardItem({
									"image/png": blob,
								});
								navigator.clipboard
									.write([item])
									.then(() => resolve())
									.catch(error => reject(error));
							})
							.catch(error => reject(error));
					}
				})
				.catch(error => {
					console.error("Error while processing image", error);
					reject(error);
				})
				.finally(() => {
					if (iconsRef.current) {
						iconsRef.current.classList.remove("hiddenElement");
					}
				});
		} else {
			reject(new Error("No ref provided or ref is null"));
		}
	});
}

export default generateImage;
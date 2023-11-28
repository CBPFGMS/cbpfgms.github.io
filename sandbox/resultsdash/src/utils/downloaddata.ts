import { csvFormat } from "d3-dsv";
import { DownloadData } from "../types";

const downloadData: DownloadData = (data, fileName) => {
	const csv = csvFormat<(typeof data)[number]>(data);

	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

	const link = document.createElement("a");

	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", fileName);
		link.setAttribute("style", "visibility:hidden");

		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);
	}
};

export default downloadData;

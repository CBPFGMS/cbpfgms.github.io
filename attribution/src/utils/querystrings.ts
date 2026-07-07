function addQueryParam(id: number) {
	const url = new URL(window.location.href);

	url.searchParams.set("donor", id.toString());

	window.history.pushState({}, "", url.toString());
}

function clearAllParams() {
	const url = new URL(window.location.href);

	url.search = "";

	window.history.pushState({}, "", url.toString());
}

export { addQueryParam, clearAllParams };

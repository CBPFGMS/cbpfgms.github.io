(function d3ChartIIFE() {

	//PENDING INFO:
	//1. One BI hostname
	//2. One BI bookmark page

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "pfbi.unocha.org/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "../../OCHA GitHub Repo/cbpfgms.github.io/css/d3chartstylescovmap-stg.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.15.0/d3.min.js",
		topoJsonUrl = "https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js",
		html2ToCanvas = "https://cbpfgms.github.io/libraries/html2canvas.min.js",
		jsPdf = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js",
		URLSearchParamsPolyfill = "https://cdn.jsdelivr.net/npm/@ungap/url-search-params@0.1.2/min.min.js",
		fetchPolyfill1 = "https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js",
		fetchPolyfill2 = "https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js";

	//CHANGE CSS LINK!!!!!!!!!!!!!!!!

	cssLinks.forEach(function(cssLink) {

		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			if (cssLink === fontAwesomeLink) {
				externalCSS.setAttribute("integrity", "sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/");
				externalCSS.setAttribute("crossorigin", "anonymous")
			};
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		};

	});

	if (!isScriptLoaded(d3URL)) {
		if (hasFetch && hasURLSearchParams) {
			loadScript(topoJsonUrl, function() {
				loadScript(d3URL, d3Chart);
			});
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(topoJsonUrl, function() {
					loadScript(d3URL, d3Chart);
				});
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(topoJsonUrl, function() {
							loadScript(d3URL, d3Chart);
						});
					});
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		if (hasFetch && hasURLSearchParams) {
			loadScript(topoJsonUrl, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(topoJsonUrl, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(topoJsonUrl, d3Chart);
					});
				});
			});
		};
	} else {
		let d3Script;
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == d3URL) d3Script = scripts[i];
		};
		d3Script.addEventListener("load", d3Chart);
	};

	function loadScript(url, callback) {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	};

	function isStyleLoaded(url) {
		const styles = document.getElementsByTagName('link');
		for (let i = styles.length; i--;) {
			if (styles[i].href == url) return true;
		}
		return false;
	};

	function isScriptLoaded(url) {
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == url) return true;
		}
		return false;
	};

	function d3Chart() {

		//POLYFILLS

		//Array.prototype.find()

		if (!Array.prototype.find) {
			Object.defineProperty(Array.prototype, 'find', {
				value: function(predicate) {
					if (this == null) {
						throw new TypeError('"this" is null or not defined');
					}
					var o = Object(this);
					var len = o.length >>> 0;
					if (typeof predicate !== 'function') {
						throw new TypeError('predicate must be a function');
					}
					var thisArg = arguments[1];
					var k = 0;
					while (k < len) {
						var kValue = o[k];
						if (predicate.call(thisArg, kValue, k, o)) {
							return kValue;
						}
						k++;
					}
					return undefined;
				},
				configurable: true,
				writable: true
			});
		};

		//toBlob

		if (!HTMLCanvasElement.prototype.toBlob) {
			Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
				value: function(callback, type, quality) {
					var dataURL = this.toDataURL(type, quality).split(',')[1];
					setTimeout(function() {

						var binStr = atob(dataURL),
							len = binStr.length,
							arr = new Uint8Array(len);

						for (var i = 0; i < len; i++) {
							arr[i] = binStr.charCodeAt(i);
						}

						callback(new Blob([arr], {
							type: type || 'image/png'
						}));

					});
				}
			});
		};

		//END OF POLYFILLS

		const width = 900,
			padding = [4, 4, 4, 4],
			panelHorizontalPadding = 4,
			buttonsPanelHeight = 30,
			mapPanelHeight = 430,
			legendPanelHeight = 80,
			legendPanelWidth = 86,
			legendPanelHorPadding = 2,
			legendPanelVertPadding = 2,
			mapZoomButtonHorPadding = 10,
			mapZoomButtonVertPadding = 10,
			mapZoomButtonSize = 26,
			maxPieSize = 20,
			minPieSize = 1,
			buttonsNumber = 6,
			groupNamePadding = 2,
			unBlue = "#1F69B3",
			cbpfColor = "#418FDE",
			cerfColor = "#F9D25B",
			fadeOpacity = 0.2,
			tooltipMargin = 8,
			tooltipSvgWidth = 310,
			tooltipSvgHeight = 80,
			showNamesMargin = 12,
			tooltipSvgPadding = [12, 36, 2, 96],
			height = padding[0] + padding[2] + buttonsPanelHeight + mapPanelHeight + panelHorizontalPadding,
			windowHeight = window.innerHeight,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localVariable = d3.local(),
			localStorageTime = 600000,
			duration = 1000,
			shortDuration = 250,
			stickHeight = 2,
			lollipopRadius = 4,
			labelPadding = 2,
			formatMoney0Decimals = d3.format(",.0f"),
			formatSIaxes = d3.format("~s"),
			formatNumberSI = d3.format(".3s"),
			mapBackgroundColor = "#D4DADC",
			chartTitleDefault = "Allocations",
			vizNameQueryString = "allocationsmap",
			bookmarkSite = "https://pfbi.unocha.org/bookmark.html?",
			dataUrl = "covmapdata5combined.csv",
			mapUrl = "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/worldmaptopo110m.json",
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			yearsArray = [],
			countryNames = {},
			centroids = {},
			partnerTypes = [],
			cbpfAllocationTypes = ["standard", "reserve", "total"],
			cerfAllocationTypes = ["rapidresponse", "underfunded", "total"],
			chartState = {
				selectedYear: [],
				countriesInData: [],
				selectedCbpfAllocation: null,
				selectedCerfAllocation: null,
				showNames: null
			};

		let isSnapshotTooltipVisible = false,
			currentHoveredElem;

		const hardcodedAllocations = [{
			isoCode: "XX",
			long: 35.24,
			lat: 38.96
		}, {
			isoCode: "KM",
			long: 43.87,
			lat: -11.87
		}, {
			isoCode: "CV",
			long: -24.01,
			lat: 16
		}, {
			isoCode: "MH",
			long: 171.18,
			lat: 7.13
		}, {
			isoCode: "AG",
			long: -61.8,
			lat: 17.06
		}, {
			isoCode: "DM",
			long: -61.37,
			lat: 15.41
		}, {
			isoCode: "XV",
			long: -66.85,
			lat: 1.23
		}, {
			isoCode: "WS",
			long: -172.1,
			lat: -13.76
		}, {
			isoCode: "XA",
			long: 41.9,
			lat: 3.86
		}, {
			isoCode: "XG",
			long: -74,
			lat: 40.73
		}];

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainercovmap");

		const showHelp = containerDiv.node().getAttribute("data-showhelp") === "true";

		const showLink = containerDiv.node().getAttribute("data-showlink") === "true";

		const showNamesOption = queryStringValues.has("shownames") ? queryStringValues.get("shownames") === "true" : containerDiv.node().getAttribute("data-shownames") === "true";

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

		const lazyLoad = containerDiv.node().getAttribute("data-lazyload") === "true";

		const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

		const selectedCbpfAllocation = queryStringValues.has("cbpfallocation") && cbpfAllocationTypes.indexOf(queryStringValues.get("cbpfallocation")) > -1 ? queryStringValues.get("cbpfallocation") :
			cbpfAllocationTypes.indexOf(containerDiv.node().getAttribute("data-cbpfallocation")) > -1 ?
			containerDiv.node().getAttribute("data-cbpfallocation") : "total";

		const selectedCerfAllocation = queryStringValues.has("cerfallocation") && cerfAllocationTypes.indexOf(queryStringValues.get("cerfallocation")) > -1 ? queryStringValues.get("cerfallocation") :
			cerfAllocationTypes.indexOf(containerDiv.node().getAttribute("data-cerfallocation")) > -1 ?
			containerDiv.node().getAttribute("data-cerfallocation") : "total";

		chartState.selectedCbpfAllocation = selectedCbpfAllocation;

		chartState.selectedCerfAllocation = selectedCerfAllocation;

		chartState.showNames = showNamesOption;

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "covmapTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "covmapTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "covmapIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const yearsDescriptionDiv = containerDiv.append("div")
			.attr("class", "covmapYearsDescriptionDiv");

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "covmapFooterDiv") : null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "covmapSnapshotTooltip")
			.attr("class", "covmapSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "covmapSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "covmapSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "covmapTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "covmaptooltipdiv")
			.style("display", "none");

		containerDiv.on("contextmenu", function() {
			d3.event.preventDefault();
			const thisMouse = d3.mouse(this);
			isSnapshotTooltipVisible = true;
			snapshotTooltip.style("display", "block")
				.style("top", thisMouse[1] - 4 + "px")
				.style("left", thisMouse[0] - 4 + "px");
		});

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "covmapbuttonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 0, 0],
			buttonWidth: 54,
			buttonsMargin: 4,
			buttonsPadding: 6,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			cbpfMargin: 386,
			cbpfButtonsMargin: 426,
			cerfMargin: 606,
			cerfButtonsMargin: 646,
		};

		const mapPanel = {
			main: svg.append("g")
				.attr("class", "covmapmapPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: mapPanelHeight,
			padding: [0, 0, 0, 0],
		};

		const legendPanel = {
			main: svg.append("g")
				.attr("class", "covmaplegendPanel")
				.attr("transform", "translate(" + (padding[3] + legendPanelHorPadding) + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding + mapPanel.height - legendPanelHeight - legendPanelVertPadding) + ")"),
			width: legendPanelWidth,
			height: legendPanelHeight,
			padding: [20, 0, 12, 4],
		};

		const mapZoomButtonPanel = {
			main: svg.append("g")
				.attr("class", "covmapmapZoomButtonPanel")
				.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding) + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding + mapZoomButtonVertPadding) + ")"),
			width: mapZoomButtonSize,
			height: mapZoomButtonSize * 2,
			padding: [4, 4, 4, 4],
		};

		const checkboxesPanel = {
			main: svg.append("g")
				.attr("class", "covmapcheckboxesPanel")
				.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding + 1) + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding + mapZoomButtonVertPadding + mapZoomButtonPanel.height + showNamesMargin) + ")"),
			padding: [0, 0, 0, 0],
		};

		const mapBackground = mapPanel.main.append("rect")
			.attr("class", "covmapmapBackground")
			.attr("width", mapPanel.width)
			.attr("height", mapPanel.height)
			.style("fill", mapBackgroundColor);

		const mapPanelClip = mapPanel.main.append("clipPath")
			.attr("id", "covmapmapPanelClip")
			.append("rect")
			.attr("width", mapPanel.width)
			.attr("height", mapPanel.height);

		mapPanel.main.attr("clip-path", "url(#covmapmapPanelClip)");

		const mapContainer = mapPanel.main.append("g")
			.attr("class", "covmapmapContainer");

		const zoomLayer = mapPanel.main.append("g")
			.attr("class", "covmapzoomLayer")
			.style("opacity", 0)
			.attr("cursor", "move")
			.attr("pointer-events", "all");

		const zoomRectangle = zoomLayer.append("rect")
			.attr("width", mapPanel.width)
			.attr("height", mapPanel.height);

		const piesContainer = mapPanel.main.append("g")
			.attr("class", "covmappiesContainer");

		const mapProjection = d3.geoEquirectangular();

		const mapPath = d3.geoPath()
			.projection(mapProjection);

		const radiusScale = d3.scaleSqrt()
			.range([minPieSize, maxPieSize]);

		const arcGenerator = d3.arc()
			.innerRadius(0);

		const arcGeneratorEnter = d3.arc()
			.innerRadius(0)
			.outerRadius(0);

		const pieGenerator = d3.pie()
			.value(function(d) {
				return d.value;
			})
			.sort(null);

		const zoom = d3.zoom()
			.scaleExtent([1, 20])
			.extent([
				[0, 0],
				[mapPanel.width, mapPanel.height]
			])
			.translateExtent([
				[0, 0],
				[mapPanel.width, mapPanel.height]
			]);

		mapPanel.main.call(zoom);

		const defs = svg.append("defs");

		const filter = defs.append("filter")
			.attr("id", "covmapdropshadow")
			.attr('filterUnits', 'userSpaceOnUse');

		filter.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 3);

		filter.append("feOffset")
			.attr("dx", 0)
			.attr("dy", 0);

		const feComponent = filter.append("feComponentTransfer");

		feComponent.append("feFuncA")
			.attr("type", "linear")
			.attr("slope", 0.7);

		const feMerge = filter.append("feMerge");

		feMerge.append("feMergeNode");
		feMerge.append("feMergeNode")
			.attr("in", "SourceGraphic");

		mapZoomButtonPanel.main.style("filter", "url(#covmapdropshadow)");

		const tooltipSvgYScale = d3.scalePoint()
			.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
			.padding(0.5);

		const tooltipSvgXScale = d3.scaleLinear()
			.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]]);

		const tooltipSvgYAxis = d3.axisLeft(tooltipSvgYScale)
			.tickSize(0)
			.tickPadding(5);

		const tooltipSvgXAxis = d3.axisTop(tooltipSvgXScale)
			.tickSizeOuter(0)
			.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]))
			.ticks(3)
			.tickPadding(4)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		if (localStorage.getItem("covmapmap")) {
			const mapData = JSON.parse(localStorage.getItem("covmapmap"));
			console.info("covmap: map from local storage");
			getData(mapData);
		} else {
			d3.json(mapUrl).then(function(mapData) {
				try {
					localStorage.setItem("covmapmap", JSON.stringify(mapData));
				} catch (error) {
					console.info("D3 chart covmap map, " + error);
				};
				console.info("covmap: map from API");
				getData(mapData);
			});
		};

		function getData(mapData) {
			if (localStorage.getItem("covmapdata") &&
				JSON.parse(localStorage.getItem("covmapdata")).timestamp > (currentDate.getTime() - localStorageTime)) {
				const rawData = d3.csvParse(JSON.parse(localStorage.getItem("covmapdata")).data);
				console.info("covmap: data from local storage");
				csvCallback(rawData, mapData);
			} else {
				d3.csv(dataUrl).then(function(rawData) {
					try {
						localStorage.setItem("covmapdata", JSON.stringify({
							data: d3.csvFormat(rawData),
							timestamp: currentDate.getTime()
						}));
					} catch (error) {
						console.info("D3 chart covmap data, " + error);
					};
					console.info("covmap: data from API");
					csvCallback(rawData, mapData);
				});
			};
		};

		function csvCallback(rawData, mapData) {

			preProcessData(rawData);

			validateYear(selectedYearString);

			removeProgressWheel();

			if (!lazyLoad) {
				draw(rawData, mapData);
			} else {
				d3.select(window).on("scroll.covmap", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.covmap", null);
					draw(rawData, mapData);
				};
			};

			//end of csvCallback
		};

		function draw(rawData, mapData) {

			//TEST
			// buttonsPanel.main.append("rect")
			// 	.attr("width", buttonsPanel.width)
			// 	.attr("height", buttonsPanel.height)
			// 	.style("opacity", 0.15);
			// mapLayer.append("rect")
			// 	.attr("width", mapPanel.width)
			// 	.attr("height", mapPanel.height)
			// 	.style("opacity", 0.15);
			// legendPanel.main.append("rect")
			// 	.attr("width", legendPanel.width)
			// 	.attr("height", legendPanel.height)
			// 	.style("fill", "green")
			// 	.style("opacity", 0.15);
			// mapZoomButtonPanel.main.append("rect")
			// 	.attr("width", mapZoomButtonPanel.width)
			// 	.attr("height", mapZoomButtonPanel.height)
			// 	.style("fill", "blue")
			// 	.style("opacity", 0.15);
			//TEST

			const data = processData(rawData);

			createTitle(rawData);

			createButtonsPanel(rawData);

			createMap(mapData);

			verifyCentroids(rawData);

			createZoomButtons();

			createCheckboxes();

			createPies(data);

			createLegend(data);

			if (!isPfbiSite) createFooterDiv();

			if (showHelp) createAnnotationsDiv();

			//end of draw
		};

		function createTitle(rawData) {

			const title = titleDiv.append("p")
				.attr("id", "covmapd3chartTitle")
				.html(chartTitle);

			const helpIcon = iconsDiv.append("button")
				.attr("id", "covmapHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "covmapDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			const snapshotDiv = iconsDiv.append("div")
				.attr("class", "covmapSnapshotDiv");

			const snapshotIcon = snapshotDiv.append("button")
				.attr("id", "covmapSnapshotButton");

			snapshotIcon.html("IMAGE ")
				.append("span")
				.attr("class", "fas fa-camera");

			const snapshotContent = snapshotDiv.append("div")
				.attr("class", "covmapSnapshotContent");

			const pdfSpan = snapshotContent.append("p")
				.attr("id", "covmapSnapshotPdfText")
				.html("Download PDF")
				.on("click", function() {
					createSnapshot("pdf", false);
				});

			const pngSpan = snapshotContent.append("p")
				.attr("id", "covmapSnapshotPngText")
				.html("Download Image (PNG)")
				.on("click", function() {
					createSnapshot("png", false);
				});

			const playIcon = iconsDiv.append("button")
				.datum({
					clicked: false
				})
				.attr("id", "covmapPlayButton");

			playIcon.html("PLAY  ")
				.append("span")
				.attr("class", "fas fa-play");

			playIcon.on("click", function(d) {
				d.clicked = !d.clicked;

				playIcon.html(d.clicked ? "PAUSE " : "PLAY  ")
					.append("span")
					.attr("class", d.clicked ? "fas fa-pause" : "fas fa-play");

				if (d.clicked) {
					chartState.selectedYear.length = 1;
					loopButtons();
					timer = d3.interval(loopButtons, 2 * duration);
				} else {
					timer.stop();
				};

				function loopButtons() {
					const index = yearsArray.indexOf(chartState.selectedYear[0]);

					chartState.selectedYear[0] = yearsArray[(index + 1) % yearsArray.length];

					const yearButton = d3.selectAll(".covmapbuttonsRects")
						.filter(function(d) {
							return d === chartState.selectedYear[0]
						});

					yearButton.dispatch("click");
					yearButton.dispatch("click");

					const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
						0 :
						chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
						yearsArray.length - buttonsNumber :
						yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

					const currentTranslate = -(buttonsPanel.buttonWidth * firstYearIndex);

					if (currentTranslate === 0) {
						svg.select(".covmapLeftArrowGroup").select("text").style("fill", "#ccc")
						svg.select(".covmapLeftArrowGroup").attr("pointer-events", "none");
					} else {
						svg.select(".covmapLeftArrowGroup").select("text").style("fill", "#666")
						svg.select(".covmapLeftArrowGroup").attr("pointer-events", "all");
					};

					if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
						svg.select(".covmapRightArrowGroup").select("text").style("fill", "#ccc")
						svg.select(".covmapRightArrowGroup").attr("pointer-events", "none");
					} else {
						svg.select(".covmapRightArrowGroup").select("text").style("fill", "#666")
						svg.select(".covmapRightArrowGroup").attr("pointer-events", "all");
					};

					svg.select(".covmapbuttonsGroup").transition()
						.duration(duration)
						.attrTween("transform", function() {
							return d3.interpolateString(this.getAttribute("transform"), "translate(" + currentTranslate + ",0)");
						});
				};
			});

			if (!isBookmarkPage) {

				const shareIcon = iconsDiv.append("button")
					.attr("id", "covmapShareButton");

				shareIcon.html("SHARE  ")
					.append("span")
					.attr("class", "fas fa-share");

				const shareDiv = containerDiv.append("div")
					.attr("class", "d3chartShareDiv")
					.style("display", "none");

				shareIcon.on("mouseover", function() {
						shareDiv.html("Click to copy")
							.style("display", "block");
						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv.node().getBoundingClientRect();
						const shareBox = shareDiv.node().getBoundingClientRect();
						const thisOffsetTop = thisBox.top - containerBox.top - (shareBox.height - thisBox.height) / 2;
						const thisOffsetLeft = thisBox.left - containerBox.left - shareBox.width - 12;
						shareDiv.style("top", thisOffsetTop + "px")
							.style("left", thisOffsetLeft + "20px");
					}).on("mouseout", function() {
						shareDiv.style("display", "none");
					})
					.on("click", function() {

						const newURL = bookmarkSite + queryStringValues.toString();

						const shareInput = shareDiv.append("input")
							.attr("type", "text")
							.attr("readonly", true)
							.attr("spellcheck", "false")
							.property("value", newURL);

						shareInput.node().select();

						document.execCommand("copy");

						shareDiv.html("Copied!");

						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv.node().getBoundingClientRect();
						const shareBox = shareDiv.node().getBoundingClientRect();
						const thisOffsetLeft = thisBox.left - containerBox.left - shareBox.width - 12;
						shareDiv.style("left", thisOffsetLeft + "20px");

					});

			};

			if (browserHasSnapshotIssues) {
				const bestVisualizedSpan = snapshotContent.append("p")
					.attr("id", "covmapBestVisualizedText")
					.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
					.attr("pointer-events", "none")
					.style("cursor", "default");
			};

			snapshotDiv.on("mouseover", function() {
				snapshotContent.style("display", "block")
			}).on("mouseout", function() {
				snapshotContent.style("display", "none")
			});

			helpIcon.on("click", createAnnotationsDiv);

			downloadIcon.on("click", function() {

				const csv = createCsv(rawData); //CHANGE

				const currentDate = new Date();

				const fileName = "covmap_" + csvDateFormat(currentDate) + ".csv";

				const blob = new Blob([csv], {
					type: 'text/csv;charset=utf-8;'
				});

				if (navigator.msSaveBlob) {
					navigator.msSaveBlob(blob, filename);
				} else {

					const link = document.createElement("a");

					if (link.download !== undefined) {

						const url = URL.createObjectURL(blob);

						link.setAttribute("href", url);
						link.setAttribute("download", fileName);
						link.style = "visibility:hidden";

						document.body.appendChild(link);

						link.click();

						document.body.removeChild(link);

					};
				};

			});

			//end of createTitle
		};

		function createMap(mapData) {

			const features = topojson.feature(mapData, mapData.objects.countries).features;

			const landObject = topojson.feature(mapData, mapData.objects.land);

			mapProjection.fitExtent([
				[mapPanel.padding[3], mapPanel.padding[0]],
				[(mapPanel.width - mapPanel.padding[1] - mapPanel.padding[3]), (mapPanel.height - mapPanel.padding[0] - mapPanel.padding[2])]
			], landObject);

			const land = mapContainer.append("path")
				.attr("d", mapPath(landObject))
				.style("fill", "#F9F9F7");

			const borders = mapContainer.append("path")
				.attr("d", mapPath(topojson.mesh(mapData, mapData.objects.countries, function(a, b) {
					return a !== b;
				})))
				.style("fill", "none")
				.style("stroke", "#F3E9EA")
				.style("stroke-width", "1px");

			features.forEach(function(d) {
				centroids[d.properties.isoCode] = {
					x: mapPath.centroid(d.geometry)[0],
					y: mapPath.centroid(d.geometry)[1]
				}
			});

			// centroids.XX = centroids.TR;

			//Countries with problems:
			//"KM","WS","AG","DM","MH","CV"
			//Comoros, (west) Samoa, Antigua and Barbuda, Dominica, Marshall Islands, Cabo Verde
			//And the fake codes: XV, XA and XG
			hardcodedAllocations.forEach(function(d) {
				const projected = mapProjection([d.long, d.lat]);
				centroids[d.isoCode] = {
					x: projected[0],
					y: projected[1]
				};
			});

			//end of createMap
		};

		function createZoomButtons() {

			const zoomInGroup = mapZoomButtonPanel.main.append("g")
				.attr("class", "covmapzoomInGroup")
				.attr("cursor", "pointer");

			const zoomInPath = zoomInGroup.append("path")
				.attr("class", "covmapzoomPath")
				.attr("d", function() {
					const drawPath = d3.path();
					drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
					drawPath.lineTo(0, mapZoomButtonPanel.padding[0]);
					drawPath.quadraticCurveTo(0, 0, mapZoomButtonPanel.padding[0], 0);
					drawPath.lineTo(mapZoomButtonPanel.width - mapZoomButtonPanel.padding[1], 0);
					drawPath.quadraticCurveTo(mapZoomButtonPanel.width, 0, mapZoomButtonPanel.width, mapZoomButtonPanel.padding[1]);
					drawPath.lineTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height / 2);
					drawPath.closePath();
					return drawPath.toString();
				});

			const zoomInText = zoomInGroup.append("text")
				.attr("class", "covmapzoomText")
				.attr("text-anchor", "middle")
				.attr("x", mapZoomButtonPanel.width / 2)
				.attr("y", (mapZoomButtonPanel.height / 4) + 7)
				.text("+");

			const zoomOutGroup = mapZoomButtonPanel.main.append("g")
				.attr("class", "covmapzoomOutGroup")
				.attr("cursor", "pointer");

			const zoomOutPath = zoomOutGroup.append("path")
				.attr("class", "covmapzoomPath")
				.attr("d", function() {
					const drawPath = d3.path();
					drawPath.moveTo(0, mapZoomButtonPanel.height / 2);
					drawPath.lineTo(0, mapZoomButtonPanel.height - mapZoomButtonPanel.padding[3]);
					drawPath.quadraticCurveTo(0, mapZoomButtonPanel.height, mapZoomButtonPanel.padding[3], mapZoomButtonPanel.height);
					drawPath.lineTo(mapZoomButtonPanel.width - mapZoomButtonPanel.padding[2], mapZoomButtonPanel.height);
					drawPath.quadraticCurveTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height, mapZoomButtonPanel.width, mapZoomButtonPanel.height - mapZoomButtonPanel.padding[2]);
					drawPath.lineTo(mapZoomButtonPanel.width, mapZoomButtonPanel.height / 2);
					drawPath.closePath();
					return drawPath.toString();
				});

			const zoomOutText = zoomOutGroup.append("text")
				.attr("class", "covmapzoomText")
				.attr("text-anchor", "middle")
				.attr("x", mapZoomButtonPanel.width / 2)
				.attr("y", (3 * mapZoomButtonPanel.height / 4) + 7)
				.text("−");

			const zoomLine = mapZoomButtonPanel.main.append("line")
				.attr("x1", 0)
				.attr("x2", mapZoomButtonPanel.width)
				.attr("y1", mapZoomButtonPanel.height / 2)
				.attr("y2", mapZoomButtonPanel.height / 2)
				.style("stroke", "#ccc")
				.style("stroke-width", "1px");

			//end of createZoomButtons
		};

		function createCheckboxes() {

			const showNamesGroup = checkboxesPanel.main.append("g")
				.attr("class", "covmapshowNamesGroup")
				.attr("cursor", "pointer");

			const outerRectangle = showNamesGroup.append("rect")
				.attr("width", 14)
				.attr("height", 14)
				.attr("rx", 2)
				.attr("ry", 2)
				.attr("fill", "white")
				.attr("stroke", "darkslategray");

			const innerCheck = showNamesGroup.append("polyline")
				.style("stroke-width", "2px")
				.attr("points", "3,7 6,10 11,3")
				.style("fill", "none")
				.style("stroke", chartState.showNames ? "darkslategray" : "white");

			const showNamesText = showNamesGroup.append("text")
				.attr("class", "covmapshowNamesText")
				.attr("x", 16)
				.attr("y", 11)
				.text("Show names");

			showNamesGroup.on("click", function() {

				chartState.showNames = !chartState.showNames;

				if (queryStringValues.has("shownames")) {
					queryStringValues.set("shownames", chartState.showNames);
				} else {
					queryStringValues.append("shownames", chartState.showNames);
				};

				innerCheck.style("stroke", chartState.showNames ? "darkslategray" : "white");

				piesContainer.selectAll("text, tspan")
					.style("opacity", chartState.showNames ? 1 : 0);

			});

			//end of createCheckboxes
		};

		function createButtonsPanel(rawData) {

			const clipPath = buttonsPanel.main.append("clipPath")
				.attr("id", "covmapclip")
				.append("rect")
				.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
				.attr("height", buttonsPanel.height);

			const clipPathGroup = buttonsPanel.main.append("g")
				.attr("class", "covmapClipPathGroup")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding) + ",0)")
				.attr("clip-path", "url(#covmapclip)");

			const buttonsGroup = clipPathGroup.append("g")
				.attr("class", "covmapbuttonsGroup")
				.attr("transform", "translate(0,0)")
				.style("cursor", "pointer");

			const buttonsRects = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "covmapbuttonsRects")
				.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonsMargin)
				.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonsMargin / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear.indexOf(d) > -1 ? unBlue : "#eaeaea";
				});

			const buttonsText = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "covmapbuttonsText")
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear.indexOf(d) > -1 ? "white" : "#444";
				})
				.text(function(d) {
					return d;
				});

			const cbpfTitle = buttonsPanel.main.append("text")
				.attr("class", "covmapcbpfTitle")
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", buttonsPanel.cbpfMargin)
				.text("CBPF:");

			const buttonsCbpfGroup = buttonsPanel.main.selectAll(null)
				.data(cbpfAllocationTypes)
				.enter()
				.append("g")
				.attr("class", "covmapbuttonsCbpfGroup")
				.attr("transform", "translate(" + (buttonsPanel.cbpfButtonsMargin) + ",0)")
				.style("cursor", "pointer");

			const buttonsCbpfRects = buttonsCbpfGroup.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "covmapbuttonsCbpfRects")
				.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding)
				.style("fill", function(d) {
					return d === chartState.selectedCbpfAllocation ? cbpfColor : "#eaeaea";
				});

			const buttonsCbpfText = buttonsCbpfGroup.append("text")
				.attr("class", "covmapbuttonsCbpfText")
				.attr("font-family", "Arial")
				.attr("font-size", 12)
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", buttonsPanel.buttonsPadding)
				.style("fill", function(d) {
					return d === chartState.selectedCbpfAllocation ? "white" : "#444";
				})
				.text(function(d) {
					return capitalize(d);
				})
				.each(function() {
					localVariable.set(this.parentNode, this.getComputedTextLength())
				});

			buttonsCbpfRects.each(function() {
				d3.select(this)
					.attr("width", localVariable.get(this.parentNode) + 2 * buttonsPanel.buttonsPadding);
			});

			buttonsCbpfGroup.each(function(_, i) {
				d3.select(this).attr("transform", "translate(" + (i ? localVariable.get(this.previousSibling) : buttonsPanel.cbpfButtonsMargin) + ",0)")
				localVariable.set(this, this.getBBox().width + buttonsPanel.buttonsMargin + (i ? localVariable.get(this.previousSibling) : buttonsPanel.cbpfButtonsMargin));
			});

			const cerfTitle = buttonsPanel.main.append("text")
				.attr("class", "covmapcerfTitle")
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", buttonsPanel.cerfMargin)
				.text("CERF:");

			const buttonsCerfGroup = buttonsPanel.main.selectAll(null)
				.data(cerfAllocationTypes)
				.enter()
				.append("g")
				.attr("class", "covmapbuttonsCerfGroup")
				.attr("transform", "translate(" + (buttonsPanel.cerfButtonsMargin) + ",0)")
				.style("cursor", "pointer");

			const buttonsCerfRects = buttonsCerfGroup.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "covmapbuttonsCerfRects")
				.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding)
				.style("fill", function(d) {
					return d === chartState.selectedCbpfAllocation ? d3.color(cerfColor).darker(0.4) : "#eaeaea";
				});

			const buttonsCerfText = buttonsCerfGroup.append("text")
				.attr("class", "covmapbuttonsCerfText")
				.attr("font-family", "Arial")
				.attr("font-size", 12)
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", buttonsPanel.buttonsPadding)
				.style("fill", function(d) {
					return d === chartState.selectedCbpfAllocation ? "white" : "#444";
				})
				.text(function(d) {
					return d === "rapidresponse" ? "Rapid Response" : capitalize(d);
				})
				.each(function() {
					localVariable.set(this.parentNode, this.getComputedTextLength())
				});

			buttonsCerfRects.each(function() {
				d3.select(this)
					.attr("width", localVariable.get(this.parentNode) + 2 * buttonsPanel.buttonsPadding);
			});

			buttonsCerfGroup.each(function(_, i) {
				d3.select(this).attr("transform", "translate(" + (i ? localVariable.get(this.previousSibling) : buttonsPanel.cerfButtonsMargin) + ",0)")
				localVariable.set(this, this.getBBox().width + buttonsPanel.buttonsMargin + (i ? localVariable.get(this.previousSibling) : buttonsPanel.cerfButtonsMargin));
			});

			const leftArrow = buttonsPanel.main.append("g")
				.attr("class", "covmapLeftArrowGroup")
				.style("cursor", "pointer")
				.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

			const leftArrowRect = leftArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height);

			const leftArrowText = leftArrow.append("text")
				.attr("class", "covmapleftArrowText")
				.attr("x", 0)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25c4");

			const rightArrow = buttonsPanel.main.append("g")
				.attr("class", "covmapRightArrowGroup")
				.style("cursor", "pointer")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
					(buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

			const rightArrowRect = rightArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height);

			const rightArrowText = rightArrow.append("text")
				.attr("class", "covmaprightArrowText")
				.attr("x", -1)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25ba");

			buttonsRects.on("mouseover", mouseOverButtonsRects)
				.on("mouseout", mouseOutButtonsRects)
				.on("click", function(d) {
					const self = this;
					if (d3.event.altKey) clickButtonsRects(d, true);
					if (localVariable.get(this) !== "clicked") {
						localVariable.set(this, "clicked");
						setTimeout(function() {
							if (localVariable.get(self) === "clicked") {
								clickButtonsRects(d, false);
							};
							localVariable.set(self, null);
						}, 250);
					} else {
						clickButtonsRects(d, true);
						localVariable.set(this, null);
					};
				});

			buttonsCbpfRects.on("mouseover", mouseOverButtonsCbpfRects)
				.on("mouseout", mouseOutButtonsCbpfRects);

			buttonsCerfRects.on("mouseover", mouseOverButtonsCerfRects)
				.on("mouseout", mouseOutButtonsCerfRects);

			repositionButtonsGroup();

			checkCurrentTranslate();

			leftArrow.on("click", function() {
				leftArrow.attr("pointer-events", "none");
				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
				rightArrow.select("text").style("fill", "#666");
				rightArrow.attr("pointer-events", "all");
				buttonsGroup.transition()
					.duration(duration)
					.attr("transform", "translate(" +
						Math.min(0, (currentTranslate + buttonsNumber * buttonsPanel.buttonWidth)) + ",0)")
					.on("end", checkArrows);
			});

			rightArrow.on("click", function() {
				rightArrow.attr("pointer-events", "none");
				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
				leftArrow.select("text").style("fill", "#666");
				leftArrow.attr("pointer-events", "all");
				buttonsGroup.transition()
					.duration(duration)
					.attr("transform", "translate(" +
						Math.max(-((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth),
							(-(Math.abs(currentTranslate) + buttonsNumber * buttonsPanel.buttonWidth))) +
						",0)")
					.on("end", checkArrows);
			});

			function checkArrows() {

				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

				if (currentTranslate === 0) {
					leftArrow.select("text").style("fill", "#ccc");
					leftArrow.attr("pointer-events", "none");
				} else {
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
				};

				if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
					rightArrow.select("text").style("fill", "#ccc");
					rightArrow.attr("pointer-events", "none");
				} else {
					rightArrow.select("text").style("fill", "#666");
					rightArrow.attr("pointer-events", "all");
				}

			};

			function checkCurrentTranslate() {

				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

				if (currentTranslate === 0) {
					leftArrow.select("text").style("fill", "#ccc")
					leftArrow.attr("pointer-events", "none");
				};

				if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
					rightArrow.select("text").style("fill", "#ccc")
					rightArrow.attr("pointer-events", "none");
				};

			};

			function repositionButtonsGroup() {

				const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
					0 :
					chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
					yearsArray.length - buttonsNumber :
					yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

				buttonsGroup.attr("transform", "translate(" +
					(-(buttonsPanel.buttonWidth * firstYearIndex)) +
					",0)");

			};

			function mouseOverButtonsRects(d) {
				d3.select(this).style("fill", unBlue);
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsRects(d) {
				if (chartState.selectedYear.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function mouseOverButtonsCbpfRects(d) {
				d3.select(this).style("fill", cbpfColor);
				buttonsCbpfText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsCbpfRects(d) {
				if (d === chartState.selectedCbpfAllocation) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsCbpfText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function mouseOverButtonsCerfRects(d) {
				d3.select(this).style("fill", d3.color(cerfColor).darker(0.4));
				buttonsCerfText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsCerfRects(d) {
				if (d === chartState.selectedCerfAllocation) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsCerfText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function clickButtonsRects(d, singleSelection) {

				if (singleSelection) {
					chartState.selectedYear = [d];
				} else {
					const index = chartState.selectedYear.indexOf(d);
					if (index > -1) {
						if (chartState.selectedYear.length === 1) {
							return;
						} else {
							chartState.selectedYear.splice(index, 1);
						}
					} else {
						chartState.selectedYear.push(d);
					};
				};

				const allYears = chartState.selectedYear.map(function(d) {
					return d;
				}).join("|");

				if (queryStringValues.has("year")) {
					queryStringValues.set("year", allYears);
				} else {
					queryStringValues.append("year", allYears);
				};

				buttonsRects.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
				});

				buttonsText.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
				});

				const data = processData(rawData);

				createPies(data);

				createLegend(data);

				setYearsDescriptionDiv();

				//end of clickButtonsRects
			};

			buttonsCbpfRects.on("click", function(d) {

				chartState.selectedCbpfAllocation = d;

				if (queryStringValues.has("cbpfallocation")) {
					queryStringValues.set("cbpfallocation", d);
				} else {
					queryStringValues.append("cbpfallocation", d);
				};

				buttonsPanel.main.selectAll(".covmapbuttonsCbpfRects")
					.style("fill", function(e) {
						return e === chartState.selectedCbpfAllocation ? cbpfColor : "#eaeaea";
					});

				buttonsPanel.main.selectAll(".covmapbuttonsCbpfText")
					.style("fill", function(e) {
						return e === chartState.selectedCbpfAllocation ? "white" : "#444";
					});

				const data = processData(rawData);

				createPies(data);

				createLegend(data);

			});

			buttonsCerfRects.on("click", function(d) {

				chartState.selectedCerfAllocation = d;

				if (queryStringValues.has("cerfallocation")) {
					queryStringValues.set("cerfallocation", d);
				} else {
					queryStringValues.append("cerfallocation", d);
				};

				buttonsPanel.main.selectAll(".covmapbuttonsCerfRects")
					.style("fill", function(e) {
						return e === chartState.selectedCerfAllocation ? d3.color(cerfColor).darker(0.4) : "#eaeaea";
					});

				buttonsPanel.main.selectAll(".covmapbuttonsCerfText")
					.style("fill", function(e) {
						return e === chartState.selectedCerfAllocation ? "white" : "#444";
					});

				const data = processData(rawData);

				createPies(data);

				createLegend(data);

			});

			//end of createButtonsPanel
		};

		function createPies(unfilteredData) {

			const data = unfilteredData.filter(function(d) {
				return d["cbpf" + chartState.selectedCbpfAllocation] + d["cerf" + chartState.selectedCerfAllocation];
			});

			zoom.on("zoom", zoomed);

			const currentTransform = d3.zoomTransform(mapPanel.main.node());

			data.sort(function(a, b) {
				return (b["cbpf" + chartState.selectedCbpfAllocation] + b["cerf" + chartState.selectedCerfAllocation]) -
					(a["cbpf" + chartState.selectedCbpfAllocation] + a["cerf" + chartState.selectedCerfAllocation]);
			});

			const maxValue = d3.max(data, function(d) {
				return d["cbpf" + chartState.selectedCbpfAllocation] + d["cerf" + chartState.selectedCerfAllocation];
			});

			radiusScale.domain([0, maxValue || 0]);

			let pieGroup = piesContainer.selectAll(".covmappieGroup")
				.data(data, function(d) {
					return d.isoCode;
				});

			const pieGroupExit = pieGroup.exit();

			pieGroupExit.selectAll("text, tspan")
				.transition()
				.duration(duration * 0.9)
				.style("opacity", 0);

			pieGroupExit.each(function(d) {
				const thisGroup = d3.select(this);
				thisGroup.selectAll(".covmapslice")
					.transition()
					.duration(duration)
					.attrTween("d", function(d) {
						const finalObject = d.data.type === "cerf" ? {
							startAngle: 0,
							endAngle: 0,
							outerRadius: 0
						} : {
							startAngle: Math.PI * 2,
							endAngle: Math.PI * 2,
							outerRadius: 0
						};
						const i = d3.interpolateObject(localVariable.get(this), finalObject);
						return function(t) {
							return arcGenerator(i(t));
						};
					})
					.on("end", function() {
						thisGroup.remove();
					})
			});

			const pieGroupEnter = pieGroup.enter()
				.append("g")
				.attr("class", "covmappieGroup")
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + (centroids[d.isoCode].x * currentTransform.k + currentTransform.x) +
						"," + (centroids[d.isoCode].y * currentTransform.k + currentTransform.y) + ")";
				});

			const groupName = pieGroupEnter.append("text")
				.attr("class", "covmapgroupName")
				.attr("x", function(d) {
					return radiusScale(d["cbpf" + chartState.selectedCbpfAllocation] + d["cerf" + chartState.selectedCerfAllocation]) + groupNamePadding;
				})
				.attr("y", function(d) {
					return d.labelText.length > 1 ? groupNamePadding * 2 - 5 : groupNamePadding * 2;
				})
				.style("opacity", 0)
				.text(function(d) {
					return d.labelText.length > 2 ? d.labelText[0] + " " + d.labelText[1] :
						d.labelText[0];
				})
				.each(function(d) {
					if (d.labelText.length > 1) {
						d3.select(this).append("tspan")
							.attr("x", radiusScale(d["cbpf" + chartState.selectedCbpfAllocation] + d["cerf" + chartState.selectedCerfAllocation]) + groupNamePadding)
							.attr("dy", 12)
							.text(d.labelText.length > 2 ? d.labelText.filter(function(_, i) {
									return i > 1;
								}).join(" ") :
								d.labelText[1]);
					};
				});

			pieGroup = pieGroupEnter.merge(pieGroup);

			pieGroup.order();

			pieGroup.select("text")
				.transition()
				.duration(duration)
				.style("opacity", chartState.showNames ? 1 : 0)
				.attr("x", function(d) {
					return radiusScale(d["cbpf" + chartState.selectedCbpfAllocation] + d["cerf" + chartState.selectedCerfAllocation]) + groupNamePadding;
				});

			pieGroup.select("tspan")
				.transition()
				.duration(duration)
				.style("opacity", chartState.showNames ? 1 : 0)
				.attr("x", function(d) {
					return radiusScale(d["cbpf" + chartState.selectedCbpfAllocation] + d["cerf" + chartState.selectedCerfAllocation]) + groupNamePadding;
				});

			let slices = pieGroup.selectAll(".covmapslice")
				.data(function(d) {
					return pieGenerator([{
						value: d["cerf" + chartState.selectedCerfAllocation],
						total: d["cbpf" + chartState.selectedCbpfAllocation] + d["cerf" + chartState.selectedCerfAllocation],
						type: "cerf"
					}, {
						value: d["cbpf" + chartState.selectedCbpfAllocation],
						total: d["cbpf" + chartState.selectedCbpfAllocation] + d["cerf" + chartState.selectedCerfAllocation],
						type: "cbpf"
					}].filter(function(e) {
						return e.value !== 0;
					}))
				}, function(d) {
					return d.data.type;
				});

			const slicesRemove = slices.exit()
				.transition()
				.duration(duration)
				.attrTween("d", function(d) {
					const parentDatum = d3.select(this.parentNode).datum();
					const thisTotal = radiusScale(parentDatum["cbpf" + chartState.selectedCbpfAllocation] + parentDatum["cerf" + chartState.selectedCerfAllocation]);
					const finalObject = d.data.type === "cerf" ? {
						startAngle: 0,
						endAngle: 0,
						outerRadius: thisTotal
					} : {
						startAngle: Math.PI * 2,
						endAngle: Math.PI * 2,
						outerRadius: thisTotal
					};
					const i = d3.interpolateObject(localVariable.get(this), finalObject);
					return function(t) {
						return arcGenerator(i(t));
					};
				})
				.on("end", function() {
					d3.select(this).remove();
				})

			const slicesEnter = slices.enter()
				.append("path")
				.attr("class", "covmapslice")
				.style("fill", function(d) {
					return d.data.type === "cbpf" ? cbpfColor : cerfColor;
				})
				.style("stroke", "#666")
				.style("stroke-width", "0.5px")
				.each(function(d) {
					let siblingRadius = 0
					const siblings = d3.select(this.parentNode).selectAll("path")
						.each(function() {
							const thisLocal = localVariable.get(this)
							if (thisLocal) siblingRadius = thisLocal.outerRadius;
						});
					if (d.data.type === "cerf") {
						localVariable.set(this, {
							startAngle: 0,
							endAngle: 0,
							outerRadius: siblingRadius
						});
					} else {
						localVariable.set(this, {
							startAngle: Math.PI * 2,
							endAngle: Math.PI * 2,
							outerRadius: siblingRadius
						});
					};
				})

			slices = slicesEnter.merge(slices);

			slices.transition()
				.duration(duration)
				.attrTween("d", pieTween);

			function pieTween(d) {
				const i = d3.interpolateObject(localVariable.get(this), {
					startAngle: d.startAngle,
					endAngle: d.endAngle,
					outerRadius: radiusScale(d.data.total)
				});
				localVariable.set(this, i(1));
				return function(t) {
					return arcGenerator(i(t));
				};
			};

			pieGroup.on("mouseover", pieGroupMouseover)
				.on("mouseout", pieGroupMouseout);

			function zoomed() {

				mapContainer.attr("transform", d3.event.transform);

				mapContainer.select("path:nth-child(2)")
					.style("stroke-width", 1 / d3.event.transform.k + "px");

				pieGroup.attr("transform", function(d) {
					return "translate(" + (centroids[d.isoCode].x * d3.event.transform.k + d3.event.transform.x) +
						"," + (centroids[d.isoCode].y * d3.event.transform.k + d3.event.transform.y) + ")";
				});

				//end of zoomed
			};

			mapZoomButtonPanel.main.select(".covmapzoomInGroup")
				.on("click", function() {
					zoom.scaleBy(mapPanel.main.transition().duration(duration), 2);
				});

			mapZoomButtonPanel.main.select(".covmapzoomOutGroup")
				.on("click", function() {
					zoom.scaleBy(mapPanel.main.transition().duration(duration), 0.5);
				});

			function pieGroupMouseover(datum) {

				currentHoveredElem = this;

				pieGroup.style("opacity", function() {
					return this === currentHoveredElem ? 1 : fadeOpacity;
				});

				tooltip.style("display", "block")
					.html(null);

				tooltip.append("div")
					.style("margin-bottom", "10px")
					.style("font-size", "16px")
					.attr("class", "contributionColorHTMLcolor")
					.style("width", "310px")
					.append("strong")
					.html(datum.country);

				const tooltipContainer = tooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "310px");

				const tooltipData = [{
					title: "CBPF (" + chartState.selectedCbpfAllocation + ")",
					property: "cbpf" + chartState.selectedCbpfAllocation,
					color: cbpfColor
				}, {
					title: "under approval",
					property: "cbpf" + chartState.selectedCbpfAllocation + "underapproval",
					color: cbpfColor
				}, {
					title: "CERF (" + (chartState.selectedCerfAllocation === "rapidresponse" ? "rapid response" : chartState.selectedCerfAllocation) + ")",
					property: "cerf" + chartState.selectedCerfAllocation,
					color: d3.color(cerfColor).darker(0.4)
				}, {
					title: "under approval",
					property: "cerf" + chartState.selectedCerfAllocation + "underapproval",
					color: d3.color(cerfColor).darker(0.4)
				}];

				tooltipData.forEach(function(e, i) {
					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 56%")
						.style("margin-bottom", i === 1 ? "8px" : null)
						.html(e.title);

					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 44%")
						.style("justify-content", "flex-end")
						.style("color", e.color)
						.style("margin-bottom", i === 1 ? "8px" : null)
						.html("$" + formatMoney0Decimals(datum[e.property]).replace("G", "B"));
				});

				if (datum["cbpf" + chartState.selectedCbpfAllocation]) {

					tooltip.append("div")
						.style("margin-bottom", "4px")
						.style("margin-top", "12px")
						.style("font-size", "12px")
						.attr("class", "contributionColorHTMLcolor")
						.html("CBPF Partners:");

					const tooltipSvg = tooltip.append("svg")
						.attr("width", tooltipSvgWidth)
						.attr("height", tooltipSvgHeight);

					const svgData = partnerTypes.map(function(d) {
						return {
							partner: d,
							value: datum["cbpf" + chartState.selectedCbpfAllocation + d]
						};
					}).sort(function(a, b) {
						return b.value - a.value;
					});

					tooltipSvgYScale.domain(svgData.map(function(d) {
						return d.partner;
					}));

					tooltipSvgXScale.domain([0, d3.max(svgData, function(d) {
						return d.value;
					})]);

					const yAxisGroup = tooltipSvg.append("g")
						.attr("class", "covmapTooltipSvgYAxisGroup")
						.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
						.call(tooltipSvgYAxis);

					const xAxisGroup = tooltipSvg.append("g")
						.attr("class", "covmapTooltipSvgXAxisGroup")
						.attr("transform", "translate(0," + tooltipSvgPadding[0] + ")")
						.call(tooltipSvgXAxis)
						.selectAll(".tick")
						.filter(function(d) {
							return d === 0;
						})
						.remove();

					const cbpfGroups = tooltipSvg.selectAll(null)
						.data(svgData)
						.enter()
						.append("g")
						.attr("transform", function(d) {
							return "translate(0," + tooltipSvgYScale(d.partner) + ")";
						})
						.each(function(d) {
							d3.select(this).append("rect")
								.attr("x", tooltipSvgPadding[3])
								.attr("y", -stickHeight / 4)
								.attr("height", stickHeight)
								.attr("width", 0)
								.style("fill", cbpfColor)
								.transition()
								.duration(duration)
								.attr("width", tooltipSvgXScale(d.value) - tooltipSvgPadding[3]);

							d3.select(this).append("circle")
								.attr("cx", tooltipSvgPadding[3])
								.attr("cy", (stickHeight / 4))
								.attr("r", lollipopRadius)
								.style("fill", cbpfColor)
								.transition()
								.duration(duration)
								.attr("cx", tooltipSvgXScale(d.value));

							d3.select(this).append("text")
								.attr("class", "covmapcbpfLabel")
								.attr("x", tooltipSvgXScale(0))
								.attr("y", 4)
								.text(formatNumberSI(0))
								.transition()
								.duration(duration)
								.attr("x", tooltipSvgXScale(d.value) + labelPadding + lollipopRadius)
								.textTween(function() {
									const i = d3.interpolate(0, d.value);
									return function(t) {
										return d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
									};
								});
						})

				};

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

				const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
					thisBox.right - containerBox.left + tooltipMargin :
					thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");


			};

			function pieGroupMouseout() {

				if (isSnapshotTooltipVisible) return;

				currentHoveredElem = null;

				pieGroup.style("opacity", 1);

				tooltip.html(null)
					.style("display", "none");

			};

			//end of createPies
		};

		function createLegend(data) {

			const maxDataValue = radiusScale.domain()[1];

			const sizeCirclesData = [0, maxDataValue / 4, maxDataValue / 2, maxDataValue];

			const legendTitle = legendPanel.main.selectAll(".covmaplegendTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "covmaplegendTitle")
				.attr("x", legendPanel.padding[3])
				.attr("y", legendPanel.padding[0] - 10)
				.text("Legend");

			let legendSizeGroups = legendPanel.main.selectAll(".covmaplegendSizeGroups")
				.data([true]);

			legendSizeGroups = legendSizeGroups.enter()
				.append("g")
				.attr("class", "covmaplegendSizeGroups")
				.merge(legendSizeGroups);

			let legendSizeGroup = legendSizeGroups.selectAll(".covmaplegendSizeGroup")
				.data(sizeCirclesData);

			const legendSizeGroupEnter = legendSizeGroup.enter()
				.append("g")
				.attr("class", "covmaplegendSizeGroup");

			const legendSizeLines = legendSizeGroupEnter.append("line")
				.attr("x1", legendPanel.padding[3] + radiusScale.range()[1])
				.attr("x2", legendPanel.padding[3] + radiusScale.range()[1] + 30)
				.attr("y1", function(d) {
					return d ? legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
						legendPanel.padding[0] + (radiusScale.range()[1] * 2);
				})
				.attr("y2", function(d) {
					return d ? legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
						legendPanel.padding[0] + (radiusScale.range()[1] * 2);
				})
				.style("stroke", "#666")
				.style("stroke-dasharray", "2,2")
				.style("stroke-width", "1px");

			const legendSizeCircles = legendSizeGroupEnter.append("circle")
				.attr("cx", legendPanel.padding[3] + radiusScale.range()[1])
				.attr("cy", function(d) {
					return legendPanel.padding[0] + (radiusScale.range()[1] * 2) - radiusScale(d);
				})
				.attr("r", function(d) {
					return !d ? 0 : radiusScale(d);
				})
				.style("fill", "none")
				.style("stroke", "darkslategray");

			const legendSizeCirclesText = legendSizeGroupEnter.append("text")
				.attr("class", "covmaplegendCirclesText")
				.attr("x", legendPanel.padding[3] + radiusScale.range()[1] + 34)
				.attr("y", function(d, i) {
					return i === 1 ? legendPanel.padding[0] + 5 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
						i ? legendPanel.padding[0] + 3 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
						legendPanel.padding[0] + 3 + (radiusScale.range()[1] * 2) - 2;
				})
				.text(function(d) {
					return d ? d3.formatPrefix(".0", d)(d) : "0";
				});

			legendSizeGroup = legendSizeGroup.merge(legendSizeGroupEnter);

			legendSizeGroup.select(".covmaplegendCirclesText")
				.transition()
				.duration(duration)
				.textTween(function(d) {
					const i = d3.interpolate(reverseFormat(this.textContent) || 0, d);
					return function(t) {
						return d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
					};
				});

			const legendColors = legendPanel.main.selectAll(".covmaplegendColors")
				.data(["cbpf", "cerf"])
				.enter()
				.append("g")
				.attr("class", "covmaplegendColors")
				.attr("transform", function(_, i) {
					return "translate(" + (legendPanel.padding[3] + i * 44) + "," + (legendPanel.height - legendPanel.padding[2]) + ")";
				});

			legendColors.append("rect")
				.attr("width", 8)
				.attr("height", 8)
				.attr("rx", 1)
				.attr("ry", 1)
				.style("stroke-width", "0.5px")
				.style("stroke", "#666")
				.style("fill", function(_, i) {
					return i ? cerfColor : cbpfColor;
				});

			legendColors.append("text")
				.attr("x", 10)
				.attr("y", 8)
				.text(function(d) {
					return d.toUpperCase();
				});

			//end of createLegend
		};

		function preProcessData(rawData) {

			rawData.forEach(function(row) {
				if (yearsArray.indexOf(+row.AllocationYear) === -1) yearsArray.push(+row.AllocationYear);
				if (!countryNames[row.PooledFundIso] && row.PooledFundIso) countryNames[row.PooledFundIso] = row.PooledFundName;
				if (row.FundType.toLowerCase() === "cbpf" && partnerTypes.indexOf(row.OrganizationType) === -1) partnerTypes.push(row.OrganizationType);
			});

			yearsArray.sort(function(a, b) {
				return a - b;
			});

			//end of preProcessData
		};

		function processData(rawData) {

			const data = [];

			rawData.forEach(function(row) {
				if (chartState.selectedYear.indexOf(+row.AllocationYear) > -1 && row.PooledFundIso) {
					if (chartState.countriesInData.indexOf(row.PooledFundIso) === -1) chartState.countriesInData.push(row.PooledFundIso);

					const foundCountry = data.find(function(d) {
						return d.isoCode === row.PooledFundIso;
					});

					if (foundCountry) {
						pushCbpfOrCerf(foundCountry, row);
					} else {
						const countryObject = {
							country: row.PooledFundName,
							labelText: row.PooledFundName.split(" "),
							isoCode: row.PooledFundIso,
							cbpfstandard: 0,
							cbpfreserve: 0,
							cbpftotal: 0,
							cbpfstandardunderapproval: 0,
							cbpfreserveunderapproval: 0,
							cbpftotalunderapproval: 0,
							cerfrapidresponse: 0,
							cerfunderfunded: 0,
							cerftotal: 0,
							cerfrapidresponseunderapproval: 0,
							cerfunderfundedunderapproval: 0,
							cerftotalunderapproval: 0,
						};
						partnerTypes.forEach(function(partner) {
							countryObject["cbpfstandard" + partner] = 0;
							countryObject["cbpfreserve" + partner] = 0;
							countryObject["cbpftotal" + partner] = 0;
						});
						pushCbpfOrCerf(countryObject, row);
						data.push(countryObject);
					};
				};
			});

			return data;

			function pushCbpfOrCerf(obj, row) {
				if (row.FundType.toLowerCase() === "cbpf") {
					obj.cbpfstandard += +row.ApprovedStandardBudget;
					obj.cbpfreserve += +row.ApprovedReserveBudget;
					obj.cbpftotal += (+row.ApprovedStandardBudget) + (+row.ApprovedReserveBudget);
					obj.cbpfstandardunderapproval += +row.PipelineStandardBudget;
					obj.cbpfreserveunderapproval += +row.PipelineReserveBudget;
					obj.cbpftotalunderapproval += (+row.PipelineStandardBudget) + (+row.PipelineReserveBudget);
					obj["cbpfstandard" + row.OrganizationType] += +row.ApprovedStandardBudget;
					obj["cbpfreserve" + row.OrganizationType] += +row.ApprovedReserveBudget;
					obj["cbpftotal" + row.OrganizationType] += (+row.ApprovedStandardBudget) + (+row.ApprovedReserveBudget);
				} else if (row.FundType.toLowerCase() === "cerf") {
					obj.cerfrapidresponse += +row.ApprovedRrBudget;
					obj.cerfunderfunded += +row.ApprovedUnderfundedBudget;
					obj.cerftotal += (+row.ApprovedRrBudget) + (+row.ApprovedUnderfundedBudget);
					obj.cerfrapidresponseunderapproval += +row.PipelineRrBudget;;
					obj.cerfunderfundedunderapproval += +row.PipelineUnderfundedBudget;;
					obj.cerftotalunderapproval += (+row.PipelineRrBudget) + (+row.PipelineUnderfundedBudget);;
				};
			};

			//end of processData
		};

		function createCsv(datahere) {

			const csv = d3.csvFormat(changedDataHere);

			return csv;
		};

		function setYearsDescriptionDiv() {
			yearsDescriptionDiv.html(function() {
				if (chartState.selectedYear.length === 1) return null;
				const yearsList = chartState.selectedYear.sort(function(a, b) {
					return a - b;
				}).reduce(function(acc, curr, index) {
					return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
				}, "");
				return "\u002ASelected years: " + yearsList;
			});
		};

		function validateYear(yearString) {
			const allYears = yearString.split(",").map(function(d) {
				return +(d.trim());
			}).sort(function(a, b) {
				return a - b;
			});
			allYears.forEach(function(d) {
				if (d && yearsArray.indexOf(d) > -1) chartState.selectedYear.push(d);
			});
			if (!chartState.selectedYear.length) chartState.selectedYear.push(new Date().getFullYear());
		};

		function verifyCentroids(rawData) {
			rawData.forEach(function(row) {
				if (!centroids[row.PooledFundIso]) {
					centroids[row.PooledFundIso] = {
						x: mapProjection([0, 0])[0],
						y: mapProjection([0, 0])[1]
					};
					console.warn("Attention: " + row.PooledFundIso + "(" + row.PooledFundName + ") has no centroid");
				};
			});
		};

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1)
		};

		function parseTransform(translate) {
			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.setAttributeNS(null, "transform", translate);
			const matrix = group.transform.baseVal.consolidate().matrix;
			return [matrix.e, matrix.f];
		};

		function reverseFormat(s) {
			if (+s === 0) return 0;
			let returnValue;
			const transformation = {
				Y: Math.pow(10, 24),
				Z: Math.pow(10, 21),
				E: Math.pow(10, 18),
				P: Math.pow(10, 15),
				T: Math.pow(10, 12),
				G: Math.pow(10, 9),
				B: Math.pow(10, 9),
				M: Math.pow(10, 6),
				k: Math.pow(10, 3),
				h: Math.pow(10, 2),
				da: Math.pow(10, 1),
				d: Math.pow(10, -1),
				c: Math.pow(10, -2),
				m: Math.pow(10, -3),
				μ: Math.pow(10, -6),
				n: Math.pow(10, -9),
				p: Math.pow(10, -12),
				f: Math.pow(10, -15),
				a: Math.pow(10, -18),
				z: Math.pow(10, -21),
				y: Math.pow(10, -24)
			};
			Object.keys(transformation).some(function(k) {
				if (s.indexOf(k) > 0) {
					returnValue = parseFloat(s.split(k)[0]) * transformation[k];
					return true;
				}
			});
			return returnValue;
		};

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "covmapOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + height);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "covmapArrowMarker")
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 0)
				.attr("refY", 0)
				.attr("markerWidth", 12)
				.attr("markerHeight", 12)
				.attr("orient", "auto")
				.append("path")
				.style("fill", "#E56A54")
				.attr("d", "M0,-5L10,0L0,5");

			const mainTextWhite = helpSVG.append("text")
				.attr("font-family", "Roboto")
				.attr("font-size", "26px")
				.style("stroke-width", "5px")
				.attr("font-weight", 700)
				.style("stroke", "white")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const mainText = helpSVG.append("text")
				.attr("class", "covmapAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");



			helpSVG.on("click", function() {
				overDiv.remove();
			});

			//end of createAnnotationsDiv
		};

		function createFooterDiv() {

			let footerText = "© OCHA CBPF Section " + currentYear;

			const footerLink = " | For more information, please visit <a href='https://pfbi.unocha.org'>pfbi.unocha.org</a>";

			if (showLink) footerText += footerLink;

			footerDiv.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText);

			//end of createFooterDiv
		};

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "covmapDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "covmapDownloadingDivSvg")
				.attr("width", 200)
				.attr("height", 100);

			const downloadingDivText = "Downloading " + type.toUpperCase();

			createProgressWheel(downloadingDivSvg, 200, 175, downloadingDivText);

			const svgRealSize = svg.node().getBoundingClientRect();

			svg.attr("width", svgRealSize.width)
				.attr("height", svgRealSize.height);

			const listOfStyles = [
				"font-size",
				"font-family",
				"font-weight",
				"fill",
				"stroke",
				"stroke-dasharray",
				"stroke-width",
				"opacity",
				"text-anchor",
				"text-transform",
				"shape-rendering",
				"letter-spacing",
				"white-space"
			];

			const imageDiv = containerDiv.node();

			setSvgStyles(svg.node());

			if (type === "png") {
				iconsDiv.style("opacity", 0);
			} else {
				topDiv.style("opacity", 0)
			};

			snapshotTooltip.style("display", "none");

			html2canvas(imageDiv).then(function(canvas) {

				svg.attr("width", null)
					.attr("height", null);

				if (type === "png") {
					iconsDiv.style("opacity", 1);
				} else {
					topDiv.style("opacity", 1)
				};

				if (type === "png") {
					downloadSnapshotPng(canvas);
				} else {
					downloadSnapshotPdf(canvas);
				};

				if (fromContextMenu && currentHoveredElem) d3.select(currentHoveredElem).dispatch("mouseout");

			});

			function setSvgStyles(node) {

				if (!node.style) return;

				let styles = getComputedStyle(node);

				for (let i = 0; i < listOfStyles.length; i++) {
					node.style[listOfStyles[i]] = styles[listOfStyles[i]];
				};

				for (let i = 0; i < node.childNodes.length; i++) {
					setSvgStyles(node.childNodes[i]);
				};
			};

			//end of createSnapshot
		};

		function downloadSnapshotPng(source) {

			const currentDate = new Date();

			const fileName = "covmap_" + csvDateFormat(currentDate) + ".png";

			source.toBlob(function(blob) {
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				if (link.download !== undefined) {
					link.setAttribute("href", url);
					link.setAttribute("download", fileName);
					link.style = "visibility:hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				} else {
					window.location.href = url;
				};
			});

			removeProgressWheel();

			d3.select("#covmapDownloadingDiv").remove();

		};

		function downloadSnapshotPdf(source) {

			const pdfMargins = {
				top: 10,
				bottom: 16,
				left: 20,
				right: 30
			};

			d3.image("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/bilogo.png")
				.then(function(logo) {

					let pdf;

					const point = 2.834646;

					const sourceDimentions = containerDiv.node().getBoundingClientRect();
					const widthInMilimeters = 210 - pdfMargins.left * 2;
					const heightInMilimeters = widthInMilimeters * (sourceDimentions.height / sourceDimentions.width);
					const maxHeightInMilimeters = 180;
					let pdfHeight;

					if (heightInMilimeters > maxHeightInMilimeters) {
						pdfHeight = 297 + heightInMilimeters - maxHeightInMilimeters;
						pdf = new jsPDF({
							format: [210 * point, (pdfHeight) * point],
							unit: "mm"
						})
					} else {
						pdfHeight = 297;
						pdf = new jsPDF();
					}

					let pdfTextPosition;

					createLetterhead();

					const intro = pdf.splitTextToSize("TEXT HERE.", (210 - pdfMargins.left - pdfMargins.right), {
						fontSize: 12
					});

					const fullDate = d3.timeFormat("%A, %d %B %Y")(new Date());

					pdf.setTextColor(60);
					pdf.setFont('helvetica');
					pdf.setFontType("normal");
					pdf.setFontSize(12);
					pdf.text(pdfMargins.left, 48, intro);

					pdf.setTextColor(65, 143, 222);
					pdf.setFont('helvetica');
					pdf.setFontType("bold");
					pdf.setFontSize(16);
					pdf.text(chartTitle, pdfMargins.left, 65);

					pdf.setFontSize(12);

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div>", pdfMargins.left, 70, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

					const currentDate = new Date();

					pdf.save("covmap_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#covmapDownloadingDiv").remove();

					function createLetterhead() {

						const footer = "© OCHA CBPF Section 2019 | For more information, please visit pfbi.unocha.org";

						pdf.setFillColor(65, 143, 222);
						pdf.rect(0, pdfMargins.top, 210, 15, "F");

						pdf.setFillColor(236, 161, 84);
						pdf.rect(0, pdfMargins.top + 15, 210, 2, "F");

						pdf.setFillColor(255, 255, 255);
						pdf.rect(pdfMargins.left, pdfMargins.top - 1, 94, 20, "F");

						pdf.ellipse(pdfMargins.left, pdfMargins.top + 9, 5, 9, "F");
						pdf.ellipse(pdfMargins.left + 94, pdfMargins.top + 9, 5, 9, "F");

						pdf.addImage(logo, "PNG", pdfMargins.left + 2, pdfMargins.top, 90, 18);

						pdf.setFillColor(236, 161, 84);
						pdf.rect(0, pdfHeight - pdfMargins.bottom, 210, 2, "F");

						pdf.setTextColor(60);
						pdf.setFont("arial");
						pdf.setFontType("normal");
						pdf.setFontSize(10);
						pdf.text(footer, pdfMargins.left, pdfHeight - pdfMargins.bottom + 10);

					};

				});

			//end of downloadSnapshotPdf
		};

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg.append("g")
				.attr("class", "covmapd3chartwheelGroup")
				.attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 4 + ")");

			const loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text(thistext);

			const arc = d3.arc()
				.outerRadius(25)
				.innerRadius(20);

			const wheel = wheelGroup.append("path")
				.datum({
					startAngle: 0,
					endAngle: 0
				})
				.classed("contributionColorFill", true)
				.attr("d", arc);

			transitionIn();

			function transitionIn() {
				wheel.transition()
					.duration(1000)
					.attrTween("d", function(d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function(t) {
							d.endAngle = interpolate(t);
							return arc(d)
						}
					})
					.on("end", transitionOut)
			};

			function transitionOut() {
				wheel.transition()
					.duration(1000)
					.attrTween("d", function(d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function(t) {
							d.startAngle = interpolate(t);
							return arc(d)
						}
					})
					.on("end", function(d) {
						d.startAngle = 0;
						transitionIn()
					})
			};

			//end of createProgressWheel
		};

		function removeProgressWheel() {
			const wheelGroup = d3.select(".covmapd3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());
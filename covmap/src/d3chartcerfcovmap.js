(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpf.data.unocha.org/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylescovmap.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.15.0/d3.min.js",
		topoJsonUrl = "https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js",
		html2ToCanvas = "https://cbpfgms.github.io/libraries/html2canvas.min.js",
		jsPdf = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js",
		URLSearchParamsPolyfill = "https://cdn.jsdelivr.net/npm/@ungap/url-search-params@0.1.2/min.min.js",
		fetchPolyfill1 = "https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js",
		fetchPolyfill2 = "https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js";

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

		//Math.log10

		Math.log10 = Math.log10 || function(x) {
			return Math.log(x) * Math.LOG10E;
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

		const width = 1100,
			padding = [4, 4, 4, 4],
			panelHorizontalPadding = 4,
			buttonsPanelHeight = 30,
			mapPanelHeight = 490,
			topPanelHeight = 60,
			legendPanelHeight = 102,
			legendPanelWidth = 110,
			legendPanelHorPadding = 2,
			legendPanelVertPadding = 12,
			mapZoomButtonHorPadding = 6,
			mapZoomButtonVertPadding = 10,
			timelineZoomButtonVertPadding = 76,
			mapZoomButtonSize = 26,
			maxPieSize = 32,
			minPieSize = 1,
			timelinePanelHeight = 264,
			height = padding[0] + padding[2] + topPanelHeight + buttonsPanelHeight + mapPanelHeight + timelinePanelHeight + (4 * panelHorizontalPadding),
			timelinePercentagePadding = 0.07,
			buttonsNumber = 10,
			groupNamePadding = 2,
			unBlue = "#1F69B3",
			cerfColor = "#F9D25B",
			tooltipStickColor = "lightslategray",
			tooltipLollipopColor = "lightslategray",
			fadeOpacity = 0.2,
			fillOpacityValue = 0.5,
			strokeOpacityValue = 0.8,
			tooltipMargin = -4,
			tooltipSvgWidth = 300,
			tooltipSvgHeight = 80,
			showNamesMargin = 12,
			tooltipSvgPadding = [14, 34, 2, 45],
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
			timeFormat = d3.timeFormat("%b-%y"),
			timeParserButtons = d3.timeParse("%b-%y"),
			timeParseMetadata = d3.timeParse("%d/%m/%Y"),
			timeFormatTickValues = d3.timeFormat("%d/%m/%Y"),
			timeFormatList = d3.timeFormat("%d %B, %Y"),
			timeFormatAxis = d3.timeFormat("%d-%b"),
			bookmarkSite = "https://cbpfgms.github.io/cbpf-bi-stag/bookmark.html?",
			vizNameQueryString = "covid19",
			allData = "allData",
			dataUrl = "https://cbpfapi.unocha.org/vo2/odata/ExtendedAllocationDetails?PoolfundCodeAbbrv=&$format=csv",
			mapUrl = "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/worldmaptopo110m.json",
			iconsUrl = "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/covmap/",
			timelineMetadata = [{
				"title": "WHO announces that COVID-19 is a Public Health Emergency of International Concern",
				"icon": "coronavirusgreen",
				"date": "30/01/2020",
				"lollipopDate": "30/01/2020",
				"size": 110
			}, {
				"title": "First CERF- funded WHO project starts",
				"icon": "moneycerf",
				"date": "03/02/2020",
				"lollipopDate": "20/02/2020",
				"size": 80
			}, {
				"title": "WHO declares COVID-19 outbreak a pandemic",
				"icon": "coronavirusgreen",
				"date": "11/03/2020",
				"lollipopDate": "11/03/2020",
				"size": 90
			}, {
				"title": "Launch of the COVID-19 Global Humanitarian Response Plan",
				"icon": "advocacygreen",
				"date": "25/03/2020",
				"lollipopDate": "27/03/2020",
				"size": 150
			}, {
				"title": "Launch of the COVID-19 revised Global Humanitarian Response Plan",
				"icon": "advocacygreen",
				"date": "07/05/2020",
				"lollipopDate": "07/05/2020",
				"size": 120
			}],
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			typesOfTargeted = ["HostCommunities", "Refugees", "Returnees", "IDPs", "Others", "Disable"],
			typesOfPeople = ["M", "W", "B", "G"],
			monthsArray = [],
			countryNames = {},
			centroids = {},
			chartState = {
				selectedMonth: [],
				countriesInData: [],
				showNames: null
			};

		let isSnapshotTooltipVisible = false,
			clickableButtons = true,
			maxTimelineRadius,
			currentHoveredElem;

		const hardcodedAllocations = [{
			isoCode: "XX",
			long: 37.22,
			lat: 37.03
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

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : null;

		const showHelp = containerDiv.node().getAttribute("data-showhelp") === "true";

		const selectedMonthString = queryStringValues.has("month") ? queryStringValues.get("month").replace(/\|/g, ",") : (containerDiv.node().getAttribute("data-month") ? containerDiv.node().getAttribute("data-month") : allData);

		const showNamesOption = queryStringValues.has("shownames") ? queryStringValues.get("shownames") === "true" : containerDiv.node().getAttribute("data-shownames") === "true";

		const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

		chartState.showNames = showNamesOption;

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		if (chartTitle) {
			const titleDiv = d3.select(containerDiv.node().parentNode)
				.insert("div", "#d3chartcontainercovmap")
				.attr("class", "covmapTitleDiv")
				.style("margin-left", "8px")
				.style("margin-bottom", "4px")
				.style("font-size", "26px")
				.style("font-family", "Arial")
				.style("color", cbpfColor)
				.html(chartTitle);
		};

		const iconsDiv = containerDiv.append("div")
			.attr("class", "covmapIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const listContainerDiv = containerDiv.append("div")
			.attr("class", "covmaplistContainerDiv")
			.style("display", "none");

		const footerDiv = containerDiv.append("div")
			.attr("class", "covmapFooterDiv");

		const yearsDescriptionDiv = footerDiv.append("div")
			.attr("class", "covmapYearsDescriptionDiv");

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

		const topPanel = {
			main: svg.append("g")
				.attr("class", "covmaptopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			padding: [0, 0, 0, 0],
			leftPadding: [90, 290, 0, 570],
			mainValueVerPadding: 12,
			mainValueHorPadding: 2,
			linePadding: 8
		};

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "covmapbuttonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 6, 0, 6],
			buttonWidth: 64,
			buttonsMargin: 4,
			buttonsPadding: 6,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			cbpfMargin: 386,
			cbpfButtonsMargin: 426,
			cerfMargin: 606,
			cerfButtonsMargin: 646
		};

		const mapPanel = {
			main: svg.append("g")
				.attr("class", "covmapmapPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: mapPanelHeight,
			padding: [0, 0, 0, 0]
		};

		const timelinePanel = {
			main: svg.append("g")
				.attr("class", "covmaptimelinePanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonsPanel.height + mapPanel.height + (4 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: timelinePanelHeight,
			padding: [58, 6, 12, 6],
			get axisPadding() {
				return this.padding[0] + 88;
			},
			titlePadding: 36,
			disclaimerPadding: 16,
			axisHeight: 14,
			piePadding: 22,
			iconPadding: 32,
			iconRadius: 14,
			iconSize: 20,
			labelPadding: 10,
			iconTextPadding: 6
		};

		const legendPanel = {
			main: svg.append("g")
				.attr("class", "covmaplegendPanel")
				.attr("transform", "translate(" + (padding[3] + legendPanelHorPadding) + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding) + mapPanel.height - legendPanelHeight - legendPanelVertPadding) + ")"),
			width: legendPanelWidth,
			height: legendPanelHeight,
			padding: [30, 0, 12, 4]
		};

		const mapZoomButtonPanel = {
			main: svg.append("g")
				.attr("class", "covmapmapZoomButtonPanel")
				.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding) + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding) + mapZoomButtonVertPadding) + ")"),
			width: mapZoomButtonSize,
			height: mapZoomButtonSize * 2,
			padding: [4, 4, 4, 4]
		};

		const timelineZoomButtonPanel = {
			main: svg.append("g")
				.attr("class", "covmaptimelineZoomButtonPanel")
				.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding) + "," + (padding[0] + topPanel.height + buttonsPanel.height + mapPanel.height + (4 * panelHorizontalPadding) + timelineZoomButtonVertPadding) + ")"),
			width: mapZoomButtonSize,
			height: mapZoomButtonSize * 2,
			padding: [4, 4, 4, 4]
		};

		const checkboxesPanel = {
			main: svg.append("g")
				.attr("class", "covmapcheckboxesPanel")
				.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding + 1) + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding) + mapZoomButtonVertPadding + mapZoomButtonPanel.height + showNamesMargin) + ")"),
			padding: [0, 0, 0, 0]
		};

		const mapPanelClip = mapPanel.main.append("clipPath")
			.attr("id", "covmapmapPanelClip")
			.append("rect")
			.attr("width", mapPanel.width)
			.attr("height", mapPanel.height);

		mapPanel.main.attr("clip-path", "url(#covmapmapPanelClip)");

		const timelinePanelClip = timelinePanel.main.append("clipPath")
			.attr("id", "covmaptimelinePanelClip")
			.append("rect")
			.attr("y", -(panelHorizontalPadding + 1))
			.attr("width", timelinePanel.width)
			.attr("height", timelinePanel.height + panelHorizontalPadding + 1);

		timelinePanel.main.attr("clip-path", "url(#covmaptimelinePanelClip)");

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

		const zoomLayerTimeline = timelinePanel.main.append("g")
			.attr("class", "covmapzoomLayerTimeline")
			.style("opacity", 0)
			.attr("cursor", "move")
			.attr("pointer-events", "all");

		const zoomRectangleTimeline = zoomLayerTimeline.append("rect")
			.attr("width", timelinePanel.width)
			.attr("height", timelinePanel.height);

		const piesContainer = mapPanel.main.append("g")
			.attr("class", "covmappiesContainer");

		const mapProjection = d3.geoEqualEarth();

		const mapPath = d3.geoPath()
			.projection(mapProjection);

		const radiusScale = d3.scaleSqrt()
			.range([minPieSize, maxPieSize]);

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

		const zoomTimeline = d3.zoom()
			.scaleExtent([1, 10])
			.extent([
				[0, 0],
				[timelinePanel.width, timelinePanel.height]
			])
			.translateExtent([
				[0, 0],
				[timelinePanel.width, timelinePanel.height]
			]);

		timelinePanel.main.call(zoomTimeline);

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
		timelineZoomButtonPanel.main.style("filter", "url(#covmapdropshadow)");

		const peopleScale = d3.scaleOrdinal()
			.domain(typesOfPeople)
			.range(["Men", "Women", "Boys", "Girls"]);

		const targetedScale = d3.scaleOrdinal()
			.domain(typesOfTargeted)
			.range(["Host Communities", "Refugees", "Returnees", "IDPs", "Others", "Disabled"]);

		const tooltipSvgYScale = d3.scalePoint()
			.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
			.padding(0.5);

		const tooltipSvgXScale = d3.scaleLinear()
			.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]]);

		const timelineScale = d3.scaleTime()
			.range([0, timelinePanel.width]);

		const radiusScaleTimeline = d3.scaleSqrt()
			.range([minPieSize, maxPieSize]);

		const timelineAxis = d3.axisTop(timelineScale)
			.tickFormat(timeFormatAxis)
			.tickSizeOuter(0)
			.tickSizeInner(0)
			.tickPadding(0);

		const tooltipSvgYAxis = d3.axisLeft(tooltipSvgYScale)
			.tickSize(0)
			.tickPadding(5);

		const tooltipSvgXAxis = d3.axisTop(tooltipSvgXScale)
			.tickSizeOuter(0)
			.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]))
			.ticks(3)
			.tickPadding(4)
			.tickFormat(function(d) {
				return formatSIaxes(d).replace("G", "B");
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

		function csvCallback(rawDataTotal, mapData) {

			const rawData = rawDataTotal.filter(function(row) {
				return row.PFType === "CERF";
			});

			preProcessData(rawData);

			validateMonth(selectedMonthString);

			const iconsList = timelineMetadata.map(function(d) {
				return d.icon;
			});

			saveImages(iconsList);

			removeProgressWheel();

			draw(rawData, mapData);

			//end of csvCallback
		};

		function draw(rawData, mapData) {

			const data = processData(rawData);

			const timelineData = processDataTimeline(rawData);

			createTitle(rawData);

			createButtonsPanel(rawData);

			createMap(mapData);

			verifyCentroids(rawData);

			createZoomButtons(mapZoomButtonPanel, "Map");

			createZoomButtons(timelineZoomButtonPanel, "Timeline");

			createCheckboxes();

			createTopPanel(data);

			createPies(data);

			createLegend(data);

			createTimeline(timelineData, timelineMetadata);

			createTimelineHighlight();

			createFooterDiv();

			setYearsDescriptionDiv();

			if (showHelp) createAnnotationsDiv();

			//end of draw
		};

		function createTitle(rawData) {

			const containerBox = containerDiv.node().getBoundingClientRect();

			const buttonsFontSize = 12 * (containerBox.width / width);

			const helpIcon = iconsDiv.append("button")
				.style("font-size", buttonsFontSize + "px", "important")
				.attr("id", "covmapHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.style("font-size", buttonsFontSize + "px", "important")
				.attr("id", "covmapDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			const snapshotDiv = iconsDiv.append("div")
				.attr("class", "covmapSnapshotDiv");

			const snapshotIcon = snapshotDiv.append("button")
				.style("font-size", buttonsFontSize + "px", "important")
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
				.style("font-size", buttonsFontSize + "px", "important")
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
					chartState.selectedMonth.length = 1;
					loopButtons();
					timer = d3.interval(loopButtons, 3 * duration);
				} else {
					timer.stop();
				};

				function loopButtons() {
					const index = monthsArray.indexOf(chartState.selectedMonth[0]);

					chartState.selectedMonth[0] = monthsArray[(index + 1) % monthsArray.length];

					const yearButton = d3.selectAll(".covmapbuttonsRects")
						.filter(function(d) {
							return d === chartState.selectedMonth[0]
						});

					yearButton.dispatch("click");

					const firstYearIndex = monthsArray.indexOf(chartState.selectedMonth[0]) < buttonsNumber / 2 ?
						0 :
						monthsArray.indexOf(chartState.selectedMonth[0]) > monthsArray.length - (buttonsNumber / 2) ?
						Math.max(monthsArray.length - buttonsNumber, 0) :
						monthsArray.indexOf(monthsArray.indexOf(chartState.selectedMonth[0])) - (buttonsNumber / 2);

					const currentTranslate = -(buttonsPanel.buttonWidth * firstYearIndex);

					if (currentTranslate === 0) {
						svg.select(".covmapLeftArrowGroup").select("text").style("fill", "#ccc")
						svg.select(".covmapLeftArrowGroup").attr("pointer-events", "none");
					} else {
						svg.select(".covmapLeftArrowGroup").select("text").style("fill", "#666")
						svg.select(".covmapLeftArrowGroup").attr("pointer-events", "all");
					};

					if (Math.abs(currentTranslate) >= ((monthsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
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
					.style("font-size", buttonsFontSize + "px", "important")
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

				const csv = createCsv(rawData);

				const currentDate = new Date();

				const fileName = "Covid19Allocations_" + csvDateFormat(currentDate) + ".csv";

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

			const featuresWithoutAntarctica = topojson.feature(mapData, mapData.objects.countries);

			featuresWithoutAntarctica.features = featuresWithoutAntarctica.features.filter(function(d) {
				return d.properties.isoCode !== "AQ";
			});

			mapProjection.fitExtent([
				[mapPanel.padding[3], mapPanel.padding[0]],
				[(mapPanel.width - mapPanel.padding[1] - mapPanel.padding[3]), (mapPanel.height - mapPanel.padding[0] - mapPanel.padding[2])]
			], featuresWithoutAntarctica);

			const land = mapContainer.append("path")
				.attr("d", mapPath(landObject))
				.style("fill", "#F1F1F1");

			const borders = mapContainer.append("path")
				.attr("d", mapPath(topojson.mesh(mapData, mapData.objects.countries, function(a, b) {
					return a !== b && !(a.properties.name === "Somalia" && b.properties.name === "Somaliland");
				})))
				.style("fill", "none")
				.style("stroke", "#E5E5E5")
				.style("stroke-width", "1px");

			features.forEach(function(d) {
				centroids[d.properties.isoCode] = {
					x: mapPath.centroid(d.geometry)[0],
					y: mapPath.centroid(d.geometry)[1]
				}
			});

			//Countries with problems:
			//"KM","WS","AG","DM","MH","CV"
			//Comoros, (west) Samoa, Antigua and Barbuda, Dominica, Marshall Islands, Cabo Verde
			//And the fake codes: XX, XV, XA and XG
			hardcodedAllocations.forEach(function(d) {
				const projected = mapProjection([d.long, d.lat]);
				centroids[d.isoCode] = {
					x: projected[0],
					y: projected[1]
				};
			});

			//end of createMap
		};

		function createZoomButtons(panel, className) {

			const zoomInGroup = panel.main.append("g")
				.attr("class", "covmapzoomInGroup" + className)
				.attr("cursor", "pointer");

			const zoomInPath = zoomInGroup.append("path")
				.attr("class", "covmapzoomPath")
				.attr("d", function() {
					const drawPath = d3.path();
					drawPath.moveTo(0, panel.height / 2);
					drawPath.lineTo(0, panel.padding[0]);
					drawPath.quadraticCurveTo(0, 0, panel.padding[0], 0);
					drawPath.lineTo(panel.width - panel.padding[1], 0);
					drawPath.quadraticCurveTo(panel.width, 0, panel.width, panel.padding[1]);
					drawPath.lineTo(panel.width, panel.height / 2);
					drawPath.closePath();
					return drawPath.toString();
				});

			const zoomInText = zoomInGroup.append("text")
				.attr("class", "covmapzoomText")
				.attr("text-anchor", "middle")
				.attr("x", panel.width / 2)
				.attr("y", (panel.height / 4) + 7)
				.text("+");

			const zoomOutGroup = panel.main.append("g")
				.attr("class", "covmapzoomOutGroup" + className)
				.attr("cursor", "pointer");

			const zoomOutPath = zoomOutGroup.append("path")
				.attr("class", "covmapzoomPath")
				.attr("d", function() {
					const drawPath = d3.path();
					drawPath.moveTo(0, panel.height / 2);
					drawPath.lineTo(0, panel.height - panel.padding[3]);
					drawPath.quadraticCurveTo(0, panel.height, panel.padding[3], panel.height);
					drawPath.lineTo(panel.width - panel.padding[2], panel.height);
					drawPath.quadraticCurveTo(panel.width, panel.height, panel.width, panel.height - panel.padding[2]);
					drawPath.lineTo(panel.width, panel.height / 2);
					drawPath.closePath();
					return drawPath.toString();
				});

			const zoomOutText = zoomOutGroup.append("text")
				.attr("class", "covmapzoomText")
				.attr("text-anchor", "middle")
				.attr("x", panel.width / 2)
				.attr("y", (3 * panel.height / 4) + 7)
				.text("−");

			const zoomLine = panel.main.append("line")
				.attr("x1", 0)
				.attr("x2", panel.width)
				.attr("y1", panel.height / 2)
				.attr("y2", panel.height / 2)
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
				.attr("x", 18)
				.attr("y", 11)
				.text("Show All");

			showNamesGroup.on("click", function() {

				chartState.showNames = !chartState.showNames;

				if (queryStringValues.has("shownames")) {
					queryStringValues.set("shownames", chartState.showNames);
				} else {
					queryStringValues.append("shownames", chartState.showNames);
				};

				innerCheck.style("stroke", chartState.showNames ? "darkslategray" : "white");

				piesContainer.selectAll("text, tspan")
					.style("display", null);

				if (!chartState.showNames) displayLabels(piesContainer.selectAll(".covmapgroupName"));

			});

			//end of createCheckboxes
		};

		function createTopPanel(data) {

			const allocationsValue = d3.sum(data, function(d) {
				return d.allocationsList.length;
			});

			const countriesValue = data.length;

			const totalValue = d3.sum(data, function(d) {
				return d.cerf;
			});

			const previousAllocations = d3.select(".covmaptopPanelAllocationsNumber").size() !== 0 ? d3.select(".covmaptopPanelAllocationsNumber").datum() : 0;

			const previousCountries = d3.select(".covmaptopPanelCountriesNumber").size() !== 0 ? d3.select(".covmaptopPanelCountriesNumber").datum() : 0;

			const previousTotal = d3.select(".covmaptopPanelTotalNumber").size() !== 0 ? d3.select(".covmaptopPanelTotalNumber").datum() : 0;

			let topPanelAllocationsNumber = topPanel.main.selectAll(".covmaptopPanelAllocationsNumber")
				.data([allocationsValue]);

			topPanelAllocationsNumber = topPanelAllocationsNumber.enter()
				.append("text")
				.attr("class", "covmaptopPanelAllocationsNumber")
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.leftPadding[0] - topPanel.mainValueHorPadding)
				.merge(topPanelAllocationsNumber);

			topPanelAllocationsNumber.transition()
				.duration(duration)
				.textTween(function(d) {
					const i = d3.interpolate(previousAllocations, d);
					return function(t) {
						return d < 1000 ? ~~(i(t)) : formatSIFloatWithoutUnit(i(t));
					};
				});

			let topPanelAllocationsText = topPanel.main.selectAll(".covmaptopPanelAllocationsText")
				.data([allocationsValue]);

			topPanelAllocationsText = topPanelAllocationsText.enter()
				.append("text")
				.attr("class", "covmaptopPanelAllocationsText")
				.attr("x", topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.text("Allocations")
				.merge(topPanelAllocationsText)
				.attr("y", function(d) {
					return d < 1000 ? topPanel.height - topPanel.mainValueVerPadding * 2 :
						topPanel.height - topPanel.mainValueVerPadding * 1.15;
				});

			let topPanelAllocationsSuperText = topPanel.main.selectAll(".covmaptopPanelAllocationsSuperText")
				.data([allocationsValue]);

			topPanelAllocationsSuperText = topPanelAllocationsSuperText.enter()
				.append("text")
				.attr("class", "covmaptopPanelAllocationsSuperText")
				.attr("x", topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
				.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "");
				})
				.merge(topPanelAllocationsSuperText)
				.style("opacity", function(d) {
					return d < 1000 ? 0 : 1;
				});

			let topPanelCountriesNumber = topPanel.main.selectAll(".covmaptopPanelCountriesNumber")
				.data([countriesValue]);

			topPanelCountriesNumber = topPanelCountriesNumber.enter()
				.append("text")
				.attr("class", "covmaptopPanelCountriesNumber")
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.leftPadding[1] - topPanel.mainValueHorPadding)
				.merge(topPanelCountriesNumber);

			topPanelCountriesNumber.transition()
				.duration(duration)
				.textTween(function(d) {
					const i = d3.interpolate(previousCountries, d);
					return function(t) {
						return ~~(i(t))
					};
				});

			const topPanelCountriesText = topPanel.main.selectAll(".covmaptopPanelCountriesText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "covmaptopPanelCountriesText")
				.attr("x", topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2)
				.text("Countries");

			let topPanelTotalNumber = topPanel.main.selectAll(".covmaptopPanelTotalNumber")
				.data([totalValue]);

			topPanelTotalNumber = topPanelTotalNumber.enter()
				.append("text")
				.attr("class", "covmaptopPanelTotalNumber")
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.leftPadding[3] - topPanel.mainValueHorPadding)
				.merge(topPanelTotalNumber);

			topPanelTotalNumber.transition()
				.duration(duration)
				.textTween(function(d) {
					const i = d3.interpolate(previousTotal, d);
					return function(t) {
						return "$" + formatSIFloat(i(t));
					};
				});

			const topPanelTotalText = topPanel.main.selectAll(".covmaptopPanelTotalText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "covmaptopPanelTotalText")
				.attr("x", topPanel.leftPadding[3] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.text("Allocated")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2)
				.style("font-family", "Arial")
				.style("font-size", "18px")
				.style("fill", "#888");

			//end of createTopPanel
		};

		function createButtonsPanel(rawData) {

			const clipPath = buttonsPanel.main.append("clipPath")
				.attr("id", "covmapclip")
				.append("rect")
				.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
				.attr("height", buttonsPanel.height);

			const extraPadding = monthsArray.length > buttonsNumber ? buttonsPanel.arrowPadding : -2;

			const clipPathGroup = buttonsPanel.main.append("g")
				.attr("class", "covmapClipPathGroup")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + extraPadding) + ",0)")
				.attr("clip-path", "url(#covmapclip)");

			const buttonsGroup = clipPathGroup.append("g")
				.attr("class", "covmapbuttonsGroup")
				.attr("transform", "translate(0,0)")
				.style("cursor", "pointer");

			const buttonsRects = buttonsGroup.selectAll(null)
				.data(monthsArray)
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
					return chartState.selectedMonth.indexOf(d) > -1 ? unBlue : "#eaeaea";
				});

			const buttonsText = buttonsGroup.selectAll(null)
				.data(monthsArray)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "covmapbuttonsText")
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedMonth.indexOf(d) > -1 ? "white" : "#444";
				})
				.text(function(d) {
					return d === allData ? "All" : d;
				});

			const leftArrow = buttonsPanel.main.append("g")
				.attr("class", "covmapLeftArrowGroup")
				.style("opacity", 0)
				.attr("pointer-events", "none")
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
				.style("opacity", 0)
				.attr("pointer-events", "none")
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
					if (!clickableButtons) return;
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

			if (monthsArray.length > buttonsNumber) {

				rightArrow.style("opacity", 1)
					.attr("pointer-events", "all");

				leftArrow.style("opacity", 1)
					.attr("pointer-events", "all");

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
							Math.max(-((monthsArray.length - buttonsNumber) * buttonsPanel.buttonWidth),
								(-(Math.abs(currentTranslate) + buttonsNumber * buttonsPanel.buttonWidth))) +
							",0)")
						.on("end", checkArrows);
				});

			};

			function checkArrows() {

				const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

				if (currentTranslate === 0) {
					leftArrow.select("text").style("fill", "#ccc");
					leftArrow.attr("pointer-events", "none");
				} else {
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
				};

				if (Math.abs(currentTranslate) >= ((monthsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
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

				if (Math.abs(currentTranslate) >= ((monthsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
					rightArrow.select("text").style("fill", "#ccc")
					rightArrow.attr("pointer-events", "none");
				};

			};

			function repositionButtonsGroup() {

				const firstYearIndex = monthsArray.indexOf(chartState.selectedMonth[0]) < buttonsNumber / 2 ?
					0 :
					monthsArray.indexOf(chartState.selectedMonth[0]) > monthsArray.length - (buttonsNumber / 2) ?
					Math.max(monthsArray.length - buttonsNumber, 0) :
					monthsArray.indexOf(monthsArray.indexOf(chartState.selectedMonth[0])) - (buttonsNumber / 2);

				buttonsGroup.attr("transform", "translate(" +
					(-(buttonsPanel.buttonWidth * firstYearIndex)) +
					",0)");

			};

			function mouseOverButtonsRects(d) {

				tooltip.style("display", "block")
					.html(null)

				const innerTooltip = tooltip.append("div")
					.style("max-width", "200px")
					.attr("id", "covmapInnerTooltipDiv");

				innerTooltip.html("Click for selecting a month. Double-click or ALT + click for selecting a single month.");

				const containerSize = containerDiv.node().getBoundingClientRect();

				const thisSize = this.getBoundingClientRect();

				tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip.style("left", (thisSize.left + thisSize.width / 2 - containerSize.left) > containerSize.width - (tooltipSize.width / 2) - padding[1] ?
						containerSize.width - tooltipSize.width - padding[1] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) < tooltipSize.width / 2 + buttonsPanel.padding[3] + padding[0] ?
						buttonsPanel.padding[3] + padding[0] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) - (tooltipSize.width / 2) + "px")
					.style("top", (thisSize.top + thisSize.height / 2 - containerSize.top) < tooltipSize.height ? thisSize.top - containerSize.top + thisSize.height + 1 + "px" :
						thisSize.top - containerSize.top - tooltipSize.height + "px");

				d3.select(this).style("fill", unBlue);
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsRects(d) {
				tooltip.style("display", "none");
				if (chartState.selectedMonth.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function clickButtonsRects(d, singleSelection) {

				tooltip.style("display", "none");

				const timelineTransform = d3.zoomTransform(timelinePanel.main.node());

				if (timelineTransform.k !== 1) {
					zoomTimeline.transform(timelinePanel.main.transition().duration(duration), d3.zoomIdentity);
				};

				if (singleSelection || d === allData) {
					chartState.selectedMonth = [d];
				} else {
					const index = chartState.selectedMonth.indexOf(d);
					if (index > -1) {
						if (chartState.selectedMonth.length === 1) {
							return;
						} else {
							chartState.selectedMonth.splice(index, 1);
						}
					} else {
						chartState.selectedMonth.push(d);
					};
				};

				if (chartState.selectedMonth.indexOf(allData) > -1 && chartState.selectedMonth.length > 1) {
					chartState.selectedMonth = chartState.selectedMonth.filter(function(d) {
						return d !== allData;
					});
				};

				const allMonths = chartState.selectedMonth.map(function(d) {
					return d;
				}).join("|");

				if (queryStringValues.has("month")) {
					queryStringValues.set("month", allMonths);
				} else {
					queryStringValues.append("month", allMonths);
				};

				buttonsRects.style("fill", function(e) {
					return chartState.selectedMonth.indexOf(e) > -1 ? unBlue : "#eaeaea";
				});

				buttonsText.style("fill", function(e) {
					return chartState.selectedMonth.indexOf(e) > -1 ? "white" : "#444";
				});

				const data = processData(rawData);

				createTimelineHighlight();

				createTopPanel(data);

				createPies(data);

				createLegend(data);

				setYearsDescriptionDiv();

				//end of clickButtonsRects
			};

			//end of createButtonsPanel
		};

		function createPies(unfilteredData) {

			clickableButtons = false;

			const data = unfilteredData.filter(function(d) {
				return d.cerf;
			});

			zoom.on("zoom", zoomed);

			const currentTransform = d3.zoomTransform(mapPanel.main.node());

			data.sort(function(a, b) {
				return b.cerf - a.cerf;
			});

			const maxValue = d3.max(data, function(d) {
				return d.cerf;
			});

			radiusScale.domain([0, maxValue || 0]);

			let pieGroup = piesContainer.selectAll(".covmappieGroup")
				.data(data, function(d) {
					return d.isoCode;
				});

			const pieGroupExit = pieGroup.exit();

			console.log(pieGroupExit.size())

			pieGroupExit.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			pieGroupExit.select(".covmapcircle")
				.transition()
				.duration(duration)
				.attr("r", 0);

			const pieGroupEnter = pieGroup.enter()
				.append("g")
				.attr("class", "covmappieGroup")
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + (centroids[d.isoCode].x * currentTransform.k + currentTransform.x) +
						"," + (centroids[d.isoCode].y * currentTransform.k + currentTransform.y) + ")";
				});

			const groupNameBack = pieGroupEnter.append("text")
				.attr("class", "covmapgroupNameBack")
				.attr("x", function(d) {
					return radiusScale(d.cerf) + groupNamePadding;
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
							.attr("x", radiusScale(d.cerf) + groupNamePadding)
							.attr("dy", 12)
							.text(d.labelText.length > 2 ? d.labelText.filter(function(_, i) {
									return i > 1;
								}).join(" ") :
								(d.labelText[1] === "Globally" ? "Globally*" : d.labelText[1]));
					};
				});

			const groupName = pieGroupEnter.append("text")
				.attr("class", "covmapgroupName")
				.attr("x", function(d) {
					return radiusScale(d.cerf) + groupNamePadding;
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
							.attr("x", radiusScale(d.cerf) + groupNamePadding)
							.attr("dy", 12)
							.text(d.labelText.length > 2 ? d.labelText.filter(function(_, i) {
									return i > 1;
								}).join(" ") :
								(d.labelText[1] === "Globally" ? "Globally*" : d.labelText[1]));
					};
				});

			const circlesEnter = pieGroupEnter.append("circle")
				.attr("class", "covmapcircle")
				.style("fill", cerfColor)
				.style("stroke", "#666")
				.style("stroke-width", "1px")
				.style("stroke-opacity", strokeOpacityValue)
				.style("fill-opacity", fillOpacityValue)
				.attr("r", 0);

			pieGroup = pieGroupEnter.merge(pieGroup);

			pieGroup.order();

			const allTexts = pieGroup.selectAll("text");

			if (!chartState.showNames) {
				allTexts.each(function() {
					d3.select(this).style("display", null);
				});
				displayLabels(pieGroup.selectAll(".covmapgroupName"));
			};

			pieGroup.select("text.covmapgroupNameBack tspan")
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", function(d) {
					return radiusScale(d.cerf) + groupNamePadding;
				});

			pieGroup.select("text.covmapgroupNameBack")
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", function(d) {
					return radiusScale(d.cerf) + groupNamePadding;
				});

			pieGroup.select("text.covmapgroupName tspan")
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", function(d) {
					return radiusScale(d.cerf) + groupNamePadding;
				});

			pieGroup.select("text.covmapgroupName")
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", function(d) {
					return radiusScale(d.cerf) + groupNamePadding;
				})
				.end()
				.then(function() {
					clickableButtons = true;
					if (chartState.showNames) return;
					allTexts.each(function() {
						d3.select(this).style("display", null);
					});
					displayLabels(pieGroup.selectAll(".covmapgroupName"));
				});

			pieGroup.select(".covmapcircle")
				.transition()
				.duration(duration)
				.attr("r", function(d) {
					return radiusScale(d.cerf);
				});

			pieGroup.on("mouseover", pieGroupMouseover);

			zoomRectangle.on("mouseover", pieGroupMouseout);

			function zoomed() {

				mapContainer.attr("transform", d3.event.transform);

				mapContainer.select("path:nth-child(2)")
					.style("stroke-width", 1 / d3.event.transform.k + "px");

				pieGroup.attr("transform", function(d) {
					return "translate(" + (centroids[d.isoCode].x * d3.event.transform.k + d3.event.transform.x) +
						"," + (centroids[d.isoCode].y * d3.event.transform.k + d3.event.transform.y) + ")";
				});

				if (!chartState.showNames) {
					allTexts.each(function() {
						d3.select(this).style("display", null);
					});
					displayLabels(pieGroup.selectAll(".covmapgroupName"));
				};

				//end of zoomed
			};

			mapZoomButtonPanel.main.select(".covmapzoomInGroupMap")
				.on("click", function() {
					zoom.scaleBy(mapPanel.main.transition().duration(duration), 2);
				});

			mapZoomButtonPanel.main.select(".covmapzoomOutGroupMap")
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

				tooltip.on("mouseleave", null);

				createCountryTooltip(datum, false);

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

				const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
					(thisBox.left + 2 * (radiusScale(datum.cerf) * (containerBox.width / width))) - containerBox.left + tooltipMargin :
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

			const disclaimer1 = piesContainer.selectAll(".covmapdisclaimer1")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "covmapdisclaimer1")
				.text("* CERF Globally includes $40M allocated for WFP’s global supply chain activities and funding yet to be assigned by UN agencies to countries.")
				.attr("x", mapPanel.width - mapPanel.padding[1] - 344)
				.attr("y", mapPanel.height - mapPanel.padding[2] - 54)
				.call(wrapText2, 340);

			const disclaimer2 = piesContainer.selectAll(".covmapdisclaimer2")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "covmapdisclaimer2")
				.text("\u2020 The boundaries and names shown and the designations used on this map do not imply official endorsement or acceptance by the United Nations.")
				.attr("x", mapPanel.width - mapPanel.padding[1] - 344)
				.attr("y", mapPanel.height - mapPanel.padding[2] - 20)
				.call(wrapText2, 340);

			//end of createPies
		};

		function createTimeline(unfilteredData, timelineMetadata) {

			const data = unfilteredData.filter(function(d) {
				return d.cerf;
			});

			const allDates = data.map(function(d) {
				return timeFormatTickValues(d.allocationDate);
			});

			const dateTicks = allDates.concat(timelineMetadata.map(function(d) {
				return d.date;
			})).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).map(function(d) {
				return timeParseMetadata(d);
			}).sort(function(a, b) {
				return a - b;
			});

			const allocationDates = allDates.filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).map(function(d) {
				return timeParseMetadata(d);
			});

			const dateExtent = d3.extent(dateTicks);

			const numberOfDays = d3.timeDay.count(dateExtent[0], dateExtent[1]);

			timelineScale.domain([d3.timeDay.offset(dateExtent[0], -(~~(numberOfDays * timelinePercentagePadding))),
				d3.timeDay.offset(dateExtent[1], +(~~(numberOfDays * timelinePercentagePadding)))
			]);

			timelineAxis.tickValues(dateTicks);

			const timelineLine = timelinePanel.main.append("line")
				.attr("x1", timelinePanel.padding[3])
				.attr("x2", timelinePanel.width - timelinePanel.padding[1])
				.attr("y1", -panelHorizontalPadding)
				.attr("y2", -panelHorizontalPadding)
				.style("stroke-width", "1px")
				.style("stroke", "#ddd");

			const timelineTitle = timelinePanel.main.append("text")
				.attr("class", "covmaptimelineTitle")
				.attr("y", timelinePanel.padding[0] - timelinePanel.titlePadding)
				.attr("x", timelinePanel.padding[3])
				.text("Allocations Timeline");

			const timelineDisclaimer = timelinePanel.main.append("text")
				.attr("class", "covmaptimelineDisclaimer")
				.attr("y", timelinePanel.padding[0] - timelinePanel.disclaimerPadding)
				.attr("x", timelinePanel.padding[3])
				.text("The interactive timeline represents the chronology of OCHA’s response to the COVID-19 pandemic. It features the key allocations dates and milestones.")
				.call(wrapText2, timelinePanel.width - timelinePanel.padding[1] - timelinePanel.padding[3]);

			const timelineRect = timelinePanel.main.append("rect")
				.attr("y", timelinePanel.axisPadding - (timelinePanel.axisHeight / 2))
				.attr("width", timelinePanel.width)
				.attr("height", timelinePanel.axisHeight)
				.style("fill", "#ddd");

			const timelineHighlightGroup = timelinePanel.main.append("g")
				.attr("class", "covmaptimelineHighlightGroup")
				.attr("transform", "translate(0," + (timelinePanel.axisPadding - (timelinePanel.axisHeight / 2)) + ")");

			const timelineAxisGroup = timelinePanel.main.append("g")
				.attr("class", "covmaptimelineAxisGroup")
				.attr("transform", "translate(0," + (timelinePanel.axisPadding + timelinePanel.axisHeight / 4) + ")")
				.call(timelineAxis);

			timelineAxisGroup.selectAll(".tick text")
				.call(removeTicks);

			const keyDatesGroupsTimeline = timelinePanel.main.selectAll(null)
				.data(timelineMetadata)
				.enter()
				.append("g")
				.attr("class", "keyDatesGroupsTimeline")
				.attr("transform", function(d) {
					return "translate(" + timelineScale(timeParseMetadata(d.lollipopDate)) + "," +
						(timelinePanel.axisPadding - (timelinePanel.axisHeight / 2) - timelinePanel.iconPadding - timelinePanel.iconRadius) + ")";
				});

			const iconCircles = keyDatesGroupsTimeline.append("circle")
				.attr("r", timelinePanel.iconRadius)
				.style("fill", "#f2f2f2")
				.style("stroke", "#ddd");

			const iconImages = keyDatesGroupsTimeline.append("image")
				.attr("x", -(timelinePanel.iconSize / 2))
				.attr("y", -(timelinePanel.iconSize / 2))
				.attr("height", timelinePanel.iconSize)
				.attr("width", timelinePanel.iconSize)
				.attr("xlink:href", function(d) {
					return localStorage.getItem("storedIcon" + d.icon) ? localStorage.getItem("storedIcon" + d.icon) :
						iconsUrl + d.icon + "icon.png";
				});

			const iconText = keyDatesGroupsTimeline.append("text")
				.attr("class", "covmapiconText")
				.attr("x", timelinePanel.iconRadius + timelinePanel.iconTextPadding)
				.attr("y", -(timelinePanel.iconRadius / 4))
				.text(function(d) {
					return d.title
				})
				.each(function(d) {
					d3.select(this).call(wrapText2, d.size);
				});

			const iconPolyline = keyDatesGroupsTimeline.append("polyline")
				.style("stroke", "#ddd")
				.style("fill", "none")
				.attr("points", function(d, i) {
					return (timelineScale(timeParseMetadata(d.date)) - timelineScale(timeParseMetadata(d.lollipopDate))) + "," + (timelinePanel.iconPadding + timelinePanel.iconRadius) +
						" " + (timelineScale(timeParseMetadata(d.date)) - timelineScale(timeParseMetadata(d.lollipopDate))) + "," + (timelinePanel.iconPadding + timelinePanel.iconRadius - (i === 2 ? 4 : 7)) +
						" 0," + (timelinePanel.iconPadding + timelinePanel.iconRadius - (i === 2 ? 4 : 7)) + " 0," + timelinePanel.iconRadius;
				});

			//Hardcoded name for Korea DPR
			data.forEach(function(d) {
				if (d.country === "Korea, Democratic People's Republic of") d.country = "Korea, DPR";
			});

			const mergedData = [];

			allocationDates.forEach(function(date) {
				const allocationsInSameDate = data.filter(function(d) {
					return timeFormatTickValues(d.allocationDate) === timeFormatTickValues(date);
				}).sort(function(a, b) {
					return b.cerf - a.cerf;
				});
				if (allocationsInSameDate.length === 1) {
					mergedData.push.apply(mergedData, allocationsInSameDate);
				} else {
					const mergedObject = {
						allocationDate: date,
						country: "Several countries",
						cerf: 0,
						countriesList: []
					};
					for (let i = 0; i < allocationsInSameDate.length; i++) {
						mergedObject.cerf += allocationsInSameDate[i].cerf;
						mergedObject.countriesList.push(allocationsInSameDate[i]);
					};
					mergedData.push(mergedObject);
				};
			});

			mergedData.sort(function(a, b) {
				return b.cerf - a.cerf;
			});

			const maxValue = d3.max(mergedData, function(d) {
				return d.cerf;
			});

			radiusScaleTimeline.domain([0, maxValue || 0]);

			const pieGroupsTimeline = timelinePanel.main.selectAll(null)
				.data(mergedData)
				.enter()
				.append("g")
				.attr("class", "covmappieGroupsTimeline")
				.attr("transform", function(d) {
					return "translate(" + timelineScale(d.allocationDate) + "," +
						(timelinePanel.axisPadding + timelinePanel.piePadding + (timelinePanel.axisHeight / 2) + maxPieSize) + ")";
				});

			const pieGroupsTimelineCircles = pieGroupsTimeline.append("circle")
				.attr("class", "covmappieGroupsTimelineCircle")
				.style("fill", cerfColor)
				.style("stroke", "#666")
				.style("stroke-width", "1px")
				.style("stroke-opacity", strokeOpacityValue)
				.style("fill-opacity", fillOpacityValue)
				.attr("r", function(d) {
					return radiusScaleTimeline(d.cerf);
				});

			const pieLines = pieGroupsTimeline.append("line")
				.attr("y1", function(d) {
					return -(radiusScaleTimeline(d.cerf) + 1);
				})
				.attr("y2", -(maxPieSize + timelinePanel.piePadding))
				.attr("stroke-width", "1px")
				.style("stroke", "#ddd");

			const pieLabels = pieGroupsTimeline.append("text")
				.attr("class", "covmappieLabelsTimeline")
				.attr("y", function(d) {
					return radiusScaleTimeline(d.cerf) + timelinePanel.labelPadding;
				})
				.attr("x", 0)
				.text(function(d) {
					return d.country;
				})
				.call(wrapText2, 84);

			pieLabels.call(displayLabelsTimeline);

			zoomTimeline.on("zoom", zoomedTimeline);

			pieGroupsTimeline.on("mouseover", pieGroupsTimelineMouseover);

			zoomRectangleTimeline.on("mouseover", pieGroupsTimelineMouseout);

			function zoomedTimeline() {
				const transf = d3.event.transform;
				timelineAxisGroup.call(timelineAxis.scale(transf.rescaleX(timelineScale)));
				pieGroupsTimeline.attr("transform", function(d) {
					return "translate(" + (timelineScale(d.allocationDate) * d3.event.transform.k + d3.event.transform.x) +
						"," + (timelinePanel.axisPadding + timelinePanel.piePadding + (timelinePanel.axisHeight / 2) + maxPieSize) + ")";
				});
				keyDatesGroupsTimeline.attr("transform", function(d) {
					const xTranslate = d.lollipopDate === d.date ? (timelineScale(timeParseMetadata(d.lollipopDate)) * d3.event.transform.k + d3.event.transform.x) :
						timeParseMetadata(d.lollipopDate) > timeParseMetadata(d.date) ?
						(timelineScale(timeParseMetadata(d.date)) * d3.event.transform.k + d3.event.transform.x + Math.max(0, ((timelineScale(timeParseMetadata(d.lollipopDate)) - timelineScale(timeParseMetadata(d.date)))) - (d3.event.transform.k - 1) * 50)) :
						(timelineScale(timeParseMetadata(d.date)) * d3.event.transform.k + d3.event.transform.x - Math.max(0, ((timelineScale(timeParseMetadata(d.date)) - timelineScale(timeParseMetadata(d.lollipopDate)))) - (d3.event.transform.k - 1) * 50));
					return "translate(" + xTranslate + "," +
						(timelinePanel.axisPadding - (timelinePanel.axisHeight / 2) - timelinePanel.iconPadding - timelinePanel.iconRadius) + ")";
				});
				keyDatesGroupsTimeline.select("polyline")
					.attr("points", function(d, i) {
						const xTranslate = d.lollipopDate === d.date ? 0 :
							timeParseMetadata(d.lollipopDate) > timeParseMetadata(d.date) ?
							Math.min(0, ((timelineScale(timeParseMetadata(d.date)) - timelineScale(timeParseMetadata(d.lollipopDate)))) + (d3.event.transform.k - 1) * 50) :
							Math.max(0, ((timelineScale(timeParseMetadata(d.date)) - timelineScale(timeParseMetadata(d.lollipopDate)))) - (d3.event.transform.k - 1) * 50);
						return xTranslate + "," + (timelinePanel.iconPadding + timelinePanel.iconRadius) +
							" " + xTranslate + "," + (timelinePanel.iconPadding + timelinePanel.iconRadius - (i === 2 ? 4 : 7)) +
							" 0," + (timelinePanel.iconPadding + timelinePanel.iconRadius - (i === 2 ? 4 : 7)) + " 0," + timelinePanel.iconRadius;
					});
				timelineHighlightGroup.selectAll(".covmaphighlightRects")
					.attr("x", function(d) {
						return timelineScale(d[0]) * d3.event.transform.k + d3.event.transform.x;
					})
					.attr("width", function(d) {
						return (timelineScale(d[1]) * d3.event.transform.k + d3.event.transform.x) - (timelineScale(d[0]) * d3.event.transform.k + d3.event.transform.x);
					});
				pieLabels.style("display", null)
					.call(displayLabelsTimeline);

				timelineAxisGroup.selectAll(".tick text")
					.call(removeTicks);
			};

			timelineZoomButtonPanel.main.select(".covmapzoomInGroupTimeline")
				.on("click", function() {
					zoomTimeline.scaleBy(timelinePanel.main.transition().duration(duration), 1.5);
				});

			timelineZoomButtonPanel.main.select(".covmapzoomOutGroupTimeline")
				.on("click", function() {
					zoomTimeline.scaleBy(timelinePanel.main.transition().duration(duration), 0.5);
				});

			function removeTicks(ticks) {
				ticks.style("opacity", 1);
				ticks.each(function(_, i, n) {
					if (n[i + 1] && (window.getComputedStyle(this, null).getPropertyValue("opacity") === "1")) {
						const thisBox = n[i].getBoundingClientRect();
						for (let j = i + 1; j < n.length; j++) {
							const nextBox = n[j].getBoundingClientRect();
							if (nextBox.left < thisBox.right) {
								d3.select(n[j]).style("opacity", 0);
							};
						};
					};
				});
			};

			function pieGroupsTimelineMouseover(completeDatum) {

				currentHoveredElem = this;

				tooltip.style("display", "block")
					.html(null);

				tooltip.on("mouseleave", pieGroupsTimelineMouseout);

				if (completeDatum.country === "Several countries") {
					createCountriesListTooltip(completeDatum);
				} else {
					createCountryTooltip(completeDatum, true);
				};

				function createCountriesListTooltip(completeDatum) {

					const innerTooltip = tooltip.append("div")
						.attr("id", "covmapInnerTooltipDiv");

					innerTooltip.append("div")
						.style("margin-bottom", "8px")
						.html("Date: " + timeFormatList(completeDatum.allocationDate));

					const tooltipContainerHeader = innerTooltip.append("div")
						.style("margin", "0px")
						.style("display", "flex")
						.style("flex-wrap", "wrap")
						.style("width", "300px");

					tooltipContainerHeader.append("div")
						.style("display", "flex")
						.style("flex", "0 56%")
						.style("margin-bottom", null)
						.html("Total for all countries:");

					tooltipContainerHeader.append("div")
						.style("display", "flex")
						.style("flex", "0 44%")
						.style("justify-content", "flex-end")
						.style("color", d3.color(cerfColor).darker(0.4))
						.style("margin-bottom", "8px")
						.html("$" + formatMoney0Decimals(completeDatum.cerf));

					const header = innerTooltip.append("div")
						.style("margin-bottom", "10px")
						.style("margin-top", "10px")
						.style("font-size", "16px")
						.style("color", "dimgray")
						.style("width", "300px");

					header.append("strong")
						.html("List of countries ");

					const scrollText = completeDatum.countriesList.length > 6 ? ", scroll down to reveal more" : "";

					header.append("div")
						.style("font-size", "14px")
						.html("(click for details" + scrollText + ")");

					const countryDivContainer = innerTooltip.append("div")
						.attr("class", "covmapcountryDivContainer");

					const countryDiv = countryDivContainer.selectAll(null)
						.data(completeDatum.countriesList)
						.enter()
						.append("div")
						.style("margin-bottom", "6px")
						.style("cursor", "pointer");

					countryDiv.append("div")
						.style("border-top", "1px solid #dbdbdb")
						.style("padding-top", "6px")
						.style("margin-bottom", "6px")
						.style("font-size", "16px")
						.style("color", "dimgray")
						.append("strong")
						.html(function(d) {
							return d.country
						});

					const countryDivList = countryDiv.append("div")
						.attr("class", "covmapcountryDivList");

					countryDivList.append("div")
						.style("display", "flex")
						.style("flex", "0 56%")
						.html("Total Allocated:");

					countryDivList.append("div")
						.style("display", "flex")
						.style("flex", "0 44%")
						.style("justify-content", "flex-end")
						.style("color", d3.color(cerfColor).darker(0.4))
						.html(function(d) {
							return "$" + formatMoney0Decimals(d.cerf);
						});

					countryDiv.on("click", function(d) {
						tooltip.html(null);
						createCountryTooltip(d, true);
						const mousePosition = d3.mouse(containerDiv.node());
						const tooltipBox = tooltip.node().getBoundingClientRect();
						const thisOffsetTop = Math.min(svgBox.bottom - svgBox.top - tooltipBox.height, svgBox.bottom - svgBox.top - (svgBox.height - mousePosition[1] + 20));
						tooltip.style("top", thisOffsetTop + "px");
					});

					//end of createCountriesListTooltip
				};

				const thisBox = d3.select(this)
					.select(".covmappieGroupsTimelineCircle")
					.node()
					.getBoundingClientRect();

				const svgBox = svg.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = svgBox.bottom - svgBox.top - tooltipBox.height;

				const thisOffsetLeft = svgBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
					(thisBox.left + 2 * (radiusScaleTimeline(completeDatum.cerf) * (svgBox.width / width))) - svgBox.left + tooltipMargin :
					thisBox.left - svgBox.left - tooltipBox.width - tooltipMargin;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");

				//end of pieGroupsTimelineMouseover
			};

			function pieGroupsTimelineMouseout() {

				if (isSnapshotTooltipVisible) return;

				currentHoveredElem = null;

				tooltip.html(null)
					.style("display", "none");

			};

			//end of createTimeline
		};

		function createTimelineHighlight() {

			const timeData = chartState.selectedMonth.map(function(d) {
				if (d === allData) {
					return [timelineScale.domain()[0], timelineScale.domain()[1]]
				} else {
					const firstDate = timeParserButtons(d);
					const lastDate = d3.min([timelineScale.domain()[1], d3.timeMonth.offset(firstDate, 1)]);
					return [firstDate, lastDate];
				};
			});

			const timelineHighlightGroup = timelinePanel.main.select(".covmaptimelineHighlightGroup");

			let highlightRects = timelineHighlightGroup.selectAll(".covmaphighlightRects")
				.data(timeData);

			const highlightRectsExit = highlightRects.exit()
				.transition()
				.duration(duration)
				.attr("width", 0)
				.remove();

			const highlightRectsEnter = highlightRects.enter()
				.append("rect")
				.attr("class", "covmaphighlightRects")
				.attr("height", timelinePanel.axisHeight)
				.attr("x", function(d) {
					return timelineScale(d[0])
				})
				.attr("width", 0)
				.style("fill", "#555555");

			highlightRects = highlightRectsEnter.merge(highlightRects);

			timelinePanel.main.select(".covmaptimelineAxisGroup")
				.selectAll(".tick text")
				.style("fill", null)
				.each(function(d) {
					let inInterval = false;
					timeData.forEach(function(e) {
						if (d >= e[0] && d < e[1]) inInterval = true;
					});
					d3.select(this).style("fill", inInterval ? "white" : null);
				});

			timelinePanel.main.selectAll(".covmappieGroupsTimeline")
				.each(function(d) {
					let inInterval = false;
					timeData.forEach(function(e) {
						if (d.allocationDate >= e[0] && d.allocationDate < e[1]) inInterval = true;
					});
					d3.select(this)
						.transition()
						.duration(duration)
						.style("opacity", inInterval ? 1 : fadeOpacity);
				});

			highlightRects.transition()
				.duration(duration)
				.attr("x", function(d) {
					return timelineScale(d[0])
				})
				.attr("width", function(d) {
					return timelineScale(d[1]) - timelineScale(d[0]);
				})
				.end()
				.then(function() {
					highlightRects.each(function(d) {
						let rectX = +d3.select(this).attr("x");
						let rectWidth = +d3.select(this).attr("width");
						const highlightedTicks = timelinePanel.main.select(".covmaptimelineAxisGroup")
							.selectAll(".tick text").filter(function(e) {
								return ((e >= d[0] && e < d[1]) && d3.select(this).style("opacity") === "1");
							});
						const firstTick = highlightedTicks.nodes()[0];
						const lastTick = highlightedTicks.nodes()[highlightedTicks.size() - 1];
						while ((firstTick.getBoundingClientRect().left - 1) < this.getBoundingClientRect().left) {
							d3.select(this).attr("x", --rectX);
							d3.select(this).attr("width", ++rectWidth);
						};
						while ((lastTick.getBoundingClientRect().right + 1) > this.getBoundingClientRect().right) {
							d3.select(this).attr("width", ++rectWidth);
						};
					});
				});

			//end of createTimelineHighlight
		};

		function createCountryTooltip(datum, showDate) {

			const innerTooltip = tooltip.append("div")
				.attr("id", "covmapInnerTooltipDiv");

			innerTooltip.append("div")
				.style("margin-bottom", "10px")
				.style("font-size", "16px")
				.style("color", "dimgray")
				.style("width", "300px")
				.append("strong")
				.html(datum.country);

			if (showDate) {
				innerTooltip.append("div")
					.style("margin-bottom", "8px")
					.style("margin-top", "-8px")
					.html("Date: " + timeFormatList(datum.allocationDate));
			};

			const tooltipContainer = innerTooltip.append("div")
				.style("margin", "0px")
				.style("display", "flex")
				.style("flex-wrap", "wrap")
				.style("width", "300px");

			tooltipContainer.append("div")
				.style("display", "flex")
				.style("flex", "0 56%")
				.html("Total Allocated:");

			tooltipContainer.append("div")
				.style("display", "flex")
				.style("flex", "0 44%")
				.style("justify-content", "flex-end")
				.style("color", d3.color(cerfColor).darker(0.4))
				.html("$" + formatMoney0Decimals(datum.cerf));

			let selectedTooltipButton = null;

			typesOfTargeted.some(function(target) {
				let total = 0;
				typesOfPeople.forEach(function(people) {
					total += datum["target" + target + peopleScale(people)];
				});
				if (total) selectedTooltipButton = target;
				return !!total;
			});

			const buttonsDiv = innerTooltip.append("div")
				.attr("class", "covmapbuttonsDiv");

			const buttonsTitle = innerTooltip.append("div")
				.style("margin-bottom", selectedTooltipButton ? "0px" : "12px")
				.style("margin-top", "0px")
				.style("font-size", "12px")
				.html("Targeted People: " + (selectedTooltipButton ? targetedScale(selectedTooltipButton) : "to be determined"));

			if (selectedTooltipButton) {

				const tooltipButtons = buttonsDiv.selectAll(null)
					.data(typesOfTargeted)
					.enter()
					.append("button")
					.attr("class", "covmaptooltipButtons")
					.property("disabled", function(d) {
						let total = 0;
						typesOfPeople.forEach(function(e) {
							total += datum["target" + d + peopleScale(e)];
						});
						return total ? false : true;
					})
					.style("cursor", function(d) {
						let total = 0;
						typesOfPeople.forEach(function(e) {
							total += datum["target" + d + peopleScale(e)];
						});
						return total ? "pointer" : "default";
					})
					.html(function(d) {
						return d === "HostCommunities" ? "Host" : targetedScale(d);
					});

				tooltipButtons.filter(function(d) {
					return d === "Disable";
				}).attr("id", "covmaptooltipButtonsDisabled");

				tooltipButtons.on("click", function(d) {
					if (selectedTooltipButton === d) return;
					selectedTooltipButton = d;
					buttonsTitle.html("Targeted People: " + targetedScale(selectedTooltipButton));
					createTooltipSvg(selectedTooltipButton);
				});

				const tooltipSvg = innerTooltip.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight);

				const yAxisGroup = tooltipSvg.append("g")
					.attr("class", "covmapTooltipSvgYAxisGroup")
					.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)");

				const xAxisGroup = tooltipSvg.append("g")
					.attr("class", "covmapTooltipSvgXAxisGroup")
					.attr("transform", "translate(0," + tooltipSvgPadding[0] + ")");

				createTooltipSvg(selectedTooltipButton);

				function createTooltipSvg(selectedTargeted) {

					const svgData = typesOfPeople.map(function(d) {
						return {
							people: peopleScale(d),
							value: datum["target" + selectedTargeted + peopleScale(d)]
						};
					}).sort(function(a, b) {
						return b.value - a.value;
					});

					tooltipSvgYScale.domain(svgData.map(function(d) {
						return d.people;
					}));

					tooltipSvgXScale.domain([0, d3.max(svgData, function(d) {
						return d.value;
					})]);

					if (tooltipSvgXScale.domain()[1] === 0) {
						tooltipSvgXScale.range([tooltipSvgPadding[3], tooltipSvgPadding[3]]);
					} else {
						tooltipSvgXScale.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]]);
					};

					yAxisGroup.transition()
						.duration(duration)
						.call(tooltipSvgYAxis);

					xAxisGroup.transition()
						.duration(duration)
						.call(tooltipSvgXAxis);

					xAxisGroup.selectAll(".tick")
						.filter(function(d) {
							return d === 0;
						})
						.remove();

					let peopleGroups = tooltipSvg.selectAll(".covmappeopleGroups")
						.data(svgData);

					const peopleGroupsEnter = peopleGroups.enter()
						.append("g")
						.attr("class", "covmappeopleGroups");

					const peopleGroupStick = peopleGroupsEnter.append("rect")
						.attr("x", tooltipSvgPadding[3])
						.attr("y", -stickHeight / 4)
						.attr("height", stickHeight)
						.attr("width", 0)
						.style("fill", tooltipStickColor);

					const peopleGroupLollipop = peopleGroupsEnter.append("circle")
						.attr("cx", tooltipSvgPadding[3])
						.attr("cy", (stickHeight / 4))
						.attr("r", lollipopRadius)
						.style("fill", tooltipLollipopColor);

					const peopleGroupLabel = peopleGroupsEnter.append("text")
						.attr("class", "covmapcbpfLabel")
						.attr("x", tooltipSvgXScale(0))
						.attr("y", 4)
						.text(formatNumberSI(0));

					peopleGroups = peopleGroupsEnter.merge(peopleGroups);

					peopleGroups.attr("transform", function(d) {
						return "translate(0," + tooltipSvgYScale(d.people) + ")";
					});

					peopleGroups.select("rect")
						.transition()
						.duration(duration)
						.attr("width", function(d) {
							return tooltipSvgXScale(d.value) - tooltipSvgPadding[3];
						});

					peopleGroups.select("circle")
						.transition()
						.duration(duration)
						.attr("cx", function(d) {
							return tooltipSvgXScale(d.value);
						});

					peopleGroups.select("text")
						.transition()
						.duration(duration)
						.attr("x", function(d) {
							return tooltipSvgXScale(d.value) + labelPadding + lollipopRadius
						})
						.textTween(function(d) {
							const i = d3.interpolate(0, d.value);
							return function(t) {
								return d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
							};
						});

					//end of createTooltipSvg 
				};

			};

			const tooltipDetailsButtonDiv = innerTooltip.append("div")
				.attr("class", "covmaptooltipDetailsButtonDiv");

			const tooltipDetailsButton = tooltipDetailsButtonDiv.append("button")
				.html("Display Details")
				.on("click", function() {
					tooltip.style("display", "none");
					generateList(datum);
					listContainerDiv.node().scrollIntoView({
						behavior: "smooth"
					});
				});

			//end of createCountryTooltip
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
				.text("LEGEND");

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
				.attr("x2", legendPanel.padding[3] + radiusScale.range()[1] + 38)
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
				.attr("x", legendPanel.padding[3] + radiusScale.range()[1] + 42)
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

			//end of createLegend
		};

		function generateList(data) {

			yearsDescriptionDiv.html(null);

			listContainerDiv.html("")
				.style("display", "block");

			listContainerDiv.on("mouseover", function() {
				tooltip.style("display", "none")
					.html(null);
			});

			const listTopDivContainer = listContainerDiv.append("div")
				.attr("class", "covmaplistTopDivContainer");

			const listTopDivTitleDiv = listTopDivContainer.append("div")
				.attr("class", "covmaplistTopDivTitleDiv")
				.html("Allocation Details");

			const listTopDivButtonDiv = listTopDivContainer.append("div")
				.attr("class", "covmaplistTopDivButtonDiv");

			const listTopDivButton = listTopDivButtonDiv.append("button")
				.html("Remove this list")
				.on("click", function() {
					containerDiv.node().scrollIntoView({
						behavior: "smooth"
					});
					listContainerDiv.html("")
						.style("display", "none");
					setYearsDescriptionDiv();
				});

			const allocationContainerDiv = listContainerDiv.selectAll(null)
				.data(data.allocationsList)
				.enter()
				.append("div")
				.attr("class", "covmapallocationContainerDiv");

			const allocationTitle = allocationContainerDiv.append("div")
				.attr("class", "covmapallocationTitle")
				.style("background-color", function(d) {
					return d.PFType === "CBPF" ? cbpfColor : d3.color(cerfColor).darker(0.3);
				})
				.html(function(d) {
					return d.PFType + " &mdash; " + d.Country;
				});

			const allocationHeaderDiv = allocationContainerDiv.append("div")
				.attr("class", "covmapallocationHeaderDiv");

			const allocationTitleDiv = allocationHeaderDiv.append("div")
				.attr("class", "covmapallocationTitleDiv");

			const allocationSourceDiv = allocationHeaderDiv.append("div")
				.attr("class", "covmapallocationSourceDiv");

			const allocationAmountDiv = allocationHeaderDiv.append("div")
				.attr("class", "covmapallocationAmountDiv");

			const allocationDateDiv = allocationHeaderDiv.append("div")
				.attr("class", "covmapallocationDateDiv");

			const allocationTitleDivText = allocationTitleDiv.append("div")
				.attr("class", "covmapallocationTitleDivText")
				.html("Allocation Title");

			const allocationSourceDivText = allocationSourceDiv.append("div")
				.attr("class", "covmapallocationSourceDivText")
				.html("Allocation Source");

			const allocationAmountDivText = allocationAmountDiv.append("div")
				.attr("class", "covmapallocationAmountDivText")
				.html("Allocation Amount");

			const allocationDateDivText = allocationDateDiv.append("div")
				.attr("class", "covmapallocationDateDivText")
				.html("Date of launch");

			const allocationTitleDivValue = allocationTitleDiv.append("div")
				.attr("class", "covmapallocationTitleDivValue")
				.html(function(d) {
					return d.AllocTitle || "Not available";
				});

			const allocationSourceDivValue = allocationSourceDiv.append("div")
				.attr("class", "covmapallocationSourceDivValue")
				.html(function(d) {
					return d.TypeOfAlloc || "Not available";
				});

			const allocationAmountDivValue = allocationAmountDiv.append("div")
				.attr("class", "covmapallocationAmountDivValue")
				.html(function(d) {
					return d.TargetAmt ? "$" + formatMoney0Decimals(+d.TargetAmt) : "Not available";
				});

			const allocationDateDivValue = allocationDateDiv.append("div")
				.attr("class", "covmapallocationDateDivValue")
				.html(function(d) {
					return timeFormatList(new Date(d.DateOfAlloc)) || "Not available";
				});

			const allocationThemeDiv = allocationContainerDiv.append("div")
				.attr("class", "covmapallocationThemeDiv");

			const allocationSummaryDiv = allocationContainerDiv.append("div")
				.attr("class", "covmapallocationSummaryDiv");

			const locationSummaryDiv = allocationContainerDiv.append("div")
				.attr("class", "covmaplocationSummaryDiv");

			const allocationThemeDivText = allocationThemeDiv.append("div")
				.attr("class", "covmapallocationThemeDivText")
				.html("Allocation Theme");

			const allocationSummaryDivText = allocationSummaryDiv.append("div")
				.attr("class", "covmapallocationSummaryDivText")
				.html("Allocation Summary");

			const locationSummaryDivText = locationSummaryDiv.append("div")
				.attr("class", "covmaplocationSummaryDivText")
				.html("Location Summary");

			const allocationThemeDivValue = allocationThemeDiv.append("div")
				.attr("class", "covmapallocationThemeDivValue")
				.html(function(d) {
					return d.AllocTheme || "Not available";
				});

			const allocationSummaryDivValue = allocationSummaryDiv.append("div")
				.attr("class", "covmapallocationSummaryDivValue")
				.html(function(d) {
					return d.AllocSummary || "Not available";
				});

			const locationSummaryDivValue = locationSummaryDiv.append("div")
				.attr("class", "covmaplocationSummaryDivValue")
				.html(function(d) {
					return d.AllocLocation || "Not available";
				});

			const affectedPersonsContainerDiv = allocationContainerDiv.append("div")
				.attr("class", "covmapaffectedPersonsContainerDiv");

			const affectedPersonsContainerText = affectedPersonsContainerDiv.append("div")
				.attr("class", "covmapaffectedPersonsContainerText")
				.html("Affected Persons");

			affectedPersonsContainerDiv.each(function(d) {
				const tableData = typesOfTargeted.map(function(e) {
					const obj = {
						targeted: e,
						Total: 0
					};
					typesOfPeople.forEach(function(f) {
						obj[peopleScale(f)] = +d["Target" + e + f];
						obj.Total += +d["Target" + e + f];
					});
					return obj;
				});
				const tableDataFiltered = tableData.filter(function(d) {
					const thisSum = typesOfPeople.reduce(function(acc, curr) {
						acc += d[peopleScale(curr)];
						return acc;
					}, 0);
					return thisSum;
				});
				if (!tableDataFiltered.length) {
					const affectedPersonsContainerValue = d3.select(this).append("div")
						.attr("class", "covmapaffectedPersonsContainerValue")
						.html("To be determined");
				} else {

					const thisDiv = d3.select(this);

					const dataWithoutDisabled = tableDataFiltered.filter(function(d) {
						return d.targeted !== "Disable";
					});
					const disabledData = tableDataFiltered.filter(function(d) {
						return d.targeted === "Disable";
					});

					const withoutDisabledHeaderDiv = thisDiv.append("div")
						.attr("class", "covmapwithoutDisabledHeaderDiv");

					const headers = ["Affected Person Type"].concat(typesOfPeople.map(function(d) {
						return peopleScale(d);
					}));

					headers.push("Total");

					headers.forEach(function(d) {
						withoutDisabledHeaderDiv.append("div")
							.attr("class", "covmapwithoutDisabledHeaderDivText")
							.html(d);
					});

					dataWithoutDisabled.forEach(function(d, i) {
						const withoutDisabledHeaderValues = thisDiv.append("div")
							.attr("class", "covmapwithoutDisabledHeaderValues")
							.style("background-color", i % 2 ? "#e6e6e6" : null);
						headers.forEach(function(e, i) {
							withoutDisabledHeaderValues.append("div")
								.attr("class", "covmapwithoutDisabledHeaderValuesText")
								.html(!i ? targetedScale(d.targeted) : d[peopleScale(e)]);
						});
					});

					disabledData.forEach(function(d, i) {
						const disabledHeaderValues = thisDiv.append("div")
							.attr("class", "covmapdisabledHeaderValues")
							.style("margin-top", "12px")
						headers.forEach(function(e, i) {
							disabledHeaderValues.append("div")
								.attr("class", "covmapdisabledHeaderValuesText")
								.html(!i ? "Persons with disabilities" : d[peopleScale(e)]);
						});
					});

				};
			});

			const disclaimersDiv = allocationContainerDiv.append("div")
				.attr("class", "covmapdisclaimersDiv")
				.style("margin-top", "6px")
				.style("text-align", "right");

			disclaimersDiv.html("* Number of people targeted with few allocations are not yet available.<br>* Number of people targeted may include double-counting.");

			//end of generateList
		};

		function preProcessData(rawData) {

			const totalCountries = rawData.map(function(d) {
				return d.ISO2Country;
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			});

			let totalValue = 0;

			rawData.forEach(function(row) {
				if (monthsArray.indexOf(timeFormat(new Date(row.DateOfAlloc))) === -1) monthsArray.push(timeFormat(new Date(row.DateOfAlloc)));
				if (!countryNames[row.ISO2Country] && row.ISO2Country) countryNames[row.ISO2Country] = row.Country;
				totalValue += +row.TargetAmt;
			});

			monthsArray.sort(function(a, b) {
				return timeParserButtons(a) - timeParserButtons(b);
			});

			monthsArray.push(allData);

			const totalSpan = d3.select("#covmaptotalSpan");

			const totalCountriesSpan = d3.select("#covmaptotalCountriesSpan");

			if (totalSpan.size()) {
				const totalSpanValue = parseInt(formatSIFloat(totalValue), 10);
				totalSpan.html(totalSpanValue);
			};

			if (totalCountriesSpan.size()) {
				totalCountriesSpan.html(totalCountries.length);
			};

			//end of preProcessData
		};

		function processData(rawData) {

			const data = [];

			rawData.forEach(function(row) {
				if (chartState.selectedMonth[0] === allData || (chartState.selectedMonth.indexOf(timeFormat(new Date(row.DateOfAlloc))) > -1 && row.ISO2Country)) {

					if (chartState.countriesInData.indexOf(row.ISO2Country) === -1) chartState.countriesInData.push(row.ISO2Country);

					const foundCountry = data.find(function(d) {
						return d.isoCode === row.ISO2Country;
					});

					if (foundCountry) {
						foundCountry.allocationsList.push(row);
						typesOfTargeted.forEach(function(target) {
							typesOfPeople.forEach(function(people) {
								foundCountry["target" + target + peopleScale(people)] += +row["Target" + target + people];
								foundCountry.targetTotal += +row["Target" + target + people];
							});
						});
						foundCountry.cerf += +row.TargetAmt;
					} else {
						const countryObject = {
							country: row.Country.trim(),
							labelText: row.Country.split(" "),
							isoCode: row.ISO2Country,
							cerf: +row.TargetAmt,
							targetTotal: 0,
							allocationsList: [row]
						};
						typesOfTargeted.forEach(function(target) {
							typesOfPeople.forEach(function(people) {
								countryObject["target" + target + peopleScale(people)] = +row["Target" + target + people];
								countryObject.targetTotal += +row["Target" + target + people];
							});
						});
						data.push(countryObject);
					};
				};
			});

			return data;

			//end of processData
		};

		function processDataTimeline(rawData) {

			const data = [];

			rawData.forEach(function(row) {

				const foundAllocation = data.find(function(d) {
					return d.isoCode === row.ISO2Country && (timeFormatAxis(new Date(row.DateOfAlloc)) === timeFormatAxis(d.allocationDate));
				});

				if (foundAllocation) {
					foundAllocation.allocationsList.push(row);
					typesOfTargeted.forEach(function(target) {
						typesOfPeople.forEach(function(people) {
							foundAllocation["target" + target + peopleScale(people)] += +row["Target" + target + people];
							foundAllocation.targetTotal += +row["Target" + target + people];
						});
					});
					foundAllocation.cerf += +row.TargetAmt;
				} else {
					const countryObject = {
						allocationDate: new Date(row.DateOfAlloc),
						country: row.Country.trim(),
						labelText: row.Country.split(" "),
						isoCode: row.ISO2Country,
						cerf: +row.TargetAmt,
						targetTotal: 0,
						allocationsList: [row]
					};
					typesOfTargeted.forEach(function(target) {
						typesOfPeople.forEach(function(people) {
							countryObject["target" + target + peopleScale(people)] = +row["Target" + target + people];
							countryObject.targetTotal += +row["Target" + target + people];
						});
					});
					data.push(countryObject);
				};
			});

			return data;

			//end of processDataTimeline
		};

		function createCsv(rawData) {

			const data = processData(rawData);

			data.forEach(function(row) {
				delete row.allocationsList;
				delete row.labelText;
			});

			const csv = d3.csvFormat(data);

			return csv;
		};

		function setYearsDescriptionDiv() {
			const timelineScaleText = "Timeline sizes follow the legend size when “All” is selected.";
			yearsDescriptionDiv.html(function() {
				if (chartState.selectedMonth[0] === allData) return "Aggregated data for all months. " + timelineScaleText;
				if (chartState.selectedMonth.length === 1) return "Selected month: " + chartState.selectedMonth[0] + ". " + timelineScaleText;
				const yearsList = chartState.selectedMonth.sort(function(a, b) {
					return d3.ascending(timeParserButtons(a), timeParserButtons(b));
				}).reduce(function(acc, curr, index) {
					return acc + (index >= chartState.selectedMonth.length - 2 ? index > chartState.selectedMonth.length - 2 ? curr : curr + " and " : curr + ", ");
				}, "");
				return "Selected months: " + yearsList + ". " + timelineScaleText;
			});
		};

		function verifyCentroids(rawData) {
			rawData.forEach(function(row) {
				if (!centroids[row.ISO2Country]) {
					centroids[row.ISO2Country] = {
						x: mapProjection([0, 0])[0],
						y: mapProjection([0, 0])[1]
					};
					console.warn("Attention: " + row.ISO2Country + "(" + row.Country + ") has no centroid");
				};
			});
		};

		function validateMonth(monthString) {
			const allMonths = monthString.split(",").map(function(d) {
				return capitalize(d.trim().toLowerCase());
			});
			allMonths.forEach(function(d) {
				if (d && monthsArray.indexOf(d) > -1) chartState.selectedMonth.push(d);
			});
			if (!chartState.selectedMonth.length) chartState.selectedMonth.push(allData);
		};

		function displayLabels(labelSelection) {
			labelSelection.each(function(d) {
				const outerElement = this;
				const outerBox = this.getBoundingClientRect();
				labelSelection.each(function(e) {
					if (outerElement !== this) {
						const innerBox = this.getBoundingClientRect();
						if (!(outerBox.right < innerBox.left ||
								outerBox.left > innerBox.right ||
								outerBox.bottom < innerBox.top ||
								outerBox.top > innerBox.bottom)) {
							if ((e.cbpf + e.cerf) < (d.cbpf + d.cerf)) {
								d3.select(this).style("display", "none");
								d3.select(this.previousSibling).style("display", "none");
							} else {
								d3.select(outerElement).style("display", "none");
								d3.select(outerElement.previousSibling).style("display", "none");
							};
						};
					};
				});
			});
		};

		function displayLabelsTimeline(labelSelectionTimeline) {
			const labelNodes = labelSelectionTimeline.nodes();
			labelNodes.sort(function(a, b) {
				return a.parentNode.transform.baseVal.consolidate().matrix.e - b.parentNode.transform.baseVal.consolidate().matrix.e;
			});
			labelNodes.forEach(function(outerElem) {
				const outerBox = outerElem.getBoundingClientRect();
				labelNodes.forEach(function(innerElem) {
					if (outerElem !== innerElem) {
						const innerBox = innerElem.getBoundingClientRect();
						if (!(outerBox.right < innerBox.left ||
								outerBox.left > innerBox.right ||
								outerBox.bottom < innerBox.top ||
								outerBox.top > innerBox.bottom)) {
							d3.select(innerElem).style("display", "none");
						};
					};
				});
			});
		};

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1)
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value);
		};

		function formatSIFloatWithoutUnit(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			const returnValue = d3.formatPrefix("." + digits, value)(value)
			return returnValue.substring(0, returnValue.length - 1);
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

		function saveImages(iconsList) {

			iconsList.forEach(function(d) {
				if (!localStorage.getItem("storedIcon" + d)) {
					getBase64FromImage(iconsUrl + d + "icon.png", setLocal, null, d);
				};
			});

			function getBase64FromImage(url, onSuccess, onError, iconName) {
				const xhr = new XMLHttpRequest();

				xhr.responseType = "arraybuffer";
				xhr.open("GET", url);

				xhr.onload = function() {
					let base64, binary, bytes, mediaType;

					bytes = new Uint8Array(xhr.response);

					binary = [].map.call(bytes, function(byte) {
						return String.fromCharCode(byte);
					}).join('');

					mediaType = xhr.getResponseHeader('content-type');

					base64 = [
						'data:',
						mediaType ? mediaType + ';' : '',
						'base64,',
						btoa(binary)
					].join('');
					onSuccess(iconName, base64);
				};

				xhr.onerror = onError;

				xhr.send();
			};

			function setLocal(iconName, base64) {
				localStorage.setItem("storedIcon" + iconName, base64);
			};

			//end of saveImages
		};

		function createAnnotationsDiv() {

			tooltip.style("pointer-events", "none");

			const overDiv = containerDiv.append("div")
				.attr("class", "covmapOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + height);

			const mainTextRect = helpSVG.append("rect")
				.attr("x", width * 0.6)
				.attr("y", topPanel.height + panelHorizontalPadding)
				.attr("width", width * 0.4)
				.attr("height", buttonsPanel.height + panelHorizontalPadding + 4)
				.style("fill", "white")
				.style("pointer-events", "all")
				.style("cursor", "pointer")
				.on("click", function() {
					tooltip.style("pointer-events", "all")
						.html(null);
					overDiv.remove();
				});

			const mainText = helpSVG.append("text")
				.attr("class", "covmapAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width * 0.85)
				.attr("y", topPanel.height + 28)
				.text("CLICK HERE TO CLOSE THE HELP");

			const helpData = [{
				x: 6,
				y: 68,
				width: 380,
				height: 30,
				xTooltip: 40,
				yTooltip: 94,
				text: "Use these buttons to select the month. You can select more than one month. Double click or press ALT when clicking to select multiple months. Click the arrows to reveal more years."
			}, {
				x: 6,
				y: 108,
				width: 36,
				height: 60,
				xTooltip: 40,
				yTooltip: 130,
				text: "Use these buttons to zoom in or out. Alternatively, you can use the mousewheel or the trackpad over the map to zoom in or out."
			}, {
				x: 6,
				y: 172,
				width: 24,
				height: 22,
				xTooltip: 30,
				yTooltip: 166,
				text: "Click this checkbox for showing or hiding the countries’ names."
			}, {
				x: 48,
				y: 108,
				width: 1042,
				height: 480,
				xTooltip: 400,
				yTooltip: 260,
				text: "This area shows the allocations for each country. Hover over the pies to display a tooltip with additional information. In the tooltip you can click the buttons to select the type of targeted people. Also, in the tooltip, you can click “Display Details” to show detailed list of allocations in that given country, just below the map."
			}, {
				x: 6,
				y: 596,
				width: 1084,
				height: 270,
				xTooltip: 400,
				yTooltip: 430,
				text: "This timeline shows the allocations according to their dates. Allocations in the same day are merged and displayed as “Several countries”. Hover over the pies to display a tooltip with additional information. In the tooltip for “Several countries” pies you can click on each country to display that country’s information and scroll down to reveal more countries."
			}];

			helpData.forEach(function(d) {
				helpSVG.append("rect")
					.attr("rx", 4)
					.attr("ry", 4)
					.attr("x", d.x)
					.attr("y", d.y)
					.attr("width", d.width)
					.attr("height", d.height)
					.style("stroke", unBlue)
					.style("stroke-width", "3px")
					.style("fill", "none")
					.style("opacity", 0.5)
					.attr("class", "covmapHelpRectangle")
					.attr("pointer-events", "all")
					.on("mouseover", function() {
						const self = this;
						createTooltip(d.xTooltip, d.yTooltip, d.text, self);
					})
					.on("mouseout", removeTooltip);
			});

			const explanationTextRect = helpSVG.append("rect")
				.attr("x", (width / 2) - 180)
				.attr("y", 244)
				.attr("width", 360)
				.attr("height", 50)
				.attr("pointer-events", "none")
				.style("fill", "white")
				.style("stroke", "#888");

			const explanationText = helpSVG.append("text")
				.attr("class", "covmapAnnotationExplanationText")
				.attr("font-family", "Roboto")
				.attr("font-size", "18px")
				.style("fill", "#222")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 264)
				.attr("pointer-events", "none")
				.text("Hover over the elements surrounded by a blue rectangle to get additional information")
				.call(wrapText2, 350);

			function createTooltip(xPos, yPos, text, self) {
				explanationText.style("opacity", 0);
				explanationTextRect.style("opacity", 0);
				helpSVG.selectAll(".covmapHelpRectangle").style("opacity", 0.1);
				d3.select(self).style("opacity", 1);
				const containerBox = containerDiv.node().getBoundingClientRect();
				tooltip.style("top", (yPos * (containerBox.width / width)) + "px")
					.style("left", (xPos * (containerBox.height / height)) + "px")
					.style("display", "block")
					.append("div")
					.style("max-width", "300px")
					.attr("id", "covmapInnerTooltipDiv")
					.html(text);
			};

			function removeTooltip() {
				tooltip.style("display", "none")
					.html(null);
				explanationText.style("opacity", 1);
				explanationTextRect.style("opacity", 1);
				helpSVG.selectAll(".covmapHelpRectangle").style("opacity", 0.5);
			};

			//end of createAnnotationsDiv
		};

		function wrapText2(text, width) {
			text.each(function() {
				let text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.1,
					y = text.attr("y"),
					x = text.attr("x"),
					dy = 0,
					tspan = text.text(null)
					.append("tspan")
					.attr("x", x)
					.attr("y", y)
					.attr("dy", dy + "em");
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node()
						.getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan")
							.attr("x", x)
							.attr("y", y)
							.attr("dy", ++lineNumber * lineHeight + dy + "em")
							.text(word);
					}
				}
			});
		};

		function createFooterDiv() {

			let footerText = "© OCHA " + currentYear;

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

			if (fromContextMenu && currentHoveredElem) setSvgStyles(tooltip.select("svg").node());

			iconsDiv.style("opacity", 0);

			snapshotTooltip.style("display", "none");

			svg.selectAll("image")
				.attr("xlink:href", function(d) {
					return localStorage.getItem("storedIcon" + d.icon);
				});

			html2canvas(imageDiv).then(function(canvas) {

				svg.attr("width", null)
					.attr("height", null);

				iconsDiv.style("opacity", 1);

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

			const fileName = "Covid19Allocations_" + csvDateFormat(currentDate) + ".png";

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

			d3.image("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/covmap/cbpf-cerf-logo.png")
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

					const intro = pdf.splitTextToSize("CBPF and CERF allocations related to COVID-19 pandemic.", (210 - pdfMargins.left - pdfMargins.right), {
						fontSize: 12
					});

					const fullDate = d3.timeFormat("%A, %d %B %Y")(new Date());

					pdf.setTextColor(60);
					pdf.setFont('helvetica');
					pdf.setFontType("normal");
					pdf.setFontSize(10);
					pdf.text(pdfMargins.left, 50, intro);

					pdf.setTextColor(65, 143, 222);
					pdf.setFont('helvetica');
					pdf.setFontType("bold");
					pdf.setFontSize(14);
					pdf.text("COVID-19 Allocations", pdfMargins.left, 44);

					pdf.setFontSize(10);

					const monthsList = chartState.selectedMonth[0] === allData ? "All" : chartState.selectedMonth.sort(function(a, b) {
						return timeParserButtons(a) - timeParserButtons(b);
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedMonth.length - 2 ? index > chartState.selectedMonth.length - 2 ? curr : curr + " and " : curr + ", ");
					}, "");

					const monthsText = chartState.selectedMonth.length > 1 || chartState.selectedMonth[0] === allData ? "Selected months: " : "Selected month: ";

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + monthsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						monthsList + "</span></div>", pdfMargins.left, 58, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 6, widthInMilimeters, heightInMilimeters);

					const currentDate = new Date();

					pdf.save("Covid19Allocations_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#covmapDownloadingDiv").remove();

					function createLetterhead() {

						const footer = "© OCHA 2020";

						pdf.setFillColor(65, 143, 222);
						pdf.rect(0, pdfMargins.top, 210, 15, "F");

						pdf.setFillColor(236, 161, 84);
						pdf.rect(0, pdfMargins.top + 15, 210, 2, "F");

						pdf.setFillColor(255, 255, 255);
						pdf.rect(pdfMargins.left, pdfMargins.top - 1, 94, 20, "F");

						pdf.ellipse(pdfMargins.left, pdfMargins.top + 9, 5, 9, "F");
						pdf.ellipse(pdfMargins.left + 94, pdfMargins.top + 9, 5, 9, "F");

						pdf.addImage(logo, "PNG", pdfMargins.left + 2, pdfMargins.top + 2, 90, 14);

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
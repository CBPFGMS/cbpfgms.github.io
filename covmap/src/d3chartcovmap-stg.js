(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylescovmap-stg.css", fontAwesomeLink],
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
			legendPanelHeight = 140,
			legendPanelWidth = 110,
			legendPanelHorPadding = 2,
			legendPanelVertPadding = 2,
			mapZoomButtonHorPadding = 10,
			mapZoomButtonVertPadding = 10,
			mapZoomButtonSize = 26,
			maxPieSize = 32,
			minPieSize = 1,
			buttonsNumber = 10,
			groupNamePadding = 2,
			unBlue = "#1F69B3",
			cbpfColor = "#418FDE",
			cerfColor = "#F9D25B",
			fadeOpacity = 0.2,
			fillOpacityValue = 0.8,
			tooltipMargin = -4,
			tooltipSvgWidth = 300,
			tooltipSvgHeight = 80,
			showNamesMargin = 12,
			tooltipSvgPadding = [14, 34, 2, 45],
			height = padding[0] + padding[2] + topPanelHeight + buttonsPanelHeight + mapPanelHeight + (2 * panelHorizontalPadding),
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
			timeFormat = d3.timeFormat("%b-%y"),
			timeParserButtons = d3.timeParse("%b-%y"),
			timeFormatList = d3.timeFormat("%d %B, %Y"),
			vizNameQueryString = "allocationsmap",
			allData = "allData",
			dataUrl = "https://cbpfapi.unocha.org/vo2/odata/ExtendedAllocationDetails?PoolfundCodeAbbrv=&$format=csv",
			mapUrl = "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/worldmaptopo110m.json",
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			typesOfTargeted = ["HostCommunities", "Refugees", "Returnees", "IDPs", "Others", "Disable"],
			typesOfPeople = ["M", "W", "B", "G"],
			monthsArray = [],
			countryNames = {},
			centroids = {},
			chartState = {
				selectedMonth: [allData],
				countriesInData: [],
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

		const showNamesOption = queryStringValues.has("shownames") ? queryStringValues.get("shownames") === "true" : containerDiv.node().getAttribute("data-shownames") === "true";

		const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

		chartState.showNames = showNamesOption;

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
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
			leftPadding: [94, 264, 464, 790, 940],
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
			padding: [0, 0, 0, 0],
			buttonWidth: 64,
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
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: mapPanelHeight,
			padding: [0, 0, 0, 0],
		};

		const legendPanel = {
			main: svg.append("g")
				.attr("class", "covmaplegendPanel")
				.attr("transform", "translate(" + (padding[3] + legendPanelHorPadding) + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding) + mapPanel.height - legendPanelHeight - legendPanelVertPadding) + ")"),
			width: legendPanelWidth,
			height: legendPanelHeight,
			padding: [30, 0, 12, 4],
		};

		const mapZoomButtonPanel = {
			main: svg.append("g")
				.attr("class", "covmapmapZoomButtonPanel")
				.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding) + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding) + mapZoomButtonVertPadding) + ")"),
			width: mapZoomButtonSize,
			height: mapZoomButtonSize * 2,
			padding: [4, 4, 4, 4],
		};

		const checkboxesPanel = {
			main: svg.append("g")
				.attr("class", "covmapcheckboxesPanel")
				.attr("transform", "translate(" + (padding[3] + mapZoomButtonHorPadding + 1) + "," + (padding[0] + topPanel.height + buttonsPanel.height + (2 * panelHorizontalPadding) + mapZoomButtonVertPadding + mapZoomButtonPanel.height + showNamesMargin) + ")"),
			padding: [0, 0, 0, 0],
		};

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

		const mapProjection = d3.geoEqualEarth();

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

		function csvCallback(rawData, mapData) {

			preProcessData(rawData);

			removeProgressWheel();

			draw(rawData, mapData);

			//end of csvCallback
		};

		function draw(rawData, mapData) {

			const data = processData(rawData);

			createTitle(rawData);

			createButtonsPanel(rawData);

			createMap(mapData);

			verifyCentroids(rawData);

			createZoomButtons();

			createCheckboxes();

			createTopPanel(data);

			createPies(data);

			createLegend(data);

			createFooterDiv();

			setYearsDescriptionDiv();

			if (showHelp) createAnnotationsDiv();

			//end of draw
		};

		function createTitle(rawData) {

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
					chartState.selectedMonth.length = 1;
					loopButtons();
					timer = d3.interval(loopButtons, 2 * duration);
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
					return a !== b;
				})))
				.style("fill", "none")
				.style("stroke", "#DADADA")
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
				.attr("x", 18)
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

		function createTopPanel(data) {

			const allocationsValue = d3.sum(data, function(d) {
				return d.allocationsList.length;
			});

			const countriesValue = data.length;

			const beneficiariesValue = d3.sum(data, function(d) {
				return d.targetTotal;
			});

			const cbpfValue = d3.sum(data, function(d) {
				return d.cbpf;
			});

			const cerfValue = d3.sum(data, function(d) {
				return d.cerf;
			});

			const previousAllocations = d3.select(".covmaptopPanelAllocationsNumber").size() !== 0 ? d3.select(".covmaptopPanelAllocationsNumber").datum() : 0;

			const previousCountries = d3.select(".covmaptopPanelCountriesNumber").size() !== 0 ? d3.select(".covmaptopPanelCountriesNumber").datum() : 0;

			const previousBeneficiaries = d3.select(".covmaptopPanelBeneficiariesNumber").size() !== 0 ? d3.select(".covmaptopPanelBeneficiariesNumber").datum() : 0;

			const previousCbpf = d3.select(".covmaptopPanelCbpfNumber").size() !== 0 ? d3.select(".covmaptopPanelCbpfNumber").datum() : 0;

			const previousCerf = d3.select(".covmaptopPanelCerfNumber").size() !== 0 ? d3.select(".covmaptopPanelCerfNumber").datum() : 0;

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

			let topPanelBeneficiariesNumber = topPanel.main.selectAll(".covmaptopPanelBeneficiariesNumber")
				.data([beneficiariesValue]);

			topPanelBeneficiariesNumber = topPanelBeneficiariesNumber.enter()
				.append("text")
				.attr("class", "covmaptopPanelBeneficiariesNumber")
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.leftPadding[2] - topPanel.mainValueHorPadding)
				.merge(topPanelBeneficiariesNumber);

			topPanelBeneficiariesNumber.transition()
				.duration(duration)
				.textTween(function(d) {
					const i = d3.interpolate(previousBeneficiaries, d);
					return function(t) {
						return formatSIFloatWithoutUnit(i(t))
					};
				});

			let topPanelBeneficiariesText = topPanel.main.selectAll(".covmaptopPanelBeneficiariesText")
				.data([beneficiariesValue]);

			topPanelBeneficiariesText = topPanelBeneficiariesText.enter()
				.append("text")
				.attr("class", "covmaptopPanelBeneficiariesText")
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
				.attr("x", topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
				.merge(topPanelBeneficiariesText)
				.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						" People";
				});

			const topPanelBeneficiariesSubText = topPanel.main.selectAll(".covmaptopPanelBeneficiariesSubText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "covmaptopPanelBeneficiariesSubText")
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.15)
				.attr("x", topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
				.text("Targeted");

			let topPanelCbpfNumber = topPanel.main.selectAll(".covmaptopPanelCbpfNumber")
				.data([cbpfValue]);

			topPanelCbpfNumber = topPanelCbpfNumber.enter()
				.append("text")
				.attr("class", "covmaptopPanelCbpfNumber")
				.attr("text-anchor", "end")
				.style("fill", cbpfColor)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.leftPadding[3] - topPanel.mainValueHorPadding)
				.merge(topPanelCbpfNumber);

			topPanelCbpfNumber.transition()
				.duration(duration)
				.textTween(function(d) {
					const i = d3.interpolate(previousCbpf, d);
					return function(t) {
						return "$" + formatSIFloat(i(t));
					};
				});

			const topPanelCbpfText = topPanel.main.selectAll(".covmaptopPanelCbpfText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "covmaptopPanelCbpfText")
				.attr("x", topPanel.leftPadding[3] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.8)
				.text("CBPF");

			let topPanelCerfNumber = topPanel.main.selectAll(".covmaptopPanelCerfNumber")
				.data([cerfValue]);

			topPanelCerfNumber = topPanelCerfNumber.enter()
				.append("text")
				.attr("class", "covmaptopPanelCerfNumber")
				.attr("text-anchor", "start")
				.style("fill", d3.color(cerfColor).darker(0.3))
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.leftPadding[4] + topPanel.mainValueHorPadding)
				.merge(topPanelCerfNumber);

			topPanelCerfNumber.transition()
				.duration(duration)
				.textTween(function(d) {
					const i = d3.interpolate(previousCerf, d);
					return function(t) {
						return "$" + formatSIFloat(i(t));
					};
				});

			const topPanelCerfText = topPanel.main.selectAll(".covmaptopPanelCerfText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "covmaptopPanelCerfText")
				.attr("x", topPanel.leftPadding[4] - topPanel.mainValueHorPadding)
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.8)
				.text("CERF");

			const dividingLine = topPanel.main.selectAll(".covmapdividingLine")
				.data([true])
				.enter()
				.append("line")
				.attr("y1", topPanel.linePadding)
				.attr("y2", topPanel.height - topPanel.linePadding)
				.attr("x1", (topPanel.leftPadding[3] + topPanel.leftPadding[4]) / 2)
				.attr("x2", (topPanel.leftPadding[3] + topPanel.leftPadding[4]) / 2)
				.style("stroke", "#ccc")
				.style("stroke-width", "2px");

			//end of createTopPanel
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

				const allYears = chartState.selectedMonth.map(function(d) {
					return d;
				}).join("|");

				if (queryStringValues.has("year")) {
					queryStringValues.set("year", allYears);
				} else {
					queryStringValues.append("year", allYears);
				};

				buttonsRects.style("fill", function(e) {
					return chartState.selectedMonth.indexOf(e) > -1 ? unBlue : "#eaeaea";
				});

				buttonsText.style("fill", function(e) {
					return chartState.selectedMonth.indexOf(e) > -1 ? "white" : "#444";
				});

				const data = processData(rawData);

				createTopPanel(data);

				createPies(data);

				createLegend(data);

				setYearsDescriptionDiv();

				//end of clickButtonsRects
			};

			//end of createButtonsPanel
		};

		function createPies(unfilteredData) {

			const data = unfilteredData.filter(function(d) {
				return d.cbpf + d.cerf;
			});

			zoom.on("zoom", zoomed);

			const currentTransform = d3.zoomTransform(mapPanel.main.node());

			data.sort(function(a, b) {
				return (b.cbpf + b.cerf) -
					(a.cbpf + a.cerf);
			});

			const maxValue = d3.max(data, function(d) {
				return d.cbpf + d.cerf;
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

			const groupNameBack = pieGroupEnter.append("text")
				.attr("class", "covmapgroupNameBack")
				.attr("x", function(d) {
					return radiusScale(d.cbpf + d.cerf) + groupNamePadding;
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
							.attr("x", radiusScale(d.cbpf + d.cerf) + groupNamePadding)
							.attr("dy", 12)
							.text(d.labelText.length > 2 ? d.labelText.filter(function(_, i) {
									return i > 1;
								}).join(" ") :
								d.labelText[1]);
					};
				});

			const groupName = pieGroupEnter.append("text")
				.attr("class", "covmapgroupName")
				.attr("x", function(d) {
					return radiusScale(d.cbpf + d.cerf) + groupNamePadding;
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
							.attr("x", radiusScale(d.cbpf + d.cerf) + groupNamePadding)
							.attr("dy", 12)
							.text(d.labelText.length > 2 ? d.labelText.filter(function(_, i) {
									return i > 1;
								}).join(" ") :
								d.labelText[1]);
					};
				});

			pieGroup = pieGroupEnter.merge(pieGroup);

			pieGroup.order();

			pieGroup.selectAll("text, tspan")
				.data(function(d) {
					return d;
				});

			pieGroup.selectAll("text, tspan")
				.transition()
				.duration(duration)
				.style("opacity", chartState.showNames ? 1 : 0)
				.attr("x", function(d) {
					return radiusScale(d.cbpf + d.cerf) + groupNamePadding;
				});

			let slices = pieGroup.selectAll(".covmapslice")
				.data(function(d) {
					return pieGenerator([{
						value: d.cerf,
						total: d.cbpf + d.cerf,
						type: "cerf"
					}, {
						value: d.cbpf,
						total: d.cbpf + d.cerf,
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
					const thisTotal = radiusScale(parentDatum.cbpf + parentDatum.cerf);
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
				.style("stroke-width", "1px")
				.style("fill-opacity", fillOpacityValue)
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

				const innerTooltip = tooltip.append("div")
					.attr("id", "covmapInnerTooltipDiv");

				innerTooltip.append("div")
					.style("margin-bottom", "10px")
					.style("font-size", "16px")
					.style("color", "dimgray")
					.style("width", "300px")
					.append("strong")
					.html(datum.country);

				const tooltipContainer = innerTooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "300px");

				const tooltipData = [{
					title: "CBPF ",
					property: "cbpf",
					color: cbpfColor
				}, {
					title: "CERF ",
					property: "cerf",
					color: d3.color(cerfColor).darker(0.4)
				}].filter(function(e) {
					return datum[e.property];
				});

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
						.html("$" + formatMoney0Decimals(datum[e.property]));
				});

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
							.style("fill", cbpfColor);

						const peopleGroupLollipop = peopleGroupsEnter.append("circle")
							.attr("cx", tooltipSvgPadding[3])
							.attr("cy", (stickHeight / 4))
							.attr("r", lollipopRadius)
							.style("fill", cbpfColor);

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

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

				const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
					(thisBox.left + 2 * radiusScale(datum.cbpf + datum.cerf)) - containerBox.left + tooltipMargin :
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
				.attr("y", legendPanel.padding[0] - 18)
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

			const legendColors = legendPanel.main.selectAll(".covmaplegendColors")
				.data(["cbpf", "cerf"])
				.enter()
				.append("g")
				.attr("class", "covmaplegendColors")
				.attr("transform", function(_, i) {
					return "translate(" + legendPanel.padding[3] + "," + (legendPanel.height - legendPanel.padding[2] - (+i * 18)) + ")";
				});

			legendColors.append("rect")
				.attr("width", 10)
				.attr("height", 10)
				.attr("rx", 1)
				.attr("ry", 1)
				.style("stroke-width", "0.5px")
				.style("stroke", "#666")
				.style("fill", function(_, i) {
					return i ? cerfColor : cbpfColor;
				});

			legendColors.append("text")
				.attr("x", 14)
				.attr("y", 9)
				.text(function(d) {
					return d.toUpperCase() + " Allocations";
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
						.html("No Affected Persons");
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

			//end of generateList
		};

		function preProcessData(rawData) {

			rawData.forEach(function(row) {
				if (monthsArray.indexOf(timeFormat(new Date(row.DateOfAlloc))) === -1) monthsArray.push(timeFormat(new Date(row.DateOfAlloc)));
				if (!countryNames[row.ISO2Country] && row.ISO2Country) countryNames[row.ISO2Country] = row.Country;
			});

			monthsArray.sort(function(a, b) {
				return timeParserButtons(a) - timeParserButtons(b);
			});

			monthsArray.push(allData);

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
						pushCbpfOrCerf(foundCountry, row);
					} else {
						const countryObject = {
							country: row.Country.trim(),
							labelText: row.Country.split(" "),
							isoCode: row.ISO2Country,
							cbpf: 0,
							cerf: 0,
							targetTotal: 0,
							allocationsList: [row]
						};
						pushCbpfOrCerf(countryObject, row);
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

			function pushCbpfOrCerf(obj, row) {
				if (row.PFType.toLowerCase() === "cbpf") {
					obj.cbpf += +row.TargetAmt;
				} else if (row.PFType.toLowerCase() === "cerf") {
					obj.cerf += +row.TargetAmt;
				};
			};

			//end of processData
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
			yearsDescriptionDiv.html(function() {
				if (chartState.selectedMonth[0] === allData) return "\u002AAggregated data for all months.";
				if (chartState.selectedMonth.length === 1) return null;
				const yearsList = chartState.selectedMonth.sort(function(a, b) {
					return a - b;
				}).reduce(function(acc, curr, index) {
					return acc + (index >= chartState.selectedMonth.length - 2 ? index > chartState.selectedMonth.length - 2 ? curr : curr + " and " : curr + ", ");
				}, "");
				return "\u002ASelected months: " + yearsList;
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

		function createAnnotationsDiv() {

			tooltip.style("pointer-events", "none");

			const overDiv = containerDiv.append("div")
				.attr("class", "covmapOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + height);

			const mainTextRect = helpSVG.append("rect")
				.attr("x", width * 0.7)
				.attr("y", topPanel.height + panelHorizontalPadding)
				.attr("width", width * 0.3)
				.attr("height", buttonsPanel.height + panelHorizontalPadding)
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
				x: 16,
				y: 68,
				width: 380,
				height: 30,
				xTooltip: 40,
				yTooltip: 94,
				text: "Use these buttons to select the month. You can select more than one month. Double click or press ALT when clicking to select just a single year. Click the arrows to reveal more years."
			}, {
				x: 9,
				y: 108,
				width: 36,
				height: 60,
				xTooltip: 40,
				yTooltip: 130,
				text: "Use these buttons to zoom in or out. Alternatively, you can use the mousewheel or the trackpad over the map to zoom in or out."
			}, {
				x: 10,
				y: 172,
				width: 24,
				height: 22,
				xTooltip: 30,
				yTooltip: 166,
				text: "Click this checkbox for showing or hiding the countries’ names."
			}, {
				x: 50,
				y: 108,
				width: 1040,
				height: 480,
				xTooltip: 400,
				yTooltip: 260,
				text: "This area shows the allocations for each country. Hover over the pies to display a tooltip with additional information. In the tooltip you can click the buttons to select the type of targeted people. Also, in the tooltip, you can click “Display Details” to show detailed list of allocations in that given country, just below the map."
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

			iconsDiv.style("opacity", 0);

			snapshotTooltip.style("display", "none");

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
					pdf.setFontSize(12);
					pdf.text(pdfMargins.left, 60, intro);

					pdf.setTextColor(65, 143, 222);
					pdf.setFont('helvetica');
					pdf.setFontType("bold");
					pdf.setFontSize(16);
					pdf.text("COVID-19 Allocations", pdfMargins.left, 44);

					pdf.setFontSize(12);

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div>", pdfMargins.left, 64, {
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

						const footer = "© OCHA CBPF Section 2019 | For more information, please visit pfbi.unocha.org";

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
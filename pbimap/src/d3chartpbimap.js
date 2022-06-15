(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isPfbiSite = window.location.hostname === "cbpf.data.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "cbpf.data.unocha.org/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		leafletCSSLink = "https://cbpfgms.github.io/libraries/leaflet.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbimap.css", fontAwesomeLink, leafletCSSLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js",
		leafletURL = "https://cbpfgms.github.io/libraries/leaflet.js",
		html2ToCanvas = "https://cbpfgms.github.io/libraries/html2canvasrc3.min.js",
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
			loadScript(leafletURL, function() {
				loadScript(d3URL, d3Chart);
			});
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(leafletURL, function() {
					loadScript(d3URL, d3Chart);
				});
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(leafletURL, function() {
							loadScript(d3URL, d3Chart);
						});
					});
				});
			});
		};
	} else {
		if (hasFetch && hasURLSearchParams) {
			loadScript(leafletURL, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(leafletURL, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(leafletURL, d3Chart);
					});
				});
			});
		};
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

		//Object.assign()

		if (typeof Object.assign != 'function') {
			Object.defineProperty(Object, "assign", {
				value: function assign(target, varArgs) {
					'use strict';
					if (target == null) {
						throw new TypeError('Cannot convert undefined or null to object');
					}

					var to = Object(target);

					for (var index = 1; index < arguments.length; index++) {
						var nextSource = arguments[index];

						if (nextSource != null) {
							for (var nextKey in nextSource) {
								if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
									to[nextKey] = nextSource[nextKey];
								}
							}
						}
					}
					return to;
				},
				writable: true,
				configurable: true
			});
		}

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

		const width = 1110,
			heightLeafletMap = 420,
			heightTopSvg = 60,
			topSvgPadding = [0, 10, 0, 10],
			topSvgHorizontalPositions = [0.18, 0.38, 0.58, 0.76],
			topSvgMainValueVerPadding = 12,
			topSvgMainValueHorPadding = 2,
			legendSvgWidth = 110,
			legendSvgHeight = 134,
			legendSvgPadding = [4, 4, 4, 12],
			legendTitlePadding = 58,
			legendSvgVerticalPos = heightLeafletMap - legendSvgHeight,
			buttonTitlePadding = 12,
			legendButtonWidth = 42,
			legendButtonHeight = 20,
			duration = 1000,
			tooltipDuration = 250,
			tooltipMargin = 2,
			heightProgressSVG = heightLeafletMap + heightTopSvg,
			windowHeight = window.innerHeight,
			brighterFactor = 0.3,
			currentYear = new Date().getFullYear(),
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			adminLocLevels = 6,
			beneficiariesList = ["Men", "Women", "Boys", "Girls"],
			dataAttributes = ["CBPF", "Partner", "Cluster"],
			csvFormatParameter = "&$format=csv",
			yearParameter = "AllocationYear=",
			initialYear = 2015,
			yearsArrayString = d3.range(initialYear, currentYear + 1, 1).map(function(d) {
				return d.toString();
			}),
			chartTitleDefault = "Allocations Overview",
			vizNameQueryString = "allocations-overview",
			bookmarkSite = "https://cbpf.data.unocha.org/bookmark.html?",
			helpPortalUrl = "https://gms.unocha.org/content/business-intelligence#allocations%20overview",
			formatMoney0Decimals = d3.format(",.0f"),
			zoomSnap = 0.25,
			zoomDelta = 0.5,
			maxZoomValue = 12,
			mapInitialLatitude = 20,
			mapInitialLongitude = 10,
			mapInitialZoom = 1.75,
			minCircleRadius = 0.5,
			maxCircleRadius = 20,
			circleColor = "#E56A54",
			circleGlobalColor = "#418FDE",
			maxMarkerColor = "#CD3A1F",
			maxMarkerGlobalColor = "#1F69B3",
			unBlue = "#1F69B3",
			highlightColor = "#F79A3B",
			circleStroke = "#555",
			markerStroke = "#555",
			markerAttribute = "M0,0l-8.8-17.7C-12.1-24.3-7.4-32,0-32h0c7.4,0,12.1,7.7,8.8,14.3L0,0z",
			noDataTextPosition = heightLeafletMap / 2,
			minValueColor = "#eee",
			colorInterpolator = d3.interpolateRgb(minValueColor, maxMarkerColor),
			colorInterpolatorGlobal = d3.interpolateRgb(minValueColor, maxMarkerGlobalColor),
			tooltipSvgWidth = 270,
			tooltipSvgHeight = 80,
			tooltipSvgPadding = [6, 36, 14, 45],
			stickHeight = 2,
			lollipopRadius = 3,
			formatSIaxes = d3.format("~s"),
			fadeOpacity = 0.4,
			fadeOpacityMenu = 0.5,
			partnersLogoPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/partnerslogo.png",
			projectsLogoPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/projectslogo.png",
			tooltipThumbnailPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/pbimaptooltip.png",
			tooltipThumbnailPathCors = "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/pbimaptooltip.png",
			partnersLogoPathCors = "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/partnerslogo.png",
			projectsLogoPathCors = "https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/projectslogo.png",
			partnersProjectSize = 50,
			apiFiles = ["https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryV2?",
				"https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryAggV2?"
			],
			cbpfListFile = "https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
			clustersListFile = "https://cbpfapi.unocha.org/vo2/odata/MstClusters?$format=csv",
			partnersListFile = "https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
			modalitiesListFile = "https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource?$format=csv",
			launchedAllocationsDataFile = "https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=%20&$format=csv",
			promises = [],
			filterTitles = ["Year", "CBPF", "Partner Type", "Cluster", "Allocation Type", "Location Level"],
			filterColorsArray = ["#E8F5D6", "#F1E9DA", "#E4D8F3", "#E6E6E6", "#F8D8D3", "#D4E5F7"],
			listHeader = ["Project Code", "Project Title", "Partner", "Allocation Type", "Targeted People", "Allocations"],
			listHeadersWidth = ["18%", "32%", "20%", "12%", "9%", "9%"],
			listRowsWidth = ["18%", "32.5%", "20%", "12.5%", "8.5%", "8.5%"],
			chartState = {
				selectedYear: [],
				selectedPartner: [],
				selectedCBPF: [],
				selectedModality: ["all"],
				selectedCluster: [],
				selectedAdminLevel: null,
				displayMode: "size"
			},
			loadedYears = [],
			cbpfsList = {},
			cbpfsCodeList = {},
			clustersList = {},
			partnersList = {},
			modalitiesList = {},
			allocationsTypeList = [],
			cbpfsInCompleteData = {},
			lowercaseAllocationsTypeList = [],
			countriesCoordinates = {},
			launchedAllocationsData = [],
			yearsWithUnderApprovalAboveMin = {},
			completeData = [];

		let initialChartState,
			timer,
			launchedValue,
			launchedValuePadding,
			isSnapshotTooltipVisible = false,
			currentHoveredElem;

		yearsArrayString.forEach(function(d) {
			cbpfsInCompleteData[d] = [];
		});

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainerpbimap");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") || chartTitleDefault;

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const minimumUnderApprovalValue = +containerDiv.node().getAttribute("data-minvalue") || 0;

		const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year") : containerDiv.node().getAttribute("data-year");

		chartState.selectedYear.push(validateYear(selectedYearString));

		const selectedModalityString = queryStringValues.has("modality") ? queryStringValues.get("modality") : null;

		if (selectedModalityString) chartState.selectedModality = selectedModalityString.split("|");

		if (selectedResponsiveness === "false") {
			containerDiv.style("width", width + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbimapTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbimapTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbimapIconsDiv d3chartIconsDiv");

		const topSvg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + heightTopSvg);

		if (isInternetExplorer) {
			topSvg.attr("height", heightTopSvg);
		};

		const filtersDiv = containerDiv.append("div")
			.attr("class", "pbimapFiltersDiv");

		const mapContainedDiv = containerDiv.append("div")
			.attr("id", "pbimapContainerDiv")
			.style("height", heightLeafletMap + "px");

		const breadcrumbsDivContainer = containerDiv.append("div")
			.style("min-height", "30px")
			.attr("class", "pbimapBreadcrumbDivContainer");

		const breadcrumbDiv = breadcrumbsDivContainer.append("div")
			.style("pointer-events", "none")
			.style("position", "absolute")
			.attr("class", "pbimapBreadcrumbDiv");

		const showAllDiv = breadcrumbsDivContainer.append("div")
			.style("position", "absolute")
			.style("display", "flex")
			.style("width", "99%")
			.style("min-height", "30px")
			.style("align-items", "center")
			.style("justify-content", "flex-end")
			.attr("class", "pbimapshowAllDiv");

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbimapFooterDiv") : null;

		const listDiv = containerDiv.append("div")
			.attr("class", "pbimapListContainerDiv");

		createProgressWheel(null, width, heightProgressSVG, "Loading visualisation...");

		const leafletMap = L.map("pbimapContainerDiv", {
			zoomSnap: zoomSnap,
			zoomDelta: zoomDelta
		});

		leafletMap.setView([mapInitialLatitude, mapInitialLongitude], mapInitialZoom);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: maxZoomValue
		}).addTo(leafletMap);

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "pbimapSnapshotTooltip")
			.attr("class", "pbimapSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "pbimapSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "pbimapSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "pbimapTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "pbimaptooltipdiv")
			.style("display", "none");

		containerDiv.on("contextmenu", function() {
			d3.event.preventDefault();
			const thisMouse = d3.mouse(this);
			isSnapshotTooltipVisible = true;
			snapshotTooltip.style("display", "block")
				.style("top", thisMouse[1] - 4 + "px")
				.style("left", thisMouse[0] - 4 + "px");
		});

		const svgLayer = L.svg();

		svgLayer.addTo(leafletMap);

		const d3MapSvgGroup = d3.select(".leaflet-overlay-pane g")
			.attr("class", "pbimapD3MapSvg");

		const legendDiv = mapContainedDiv.append("div")
			.attr("class", "pbimapLegendDiv")
			.style("top", legendSvgVerticalPos + "px");

		const legendSvg = legendDiv.append("svg")
			.attr("class", "pbimapLegendSvg")
			.attr("width", legendSvgWidth)
			.attr("height", legendSvgHeight);

		const filterColorScale = d3.scaleOrdinal()
			.domain(filterTitles)
			.range(filterColorsArray);

		const listScale = d3.scaleOrdinal()
			.domain(dataAttributes)
			.range([cbpfsList, partnersList, clustersList]);

		const radiusScale = d3.scaleSqrt()
			.range([minCircleRadius, maxCircleRadius]);

		const colorsQuantile = d3.range(10).map(function(d) {
			return colorInterpolator(d / 9);
		});

		const colorsQuantileGlobal = d3.range(10).map(function(d) {
			return colorInterpolatorGlobal(d / 9);
		});

		const colorScale = d3.scaleQuantile();

		const tooltipSvgYScale = d3.scalePoint()
			.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
			.domain(beneficiariesList)
			.padding(0.5);

		const tooltipSvgXScale = d3.scaleLinear()
			.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]]);

		const tooltipSvgYAxis = d3.axisLeft(tooltipSvgYScale)
			.tickSize(0)
			.tickPadding(5);

		const tooltipSvgXAxis = d3.axisBottom(tooltipSvgXScale)
			.tickSizeOuter(0)
			.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]))
			.ticks(2)
			.tickPadding(4)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const listHeaderScale = d3.scaleOrdinal()
			.domain(listHeader)
			.range(["PrjCode", "PrjTitle", "OrgNm", "AllNm", "AdmLocBenClustAgg", "AdmLocClustBdg"]);

		if (!isInternetExplorer) saveImage(tooltipThumbnailPathCors, "tooltipThumbnail");

		if (!isInternetExplorer) saveImage(partnersLogoPathCors, "partnersLogo");

		if (!isInternetExplorer) saveImage(projectsLogoPathCors, "projectsLogo");

		apiFiles.forEach(function(file) {
			promises.push(d3.csv(file + yearParameter + chartState.selectedYear[0] + csvFormatParameter))
		});

		promises.push(d3.csv(cbpfListFile));
		promises.push(d3.csv(clustersListFile));
		promises.push(d3.csv(partnersListFile));
		promises.push(d3.csv(modalitiesListFile));
		promises.push(d3.csv(launchedAllocationsDataFile));

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		Promise.all(promises).then(function(rawData) {

			removeProgressWheel();

			rawData[6].forEach(function(row) {
				yearsWithUnderApprovalAboveMin[row.AllocationYear] = (yearsWithUnderApprovalAboveMin[row.AllocationYear] || 0) + (+row.TotalUnderApprovalBudget);
				launchedAllocationsData.push(row);
			});

			for (const year in yearsWithUnderApprovalAboveMin) {
				yearsWithUnderApprovalAboveMin[year] = yearsWithUnderApprovalAboveMin[year] > minimumUnderApprovalValue;
			};

			createCbpfsList(rawData[2]);

			createCbpfsCodeList(rawData[2]);

			createClustersList(rawData[3]);

			createPartnersList(rawData[4]);

			createModalitiesList(rawData[5]);

			createCountriesCoordinates(rawData[2]);

			processData(rawData[0], rawData[1]);

			loadedYears.push.apply(loadedYears, chartState.selectedYear);

			getDataAttributes();

			if (!lazyLoad) {
				draw();
			} else {
				d3.select(window).on("scroll.pbimap", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbimap", null);
					draw();
				};
			};

			const remainingYears = yearsArrayString.filter(function(d) {
				return chartState.selectedYear.indexOf(+d) === -1;
			}).sort(function(a, b) {
				return (+b) - (+a);
			});

			function loadDataFile(year) {
				const remainingPromises = apiFiles.map(function(file) {
					return d3.csv(file + yearParameter + year + csvFormatParameter);
				});
				return Promise.all(remainingPromises).then(function(rawData) {
					processData(rawData[0], rawData[1]);
					loadedYears.push(+year);
					repopulateYearFilter();
				});
			};

			async function loadAllDataFiles(yearsArray) {
				for (const year of yearsArray) {
					await loadDataFile(year);
				};
			};

			loadAllDataFiles(remainingYears);

			//end of Promise.all
		});

		function draw() {

			const data = filterData();

			createTitle();

			createFilterDivs(data);

			repopulateYearFilter();

			if (!isPfbiSite) createFooterDiv();

			createTopSvg(data.topSvgObject);

			createMap(data.map);

			createLegendSvg(data.map);

			createBreadcrumbDiv();

			createShowAllButton(data.map);

			leafletMap.on("zoom", redrawMap);

			if (showHelp) createAnnotationsDiv();

			//end of draw
		};

		function createTitle() {

			const title = titleDiv.append("p")
				.attr("class", "pbimapTitle contributionColorHTMLcolor")
				.html(chartTitle);

			launchedValue = titleDiv.append("p")
				.attr("class", "pbimaplaunchedValue");

			const helpIcon = iconsDiv.append("button")
				.attr("id", "pbimapHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "pbimapDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			const snapshotDiv = iconsDiv.append("div")
				.attr("class", "pbimapSnapshotDiv");

			const snapshotIcon = snapshotDiv.append("button")
				.attr("id", "pbimapSnapshotButton");

			snapshotIcon.html("IMAGE ")
				.append("span")
				.attr("class", "fas fa-camera");

			const snapshotContent = snapshotDiv.append("div")
				.attr("class", "pbimapSnapshotContent");

			const pdfSpan = snapshotContent.append("p")
				.attr("id", "pbimapSnapshotPdfText")
				.html("Download PDF")
				.on("click", function() {
					createSnapshot("pdf", false);
				});

			const pngSpan = snapshotContent.append("p")
				.attr("id", "pbimapSnapshotPngText")
				.html("Download Image (PNG)")
				.on("click", function() {
					createSnapshot("png", false);
				});

			if (!isBookmarkPage) {

				const shareIcon = iconsDiv.append("button")
					.attr("id", "pbimapShareButton");

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
					.attr("id", "pbimapBestVisualizedText")
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

				const data = filterData();

				const csv = createCsv(data.map);

				const currentDate = new Date();

				const fileName = "AllocationsOverview_" + csvDateFormat(currentDate) + ".csv";

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

		function createTopSvg(data) {

			const yearsListOriginal = chartState.selectedYear.sort(function(a, b) {
				return a - b;
			}).filter(function(d) {
				return yearsWithUnderApprovalAboveMin[d];
			});

			const yearsList = yearsListOriginal.reduce(function(acc, curr, index) {
				return acc + (index >= yearsListOriginal.length - 2 ? index > yearsListOriginal.length - 2 ? curr : curr + " and " : curr + ", ");
			}, "");

			launchedValue
				.style("opacity", chartState.selectedYear.some(e => yearsWithUnderApprovalAboveMin[e]) ? 1 : 0)
				.html("Launched Allocations in " + yearsList + ": ");

			launchedValue.append("span")
				.classed("contributionColorHTMLcolor", true)
				.html("$" + formatSIFloat(data.launchedAllocations).replace("k", " Thousand").replace("M", " Million").replace("G", " Billion"));

			const previousAllocations = d3.select(".pbimapTopSvgAllocations").size() ? d3.select(".pbimapTopSvgAllocations").datum() : 0;
			const previousBeneficiaries = d3.select(".pbimapTopSvgBeneficiaries").size() ? d3.select(".pbimapTopSvgBeneficiaries").datum() : 0;
			const previousProjects = d3.select(".pbimapTopSvgProjects").size() ? d3.select(".pbimapTopSvgProjects").datum() : 0;
			const previousPartners = d3.select(".pbimapTopSvgPartners").size() ? d3.select(".pbimapTopSvgPartners").datum() : 0;

			let topSvgAllocations = topSvg.selectAll(".pbimapTopSvgAllocations")
				.data([data.totalAllocations]);

			topSvgAllocations = topSvgAllocations.enter()
				.append("text")
				.attr("class", "pbimapTopSvgAllocations contributionColorFill")
				.attr("text-anchor", "end")
				.attr("y", heightTopSvg - topSvgMainValueVerPadding)
				.attr("x", (width * topSvgHorizontalPositions[0]) - topSvgMainValueHorPadding)
				.merge(topSvgAllocations);

			topSvgAllocations.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this,
						i = d3.interpolate(previousAllocations, d),
						valueSI = formatSIFloat(d),
						unit = valueSI[valueSI.length - 1];
					return function(t) {
						const siString = formatSIFloat(i(t));
						node.textContent = "$" + (+unit !== +unit ? siString.substring(0, siString.length - 1) : siString);
					};
				})
				.on("end", function() {
					const thisBox = this.getBoundingClientRect();
					const containerBox = containerDiv.node().getBoundingClientRect();
					const thisLeftPadding = thisBox.left - containerBox.left;
					launchedValue.style("padding-left", thisLeftPadding - 28 + "px", "important"); //28px is the cumulative margins
				});

			let topSvgAllocationsText = topSvg.selectAll(".pbimapTopSvgAllocationsText")
				.data([data.totalAllocations]);

			topSvgAllocationsText = topSvgAllocationsText.enter()
				.append("text")
				.attr("class", "pbimapTopSvgAllocationsText")
				.attr("text-anchor", "start")
				.attr("y", heightTopSvg - topSvgMainValueVerPadding * 2.7)
				.attr("x", (width * topSvgHorizontalPositions[0]) + topSvgMainValueHorPadding)
				.merge(topSvgAllocationsText);

			topSvgAllocationsText.text(function(d) {
				const valueSI = formatSIFloat(d),
					unit = valueSI[valueSI.length - 1];
				return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "");
			});

			const topSvgAllocationsSubtitle = topSvg.selectAll(".pbimapTopSvgAllocationsSubtitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbimapTopSvgAllocationsSubtitle")
				.attr("y", heightTopSvg - topSvgMainValueVerPadding * 1.1)
				.attr("x", (width * topSvgHorizontalPositions[0]) + topSvgMainValueHorPadding)
				.text("Allocated");

			let topSvgBeneficiaries = topSvg.selectAll(".pbimapTopSvgBeneficiaries")
				.data([data.totalBeneficiaries]);

			topSvgBeneficiaries = topSvgBeneficiaries.enter()
				.append("text")
				.attr("class", "pbimapTopSvgBeneficiaries contributionColorFill")
				.attr("text-anchor", "end")
				.attr("y", heightTopSvg - topSvgMainValueVerPadding)
				.attr("x", (width * topSvgHorizontalPositions[1]) - topSvgMainValueHorPadding)
				.merge(topSvgBeneficiaries);

			topSvgBeneficiaries.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this,
						i = d3.interpolate(previousBeneficiaries, d),
						valueSI = formatSIFloat(d),
						unit = valueSI[valueSI.length - 1];
					return function(t) {
						const siString = formatSIFloat(i(t));
						d3.select(node).text(+unit !== +unit ? siString.substring(0, siString.length - 1) : siString);
					};
				});

			let topSvgBeneficiariesText = topSvg.selectAll(".pbimapTopSvgBeneficiariesText")
				.data([data.totalBeneficiaries]);

			topSvgBeneficiariesText = topSvgBeneficiariesText.enter()
				.append("text")
				.attr("class", "pbimapTopSvgBeneficiariesText")
				.attr("text-anchor", "start")
				.attr("y", heightTopSvg - topSvgMainValueVerPadding * 2.7)
				.attr("x", (width * topSvgHorizontalPositions[1]) + topSvgMainValueHorPadding)
				.merge(topSvgBeneficiariesText);

			topSvgBeneficiariesText.text(function(d) {
				const valueSI = formatSIFloat(d),
					unit = valueSI[valueSI.length - 1];
				return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "");
			});

			const topSvgBeneficiariesSubtitle = topSvg.selectAll(".pbimapTopSvgBeneficiariesSubtitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbimapTopSvgBeneficiariesSubtitle")
				.attr("y", heightTopSvg - topSvgMainValueVerPadding * 1.1)
				.attr("x", (width * topSvgHorizontalPositions[1]) + topSvgMainValueHorPadding)
				.text("Targeted People");

			const partnersLogo = topSvg.selectAll(".pbimapTopSvgPartnersLogo")
				.data([true])
				.enter()
				.append("image")
				.attr("class", "pbimapTopSvgPartnersLogo")
				.attr("width", partnersProjectSize + "px")
				.attr("height", partnersProjectSize + "px")
				.attr("y", (heightTopSvg - partnersProjectSize) / 2)
				.attr("x", width * topSvgHorizontalPositions[2])
				.attr("xlink:href", localStorage.getItem("storedImagepartnersLogo") ?
					localStorage.getItem("storedImagepartnersLogo") : partnersLogoPath);

			let topSvgPartners = topSvg.selectAll(".pbimapTopSvgPartners")
				.data([data.totalPartners]);

			topSvgPartners = topSvgPartners.enter()
				.append("text")
				.attr("class", "pbimapTopSvgPartners contributionColorFill")
				.attr("y", heightTopSvg - topSvgMainValueVerPadding * 1.6)
				.attr("x", (width * topSvgHorizontalPositions[2]) + partnersProjectSize)
				.merge(topSvgPartners);

			topSvgPartners.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this,
						i = d3.interpolate(previousPartners, d);
					return function(t) {
						const partnersNumber = i(t);
						d3.select(node).text(~~partnersNumber)
							.append("tspan")
							.attr("dy", "-0.2em")
							.attr("class", "pbimapTopSvgPartnersText")
							.text(" Partners");
					};
				});

			const projectsLogo = topSvg.selectAll(".pbimapTopSvgProjectsLogo")
				.data([true])
				.enter()
				.append("image")
				.attr("class", "pbimapTopSvgProjectsLogo")
				.attr("width", partnersProjectSize + "px")
				.attr("height", partnersProjectSize + "px")
				.attr("y", (heightTopSvg - partnersProjectSize) / 2)
				.attr("x", width * topSvgHorizontalPositions[3])
				.attr("xlink:href", localStorage.getItem("storedImageprojectsLogo") ?
					localStorage.getItem("storedImageprojectsLogo") : projectsLogoPath);

			let topSvgProjects = topSvg.selectAll(".pbimapTopSvgProjects")
				.data([data.totalProjects]);

			topSvgProjects = topSvgProjects.enter()
				.append("text")
				.attr("class", "pbimapTopSvgProjects contributionColorFill")
				.attr("y", heightTopSvg - topSvgMainValueVerPadding * 1.6)
				.attr("x", (width * topSvgHorizontalPositions[3]) + partnersProjectSize)
				.merge(topSvgProjects);

			topSvgProjects.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this,
						i = d3.interpolate(previousProjects, d);
					return function(t) {
						const projectsNumber = i(t);
						d3.select(node).text(~~projectsNumber)
							.append("tspan")
							.attr("dy", "-0.2em")
							.attr("class", "pbimapTopSvgProjectsText")
							.text(" Projects");
					};
				});

			//end of createTopSvg
		};

		function createFilterDivs(data) {

			const maxCombinedLevel = d3.max(data.map, function(d) {
				return d.maxLevel;
			});

			const filterContainerDivs = filtersDiv.selectAll(null)
				.data(filterTitles)
				.enter()
				.append("div")
				.attr("class", "pbimapFilterContainerDiv")
				.style("background-color", function(d) {
					return filterColorScale(d);
				})
				.style("opacity", 0);

			const filterContainerDivsTitles = filterContainerDivs.append("div")
				.attr("class", "pbimapFilterContainerDivTitles")
				.html(function(d) {
					return d === "Cluster" ? "Sector" : d;
				});

			if (isTouchScreenOnly) {
				filterContainerDivs.on("touchstart", function() {
					d3.event.stopPropagation();
					tooltip.style("display", "none");
					if (chartState.displayMode === "color") {
						d3MapSvgGroup.selectAll(".pbimapColorMarkers")
							.style("opacity", 1);
					} else {
						d3MapSvgGroup.selectAll(".pbimapSizeMarkers")
							.style("opacity", 1);
					};
					filterContainerDivs.select(".pbimapDropdownContainer")
						.style("display", "none");
					d3.select(this).select(".pbimapDropdownContainer")
						.style("display", "block");
				});
				d3.select(window).on("touchstart.pbimapFilterContainers", function() {
					filterContainerDivs.select(".pbimapDropdownContainer")
						.style("display", "none");
				});
			} else {
				filterContainerDivs.on("mouseover", function() {
					d3.select(this).select(".pbimapDropdownContainer")
						.style("display", "block");
				}).on("mouseout", function() {
					d3.select(this).select(".pbimapDropdownContainer")
						.style("display", "none");
				});
			};

			const paddingDiv = filterContainerDivs.append("div")
				.attr("class", "pbimapDropdownPaddingDiv");

			const dropdownContainer = filterContainerDivs.append("div")
				.attr("class", "pbimapDropdownContainer")
				.style("background-color", function(d) {
					return d3.color(filterColorScale(d)).brighter(brighterFactor);
				}).append("ul")
				.attr("class", "pbimapDropdownUl");

			const yearsDropdown = dropdownContainer.filter(function(d) {
				return d === "Year";
			});

			yearsDropdown.call(populateDropdown, yearsArrayString, chartState.selectedYear);

			const cbpfsDropdown = dropdownContainer.filter(function(d) {
				return d === "CBPF";
			});

			cbpfsDropdown.call(populateDropdown, ["All"].concat(d3.values(cbpfsList).sort(function(a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			})), chartState.selectedCBPF);

			filterCbpfsDropdown();

			const partnersDropdown = dropdownContainer.filter(function(d) {
				return d === "Partner Type";
			});

			partnersDropdown.call(populateDropdown, ["All"].concat(d3.values(partnersList).sort()), chartState.selectedPartner);

			const clustersDropdown = dropdownContainer.filter(function(d) {
				return d === "Cluster";
			});

			clustersDropdown.call(populateDropdown, ["All"].concat(d3.values(clustersList).sort()), chartState.selectedCluster);

			const modalitiesDropdown = dropdownContainer.filter(function(d) {
				return d === "Allocation Type";
			});

			modalitiesDropdown.call(populateDropdown, ["All"].concat(allocationsTypeList.sort()), chartState.selectedModality);

			const adminLevelDropdown = dropdownContainer.filter(function(d) {
				return d === "Location Level";
			});

			adminLevelDropdown.call(populateDropdown, d3.range(0, maxCombinedLevel + 1, 1), chartState.selectedAdminLevel);

			filterContainerDivs.transition()
				.duration(duration / 10)
				.delay(function(_, i) {
					return i * (duration / 10);
				})
				.style("opacity", 1);

			yearsDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedYear.indexOf(+d) === -1) {
						chartState.selectedYear.push(+d);
					} else {
						if (chartState.selectedYear.length === 1) return;
						const index = chartState.selectedYear.indexOf(+d);
						chartState.selectedYear.splice(index, 1);
					};
					setQueryString("year", chartState.selectedYear.length === 1 ? chartState.selectedYear[0] : currentYear);
					yearsDropdown.call(populateDropdown, yearsArrayString.map(function(d) {
						return +d
					}), chartState.selectedYear);
					const data = filterData();
					modalitiesDropdown.call(populateDropdown, ["All"].concat(data.allocationsTypeList.sort()), chartState.selectedModality);
					modalitiesDropdown.selectAll("li")
						.on("click", function(d) {
							clickModalities(d);
						});

					const newMaxCombinedLevel = d3.max(data.map, function(d) {
						return d.maxLevel;
					}) || 0;
					chartState.selectedAdminLevel = Math.min(newMaxCombinedLevel, chartState.selectedAdminLevel);

					createTopSvg(data.topSvgObject);
					createMap(data.map);
					createLegendSvg(data.map);
					createBreadcrumbDiv();
					createShowAllButton(data.map);

					adminLevelDropdown.call(populateDropdown, d3.range(0, newMaxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
					adminLevelDropdown.selectAll("li")
						.on("click", function(d) {
							chartState.selectedAdminLevel = d;
							if (!chartState.selectedAdminLevel) {
								queryStringValues.delete("adminlevel");
							} else {
								setQueryString("adminlevel", d);
							};
							adminLevelDropdown.call(populateDropdown, d3.range(0, newMaxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
							const data = filterData();
							createTopSvg(data.topSvgObject);
							createMap(data.map);
							createLegendSvg(data.map);
							createBreadcrumbDiv();
							createShowAllButton(data.map);
						});

					filterCbpfsDropdown();

					partnersDropdown.call(filterPartnersAndClusters, data, "partnersTypeList");
					clustersDropdown.call(filterPartnersAndClusters, data, "clustersList");

				});

			cbpfsDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedCBPF.indexOf(d.toLowerCase()) > -1 && chartState.selectedCBPF.length === 1) return;
					chartState.selectedModality = ["all"];
					changeSelected(d, chartState.selectedCBPF);
					if (chartState.selectedCBPF[0] === "all") {
						queryStringValues.delete("fund");
					} else {
						setQueryString("fund", chartState.selectedCBPF.join("|"));
					};
					cbpfsDropdown.call(populateDropdown, ["All"].concat(d3.values(cbpfsList).sort()), chartState.selectedCBPF);
					filterCbpfsDropdown();
				});

			partnersDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedPartner.indexOf(d.toLowerCase()) > -1 && chartState.selectedPartner.length === 1) return;
					changeSelected(d, chartState.selectedPartner);
					if (chartState.selectedPartner[0] === "all") {
						queryStringValues.delete("partner");
					} else {
						setQueryString("partner", chartState.selectedPartner.join("|"));
					};
					partnersDropdown.call(populateDropdown, ["All"].concat(d3.values(partnersList).sort()), chartState.selectedPartner);
				});

			clustersDropdown.selectAll("li")
				.on("click", function(d) {
					if (chartState.selectedCluster.indexOf(d.toLowerCase()) > -1 && chartState.selectedCluster.length === 1) return;
					changeSelected(d, chartState.selectedCluster);
					if (chartState.selectedCluster[0] === "all") {
						queryStringValues.delete("cluster");
					} else {
						setQueryString("cluster", chartState.selectedCluster.join("|"));
					};
					clustersDropdown.call(populateDropdown, ["All"].concat(d3.values(clustersList).sort()), chartState.selectedCluster);
				});

			modalitiesDropdown.selectAll("li")
				.on("click", function(d) {
					clickModalities(d);
				});

			adminLevelDropdown.selectAll("li")
				.on("click", function(d) {
					chartState.selectedAdminLevel = d;
					if (!chartState.selectedAdminLevel) {
						queryStringValues.delete("adminlevel");
					} else {
						setQueryString("adminlevel", d);
					};
					adminLevelDropdown.call(populateDropdown, d3.range(0, maxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
					const data = filterData();
					createTopSvg(data.topSvgObject);
					createMap(data.map);
					createLegendSvg(data.map);
					createBreadcrumbDiv();
					createShowAllButton(data.map);
					partnersDropdown.call(filterPartnersAndClusters, data, "partnersTypeList");
					clustersDropdown.call(filterPartnersAndClusters, data, "clustersList");
				});

			partnersDropdown.call(filterPartnersAndClusters, data, "partnersTypeList");
			clustersDropdown.call(filterPartnersAndClusters, data, "clustersList");

			function changeSelected(datum, thisChartState) {
				if (datum === "All") {
					thisChartState.length = 0;
					thisChartState.push("all");
				} else {
					if (thisChartState.length === 1 && thisChartState[0] === "all") {
						thisChartState.length = 0;
					};
					if (thisChartState.indexOf(datum.toLowerCase()) === -1) {
						thisChartState.push(datum.toLowerCase());
					} else {
						const index = thisChartState.indexOf(datum.toLowerCase());
						thisChartState.splice(index, 1);
					};
				};

				const data = filterData();
				modalitiesDropdown.call(populateDropdown, ["All"].concat(data.allocationsTypeList.sort()), chartState.selectedModality);
				modalitiesDropdown.selectAll("li")
					.on("click", function(d) {
						clickModalities(d);
					});
				createTopSvg(data.topSvgObject);
				createMap(data.map);
				createLegendSvg(data.map);

				const newMaxCombinedLevel = d3.max(data.map, function(d) {
					return d.maxLevel;
				}) || 0;
				chartState.selectedAdminLevel = Math.min(newMaxCombinedLevel, chartState.selectedAdminLevel);

				createBreadcrumbDiv();
				createShowAllButton(data.map);

				adminLevelDropdown.call(populateDropdown, d3.range(0, newMaxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
				adminLevelDropdown.selectAll("li")
					.on("click", function(d) {
						chartState.selectedAdminLevel = d;
						if (!chartState.selectedAdminLevel) {
							queryStringValues.delete("adminlevel");
						} else {
							setQueryString("adminlevel", d);
						};
						adminLevelDropdown.call(populateDropdown, d3.range(0, newMaxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
						const data = filterData();
						createTopSvg(data.topSvgObject);
						createMap(data.map);
						createLegendSvg(data.map);
						createBreadcrumbDiv();
						createShowAllButton(data.map);
					});

				partnersDropdown.call(filterPartnersAndClusters, data, "partnersTypeList");
				clustersDropdown.call(filterPartnersAndClusters, data, "clustersList");

			};

			const resetDiv = filtersDiv.append("div")
				.attr("class", "pbimapResetDiv");

			const resetText = resetDiv.append("button")
				.html("Reset")
				.on("click", function() {
					for (var key in chartState) {
						chartState[key] = JSON.parse(JSON.stringify(initialChartState[key]))
					};

					yearsDropdown.call(populateDropdown, yearsArrayString, chartState.selectedYear);
					cbpfsDropdown.call(populateDropdown, ["All"].concat(d3.values(cbpfsList).sort(function(a, b) {
						return a.toLowerCase().localeCompare(b.toLowerCase());
					})), chartState.selectedCBPF);
					filterCbpfsDropdown();
					partnersDropdown.call(populateDropdown, ["All"].concat(d3.values(partnersList).sort()), chartState.selectedPartner);
					clustersDropdown.call(populateDropdown, ["All"].concat(d3.values(clustersList).sort()), chartState.selectedCluster);
					adminLevelDropdown.call(populateDropdown, d3.range(0, maxCombinedLevel + 1, 1), chartState.selectedAdminLevel);

					modalitiesDropdown.selectAll("li")
						.on("click", function(d) {
							clickModalities(d);
						});

					adminLevelDropdown.selectAll("li")
						.on("click", function(d) {
							chartState.selectedAdminLevel = d;
							if (!chartState.selectedAdminLevel) {
								queryStringValues.delete("adminlevel");
							} else {
								setQueryString("adminlevel", d);
							};
							adminLevelDropdown.call(populateDropdown, d3.range(0, maxCombinedLevel + 1, 1), chartState.selectedAdminLevel);
							const data = filterData();
							createTopSvg(data.topSvgObject);
							createMap(data.map);
							createLegendSvg(data.map);
							createBreadcrumbDiv();
							createShowAllButton(data.map);
						});

					const data = filterData();
					modalitiesDropdown.call(populateDropdown, ["All"].concat(data.allocationsTypeList.sort()), chartState.selectedModality);
					createTopSvg(data.topSvgObject);
					createMap(data.map);
					createLegendSvg(data.map);
					createBreadcrumbDiv();
					createShowAllButton(data.map);
					listDiv.html("");
					partnersDropdown.call(filterPartnersAndClusters, data, "partnersTypeList");
					clustersDropdown.call(filterPartnersAndClusters, data, "clustersList");
				});

			function clickModalities(d) {
				if (chartState.selectedModality.indexOf(d.toLowerCase()) > -1 && chartState.selectedModality.length === 1) return;
				changeSelected(d, chartState.selectedModality);
				if (chartState.selectedModality[0] === "all") {
					queryStringValues.delete("modality");
				} else {
					setQueryString("modality", chartState.selectedModality.join("|"));
				};
			};

			function filterCbpfsDropdown() {

				const allcbpfsWithData = [];
				chartState.selectedYear.forEach(function(year) {
					allcbpfsWithData.push.apply(allcbpfsWithData, cbpfsInCompleteData[year + ""]);
				});

				const cbpfsWithData = allcbpfsWithData.filter(function(value, index, self) {
					return self.indexOf(value) === index;
				})

				cbpfsDropdown.selectAll("li")
					.filter(function(d) {
						return d !== "All"
					})
					.each(function(d) {
						d3.select(this).style("display", function() {
							return cbpfsWithData.indexOf(d) === -1 ? "none" : null
						});
					});
			};

			function filterPartnersAndClusters(selection, data, property) {

				selection.selectAll("li")
					.filter(function(d) {
						return d !== "All"
					})
					.each(function(d) {
						d3.select(this).style("opacity", data[property].indexOf(d) === -1 ? fadeOpacityMenu : 1)
							.style("pointer-events", data[property].indexOf(d) === -1 ? "none" : "all");
					});

			};

			//end of createFilterDivs
		};

		function repopulateYearFilter() {

			const yearsDropdown = filtersDiv.selectAll(".pbimapDropdownUl")
				.filter(function(d) {
					return d === "Year";
				});

			yearsDropdown.selectAll("li")
				.each(function(d) {
					d3.select(this).style("opacity", loadedYears.indexOf(+d) > -1 ? 1 : fadeOpacityMenu)
						.style("pointer-events", loadedYears.indexOf(+d) > -1 ? "all" : "none");
					d3.select(this).select("span:nth-child(2)").html(loadedYears.indexOf(+d) > -1 ? d : d + " (loading)");
				});

			//end of repopulateYearFilter
		};

		function createMap(data, fromLegend) {

			if (data.length === 0) {

				const mapCenter = leafletMap.getCenter();

				d3MapSvgGroup.select(".pbimapColorMapGroup").remove();
				d3MapSvgGroup.select(".pbimapSizeMapGroup").remove();

				const noDataTextBack = d3MapSvgGroup.append("text")
					.attr("class", "pbimapNoDataTextBack")
					.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
					.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
					.attr("text-anchor", "middle")
					.text("No data for the current selection");

				const noDataText = d3MapSvgGroup.append("text")
					.attr("class", "pbimapNoDataText")
					.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
					.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
					.attr("text-anchor", "middle")
					.text("No data for the current selection");

				return;

			} else {

				const noDataSelection = d3MapSvgGroup.selectAll(".pbimapNoDataText, .pbimapNoDataTextBack");
				if (noDataSelection) noDataSelection.remove();

			};

			data = data.sort(function(a, b) {
				return b.totalAllocation - a.totalAllocation;
			});

			const maxDataValue = d3.max(data, function(d) {
				return d.totalAllocation;
			});

			radiusScale.domain([0, maxDataValue]);

			const allValues = data.map(function(d) {
				return d.totalAllocation;
			}).sort(function(a, b) {
				return a - b;
			});

			colorScale.domain(allValues)
				.range(chartState.selectedAdminLevel ? colorsQuantile : colorsQuantileGlobal);

			const extentLatitude = chartState.selectedAdminLevel === 0 && data.length === 1 ? [countryBoundingBoxes[data[0].locationName].sw.lat, countryBoundingBoxes[data[0].locationName].ne.lat] :
				d3.extent(data, function(d) {
					return +d.latitude;
				});

			const extentLongitude = chartState.selectedAdminLevel === 0 && data.length === 1 ? [countryBoundingBoxes[data[0].locationName].sw.lng, countryBoundingBoxes[data[0].locationName].ne.lng] :
				d3.extent(data, function(d) {
					return +d.longitude;
				});

			if (chartState.displayMode === "size") {
				createSizeMap();
			} else {
				createColorMap();
			};

			if (fromLegend === undefined) flyTo(extentLatitude, extentLongitude);

			redrawMap();

			function createSizeMap() {

				d3MapSvgGroup.select(".pbimapColorMapGroup").remove();

				let sizeMapGroup = d3MapSvgGroup.selectAll(".pbimapSizeMapGroup")
					.data([true]);

				sizeMapGroup = sizeMapGroup.enter()
					.append("g")
					.attr("class", "pbimapSizeMapGroup")
					.merge(sizeMapGroup);

				let sizeMarkers = sizeMapGroup.selectAll(".pbimapSizeMarkers")
					.data(data, function(d) {
						return d.key;
					});

				const sizeMarkersExit = sizeMarkers.exit().remove();

				const sizeMarkersEnter = sizeMarkers.enter()
					.append("circle")
					.attr("class", "pbimapSizeMarkers")
					.style("stroke", circleStroke);

				sizeMarkers = sizeMarkersEnter.merge(sizeMarkers);

				sizeMarkers.attr("r", function(d) {
						return radiusScale(d.totalAllocation)
					})
					.style("fill", chartState.selectedAdminLevel ? circleColor : circleGlobalColor);

				if (isTouchScreenOnly) {
					sizeMarkers.on("touchstart", function(d) {
						d3.event.stopPropagation();
						filtersDiv.selectAll(".pbimapDropdownContainer")
							.style("display", "none");
						const self = this;
						sizeMarkers.style("opacity", fadeOpacity);
						d3.select(this).style("opacity", 1);
						mouseOverMarker(d, self);
					});
					if (chartState.displayMode === "size") {
						d3.select(window).on("touchstart.pbimapSizeMarkers", function() {
							sizeMarkers.style("opacity", 1);
							mouseOutMarker();
						});
					};
				} else {
					sizeMarkers.on("mouseover", function(d) {
							currentHoveredElem = this;
							const self = this;
							sizeMarkers.style("opacity", fadeOpacity);
							d3.select(this).style("opacity", 1);
							mouseOverMarker(d, self);
						})
						.on("mouseout", function() {
							if (isSnapshotTooltipVisible) return;
							currentHoveredRect = null;
							sizeMarkers.style("opacity", 1);
							mouseOutMarker();
						});
				};

				//end of createSizeMap
			};

			function createColorMap() {

				d3MapSvgGroup.select(".pbimapSizeMapGroup").remove();

				let colorMapGroup = d3MapSvgGroup.selectAll(".pbimapColorMapGroup")
					.data([true]);

				colorMapGroup = colorMapGroup.enter()
					.append("g")
					.attr("class", "pbimapColorMapGroup")
					.merge(colorMapGroup);

				let colorMarkers = colorMapGroup.selectAll(".pbimapColorMarkers")
					.data(data, function(d) {
						return d.key;
					});

				const colorMarkersExit = colorMarkers.exit().remove();

				const colorMarkersEnter = colorMarkers.enter()
					.append("path")
					.attr("class", "pbimapColorMarkers")
					.attr("d", markerAttribute)
					.style("pointer-events", "all")
					.style("stroke", markerStroke);

				colorMarkers = colorMarkersEnter.merge(colorMarkers);

				colorMarkers.style("fill", function(d) {
					return colorScale(d.totalAllocation);
				});

				if (isTouchScreenOnly) {
					colorMarkers.on("touchstart", function(d) {
						d3.event.stopPropagation();
						filtersDiv.selectAll(".pbimapDropdownContainer")
							.style("display", "none");
						const self = this;
						colorMarkers.style("opacity", fadeOpacity);
						d3.select(this).style("opacity", 1);
						mouseOverMarker(d, self);
					});
					if (chartState.displayMode === "color") {
						d3.select(window).on("touchstart.pbimapColorMarkers", function() {
							colorMarkers.style("opacity", 1);
							mouseOutMarker();
						});
					};
				} else {
					colorMarkers.on("mouseover", function(d) {
							currentHoveredElem = this;
							const self = this;
							colorMarkers.style("opacity", fadeOpacity);
							d3.select(this).style("opacity", 1);
							mouseOverMarker(d, self);
						})
						.on("mouseout", function() {
							if (isSnapshotTooltipVisible) return;
							currentHoveredRect = null;
							colorMarkers.style("opacity", 1);
							mouseOutMarker();
						});
				};

				//end of createColorMap
			};

			//end of createMap
		};

		function redrawMap() {

			const selectedClass = chartState.displayMode === "size" ? ".pbimapSizeMarkers" : ".pbimapColorMarkers";

			const scaleValue = chartState.displayMode === "size" ? 1 : 0.75;

			const markers = d3MapSvgGroup.selectAll(selectedClass);

			markers.attr("transform", function(d) {
				return "translate(" + leafletMap.latLngToLayerPoint(d.coordinates).x + "," + leafletMap.latLngToLayerPoint(d.coordinates).y + ") scale(" + scaleValue + ")";
			});

			const noDataText = d3MapSvgGroup.selectAll(".pbimapNoDataText, .pbimapNoDataTextBack");

			if (noDataText) {
				const mapCenter = leafletMap.getCenter();
				noDataText.attr("y", leafletMap.latLngToLayerPoint(mapCenter).y)
					.attr("x", leafletMap.latLngToLayerPoint(mapCenter).x)
			};

			//end of redrawMap
		};

		function flyTo(extentLatitude, extentLongitude) {

			const topLeftCorner = [extentLatitude[1], extentLongitude[0]];

			const bottomRightCorner = [extentLatitude[0], extentLongitude[1]];

			const bounds = L.latLngBounds(topLeftCorner, bottomRightCorner);

			leafletMap.flyToBounds(bounds, {
				paddingTopLeft: [maxCircleRadius, maxCircleRadius],
				paddingBottomRight: [maxCircleRadius, maxCircleRadius],
				maxZoom: maxZoomValue
			});

			//end of flyTo
		};

		function createLegendSvg(data) {

			const maxDataValue = radiusScale.domain()[1];

			const sizeCirclesData = [0, maxDataValue / 4, maxDataValue / 2, maxDataValue];

			const buttonsTitle = legendSvg.selectAll(".pbimapButtonsTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbimapButtonsTitle")
				.attr("x", legendSvgPadding[3])
				.attr("y", legendSvgPadding[0] + buttonTitlePadding)
				.text("Show values by:");

			const legendButtonsGroup = legendSvg.selectAll(".pbimapLegendButtonsGroup")
				.data(["size", "color"])
				.enter()
				.append("g")
				.attr("class", "pbimapLegendButtonsGroup")
				.attr("transform", "translate(0," + (legendSvgPadding[0] + buttonTitlePadding) + ")");

			legendButtonsGroup.append("rect")
				.attr("class", "pbimapLegendButtonsRect")
				.attr("x", function(_, i) {
					return legendSvgPadding[3] + i * (legendButtonWidth + 6);
				})
				.attr("y", 6)
				.attr("width", legendButtonWidth)
				.attr("height", legendButtonHeight)
				.attr("rx", 8)
				.attr("ry", 8)
				.style("cursor", "pointer");

			legendButtonsGroup.append("text")
				.attr("class", "pbimapLegendButtonsText")
				.attr("x", function(_, i) {
					return legendSvgPadding[3] + i * (legendButtonWidth + 6) + legendButtonWidth / 2;
				})
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.attr("pointer-events", "none")
				.text(function(d) {
					return d.toUpperCase();
				});

			legendSvg.selectAll(".pbimapLegendButtonsRect")
				.style("fill", function(d) {
					return chartState.displayMode === d ? "#444" : "#ccc";
				});

			legendSvg.selectAll(".pbimapLegendButtonsText")
				.style("fill", function(d) {
					return chartState.displayMode !== d ? "#444" : "#ccc";
				});

			legendSvg.selectAll(".pbimapLegendButtonsGroup")
				.on("click", function(d) {
					chartState.displayMode = d;
					createMap(data, true);
					createLegendSvg(data);
				});

			const legendTitle = legendSvg.selectAll(".pbimapLegendTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbimapLegendTitle")
				.attr("x", legendSvgPadding[3])
				.attr("y", legendSvgPadding[0] + legendTitlePadding)
				.text("Legend");

			let legendSubLegend = legendSvg.selectAll(".pbimapLegendSubLegendSquare")
				.data([true]);

			legendSubLegend.enter()
				.append("text")
				.attr("class", "pbimapLegendSubLegendSquare")
				.attr("x", legendSvgPadding[3])
				.attr("y", legendSvgPadding[0] + 124)
				.style("font-size", "12px")
				.text("\u25A0")
				.merge(legendSubLegend)
				.style("fill", chartState.selectedAdminLevel ? circleColor : circleGlobalColor);

			let legendSubLegendText = legendSvg.selectAll(".pbimapLegendSubLegendText")
				.data([true]);

			legendSubLegendText.enter()
				.append("text")
				.attr("class", "pbimapLegendSubLegendText")
				.attr("x", legendSvgPadding[3] + 10)
				.attr("y", legendSvgPadding[0] + 124)
				.merge(legendSubLegendText)
				.text(chartState.selectedAdminLevel ? "Admin Level " + chartState.selectedAdminLevel : "Global Level");

			if (chartState.displayMode === "size") {
				createSizeLegend();
			} else {
				createColorLegend();
			};

			function createSizeLegend() {

				legendSvg.select(".pbimapLegendColorGroup").remove();

				let legendSizeGroups = legendSvg.selectAll(".pbimapLegendSizeGroups")
					.data([true]);

				legendSizeGroups = legendSizeGroups.enter()
					.append("g")
					.attr("class", "pbimapLegendSizeGroups")
					.merge(legendSizeGroups);

				let legendSizeGroup = legendSizeGroups.selectAll(".pbimapLegendSizeGroup")
					.data(sizeCirclesData);

				const legendSizeGroupEnter = legendSizeGroup.enter()
					.append("g")
					.attr("class", "pbimapLegendSizeGroup");

				const legendSizeLines = legendSizeGroupEnter.append("line")
					.attr("x1", legendSvgPadding[3] + radiusScale.range()[1])
					.attr("x2", legendSvgPadding[3] + radiusScale.range()[1] + 30)
					.attr("y1", function(d) {
						return d ? legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
							legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2);
					})
					.attr("y2", function(d) {
						return d ? legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
							legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2);
					})
					.style("stroke", "#666")
					.style("stroke-dasharray", "2,2")
					.style("stroke-width", "1px");

				const legendSizeCircles = legendSizeGroupEnter.append("circle")
					.attr("cx", legendSvgPadding[3] + radiusScale.range()[1])
					.attr("cy", function(d) {
						return legendSvgPadding[0] + 70 + (radiusScale.range()[1] * 2) - radiusScale(d);
					})
					.attr("r", function(d) {
						return !d ? 0 : radiusScale(d);
					})
					.style("fill", "none")
					.style("stroke", "darkslategray");

				const legendSizeCirclesText = legendSizeGroupEnter.append("text")
					.attr("class", "pbimapLegendCirclesText")
					.attr("x", legendSvgPadding[3] + radiusScale.range()[1] + 34)
					.attr("y", function(d, i) {
						return i === 1 ? legendSvgPadding[0] + 75 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
							i ? legendSvgPadding[0] + 73 + (radiusScale.range()[1] * 2) - radiusScale(d) * 2 :
							legendSvgPadding[0] + 73 + (radiusScale.range()[1] * 2) - 2;
					})
					.text(function(d) {
						return d ? d3.formatPrefix(".0", d)(d) : "0";
					});

				legendSizeGroup = legendSizeGroup.merge(legendSizeGroupEnter);

				legendSizeGroup.select(".pbimapLegendCirclesText")
					.text(function(d) {
						return d ? d3.formatPrefix(".0", d)(d) : "0";
					});

				//end of createSizeLegend
			};

			function createColorLegend() {

				legendSvg.select(".pbimapLegendSizeGroups").remove();

				let legendColorGroup = legendSvg.selectAll(".pbimapLegendColorGroup")
					.data([true]);

				legendColorGroup = legendColorGroup.enter()
					.append("g")
					.attr("class", "pbimapLegendColorGroup")
					.merge(legendColorGroup);

				let legendRects = legendColorGroup.selectAll(".pbimapLegendRects")
					.data([colorScale.domain()[0]].concat(colorScale.quantiles()));

				legendRects = legendRects.enter()
					.append("rect")
					.attr("class", "pbimapLegendRects")
					.attr("y", legendSvgPadding[0] + 70)
					.attr("x", function(_, i) {
						return legendSvgPadding[3] + i * 9
					})
					.style("stroke", "#444")
					.attr("width", 7)
					.attr("height", 9)
					.merge(legendRects)
					.style("fill", function(d) {
						return colorScale(d);
					});

				const legendColorLines = legendColorGroup.selectAll(".pbimapLegendColorLines")
					.data(d3.range(2))
					.enter()
					.append("line")
					.attr("class", "pbimapLegendColorLines")
					.attr("y1", legendSvgPadding[0] + 80)
					.attr("y2", legendSvgPadding[0] + 90)
					.attr("x1", function(d) {
						return d ? legendSvgPadding[3] + 88 : legendSvgPadding[3];
					})
					.attr("x2", function(d) {
						return d ? legendSvgPadding[3] + 88 : legendSvgPadding[3];
					})
					.style("stroke-width", "1px")
					.style("shape-rendering", "crispEdges")
					.style("stroke", "#444");

				let legendColorTexts = legendColorGroup.selectAll(".pbimapLegendColorTexts")
					.data(d3.extent(colorScale.domain()));

				legendColorTexts = legendColorTexts.enter()
					.append("text")
					.attr("class", "pbimapLegendColorTexts")
					.attr("y", 104)
					.attr("x", function(_, i) {
						return i ? legendSvgPadding[3] + 88 : legendSvgPadding[3];
					})
					.attr("text-anchor", function(_, i) {
						return i ? "end" : "start";
					})
					.merge(legendColorTexts)
					.text(function(d) {
						return d ? d3.formatPrefix(".0", d)(d) : "0";
					});

				//end of createColorLegend
			};

			//end of createLegendSvg
		};

		function createBreadcrumbDiv() {

			const colorArray = JSON.parse(JSON.stringify(filterColorsArray));

			let adminLevel;

			if (chartState.selectedAdminLevel === 0) {
				adminLevel = ["Global Level"]
			} else {
				adminLevel = d3.range(1, chartState.selectedAdminLevel + 1).map(function(d) {
					return "Admin Level " + d;
				});
			};

			let breadcrumbData = [chartState.selectedYear,
				chartState.selectedCBPF,
				chartState.selectedPartner,
				chartState.selectedCluster,
				chartState.selectedModality
			];

			breadcrumbData = breadcrumbData.map(function(d, i) {
				if (d.length > 1) {
					return "Several";
				} else if (i !== 2) {
					return i ? capitalizeEvery(d[0]) : d[0];
				} else {
					let partner;
					for (var key in partnersList) {
						if (partnersList[key].toLowerCase() === d[0]) partner = partnersList[key];
					};
					return partner ? partner : capitalizeEvery(d[0]);
				};
			});

			if (breadcrumbData[1] === "All") breadcrumbData[1] = "All CBPFs";
			if (breadcrumbData[2] === "All") breadcrumbData[2] = "All Partners";
			if (breadcrumbData[3] === "All") breadcrumbData[3] = "All Clusters";
			if (breadcrumbData[4] === "All") breadcrumbData[4] = "All Allocations";

			breadcrumbData = breadcrumbData.concat(adminLevel);

			while (colorArray.length < breadcrumbData.length) {
				const color = d3.color(colorArray[colorArray.length - 1]);
				color.b += 12;
				colorArray.push(color.darker(0.1));
			};

			let breadcrumbs = breadcrumbDiv.selectAll(".pbimapBreadcrumbs")
				.data(breadcrumbData);

			const breadcrumbsExit = breadcrumbs.exit().remove();

			const breadcrumbsEnter = breadcrumbs.enter()
				.append("div")
				.attr("class", "pbimapBreadcrumbs")
				.style("background-color", function(_, i) {
					return colorArray[i];
				})
				.style("padding-left", function(_, i) {
					return i ? "6px" : "10px";
				})

			breadcrumbsEnter.each(function(d, i) {
				if (i) {
					d3.select(this).append("span")
						.attr("class", "pbimapBeforeSpan");
				};
				d3.select(this).append("span")
					.attr("class", "pbimapContentSpan")
					.html(d);
				d3.select(this).append("span")
					.attr("class", "pbimapAfterSpan")
					.style("border-left", "10px solid " + colorArray[i]);
			});

			breadcrumbs = breadcrumbsEnter.merge(breadcrumbs);

			breadcrumbs.select(".pbimapContentSpan")
				.html(function(d) {
					return d;
				});

			breadcrumbs.style("opacity", 0)
				.transition()
				.duration(duration / 10)
				.delay(function(_, i) {
					return i * (duration / 10);
				})
				.style("opacity", 1);

			//end of createBreadcrumbDiv
		};

		function createShowAllButton(data) {

			let showAllButton = showAllDiv.selectAll(".pbimapshowAllButton")
				.data(chartState.selectedAdminLevel ? [] : [true]);

			const showAllButtonExit = showAllButton.exit().remove();

			showAllButton = showAllButton.enter()
				.append("button")
				.attr("class", "pbimapshowAllButton")
				.html("Show All Projects")
				.merge(showAllButton)
				.on("click", function() {
					const allValues = data.reduce(function(acc, curr) {
						curr.values.forEach(function(row) {
							const foundProject = acc.find(function(d) {
								return d.PrjCode === row.PrjCode;
							});
							if (foundProject) {
								beneficiariesList.forEach(function(e) {
									foundProject["AdmLocBenClustAgg1" + e] += row["AdmLocBenClustAgg1" + e];
								});
								foundProject.AdmLocClustBdg1 += row.AdmLocClustBdg1;
							} else {
								acc.push(JSON.parse(JSON.stringify(row)));
							};
						});
						return acc;
					}, []);
					allValues.sort(function(a, b) {
						return cbpfsList[a.PFId].localeCompare(cbpfsList[b.PFId]) || b.AdmLocClustBdg1 - a.AdmLocClustBdg1;
					});
					generateProjectsList(allValues, true);
					tooltip.style("display", "none");
					listDiv.node().scrollIntoView({
						behavior: "smooth"
					});
				});

		};

		function createFooterDiv() {

			let footerText = "© OCHA CBPF Section " + currentYear;

			const footerLink = " | For more information, please visit <a href='https://cbpf.data.unocha.org'>cbpf.data.unocha.org</a>";

			if (showLink) footerText += footerLink;

			footerDiv.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText);

			//end of createFooterDiv
		};

		function mouseOverMarker(datum, thisElement) {

			clearTimeout(timer);

			const divSpacer = "<div class='pbimapDivSpacer'><br></div>";

			const level = chartState.selectedAdminLevel ? "(admin level " + Math.min(chartState.selectedAdminLevel, datum.maxLevel) + ")" : "(country)";

			const thisCBPF = chartState.selectedAdminLevel ? "CBPF: " + datum.CBPFName + divSpacer : "";

			tooltip.style("display", "block")
				.html("<div class='pbimapTooltipTitle contributionColorHTMLcolor' style='margin-bottom: -16px;'>" + datum.locationName + "</div><br><div class='pbimapTooltipSubTitle' style='margin-top: 0px'>" +
					level + "</div>" + divSpacer + thisCBPF + "<div style='margin:0px;display:flex;flex-wrap:wrap;width:" + tooltipSvgWidth + "px;'><div style='display:flex;flex:0 54%;'>Total allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor pbimapTooltipTitle2'>$" + formatMoney0Decimals(datum.totalAllocation) +
					"</span></div><div style='display:flex;flex:0 54%;'>Number of partners:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor pbimapTooltipTitle2'>" + datum.numberOfPartners +
					"</span></div><div style='display:flex;flex:0 54%;'>Number of projects:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor pbimapTooltipTitle2'>" + datum.numberOfProjects +
					"</span></div></div>" + divSpacer + "<span class='pbimapTooltipTitle2'>" + formatMoney0Decimals(datum.beneficiaries) +
					" Targeted People:</span><div id='pbimapTooltipSvgDiv'></div><div class='pbimapTooltipButtonDiv'><button>Show Projects</button></div>");

			createTooltipSvg();

			const thisBox = thisElement.getBoundingClientRect();

			const containerBox = containerDiv.node().getBoundingClientRect();

			const tooltipBox = tooltip.node().getBoundingClientRect();

			const thisOffsetTop = (thisBox.bottom + thisBox.top) / 2 - containerBox.top - (tooltipBox.height / 2);

			const thisOffsetLeft = containerBox.right - thisBox.right > tooltipBox.width + (2 * tooltipMargin) ?
				thisBox.right - containerBox.left + tooltipMargin :
				thisBox.left - containerBox.left - tooltipBox.width - tooltipMargin;

			tooltip.style("top", thisOffsetTop + "px")
				.style("left", thisOffsetLeft + "px");

			tooltip.select("button")
				.on("click", function() {
					const allValues = datum.values.reduce(function(acc, curr) {
						const foundProject = acc.find(function(d) {
							return d.PrjCode === curr.PrjCode;
						});
						if (foundProject) {
							beneficiariesList.forEach(function(e) {
								foundProject["AdmLocBenClustAgg" + (chartState.selectedAdminLevel || 1) + e] += curr["AdmLocBenClustAgg" + (chartState.selectedAdminLevel || 1) + e];
							});
							foundProject["AdmLocClustBdg" + (chartState.selectedAdminLevel || 1)] += curr["AdmLocClustBdg" + (chartState.selectedAdminLevel || 1)];
						} else {
							acc.push(JSON.parse(JSON.stringify(curr)));
						};
						return acc;
					}, []);
					allValues.sort(function(a, b) {
						return b["AdmLocClustBdg" + (chartState.selectedAdminLevel || 1)] - a["AdmLocClustBdg" + (chartState.selectedAdminLevel || 1)];
					});
					generateProjectsList(allValues, false);
					tooltip.style("display", "none");
					listDiv.node().scrollIntoView({
						behavior: "smooth"
					});
				});

			function createTooltipSvg() {

				tooltipSvgXScale.domain([0, d3.max(beneficiariesList.map(function(d) {
					return datum["beneficiaries" + d];
				}))]);

				const tooltipSvg = tooltip.select("#pbimapTooltipSvgDiv")
					.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight)
					.attr("class", "pbimapTooltipSvg");

				const yAxisGroup = tooltipSvg.append("g")
					.attr("class", "pbimapTooltipSvgYAxisGroup")
					.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
					.call(tooltipSvgYAxis);

				const xAxisGroup = tooltipSvg.append("g")
					.attr("class", "pbimapTooltipSvgXAxisGroup")
					.attr("transform", "translate(0," + (tooltipSvgHeight - tooltipSvgPadding[2]) + ")")
					.call(tooltipSvgXAxis)
					.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				const tooltipSvgLabels = tooltipSvg.selectAll(null)
					.data(beneficiariesList)
					.enter()
					.append("text")
					.attr("class", "pbimapTooltipLabels")
					.attr("x", tooltipSvgPadding[3] + 2)
					.attr("y", function(d) {
						return tooltipSvgYScale(d) + tooltipSvgYScale.bandwidth() / 2 + 4;
					})
					.text(function(d) {
						return formatSIFloat(datum["beneficiaries" + d]);
					});

				const tooltipSticks = tooltipSvg.selectAll(null)
					.data(beneficiariesList)
					.enter()
					.append("rect")
					.style("fill", chartState.selectedAdminLevel ? circleColor : circleGlobalColor)
					.attr("x", tooltipSvgPadding[3])
					.attr("y", function(d) {
						return tooltipSvgYScale(d) - stickHeight / 4;
					})
					.attr("height", stickHeight)
					.attr("width", 0)
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return tooltipSvgXScale(datum["beneficiaries" + d]) - tooltipSvgPadding[3];
					});

				const tooltipLollipop = tooltipSvg.selectAll(null)
					.data(beneficiariesList)
					.enter()
					.append("circle")
					.style("fill", chartState.selectedAdminLevel ? circleColor : circleGlobalColor)
					.attr("cx", tooltipSvgPadding[3])
					.attr("cy", function(d) {
						return tooltipSvgYScale(d);
					})
					.attr("r", lollipopRadius)
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return tooltipSvgXScale(datum["beneficiaries" + d]);
					});

				tooltipSvgLabels.transition()
					.duration(duration)
					.attr("x", function(d) {
						return tooltipSvgXScale(datum["beneficiaries" + d]) + lollipopRadius + 2;
					});

			};

			//end of mouseOverMarker
		};

		function mouseOutMarker() {

			timer = setTimeout(function() {
				tooltip.style("display", "none");
			}, tooltipDuration);

			tooltip.on("mouseover", function() {
				clearTimeout(timer);
			}).on("mouseleave", function() {
				tooltip.style("display", "none");
			});

		};

		function generateProjectsList(data, showAll) {

			listDiv.html("");

			const listTitleDivContainer = listDiv.append("div")
				.attr("class", "pbimapListTitleDivContainer");

			const listTitleDiv = listTitleDivContainer.append("div")
				.attr("class", "pbimapListTitleDiv");

			const listButtonDiv = listTitleDivContainer.append("div")
				.attr("class", "pbimapListButtonDiv");

			if (!showAll) {
				const listBreadcrumbDivContainer = listDiv.append("div")
					.attr("class", "pbimapListBreadcrumbDivContainer");

				const listBreadcrumbs = listBreadcrumbDivContainer.append("p")
					.attr("class", "pbimapListBreadcrumbs contributionColorHTMLcolor")
					.html(function() {
						let breadcrumbArray = [cbpfsList[data[0].PFId]];
						for (let i = 1; i <= chartState.selectedAdminLevel; i++) {
							if (breadcrumbArray.indexOf(data[0]["AdmLoc" + i]) === -1) breadcrumbArray.push(data[0]["AdmLoc" + i]);
						};
						return breadcrumbArray.join(" \u2192 ");
					});
			};

			const listTitle = listTitleDiv.append("p")
				.attr("class", "pbimapListTitle contributionColorHTMLcolor")
				.html("List of Projects");

			const listButton = listButtonDiv.append("button")
				.html("Remove this list")
				.on("click", function() {
					listDiv.html("");
				});

			const listDownloadButton = listButtonDiv.append("button")
				.html(".CSV  ")
				.on("click", function() {

					const csv = createCsvProjects(data);

					const currentDate = new Date();

					let currentLocation;

					if (showAll) {
						currentLocation = "Global";
					} else {
						currentLocation = chartState.selectedAdminLevel ?
							data[0]["AdmLoc" + chartState.selectedAdminLevel] : cbpfsList[data[0].PFId];
					};

					const fileName = "ProjectsList_" + currentLocation + "_" + csvDateFormat(currentDate) + ".csv";

					const blob = new Blob(["\uFEFF" + csv], {
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

			listDownloadButton.append("span")
				.attr("class", "fas fa-download contributionColorHTMLcolor");

			const listHeaderContainerDiv = listDiv.append("div")
				.attr("class", "pbimapListHeaderContainerDiv");

			const headers = listHeaderContainerDiv.selectAll(null)
				.data(listHeader)
				.enter()
				.append("div")
				.style("width", function(_, i) {
					return listHeadersWidth[i];
				})
				.style("text-align", function(_, i) {
					return i === 4 || i === 5 ? "center" : "left";
				});

			headers.append("span")
				.html(function(d) {
					return d;
				});

			const listRowsContainer = listDiv.append("div")
				.attr("class", "pbimapListRowsContainer");

			const rows = listRowsContainer.selectAll(null)
				.data(data)
				.enter()
				.append("div")
				.attr("class", "pbimapListRows");

			const rowDivs = rows.selectAll(null)
				.data(listHeader)
				.enter()
				.append("div")
				.attr("class", "pbimapListRowDivs")
				.style("width", function(_, i) {
					return listRowsWidth[i];
				})
				.style("padding-right", function(_, i) {
					return i === 4 || i === 5 ? null : "8px";
				})
				.style("text-align", function(_, i) {
					return i === 4 || i === 5 ? "right" : "left";
				});

			const rowCell = rowDivs.append("span");

			rowCell.html(function(d) {
				const parentData = d3.select(this.parentNode.parentNode).datum();
				if (d === "Targeted People") {
					let total = 0;
					beneficiariesList.forEach(function(e) {
						total += parentData["AdmLocBenClustAgg" + (chartState.selectedAdminLevel || 1) + e]
					});
					return formatMoney0Decimals(total);
				} else if (d === "Allocations") {
					return "$" + formatMoney0Decimals(parentData["AdmLocClustBdg" + (chartState.selectedAdminLevel || 1)])
				} else {
					return parentData[listHeaderScale(d)];
				};
			});

			//end of generateProjectsList
		};

		function populateDropdown(selection, dropdownData, thisChartState) {

			let dropdownLi = selection.selectAll(".pbimapDropdownLi")
				.data(dropdownData, function(d) {
					return d;
				});

			const dropdownLiExit = dropdownLi.exit().remove();

			const dropdownLiEnter = dropdownLi.enter()
				.append("li")
				.attr("class", "pbimapDropdownLi");

			const dropdownBox = dropdownLiEnter.append("span")
				.attr("class", "pcimapDropdownBox")
				.append("span")
				.attr("class", function(d) {
					if (thisChartState === chartState.selectedAdminLevel) {
						return thisChartState === d ? "far fa-check-square" : "far fa-square";
					} else {
						if (thisChartState.length === 1 && thisChartState[0] === "all") {
							return "far fa-check-square";
						} else {
							return thisChartState.indexOf(+d === +d ? +d : d.toLowerCase()) > -1 ? "far fa-check-square" : "far fa-square";
						};
					};
				});

			const dropdownText = dropdownLiEnter.append("span")
				.html(function(d) {
					if (thisChartState === chartState.selectedAdminLevel) {
						return !d ? "Global Level" : "Admin Level " + d;
					} else {
						return d;
					};
				});

			dropdownLi = dropdownLiEnter.merge(dropdownLi);

			dropdownLi.select(".pcimapDropdownBox")
				.select("span")
				.attr("class", function(d) {
					if (thisChartState === chartState.selectedAdminLevel) {
						return thisChartState === d ? "far fa-check-square" : "far fa-square";
					} else {
						if (thisChartState.length === 1 && thisChartState[0] === "all") {
							return "far fa-check-square";
						} else {
							return thisChartState.indexOf(+d === +d ? +d : d.toLowerCase()) > -1 ? "far fa-check-square" : "far fa-square";
						};
					};
				});

			dropdownLi.on("mouseover", function() {
				const parentDatum = d3.select(this.parentNode).datum();
				d3.select(this).style("background-color", filterColorScale(parentDatum));
			}).on("mouseout", function() {
				const parentDatum = d3.select(this.parentNode).datum();
				d3.select(this).style("background-color", d3.color(filterColorScale(parentDatum)).brighter(brighterFactor));
			});

			//end of populateDropDown
		};

		function processData(summaryData, locationsData) {

			let foundSummaryObject;

			for (let index = locationsData.length; index--;) {

				const thisRow = locationsData[index];

				if (locationsData[index - 1] || locationsData.length === 1) {
					if (index === locationsData.length - 1 || thisRow.PrjCode !== locationsData[index + 1].PrjCode) {
						foundSummaryObject = summaryData.find(function(d) {
							return d.PrjCode === thisRow.PrjCode;
						});
					};
				};

				thisRow.cbpfName = cbpfsList[thisRow.PFId];
				thisRow.OrgTypeId = foundSummaryObject.OrgTypeId;
				thisRow.OrgNm = foundSummaryObject.OrgNm;
				thisRow.AllNm = "(" + cbpfsCodeList[thisRow.PFId] + ") " + foundSummaryObject.AllNm;
				thisRow.AllSrc = foundSummaryObject.AllSrc;
				thisRow.PrjTitle = foundSummaryObject.PrjTitle;
				thisRow.AStrDt = foundSummaryObject.AStrDt;
				thisRow.AEndDt = foundSummaryObject.AEndDt;
				thisRow.PartCode = foundSummaryObject.PartCode;

				if (lowercaseAllocationsTypeList.indexOf(thisRow.AllNm.toLowerCase()) === -1) {
					lowercaseAllocationsTypeList.push(thisRow.AllNm.toLowerCase());
					allocationsTypeList.push(thisRow.AllNm);
				};

				if (cbpfsInCompleteData[thisRow.AYr].indexOf(cbpfsList[thisRow.PFId]) === -1) {
					cbpfsInCompleteData[thisRow.AYr].push(cbpfsList[thisRow.PFId]);
				};

				populateColumns(thisRow);

				populateUniqueValues(thisRow);

				for (let key in thisRow) {
					if (thisRow[key].indexOf("|||") > -1) {
						splitRow(thisRow, key);
						break;
					};
				};

				splitColumns(thisRow);

				completeData.push(thisRow);

			};

			summaryData.length = 0;

			function populateUniqueValues(row) {
				let level = adminLocLevels + 1;
				while (--level) {
					row["uniqueValue" + level] = (row["AdmLoc" + level].split(",").join("")) + "," + row["AdmLocCord" + level];
				};
			};

			function populateColumns(row) {
				let level = adminLocLevels + 1;
				while (--level) {
					if (row["AdmLoc" + level] === "") continue;
					let remainingLevels = d3.range(level + 1, adminLocLevels + 1, 1);
					remainingLevels.forEach(function(d) {
						row["AdmLoc" + d] = row["AdmLoc" + level];
						row["AdmLocBenClustAgg" + d] = row["AdmLocBenClustAgg" + level];
						row["AdmLocCord" + d] = row["AdmLocCord" + level];
						row["AdmLocClustBdg" + d] = row["AdmLocClustBdg" + level];
					});
					row.maxLevel = level + "";
					break;
				};
			};

			function splitRow(row, key) {
				const numberOfRows = row[key].split("|||").length;
				for (let numberIndex = 1; numberIndex < numberOfRows; numberIndex++) {
					const thisNextRow = Object.assign({}, row);
					for (let key in thisNextRow) {
						if (thisNextRow[key].indexOf("|||") > -1) {
							thisNextRow[key] = thisNextRow[key].split("|||")[numberIndex];
						};
					};
					splitColumns(thisNextRow);
					completeData.push(thisNextRow);
				};
				for (let key in row) {
					if (row[key].indexOf("|||") > -1) {
						row[key] = row[key].split("|||")[0];
					};
				};
			};

			function splitColumns(row) {
				for (let key in row) {
					if (row[key].indexOf("##") > -1) {
						const split = row[key].split("##");
						split.forEach(function(d, i) {
							row[key + beneficiariesList[i]] = +d;
						});
					};
				};

				row.partnerType = partnersList[row.OrgTypeId];
				row.cluster = clustersList[row.ClstAgg];
				row.modality = modalitiesList[row.AllSrc];

				for (let key in row) {
					if (key.indexOf("AdmLocClustBdg") > -1) {
						row[key] = +row[key];
					};
				};

				row.maxLevel = +row.maxLevel;

				delete row.AdmLocBenClustAgg1;
				delete row.AdmLocBenClustAgg2;
				delete row.AdmLocBenClustAgg3;
				delete row.AdmLocBenClustAgg4;
				delete row.AdmLocBenClustAgg5;
				delete row.AdmLocBenClustAgg6;

			};

			//end of processData
		};

		function filterData() {

			const topSvgObject = {
				totalAllocations: 0,
				totalBeneficiaries: 0,
				totalProjects: 0,
				totalPartners: 0,
				launchedAllocations: 0,
				underApprovalAllocations: 0
			};

			let nestedData;

			const allocationsTypeList = [];

			const lowercaseAllocationsTypeList = [];

			const partnersTypeList = [];

			const clustersList = [];

			completeData.forEach(function(row) {
				if (filterYear(row.AYr) && filterCBPF(row.cbpfName) && filterPartner(row.partnerType) && filterCluster(row.cluster)) {
					if (lowercaseAllocationsTypeList.indexOf(row.AllNm.toLowerCase()) === -1) {
						lowercaseAllocationsTypeList.push(row.AllNm.toLowerCase());
						allocationsTypeList.push(row.AllNm);
					};
				};

				if (filterYear(row.AYr) && filterCBPF(row.cbpfName) && filterModality(row.AllNm) && filterCluster(row.cluster)) {
					if (partnersTypeList.indexOf(row.partnerType) === -1) {
						partnersTypeList.push(row.partnerType);
					};
				};

				if (filterYear(row.AYr) && filterCBPF(row.cbpfName) && filterPartner(row.partnerType) && filterModality(row.AllNm)) {
					if (clustersList.indexOf(row.cluster) === -1) {
						clustersList.push(row.cluster);
					};
				};
			});

			lowercaseAllocationsTypeList.length = 0;

			chartState.selectedModality = chartState.selectedModality.filter(function(d) {
				return allocationsTypeList.map(function(e) {
					return e.toLowerCase()
				}).concat(["all"]).indexOf(d) > -1
			});

			if (chartState.selectedModality.length === 0) chartState.selectedModality = ["all"];

			//CHANGE: let FOR const
			let filteredData = completeData.filter(function(row) {
				return filterYear(row.AYr) && filterCBPF(row.cbpfName) && filterPartner(row.partnerType) && filterModality(row.AllNm) && filterCluster(row.cluster);
			});

			//TEMPORARY FILTER! REMOVE!!!
			filteredData = filteredData.filter(function(row) {
				return d3.range(1, adminLocLevels + 1, 1).every(function(d) {
					return row["uniqueValue" + d].split(",").length === 3;
				});
			});
			//REMOVE THIS

			if (chartState.selectedAdminLevel === 0) {

				nestedData = d3.nest()
					.key(function(d) {
						return d.cbpfName;
					})
					.entries(filteredData);

				nestedData.forEach(function(row) {
					let numberOfPartners = [],
						numberOfProjects = [],
						numberOfBeneficiaries = {};
					beneficiariesList.forEach(function(d) {
						numberOfBeneficiaries[d] = 0;
					});
					numberOfBeneficiaries.total = 0;
					let totalAllocation = 0;

					row.latitude = countriesCoordinates[row.key].split(",")[0];
					row.longitude = countriesCoordinates[row.key].split(",")[1];
					row.coordinates = new L.LatLng(row.latitude, row.longitude);
					row.locationName = row.key;
					row.maxLevel = d3.max(row.values.map(function(d) {
						return d.maxLevel;
					}));

					row.values.forEach(function(valueRow) {
						totalAllocation += valueRow.AdmLocClustBdg1;
						beneficiariesList.forEach(function(d) {
							numberOfBeneficiaries[d] += valueRow["AdmLocBenClustAgg1" + d];
							numberOfBeneficiaries.total += valueRow["AdmLocBenClustAgg1" + d];
						});
						if (numberOfPartners.indexOf(valueRow.PartCode) === -1) numberOfPartners.push(valueRow.PartCode);
						if (numberOfProjects.indexOf(valueRow.PrjCode) === -1) numberOfProjects.push(valueRow.PrjCode);
					});

					row.totalAllocation = totalAllocation;
					row.numberOfPartners = numberOfPartners.length;
					row.numberOfProjects = numberOfProjects.length;
					row.beneficiaries = numberOfBeneficiaries.total;

					beneficiariesList.forEach(function(d) {
						row["beneficiaries" + d] = numberOfBeneficiaries[d];
					});

					topSvgObject.totalAllocations += row.totalAllocation;
					topSvgObject.totalBeneficiaries += row.beneficiaries;
					topSvgObject.totalPartners += numberOfPartners.length;
					topSvgObject.totalProjects += numberOfProjects.length;
				});

			} else {

				let totalNumberOfPartners = [],
					totalNumberOfProjects = [];

				nestedData = d3.nest()
					.key(function(d) {
						return d["uniqueValue" + chartState.selectedAdminLevel];
					})
					.entries(filteredData);

				nestedData.forEach(function(row) {
					let numberOfPartners = [],
						numberOfProjects = [],
						numberOfBeneficiaries = {};
					beneficiariesList.forEach(function(d) {
						numberOfBeneficiaries[d] = 0;
					});
					numberOfBeneficiaries.total = 0;
					let totalAllocation = 0;

					row.latitude = row.key.split(",")[1];
					row.longitude = row.key.split(",")[2];
					row.coordinates = new L.LatLng(row.latitude, row.longitude);
					row.locationName = row.key.split(",")[0];
					row.CBPFName = row.values[0].cbpfName;
					row.maxLevel = d3.max(row.values.map(function(d) {
						return d.maxLevel;
					}));

					row.values.forEach(function(valueRow) {
						totalAllocation += valueRow["AdmLocClustBdg" + chartState.selectedAdminLevel];
						beneficiariesList.forEach(function(d) {
							numberOfBeneficiaries[d] += valueRow["AdmLocBenClustAgg" + chartState.selectedAdminLevel + d];
							numberOfBeneficiaries.total += valueRow["AdmLocBenClustAgg" + chartState.selectedAdminLevel + d];
						});
						if (numberOfPartners.indexOf(valueRow.PartCode) === -1) numberOfPartners.push(valueRow.PartCode);
						if (numberOfProjects.indexOf(valueRow.PrjCode) === -1) numberOfProjects.push(valueRow.PrjCode);
						if (totalNumberOfPartners.indexOf(valueRow.PartCode) === -1) totalNumberOfPartners.push(valueRow.PartCode);
						if (totalNumberOfProjects.indexOf(valueRow.PrjCode) === -1) totalNumberOfProjects.push(valueRow.PrjCode);
					});

					row.totalAllocation = totalAllocation;
					row.numberOfPartners = numberOfPartners.length;
					row.numberOfProjects = numberOfProjects.length;
					row.beneficiaries = numberOfBeneficiaries.total;

					beneficiariesList.forEach(function(d) {
						row["beneficiaries" + d] = numberOfBeneficiaries[d];
					});

					topSvgObject.totalAllocations += row.totalAllocation;
					topSvgObject.totalBeneficiaries += row.beneficiaries;

				});

				topSvgObject.totalPartners += totalNumberOfPartners.length;
				topSvgObject.totalProjects += totalNumberOfProjects.length;

			};

			launchedAllocationsData.forEach(function(row) {
				if (filterYear(row.AllocationYear) && yearsWithUnderApprovalAboveMin[row.AllocationYear]) {
					topSvgObject.launchedAllocations += (+row.TotalUSDPlanned);
					topSvgObject.underApprovalAllocations += (+row.TotalUnderApprovalBudget);
				};
			});

			return {
				topSvgObject: topSvgObject,
				map: nestedData,
				allocationsTypeList: allocationsTypeList,
				partnersTypeList: partnersTypeList,
				clustersList: clustersList
			};

			function filterYear(datum) {
				return chartState.selectedYear.indexOf(+datum) > -1;
			};

			function filterCBPF(datum) {
				return chartState.selectedCBPF[0] === "all" ? true : datum ? chartState.selectedCBPF.indexOf(datum.toLowerCase()) > -1 : false;
			};

			function filterPartner(datum) {
				return chartState.selectedPartner[0] === "all" ? true : datum ? chartState.selectedPartner.indexOf(datum.toLowerCase()) > -1 : false;
			};

			function filterModality(datum) {
				return chartState.selectedModality[0] === "all" ? true : datum ? chartState.selectedModality.indexOf(datum.toLowerCase()) > -1 : false;
			};

			function filterCluster(datum) {
				return chartState.selectedCluster[0] === "all" ? true : datum ? chartState.selectedCluster.indexOf(datum.toLowerCase()) > -1 : false;
			};

			//end of filterData
		};

		function createCbpfsList(cbpfsData) {
			cbpfsData.forEach(function(row) {
				cbpfsList[row.PFId + ""] = row.PFName;
			});
		};

		function createCbpfsCodeList(cbpfsData) {
			cbpfsData.forEach(function(row) {
				cbpfsCodeList[row.PFId + ""] = row.PFAbbrv.substring(0, 3);
			});
		};

		function createClustersList(clustersData) {
			clustersData.forEach(function(row) {
				clustersList[row.ClustId + ""] = row.ClustNm;
			});
		};

		function createPartnersList(partnersData) {
			partnersData.forEach(function(row) {
				partnersList[row.OrgTypeId + ""] = row.OrgTypeNm;
			});
		};

		function createModalitiesList(modalitiesData) {
			modalitiesData.forEach(function(row) {
				modalitiesList[row.AllSrcId + ""] = row.AllNm;
			});
		};

		function createCountriesCoordinates(cbpfsData) {
			cbpfsData.forEach(function(row) {
				countriesCoordinates[row.PFName + ""] = row.PFLat + "," + row.PFLong;
			});
		};

		function getDataAttributes() {

			dataAttributes.forEach(function(attribute) {

				const queryStringName = attribute === "CBPF" ? "fund" : attribute.toLowerCase();

				const attibuteValues = queryStringValues.has(queryStringName) ? queryStringValues.get(queryStringName).replace(/\|/g, ",").split(",").map(function(d) {
						return d.trim().toLowerCase();
					}) :
					containerDiv.node().getAttribute("data-" + attribute.toLowerCase()).split(",").map(function(d) {
						return d.trim().toLowerCase();
					});

				attibuteValues.forEach(function(thisValue) {
					chartState["selected" + attribute].push(thisValue);
				});

				const someInvalidValue = chartState["selected" + attribute].some(function(thisValue) {
					return valuesInLowerCase(listScale(attribute)).indexOf(thisValue) === -1;
				});

				if (someInvalidValue) chartState["selected" + attribute] = ["all"];

			});

			chartState.selectedAdminLevel = queryStringValues.has("adminlevel") ?
				~~(queryStringValues.get("adminlevel")) < 7 ? ~~(queryStringValues.get("adminlevel")) : 0 :
				~~(containerDiv.node().getAttribute("data-adminlevel")) < 7 ? ~~(containerDiv.node().getAttribute("data-adminlevel")) : 0;

			initialChartState = JSON.parse(JSON.stringify(chartState));

		};

		function validateYear(yearString) {
			return +yearString === +yearString && yearsArrayString.indexOf(yearString) > -1 ?
				+yearString : currentYear;
		};

		function createAnnotationsDiv() {

			iconsDiv.style("opacity", 0)
				.style("pointer-events", "none");

			const overDiv = containerDiv.append("div")
				.attr("class", "pbimapOverDivHelp");

			const topDivSize = topDiv.node().getBoundingClientRect();

			const iconsDivSize = iconsDiv.node().getBoundingClientRect();

			const topDivHeight = topDivSize.height * (width / topDivSize.width);

			const topSvgSize = topSvg.node().getBoundingClientRect();

			const filtersDivSize = filtersDiv.node().getBoundingClientRect();

			const mapSize = mapContainedDiv.node().getBoundingClientRect();

			const breadcrumbsDivSize = breadcrumbsDivContainer.node().getBoundingClientRect();

			const topSvgHeight = topSvgSize.height * (width / topSvgSize.width);

			const filtersDivHeight = filtersDivSize.height * (width / filtersDivSize.width);

			const mapHeight = mapSize.height * (width / mapSize.width);

			const breadcrumbsHeight = breadcrumbsDivSize.height * (width / breadcrumbsDivSize.width);

			const margins = 40;

			const overHeight = topDivHeight + topSvgHeight + filtersDivHeight + mapHeight + breadcrumbsHeight + margins;

			const realHeight = topDivSize.height + topSvgSize.height + filtersDivSize.height + mapSize.height + breadcrumbsDivSize.height;

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + overHeight);

			const helpButtons = [{
				text: "CLOSE",
				width: 90
			}, {
				text: "GO TO HELP PORTAL",
				width: 180
			}];

			const closeRects = helpSVG.selectAll(null)
				.data(helpButtons)
				.enter()
				.append("g");

			closeRects.append("rect")
				.attr("rx", 4)
				.attr("ry", 4)
				.style("stroke", "rgba(0, 0, 0, 0.3)")
				.style("stroke-width", "1px")
				.style("fill", highlightColor)
				.style("cursor", "pointer")
				.attr("y", 6)
				.attr("height", 22)
				.attr("width", function(d) {
					return d.width;
				})
				.attr("x", function(d, i) {
					return width - topSvgPadding[1] - d.width - (i ? helpButtons[0].width + 8 : 0);
				})
				.on("click", function(_, i) {
					iconsDiv.style("opacity", 1)
						.style("pointer-events", "all");
					overDiv.remove();
					if (i) window.open(helpPortalUrl, "help_portal");
				});

			closeRects.append("text")
				.attr("class", "pbimapAnnotationMainText")
				.attr("text-anchor", "middle")
				.attr("x", function(d, i) {
					return width - topSvgPadding[1] - (d.width / 2) - (i ? (helpButtons[0].width) + 8 : 0);
				})
				.attr("y", 22)
				.text(function(d) {
					return d.text
				});

			const helpData = [{
				x: 950,
				y: 22 + topDivHeight + topSvgHeight + filtersDivHeight + mapHeight,
				width: 148,
				height: 30,
				xTooltip: 800 * (topDivSize.width / width),
				yTooltip: realHeight * 0.885,
				text: "Click here to generate a list of projects (below the map) for all selected funds."
			}, {
				x: 6,
				y: topDivHeight + topSvgHeight + 10,
				width: 130,
				height: filtersDivHeight + 10,
				xTooltip: 6 * (topDivSize.width / width),
				yTooltip: realHeight * 0.25,
				text: "Use this menu to select one or more years. Greyed-out years were not downloaded yet (please wait some time)."
			}, {
				x: 138,
				y: topDivHeight + topSvgHeight + 10,
				width: 658,
				height: filtersDivHeight + 10,
				xTooltip: 350 * (topDivSize.width / width),
				yTooltip: realHeight * 0.25,
				text: "Use these menus to select (one or more) other filters. When “All” is selected, clicking an option will select that given option only. The options in the “Allocation Type” menu change according to the selected options in the other menus."
			}, {
				x: 1028,
				y: topDivHeight + topSvgHeight + 10,
				width: 68,
				height: filtersDivHeight + 10,
				xTooltip: 900 * (topDivSize.width / width),
				yTooltip: realHeight * 0.25,
				text: "This button resets all menus (and the map) to the initial values."
			}, {
				x: 130,
				y: 100 + topDivHeight + topSvgHeight + filtersDivHeight,
				width: 410,
				height: 300,
				xTooltip: 180 * (topDivSize.width / width),
				yTooltip: realHeight * 0.245,
				text: "In the map area, hover over a marker to get additional information. You can zoom and pan the map."
			}, {
				x: 6,
				y: 325 + topDivHeight + topSvgHeight + filtersDivHeight,
				width: 100,
				height: 30,
				xTooltip: 6 * (topDivSize.width / width),
				yTooltip: realHeight * 0.615,
				text: "Click here to encode allocations by “size” (larger markers indicate bigger allocations) or by “color” (darker markers indicate bigger allocations)."
			}, {
				x: 680,
				y: 330 + topDivHeight + topSvgHeight + filtersDivHeight,
				width: 160,
				height: 30,
				xTooltip: 600 * (topDivSize.width / width),
				yTooltip: realHeight * 0.625,
				text: "When you hover over a marker a tooltip like this shows up. Click “Show Projects” to create a table below the map, with all the projects for that marker."
			}, {
				x: 6,
				y: 25 + topDivHeight + topSvgHeight + filtersDivHeight + mapHeight,
				width: 574,
				height: 30,
				xTooltip: 6 * (topDivSize.width / width),
				yTooltip: realHeight * 0.89,
				text: "This sequence indicates the current selection for all menus."
			}];

			const tooltipThumbnail = helpSVG.append("image")
				.attr("xlink:href", localStorage.getItem("storedImagetooltipThumbnail") ?
					localStorage.getItem("storedImagetooltipThumbnail") :
					tooltipThumbnailPath)
				.attr("width", 260)
				.attr("height", 241)
				.attr("x", 630)
				.attr("y", 240)
				.style("opacity", 0.6);

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
					.attr("class", "pbimapHelpRectangle")
					.attr("pointer-events", "all")
					.on("mouseover", function() {
						const self = this;
						createTooltip(d.xTooltip, d.yTooltip, d.text, self);
					})
					.on("mouseout", removeTooltip);
			});

			const explanationTextRect = helpSVG.append("rect")
				.attr("x", (width / 2) - 180)
				.attr("y", 152)
				.attr("width", 360)
				.attr("height", 50)
				.attr("pointer-events", "none")
				.style("fill", "white")
				.style("stroke", "#888");

			const explanationText = helpSVG.append("text")
				.attr("class", "pbimapAnnotationExplanationText")
				.attr("font-family", "Roboto")
				.attr("font-size", "18px")
				.style("fill", "#222")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 172)
				.attr("pointer-events", "none")
				.text("Hover over the elements surrounded by a blue rectangle to get additional information")
				.call(wrapText2, 350);

			function createTooltip(xPos, yPos, text, self) {
				explanationText.style("opacity", 0);
				explanationTextRect.style("opacity", 0);
				helpSVG.selectAll(".pbimapHelpRectangle").style("opacity", 0.1);
				d3.select(self).style("opacity", 1);
				const containerBox = containerDiv.node().getBoundingClientRect();
				tooltip.style("top", yPos + "px")
					.style("left", xPos + "px")
					.style("display", "block")
					.html(text);
			};

			function removeTooltip() {
				tooltip.style("display", "none");
				explanationText.style("opacity", 1);
				explanationTextRect.style("opacity", 1);
				helpSVG.selectAll(".pbimapHelpRectangle").style("opacity", 0.5);
			};

			//end of createAnnotationsDiv
		};

		function createCsv(data) {

			const csvData = [];

			data.forEach(function(d) {
				const country = chartState.selectedAdminLevel ? d.CBPFName : d.locationName;
				csvData.push({
					"CBPF Name": country,
					Location: d.locationName,
					Latitude: d.latitude,
					Longitude: d.longitude,
					"# of Partners": d.numberOfPartners,
					"# of Approved Projects": d.numberOfProjects,
					"Total Allocations": Math.floor(d.totalAllocation * 100) / 100,
					"Total Targeted People": d.beneficiaries,
					"Boys (Targeted)": d.beneficiariesBoys,
					"Girls (Targeted)": d.beneficiariesGirls,
					"Men (Targeted)": d.beneficiariesMen,
					"Women (Targeted)": d.beneficiariesWomen
				})
			});

			const header = Object.keys(csvData[0]);

			const replacer = function(key, value) {
				return value === null ? '' : value
			};

			let rows = csvData.map(function(row) {
				return header.map(function(fieldName) {
					return JSON.stringify(row[fieldName], replacer)
				}).join(',')
			});

			rows.unshift(header.join(','));

			return rows.join('\r\n');

			//end of createCsv
		};

		function createCsvProjects(data) {

			const csvData = [];

			data.forEach(function(d) {
				let total = 0;
				beneficiariesList.forEach(function(e) {
					total += d["AdmLocBenClustAgg" + (chartState.selectedAdminLevel || 1) + e]
				});
				total = formatMoney0Decimals(total);
				csvData.push({
					CBPF: d.cbpfName,
					"Project Code": d.PrjCode,
					"Project Title": d.PrjTitle,
					Partner: d.OrgNm,
					"Partner Type": d.partnerType,
					"Allocation Type": d.AllNm,
					Allocations: Math.floor(d["AdmLocClustBdg" + (chartState.selectedAdminLevel || 1)]),
					"Targeted People": total
				})
			});

			return d3.csvFormat(csvData);

			//end of createCsvProjects
		};

		function valuesInLowerCase(map) {
			const values = [];
			for (let key in map) values.push(map[key].toLowerCase());
			return values;
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			const result = d3.formatPrefix("." + digits + "~", value)(value);
			if (parseInt(result) === 1000) {
				const lastDigit = result[result.length - 1];
				const units = { k: "M", M: "B" };
				return 1 + (isNaN(lastDigit) ? units[lastDigit] : "");
			};
			return result;
		};

		function capitalizeEvery(str) {
			const capitalized = str.split(" ")
				.map(function(d) {
					return d[0].toUpperCase() + d.substr(1).toLowerCase();
				})
				.join(" ");
			return capitalized;
		};

		function setQueryString(fieldName, fieldValue) {
			if (queryStringValues.has(fieldName)) {
				queryStringValues.set(fieldName, fieldValue);
			} else {
				queryStringValues.append(fieldName, fieldValue);
			};
		};

		const countryBoundingBoxes = {
			"Afghanistan": {
				sw: {
					lat: 29.3772,
					lng: 60.5176034
				},
				ne: {
					lat: 38.4910682,
					lng: 74.889862
				}
			},
			"CAR": {
				sw: {
					lat: 2.2156553,
					lng: 14.4155426
				},
				ne: {
					lat: 11.001389,
					lng: 27.4540764
				}
			},
			"Colombia": {
				sw: {
					lat: -4.2316872,
					lng: -82.1243666
				},
				ne: {
					lat: 16.0571269,
					lng: -66.8511907
				}
			},
			"DRC": {
				sw: {
					lat: -13.459035,
					lng: 12.039074
				},
				ne: {
					lat: 5.3920026,
					lng: 31.3056758
				}
			},
			"Ethiopia": {
				sw: {
					lat: 3.397448,
					lng: 32.9975838
				},
				ne: {
					lat: 14.8940537,
					lng: 47.9823797
				}
			},
			"Haiti": {
				sw: {
					lat: 17.9099291,
					lng: -75.2384618
				},
				ne: {
					lat: 20.2181368,
					lng: -71.6217461
				}
			},
			"Iraq": {
				sw: {
					lat: 29.0585661,
					lng: 38.7936719
				},
				ne: {
					lat: 37.380932,
					lng: 48.8412702
				}
			},
			"Jordan": {
				sw: {
					lat: 29.183401,
					lng: 34.8844372
				},
				ne: {
					lat: 33.3750617,
					lng: 39.3012981
				}
			},
			"Lebanon": {
				sw: {
					lat: 33.0479858,
					lng: 34.8825667
				},
				ne: {
					lat: 34.6923543,
					lng: 36.625
				}
			},
			"Myanmar": {
				sw: {
					lat: 9.4399432,
					lng: 92.1719423
				},
				ne: {
					lat: 28.547835,
					lng: 101.1700796
				}
			},
			"Nigeria": {
				sw: {
					lat: 4.0690959,
					lng: 2.676932
				},
				ne: {
					lat: 13.885645,
					lng: 14.678014
				}
			},
			"Pakistan": {
				sw: {
					lat: 23.5393916,
					lng: 60.872855
				},
				ne: {
					lat: 37.084107,
					lng: 77.1203914
				}
			},
			"Somalia": {
				sw: {
					lat: -1.8031969,
					lng: 40.98918
				},
				ne: {
					lat: 12.1889121,
					lng: 51.6177696
				}
			},
			"South Sudan": {
				sw: {
					lat: 3.285278,
					lng: 21.8145046
				},
				ne: {
					lat: 12.224918,
					lng: 39.0576252
				}
			},
			"Sudan": {
				sw: {
					lat: 8.685278,
					lng: 21.8145046
				},
				ne: {
					lat: 22.224918,
					lng: 39.0576252
				}
			},
			"Syria": {
				sw: {
					lat: 32.311354,
					lng: 35.4714427
				},
				ne: {
					lat: 37.3184589,
					lng: 42.3745687
				}
			},
			"Syria Cross border": {
				sw: {
					lat: 35.8076804,
					lng: 25.6212891
				},
				ne: {
					lat: 42.297,
					lng: 44.8176638
				}
			},
			"Yemen": {
				sw: {
					lat: 11.9084802,
					lng: 41.60825
				},
				ne: {
					lat: 19.0,
					lng: 54.7389375
				}
			},
			"oPt": {
				sw: {
					lat: 31.2201289,
					lng: 34.0689732
				},
				ne: {
					lat: 32.5521479,
					lng: 35.5739235
				}
			},
			"Ukraine": {
				sw: {
					lat: 44.184598,
					lng: 22.137059
				},
				ne: {
					lat: 52.3791473,
					lng: 40.2275801
				}
			}
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

		function saveImage(link, filename) {

			if (!localStorage.getItem("storedImage" + filename)) {
				getBase64FromImage(link, setLocal, null, filename);
			};

			function getBase64FromImage(url, onSuccess, onError, filename) {
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
					onSuccess(filename, base64);
				};

				xhr.onerror = onError;

				xhr.send();
			};

			function setLocal(filename, base64) {
				localStorage.setItem("storedImage" + filename, base64);
			};

			//end of saveImage
		};

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			d3.select("pbimapTopSvgPartnersLogo")
				.attr("xlink:href", localStorage.getItem("storedImagepartnersLogo"));

			d3.select("pbimapTopSvgProjectsLogo")
				.attr("xlink:href", localStorage.getItem("storedImageprojectsLogo"));

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "pbimapDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "pbimapDownloadingDivSvg")
				.attr("width", 200)
				.attr("height", 100);

			const downloadingDivText = "Downloading " + type.toUpperCase();

			createProgressWheel(downloadingDivSvg, 200, 175, downloadingDivText);

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

			setSvgStyles(topSvg.node());

			setSvgStyles(legendSvg.node());

			if (tooltip.style("display") === "block") setSvgStyles(tooltip.select("svg").node());

			if (type === "png") {
				iconsDiv.style("opacity", 0);
			} else {
				topDiv.style("opacity", 0)
			};

			const svgRealSize = topSvg.node().getBoundingClientRect();

			topSvg.attr("width", svgRealSize.width)
				.attr("height", svgRealSize.height);

			containerDiv.selectAll(".pbimapBeforeSpan, .pbimapAfterSpan, .pbimapResetDiv")
				.style("opacity", 0);

			if (listDiv.html()) listDiv.style("opacity", 0);

			snapshotTooltip.style("display", "none");

			if (isTouchScreenOnly) {
				window.scrollTo({
					top: 0
				});
			};

			html2canvas(imageDiv, {
				scrollX: 0,
				scrollY: -window.scrollY,
				useCORS: true
			}).then(function(canvas) {

				containerDiv.selectAll(".pbimapBeforeSpan, .pbimapAfterSpan, .pbimapResetDiv")
					.style("opacity", 1);

				topSvg.attr("width", null)
					.attr("height", null);

				if (listDiv.html()) listDiv.style("opacity", 1);

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

			const fileName = "AllocationsOverview_" + csvDateFormat(currentDate) + ".png";

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

			d3.select("#pbimapDownloadingDiv").remove();

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

					let pdfTextPosition;

					const pdfHeight = 297;

					const pdf = new jsPDF();

					const intro = pdf.splitTextToSize("Funding from CBPFs is directly available to UN agencies, national and international non-governmental organizations (NGOs) and Red Cross/ Red Crescent organizations. In 2018, CBPFs allocated more than $836 million to 685 partners in 18 countries to support 1,453 critical humanitarian projects. These projects targeted millions of people with healthcare, food aid, clean water, shelter and other life-saving assistance.", (210 - pdfMargins.left - pdfMargins.right), {
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
					pdf.text("Allocations Overview", pdfMargins.left, 88);

					pdf.setFontSize(12);

					const yearsPdfList = chartState.selectedYear.sort(function(a, b) {
						return a - b;
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
					}, "");

					const yearsText = chartState.selectedYear.length > 1 ? "Selected Years: " : "Selected Year: ";

					const cbpfsPdfList = chartState.selectedCBPF[0] === "all" ? "All CBPFs" : createPdfList(chartState.selectedCBPF, d3.values(cbpfsList));

					const cbpfsText = chartState.selectedCBPF.length === 1 && chartState.selectedCBPF[0] !== "all" ? "Selected CBPF: " : "Selected CBPFs: ";

					const partnersPdfList = chartState.selectedPartner[0] === "all" ? "All Partners" : createPdfList(chartState.selectedPartner, d3.values(partnersList));

					const partnersText = chartState.selectedPartner.length === 1 && chartState.selectedPartner[0] !== "all" ? "Selected Partner: " : "Selected Partners: ";

					const clusterPdfList = chartState.selectedCluster[0] === "all" ? "All Clusters" : createPdfList(chartState.selectedCluster, d3.values(clustersList));

					const clusterText = chartState.selectedCluster.length === 1 && chartState.selectedCluster[0] !== "all" ? "Selected Cluster: " : "Selected Clusters: ";

					const allocationPdfList = chartState.selectedModality[0] === "all" ? "All Allocations" : createPdfList(chartState.selectedModality, allocationsTypeList);

					const allocationText = chartState.selectedModality.length === 1 && chartState.selectedModality[0] !== "all" ? "Selected Allocation: " : "Selected Allocations: ";

					const locationPdfList = !chartState.selectedAdminLevel ? "Global Level" : "Admin Level " + chartState.selectedAdminLevel;

					const locationText = "Selected Location: ";

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + yearsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsPdfList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + cbpfsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						cbpfsPdfList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + partnersText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						partnersPdfList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + clusterText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						clusterPdfList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + allocationText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						allocationPdfList + "</span></div><div style='font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + locationText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						locationPdfList + "</span></div>", pdfMargins.left, 94, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					const sourceDimentions = containerDiv.node().getBoundingClientRect();
					const widthInMilimeters = 210 - pdfMargins.left * 2;

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, widthInMilimeters * (sourceDimentions.height / sourceDimentions.width));

					createLetterhead();

					const currentDate = new Date();

					pdf.save("AllocationsOverview_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#pbimapDownloadingDiv").remove();

					function createLetterhead() {

						const footer = "© OCHA CBPF Section " + currentYear + " | For more information, please visit cbpf.data.unocha.org";

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

					function createPdfList(arr, list) {
						return arr.map(function(d) {
								return list.find(function(e) {
									return e.toLowerCase() === d;
								});
							})
							.sort(function(a, b) {
								return a.toLowerCase() < b.toLowerCase() ? -1 :
									a.toLowerCase() > b.toLowerCase() ? 1 : 0;
							})
							.reduce(function(acc, curr, index) {
								return acc + (index >= arr.length - 2 ? index > arr.length - 2 ? curr : curr + " and " : curr + ", ");
							}, "");
					};

				});

			//end of downloadSnapshotPdf
		};

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {

			let wheelGroup;

			if (thissvg === null) {

				const overDiv = containerDiv.append("div")
					.attr("class", "pbimapOverDiv");

				const progressSvg = overDiv.append("svg")
					.attr("viewBox", "0 0 " + thiswidth + " " + thisheight);

				wheelGroup = progressSvg.append("g")
					.attr("class", "pbimapd3chartwheelGroup")
					.attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 4 + ")");

			} else {
				wheelGroup = thissvg.append("g")
					.attr("class", "pbimapd3chartwheelGroup")
					.attr("transform", "translate(" + thiswidth / 2 + "," + thisheight / 4 + ")");
			};

			const loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 40)
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
			const wheelGroup = d3.select(".pbimapd3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
			d3.select(".pbimapOverDiv").remove();
		};

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());
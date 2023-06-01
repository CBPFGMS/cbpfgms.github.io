(function d3ChartIIFE() {
	const isInternetExplorer =
			window.navigator.userAgent.indexOf("MSIE") > -1 ||
			window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly =
			window.matchMedia("(pointer: coarse)").matches &&
			!window.matchMedia("(any-pointer: fine)").matches,
		isPfbiSite = window.location.hostname === "cbpfgms.github.io",
		isBookmarkPage =
			window.location.hostname + window.location.pathname ===
			"cbpfgms.github.io/cbpf-bi-stag/bookmark.html",
		fontAwesomeLink =
			"https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = [
			"https://cbpfgms.github.io/css/d3chartstyles-stg.css",
			"https://cbpfgms.github.io/css/d3chartstylespbigam-stg.css",
			fontAwesomeLink,
		],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js",
		html2ToCanvas =
			"https://cbpfgms.github.io/libraries/html2canvas.min.js",
		jsPdf =
			"https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js",
		URLSearchParamsPolyfill =
			"https://cdn.jsdelivr.net/npm/@ungap/url-search-params@0.1.2/min.min.js",
		fetchPolyfill1 =
			"https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js",
		fetchPolyfill2 =
			"https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js";

	cssLinks.forEach(function (cssLink) {
		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			if (cssLink === fontAwesomeLink) {
				externalCSS.setAttribute(
					"integrity",
					"sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/"
				);
				externalCSS.setAttribute("crossorigin", "anonymous");
			}
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		}
	});

	if (!isScriptLoaded(d3URL)) {
		if (hasFetch && hasURLSearchParams) {
			loadScript(d3URL, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function () {
				loadScript(d3URL, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function () {
				loadScript(fetchPolyfill2, function () {
					loadScript(URLSearchParamsPolyfill, function () {
						loadScript(d3URL, d3Chart);
					});
				});
			});
		}
	} else if (typeof d3 !== "undefined") {
		if (hasFetch && hasURLSearchParams) {
			d3Chart();
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, d3Chart);
		} else {
			loadScript(fetchPolyfill1, function () {
				loadScript(fetchPolyfill2, function () {
					loadScript(URLSearchParamsPolyfill, d3Chart);
				});
			});
		}
	} else {
		let d3Script;
		const scripts = document.getElementsByTagName("script");
		for (let i = scripts.length; i--; ) {
			if (scripts[i].src == d3URL) d3Script = scripts[i];
		}
		d3Script.addEventListener("load", d3Chart);
	}

	function loadScript(url, callback) {
		const head = document.getElementsByTagName("head")[0];
		const script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	}

	function isStyleLoaded(url) {
		const styles = document.getElementsByTagName("link");
		for (let i = styles.length; i--; ) {
			if (styles[i].href == url) return true;
		}
		return false;
	}

	function isScriptLoaded(url) {
		const scripts = document.getElementsByTagName("script");
		for (let i = scripts.length; i--; ) {
			if (scripts[i].src == url) return true;
		}
		return false;
	}

	function d3Chart() {
		//POLYFILLS

		//Array.prototype.find()

		if (!Array.prototype.find) {
			Object.defineProperty(Array.prototype, "find", {
				value: function (predicate) {
					if (this == null) {
						throw new TypeError('"this" is null or not defined');
					}
					var o = Object(this);
					var len = o.length >>> 0;
					if (typeof predicate !== "function") {
						throw new TypeError("predicate must be a function");
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
				writable: true,
			});
		}

		//toBlob

		if (!HTMLCanvasElement.prototype.toBlob) {
			Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
				value: function (callback, type, quality) {
					var dataURL = this.toDataURL(type, quality).split(",")[1];
					setTimeout(function () {
						var binStr = atob(dataURL),
							len = binStr.length,
							arr = new Uint8Array(len);

						for (var i = 0; i < len; i++) {
							arr[i] = binStr.charCodeAt(i);
						}

						callback(
							new Blob([arr], {
								type: type || "image/png",
							})
						);
					});
				},
			});
		}

		//END OF POLYFILLS

		const width = 900,
			padding = [4, 4, 4, 4],
			topPanelHeight = 60,
			panelHorizontalPadding = 6,
			buttonsPanelHeight = 60,
			legendPanelHeight = 44,
			beeswarmGroupHeight = 80,
			buttonsLegendRectSize = 12,
			windowHeight = window.innerHeight,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			duration = 1000,
			disabledOpacity = 0.6,
			yearWithMixedGroups = 2019,
			buttonsNumber = 6,
			maxRadius = 18,
			radiusPadding = 1,
			iterations = 300,
			xStrength = 1,
			yStrength = 0.2,
			collisionStrength = 1,
			axisDescriptionsPadding = 48,
			axisDescriptionsLineHeight = 4.5,
			legendSizeLine = maxRadius + 10,
			legendColorPadding = 164,
			fadeOpacity = 0.2,
			showMeanPadding = 100,
			filteredCbpfsStep = 3,
			totalLabelPadding = 8,
			totalValueVerticalPadding = 3,
			tooltipWidthFactor = 0.48,
			tooltipHeight = 60,
			formatSIaxes = d3.format("~s"),
			formatSI2Decimals = d3.format(".2s"),
			formatPercent = d3.format(".0%"),
			formatPercent1Decimal = d3.format(".1%"),
			formatMoney0Decimals = d3.format(",.0f"),
			localVariable = d3.local(),
			unBlue = "#1F69B3",
			buttonBlue = "#ECA154",
			buttonGray = "#eaeaea",
			buttonGrayDarker = "#BFBFBF",
			highlightColor = "#F79A3B",
			chartTitleDefault = "Gender with Age Marker (GAM)",
			vizNameQueryString = "gam",
			classPrefix = "pbigam",
			bookmarkSite =
				"https://cbpfgms.github.io/cbpf-bi-stag/bookmark.html?",
			helpPortalUrl = "https://gms.unocha.org/content/cbpf-gam-marker",
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			moneyBagdAttribute = [
				"M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z",
			],
			dataFile =
				"https://cbpfapi.unocha.org/vo2/odata/ProjectGAMSummary?$format=csv&ShowAllPooledFunds=1",
			metadataFile =
				"https://cbpfapi.unocha.org/vo2/odata/GenderMarker?$format=csv",
			launchedAllocationsDataUrl =
				"https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&$format=csv",
			displayTypes = ["marker", "aggregated"],
			allocationValueTypes = {
				budget: "allocations",
				percentagegam: "percentageGam",
				percentagecbpf: "percentageCbpf",
			},
			allocationTooltipDescriptions = {
				percentagegam: "Total allocations for the Marker",
				percentagecbpf: "Total allocations for the CBPF",
				numerator: "Allocations in the CBPF−Marker combination",
			},
			gamGroupsArray = ["GM", "GAM"],
			gmDomain = ["2b", "2a", "1", "0", "3"],
			gamDomain = ["4", "3", "2", "1", "0"],
			aggregatedDomain = ["aggregated"],
			gamDescriptions = [],
			colorsRange = [
				"#418FDE",
				"#A4D65E",
				"#E2E868",
				"#ECA154",
				"#E56A54",
			],
			yearsArray = [],
			cbpfsList = {},
			yearsWithUnderApprovalAboveMin = {},
			topValuesLaunchedData = {},
			chartState = {
				selectedYear: [],
				selectedCbpfs: [],
				allocationValue: null,
				gamGroup: null,
				display: null,
				showMean: null,
				cbpfsInData: [],
			};

		let isSnapshotTooltipVisible = false,
			firstTime = true,
			launchedValuePadding,
			height =
				padding[0] +
				padding[2] +
				topPanelHeight +
				buttonsPanelHeight +
				beeswarmGroupHeight +
				legendPanelHeight +
				3 * panelHorizontalPadding,
			currentHoveredElem;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz"))
			queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainerpbigam");

		const showHelp =
			containerDiv.node().getAttribute("data-showhelp") === "true";

		const showLink =
			containerDiv.node().getAttribute("data-showlink") === "true";

		const minimumUnderApprovalValue =
			+containerDiv.node().getAttribute("data-minvalue") || 0;

		const chartTitle = containerDiv.node().getAttribute("data-title")
			? containerDiv.node().getAttribute("data-title")
			: chartTitleDefault;

		const selectedYearString = queryStringValues.has("year")
			? queryStringValues.get("year").replace(/\|/g, ",")
			: containerDiv.node().getAttribute("data-year");

		const selectedCbpfsString = queryStringValues.has("fund")
			? queryStringValues.get("fund").replace(/\|/g, ",")
			: containerDiv.node().getAttribute("data-cbpf");

		const selectedGamGroup = queryStringValues.get("gamgroup");

		chartState.showMean = queryStringValues.has("showmean")
			? queryStringValues.get("showmean") === "true"
			: containerDiv.node().getAttribute("data-showmean") === "true";

		chartState.display = queryStringValues.has("display")
			? queryStringValues.get("display")
			: displayTypes.indexOf(
					containerDiv.node().getAttribute("data-display")
			  ) > -1
			? containerDiv.node().getAttribute("data-display")
			: displayTypes[0];

		chartState.allocationValue = queryStringValues.has("valuetype")
			? queryStringValues.get("valuetype")
			: allocationValueTypes[
					containerDiv
						.node()
						.getAttribute("data-valuetype")
						.replace(" ", "")
						.toLowerCase()
			  ]
			? allocationValueTypes[
					containerDiv
						.node()
						.getAttribute("data-valuetype")
						.replace(" ", "")
						.toLowerCase()
			  ]
			: "allocations";

		const selectedResponsiveness =
			containerDiv.node().getAttribute("data-responsive") === "true";

		const lazyLoad =
			containerDiv.node().getAttribute("data-lazyload") === "true";

		if (selectedResponsiveness === false) {
			containerDiv
				.style("width", width + "px")
				.style("height", height + "px");
		}

		const topDiv = containerDiv.append("div").attr("class", "pbigamTopDiv");

		const titleDiv = topDiv.append("div").attr("class", "pbigamTitleDiv");

		const iconsDiv = topDiv
			.append("div")
			.attr("class", "pbigamIconsDiv d3chartIconsDiv");

		const selectTitleDiv = containerDiv
			.append("div")
			.attr("class", "pbigamSelectTitleDiv");

		const selectDiv = containerDiv
			.append("div")
			.attr("class", "pbigamSelectDiv");

		const launchedValueDiv = containerDiv
			.append("div")
			.attr("class", "pbigamlaunchedValueDiv");

		const launchedValue = launchedValueDiv
			.append("p")
			.attr("class", "pbigamlaunchedValue");

		const svg = containerDiv
			.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		}

		const yearsDescriptionDiv = containerDiv
			.append("div")
			.attr("class", "pbigamYearsDescriptionDiv");

		const footerDiv = !isPfbiSite
			? containerDiv.append("div").attr("class", "pbigamFooterDiv")
			: null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv
			.append("div")
			.attr("id", "pbigamSnapshotTooltip")
			.attr("class", "pbigamSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function () {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
				if (currentHoveredElem)
					d3.select(currentHoveredElem).dispatch("mouseout");
			});

		snapshotTooltip
			.append("p")
			.attr("id", "pbigamSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function () {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip
			.append("p")
			.attr("id", "pbigamSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function () {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues =
			!isTouchScreenOnly &&
			(window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip
				.append("p")
				.attr("id", "pbigamTooltipBestVisualizedText")
				.html(
					"For best results use Chrome, Firefox, Opera or Chromium-based Edge."
				)
				.attr("pointer-events", "none")
				.style("cursor", "default");
		}

		const tooltip = containerDiv
			.append("div")
			.attr("id", "pbigamtooltipdiv")
			.style("display", "none");

		containerDiv.on("contextmenu", function () {
			d3.event.preventDefault();
			const thisMouse = d3.mouse(this);
			isSnapshotTooltipVisible = true;
			snapshotTooltip
				.style("display", "block")
				.style("top", thisMouse[1] - 4 + "px")
				.style("left", thisMouse[0] - 4 + "px");
		});

		const topPanel = {
			main: svg
				.append("g")
				.attr("class", "pbigamtopPanel")
				.attr(
					"transform",
					"translate(" + padding[3] + "," + padding[0] + ")"
				),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			padding: [0, 0, 0, 0],
			moneyBagPadding: 94,
			leftPadding: [176, 464, 632],
			mainValueVerPadding: 12,
			mainValueHorPadding: 4,
		};

		const buttonsPanel = {
			main: svg
				.append("g")
				.attr("class", "pbigambuttonsPanel")
				.attr(
					"transform",
					"translate(" +
						padding[3] +
						"," +
						(padding[0] +
							topPanel.height +
							panelHorizontalPadding) +
						")"
				),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 30, 0],
			buttonWidth: 52,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonsAllocationsWidth: 106,
			displayPadding: 696,
			buttonDisplayWidth: 96,
		};

		const beeswarmPanel = {
			main: svg
				.append("g")
				.attr("class", "pbigambeeswarmPanel")
				.attr(
					"transform",
					"translate(" +
						padding[3] +
						"," +
						(padding[0] +
							topPanel.height +
							buttonsPanel.height +
							2 * panelHorizontalPadding) +
						")"
				),
			width: width - padding[1] - padding[3],
			height: beeswarmGroupHeight,
			padding: [38, maxRadius + 78, 14, 220],
			axisVerticalPadding: 16,
		};

		const legendPanel = {
			main: svg
				.append("g")
				.attr("class", "pbigamlegendPanel")
				.attr(
					"transform",
					"translate(" +
						padding[3] +
						"," +
						(padding[0] +
							topPanel.height +
							buttonsPanel.height +
							beeswarmPanel.height +
							3 * panelHorizontalPadding) +
						")"
				),
			width: width - padding[1] - padding[3],
			height: legendPanelHeight,
		};

		const colorsScale = d3
			.scaleOrdinal()
			.range(colorsRange)
			.unknown(colorsRange[colorsRange.length - 1]);

		const xScale = d3
			.scaleLinear()
			.range([
				beeswarmPanel.padding[3],
				beeswarmPanel.width - beeswarmPanel.padding[1],
			]);

		const yScale = d3.scalePoint().padding(0.5);

		const radiusScale = d3.scaleSqrt().range([1.5, maxRadius]);

		const xAxis = d3.axisTop(xScale);

		const yAxis = d3
			.axisLeft(yScale)
			.tickSizeOuter(0)
			.tickFormat(function (d) {
				return chartState.display === "aggregated"
					? "All"
					: chartState.gamGroup === "GM" && d === "3"
					? "3/4"
					: d;
			});

		const xAxisGroup = beeswarmPanel.main
			.append("g")
			.attr("class", "pbigamxAxisGroup")
			.attr(
				"transform",
				"translate(0," +
					(beeswarmPanel.padding[0] -
						beeswarmPanel.axisVerticalPadding) +
					")"
			);

		const yAxisGroup = beeswarmPanel.main
			.append("g")
			.attr("class", "pbigamyAxisGroup")
			.attr("transform", "translate(" + beeswarmPanel.padding[3] + ",0)");

		const simulation = d3
			.forceSimulation()
			.force(
				"xPosition",
				d3
					.forceX(function (d) {
						return xScale(d[chartState.allocationValue]);
					})
					.strength(xStrength)
			)
			.force(
				"yPosition",
				d3
					.forceY(function (d) {
						return chartState.display === "aggregated"
							? yScale(aggregatedDomain[0])
							: yScale(d.gamCode) === undefined
							? yScale("3")
							: yScale(d.gamCode);
					})
					.strength(yStrength)
			)
			.force(
				"collision",
				d3
					.forceCollide(function (d) {
						return radiusScale(d.projects) + radiusPadding;
					})
					.strength(collisionStrength)
			);

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		if (isPfbiSite && !isBookmarkPage) {
			Promise.all([
				window.cbpfbiDataObject.dataGam,
				window.cbpfbiDataObject.masterGam,
				window.cbpfbiDataObject.launchedAllocationsData,
			]).then(allData => csvCallback(allData));
		} else {
			Promise.all([
				fetchFile(classPrefix + "data", dataFile, "data", "csv"),
				fetchFile(
					classPrefix + "metadata",
					metadataFile,
					"metadata",
					"csv"
				),
				fetchFile(
					"launchedAllocationsData",
					launchedAllocationsDataUrl,
					"launched allocations data",
					"csv"
				),
			]).then(allData => csvCallback(allData));
		}

		function fetchFile(fileName, url, warningString, method) {
			if (
				localStorage.getItem(fileName) &&
				JSON.parse(localStorage.getItem(fileName)).timestamp >
					currentDate.getTime() - localStorageTime
			) {
				const fetchedData =
					method === "csv"
						? d3.csvParse(
								JSON.parse(localStorage.getItem(fileName)).data,
								d3.autoType
						  )
						: JSON.parse(localStorage.getItem(fileName)).data;
				console.info(
					classPrefix +
						" chart info: " +
						warningString +
						" from local storage"
				);
				return Promise.resolve(fetchedData);
			} else {
				const fetchMethod = method === "csv" ? d3.csv : d3.json;
				const rowFunction = method === "csv" ? d3.autoType : null;
				return fetchMethod(url, rowFunction).then(fetchedData => {
					try {
						localStorage.setItem(
							fileName,
							JSON.stringify({
								data:
									method === "csv"
										? d3.csvFormat(fetchedData)
										: fetchedData,
								timestamp: currentDate.getTime(),
							})
						);
					} catch (error) {
						console.info(classPrefix + " chart, " + error);
					}
					console.info(
						classPrefix +
							" chart info: " +
							warningString +
							" from API"
					);
					return fetchedData;
				});
			}
		}

		function csvCallback([rawData, metaData, rawLaunchedAllocationsData]) {
			removeProgressWheel();

			processRawData(rawData, metaData);

			validateYear(selectedYearString);

			chartState.selectedCbpfs =
				populateSelectedCbpfs(selectedCbpfsString);

			chartState.gamGroup =
				selectedGamGroup ||
				(chartState.selectedYear.length === 1
					? yearsArray
							.filter(function (d) {
								return (
									chartState.selectedYear.indexOf(d.year) > -1
								);
							})
							.reverse()[0].gamGroup
					: yearsArray.filter(function (d) {
							return (
								chartState.selectedYear.indexOf(d.year) > -1 &&
								d.year !== yearWithMixedGroups
							);
					  })[0].gamGroup);

			if (!lazyLoad) {
				draw(rawData, rawLaunchedAllocationsData);
			} else {
				d3.select(window).on("scroll.pbigam", checkPosition);
				d3.select("body").on("d3ChartsYear.pbigam", function () {
					chartState.selectedYear = [
						validateCustomEventYear(+d3.event.detail).year,
					];
					chartState.gamGroup = yearsArray.find(function (d) {
						return d.year === chartState.selectedYear[0];
					}).gamGroup;
				});
				checkPosition();
			}

			function checkPosition() {
				const containerPosition = containerDiv
					.node()
					.getBoundingClientRect();
				if (
					!(
						containerPosition.bottom < 0 ||
						containerPosition.top - windowHeight > 0
					)
				) {
					d3.select(window).on("scroll.pbigam", null);
					draw(rawData, rawLaunchedAllocationsData);
				}
			}

			//end of csvCallback
		}

		function draw(rawData, rawLaunchedAllocationsData) {
			const data = processData(rawData, rawLaunchedAllocationsData);

			createTitle(rawData);

			createCheckboxes(rawData, rawLaunchedAllocationsData);

			createTopPanel(data);

			createButtonsPanel(rawData, rawLaunchedAllocationsData);

			setYearsDescriptionDiv();

			resizeSVG();

			setScales();

			createBeeswarm(data);

			createLegend(data);

			if (!isPfbiSite) createFooterDiv();

			if (showHelp) createAnnotationsDiv();

			//end of draw
		}

		function createTitle(rawData) {
			const title = titleDiv
				.append("p")
				.attr("id", "pbigamd3chartTitle")
				.html(chartTitle);

			const helpIcon = iconsDiv
				.append("button")
				.attr("id", "pbigamHelpButton");

			helpIcon.html("HELP  ").append("span").attr("class", "fas fa-info");

			const downloadIcon = iconsDiv
				.append("button")
				.attr("id", "pbigamDownloadButton");

			downloadIcon
				.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			const snapshotDiv = iconsDiv
				.append("div")
				.attr("class", "pbigamSnapshotDiv");

			const snapshotIcon = snapshotDiv
				.append("button")
				.attr("id", "pbigamSnapshotButton");

			snapshotIcon
				.html("IMAGE ")
				.append("span")
				.attr("class", "fas fa-camera");

			const snapshotContent = snapshotDiv
				.append("div")
				.attr("class", "pbigamSnapshotContent");

			const pdfSpan = snapshotContent
				.append("p")
				.attr("id", "pbigamSnapshotPdfText")
				.html("Download PDF")
				.on("click", function () {
					createSnapshot("pdf", false);
				});

			const pngSpan = snapshotContent
				.append("p")
				.attr("id", "pbigamSnapshotPngText")
				.html("Download Image (PNG)")
				.on("click", function () {
					createSnapshot("png", false);
				});

			const playIcon = iconsDiv
				.append("button")
				.datum({
					clicked: false,
				})
				.attr("id", "pbigamPlayButton");

			playIcon.html("PLAY  ").append("span").attr("class", "fas fa-play");

			playIcon.on("click", function (d) {
				d.clicked = !d.clicked;

				playIcon
					.html(d.clicked ? "PAUSE " : "PLAY  ")
					.append("span")
					.attr("class", d.clicked ? "fas fa-pause" : "fas fa-play");

				if (d.clicked) {
					chartState.selectedYear.length = 1;
					loopButtons();
					timer = d3.interval(loopButtons, 3 * duration);
				} else {
					timer.stop();
				}

				function loopButtons() {
					const yearsArrayButtons = yearsArray
						.filter(function (d) {
							return d.year !== "gap";
						})
						.map(function (d) {
							return d.year + d.gamGroup;
						});

					const index = yearsArrayButtons.indexOf(
						chartState.selectedYear[0] + chartState.gamGroup
					);

					chartState.selectedYear[0] = +yearsArrayButtons[
						(index + 1) % yearsArrayButtons.length
					].slice(0, 4);

					chartState.gamGroup =
						yearsArrayButtons[
							(index + 1) % yearsArrayButtons.length
						].slice(4);

					const yearButton = d3
						.selectAll(".pbigambuttonsRects")
						.filter(function (d) {
							return (
								d.year === chartState.selectedYear[0] &&
								d.gamGroup === chartState.gamGroup
							);
						});

					yearButton.dispatch("click");

					const yearWithGamGroupArray = yearsArray.map(function (d) {
						return d.year + d.gamGroup;
					});

					const firstYearIndex =
						yearWithGamGroupArray.indexOf(
							chartState.selectedYear[0] + chartState.gamGroup
						) <
						buttonsNumber / 2
							? 0
							: yearWithGamGroupArray.indexOf(
									chartState.selectedYear[0] +
										chartState.gamGroup
							  ) >
							  yearsArray.length - buttonsNumber / 2
							? yearsArray.length - buttonsNumber
							: yearWithGamGroupArray.indexOf(
									chartState.selectedYear[0] +
										chartState.gamGroup
							  ) -
							  buttonsNumber / 2;

					const currentTranslate = -(
						buttonsPanel.buttonWidth * firstYearIndex
					);

					if (currentTranslate === 0) {
						svg.select(".pbigamLeftArrowGroup")
							.select("text")
							.style("fill", "#ccc");
						svg.select(".pbigamLeftArrowGroup").attr(
							"pointer-events",
							"none"
						);
					} else {
						svg.select(".pbigamLeftArrowGroup")
							.select("text")
							.style("fill", "#666");
						svg.select(".pbigamLeftArrowGroup").attr(
							"pointer-events",
							"all"
						);
					}

					if (
						Math.abs(currentTranslate) >=
						(yearsArray.length - buttonsNumber) *
							buttonsPanel.buttonWidth
					) {
						svg.select(".pbigamRightArrowGroup")
							.select("text")
							.style("fill", "#ccc");
						svg.select(".pbigamRightArrowGroup").attr(
							"pointer-events",
							"none"
						);
					} else {
						svg.select(".pbigamRightArrowGroup")
							.select("text")
							.style("fill", "#666");
						svg.select(".pbigamRightArrowGroup").attr(
							"pointer-events",
							"all"
						);
					}

					svg.select(".pbigambuttonsGroup")
						.transition()
						.duration(duration)
						.attrTween("transform", function () {
							return d3.interpolateString(
								this.getAttribute("transform"),
								"translate(" + currentTranslate + ",0)"
							);
						});
				}
			});

			if (!isBookmarkPage) {
				const shareIcon = iconsDiv
					.append("button")
					.attr("id", "pbigamShareButton");

				shareIcon
					.html("SHARE  ")
					.append("span")
					.attr("class", "fas fa-share");

				const shareDiv = containerDiv
					.append("div")
					.attr("class", "d3chartShareDiv")
					.style("display", "none");

				shareIcon
					.on("mouseover", function () {
						shareDiv
							.html("Click to copy")
							.style("display", "block");
						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv
							.node()
							.getBoundingClientRect();
						const shareBox = shareDiv
							.node()
							.getBoundingClientRect();
						const thisOffsetTop =
							thisBox.top -
							containerBox.top -
							(shareBox.height - thisBox.height) / 2;
						const thisOffsetLeft =
							thisBox.left -
							containerBox.left -
							shareBox.width -
							12;
						shareDiv
							.style("top", thisOffsetTop + "px")
							.style("left", thisOffsetLeft + "20px");
					})
					.on("mouseout", function () {
						shareDiv.style("display", "none");
					})
					.on("click", function () {
						const newURL =
							bookmarkSite + queryStringValues.toString();

						const shareInput = shareDiv
							.append("input")
							.attr("type", "text")
							.attr("readonly", true)
							.attr("spellcheck", "false")
							.property("value", newURL);

						shareInput.node().select();

						document.execCommand("copy");

						shareDiv.html("Copied!");

						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv
							.node()
							.getBoundingClientRect();
						const shareBox = shareDiv
							.node()
							.getBoundingClientRect();
						const thisOffsetLeft =
							thisBox.left -
							containerBox.left -
							shareBox.width -
							12;
						shareDiv.style("left", thisOffsetLeft + "20px");
					});
			}

			if (browserHasSnapshotIssues) {
				const bestVisualizedSpan = snapshotContent
					.append("p")
					.attr("id", "pbigamBestVisualizedText")
					.html(
						"For best results use Chrome, Firefox, Opera or Chromium-based Edge."
					)
					.attr("pointer-events", "none")
					.style("cursor", "default");
			}

			snapshotDiv
				.on("mouseover", function () {
					snapshotContent.style("display", "block");
				})
				.on("mouseout", function () {
					snapshotContent.style("display", "none");
				});

			helpIcon.on("click", createAnnotationsDiv);

			downloadIcon.on("click", function () {
				const csv = createCsv(rawData);

				const currentDate = new Date();

				const fileName =
					"GenderAgeMarker_" + csvDateFormat(currentDate) + ".csv";

				const blob = new Blob([csv], {
					type: "text/csv;charset=utf-8;",
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
					}
				}
			});

			//end of createTitle
		}

		function createCheckboxes(rawData, rawLaunchedAllocationsData) {
			selectTitleDiv.html("Select CBPF:");

			const checkboxData = d3.keys(cbpfsList);

			checkboxData.unshift("All CBPFs");

			const checkboxDivs = selectDiv
				.selectAll(null)
				.data(checkboxData)
				.enter()
				.append("div")
				.attr("class", "pbigamCheckboxDiv");

			checkboxDivs
				.filter(function (d) {
					return d !== "All CBPFs";
				})
				.style("opacity", function (d) {
					return chartState.cbpfsInData.indexOf(d) === -1
						? disabledOpacity
						: 1;
				});

			const checkbox = checkboxDivs.append("label");

			const input = checkbox
				.append("input")
				.attr("type", "checkbox")
				.property("checked", function (d) {
					return (
						chartState.selectedCbpfs.length !==
							d3.keys(cbpfsList).length &&
						chartState.selectedCbpfs.indexOf(d) > -1
					);
				})
				.attr("value", function (d) {
					return d;
				});

			const span = checkbox
				.append("span")
				.attr("class", "pbigamCheckboxText")
				.html(function (d) {
					return cbpfsList[d] || d;
				});

			const allCbpfs = checkboxDivs
				.filter(function (d) {
					return d === "All CBPFs";
				})
				.select("input");

			d3.select(allCbpfs.node().nextSibling).attr(
				"class",
				"pbigamCheckboxTextAllCbpfs"
			);

			const cbpfsCheckboxes = checkboxDivs
				.filter(function (d) {
					return d !== "All CBPFs";
				})
				.select("input");

			cbpfsCheckboxes.property("disabled", function (d) {
				return chartState.cbpfsInData.indexOf(d) === -1;
			});

			allCbpfs.property("checked", function () {
				return (
					chartState.selectedCbpfs.length ===
					d3.keys(cbpfsList).length
				);
			});

			checkbox.select("input").on("change", function () {
				if (this.value === "All CBPFs") {
					if (this.checked) {
						chartState.selectedCbpfs = d3.keys(cbpfsList);
						cbpfsCheckboxes.property("checked", false);
					} else {
						chartState.selectedCbpfs.length = 0;
					}
				} else {
					if (this.checked) {
						if (
							chartState.selectedCbpfs.length ===
							d3.keys(cbpfsList).length
						) {
							chartState.selectedCbpfs = [this.value];
						} else {
							chartState.selectedCbpfs.push(this.value);
						}
					} else {
						const thisIndex = chartState.selectedCbpfs.indexOf(
							this.value
						);
						chartState.selectedCbpfs.splice(thisIndex, 1);
					}
					allCbpfs.property("checked", false);
				}

				if (
					!chartState.selectedCbpfs.length ||
					chartState.selectedCbpfs.length ===
						d3.keys(cbpfsList).length
				) {
					queryStringValues.delete("fund");
				} else {
					const allFunds = chartState.selectedCbpfs
						.map(function (d) {
							return cbpfsList[d];
						})
						.join("|");
					if (queryStringValues.has("fund")) {
						queryStringValues.set("fund", allFunds);
					} else {
						queryStringValues.append("fund", allFunds);
					}
				}

				const data = processData(rawData, rawLaunchedAllocationsData);

				createTopPanel(data);
				createBeeswarm(data);
				createLegend(data);
			});

			//end of createCheckboxes
		}

		function createTopPanel(data) {
			const yearsListOriginal = chartState.selectedYear
				.sort(function (a, b) {
					return a - b;
				})
				.filter(function (d) {
					return yearsWithUnderApprovalAboveMin[d];
				});

			const yearsList = yearsListOriginal.reduce(function (
				acc,
				curr,
				index
			) {
				return (
					acc +
					(index >= yearsListOriginal.length - 2
						? index > yearsListOriginal.length - 2
							? curr
							: curr + " and "
						: curr + ", ")
				);
			},
			"");

			launchedValue
				.style(
					"opacity",
					chartState.selectedYear.some(
						e => yearsWithUnderApprovalAboveMin[e]
					)
						? 1
						: 0
				)
				.html("Launched Allocations in " + yearsList + ": ");

			launchedValue
				.append("span")
				.classed("contributionColorHTMLcolor", true)
				.html(
					"$" +
						formatSIFloat(topValuesLaunchedData.launched)
							.replace("k", " Thousand")
							.replace("M", " Million")
							.replace("G", " Billion")
				);

			const mainValue = d3.sum(data, function (d) {
				return d.allocations;
			});

			const projectsValue = d3.sum(data, function (d) {
				return d.projects;
			});

			const uniqueCbpfs = data
				.map(function (d) {
					return d.cbpfName;
				})
				.filter(function (elem, index, arr) {
					return arr.indexOf(elem) === index;
				});

			const cbpfsValue = uniqueCbpfs.filter(function (d) {
				return !d.includes("RhPF");
			}).length;

			const rhpfsValue = uniqueCbpfs.filter(function (d) {
				return d.includes("RhPF");
			}).length;

			const topPanelMoneyBag = topPanel.main
				.selectAll(".pbigamtopPanelMoneyBag")
				.data([true])
				.enter()
				.append("g")
				.attr("class", "pbigamtopPanelMoneyBag contributionColorFill")
				.attr(
					"transform",
					"translate(" + topPanel.moneyBagPadding + ",6) scale(0.5)"
				)
				.each(function (_, i, n) {
					moneyBagdAttribute.forEach(function (d) {
						d3.select(n[i]).append("path").attr("d", d);
					});
				});

			const previousValue =
				d3.select(".pbigamtopPanelMainValue").size() !== 0
					? d3.select(".pbigamtopPanelMainValue").datum()
					: 0;

			const previousProjects =
				d3.select(".pbigamtopPanelProjectsNumber").size() !== 0
					? d3.select(".pbigamtopPanelProjectsNumber").datum()
					: 0;

			const previousCbpfs =
				d3.select(".pbigamtopPanelCbpfsNumber").size() !== 0
					? d3.select(".pbigamtopPanelCbpfsNumber").datum()
					: 0;

			const previousRhpfs =
				d3.select(".pbigamtopPanelRhpfsNumber").size() !== 0
					? d3.select(".pbigamtopPanelRhpfsNumber").datum()
					: 0;

			let mainValueGroup = topPanel.main
				.selectAll(".pbigammainValueGroup")
				.data([true]);

			mainValueGroup = mainValueGroup
				.enter()
				.append("g")
				.attr("class", "pbigammainValueGroup")
				.merge(mainValueGroup);

			let topPanelMainValue = mainValueGroup
				.selectAll(".pbigamtopPanelMainValue")
				.data([mainValue]);

			topPanelMainValue = topPanelMainValue
				.enter()
				.append("text")
				.attr("class", "pbigamtopPanelMainValue contributionColorFill")
				.attr("text-anchor", "end")
				.merge(topPanelMainValue)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[0] -
						topPanel.mainValueHorPadding
				);

			topPanelMainValue
				.transition()
				.duration(duration)
				.tween("text", function (d) {
					const node = this;
					const i = d3.interpolate(previousValue, d);
					return function (t) {
						const siString = formatSIFloat(i(t));
						node.textContent =
							"$" +
							(+siString === +siString
								? siString
								: siString.substring(0, siString.length - 1));
					};
				})
				.on("end", function () {
					const thisBox = this.getBoundingClientRect();
					const containerBox = containerDiv
						.node()
						.getBoundingClientRect();
					const thisLeftPadding = thisBox.left - containerBox.left;
					launchedValue.style(
						"padding-left",
						thisLeftPadding + "px",
						"important"
					);
				});

			let topPanelMainText = mainValueGroup
				.selectAll(".pbigamtopPanelMainText")
				.data([mainValue]);

			topPanelMainText = topPanelMainText
				.enter()
				.append("text")
				.attr("class", "pbigamtopPanelMainText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.merge(topPanelMainText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[0] +
						topPanel.mainValueHorPadding
				);

			topPanelMainText
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function (d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (
						(unit === "k"
							? "Thousand"
							: unit === "M"
							? "Million"
							: unit === "B"
							? "Billion"
							: "") + " allocated"
					);
				});

			let topPanelSubText = mainValueGroup
				.selectAll(".pbigamtopPanelSubText")
				.data([true]);

			topPanelSubText = topPanelSubText
				.enter()
				.append("text")
				.attr("class", "pbigamtopPanelSubText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.merge(topPanelSubText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[0] +
						topPanel.mainValueHorPadding
				);

			topPanelSubText
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function (d) {
					const yearsText =
						chartState.selectedYear.length === 1
							? chartState.selectedYear[0] === yearWithMixedGroups
								? yearWithMixedGroups + "\u002A"
								: chartState.selectedYear[0]
							: "years\u002A";
					return "in " + yearsText;
				});

			let topPanelProjectsNumber = mainValueGroup
				.selectAll(".pbigamtopPanelProjectsNumber")
				.data([projectsValue]);

			topPanelProjectsNumber = topPanelProjectsNumber
				.enter()
				.append("text")
				.attr(
					"class",
					"pbigamtopPanelProjectsNumber contributionColorFill"
				)
				.attr("text-anchor", "end")
				.merge(topPanelProjectsNumber)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[1] -
						topPanel.mainValueHorPadding
				);

			topPanelProjectsNumber
				.transition()
				.duration(duration)
				.tween("text", function (d) {
					const node = this;
					const i = d3.interpolate(previousProjects, d);
					return function (t) {
						node.textContent = ~~i(t);
					};
				});

			let topPanelProjectsText = mainValueGroup
				.selectAll(".pbigamtopPanelProjectsText")
				.data([projectsValue]);

			topPanelProjectsText = topPanelProjectsText
				.enter()
				.append("text")
				.attr("class", "pbigamtopPanelProjectsText")
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[1] +
						topPanel.mainValueHorPadding
				)
				.attr("text-anchor", "start")
				.merge(topPanelProjectsText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2)
				.text("Projects");

			//

			let topPanelCbpfsNumber = mainValueGroup
				.selectAll(".pbigamtopPanelCbpfsNumber")
				.data(cbpfsValue ? [cbpfsValue] : []);

			topPanelCbpfsNumber.exit().remove();

			topPanelCbpfsNumber = topPanelCbpfsNumber
				.enter()
				.append("text")
				.attr(
					"class",
					"pbigamtopPanelCbpfsNumber contributionColorFill"
				)
				.attr("text-anchor", "end")
				.merge(topPanelCbpfsNumber)
				.style("font-size", rhpfsValue ? "22px" : "48px")
				.attr(
					"y",
					topPanel.height -
						topPanel.mainValueVerPadding * (rhpfsValue ? 2.7 : 1)
				)
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[2] -
						topPanel.mainValueHorPadding
				);

			topPanelCbpfsNumber
				.transition()
				.duration(duration)
				.tween("text", function (d) {
					const node = this;
					const i = d3.interpolate(previousCbpfs, d);
					return function (t) {
						node.textContent = ~~i(t);
					};
				});

			let topPanelCbpfsText = mainValueGroup
				.selectAll(".pbigamtopPanelCbpfsText")
				.data(cbpfsValue ? [cbpfsValue] : []);

			topPanelCbpfsText.exit().remove();

			topPanelCbpfsText = topPanelCbpfsText
				.enter()
				.append("text")
				.attr("class", "pbigamtopPanelCbpfsText")
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[2] +
						topPanel.mainValueHorPadding
				)
				.attr("text-anchor", "start")
				.merge(topPanelCbpfsText)
				.style("font-size", rhpfsValue ? "15px" : "18px")
				.attr(
					"y",
					topPanel.height -
						topPanel.mainValueVerPadding * (rhpfsValue ? 2.7 : 1.9)
				)
				.text(function (d) {
					return d > 1 ? "CBPFs" : "CBPF";
				});

			//

			let topPanelRhpfsNumber = mainValueGroup
				.selectAll(".pbigamtopPanelRhpfsNumber")
				.data(rhpfsValue ? [rhpfsValue] : []);

			topPanelRhpfsNumber.exit().remove();

			topPanelRhpfsNumber = topPanelRhpfsNumber
				.enter()
				.append("text")
				.attr(
					"class",
					"pbigamtopPanelRhpfsNumber contributionColorFill"
				)
				.attr("text-anchor", "end")
				.merge(topPanelRhpfsNumber)
				.style("font-size", cbpfsValue ? "22px" : "48px")
				.attr(
					"y",
					topPanel.height -
						topPanel.mainValueVerPadding * (cbpfsValue ? 0.8 : 1)
				)
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[2] -
						topPanel.mainValueHorPadding
				);

			topPanelRhpfsNumber
				.transition()
				.duration(duration)
				.tween("text", function (d) {
					const node = this;
					const i = d3.interpolate(previousRhpfs, d);
					return function (t) {
						node.textContent = ~~i(t);
					};
				});

			let topPanelRhpfsText = mainValueGroup
				.selectAll(".pbigamtopPanelRhpfsText")
				.data(rhpfsValue ? [rhpfsValue] : []);

			topPanelRhpfsText.exit().remove();

			topPanelRhpfsText = topPanelRhpfsText
				.enter()
				.append("text")
				.attr("class", "pbigamtopPanelRhpfsText")
				.attr(
					"x",
					topPanel.moneyBagPadding +
						topPanel.leftPadding[2] +
						topPanel.mainValueHorPadding
				)
				.attr("text-anchor", "start")
				.merge(topPanelRhpfsText)
				.style("font-size", cbpfsValue ? "15px" : "18px")
				.attr(
					"y",
					topPanel.height -
						topPanel.mainValueVerPadding * (cbpfsValue ? 1 : 1.9)
				)
				.text(function (d) {
					return d > 1 ? "Regional funds" : "Regional fund";
				});

			//

			//end of createTopPanel
		}

		function createButtonsPanel(rawData, rawLaunchedAllocationsData) {
			const buttonsLegendGroup = buttonsPanel.main
				.selectAll(".pbigambuttonsLegendGroup")
				.data(gamGroupsArray)
				.enter()
				.append("g")
				.attr("class", "pbigambuttonsLegendGroup")
				.attr("pointer-events", "none")
				.attr("transform", function (_, i) {
					return (
						"translate(" +
						(buttonsPanel.arrowPadding +
							buttonsPanel.buttonPadding / 2 +
							i * 220) +
						"," +
						(buttonsPanel.height - buttonsPanel.padding[2] + 12) +
						")"
					);
				});

			const buttonsLegendRects = buttonsLegendGroup
				.append("rect")
				.attr("width", buttonsLegendRectSize)
				.attr("height", buttonsLegendRectSize)
				.attr("rx", "2px")
				.attr("ry", "2px")
				.style("fill", function (_, i) {
					return i ? buttonBlue : buttonGrayDarker;
				});

			const buttonsLegendTexts = buttonsLegendGroup
				.append("text")
				.attr("class", "pbigambuttonsLegendText")
				.attr("x", buttonsLegendRectSize + 3)
				.attr("y", buttonsLegendRectSize - 2)
				.text(function (_, i) {
					return i ? "GAM, post 2019" : "GM, pre 2019";
				});

			const clipPathButtons = buttonsPanel.main
				.append("clipPath")
				.attr("id", "pbigamclipPathButtons")
				.append("rect")
				.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
				.attr("height", buttonsPanel.height);

			const clipPathGroup = buttonsPanel.main
				.append("g")
				.attr("class", "pbigamClipPathGroup")
				.attr(
					"transform",
					"translate(" +
						(buttonsPanel.padding[3] + buttonsPanel.arrowPadding) +
						",0)"
				)
				.attr("clip-path", "url(#pbigamclipPathButtons)");

			const buttonsGroup = clipPathGroup
				.append("g")
				.attr("class", "pbigambuttonsGroup")
				.attr("transform", "translate(0,0)")
				.style("cursor", "pointer");

			const gmYears = yearsArray.filter(function (d) {
				return d.gamGroup === "GM";
			}).length;

			const gamYears = yearsArray.filter(function (d) {
				return d.gamGroup === "GAM";
			}).length;

			const gmRect = buttonsGroup
				.append("rect")
				.attr("rx", "1px")
				.attr("ry", "1px")
				.attr("x", buttonsPanel.buttonPadding / 2)
				.attr("y", buttonsPanel.height - buttonsPanel.padding[2])
				.attr("height", 4)
				.attr(
					"width",
					gmYears * buttonsPanel.buttonWidth -
						buttonsPanel.buttonPadding
				)
				.style("fill", buttonGrayDarker);

			const gamRect = buttonsGroup
				.append("rect")
				.attr("rx", "1px")
				.attr("ry", "1px")
				.attr(
					"x",
					buttonsPanel.buttonPadding / 2 +
						gmYears * buttonsPanel.buttonWidth +
						buttonsPanel.buttonWidth
				)
				.attr("y", buttonsPanel.height - buttonsPanel.padding[2])
				.attr("height", 4)
				.attr(
					"width",
					gamYears * buttonsPanel.buttonWidth -
						buttonsPanel.buttonPadding
				)
				.style("fill", buttonBlue);

			const buttonsRects = buttonsGroup
				.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "pbigambuttonsRects")
				.attr(
					"width",
					buttonsPanel.buttonWidth - buttonsPanel.buttonPadding
				)
				.attr(
					"height",
					buttonsPanel.height -
						buttonsPanel.padding[0] -
						buttonsPanel.padding[2] -
						buttonsPanel.buttonVerticalPadding * 2
				)
				.attr(
					"y",
					buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding
				)
				.attr("x", function (_, i) {
					return (
						i * buttonsPanel.buttonWidth +
						buttonsPanel.buttonPadding / 2
					);
				})
				.style("fill", function (d) {
					return chartState.selectedYear.indexOf(d.year) > -1 &&
						chartState.gamGroup === d.gamGroup
						? unBlue
						: buttonGray;
				})
				.style("opacity", function (d) {
					return d.year !== "gap" ? 1 : 0;
				})
				.attr("pointer-events", function (d) {
					return d.year !== "gap" ? "all" : "none";
				});

			const buttonsText = buttonsGroup
				.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "pbigambuttonsText")
				.attr("y", 4.8 * buttonsPanel.buttonVerticalPadding)
				.attr("x", function (_, i) {
					return (
						i * buttonsPanel.buttonWidth +
						buttonsPanel.buttonWidth / 2
					);
				})
				.style("fill", function (d) {
					return chartState.selectedYear.indexOf(d.year) > -1 &&
						chartState.gamGroup === d.gamGroup
						? "white"
						: "#444";
				})
				.style("opacity", function (d) {
					return d.year !== "gap" ? 1 : 0;
				})
				.text(function (d) {
					return d.year;
				});

			const leftArrow = buttonsPanel.main
				.append("g")
				.attr("class", "pbigamLeftArrowGroup")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr(
					"transform",
					"translate(" + buttonsPanel.padding[3] + ",0)"
				);

			const leftArrowRect = leftArrow
				.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr(
					"height",
					buttonsPanel.height -
						buttonsPanel.padding[0] -
						buttonsPanel.padding[2] -
						buttonsPanel.buttonVerticalPadding * 2
				)
				.attr(
					"y",
					buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding
				);

			const leftArrowText = leftArrow
				.append("text")
				.attr("class", "pbigamleftArrowText")
				.attr("x", 0)
				.attr(
					"y",
					buttonsPanel.padding[0] +
						buttonsPanel.buttonVerticalPadding * 5.4
				)
				.style("fill", "#666")
				.text("\u25c4");

			const rightArrow = buttonsPanel.main
				.append("g")
				.attr("class", "pbigamRightArrowGroup")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr(
					"transform",
					"translate(" +
						(buttonsPanel.padding[3] +
							buttonsPanel.arrowPadding +
							buttonsNumber * buttonsPanel.buttonWidth) +
						",0)"
				);

			const rightArrowRect = rightArrow
				.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr(
					"height",
					buttonsPanel.height -
						buttonsPanel.padding[0] -
						buttonsPanel.padding[2] -
						buttonsPanel.buttonVerticalPadding * 2
				)
				.attr(
					"y",
					buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding
				);

			const rightArrowText = rightArrow
				.append("text")
				.attr("class", "pbigamrightArrowText")
				.attr("x", -1)
				.attr(
					"y",
					buttonsPanel.padding[0] +
						buttonsPanel.buttonVerticalPadding * 5.4
				)
				.style("fill", "#666")
				.text("\u25ba");

			if (yearsArray.length > buttonsNumber) {
				rightArrow.style("opacity", 1).attr("pointer-events", "all");

				leftArrow.style("opacity", 1).attr("pointer-events", "all");

				repositionButtonsGroup();

				checkCurrentTranslate();

				leftArrow.on("click", function () {
					leftArrow.attr("pointer-events", "none");
					const currentTranslate = parseTransform(
						buttonsGroup.attr("transform")
					)[0];
					rightArrow.select("text").style("fill", "#666");
					rightArrow.attr("pointer-events", "all");
					buttonsGroup
						.transition()
						.duration(duration)
						.attr(
							"transform",
							"translate(" +
								Math.min(
									0,
									currentTranslate +
										buttonsNumber * buttonsPanel.buttonWidth
								) +
								",0)"
						)
						.on("end", checkArrows);
				});

				rightArrow.on("click", function () {
					rightArrow.attr("pointer-events", "none");
					const currentTranslate = parseTransform(
						buttonsGroup.attr("transform")
					)[0];
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
					buttonsGroup
						.transition()
						.duration(duration)
						.attr(
							"transform",
							"translate(" +
								Math.max(
									-(
										(yearsArray.length - buttonsNumber) *
										buttonsPanel.buttonWidth
									),
									-(
										Math.abs(currentTranslate) +
										buttonsNumber * buttonsPanel.buttonWidth
									)
								) +
								",0)"
						)
						.on("end", checkArrows);
				});
			}

			const buttonsAllocationsGroup = buttonsPanel.main
				.append("g")
				.attr("class", "pbigambuttonsAllocationsGroup")
				.style("cursor", "pointer");

			const buttonsAllocationsRects = buttonsAllocationsGroup
				.selectAll(null)
				.data(d3.keys(allocationValueTypes))
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "pbigambuttonsAllocationsRects")
				.attr("width", function (_, i) {
					return (
						buttonsPanel.buttonsAllocationsWidth +
						(i ? 18 : -36) -
						buttonsPanel.buttonPadding
					);
				})
				.attr(
					"height",
					buttonsPanel.height -
						buttonsPanel.padding[0] -
						buttonsPanel.padding[2] -
						buttonsPanel.buttonVerticalPadding * 2
				)
				.attr(
					"y",
					buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding
				)
				.attr("x", function (_, i) {
					return (
						i *
							(buttonsPanel.buttonsAllocationsWidth +
								(i === 1 ? -36 : -9)) +
						buttonsPanel.buttonPadding / 2
					);
				})
				.style("fill", function (d) {
					return allocationValueTypes[d] ===
						chartState.allocationValue
						? unBlue
						: "#eaeaea";
				});

			const buttonsAllocationsText = buttonsAllocationsGroup
				.selectAll(null)
				.data(d3.keys(allocationValueTypes))
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "pbigambuttonsAllocationsText")
				.attr("y", 4.8 * buttonsPanel.buttonVerticalPadding)
				.attr("x", function (_, i) {
					return (
						i * buttonsPanel.buttonsAllocationsWidth +
						buttonsPanel.buttonsAllocationsWidth / 2 -
						(i === 1 ? 27 : i ? 9 : 18)
					);
				})
				.style("fill", function (d) {
					return allocationValueTypes[d] ===
						chartState.allocationValue
						? "white"
						: "#444";
				})
				.attr("letter-spacing", function (_, i) {
					return i ? -0.6 : "normal";
				})
				.text(function (d) {
					return d === "budget"
						? "Budget"
						: d === "percentagegam"
						? "Budget % of per Marker"
						: "Budget % of per CBPF";
				});

			const buttonsGroupSize = Math.min(
				buttonsPanel.padding[3] +
					buttonsPanel.arrowPadding +
					buttonsGroup.node().getBoundingClientRect().width,
				buttonsPanel.padding[3] +
					buttonsNumber * buttonsPanel.buttonWidth +
					2 * buttonsPanel.arrowPadding
			);

			const buttonsAllocationsSize = buttonsAllocationsGroup
				.node()
				.getBoundingClientRect().width;

			const allocationsPosition =
				buttonsGroupSize +
				(buttonsPanel.displayPadding -
					buttonsGroupSize -
					buttonsAllocationsSize) /
					2;

			buttonsAllocationsGroup.attr(
				"transform",
				"translate(" + allocationsPosition + ",0)"
			);

			const buttonsDisplayGroup = buttonsPanel.main
				.append("g")
				.attr("class", "pbigambuttonsDisplayGroup")
				.attr(
					"transform",
					"translate(" + buttonsPanel.displayPadding + ",0)"
				)
				.style("cursor", "pointer");

			const buttonsDisplayRects = buttonsDisplayGroup
				.selectAll(null)
				.data(displayTypes)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "pbigambuttonsDisplayRects")
				.attr(
					"width",
					buttonsPanel.buttonDisplayWidth - buttonsPanel.buttonPadding
				)
				.attr(
					"height",
					buttonsPanel.height -
						buttonsPanel.padding[0] -
						buttonsPanel.padding[2] -
						buttonsPanel.buttonVerticalPadding * 2
				)
				.attr(
					"y",
					buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding
				)
				.attr("x", function (_, i) {
					return (
						i * buttonsPanel.buttonDisplayWidth +
						buttonsPanel.buttonPadding / 2
					);
				})
				.style("fill", function (d) {
					return d === chartState.display ? unBlue : "#eaeaea";
				});

			const buttonsDisplayText = buttonsDisplayGroup
				.selectAll(null)
				.data(displayTypes)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "pbigambuttonsDisplayText")
				.attr("y", 4.8 * buttonsPanel.buttonVerticalPadding)
				.attr("x", function (_, i) {
					return (
						i * buttonsPanel.buttonDisplayWidth +
						buttonsPanel.buttonDisplayWidth / 2
					);
				})
				.style("fill", function (d) {
					return d === chartState.display ? "white" : "#444";
				})
				.text(function (d) {
					return d === "marker" ? "View by Marker" : "Overall View";
				});

			buttonsRects
				.on("mouseover", mouseOverButtonsRects)
				.on("mouseout", mouseOutButtonsRects)
				.on("click", function (d) {
					const self = this;
					if (d3.event.altKey) {
						clickButtonsRects(d, false);
						return;
					}
					if (localVariable.get(this) !== "clicked") {
						localVariable.set(this, "clicked");
						setTimeout(function () {
							if (localVariable.get(self) === "clicked") {
								clickButtonsRects(d, true);
							}
							localVariable.set(self, null);
						}, 250);
					} else {
						clickButtonsRects(d, false);
						localVariable.set(this, null);
					}
				});

			d3.select("body").on("d3ChartsYear.pbigam", function () {
				clickButtonsRects(
					validateCustomEventYear(+d3.event.detail),
					true
				);
				repositionButtonsGroup();
				checkArrows();
			});

			buttonsAllocationsRects
				.on("mouseover", mouseOverButtonsAllocationsRects)
				.on("mouseout", mouseOutButtonsAllocationsRects)
				.on("click", clickButtonsAllocationsRects);

			buttonsDisplayRects
				.on("mouseover", mouseOverButtonsDisplayRects)
				.on("mouseout", mouseOutButtonsDisplayRects)
				.on("click", clickButtonsDisplayRects);

			function checkArrows() {
				const currentTranslate = parseTransform(
					buttonsGroup.attr("transform")
				)[0];

				if (currentTranslate === 0) {
					leftArrow.select("text").style("fill", "#ccc");
					leftArrow.attr("pointer-events", "none");
				} else {
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
				}

				if (
					Math.abs(currentTranslate) >=
					(yearsArray.length - buttonsNumber) *
						buttonsPanel.buttonWidth
				) {
					rightArrow.select("text").style("fill", "#ccc");
					rightArrow.attr("pointer-events", "none");
				} else {
					rightArrow.select("text").style("fill", "#666");
					rightArrow.attr("pointer-events", "all");
				}
			}

			function checkCurrentTranslate() {
				const currentTranslate = parseTransform(
					buttonsGroup.attr("transform")
				)[0];

				if (currentTranslate === 0) {
					leftArrow.select("text").style("fill", "#ccc");
					leftArrow.attr("pointer-events", "none");
				}

				if (
					Math.abs(currentTranslate) >=
					(yearsArray.length - buttonsNumber) *
						buttonsPanel.buttonWidth
				) {
					rightArrow.select("text").style("fill", "#ccc");
					rightArrow.attr("pointer-events", "none");
				}
			}

			function repositionButtonsGroup() {
				const yearWithGamGroupArray = yearsArray.map(function (d) {
					return d.year + d.gamGroup;
				});

				const firstYearIndex =
					yearWithGamGroupArray.indexOf(
						chartState.selectedYear[0] + chartState.gamGroup
					) <
					buttonsNumber / 2
						? 0
						: yearWithGamGroupArray.indexOf(
								chartState.selectedYear[0] + chartState.gamGroup
						  ) >
						  yearsArray.length - buttonsNumber / 2
						? yearsArray.length - buttonsNumber
						: yearWithGamGroupArray.indexOf(
								chartState.selectedYear[0] + chartState.gamGroup
						  ) -
						  buttonsNumber / 2;

				buttonsGroup.attr(
					"transform",
					"translate(" +
						-(buttonsPanel.buttonWidth * firstYearIndex) +
						",0)"
				);
			}

			function mouseOverButtonsRects(d) {
				tooltip.style("display", "block").html(null);

				const innerTooltip = tooltip
					.append("div")
					.style("max-width", "200px")
					.attr("id", "pbigamInnerTooltipDiv");

				innerTooltip.html(
					"Click for selecting a single year. Double-click or ALT + click for selecting multiple years (for the same marker system)."
				);

				const containerSize = containerDiv
					.node()
					.getBoundingClientRect();

				const thisSize = this.getBoundingClientRect();

				tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip
					.style(
						"left",
						thisSize.left +
							thisSize.width / 2 -
							containerSize.left >
							containerSize.width -
								tooltipSize.width / 2 -
								padding[1]
							? containerSize.width -
									tooltipSize.width -
									padding[1] +
									"px"
							: thisSize.left +
									thisSize.width / 2 -
									containerSize.left <
							  tooltipSize.width / 2 +
									buttonsPanel.padding[3] +
									padding[0]
							? buttonsPanel.padding[3] + padding[0] + "px"
							: thisSize.left +
							  thisSize.width / 2 -
							  containerSize.left -
							  tooltipSize.width / 2 +
							  "px"
					)
					.style(
						"top",
						thisSize.top + thisSize.height / 2 - containerSize.top <
							tooltipSize.height
							? thisSize.top -
									containerSize.top +
									thisSize.height +
									2 +
									"px"
							: thisSize.top -
									containerSize.top -
									tooltipSize.height -
									4 +
									"px"
					);

				d3.select(this).style("fill", unBlue);
				buttonsText
					.filter(function (e) {
						return e.year === d.year && e.gamGroup === d.gamGroup;
					})
					.style("fill", "white");
			}

			function mouseOutButtonsRects(d) {
				tooltip.style("display", "none");
				if (
					chartState.selectedYear.indexOf(d.year) > -1 &&
					chartState.gamGroup === d.gamGroup
				)
					return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsText
					.filter(function (e) {
						return e.year === d.year && e.gamGroup === d.gamGroup;
					})
					.style("fill", "#444");
			}

			function clickButtonsRects(d, singleSelection) {
				if (singleSelection || d.gamGroup !== chartState.gamGroup) {
					chartState.selectedYear = [d.year];
					chartState.gamGroup = d.gamGroup;
				} else {
					const index = chartState.selectedYear.indexOf(d.year);
					if (index > -1) {
						if (chartState.selectedYear.length === 1) {
							return;
						} else {
							chartState.selectedYear.splice(index, 1);
						}
					} else {
						chartState.selectedYear.push(d.year);
					}
				}

				const allYears = chartState.selectedYear
					.map(function (d) {
						return d;
					})
					.join("|");

				if (queryStringValues.has("year")) {
					queryStringValues.set("year", allYears);
				} else {
					queryStringValues.append("year", allYears);
				}

				if (queryStringValues.has("gamgroup")) {
					queryStringValues.set("gamgroup", chartState.gamGroup);
				} else {
					queryStringValues.append("gamgroup", chartState.gamGroup);
				}

				buttonsRects.style("fill", function (e) {
					return chartState.selectedYear.indexOf(e.year) > -1 &&
						chartState.gamGroup === e.gamGroup
						? unBlue
						: "#eaeaea";
				});

				buttonsText.style("fill", function (e) {
					return chartState.selectedYear.indexOf(e.year) > -1 &&
						chartState.gamGroup === e.gamGroup
						? "white"
						: "#444";
				});

				setYearsDescriptionDiv();

				const data = processData(rawData, rawLaunchedAllocationsData);

				selectDiv
					.selectAll(".pbigamCheckboxDiv")
					.filter(function (d) {
						return d !== "All CBPFs";
					})
					.select("input")
					.property("disabled", function (d) {
						return chartState.cbpfsInData.indexOf(d) === -1;
					});

				selectDiv
					.selectAll(".pbigamCheckboxDiv")
					.filter(function (d) {
						return d !== "All CBPFs";
					})
					.style("opacity", function (d) {
						return chartState.cbpfsInData.indexOf(d) === -1
							? disabledOpacity
							: 1;
					});

				setScales();
				createTopPanel(data);
				createBeeswarm(data);
				createLegend(data);

				//end of clickButtonsRects
			}

			function mouseOverButtonsAllocationsRects(d) {
				d3.select(this).style("fill", unBlue);
				d3.select(this.parentNode)
					.selectAll("text")
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "white");

				if (d === "budget") return;

				const thisBoundingRect = this.getBoundingClientRect();

				const containerBoundingRect = containerDiv
					.node()
					.getBoundingClientRect();

				tooltip.style("display", "block").html(null);

				const tooltipContainer = tooltip
					.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style("font-style", "italic")
					.style("font-size", "12px")
					.style("width", "270px");

				const leftSide = tooltipContainer
					.append("div")
					.style("display", "flex")
					.style("flex", "0 92%")
					.style("flex-direction", "column");

				const rightSide = tooltipContainer
					.append("div")
					.style("flex", "0 8%")
					.style("white-space", "pre")
					.html(" %");

				const numerator = leftSide
					.append("div")
					.style("text-align", "center")
					.style("border-bottom", "1px solid gray")
					.html(allocationTooltipDescriptions.numerator);

				const denominator = leftSide
					.append("div")
					.style("text-align", "center")
					.html(allocationTooltipDescriptions[d]);

				const tooltipBoundingRect = tooltip
					.node()
					.getBoundingClientRect();

				tooltip
					.style(
						"top",
						thisBoundingRect.top -
							containerBoundingRect.top -
							tooltipBoundingRect.height -
							8 +
							"px"
					)
					.style(
						"left",
						thisBoundingRect.left -
							containerBoundingRect.left +
							thisBoundingRect.width / 2 -
							tooltipBoundingRect.width / 2 +
							"px"
					);
			}

			function mouseOverButtonsDisplayRects(d) {
				d3.select(this).style("fill", unBlue);
				d3.select(this.parentNode)
					.selectAll("text")
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "white");
			}

			function mouseOutButtonsDisplayRects(d) {
				if (d === chartState.display) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsDisplayText
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "#444");
			}

			function clickButtonsDisplayRects(d) {
				chartState.display = d;

				if (queryStringValues.has("display")) {
					queryStringValues.set("display", d);
				} else {
					queryStringValues.append("display", d);
				}

				buttonsDisplayRects.style("fill", function (e) {
					return chartState.display === e ? unBlue : "#eaeaea";
				});

				buttonsDisplayText.style("fill", function (e) {
					return chartState.display === e ? "white" : "#444";
				});

				const data = processData(rawData, rawLaunchedAllocationsData);

				resizeSVG();
				setScales();
				createBeeswarm(data);
				createLegend(data);
			}

			function mouseOutButtonsAllocationsRects(d) {
				tooltip.style("display", "none");
				if (allocationValueTypes[d] === chartState.allocationValue)
					return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsAllocationsText
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "#444");
			}

			function clickButtonsAllocationsRects(d) {
				tooltip.style("display", "none");

				chartState.allocationValue = allocationValueTypes[d];

				if (queryStringValues.has("valuetype")) {
					queryStringValues.set("valuetype", d);
				} else {
					queryStringValues.append("valuetype", d);
				}

				buttonsAllocationsRects.style("fill", function (e) {
					return chartState.allocationValue ===
						allocationValueTypes[e]
						? unBlue
						: "#eaeaea";
				});

				buttonsAllocationsText.style("fill", function (e) {
					return chartState.allocationValue ===
						allocationValueTypes[e]
						? "white"
						: "#444";
				});

				const data = processData(rawData, rawLaunchedAllocationsData);

				createBeeswarm(data);
				createLegend(data);
			}

			//end of createButtonsPanel
		}

		function createBeeswarm(data) {
			radiusScale.domain([
				1,
				d3.max(data, function (d) {
					return d.projects;
				}),
			]);

			xScale.domain([
				0,
				d3.max(data, function (d) {
					return d[chartState.allocationValue];
				}),
			]);

			const meanData = yScale.domain().map(function (d) {
				return {
					gamCode: d,
					mean:
						d === "aggregated"
							? d3.mean(data, function (e) {
									return e[chartState.allocationValue];
							  })
							: d3.mean(
									data.filter(function (e) {
										return e.gamCode === d;
									}),
									function (e) {
										return e[chartState.allocationValue];
									}
							  ) || 0,
				};
			});

			simulation.nodes(data).stop();

			simulation.alpha(1).alphaTarget(0);

			for (let i = 0; i < iterations; i++) simulation.tick();

			let beeswarm = beeswarmPanel.main
				.selectAll(".pbigambeeswarm")
				.data(data, function (d) {
					return d.cbpfId + d.keygamGroup + d.gamCode;
				});

			const beeswarmExit = beeswarm
				.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const beeswarmEnter = beeswarm
				.enter()
				.append("circle")
				.attr("class", "pbigambeeswarm")
				.attr("r", function (d) {
					return radiusScale(d.projects);
				})
				.attr("cx", function (d) {
					return d.x;
				})
				.attr("cy", function (d) {
					return d.y;
				})
				.style("fill", function (d) {
					return colorsScale(d.gamCode);
				})
				.style("stroke", function (d) {
					return d3.color(colorsScale(d.gamCode)).darker();
				})
				.style("stroke-width", "1px");

			beeswarm = beeswarmEnter.merge(beeswarm);

			beeswarm
				.transition()
				.duration(duration)
				.attr("r", function (d) {
					return radiusScale(d.projects);
				})
				.attr("cx", function (d) {
					return d.x;
				})
				.attr("cy", function (d) {
					return d.y;
				})
				.style("fill", function (d) {
					return colorsScale(d.gamCode);
				})
				.style("stroke", function (d) {
					return d3.color(colorsScale(d.gamCode)).darker();
				});

			beeswarm
				.on("mouseover", mouseOverBeeswarm)
				.on("mouseout", function () {
					if (isSnapshotTooltipVisible) return;

					currentHoveredElem = null;

					totalLabel.style(
						"opacity",
						chartState.allocationValue === "allocations" ? 1 : 0
					);
					totalValues.style(
						"opacity",
						chartState.allocationValue === "allocations" ? 1 : 0
					);

					beeswarmPanel.main
						.selectAll(
							".pbigambeeswarmLabel, .pbigambeeswarmLabelBack"
						)
						.remove();

					beeswarm.style("opacity", 1);
					tooltip.style("display", "none");
				});

			xAxis
				.tickSizeInner(
					-(
						beeswarmPanel.height -
						beeswarmPanel.padding[0] -
						beeswarmPanel.padding[2] +
						beeswarmPanel.axisVerticalPadding
					)
				)
				.tickFormat(function (d) {
					return chartState.allocationValue === "allocations"
						? formatSIaxes(d).replace("G", "B")
						: formatPercent(d);
				});

			xAxisGroup.transition().duration(duration).call(xAxis);

			xAxisGroup
				.selectAll(".tick")
				.filter(function (d) {
					return d === 0;
				})
				.remove();

			yAxis.tickSizeInner(
				chartState.display !== "aggregated" ? maxRadius / 2 : maxRadius
			);

			yAxisGroup
				.transition()
				.duration(duration)
				.call(yAxis)
				.selectAll(".tick text")
				.style("fill", function (d) {
					return d3.color(colorsScale(d)).darker(0.8);
				});

			const axisLabelCode = beeswarmPanel.main
				.selectAll(".pbigamaxisLabelCode")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbigamaxisLabelCode")
				.attr("x", beeswarmPanel.padding[3] - maxRadius)
				.attr(
					"y",
					beeswarmPanel.padding[0] -
						beeswarmPanel.axisVerticalPadding -
						3
				)
				.attr("text-anchor", "middle")
				.text("Marker Code");

			let totalLabel = beeswarmPanel.main
				.selectAll(".pbigamtotalLabel")
				.data([true]);

			totalLabel = totalLabel
				.enter()
				.append("text")
				.attr("class", "pbigamtotalLabel")
				.attr("text-anchor", "end")
				.attr("x", beeswarmPanel.width - totalLabelPadding)
				.attr(
					"y",
					beeswarmPanel.padding[0] -
						beeswarmPanel.axisVerticalPadding -
						3
				)
				.text("Total")
				.merge(totalLabel);

			totalLabel
				.transition()
				.duration(duration)
				.style(
					"opacity",
					chartState.allocationValue === "allocations" ? 1 : 0
				);

			const totalData =
				chartState.display === "aggregated"
					? [
							{
								value: d3.sum(data, function (d) {
									return d.allocations;
								}),
								marker: aggregatedDomain[0],
							},
					  ]
					: data.reduce(function (acc, curr) {
							const foundMarker = acc.find(function (d) {
								return (
									d.marker ===
									(chartState.gamGroup === "GM" &&
									curr.gamCode === "4"
										? "3"
										: curr.gamCode)
								);
							});
							if (foundMarker) {
								foundMarker.value += curr.allocations;
							} else {
								acc.push({
									value: curr.allocations,
									marker:
										chartState.gamGroup === "GM" &&
										curr.gamCode === "4"
											? "3"
											: curr.gamCode,
								});
							}
							return acc;
					  }, []);

			const totalValue = d3.sum(totalData, function (d) {
				return d.value;
			});

			let totalValues = beeswarmPanel.main
				.selectAll(".pbigamtotalValues")
				.data(totalData, function (d) {
					return d.marker;
				});

			const totalValuesExit = totalValues
				.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const totalValuesEnter = totalValues
				.enter()
				.append("text")
				.attr("class", "pbigamtotalValues")
				.attr("text-anchor", "end")
				.style(
					"opacity",
					chartState.allocationValue === "allocations" ? 1 : 0
				)
				.attr("x", beeswarmPanel.width - totalLabelPadding)
				.attr("y", function (d) {
					return yScale(d.marker);
				})
				.text(function (d) {
					return "$" + formatSIFloat(d.value);
				});

			totalValuesEnter
				.append("tspan")
				.attr("class", "pbigamtotalValuesTspan")
				.attr("dy", "1.2em")
				.attr("x", beeswarmPanel.width - totalLabelPadding)
				.text(function (d) {
					return (
						"(" + formatPercent1Decimal(d.value / totalValue) + ")"
					);
				});

			totalValues = totalValuesEnter.merge(totalValues);

			totalValues
				.transition()
				.duration(duration)
				.style(
					"opacity",
					chartState.allocationValue === "allocations" ? 1 : 0
				)
				.attr("y", function (d) {
					return yScale(d.marker);
				});

			totalValues
				.text(function (d) {
					return "$" + formatSIFloat(d.value);
				})
				.append("tspan")
				.attr("class", "pbigamtotalValuesTspan")
				.attr("dy", "1.2em")
				.attr("x", beeswarmPanel.width - totalLabelPadding)
				.text(function (d) {
					return (
						"(" + formatPercent1Decimal(d.value / totalValue) + ")"
					);
				});

			let gamDescriptionData;

			if (chartState.display !== "aggregated") {
				gamDescriptionData = JSON.parse(
					JSON.stringify(
						gamDescriptions.filter(function (d) {
							return chartState.gamGroup === d.gamGroup;
						})
					)
				);
				if (chartState.gamGroup === "GM") {
					const lastValidObject = gamDescriptionData.find(function (
						d
					) {
						return d.gamCode === "3";
					});
					const lastObject = gamDescriptionData.find(function (d) {
						return d.gamCode === "4";
					});
					lastValidObject.gamDescription =
						lastValidObject.gamDescription +
						"/" +
						lastObject.gamDescription;
					gamDescriptionData = gamDescriptionData.filter(function (
						d
					) {
						return d.gamCode !== "4";
					});
				}
			} else if (chartState.gamGroup === "GM") {
				gamDescriptionData = ["All Gender Markers combined"];
			} else {
				gamDescriptionData = ["All Gender and Age Markers combined"];
			}

			let axisDescriptions = beeswarmPanel.main
				.selectAll(".pbigamaxisDescriptions")
				.data(gamDescriptionData);

			const axisDescriptionsExit = axisDescriptions
				.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const axisDescriptionsEnter = axisDescriptions
				.enter()
				.append("text")
				.attr("class", "pbigamaxisDescriptions")
				.attr("text-anchor", "middle")
				.attr(
					"x",
					(beeswarmPanel.padding[3] - axisDescriptionsPadding) / 2
				);

			axisDescriptions = axisDescriptionsEnter.merge(axisDescriptions);

			axisDescriptions
				.attr("y", function (d) {
					return yScale(d.gamCode) || yScale("aggregated");
				})
				.text(function (d) {
					return d.gamDescription || d;
				})
				.call(
					wrapText,
					chartState.display !== "aggregated"
						? beeswarmPanel.padding[3] - axisDescriptionsPadding
						: beeswarmPanel.padding[3] -
								axisDescriptionsPadding -
								30
				);

			axisDescriptions.each(function (d) {
				const numberOfLines = d3.select(this).selectAll("tspan").size();
				const currentValue = +d3.select(this).attr("y");
				d3.select(this)
					.selectAll("tspan")
					.attr(
						"y",
						numberOfLines - 1
							? currentValue -
									axisDescriptionsLineHeight *
										(numberOfLines - 1)
							: currentValue + 3
					);
			});

			let meanGroup = beeswarmPanel.main
				.selectAll(".pbigammeanGroup")
				.data(meanData, function (d) {
					return d.gamCode;
				});

			const meanGroupExit = meanGroup
				.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const meanGroupEnter = meanGroup
				.enter()
				.append("g")
				.attr("class", "pbigammeanGroup")
				.attr("transform", function (d) {
					return (
						"translate(" +
						xScale(d.mean) +
						"," +
						yScale(d.gamCode) +
						")"
					);
				});

			meanGroupEnter
				.append("line")
				.attr("y1", -yScale.step() / 2 + 4)
				.attr("y2", yScale.step() / 2 - 4)
				.style("stroke-dasharray", "4,2")
				.style("stroke-width", "1.5px")
				.style("stroke", "#546f6f");

			meanGroupEnter
				.append("text")
				.attr("class", "pbigammeanGroupTextBack")
				.attr("x", 3)
				.attr("y", yScale.step() / 2 - 6)
				.text(function (d) {
					return (
						"mean: " +
						(chartState.allocationValue === "allocations"
							? formatSIFloat(d.mean)
							: formatPercent(d.mean))
					);
				});

			meanGroupEnter
				.append("text")
				.attr("class", "pbigammeanGroupText")
				.attr("x", 3)
				.attr("y", yScale.step() / 2 - 6)
				.text(function (d) {
					return (
						"mean: " +
						(chartState.allocationValue === "allocations"
							? formatSIFloat(d.mean)
							: formatPercent(d.mean))
					);
				});

			meanGroup = meanGroupEnter.merge(meanGroup);

			meanGroup.raise();

			meanGroup
				.style(
					"opacity",
					chartState.showMean &&
						chartState.allocationValue === "allocations"
						? 1
						: 0
				)
				.transition()
				.duration(duration)
				.attr("transform", function (d) {
					return (
						"translate(" +
						xScale(d.mean) +
						"," +
						yScale(d.gamCode) +
						")"
					);
				});

			meanGroup.select(".pbigammeanGroupTextBack").text(function (d) {
				return (
					"mean: " +
					(chartState.allocationValue === "allocations"
						? formatSIFloat(d.mean)
						: formatPercent(d.mean))
				);
			});

			meanGroup.select(".pbigammeanGroupText").text(function (d) {
				return (
					"mean: " +
					(chartState.allocationValue === "allocations"
						? formatSIFloat(d.mean)
						: formatPercent(d.mean))
				);
			});

			function mouseOverBeeswarm(d) {
				currentHoveredElem = this;

				const tooltipRightPadding =
					chartState.allocationValue === "allocations" ? 36 : 24;

				totalLabel.style("opacity", fadeOpacity);
				totalValues.style("opacity", fadeOpacity);

				const labelsData = JSON.parse(
					JSON.stringify(
						data.filter(function (e) {
							return chartState.display === "aggregated" ||
								chartState.allocationValue === "percentageGam"
								? e.cbpfId === d.cbpfId &&
										e.gamCode === d.gamCode
								: e.cbpfId === d.cbpfId;
						})
					)
				);

				const beeswarmLabelBack = beeswarmPanel.main
					.selectAll(null)
					.data(labelsData)
					.enter()
					.append("text")
					.attr("class", "pbigambeeswarmLabelBack")
					.attr("x", function (d) {
						return d.x + radiusScale(d.projects) + 2;
					})
					.attr("y", function (d) {
						return d.y + 3;
					})
					.text(function (d) {
						return chartState.allocationValue === "allocations"
							? formatSIFloat(d.allocations)
							: formatPercent(d[chartState.allocationValue]);
					});

				const beeswarmLabel = beeswarmPanel.main
					.selectAll(null)
					.data(labelsData)
					.enter()
					.append("text")
					.attr("class", "pbigambeeswarmLabel")
					.attr("x", function (d) {
						return d.x + radiusScale(d.projects) + 2;
					})
					.attr("y", function (d) {
						return d.y + 3;
					})
					.text(function (d) {
						return chartState.allocationValue === "allocations"
							? formatSIFloat(d.allocations)
							: formatPercent(d[chartState.allocationValue]);
					});

				beeswarm.style("opacity", function (e) {
					if (chartState.allocationValue !== "percentageGam") {
						if (chartState.display === "aggregated") {
							return e.cbpfId === d.cbpfId &&
								e.gamCode === d.gamCode
								? 1
								: fadeOpacity;
						} else {
							return e.cbpfId === d.cbpfId ? 1 : fadeOpacity;
						}
					} else {
						return this === currentHoveredElem ? 1 : fadeOpacity;
					}
				});

				tooltip.style("display", "block").html(null);

				const tooltipContainer = tooltip
					.append("div")
					.style("display", "flex")
					.style("align-items", "center")
					.style(
						"width",
						beeswarmPanel.width * tooltipWidthFactor + "px"
					)
					.style("height", tooltipHeight + "px");

				const leftDiv = tooltipContainer
					.append("div")
					.style("padding", "5px")
					.style("line-height", 1)
					.style("display", "flex")
					.style("justify-content", "center")
					.style("align-items", "center")
					.style("height", "100%")
					.style("border-right", "1px solid #ddd")
					.style("flex", "0 18%");

				const middleDiv = tooltipContainer
					.append("div")
					.style("padding", "5px")
					.style("font-size", "12px")
					.style("height", "100%")
					.style("border-right", "1px solid #ddd")
					.style("flex", "0 42%")
					.style("display", "flex")
					.style("justify-content", "center")
					.style("align-items", "center")
					.append("div");

				const rightDiv = tooltipContainer
					.append("div")
					.style("padding", "5px")
					.style("font-size", "11px")
					.style("height", "100%")
					.style("display", "flex")
					.style("justify-content", "center")
					.style("align-items", "center")
					.style("flex", "0 40%");

				const cbpf = leftDiv
					.append("div")
					.classed("contributionColorHTMLcolor", true)
					.style("font-size", "13px")
					.style("font-weight", 700)
					.style("text-align", "center")
					.html(d.cbpfName);

				const gamMarker = middleDiv
					.append("div")
					.html(
						(chartState.gamGroup === "GM"
							? "&bull; Gender Marker: "
							: "&bull; Gender and Age Marker: ") + d.gamCode
					);

				const projects = middleDiv
					.append("div")
					.html("&bull; Number of projects: " + d.projects);

				const allocations = middleDiv
					.append("div")
					.html("&bull; Allocations: ")
					.append("span")
					.attr("class", "contributionColorHTMLcolor")
					.style("font-weight", 700)
					.html("$" + formatMoney0Decimals(d.allocations));

				const percentages = rightDiv
					.append("div")
					.style("line-height", "110%")
					.html(
						"(these allocations correspond to <span class='contributionColorHTMLcolor'><strong>" +
							formatPercent1Decimal(d.percentageCbpf) +
							"</strong></span> of the total allocations in " +
							d.cbpfName +
							" and to <span class='contributionColorHTMLcolor'><strong>" +
							formatPercent1Decimal(d.percentageGam) +
							"</strong></span> of all CBPF allocations with Marker " +
							d.gamCode +
							")"
					);

				const containerBoundingRect = containerDiv
					.node()
					.getBoundingClientRect();

				const thisBoundingRect = this.getBoundingClientRect();

				const tooltipBoundingRect = tooltip
					.node()
					.getBoundingClientRect();

				const thisTick = yAxisGroup
					.selectAll(".tick line")
					.filter(function (e) {
						return (
							e ===
							(chartState.display === "aggregated"
								? "aggregated"
								: d.gamCode)
						);
					});

				const thisTickBoundingRect = thisTick
					.node()
					.getBoundingClientRect();

				tooltip
					.style(
						"top",
						thisTickBoundingRect.top -
							containerBoundingRect.top -
							tooltipBoundingRect.height / 2 +
							"px"
					)
					.style(
						"left",
						containerBoundingRect.right -
							thisBoundingRect.right -
							tooltipRightPadding <
							tooltipBoundingRect.width
							? thisBoundingRect.left -
									tooltipBoundingRect.width -
									containerBoundingRect.left -
									4 +
									"px"
							: thisBoundingRect.right +
									tooltipRightPadding -
									containerBoundingRect.left +
									"px"
					);

				//end of mouseOverBeeswarm
			}

			//end of createBeeswarm
		}

		function createLegend(data) {
			const legendSizeTitle = legendPanel.main
				.selectAll(".pbigamlegendSizeTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("text-anchor", "end")
				.attr("class", "pbigamlegendSizeTitle")
				.attr("y", legendPanel.height / 2 - 3)
				.attr("x", beeswarmPanel.padding[3] - 10)
				.text("Size:")
				.append("tspan")
				.attr("dy", "1em")
				.attr("x", beeswarmPanel.padding[3] - 10)
				.attr("class", "pbigamsizeTitleSpan")
				.text("(# of projects per CBPF)");

			const projectsMaxValue = d3.max(data, function (d) {
				return d.projects;
			});

			const legendSizeData = [
				projectsMaxValue,
				projectsMaxValue / Math.PI,
				1,
			];

			const legendSizeCircles = legendPanel.main
				.selectAll(".pbigamlegendSizeCircles")
				.data(legendSizeData)
				.enter()
				.append("circle")
				.attr("class", "pbigamlegendSizeCircles")
				.attr("cx", beeswarmPanel.padding[3] + maxRadius)
				.attr("cy", function (d) {
					return legendPanel.height - 2 - radiusScale(d);
				})
				.attr("r", function (d) {
					return radiusScale(d);
				})
				.style("fill", "none")
				.style("stroke", "#ccc")
				.style("stroke-width", "0.5px");

			const legendSizeLines = legendPanel.main
				.selectAll(".pbigamlegendSizeLines")
				.data(legendSizeData)
				.enter()
				.append("line")
				.attr("class", "pbigamlegendSizeLines")
				.attr("x1", beeswarmPanel.padding[3] + maxRadius)
				.attr(
					"x2",
					beeswarmPanel.padding[3] + maxRadius + legendSizeLine
				)
				.attr("y1", function (d) {
					return legendPanel.height - 2 - radiusScale(d) * 2;
				})
				.attr("y2", function (d) {
					return legendPanel.height - 2 - radiusScale(d) * 2;
				})
				.style("fill", "none")
				.style("stroke", "#999")
				.style("stroke-dasharray", "1, 1")
				.style("stroke-width", "0.5px");

			let legendSizeLabels = legendPanel.main
				.selectAll(".pbigamlegendSizeLabels")
				.data(legendSizeData);

			legendSizeLabels = legendSizeLabels
				.enter()
				.append("text")
				.attr("class", "pbigamlegendSizeLabels")
				.attr(
					"x",
					beeswarmPanel.padding[3] + maxRadius + legendSizeLine + 2
				)
				.attr("y", function (d) {
					return legendPanel.height + 1 - radiusScale(d) * 2;
				})
				.merge(legendSizeLabels);

			legendSizeLabels
				.transition()
				.duration(duration)
				.tween("text", function (d) {
					const node = this;
					const i = d3.interpolate(localVariable.get(this) || 0, d);
					return function (t) {
						node.textContent = ~~i(t);
					};
				})
				.on("end", function (d) {
					localVariable.set(this, d);
				});

			const legendColorTitle = legendPanel.main
				.selectAll(".pbigamlegendColorTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbigamlegendColorTitle")
				.style("opacity", chartState.display === "aggregated" ? 1 : 0)
				.attr("text-anchor", "end")
				.attr("y", legendPanel.height / 2 - 3)
				.attr("x", beeswarmPanel.padding[3] + legendColorPadding)
				.text("Color:")
				.append("tspan")
				.attr("x", beeswarmPanel.padding[3] + legendColorPadding)
				.attr("dy", "1em")
				.attr("class", "pbigamcolorTitleSpan")
				.text(" (marker code)");

			legendPanel.main
				.select(".pbigamlegendColorTitle")
				.transition()
				.duration(duration)
				.style("opacity", chartState.display === "aggregated" ? 1 : 0);

			const legendColorData =
				chartState.display !== "aggregated"
					? []
					: chartState.gamGroup === "GM"
					? gmDomain
					: gamDomain;

			let legendColorGroup = legendPanel.main
				.selectAll(".pbigamlegendColorGroup")
				.data(legendColorData);

			const legendColorGroupExit = legendColorGroup
				.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const legendColorGroupEnter = legendColorGroup
				.enter()
				.append("g")
				.attr("class", "pbigamlegendColorGroup")
				.attr("transform", function (_, i) {
					return (
						"translate(" +
						(beeswarmPanel.padding[3] +
							legendColorPadding +
							8 +
							i * 38) +
						",0)"
					);
				});

			legendColorGroupEnter
				.append("rect")
				.attr("y", 15)
				.attr("width", buttonsLegendRectSize)
				.attr("height", buttonsLegendRectSize)
				.attr("rx", 2)
				.attr("ry", 2)
				.style("fill", function (d) {
					return colorsScale(d);
				});

			legendColorGroupEnter
				.append("text")
				.attr("y", 25)
				.attr("x", buttonsLegendRectSize + 3)
				.text(function (d) {
					return chartState.gamGroup === "GM" && d === "3"
						? "3/4"
						: d;
				});

			legendColorGroup = legendColorGroupEnter.merge(legendColorGroup);

			legendColorGroup.select("rect").style("fill", function (d) {
				return colorsScale(d);
			});

			legendColorGroup.select("text").text(function (d) {
				return chartState.gamGroup === "GM" && d === "3" ? "3/4" : d;
			});

			legendColorGroup
				.on("mouseover", function (d) {
					beeswarmPanel.main
						.selectAll(".pbigambeeswarm")
						.style("opacity", function (e) {
							return e.gamCode === d ? 1 : fadeOpacity;
						});
				})
				.on("mouseout", function () {
					beeswarmPanel.main
						.selectAll(".pbigambeeswarm")
						.style("opacity", 1);
				});

			let showMeanGroup = legendPanel.main
				.selectAll(".pbigamshowMeanGroup")
				.data([
					{
						clicked: chartState.showMean,
					},
				]);

			const showMeanGroupEnter = showMeanGroup
				.enter()
				.append("g")
				.attr("class", "pbigamshowMeanGroup")
				.attr("cursor", "pointer")
				.attr(
					"transform",
					"translate(" +
						(legendPanel.width - showMeanPadding) +
						"," +
						(legendPanel.height / 2 - 1) +
						")"
				);

			showMeanGroupEnter
				.append("rect")
				.attr("width", 12)
				.attr("height", 12)
				.attr("rx", 2)
				.attr("ry", 2)
				.attr("x", -6)
				.attr("y", -5)
				.attr("fill", "white")
				.attr("stroke", "darkslategray");

			showMeanGroupEnter
				.append("polyline")
				.style("stroke-width", "2px")
				.attr("points", "-4,1 -1,4 4,-3")
				.style("fill", "none")
				.style(
					"stroke",
					chartState.showMean ? "darkslategray" : "white"
				);

			showMeanGroupEnter
				.append("text")
				.attr("class", "pbigamshowMeanText")
				.attr("x", 10)
				.attr("y", 5);

			showMeanGroup = showMeanGroupEnter.merge(showMeanGroup);

			showMeanGroup
				.style(
					"opacity",
					chartState.allocationValue === "allocations" ? 1 : 0
				)
				.style(
					"pointer-events",
					chartState.allocationValue === "allocations"
						? "all"
						: "none"
				);

			showMeanGroup
				.select("text")
				.text(
					"Show " +
						(chartState.display === "aggregated" ? "mean" : "means")
				);

			showMeanGroup.on("click", function (d) {
				chartState.showMean = d.clicked = !d.clicked;
				showMeanGroup
					.select("polyline")
					.style(
						"stroke",
						chartState.showMean ? "darkslategray" : "white"
					);
				beeswarmPanel.main
					.selectAll(".pbigammeanGroup")
					.style("opacity", chartState.showMean ? 1 : 0);

				if (queryStringValues.has("showmean")) {
					queryStringValues.set("showmean", chartState.showMean);
				} else {
					queryStringValues.append("showmean", chartState.showMean);
				}
			});

			//end of createLegend
		}

		function resizeSVG() {
			const numberOfGroups =
				chartState.display === "aggregated"
					? aggregatedDomain.length
					: chartState.gamGroup === "GM"
					? gmDomain.length
					: gamDomain.length;

			const newBeeswarmGroupHeight =
				chartState.display === "aggregated"
					? beeswarmGroupHeight * 1.5
					: beeswarmGroupHeight;

			beeswarmPanel.height =
				beeswarmPanel.padding[0] +
				beeswarmPanel.padding[2] +
				numberOfGroups * newBeeswarmGroupHeight;

			height =
				padding[0] +
				padding[2] +
				topPanel.height +
				buttonsPanel.height +
				beeswarmPanel.height +
				legendPanel.height +
				3 * panelHorizontalPadding;

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			}

			if (isInternetExplorer) {
				svg.transition()
					.duration(firstTime ? 1 : duration)
					.attr("viewBox", "0 0 " + width + " " + height)
					.attr("height", height);
			} else {
				svg.transition()
					.duration(firstTime ? 1 : duration)
					.attr("viewBox", "0 0 " + width + " " + height);
			}

			legendPanel.main
				.transition()
				.duration(firstTime ? 1 : duration)
				.attr(
					"transform",
					"translate(" +
						padding[3] +
						"," +
						(padding[0] +
							topPanel.height +
							buttonsPanel.height +
							beeswarmPanel.height +
							3 * panelHorizontalPadding) +
						")"
				);

			firstTime = false;

			//end of resizeSVG
		}

		function setScales() {
			colorsScale.domain(
				chartState.gamGroup === "GM" ? gmDomain : gamDomain
			);

			yScale
				.domain(
					chartState.display === "aggregated"
						? aggregatedDomain
						: chartState.gamGroup === "GM"
						? gmDomain
						: gamDomain
				)
				.range([
					beeswarmPanel.padding[0],
					beeswarmPanel.height - beeswarmPanel.padding[2],
				]);
		}

		function processRawData(rawData, metaData) {
			metaData.forEach(function (d) {
				d.GenderMarkerCode = d.GenderMarkerCode + "";
				gamDescriptions.push({
					gamGroup: d.GenderMarkerGroup,
					gamCode: d.GenderMarkerCode + "",
					gamFullDescription: d.GenderMarkerDescription,
					gamDescription:
						d.GenderMarkerDescription.split("-")[1].trim(),
				});
			});

			rawData.forEach(function (row) {
				row.GenderMarkerCode = row.GenderMarkerCode + "";
				if (!cbpfsList["id" + row.PooledFundId]) {
					cbpfsList["id" + row.PooledFundId] = row.PooledFundName;
				}

				const foundYearAndGamGroup = yearsArray.find(function (d) {
					return (
						d.year === +row.AllocationYear &&
						d.gamGroup === row.GenderMarkerGroup
					);
				});

				if (!foundYearAndGamGroup)
					yearsArray.push({
						year: +row.AllocationYear,
						gamGroup: row.GenderMarkerGroup,
					});
			});

			yearsArray.sort(function (a, b) {
				return (
					a.year - b.year ||
					(a.gamGroup === gamGroupsArray[0] ? -1 : 1)
				);
			});

			const firstGamIndex = yearsArray
				.map(function (d) {
					return d.gamGroup;
				})
				.indexOf("GAM");

			yearsArray.splice(firstGamIndex, 0, {
				year: "gap",
				gamGroup: "gap",
			});

			//end of processRawData
		}

		function processData(rawData, rawLaunchedAllocationsData) {
			topValuesLaunchedData.launched = 0;
			topValuesLaunchedData.underApproval = 0;

			for (const key in yearsWithUnderApprovalAboveMin)
				delete yearsWithUnderApprovalAboveMin[key];

			const allCbpfsSelected =
				chartState.selectedCbpfs.length === d3.keys(cbpfsList).length;

			rawLaunchedAllocationsData.forEach(function (row) {
				if (
					chartState.selectedYear.includes(row.AllocationYear) &&
					(allCbpfsSelected ||
						chartState.selectedCbpfs.includes(
							"id" + row.PooledFundId
						))
				) {
					yearsWithUnderApprovalAboveMin[row.AllocationYear] =
						(yearsWithUnderApprovalAboveMin[row.AllocationYear] ||
							0) + row.TotalUnderApprovalBudget;
					topValuesLaunchedData.launched += row.TotalUSDPlanned;
					topValuesLaunchedData.underApproval +=
						row.TotalUnderApprovalBudget;
				}
			});

			for (const year in yearsWithUnderApprovalAboveMin) {
				yearsWithUnderApprovalAboveMin[year] =
					yearsWithUnderApprovalAboveMin[year] >
					minimumUnderApprovalValue;
			}

			const data = [];

			const gamCounter = gamDescriptions
				.filter(function (d) {
					return d.gamGroup === chartState.gamGroup;
				})
				.map(function (d) {
					return {
						gamCode: d.gamCode,
						total: 0,
					};
				});

			const cbpfsCounter = d3.keys(cbpfsList).map(function (d) {
				return {
					cbpfId: d,
					total: 0,
				};
			});

			chartState.cbpfsInData.length = 0;

			rawData.forEach(function (row) {
				if (
					chartState.selectedYear.indexOf(+row.AllocationYear) > -1 &&
					chartState.gamGroup === row.GenderMarkerGroup &&
					chartState.cbpfsInData.indexOf("id" + row.PooledFundId) ===
						-1
				) {
					chartState.cbpfsInData.push("id" + row.PooledFundId);
				}

				if (
					chartState.selectedYear.indexOf(+row.AllocationYear) > -1 &&
					chartState.selectedCbpfs.indexOf("id" + row.PooledFundId) >
						-1 &&
					chartState.gamGroup === row.GenderMarkerGroup
				) {
					const foundCbpf = data.find(function (d) {
						return (
							d.cbpfId === "id" + row.PooledFundId &&
							d.gamCode === row.GenderMarkerCode &&
							d.keygamGroup === row.GenderMarkerGroup
						);
					});

					if (foundCbpf) {
						foundCbpf.projects += +row.TotalProjects;
						foundCbpf.beneficiaries += +row.TotalBeneficiaries;
						foundCbpf.allocations += +row.TotalBudget;
					} else {
						data.push({
							cbpfName: row.PooledFundName,
							cbpfId: "id" + row.PooledFundId,
							gamCode: row.GenderMarkerCode,
							projects: +row.TotalProjects,
							beneficiaries: +row.TotalBeneficiaries,
							allocations: +row.TotalBudget,
							keygamGroup: row.GenderMarkerGroup,
						});
					}

					const foundGamCounter = gamCounter.find(function (d) {
						return d.gamCode === row.GenderMarkerCode;
					});
					if (foundGamCounter)
						foundGamCounter.total += +row.TotalBudget;
					const foundCbpfsCounter = cbpfsCounter.find(function (d) {
						return d.cbpfId === "id" + row.PooledFundId;
					});
					if (foundCbpfsCounter)
						foundCbpfsCounter.total += +row.TotalBudget;
				}
			});

			if (chartState.gamGroup === "GM") {
				const foundCode3 = gamCounter.find(function (d) {
					return d.gamCode === "3";
				});
				const foundCode4 = gamCounter.find(function (d) {
					return d.gamCode === "4";
				});
				const summedUpValue = foundCode3.total + foundCode4.total;
				foundCode3.total = summedUpValue;
				foundCode4.total = summedUpValue;
			}

			data.forEach(function (row) {
				thisGamTotal = gamCounter.find(function (d) {
					return d.gamCode === row.gamCode;
				});
				thisCbpfTotal = cbpfsCounter.find(function (d) {
					return d.cbpfId === row.cbpfId;
				});
				row.percentageGam =
					thisGamTotal && thisGamTotal.total
						? row.allocations / thisGamTotal.total
						: 0;
				row.percentageCbpf =
					thisCbpfTotal && thisCbpfTotal.total
						? row.allocations / thisCbpfTotal.total
						: 0;
			});

			return data;

			//end of processData
		}

		function createCsv(rawData) {
			const filteredData = JSON.parse(
				JSON.stringify(
					rawData.filter(function (row) {
						return (
							chartState.selectedYear.indexOf(
								+row.AllocationYear
							) > -1 &&
							chartState.selectedCbpfs.indexOf(
								"id" + row.PooledFundId
							) > -1 &&
							chartState.gamGroup === row.GenderMarkerGroup
						);
					})
				)
			);

			const csv = d3.csvFormat(filteredData);

			return csv;
		}

		function validateYear(yearString) {
			const allYears = yearString
				.split(",")
				.map(function (d) {
					return +d.trim();
				})
				.filter(function (d) {
					return (
						d &&
						yearsArray.find(function (e) {
							return e.year === d;
						})
					);
				})
				.sort(function (a, b) {
					return a - b;
				});

			const gamGroups = [];

			allYears.forEach(function (d) {
				if (d !== yearWithMixedGroups) {
					const yearGroup = yearsArray.find(function (e) {
						return e.year === d;
					}).gamGroup;
					if (gamGroups.indexOf(yearGroup) === -1)
						gamGroups.push(yearGroup);
				}
			});

			if (gamGroups.length > 1) {
				chartState.selectedYear.push(
					yearsArray[yearsArray.length - 1].year
				);
			} else {
				allYears.forEach(function (d) {
					chartState.selectedYear.push(d);
				});
			}

			if (!chartState.selectedYear.length)
				chartState.selectedYear.push(
					yearsArray[yearsArray.length - 1].year
				);
		}

		function validateCustomEventYear(yearNumber) {
			if (yearNumber === yearWithMixedGroups) {
				return {
					year: yearNumber,
					gamGroup: "GAM",
				};
			}
			let foundYear;
			foundYear = yearsArray.find(function (d) {
				return d.year === yearNumber;
			});
			while (!foundYear) {
				yearNumber =
					yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
				foundYear = yearsArray.find(function (d) {
					return d.year === yearNumber;
				});
			}
			return foundYear;
		}

		function populateSelectedCbpfs(cbpfsString) {
			const cbpfs = [];

			const dataArray = cbpfsString.split(",").map(function (d) {
				return d.trim().toLowerCase();
			});

			const someInvalidValue = dataArray.some(function (d) {
				return (
					valuesInLowerCase(d3.values(cbpfsList)).indexOf(d) === -1
				);
			});

			if (someInvalidValue) return d3.keys(cbpfsList);

			dataArray.forEach(function (d) {
				for (var key in cbpfsList) {
					if (cbpfsList[key].toLowerCase() === d) cbpfs.push(key);
				}
			});

			return cbpfs;
		}

		function valuesInLowerCase(map) {
			const values = [];
			for (let key in map) values.push(map[key].toLowerCase());
			return values;
		}

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			const result = d3
				.formatPrefix(
					"." + digits + "~",
					value
				)(value)
				.replace("G", "B");
			if (parseInt(result) === 1000) {
				const lastDigit = result[result.length - 1];
				const units = { k: "M", M: "B" };
				return 1 + (isNaN(lastDigit) ? units[lastDigit] : "");
			}
			return result;
		}

		function parseTransform(translate) {
			const group = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"g"
			);
			group.setAttributeNS(null, "transform", translate);
			const matrix = group.transform.baseVal.consolidate().matrix;
			return [matrix.e, matrix.f];
		}

		function setYearsDescriptionDiv() {
			yearsDescriptionDiv.html(function () {
				if (
					chartState.selectedYear.length === 1 &&
					chartState.selectedYear[0] !== yearWithMixedGroups
				)
					return null;
				if (
					chartState.selectedYear.length === 1 &&
					chartState.selectedYear[0] === yearWithMixedGroups &&
					chartState.gamGroup === "GAM"
				)
					return (
						"\u002AAllocations in " +
						yearWithMixedGroups +
						" with the new Gender and Age Marker (GAM)"
					);
				if (
					chartState.selectedYear.length === 1 &&
					chartState.selectedYear[0] === yearWithMixedGroups &&
					chartState.gamGroup === "GM"
				)
					return (
						"\u002AAllocations in " +
						yearWithMixedGroups +
						" with the old Gender Marker (GM)"
					);
				const yearsList = chartState.selectedYear
					.sort(function (a, b) {
						return a - b;
					})
					.reduce(function (acc, curr, index) {
						return (
							acc +
							(index >= chartState.selectedYear.length - 2
								? index > chartState.selectedYear.length - 2
									? curr
									: curr + " and "
								: curr + ", ")
						);
					}, "");
				return "\u002ASelected years: " + yearsList;
			});
		}

		function createAnnotationsDiv() {
			iconsDiv.style("opacity", 0).style("pointer-events", "none");

			iconsDiv.style("opacity", 0).style("pointer-events", "none");

			const overDiv = containerDiv
				.append("div")
				.attr("class", "pbigamOverDivHelp");

			const selectTitleDivSize = selectTitleDiv
				.node()
				.getBoundingClientRect();

			const titleStyle = window.getComputedStyle(selectTitleDiv.node());

			const selectDivSize = selectDiv.node().getBoundingClientRect();

			const topDivSize = topDiv.node().getBoundingClientRect();

			const iconsDivSize = iconsDiv.node().getBoundingClientRect();

			const topDivHeight = topDivSize.height * (width / topDivSize.width);

			const totalSelectHeight =
				(selectTitleDivSize.height +
					selectDivSize.height +
					parseInt(titleStyle["margin-top"]) +
					parseInt(titleStyle["margin-bottom"])) *
				(width / topDivSize.width);

			const helpSVG = overDiv
				.append("svg")
				.attr(
					"viewBox",
					"0 0 " +
						width +
						" " +
						(height + topDivHeight + totalSelectHeight)
				);

			const helpButtons = [
				{
					text: "CLOSE",
					width: 90,
				},
				{
					text: "GO TO HELP PORTAL",
					width: 180,
				},
			];

			const closeRects = helpSVG
				.selectAll(null)
				.data(helpButtons)
				.enter()
				.append("g");

			closeRects
				.append("rect")
				.attr("rx", 4)
				.attr("ry", 4)
				.style("stroke", "rgba(0, 0, 0, 0.3)")
				.style("stroke-width", "1px")
				.style("fill", highlightColor)
				.style("cursor", "pointer")
				.attr("y", 6)
				.attr("height", 22)
				.attr("width", function (d) {
					return d.width;
				})
				.attr("x", function (d, i) {
					return (
						width -
						padding[1] -
						d.width -
						(i ? helpButtons[0].width + 8 : 0)
					);
				})
				.on("click", function (_, i) {
					iconsDiv.style("opacity", 1).style("pointer-events", "all");
					overDiv.remove();
					if (i) window.open(helpPortalUrl, "help_portal");
				});

			closeRects
				.append("text")
				.attr("class", "pbigamAnnotationMainText")
				.attr("text-anchor", "middle")
				.attr("x", function (d, i) {
					return (
						width -
						padding[1] -
						d.width / 2 -
						(i ? helpButtons[0].width + 8 : 0)
					);
				})
				.attr("y", 22)
				.text(function (d) {
					return d.text;
				});

			const helpData = [
				{
					x: 8,
					y:
						topDivHeight +
						(totalSelectHeight - selectDivSize.height) *
							(topDivSize.width / width),
					width: width - 28,
					height: selectDivSize.height * (width / topDivSize.width),
					xTooltip: 300 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 8) *
						(topDivSize.width / width),
					text: "Use these checkboxes to select the CBPF. A disabled checkbox means that the correspondent CBPF has no data for that year.",
				},
				{
					x: 6,
					y: 70 + topDivHeight + totalSelectHeight,
					width: 346,
					height: 30,
					xTooltip: 38 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 106) *
						(topDivSize.width / width),
					text: "Use these buttons to select the year. You can select more than one year, as long as they belong to the same Marker system. Double click or press ALT when clicking to select just a single year. Click the arrows to reveal more years. If you select a year that belongs to a different Marker system, that year will be selected as a single year.",
				},
				{
					x: 368,
					y: 70 + topDivHeight + totalSelectHeight,
					width: 323,
					height: 30,
					xTooltip: 382 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 106) *
						(topDivSize.width / width),
					text: "Use these buttons to change how the circles are distributed along the x axis. Each circle represents a given CBPF/Marker combination. “Budget” shows the allocation values, in dollars. “Budget % of per Marker” will show that value as a percentage of the total for the same Marker, which is adequate for comparing CBPFs in the same Marker. ““Budget % of per CBPF” will show that value as a percentage of the total for that CBPF, which is adequate for comparing Markers in the same CBPF.",
				},
				{
					x: 698,
					y: 70 + topDivHeight + totalSelectHeight,
					width: 196,
					height: 30,
					xTooltip: 650 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 106) *
						(topDivSize.width / width),
					text: "Use these buttons to aggregate all Markers in a single row or to separate the CBPF/Marker combination by Marker.",
				},
				{
					x: 190,
					y: 186 + topDivHeight + totalSelectHeight,
					width: 700,
					height: 370,
					xTooltip: 380 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 112) *
						(topDivSize.width / width),
					text: "Hover over the circles to get additional information. The tooltip will show up below the chart, over the legend area.",
				},
			];

			helpData.forEach(function (d) {
				helpSVG
					.append("rect")
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
					.attr("class", "pbigamHelpRectangle")
					.attr("pointer-events", "all")
					.on("mouseover", function () {
						const self = this;
						createTooltip(d.xTooltip, d.yTooltip, d.text, self);
					})
					.on("mouseout", removeTooltip);
			});

			const explanationTextRect = helpSVG
				.append("rect")
				.attr("x", width / 2 - 180)
				.attr("y", 120 + topDivHeight + totalSelectHeight)
				.attr("width", 360)
				.attr("height", 50)
				.attr("pointer-events", "none")
				.style("fill", "white")
				.style("stroke", "#888");

			const explanationText = helpSVG
				.append("text")
				.attr("class", "pbigamAnnotationExplanationText")
				.attr("font-family", "Roboto")
				.attr("font-size", "18px")
				.style("fill", "#222")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 140 + topDivHeight + totalSelectHeight)
				.attr("pointer-events", "none")
				.text(
					"Hover over the elements surrounded by a blue rectangle to get additional information"
				)
				.call(wrapText, 350);

			function createTooltip(xPos, yPos, text, self) {
				explanationText.style("opacity", 0);
				explanationTextRect.style("opacity", 0);
				helpSVG.selectAll(".pbigamHelpRectangle").style("opacity", 0.1);
				d3.select(self).style("opacity", 1);
				const containerBox = containerDiv
					.node()
					.getBoundingClientRect();
				tooltip
					.style("top", yPos + "px")
					.style("left", xPos + "px")
					.style("display", "block");
				const innerTooltip = tooltip
					.append("div")
					.style("width", "280px")
					.html(text);
			}

			function removeTooltip() {
				tooltip.style("display", "none").html(null);
				explanationText.style("opacity", 1);
				explanationTextRect.style("opacity", 1);
				helpSVG.selectAll(".pbigamHelpRectangle").style("opacity", 0.5);
			}

			//end of createAnnotationsDiv
		}

		function wrapText(text, width) {
			text.each(function () {
				let text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.1,
					y = text.attr("y"),
					x = text.attr("x"),
					dy = 0,
					tspan = text
						.text(null)
						.append("tspan")
						.attr("x", x)
						.attr("y", y)
						.attr("dy", dy + "em");
				while ((word = words.pop())) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text
							.append("tspan")
							.attr("x", x)
							.attr("y", y)
							.attr("dy", ++lineNumber * lineHeight + dy + "em")
							.text(word);
					}
				}
			});
		}

		function createFooterDiv() {
			let footerText = "© OCHA CBPF Section " + currentYear;

			const footerLink =
				" | For more information, please visit <a href='https://cbpf.data.unocha.org'>cbpf.data.unocha.org</a>";

			if (showLink) footerText += footerLink;

			footerDiv
				.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText);

			//end of createFooterDiv
		}

		function createSnapshot(type, fromContextMenu) {
			if (isInternetExplorer) {
				alert(
					"This functionality is not supported by Internet Explorer"
				);
				return;
			}

			const downloadingDiv = d3
				.select("body")
				.append("div")
				.style("position", "fixed")
				.attr("id", "pbigamDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv
				.append("svg")
				.attr("class", "pbigamDownloadingDivSvg")
				.attr("width", 200)
				.attr("height", 100);

			const downloadingDivText = "Downloading " + type.toUpperCase();

			createProgressWheel(
				downloadingDivSvg,
				200,
				175,
				downloadingDivText
			);

			const svgRealSize = svg.node().getBoundingClientRect();

			svg.attr("width", svgRealSize.width).attr(
				"height",
				svgRealSize.height
			);

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
				"white-space",
			];

			const imageDiv = containerDiv.node();

			setSvgStyles(svg.node());

			if (type === "png") {
				iconsDiv.style("opacity", 0);
			} else {
				topDiv.style("opacity", 0);
			}

			snapshotTooltip.style("display", "none");

			html2canvas(imageDiv).then(function (canvas) {
				svg.attr("width", null).attr("height", null);

				if (type === "png") {
					iconsDiv.style("opacity", 1);
				} else {
					topDiv.style("opacity", 1);
				}

				if (type === "png") {
					downloadSnapshotPng(canvas);
				} else {
					downloadSnapshotPdf(canvas);
				}

				if (fromContextMenu && currentHoveredElem)
					d3.select(currentHoveredElem).dispatch("mouseout");
			});

			function setSvgStyles(node) {
				if (!node.style) return;

				let styles = getComputedStyle(node);

				for (let i = 0; i < listOfStyles.length; i++) {
					node.style[listOfStyles[i]] = styles[listOfStyles[i]];
				}

				for (let i = 0; i < node.childNodes.length; i++) {
					setSvgStyles(node.childNodes[i]);
				}
			}

			//end of createSnapshot
		}

		function downloadSnapshotPng(source) {
			const currentDate = new Date();

			const fileName =
				"GenderAgeMarker_" + csvDateFormat(currentDate) + ".png";

			source.toBlob(function (blob) {
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
				}
			});

			removeProgressWheel();

			d3.select("#pbigamDownloadingDiv").remove();
		}

		function downloadSnapshotPdf(source) {
			const pdfMargins = {
				top: 10,
				bottom: 16,
				left: 20,
				right: 30,
			};

			d3.image(
				"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/bilogo.png"
			).then(function (logo) {
				let pdf;

				const point = 2.834646;

				const sourceDimentions = containerDiv
					.node()
					.getBoundingClientRect();
				const widthInMilimeters = 210 - pdfMargins.left * 2;
				const heightInMilimeters =
					widthInMilimeters *
					(sourceDimentions.height / sourceDimentions.width);
				const maxHeightInMilimeters = 180;
				let pdfHeight;

				if (heightInMilimeters > maxHeightInMilimeters) {
					pdfHeight =
						297 + heightInMilimeters - maxHeightInMilimeters;
					pdf = new jsPDF({
						format: [210 * point, pdfHeight * point],
						unit: "mm",
					});
				} else {
					pdfHeight = 297;
					pdf = new jsPDF();
				}

				let pdfTextPosition;

				createLetterhead();

				const intro = pdf.splitTextToSize(
					"",
					210 - pdfMargins.left - pdfMargins.right,
					{
						fontSize: 12,
					}
				);

				const fullDate = d3.timeFormat("%A, %d %B %Y")(new Date());

				pdf.setTextColor(60);
				pdf.setFont("helvetica");
				pdf.setFontType("normal");
				pdf.setFontSize(12);
				pdf.text(pdfMargins.left, 48, intro);

				pdf.setTextColor(65, 143, 222);
				pdf.setFont("helvetica");
				pdf.setFontType("bold");
				pdf.setFontSize(16);
				pdf.text(chartTitle, pdfMargins.left, 65);

				pdf.setFontSize(12);

				const yearsList = chartState.selectedYear
					.sort(function (a, b) {
						return a - b;
					})
					.reduce(function (acc, curr, index) {
						return (
							acc +
							(index >= chartState.selectedYear.length - 2
								? index > chartState.selectedYear.length - 2
									? curr
									: curr + " and "
								: curr + ", ")
						);
					}, "");

				const yearsText =
					chartState.selectedYear.length > 1
						? "Selected years: "
						: "Selected year: ";

				const selectedCountry =
					chartState.selectedCbpfs.length ===
					d3.keys(cbpfsList).length
						? "Selected CBPFs-All"
						: countriesList();

				pdf.fromHTML(
					"<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate +
						"</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" +
						yearsText +
						"<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsList +
						"</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Marker System: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						(chartState.gamGroup === "GM"
							? "Gender Marker"
							: "Gender and Age Marker") +
						"</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" +
						selectedCountry.split("-")[0] +
						": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						selectedCountry.split("-")[1] +
						"</span></div>",
					pdfMargins.left,
					70,
					{
						width: 210 - pdfMargins.left - pdfMargins.right,
					},
					function (position) {
						pdfTextPosition = position;
					}
				);

				pdf.addImage(
					source,
					"PNG",
					pdfMargins.left,
					pdfTextPosition.y + 2,
					widthInMilimeters,
					heightInMilimeters
				);

				const currentDate = new Date();

				pdf.save(
					"GenderAgeMarker__" + csvDateFormat(currentDate) + ".pdf"
				);

				removeProgressWheel();

				d3.select("#pbigamDownloadingDiv").remove();

				function createLetterhead() {
					const footer =
						"© OCHA CBPF Section " +
						currentYear +
						" | For more information, please visit cbpf.data.unocha.org";

					pdf.setFillColor(65, 143, 222);
					pdf.rect(0, pdfMargins.top, 210, 15, "F");

					pdf.setFillColor(236, 161, 84);
					pdf.rect(0, pdfMargins.top + 15, 210, 2, "F");

					pdf.setFillColor(255, 255, 255);
					pdf.rect(pdfMargins.left, pdfMargins.top - 1, 94, 20, "F");

					pdf.ellipse(pdfMargins.left, pdfMargins.top + 9, 5, 9, "F");
					pdf.ellipse(
						pdfMargins.left + 94,
						pdfMargins.top + 9,
						5,
						9,
						"F"
					);

					pdf.addImage(
						logo,
						"PNG",
						pdfMargins.left + 2,
						pdfMargins.top,
						90,
						18
					);

					pdf.setFillColor(236, 161, 84);
					pdf.rect(0, pdfHeight - pdfMargins.bottom, 210, 2, "F");

					pdf.setTextColor(60);
					pdf.setFont("arial");
					pdf.setFontType("normal");
					pdf.setFontSize(10);
					pdf.text(
						footer,
						pdfMargins.left,
						pdfHeight - pdfMargins.bottom + 10
					);
				}

				function countriesList() {
					const plural =
						chartState.selectedCbpfs.length === 1 ? "" : "s";
					const countryList = chartState.selectedCbpfs
						.map(function (d) {
							return cbpfsList[d];
						})
						.sort(function (a, b) {
							return a.toLowerCase() < b.toLowerCase()
								? -1
								: a.toLowerCase() > b.toLowerCase()
								? 1
								: 0;
						})
						.reduce(function (acc, curr, index) {
							return (
								acc +
								(index >= chartState.selectedCbpfs.length - 2
									? index >
									  chartState.selectedCbpfs.length - 2
										? curr
										: curr + " and "
									: curr + ", ")
							);
						}, "");
					return "Selected CBPF" + plural + "-" + countryList;
				}
			});

			//end of downloadSnapshotPdf
		}

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg
				.append("g")
				.attr("class", "pbigamd3chartwheelGroup")
				.attr(
					"transform",
					"translate(" + thiswidth / 2 + "," + thisheight / 4 + ")"
				);

			const loadingText = wheelGroup
				.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text(thistext);

			const arc = d3.arc().outerRadius(25).innerRadius(20);

			const wheel = wheelGroup
				.append("path")
				.datum({
					startAngle: 0,
					endAngle: 0,
				})
				.classed("contributionColorFill", true)
				.attr("d", arc);

			transitionIn();

			function transitionIn() {
				wheel
					.transition()
					.duration(1000)
					.attrTween("d", function (d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function (t) {
							d.endAngle = interpolate(t);
							return arc(d);
						};
					})
					.on("end", transitionOut);
			}

			function transitionOut() {
				wheel
					.transition()
					.duration(1000)
					.attrTween("d", function (d) {
						const interpolate = d3.interpolate(0, Math.PI * 2);
						return function (t) {
							d.startAngle = interpolate(t);
							return arc(d);
						};
					})
					.on("end", function (d) {
						d.startAngle = 0;
						transitionIn();
					});
			}

			//end of createProgressWheel
		}

		function removeProgressWheel() {
			const wheelGroup = d3.select(".pbigamd3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		}

		//end of d3Chart
	}

	//end of d3ChartIIFE
})();

(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "pfbi.unocha.org/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbinad.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js",
		d3SankeyUrl = "https://unpkg.com/d3-sankey@0",
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
			loadScript(d3SankeyUrl, function() {
				loadScript(d3URL, d3Chart);
			});
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(d3SankeyUrl, function() {
					loadScript(d3URL, d3Chart);
				});
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(d3SankeyUrl, function() {
							loadScript(d3URL, d3Chart);
						});
					});
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		if (hasFetch && hasURLSearchParams) {
			loadScript(d3SankeyUrl, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(d3SankeyUrl, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(d3SankeyUrl, d3Chart);
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
		loadScript(d3SankeyUrl, null);
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
			topPanelHeight = 60,
			sankeyPanelHeight = 480,
			height = padding[0] + padding[2] + topPanelHeight + buttonsPanelHeight + sankeyPanelHeight + (2 * panelHorizontalPadding),
			buttonsNumber = 8,
			nodeWidth = 16,
			nodeVerticalPadding = 1,
			sankeyAnnotationsPadding = 4,
			sankeyAnnotationsSpace = 11,
			sankeyLegendPadding = 18,
			sankeyLegendSquareSize = 12,
			sankeyLegendTextPadding = 2,
			sankeyLegendGroupPadding = 10,
			sankeyFundLabelsPadding = 2,
			linksOpacity = 0.3,
			fadeOpacityNodes = 0.1,
			fadeOpacityLinks = 0.02,
			curlyBracketPercentage = 0.05,
			curlyBracketWidth = 12,
			curlyGroupPadding = 4,
			curlyTextPadding = 12,
			typePercentagePadding = 3,
			textCollisionHeight = 14,
			disabledOpacity = 0.6,
			tooltipVerticalPadding = 4,
			windowHeight = window.innerHeight,
			unBlue = "#1F69B3",
			cbpfColor = "#418FDE",
			cerfColor = "#F9D25B",
			partnerColor = "#BFBFBF",
			subpartnerColor = "#E56A54",
			greenArrowColor = "#7FB92F",
			redArrowColor = "#CD3A1F",
			tooltipSvgWidth = 300,
			lollipopSvgGroupHeight = 14,
			stickHeight = 2,
			lollipopRadius = 4,
			labelPadding = 2,
			timelinesWidth = 280,
			timelinesHeight = 50,
			timelineSvgWidth = 110,
			timelineSvgHeight = 50,
			timelineSvgPadding = [10, 34, 10, 34],
			localTimelineScale = d3.local(),
			localTimelineGenerator = d3.local(),
			timelineSvgTextPadding = 2,
			timelineSvgVertTextPadding = 3,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			duration = 1000,
			localVariable = d3.local(),
			formatSIaxes = d3.format("~s"),
			formatNumberSI = d3.format(".3s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent1dec = d3.format(".1%"),
			formatPercent = d3.format(".0%"),
			legendData = ["CBPF", "CERF", "Direct Partners", "Sub-implementing Partners"],
			chartTitleDefault = "Allocation flow (net funding)",
			vizNameQueryString = "netfunding",
			bookmarkSite = "https://pfbi.unocha.org/bookmark.html?",
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			dataUrl = "https://cbpfapi.unocha.org/vo2/odata/AllocationFlowByOrgType?PoolfundCodeAbbrv=&$format=csv", //NOTE ON CERF: CERF ID MUST BE 999
			cbpfsListUrl = "https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
			partnersListUrl = "https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
			subPartnersListUrl = "https://cbpfapi.unocha.org/vo2/odata/SubIPType?$format=csv",
			moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
			],
			sankeyAnnotationsData = [{
				text: "Funds...",
				size: 50
			}, {
				text: "... transfer resources to direct partners...",
				size: 100
			}, {
				text: "... who may or may not transfer them to sub-implementing partners.",
				size: 130
			}],
			curlyTexts = {
				partner: "Amount kept with Direct Partners",
				subpartner: "Transferred to Sub-impl. Partners"
			},
			cbpfsList = {},
			partnersList = {},
			subPartnersList = {},
			aggregationNameRule = {},
			cbpfsListKeys = [],
			partnersListKeys = [],
			subPartnersListKeys = [],
			level3order = [],
			partnersTypeList = ["subpartner", "partner"],
			yearsArray = [],
			cbpfsDataList = {},
			aggregationMode = ["level", "type"],
			chartState = {
				selectedYear: [],
				selectedAggregation: null,
				selectedCbpfs: null,
				cbpfsInData: []
			};

		let isSnapshotTooltipVisible = false,
			cerfInData = false,
			currentHoveredElement;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainerpbinad");

		const showHelp = containerDiv.node().getAttribute("data-showhelp") === "true";

		const showLink = containerDiv.node().getAttribute("data-showlink") === "true";

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedYearString = queryStringValues.has("year") ? queryStringValues.get("year").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-year");

		const selectedCbpfsString = queryStringValues.has("fund") ? queryStringValues.get("fund").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-cbpf");

		const selectedAggregation = queryStringValues.has("aggregate") ? queryStringValues.get("aggregate") :
			aggregationMode.indexOf(containerDiv.node().getAttribute("data-aggregate")) > -1 ? containerDiv.node().getAttribute("data-aggregate") : aggregationMode[1];

		chartState.selectedAggregation = selectedAggregation;

		const selectedResponsiveness = containerDiv.node().getAttribute("data-responsive") === "true";

		const lazyLoad = containerDiv.node().getAttribute("data-lazyload") === "true";

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbinadTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbinadTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbinadIconsDiv d3chartIconsDiv");

		const selectTitleDiv = containerDiv.append("div")
			.attr("class", "pbinadSelectTitleDiv");

		const selectDiv = containerDiv.append("div")
			.attr("class", "pbinadSelectDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const yearsDescriptionDiv = containerDiv.append("div")
			.attr("class", "pbinadYearsDescriptionDiv");

		const timelineDiv = containerDiv.append("div")
			.attr("class", "pbinadtimelineDiv");

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbinadFooterDiv") : null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "pbinadSnapshotTooltip")
			.attr("class", "pbinadSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "pbinadSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "pbinadSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "pbinadTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "pbinadtooltipdiv")
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
				.attr("class", "pbinadtopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			padding: [0, 0, 0, 0],
			moneyBagPadding: 4,
			leftPadding: [180, 496, 742],
			mainValueVerPadding: 12,
			mainValueHorPadding: 2,
			linePadding: 8
		};

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "pbinadbuttonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 0, 0],
			buttonWidth: 52,
			buttonAggregationWidth: 158,
			buttonsMargin: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			aggregationPadding: 26
		};

		const sankeyPanel = {
			main: svg.append("g")
				.attr("class", "pbinadsankeyPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + topPanel.height + 2 * panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: sankeyPanelHeight,
			padding: [36, 80, 38, 86]
		};

		const invisibleLayer = svg.append("g")
			.attr("opacity", 0);

		const sankeyGenerator = d3.sankey()
			.nodeSort(null)
			.linkSort(null)
			.nodeWidth(nodeWidth)
			.nodePadding(nodeVerticalPadding)
			.nodeId(function(d) {
				return d.id;
			})
			.extent([
				[sankeyPanel.padding[3], sankeyPanel.padding[0]],
				[sankeyPanel.width - sankeyPanel.padding[1], sankeyPanel.height - sankeyPanel.padding[2]]
			]);

		const sankeyAnnotationsScale = d3.scalePoint()
			.padding(0)
			.domain(d3.range(3))
			.range([sankeyPanel.padding[3] + nodeWidth / 2, sankeyPanel.width - sankeyPanel.padding[1] - nodeWidth / 2]);

		const tooltipSvgYScale = d3.scalePoint()
			.padding(0.5);

		const tooltipSvgXScale = d3.scaleLinear();

		const tooltipSvgYAxis = d3.axisLeft(tooltipSvgYScale)
			.tickSize(0)
			.tickPadding(5);

		const tooltipSvgXAxis = d3.axisTop(tooltipSvgXScale)
			.tickSizeOuter(0)
			.ticks(3)
			.tickPadding(4)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const timelineXScale = d3.scalePoint()
			.domain(d3.range(4))
			.range([timelineSvgPadding[3], timelineSvgWidth - timelineSvgPadding[1]]);

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		fetchFile("pbinad", dataUrl, [], "data")
			.then(function(previousData) {
				return fetchFile("pbinadcbpfList", cbpfsListUrl, previousData, "cbpfList")
			})
			.then(function(previousData) {
				return fetchFile("pbinadpartnersList", partnersListUrl, previousData, "partnersList")
			})
			.then(function(previousData) {
				return fetchFile("pbinadsubpartnersList", subPartnersListUrl, previousData, "subPartnersList")
			})
			.then(function(previousData) {
				csvCallback(previousData);
			});

		function fetchFile(fileName, url, previousData, warningString) {
			if (localStorage.getItem(fileName + "data") &&
				JSON.parse(localStorage.getItem(fileName + "data")).timestamp > (currentDate.getTime() - localStorageTime)) {
				const fetchedData = d3.csvParse(JSON.parse(localStorage.getItem(fileName + "data")).data);
				console.info("pbinad: " + warningString + " from local storage");
				previousData.push(fetchedData);
				return Promise.resolve(previousData);
			} else {
				return d3.csv(url).then(function(fetchedData) {
					try {
						localStorage.setItem(fileName + "data", JSON.stringify({
							data: d3.csvFormat(fetchedData),
							timestamp: currentDate.getTime()
						}));
					} catch (error) {
						console.info("D3 chart pbinad, " + error);
					};
					console.info("pbinad: " + warningString + " from API");
					previousData.push(fetchedData);
					return previousData;
				});
			};
		};

		function csvCallback(rawData) {

			//CHANGE "OTHERS" IN DIRECT PARTNERS METADATA
			rawData[2][3].OrgTypeNm = "Red Cross/Red Crescent Society";

			removeProgressWheel();

			createCbpfsList(rawData[1]);

			createPartnersList(rawData[2]);

			createSubPartnersList(rawData[3]);

			preProcessData(rawData[0]);

			validateYear(selectedYearString);

			chartState.selectedCbpfs = populateSelectedCbpfs(selectedCbpfsString);

			if (!lazyLoad) {
				draw(rawData[0]);
			} else {
				d3.select(window).on("scroll.pbinad", checkPosition);
				d3.select("body").on("d3ChartsYear.pbinad", function() {
					chartState.selectedYear = [validateCustomEventYear(+d3.event.detail)]
				});
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbinad", null);
					draw(rawData[0]);
				};
			};

			//end of csvCallback
		};

		function draw(rawData) {

			const data = processData(rawData);

			createTitle(rawData);

			createCheckboxes(rawData);

			createTopPanel(data);

			createButtonsPanel(rawData);

			createSankey(data);

			setYearsDescriptionDiv();

			createTimeline(rawData);

			if (!isPfbiSite) createFooterDiv();

			if (showHelp) createAnnotationsDiv();

			//end of draw
		};

		function createTitle(rawData) {

			const title = titleDiv.append("p")
				.attr("id", "pbinadd3chartTitle")
				.html(chartTitle);

			const helpIcon = iconsDiv.append("button")
				.attr("id", "pbinadHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "pbinadDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			const snapshotDiv = iconsDiv.append("div")
				.attr("class", "pbinadSnapshotDiv");

			const snapshotIcon = snapshotDiv.append("button")
				.attr("id", "pbinadSnapshotButton");

			snapshotIcon.html("IMAGE ")
				.append("span")
				.attr("class", "fas fa-camera");

			const snapshotContent = snapshotDiv.append("div")
				.attr("class", "pbinadSnapshotContent");

			const pdfSpan = snapshotContent.append("p")
				.attr("id", "pbinadSnapshotPdfText")
				.html("Download PDF")
				.on("click", function() {
					createSnapshot("pdf", false);
				});

			const pngSpan = snapshotContent.append("p")
				.attr("id", "pbinadSnapshotPngText")
				.html("Download Image (PNG)")
				.on("click", function() {
					createSnapshot("png", false);
				});

			const playIcon = iconsDiv.append("button")
				.datum({
					clicked: false
				})
				.attr("id", "pbinadPlayButton");

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

					const yearButton = d3.selectAll(".pbinadbuttonsRects")
						.filter(function(d) {
							return d === chartState.selectedYear[0]
						});

					yearButton.dispatch("click");
					yearButton.dispatch("click");

					if (yearsArray.length > buttonsNumber) {

						const firstYearIndex = chartState.selectedYear[0] < yearsArray[buttonsNumber / 2] ?
							0 :
							chartState.selectedYear[0] > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
							yearsArray.length - buttonsNumber :
							yearsArray.indexOf(chartState.selectedYear[0]) - (buttonsNumber / 2);

						const currentTranslate = -(buttonsPanel.buttonWidth * firstYearIndex);

						if (currentTranslate === 0) {
							svg.select(".pbinadLeftArrowGroup").select("text").style("fill", "#ccc")
							svg.select(".pbinadLeftArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select(".pbinadLeftArrowGroup").select("text").style("fill", "#666")
							svg.select(".pbinadLeftArrowGroup").attr("pointer-events", "all");
						};

						if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
							svg.select(".pbinadRightArrowGroup").select("text").style("fill", "#ccc")
							svg.select(".pbinadRightArrowGroup").attr("pointer-events", "none");
						} else {
							svg.select(".pbinadRightArrowGroup").select("text").style("fill", "#666")
							svg.select(".pbinadRightArrowGroup").attr("pointer-events", "all");
						};

						svg.select(".pbinadbuttonsGroup").transition()
							.duration(duration)
							.attrTween("transform", function() {
								return d3.interpolateString(this.getAttribute("transform"), "translate(" + currentTranslate + ",0)");
							});
					};
				};
			});

			if (!isBookmarkPage) {

				const shareIcon = iconsDiv.append("button")
					.attr("id", "pbinadShareButton");

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
					.attr("id", "pbinadBestVisualizedText")
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

				const fileName = "AllocationFlow_" + csvDateFormat(currentDate) + ".csv";

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

		function createCheckboxes(rawData) {

			selectTitleDiv.html("Select CBPF:");

			const checkboxData = d3.keys(cbpfsDataList).sort(function(a, b) {
				return (cbpfsList[a]).localeCompare(cbpfsList[b]);
			});

			checkboxData.push("All CBPFs");

			const checkboxDivs = selectDiv.selectAll(null)
				.data(checkboxData)
				.enter()
				.append("div")
				.attr("class", "pbinadCheckboxDiv");

			checkboxDivs.filter(function(d) {
					return d !== "All CBPFs";
				})
				.style("opacity", function(d) {
					return chartState.cbpfsInData.indexOf(d) === -1 ? disabledOpacity : 1;
				});

			const checkbox = checkboxDivs.append("label");

			const input = checkbox.append("input")
				.attr("type", "checkbox")
				.property("checked", function(d) {
					return chartState.selectedCbpfs.indexOf(d) > -1;
				})
				.attr("value", function(d) {
					return d;
				});

			const span = checkbox.append("span")
				.attr("class", "pbinadCheckboxText")
				.html(function(d) {
					return cbpfsDataList[d] || d;
				});

			const allCbpfs = checkboxDivs.filter(function(d) {
				return d === "All CBPFs";
			}).select("input");

			const cbpfsCheckboxes = checkboxDivs.filter(function(d) {
				return d !== "All CBPFs";
			}).select("input");

			cbpfsCheckboxes.property("disabled", function(d) {
				return chartState.cbpfsInData.indexOf(d) === -1;
			});

			allCbpfs.property("checked", function() {
					return chartState.selectedCbpfs.length === d3.keys(cbpfsDataList).length;
				})
				.property("indeterminate", function() {
					return chartState.selectedCbpfs.length < d3.keys(cbpfsDataList).length && chartState.selectedCbpfs.length > 0;
				});

			checkbox.select("input").on("change", function() {
				if (this.value === "All CBPFs") {
					if (this.checked) {
						chartState.selectedCbpfs = d3.keys(cbpfsDataList)
					} else {
						chartState.selectedCbpfs.length = 0;
					};
					checkbox.select("input")
						.property("checked", this.checked);
				} else {
					if (this.checked) {
						chartState.selectedCbpfs.push(this.value);
					} else {
						const thisIndex = chartState.selectedCbpfs.indexOf(this.value);
						chartState.selectedCbpfs.splice(thisIndex, 1);
					};
					allCbpfs.property("checked", function() {
							return chartState.selectedCbpfs.length === d3.keys(cbpfsDataList).length;
						})
						.property("indeterminate", function() {
							return chartState.selectedCbpfs.length < d3.keys(cbpfsDataList).length && chartState.selectedCbpfs.length > 0;
						});
				};

				if (!chartState.selectedCbpfs.length || chartState.selectedCbpfs.length === d3.keys(cbpfsDataList).length) {
					queryStringValues.delete("fund");
				} else {
					const allFunds = chartState.selectedCbpfs.map(function(d) {
						return cbpfsDataList[d]
					}).join("|");
					if (queryStringValues.has("fund")) {
						queryStringValues.set("fund", allFunds);
					} else {
						queryStringValues.append("fund", allFunds);
					};
				};

				const data = processData(rawData);

				createTopPanel(data);

				createSankey(data);

				createTimeline(rawData);

			});

			//end of createCheckboxes
		};

		function createTopPanel(data) {

			const mainValue = d3.sum(data.nodes.filter(function(d) {
				return d.level === 1;
			}), function(d) {
				return d.amount;
			});

			const partnersValue = d3.sum(data.nodes.filter(function(d) {
				return d.level === 3 && d.id.split("#")[0] === "partner";
			}), function(d) {
				return d.amount;
			});

			const subpartnersValue = d3.sum(data.nodes.filter(function(d) {
				return d.level === 3 && d.id.split("#")[0] === "subpartner";
			}), function(d) {
				return d.amount;
			});

			const topPanelMoneyBag = topPanel.main.selectAll(".pbinadtopPanelMoneyBag")
				.data([true])
				.enter()
				.append("g")
				.attr("class", "pbinadtopPanelMoneyBag contributionColorFill")
				.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.5)")
				.each(function(_, i, n) {
					moneyBagdAttribute.forEach(function(d) {
						d3.select(n[i]).append("path")
							.attr("d", d);
					});
				});

			const previousValue = d3.select(".pbinadtopPanelMainValue").size() !== 0 ? d3.select(".pbinadtopPanelMainValue").datum() : 0;

			const previousPartnersValue = d3.select(".pbinadtopPanelPartnersValue").size() !== 0 ? d3.select(".pbinadtopPanelPartnersValue").datum() : 0;

			const previousSubpartnersValue = d3.select(".pbinadtopPanelSubpartnersValue").size() !== 0 ? d3.select(".pbinadtopPanelSubpartnersValue").datum() : 0;

			let topPanelMainValue = topPanel.main.selectAll(".pbinadtopPanelMainValue")
				.data([mainValue]);

			topPanelMainValue = topPanelMainValue.enter()
				.append("text")
				.attr("class", "pbinadtopPanelMainValue contributionColorFill")
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] - topPanel.mainValueHorPadding)
				.merge(topPanelMainValue);

			topPanelMainValue.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousValue, d);
					return function(t) {
						const siString = formatSIFloat(i(t))
						node.textContent = "$" + siString.substring(0, siString.length - 1);
					};
				});

			let topPanelMainText = topPanel.main.selectAll(".pbinadtopPanelMainText")
				.data([mainValue]);

			topPanelMainText = topPanelMainText.enter()
				.append("text")
				.attr("class", "pbinadtopPanelMainText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
				.merge(topPanelMainText);

			topPanelMainText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						" Allocated in";
				});

			let topPanelSubText = topPanel.main.selectAll(".pbinadtopPanelSubText")
				.data([true]);

			topPanelSubText = topPanelSubText.enter()
				.append("text")
				.attr("class", "pbinadtopPanelSubText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
				.merge(topPanelSubText);

			topPanelSubText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text((chartState.selectedYear.length === 1 ? chartState.selectedYear[0] : "years\u002A") + " (all partners)");

			let topPanelPartnersValue = topPanel.main.selectAll(".pbinadtopPanelPartnersValue")
				.data([partnersValue]);

			topPanelPartnersValue = topPanelPartnersValue.enter()
				.append("text")
				.attr("class", "pbinadtopPanelPartnersValue contributionColorFill")
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding)
				.merge(topPanelPartnersValue);

			topPanelPartnersValue.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousPartnersValue, d);
					return function(t) {
						const siString = formatSIFloat(i(t))
						node.textContent = "$" + siString.substring(0, siString.length - 1);
					};
				});

			let topPanelPartnersText = topPanel.main.selectAll(".pbinadtopPanelPartnersText")
				.data([partnersValue]);

			topPanelPartnersText = topPanelPartnersText.enter()
				.append("text")
				.attr("class", "pbinadtopPanelPartnersText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.6)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
				.merge(topPanelPartnersText);

			topPanelPartnersText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						" to direct";
				});

			let topPanelPartnersSubText = topPanel.main.selectAll(".pbinadtopPanelPartnersSubText")
				.data([partnersValue]);

			topPanelPartnersSubText = topPanelPartnersSubText.enter()
				.append("text")
				.attr("class", "pbinadtopPanelPartnersSubText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.4)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
				.merge(topPanelPartnersSubText);

			topPanelPartnersSubText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function(d) {
					return "partners (" + formatPercent1dec((d / mainValue) || 0) + ")";
				});

			let topPanelSubpartnersValue = topPanel.main.selectAll(".pbinadtopPanelSubpartnersValue")
				.data([subpartnersValue]);

			topPanelSubpartnersValue = topPanelSubpartnersValue.enter()
				.append("text")
				.attr("class", "pbinadtopPanelSubpartnersValue contributionColorFill")
				.attr("text-anchor", "end")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] - topPanel.mainValueHorPadding)
				.merge(topPanelSubpartnersValue);

			topPanelSubpartnersValue.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousSubpartnersValue, d);
					return function(t) {
						const siString = formatSIFloat(i(t))
						node.textContent = "$" + siString.substring(0, siString.length - 1);
					};
				});

			let topPanelSubpartnersText = topPanel.main.selectAll(".pbinadtopPanelSubpartnersText")
				.data([subpartnersValue]);

			topPanelSubpartnersText = topPanelSubpartnersText.enter()
				.append("text")
				.attr("class", "pbinadtopPanelSubpartnersText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.6)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
				.merge(topPanelSubpartnersText);

			topPanelSubpartnersText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
						" to sub-impl.";
				});

			let topPanelSubpartnersSubText = topPanel.main.selectAll(".pbinadtopPanelSubpartnersSubText")
				.data([subpartnersValue]);

			topPanelSubpartnersSubText = topPanelSubpartnersSubText.enter()
				.append("text")
				.attr("class", "pbinadtopPanelSubpartnersSubText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.4)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
				.merge(topPanelSubpartnersSubText);

			topPanelSubpartnersSubText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function(d) {
					return "partners (" + formatPercent1dec((d / mainValue) || 0) + ")";
				});

			//end of createTopPanel
		};

		function createButtonsPanel(rawData) {

			const clipPath = buttonsPanel.main.append("clipPath")
				.attr("id", "pbinadclip")
				.append("rect")
				.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
				.attr("height", buttonsPanel.height);

			const extraPadding = yearsArray.length > buttonsNumber ? buttonsPanel.arrowPadding : -2;

			const clipPathGroup = buttonsPanel.main.append("g")
				.attr("class", "pbinadClipPathGroup")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + extraPadding) + ",0)")
				.attr("clip-path", "url(#pbinadclip)");

			const buttonsGroup = clipPathGroup.append("g")
				.attr("class", "pbinadbuttonsGroup")
				.attr("transform", "translate(0,0)")
				.style("cursor", "pointer");

			const buttonsRects = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "pbinadbuttonsRects")
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
				.attr("class", "pbinadbuttonsText")
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

			const buttonsAggregationGroup = buttonsPanel.main.append("g")
				.attr("class", "pbinadbuttonsAggegationGroup")
				.style("cursor", "pointer");

			const buttonsAggregationRects = buttonsAggregationGroup.selectAll(null)
				.data(aggregationMode)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", "pbinadbuttonsAggregationRects")
				.attr("width", buttonsPanel.buttonAggregationWidth - buttonsPanel.buttonsMargin)
				.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.padding[0] + buttonsPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonAggregationWidth + buttonsPanel.buttonsMargin / 2;
				})
				.style("fill", function(d) {
					return d === chartState.selectedAggregation ? unBlue : "#eaeaea";
				});

			const buttonsAggregationText = buttonsAggregationGroup.selectAll(null)
				.data(aggregationMode)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", "pbinadbuttonsAggregationText")
				.attr("y", buttonsPanel.height / 1.6)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonAggregationWidth + buttonsPanel.buttonAggregationWidth / 2;
				})
				.style("fill", function(d) {
					return d === chartState.selectedAggregation ? "white" : "#444";
				})
				.text(function(d) {
					return "Aggregate by Partner " + capitalize(d);
				});

			const buttonsGroupSize = Math.min(buttonsPanel.padding[3] + buttonsPanel.arrowPadding + buttonsGroup.node().getBoundingClientRect().width,
				buttonsPanel.padding[3] + buttonsNumber * buttonsPanel.buttonWidth + 2 * buttonsPanel.arrowPadding);

			buttonsAggregationGroup.attr("transform", "translate(" + (buttonsGroupSize + buttonsPanel.aggregationPadding) + ",0)");

			const leftArrow = buttonsPanel.main.append("g")
				.attr("class", "pbinadLeftArrowGroup")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.style("cursor", "pointer")
				.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

			const leftArrowRect = leftArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height);

			const leftArrowText = leftArrow.append("text")
				.attr("class", "pbinadleftArrowText")
				.attr("x", 0)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25c4");

			const rightArrow = buttonsPanel.main.append("g")
				.attr("class", "pbinadRightArrowGroup")
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
				.attr("class", "pbinadrightArrowText")
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

			d3.select("body").on("d3ChartsYear.pbinad", function() {
				clickButtonsRects(validateCustomEventYear(+d3.event.detail), true);
				if (yearsArray.length > buttonsNumber) {
					repositionButtonsGroup();
					checkArrows();
				};
			});

			buttonsAggregationRects.on("mouseover", mouseOverButtonsAggregationRects)
				.on("mouseout", mouseOutButtonsAggregationRects);

			if (yearsArray.length > buttonsNumber) {

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
							Math.max(-((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth),
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

				const firstYearIndex = yearsArray.indexOf(chartState.selectedYear[0]) < buttonsNumber / 2 ?
					0 :
					yearsArray.indexOf(chartState.selectedYear[0]) > yearsArray.length - (buttonsNumber / 2) ?
					Math.max(yearsArray.length - buttonsNumber, 0) :
					yearsArray.indexOf(yearsArray.indexOf(chartState.selectedYear[0])) - (buttonsNumber / 2);

				buttonsGroup.attr("transform", "translate(" +
					(-(buttonsPanel.buttonWidth * firstYearIndex)) +
					",0)");

			};

			function mouseOverButtonsRects(d) {

				tooltip.style("display", "block")
					.html(null)

				const innerTooltip = tooltip.append("div")
					.style("max-width", "200px")
					.attr("id", "pbinadInnerTooltipDiv");

				innerTooltip.html("Click for selecting a year. Double-click or ALT + click for selecting a single month.");

				const containerSize = containerDiv.node().getBoundingClientRect();

				const thisSize = this.getBoundingClientRect();

				tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip.style("left", (thisSize.left + thisSize.width / 2 - containerSize.left) > containerSize.width - (tooltipSize.width / 2) - padding[1] ?
						containerSize.width - tooltipSize.width - padding[1] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) < tooltipSize.width / 2 + buttonsPanel.padding[3] + padding[0] ?
						buttonsPanel.padding[3] + padding[0] + "px" : (thisSize.left + thisSize.width / 2 - containerSize.left) - (tooltipSize.width / 2) + "px")
					.style("top", (thisSize.top + thisSize.height / 2 - containerSize.top) < tooltipSize.height ? thisSize.top - containerSize.top + thisSize.height + 2 + "px" :
						thisSize.top - containerSize.top - tooltipSize.height - 4 + "px");

				d3.select(this).style("fill", unBlue);
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsRects(d) {
				tooltip.style("display", "none");
				if (chartState.selectedYear.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			function clickButtonsRects(d, singleSelection) {

				tooltip.style("display", "none");

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

				d3.selectAll(".pbinadbuttonsRects")
					.style("fill", function(e) {
						return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
					});

				d3.selectAll(".pbinadbuttonsText")
					.style("fill", function(e) {
						return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
					});

				setYearsDescriptionDiv();

				const data = processData(rawData);

				selectDiv.selectAll(".pbinadCheckboxDiv")
					.filter(function(d) {
						return d !== "All CBPFs";
					})
					.select("input")
					.property("disabled", function(d) {
						return chartState.cbpfsInData.indexOf(d) === -1;
					});

				selectDiv.selectAll(".pbinadCheckboxDiv")
					.filter(function(d) {
						return d !== "All CBPFs";
					})
					.style("opacity", function(d) {
						return chartState.cbpfsInData.indexOf(d) === -1 ? disabledOpacity : 1;
					});

				createTopPanel(data);

				createSankey(data);

				//end of clickButtonsRects
			};

			function mouseOverButtonsAggregationRects(d) {
				d3.select(this).style("fill", unBlue);
				buttonsAggregationText.filter(function(e) {
						return e === d
					})
					.style("fill", "white");
			};

			function mouseOutButtonsAggregationRects(d) {
				if (d === chartState.selectedAggregation) return;
				d3.select(this).style("fill", "#eaeaea");
				buttonsAggregationText.filter(function(e) {
						return e === d
					})
					.style("fill", "#444");
			};

			//end of createButtonsPanel
		};

		function createSankey(data) {

			let sankeyNoData = sankeyPanel.main.selectAll(".pbinadsankeyNoData")
				.data(data.nodes.length ? [] : [true]);

			const sankeyNoDataExit = sankeyNoData.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			sankeyNoData = sankeyNoData.enter()
				.append("text")
				.attr("class", "pbinadsankeyNoData")
				.attr("x", sankeyPanel.width / 2)
				.attr("y", sankeyPanel.height / 3)
				.style("opacity", 0)
				.text("No fund selected")
				.merge(sankeyNoData)
				.transition()
				.duration(duration)
				.style("opacity", 1);

			const sankeyAnnotationsGroups = sankeyPanel.main.selectAll(".pbinadsankeyAnnotationsGroups")
				.data(sankeyAnnotationsData)
				.enter()
				.append("g")
				.attr("class", "pbinadsankeyAnnotationsGroups")
				.attr("transform", function(_, i) {
					return "translate(" + sankeyAnnotationsScale(i) + "," + (sankeyPanel.padding[0] - (i * sankeyAnnotationsSpace) - sankeyAnnotationsPadding) + ")";
				});

			const sankeyAnnotationsText = sankeyAnnotationsGroups.append("text")
				.attr("class", "pbinadsankeyAnnotations")
				.attr("text-anchor", "middle")
				.attr("x", 0)
				.attr("y", 0)
				.text(function(d) {
					return d.text;
				})
				.each(function(d) {
					wrapText2(d3.select(this), d.size);
				});

			const sankeyLegendTitle = sankeyPanel.main.selectAll(".pbinadsankeyLegendTitle")
				.data([true])
				.enter()
				.append("text")
				.attr("class", "pbinadsankeyLegendTitle")
				.attr("x", sankeyPanel.padding[3])
				.attr("y", sankeyPanel.height - sankeyPanel.padding[2] + sankeyLegendPadding)
				.text("Legend:");

			const legendFilteredData = legendData.filter(function(d) {
				return cerfInData || d !== "CERF";
			});

			const sankeyLegendGroups = sankeyPanel.main.selectAll(".pbinadsankeyLegendGroups")
				.data(legendFilteredData)
				.enter()
				.append("g")
				.attr("class", "pbinadsankeyLegendGroups");

			const legendSquare = sankeyLegendGroups.append("rect")
				.attr("width", sankeyLegendSquareSize)
				.attr("height", sankeyLegendSquareSize)
				.style("fill", function(d) {
					return d === "CBPF" ? cbpfColor : d === "CERF" ? cerfColor : d === "Direct Partners" ? partnerColor : subpartnerColor;
				});

			const legendText = sankeyLegendGroups.append("text")
				.attr("class", "pbinadlegendText")
				.attr("x", sankeyLegendSquareSize + sankeyLegendTextPadding)
				.attr("y", sankeyLegendSquareSize - 2)
				.text(function(d) {
					return d;
				});

			if (sankeyLegendGroups.size()) {
				sankeyLegendGroups.each(function(_, i) {
					d3.select(this).attr("transform", "translate(" + (i ? localVariable.get(this.previousSibling) : sankeyPanel.padding[3]) + "," + (sankeyPanel.height - sankeyPanel.padding[2] + sankeyLegendPadding + 4) + ")")
					localVariable.set(this, this.getBBox().width + sankeyLegendGroupPadding + (i ? localVariable.get(this.previousSibling) : sankeyPanel.padding[3]));
				});
			};

			const flatLevel3order = level3order.map(function(d) {
				return d.partner;
			});

			sankeyGenerator.nodeSort(function(a, b) {
				if (a.level === 1 && b.level === 1) {
					return a.codeId === "999" ? 1 : b.codeId === "999" ? -1 :
						b.amount - a.amount;
				} else if (a.level === 2 && b.level === 2) {
					return b.amount - a.amount;
				} else if (chartState.selectedAggregation === "type" && (a.level === 3 && b.level === 3)) {
					return (flatLevel3order.indexOf(b.codeId) - flatLevel3order.indexOf(a.codeId)) ||
						b.amount - a.amount;
				} else if (chartState.selectedAggregation === "level" && (a.level === 3 && b.level === 3)) {
					return (partnersTypeList.indexOf(b.id.split("#")[0]) - partnersTypeList.indexOf(a.id.split("#")[0])) ||
						b.amount - a.amount;
				} else {
					return null;
				};
			});

			sankeyGenerator.linkSort(function(a, b) {
				if (a.sourceLevel === 1 && b.sourceLevel === 1) {
					return b.value - a.value;
				} else if (a.sourceLevel === 2 && b.sourceLevel === 2) {
					return b.source.targetLinks.find(function(e) {
							return e.fund === b.fund
						}).value - a.source.targetLinks.find(function(e) {
							return e.fund === a.fund
						}).value ||
						b.value - a.value;
				} else {
					return null;
				};
			});

			const sankeyData = data.nodes.length ? sankeyGenerator(data) : data;

			let sankeyNodes = sankeyPanel.main.selectAll(".pbinadsankeyNodes")
				.data(sankeyData.nodes, function(d) {
					return d.id;
				});

			const sankeyNodesExit = sankeyNodes.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyNodesEnter = sankeyNodes.enter()
				.append("rect")
				.attr("class", "pbinadsankeyNodes")
				.style("fill", function(d) {
					const idSplit = d.id.split("#");
					if (idSplit[0] === "fund" && idSplit[1] === "999") {
						return cerfColor;
					} else if (idSplit[0] === "fund" && idSplit[1] !== "999") {
						return cbpfColor;
					} else if (idSplit[0] === "partner") {
						return partnerColor;
					} else {
						return subpartnerColor;
					};
				})
				.style("opacity", 0)
				.attr("x", function(d) {
					return d.x0;
				})
				.attr("y", function(d) {
					return d.y0;
				})
				.attr("height", function(d) {
					return d.y1 - d.y0;
				})
				.attr("width", function(d) {
					return d.x1 - d.x0;
				});

			sankeyNodes = sankeyNodesEnter.merge(sankeyNodes);

			sankeyNodes.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("x", function(d) {
					return d.x0;
				})
				.attr("y", function(d) {
					return d.y0;
				})
				.attr("height", function(d) {
					return d.y1 - d.y0;
				})
				.attr("width", function(d) {
					return d.x1 - d.x0;
				});

			let sankeyLinks = sankeyPanel.main.selectAll(".pbinadsankeyLinks")
				.data(sankeyData.links, function(d) {
					return d.fund + d.source.id + d.target.id;
				});

			const sankeyLinksExit = sankeyLinks.exit()
				.transition()
				.duration(duration)
				.style("stroke-opacity", 0)
				.remove();

			const sankeyLinksEnter = sankeyLinks.enter()
				.append("path")
				.attr("class", "pbinadsankeyLinks")
				.attr("stroke-width", function(d) {
					return d.width;
				})
				.style("fill", "none")
				.style("stroke", function(d) {
					if (d.sourceLevel === 1) {
						return d.fund === "999" ? cerfColor : cbpfColor;
					} else {
						return d.target.id.split("#")[0] === "subpartner" ? subpartnerColor : (d.fund === "999" ? cerfColor : cbpfColor);
					};
				})
				.style("mix-blend-mode", "multiply")
				.style("stroke-opacity", 0)
				.attr("d", d3.sankeyLinkHorizontal());

			sankeyLinks = sankeyLinksEnter.merge(sankeyLinks);

			sankeyLinks.transition()
				.duration(duration)
				.style("stroke-opacity", linksOpacity)
				.attr("stroke-width", function(d) {
					return d.width;
				})
				.attr("d", d3.sankeyLinkHorizontal());

			const fundLabelsData = sankeyData.nodes.filter(function(d) {
				return d.depth === 0;
			});

			const partnerLabelsData = sankeyData.nodes.filter(function(d) {
				return d.depth === 1;
			});

			const subpartnerLabelsData = sankeyData.nodes.reduce(function(acc, curr) {
				if (curr.depth === 2) {
					if (chartState.selectedAggregation === "level") {
						acc.push({
							codeId: curr.codeId,
							name: curr.name,
							y0: curr.y0,
							y1: curr.y1,
							amount: curr.amount,
							targetLinks: curr.targetLinks,
							id: curr.id
						});
					} else {
						const foundObj = acc.find(function(d) {
							return d.aggregatedName === curr.aggregatedName;
						});
						if (foundObj) {
							foundObj.y0 = Math.min(foundObj.y0, curr.y0);
							foundObj.y1 = Math.max(foundObj.y1, curr.y1);
							foundObj.amount += curr.amount;
							foundObj.targetLinks.push.apply(foundObj.targetLinks, curr.targetLinks);
						} else {
							const partnerSecondLevel = partnerLabelsData.find(function(e) {
								return curr.name === e.name;
							});
							acc.push({
								codeId: curr.codeId,
								name: curr.name,
								aggregatedName: curr.aggregatedName,
								y0: curr.y0,
								y1: curr.y1,
								amount: curr.amount,
								targetLinks: curr.targetLinks,
								id: curr.id,
								amountSecondLevel: partnerSecondLevel ? partnerSecondLevel.amount : "n/a"
							});
						};
					};
				};
				return acc;
			}, []);

			const totalAllocated = data.nodes.reduce(function(acc, curr) {
				return curr.level === 2 ? acc + curr.amount : acc;
			}, 0);

			let sankeyFundLabels = sankeyPanel.main.selectAll(".pbinadsankeyFundLabels")
				.data(fundLabelsData, function(d) {
					return d.codeId;
				});

			const sankeyFundLabelsExit = sankeyFundLabels.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyFundLabelsEnter = sankeyFundLabels.enter()
				.append("text")
				.attr("class", "pbinadsankeyFundLabels")
				.attr("text-anchor", "end")
				.attr("x", sankeyPanel.padding[3] - sankeyFundLabelsPadding)
				.attr("y", function(d) {
					return 3 + (d.y0 + d.y1) / 2;
				})
				.style("opacity", 0)
				.text(function(d) {
					return d.name;
				});

			sankeyFundLabels = sankeyFundLabelsEnter.merge(sankeyFundLabels);

			sankeyFundLabels.call(hideLabels, textCollisionHeight)
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("y", function(d) {
					return 3 + (d.y0 + d.y1) / 2;
				});

			let sankeyPartnerLabels = sankeyPanel.main.selectAll(".pbinadsankeyPartnerLabels")
				.data(partnerLabelsData, function(d) {
					return d.codeId;
				});

			const sankeyPartnerLabelsExit = sankeyPartnerLabels.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyPartnerLabelsEnter = sankeyPartnerLabels.enter()
				.append("text")
				.attr("class", "pbinadsankeyPartnerLabels")
				.attr("text-anchor", "end")
				.attr("x", sankeyAnnotationsScale(1) - (nodeWidth / 2) - sankeyFundLabelsPadding)
				.attr("y", function(d) {
					return 3 + (d.y0 + d.y1) / 2;
				})
				.style("opacity", 0)
				.text(function(d) {
					return d.name;
				});

			sankeyPartnerLabels = sankeyPartnerLabelsEnter.merge(sankeyPartnerLabels);

			sankeyPartnerLabels.call(hideLabels, textCollisionHeight)
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("y", function(d) {
					return 3 + (d.y0 + d.y1) / 2;
				});

			let sankeyPartnerValuesLabels = sankeyPanel.main.selectAll(".pbinadsankeyPartnerValuesLabelsGroup")
				.data(partnerLabelsData, function(d) {
					return d.codeId;
				});

			const sankeyPartnerValuesLabelsExit = sankeyPartnerValuesLabels.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeyPartnerValuesLabelsEnter = sankeyPartnerValuesLabels.enter()
				.append("g")
				.attr("class", "pbinadsankeyPartnerValuesLabelsGroup")
				.style("opacity", 0)
				.attr("transform", function(d) {
					return "translate(" + (sankeyAnnotationsScale(1) + (nodeWidth / 2) + sankeyFundLabelsPadding) + "," +
						(3 + (d.y0 + d.y1) / 2) + ")";
				});

			sankeyPartnerValuesLabelsEnter.append("text")
				.attr("class", "pbinadsankeyPartnerValuesLabels")
				.text(function(d) {
					return "$" + formatSIFloat(d.amount).replace("G", "B");
				});

			sankeyPartnerValuesLabelsEnter.append("text")
				.attr("class", "pbinadsankeyPartnerValuesLabelsSubText")
				.attr("dy", "1.2em")
				.text(function(d) {
					localVariable.set(this, d.amount / totalAllocated);
					return "(" + formatPercent1dec(d.amount / totalAllocated) + ")";
				});

			sankeyPartnerValuesLabels = sankeyPartnerValuesLabelsEnter.merge(sankeyPartnerValuesLabels);

			sankeyPartnerValuesLabels.call(hideLabels, textCollisionHeight * 3)
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + (sankeyAnnotationsScale(1) + (nodeWidth / 2) + sankeyFundLabelsPadding) + "," +
						(3 + (d.y0 + d.y1) / 2) + ")";
				});

			sankeyPartnerValuesLabels.select(".pbinadsankeyPartnerValuesLabels")
				.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent.substring(1)) || 0, d.amount);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t)).replace("G", "B");
					};
				});

			sankeyPartnerValuesLabels.select(".pbinadsankeyPartnerValuesLabelsSubText")
				.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const oldPercentage = localVariable.get(this);
					localVariable.set(this, d.amount / totalAllocated);
					const i = d3.interpolate(oldPercentage, d.amount / totalAllocated);
					return function(t) {
						node.textContent = "(" + formatPercent1dec(i(t)) + ")";
					};
				});

			let sankeySubpartnerLabels = sankeyPanel.main.selectAll(".pbinadsankeySubpartnerLabels")
				.data(subpartnerLabelsData, function(d) {
					return d.id;
				});

			const sankeySubpartnerLabelsExit = sankeySubpartnerLabels.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const sankeySubpartnerLabelsEnter = sankeySubpartnerLabels.enter()
				.append("g")
				.attr("class", "pbinadsankeySubpartnerLabels")
				.attr("text-anchor", "end")
				.attr("transform", function(d) {
					return "translate(" + (chartState.selectedAggregation === "level" || partnersListKeys.indexOf(d.codeId) === -1 ? sankeyAnnotationsScale(2) - (nodeWidth / 2) - sankeyFundLabelsPadding :
							sankeyAnnotationsScale(2) - (nodeWidth / 2) - sankeyFundLabelsPadding - (curlyGroupPadding / 2) - curlyBracketWidth) + "," +
						(3 + (d.y0 + d.y1) / 2) + ")";
				})
				.style("opacity", 0);

			const sankeySubpartnerLabelsEnterText = sankeySubpartnerLabelsEnter.append("text")
				.attr("class", "pbinadsankeySubpartnerLabelsEnterText")
				.text(function(d) {
					return chartState.selectedAggregation === "type" ? d.aggregatedName : d.name;
				});

			sankeySubpartnerLabels = sankeySubpartnerLabelsEnter.merge(sankeySubpartnerLabels);

			const subpartnerstypeArrowSpan = sankeySubpartnerLabels.selectAll(".pbinadtypeArrowSpan")
				.data(function(d) {
					return chartState.selectedAggregation === "level" ? [] : [d];
				});

			const subpartnerstypeArrowSpanExit = subpartnerstypeArrowSpan.exit().remove();

			const subpartnerstypeArrowSpanEnter = subpartnerstypeArrowSpan.enter()
				.append("text")
				.attr("class", "pbinadtypeArrowSpan")
				.attr("dy", "1.2em")
				.text("");

			subpartnerstypeArrowSpanEnter.append("tspan")
				.attr("class", "pbinadtypePercentageBoldPar")
				.text(function(d) {
					return d.amountSecondLevel === "n/a" ? "" : "(";
				});

			subpartnerstypeArrowSpanEnter.append("tspan")
				.attr("class", "pbinadtypePercentageArrow")
				.style("fill", function(d) {
					return d.amountSecondLevel === "n/a" ? "none" : ((d.amount / d.amountSecondLevel) - 1) < 0 ? redArrowColor : greenArrowColor;
				})
				.text(function(d) {
					return d.amountSecondLevel === "n/a" ? "" : ((d.amount / d.amountSecondLevel) - 1) < 0 ? "\u25BC" : "\u25B2";
				});

			subpartnerstypeArrowSpanEnter.append("tspan")
				.attr("class", "pbinadtypePercentageBoldNumber")
				.text(function(d) {
					if (d.amountSecondLevel === "n/a") {
						return "";
					} else {
						const variation = (d.amount / d.amountSecondLevel) - 1;
						localVariable.set(this, variation);
						return formatPercent1dec(Math.abs(variation)) + ")";
					};
				});

			sankeySubpartnerLabels.call(hideLabels, textCollisionHeight * (chartState.selectedAggregation === "level" ? 1 : 3))
				.transition()
				.duration(duration)
				.style("opacity", 1)
				.attr("transform", function(d) {
					return "translate(" + (chartState.selectedAggregation === "level" || partnersListKeys.indexOf(d.codeId) === -1 ? sankeyAnnotationsScale(2) - (nodeWidth / 2) - sankeyFundLabelsPadding :
							sankeyAnnotationsScale(2) - (nodeWidth / 2) - sankeyFundLabelsPadding - (curlyGroupPadding / 2) - curlyBracketWidth) + "," +
						(3 + (d.y0 + d.y1) / 2) + ")";
				});

			sankeySubpartnerLabels.select(".pbinadsankeySubpartnerLabelsEnterText")
				.text(function(d) {
					return chartState.selectedAggregation === "type" ? d.aggregatedName : d.name;
				});

			sankeySubpartnerLabels.select(".pbinadtypePercentageBoldPar")
				.text(function(d) {
					return d.amountSecondLevel === "n/a" ? "" : "(";
				});

			sankeySubpartnerLabels.select(".pbinadtypePercentageArrow")
				.style("fill", function(d) {
					return d.amountSecondLevel === "n/a" ? "none" : ((d.amount / d.amountSecondLevel) - 1) < 0 ? redArrowColor : greenArrowColor;
				})
				.text(function(d) {
					return d.amountSecondLevel === "n/a" ? "" : ((d.amount / d.amountSecondLevel) - 1) < 0 ? "\u25BC" : "\u25B2";
				});

			sankeySubpartnerLabels.select(".pbinadtypePercentageBoldNumber")
				.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const oldVariation = localVariable.get(this)
					const variation = (d.amount / d.amountSecondLevel) - 1;
					localVariable.set(this, variation);
					const i = d3.interpolate(oldVariation, variation)
					return function(t) {
						node.textContent = d.amountSecondLevel === "n/a" ? "" : formatPercent1dec(Math.abs(i(t))) + ")";
					};
				});

			let curlyPathsType = sankeyPanel.main.selectAll(".pbinadcurlyPathsType")
				.data(chartState.selectedAggregation === "type" ? subpartnerLabelsData.filter(function(d) {
					return partnersListKeys.indexOf(d.codeId) > -1;
				}) : [], function(d) {
					return d.codeId;
				});

			const curlyPathsTypeExit = curlyPathsType.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const curlyPathsTypeEnter = curlyPathsType.enter()
				.append("path")
				.attr("class", "pbinadcurlyPathsType")
				.style("opacity", 0)
				.attr("transform", function(d) {
					return "translate(" + (sankeyPanel.width - sankeyPanel.padding[1] - nodeWidth - (curlyGroupPadding / 2)) + ",0)";
				})
				.style("fill", "none")
				.style("stroke", "darkslategray")
				.style("stroke-width", "1px")
				.attr("d", function(d) {
					const percentageCorrection = d.y1 - d.y0 < textCollisionHeight ? 2.5 : 1;
					return curlyBracket(d.y0 + 0.5, d.y1 - 0.5, -curlyBracketWidth, curlyBracketPercentage * percentageCorrection);
				});

			curlyPathsType = curlyPathsTypeEnter.merge(curlyPathsType);

			curlyPathsType.transition()
				.duration(duration)
				.style("opacity", function(d) {
					const thisGroupStyle = sankeySubpartnerLabels.filter(function(e) {
						return e.codeId === d.codeId;
					}).style("display");
					return thisGroupStyle !== "none" ? 1 : 0;
				})
				.attr("d", function(d) {
					const percentageCorrection = d.y1 - d.y0 < textCollisionHeight ? 2.5 : 1;
					return curlyBracket(d.y0 + 0.5, d.y1 - 0.5, -curlyBracketWidth, curlyBracketPercentage * percentageCorrection);
				});

			let totalValuesByType = {
				partner: 0,
				subpartner: 0
			};

			const curlyData = chartState.selectedAggregation === "type" ? [] :
				sankeyData.nodes.reduce(function(acc, curr) {
					if (curr.depth === 2) {
						const partnerType = curr.id.split("#")[0];
						const foundObj = acc.find(function(d) {
							return d.partnerType === partnerType;
						});
						if (foundObj) {
							foundObj.y0 = Math.min(foundObj.y0, curr.y0 + 1);
							foundObj.y1 = Math.max(foundObj.y1, curr.y1 - 1);
						} else {
							acc.push({
								partnerType: partnerType,
								y0: curr.y0 + 1,
								y1: curr.y1 - 1
							});
						};
						totalValuesByType[partnerType] += curr.amount;
						return acc;
					} else {
						return acc;
					}
				}, []);

			let curlyGroups = sankeyPanel.main.selectAll(".pbinadcurlyGroups")
				.data(curlyData, function(d) {
					return d.partnerType;
				});

			const curlyGroupsExit = curlyGroups.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const curlyGroupsEnter = curlyGroups.enter()
				.append("g")
				.attr("class", "pbinadcurlyGroups")
				.style("opacity", 0)
				.attr("transform", function(d) {
					return "translate(" + (sankeyPanel.width - sankeyPanel.padding[1] + curlyGroupPadding) + ",0)";
				});

			const curlyPath = curlyGroupsEnter.append("path")
				.style("fill", "none")
				.style("stroke", "darkslategray")
				.style("stroke-width", "1px")
				.attr("d", function(d) {
					return curlyBracket(d.y0, d.y1, curlyBracketWidth, curlyBracketPercentage);
				});

			const curlyText = curlyGroupsEnter.append("text")
				.attr("class", "pbinadcurlyText")
				.attr("x", curlyBracketWidth + 2)
				.attr("y", function(d) {
					return ((d.y0 + d.y1) / 2) - curlyTextPadding;
				})
				.text(function(d) {
					return curlyTexts[d.partnerType];
				})
				.call(wrapText, sankeyPanel.padding[1] - curlyGroupPadding - curlyBracketWidth - 2)
				.append("tspan")
				.attr("dy", "1.1em")
				.attr("x", curlyBracketWidth + 2)
				.attr("class", "pbinadcurlyTspan")
				.text(function(d) {
					return "(" + formatPercent1dec(totalValuesByType[d.partnerType] / (totalValuesByType.partner + totalValuesByType.subpartner)) + ")";
				});

			curlyGroups = curlyGroupsEnter.merge(curlyGroups);

			if (curlyGroupsEnter.size()) {
				curlyGroups.transition()
					.duration(duration)
					.style("opacity", 1);
			};

			curlyGroups.select("path")
				.transition()
				.duration(duration)
				.attr("d", function(d) {
					return curlyBracket(d.y0, d.y1, curlyBracketWidth, curlyBracketPercentage);
				});

			curlyGroups.select("text")
				.transition()
				.duration(duration)
				.attr("y", function(d) {
					return ((d.y0 + d.y1) / 2) - curlyTextPadding;
				});

			curlyGroups.select(".pbinadcurlyTspan")
				.text(function(d) {
					return "(" + formatPercent1dec(totalValuesByType[d.partnerType] / (totalValuesByType.partner + totalValuesByType.subpartner)) + ")";
				});

			let typePercentageGroup = sankeyPanel.main.selectAll(".pbinadtypePercentageGroup")
				.data(subpartnerLabelsData, function(d) {
					return d.id;
				});

			const typePercentageGroupExit = typePercentageGroup.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const typePercentageGroupEnter = typePercentageGroup.enter()
				.append("g")
				.attr("class", "pbinadtypePercentageGroup")
				.style("opacity", 0)
				.attr("transform", function(d) {
					return "translate(" + (sankeyPanel.width - sankeyPanel.padding[1] + typePercentagePadding) + "," + ((d.y0 + d.y1) / 2) + ")";
				});

			typePercentageGroupEnter.append("text")
				.attr("class", "pbinadtypePercentage")
				.text(function(d) {
					return "$" + formatSIFloat(d.amount).replace("G", "B");
				});

			const typePercentageGroupEnterSubText = typePercentageGroupEnter.append("text")
				.attr("class", "pbinadtypePercentageSubText")
				.attr("dy", "1.2em")
				.text(function(d) {
					localVariable.set(this, d.amount / totalAllocated);
					return "(" + formatPercent1dec(d.amount / totalAllocated) + ")";
				});

			typePercentageGroup = typePercentageGroupEnter.merge(typePercentageGroup);

			typePercentageGroup.call(hideLabels, textCollisionHeight * 3)
				.transition()
				.duration(duration)
				.style("opacity", chartState.selectedAggregation === "type" ? 1 : 0)
				.attr("transform", function(d) {
					return "translate(" + (sankeyPanel.width - sankeyPanel.padding[1] + typePercentagePadding) + "," + ((d.y0 + d.y1) / 2) + ")";
				});

			typePercentageGroup.select(".pbinadtypePercentage")
				.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent.substring(1)) || 0, d.amount);
					return function(t) {
						node.textContent = "$" + formatSIFloat(i(t)).replace("G", "B");
					};
				});

			typePercentageGroup.select(".pbinadtypePercentageSubText")
				.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const oldPercentage = localVariable.get(this);
					localVariable.set(this, d.amount / totalAllocated);
					const i = d3.interpolate(oldPercentage, d.amount / totalAllocated);
					return function(t) {
						node.textContent = "(" + formatPercent1dec(i(t)) + ")";
					};
				});

			sankeyNodes.on("mouseover", function(d) {
				if (d.level === 1) mouseoverFund(d, this);
				if (d.level === 2) mouseoverPartners(d, this);
				if (d.level === 3) mouseoverSubpartners(d, this);
			}).on("mouseout", mouseOut);

			sankeyLinks.on("mouseover", function(d) {
				if (d.sourceLevel === 1) mouseoverLinkLevel1(d, this);
				if (d.sourceLevel === 2) mouseoverLinkLevel2(d, this);
			}).on("mouseout", mouseOut);

			function mouseOut() {
				if (isSnapshotTooltipVisible) return;
				currentHoveredElement = null;
				tooltip.style("display", "none");
				sankeyNodes.style("opacity", 1);
				sankeyLinks.style("stroke-opacity", linksOpacity);
				sankeyFundLabels.style("opacity", 1)
					.call(hideLabels, textCollisionHeight);
				sankeyPartnerLabels.style("opacity", 1)
					.call(hideLabels, textCollisionHeight);
				sankeyPartnerValuesLabels.style("opacity", 1)
					.call(hideLabels, textCollisionHeight * 3);
				sankeySubpartnerLabels.style("opacity", 1)
					.call(hideLabels, textCollisionHeight * (chartState.selectedAggregation === "level" ? 1 : 3));
				curlyPathsType.style("opacity", 1);
				typePercentageGroup.style("opacity", chartState.selectedAggregation === "type" ? 1 : 0)
					.call(hideLabels, textCollisionHeight * 3);
				curlyGroups.style("opacity", 1);
			};

			function mouseoverFund(d, thisElement) {
				currentHoveredElement = thisElement;
				sankeyNodes.style("opacity", function(e) {
					return (e.id === d.id) || (e.targetLinks.find(function(f) {
						return f.fund === d.codeId;
					})) ? 1 : fadeOpacityNodes;
				});
				if (chartState.selectedAggregation === "type") checkThirdLevelOpacity();
				sankeyLinks.style("stroke-opacity", function(e) {
					return e.fund === d.codeId ? linksOpacity : fadeOpacityLinks;
				});
				sankeyFundLabels.style("opacity", function(e) {
						return (e.id === d.id) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.id === d.id;
					})
					.style("display", null);
				sankeyPartnerLabels.style("opacity", function(e) {
						return e.targetLinks.find(function(f) {
							return f.fund === d.codeId;
						}) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.targetLinks.find(function(f) {
							return f.fund === d.codeId;
						})
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight);
				sankeyPartnerValuesLabels.style("opacity", function(e) {
						return e.targetLinks.find(function(f) {
							return f.fund === d.codeId;
						}) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.targetLinks.find(function(f) {
							return f.fund === d.codeId;
						})
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight * 3);
				sankeySubpartnerLabels.style("opacity", function(e) {
						return e.targetLinks.find(function(f) {
							return f.fund === d.codeId;
						}) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.targetLinks.find(function(f) {
							return f.fund === d.codeId;
						})
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight * (chartState.selectedAggregation === "level" ? 1 : 3));
				curlyPathsType.style("opacity", function(e) {
					return e.targetLinks.find(function(f) {
						return f.fund === d.codeId;
					}) ? 1 : fadeOpacityNodes;
				});
				typePercentageGroup.style("opacity", function(e) {
						return e.targetLinks.find(function(f) {
							return f.fund === d.codeId;
						}) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.targetLinks.find(function(f) {
							return f.fund === d.codeId;
						})
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight);
				curlyGroups.style("opacity", 0);
				createTooltipFunds(d, thisElement);
			};

			function mouseoverPartners(d, thisElement) {
				currentHoveredElement = thisElement;
				sankeyNodes.style("opacity", function(e) {
					return (e.id === d.id) || (e.sourceLinks.find(function(f) {
						return f.target.id === d.id;
					})) || (e.targetLinks.find(function(f) {
						return f.source.id === d.id;
					})) ? 1 : fadeOpacityNodes;
				});
				if (chartState.selectedAggregation === "type") checkThirdLevelOpacity();
				sankeyLinks.style("stroke-opacity", function(e) {
					return e.source.id === d.id || e.target.id === d.id ? linksOpacity : fadeOpacityLinks;
				});
				sankeyFundLabels.style("opacity", function(e) {
						return (e.sourceLinks.find(function(f) {
							return f.target.id === d.id;
						})) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return (e.sourceLinks.find(function(f) {
							return f.target.id === d.id;
						}));
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight);
				sankeyPartnerLabels.style("opacity", function(e) {
						return e.codeId === d.codeId ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.codeId === d.codeId
					})
					.style("display", null);
				sankeyPartnerValuesLabels.style("opacity", function(e) {
						return e.codeId === d.codeId ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.codeId === d.codeId
					})
					.style("display", null);
				sankeySubpartnerLabels.style("opacity", function(e) {
						return e.targetLinks.find(function(f) {
							return f.source.id === d.id;
						}) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.targetLinks.find(function(f) {
							return f.source.id === d.id;
						});
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight * (chartState.selectedAggregation === "level" ? 1 : 3));
				curlyPathsType.style("opacity", function(e) {
					return e.targetLinks.find(function(f) {
						return f.source.id === d.id;
					}) ? 1 : fadeOpacityNodes;
				});
				typePercentageGroup.style("opacity", function(e) {
						return e.targetLinks.find(function(f) {
							return f.source.id === d.id;
						}) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.targetLinks.find(function(f) {
							return f.source.id === d.id;
						});
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight * 3);
				curlyGroups.style("opacity", 0);
				createTooltipPartners(d, thisElement);
			};

			function mouseoverSubpartners(d, thisElement) {
				currentHoveredElement = thisElement;
				let thisFirstLevelLinks;
				if (chartState.selectedAggregation === "level") {
					thisFirstLevelLinks = d.targetLinks.map(function(e) {
						return e.fund + "_" + e.source.id;
					});
				} else {
					thisFirstLevelLinks = [];
					sankeyNodes.each(function(e) {
						if (e.codeId === d.codeId && e.level === 3) {
							thisFirstLevelLinks.push.apply(thisFirstLevelLinks, e.targetLinks.map(function(f) {
								return f.fund + "_" + f.source.id;
							}));
						};
					});
				};
				sankeyNodes.style("opacity", function(e) {
					return (e.id === d.id) || (e.sourceLinks.find(function(f) {
						return (chartState.selectedAggregation === "level" ? f.target.id === d.id : f.target.codeId === d.codeId);
					})) || (thisFirstLevelLinks.find(function(f) {
						return f.split("_")[0] === e.codeId;
					})) || (chartState.selectedAggregation === "type" && d.codeId === e.codeId) ? 1 : fadeOpacityNodes;
				});
				sankeyLinks.style("stroke-opacity", function(e) {
					return (chartState.selectedAggregation === "level" ? e.target.id === d.id : e.target.codeId === d.codeId) ||
						(e.sourceLevel === 1 && thisFirstLevelLinks.indexOf(e.fund + "_" + e.target.id) > -1) ? linksOpacity : fadeOpacityLinks;
				});
				sankeyFundLabels.style("opacity", function(e) {
						return (thisFirstLevelLinks.find(function(f) {
							return f.split("_")[0] === e.codeId;
						})) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return (thisFirstLevelLinks.find(function(f) {
							return f.split("_")[0] === e.codeId;
						}));
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight);
				sankeyPartnerLabels.style("opacity", function(e) {
						return (e.sourceLinks.find(function(f) {
							return (chartState.selectedAggregation === "level" ? f.target.id === d.id : f.target.codeId === d.codeId);
						})) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return (e.sourceLinks.find(function(f) {
							return (chartState.selectedAggregation === "level" ? f.target.id === d.id : f.target.codeId === d.codeId);
						}));
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight);
				sankeyPartnerValuesLabels.style("opacity", function(e) {
						return (e.sourceLinks.find(function(f) {
							return (chartState.selectedAggregation === "level" ? f.target.id === d.id : f.target.codeId === d.codeId);
						})) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return (e.sourceLinks.find(function(f) {
							return (chartState.selectedAggregation === "level" ? f.target.id === d.id : f.target.codeId === d.codeId);
						}));
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight * 3);
				sankeySubpartnerLabels.style("opacity", function(e) {
						if (chartState.selectedAggregation === "level") {
							return e.id === d.id ? 1 : fadeOpacityNodes;
						} else {
							return e.codeId === d.codeId ? 1 : fadeOpacityNodes;
						};
					})
					.filter(function(e) {
						if (chartState.selectedAggregation === "level") {
							return e.id === d.id;
						} else {
							return e.codeId === d.codeId;
						};
					})
					.style("display", null);
				curlyPathsType.style("opacity", function(e) {
					return e.codeId === d.codeId ? 1 : fadeOpacityNodes;
				});
				typePercentageGroup.style("opacity", function(e) {
						if (chartState.selectedAggregation === "level") {
							return e.id === d.id ? 1 : fadeOpacityNodes;
						} else {
							return e.codeId === d.codeId ? 1 : fadeOpacityNodes;
						};
					})
					.filter(function(e) {
						if (chartState.selectedAggregation === "level") {
							return e.id === d.id;
						} else {
							return e.codeId === d.codeId;
						};
					})
					.style("display", null);
				curlyGroups.style("opacity", 0);
				if (d.id.split("#")[0] === "partner") {
					createTooltipPartnersLevel3(d, thisElement);
				} else {
					createTooltipSubpartners(d, thisElement);
				};
			};

			function mouseoverLinkLevel1(d, thisElement) {
				currentHoveredElement = thisElement;
				const secondLevelLinksData = sankeyLinks.filter(function(e) {
					return e.source.id === d.target.id && e.fund === d.fund;
				}).data();
				sankeyNodes.style("opacity", function(e) {
					return e.codeId === d.fund || (e.id === d.target.id) ||
						(secondLevelLinksData.find(function(f) {
							return f.target.id === e.id;
						})) ? 1 : fadeOpacityNodes;
				});
				if (chartState.selectedAggregation === "type") checkThirdLevelOpacity();
				sankeyLinks.style("stroke-opacity", function(e) {
					return e.index === d.index || (e.source.id === d.target.id && e.fund === d.fund) ? linksOpacity : fadeOpacityLinks;
				});
				sankeyFundLabels.style("opacity", function(e) {
						return (e.codeId === d.fund) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.codeId === d.fund;
					})
					.style("display", null);
				sankeyPartnerLabels.style("opacity", function(e) {
						return e.id === d.target.id ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.id === d.target.id;
					})
					.style("display", null);
				sankeyPartnerValuesLabels.style("opacity", function(e) {
						return e.id === d.target.id ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.id === d.target.id;
					})
					.style("display", null);
				sankeySubpartnerLabels.style("opacity", function(e) {
						return secondLevelLinksData.find(function(f) {
							if (chartState.selectedAggregation === "level") {
								return f.target.id === e.id;
							} else {
								return f.target.codeId === e.codeId;
							};
						}) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return secondLevelLinksData.find(function(f) {
							if (chartState.selectedAggregation === "level") {
								return f.target.id === e.id;
							} else {
								return f.target.codeId === e.codeId;
							};
						});
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight * (chartState.selectedAggregation === "level" ? 1 : 3));
				curlyPathsType.style("opacity", function(e) {
					return secondLevelLinksData.find(function(f) {
						return f.target.codeId === e.codeId;
					}) ? 1 : fadeOpacityNodes;
				});
				typePercentageGroup.style("opacity", function(e) {
						return secondLevelLinksData.find(function(f) {
							if (chartState.selectedAggregation === "level") {
								return f.target.id === e.id;
							} else {
								return f.target.codeId === e.codeId;
							};
						}) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return secondLevelLinksData.find(function(f) {
							if (chartState.selectedAggregation === "level") {
								return f.target.id === e.id;
							} else {
								return f.target.codeId === e.codeId;
							};
						});
					})
					.style("display", null)
					.call(hideLabels, textCollisionHeight * 3);
				curlyGroups.style("opacity", 0);
				createTooltipLinksLevel1(d, thisElement);
			};

			function mouseoverLinkLevel2(d, thisElement) {
				currentHoveredElement = thisElement;
				const firstLevelLinksData = sankeyLinks.filter(function(e) {
					return e.target.id === d.source.id && e.fund === d.fund;
				}).data();
				sankeyNodes.style("opacity", function(e) {
					return (e.id === d.source.id) || (e.id === d.target.id) ||
						(firstLevelLinksData.find(function(f) {
							return f.source.id === e.id;
						})) ? 1 : fadeOpacityNodes;
				});
				if (chartState.selectedAggregation === "type") checkThirdLevelOpacity();
				sankeyLinks.style("stroke-opacity", function(e) {
					return e.index === d.index || (e.target.id === d.source.id && e.fund === d.fund) ? linksOpacity : fadeOpacityLinks;
				});
				sankeyFundLabels.style("opacity", function(e) {
						return (firstLevelLinksData.find(function(f) {
							return f.fund === e.codeId;
						})) ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return firstLevelLinksData.find(function(f) {
							return f.fund === e.codeId;
						});
					})
					.style("display", null);
				sankeyPartnerLabels.style("opacity", function(e) {
						return e.id === d.source.id ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.id === d.source.id;
					})
					.style("display", null);
				sankeyPartnerValuesLabels.style("opacity", function(e) {
						return e.id === d.source.id ? 1 : fadeOpacityNodes;
					})
					.filter(function(e) {
						return e.id === d.source.id;
					})
					.style("display", null);
				sankeySubpartnerLabels.style("opacity", function(e) {
						if (chartState.selectedAggregation === "level") {
							return e.id === d.target.id ? 1 : fadeOpacityNodes;
						} else {
							return e.codeId === d.target.codeId ? 1 : fadeOpacityNodes;
						};
					})
					.filter(function(e) {
						if (chartState.selectedAggregation === "level") {
							return e.id === d.target.id;
						} else {
							return e.codeId === d.target.codeId;
						};
					})
					.style("display", null);
				curlyPathsType.style("opacity", function(e) {
					return e.codeId === d.target.codeId ? 1 : fadeOpacityNodes;
				});
				typePercentageGroup.style("opacity", function(e) {
						if (chartState.selectedAggregation === "level") {
							return e.id === d.target.id ? 1 : fadeOpacityNodes;
						} else {
							return e.codeId === d.target.codeId ? 1 : fadeOpacityNodes;
						};
					})
					.filter(function(e) {
						if (chartState.selectedAggregation === "level") {
							return e.id === d.target.id;
						} else {
							return e.codeId === d.target.codeId;
						};
					})
					.style("display", null);
				curlyGroups.style("opacity", 0);
				createTooltipLinksLevel2(d, thisElement);
			};

			function createTooltipFunds(datum, thisElement) {

				tooltip.style("display", "block")
					.html(null);

				const innerTooltip = tooltip.append("div")
					.style("margin-bottom", "10px")
					.style("color", "dimgray")
					.style("width", "300px");

				innerTooltip.append("div")
					.append("strong")
					.html(datum.name);

				innerTooltip.append("div")
					.style("margin-bottom", "8px")
					.style("font-size", "12px")
					.html("(Fund)");

				const tooltipContainer = innerTooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "100%");

				const fundLinks = sankeyData.links.filter(function(d) {
					return d.fund === datum.codeId;
				});

				const tooltipData = [datum.amount, d3.sum(fundLinks.filter(function(d) {
					return d.target.id.split("#")[0] === "subpartner";
				}), function(d) {
					return d.value;
				})];

				tooltipData.forEach(function(e, i) {
					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 56%")
						.html(i ? "Transferred to sub-impl.:" : "Total allocated:");

					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 44%")
						.style("justify-content", "flex-end")
						.style("align-items", "flex-end")
						.html("$" + formatMoney0Decimals(e));
				});

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("width", "100%")
					.style("font-size", "12px")
					.style("justify-content", "flex-end")
					.html("(" + formatPercent1dec(tooltipData[0] ? (tooltipData[1] / tooltipData[0]) : 0) + " of total)");

				const svgData = fundLinks.reduce(function(acc, curr) {
					if (curr.sourceLevel === 2) {
						const partnerLevel = curr.target.id.split("#")[0];
						const foundPartner = acc.find(function(e) {
							return e.codeId === curr.target.codeId;
						});
						if (foundPartner) {
							foundPartner.partnerValue += partnerLevel === "partner" ? curr.value : 0;
							foundPartner.subpartnerValue += partnerLevel === "subpartner" ? curr.value : 0;
						} else {
							acc.push({
								codeId: curr.target.codeId,
								partnerValue: partnerLevel === "partner" ? curr.value : 0,
								subpartnerValue: partnerLevel === "subpartner" ? curr.value : 0
							});
						};
					};
					return acc;
				}, []);

				if (svgData.length) {

					const tooltipSvgPadding = [12, 60, 2, 70];

					svgData.sort(function(a, b) {
						return (b.partnerValue + b.subpartnerValue) - (a.partnerValue + a.subpartnerValue);
					});

					innerTooltip.append("div")
						.style("margin-bottom", "4px")
						.style("margin-top", "10px")
						.html("Net funding (numbers represent <span style='color:#333;font-style:italic;'>total</span> and <span style='color:" + subpartnerColor + ";font-style:italic;'>sub-implementing</span>):");

					const tooltipSvgHeight = tooltipSvgPadding[0] + tooltipSvgPadding[2] + svgData.length * lollipopSvgGroupHeight;

					const tooltipSvg = tooltip.append("svg")
						.attr("width", tooltipSvgWidth)
						.attr("height", tooltipSvgHeight);

					tooltipSvgYScale.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
						.domain(svgData.map(function(d) {
							return d.codeId;
						}))
						.padding(0.5);

					tooltipSvgXAxis.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]));

					tooltipSvgYAxis.tickFormat(function(d) {
						return d === "O" ? "RC/RCS" : subPartnersList[d];
					});

					const namesLengthArray = []

					const subpartnerNames = invisibleLayer.selectAll(null)
						.data(tooltipSvgYScale.domain())
						.enter()
						.append("text")
						.style("font-size", "11px")
						.style("font-family", "Arial")
						.text(function(d) {
							return d === "O" ? "RC/RCS" : subPartnersList[d];
						})
						.each(function(d) {
							namesLengthArray.push(this.getComputedTextLength());
						});

					invisibleLayer.selectAll("*").remove();

					tooltipSvgPadding[3] = d3.max(namesLengthArray) + 6;

					tooltipSvgXScale.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]])
						.domain([0, d3.max(svgData, function(d) {
							return d.partnerValue + d.subpartnerValue;
						})]);

					const yAxisGroup = tooltipSvg.append("g")
						.attr("class", "pbinadTooltipSvgYAxisGroup")
						.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
						.call(tooltipSvgYAxis);

					const xAxisGroup = tooltipSvg.append("g")
						.attr("class", "pbinadTooltipSvgXAxisGroup")
						.attr("transform", "translate(0," + tooltipSvgPadding[0] + ")")
						.call(tooltipSvgXAxis)
						.selectAll(".tick")
						.filter(function(d) {
							return d === 0;
						})
						.remove();

					const lollipopGroups = tooltipSvg.selectAll(null)
						.data(svgData)
						.enter()
						.append("g")
						.attr("transform", function(d) {
							return "translate(0," + tooltipSvgYScale(d.codeId) + ")";
						})
						.each(function(d) {
							d3.select(this).append("rect")
								.attr("x", tooltipSvgPadding[3])
								.attr("y", -stickHeight / 4)
								.attr("height", stickHeight)
								.attr("width", 0)
								.style("fill", partnerColor)
								.transition()
								.duration(duration)
								.attr("width", tooltipSvgXScale(d.partnerValue + d.subpartnerValue) - tooltipSvgPadding[3]);

							d3.select(this).append("rect")
								.attr("x", tooltipSvgPadding[3])
								.attr("y", -stickHeight / 4)
								.attr("height", stickHeight)
								.attr("width", 0)
								.style("fill", subpartnerColor)
								.transition()
								.duration(duration)
								.attr("width", tooltipSvgXScale(d.subpartnerValue) - tooltipSvgPadding[3]);

							d3.select(this).append("circle")
								.attr("cx", tooltipSvgPadding[3])
								.attr("cy", (stickHeight / 4))
								.attr("r", lollipopRadius)
								.style("fill", function(d) {
									return d.partnerValue ? partnerColor : subpartnerColor;
								})
								.transition()
								.duration(duration)
								.attr("cx", tooltipSvgXScale(d.partnerValue + d.subpartnerValue));

							d3.select(this).append("text")
								.attr("class", "pbinadtooltipSvgLabel")
								.attr("x", tooltipSvgXScale(0))
								.attr("y", 4)
								.text(formatNumberSI(0))
								.transition()
								.duration(duration)
								.attr("x", tooltipSvgXScale(d.partnerValue + d.subpartnerValue) + labelPadding + lollipopRadius)
								.tween("text", function() {
									const node = this;
									const i = d3.interpolate(0, (d.partnerValue + d.subpartnerValue));
									const iSub = d3.interpolate(0, d.subpartnerValue);
									return function(t) {
										d3.select(node)
											.text(d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B"))
											.append("tspan")
											.style("fill", subpartnerColor)
											.text(" (" + d3.formatPrefix(".0", iSub(t))(iSub(t)).replace("G", "B") + ")");
									};
								});
						});

				};

				const thisBox = thisElement.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top - tooltipBox.height - tooltipVerticalPadding;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", "0px");

			};

			function createTooltipPartners(datum, thisElement) {

				tooltip.style("display", "block")
					.html(null);

				const innerTooltip = tooltip.append("div")
					.style("margin-bottom", "10px")
					.style("color", "dimgray")
					.style("width", "300px");

				innerTooltip.append("div")
					.append("strong")
					.html(datum.name);

				innerTooltip.append("div")
					.style("margin-bottom", "8px")
					.style("font-size", "12px")
					.html("(Direct Partner)");

				const tooltipContainer = innerTooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "100%");

				const tooltipData = [datum.amount, datum.amount - d3.sum(datum.sourceLinks.filter(function(d) {
					return d.target.id.split("@")[0] === ("partner#" + datum.codeId);
				}), function(d) {
					return d.value;
				})];

				tooltipData.forEach(function(e, i) {
					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 56%")
						.html(i ? "Transferred to sub-impl.:" : "Total received:");

					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 44%")
						.style("justify-content", "flex-end")
						.style("align-items", "flex-end")
						.html("$" + formatMoney0Decimals(e));
				});

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("width", "100%")
					.style("font-size", "12px")
					.style("justify-content", "flex-end")
					.html("(" + formatPercent1dec(tooltipData[0] ? (tooltipData[1] / tooltipData[0]) : 0) + " of total)");

				const svgData = datum.sourceLinks.reduce(function(acc, curr) {
					if (curr.target.id.split("#")[0] === "subpartner") {
						const foundSubpartner = acc.find(function(e) {
							return e.codeId === curr.target.codeId;
						});
						if (foundSubpartner) {
							foundSubpartner.value += curr.value;
						} else {
							acc.push({
								codeId: curr.target.codeId,
								value: curr.value
							});
						};
					};
					return acc;
				}, []);

				if (svgData.length) {

					const tooltipSvgPadding = [12, 36, 2, 70];

					svgData.sort(function(a, b) {
						return b.value - a.value;
					});

					innerTooltip.append("div")
						.style("margin-bottom", "4px")
						.style("margin-top", "10px")
						.html("Sub-implementing partners:");

					const tooltipSvgHeight = tooltipSvgPadding[0] + tooltipSvgPadding[2] + svgData.length * lollipopSvgGroupHeight;

					const tooltipSvg = tooltip.append("svg")
						.attr("width", tooltipSvgWidth)
						.attr("height", tooltipSvgHeight);

					tooltipSvgYScale.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
						.domain(svgData.map(function(d) {
							return d.codeId;
						}))
						.padding(0.5);

					tooltipSvgXAxis.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]));

					tooltipSvgYAxis.tickFormat(function(d) {
						return d === "O" ? "RC/RCS" : subPartnersList[d];
					});

					const namesLengthArray = []

					const subpartnerNames = invisibleLayer.selectAll(null)
						.data(tooltipSvgYScale.domain())
						.enter()
						.append("text")
						.style("font-size", "11px")
						.style("font-family", "Arial")
						.text(function(d) {
							return d === "O" ? "RC/RCS" : subPartnersList[d];
						})
						.each(function(d) {
							namesLengthArray.push(this.getComputedTextLength());
						});

					invisibleLayer.selectAll("*").remove();

					tooltipSvgPadding[3] = d3.max(namesLengthArray) + 6;

					tooltipSvgXScale.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]])
						.domain([0, d3.max(svgData, function(d) {
							return d.value;
						})]);

					const yAxisGroup = tooltipSvg.append("g")
						.attr("class", "pbinadTooltipSvgYAxisGroup")
						.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
						.call(tooltipSvgYAxis);

					const xAxisGroup = tooltipSvg.append("g")
						.attr("class", "pbinadTooltipSvgXAxisGroup")
						.attr("transform", "translate(0," + tooltipSvgPadding[0] + ")")
						.call(tooltipSvgXAxis)
						.selectAll(".tick")
						.filter(function(d) {
							return d === 0;
						})
						.remove();

					const lollipopGroups = tooltipSvg.selectAll(null)
						.data(svgData)
						.enter()
						.append("g")
						.attr("transform", function(d) {
							return "translate(0," + tooltipSvgYScale(d.codeId) + ")";
						})
						.each(function(d) {
							d3.select(this).append("rect")
								.attr("x", tooltipSvgPadding[3])
								.attr("y", -stickHeight / 4)
								.attr("height", stickHeight)
								.attr("width", 0)
								.style("fill", subpartnerColor)
								.transition()
								.duration(duration)
								.attr("width", tooltipSvgXScale(d.value) - tooltipSvgPadding[3]);

							d3.select(this).append("circle")
								.attr("cx", tooltipSvgPadding[3])
								.attr("cy", (stickHeight / 4))
								.attr("r", lollipopRadius)
								.style("fill", subpartnerColor)
								.transition()
								.duration(duration)
								.attr("cx", tooltipSvgXScale(d.value));

							d3.select(this).append("text")
								.attr("class", "pbinadtooltipSvgLabel")
								.attr("x", tooltipSvgXScale(0))
								.attr("y", 4)
								.text(formatNumberSI(0))
								.transition()
								.duration(duration)
								.attr("x", tooltipSvgXScale(d.value) + labelPadding + lollipopRadius)
								.tween("text", function() {
									const node = this;
									const i = d3.interpolate(0, d.value);
									return function(t) {
										node.textContent = d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
									};
								});
						});

				};

				const thisBox = thisElement.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top - tooltipBox.height - tooltipVerticalPadding;

				const thisOffsetLeft = (thisBox.right - thisBox.width / 2) - (tooltipBox.width / 2) - containerBox.left;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");

			};

			function createTooltipPartnersLevel3(datum, thisElement) {

				tooltip.style("display", "block")
					.html(null);

				const innerTooltip = tooltip.append("div")
					.style("margin-bottom", "10px")
					.style("color", "dimgray")
					.style("width", "300px");

				innerTooltip.append("div")
					.append("strong")
					.html(datum.name);

				innerTooltip.append("div")
					.style("margin-bottom", "8px")
					.style("font-size", "12px")
					.html("(Direct Partner)");

				const tooltipContainer = innerTooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "100%");

				const tooltipData = [d3.sum(sankeyData.nodes.filter(function(e) {
					return e.level === 2 && e.codeId === datum.codeId;
				}), function(e) {
					return e.amount;
				}), datum.amount];

				tooltipData.forEach(function(e, i) {
					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 56%")
						.html(i ? "Amount kept:" : "Total received:");

					tooltipContainer.append("div")
						.style("display", "flex")
						.style("flex", "0 44%")
						.style("justify-content", "flex-end")
						.style("align-items", "flex-end")
						.html("$" + formatMoney0Decimals(e));
				});

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("width", "100%")
					.style("font-size", "12px")
					.style("justify-content", "flex-end")
					.html("(" + formatPercent1dec(tooltipData[0] ? (tooltipData[1] / tooltipData[0]) : 0) + " of total)");

				const totalForPartner = d3.sum(sankeyData.nodes.filter(function(e) {
					return e.codeId === datum.codeId && e.level === 3;
				}), function(e) {
					return e.amount;
				});

				const increaseOrDecrease = totalForPartner > tooltipData[0] ? "increase" : "decrease";

				const spanColor = totalForPartner > tooltipData[0] ? d3.color(greenArrowColor).darker(0.2) : redArrowColor;

				if (totalForPartner === tooltipData[0]) {
					innerTooltip.append("div")
						.style("margin-top", "10px")
						.html("Summing up direct and sub-impl. partners, " +
							datum.name + " has a total of " + formatMoney0Decimals(totalForPartner) + ", which is neither an increase nor a decrease.");
				} else {
					innerTooltip.append("div")
						.style("margin-top", "10px")
						.html("Summing up direct and sub-impl. partners, " +
							datum.name + " has a total of $" + formatMoney0Decimals(totalForPartner) + ", which is " + (increaseOrDecrease === "increase" ? "an" : "a") +
							" <span style='color:" + spanColor + ";'>" + increaseOrDecrease + "</span> of " + formatPercent1dec(Math.abs((totalForPartner / tooltipData[0]) - 1)) + ".");
				};

				const thisBox = thisElement.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top - tooltipBox.height - tooltipVerticalPadding;

				const thisOffsetLeft = containerBox.width - tooltipBox.width;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");

			};

			function createTooltipSubpartners(datum, thisElement) {
				tooltip.style("display", "block")
					.html(null);

				const innerTooltip = tooltip.append("div")
					.style("margin-bottom", "10px")
					.style("color", "dimgray")
					.style("width", "300px");

				innerTooltip.append("div")
					.append("strong")
					.html(datum.name);

				innerTooltip.append("div")
					.style("margin-bottom", "8px")
					.style("font-size", "12px")
					.html("(Sub-implementing Partner)");

				const tooltipContainer = innerTooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "100%");

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("flex", "0 56%")
					.html("Total received:");

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("flex", "0 44%")
					.style("justify-content", "flex-end")
					.style("align-items", "flex-end")
					.html("$" + formatMoney0Decimals(datum.value));

				const totalForPartner = d3.sum(sankeyData.nodes.filter(function(e) {
					return e.codeId === datum.codeId && e.level === 3;
				}), function(e) {
					return e.amount;
				});

				const totalLevel2 = d3.sum(sankeyData.nodes.filter(function(e) {
					return e.level === 2 && e.codeId === datum.codeId;
				}), function(e) {
					return e.amount;
				});

				tooltipContainer.append("div")
					.style("font-size", "12px")
					.html("(representing " + formatPercent1dec(totalForPartner ? (datum.value / totalForPartner) : 0) + " of all resources for this partner)");

				if (partnersListKeys.indexOf(datum.codeId) > -1) {
					const increaseOrDecrease = totalForPartner > totalLevel2 ? "increase" : "decrease";

					const spanColor = totalForPartner > totalLevel2 ? d3.color(greenArrowColor).darker(0.2) : redArrowColor;

					if (totalForPartner === totalLevel2) {
						innerTooltip.append("div")
							.style("margin-top", "10px")
							.html("Summing up direct and sub-impl. partners, " +
								datum.name + " has a total of " + formatMoney0Decimals(totalForPartner) + ", which is neither an increase nor a decrease.");
					} else {
						innerTooltip.append("div")
							.style("margin-top", "10px")
							.html("Summing up direct and sub-impl. partners, " +
								datum.name + " has a total of $" + formatMoney0Decimals(totalForPartner) + ", which is " + (increaseOrDecrease === "increase" ? "an" : "a") +
								" <span style='color:" + spanColor + ";'>" + increaseOrDecrease + "</span> of " + formatPercent1dec(Math.abs((totalForPartner / totalLevel2) - 1)) + ".");
					};
				};

				const svgData = datum.targetLinks.reduce(function(acc, curr) {
					if (curr.target.id.split("#")[0] === "subpartner") {
						const foundPartner = acc.find(function(e) {
							return e.codeId === curr.source.codeId;
						});
						if (foundPartner) {
							foundPartner.value += curr.value;
						} else {
							acc.push({
								codeId: curr.source.codeId,
								value: curr.value
							});
						};
					};
					return acc;
				}, []);

				if (svgData.length) {

					const tooltipSvgPadding = [12, 36, 2, 70];

					svgData.sort(function(a, b) {
						return b.value - a.value;
					});

					innerTooltip.append("div")
						.style("margin-bottom", "4px")
						.style("margin-top", "10px")
						.html("Resources from direct partners:");

					const tooltipSvgHeight = tooltipSvgPadding[0] + tooltipSvgPadding[2] + svgData.length * lollipopSvgGroupHeight;

					const tooltipSvg = tooltip.append("svg")
						.attr("width", tooltipSvgWidth)
						.attr("height", tooltipSvgHeight);

					tooltipSvgYScale.range([tooltipSvgPadding[0], tooltipSvgHeight - tooltipSvgPadding[2]])
						.domain(svgData.map(function(d) {
							return d.codeId;
						}))
						.padding(0.5);

					tooltipSvgXAxis.tickSizeInner(-(tooltipSvgHeight - tooltipSvgPadding[0] - tooltipSvgPadding[2]));

					tooltipSvgYAxis.tickFormat(function(d) {
						return d === "O" ? "RC/RCS" : subPartnersList[d];
					});

					const namesLengthArray = []

					const subpartnerNames = invisibleLayer.selectAll(null)
						.data(tooltipSvgYScale.domain())
						.enter()
						.append("text")
						.style("font-size", "11px")
						.style("font-family", "Arial")
						.text(function(d) {
							return d === "O" ? "RC/RCS" : subPartnersList[d];
						})
						.each(function(d) {
							namesLengthArray.push(this.getComputedTextLength());
						});

					invisibleLayer.selectAll("*").remove();

					tooltipSvgPadding[3] = d3.max(namesLengthArray) + 6;

					tooltipSvgXScale.range([tooltipSvgPadding[3], tooltipSvgWidth - tooltipSvgPadding[1]])
						.domain([0, d3.max(svgData, function(d) {
							return d.value;
						})]);

					const yAxisGroup = tooltipSvg.append("g")
						.attr("class", "pbinadTooltipSvgYAxisGroup")
						.attr("transform", "translate(" + tooltipSvgPadding[3] + ",0)")
						.call(tooltipSvgYAxis);

					const xAxisGroup = tooltipSvg.append("g")
						.attr("class", "pbinadTooltipSvgXAxisGroup")
						.attr("transform", "translate(0," + tooltipSvgPadding[0] + ")")
						.call(tooltipSvgXAxis)
						.selectAll(".tick")
						.filter(function(d) {
							return d === 0;
						})
						.remove();

					const lollipopGroups = tooltipSvg.selectAll(null)
						.data(svgData)
						.enter()
						.append("g")
						.attr("transform", function(d) {
							return "translate(0," + tooltipSvgYScale(d.codeId) + ")";
						})
						.each(function(d) {
							d3.select(this).append("rect")
								.attr("x", tooltipSvgPadding[3])
								.attr("y", -stickHeight / 4)
								.attr("height", stickHeight)
								.attr("width", 0)
								.style("fill", partnerColor)
								.transition()
								.duration(duration)
								.attr("width", tooltipSvgXScale(d.value) - tooltipSvgPadding[3]);

							d3.select(this).append("circle")
								.attr("cx", tooltipSvgPadding[3])
								.attr("cy", (stickHeight / 4))
								.attr("r", lollipopRadius)
								.style("fill", partnerColor)
								.transition()
								.duration(duration)
								.attr("cx", tooltipSvgXScale(d.value));

							d3.select(this).append("text")
								.attr("class", "pbinadtooltipSvgLabel")
								.attr("x", tooltipSvgXScale(0))
								.attr("y", 4)
								.text(formatNumberSI(0))
								.transition()
								.duration(duration)
								.attr("x", tooltipSvgXScale(d.value) + labelPadding + lollipopRadius)
								.tween("text", function() {
									const node = this;
									const i = d3.interpolate(0, d.value);
									return function(t) {
										node.textContent = d3.formatPrefix(".0", i(t))(i(t)).replace("G", "B");
									};
								});
						});

				};

				const thisBox = thisElement.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top - tooltipBox.height - tooltipVerticalPadding;

				const thisOffsetLeft = containerBox.width - tooltipBox.width;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");
			};

			function createTooltipLinksLevel1(datum, thisElement) {

				tooltip.style("display", "block")
					.html(null);

				const innerTooltip = tooltip.append("div")
					.style("margin-bottom", "10px")
					.style("color", "dimgray")
					.style("width", "250px");

				innerTooltip.append("div")
					.html("From: <strong>" + cbpfsList[datum.fund] + "</strong>");

				innerTooltip.append("div")
					.style("margin-bottom", "8px")
					.html("To: " + partnersList[datum.target.codeId] + " (Direct Partner)");

				const tooltipContainer = innerTooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "100%");

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("flex", "0 56%")
					.html("Amount:");

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("flex", "0 44%")
					.style("justify-content", "flex-end")
					.style("align-items", "flex-end")
					.html("$" + formatMoney0Decimals(datum.value));

				const thisBox = thisElement.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top - tooltipBox.height - tooltipVerticalPadding;

				const thisOffsetLeft = thisBox.left + (thisBox.width / 2) - containerBox.left - tooltipBox.width / 2;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");
			};

			function createTooltipLinksLevel2(datum, thisElement) {

				tooltip.style("display", "block")
					.html(null);

				const innerTooltip = tooltip.append("div")
					.style("margin-bottom", "10px")
					.style("color", "dimgray")
					.style("width", "250px");

				innerTooltip.append("div")
					.style("margin-bottom", "8px")
					.html("Fund: <strong>" + cbpfsList[datum.fund] + "</strong>");

				innerTooltip.append("div")
					.html("From: " + partnersList[datum.source.codeId]);

				innerTooltip.append("div")
					.style("margin-bottom", "8px")
					.html("To: " + partnersList[datum.target.codeId] + (datum.target.id.split("#")[0] === "partner" ?
						" (direct partner)" : " (sub-implementing partner)"));

				const tooltipContainer = innerTooltip.append("div")
					.style("margin", "0px")
					.style("display", "flex")
					.style("flex-wrap", "wrap")
					.style("width", "100%");

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("flex", "0 56%")
					.html("Amount:");

				tooltipContainer.append("div")
					.style("display", "flex")
					.style("flex", "0 44%")
					.style("justify-content", "flex-end")
					.style("align-items", "flex-end")
					.html("$" + formatMoney0Decimals(datum.value));

				if (datum.target.id.split("#")[0] === "partner") {
					innerTooltip.append("div")
						.style("margin-top", "10px")
						.style("font-size", "12px")
						.html("Note: this link just represents the amount kept by the direct partner.")
				};

				const thisBox = thisElement.getBoundingClientRect();

				const containerBox = containerDiv.node().getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top - tooltipBox.height - tooltipVerticalPadding;

				const thisOffsetLeft = thisBox.left + (thisBox.width / 2) - containerBox.left - tooltipBox.width / 2;

				tooltip.style("top", thisOffsetTop + "px")
					.style("left", thisOffsetLeft + "px");
			};

			function checkThirdLevelOpacity() {
				const highlighted = [];
				sankeyNodes.each(function(d) {
					if (d.level === 3 && this.style.opacity === "1") highlighted.push(d.codeId);
				});
				sankeyNodes.each(function(d) {
					if (d.level === 3 && highlighted.indexOf(d.codeId) > -1 && this.style.opacity !== "1") {
						d3.select(this).style("opacity", 1);
					};
				});
			};

			buttonsPanel.main.selectAll(".pbinadbuttonsAggregationRects")
				.on("click", function(d) {

					chartState.selectedAggregation = d;

					if (queryStringValues.has("aggregate")) {
						queryStringValues.set("aggregate", d);
					} else {
						queryStringValues.append("aggregate", d);
					};

					buttonsPanel.main.selectAll(".pbinadbuttonsAggregationRects")
						.style("fill", function(e) {
							return e === chartState.selectedAggregation ? unBlue : "#eaeaea";
						});

					buttonsPanel.main.selectAll(".pbinadbuttonsAggregationText")
						.style("fill", function(e) {
							return e === chartState.selectedAggregation ? "white" : "#444";
						});

					createSankey(data);

				});

			//end of createSankey
		};

		function createTimeline(rawData) {

			const timelineData = processTimelineData(rawData);

			const timelineHeader = timelineDiv.selectAll(".pbinadtimelineHeader")
				.data([true])
				.enter()
				.append("div")
				.attr("class", "pbinadtimelineHeader")
				.html("Allocation trends by Partners types");

			const timelineSubtitle = timelineDiv.selectAll(".pbinadtimelineSubtitle")
				.data([true])
				.enter()
				.append("div")
				.attr("class", "pbinadtimelineSubtitle")
				.html("Trends for the last three complete years (from " + (currentYear - 4) + " to " + (currentYear - 1) +
					"). Green triangle (<span class='fa' style='color:" + greenArrowColor + ";'>\u25B2</span>) means increase, red triangle (<span class='fa' style='color:" + redArrowColor + ";'>\u25BC</span>) means decrease.");

			let timelineContainer = timelineDiv.selectAll(".pbinadtimelineContainer")
				.data([true]);

			timelineContainer = timelineContainer.enter()
				.append("div")
				.attr("class", "pbinadtimelineContainer")
				.merge(timelineContainer);

			let timelines = timelineContainer.selectAll(".pbinadtimelines")
				.data(timelineData, function(d) {
					return d.partner;
				});

			const timelinesExit = timelines.exit()
				.transition()
				.duration(duration)
				.style("opacity", 0)
				.remove();

			const timelinesEnter = timelines.enter()
				.append("div")
				.attr("class", "pbinadtimelines")
				.style("width", timelinesWidth + "px")
				.style("height", timelinesHeight + "px");

			const timelinesNameDiv = timelinesEnter.append("div")
				.attr("class", "pbinadtimelinesNameDiv")
				.append("p")
				.html(function(d) {
					return aggregationNameRule[d.partner];
				});

			const timelinesChartDiv = timelinesEnter.append("div")
				.attr("class", "pbinadtimelinesChartDiv")

			const timelinesSvg = timelinesChartDiv.append("svg")
				.attr("width", timelineSvgWidth)
				.attr("height", timelineSvgHeight)
				.each(function(d) {
					const thisYScale = localTimelineScale.set(this, d3.scaleLinear()
						.range([timelineSvgHeight - timelineSvgPadding[2], timelineSvgPadding[0]])
						.domain(d3.extent(d.values)));
					localTimelineGenerator.set(this, d3.line()
						.x(function(_, i) {
							return timelineXScale(i);
						})
						.y(function(e) {
							return thisYScale(e);
						}));
				});

			const timelineSvgInitialValue = timelinesSvg.append("text")
				.attr("class", "pbinadtimelineSvgInitialValue")
				.attr("text-anchor", "end")
				.attr("x", timelineSvgPadding[3] - timelineSvgTextPadding)
				.attr("y", function(d) {
					return localTimelineScale.get(this)(d.values[0]) + timelineSvgVertTextPadding;
				})
				.text(function(d) {
					return formatSIFloat(d.values[0]).replace("G", "B");
				});

			const timelineSvgFinalValue = timelinesSvg.append("text")
				.attr("class", "pbinadtimelineSvgFinalValue")
				.attr("x", timelineSvgWidth - timelineSvgPadding[3] + timelineSvgTextPadding)
				.attr("y", function(d) {
					return localTimelineScale.get(this)(d.values[3]) + timelineSvgVertTextPadding;
				})
				.text(function(d) {
					return formatSIFloat(d.values[3]).replace("G", "B");
				});

			const timelineSvgPath = timelinesSvg.append("path")
				.attr("class", "pbinadtimelineSvgPath")
				.style("fill", "none")
				.style("stroke", "#bbb")
				.style("stroke-width", "1px")
				.attr("d", function(d) {
					return localTimelineGenerator.get(this)(d.values);
				});

			const timelinesArrowDiv = timelinesChartDiv.append("div")
				.attr("class", "pbinadtimelinesArrowDiv");

			const timelineArrowAndTextDiv = timelinesArrowDiv.append("div");

			const timelineArrow = timelineArrowAndTextDiv.append("span")
				.attr("class", "pbinadtimelineArrow")
				.style("font-size", "16px")
				.style("color", function(d) {
					return d.values[3] >= d.values[0] ? greenArrowColor : redArrowColor;
				})
				.html(function(d) {
					return d.values[3] >= d.values[0] ? "\u25B2" : "\u25BC";
				});

			const timelinePercentage = timelineArrowAndTextDiv.append("span")
				.attr("class", "pbinadtimelinePercentage")
				.html(function(d) {
					return d.values[0] && d.values[3] ? formatPercent1dec(Math.abs(d.values[3] / d.values[0] - 1)) : "n/a";
				});

			timelines = timelinesEnter.merge(timelines);

			timelines.sort(function(a, b) {
				return b.values[3] - a.values[3];
			});

			timelines.select("svg")
				.each(function(d) {
					const thisYScale = localTimelineScale.set(this, d3.scaleLinear()
						.range([timelineSvgHeight - timelineSvgPadding[2], timelineSvgPadding[0]])
						.domain(d3.extent(d.values)));
					localTimelineGenerator.set(this, d3.line()
						.x(function(_, i) {
							return timelineXScale(i);
						})
						.y(function(e) {
							return thisYScale(e);
						}));
				});

			timelines.select(".pbinadtimelineSvgInitialValue")
				.transition()
				.duration(duration)
				.attr("y", function(d) {
					return localTimelineScale.get(this)(d.values[0]) + timelineSvgVertTextPadding;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent) || 0, d.values[0])
					return function(t) {
						node.textContent = formatSIFloat(i(t)).replace("G", "B");
					};
				});

			timelines.select(".pbinadtimelineSvgFinalValue")
				.transition()
				.duration(duration)
				.attr("y", function(d) {
					return localTimelineScale.get(this)(d.values[3]) + timelineSvgVertTextPadding;
				})
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(reverseFormat(node.textContent) || 0, d.values[3])
					return function(t) {
						node.textContent = formatSIFloat(i(t)).replace("G", "B");
					};
				});

			timelines.select(".pbinadtimelineSvgPath")
				.transition()
				.duration(duration)
				.attr("d", function(d) {
					return localTimelineGenerator.get(this)(d.values);
				});

			timelines.select(".pbinadtimelineArrow")
				.html(function(d) {
					return d.values[3] >= d.values[0] ? "\u25B2" : "\u25BC";
				})
				.style("color", function(d) {
					return d.values[3] >= d.values[0] ? greenArrowColor : redArrowColor;
				});

			timelines.select(".pbinadtimelinePercentage")
				.html(function(d) {
					return d.values[0] && d.values[3] ? formatPercent1dec(Math.abs(d.values[3] / d.values[0] - 1)) : "n/a";
				});

			//end of createTimeline
		};

		function preProcessData(rawData) {

			rawData.forEach(function(row) {
				if (yearsArray.indexOf(+row.year) === -1) yearsArray.push(+row.year);
				if (!cbpfsDataList[row.fund]) cbpfsDataList[row.fund] = cbpfsList[row.fund];
				if (row.fund === "999") cerfInData = true;
			});

			yearsArray.sort(function(a, b) {
				return a - b;
			});

		};

		function processData(rawData) {

			const data = {
				nodes: [],
				links: []
			};

			level3order.length = 0;

			chartState.cbpfsInData.length = 0;

			rawData.forEach(function(row) {

				if (chartState.selectedYear.indexOf(+row.year) > -1 && cbpfsListKeys.indexOf(row.source) > -1 && chartState.cbpfsInData.indexOf(row.source) === -1) {
					chartState.cbpfsInData.push(row.source);
				};

				if (chartState.selectedYear.indexOf(+row.year) > -1 && chartState.selectedCbpfs.indexOf(row.fund) > -1) {

					if (cbpfsListKeys.indexOf(row.source) > -1) {

						const foundSource = data.nodes.find(function(d) {
							return d.level === 1 && d.codeId === row.source;
						});

						const foundTarget = data.nodes.find(function(d) {
							return d.level === 2 && d.codeId === row.target;
						});

						if (foundSource) {
							foundSource.amount += +row.value;
						} else {
							data.nodes.push({
								codeId: row.source,
								level: 1,
								name: cbpfsList[row.source],
								amount: +row.value,
								id: "fund#" + row.source
							});
						};

						if (foundTarget) {
							foundTarget.amount += +row.value;
						} else {
							data.nodes.push({
								codeId: row.target,
								level: 2,
								name: partnersList[row.target],
								amount: +row.value,
								id: "partner#" + row.target + "@level2"
							});
						};

						const foundLink = data.links.find(function(d) {
							return (d.source === "fund#" + row.source) && (d.target === "partner#" + row.target + "@level2");
						});

						if (foundLink) {
							foundLink.value += +row.value;
						} else {
							data.links.push({
								source: "fund#" + row.source,
								target: "partner#" + row.target + "@level2",
								value: +row.value,
								fund: row.fund,
								sourceLevel: 1
							});
						};

					} else {

						const foundTarget = data.nodes.find(function(d) {
							return d.level === 3 && d.codeId === row.target;
						});

						if (foundTarget) {
							foundTarget.amount += +row.value;
						} else {
							data.nodes.push({
								codeId: row.target,
								level: 3,
								name: subPartnersList[row.target],
								aggregatedName: aggregationNameRule[row.target],
								amount: +row.value,
								id: "subpartner#" + row.target
							});
						};

						const foundLink = data.links.find(function(d) {
							return (d.source === "partner#" + row.source + "@level2") && (d.target === "subpartner#" + row.target) && (d.fund === row.fund);
						});

						if (foundLink) {
							foundLink.value += +row.value;
						} else {
							data.links.push({
								source: "partner#" + row.source + "@level2",
								target: "subpartner#" + row.target,
								value: +row.value,
								fund: row.fund,
								sourceLevel: 2
							});
						};

						const foundLevel3 = level3order.find(function(d) {
							return d.partner === row.target;
						});

						if (foundLevel3) {
							foundLevel3.amount += +row.value;
						} else {
							level3order.push({
								partner: row.target,
								amount: +row.value
							});
						};

					};

				};

			});

			const firstLevelLinks = data.links.filter(function(d) {
				return d.sourceLevel === 1;
			});

			const secondLevelLinks = data.links.filter(function(d) {
				return d.sourceLevel === 2;
			});

			firstLevelLinks.forEach(function(link) {
				const thisTotal = link.value;
				const otherLinks = secondLevelLinks.filter(function(d) {
					return d.source === link.target && d.fund === link.fund;
				});
				const othersTotal = d3.sum(otherLinks, function(d) {
					return d.value;
				});
				const remainingTotal = thisTotal - othersTotal;

				if (remainingTotal) {

					const partner = link.target.split(/[#@]+/)[1];

					const foundNode = data.nodes.find(function(d) {
						return d.id === "partner#" + partner + "@level3";
					});

					if (foundNode) {
						foundNode.amount += remainingTotal;
					} else {
						data.nodes.push({
							codeId: partner,
							level: 3,
							name: partnersList[partner],
							aggregatedName: aggregationNameRule[partner],
							amount: remainingTotal,
							id: "partner#" + partner + "@level3"
						});
					};

					data.links.push({
						source: "partner#" + partner + "@level2",
						target: "partner#" + partner + "@level3",
						value: remainingTotal,
						fund: link.fund,
						sourceLevel: 2
					});

					const foundLevel3 = level3order.find(function(d) {
						return d.partner === partner;
					});

					if (foundLevel3) {
						foundLevel3.amount += remainingTotal;
					} else {
						level3order.push({
							partner: partner,
							amount: remainingTotal
						});
					};

				};
			});

			level3order.sort(function(a, b) {
				return a.amount - b.amount;
			});

			return data;

			//end of processData
		};

		function processTimelineData(rawData) {

			const data = [];

			rawData.forEach(function(row) {

				if (chartState.selectedCbpfs.indexOf(row.fund) > -1) {

					const foundSourcePartner = data.find(function(d) {
						return d.partner === row.source && row.targetType === "2";
					});

					const foundTargetPartner = data.find(function(d) {
						return d.partner === row.target;
					});

					if (+row.year < currentYear && +row.year >= (currentYear - 4)) {
						if (foundSourcePartner) {
							foundSourcePartner.values[+row.year - (currentYear - 4)] -= +row.value;
						} else if (!foundSourcePartner && row.targetType === "2") {
							const obj = {
								partner: row.source,
								values: [0, 0, 0, 0]
							};
							obj.values[+row.year - (currentYear - 4)] = -row.value;
							data.push(values);
						};
						if (foundTargetPartner) {
							foundTargetPartner.values[+row.year - (currentYear - 4)] += +row.value;
						} else {
							const obj = {
								partner: row.target,
								values: [0, 0, 0, 0]
							};
							obj.values[+row.year - (currentYear - 4)] = +row.value;
							data.push(obj);
						};
					};

				};

			});

			data.sort(function(a, b) {
				return b.values[3] - a.values[3];
			});

			return data;

			//end of processTimelineData
		}

		function createCsv(rawData) {

			const csvData = [];

			rawData.forEach(function(row) {
				if (chartState.selectedYear.indexOf(+row.year) > -1 && chartState.selectedCbpfs.indexOf(row.fund) > -1) {

					if (cbpfsListKeys.indexOf(row.source) > -1) {
						csvData.push({
							source: cbpfsList[row.source],
							"type of source": "fund",
							target: partnersList[row.target],
							"type of target": "direct partner",
							amount: row.value,
							fund: cbpfsList[row.fund],
							year: row.year
						});
					} else {
						csvData.push({
							source: partnersList[row.source],
							"type of source": "direct partner",
							target: subPartnersList[row.target],
							"type of target": "sub-implementing partner",
							amount: row.value,
							fund: cbpfsList[row.fund],
							year: row.year
						});
					};
				};
			});

			const csv = d3.csvFormat(csvData);

			return csv;
		};

		function createCbpfsList(cbpfsData) {
			cbpfsData.forEach(function(row) {
				cbpfsList[row.PFId + ""] = row.PFName;
				cbpfsListKeys.push(row.PFId + "");
			});
		};

		function createPartnersList(partnersData) {
			partnersData.forEach(function(row) {
				partnersList[row.OrgTypeCode] = row.OrgTypeNm;
				partnersListKeys.push(row.OrgTypeCode);
			});
		};

		function createSubPartnersList(subPartnersData) {
			subPartnersData.forEach(function(row) {
				subPartnersList[row.PublicSubIPCode] = row.PublicSubIPName;
				subPartnersListKeys.push(row.PublicSubIPCode);
				aggregationNameRule[row.PublicSubIPCode] = partnersList[row.PublicSubIPCode] || row.PublicSubIPName;
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

		function validateCustomEventYear(yearNumber) {
			if (yearsArray.indexOf(yearNumber) > -1) {
				return yearNumber;
			};
			while (yearsArray.indexOf(yearNumber) === -1) {
				yearNumber = yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
			};
			return yearNumber;
		};

		function parseTransform(translate) {
			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.setAttributeNS(null, "transform", translate);
			const matrix = group.transform.baseVal.consolidate().matrix;
			return [matrix.e, matrix.f];
		};

		function populateSelectedCbpfs(cbpfsString) {
			const cbpfs = [];

			const dataArray = cbpfsString.split(",").map(function(d) {
				return d.trim().toLowerCase();
			});

			const someInvalidValue = dataArray.some(function(d) {
				return valuesInLowerCase(d3.values(cbpfsDataList)).indexOf(d) === -1
			});

			if (someInvalidValue) return d3.keys(cbpfsDataList);

			dataArray.forEach(function(d) {
				for (var key in cbpfsDataList) {
					if (cbpfsDataList[key].toLowerCase() === d) cbpfs.push(key)
				};
			});

			return cbpfs;
		};

		function valuesInLowerCase(map) {
			const values = [];
			for (let key in map) values.push(map[key].toLowerCase());
			return values;
		};

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1)
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value);
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

		function curlyBracket(topValue, bottomValue, widthValue, curvePercentage) {
			const length = bottomValue - topValue;
			const lengthPercentage = length * curvePercentage;
			const drawPath = d3.path();
			drawPath.moveTo(0, topValue);
			drawPath.quadraticCurveTo(widthValue / 2, topValue, widthValue / 2, topValue + lengthPercentage);
			drawPath.lineTo(widthValue / 2, topValue + (length / 2) - lengthPercentage);
			drawPath.quadraticCurveTo(widthValue / 2, topValue + length / 2, widthValue, topValue + length / 2);
			drawPath.quadraticCurveTo(widthValue / 2, topValue + length / 2, widthValue / 2, topValue + (length / 2) + lengthPercentage);
			drawPath.lineTo(widthValue / 2, topValue + length - lengthPercentage);
			drawPath.quadraticCurveTo(widthValue / 2, topValue + length, 0, topValue + length);
			return drawPath.toString();
		};

		function hideLabels(labelSelection, collisionHeight) {
			let collision = false;
			labelSelection.sort(function(a, b) {
					return a.y0 - b.y0;
				})
				.style("display", null)
				.each(function(d, i, n) {
					d3.select(this).style("display", collision ? "none" : null);
					localVariable.set(this, collision);
					if (n[i + 1]) {
						if (d3.select(n[i + 1]).datum().y1 - d.y0 < collisionHeight) collision = true;
					};
				});
		};

		function createAnnotationsDiv() {

			iconsDiv.style("opacity", 0)
				.style("pointer-events", "none");

			const overDiv = containerDiv.append("div")
				.attr("class", "pbinadOverDivHelp");

			const selectTitleDivSize = selectTitleDiv.node().getBoundingClientRect();

			const titleStyle = window.getComputedStyle(selectTitleDiv.node());

			const selectDivSize = selectDiv.node().getBoundingClientRect();

			const topDivSize = topDiv.node().getBoundingClientRect();

			const iconsDivSize = iconsDiv.node().getBoundingClientRect();

			const topDivHeight = topDivSize.height * (width / topDivSize.width);

			const totalSelectHeight = (selectTitleDivSize.height + selectDivSize.height + parseInt(titleStyle["margin-top"]) + parseInt(titleStyle["margin-bottom"])) * (width / topDivSize.width);

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + (height + topDivHeight + totalSelectHeight));

			const mainTextRect = helpSVG.append("rect")
				.attr("x", (iconsDivSize.left - topDivSize.left) * (width / topDivSize.width))
				.attr("y", 4)
				.attr("width", width - (iconsDivSize.left - topDivSize.left) * (width / topDivSize.width) - padding[1])
				.attr("height", topDivHeight)
				.style("fill", "white")
				.style("pointer-events", "all")
				.style("cursor", "pointer")
				.on("click", function() {
					iconsDiv.style("opacity", 1)
						.style("pointer-events", "all");
					overDiv.remove();
				});

			const mainText = helpSVG.append("text")
				.attr("class", "pbinadAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", (iconsDivSize.left - topDivSize.left) * (width / topDivSize.width) + (width - (iconsDivSize.left - topDivSize.left) * (width / topDivSize.width) - padding[1]) / 2)
				.attr("y", 10 + topDivHeight / 2)
				.text("CLICK HERE TO CLOSE THE HELP");

			const helpData = [{
				x: 4,
				y: topDivHeight + ((totalSelectHeight - selectDivSize.height) * (topDivSize.width / width)),
				width: width - 8,
				height: selectDivSize.height * (width / topDivSize.width),
				xTooltip: 300 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 8) * (topDivSize.width / width),
				text: "Use these checkboxes to select the CBPFs. A disabled checkbox means that the correspondent CBPF has no data for that year."
			}, {
				x: 4,
				y: 68 + topDivHeight + totalSelectHeight,
				width: 416,
				height: 30,
				xTooltip: 78 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 104) * (topDivSize.width / width),
				text: "Use these buttons to select the year. You can select more than one year. Double click or press ALT when clicking to select a single year"
			}, {
				x: 456,
				y: 68 + topDivHeight + totalSelectHeight,
				width: 325,
				height: 30,
				xTooltip: 456 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 104) * (topDivSize.width / width),
				text: "Click here to select how the partners depicted in the right-hand side column are aggregated: by partner type or by level (direct or sub-implementing partners)."
			}, {
				x: 80,
				y: 134 + topDivHeight + totalSelectHeight,
				width: 34,
				height: 416,
				xTooltip: 120 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 242) * (topDivSize.width / width),
				text: "This first column represents all the funds. You can hover over each rectangle for additional information."
			}, {
				x: 436,
				y: 134 + topDivHeight + totalSelectHeight,
				width: 34,
				height: 416,
				xTooltip: 476 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 242) * (topDivSize.width / width),
				text: "This second column represents all the direct partners. You can hover over each rectangle for additional information."
			}, {
				x: 792,
				y: 134 + topDivHeight + totalSelectHeight,
				width: 34,
				height: 416,
				xTooltip: 466 * (topDivSize.width / width),
				yTooltip: (topDivHeight + totalSelectHeight + 242) * (topDivSize.width / width),
				text: "This final column represents both the direct partners and the sub-implementing partners. Note: the direct partners represented here are the same of the second column, minus the amount transferred to any sub-implementing partner. You can hover over each rectangle for additional information."
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
					.attr("class", "pbinadHelpRectangle")
					.attr("pointer-events", "all")
					.on("mouseover", function() {
						const self = this;
						createTooltip(d.xTooltip, d.yTooltip, d.text, self);
					})
					.on("mouseout", removeTooltip);
			});

			const explanationTextRect = helpSVG.append("rect")
				.attr("x", (width / 2) - 180)
				.attr("y", 180 + topDivHeight + totalSelectHeight)
				.attr("width", 360)
				.attr("height", 50)
				.attr("pointer-events", "none")
				.style("fill", "white")
				.style("stroke", "#888");

			const explanationText = helpSVG.append("text")
				.attr("class", "pbinadAnnotationExplanationText")
				.attr("font-family", "Roboto")
				.attr("font-size", "18px")
				.style("fill", "#222")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 200 + topDivHeight + totalSelectHeight)
				.attr("pointer-events", "none")
				.text("Hover over the elements surrounded by a blue rectangle to get additional information")
				.call(wrapText2, 350);

			function createTooltip(xPos, yPos, text, self) {
				explanationText.style("opacity", 0);
				explanationTextRect.style("opacity", 0);
				helpSVG.selectAll(".pbinadHelpRectangle").style("opacity", 0.1);
				d3.select(self).style("opacity", 1);
				const containerBox = containerDiv.node().getBoundingClientRect();
				tooltip.style("top", yPos + "px")
					.style("left", xPos + "px")
					.style("display", "block")
					.html(null)
					.append("div")
					.style("width", "300px")
					.html(text);
			};

			function removeTooltip() {
				tooltip.style("display", "none");
				explanationText.style("opacity", 1);
				explanationTextRect.style("opacity", 1);
				helpSVG.selectAll(".pbinadHelpRectangle").style("opacity", 0.5);
			};


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

		function wrapText(text, width) {
			text.each(function() {
				let text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineHeight = 1.1,
					x = text.attr("x"),
					dy = 0,
					tspan = text.text(null)
					.append("tspan")
					.attr("x", x)
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
							.attr("dy", lineHeight + dy + "em")
							.text(word);
					}
				}
			});
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

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "pbinadDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "pbinadDownloadingDivSvg")
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

			if (fromContextMenu && currentHoveredElement) setSvgStyles(tooltip.select("svg").node());

			containerDiv.selectAll(".pbinadtimelinesChartDiv svg")
				.each(function() {
					setSvgStyles(this);
				});

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

				if (fromContextMenu && currentHoveredElement) d3.select(currentHoveredElement).dispatch("mouseout");

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

			const fileName = "AllocationFlow_" + csvDateFormat(currentDate) + ".png";

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

			d3.select("#pbinadDownloadingDiv").remove();

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

					const intro = pdf.splitTextToSize("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", (210 - pdfMargins.left - pdfMargins.right), {
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

					const yearsList = chartState.selectedYear.sort(function(a, b) {
						return a - b;
					}).reduce(function(acc, curr, index) {
						return acc + (index >= chartState.selectedYear.length - 2 ? index > chartState.selectedYear.length - 2 ? curr : curr + " and " : curr + ", ");
					}, "");

					const yearsText = chartState.selectedYear.length > 1 ? "Selected years: " : "Selected year: ";

					const selectedCountry = countriesList();

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + yearsText + "<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsList + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + selectedCountry.split("-")[0] + ": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						selectedCountry.split("-")[1] + "</span></div>", pdfMargins.left, 70, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, heightInMilimeters);

					const currentDate = new Date();

					pdf.save("AllocationFlow_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#pbinadDownloadingDiv").remove();

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

					function countriesList() {
						const plural = chartState.selectedCbpfs.length === 1 ? "" : "s";
						const countryList = chartState.selectedCbpfs.map(function(d) {
								return cbpfsList[d];
							})
							.sort(function(a, b) {
								return a.localeCompare(b);
							})
							.reduce(function(acc, curr, index) {
								return acc + (index >= chartState.selectedCbpfs.length - 2 ? index > chartState.selectedCbpfs.length - 2 ? curr : curr + " and " : curr + ", ");
							}, "");
						return "Selected CBPF" + plural + "-" + countryList;
					};

				});

			//end of downloadSnapshotPdf
		};

		function createProgressWheel(thissvg, thiswidth, thisheight, thistext) {
			const wheelGroup = thissvg.append("g")
				.attr("class", "pbinadd3chartwheelGroup")
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
			const wheelGroup = d3.select(".pbinadd3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());
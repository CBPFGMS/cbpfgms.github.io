(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		hasURLSearchParams = window.URLSearchParams,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		isBookmarkPage = window.location.hostname + window.location.pathname === "bi-home.gitlab.io/CBPF-BI-Homepage/bookmark.html",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles-stg.css", "https://cbpfgms.github.io/css/d3chartstylespbiali-stg.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js",
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
			loadScript(d3URL, d3Chart);
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, function() {
				loadScript(d3URL, d3Chart);
			});
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, function() {
						loadScript(d3URL, d3Chart);
					});
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		if (hasFetch && hasURLSearchParams) {
			d3Chart();
		} else if (hasFetch && !hasURLSearchParams) {
			loadScript(URLSearchParamsPolyfill, d3Chart);
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(URLSearchParamsPolyfill, d3Chart);
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
			mainPanelHeight = 280,
			padding = [12, 4, 26, 4],
			panelHorizontalPadding = 12,
			buttonsPerRow = 10,
			buttonsVerticalPadding = 8,
			buttonsHorizontalPadding = 8,
			buttonHeight = 48,
			parseTime = d3.timeParse("%Y"),
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			windowHeight = window.innerHeight,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			localVariable = d3.local(),
			monthsMargin = 2,
			yMargin = 1.05,
			circleRadius = 2.5,
			buttonsOrderGroupPadding = 192,
			duration = 1000,
			labelPadding = 12,
			labelGroupHeight = 16,
			labelLinePadding = 4,
			fadeOpacity = 0.1,
			unBlue = "#1F69B3",
			highlightColor = "#F79A3B",
			vizNameQueryString = "allocation-trends",
			bookmarkSite = "https://bi-home.gitlab.io/CBPF-BI-Homepage/bookmark.html?",
			helpPortalUrl = "https://gms.unocha.org/content/business-intelligence#allocation%20trends",
			colorsArray = ["#418FDE", "#A4D65E", "#E56A54", "#E2E868", "#999999", "#ECA154", "#71DBD4", "#9063CD", "#D3BC8D"],
			chartTitleDefault = "Allocation Trends",
			sortButtonsOptions = ["total", "alphabetically"],
			file = "https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?poolfundAbbrv=&$format=csv",
			chartState = {
				selectedCbpfs: []
			};

		let height = 400,
			isSnapshotTooltipVisible = false,
			labelGroupHovered;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz")) queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainerpbiali");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") || chartTitleDefault;

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const selectedCbpfsString = queryStringValues.has("fund") ? queryStringValues.get("fund").replace(/\|/g, ",") : containerDiv.node().getAttribute("data-selectedcbpfs");

		let sortButtons = queryStringValues.has("sortbuttons") && sortButtonsOptions.indexOf(queryStringValues.get("sortbuttons").toLowerCase()) > -1 ?
			queryStringValues.get("sortbuttons").toLowerCase() : sortButtonsOptions.indexOf(containerDiv.node().getAttribute("data-sortbuttons").toLowerCase()) > -1 ?
			containerDiv.node().getAttribute("data-sortbuttons").toLowerCase() : "total";

		if (selectedResponsiveness === "false") {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbialiTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbialiTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbialiIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbialiFooterDiv") : null;

		const grayFilters = svg.append("filter")
			.attr("id", "pbialiGrayFilter")
			.append("feColorMatrix")
			.attr("in", "SourceGraphic")
			.attr("type", "saturate")
			.attr("values", "0");

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv.append("div")
			.attr("id", "pbialiSnapshotTooltip")
			.attr("class", "pbialiSnapshotContent")
			.style("display", "none")
			.on("mouseleave", function() {
				isSnapshotTooltipVisible = false;
				snapshotTooltip.style("display", "none");
				tooltip.style("display", "none");
			});

		snapshotTooltip.append("p")
			.attr("id", "pbialiSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip.append("p")
			.attr("id", "pbialiSnapshotTooltipPngText")
			.html("Download Image (PNG)")
			.on("click", function() {
				isSnapshotTooltipVisible = false;
				createSnapshot("png", true);
			});

		const browserHasSnapshotIssues = !isTouchScreenOnly && (window.safari || window.navigator.userAgent.indexOf("Edge") > -1);

		if (browserHasSnapshotIssues) {
			snapshotTooltip.append("p")
				.attr("id", "pbialiTooltipBestVisualizedText")
				.html("For best results use Chrome, Firefox, Opera or Chromium-based Edge.")
				.attr("pointer-events", "none")
				.style("cursor", "default");
		};

		const tooltip = containerDiv.append("div")
			.attr("id", "pbialitooltipdiv")
			.style("display", "none");

		containerDiv.on("contextmenu", function() {
			d3.event.preventDefault();
			const thisMouse = d3.mouse(this);
			isSnapshotTooltipVisible = true;
			snapshotTooltip.style("display", "block")
				.style("top", thisMouse[1] - 4 + "px")
				.style("left", thisMouse[0] - 4 + "px");
		});

		const mainPanel = {
			main: svg.append("g")
				.attr("class", "pbialiMainPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: mainPanelHeight,
			padding: [0, 132, 16, 32]
		};

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "pbialiButtonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + mainPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: 0,
			padding: [2, 20, 2, 32],
			buttonsPadding: [14, 4, 4, 4]
		};

		const buttonWidth = ((buttonsPanel.width - buttonsPanel.padding[1] - buttonsPanel.padding[3]) -
			((buttonsPerRow - 1) * buttonsVerticalPadding)) / buttonsPerRow;

		const xScaleMain = d3.scaleTime()
			.range([mainPanel.padding[3], mainPanel.width - mainPanel.padding[1]]);

		const yScaleMain = d3.scaleLinear()
			.range([mainPanel.height - mainPanel.padding[2], mainPanel.padding[0]]);

		const xScaleButton = d3.scaleTime()
			.range([buttonsPanel.buttonsPadding[3], buttonWidth - buttonsPanel.buttonsPadding[1]]);

		const yScaleButton = d3.scaleLinear()
			.range([buttonHeight - buttonsPanel.buttonsPadding[2], buttonsPanel.buttonsPadding[0]]);

		const scaleColors = d3.scaleOrdinal()
			.range(colorsArray);

		const lineGeneratorMain = d3.line()
			.x(function(d) {
				return xScaleMain(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleMain(d.total)
			})
			.curve(d3.curveCatmullRom);

		const lineGeneratorButtons = d3.line()
			.x(function(d) {
				return xScaleButton(parseTime(d.year))
			})
			.y(function(d) {
				return yScaleButton(d.total)
			})
			.curve(d3.curveCatmullRom);

		const xAxisMain = d3.axisBottom(xScaleMain)
			.tickSizeInner(4)
			.tickSizeOuter(0);

		const yAxisMain = d3.axisLeft(yScaleMain)
			.tickSizeInner(-(mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(formatSIaxes);

		const defs = svg.append("defs");

		const filter = defs.append("filter")
			.attr("id", "pbialidropshadow")
			.attr('filterUnits', 'userSpaceOnUse');

		filter.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 2);

		filter.append("feOffset")
			.attr("dx", 3)
			.attr("dy", 3);

		const feComponent = filter.append("feComponentTransfer");

		feComponent.append("feFuncA")
			.attr("type", "linear")
			.attr("slope", 0.4);

		const feMerge = filter.append("feMerge");

		feMerge.append("feMergeNode");
		feMerge.append("feMergeNode")
			.attr("in", "SourceGraphic");

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		if (localStorage.getItem("pbialidata") &&
			JSON.parse(localStorage.getItem("pbialidata")).timestamp > (currentDate.getTime() - localStorageTime)) {
			const rawData = d3.csvParse(JSON.parse(localStorage.getItem("pbialidata")).data);
			console.info("pbiali: data from local storage");
			csvCallback(rawData);
		} else {
			d3.csv(file).then(function(rawData) {
				try {
					localStorage.setItem("pbialidata", JSON.stringify({
						data: d3.csvFormat(rawData),
						timestamp: currentDate.getTime()
					}));
				} catch (error) {
					console.info("D3 chart pbiali, " + error);
				};
				console.info("pbiali: data from API");
				csvCallback(rawData);
			});
		};

		function csvCallback(rawData) {

			removeProgressWheel();

			const data = processData(rawData);

			validateCbpfs(selectedCbpfsString, data.cbpfs.map(function(d) {
				return d.cbpf;
			}));

			if (!lazyLoad) {
				draw(data);
			} else {
				d3.select(window).on("scroll.pbiali", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.pbiali", null);
					draw(data);
				};
			};

			//end of csvCallback
		};

		function draw(data) {

			createTitle();

			if (!isPfbiSite) createFooterDiv();

			resizeSVG(data.cbpfs.length);

			const timeExtent = setTimeExtent(data.years);

			xScaleMain.domain(timeExtent);

			xScaleButton.domain(timeExtent);

			const yDomain = setYDomain(data.cbpfs);

			yScaleMain.domain(yDomain);

			yScaleButton.domain(yDomain);

			scaleColors.domain(data.cbpfs.sort(function(a, b) {
				return d3.descending(a.total, b.total);
			}).map(function(d) {
				return d.cbpf;
			}));

			const currentYearGroup = mainPanel.main.append("g")
				.attr("class", "pbialiCurrentYearGroup");

			currentYearGroup.attr("transform", "translate(" + xScaleMain(parseTime(currentYear - 1)) + ",0)");

			const currentYearRect = currentYearGroup.append("rect")
				.attr("x", 0)
				.attr("y", mainPanel.padding[0])
				.attr("width", xScaleMain(parseTime(currentYear)) - xScaleMain(parseTime(currentYear - 1)))
				.attr("height", mainPanel.height - mainPanel.padding[2] - mainPanel.padding[0])
				.style("fill", "#f4f4f4");

			const currentYearText = currentYearGroup.append("text")
				.attr("class", "pbialiCurrentYearText")
				.attr("y", -2)
				.attr("x", (xScaleMain(parseTime(currentYear)) - xScaleMain(parseTime(currentYear - 1))) / 2)
				.attr("text-anchor", "middle")
				.text("Current year");

			createAverageLine(data.cbpfs, data.years);

			createMainGraph(data.cbpfs);

			createButtons(data.cbpfs);

			createBottomControls();

			if (chartState.selectedCbpfs.length) {
				data.cbpfs.forEach(function(d) {
					if (chartState.selectedCbpfs.indexOf(d.cbpf) > -1) {
						d.clicked = true;
					};
				});
				highlightPaths();
				svg.selectAll(".pbialiButtonGroup")
					.filter(function(d) {
						return d.clicked;
					})
					.each(function() {
						d3.select(this).select("rect")
							.style("stroke", "#666")
							.style("fill", "#fcfcfc")
							.style("stroke-width", "2px");

						d3.select(this).select("text")
							.style("fill", "#222");
					});
			};

			if (showHelp) createAnnotationsDiv();

			function createTitle() {

				const title = titleDiv.append("p")
					.attr("id", "pbialid3chartTitle")
					.html(chartTitle);

				const helpIcon = iconsDiv.append("button")
					.attr("id", "pbialiHelpButton");

				helpIcon.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info")

				const downloadIcon = iconsDiv.append("button")
					.attr("id", "pbialiDownloadButton");

				downloadIcon.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				const snapshotDiv = iconsDiv.append("div")
					.attr("class", "pbialiSnapshotDiv");

				const snapshotIcon = snapshotDiv.append("button")
					.attr("id", "pbialiSnapshotButton");

				snapshotIcon.html("IMAGE ")
					.append("span")
					.attr("class", "fas fa-camera");

				const snapshotContent = snapshotDiv.append("div")
					.attr("class", "pbialiSnapshotContent");

				const pdfSpan = snapshotContent.append("p")
					.attr("id", "pbialiSnapshotPdfText")
					.html("Download PDF")
					.on("click", function() {
						createSnapshot("pdf", false);
					});

				const pngSpan = snapshotContent.append("p")
					.attr("id", "pbialiSnapshotPngText")
					.html("Download Image (PNG)")
					.on("click", function() {
						createSnapshot("png", false);
					});

				if (!isBookmarkPage) {

					const shareIcon = iconsDiv.append("button")
						.attr("id", "pbialiShareButton");

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
						.attr("id", "pbialiBestVisualizedText")
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

					const csv = createCSV(data.cbpfs);

					const currentDate = new Date();

					const fileName = "AllocationTrends_" + csvDateFormat(currentDate) + ".csv";

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

			function createMainGraph(cbpfs) {

				const groupXAxisMainPanel = mainPanel.main.append("g")
					.attr("class", "pbialigroupXAxisMainPanel")
					.attr("transform", "translate(0," + (mainPanel.height - mainPanel.padding[2]) + ")")
					.call(xAxisMain);

				const groupYAxisMainPanel = mainPanel.main.append("g")
					.attr("class", "pbialigroupYAxisMainPanel")
					.attr("transform", "translate(" + mainPanel.padding[3] + ",0)")
					.call(yAxisMain);

				groupYAxisMainPanel.selectAll(".tick")
					.lower()
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				const yAxisLabel = mainPanel.main.append("text")
					.attr("class", "pbialiYAxisLabel")
					.attr("text-anchor", "end")
					.attr("x", mainPanel.padding[3] - 2)
					.attr("y", mainPanel.padding[0] - 4)
					.text("US$");

				const mainGroup = mainPanel.main.selectAll(null)
					.data(cbpfs)
					.enter()
					.append("g")
					.attr("class", "pbialiMainGroup")
					.style("opacity", 0);

				mainGroup.each(function(d) {
					localVariable.set(this, d.cbpf);
				});

				const clipPath = mainGroup.append("clipPath")
					.attr("id", function(d) {
						return "pbialiClipPath" + d.cbpf.replace(/\s+/g, '');
					})
					.append("rect")
					.attr("x", mainPanel.padding[3])
					.attr("y", mainPanel.padding[0])
					.attr("height", mainPanel.height - mainPanel.padding[0] - mainPanel.padding[2])
					.attr("width", 0);

				const path = mainGroup.append("path")
					.attr("d", function(d) {
						return lineGeneratorMain(d.values);
					})
					.style("stroke", function(d) {
						return d3.color(scaleColors(d.cbpf)).darker(0.2);
					})
					.attr("stroke-width", "2px")
					.attr("clip-path", function(d) {
						return "url(#pbialiClipPath" + d.cbpf.replace(/\s+/g, '') + ")"
					})
					.style("fill", "none");

				const circles = mainGroup.selectAll(null)
					.data(function(d) {
						return d.values
					})
					.enter()
					.append("circle")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleMain(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleMain(d.total)
					})
					.attr("clip-path", function(d) {
						const thisCbpf = d3.select(this.parentNode).datum().cbpf
						return "url(#pbialiClipPath" + thisCbpf.replace(/\s+/g, '') + ")"
					})
					.style("fill", function() {
						return d3.color(scaleColors(localVariable.get(this))).darker(0.2);
					});

				const rectOverlayCbpfs = mainPanel.main.append("rect")
					.attr("class", "pbialiRectOverlay")
					.attr("x", mainPanel.padding[3])
					.attr("y", mainPanel.padding[0])
					.attr("height", mainPanel.height - mainPanel.padding[0] - mainPanel.padding[2])
					.attr("width", mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3])
					.style("fill", "none")
					.attr("pointer-events", "all")
					.on("mousemove", mouseMoveRectOverlay)
					.on("mouseout", mouseOutRectOverlay);

				//end of createMainGraph
			};

			function createAverageLine(cbpfs, years) {

				const averageData = years.map(function(year) {
					return {
						year: year,
						total: cbpfs.reduce(function(acc, curr) {
							const thisYear = curr.values.find(function(d) {
								return d.year === year;
							});
							const thisValue = thisYear ? thisYear.total : 0;
							return acc + thisValue;
						}, 0) / cbpfs.length
					};
				});

				const lastAverageDate = averageData[averageData.length - 1];

				const averagePath = mainPanel.main.append("path")
					.attr("class", "pbialiAveragePath")
					.attr("d", lineGeneratorMain(averageData))
					.attr("stroke-width", "2px")
					.style("fill", "none")
					.style("stroke", "#ccc")
					.attr("pointer-events", "none");

				const averageCircles = mainPanel.main.selectAll(null)
					.data(averageData)
					.enter()
					.append("circle")
					.attr("class", "pbialiAverageCircles")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleMain(parseTime(d.year))
					})
					.attr("cy", function(d) {
						return yScaleMain(d.total)
					})
					.attr("fill", "#ccc")
					.attr("pointer-events", "none");

				const averageLine = mainPanel.main.append("line")
					.attr("x1", xScaleMain(parseTime(lastAverageDate.year)) + circleRadius * 2)
					.attr("x2", mainPanel.width - mainPanel.padding[1] + 8)
					.attr("y1", yScaleMain(lastAverageDate.total))
					.attr("y2", yScaleMain(lastAverageDate.total))
					.style("stroke", "#ccc")
					.attr("stroke-width", "1px")
					.style("fill", "none")
					.attr("class", "pbialiAverageLine");

				const averageText = mainPanel.main.append("text")
					.attr("class", "pbialiAverageText")
					.attr("pointer-events", "none")
					.attr("x", mainPanel.width - mainPanel.padding[1] + 10)
					.attr("y", yScaleMain(lastAverageDate.total) - 2)
					.text("Overall allocation trend (per CBPF)")
					.call(wrapText2, 100)

				//end of createAverageLine
			};

			function createButtons(cbpfs) {

				if (sortButtons === "total") {
					cbpfs.sort(function(a, b) {
						return b.total - a.total
					});
				} else {
					cbpfs.sort(function(a, b) {
						return a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
							a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 :
							0;
					});
				};

				const buttonGroup = buttonsPanel.main.selectAll(null)
					.data(cbpfs)
					.enter()
					.append("g")
					.attr("class", "pbialiButtonGroup")
					.style("cursor", "pointer");

				buttonGroup.attr("transform", function(_, i) {
					return "translate(" + (buttonsPanel.padding[3] + ((i % buttonsPerRow) * (buttonWidth + buttonsVerticalPadding))) +
						"," + (buttonsPanel.padding[0] + (~~(i / buttonsPerRow) * (buttonHeight + buttonsHorizontalPadding))) + ")";
				});

				const buttonRectangle = buttonGroup.append("rect")
					.attr("width", buttonWidth)
					.attr("height", buttonHeight)
					.attr("rx", 3)
					.attr("ry", 3)
					.style("fill", "white")
					.style("stroke-width", "1px")
					.style("stroke", "#bbb")
					.style("filter", "url(#pbialidropshadow)")

				const buttonsTitle = buttonGroup.append("text")
					.attr("class", "pbialiButtonTitle")
					.attr("text-anchor", "middle")
					.style("fill", "#888")
					.attr("x", buttonWidth / 2)
					.attr("y", buttonsPanel.buttonsPadding[0] - 2)
					.text(function(d) {
						return d.cbpf.toLowerCase() === "syria cross border" ? "Syria Cross" : d.cbpf;
					})
					.attr("pointer-events", "none");

				const buttonPaths = buttonGroup.selectAll(null)
					.data(cbpfs)
					.enter()
					.append("path")
					.style("stroke-width", "1px")
					.style("fill", "none")
					.attr("d", function(d) {
						return lineGeneratorButtons(d.values);
					})
					.attr("class", "pbialiUnselectedPath")
					.attr("pointer-events", "none");

				buttonPaths.each(function(d) {
					if (d.cbpf === d3.select(this.parentNode).datum().cbpf) {
						d3.select(this).style("stroke-width", "2px")
							.style("stroke", function(d) {
								return d3.color(scaleColors(d.cbpf)).darker(0.4);
							})
							.raise();
					};
				});

				buttonGroup.on("mouseover", mouseOverButtons)
					.on("mouseout", mouseOutButtons)
					.on("click", clickButtons);

				//end of createButtons
			};

			function createBottomControls() {

				const buttonsOrderGroup = svg.append("g")
					.attr("class", "pbialpbuttonsOrderGroup")
					.attr("transform", "translate(" + (width - padding[1] - buttonsOrderGroupPadding) + "," +
						(height - padding[2] / 2) + ")")
					.attr("pointer-events", "all");

				const mainText = buttonsOrderGroup.append("text")
					.attr("class", "pbialiButtonsOrderControl")
					.attr("x", -16)
					.attr("y", 5)
					.attr("text-anchor", "end")
					.text("Sort by:");

				const orderGroups = buttonsOrderGroup.selectAll(null)
					.data(sortButtonsOptions)
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(" + (i * 100) + ",0)"
					})
					.style("cursor", "pointer");

				const outerCircle = orderGroups.append("circle")
					.attr("r", 6)
					.attr("cy", 2)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCircle = orderGroups.append("circle")
					.attr("r", 4)
					.attr("cy", 2)
					.attr("fill", function(d) {
						return sortButtons === d ? "darkslategray" : "white"
					});

				const sortText = orderGroups.append("text")
					.attr("class", "pbialiButtonsOrderControl")
					.attr("x", 10)
					.attr("y", 5)
					.text(function(_, i) {
						return i ? "Alphabetically" : "Total Allocations";
					});

				orderGroups.on("click", function(d) {

					sortButtons = d;

					if (queryStringValues.has("sortbuttons")) {
						queryStringValues.set("sortbuttons", sortButtons);
					} else {
						queryStringValues.append("sortbuttons", sortButtons);
					};

					innerCircle.attr("fill", function(d) {
						return sortButtons === d ? "darkslategray" : "white"
					});

					let buttons = d3.selectAll(".pbialiButtonGroup");

					if (sortButtons === "total") {
						buttons = buttons.sort(function(a, b) {
							return b.total - a.total
						});
					} else {
						buttons = buttons.sort(function(a, b) {
							return a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
								a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 :
								0;
						});
					};

					buttons.transition()
						.duration(duration)
						.attr("transform", function(_, i) {
							return "translate(" + (buttonsPanel.padding[3] + ((i % buttonsPerRow) * (buttonWidth + buttonsVerticalPadding))) +
								"," + (buttonsPanel.padding[0] + (~~(i / buttonsPerRow) * (buttonHeight + buttonsHorizontalPadding))) + ")";
						});

				});

				//end of createBottomControls
			};

			function mouseOverButtons(datum) {

				if (!datum.clicked) {
					chartState.selectedCbpfs.push(datum.cbpf);
				};

				const thisGroup = d3.select(this);

				thisGroup.select("rect")
					.style("stroke", "#666")
					.style("fill", "#fcfcfc")
					.style("stroke-width", "2px");

				thisGroup.select("text")
					.style("fill", "#222");

				highlightPaths();

				//end of mouseOverButtons
			};

			function mouseOutButtons(datum) {

				if (!datum.clicked) {
					const index = chartState.selectedCbpfs.indexOf(datum.cbpf);
					if (index > -1) {
						chartState.selectedCbpfs.splice(index, 1);
					};
				};

				const thisGroup = d3.select(this);

				if (!datum.clicked) {
					thisGroup.select("rect")
						.style("stroke", "#bbb")
						.style("fill", "white")
						.style("stroke-width", "1px");

					thisGroup.select("text")
						.style("fill", "#888");
				};

				highlightPaths();

				//end of mouseOutButtons
			};

			function clickButtons(datum) {

				datum.clicked = !datum.clicked;

				if (!datum.clicked) {
					const index = chartState.selectedCbpfs.indexOf(datum.cbpf);
					chartState.selectedCbpfs.splice(index, 1);
				} else {
					if (chartState.selectedCbpfs.indexOf(datum.cbpf) === -1) {
						chartState.selectedCbpfs.push(datum.cbpf);
					}
				};

				const allFunds = chartState.selectedCbpfs.map(function(d) {
					return d;
				}).join("|");

				if (queryStringValues.has("fund")) {
					queryStringValues.set("fund", allFunds);
				} else {
					queryStringValues.append("fund", allFunds);
				};

				highlightPaths();

				const thisGroup = d3.select(this);

				if (datum.clicked) {
					thisGroup.select("rect")
						.style("stroke", "#666")
						.style("fill", "#fcfcfc")
						.style("stroke-width", "2px");

					thisGroup.select("text")
						.style("fill", "#222");
				} else {
					thisGroup.select("rect")
						.style("stroke", "#bbb")
						.style("fill", "white")
						.style("stroke-width", "1px");

					thisGroup.select("text")
						.style("fill", "#888");
				};

				//end of clickButtons
			};

			function mouseMoveRectOverlay() {

				if (!chartState.selectedCbpfs.length) return;

				const mouse = d3.mouse(mainPanel.main.node());

				const mouseYear = d3.timeMonth.offset(xScaleMain.invert(mouse[0]), 6).getFullYear().toString();

				const thisData = [];

				chartState.selectedCbpfs.forEach(function(country) {
					const thisCountry = data.cbpfs.find(function(e) {
						return e.cbpf === country;
					});
					const thisYear = thisCountry.values.find(function(e) {
						return e.year === mouseYear;
					});
					if (thisYear) {
						thisData.push({
							name: country,
							total: thisYear.total,
							reserve: thisYear.reserve,
							standard: thisYear.standard,
							year: mouseYear
						})
					};
				});

				thisData.sort(function(a, b) {
					return b.total - a.total;
				});

				if (thisData.length) {

					const typeTitle = thisData.length > 1 ? "Allocations" : "Allocation";

					let tooltipHtml = "<span style='margin-bottom:-8px;display:block;'>" + typeTitle + " made in <strong>" + mouseYear +
						"</strong>:</span><br><div style='margin:0px;display:flex;flex-wrap:wrap;align-items:flex-end;width:232px;'>";

					for (let i = 0; i < thisData.length; i++) {
						const thisColor = scaleColors(thisData[i].name);
						tooltipHtml += "<div style='display:flex;flex:0 50%;'><span style='color:" + thisColor + ";'>&#9679;&nbsp;</span>" +
							thisData[i].name + ":</div><div style='display:flex;flex:0 50%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(thisData[i].total) +
							"</span></div>"
					};

					tooltipHtml += "</div>";

					const tooltipGroup = mainPanel.main.selectAll(".pbialiTooltipGroup")
						.data([true]);

					const tooltipGroupEnter = tooltipGroup.enter()
						.insert("g", ":nth-child(3)")
						.attr("class", "pbialiTooltipGroup")
						.attr("pointer-events", "none");

					const lines = tooltipGroup.selectAll(".pbialiTooltipLines")
						.data(thisData, function(d) {
							return d.name
						});

					const linesExit = lines.exit().remove();

					const linesEnter = lines.enter()
						.append("line")
						.attr("class", "pbialiTooltipLines")
						.style("stroke-width", "1px")
						.style("stroke", "#ccc")
						.merge(lines)
						.attr("x1", function(d) {
							return xScaleMain(parseTime(d.year));
						})
						.attr("x2", function(d) {
							return xScaleMain(parseTime(d.year));
						})
						.attr("y1", mainPanel.padding[0])
						.attr("y2", mainPanel.height - mainPanel.padding[2]);

					const circles = tooltipGroup.selectAll(".pbialiTooltipCircles")
						.data(thisData, function(d) {
							return d.name
						});

					const circlesExit = circles.exit().remove();

					const circlesEnter = circles.enter()
						.append("circle")
						.attr("class", "pbialiTooltipCircles")
						.attr("r", circleRadius + 2)
						.style("fill", "none")
						.style("stroke", function(d) {
							return d3.color(scaleColors(d.name)).darker(0.2);
						})
						.merge(circles)
						.attr("cx", function(d) {
							return xScaleMain(parseTime(d.year))
						})
						.attr("cy", function(d) {
							return yScaleMain(d.total)
						});

					tooltip.style("display", "block");

					const tooltipSize = tooltip.node().getBoundingClientRect();

					const mouseDiv = d3.mouse(containerDiv.node());

					tooltip.html(tooltipHtml)
						.style("top", mouseDiv[1] - (tooltipSize.height / 2) + "px")
						.style("left", mouse[0] > mainPanel.width - 16 - tooltipSize.width ?
							mouseDiv[0] - tooltipSize.width - 16 + "px" :
							mouseDiv[0] + 16 + "px");

				} else {

					tooltip.style("display", "none");
					mainPanel.main.select(".pbialiTooltipGroup").remove();

				};

				//end of mouseMoveRectOverlay
			};

			function mouseOutRectOverlay() {

				if (isSnapshotTooltipVisible) return;

				tooltip.style("display", "none");
				mainPanel.main.select(".pbialiTooltipGroup").remove();

				//end of mouseOutRectOverlay
			};

			function highlightPaths() {

				if (chartState.selectedCbpfs.length > 0) {
					mainPanel.main.selectAll(".pbialiAverageLine, .pbialiAverageText")
						.style("opacity", 0);
					mainPanel.main.selectAll(".pbialiAveragePath, .pbialiAverageCircles")
						.style("opacity", fadeOpacity);
				} else {
					mainPanel.main.selectAll(".pbialiAverageLine, .pbialiAverageText, .pbialiAveragePath, .pbialiAverageCircles")
						.style("opacity", 1);
				};

				const pathGroups = d3.selectAll(".pbialiMainGroup");

				const selectedGroups = pathGroups.filter(function(d) {
					return chartState.selectedCbpfs.indexOf(d.cbpf) > -1
				});

				const unSelectedGroups = pathGroups.filter(function(d) {
					return chartState.selectedCbpfs.indexOf(d.cbpf) === -1
				});

				selectedGroups.style("opacity", 1);

				unSelectedGroups.style("opacity", 0);

				selectedGroups.selectAll("clipPath rect")
					.interrupt();

				selectedGroups.selectAll("clipPath rect")
					.attr("width", function(d) {
						const current = +d3.select(this).attr("width");
						if (current === mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3]) {
							return current;
						} else {
							return xScaleMain(parseTime(d.values[0].year));
						};
					})
					.transition()
					.duration(function(d) {
						return d.clicked ? 0 : duration;
					})
					.attr("width", mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3]);

				unSelectedGroups.selectAll("clipPath rect")
					.attr("width", 0);

				const labelsData = chartState.selectedCbpfs.map(function(d) {
					const thisCountry = data.cbpfs.find(function(e) {
						return e.cbpf === d;
					});
					const thisDatum = thisCountry.values[thisCountry.values.length - 1]
					return {
						name: thisCountry.cbpf,
						datum: thisDatum,
						yPos: yScaleMain(thisDatum.total)
					};
				});

				let labelsGroup = mainPanel.main.selectAll(".pbialiLabelsGroup")
					.data(labelsData);

				const labelsGroupExit = labelsGroup.exit()
					.remove();

				const labelsGroupEnter = labelsGroup.enter()
					.append("g")
					.attr("class", "pbialiLabelsGroup")
					.style("opacity", 0);

				labelsGroupEnter.attr("transform", function(d) {
					return "translate(" + (mainPanel.width - mainPanel.padding[1] + labelPadding) + "," +
						yScaleMain(d.datum.total) + ")";
				});

				const labelText = labelsGroupEnter.append("text")
					.attr("class", "pbialiLabelText")
					.attr("y", 4)
					.text(function(d) {
						return d.name;
					});

				const labelLine = labelsGroupEnter.append("polyline")
					.style("stroke-width", "1px")
					.style("stroke", "#bbb")
					.style("fill", "none")
					.attr("points", function(d) {
						return (xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding) + labelLinePadding) + ",0 " +
							(xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding) + labelLinePadding) + ",0 " +
							(xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding) + labelLinePadding) + ",0 " +
							(xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding) + labelLinePadding) + ",0"
					});

				labelsGroup = labelsGroupEnter.merge(labelsGroup);

				labelsGroup.raise();

				labelsGroup.transition()
					.duration(duration)
					.style("opacity", 1);

				collideLabels(labelsGroup.data(), mainPanel.height - mainPanel.padding[2], mainPanel.padding[0]);

				labelsGroup.attr("transform", function(d) {
					return "translate(" + (mainPanel.width - mainPanel.padding[1] + labelPadding) + "," +
						d.yPos + ")";
				});

				labelsGroup.select("text").text(function(d) {
					return d.name;
				});

				labelsGroup.select("polyline")
					.attr("points", function(d, i) {
						const thisDistance = xScaleMain(parseTime(d.datum.year)) - (mainPanel.width - mainPanel.padding[1] + labelPadding);
						const maxSize = mainPanel.height - mainPanel.padding[0] - mainPanel.padding[2];
						return (thisDistance + labelLinePadding) +
							"," + (yScaleMain(d.datum.total) - d.yPos) + " " +
							(thisDistance * (2 * Math.abs((yScaleMain(d.datum.total) - d.yPos)) / (maxSize)) - 2 * labelLinePadding) + "," + (yScaleMain(d.datum.total) - d.yPos) + " " +
							(thisDistance * (2 * Math.abs((yScaleMain(d.datum.total) - d.yPos)) / (maxSize)) - 2 * labelLinePadding) + "," + 0 + " " +
							-(labelLinePadding) + "," + 0;
					});

				labelsGroup.on("mouseover", function(d) {
						labelGroupHovered = this;
						labelsGroup.interrupt();
						selectedGroups.filter(function(e) {
								return e.cbpf !== d.name;
							})
							.style("opacity", fadeOpacity)
							.attr("filter", "url(#pbialiGrayFilter)");
						labelsGroup.filter(function(e) {
								return e.name !== d.name;
							})
							.style("opacity", fadeOpacity)
							.attr("filter", "url(#pbialiGrayFilter)");
					})
					.on("mouseout", function() {
						if (isSnapshotTooltipVisible) return;
						labelGroupHovered = null;
						selectedGroups.style("opacity", 1)
							.attr("filter", null);
						labelsGroup.style("opacity", 1)
							.attr("filter", null);
					});

				mainPanel.main.select(".pbialiRectOverlay").raise();

				//end of highlightPaths
			};

			//end of draw
		};

		function collideLabels(dataArray, maxValue, minValue) {

			if (dataArray.length < 2) return;

			dataArray.sort(function(a, b) {
				return b.yPos - a.yPos;
			});

			for (let i = 0; i < dataArray.length - 1; i++) {
				if (!isColliding(dataArray[i], dataArray[i + 1])) continue;
				while (isColliding(dataArray[i], dataArray[i + 1])) {
					if (i === 0) {
						dataArray[i].yPos = Math.min(maxValue, dataArray[i].yPos + 1);
						dataArray[i + 1].yPos -= 1;
					} else {
						dataArray[i + 1].yPos -= 1;
					};
				};
			};

			dataArray.forEach(function(_, i, arr) {
				if (arr[i + 1]) {
					if (arr[i + 1].yPos > arr[i].yPos - labelGroupHeight) {
						collideLabels(dataArray, maxValue, minValue);
					};
				};
			});

			function isColliding(objA, objB) {
				return !((objA.yPos + labelGroupHeight) < objB.yPos ||
					objA.yPos > (objB.yPos + labelGroupHeight));
			};

			//end of collideLabels
		};

		function resizeSVG(cbpfs) {

			const rows = Math.ceil(cbpfs / buttonsPerRow);

			buttonsPanel.height = (rows * buttonHeight) + ((rows - 1) * buttonsHorizontalPadding) +
				buttonsPanel.padding[0] + buttonsPanel.padding[2];

			height = padding[0] + mainPanel.height + panelHorizontalPadding + buttonsPanel.height + padding[2];

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			};

			svg.attr("viewBox", "0 0 " + width + " " + height);

			//end of resizeSVG;
		};

		function setTimeExtent(yearsArray) {

			const timeExtent = d3.extent(yearsArray.map(function(d) {
				return parseTime(d);
			}));

			timeExtent[0] = d3.timeMonth.offset(timeExtent[0], -monthsMargin);

			timeExtent[1] = d3.timeMonth.offset(timeExtent[1], monthsMargin);

			return timeExtent;

		};

		function setYDomain(cbpfs) {

			return [0, (d3.max(cbpfs, function(cbpf) {
				return d3.max(cbpf.values, function(d) {
					return d.total;
				});
			})) * yMargin];

		};

		function validateCbpfs(cbpfString, cbpfsList) {
			if (!cbpfString || cbpfString === "none") return;
			const namesArray = cbpfString.split(",").map(function(d) {
				return d.trim();
			});
			namesArray.forEach(function(d) {
				if (cbpfsList.indexOf(d) > -1) chartState.selectedCbpfs.push(d);
			});
		};

		function processData(rawData) {

			rawData.sort(function(a, b) {
				return (+a.AllocationYear) - (+b.AllocationYear);
			});

			const data = {
				years: [],
				cbpfs: []
			};

			rawData.forEach(function(d) {

				if (data.years.indexOf(d.AllocationYear) === -1) {
					data.years.push(d.AllocationYear);
				};

				const foundCbpf = data.cbpfs.find(function(e) {
					return e.cbpf === d.PooledFundName;
				});

				if (foundCbpf) {

					const foundValue = foundCbpf.values.find(function(e) {
						return e.year === d.AllocationYear;
					});

					if (foundValue) {
						foundValue.reserve += +d.ApprovedReserveBudget;
						foundValue.standard += +d.ApprovedStandardBudget;
						foundValue.total += +d.ApprovedBudget;
					} else {
						foundCbpf.values.push({
							year: d.AllocationYear,
							reserve: +d.ApprovedReserveBudget,
							standard: +d.ApprovedStandardBudget,
							total: +d.ApprovedBudget
						});
					};

					foundCbpf.total += +d.ApprovedBudget;

				} else {

					data.cbpfs.push({
						cbpf: d.PooledFundName,
						total: +d.ApprovedBudget,
						clicked: false,
						values: [{
							year: d.AllocationYear,
							reserve: +d.ApprovedReserveBudget,
							standard: +d.ApprovedStandardBudget,
							total: +d.ApprovedBudget
						}]
					});

				};

			});

			data.cbpfs.forEach(function(cbpf) {
				fillZeros(cbpf.values);
			});

			function fillZeros(valuesArray) {
				const firstYear = valuesArray[0].year;
				const lastYear = valuesArray[valuesArray.length - 1].year;
				const thisRange = d3.range(+firstYear, +lastYear, 1);
				thisRange.forEach(function(rangeYear) {
					const foundYear = valuesArray.find(function(e) {
						return e.year === rangeYear.toString();
					});
					if (!foundYear) {
						valuesArray.push({
							year: rangeYear.toString(),
							reserve: 0,
							standard: 0,
							total: 0
						});
					};
				});
				valuesArray.sort(function(a, b) {
					return (+a.year) - (+b.year);
				});
			};

			return data;

			//end of processData;
		};

		function createCSV(sourceData) {

			const clonedData = JSON.parse(JSON.stringify(sourceData));

			clonedData.forEach(function(d) {
				d.newValues = [];
				d.values.forEach(function(e) {
					d.newValues.push({
						"CBPF Name": d.cbpf,
						Year: +e.year,
						"Total Allocation": Math.round(e.total * 100) / 100,
						"Total Reserve Allocation": Math.round(e.reserve * 100) / 100,
						"Total Standard Allocation": Math.round(e.standard * 100) / 100
					})
				});
			});

			const concatenatedData = clonedData.reduce(function(acc, curr) {
				return acc.concat(curr.newValues);
			}, []);

			concatenatedData.sort(function(a, b) {
				return b.Year - a.Year ||
					(a["CBPF Name"].toLowerCase() < b["CBPF Name"].toLowerCase() ? -1 :
						a["CBPF Name"].toLowerCase() > b["CBPF Name"].toLowerCase() ? 1 : 0);
			});

			const header = Object.keys(concatenatedData[0]);

			header.sort(function(a, b) {
				return a === "Year" || b === "Year" ? 1 : (a < b ? -1 :
					a > b ? 1 : 0);
			});

			const replacer = function(key, value) {
				return value === null ? '' : value
			};

			let rows = concatenatedData.map(function(row) {
				return header.map(function(fieldName) {
					return JSON.stringify(row[fieldName], replacer)
				}).join(',')
			});

			rows.unshift(header.join(','));

			return rows.join('\r\n');

			//end of createCSV
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

		function createAnnotationsDiv() {

			iconsDiv.style("opacity", 0)
				.style("pointer-events", "none");

			const overDiv = containerDiv.append("div")
				.attr("class", "pbialiOverDivHelp");

			const topDivSize = topDiv.node().getBoundingClientRect();

			const iconsDivSize = iconsDiv.node().getBoundingClientRect();

			const topDivHeight = topDivSize.height * (width / topDivSize.width);

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + (height + topDivHeight + 2));

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
					return width - padding[1] - d.width - (i ? helpButtons[0].width + 8 : 0);
				})
				.on("click", function(_, i) {
					iconsDiv.style("opacity", 1)
						.style("pointer-events", "all");
					overDiv.remove();
					if (i) window.open(helpPortalUrl, "help_portal");
				});

			closeRects.append("text")
				.attr("class", "pbialiAnnotationMainText")
				.attr("text-anchor", "middle")
				.attr("x", function(d, i) {
					return width - padding[1] - (d.width / 2) - (i ? (helpButtons[0].width) + 8 : 0);
				})
				.attr("y", 22)
				.text(function(d) {
					return d.text
				});

			const helpData = [{
				x: padding[3] + mainPanel.padding[3] + 10,
				y: 20 + topDivHeight,
				width: width - (padding[3] + mainPanel.padding[3] + padding[1] + mainPanel.padding[1] + 30),
				height: 254,
				xTooltip: 240 * (topDivSize.width / width),
				yTooltip: (topDivHeight + 280) * (topDivSize.width / width),
				text: "Selected CBPFs will show up in this area. Hover over this area to get detailed values."
			}, {
				x: padding[3] + mainPanel.padding[3] - 10,
				y: 304 + topDivHeight,
				width: width - (padding[3] + padding[1] + buttonsPanel.padding[3]),
				height: 116,
				xTooltip: 280 * (topDivSize.width / width),
				yTooltip: (topDivHeight + 200) * (topDivSize.width / width),
				text: "Hover over a CBPF button to show its correspondent line in the chart area. Clicking a button keeps the line in the chart area, clicking again removes it. You can click several buttons."
			}, {
				x: 646,
				y: 424 + topDivHeight,
				width: 240,
				height: 14,
				xTooltip: 600 * (topDivSize.width / width),
				yTooltip: (topDivHeight + 350) * (topDivSize.width / width),
				text: "You can sort the CBPFs buttons alphabetically or by total allocations in each CBPF."
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
					.attr("class", "pbialiHelpRectangle")
					.attr("pointer-events", "all")
					.on("mouseover", function() {
						const self = this;
						createTooltip(d.xTooltip, d.yTooltip, d.text, self);
					})
					.on("mouseout", removeTooltip);
			});

			const explanationTextRect = helpSVG.append("rect")
				.attr("x", (width / 2) - 180)
				.attr("y", 164)
				.attr("width", 360)
				.attr("height", 50)
				.attr("pointer-events", "none")
				.style("fill", "white")
				.style("stroke", "#888");

			const explanationText = helpSVG.append("text")
				.attr("class", "pbialiAnnotationExplanationText")
				.attr("font-family", "Roboto")
				.attr("font-size", "18px")
				.style("fill", "#222")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 184)
				.attr("pointer-events", "none")
				.text("Hover over the elements surrounded by a blue rectangle to get additional information")
				.call(wrapText2, 350);

			function createTooltip(xPos, yPos, text, self) {
				explanationText.style("opacity", 0);
				explanationTextRect.style("opacity", 0);
				helpSVG.selectAll(".pbialiHelpRectangle").style("opacity", 0.1);
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
				helpSVG.selectAll(".pbialiHelpRectangle").style("opacity", 0.5);
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

		function createSnapshot(type, fromContextMenu) {

			if (isInternetExplorer) {
				alert("This functionality is not supported by Internet Explorer");
				return;
			};

			const downloadingDiv = d3.select("body").append("div")
				.style("position", "fixed")
				.attr("id", "pbialiDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv.append("svg")
				.attr("class", "pbialiDownloadingDivSvg")
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

				if (fromContextMenu && labelGroupHovered) d3.select(labelGroupHovered).dispatch("mouseout");

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

			const fileName = "AllocationTrends_" + csvDateFormat(currentDate) + ".png";

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

			d3.select("#pbialiDownloadingDiv").remove();

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

					const pdf = new jsPDF();

					createLetterhead();

					const intro = pdf.splitTextToSize("In 2018, CBPFs allocated more than $836 million to 685 partners in 18 countries to support 1,453 critical humanitarian projects. These projects targeted millions of people with healthcare, food aid, clean water, shelter and other life-saving assistance.", (210 - pdfMargins.left - pdfMargins.right), {
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
					pdf.text(chartTitle, pdfMargins.left, 71);

					pdf.setFontSize(12);

					const selectedCountry = !chartState.selectedCbpfs.length ?
						"Selected CBPFs-none" : countriesList();

					pdf.fromHTML("<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate + "</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" + selectedCountry.split("-")[0] + ": <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						selectedCountry.split("-")[1] + "</span></div>", pdfMargins.left, 77, {
							width: 210 - pdfMargins.left - pdfMargins.right
						},
						function(position) {
							pdfTextPosition = position;
						});

					const sourceDimentions = containerDiv.node().getBoundingClientRect();
					const widthInMilimeters = 210 - pdfMargins.left * 2;

					pdf.addImage(source, "PNG", pdfMargins.left, pdfTextPosition.y + 2, widthInMilimeters, widthInMilimeters * (sourceDimentions.height / sourceDimentions.width));

					const currentDate = new Date();

					pdf.save("AllocationTrends_" + csvDateFormat(currentDate) + ".pdf");

					removeProgressWheel();

					d3.select("#pbialiDownloadingDiv").remove();

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
						pdf.rect(0, 297 - pdfMargins.bottom, 210, 2, "F");

						pdf.setTextColor(60);
						pdf.setFont("arial");
						pdf.setFontType("normal");
						pdf.setFontSize(10);
						pdf.text(footer, pdfMargins.left, 297 - pdfMargins.bottom + 10);

					};

					function countriesList() {
						const plural = chartState.selectedCbpfs.length === 1 ? "" : "s";
						const countryList = chartState.selectedCbpfs.map(function(d) {
								return d;
							})
							.sort(function(a, b) {
								return a.toLowerCase() < b.toLowerCase() ? -1 :
									a.toLowerCase() > b.toLowerCase() ? 1 : 0;
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
				.attr("class", "pbialid3chartwheelGroup")
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
			const wheelGroup = d3.select(".pbialid3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());
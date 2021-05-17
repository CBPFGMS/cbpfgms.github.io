(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		isTouchScreenOnly = (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches),
		isUnochaSite = window.location.hostname === "cbpf.unocha.org",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles-stg.css", "https://cbpfgms.github.io/css/d3chartstylesunobbc.css"],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js",
		fetchPolyfill1 = "https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js",
		fetchPolyfill2 = "https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js";

	cssLinks.forEach(function(cssLink) {

		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		};

	});

	if (!isScriptLoaded(d3URL)) {
		if (hasFetch) {
			loadScript(d3URL, d3Chart);
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, function() {
					loadScript(d3URL, d3Chart);
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		if (hasFetch) {
			d3Chart();
		} else {
			loadScript(fetchPolyfill1, function() {
				loadScript(fetchPolyfill2, d3Chart);
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

		//Math.log10

		Math.log10 = Math.log10 || function(x) {
			return Math.log(x) * Math.LOG10E;
		};

		//END OF POLYFILLS

		var width = 1100,
			padding = [4, 4, 4, 4],
			classPrefix = "unobbc",
			topPanelHeight = 60,
			buttonsPanelHeight = 30,
			barsPanelHeight = 332,
			beeswarmPanelHeight = 100,
			panelHorizontalPadding = 6,
			buttonsNumber = 20,
			unBlue = "#1F69B3",
			height = topPanelHeight + buttonsPanelHeight + barsPanelHeight + beeswarmPanelHeight + (3 * panelHorizontalPadding),
			duration = 1500,
			shortDuration = 200,
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatSI2Decimals = d3.format(".2s"),
			formatSIaxes = d3.format("~s"),
			topPanelGroupWidth = 288,
			barsDonorsLabelsPadding = 4,
			localVariable = d3.local(),
			circleRadius = 3,
			smallerSvg = false,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			yearsArray = [],
			chartState = {
				selectedYear: []
			},
			moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
			],
			dataUrl = "https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv",
			beeswarmTransitionEnded = false,
			flagPadding = 30,
			barsHeightUnit = barsPanelHeight / 11,
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags/";

		var windowHeight = window.innerHeight;

		var containerDiv = d3.select("#d3chartcontainer" + classPrefix);

		var selectedResponsiveness = containerDiv.node().getAttribute("data-responsive");

		if (selectedResponsiveness !== "true" && selectedResponsiveness !== "false") {
			selectedResponsiveness = "true"
		};

		if (selectedResponsiveness === "false" || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const yearString = containerDiv.node().getAttribute("data-year");

		var lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		var svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		const yearsDescriptionDiv = containerDiv.append("div")
			.attr("class", classPrefix + "YearsDescriptionDiv");

		var actualSvgSize = svg.node().getBoundingClientRect();

		var actualWidth = actualSvgSize.width;

		var actualHeight = actualSvgSize.height;

		createProgressWhell();

		var tooltip = containerDiv.append("div")
			.attr("id", classPrefix + "tooltipdiv")
			.style("display", "none");

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", classPrefix + "ButtonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 0, 0],
			buttonWidth: 54,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18
		};

		var topPanel = {
			main: svg.append("g")
				.attr("class", classPrefix + "topPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			moneyBagPadding: 376,
			leftPadding: [562, 232, 868],
			mainValueVerPadding: 12,
			mainValueHorPadding: 3
		};

		var barsPanel = {
			main: svg.append("g")
				.attr("class", classPrefix + "barsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + topPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: barsPanelHeight,
			padding: [30, 32, 20, 32],
			titlePadding: 16,
			centralSpace: 220 + flagPadding,
			get barsSpace() {
				return (this.width - this.centralSpace) / 2;
			}
		};

		var beeswarmPanel = {
			main: svg.append("g")
				.attr("class", classPrefix + "beeswarmPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + topPanel.height + barsPanel.height + (3 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: beeswarmPanelHeight,
			padding: [18, 10, 24, 124],
			titlePadding: 10
		};

		//tests
		// buttonsPanel.main.append("rect")
		// 	.attr("width", buttonsPanel.width)
		// 	.attr("height", buttonsPanel.height)
		// 	.style("fill", "tan")
		// 	.style("opacity", 0.5);
		// topPanel.main.append("rect")
		// 	.attr("width", topPanel.width)
		// 	.attr("height", topPanel.height)
		// 	.style("fill", "tan")
		// 	.style("opacity", 0.5);
		// barsPanel.main.append("rect")
		// 	.attr("width", barsPanel.width)
		// 	.attr("height", barsPanel.height)
		// 	.style("fill", "tan")
		// 	.style("opacity", 0.5);
		// beeswarmPanel.main.append("rect")
		// 	.attr("width", beeswarmPanel.width)
		// 	.attr("height", beeswarmPanel.height)
		// 	.style("fill", "tan")
		// 	.style("opacity", 0.5);
		//tests

		var barsDonorsYScale = d3.scaleBand()
			.range([barsPanel.padding[0], barsPanel.height - barsPanel.padding[2]])
			.paddingOuter(0.1)
			.paddingInner(0.4);

		var barsCbpfsYScale = d3.scaleBand()
			.range([barsPanel.padding[0], barsPanel.height - barsPanel.padding[2]])
			.paddingOuter(0.1)
			.paddingInner(0.4);

		var barsDonorsXScale = d3.scaleLinear()
			.range([barsPanel.barsSpace, barsPanel.padding[3]]);

		var barsCbpfsXScale = d3.scaleLinear()
			.range([0, barsPanel.barsSpace - barsPanel.padding[1]]);

		var linksWidthScale = d3.scaleLinear();

		var linksYPosScale = d3.scalePoint();

		var beeswarmXScale = d3.scaleLinear()
			.range([beeswarmPanel.padding[3], beeswarmPanel.width - beeswarmPanel.padding[1]]);

		var beeswarmYScale = d3.scalePoint()
			.domain(["Donors", "CBPFs"])
			.range([beeswarmPanel.padding[0], beeswarmPanel.height - beeswarmPanel.padding[2]])
			.padding(0.75);

		var barsDonorsYAxis = d3.axisRight(barsDonorsYScale)
			.tickPadding(flagPadding);

		var barsCbpfsYAxis = d3.axisLeft(barsCbpfsYScale);

		var barsDonorsXAxis = d3.axisBottom(barsDonorsXScale)
			.tickPadding(6)
			.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]))
			.tickSizeOuter(0)
			.ticks(3)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		var barsCbpfsXAxis = d3.axisBottom(barsCbpfsXScale)
			.tickPadding(6)
			.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]))
			.tickSizeOuter(0)
			.ticks(3)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		var beeswarmXAxis = d3.axisBottom(beeswarmXScale)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			})
			.tickSizeOuter(0)
			.ticks(5);

		var beeswarmYAxis = d3.axisLeft(beeswarmYScale)
			.tickPadding(30)
			.tickSizeInner(-(beeswarmPanel.width - beeswarmPanel.padding[1] - beeswarmPanel.padding[3]));

		var linkGenerator = d3.linkHorizontal()
			.x(function(d) {
				return d.x;
			})
			.y(function(d) {
				return d.y;
			});

		d3.csv(dataUrl).then(function(rawData) {

			removeProgressWheel();

			preProcessData(rawData);

			yearsArray = yearsArray.filter(function(d) {
				return d <= currentYear;
			}).sort(function(a, b) {
				return a - b;
			});

			extractYear(yearString);

			var allDonorFlags = [...new Set(rawData.map(function(d) {
				return d.GMSDonorISO2Code.toLowerCase();
			}))];

			saveFlags(allDonorFlags);

			createButtonsPanel(rawData);

			const data = processData(rawData);

			if (!lazyLoad) {
				draw(data.dataDonors, data.dataCbpfs);
			} else {
				d3.select(window).on("scroll." + classPrefix, checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll." + classPrefix, null);
					draw(data.dataDonors, data.dataCbpfs);
				};
			};

			//end of d3.csv
		});

		function createButtonsPanel(rawData) {

			const clipPathButtons = buttonsPanel.main.append("clipPath")
				.attr("id", classPrefix + "clipPathButtons")
				.append("rect")
				.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
				.attr("height", buttonsPanel.height);

			const clipPathGroup = buttonsPanel.main.append("g")
				.attr("class", classPrefix + "ClipPathGroup")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + (buttonsPanel.width - (Math.min(yearsArray.length, buttonsNumber) * buttonsPanel.buttonWidth)) / 2) + ",0)")
				.attr("clip-path", "url(#" + classPrefix + "clipPathButtons)");

			const buttonsGroup = clipPathGroup.append("g")
				.attr("class", classPrefix + "buttonsGroup")
				.attr("transform", "translate(0,0)")
				.style("cursor", "pointer");

			const buttonsRects = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("rect")
				.attr("rx", "2px")
				.attr("ry", "2px")
				.attr("class", classPrefix + "buttonsRects")
				.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonPadding)
				.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding)
				.attr("x", function(_, i) {
					return i * buttonsPanel.buttonWidth + buttonsPanel.buttonPadding / 2;
				})
				.style("fill", function(d) {
					return chartState.selectedYear.indexOf(d) > -1 ? unBlue : "#eaeaea";
				});

			const buttonsText = buttonsGroup.selectAll(null)
				.data(yearsArray)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("class", classPrefix + "buttonsText")
				.style("user-select", "none")
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

			const leftArrow = buttonsPanel.main.append("g")
				.attr("class", classPrefix + "LeftArrowGroup")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr("transform", "translate(" + buttonsPanel.padding[3] + ",0)");

			const leftArrowRect = leftArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding);

			const leftArrowText = leftArrow.append("text")
				.attr("class", classPrefix + "leftArrowText")
				.attr("x", 0)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25c4");

			const rightArrow = buttonsPanel.main.append("g")
				.attr("class", classPrefix + "RightArrowGroup")
				.style("cursor", "pointer")
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding +
					(buttonsNumber * buttonsPanel.buttonWidth)) + ",0)");

			const rightArrowRect = rightArrow.append("rect")
				.style("fill", "white")
				.attr("width", buttonsPanel.arrowPadding)
				.attr("height", buttonsPanel.height - buttonsPanel.padding[0] - buttonsPanel.buttonVerticalPadding * 2)
				.attr("y", buttonsPanel.buttonVerticalPadding);

			const rightArrowText = rightArrow.append("text")
				.attr("class", classPrefix + "rightArrowText")
				.attr("x", -1)
				.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
				.style("fill", "#666")
				.text("\u25ba");

			if (yearsArray.length > buttonsNumber) {

				clipPathGroup.attr("transform", "translate(" + (buttonsPanel.padding[3] + buttonsPanel.arrowPadding) + ",0)")

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

			buttonsRects.on("mouseover", mouseOverButtonsRects)
				.on("mouseout", mouseOutButtonsRects)
				.on("click", function(d) {
					const self = this;
					if (d3.event.altKey) {
						clickButtonsRects(d, false);
						return;
					};
					if (localVariable.get(this) !== "clicked") {
						localVariable.set(this, "clicked");
						setTimeout(function() {
							if (localVariable.get(self) === "clicked") {
								clickButtonsRects(d, true);
							};
							localVariable.set(self, null);
						}, 250);
					} else {
						clickButtonsRects(d, false);
						localVariable.set(this, null);
					};
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
				tooltip.style("display", "block")
					.html(null)

				const innerTooltip = tooltip.append("div")
					.style("max-width", "200px")
					.attr("id", "pbiobeInnerTooltipDiv");

				innerTooltip.html("Click for selecting a single year. Double-click or ALT + click for selecting multiple years.");

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

				barsPanel.main.selectAll("." + classPrefix + "barsDonorsTooltipRect")
					.attr("pointer-events", "none");
				barsPanel.main.selectAll("." + classPrefix + "barsCbpfsTooltipRect")
					.attr("pointer-events", "none");
				barsPanel.main.selectAll("." + classPrefix + "links")
					.attr("pointer-events", "none");

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


				buttonsRects.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? unBlue : "#eaeaea";
				});

				buttonsText.style("fill", function(e) {
					return chartState.selectedYear.indexOf(e) > -1 ? "white" : "#444";
				});

				setYearsDescriptionDiv();

				const data = processData(rawData);

				draw(data.dataDonors, data.dataCbpfs);

				//end of clickButtonsRects
			};

			//end of createButtonsPanel
		};

		function draw(dataDonors, dataCbpfs) {

			const syncTransition = d3.transition()
				.duration(duration);

			var maxBarsNumber = Math.max(dataDonors.length, dataCbpfs.length);

			if (maxBarsNumber < 11) {

				smallerSvg = true;
				barsPanel.height = barsHeightUnit * maxBarsNumber;
				beeswarmPanel.main.transition(syncTransition)
					.attr("transform", "translate(" + padding[3] + "," +
						(padding[0] + buttonsPanel.height + topPanel.height + barsPanel.height + (3 * panelHorizontalPadding)) + ")");
				var newHeight = ~~(padding[3] + padding[0] + buttonsPanel.height + topPanel.height + barsPanel.height + beeswarmPanel.height + (3 * panelHorizontalPadding));
				svg.transition(syncTransition)
					.attr("viewBox", "0 0 " + width + " " + newHeight);
				if (selectedResponsiveness === "false") {
					containerDiv.style("height", newHeight + "px");
				};
				barsDonorsYScale.range([barsPanel.padding[0], (dataDonors.length * barsHeightUnit) -
					(dataDonors.length > dataCbpfs.length ? barsPanel.padding[2] : 0)
				]);
				barsCbpfsYScale.range([barsPanel.padding[0], (dataCbpfs.length * barsHeightUnit) -
					(dataCbpfs.length > dataDonors.length ? barsPanel.padding[2] : 0)
				]);
			};

			if (maxBarsNumber > 10 && (dataDonors.length < 11 || dataCbpfs.length < 11)) {
				if (smallerSvg) {
					svg.transition(syncTransition)
						.attr("viewBox", "0 0 " + width + " " + height);
					smallerSvg = false;
				};
				barsPanel.height = barsPanelHeight;
				beeswarmPanel.main.transition(syncTransition)
					.attr("transform", "translate(" + padding[3] + "," +
						(padding[0] + buttonsPanel.height + topPanel.height + barsPanel.height + (3 * panelHorizontalPadding)) + ")");
				barsDonorsYScale.range([barsPanel.padding[0], dataDonors.length < 11 ?
					(dataDonors.length * barsHeightUnit) - barsPanel.padding[2] :
					barsPanel.height - barsPanel.padding[2]
				]);
				barsCbpfsYScale.range([barsPanel.padding[0], dataCbpfs.length < 11 ?
					(dataCbpfs.length * barsHeightUnit) - barsPanel.padding[2] :
					barsPanel.height - barsPanel.padding[2]
				]);
			};

			if (maxBarsNumber > 10 && dataDonors.length >= 11 && dataCbpfs.length >= 11) {
				if (smallerSvg) {
					svg.transition(syncTransition)
						.attr("viewBox", "0 0 " + width + " " + height);
					smallerSvg = false;
				};
				barsPanel.height = barsPanelHeight;
				beeswarmPanel.main.transition(syncTransition)
					.attr("transform", "translate(" + padding[3] + "," +
						(padding[0] + buttonsPanel.height + topPanel.height + barsPanel.height + (3 * panelHorizontalPadding)) + ")");
				barsDonorsYScale.range([barsPanel.padding[0], barsPanel.height - barsPanel.padding[2]]);
				barsCbpfsYScale.range([barsPanel.padding[0], barsPanel.height - barsPanel.padding[2]]);
			};

			barsDonorsXAxis.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]));
			barsCbpfsXAxis.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]));

			var top10Donors = dataDonors.slice(0, 10);

			var top10Cbpfs = dataCbpfs.slice(0, 10);

			if (dataDonors.length > 10) {

				var otherDonors = {
					donor: "Other Donors",
					donorsList: [],
					donations: [],
					totalPaid: 0,
					totalPledge: 0
				};

				dataDonors.slice(10).forEach(function(d) {
					otherDonors.totalPaid += d.totalPaid;
					otherDonors.totalPledge += d.totalPledge;
					otherDonors.donorsList.push(d.donor)
					d.donations.forEach(function(e) {
						var found = otherDonors.donations.filter(function(f) {
							return e.cbpf === f.cbpf
						})[0];
						if (found) {
							found.amountPaid += e.amountPaid;
							found.amountPledge += e.amountPledge;
							found.amountPaidPlusPledge += e.amountPaid + e.amountPledge;
							found.donorsFromOthers.push(d.donor);
						} else {
							otherDonors.donations.push({
								cbpf: e.cbpf,
								amountPaid: e.amountPaid,
								amountPledge: e.amountPledge,
								amountPaidPlusPledge: e.amountPaid + e.amountPledge,
								donorsFromOthers: [d.donor]
							})
						}
					})
				});

				otherDonors.totalPaidPlusPledge = otherDonors.totalPaid + otherDonors.totalPledge;

				top10Donors.push(otherDonors);

			};

			if (dataCbpfs.length > 10) {

				var otherCbpfs = {
					cbpf: "Other CBPFs",
					cbpfList: [],
					donors: [],
					totalPaid: 0,
					totalPledge: 0
				};

				dataCbpfs.slice(10).forEach(function(d) {
					otherCbpfs.totalPaid += d.totalPaid;
					otherCbpfs.totalPledge += d.totalPledge;
					otherCbpfs.cbpfList.push(d.cbpf)
					d.donors.forEach(function(e) {
						var found = otherCbpfs.donors.filter(function(f) {
							return e.donor === f.donor
						})[0];
						if (found) {
							found.amountPaid += e.amountPaid;
							found.amountPledge += e.amountPledge;
							found.amountPaidPlusPledge += e.amountPaid + e.amountPledge;
							found.cbpfFromOthers.push(d.cbpf);
						} else {
							otherCbpfs.donors.push({
								donor: e.donor,
								amountPaid: e.amountPaid,
								amountPledge: e.amountPledge,
								amountPaidPlusPledge: e.amountPaid + e.amountPledge,
								cbpfFromOthers: [d.cbpf]
							})
						}
					})
				});

				otherCbpfs.totalPaidPlusPledge = otherCbpfs.totalPaid + otherCbpfs.totalPledge;

				top10Cbpfs.push(otherCbpfs);

			};

			var totalPaidAllCountries = d3.sum(dataDonors, function(d) {
				return d.totalPaid;
			});

			var totalPledgeAllCountries = d3.sum(dataDonors, function(d) {
				return d.totalPledge;
			});

			var totalAmountAllCountries = totalPaidAllCountries + totalPledgeAllCountries;

			var top10DonorsNames = top10Donors.map(function(d) {
				return d.donor
			});

			var top10CbpfsNames = top10Cbpfs.map(function(d) {
				return d.cbpf
			});

			barsDonorsYScale.domain(top10DonorsNames);

			barsCbpfsYScale.domain(top10CbpfsNames);

			linksYPosScale.range([-barsDonorsYScale.bandwidth() / 4, barsDonorsYScale.bandwidth() / 4]);

			linksWidthScale.range([1, barsDonorsYScale.bandwidth()]);

			var maxXValue = d3.max([d3.max(top10Donors, function(d) {
				return d.totalPaidPlusPledge
			}), d3.max(top10Cbpfs, function(d) {
				return d.totalPaidPlusPledge
			})]);

			barsDonorsXScale.domain([0, ~~(maxXValue * 1.05)]);

			barsCbpfsXScale.domain([0, ~~(maxXValue * 1.05)]);

			beeswarmXScale.domain([0, ~~(maxXValue * 1.05)]);


			//TOP PANEL

			const donorsNumber = dataDonors.length;

			const cbpfsNumber = dataCbpfs.length;

			// const topPanelMoneyBag = topPanel.main.selectAll("." + classPrefix + "topPanelMoneyBag")
			// 	.data([true]);

			// topPanelMoneyBag.enter()
			// 	.append("g")
			// 	.attr("class", classPrefix + "topPanelMoneyBag contributionColorFill")
			// 	.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.5)")
			// 	.each(function(_, i, n) {
			// 		moneyBagdAttribute.forEach(function(d) {
			// 			d3.select(n[i]).append("path")
			// 				.attr("d", d);
			// 		});
			// 	});

			const previousValue = d3.select("." + classPrefix + "topPanelMainValue").size() !== 0 ? d3.select("." + classPrefix + "topPanelMainValue").datum() : 0;

			const previousDonors = d3.select("." + classPrefix + "topPanelDonorsNumber").size() !== 0 ? d3.select("." + classPrefix + "topPanelDonorsNumber").datum() : 0;

			const previousCbpfs = d3.select("." + classPrefix + "topPanelCbpfsNumber").size() !== 0 ? d3.select("." + classPrefix + "topPanelCbpfsNumber").datum() : 0;

			let mainValueGroup = topPanel.main.selectAll("." + classPrefix + "mainValueGroup")
				.data([true]);

			mainValueGroup = mainValueGroup.enter()
				.append("g")
				.attr("class", classPrefix + "mainValueGroup")
				.merge(mainValueGroup);

			let topPanelMainValue = mainValueGroup.selectAll("." + classPrefix + "topPanelMainValue")
				.data([totalAmountAllCountries]);

			topPanelMainValue = topPanelMainValue.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelMainValue contributionColorFill")
				.attr("text-anchor", "end")
				.attr("x", topPanel.leftPadding[0] - topPanel.mainValueHorPadding)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.merge(topPanelMainValue);

			topPanelMainValue.transition(syncTransition)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousValue, d);
					return function(t) {
						const siString = formatSIFloat(i(t))
						node.textContent = "$" + siString.substring(0, siString.length - 1);
					};
				});

			let topPanelMainText = mainValueGroup.selectAll("." + classPrefix + "topPanelMainText")
				.data([totalAmountAllCountries]);

			topPanelMainText = topPanelMainText.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelMainText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.attr("x", topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
				.merge(topPanelMainText)

			topPanelMainText.transition(syncTransition)
				.style("opacity", 1)
				.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "";
				});

			let topPanelSubText = mainValueGroup.selectAll("." + classPrefix + "topPanelSubText")
				.data([true]);

			topPanelSubText = topPanelSubText.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelSubText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.attr("x", topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.1)
				.merge(topPanelSubText)

			topPanelSubText.transition(syncTransition)
				.style("opacity", 1)
				.text("Donated in " + (chartState.selectedYear.length === 1 ? chartState.selectedYear[0] : "years\u002A"));

			let topPanelDonorsNumber = mainValueGroup.selectAll("." + classPrefix + "topPanelDonorsNumber")
				.data([donorsNumber]);

			topPanelDonorsNumber = topPanelDonorsNumber.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelDonorsNumber contributionColorFill")
				.attr("text-anchor", "end")
				.attr("x", topPanel.leftPadding[1] - topPanel.mainValueHorPadding)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.merge(topPanelDonorsNumber);

			topPanelDonorsNumber.transition(syncTransition)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousDonors, d);
					return function(t) {
						node.textContent = ~~(i(t));
					};
				});

			const topPanelDonorsText = mainValueGroup.selectAll("." + classPrefix + "topPanelDonorsText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelDonorsText")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.9)
				.attr("text-anchor", "start")
				.text("Donors")
				.attr("x", topPanel.leftPadding[1]);

			let topPanelCbpfsNumber = mainValueGroup.selectAll("." + classPrefix + "topPanelCbpfsNumber")
				.data([cbpfsNumber]);

			topPanelCbpfsNumber = topPanelCbpfsNumber.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelCbpfsNumber allocationColorFill")
				.attr("text-anchor", "end")
				.attr("x", topPanel.leftPadding[2] - topPanel.mainValueHorPadding)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.merge(topPanelCbpfsNumber);

			topPanelCbpfsNumber.transition(syncTransition)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousCbpfs, d);
					return function(t) {
						node.textContent = ~~(i(t));
					};
				});

			const topPanelCbpfsText = mainValueGroup.selectAll("." + classPrefix + "topPanelCbpfsText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", classPrefix + "topPanelCbpfsText")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.9)
				.attr("text-anchor", "start")
				.text("CBPFs")
				.attr("x", topPanel.leftPadding[2]);

			const overRectangle = topPanel.main.selectAll("." + classPrefix + "topPanelOverRectangle")
				.data([true])
				.enter()
				.append("rect")
				.attr("class", classPrefix + "topPanelOverRectangle")
				.attr("width", topPanel.width)
				.attr("height", topPanel.height)
				.style("opacity", 0);

			overRectangle.on("mouseover", function() {

					const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

					const mouseContainer = d3.mouse(containerDiv.node());

					const mouse = d3.mouse(this);

					tooltip.style("display", "block")
						.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:256px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(totalAmountAllCountries) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercentCustom(totalPaidAllCountries, totalAmountAllCountries)) +
							")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(totalPaidAllCountries) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledged <span style='color: #888;'>(" + (formatPercentCustom(totalPledgeAllCountries, totalAmountAllCountries)) +
							")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(totalPledgeAllCountries) + "</span></div></div>");

					const tooltipSize = tooltip.node().getBoundingClientRect();

					localVariable.set(this, tooltipSize);

					tooltip.style("top", thisOffset + "px")
						.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
							mouseContainer[0] + 14 + "px" :
							mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");
				})
				.on("mousemove", function() {
					const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

					const mouseContainer = d3.mouse(containerDiv.node());

					const mouse = d3.mouse(this);

					const tooltipSize = localVariable.get(this);

					tooltip.style("top", thisOffset + "px")
						.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
							mouseContainer[0] + 14 + "px" :
							mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");
				})
				.on("mouseout", function() {
					tooltip.html(null)
						.style("display", "none");
				});

			//END TOP PANEL

			//BARS PANEL

			let barsDonorsTitle = barsPanel.main.selectAll("." + classPrefix + "barsPanelTitleDonors")
				.data([true]);

			barsDonorsTitle = barsDonorsTitle.enter()
				.append("text")
				.attr("text-anchor", "end")
				.attr("class", classPrefix + "barsPanelTitleDonors")
				.attr("y", barsPanel.titlePadding)
				.attr("x", barsPanel.barsSpace)
				.merge(barsDonorsTitle)
				.text(dataDonors.length > 10 ? "Top 10 Donors" : "Donors");

			let barsCbpfsTitle = barsPanel.main.selectAll("." + classPrefix + "barsPanelTitleCbpfs")
				.data([true]);

			barsCbpfsTitle = barsCbpfsTitle.enter()
				.append("text")
				.attr("class", classPrefix + "barsPanelTitleCbpfs")
				.attr("y", barsPanel.titlePadding)
				.attr("x", barsPanel.barsSpace + barsPanel.centralSpace)
				.merge(barsCbpfsTitle)
				.text(dataCbpfs.length > 10 ? "Top 10 CBPFs" : "CBPFs");

			let gBarsDonorsYAxis = barsPanel.main.selectAll("." + classPrefix + "gBarsContributionsYAxis")
				.data([true]);

			gBarsDonorsYAxis = gBarsDonorsYAxis.enter()
				.append("g")
				.attr("class", classPrefix + "gBarsContributionsYAxis")
				.attr("transform", "translate(" + barsPanel.barsSpace + ",0)")
				.style("opacity", 0)
				.merge(gBarsDonorsYAxis);

			gBarsDonorsYAxis.transition(syncTransition)
				.style("opacity", 1)
				.call(customAxis, barsDonorsYAxis, 1);

			let gBarsCbpfsYAxis = barsPanel.main.selectAll("." + classPrefix + "gBarsAllocationsYAxis")
				.data([true]);

			gBarsCbpfsYAxis = gBarsCbpfsYAxis.enter()
				.append("g")
				.attr("class", classPrefix + "gBarsAllocationsYAxis")
				.attr("transform", "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + ",0)")
				.style("opacity", 0)
				.merge(gBarsCbpfsYAxis);

			gBarsCbpfsYAxis.transition(syncTransition)
				.style("opacity", 1)
				.call(customAxis, barsCbpfsYAxis, -1);

			function customAxis(group, axisGenerator, coefficient) {
				const sel = group.selection ? group.selection() : group;
				group.call(axisGenerator);
				sel.selectAll(".tick text")
					.filter((d, i, n) => d.length > 15)
					.text(d => d.split(" ")[0])
					.attr("dy", "0em")
					.attr("x", coefficient * (axisGenerator.tickPadding() + axisGenerator.tickSize()))
					.append("tspan")
					.attr("dy", "0.9em")
					.attr("x", coefficient * (axisGenerator.tickPadding() + axisGenerator.tickSize()))
					.text(d => {
						const strArr = d.split(" ");
						strArr.shift();
						return strArr.join(" ");
					});
				if (sel !== group) group.selectAll(".tick text")
					.filter((d, i, n) => d.length > 15)
					.attrTween("x", null)
					.tween("text", null);
			};

			let gBarsDonorsXAxis = barsPanel.main.selectAll("." + classPrefix + "gBarsContributionsXAxis")
				.data([true]);

			gBarsDonorsXAxis = gBarsDonorsXAxis.enter()
				.append("g")
				.attr("class", classPrefix + "gBarsContributionsXAxis")
				.attr("transform", "translate(0, " + (barsPanel.height - barsPanel.padding[2]) + ")")
				.style("opacity", 0)
				.merge(gBarsDonorsXAxis);

			gBarsDonorsXAxis.transition(syncTransition)
				.style("opacity", 1)
				.attr("transform", "translate(0, " + (barsPanel.height - barsPanel.padding[2]) + ")")
				.call(barsDonorsXAxis);

			let gBarsCbpfsXAxis = barsPanel.main.selectAll("." + classPrefix + "gBarsAllocationsXAxis")
				.data([true]);

			gBarsCbpfsXAxis = gBarsCbpfsXAxis.enter()
				.append("g")
				.attr("class", classPrefix + "gBarsAllocationsXAxis")
				.attr("transform", "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + ", " + (barsPanel.height - barsPanel.padding[2]) + ")")
				.style("opacity", 0)
				.merge(gBarsCbpfsXAxis);

			gBarsCbpfsXAxis.transition(syncTransition)
				.style("opacity", 1)
				.attr("transform", "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + ", " + (barsPanel.height - barsPanel.padding[2]) + ")")
				.call(barsCbpfsXAxis);

			d3.selectAll("." + classPrefix + "gBarsContributionsXAxis, ." + classPrefix + "gBarsAllocationsXAxis")
				.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			let barsDonors = barsPanel.main.selectAll("." + classPrefix + "barsDonors")
				.data(top10Donors, function(d) {
					return d.donor;
				});

			const barsDonorsExit = barsDonors.exit()
				.transition(syncTransition)
				.style("opacity", 0)
				.remove();

			const barsDonorsEnter = barsDonors.enter()
				.append("g")
				.attr("class", classPrefix + "barsDonors")
				.attr("transform", function(d) {
					return "translate(0," + barsDonorsYScale(d.donor) + ")"
				});

			const barsDonorsRects = barsDonorsEnter.append("rect")
				.attr("class", classPrefix + "barsContributionsRects")
				.attr("x", barsPanel.barsSpace)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsDonorsYScale.bandwidth())
				.classed("contributionColorFill", true);

			const barsDonorsLabels = barsDonorsEnter.append("text")
				.attr("class", classPrefix + "barsContributionsLabels")
				.attr("text-anchor", "end")
				.attr("x", barsPanel.barsSpace - barsDonorsLabelsPadding)
				.attr("y", 4 + barsDonorsYScale.bandwidth() / 2);

			const barsDonorsOverRect = barsDonorsEnter.append("rect")
				.attr("class", classPrefix + "barsContributionsOverRect")
				.style("opacity", 0)
				.attr("x", barsPanel.barsSpace)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsDonorsYScale.bandwidth())
				.classed("contributionColorDarkerFill", true);

			const barsDonorsOverLine = barsDonorsEnter.append("line")
				.attr("class", classPrefix + "barsContributionsOverLine")
				.style("opacity", 0)
				.style("stroke", "white")
				.style("stroke-width", "1px")
				.attr("x1", barsPanel.barsSpace)
				.attr("x2", barsPanel.barsSpace)
				.attr("y1", 0)
				.attr("y2", barsDonorsYScale.bandwidth());

			const flags = barsDonorsEnter.append("image")
				.attr("width", 24)
				.attr("height", 24)
				.attr("y", -3)
				.attr("x", barsPanel.barsSpace + 8)
				.attr("xlink:href", function(d) {
					return d.donor === "Other Donors" ?
						null :
						localStorage.getItem("storedFlag" + d.isoCode) ?
						localStorage.getItem("storedFlag" + d.isoCode) :
						flagsDirectory + d.isoCode + ".png";
				})
				.style("opacity", 0);

			const barsDonorsTooltipRectEnter = barsDonorsEnter.append("rect")
				.attr("class", classPrefix + "barsDonorsTooltipRect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", barsDonorsYScale.bandwidth())
				.attr("width", function(d) {
					var thisTick = gBarsDonorsYAxis.selectAll(".tick text")
						.filter(function(e) {
							return e === d.donor
						}).node().getBBox().width;
					return barsPanel.barsSpace + thisTick + barsDonorsYAxis.tickPadding() +
						barsDonorsYAxis.tickSizeInner();
				})
				.style("opacity", 0)
				.attr("pointer-events", "none");

			barsDonors = barsDonorsEnter.merge(barsDonors);

			barsDonors.transition(syncTransition)
				.attr("transform", function(d) {
					return "translate(0," + barsDonorsYScale(d.donor) + ")"
				});

			barsDonors.select("." + classPrefix + "barsContributionsRects")
				.transition(syncTransition)
				.attr("x", function(d) {
					return barsDonorsXScale(d.totalPaidPlusPledge)
				})
				.attr("width", function(d) {
					return barsPanel.barsSpace - barsDonorsXScale(d.totalPaidPlusPledge)
				});

			barsDonors.select("." + classPrefix + "barsContributionsLabels")
				.transition(syncTransition)
				.attr("x", function(d) {
					return barsDonorsXScale(d.totalPaidPlusPledge) - barsDonorsLabelsPadding
				})
				.tween("text", function(d) {
					var node = this;
					var i = d3.interpolate(0, d.totalPaidPlusPledge);
					return function(t) {
						node.textContent = "$" + formatSIFloat1decimal(i(t));
					};
				});

			barsDonors.select("image")
				.transition(syncTransition)
				.style("opacity", 1);

			const barsDonorsTooltipRect = barsDonors.select("." + classPrefix + "barsDonorsTooltipRect");

			let barsCbpfs = barsPanel.main.selectAll("." + classPrefix + "barsCbpfs")
				.data(top10Cbpfs, function(d) {
					return d.cbpf;
				});

			const barsCbpfsExit = barsCbpfs.exit()
				.transition(syncTransition)
				.style("opacity", 0)
				.remove();

			const barsCbpfsEnter = barsCbpfs.enter()
				.append("g")
				.attr("class", classPrefix + "barsCbpfs")
				.attr("transform", function(d) {
					return "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + "," + barsCbpfsYScale(d.cbpf) + ")"
				});

			const barsCbpfsRects = barsCbpfsEnter.append("rect")
				.attr("class", classPrefix + "barsAllocationsRects")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsCbpfsYScale.bandwidth())
				.classed("allocationColorFill", true);

			const barsCbpfsLabels = barsCbpfsEnter.append("text")
				.attr("class", classPrefix + "barsAllocationsLabels")
				.attr("x", barsDonorsLabelsPadding)
				.attr("y", 4 + barsCbpfsYScale.bandwidth() / 2);

			const barsCbpfsOverRect = barsCbpfsEnter.append("rect")
				.attr("class", classPrefix + "barsAllocationsOverRect")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsCbpfsYScale.bandwidth())
				.classed("allocationColorDarkerFill", true);

			const barsCbpfsOverLine = barsCbpfsEnter.append("line")
				.attr("class", classPrefix + "barsAllocationsOverLine")
				.style("opacity", 0)
				.style("stroke", "white")
				.style("stroke-width", "1px")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", 0)
				.attr("y2", barsCbpfsYScale.bandwidth());

			const barsCbpfsTooltipRectEnter = barsCbpfsEnter.append("rect")
				.attr("class", classPrefix + "barsCbpfsTooltipRect")
				.attr("y", 0)
				.attr("height", barsCbpfsYScale.bandwidth())
				.attr("width", function(d) {
					var thisTick = gBarsCbpfsYAxis.selectAll(".tick text")
						.filter(function(e) {
							return e === d.cbpf
						}).node().getBBox().width;
					localVariable.set(this, thisTick)
					return barsPanel.barsSpace + thisTick + barsCbpfsYAxis.tickPadding() +
						barsCbpfsYAxis.tickSizeInner();
				})
				.attr("x", function() {
					return -localVariable.get(this) - barsCbpfsYAxis.tickPadding() -
						barsCbpfsYAxis.tickSizeInner();
				})
				.style("opacity", 0)
				.attr("pointer-events", "none");

			barsCbpfs = barsCbpfsEnter.merge(barsCbpfs);

			barsCbpfs.transition(syncTransition)
				.attr("transform", function(d) {
					return "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + "," + barsCbpfsYScale(d.cbpf) + ")"
				});

			barsCbpfs.select("." + classPrefix + "barsAllocationsRects")
				.transition(syncTransition)
				.attr("width", function(d) {
					return barsCbpfsXScale(d.totalPaidPlusPledge);
				});

			barsCbpfs.select("." + classPrefix + "barsAllocationsLabels")
				.transition(syncTransition)
				.attr("x", function(d) {
					return barsCbpfsXScale(d.totalPaidPlusPledge) + barsDonorsLabelsPadding;
				})
				.tween("text", function(d) {
					var node = this;
					var i = d3.interpolate(0, d.totalPaidPlusPledge);
					return function(t) {
						node.textContent = "$" + formatSIFloat1decimal(i(t));
					};
				});

			const barsCbpfsTooltipRect = barsCbpfs.select("." + classPrefix + "barsCbpfsTooltipRect");

			const barsMiddleText = barsPanel.main.selectAll("." + classPrefix + "barsMiddleText")
				.data([true])
				.enter()
				.append("text")
				.attr("class", classPrefix + "barsMiddleText")
				.attr("pointer-events", "none")
				.attr("x", barsPanel.width / 2 + flagPadding / 2)
				.attr("y", barsPanel.padding[0] - 26)
				.attr("text-anchor", "middle");

			var linksData = [];

			linksWidthScale.domain([0, totalAmountAllCountries]);

			let links;

			setTimeout(function() {

				top10Donors.forEach(function(d) {
					var counter = -1;
					var thisBoxDonors = gBarsDonorsYAxis.selectAll(".tick text")
						.filter(function(e) {
							return e === d.donor;
						}).node().getBBox();
					var numberOfLinks = d.donations.length;
					linksYPosScale.domain(d3.range(numberOfLinks));
					d.donations.forEach(function(e) {
						var donorsNames = e.donorsFromOthers ? e.donorsFromOthers : null;
						var cbpfName = otherCbpfs && otherCbpfs.cbpfList.indexOf(e.cbpf) > -1 ? "Other CBPFs" : e.cbpf;
						if (top10CbpfsNames.indexOf(cbpfName) > -1) {
							counter += 1;
							var thisBoxCbpfs = gBarsCbpfsYAxis.selectAll(".tick text")
								.filter(function(f) {
									return f === cbpfName;
								}).node().getBBox();
							linksData.push({
								source: {
									valuePaid: e.amountPaid,
									valuePledge: e.amountPledge,
									donor: d.donor,
									donorNames: donorsNames,
									x: barsPanel.barsSpace + thisBoxDonors.width + barsDonorsYAxis.tickPadding() +
										barsDonorsYAxis.tickSizeInner() + 4,
									y: barsDonorsYScale(d.donor) + barsDonorsYScale.bandwidth() / 2 - linksYPosScale(counter)
								},
								target: {
									valuePaid: e.amountPaid,
									valuePledge: e.amountPledge,
									cbpf: cbpfName,
									cbpfNameInOthers: e.cbpf,
									x: barsPanel.barsSpace + barsPanel.centralSpace - thisBoxCbpfs.width - barsCbpfsYAxis.tickPadding() -
										barsCbpfsYAxis.tickSizeInner() - 4,
									y: barsCbpfsYScale(cbpfName) + barsCbpfsYScale.bandwidth() / 2
								},
								width: linksWidthScale(e.amountPaid + e.amountPledge)
							})
						}
					})
				});

				links = barsPanel.main.selectAll("." + classPrefix + "links")
					.data(linksData, function(d) {
						return d.source.donor + d.target.cbpf;
					});

				const linksExit = links.exit()
					.transition(syncTransition)
					.style("opacity", 0)
					.remove();

				const linksEnter = links.enter()
					.append("path")
					.attr("class", classPrefix + "links")
					.style("stroke", "slategray")
					.style("fill", "none")
					.style("stroke-width", function(d) {
						return d.width + "px"
					})
					.style("opacity", 0)
					.attr("pointer-events", "none");

				links = linksEnter.merge(links);

				links.transition(syncTransition)
					.style("opacity", 0.1)
					.style("stroke-width", function(d) {
						return d.width + "px"
					})
					.attr("d", linkGenerator);

				links.on("mouseenter", mouseenterLinks)
					.on("mousemove", mousemoveLinks)
					.on("mouseout", mouseoutLinks);

			}, 50);

			d3.timeout(function() {
				barsDonorsTooltipRect.attr("pointer-events", "all");
				barsCbpfsTooltipRect.attr("pointer-events", "all");
				links.attr("pointer-events", "auto");
			}, duration * 1.1);

			barsDonorsTooltipRect.on("mouseenter", mouseenterBarsDonors)
				.on("mousemove", mousemoveBarsDonors)
				.on("mouseout", mouseoutBarsDonors);

			barsCbpfsTooltipRect.on("mouseenter", mouseenterBarsCbpfs)
				.on("mousemove", mousemoveBarsCbpfs)
				.on("mouseout", mouseoutBarsCbpfs);

			//END BARS PANEL

			//BEESWARM PANEL

			var beeswarmTitle = beeswarmPanel.main.selectAll("." + classPrefix + "barsPanelTitleBeeswarm")
				.data([true])
				.enter()
				.append("text")
				.style("text-anchor", "middle")
				.attr("class", classPrefix + "barsPanelTitleBeeswarm")
				.attr("y", beeswarmPanel.padding[0] - 2)
				.attr("x", beeswarmPanel.width / 2)
				.text("All Donors and CBPFs");

			let gBeeswarmXAxis = beeswarmPanel.main.selectAll("." + classPrefix + "gBeeswarmXAxis")
				.data([true]);

			gBeeswarmXAxis = gBeeswarmXAxis.enter()
				.append("g")
				.attr("class", classPrefix + "gBeeswarmXAxis")
				.attr("transform", "translate(0, " + (beeswarmPanel.height - beeswarmPanel.padding[2]) + ")")
				.merge(gBeeswarmXAxis);

			gBeeswarmXAxis.transition(syncTransition)
				.call(beeswarmXAxis);

			let gBeeswarmYAxis = beeswarmPanel.main.selectAll("." + classPrefix + "gBeeswarmYAxis")
				.data([true]);

			gBeeswarmYAxis = gBeeswarmYAxis.enter()
				.append("g")
				.attr("class", classPrefix + "gBeeswarmYAxis")
				.attr("transform", "translate(" + beeswarmPanel.padding[3] + ",0)")
				.merge(gBeeswarmYAxis);

			gBeeswarmYAxis.transition(syncTransition)
				.call(beeswarmYAxis);

			const verticalLine = beeswarmPanel.main.selectAll("." + classPrefix + "verticalLine")
				.data([true])
				.enter()
				.append("line")
				.attr("class", classPrefix + "verticalLine")
				.style("stroke-width", "1px")
				.style("stroke-dasharray", "2, 2")
				.style("stroke", "#ccc")
				.attr("pointer-events", "none");

			beeswarmYScale.domain().forEach(function(d) {
				drawBeeswarm(d);
			});

			function drawBeeswarm(category) {

				var beeswarmData = category === "Donors" ? JSON.parse(JSON.stringify(dataDonors)) :
					JSON.parse(JSON.stringify(dataCbpfs));

				var maximumTicks = Math.max(beeswarmData.length * 3, 150);

				var simulation = d3.forceSimulation(beeswarmData)
					.force("x", d3.forceX(function(d) {
						return beeswarmXScale(d.totalPaidPlusPledge);
					}).strength(0.9))
					.force("y", d3.forceY(function(d) {
						return beeswarmYScale(category)
					}).strength(0.2))
					.force("collide", d3.forceCollide(function(d) {
						return (circleRadius) + 0.5;
					}).strength(1))
					.stop();

				for (var i = 0; i < maximumTicks; i++) simulation.tick();

				let circles = beeswarmPanel.main.selectAll("." + classPrefix + "circles" + category)
					.data(beeswarmData, function(d) {
						return d.isoCode
					});

				const circlesExit = circles.exit()
					.transition(syncTransition)
					.style("opacity", 0)
					.remove();

				const circlesEnter = circles.enter()
					.append("circle")
					.attr("class", classPrefix + "circles" + category)
					.classed((category === "Donors" ? "contributionColorFill" : "allocationColorFill"), true)
					.attr("r", circleRadius)
					.attr("cx", beeswarmXScale(0))
					.attr("cy", beeswarmYScale(category));

				circles = circlesEnter.merge(circles);

				circles.transition(syncTransition)
					.attr("cx", function(d) {
						return d.x
					})
					.attr("cy", function(d) {
						return Math.max(d.y, beeswarmPanel.padding[0] + circleRadius)
					})
					.on("end", function() {
						beeswarmTransitionEnded = true;
					});

				circles.on("mouseover", function(d) {

						var name = category === "Donors" ? "donor" : "cbpf";
						var displayName = category === "Donors" ? "Donor" : "CBPF";
						var circleClass = category === "Donors" ? "contributionColorHTMLcolor" : "allocationColorHTMLcolor";
						var description = category === "Donors" ? "Total donated" : "Total received";

						if (category === "Donors") {
							var imageSource = localStorage.getItem("storedFlag" + d.isoCode) ?
								localStorage.getItem("storedFlag" + d.isoCode) :
								flagsDirectory + d.isoCode + ".png";
						}

						var flag = category === "CBPFs" ? "<br>" : "<img src='" + imageSource + "' height='24' width='24' style='padding:0px;'><br style='line-height:180%;'/>";

						verticalLine.attr("x1", beeswarmXScale(d.totalPaidPlusPledge))
							.attr("x2", beeswarmXScale(d.totalPaidPlusPledge))
							.attr("y1", d.y)
							.attr("y2", beeswarmPanel.height - beeswarmPanel.padding[2])
							.style("opacity", 1);

						gBeeswarmXAxis.select("path").style("stroke", "#ccc");

						beeswarmPanel.main.selectAll("circle")
							.style("opacity", function(e) {
								return e[name] === d[name] ? 1 : 0.1;
							});

						tooltip.style("display", "block").html("<div style='display:flex;'><span style='margin-top:3px;white-space:pre;'>" + displayName + ": </span><span style='margin-top:3px;white-space:pre;font-weight:bold;' class=" + circleClass + ">" + d[name] + " </span> " + flag + "</div>" +
							description + ": $" + formatMoney0Decimals(d.totalPaidPlusPledge));

						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv.node().getBoundingClientRect();
						var tooltipSize = tooltip.node().getBoundingClientRect();

						tooltip.style("top", containerBox.height - tooltipSize.height - 26 + "px")
							.style("left", thisBox.right - containerBox.left + tooltipSize.width + 8 > beeswarmPanel.width ? thisBox.left - containerBox.left - tooltipSize.width - 8 + "px" : thisBox.left - containerBox.left + circleRadius + 8 + "px");

						var enlargedCircle = d3.select(this).clone(false)
							.attr("class", "clonedCircle")
							.attr("pointer-events", "none")
							.style("fill-opacity", 0)
							.style("stroke", d3.select(this).style("fill"))
							.transition()
							.duration(shortDuration * 2)
							.attr("r", circleRadius + 2);

					})
					.on("mouseout", function() {
						beeswarmPanel.main.selectAll("circle").style("opacity", 1);
						tooltip.style("display", "none");
						verticalLine.style("opacity", 0);
						gBeeswarmXAxis.select("path").style("stroke", "none");
						d3.select(".clonedCircle").remove();
					});

				//end of drawBeeswarm
			}

			//END BEESWARM PANEL

			//CONTROL FUNCTIONS

			function mouseenterBarsDonors(d, barNumber) {

				barsPanel.main.selectAll("*").interrupt();

				const mouseTransition = d3.transition()
					.duration(shortDuration * 2);

				barsDonors.selectAll("." + classPrefix + "barsContributionsRects, ." + classPrefix + "barsContributionsLabels").style("opacity", function(e) {
					return e.donor === d.donor ? 1 : 0.05
				});

				gBarsDonorsYAxis.selectAll(".tick").style("opacity", function(e) {
					return e === d.donor ? 1 : 0.05
				});

				gBarsDonorsXAxis.selectAll(".tick line, .tick text").style("opacity", 0);

				gBarsCbpfsXAxis.selectAll(".tick line, .tick text").style("opacity", 0);

				links.style("opacity", function(e) {
					return e.source.donor === d.donor ? 0.2 : 0;
				});

				flags.style("opacity", function(e) {
					return e.donor === d.donor ? 1 : 0.05;
				});

				barsCbpfs.each(function(e) {

					var thisGroup = d3.select(this);
					var donorFound;

					if (d.donor === "Other Donors") {
						donorFound = e.donors.filter(function(f) {
							return d.donorsList.indexOf(f.donor) > -1
						});
						if (donorFound.length > 0) {
							donorFound = donorFound.reduce(function(a, b) {
								return {
									donor: a.donor + ";" + b.donor,
									amountPaid: a.amountPaid + b.amountPaid,
									amountPledge: a.amountPledge + b.amountPledge,
									amountPaidPlusPledge: a.amountPaidPlusPledge + b.amountPaidPlusPledge
								}
							});
						} else {
							donorFound = undefined;
						}
					} else {
						donorFound = e.donors.find(function(f) {
							return f.donor === d.donor
						});
					};
					if (donorFound === undefined || donorFound.amountPaidPlusPledge === 0) {
						thisGroup.selectAll("." + classPrefix + "barsAllocationsRects, ." + classPrefix + "barsAllocationsLabels")
							.style("opacity", 0.05);
						gBarsCbpfsYAxis.selectAll(".tick").filter(function(f) {
								return f === e.cbpf;
							})
							.style("opacity", 0.05);
					} else {

						thisGroup.select("." + classPrefix + "barsAllocationsOverRect")
							.transition(mouseTransition)
							.style("opacity", 1)
							.attr("width", barsCbpfsXScale(donorFound.amountPaid));

						thisGroup.select("." + classPrefix + "barsAllocationsOverLine")
							.transition(mouseTransition)
							.style("opacity", 1)
							.attr("x1", barsCbpfsXScale(donorFound.amountPaid))
							.attr("x2", barsCbpfsXScale(donorFound.amountPaid));

						thisGroup.select("." + classPrefix + "barsAllocationsRects")
							.transition(mouseTransition)
							.attr("width", barsCbpfsXScale(donorFound.amountPaidPlusPledge));

						thisGroup.select("." + classPrefix + "barsAllocationsLabels")
							.transition(mouseTransition)
							.attr("x", function() {
								return barsCbpfsXScale(donorFound.amountPaidPlusPledge) + barsDonorsLabelsPadding;
							})
							.tween("text", function() {
								var percentPaid = " (" + formatPercent(donorFound.amountPaid / donorFound.amountPaidPlusPledge) +
									" paid)";
								localVariable.set(this, donorFound.amountPaidPlusPledge);
								var node = this;
								var i = d3.interpolate(e.totalPaidPlusPledge, donorFound.amountPaidPlusPledge);
								return function(t) {
									d3.select(node).text("$" + formatSIFloat1decimal(i(t)))
										.append("tspan")
										.attr("class", classPrefix + "barsMiddleText")
										.attr("dy", "-1px")
										.text(percentPaid);
								};
							});
					}
				});

				var donorText = d.donor === "Other Donors" ? "Donors:<br>" : "Donor: "
				var donorCountry = d.donor === "Other Donors" ? generateOtherDonorsList(d.donorsList) : d.donor;

				var cbpfsInOthers = d.donations.filter(function(e) {
					return otherCbpfs ? otherCbpfs.cbpfList.indexOf(e.cbpf) > -1 : false;
				});

				var cbpfsInOthersText = cbpfsInOthers.length === 0 ? "" : "<br><br>Other CBPFs <span style='color:#666;'>(" +
					formatSIFloat1decimal(d3.sum(cbpfsInOthers, function(e) {
						return e.amountPaidPlusPledge
					})) +
					")</span>:<br style='line-height:170%;'/>";

				tooltip.style("display", "block")
					.html(donorText + "<strong><span class='contributionColorHTMLcolor'>" + donorCountry +
						"</span></strong><br style='line-height:170%;'/><div id=contributionsTooltipBar></div>Total Paid: <span class='contributionColorDarkerHTMLcolor' style='font-weight:700;'>$" + formatMoney0Decimals(d.totalPaid) +
						" (" + (formatPercent(d.totalPaid / d.totalPaidPlusPledge) === "0%" && d.totalPaid !== 0 ? "<1%" : formatPercent(d.totalPaid / d.totalPaidPlusPledge)) +
						")</span><br>Total Pledged: <span class='contributionColorHTMLcolor' style='font-weight:700;'>$" + formatMoney0Decimals(d.totalPledge) +
						" (" + (formatPercent(d.totalPledge / d.totalPaidPlusPledge) === "0%" && d.totalPledge !== 0 ? "<1%" : formatPercent(d.totalPledge / d.totalPaidPlusPledge)) + ")</span>" + cbpfsInOthersText);

				createDonorsTooltipBar(d);

				if (cbpfsInOthers.length > 0) createTooltipSVG(cbpfsInOthers, "cbpf", "allocationColorFill");

				var tooltipSize = tooltip.node().getBoundingClientRect();
				localVariable.set(tooltip.node(), tooltipSize);
				const thisBox = this.getBoundingClientRect();
				const containerBox = containerDiv.node().getBoundingClientRect();
				const offsetTop = thisBox.top - containerBox.top + tooltipSize.height + 6 > containerBox.height ?
					thisBox.top - containerBox.top - tooltipSize.height - 6 :
					thisBox.bottom - containerBox.top + 6;

				tooltip.style("top", offsetTop + "px")
					.style("left", thisBox.left - containerBox.left + (thisBox.width - tooltipSize.width) / 2 + "px");

				barsMiddleText.text("Donated to... (darker color indicates")
					.append("tspan")
					.attr("x", barsPanel.width / 2 + flagPadding / 2)
					.attr("dy", "1em")
					.text("paid amount, lighter color")
					.append("tspan")
					.attr("x", barsPanel.width / 2 + flagPadding / 2)
					.attr("dy", "1em")
					.text("indicates pledged amount)");

				highlightBeeswarm(d, "Donors");

				//end of mouseenterBarsDonors
			};

			function mouseenterBarsCbpfs(d, barNumber) {

				barsPanel.main.selectAll("*").interrupt();

				const mouseTransition = d3.transition()
					.duration(shortDuration * 2);

				barsCbpfs.selectAll("." + classPrefix + "barsAllocationsRects, ." + classPrefix + "barsAllocationsLabels").style("opacity", function(e) {
					return e.cbpf === d.cbpf ? 1 : 0.05
				});

				gBarsCbpfsYAxis.selectAll(".tick").style("opacity", function(e) {
					return e === d.cbpf ? 1 : 0.05
				});

				gBarsDonorsXAxis.selectAll(".tick line, .tick text").style("opacity", 0);

				gBarsCbpfsXAxis.selectAll(".tick line, .tick text").style("opacity", 0);

				links.style("opacity", function(e) {
					return e.target.cbpf === d.cbpf ? 0.2 : 0;
				});

				barsDonors.each(function(e) {

					var thisGroup = d3.select(this);
					var cbpfFound;
					if (d.cbpf === "Other CBPFs") {
						cbpfFound = e.donations.filter(function(f) {
							return d.cbpfList.indexOf(f.cbpf) > -1
						});
						if (cbpfFound.length > 0) {
							cbpfFound = cbpfFound.reduce(function(a, b) {
								return {
									cbpf: a.cbpf + ";" + b.cbpf,
									amountPaid: a.amountPaid + b.amountPaid,
									amountPledge: a.amountPledge + b.amountPledge,
									amountPaidPlusPledge: a.amountPaidPlusPledge + b.amountPaidPlusPledge
								}
							});
						} else {
							cbpfFound = undefined;
						}
					} else {
						cbpfFound = e.donations.find(function(f) {
							return f.cbpf === d.cbpf
						});
					};
					if (cbpfFound === undefined || cbpfFound.amountPaidPlusPledge === 0) {
						thisGroup.selectAll("." + classPrefix + "barsContributionsRects, ." + classPrefix + "barsContributionsLabels")
							.style("opacity", 0.05);
						gBarsDonorsYAxis.selectAll(".tick").filter(function(f) {
								return f === e.donor;
							})
							.style("opacity", 0.05);
					} else {

						thisGroup.select("." + classPrefix + "barsContributionsOverRect")
							.transition()
							.duration(shortDuration * 2)
							.style("opacity", 1)
							.attr("x", barsDonorsXScale(cbpfFound.amountPaid))
							.attr("width", barsPanel.barsSpace - barsDonorsXScale(cbpfFound.amountPaid));

						thisGroup.select("." + classPrefix + "barsContributionsOverLine")
							.transition()
							.duration(shortDuration * 2)
							.style("opacity", 1)
							.attr("x1", barsDonorsXScale(cbpfFound.amountPaid))
							.attr("x2", barsDonorsXScale(cbpfFound.amountPaid));

						thisGroup.select("." + classPrefix + "barsContributionsRects")
							.transition()
							.duration(shortDuration * 2)
							.attr("x", barsDonorsXScale(cbpfFound.amountPaidPlusPledge))
							.attr("width", barsPanel.barsSpace - barsDonorsXScale(cbpfFound.amountPaidPlusPledge));

						thisGroup.select("." + classPrefix + "barsContributionsLabels")
							.transition()
							.duration(shortDuration * 2)
							.attr("x", function() {
								return barsDonorsXScale(cbpfFound.amountPaidPlusPledge) - barsDonorsLabelsPadding;
							})
							.tween("text", function() {
								var percentPaid = " (" + formatPercent(cbpfFound.amountPaid / cbpfFound.amountPaidPlusPledge) +
									" paid) ";
								localVariable.set(this, cbpfFound.amountPaidPlusPledge);
								var node = this;
								var i = d3.interpolate(e.totalPaidPlusPledge, cbpfFound.amountPaidPlusPledge);
								return function(t) {
									d3.select(node).text("")
										.append("tspan")
										.attr("class", classPrefix + "barsMiddleText")
										.attr("dy", "-1px")
										.text(percentPaid)
										.append("tspan")
										.attr("class", classPrefix + "barsLabels")
										.text("$" + formatSIFloat1decimal(i(t)));
								};
							});

					}
				});

				var cbpfText = d.cbpf === "Other CBPFs" ? "CBPFs" : "CBPF";

				var cbpfCountry = "";

				if (d.cbpf === "Other CBPFs") {
					for (var index = 0; index < d.cbpfList.length - 1; index++) {
						var thisCbpfAmount = dataCbpfs.filter(function(e) {
							return e.cbpf === d.cbpfList[index]
						})[0].totalPaidPlusPledge;
						if (index === 0) {
							cbpfCountry += d.cbpfList[index] + " <span style='color:#666;font-size:12px;font-weight:300;'>(" +
								formatSIFloat1decimal(thisCbpfAmount) + ")</span><br>";
						} else {
							cbpfCountry += "<span style='margin-left:52px;'>" + d.cbpfList[index] + " </span><span style='color:#666;font-size:12px;font-weight:300;'>(" +
								formatSIFloat1decimal(thisCbpfAmount) + ")</span><br>";
						};
					};
					cbpfCountry = cbpfCountry.slice(0, cbpfCountry.length - 4);
				} else {
					cbpfCountry = d.cbpf;
				};

				var donorsInOthers = d.donors.filter(function(e) {
					return otherDonors ? otherDonors.donorsList.indexOf(e.donor) > -1 : false;
				});

				var donorsInOthersText = donorsInOthers.length === 0 ? "" : "<br><br>Other donors <span style='color:#666;'>(" +
					formatSIFloat1decimal(d3.sum(donorsInOthers, function(e) {
						return e.amountPaidPlusPledge
					})) +
					")</span>:<br style='line-height:170%;'/>";

				tooltip.style("display", "block")
					.html(cbpfText + ": <strong><span class='allocationColorHTMLcolor'>" + cbpfCountry +
						"</span></strong><br style=\"line-height:170%;\"/><div id=allocationsTooltipBar></div>Paid donations: <span class='allocationColorDarkerHTMLcolor' style='font-weight:700;'>$" +
						formatMoney0Decimals(d.totalPaid) + " (" + (formatPercent(d.totalPaid / d.totalPaidPlusPledge) === "0%" && d.totalPaid !== 0 ? "<1%" : formatPercent(d.totalPaid / d.totalPaidPlusPledge)) +
						")</span><br>Pledged donations: <span class='allocationColorHTMLcolor' style='font-weight:700;'>$" +
						formatMoney0Decimals(d.totalPledge) + " (" + (formatPercent(d.totalPledge / d.totalPaidPlusPledge) === "0%" && d.totalPledge !== 0 ? "<1%" : formatPercent(d.totalPledge / d.totalPaidPlusPledge)) +
						")</span>" + donorsInOthersText);

				createCbpfsTooltipBar(d);

				if (donorsInOthers.length > 0) createTooltipSVG(donorsInOthers, "donor", "contributionColorFill");

				var tooltipSize = tooltip.node().getBoundingClientRect();
				localVariable.set(tooltip.node(), tooltipSize);
				const thisBox = this.getBoundingClientRect();
				const containerBox = containerDiv.node().getBoundingClientRect();
				const offsetTop = thisBox.top - containerBox.top + tooltipSize.height + 6 > containerBox.height ?
					thisBox.top - containerBox.top - tooltipSize.height - 6 :
					thisBox.bottom - containerBox.top + 6;

				tooltip.style("top", offsetTop + "px")
					.style("left", thisBox.left - containerBox.left + (thisBox.width - tooltipSize.width) / 2 + "px");

				barsMiddleText.text("Received from... (darker color indicates")
					.append("tspan")
					.attr("x", barsPanel.width / 2 + flagPadding / 2)
					.attr("dy", "1em")
					.text("paid amount, lighter color")
					.append("tspan")
					.attr("x", barsPanel.width / 2 + flagPadding / 2)
					.attr("dy", "1em")
					.text("indicates pledged amount)");

				highlightBeeswarm(d, "CBPFs");

				var donorsList = d.donors.map(function(e) {
					return e.donor
				});

				flags.style("opacity", function(e) {
					return donorsList.indexOf(e.donor) > -1 ? 1 : 0.05;
				});

				//end of mouseenterBarsCbpfs
			};

			function mouseenterLinks(d) {

				links.style("opacity", 0);

				d3.select(this).style("opacity", 0.4);

				var thisBarsDonorsGroup = barsDonors.filter(function(e) {
					return e.donor === d.source.donor;
				});

				var thisBarsCbpfsGroup = barsCbpfs.filter(function(e) {
					return e.cbpf === d.target.cbpf;
				});

				var thisDonor = top10Donors.find(function(e) {
					return e.donor === d.source.donor
				});

				var thisCbpf = top10Cbpfs.find(function(e) {
					return e.cbpf === d.target.cbpf
				});

				barsDonors.selectAll("." + classPrefix + "barsContributionsRects, ." + classPrefix + "barsContributionsLabels")
					.style("opacity", function(e) {
						return e.donor === d.source.donor ? 1 : 0.05;
					});

				barsCbpfs.selectAll("." + classPrefix + "barsAllocationsRects, ." + classPrefix + "barsAllocationsLabels")
					.style("opacity", function(e) {
						return e.cbpf === d.target.cbpf ? 1 : 0.05;
					});

				gBarsDonorsYAxis.selectAll(".tick").style("opacity", function(e) {
					return e === d.source.donor ? 1 : 0.05
				});

				gBarsCbpfsYAxis.selectAll(".tick").style("opacity", function(e) {
					return e === d.target.cbpf ? 1 : 0.05
				});

				gBarsDonorsXAxis.selectAll(".tick line, .tick text").style("opacity", 0);

				gBarsCbpfsXAxis.selectAll(".tick line, .tick text").style("opacity", 0);

				thisBarsCbpfsGroup.select("." + classPrefix + "barsAllocationsOverRect")
					.transition()
					.duration(shortDuration * 2)
					.style("opacity", 1)
					.attr("width", barsCbpfsXScale(d.source.valuePaid));

				thisBarsCbpfsGroup.select("." + classPrefix + "barsAllocationsOverLine")
					.transition()
					.duration(shortDuration * 2)
					.style("opacity", 1)
					.attr("x1", barsCbpfsXScale(d.source.valuePaid))
					.attr("x2", barsCbpfsXScale(d.source.valuePaid));

				thisBarsCbpfsGroup.select("." + classPrefix + "barsAllocationsRects")
					.transition()
					.duration(shortDuration * 2)
					.attr("width", barsCbpfsXScale((d.source.valuePaid + d.source.valuePledge)));

				thisBarsCbpfsGroup.select("." + classPrefix + "barsAllocationsLabels")
					.transition()
					.duration(shortDuration * 2)
					.attr("x", function() {
						return barsCbpfsXScale((d.source.valuePaid + d.source.valuePledge)) + barsDonorsLabelsPadding;
					})
					.tween("text", function() {
						var percentPaid = " (" + formatPercent(d.source.valuePaid / (d.source.valuePaid + d.source.valuePledge)) +
							" paid)";
						localVariable.set(this, (d.source.valuePaid + d.source.valuePledge));
						var node = this;
						var i = d3.interpolate(thisDonor.totalPaidPlusPledge, (d.source.valuePaid + d.source.valuePledge));
						return function(t) {
							d3.select(node).text("$" + formatSIFloat1decimal(i(t)))
								.append("tspan")
								.attr("class", classPrefix + "barsMiddleText")
								.attr("dy", "-1px")
								.text(percentPaid);
						};
					});

				thisBarsDonorsGroup.select("." + classPrefix + "barsContributionsOverRect")
					.transition()
					.duration(shortDuration * 2)
					.style("opacity", 1)
					.attr("x", barsDonorsXScale(d.target.valuePaid))
					.attr("width", barsPanel.barsSpace - barsDonorsXScale(d.target.valuePaid));

				thisBarsDonorsGroup.select("." + classPrefix + "barsContributionsOverLine")
					.transition()
					.duration(shortDuration * 2)
					.style("opacity", 1)
					.attr("x1", barsDonorsXScale(d.target.valuePaid))
					.attr("x2", barsDonorsXScale(d.target.valuePaid));

				thisBarsDonorsGroup.select("." + classPrefix + "barsContributionsRects")
					.transition()
					.duration(shortDuration * 2)
					.attr("x", barsDonorsXScale((d.target.valuePaid + d.target.valuePledge)))
					.attr("width", barsPanel.barsSpace - barsDonorsXScale((d.target.valuePaid + d.target.valuePledge)));

				thisBarsDonorsGroup.select("." + classPrefix + "barsContributionsLabels")
					.transition()
					.duration(shortDuration * 2)
					.attr("x", function() {
						return barsDonorsXScale((d.target.valuePaid + d.target.valuePledge)) - barsDonorsLabelsPadding;
					})
					.tween("text", function() {
						var percentPaid = " (" + formatPercent(d.target.valuePaid / (d.target.valuePaid + d.target.valuePledge)) +
							" paid) ";
						localVariable.set(this, (d.target.valuePaid + d.target.valuePledge));
						var node = this;
						var i = d3.interpolate(thisCbpf.totalPaidPlusPledge, (d.target.valuePaid + d.target.valuePledge));
						return function(t) {
							d3.select(node).text("")
								.append("tspan")
								.attr("class", classPrefix + "barsMiddleText")
								.attr("dy", "-1px")
								.text(percentPaid)
								.append("tspan")
								.attr("class", classPrefix + "barsLabels")
								.text("$" + formatSIFloat1decimal(i(t)));
						};
					});

				var thisCbpfName = d.target.cbpf === "Other CBPFs" ? "Other CBPFs (" + d.target.cbpfNameInOthers + ")" : d.target.cbpf;
				var thisDonorName = d.source.donor === "Other Donors" ? "Other Donors (" + d.source.donorNames.join(", ") + ")" : d.source.donor;

				tooltip.style("display", "block")
					.html("Donor: <strong><span class='contributionColorHTMLcolor'>" +
						thisDonorName + "</span></strong><br>CBPF: <strong><span class='allocationColorHTMLcolor'>" + thisCbpfName + "</span></strong><br style='line-height:230%;'/>Total paid: $" +
						formatMoney0Decimals(d.source.valuePaid) + "<br>Total pledged: $" + formatMoney0Decimals(d.source.valuePledge));

				var tooltipSize = tooltip.node().getBoundingClientRect();
				localVariable.set(tooltip.node(), tooltipSize);

				const thisBox = this.getBoundingClientRect();
				const containerBox = containerDiv.node().getBoundingClientRect();
				const offsetTop = thisBox.top - containerBox.top + tooltipSize.height + 6 > containerBox.height ?
					thisBox.top - containerBox.top - tooltipSize.height - 10 :
					thisBox.bottom - containerBox.top + 10;

				tooltip.style("top", offsetTop + "px")
					.style("left", (containerBox.width - tooltipSize.width + flagPadding) / 2 + "px");

				flags.style("opacity", function(e) {
					return e.donor === thisDonor.donor ? 1 : 0.15;
				});

				highlightBeeswarmLinks(d.source, d.target);

				//end of mouseenterLinks
			};

			function mousemoveBarsDonors(_, barNumber) {
				var tooltipSize = localVariable.get(tooltip.node());
				const thisBox = this.getBoundingClientRect();
				const containerBox = containerDiv.node().getBoundingClientRect();
				const offsetTop = thisBox.top - containerBox.top + tooltipSize.height + 6 > containerBox.height ?
					thisBox.top - containerBox.top - tooltipSize.height - 6 :
					thisBox.bottom - containerBox.top + 6;

				tooltip.style("top", offsetTop + "px")
					.style("left", thisBox.left - containerBox.left + (thisBox.width - tooltipSize.width) / 2 + "px");
			};

			function mousemoveBarsCbpfs(_, barNumber) {
				var tooltipSize = localVariable.get(tooltip.node());
				const thisBox = this.getBoundingClientRect();
				const containerBox = containerDiv.node().getBoundingClientRect();
				const offsetTop = thisBox.top - containerBox.top + tooltipSize.height + 6 > containerBox.height ?
					thisBox.top - containerBox.top - tooltipSize.height - 6 :
					thisBox.bottom - containerBox.top + 6;

				tooltip.style("top", offsetTop + "px")
					.style("left", thisBox.left - containerBox.left + (thisBox.width - tooltipSize.width) / 2 + "px");
			};

			function mousemoveLinks(d) {
				var tooltipSize = localVariable.get(tooltip.node());
				const thisBox = this.getBoundingClientRect();
				const containerBox = containerDiv.node().getBoundingClientRect();
				const offsetTop = thisBox.top - containerBox.top + tooltipSize.height + 6 > containerBox.height ?
					thisBox.top - containerBox.top - tooltipSize.height - 10 :
					thisBox.bottom - containerBox.top + 10;

				tooltip.style("top", offsetTop + "px")
					.style("left", (containerBox.width - tooltipSize.width + flagPadding) / 2 + "px");
			};

			function mouseoutBarsDonors(d) {
				barsPanel.main.selectAll("*").interrupt();
				clearDonors();
				tooltip.style("display", "none");
				barsMiddleText.text(null);
				links.style("opacity", 0.1);
				restoreBeeswarm();
				flags.style("opacity", 1);
				gBarsDonorsXAxis.selectAll(".tick line, .tick text").style("opacity", 1);
				gBarsCbpfsXAxis.selectAll(".tick line, .tick text").style("opacity", 1);
			};

			function mouseoutBarsCbpfs(d) {
				barsPanel.main.selectAll("*").interrupt();
				clearCbpfs();
				tooltip.style("display", "none");
				barsMiddleText.text(null);
				links.style("opacity", 0.1);
				restoreBeeswarm();
				flags.style("opacity", 1);
				gBarsDonorsXAxis.selectAll(".tick line, .tick text").style("opacity", 1);
				gBarsCbpfsXAxis.selectAll(".tick line, .tick text").style("opacity", 1);
			};

			function mouseoutLinks() {
				barsPanel.main.selectAll("*").interrupt();
				clearDonors();
				clearCbpfs();
				links.style("opacity", 0.1);
				tooltip.style("display", "none");
				flags.style("opacity", 1);
				restoreBeeswarm();
				gBarsDonorsXAxis.selectAll(".tick line, .tick text").style("opacity", 1);
				gBarsCbpfsXAxis.selectAll(".tick line, .tick text").style("opacity", 1);
			};

			function createDonorsTooltipBar(datum) {

				var containerDiv = d3.select("#contributionsTooltipBar");

				containerDiv.style("margin-bottom", "8px")
					.style("width", "250px");

				var scaleDiv = d3.scaleLinear()
					.domain([0, datum.totalPaidPlusPledge])
					.range([0, 250]);

				var div1 = containerDiv.append("div")
					.style("float", "left")
					.classed("contributionColorDarkerHTMLbc", true)
					.style("height", "14px")
					.style("width", "0px")
					.style("border-right", scaleDiv(datum.totalPaid) < 1 ? "0px solid white" : "1px solid white");

				div1.transition()
					.duration(shortDuration)
					.style("width", scaleDiv(datum.totalPaid) + "px");

				var div2 = containerDiv.append("div")
					.classed("contributionColorHTMLbc", true)
					.style("margin-left", "0px")
					.style("height", "14px")
					.style("width", "0px");

				div2.transition()
					.duration(shortDuration)
					.style("margin-left", scaleDiv(datum.totalPaid) + 1 + "px")
					.style("width", scaleDiv(datum.totalPledge) + "px");

				//end of createDonorsTooltipBar
			};

			function createCbpfsTooltipBar(datum) {

				var containerDiv = d3.select("#allocationsTooltipBar");

				containerDiv.style("margin-bottom", "8px")
					.style("width", "250px");

				var scaleDiv = d3.scaleLinear()
					.domain([0, datum.totalPaidPlusPledge])
					.range([0, 250]);

				var div1 = containerDiv.append("div")
					.style("float", "left")
					.classed("allocationColorDarkerHTMLbc", true)
					.style("height", "14px")
					.style("width", "0px")
					.style("border-right", scaleDiv(datum.totalPaid) < 1 ? "0px solid white" : "1px solid white");

				div1.transition()
					.duration(shortDuration)
					.style("width", scaleDiv(datum.totalPaid) + "px");

				var div2 = containerDiv.append("div")
					.classed("allocationColorHTMLbc", true)
					.style("margin-left", "0px")
					.style("height", "14px")
					.style("width", "0px");

				div2.transition()
					.duration(shortDuration)
					.style("margin-left", scaleDiv(datum.totalPaid) + 1 + "px")
					.style("width", scaleDiv(datum.totalPledge) + "px");

				//end of createAllocationsTooltipBar
			}

			function clearDonors() {

				barsCbpfsTooltipRect.attr("pointer-events", "none");

				barsDonors.selectAll("." + classPrefix + "barsContributionsRects, ." + classPrefix + "barsContributionsLabels")
					.style("opacity", 1);
				gBarsDonorsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsCbpfs.selectAll("." + classPrefix + "barsAllocationsRects, ." + classPrefix + "barsAllocationsLabels")
					.style("opacity", 1);
				gBarsCbpfsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsCbpfs.selectAll("." + classPrefix + "barsAllocationsOverRect")
					.style("opacity", 0)
					.attr("width", 0);
				barsCbpfs.selectAll("." + classPrefix + "barsAllocationsOverLine")
					.style("opacity", 0)
					.attr("x1", 0)
					.attr("x2", 0);

				barsCbpfs.selectAll("." + classPrefix + "barsAllocationsRects")
					.transition()
					.duration(shortDuration)
					.attr("width", function(d) {
						return barsCbpfsXScale(d.totalPaidPlusPledge)
					})
					.on("end", function() {
						barsCbpfsTooltipRect.attr("pointer-events", "all");
					})

				barsCbpfs.selectAll("." + classPrefix + "barsAllocationsLabels")
					.transition()
					.duration(shortDuration)
					.attr("x", function(d) {
						return barsCbpfsXScale(d.totalPaidPlusPledge) + barsDonorsLabelsPadding;
					})
					.tween("text", function(d) {
						if (!localVariable.get(this)) return;
						var node = this;
						var i = d3.interpolate(localVariable.get(this), d.totalPaidPlusPledge);
						return function(t) {
							node.textContent = "$" + formatSIFloat1decimal(i(t));
						};
					})
					.on("end", function() {
						localVariable.remove(this);
					});

				//end of clearContributions
			};

			function clearCbpfs() {

				barsDonorsTooltipRect.attr("pointer-events", "none");

				barsCbpfs.selectAll("." + classPrefix + "barsAllocationsRects, ." + classPrefix + "barsAllocationsLabels")
					.style("opacity", 1);
				gBarsCbpfsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsDonors.selectAll("." + classPrefix + "barsContributionsRects, ." + classPrefix + "barsContributionsLabels")
					.style("opacity", 1);
				gBarsDonorsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsDonors.selectAll("." + classPrefix + "barsContributionsOverRect")
					.style("opacity", 0)
					.attr("x", barsPanel.barsSpace)
					.attr("width", 0);
				barsDonors.selectAll("." + classPrefix + "barsContributionsOverLine")
					.style("opacity", 0)
					.attr("x1", barsPanel.barsSpace)
					.attr("x2", barsPanel.barsSpace);

				barsDonors.selectAll("." + classPrefix + "barsContributionsRects")
					.transition()
					.duration(shortDuration)
					.attr("x", function(d) {
						return barsDonorsXScale(d.totalPaidPlusPledge)
					})
					.attr("width", function(d) {
						return barsPanel.barsSpace - barsDonorsXScale(d.totalPaidPlusPledge)
					})
					.on("end", function() {
						barsDonorsTooltipRect.attr("pointer-events", "all");
					})

				barsDonors.selectAll("text." + classPrefix + "barsContributionsLabels")
					.transition()
					.duration(shortDuration)
					.attr("x", function(d) {
						return barsDonorsXScale(d.totalPaidPlusPledge) - barsDonorsLabelsPadding;
					})
					.tween("text", function(d) {
						if (!localVariable.get(this)) return;
						var node = this;
						var i = d3.interpolate(localVariable.get(this), d.totalPaidPlusPledge);
						return function(t) {
							node.textContent = "$" + formatSIFloat1decimal(i(t));
						};
					})
					.on("end", function() {
						localVariable.remove(this);
					});

				//end of clearAllocations
			};

			function highlightBeeswarm(datum, type) {

				if (!beeswarmTransitionEnded) return;

				var dataList = datum.donor === "Other Donors" ? "donorsList" : datum.cbpf === "Other CBPFs" ? "cbpfList" : null;
				var thisCircle = [];
				var prop = type === "Donors" ? "donor" : "cbpf";

				beeswarmPanel.main.selectAll("circle")
					.style("opacity", function(d) {
						var found = false;
						if (dataList && datum[dataList].indexOf(d[prop]) > -1) {
							found = true;
							thisCircle.push({
								x: d3.select(this).attr("cx"),
								y: d3.select(this).attr("cy"),
								fill: d3.select(this).style("fill")
							});
						};
						if (d[prop] === datum[prop]) {
							found = true;
							thisCircle.push({
								x: d3.select(this).attr("cx"),
								y: d3.select(this).attr("cy"),
								fill: d3.select(this).style("fill")
							});
						};
						return found ? 1 : 0.1;
					});

				verticalLine.attr("x1", beeswarmXScale(datum.totalPaidPlusPledge))
					.attr("x2", beeswarmXScale(datum.totalPaidPlusPledge))
					.attr("y1", Object.keys(datum)[0] === "donor" ? beeswarmYScale("Donors") : beeswarmYScale("CBPFs"))
					.attr("y2", beeswarmPanel.height - beeswarmPanel.padding[2])
					.style("opacity", 1);

				if (datum.donor === "Other Donors" || datum.cbpf === "Other CBPFs") {
					verticalLine.style("opacity", 0)
				};

				gBeeswarmXAxis.select("path").style("stroke", "#ccc");

				var enlargedCircles = beeswarmPanel.main.selectAll(null)
					.data(thisCircle)
					.enter()
					.append("circle")
					.attr("class", classPrefix + "enlargedCircles")
					.attr("cx", function(d) {
						return d.x
					})
					.attr("cy", function(d) {
						return d.y
					})
					.style("stroke", function(d) {
						return d.fill
					})
					.style("fill-opacity", 0)
					.attr("r", circleRadius)
					.transition()
					.duration(shortDuration * 2)
					.attr("r", circleRadius + 2);

				//end of highlightBeeswarm
			};

			function highlightBeeswarmLinks(source, target) {

				if (!beeswarmTransitionEnded) return;

				var theseCircles = [];

				beeswarmPanel.main.selectAll("circle")
					.style("opacity", function(d) {
						var found = false;
						if (source.donorNames && source.donorNames.indexOf(d.donor) > -1) {
							found = true;
							theseCircles.push({
								x: d3.select(this).attr("cx"),
								y: d3.select(this).attr("cy"),
								fill: d3.select(this).style("fill"),
								type: "others"
							});
						}
						if (target.cbpf === "Other CBPFs" && target.cbpfNameInOthers === d.cbpf) {
							found = true;
							theseCircles.push({
								x: d3.select(this).attr("cx"),
								y: d3.select(this).attr("cy"),
								fill: d3.select(this).style("fill"),
								type: "cbpf"
							});
						}
						d.cbpf === target.cbpf
						if (d.donor === source.donor) {
							found = true;
							theseCircles.push({
								x: d3.select(this).attr("cx"),
								y: d3.select(this).attr("cy"),
								fill: d3.select(this).style("fill"),
								type: "donor"
							});
						}
						if (d.cbpf === target.cbpf) {
							found = true;
							theseCircles.push({
								x: d3.select(this).attr("cx"),
								y: d3.select(this).attr("cy"),
								fill: d3.select(this).style("fill"),
								type: "cbpf"
							});
						}
						return found ? 1 : 0.15;
					});

				var enlargedCircles = beeswarmPanel.main.selectAll(null)
					.data(theseCircles)
					.enter()
					.append("circle")
					.attr("class", classPrefix + "enlargedCircles")
					.attr("cx", function(d) {
						return d.x
					})
					.attr("cy", function(d) {
						return d.y
					})
					.style("stroke", function(d) {
						return d.fill
					})
					.style("fill-opacity", 0)
					.attr("r", circleRadius)
					.transition()
					.duration(shortDuration * 2)
					.attr("r", circleRadius + 2);

				var secondLine = verticalLine.clone(false);

				var circleDonor = theseCircles.find(function(d) {
					return d.type === "donor"
				});

				var circleCBPF = theseCircles.find(function(d) {
					return d.type === "cbpf"
				});

				verticalLine.attr("x1", circleDonor ? circleDonor.x : 0)
					.attr("x2", circleDonor ? circleDonor.x : 0)
					.attr("y1", beeswarmYScale("Donors"))
					.attr("y2", beeswarmPanel.height - beeswarmPanel.padding[2])
					.style("opacity", circleDonor ? 1 : 0);

				secondLine.attr("class", classPrefix + "secondVerticalLine")
					.attr("x1", circleCBPF.x)
					.attr("x2", circleCBPF.x)
					.attr("y1", beeswarmYScale("CBPFs"))
					.attr("y2", beeswarmPanel.height - beeswarmPanel.padding[2])
					.style("opacity", 1);

				gBeeswarmXAxis.select("path").style("stroke", "#ccc");

				//end of highlightBeeswarmLinks
			}

			function restoreBeeswarm() {
				beeswarmPanel.main.selectAll("circle")
					.style("opacity", 1);
				verticalLine.style("opacity", 0);
				gBeeswarmXAxis.select("path").style("stroke", "none");
				d3.selectAll("." + classPrefix + "enlargedCircles").remove();
				d3.select("." + classPrefix + "secondVerticalLine").remove();
			};

			function generateOtherDonorsList(donorsList) {
				var div = "<div style='margin-left:0px;margin-top:0px;margin-bottom:-14px;display:flex;flex-wrap: wrap;'>";
				donorsList.forEach(function(d) {
					var thisDonor = dataDonors.filter(function(e) {
						return e.donor === d;
					})[0];
					var thisIsoCode = thisDonor.isoCode;
					var thisAmount = thisDonor.totalPaidPlusPledge;
					var imageSource = localStorage.getItem("storedFlag" + thisIsoCode) ?
						localStorage.getItem("storedFlag" + thisIsoCode) :
						flagsDirectory + thisIsoCode + ".png";
					div += "<div style='display:flex;flex:0 50%;white-space:pre;margin-top:0px;margin-bottom:-5px;'><img src='" + imageSource + "' height='24' width='24' style='padding:0px;'>  <span style='margin-top:4px;font-size:12px;'> " + d +
						"</span><span style='margin-top:4px;color:#666;font-size:10px;font-weight:300;'> (" + formatSIFloat1decimal(thisAmount) + ")</span></div>";
				});
				div += "</div>";
				return div;
			};

			function createTooltipSVG(othersData, type, colorFill) {

				othersData.sort(function(a, b) {
					return d3.descending(a.amountPaidPlusPledge, b.amountPaidPlusPledge)
				});

				var svgTooltipWidth = 260,
					yAxisPadding = 8,
					tooltipPadding = [0, 16, 15, 0],
					svgTooltipHeight = 15 * othersData.length + tooltipPadding[2];

				var svgTooltip = d3.select("#" + classPrefix + "tooltipdiv")
					.append("svg")
					.attr("width", svgTooltipWidth)
					.attr("height", svgTooltipHeight)
					.style("background-color", "#f1f1f1");

				var yScaleTooltip = d3.scaleBand()
					.domain(othersData.map(function(d) {
						return d[type];
					}))
					.range([tooltipPadding[0], svgTooltipHeight - tooltipPadding[2]])
					.paddingInner(.5)
					.paddingOuter(0.25);

				var yAxisTooltip = d3.axisLeft(yScaleTooltip)
					.tickSizeOuter(0)
					.tickSizeInner(0);

				var gY = svgTooltip.append("g")
					.attr("class", classPrefix + "yAxisTooltip")
					.call(yAxisTooltip);

				var axisBox = gY.node().getBBox();

				tooltipPadding[3] = axisBox.width + yAxisPadding;

				gY.attr("transform", "translate(" + tooltipPadding[3] + ",0)");

				var xScaleTooltip = d3.scaleLinear()
					.domain([0, d3.max(othersData, function(d) {
						return d.amountPaidPlusPledge
					})])
					.range([tooltipPadding[3], svgTooltipWidth - tooltipPadding[1]]);

				var tickValuesArray = d3.range(3).map(function(d) {
					return xScaleTooltip.domain()[1] * ((d + 1) / 3)
				});

				var xAxisTooltip = d3.axisBottom(xScaleTooltip)
					.tickValues(tickValuesArray)
					.tickSizeOuter(0)
					.tickSizeInner(4)
					.tickFormat(function(d) {
						return "$" + formatSIFloat1decimal(d)
					});

				var bars = svgTooltip.selectAll(null)
					.data(othersData)
					.enter()
					.append("rect")
					.attr("x", tooltipPadding[3])
					.attr("y", function(d) {
						return yScaleTooltip(d[type])
					})
					.attr("height", yScaleTooltip.bandwidth())
					.attr("width", 0)
					.attr("class", colorFill)
					.transition()
					.duration(shortDuration * 2)
					.attr("width", function(d) {
						return xScaleTooltip(d.amountPaidPlusPledge) - tooltipPadding[3]
					});

				var gX = svgTooltip.append("g")
					.attr("class", classPrefix + "xAxisTooltip")
					.attr("transform", "translate(0," + (svgTooltipHeight - tooltipPadding[2]) + ")")
					.call(xAxisTooltip);

				d3.select("." + classPrefix + "xAxisTooltip")
					.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				//end of createTooltipSVG
			}

			//END CONTROL FUNCTIONS

			//end of draw
		};

		function preProcessData(rawData) {
			rawData.forEach(function(d) {
				if (yearsArray.indexOf(+d.FiscalYear) === -1) yearsArray.push(+d.FiscalYear);
			});
		};

		function processData(rawData) {

			var aggregatedDonors = [];

			var aggregatedCbpfs = [];

			var tempSetDonors = [];

			var tempSetCbpfs = [];

			//filter here
			rawData.forEach(function(d) {
				if (chartState.selectedYear.indexOf(+d.FiscalYear) > -1) {
					if (tempSetDonors.indexOf(d.GMSDonorName) > -1) {
						var tempObject = aggregatedDonors.filter(function(e) {
							return e.donor === d.GMSDonorName
						})[0];
						var foundDonations = tempObject.donations.filter(function(e) {
							return e.cbpf === d.PooledFundName
						})[0];
						if (foundDonations) {
							foundDonations.amountPaid += +d.PaidAmt;
							foundDonations.amountPledge += +d.PledgeAmt;
							foundDonations.amountPaidPlusPledge += (+d.PaidAmt) + (+d.PledgeAmt);
						} else {
							tempObject.donations.push({
								cbpf: d.PooledFundName,
								amountPaid: +d.PaidAmt,
								amountPledge: +d.PledgeAmt,
								amountPaidPlusPledge: (+d.PaidAmt) + (+d.PledgeAmt)
							});
						}
						tempObject.totalPaid += +d.PaidAmt;
						tempObject.totalPledge += +d.PledgeAmt;
						tempObject.totalPaidPlusPledge += (+d.PaidAmt) + (+d.PledgeAmt);
					} else {
						aggregatedDonors.push({
							donor: d.GMSDonorName,
							isoCode: d.GMSDonorISO2Code.toLowerCase(),
							donations: [{
								cbpf: d.PooledFundName,
								amountPaid: +d.PaidAmt,
								amountPledge: +d.PledgeAmt,
								amountPaidPlusPledge: (+d.PaidAmt) + (+d.PledgeAmt)
							}],
							totalPaid: +d.PaidAmt,
							totalPledge: +d.PledgeAmt,
							totalPaidPlusPledge: (+d.PaidAmt) + (+d.PledgeAmt)
						});
						tempSetDonors.push(d.GMSDonorName);
					};
					if (tempSetCbpfs.indexOf(d.PooledFundName) > -1) {
						var tempObject = aggregatedCbpfs.filter(function(e) {
							return e.cbpf === d.PooledFundName
						})[0];
						var foundDonor = tempObject.donors.filter(function(e) {
							return e.donor === d.GMSDonorName
						})[0];
						if (foundDonor) {
							foundDonor.amountPaid += +d.PaidAmt;
							foundDonor.amountPledge += +d.PledgeAmt;
							foundDonor.amountPaidPlusPledge += (+d.PaidAmt) + (+d.PledgeAmt);
						} else {
							tempObject.donors.push({
								donor: d.GMSDonorName,
								amountPaid: +d.PaidAmt,
								amountPledge: +d.PledgeAmt,
								amountPaidPlusPledge: (+d.PaidAmt) + (+d.PledgeAmt)
							});
						}
						tempObject.totalPaid += +d.PaidAmt;
						tempObject.totalPledge += +d.PledgeAmt;
						tempObject.totalPaidPlusPledge += (+d.PaidAmt) + (+d.PledgeAmt);
					} else {
						aggregatedCbpfs.push({
							cbpf: d.PooledFundName,
							isoCode: d.PooledFundISO2Code.toLowerCase(),
							donors: [{
								donor: d.GMSDonorName,
								amountPaid: +d.PaidAmt,
								amountPledge: +d.PledgeAmt,
								amountPaidPlusPledge: (+d.PaidAmt) + (+d.PledgeAmt)
							}],
							totalPaid: +d.PaidAmt,
							totalPledge: +d.PledgeAmt,
							totalPaidPlusPledge: (+d.PaidAmt) + (+d.PledgeAmt)
						});
						tempSetCbpfs.push(d.PooledFundName);
					};
				};
			});

			tempSetDonors = [];

			tempSetCbpfs = [];

			aggregatedDonors.sort(function(a, b) {
				return d3.descending(a.totalPaidPlusPledge, b.totalPaidPlusPledge)
			});

			aggregatedCbpfs.sort(function(a, b) {
				return d3.descending(a.totalPaidPlusPledge, b.totalPaidPlusPledge)
			});

			return {
				dataDonors: aggregatedDonors,
				dataCbpfs: aggregatedCbpfs
			};

		};

		function saveFlags(donorsList) {

			donorsList.forEach(function(d) {
				getBase64FromImage("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/flags16/" + d + ".png", setLocal, null, d);
			});

			function getBase64FromImage(url, onSuccess, onError, isoCode) {
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
					onSuccess(isoCode, base64);
				};

				xhr.onerror = onError;

				xhr.send();
			};

			function setLocal(isoCode, base64) {
				localStorage.setItem("storedFlag" + isoCode, base64);
			};

			//end of saveFlags
		};

		function extractYear(yearString) {
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

		function formatSIFloat(value) {
			var length = (~~Math.log10(value) + 1) % 3;
			var digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value);
		};

		function formatSIFloat1decimal(value) {
			var length = (~~Math.log10(value) + 1) % 3;
			var digits = length === 1 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value).replace("G", "B");
		};

		function formatSIInteger(value) {
			return d3.formatPrefix(".0", value)(value);
		};

		function formatPercentCustom(dividend, divisor) {
			const percentage = formatPercent(dividend / divisor);
			return +(percentage.split("%")[0]) === 0 && (dividend / divisor) !== 0 ? "<1%" : percentage;
		};

		function parseTransform(translate) {
			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.setAttributeNS(null, "transform", translate);
			const matrix = group.transform.baseVal.consolidate().matrix;
			return [matrix.e, matrix.f];
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

		function createProgressWhell() {
			var wheelGroup = svg.append("g")
				.attr("class", "d3chartwheelGroup")
				.attr("transform", "translate(" + width / 2 + "," + height / 3 + ")");

			var loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text("Loading visualisation...");

			var arc = d3.arc()
				.outerRadius(25)
				.innerRadius(20);

			var wheel = wheelGroup.append("path")
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
						var interpolate = d3.interpolate(0, Math.PI * 2);
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
						var interpolate = d3.interpolate(0, Math.PI * 2);
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
			var wheelGroup = d3.select(".d3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		//end of d3Chart
	};

	//end of d3ChartIIFE
}());
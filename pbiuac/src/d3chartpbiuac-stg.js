(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1,
		hasFetch = window.fetch,
		isPfbiSite = window.location.hostname === "pfbi.unocha.org",
		fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
		cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiuac.css", fontAwesomeLink],
		d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.9.2/d3.min.js";

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

	if (!isD3Loaded(d3URL)) {
		if (hasFetch) {
			loadScript(d3URL, d3Chart);
		} else {
			loadScript("https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js", function() {
				loadScript("https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js", function() {
					loadScript(d3URL, d3Chart);
				});
			});
		};
	} else if (typeof d3 !== "undefined") {
		d3Chart();
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

	function isD3Loaded(url) {
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length; i--;) {
			if (scripts[i].src == url) return true;
		}
		return false;
	};

	function d3Chart() {

		const width = 900,
			padding = [4, 16, 4, 4],
			topPanelHeight = 60,
			legendPanelHeight = 44,
			outerBarPadding = 4,
			innerBarPadding = 2,
			barHeight = 6,
			outerBarPaddingBrush = 0,
			innerBarPaddingBrush = 0,
			barHeightBrush = 1.5,
			legendRectWidth = 24,
			legendRectHeight = 6,
			legendScalePadding = 390,
			windowHeight = window.innerHeight,
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			timeParse = d3.timeParse("%m/%d/%Y %H:%M:%S %p"),
			timeFormat = d3.timeFormat("%d %b %Y"),
			convertToBytes = d3.format(".3s"),
			localVariable = d3.local(),
			chartTitleDefault = "Allocations Timeline",
			panelHorizontalPadding = 12,
			duration = 1000,
			axisHighlightColor = "#E56A54",
			backgroundColors = ["#f2f2f2", "white"],
			rectangleColors = ["#418fde", "#eca154"],
			todayColor = "#9063CD",
			todayPadding = 10,
			offsetStartDefault = 6,
			offsetEndDefault = 6,
			formatMoney0Decimals = d3.format(",.0f"),
			colorInterpolatorStandard = d3.interpolateRgb(d3.color(rectangleColors[0]).brighter(0.9), d3.color(rectangleColors[0]).darker(1)),
			colorInterpolatorReserve = d3.interpolateRgb(d3.color(rectangleColors[1]).brighter(0.9), d3.color(rectangleColors[1]).darker(1)),
			allocationTypes = ["standard", "reserve"],
			cbpfsOrdering = ["planned", "ongoing", "past"],
			moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
			],
			cbpfsAllocationsTime = {},
			cbpfsRowList = {};

		let height = 500,
			mainPanelHeight = 320,
			brushPanelHeight = 44,
			minDate = maxDate = currentDate,
			cbpfsList,
			minDateOffset,
			maxDateOffset,
			minAllocationValueStandard = Number.POSITIVE_INFINITY,
			maxAllocationValueStandard = Number.NEGATIVE_INFINITY,
			minAllocationValueReserve = Number.POSITIVE_INFINITY,
			maxAllocationValueReserve = Number.NEGATIVE_INFINITY,
			completeData,
			containerSize,
			thisSize,
			tooltipSize;

		const containerDiv = d3.select("#d3chartcontainerpbiuac");

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const showLink = (containerDiv.node().getAttribute("data-showlink") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const chartYearTitle = containerDiv.node().getAttribute("data-yeartitle");

		const offsetStartValue = +(containerDiv.node().getAttribute("data-offsetstart"));

		const offsetEndValue = +(containerDiv.node().getAttribute("data-offsetend"));

		const offsetStart = offsetStartValue === offsetStartValue ? Math.abs(offsetStartValue) : offsetStartDefault;

		const offsetEnd = offsetEndValue === offsetEndValue ? Math.abs(offsetEndValue) : offsetEndDefault;

		const offsetStartDate = d3.timeMonth.offset(currentDate, -offsetStart);

		const offsetEndDate = d3.timeMonth.offset(currentDate, offsetEnd);

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		if (selectedResponsiveness === false) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbiuacTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbiuacTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbiuacIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		};

		const listDiv = containerDiv.append("div")
			.attr("class", "pbiuacListContainerDiv");

		const footerDiv = !isPfbiSite ? containerDiv.append("div")
			.attr("class", "pbiuacFooterDiv") : null;

		createProgressWheel();

		const tooltip = containerDiv.append("div")
			.attr("id", "pbiuactooltipdiv")
			.style("display", "none");

		const topPanel = {
			main: svg.append("g")
				.attr("class", "pbiuacTopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			padding: [0, 0, 0, 0],
			moneyBagPadding: 32,
			leftPadding: [182, 394, 552, 740],
			mainValueVerPadding: 10,
			mainValueHorPadding: 2
		};

		const brushPanel = {
			main: svg.append("g")
				.attr("class", "pbiuacBrushPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: brushPanelHeight,
			padding: [0, 0, 14, 80]
		};

		const mainPanel = {
			main: svg.append("g")
				.attr("class", "pbiuacMainPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + brushPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: mainPanelHeight,
			padding: [0, 0, 14, 80]
		};

		const legendPanel = {
			main: svg.append("g")
				.attr("class", "pbiuacLegendPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + brushPanel.height + mainPanel.height + (3 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: legendPanelHeight,
			padding: [0, 0, 0, 80]
		};

		const yScaleMain = d3.scaleOrdinal();

		const yScaleBrush = d3.scaleOrdinal();

		const xScaleMain = d3.scaleTime()
			.range([mainPanel.padding[3], mainPanel.width - mainPanel.padding[1]]);

		const xScaleBrush = d3.scaleTime()
			.range([brushPanel.padding[3], brushPanel.width - brushPanel.padding[1]]);

		const colorsStandard = d3.range(0, 1.25, 0.25).map(function(d) {
			return colorInterpolatorStandard(d);
		});

		const colorsReserve = d3.range(0, 1.25, 0.25).map(function(d) {
			return colorInterpolatorReserve(d);
		});

		const colorScaleStandard = d3.scaleQuantile()
			.range(colorsStandard);

		const colorScaleReserve = d3.scaleQuantile()
			.range(colorsReserve);

		const legendVerticalScale = d3.scalePoint()
			.domain(allocationTypes)
			.range([legendPanel.padding[0], legendPanel.height - legendPanel.padding[2]])
			.padding(0.75);

		const yAxis = d3.axisLeft(yScaleMain)
			.tickSize(3);

		const xAxisMain = d3.axisBottom(xScaleMain);

		const xAxisBrush = d3.axisBottom(xScaleBrush)
			.tickPadding(2)
			.tickSize(2)
			.tickSizeOuter(0);

		const mainClip = mainPanel.main.append("defs").append("clipPath")
			.attr("id", "pbiuacclip")
			.append("rect")
			.attr("x", mainPanel.padding[3])
			.attr("y", 0)
			.attr("width", mainPanel.width - mainPanel.padding[3] - mainPanel.padding[1]);

		const brush = d3.brushX()
			.on("brush", brushed)
			.on("end", function() {
				if (d3.event.selection) {
					return;
				} else {
					brushed();
					brushPanel.main.select(".pbiuacBrushGroup").call(brush.move, xScaleBrush.range());
				}
			});

		const zoom = d3.zoom()
			.scaleExtent([1, Infinity])
			.on("zoom", zoomed);

		d3.csv("https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&$format=csv", row)
			.then(function(rawData) {

				removeProgressWheel();

				const data = processData(rawData);

				calculateHeightandResize();

				yScaleMain.domain(cbpfsList)
					.range(setOrdinalRange(mainPanel, barHeight, outerBarPadding, innerBarPadding));

				yScaleBrush.domain(cbpfsList)
					.range(setOrdinalRange(brushPanel, barHeightBrush, outerBarPaddingBrush, innerBarPaddingBrush));

				xScaleMain.domain([minDateOffset, maxDateOffset]);

				xScaleBrush.domain([minDateOffset, maxDateOffset]);

				colorScaleStandard.domain([minAllocationValueStandard, maxAllocationValueStandard]);

				colorScaleReserve.domain([minAllocationValueReserve, maxAllocationValueReserve]);

				if (!lazyLoad) {
					draw(data);
				} else {
					d3.select(window).on("scroll.pbiuac", checkPosition);
					checkPosition();
				};

				function checkPosition() {
					const containerPosition = containerDiv.node().getBoundingClientRect();
					if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
						d3.select(window).on("scroll.pbiuac", null);
						draw(data);
					};
				};

				//end of d3.csv
			});

		function draw(data) {

			completeData = data;

			createTitle(data);

			createTopPanel(data);

			createMainPanel(data);

			createBrushPanel(data);

			createLegendPanel();

			if (!isPfbiSite) createFooterDiv();

			//end of draw
		};

		function createTitle(data) {

			const title = titleDiv.append("p")
				.attr("id", "pbiuacd3chartTitle")
				.html(chartTitle + " (since " + (chartYearTitle ? chartYearTitle : minDate.getFullYear()) + ")");

			const helpIcon = iconsDiv.append("button")
				.attr("id", "pbiuacHelpButton");

			helpIcon.html("HELP  ")
				.append("span")
				.attr("class", "fas fa-info")

			const downloadIcon = iconsDiv.append("button")
				.attr("id", "pbiuacDownloadButton");

			downloadIcon.html(".CSV  ")
				.append("span")
				.attr("class", "fas fa-download");

			helpIcon.on("click", createAnnotationsDiv);

			downloadIcon.on("click", function() {

				const csv = createCsv(data);

				const currentDate = new Date();

				const fileName = "AllocationsTimeline_" + csvDateFormat(currentDate) + ".csv";

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

		function createTopPanel(completeData) {

			const data = completeData.filter(function(d) {
				return d.PlannedStartDateTimestamp < xScaleMain.domain()[1].getTime() && d.PlannedEndDateTimestamp > xScaleMain.domain()[0].getTime();
			});

			const mainValue = d3.sum(data, function(d) {
				return d.TotalUSDPlanned;
			});

			const upcomingValue = data.filter(function(d) {
				return d.timeLine === "planned";
			}).length;

			const ongoingValue = data.filter(function(d) {
				return d.timeLine === "ongoing";
			}).length;

			const pastValue = data.filter(function(d) {
				return d.timeLine === "past";
			}).length;

			const topPanelMoneyBag = topPanel.main.selectAll(".pbiuactopPanelMoneyBag")
				.data([true])
				.enter()
				.append("g")
				.attr("class", "pbiuactopPanelMoneyBag contributionColorFill")
				.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.5)")
				.each(function(_, i, n) {
					moneyBagdAttribute.forEach(function(d) {
						d3.select(n[i]).append("path")
							.attr("d", d);
					});
				});

			const previousValue = d3.select(".pbiuactopPanelMainValue").size() !== 0 ? d3.select(".pbiuactopPanelMainValue").datum() : 0;

			const previousUpcoming = d3.select(".pbiuactopPanelUpcomingNumber").size() !== 0 ? d3.select(".pbiuactopPanelUpcomingNumber").datum() : 0;

			const previousOngoing = d3.select(".pbiuactopPanelOngoingNumber").size() !== 0 ? d3.select(".pbiuactopPanelOngoingNumber").datum() : 0;

			const previousPast = d3.select(".pbiuactopPanelPastNumber").size() !== 0 ? d3.select(".pbiuactopPanelPastNumber").datum() : 0;

			let mainValueGroup = topPanel.main.selectAll(".pbiuacmainValueGroup")
				.data([true]);

			mainValueGroup = mainValueGroup.enter()
				.append("g")
				.attr("class", "pbiuacmainValueGroup")
				.merge(mainValueGroup);

			let topPanelMainValue = mainValueGroup.selectAll(".pbiuactopPanelMainValue")
				.data([mainValue]);

			topPanelMainValue = topPanelMainValue.enter()
				.append("text")
				.attr("class", "pbiuactopPanelMainValue contributionColorFill")
				.attr("text-anchor", "end")
				.merge(topPanelMainValue)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] - topPanel.mainValueHorPadding);

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

			let topPanelMainText = mainValueGroup.selectAll(".pbiuactopPanelMainText")
				.data([mainValue]);

			topPanelMainText = topPanelMainText.enter()
				.append("text")
				.attr("class", "pbiuactopPanelMainText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.merge(topPanelMainText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 3)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

			topPanelMainText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text(function(d) {
					const valueSI = formatSIFloat(d);
					const unit = valueSI[valueSI.length - 1];
					return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") + " in";
				});

			let topPanelSubText = mainValueGroup.selectAll(".pbiuactopPanelSubText")
				.data([true]);

			topPanelSubText = topPanelSubText.enter()
				.append("text")
				.attr("class", "pbiuactopPanelSubText")
				.style("opacity", 0)
				.attr("text-anchor", "start")
				.merge(topPanelSubText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

			topPanelSubText.transition()
				.duration(duration)
				.style("opacity", 1)
				.text("Allocations");

			let topPanelUpcomingNumber = mainValueGroup.selectAll(".pbiuactopPanelUpcomingNumber")
				.data([upcomingValue]);

			topPanelUpcomingNumber = topPanelUpcomingNumber.enter()
				.append("text")
				.attr("class", "pbiuactopPanelUpcomingNumber contributionColorFill")
				.attr("text-anchor", "end")
				.merge(topPanelUpcomingNumber)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding);

			topPanelUpcomingNumber.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousUpcoming, d);
					return function(t) {
						node.textContent = ~~(i(t));
					};
				});

			let topPanelUpcomingText = mainValueGroup.selectAll(".pbiuactopPanelUpcomingText")
				.data([true]);

			topPanelUpcomingText = topPanelUpcomingText.enter()
				.append("text")
				.attr("class", "pbiuactopPanelUpcomingText")
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.merge(topPanelUpcomingText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 3)
				.text("Planned");

			let topPanelUpcomingTextSubText = mainValueGroup.selectAll(".pbiuactopPanelUpcomingTextSubText")
				.data([true]);

			topPanelUpcomingTextSubText = topPanelUpcomingTextSubText.enter()
				.append("text")
				.attr("class", "pbiuactopPanelUpcomingTextSubText")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.merge(topPanelUpcomingTextSubText)
				.text(upcomingValue > 1 ? "Allocations" : "Allocation");

			let topPanelOngoingNumber = mainValueGroup.selectAll(".pbiuactopPanelOngoingNumber")
				.data([ongoingValue]);

			topPanelOngoingNumber = topPanelOngoingNumber.enter()
				.append("text")
				.attr("class", "pbiuactopPanelOngoingNumber contributionColorFill")
				.attr("text-anchor", "end")
				.merge(topPanelOngoingNumber)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] - topPanel.mainValueHorPadding);

			topPanelOngoingNumber.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousOngoing, d);
					return function(t) {
						node.textContent = ~~(i(t));
					};
				});

			let topPanelOngoingText = mainValueGroup.selectAll(".pbiuactopPanelOngoingText")
				.data([true]);

			topPanelOngoingText = topPanelOngoingText.enter()
				.append("text")
				.attr("class", "pbiuactopPanelOngoingText")
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.merge(topPanelOngoingText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 3)
				.text("Ongoing");

			let topPanelOngoingTextSubText = mainValueGroup.selectAll(".pbiuactopPanelOngoingTextSubText")
				.data([true]);

			topPanelOngoingTextSubText = topPanelOngoingTextSubText.enter()
				.append("text")
				.attr("class", "pbiuactopPanelOngoingTextSubText")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.merge(topPanelOngoingTextSubText)
				.text(ongoingValue > 1 ? "Allocations" : "Allocation");

			let topPanelPastNumber = mainValueGroup.selectAll(".pbiuactopPanelPastNumber")
				.data([pastValue]);

			topPanelPastNumber = topPanelPastNumber.enter()
				.append("text")
				.attr("class", "pbiuactopPanelPastNumber contributionColorFill")
				.attr("text-anchor", "end")
				.merge(topPanelPastNumber)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[3] - topPanel.mainValueHorPadding);

			topPanelPastNumber.transition()
				.duration(duration)
				.tween("text", function(d) {
					const node = this;
					const i = d3.interpolate(previousPast, d);
					return function(t) {
						node.textContent = ~~(i(t));
					};
				});

			let topPanelPastText = mainValueGroup.selectAll(".pbiuactopPanelPastText")
				.data([true]);

			topPanelPastText = topPanelPastText.enter()
				.append("text")
				.attr("class", "pbiuactopPanelPastText")
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[3] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.merge(topPanelPastText)
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 3)
				.text("Closed");

			let topPanelPastTextSubText = mainValueGroup.selectAll(".pbiuactopPanelPastTextSubText")
				.data([true]);

			topPanelPastTextSubText = topPanelPastTextSubText.enter()
				.append("text")
				.attr("class", "pbiuactopPanelPastTextSubText")
				.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
				.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[3] + topPanel.mainValueHorPadding)
				.attr("text-anchor", "start")
				.merge(topPanelPastTextSubText)
				.text(pastValue > 1 ? "Allocations" : "Allocation");

			//end of createTopPanel
		};

		function createMainPanel(data) {

			const backgroundRects = mainPanel.main.selectAll(null)
				.data(cbpfsList)
				.enter()
				.append("rect")
				.attr("x", mainPanel.padding[3])
				.attr("width", mainPanel.width - mainPanel.padding[1] - mainPanel.padding[3])
				.attr("y", function(d) {
					return yScaleMain(d)
				})
				.attr("height", function(d, i) {
					return yScaleMain.range()[i + 1] - yScaleMain(d)
				})
				.style("fill", function(_, i) {
					return backgroundColors[i % 2];
				});

			const yAxisGroup = mainPanel.main.append("g")
				.attr("class", "pbiuacYAxisGroup")
				.attr("transform", "translate(" + mainPanel.padding[3] + ",0)")
				.call(yAxis);

			yAxisGroup.selectAll("text")
				.each(function(d, i) {
					d3.select(this).attr("transform", "translate(0," + ((yScaleMain.range()[i + 1] - yScaleMain(d)) / 2) + ")")
				});

			yAxisGroup.selectAll("line")
				.each(function(d, i) {
					d3.select(this).attr("transform", "translate(0," + ((yScaleMain.range()[i + 1] - yScaleMain(d)) / 2) + ")")
				});

			const xAxisMainGroup = mainPanel.main.append("g")
				.attr("class", "pbiuacXAxisMainGroup")
				.attr("transform", "translate(0," + (mainPanel.height - mainPanel.padding[2]) + ")")
				.call(xAxisMain);

			const todayContainerGroup = mainPanel.main.append("g")
				.attr("clip-path", "url(#pbiuacclip)");

			const todayGroup = todayContainerGroup.append("g")
				.attr("class", "pbiuacTodayGroup")
				.attr("transform", "translate(" + xScaleMain(currentDate) + ",0)")

			const todayLine = todayGroup.append("line")
				.attr("y1", mainPanel.padding[0])
				.attr("y2", mainPanel.height - mainPanel.padding[2])
				.style("stroke", todayColor)
				.style("stroke-width", "1px")
				.style("opacity", 0.75);

			const todayText = todayGroup.append("text")
				.attr("class", "pbiuacTodayText")
				.attr("text-anchor", "middle")
				.attr("font-family", "Arial")
				.attr("font-size", "11px")
				.style("font-weight", 700)
				.style("fill", todayColor)
				.attr("y", mainPanel.height - mainPanel.padding[2] + todayPadding)
				.text("Today");

			const rectZoom = mainPanel.main.append("rect")
				.attr("class", "pbiuacZoomRect")
				.style("fill", "none")
				.attr("cursor", "move")
				.attr("pointer-events", "all")
				.attr("x", mainPanel.padding[3] - 1)
				.attr("y", mainPanel.padding[0])
				.attr("width", mainPanel.width - mainPanel.padding[3] - mainPanel.padding[1] + 2)
				.attr("height", mainPanel.height)
				.call(zoom);

			const allocationsMain = mainPanel.main.selectAll(null)
				.data(data)
				.enter()
				.append("rect")
				.attr("class", "pbiuacAllocationsMain")
				.attr("rx", 2)
				.attr("ry", 2)
				.attr("x", function(d) {
					return xScaleMain(d.PlannedStartDate);
				})
				.attr("width", function(d) {
					return xScaleMain(d.PlannedEndDate) - xScaleMain(d.PlannedStartDate);
				})
				.attr("y", function(d) {
					return yScaleMain(d.PooledFundName) + (outerBarPadding / 2) + (d.row * barHeight) + ((d.row + 1) * innerBarPadding);
				})
				.attr("height", barHeight)
				.style("fill", function(d) {
					if (d.allocationType === "standard") {
						return colorScaleStandard(d.TotalUSDPlanned);
					} else {
						return colorScaleReserve(d.TotalUSDPlanned);
					};
				})
				.style("stroke", "#666")
				.style("stroke-width", "1px")
				.attr("clip-path", "url(#pbiuacclip)")
				.on("mouseover", function(d) {
					mouseOverAllocation(d, this);
				})
				.on("mousemove", function(d) {
					mouseMoveAllocation(d, this);
				});

			rectZoom.on("mouseover", mouseOutAllocation);

			function mouseOverAllocation(datum, element) {

				tooltip.html(null);

				containerSize = containerDiv.node().getBoundingClientRect();

				thisSize = element.getBoundingClientRect();

				const mouse = d3.mouse(mainPanel.main.node());

				const innerTooltip = tooltip.append("div")
					.attr("id", "pbiuacInnerTooltipDiv");

				const thisColor = datum.allocationType === "standard" ? "contributionColorHTMLcolor" : "allocationColorHTMLcolor";

				innerTooltip.html("<div class='" + thisColor + "'><b>" + datum.AllocationTitle + "</b></div><div class='pbiuacSpacer'></div>CBPF: <b>" +
					datum.PooledFundName + "</b><br>Amount: $<b>" + formatMoney0Decimals(datum.TotalUSDPlanned) +
					"</b><div class='pbiuacSpacer'></div>Start Date: " + timeFormat(datum.PlannedStartDate) + "<br>End Date: " +
					timeFormat(datum.PlannedEndDate) + "<div class='pbiuacSpacer'></div><div class='pbiuacTooltipButtonDiv' style='height:30px;display:flex;justify-content:center;align-items:center;'><button>Display Details</button></div>");

				tooltip.select("button")
					.on("click", function() {
						tooltip.style("display", "none");
						generateList(datum);
					});

				tooltip.style("display", "block");

				tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip.style("left", mouse[0] > containerSize.width - (tooltipSize.width / 2) - padding[1] ?
						containerSize.width - tooltipSize.width - padding[1] + "px" : mouse[0] < tooltipSize.width / 2 + mainPanel.padding[3] + padding[0] ?
						mainPanel.padding[3] + padding[0] + "px" : mouse[0] - (tooltipSize.width / 2) + "px")
					.style("top", mouse[1] < tooltipSize.height ? thisSize.y - containerSize.y + thisSize.height + 1 + "px" :
						thisSize.y - containerSize.y - tooltipSize.height + "px");
			};

			function mouseMoveAllocation(datum, element) {

				const mouse = d3.mouse(mainPanel.main.node());

				tooltip.style("left", mouse[0] > containerSize.width - (tooltipSize.width / 2) - padding[1] ?
						containerSize.width - tooltipSize.width - padding[1] + "px" : mouse[0] < tooltipSize.width / 2 + mainPanel.padding[3] + padding[0] ?
						mainPanel.padding[3] + padding[0] + "px" : mouse[0] - (tooltipSize.width / 2) + "px")
					.style("top", mouse[1] < tooltipSize.height ? thisSize.y - containerSize.y + thisSize.height + 1 + "px" :
						thisSize.y - containerSize.y - tooltipSize.height + "px");
			};

			function mouseOutAllocation() {
				tooltip.style("display", "none");
			};

			//end of createMainPanel
		};

		function createBrushPanel(data) {

			const xAxisBrushGroup = brushPanel.main.append("g")
				.attr("class", "pbiuacXAxisBrushGroup")
				.attr("transform", "translate(0," + (brushPanel.height - brushPanel.padding[2]) + ")")
				.call(xAxisBrush);

			const todayGroupBrush = brushPanel.main.append("g")
				.attr("transform", "translate(" + xScaleBrush(currentDate) + ",0)");

			const todayLineBrush = todayGroupBrush.append("line")
				.attr("y1", brushPanel.padding[0])
				.attr("y2", brushPanel.height - brushPanel.padding[2])
				.style("stroke", todayColor)
				.style("stroke-width", "1px");

			const todayTextBrush = todayGroupBrush.append("text")
				.attr("text-anchor", "middle")
				.attr("font-family", "Arial")
				.attr("font-size", "11px")
				.style("font-weight", 700)
				.style("fill", todayColor)
				.attr("y", brushPanel.height - brushPanel.padding[2] + todayPadding + 1)
				.text("Today");

			const todaySizeBrush = todayTextBrush.node().getBoundingClientRect();

			xAxisBrushGroup.selectAll("text")
				.each(function() {
					const thisSize = this.getBoundingClientRect();
					if (thisSize.left < todaySizeBrush.right && thisSize.right > todaySizeBrush.left) {
						d3.select(this.parentNode).remove();
						return;
					};
					const thisText = this.textContent;
					if (+thisText === +thisText) {
						d3.select(this).style("fill", axisHighlightColor)
							.style("font-weight", 700);
					};
				});

			const allocationsBrush = brushPanel.main.selectAll(null)
				.data(data)
				.enter()
				.append("rect")
				.attr("rx", 1)
				.attr("ry", 1)
				.attr("x", function(d) {
					return xScaleBrush(d.PlannedStartDate);
				})
				.attr("width", function(d) {
					return xScaleBrush(d.PlannedEndDate) - xScaleBrush(d.PlannedStartDate);
				})
				.attr("y", function(d) {
					return yScaleBrush(d.PooledFundName) + (outerBarPaddingBrush / 2) + (d.row * barHeightBrush) + ((d.row + 1) * innerBarPaddingBrush);
				})
				.attr("height", barHeightBrush)
				.style("fill", function(d) {
					if (d.allocationType === "standard") {
						return colorScaleStandard(d.TotalUSDPlanned);
					} else {
						return colorScaleReserve(d.TotalUSDPlanned);
					};
				});

			const brushGroup = brushPanel.main.append("g")
				.attr("class", "pbiuacBrushGroup")
				.call(brush)
				.call(brush.move, [xScaleMain(offsetStartDate), xScaleMain(offsetEndDate)]);

			brushGroup.selectAll(".handle")
				.attr("fill", "whitesmoke")
				.attr("stroke", "#222")
				.attr("stroke-width", 1)
				.attr("rx", 2)
				.attr("ry", 2)
				.style("y", (brushPanel.height - brushPanel.padding[2]) * .2)
				.style("height", (brushPanel.height - brushPanel.padding[2]) * .6);

			//end of createBrushPanel
		};

		function createLegendPanel() {

			const legendGroups = legendPanel.main.selectAll(null)
				.data(allocationTypes)
				.enter()
				.append("g")
				.attr("class", "pbiuacLegendGroups")
				.attr("transform", function(d) {
					return "translate(0," + legendVerticalScale(d) + ")";
				});

			const legendRect = legendGroups.append("rect")
				.attr("x", legendPanel.padding[3])
				.attr("width", legendRectWidth)
				.attr("y", -legendRectHeight / 2)
				.attr("height", legendRectHeight)
				.attr("rx", 2)
				.attr("ry", 2)
				.style("stroke", "#666")
				.style("stroke-width", "1px")
				.style("fill", function(_, i) {
					return rectangleColors[i]
				});

			const legendText = legendGroups.append("text")
				.attr("class", "pbiuacLegendMainText")
				.attr("x", legendPanel.padding[3] + legendRectWidth + 6)
				.attr("y", 4)
				.text(function(_, i) {
					return i ? "Reserve Allocations \u2192" : "Standard Allocations \u2192";
				});

			const standardRectangles = legendPanel.main.selectAll(null)
				.data(colorsStandard)
				.enter()
				.append("rect")
				.attr("y", legendVerticalScale("standard") - legendRectHeight / 2)
				.attr("x", function(_, i) {
					return legendScalePadding + i * legendRectWidth;
				})
				.attr("width", legendRectWidth)
				.attr("height", legendRectHeight)
				.attr("rx", 2)
				.attr("ry", 2)
				.style("stroke", "#666")
				.style("stroke-width", "1px")
				.style("fill", function(d) {
					return d;
				})
				.on("mouseover", function(d) {
					mouseOverLegend(d, colorScaleStandard, this);
				})
				.on("mouseout", mouseOutLegend);

			const reserveRectangles = legendPanel.main.selectAll(null)
				.data(colorsReserve)
				.enter()
				.append("rect")
				.attr("y", legendVerticalScale("reserve") - legendRectHeight / 2)
				.attr("x", function(_, i) {
					return legendScalePadding + i * legendRectWidth;
				})
				.attr("width", legendRectWidth)
				.attr("height", legendRectHeight)
				.attr("rx", 2)
				.attr("ry", 2)
				.style("stroke", "#666")
				.style("stroke-width", "1px")
				.style("fill", function(d) {
					return d;
				})
				.on("mouseover", function(d) {
					mouseOverLegend(d, colorScaleReserve, this);
				})
				.on("mouseout", mouseOutLegend);

			const minValueStandard = legendPanel.main.append("text")
				.attr("class", "pbiuacLegendMainText2")
				.attr("y", legendVerticalScale("standard") + 3)
				.attr("x", legendScalePadding - 4)
				.attr("text-anchor", "end")
				.text("Minimum Amount: $" + formatMoney0Decimals(minAllocationValueStandard));

			const maxValueStandard = legendPanel.main.append("text")
				.attr("class", "pbiuacLegendMainText2")
				.attr("y", legendVerticalScale("standard") + 3)
				.attr("x", legendScalePadding + colorsStandard.length * legendRectWidth + 4)
				.attr("text-anchor", "start")
				.text("Maximum Amount: $" + formatMoney0Decimals(maxAllocationValueStandard));

			const minValueReserve = legendPanel.main.append("text")
				.attr("class", "pbiuacLegendMainText2")
				.attr("y", legendVerticalScale("reserve") + 3)
				.attr("x", legendScalePadding - 4)
				.attr("text-anchor", "end")
				.text("Minimum Amount: $" + formatMoney0Decimals(minAllocationValueReserve));

			const maxValueReserve = legendPanel.main.append("text")
				.attr("class", "pbiuacLegendMainText2")
				.attr("y", legendVerticalScale("reserve") + 3)
				.attr("x", legendScalePadding + colorsReserve.length * legendRectWidth + 4)
				.attr("text-anchor", "start")
				.text("Maximum Amount: $" + formatMoney0Decimals(maxAllocationValueReserve));

			function mouseOverLegend(datum, scale, element) {

				tooltip.html(null);

				const containerSize = containerDiv.node().getBoundingClientRect();

				const thisSize = element.getBoundingClientRect();

				const limits = scale.invertExtent(datum);

				const innerTooltip = tooltip.append("div")
					.attr("id", "pbiuacInnerTooltipDiv");

				innerTooltip.html("This color represents values going from:<br><div style='margin-top:8px;text-align:center;'>$<strong>" + formatMoney0Decimals(limits[0]) + "</strong> to $<strong>" +
					formatMoney0Decimals(limits[1]) + "</strong></div>");

				tooltip.style("display", "block");

				const tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip.style("left", thisSize.left - containerSize.left - (tooltipSize.width / 2) + (thisSize.width / 2) + "px")
					.style("top", thisSize.y - containerSize.y - tooltipSize.height - 1 + "px");

			};

			function mouseOutLegend() {
				tooltip.style("display", "none");
			};

			//end of createLegendPanel
		};

		function brushed() {
			if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
			const s = d3.event.selection || xScaleBrush.range();
			xScaleMain.domain(s.map(xScaleBrush.invert, xScaleBrush));
			mainPanel.main.selectAll(".pbiuacAllocationsMain")
				.attr("x", function(d) {
					return xScaleMain(d.PlannedStartDate);
				})
				.attr("width", function(d) {
					return xScaleMain(d.PlannedEndDate) - xScaleMain(d.PlannedStartDate);
				});
			mainPanel.main.select(".pbiuacTodayGroup")
				.attr("transform", "translate(" + xScaleMain(currentDate) + ",0)");
			mainPanel.main.select(".pbiuacXAxisMainGroup")
				.call(xAxisMain);
			rewriteXAxisText();
			createTopPanel(completeData);
			mainPanel.main.select(".pbiuacZoomRect").call(zoom.transform, d3.zoomIdentity
				.scale((mainPanel.width - mainPanel.padding[3] - mainPanel.padding[1]) / (s[1] - s[0]))
				.translate(-s[0], 0));
		};

		function zoomed() {
			if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
			const t = d3.event.transform;
			xScaleMain.domain(t.rescaleX(xScaleBrush).domain());
			mainPanel.main.selectAll(".pbiuacAllocationsMain")
				.attr("x", function(d) {
					return xScaleMain(d.PlannedStartDate);
				})
				.attr("width", function(d) {
					return xScaleMain(d.PlannedEndDate) - xScaleMain(d.PlannedStartDate);
				});
			mainPanel.main.select(".pbiuacTodayGroup")
				.attr("transform", "translate(" + xScaleMain(currentDate) + ",0)");
			mainPanel.main.select(".pbiuacXAxisMainGroup")
				.call(xAxisMain);
			rewriteXAxisText();
			createTopPanel(completeData);
			brushPanel.main.select(".pbiuacBrushGroup").call(brush.move, xScaleMain.range().map(t.invertX, t));
		};

		function processData(rawData) {

			rawData.forEach(function(row) {

				const thisAllocationTime = row.PlannedEndDateTimestamp < currentDate.getTime() ? "past" :
					row.PlannedStartDateTimestamp > currentDate.getTime() ? "planned" : "ongoing";

				row.timeLine = thisAllocationTime;

				row.allocationType = row.AllocationSource.toLowerCase();

				if (cbpfsAllocationsTime[row.PooledFundName] === undefined) {
					cbpfsAllocationsTime[row.PooledFundName] = thisAllocationTime;
				} else if (cbpfsOrdering.indexOf(cbpfsAllocationsTime[row.PooledFundName]) > cbpfsOrdering.indexOf(thisAllocationTime)) {
					cbpfsAllocationsTime[row.PooledFundName] = thisAllocationTime;
				};

				if (minDate.getTime() > row.PlannedStartDateTimestamp) minDate = row.PlannedStartDate;
				if (maxDate.getTime() < row.PlannedEndDateTimestamp) maxDate = row.PlannedEndDate;

				if (row.allocationType === "standard") {
					if (row.TotalUSDPlanned < minAllocationValueStandard) minAllocationValueStandard = row.TotalUSDPlanned;
					if (row.TotalUSDPlanned > maxAllocationValueStandard) maxAllocationValueStandard = row.TotalUSDPlanned;
				} else {
					if (row.TotalUSDPlanned < minAllocationValueReserve) minAllocationValueReserve = row.TotalUSDPlanned;
					if (row.TotalUSDPlanned > maxAllocationValueReserve) maxAllocationValueReserve = row.TotalUSDPlanned;
				};

			});

			const cbpfsUpcoming = Object.keys(cbpfsAllocationsTime).filter(function(d) {
				return cbpfsAllocationsTime[d] === "planned";
			}).sort(function(a, b) {
				return a.toLowerCase() < b.toLowerCase() ? -1 :
					a.toLowerCase() > b.toLowerCase() ? 1 : 0
			});

			const cbpfsOngoing = Object.keys(cbpfsAllocationsTime).filter(function(d) {
				return cbpfsAllocationsTime[d] === "ongoing";
			}).sort(function(a, b) {
				return a.toLowerCase() < b.toLowerCase() ? -1 :
					a.toLowerCase() > b.toLowerCase() ? 1 : 0
			});

			const cbpfsPast = Object.keys(cbpfsAllocationsTime).filter(function(d) {
				return cbpfsAllocationsTime[d] === "past";
			}).sort(function(a, b) {
				return a.toLowerCase() < b.toLowerCase() ? -1 :
					a.toLowerCase() > b.toLowerCase() ? 1 : 0
			});

			cbpfsList = cbpfsUpcoming.concat(cbpfsOngoing).concat(cbpfsPast);

			cbpfsList.forEach(function(d) {
				const thisCbpf = rawData.filter(function(e) {
					return e.PooledFundName === d;
				});
				calculateCollisions(thisCbpf, d)
			})

			minDateOffset = d3.timeMonth.offset(minDate, -2);
			maxDateOffset = d3.timeMonth.offset(maxDate, 2);

			return rawData

			//end of processData
		};

		function calculateCollisions(cbpf, cbpfName) {

			cbpf = cbpf.sort(function(a, b) {
				return a.PlannedStartDateTimestamp - b.PlannedStartDateTimestamp;
			});

			const rowsList = {
				"0": cbpf[0].PlannedEndDateTimestamp
			};

			cbpf[0].row = 0;

			cbpf.forEach(function(d, index) {
				if (!index) return;
				for (let key in rowsList) {
					if (d.PlannedStartDateTimestamp > rowsList[key]) {
						d.row = +key;
						rowsList[key] = d.PlannedEndDateTimestamp;
						return;
					};
				};
				const maxKey = d3.max(Object.keys(rowsList).map(function(e) {
					return +e;
				}));
				rowsList[(maxKey + 1).toString()] = d.PlannedEndDateTimestamp;
				d.row = maxKey + 1;
			});

			cbpfsRowList[cbpfName] = d3.max(cbpf, function(d) {
				return d.row;
			});

			//end of calculateCollisions
		};

		function calculateHeightandResize() {

			const mainPanelInnerHeight = Object.keys(cbpfsRowList).reduce(function(acc, curr) {
				acc += (2 * outerBarPadding) + (cbpfsRowList[curr] * innerBarPadding) + ((cbpfsRowList[curr] + 1) * barHeight);
				return acc;
			}, 0);

			mainPanelHeight = mainPanelInnerHeight + mainPanel.padding[0] + mainPanel.padding[2];

			mainPanel.height = mainPanelHeight;

			const brushPanelInnerHeight = Object.keys(cbpfsRowList).reduce(function(acc, curr) {
				acc += (2 * outerBarPaddingBrush) + (cbpfsRowList[curr] * innerBarPaddingBrush) + ((cbpfsRowList[curr] + 1) * barHeightBrush);
				return acc;
			}, 0);

			brushPanelHeight = brushPanelInnerHeight + brushPanel.padding[0] + brushPanel.padding[2];

			brushPanel.height = brushPanelHeight;

			height = padding[0] + padding[2] + topPanel.height + brushPanel.height + mainPanel.height + legendPanel.height + (3 * panelHorizontalPadding);

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			};

			svg.attr("viewBox", "0 0 " + width + " " + height)

			if (isInternetExplorer) {
				svg.attr("height", height);
			};

			mainPanel.main
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + brushPanel.height + (2 * panelHorizontalPadding)) + ")");

			legendPanel.main
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + brushPanel.height + mainPanel.height + (3 * panelHorizontalPadding)) + ")");

			xAxisMain.tickSizeInner(-(mainPanel.height - mainPanel.padding[0] - mainPanel.padding[2]));

			mainClip.attr("height", mainPanel.height);

			zoom.translateExtent([
					[mainPanel.padding[3], 0],
					[mainPanel.width, mainPanel.height]
				])
				.extent([
					[mainPanel.padding[3], 0],
					[mainPanel.width, mainPanel.height]
				])

			brush.extent([
				[brushPanel.padding[3], brushPanel.padding[0]],
				[brushPanel.width, brushPanel.height - brushPanel.padding[2]]
			]);

			//end of calculateHeightandResize;
		};

		function setOrdinalRange(panel, barHeight, outerBarPadding, innerBarPadding) {

			let range = Object.keys(cbpfsRowList).map(function(d) {
				return this.current += (2 * outerBarPadding) + (cbpfsRowList[d] * innerBarPadding) + ((cbpfsRowList[d] + 1) * barHeight);
			}, {
				current: panel.padding[0]
			});

			range.unshift(panel.padding[0]);

			return range;

		};

		function rewriteXAxisText() {
			const todaySize = mainPanel.main.select(".pbiuacTodayText")
				.node().getBoundingClientRect();
			mainPanel.main.select(".pbiuacXAxisMainGroup").selectAll("text")
				.each(function() {
					const thisSize = this.getBoundingClientRect();
					if (thisSize.left < todaySize.right && thisSize.right > todaySize.left) {
						d3.select(this.parentNode).remove();
						return;
					};
					const thisText = this.textContent;
					if (+thisText === +thisText) {
						d3.select(this).style("fill", axisHighlightColor)
							.style("font-weight", 700);
					};
				});
		};

		function row(d) {
			d.TotalUSDPlanned = +d.TotalUSDPlanned;
			d.PlannedStartDate = timeParse(d.PlannedStartDate);
			d.PlannedEndDate = timeParse(d.PlannedEndDate);
			if (!d.PlannedStartDate && !d.PlannedEndDate) return;
			if (!d.PlannedStartDate) {
				d.PlannedStartDate = d.AllocationSource === "Standard" ?
					d3.timeMonth.offset(d.PlannedEndDate, -1) : d3.timeDay.offset(d.PlannedEndDate, -15)
			};
			if (!d.PlannedEndDate) {
				d.PlannedEndDate = d.AllocationSource === "Standard" ?
					d3.timeMonth.offset(d.PlannedStartDate, 1) : d3.timeDay.offset(d.PlannedStartDate, 15)
			};
			d.PlannedStartDateTimestamp = d.PlannedStartDate.getTime();
			d.PlannedEndDateTimestamp = d.PlannedEndDate.getTime();
			if (d.PlannedStartDateTimestamp < d.PlannedEndDateTimestamp) return d;
		};

		function generateList(datum) {

			listDiv.html("");

			const thisColorClass = "contributionColorHTMLcolor";

			const listTitleDivContainer = listDiv.append("div")
				.attr("class", "pbiuacListTitleDivContainer");

			const listTitleDiv = listTitleDivContainer.append("div")
				.attr("class", "pbiuacListTitleDiv");

			const listButtonDiv = listTitleDivContainer.append("div")
				.attr("class", "pbiuacListButtonDiv");

			const listTitle = listTitleDiv.append("p")
				.attr("class", "pbiuacListTitle contributionColorHTMLcolor")
				.html("Allocation Details");

			const listButton = listButtonDiv.append("button")
				.html("Remove this list")
				.on("click", function() {
					listDiv.html("");
				});

			const nameAndYearDiv = listDiv.append("div")
				.attr("class", "pbiuacNameAndYearDiv")
				.append("p")
				.html(datum.PooledFundName + ", " + datum.AllocationYear);

			const allocationTitle = listDiv.append("div")
				.attr("class", "pbiuacAllocationTitle")
				.append("p")
				.html(datum.AllocationTitle);

			const allocationSource = listDiv.append("div")
				.attr("class", "pbiuacAllocationSource")
				.append("p")
				.html("(" + datum.AllocationSource + ")");

			const allocationStart = listDiv.append("div")
				.attr("class", "pbiuacAllocationStart")
				.append("p")
				.html("<span class='" + thisColorClass + "'>Allocation strategy launch date: </span>" + timeFormat(datum.PlannedStartDate));

			const allocationEnd = listDiv.append("div")
				.attr("class", "pbiuacAllocationEnd")
				.append("p")
				.html("<span class='" + thisColorClass + "'>Expected completion date of HC approvals: </span>" + timeFormat(datum.PlannedEndDate));

			const hrList = datum.HRPPlans ? datum.HRPPlans.split("##").join("; ") + "." : "n/a.";

			const allocationHR = listDiv.append("div")
				.attr("class", "pbiuacAllocationHR")
				.append("p")
				.html("<span class='" + thisColorClass + "'>Target HRPs: </span>" + hrList);

			const documentsDiv = listDiv.append("div")
				.attr("class", "pbiuacDocumentsDiv")
				.append("p")
				.html("<b>Related Documents:</b>");

			const documentsList = datum.Documents ? datum.Documents.split("|||").map(function(d) {
				return {
					documentTitle: d.split("##")[0],
					size: d.split("##")[1],
					type: d.split("##")[2],
					url: d.split("##")[3],
					documentComment: d.split("##")[4]
				};
			}) : null;

			const documentsDivList = listDiv.append("div")
				.attr("class", "pbiuacDocumentsList");

			if (documentsList) {
				const list = documentsDivList.append("ol");
				const rows = list.selectAll(null)
					.data(documentsList)
					.enter()
					.append("li");
				rows.append("span")
					.html(function(d) {
						return d.documentComment ? d.documentComment + ", " : "";
					});
				rows.append("a")
					.attr("href", function(d) {
						return d.url
					})
					.attr("target", "_blank")
					.html(function(d) {
						return d.documentTitle;
					});
				rows.append("span")
					.html(function(d) {
						return " (" + convertToBytes(d.size) + "B, " + d.type + ")";
					});
			} else {
				documentsDivList.append("p")
					.html("Unavailable");
			};

			//end of generateList
		};

		function createCsv(data) {

			const copiedData = JSON.parse(JSON.stringify(data))
				.filter(function(d) {
					return d.PlannedStartDateTimestamp < xScaleMain.domain()[1].getTime() && d.PlannedEndDateTimestamp > xScaleMain.domain()[0].getTime();
				});

			copiedData.forEach(function(d) {
				d.CBPF = d.PooledFundName;
				d["Allocation Title"] = d.AllocationTitle;
				d["Allocation Summary"] = d.AllocationSummary;
				d.Total = d.TotalUSDPlanned;
				d["Start Date"] = d.PlannedStartDate;
				d["End Date"] = d.PlannedEndDate;

				delete d.AllocationTitle;
				delete d.AllocationSummary;
				delete d.TotalUSDPlanned;
				delete d.PooledFundName;
				delete d.PlannedStartDate;
				delete d.PlannedStartDateTimestamp;
				delete d.PlannedEndDate;
				delete d.PlannedEndDateTimestamp;
				delete d.Documents;
				delete d.PooledFundId;
				delete d.AllocationYear;
				delete d.HRPPlans;
				delete d.timeLine;
				delete d.allocationType;
				delete d.row;

			});

			const csv = d3.csvFormat(copiedData);

			return csv;

			//end of createCsv
		};

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbiuacOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + height);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbiuacArrowMarker")
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
				.attr("y", 260)
				.text("CLICK ANYWHERE TO START");

			const mainText = helpSVG.append("text")
				.attr("class", "pbiuacAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 260)
				.text("CLICK ANYWHERE TO START");

			const brushAnnotationRect = helpSVG.append("rect")
				.attr("x", 50 - padding)
				.attr("y", 130 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const brushAnnotation = helpSVG.append("text")
				.attr("class", "pbiuacAnnotationText")
				.attr("x", 50)
				.attr("y", 130)
				.text("The brush area shows the data for the entire period. Use the two handles to move the selection or click + pan to move the selection. Click outside the selection to select the entire period.")
				.call(wrapText2, 400);

			const brushPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiuacArrowMarker)")
				.attr("d", "M440,140 L510,140");

			brushAnnotationRect.attr("width", brushAnnotation.node().getBBox().width + padding * 2)
				.attr("height", brushAnnotation.node().getBBox().height + padding * 2);

			const mainAreaAnnotationRect = helpSVG.append("rect")
				.attr("x", 480 - padding)
				.attr("y", 320 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const mainAreaAnnotation = helpSVG.append("text")
				.attr("class", "pbiuacAnnotationText")
				.attr("x", 480)
				.attr("y", 320)
				.text("This area shows the allocations for the selected period. You can pan left/right or zoom (using the mousewheel or the trackpad) to move this area. Hover over the allocations to get more information, and click on “Display Details” to generate the details (below the chart) for the allocation.")
				.call(wrapText2, 400);

			const mainAreaPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiuacArrowMarker)")
				.attr("d", "M470,350 L430,350");

			mainAreaAnnotationRect.attr("width", mainAreaAnnotation.node().getBBox().width + padding * 2)
				.attr("height", mainAreaAnnotation.node().getBBox().height + padding * 2);

			const legendsAnnotationRect = helpSVG.append("rect")
				.attr("x", 300 - padding)
				.attr("y", 480 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const legendsAnnotation = helpSVG.append("text")
				.attr("class", "pbiuacAnnotationText")
				.attr("x", 300)
				.attr("y", 480)
				.text("The legend shows the color encoding according to the allocation amount. Hover over the colors to see the corresponding amount.")
				.call(wrapText2, 400);

			const legendsPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiuacArrowMarker)")
				.attr("d", "M450,520 L450,550");

			legendsAnnotationRect.attr("width", legendsAnnotation.node().getBBox().width + padding * 2)
				.attr("height", legendsAnnotation.node().getBBox().height + padding * 2);

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

		function createProgressWheel() {
			const wheelGroup = svg.append("g")
				.attr("class", "d3chartwheelGroup")
				.attr("transform", "translate(" + width / 2 + "," + height / 4 + ")");

			const loadingText = wheelGroup.append("text")
				.attr("text-anchor", "middle")
				.style("font-family", "Roboto")
				.style("font-weight", "bold")
				.style("font-size", "11px")
				.attr("y", 50)
				.attr("class", "contributionColorFill")
				.text("Loading visualisation...");

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
			const wheelGroup = d3.select(".d3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		};

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value);
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

		//end of d3Chart
	};

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

	//END OF POLYFILLS

	//end of d3ChartIIFE
}());
(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1 ? true : false;

	const cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbialp.css"];

	cssLinks.forEach(function(cssLink) {

		const externalCSS = document.createElement("link");
		externalCSS.setAttribute("rel", "stylesheet");
		externalCSS.setAttribute("type", "text/css");
		externalCSS.setAttribute("href", cssLink);
		document.getElementsByTagName("head")[0].appendChild(externalCSS);

	});

	function loadScript(url, callback) {
		const head = document.getElementsByTagName('head')[0];
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		script.onreadystatechange = callback;
		script.onload = callback;
		head.appendChild(script);
	}

	if (!isInternetExplorer) {
		loadScript("https://d3js.org/d3.v5.min.js", d3Chart);
	} else {
		loadScript("https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js", function() {
			loadScript("https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js", function() {
				loadScript("https://d3js.org/d3.v5.min.js", d3Chart);
			});
		});
	};

	function d3Chart() {

		const width = 1130,
			parallelPanelHeight = 400,
			padding = [4, 4, 34, 4],
			topPanelHeight = 72,
			buttonPanelHeight = 30,
			panelHorizontalPadding = 4,
			panelVerticalPadding = 8,
			windowHeight = window.innerHeight,
			lollipopGroupHeight = 18,
			stickHeight = 2,
			lollipopRadius = 4,
			fadeOpacity = 0.15,
			parallelTickPadding = 20,
			xScaleLollipopMargin = 1.1,
			verticalLabelPadding = 4,
			paidSymbolSize = 16,
			percentNumberPadding = 4,
			circleRadius = 4,
			showAverageGroupPadding = 180,
			selectedCbpfLabelPadding = 8,
			lollipopTooltipWidth = 400,
			parallelTooltipWidth = 280,
			partnerList = ["International NGO", "National NGO", "Red Cross/Crescent Movement", "UN Agency"],
			partnerListWithTotal = partnerList.concat("total"),
			formatSIaxes = d3.format("~s"),
			formatMoney2Decimals = d3.format(",.2f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			localVariable = d3.local(),
			buttonsNumber = 8,
			excelIconSize = 20,
			excelIconPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/excelicon.png",
			file = "https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?poolfundAbbrv=&$format=csv",
			moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
			],
			duration = 1000,
			shortDuration = 500,
			titlePadding = 20,
			partnersTotals = {},
			partnersUnderApproval = {},
			chartState = {
				selectedYear: null,
				selectedPartner: null,
				selectedCbpfs: []
			};

		let started = false,
			height = padding[0] + padding[2] + topPanelHeight + buttonPanelHeight + parallelPanelHeight + (2 * panelHorizontalPadding),
			yearsArray;

		const containerDiv = d3.select("#d3chartcontainerpbialp");

		const distancetoTop = containerDiv.node().offsetTop;

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		let showAverage = (containerDiv.node().getAttribute("data-showaverage") === "true");

		const selectedYearString = containerDiv.node().getAttribute("data-year");

		chartState.selectedPartner = partnerListWithTotal.indexOf(containerDiv.node().getAttribute("data-partner")) > -1 ?
			containerDiv.node().getAttribute("data-partner") :
			"total";

		if (selectedResponsiveness === "false" || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		createProgressWheel();

		const tooltip = d3.select("body").append("div")
			.attr("id", "pbialptooltipdiv")
			.style("display", "none");

		const topPanel = {
			main: svg.append("g")
				.attr("class", "pbialpTopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			leftPadding: [218, 82, 116],
			mainValueVerPadding: 14,
			mainValueHorPadding: 4
		};

		const buttonPanel = {
			main: svg.append("g")
				.attr("class", "pbialpButtonPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: buttonPanelHeight,
			padding: [0, 0, 0, 0],
			buttonWidth: 54,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonPartnersInnerPadding: 4
		};

		const lollipopPanel = {
			main: svg.append("g")
				.attr("class", "pbialpLollipopPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			padding: [40, 38, 4, 0],
			labelPadding: 6
		};

		const parallelPanel = {
			main: svg.append("g")
				.attr("class", "pbialpParallelPanel")
				.attr("transform", "translate(" + (padding[3] + lollipopPanel.width + panelVerticalPadding) + "," +
					(padding[0] + topPanel.height + buttonPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: parallelPanelHeight,
			padding: [40, 54, 44, 0],
			labelPadding: 6
		};

		const lollipopPanelClip = lollipopPanel.main.append("clipPath")
			.attr("id", "pbialpLollipopPanelClip")
			.append("rect")
			.attr("width", lollipopPanel.width)
			.attr("transform", "translate(0," + (-lollipopPanel.padding[0]) + ")");

		const xScaleLollipop = d3.scaleLinear();

		const xScaleParallel = d3.scalePoint()
			.domain(partnerList)
			.range([parallelPanel.padding[3], parallelPanel.width - parallelPanel.padding[1]])
			.padding(0.5);

		const yScaleLollipop = d3.scalePoint()
			.padding(0.5);

		const yScaleParallel = d3.scaleLinear()
			.range([parallelPanel.height - parallelPanel.padding[2], parallelPanel.padding[0]]);

		const partnersColorsScale = d3.scaleOrdinal()
			.domain(partnerList)
			.range(["InternationalNGOPartnerColor", "NationalNGOPartnerColor", "OthersPartnerColor", "UNAgencyPartnerColor"]);

		const partnersTextScale = d3.scaleOrdinal()
			.domain(partnerList)
			.range(["Int. NGO", "Nat. NGO", "RC/CM", "UN"]);

		const xAxisLollipop = d3.axisTop(xScaleLollipop)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisParallel = d3.axisBottom(xScaleParallel)
			.tickSizeOuter(0)
			.tickSizeInner(-(parallelPanelHeight - parallelPanel.padding[0] - parallelPanel.padding[2]))
			.tickPadding(parallelTickPadding);

		const yAxisLollipop = d3.axisLeft(yScaleLollipop)
			.tickSizeInner(2)
			.tickSizeOuter(0);

		const lineGenerator = d3.line()
			.x(function(d) {
				return xScaleParallel(d.partner);
			})
			.y(function(d) {
				return yScaleParallel(d.percentage);
			});

		const lineGeneratorBase = d3.line()
			.x(function(d) {
				return xScaleParallel(d.partner);
			})
			.y(yScaleParallel(0));

		const groupXAxisLollipop = lollipopPanel.main.append("g")
			.attr("class", "pbialpgroupXAxisLollipop")
			.attr("clip-path", "url(#pbialpLollipopPanelClip)")
			.attr("transform", "translate(0," + lollipopPanel.padding[0] + ")");

		const groupXAxisParallel = parallelPanel.main.append("g")
			.attr("class", "pbialpgroupXAxisParallel")
			.attr("transform", "translate(0," + (parallelPanel.height - parallelPanel.padding[2]) + ")");

		const groupYAxisLollipop = lollipopPanel.main.append("g")
			.attr("class", "pbialpgroupYAxisLollipop");

		const paidSymbol = d3.symbol()
			.type(d3.symbolTriangle)
			.size(paidSymbolSize);

		d3.csv(file).then(function(rawData) {

			removeProgressWheel();

			yearsArray = rawData.map(function(d) {
				return +d.AllocationYear;
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).sort();

			chartState.selectedYear = validateYear(selectedYearString);

			if (!lazyLoad) {
				draw(rawData);
			} else {
				d3.select(window).on("scroll", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const amountScrolled = window.pageYOffset;

				if (amountScrolled > ((distancetoTop - windowHeight) + height / 10) &&
					amountScrolled < (distancetoTop + height * 0.9)) {
					if (!started) {
						draw(rawData);
					}
				};

				if (started) {
					if (amountScrolled < (distancetoTop - windowHeight) ||
						amountScrolled > (distancetoTop + height)) {
						restart();
					}
				};

				//end of checkPosition
			};

			//end of d3.csv
		});

		function draw(rawData) {

			started = true;

			let data = processData(rawData);

			recalculateAndResize();

			translateAxes();

			createTopPanel(data);

			createButtonsPanel();

			createLollipopPanel(data);

			createParallelPanel(data);

			createBottomButtons();

			function createTopPanel(data) {

				const transition = setTransition(duration);

				partnerListWithTotal.forEach(function(d) {
					partnersTotals[d] = d3.sum(data, function(e) {
						return e[d]
					});
				});

				const mainValue = partnersTotals[chartState.selectedPartner];

				partnerListWithTotal.forEach(function(d) {
					partnersUnderApproval[d] = d3.sum(data, function(e) {
						return d === "total" ? e.underApproval : e["underApproval-" + d];
					});
				});

				const valueUnderApproval = partnersUnderApproval[chartState.selectedPartner];

				const topPanelMoneyBag = topPanel.main.selectAll(".pbialptopPanelMoneyBag")
					.data([true]);

				topPanelMoneyBag.enter()
					.append("g")
					.attr("class", "pbialptopPanelMoneyBag allocationColorFill")
					.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.6)")
					.each(function(_, i, n) {
						moneyBagdAttribute.forEach(function(d) {
							d3.select(n[i]).append("path")
								.attr("d", d);
						});
					});

				topPanelMoneyBag.transition(transition)
					.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.6)");

				const previousMainValue = d3.select(".pbialptopPanelMainValue").size() !== 0 ? d3.select(".pbialptopPanelMainValue").datum() : 0;

				const previousUnderApprovalValue = d3.select(".pbialptopPanelUnderApprovalValue").size() !== 0 ? d3.select(".pbialptopPanelUnderApprovalValue").datum() : 0;

				const previousCbpfs = d3.select(".pbialptopPanelCbpfsNumber").size() !== 0 ? d3.select(".pbialptopPanelCbpfsNumber").datum() : 0;

				let mainValueGroup = topPanel.main.selectAll(".pbialpmainValueGroup")
					.data([true]);

				mainValueGroup = mainValueGroup.enter()
					.append("g")
					.attr("class", "pbialpmainValueGroup")
					.merge(mainValueGroup);

				let topPanelMainValue = mainValueGroup.selectAll(".pbialptopPanelMainValue")
					.data([mainValue]);

				topPanelMainValue = topPanelMainValue.enter()
					.append("text")
					.attr("class", "pbialptopPanelMainValue allocationColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelMainValue)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding);

				topPanelMainValue.transition(transition)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] - topPanel.mainValueHorPadding)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousMainValue, d);
						return function(t) {
							const siString = formatSIFloat(i(t))
							node.textContent = "$" + siString.substring(0, siString.length - 1);
						};
					});

				let topPanelMainText = mainValueGroup.selectAll(".pbialptopPanelMainText")
					.data([mainValue]);

				topPanelMainText = topPanelMainText.enter()
					.append("text")
					.attr("class", "pbialptopPanelMainText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelMainText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.9);

				topPanelMainText.transition(transition)
					.style("opacity", 1)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
					.text(function(d) {
						const valueSI = formatSIFloat(d);
						const unit = valueSI[valueSI.length - 1];
						return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
							" Allocated in " + chartState.selectedYear;
					});

				let topPanelSubText = mainValueGroup.selectAll(".pbialptopPanelSubText")
					.data([true]);

				topPanelSubText = topPanelSubText.enter()
					.append("text")
					.attr("class", "pbialptopPanelSubText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelSubText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.3);

				topPanelSubText.transition(transition)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding)
					.style("opacity", 1)
					.text(function(d) {
						return "(" +
							(chartState.selectedPartner === "total" ? "all partners" :
								chartState.selectedPartner === "Red Cross/Crescent Movement" ? "Red Cross/Cres. Mov." :
								chartState.selectedPartner) +
							")";
					});

				let underApprovalValueGroup = topPanel.main.selectAll(".pbialpunderApprovalValueGroup")
					.data([true]);

				underApprovalValueGroup = underApprovalValueGroup.enter()
					.append("g")
					.attr("class", "pbialpunderApprovalValueGroup")
					.merge(underApprovalValueGroup);

				let topPanelUnderApprovalValue = underApprovalValueGroup.selectAll(".pbialptopPanelUnderApprovalValue")
					.data([valueUnderApproval]);

				topPanelUnderApprovalValue = topPanelUnderApprovalValue.enter()
					.append("text")
					.attr("class", "pbialptopPanelUnderApprovalValue allocationColorFill")
					.attr("text-anchor", "end")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.5)
					.merge(topPanelUnderApprovalValue);

				const fakeUnderApprovalValue = topPanel.main.append("text")
					.attr("class", "pbialptopPanelUnderApprovalValue")
					.style("opacity", 0)
					.text(function() {
						const siString = formatSIFloat(valueUnderApproval);
						return "$" + siString.substring(0, siString.length - 1);
					});

				const underApprovalValueTextLength = ~~(fakeUnderApprovalValue.node().getComputedTextLength());

				fakeUnderApprovalValue.remove();

				topPanelUnderApprovalValue.transition(transition)
					.attr("x", topPanel.moneyBagPadding + (4 * buttonPanel.arrowPadding) + (buttonsNumber * buttonPanel.buttonWidth) +
						topPanel.leftPadding[1] - topPanel.mainValueHorPadding / 2)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousUnderApprovalValue, d);
						return function(t) {
							const siString = formatSIFloat(i(t))
							node.textContent = "$" + siString.substring(0, siString.length - 1);
						};
					});

				let topPanelUnderApprovalText = underApprovalValueGroup.selectAll(".pbialptopPanelUnderApprovalText")
					.data([valueUnderApproval]);

				topPanelUnderApprovalText = topPanelUnderApprovalText.enter()
					.append("text")
					.attr("class", "pbialptopPanelUnderApprovalText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.5)
					.merge(topPanelUnderApprovalText);

				topPanelUnderApprovalText.transition(transition)
					.attr("x", topPanel.moneyBagPadding + (4 * buttonPanel.arrowPadding) + (buttonsNumber * buttonPanel.buttonWidth) +
						topPanel.leftPadding[1] + topPanel.mainValueHorPadding / 2)
					.style("opacity", 1)
					.text(function(d) {
						const valueSI = formatSIFloat(d);
						const unit = valueSI[valueSI.length - 1];
						return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
							" under approval";
					});

				let topPanelUnderApprovalSubText = underApprovalValueGroup.selectAll(".pbialptopPanelUnderApprovalSubText")
					.data([true]);

				topPanelUnderApprovalSubText = topPanelUnderApprovalSubText.enter()
					.append("text")
					.attr("class", "pbialptopPanelUnderApprovalSubText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
					.merge(topPanelUnderApprovalSubText)

				topPanelUnderApprovalSubText.transition(transition)
					.attr("x", topPanel.moneyBagPadding + (4 * buttonPanel.arrowPadding) + (buttonsNumber * buttonPanel.buttonWidth) +
						(topPanel.leftPadding[1] - underApprovalValueTextLength - (topPanel.mainValueHorPadding / 2)))
					.style("opacity", 1)
					.text(function(d) {
						return "(" +
							(chartState.selectedPartner === "total" ? "all partners" :
								chartState.selectedPartner === "Red Cross/Crescent Movement" ? "Red Cross/Cres. Mov." :
								chartState.selectedPartner) +
							")";
					});

				let topPanelCbpfsNumber = mainValueGroup.selectAll(".pbialptopPanelCbpfsNumber")
					.data([data.length]);

				topPanelCbpfsNumber = topPanelCbpfsNumber.enter()
					.append("text")
					.attr("class", "pbialptopPanelCbpfsNumber allocationColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelCbpfsNumber)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding);

				topPanelCbpfsNumber.transition(transition)
					.attr("x", topPanel.width - topPanel.leftPadding[2] - topPanel.mainValueHorPadding)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousCbpfs, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				let topPanelCbpfsText = mainValueGroup.selectAll(".pbialptopPanelCbpfsText")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbialptopPanelCbpfsText")
					.attr("x", topPanel.width - topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2)
					.attr("text-anchor", "start")
					.text("CBPFs");

				const topPanelOverRectangle = topPanel.main.selectAll(".pbialptopPanelOverRectangle")
					.data([true])
					.enter()
					.append("rect")
					.attr("class", "pbialptopPanelOverRectangle")
					.attr("width", topPanel.width)
					.attr("height", topPanel.height)
					.style("opacity", 0);

				topPanelOverRectangle.on("mouseover", mouseOverTopPanel)
					.on("mousemove", mouseMoveTopPanel)
					.on("mouseout", mouseOutTopPanel);

				//end of createTopPanel
			};

			function createButtonsPanel() {

				const clipPathButtons = buttonPanel.main.append("clipPath")
					.attr("id", "pbialpClipPathButtons")
					.append("rect")
					.attr("width", buttonsNumber * buttonPanel.buttonWidth)
					.attr("height", buttonPanel.height);

				const clipPathGroup = buttonPanel.main.append("g")
					.attr("class", "pbialpClipPathGroup")
					.attr("transform", "translate(" + (topPanel.moneyBagPadding + buttonPanel.arrowPadding) + ",0)")
					.attr("clip-path", "url(#pbialpClipPathButtons)");

				const buttonsGroup = clipPathGroup.append("g")
					.attr("class", "pbialpbuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbialpbuttonsRects")
					.attr("width", buttonPanel.buttonWidth - buttonPanel.buttonPadding)
					.attr("height", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2)
					.attr("y", buttonPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonPanel.buttonWidth + buttonPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedYear ? "whitesmoke" : "white";
					})
					.style("stroke", function(d) {
						return d === chartState.selectedYear ? "#444" : "#aaa";
					})
					.style("stroke-width", function(d) {
						return d === chartState.selectedYear ? "2px" : "1px";
					});

				const buttonsText = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbialpbuttonsText")
					.attr("y", buttonPanel.height / 1.6)
					.attr("x", function(_, i) {
						return i * buttonPanel.buttonWidth + buttonPanel.buttonWidth / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedYear ? "#444" : "#888"
					})
					.text(function(d) {
						return d;
					});

				const buttonsPartnersGroup = buttonPanel.main.append("g")
					.attr("class", "pbialpbuttonsPartnersGroup")
					.attr("transform", "translate(" + (topPanel.moneyBagPadding + (4 * buttonPanel.arrowPadding) + (buttonsNumber * buttonPanel.buttonWidth)) +
						",0)")
					.style("cursor", "pointer");

				const buttonsPartnersContainer = buttonsPartnersGroup.selectAll(null)
					.data(partnerListWithTotal)
					.enter()
					.append("g")
					.attr("class", "pbialpButtonsPartnersContainer");

				const buttonsPartnersText = buttonsPartnersContainer.append("text")
					.attr("class", "pbialpbuttonsPartnersText")
					.attr("y", buttonPanel.height / 1.6)
					.attr("x", buttonPanel.buttonPartnersInnerPadding)
					.style("fill", function(d) {
						return d === chartState.selectedPartner ? "#444" : "#888"
					})
					.text(function(d) {
						if (d !== "total") {
							return capitalize(d);
						} else {
							return "All partners"
						};
					});

				buttonsPartnersContainer.attr("transform", function(_, i) {
					if (i) {
						const previousTransform = parseTransform(d3.select(this.previousSibling).attr("transform"))[0];
						return "translate(" + (previousTransform + this.previousSibling.firstChild.getComputedTextLength() +
							(2 * buttonPanel.buttonPartnersInnerPadding) + buttonPanel.buttonPadding) + ",0)";
					} else {
						return "translate(0,0)";
					}
				});

				const buttonsPartnersRects = buttonsPartnersContainer.insert("rect", "text")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbialpbuttonsPartnersRects")
					.attr("width", function() {
						return this.nextSibling.getComputedTextLength() + 2 * buttonPanel.buttonPartnersInnerPadding;
					})
					.attr("height", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2)
					.attr("y", buttonPanel.buttonVerticalPadding)
					.attr("x", 0)
					.style("fill", function(d) {
						return d === chartState.selectedPartner ? "whitesmoke" : "white";
					})
					.style("stroke", function(d) {
						return d === chartState.selectedPartner ? "#444" : "#aaa";
					})
					.style("stroke-width", function(d) {
						return d === chartState.selectedPartner ? "2px" : "1px";
					});

				const leftArrow = buttonPanel.main.append("g")
					.attr("class", "pbialpLeftArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + topPanel.moneyBagPadding + ",0)");

				const leftArrowRect = leftArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				const leftArrowText = leftArrow.append("text")
					.attr("class", "pbialpleftArrowText")
					.attr("x", 0)
					.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonPanel.main.append("g")
					.attr("class", "pbialpRightArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + (topPanel.moneyBagPadding + buttonPanel.arrowPadding +
						(buttonsNumber * buttonPanel.buttonWidth)) + ",0)");

				const rightArrowRect = rightArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				const rightArrowText = rightArrow.append("text")
					.attr("class", "pbialprightArrowText")
					.attr("x", -1)
					.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25ba");

				buttonsRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsRects)
					.on("click", clickButtonsRects);

				buttonsPartnersRects.on("mouseover", mouseOverButtonsPartnersRects)
					.on("mouseout", mouseOutButtonsPartnersRects)
					.on("click", clickButtonsPartnersRects);

				repositionButtonsGroup();

				checkCurrentTranslate();

				leftArrow.on("click", function() {
					leftArrow.attr("pointer-events", "none");
					const transition = setTransition(duration);
					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
					rightArrow.select("text").style("fill", "#666");
					rightArrow.attr("pointer-events", "all");
					buttonsGroup.transition(transition)
						.attr("transform", "translate(" +
							Math.min(0, (currentTranslate + buttonsNumber * buttonPanel.buttonWidth)) + ",0)")
						.on("end", function() {
							const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
							if (currentTranslate === 0) {
								leftArrow.select("text").style("fill", "#ccc")
							} else {
								leftArrow.attr("pointer-events", "all");
							}
						})
				});

				rightArrow.on("click", function() {
					rightArrow.attr("pointer-events", "none");
					const transition = setTransition(duration);
					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
					buttonsGroup.transition(transition)
						.attr("transform", "translate(" +
							Math.max(-((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth),
								(-(Math.abs(currentTranslate) + buttonsNumber * buttonPanel.buttonWidth))) +
							",0)")
						.on("end", function() {
							const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
							if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
								rightArrow.select("text").style("fill", "#ccc")
							} else {
								rightArrow.attr("pointer-events", "all");
							}
						})
				});

				function checkCurrentTranslate() {

					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];

					if (currentTranslate === 0) {
						leftArrow.select("text").style("fill", "#ccc")
						leftArrow.attr("pointer-events", "none");
					};

					if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonPanel.buttonWidth)) {
						rightArrow.select("text").style("fill", "#ccc")
						rightArrow.attr("pointer-events", "none");
					};

				};

				function repositionButtonsGroup() {

					const firstYearIndex = chartState.selectedYear < yearsArray[5] ?
						0 :
						chartState.selectedYear > yearsArray[yearsArray.length - 4] ?
						yearsArray.length - 8 :
						yearsArray.indexOf(chartState.selectedYear) - 4;

					buttonsGroup.attr("transform", "translate(" +
						(-(buttonPanel.buttonWidth * firstYearIndex)) +
						",0)");

				};

				//end of createButtonsPanel
			};

			function createLollipopPanel(cbpfsArray) {

				const transition = setTransition(duration);

				cbpfsArray.sort(function(a, b) {
					return b[chartState.selectedPartner] - a[chartState.selectedPartner] ||
						(a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
							a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 : 0);
				});

				yScaleLollipop.domain(cbpfsArray.map(function(d) {
					return d.cbpf;
				}));

				let lollipopPanelTitle = lollipopPanel.main.selectAll(".pbialpLollipopPanelTitle")
					.data([true]);

				lollipopPanelTitle = lollipopPanelTitle.enter()
					.append("text")
					.attr("class", "pbialpLollipopPanelTitle")
					.attr("y", lollipopPanel.padding[0] - titlePadding)
					.merge(lollipopPanelTitle)
					.text("Allocations by CBPFs")
					.transition(transition)
					.attr("x", lollipopPanel.padding[3]);

				let cbpfGroup = lollipopPanel.main.selectAll(".pbialpCbpfGroup")
					.data(cbpfsArray, function(d) {
						return d.cbpf;
					});

				const cbpfGroupExit = cbpfGroup.exit()
					.remove();

				const cbpfGroupEnter = cbpfGroup.enter()
					.append("g")
					.attr("class", "pbialpCbpfGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScaleLollipop(d.cbpf) + ")";
					});

				const cbpfStickEnter = cbpfGroupEnter.append("rect")
					.attr("class", "pbialpCbpfStick")
					.attr("x", lollipopPanel.padding[3])
					.attr("y", -(stickHeight / 2 - (stickHeight / 4)))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("allocationColorFill", true);

				const cbpfLollipopEnter = cbpfGroupEnter.append("circle")
					.attr("class", "pbialpCbpfLollipop")
					.attr("cx", lollipopPanel.padding[3])
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed("allocationColorFill", true);

				const cbpfStandardIndicatorEnter = cbpfGroupEnter.append("path")
					.attr("class", "pbialpCbpfStandardIndicator")
					.attr("d", paidSymbol)
					.attr("transform", "translate(" + lollipopPanel.padding[3] + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

				const cbpfLabelEnter = cbpfGroupEnter.append("text")
					.attr("class", "pbialpCbpfLabel")
					.attr("x", lollipopPanel.padding[3] + lollipopPanel.labelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const cbpfTooltipRectangleEnter = cbpfGroupEnter.append("rect")
					.attr("class", "pbialpCbpfTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", lollipopPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all")
					.style("cursor", "pointer");

				cbpfGroup = cbpfGroupEnter.merge(cbpfGroup);

				cbpfGroup.transition(transition)
					.attr("transform", function(d) {
						return "translate(0," + yScaleLollipop(d.cbpf) + ")";
					});

				cbpfGroup.select(".pbialpCbpfStick")
					.transition(transition)
					.attr("x", lollipopPanel.padding[3])
					.attr("width", function(d) {
						return xScaleLollipop(d[chartState.selectedPartner]) - lollipopPanel.padding[3];
					});

				cbpfGroup.select(".pbialpCbpfLollipop")
					.transition(transition)
					.attr("cx", function(d) {
						return xScaleLollipop(d[chartState.selectedPartner]);
					});

				cbpfGroup.select(".pbialpCbpfStandardIndicator")
					.transition(transition)
					.attr("transform", function(d) {
						const thisStandard = chartState.selectedPartner === "total" ? d.standard :
							d["standard-" + chartState.selectedPartner];
						const thisPadding = xScaleLollipop(d[chartState.selectedPartner]) - xScaleLollipop(thisStandard) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + xScaleLollipop(thisStandard) + "," +
							((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
					});

				cbpfGroup.select(".pbialpCbpfLabel")
					.transition(transition)
					.attr("x", function(d) {
						return xScaleLollipop(d[chartState.selectedPartner]) + lollipopPanel.labelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const thisStandard = chartState.selectedPartner === "total" ? d.standard :
							d["standard-" + chartState.selectedPartner];
						const thisPercentage = thisStandard / d[chartState.selectedPartner];
						const percentStandard = " (" + formatPercent(thisPercentage === thisPercentage ? thisPercentage : 0) + " std)";
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedPartner]);
						return function(t) {
							d3.select(node).text(formatNumberSI(i(t)))
								.append("tspan")
								.attr("class", "pbialpCbpfLabelPercentage")
								.attr("dy", "-0.5px")
								.text(percentStandard);
						};
					});

				const cbpfTooltipRectangle = cbpfGroup.select(".pbialpCbpfTooltipRectangle");

				cbpfTooltipRectangle.on("mouseover", mouseoverTooltipRectangle)
					.on("mousemove", mousemoveTooltipRectangle)
					.on("mouseout", mouseoutTooltipRectangle)
					.on("click", clickTooltipRectangle);

				xAxisLollipop.tickSizeInner(-(lollipopGroupHeight * cbpfsArray.length));

				groupYAxisLollipop.transition(transition)
					.attr("transform", "translate(" + lollipopPanel.padding[3] + ",0)")
					.call(yAxisLollipop);

				groupXAxisLollipop.transition(transition)
					.call(xAxisLollipop);

				groupXAxisLollipop.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				if (!chartState.selectedCbpfs.length) {
					cbpfGroup.style("opacity", 1);
					groupYAxisLollipop.selectAll(".tick").style("opacity", 1);
				} else {
					cbpfGroup.style("opacity", function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1 ? 1 : fadeOpacity;
					});
					groupYAxisLollipop.selectAll(".tick")
						.style("opacity", function(d) {
							return chartState.selectedCbpfs.indexOf(d) > -1 ? 1 : fadeOpacity;
						});
				};


				function mouseoverTooltipRectangle(datum) {

					if (!datum.clicked) {
						chartState.selectedCbpfs.push(datum.cbpf);
					};

					cbpfGroup.style("opacity", function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1 ? 1 : fadeOpacity;
					});

					groupYAxisLollipop.selectAll(".tick")
						.style("opacity", function(d) {
							return chartState.selectedCbpfs.indexOf(d) > -1 ? 1 : fadeOpacity;
						});

					highlightParallel(data);

					const thisTotal = chartState.selectedPartner;

					const thisStandard = chartState.selectedPartner === "total" ?
						"standard" :
						"standard-" + chartState.selectedPartner;

					const thisReserve = chartState.selectedPartner === "total" ?
						"reserve" :
						"reserve-" + chartState.selectedPartner;

					const thisUnderApproval = chartState.selectedPartner === "total" ?
						"underApproval" :
						"underApproval-" + chartState.selectedPartner;

					const mouse = d3.mouse(lollipopPanel.main.node());

					if (datum[thisTotal]) {
						tooltip.style("display", "block")
							.html("<strong><span class='allocationColorDarkerHTMLcolor'>" + datum.cbpf +
								"</span></strong> (" + (chartState.selectedPartner === "total" ? "All Partners" : chartState.selectedPartner) +
								")<br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
								lollipopTooltipWidth + "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>$" + formatMoney2Decimals(datum[thisTotal]) +
								"</div></div>Allocation Modalities:<div id=pbialpLollipopTooltipBar></div><div style='margin:0px;display:flex;flex-wrap:wrap;width:" +
								lollipopTooltipWidth + "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard <span style='color: #888;'>(" +
								(formatPercent(datum[thisStandard] / datum[thisTotal])) + ")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='allocationColorDarkerHTMLcolor'>$" + formatMoney2Decimals(datum[thisStandard]) +
								"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve <span style='color: #888;'>(" + (formatPercent(datum[thisReserve] / datum[thisTotal])) +
								")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='allocationColorHTMLcolor'>$" + formatMoney2Decimals(datum[thisReserve]) +
								"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Under approval:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='pbialpUnderApprovalHTMLClass'>$" + formatMoney2Decimals(datum[thisUnderApproval]) +
								"</span></div></div><div style='margin-top:6px;'>Allocations by Partner Type and Modality:<div><div id=pbialpLollipopTooltipChart></div>");

						createTooltipBar(datum, "pbialpLollipopTooltipBar", lollipopTooltipWidth, thisTotal, thisStandard, thisReserve);

						if (chartState.selectedPartner === "total") {
							createTooltipChartGB(datum.parallelData);
						} else {
							createTooltipChartDC(datum.parallelData);
						};
					} else {
						tooltip.style("display", "block")
							.html("<strong><span class='allocationColorDarkerHTMLcolor'>" + datum.cbpf +
								"</span></strong><br style='line-height:170%;'/>Partner: <strong>" + (chartState.selectedPartner === "total" ? "All Partners" : chartState.selectedPartner) +
								"</strong><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
								(lollipopTooltipWidth * 0.75) + "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='allocationColorDarkerHTMLcolor'>$" + formatMoney2Decimals(datum[thisTotal]) +
								"</span></div></div>");
					};

					const tooltipSize = tooltip.node().getBoundingClientRect();

					localVariable.set(this, tooltipSize);

					tooltip.style("left", mouse[0] < tooltipSize.width / 2 ?
							d3.event.pageX - mouse[0] + "px" :
							mouse[0] > (lollipopPanel.width - tooltipSize.width / 2) ?
							d3.event.pageX - (mouse[0] - (lollipopPanel.width - tooltipSize.width)) + "px" :
							d3.event.pageX - (tooltipSize.width / 2) + "px")
						.style("top", mouse[1] > (parallelPanel.height + padding[3]) - tooltipSize.height + lollipopGroupHeight ?
							d3.event.pageY - tooltipSize.height - lollipopGroupHeight + "px" :
							d3.event.pageY + lollipopGroupHeight + "px");

				};

				function mousemoveTooltipRectangle(datum) {

					if (!localVariable.get(this)) return;

					const mouse = d3.mouse(lollipopPanel.main.node());

					const tooltipSize = localVariable.get(this);

					tooltip.style("left", mouse[0] < tooltipSize.width / 2 ?
							d3.event.pageX - mouse[0] + "px" :
							mouse[0] > (lollipopPanel.width - tooltipSize.width / 2) ?
							d3.event.pageX - (mouse[0] - (lollipopPanel.width - tooltipSize.width)) + "px" :
							d3.event.pageX - (tooltipSize.width / 2) + "px")
						.style("top", mouse[1] > (parallelPanel.height + padding[3]) - tooltipSize.height + lollipopGroupHeight ?
							d3.event.pageY - tooltipSize.height - lollipopGroupHeight + "px" :
							d3.event.pageY + lollipopGroupHeight + "px");

				};

				function mouseoutTooltipRectangle(datum) {

					if (!datum.clicked) {
						const index = chartState.selectedCbpfs.indexOf(datum.cbpf);
						if (index > -1) {
							chartState.selectedCbpfs.splice(index, 1);
						};
					};

					cbpfGroup.style("opacity", function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1 ? 1 : fadeOpacity;
					});

					groupYAxisLollipop.selectAll(".tick")
						.style("opacity", function(d) {
							return chartState.selectedCbpfs.indexOf(d) > -1 ? 1 : fadeOpacity;
						});

					const someClicked = data.some(function(d) {
						return d.clicked;
					});

					if (!someClicked) {
						cbpfGroup.style("opacity", 1);

						groupYAxisLollipop.selectAll(".tick")
							.style("opacity", 1);
					};

					parallelPanel.main.select(".pbialpCbpfParallelGroupAverage").raise();

					highlightParallel(data);

					tooltip.style("display", "none");

				};

				function clickTooltipRectangle(datum) {

					datum.clicked = !datum.clicked;

					if (!datum.clicked) {
						const index = chartState.selectedCbpfs.indexOf(datum.cbpf);
						chartState.selectedCbpfs.splice(index, 1);
					} else {
						if (chartState.selectedCbpfs.indexOf(datum.cbpf) === -1) {
							chartState.selectedCbpfs.push(datum.cbpf);
						}
					};

					cbpfGroup.each(function(d) {
						d3.select(this).selectAll("rect, circle")
							.classed("allocationColorFill", !d.clicked)
							.classed("allocationColorDarkerFill", d.clicked);
					});

					highlightParallel(data);

				};

				//end of createLollipopChannel
			};

			function createParallelPanel(cbpfsArray) {

				averageData = [];

				partnerList.forEach(function(d) {
					averageData.push({
						partner: d,
						percentage: d3.mean(cbpfsArray.map(function(e) {
							return e.parallelData.find(function(f) {
								return f.partner === d;
							}).percentage;
						}))
					});
				});

				const transition = setTransition(duration);

				const parallelPanelTitle = parallelPanel.main.selectAll(".pbialpParallelPanelTitle")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbialpParallelPanelTitle")
					.attr("y", parallelPanel.padding[0] - titlePadding)
					.attr("x", parallelPanel.padding[3])
					.text("Allocations by Partner Type");

				const percentNumbersGroups = parallelPanel.main.selectAll(".pbialpPercentNumbersGroups")
					.data(partnerList)
					.enter()
					.append("g")
					.attr("class", "pbialpPercentNumbersGroups")
					.attr("transform", function(d) {
						return "translate(" + xScaleParallel(d) + ",0)"
					});

				percentNumbersGroups.append("text")
					.attr("class", "pbialpPercentNumbersText")
					.attr("y", parallelPanel.padding[0] - percentNumberPadding)
					.attr("x", 2)
					.attr("text-anchor", "middle")
					.text("100%");

				percentNumbersGroups.append("text")
					.attr("class", "pbialpPercentNumbersText")
					.attr("y", parallelPanelHeight - parallelPanel.padding[2] + 14)
					.attr("x", 4)
					.attr("text-anchor", "middle")
					.text("0%");

				let cbpfParallelGroup = parallelPanel.main.selectAll(".pbialpCbpfParallelGroup")
					.data(cbpfsArray, function(d) {
						return d.cbpf;
					});

				const cbpfParallelGroupExit = cbpfParallelGroup.exit()
					.remove();

				const cbpfParallelGroupEnter = cbpfParallelGroup.enter()
					.append("g")
					.attr("class", "pbialpCbpfParallelGroup");

				const parallelLine = cbpfParallelGroupEnter.append("path")
					.attr("class", "pbialpUnselectedPath")
					.datum(function(d) {
						return d.parallelData
					})
					.style("stroke-width", "1px")
					.style("fill", "none")
					.attr("d", function(d) {
						return lineGeneratorBase(d);
					});

				const parallelCircles = cbpfParallelGroupEnter.selectAll(null)
					.data(function(d) {
						return d.parallelData;
					}, function(d) {
						return d.partner;
					})
					.enter()
					.append("circle")
					.attr("class", "pbialpUnselectedCircle")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", yScaleParallel(0));

				cbpfParallelGroup = cbpfParallelGroupEnter.merge(cbpfParallelGroup);

				cbpfParallelGroup.select("path")
					.datum(function(d) {
						return d.parallelData
					})
					.transition(transition)
					.attr("d", function(d) {
						return lineGenerator(d)
					});

				cbpfParallelGroup.selectAll("circle")
					.data(function(d) {
						return d.parallelData;
					}, function(d) {
						return d.partner;
					})
					.transition(transition)
					.attr("cx", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", function(d) {
						return yScaleParallel(d.percentage);
					});

				let cbpfParallelGroupAverage = parallelPanel.main.selectAll(".pbialpCbpfParallelGroupAverage")
					.data([averageData]);

				const cbpfParallelGroupAverageEnter = cbpfParallelGroupAverage.enter()
					.append("g")
					.attr("class", "pbialpCbpfParallelGroupAverage")
					.attr("pointer-events", "none")
					.style("opacity", showAverage ? 1 : 0);

				const parallelLineAverage = cbpfParallelGroupAverageEnter.append("path")
					.attr("class", "pbialpCbpfParallelLineAverage")
					.datum(function(d) {
						return d
					})
					.style("stroke", "darkslategray")
					.style("stroke-width", "1px")
					.style("stroke-dasharray", "2,2")
					.style("fill", "none")
					.attr("d", function(d) {
						return lineGeneratorBase(d);
					});

				const parallelCirclesAverage = cbpfParallelGroupAverageEnter.selectAll(null)
					.data(function(d) {
						return d;
					}, function(d) {
						return d.partner;
					})
					.enter()
					.append("circle")
					.attr("class", "pbialpParallelCircleAverage")
					.attr("r", circleRadius)
					.attr("cx", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", yScaleParallel(0))
					.style("fill", "darkslategray");

				const averageText = cbpfParallelGroupAverageEnter.append("text")
					.datum(function(d) {
						return d
					})
					.attr("class", "pbialpCbpfParallelText")
					.attr("text-anchor", "end")
					.attr("x", xScaleParallel(partnerList[0]) - 6)
					.attr("y", yScaleParallel(0))
					.text("Avg");

				cbpfParallelGroupAverage = cbpfParallelGroupAverageEnter.merge(cbpfParallelGroupAverage);

				cbpfParallelGroupAverage.raise();

				cbpfParallelGroupAverage.select("path")
					.datum(function(d) {
						return d;
					})
					.transition(transition)
					.attr("d", function(d) {
						return lineGenerator(d)
					});

				cbpfParallelGroupAverage.selectAll("circle")
					.data(function(d) {
						return d;
					}, function(d) {
						return d.partner;
					})
					.transition(transition)
					.attr("cx", function(d) {
						return xScaleParallel(d.partner);
					})
					.attr("cy", function(d) {
						return yScaleParallel(d.percentage);
					});

				cbpfParallelGroupAverage.select("text")
					.datum(function(d) {
						return d
					})
					.transition(transition)
					.attr("y", function(d) {
						const firstParter = d.find(function(e) {
							return e.partner === partnerList[0]
						});
						return yScaleParallel(firstParter.percentage) + 2
					});

				groupXAxisParallel.call(xAxisParallel)
					.selectAll(".tick text")
					.call(wrapText);

				//end of createParallelPanel
			};

			function createBottomButtons() {

				const showAverageGroup = svg.append("g")
					.attr("class", "pbialpShowAverageGroup")
					.attr("transform", "translate(" + (width - padding[1] - showAverageGroupPadding) + "," +
						(height - padding[2] / 2) + ")")
					.style("cursor", "pointer")
					.attr("pointer-events", "all");

				const outerCircle = showAverageGroup.append("circle")
					.attr("r", 6)
					.attr("cy", 2)
					.attr("fill", "white")
					.attr("stroke", "darkslategray");

				const innerCircle = showAverageGroup.append("circle")
					.attr("r", 4)
					.attr("cy", 2)
					.attr("fill", showAverage ? "darkslategray" : "white");

				const showAverageText = showAverageGroup.append("text")
					.attr("class", "pbialpAverageTextControl")
					.attr("x", 10)
					.text("Show Average")
					.attr("y", 5);

				const downloadGroup = svg.append("g")
					.attr("class", "pbialpDownloadGroup")
					.attr("transform", "translate(" + (width - padding[1] - excelIconSize - 6) + "," +
						(height - padding[2] / 2) + ")");

				const downloadText = downloadGroup.append("text")
					.attr("class", "pbialpDownloadText")
					.attr("x", -2)
					.attr("text-anchor", "end")
					.style("cursor", "pointer")
					.text("Save data")
					.attr("y", 5);

				const excelIcon = downloadGroup.append("image")
					.style("cursor", "pointer")
					.attr("x", 2)
					.attr("width", excelIconSize + "px")
					.attr("height", excelIconSize + "px")
					.attr("xlink:href", excelIconPath)
					.attr("y", (padding[3] - excelIconSize) / 2);

				showAverageGroup.on("click", function() {

					showAverage = !showAverage;

					innerCircle.attr("fill", showAverage ? "darkslategray" : "white");

					parallelPanel.main.select(".pbialpCbpfParallelGroupAverage")
						.style("opacity", showAverage ? 1 : 0);

				});

				downloadGroup.on("click", function() {

					const csv = createCSV(data);

					const fileName = "Allocations" + chartState.selectedYear + ".csv";

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

				//end of createBottomButtons
			};

			function highlightParallel(data) {

				const transition = setTransition(duration);

				const selectedData = data.filter(function(d) {
					return chartState.selectedCbpfs.indexOf(d.cbpf) > -1
				});

				const selectedGroups = parallelPanel.main.selectAll(".pbialpCbpfParallelGroup")
					.filter(function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) > -1;
					});

				const unselectedGroups = parallelPanel.main.selectAll(".pbialpCbpfParallelGroup")
					.filter(function(d) {
						return chartState.selectedCbpfs.indexOf(d.cbpf) === -1;
					});

				selectedGroups.select("path")
					.attr("class", "allocationColorStroke")
					.style("stroke-width", "2px");

				selectedGroups.selectAll("circle")
					.attr("class", "allocationColorFill")
					.on("mouseover", mouseOverSelectedCircles)
					.on("mouseout", mouseOutSelectedCircles);

				selectedGroups.raise();

				unselectedGroups.select("path")
					.attr("class", "pbialpUnselectedPath")
					.style("stroke-width", "1px");

				unselectedGroups.selectAll("circle")
					.attr("class", "pbialpUnselectedCircle")
					.on("mouseover", null)
					.on("mouseout", null);

				let labelsGroup = parallelPanel.main.selectAll(".pbialpLabelsGroup")
					.data(selectedData, function(d) {
						return d.cbpf;
					});

				const labelsGroupExit = labelsGroup.exit().remove();

				const labelsGroupEnter = labelsGroup.enter()
					.append("g")
					.attr("class", "pbialpLabelsGroup");

				labelsGroupEnter.attr("transform", function(d) {
					const lastParter = d.parallelData.find(function(e) {
						return e.partner === partnerList[partnerList.length - 1];
					});
					d.yPos = yScaleParallel(lastParter.percentage);
					return "translate(" + (xScaleParallel(partnerList[partnerList.length - 1]) + selectedCbpfLabelPadding) + "," +
						d.yPos + ")";
				});

				const labelText = labelsGroupEnter.append("text")
					.attr("class", "pbialpLabelText")
					.attr("y", 4)
					.text(function(d) {
						return d.cbpf;
					});

				labelsGroup = labelsGroupEnter.merge(labelsGroup);

				labelsGroup.transition(transition)
					.attr("transform", function(d) {
						const lastParter = d.parallelData.find(function(e) {
							return e.partner === partnerList[partnerList.length - 1];
						});
						d.yPos = yScaleParallel(lastParter.percentage);
						return "translate(" + (xScaleParallel(partnerList[partnerList.length - 1]) + selectedCbpfLabelPadding) + "," +
							d.yPos + ")";
					});

				//end of highlightParallel
			};

			function clickButtonsRects(d) {

				chartState.selectedYear = d;

				d3.selectAll(".pbialpbuttonsRects")
					.style("stroke", function(e) {
						return e === chartState.selectedYear ? "#444" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedYear ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbialpbuttonsText")
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "#444" : "#888"
					});

				data = processData(rawData);

				const allCbpfs = data.map(function(d) {
					return d.cbpf
				});

				chartState.selectedCbpfs = chartState.selectedCbpfs.filter(function(d) {
					return allCbpfs.indexOf(d) > -1;
				});

				data.forEach(function(d) {
					if (chartState.selectedCbpfs.indexOf(d.cbpf) > -1) {
						d.clicked = true;
					};
				});

				recalculateAndResize();

				createTopPanel(data);

				repositionButtonsPanel();

				createLollipopPanel(data);

				createParallelPanel(data);

				highlightParallel(data);

				//end of clickButtonsRects
			};

			function clickButtonsPartnersRects(d) {

				chartState.selectedPartner = d;

				d3.selectAll(".pbialpbuttonsPartnersRects")
					.style("stroke", function(e) {
						return e === chartState.selectedPartner ? "#444" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedPartner ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedPartner ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbialpbuttonsPartnersText")
					.style("fill", function(e) {
						return e === chartState.selectedPartner ? "#444" : "#888"
					});

				createTopPanel(data);

				setDomains(data, chartState.selectedPartner);

				createLollipopPanel(data);

				//end of clickButtonsContributionsRects
			};

			function mouseOverTopPanel() {

				const mouse = d3.mouse(this);

				tooltip.style("display", "block")
					.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:270px;'><div style='display:flex;flex:0 54%;'>Allocations:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='allocationColorHTMLcolor'>$" + formatMoney2Decimals(partnersTotals.total) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Under approval <span style='color: #888;'>(" + (formatPercent(partnersUnderApproval.total / (partnersTotals.total + partnersUnderApproval.total))) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='allocationColorHTMLcolor'>$" + formatMoney2Decimals(partnersUnderApproval.total) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='allocationColorHTMLcolor'>$" + formatMoney2Decimals(partnersTotals.total + partnersUnderApproval.total) + "</span></div></div>");

				const tooltipSize = tooltip.node().getBoundingClientRect();

				localVariable.set(this, tooltipSize);

				tooltip.style("top", mouse[1] < tooltipSize.height / 2 ?
						d3.event.pageY - mouse[1] + "px" :
						mouse[1] > topPanel.height - tooltipSize.height / 2 ?
						d3.event.pageY - (mouse[1] - (topPanel.height - tooltipSize.height)) + "px" :
						d3.event.pageY - (tooltipSize.height / 2) + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						d3.event.pageX + 14 + "px" :
						d3.event.pageX - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseMoveTopPanel() {

				const mouse = d3.mouse(this);

				const tooltipSize = localVariable.get(this);

				tooltip.style("top", mouse[1] < tooltipSize.height / 2 ?
						d3.event.pageY - mouse[1] + "px" :
						mouse[1] > topPanel.height - tooltipSize.height / 2 ?
						d3.event.pageY - (mouse[1] - (topPanel.height - tooltipSize.height)) + "px" :
						d3.event.pageY - (tooltipSize.height / 2) + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						d3.event.pageX + 14 + "px" :
						d3.event.pageX - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseOutTopPanel() {
				tooltip.style("display", "none");
			};

			function mouseOverButtonsRects() {
				d3.select(this).style("fill", "whitesmoke");
			};

			function mouseOutButtonsRects(d) {
				if (d === chartState.selectedYear) return;
				d3.select(this).style("fill", "white");
			};

			function mouseOverButtonsPartnersRects() {
				d3.select(this).style("fill", "whitesmoke");
			};

			function mouseOutButtonsPartnersRects(d) {
				if (d === chartState.selectedPartner) return;
				d3.select(this).style("fill", "white");
			};

			function mouseOverSelectedCircles(datum) {

				const mouse = d3.mouse(parallelPanel.main.node());

				const thisCbpf = d3.select(this.parentNode).datum().cbpf;

				if (datum.value) {

					tooltip.style("display", "block")
						.html("<strong><span class='allocationColorDarkerHTMLcolor'>" + thisCbpf +
							"</span></strong><br style='line-height:170%;'/>Partner: <strong>" + datum.partner +
							"</strong><br style='line-height:170%;'/><div>Allocations: $" +
							formatMoney2Decimals(datum.value) + "<br>(" + (~~(datum.percentage * 10000) / 100) +
							"% of total)</div><br style='line-height:170%;'/>Allocation modalities for this partner:<div id=pbialpParallelTooltipBar></div><div style='margin:0px;display:flex;flex-wrap:wrap;width:" +
							parallelTooltipWidth + "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard <span style='color: #888;'>(" +
							(formatPercent(datum.standard / datum.value)) + ")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='allocationColorDarkerHTMLcolor'>$" + formatMoney2Decimals(datum.standard) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve <span style='color: #888;'>(" + (formatPercent(datum.reserve / datum.value)) +
							")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='allocationColorHTMLcolor'>$" + formatMoney2Decimals(datum.reserve) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;margin-top:8px;'>Under approval:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;margin-top:8px;'>$" + formatMoney2Decimals(datum.underApproval) +
							"</div></div>");

					createTooltipBar(datum, "pbialpParallelTooltipBar", parallelTooltipWidth, "value", "standard", "reserve");

				} else {
					tooltip.style("display", "block")
						.html("<strong><span class='allocationColorDarkerHTMLcolor'>" + thisCbpf +
							"</span></strong><br style='line-height:170%;'/>Partner: " + datum.partner +
							"<br style='line-height:170%;'/>Allocations: $" +
							formatMoney2Decimals(datum.value));
				};

				const tooltipSize = tooltip.node().getBoundingClientRect();

				tooltip.style("left", mouse[0] > parallelPanel.width - tooltipSize.width / 2 ?
						d3.event.pageX - (mouse[0] - (parallelPanel.width - tooltipSize.width)) + "px" :
						d3.event.pageX - (tooltipSize.width / 2) + "px")
					.style("top", mouse[1] > parallelPanel.height - tooltipSize.height ?
						d3.event.pageY - tooltipSize.height - 16 + "px" :
						d3.event.pageY + 18 + "px");

				//end of mouseOverSelectedCircles
			};

			function mouseOutSelectedCircles() {
				tooltip.style("display", "none");
			};

			function createTooltipBar(datum, container, containerWidth, total, property1, property2) {

				const containerDiv = d3.select("#" + container);

				containerDiv.style("margin-bottom", "4px")
					.style("margin-top", "4px")
					.style("width", containerWidth + "px");

				const scaleDiv = d3.scaleLinear()
					.domain([0, datum[total]])
					.range([0, containerWidth]);

				const div1 = containerDiv.append("div")
					.style("float", "left")
					.classed("allocationColorDarkerHTMLbc", true)
					.style("height", "14px")
					.style("width", "0px")
					.style("border-right", scaleDiv(datum[property1]) < 1 ? "0px solid white" : "1px solid white");

				div1.transition()
					.duration(shortDuration)
					.style("width", scaleDiv(datum[property1]) + "px");

				const div2 = containerDiv.append("div")
					.classed("allocationColorHTMLbc", true)
					.style("margin-left", "0px")
					.style("height", "14px")
					.style("width", "0px");

				div2.transition()
					.duration(shortDuration)
					.style("margin-left", scaleDiv(datum[property1]) + 1 + "px")
					.style("width", scaleDiv(datum[property2]) + "px");

				//end of createAllocationsTooltipBar
			};

			function createTooltipChartGB(datum) {

				const tooltipSvgWidth = lollipopTooltipWidth,
					tooltipSvgHeight = 100,
					tooltipSvgpadding = [8, 130, 16, 4];

				const modalities = ["standard", "reserve", "underApproval"];

				const tooltipSvg = d3.select("#pbialpLollipopTooltipChart")
					.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight);

				const xScaleOuter = d3.scaleBand()
					.range([tooltipSvgpadding[3], tooltipSvgWidth - tooltipSvgpadding[1]])
					.domain(partnerList)
					.paddingOuter(0)
					.paddingInner(0.2);

				const xScaleInner = d3.scaleBand()
					.range([0, xScaleOuter.bandwidth()])
					.domain(modalities)
					.paddingOuter(0.1)
					.paddingInner(0.2);

				const yScale = d3.scaleLinear()
					.range([tooltipSvgHeight - tooltipSvgpadding[2], tooltipSvgpadding[0]])
					.domain([0, d3.max(datum, function(d) {
						return d3.max(modalities, function(e) {
							return d[e];
						})
					})]);

				const classScale = d3.scaleOrdinal()
					.domain(modalities)
					.range(["allocationColorDarkerFill", "allocationColorFill", "pbialpUnderApprovalClass"]);

				const axisNameScale = d3.scaleOrdinal()
					.domain(modalities)
					.range(["Standard", "Reserve", "Under Approval"]);

				const tooltipYAxis = d3.axisRight(yScale)
					.ticks(3, formatSIaxes)
					.tickSizeInner(-(tooltipSvgWidth - tooltipSvgpadding[1] - tooltipSvgpadding[3]));

				const tooltipGY = tooltipSvg.append("g")
					.attr("class", "pbialpTooltipGroupedBarYAxis")
					.attr("transform", "translate(" + (tooltipSvgWidth - tooltipSvgpadding[1]) + ",0)")
					.call(tooltipYAxis);

				tooltipGY.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				const groups = tooltipSvg.selectAll(null)
					.data(datum)
					.enter()
					.append("g")
					.attr("transform", function(d) {
						return "translate(" + xScaleOuter(d.partner) + ",0)";
					});

				const bars = groups.selectAll(null)
					.data(function(d) {
						return modalities.map(function(e) {
							return {
								key: e,
								value: d[e]
							};
						});
					})
					.enter()
					.append("rect")
					.attr("x", function(d) {
						return xScaleInner(d.key)
					})
					.attr("width", xScaleInner.bandwidth())
					.attr("class", function(d) {
						return classScale(d.key)
					})
					.attr("y", yScale(0))
					.attr("height", 0)
					.transition()
					.duration(shortDuration)
					.attr("y", function(d) {
						return yScale(d.value);
					})
					.attr("height", function(d) {
						return tooltipSvgHeight - tooltipSvgpadding[2] - yScale(d.value);
					});

				const baselines = groups.append("line")
					.attr("y1", tooltipSvgHeight - tooltipSvgpadding[2])
					.attr("y2", tooltipSvgHeight - tooltipSvgpadding[2])
					.attr("x1", 0)
					.attr("x2", xScaleOuter.bandwidth())
					.style("stroke-width", "1px")
					.style("stroke", "darkslategray");

				const legend = tooltipSvg.selectAll(null)
					.data(modalities)
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(" + (tooltipSvgWidth - tooltipSvgpadding[1] + 40) + "," + (15 + i * 20) + ")";
					});

				legend.append("rect")
					.attr("width", 10)
					.attr("height", 10)
					.style("stroke", "darkslategray")
					.attr("class", function(d) {
						return classScale(d)
					});

				legend.append("text")
					.attr("y", 9)
					.attr("x", 14)
					.attr("class", "pbialpTooltipLegend")
					.text(function(d) {
						return axisNameScale(d);
					});

				const tooltipXAxis = d3.axisBottom(xScaleOuter)
					.tickPadding(0)
					.tickFormat(function(d) {
						return partnersTextScale(d)
					});

				const tooltipGX = tooltipSvg.append("g")
					.attr("class", "pbialpTooltipGroupedBarXAxis")
					.attr("transform", "translate(0," + (tooltipSvgHeight - tooltipSvgpadding[2]) + ")")
					.call(tooltipXAxis);

				//end of createTooltipChart
			};

			function createTooltipChartDC(datum) {

				const tooltipSvgWidth = lollipopTooltipWidth,
					tooltipSvgHeight = 100,
					tooltipSvgpadding = [4, 110, 16, 4],
					donutRadius = (tooltipSvgHeight - tooltipSvgpadding[0] - tooltipSvgpadding[2]) / 2;

				const pie = d3.pie()
					.sort(function(a, b) {
						if (a.partner === chartState.selectedPartner) {
							return -1
						} else if (b.partner === chartState.selectedPartner) {
							return 1
						} else {
							return b.value - a.value;
						};
					})
					.value(function(d) {
						return d.value;
					});

				const arcSel = d3.arc()
					.outerRadius(donutRadius)
					.innerRadius(donutRadius - 20);

				const arc = d3.arc()
					.outerRadius(donutRadius - 4)
					.innerRadius(donutRadius - 16);

				const modalities = ["standard", "reserve", "underApproval"];

				const donutData = [];

				modalities.forEach(function(d) {
					donutData.push({
						modality: d,
						values: datum.map(function(e) {
							return {
								partner: e.partner,
								value: e[d]
							};
						}).filter(function(e) {
							return e.value;
						})
					});
				});

				const tooltipSvg = d3.select("#pbialpLollipopTooltipChart")
					.append("svg")
					.attr("width", tooltipSvgWidth)
					.attr("height", tooltipSvgHeight);

				const xScaleTooltip = d3.scalePoint()
					.range([tooltipSvgpadding[3], tooltipSvgWidth - tooltipSvgpadding[1]])
					.domain(modalities)
					.padding(0.5);

				const tooltipGroups = tooltipSvg.selectAll(null)
					.data(donutData)
					.enter()
					.append("g")
					.attr("transform", function(d) {
						return "translate(" + xScaleTooltip(d.modality) + "," +
							(tooltipSvgpadding[0] + (tooltipSvgHeight - tooltipSvgpadding[2]) / 2) + ")";
					});

				const donutSlice = tooltipGroups.selectAll(null)
					.data(function(d) {
						return pie(d.values)
					})
					.enter()
					.append("g");

				const donutPath = donutSlice.append("path")
					.style("stroke", "#f1f1f1")
					.attr("class", function(d) {
						return partnersColorsScale(d.data.partner);
					})
					.transition()
					.duration(shortDuration)
					.attrTween("d", function(d) {
						d.innerRadius = 0;
						var i = d3.interpolate({
							startAngle: 0,
							endAngle: 0
						}, d);
						if (d.data.partner === chartState.selectedPartner) {
							return function(t) {
								return arcSel(i(t));
							};
						} else {
							return function(t) {
								return arc(i(t));
							};
						}
					});

				const legend = tooltipSvg.selectAll(null)
					.data(partnerList)
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(" + (tooltipSvgWidth - tooltipSvgpadding[1] + 25) + "," + (10 + i * 20) + ")";
					});

				legend.append("rect")
					.attr("width", 10)
					.attr("height", 10)
					.style("stroke", "darkslategray")
					.attr("class", function(d) {
						return partnersColorsScale(d);
					});

				legend.append("text")
					.attr("y", 9)
					.attr("x", 14)
					.attr("class", "pbialpTooltipLegendDonut")
					.text(function(d) {
						const bullet = d === chartState.selectedPartner ? " \u2190" : "";
						return partnersTextScale(d) + bullet;
					});

				const tooltipAxis = d3.axisBottom(xScaleTooltip)
					.tickPadding(0);

				const tooltipAxisGroup = tooltipSvg.append("g")
					.attr("class", "pbialpTooltipDonutXAxis")
					.attr("transform", "translate(0," + (tooltipSvgHeight - tooltipSvgpadding[2]) + ")")
					.call(tooltipAxis);

				//end of createTooltipChart
			};

			function recalculateAndResize() {

				resizeSVGHeight(data.length);

				const biggestLabelLengthCbpfs = calculateBiggestLabel(data);

				setRanges(biggestLabelLengthCbpfs);

				setDomains(data, chartState.selectedPartner);

				//end of recalculateAndResize
			};

			function repositionButtonsPanel() {

				const transition = setTransition(duration);

				buttonPanel.main.select(".pbialpClipPathGroup")
					.transition(transition)
					.attr("transform", "translate(" + (topPanel.moneyBagPadding + buttonPanel.arrowPadding) + ",0)");

				buttonPanel.main.select(".pbialpLeftArrowGroup")
					.transition(transition)
					.attr("transform", "translate(" + topPanel.moneyBagPadding + ",0)");

				buttonPanel.main.select(".pbialpRightArrowGroup")
					.transition(transition)
					.attr("transform", "translate(" + (topPanel.moneyBagPadding + buttonPanel.arrowPadding +
						(buttonsNumber * buttonPanel.buttonWidth)) + ",0)");

				buttonPanel.main.select(".pbialpbuttonsPartnersGroup")
					.transition(transition)
					.attr("transform", "translate(" + (topPanel.moneyBagPadding + (4 * buttonPanel.arrowPadding) + (buttonsNumber * buttonPanel.buttonWidth)) +
						",0)")

				//end of repositionButtonsPanel
			};

			//end of draw
		};

		function resizeSVGHeight(cbpfsLength) {

			lollipopPanel.height = (cbpfsLength * lollipopGroupHeight) + lollipopPanel.padding[0] + lollipopPanel.padding[2];

			lollipopPanelClip.attr("height", lollipopPanel.height);

			height = padding[0] + padding[2] + topPanelHeight + buttonPanelHeight +
				Math.max(lollipopPanel.height, parallelPanelHeight) + (2 * panelHorizontalPadding);

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			};

			svg.transition()
				.duration(shortDuration)
				.attr("viewBox", "0 0 " + width + " " + height);

			//end of resizeSvg
		};

		function calculateBiggestLabel(dataArray) {

			const allTexts = dataArray.map(function(d) {
				return d.cbpf
			}).sort(function(a, b) {
				return b.length - a.length;
			}).slice(0, 5);

			const textSizeArray = [];

			allTexts.forEach(function(d) {

				const fakeText = svg.append("text")
					.attr("class", "pbialpgroupYAxisFake")
					.style("opacity", 0)
					.text(d);

				const fakeTextLength = Math.ceil(fakeText.node().getComputedTextLength());

				textSizeArray.push(fakeTextLength);

				fakeText.remove();

			});

			return d3.max(textSizeArray);

			//end of calculateBiggestLabel
		};

		function setDomains(cbpfs, property) {

			const maxXValue = d3.max(cbpfs, function(d) {
				return d[property]
			});

			xScaleLollipop.domain([0, ~~(maxXValue * xScaleLollipopMargin)]);

		};

		function setRanges(labelSizeCbpfs) {

			const labelSize = labelSizeCbpfs + yAxisLollipop.tickPadding() + yAxisLollipop.tickSizeInner();

			topPanel.moneyBagPadding = labelSize;

			lollipopPanel.padding[3] = labelSize;

			xScaleLollipop.range([lollipopPanel.padding[3], lollipopPanel.width - lollipopPanel.padding[1]]);

			yScaleLollipop.range([lollipopPanel.padding[0], lollipopPanel.height - lollipopPanel.padding[2]]);

		};

		function translateAxes() {
			groupYAxisLollipop.attr("transform", "translate(" + lollipopPanel.padding[3] + ",0)");
		};

		function setTransition(duration) {
			return d3.transition().duration(duration);
		};

		function parseTransform(translate) {

			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

			group.setAttributeNS(null, "transform", translate);

			const matrix = group.transform.baseVal.consolidate().matrix;

			return [matrix.e, matrix.f];

		};

		function processData(rawData) {

			const aggregatedAllocations = [];

			const temporarySet = [];

			const filteredData = rawData.filter(function(d) {
				return +d.AllocationYear === chartState.selectedYear;
			});

			filteredData.forEach(function(row) {

				if (row.OrganizationType === "Others") {
					row.OrganizationType = "Red Cross/Crescent Movement";
				};

				if (temporarySet.indexOf(row.PooledFundName) > -1) {

					const tempObject = aggregatedAllocations.find(function(d) {
						return d.cbpf === row.PooledFundName
					});

					tempObject.total += +row.ApprovedBudget;
					tempObject.standard += +row.ApprovedStandardBudget;
					tempObject.reserve += +row.ApprovedReserveBudget;
					tempObject.underApproval += +row.PipelineBudget;
					tempObject[row.OrganizationType] += +row.ApprovedBudget;
					tempObject["underApproval-" + row.OrganizationType] += +row.PipelineBudget;
					tempObject["reserve-" + row.OrganizationType] += +row.ApprovedReserveBudget;
					tempObject["standard-" + row.OrganizationType] += +row.ApprovedStandardBudget;

				} else {

					const temporaryOriginalObject = {
						clicked: false,
						cbpf: row.PooledFundName,
						total: +row.ApprovedBudget,
						standard: +row.ApprovedStandardBudget,
						reserve: +row.ApprovedReserveBudget,
						underApproval: +row.PipelineBudget,
						"International NGO": 0,
						"National NGO": 0,
						"UN Agency": 0,
						"Red Cross/Crescent Movement": 0,
						"underApproval-International NGO": 0,
						"underApproval-National NGO": 0,
						"underApproval-UN Agency": 0,
						"underApproval-Red Cross/Crescent Movement": 0,
						"reserve-International NGO": 0,
						"reserve-National NGO": 0,
						"reserve-UN Agency": 0,
						"reserve-Red Cross/Crescent Movement": 0,
						"standard-International NGO": 0,
						"standard-National NGO": 0,
						"standard-UN Agency": 0,
						"standard-Red Cross/Crescent Movement": 0
					};

					temporaryOriginalObject[row.OrganizationType] += +row.ApprovedBudget;
					temporaryOriginalObject["underApproval-" + row.OrganizationType] += +row.PipelineBudget;
					temporaryOriginalObject["reserve-" + row.OrganizationType] += +row.ApprovedReserveBudget;
					temporaryOriginalObject["standard-" + row.OrganizationType] += +row.ApprovedStandardBudget;

					aggregatedAllocations.push(temporaryOriginalObject);

					temporarySet.push(row.PooledFundName);
				};
			});

			aggregatedAllocations.forEach(function(cbpf) {
				cbpf.parallelData = [];
				partnerList.forEach(function(partner) {
					cbpf.parallelData.push({
						partner: partner,
						value: cbpf[partner],
						percentage: cbpf[partner] / cbpf.total,
						total: cbpf.total,
						standard: cbpf["standard-" + partner],
						reserve: cbpf["reserve-" + partner],
						underApproval: cbpf["underApproval-" + partner]
					});
				});
			});

			return aggregatedAllocations;

			//end of processData
		};

		function createCSV(sourceData) {

			const clonedData = JSON.parse(JSON.stringify(sourceData));

			clonedData.forEach(function(d) {
				d["total-International NGO"] = d["International NGO"];
				d["total-National NGO"] = d["National NGO"];
				d["total-Red Cross/Crescent Movement"] = d["Red Cross/Crescent Movement"];
				d["total-UN Agency"] = d["UN Agency"];

				delete d["International NGO"];
				delete d["National NGO"];
				delete d["Red Cross/Crescent Movement"];
				delete d["UN Agency"];
				delete d.clicked;
				delete d.parallelData;

				for (let key in d) {
					if (key !== "cbpf") {
						d[key] = Math.round(d[key] * 100) / 100;
					};
				};
			});

			const concatenatedData = clonedData.reduce(function(acc, curr) {
				return acc.concat(curr);
			}, []);

			concatenatedData.sort(function(a, b) {
				return b.total - a.total ||
					(a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
						a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 : 0);
			});

			const header = Object.keys(concatenatedData[0]);

			const headerOrder = ["total-UN Agency", "total-Red Cross/Crescent Movement", "total-National NGO", "total-International NGO", "total", "cbpf"];

			header.sort(function(a, b) {
				return ((headerOrder.indexOf(b) + 1) - (headerOrder.indexOf(a) + 1)) || (a < b ? -1 : a > b ? 1 : 0);
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

		function restart() {
			started = false;
			const all = svg.selectAll(".pbialpTopPanel, .pbialpButtonPanel, .pbialpLollipopPanel, .pbialpParallelPanel")
				.selectAll("*:not(.pbialpgroupXAxisLollipop, .pbialpgroupXAxisParallel, .pbialpgroupYAxisLollipop)");
			all.interrupt();
			all.remove();
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

		function validateYear(yearString) {
			return +yearString === +yearString && yearsArray.indexOf(+yearString) > -1 ?
				+yearString : new Date().getFullYear()
		};

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1)
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

		function wrapText(text, width) {
			text.each(function() {
				let text = d3.select(this),
					words = text.text() === "Red Cross/Crescent Movement" ?
					["Red Cross/", "Crescent Movement"] : text.text().split(" "),
					lineNumber = 0,
					lineHeight = 1.1,
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy")),
					tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
				while (word = words.shift()) {
					tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (lineNumber++) * lineHeight + dy + "em").text(word);
				};
			});
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

	//Math.log10

	Math.log10 = Math.log10 || function(x) {
		return Math.log(x) * Math.LOG10E;
	};

	//END OF POLYFILLS

	//end of d3ChartIIFE
}());

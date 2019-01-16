(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1 ? true : false;

	const cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiobe.css"];

	const d3URL = "https://d3js.org/d3.v5.min.js";

	cssLinks.forEach(function(cssLink) {

		if (!isStyleLoaded(cssLink)) {
			const externalCSS = document.createElement("link");
			externalCSS.setAttribute("rel", "stylesheet");
			externalCSS.setAttribute("type", "text/css");
			externalCSS.setAttribute("href", cssLink);
			document.getElementsByTagName("head")[0].appendChild(externalCSS);
		};

	});

	if (!isD3Loaded(d3URL)) {
		if (!isInternetExplorer) {
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

		const width = 1130,
			padding = [4, 4, 32, 4],
			buttonsPanelHeight = 30,
			panelHorizontalPadding = 8,
			panelVerticalPadding = 4,
			fadeOpacity = 0.15,
			beneficiariesHeight = 370,
			buttonsNumber = 16,
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatPercent2Decimals = d3.format(".2%"),
			formatNumberSI = d3.format(".3s"),
			formatComma = d3.format(","),
			formatRoundPeople = d3.format(".1s"),
			titlePadding = 30,
			percentageVerPadding = 4,
			percentageHorPadding = 3,
			percentageHorNegPadding1 = -28,
			percentageHorNegPadding2 = -36,
			percentageHorNegPadding3 = -42,
			percentageBarLimit = 0.925,
			tooltipWidth = 278,
			localVariable = d3.local(),
			excelVerticalPadding = 4,
			excelIconSize = 20,
			excelIconPath = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/assets/excelicon.png",
			height = padding[0] + buttonsPanelHeight + panelHorizontalPadding + beneficiariesHeight + padding[2],
			beneficiariesTypes = ["total", "girls", "boys", "women", "men"],
			windowHeight = window.innerHeight,
			duration = 1000,
			legendData = ["Actual Beneficiaries", "Targeted Beneficiaries"],
			chartState = {
				selectedYear: null
			},
			bodyDAttribute = "M 2.954 5.168 C 2.151 5.168 1.463 5.465 0.882 6.038 C 0.299 6.637 0 7.334 0 8.11 L 0 15.286 C 0 15.555 0.092 15.798 0.299 15.995 C 0.491 16.189 0.731 16.277 1.002 16.277 C 1.314 16.277 1.553 16.189 1.745 15.995 C 1.912 15.798 1.999 15.555 1.999 15.286 L 1.999 8.87 L 2.518 8.87 L 2.518 26.634 C 2.518 26.976 2.668 27.292 2.952 27.536 C 3.219 27.805 3.53 27.92 3.889 27.92 C 4.277 27.92 4.59 27.805 4.843 27.536 C 5.112 27.292 5.234 26.976 5.234 26.634 L 5.234 16.337 L 5.815 16.337 L 5.815 26.634 C 5.815 26.976 5.95 27.292 6.202 27.536 C 6.456 27.805 6.785 27.92 7.186 27.92 C 7.528 27.92 7.827 27.805 8.096 27.536 C 8.348 27.292 8.464 26.976 8.464 26.634 L 8.464 8.87 L 9.006 8.87 L 9.006 15.286 C 9.006 15.555 9.091 15.798 9.271 15.995 C 9.484 16.189 9.731 16.277 10.001 16.277 C 10.317 16.277 10.556 16.189 10.735 15.995 C 10.897 15.798 11 15.555 11 15.286 L 11 8.111 C 11 7.337 10.718 6.637 10.135 6.041 C 9.567 5.465 8.886 5.171 8.051 5.171 L 2.954 5.171 L 2.954 5.168 Z",
			headDAttribute = "M 5.516 4.578 C 6.142 4.578 6.695 4.372 7.139 3.942 C 7.583 3.499 7.81 2.953 7.81 2.294 C 7.81 1.667 7.581 1.129 7.137 0.685 C 6.691 0.228 6.14 0 5.516 0 C 4.858 0 4.305 0.228 3.889 0.685 C 3.445 1.129 3.236 1.667 3.236 2.294 C 3.236 2.955 3.445 3.501 3.889 3.942 C 4.308 4.372 4.861 4.578 5.516 4.578 L 5.516 4.578 Z",
			pictogramWidth = 12,
			pictogramHeight = 28;

		let started = false,
			yearsArray;

		const containerDiv = d3.select("#d3chartcontainerpbiobe");

		const distancetoTop = containerDiv.node().offsetTop;

		const selectedYearString = containerDiv.node().getAttribute("data-year");

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		if (selectedResponsiveness === "false" || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		createProgressWheel();

		const tooltip = d3.select("body").append("div")
			.attr("id", "pbiobetooltipdiv")
			.style("display", "none");

		const buttonsPanel = {
			main: svg.append("g")
				.attr("class", "pbiobeButtonsPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: buttonsPanelHeight,
			padding: [0, 0, 0, 56],
			buttonWidth: 54,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18
		};

		const percentagePanel = {
			main: svg.append("g")
				.attr("class", "pbiobePercentagePanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: beneficiariesHeight,
			padding: [50, 106, 4, 56],
			labelPadding: 6
		};

		const pictogramsPanel = {
			main: svg.append("g")
				.attr("class", "pbiobePictogramsPanel")
				.attr("transform", "translate(" + (padding[3] + percentagePanel.width + panelVerticalPadding) + "," +
					(padding[0] + buttonsPanel.height + panelHorizontalPadding) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			height: beneficiariesHeight,
			padding: [50, 4, 4, 4]
		};

		const bottomGroup = svg.append("g")
			.attr("class", "pbiobeBottomGroup");

		const xScalePercentage = d3.scaleLinear()
			.range([percentagePanel.padding[3], percentagePanel.width - percentagePanel.padding[1]]);

		const xScalePictograms = d3.scaleLinear()
			.range([pictogramsPanel.padding[3], pictogramsPanel.width - pictogramsPanel.padding[1]]);

		const yScalePercentage = d3.scaleBand()
			.range([percentagePanel.padding[0], percentagePanel.height - percentagePanel.padding[2]])
			.domain(beneficiariesTypes)
			.paddingInner(0.4)
			.paddingOuter(0.2);

		const yScalePictograms = d3.scalePoint()
			.range([percentagePanel.padding[0], percentagePanel.height - percentagePanel.padding[2]])
			.domain(beneficiariesTypes)
			.padding(0.5);

		const xAxisPercentage = d3.axisTop(xScalePercentage)
			.tickSizeOuter(0)
			.tickSizeInner(-(percentagePanel.height - percentagePanel.padding[0] - percentagePanel.padding[2]))
			.tickValues([0, 0.25, 0.5, 0.75, 1])
			.tickFormat(formatPercent);

		const yAxisPercentage = d3.axisLeft(yScalePercentage)
			.tickFormat(capitalize);

		//STATIC FILE!!!
		d3.csv("https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/img/assets/datapbiobe.csv").then(function(rawData) {

			removeProgressWheel();

			yearsArray = rawData.map(function(d) {
				return +d.AllocationYear
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			}).sort(function(a, b) {
				return a - b;
			});

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

			const data = processData(rawData);

			createAxes();

			createButtonsPanel();

			createPercentagePanel(data);

			createPictogramPanel(data);

			createBottomLegend();

			createDownloadGroup();

			function createAxes() {

				const groupXAxisPercentage = percentagePanel.main.append("g")
					.attr("class", "pbiobegroupXAxisPercentage")
					.attr("transform", "translate(0," + percentagePanel.padding[0] + ")")
					.call(xAxisPercentage);

				const groupYAxisPercentage = percentagePanel.main.append("g")
					.attr("class", "pbiobegroupYAxisPercentage")
					.attr("transform", "translate(" + percentagePanel.padding[3] + ",0)")
					.call(yAxisPercentage);

			};

			function createButtonsPanel() {

				const clipPathButtons = buttonsPanel.main.append("clipPath")
					.attr("id", "pbiobeclipPathButtons")
					.append("rect")
					.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
					.attr("height", buttonsPanel.height);

				const clipPathGroup = buttonsPanel.main.append("g")
					.attr("class", "pbiobeClipPathGroup")
					.attr("transform", "translate(" + (buttonsPanel.padding[3]) + ",0)")
					.attr("clip-path", "url(#pbiobeclipPathButtons)");

				const buttonsGroup = clipPathGroup.append("g")
					.attr("class", "pbiobebuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiobebuttonsRects")
					.attr("width", buttonsPanel.buttonWidth - buttonsPanel.buttonPadding)
					.attr("height", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2)
					.attr("y", buttonsPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonWidth + buttonsPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedYear ? "whitesmoke" : "white";
					})
					.style("stroke", function(d) {
						return d === chartState.selectedYear ? "#666" : "#aaa";
					})
					.style("stroke-width", function(d) {
						return d === chartState.selectedYear ? "2px" : "1px";
					});

				const buttonsText = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiobebuttonsText")
					.attr("y", buttonsPanel.height / 1.6)
					.attr("x", function(_, i) {
						return i * buttonsPanel.buttonWidth + buttonsPanel.buttonWidth / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedYear ? "#666" : "#888"
					})
					.text(function(d) {
						return d;
					});

				const leftArrow = buttonsPanel.main.append("g")
					.attr("class", "pbiobeLeftArrowGroup")
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
					.attr("class", "pbiobeleftArrowText")
					.attr("x", 0)
					.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonsPanel.main.append("g")
					.attr("class", "pbiobeRightArrowGroup")
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
					.attr("class", "pbioberightArrowText")
					.attr("x", -1)
					.attr("y", buttonsPanel.height - buttonsPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25ba");

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
						const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
						leftArrow.select("text").style("fill", "#666");
						leftArrow.attr("pointer-events", "all");
						buttonsGroup.transition()
							.duration(duration)
							.attr("transform", "translate(" +
								Math.max(-((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth),
									(-(Math.abs(currentTranslate) + buttonsNumber * buttonsPanel.buttonWidth))) +
								",0)")
							.on("end", function() {
								const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
								if (Math.abs(currentTranslate) >= ((yearsArray.length - buttonsNumber) * buttonsPanel.buttonWidth)) {
									rightArrow.select("text").style("fill", "#ccc")
								} else {
									rightArrow.attr("pointer-events", "all");
								}
							})
					});
				};

				buttonsRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsRects)
					.on("click", clickButtonsRects);

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

					const firstYearIndex = chartState.selectedYear < yearsArray[buttonsNumber / 2] ?
						0 :
						chartState.selectedYear > yearsArray[yearsArray.length - (buttonsNumber / 2)] ?
						yearsArray.length - buttonsNumber :
						yearsArray.indexOf(chartState.selectedYear) - (buttonsNumber / 2);

					buttonsGroup.attr("transform", "translate(" +
						(-(buttonsPanel.buttonWidth * firstYearIndex)) +
						",0)");

				};

				//end of createButtonsPanel
			};

			function createPercentagePanel(data) {

				const title = percentagePanel.main.selectAll(".pbiobePercentagePanelTitle")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbiobePercentagePanelTitle")
					.attr("x", percentagePanel.padding[3])
					.attr("y", percentagePanel.padding[0] - titlePadding)
					.text("Beneficiaries, in percentage");

				let beneficiaryGroup = percentagePanel.main.selectAll(".pbiobeBeneficiaryGroup")
					.data(data, function(d) {
						return d.beneficiary;
					});

				const beneficiaryGroupExit = beneficiaryGroup.exit()
					.remove();

				const beneficiaryGroupEnter = beneficiaryGroup.enter()
					.append("g")
					.attr("class", "pbiobeBeneficiaryGroup");

				const backgroundBars = beneficiaryGroupEnter.append("rect")
					.attr("class", "obiobeBackgroundBars")
					.attr("x", function(d) {
						return xScalePercentage(0)
					})
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary)
					})
					.attr("height", yScalePercentage.bandwidth())
					.attr("width", xScalePercentage(1) - xScalePercentage(0))
					.style("fill", "#ccc");

				const bars = beneficiaryGroupEnter.append("rect")
					.attr("class", "pbiobeBars")
					.attr("x", function(d) {
						return xScalePercentage(0)
					})
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary)
					})
					.attr("height", yScalePercentage.bandwidth())
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const barsPercentage = beneficiaryGroupEnter.append("text")
					.attr("class", "pbiobeBarsPercentage")
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary) + yScalePercentage.bandwidth() / 2 + percentageVerPadding;
					})
					.attr("x", xScalePercentage(0) + percentageHorPadding)
					.style("fill", "#666")
					.text(formatPercent(0));

				const barsTotalLine1 = beneficiaryGroupEnter.append("text")
					.attr("class", "pbiobeBarsTotalLine1")
					.classed("contributionColorFill", true)
					.attr("x", xScalePercentage(1) + percentageVerPadding)
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary) + yScalePercentage.bandwidth() * 0.4;
					})
					.text(0);

				const barsTotalLine2 = beneficiaryGroupEnter.append("text")
					.attr("class", "pbiobeBarsTotalLine2")
					.attr("x", xScalePercentage(1) + percentageVerPadding)
					.attr("y", function(d) {
						return yScalePercentage(d.beneficiary) + yScalePercentage.bandwidth() * 0.8;
					})
					.text(0);

				beneficiaryGroup = beneficiaryGroupEnter.merge(beneficiaryGroup);

				beneficiaryGroup.select(".pbiobeBars")
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScalePercentage(Math.min(d.percentage, 1)) - xScalePercentage(0);
					});

				beneficiaryGroup.select(".pbiobeBarsPercentage")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return d.percentage < percentageBarLimit ? xScalePercentage(Math.min(d.percentage, 1)) + percentageHorPadding :
							d.percentage === 1 ? xScalePercentage(Math.min(d.percentage, 1)) + percentageHorNegPadding2 :
							d.percentage > 1 ? xScalePercentage(Math.min(d.percentage, 1)) + percentageHorNegPadding3 :
							xScalePercentage(Math.min(d.percentage, 1)) + percentageHorNegPadding1;

					})
					.style("fill", function(d) {
						return d.percentage < percentageBarLimit ? "#666" : "whitesmoke";
					})
					.tween("text", function(d) {
						const node = this;
						const percentage = +(node.textContent.replace(/\D/g, "")) / 100;
						const i = d3.interpolate(percentage || 0, Math.min(d.percentage, 1));
						return function(t) {
							d3.select(node).text(d.percentage > 1 ? ">" + formatPercent(i(t)) : formatPercent(i(t)))
						};
					});

				beneficiaryGroup.select(".pbiobeBarsTotalLine1")
					.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const actual = +(node.textContent.replace(/\D/g, ""));
						const i = d3.interpolate(actual || 0, d.actual);
						return function(t) {
							d3.select(node).text(formatComma(~~(i(t))))
								.append("tspan")
								.attr("class", "pbiobeBarsTotalSpan")
								.text(" out of");
						};
					});

				beneficiaryGroup.select(".pbiobeBarsTotalLine2")
					.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const total = +(node.textContent.replace(/\D/g, ""));
						const i = d3.interpolate(total || 0, d.targeted);
						return function(t) {
							d3.select(node).text(formatComma(~~(i(t))));
						};
					});


				//end of createPercentagePanel
			};

			function createPictogramPanel(data) {

				xScalePictograms.domain([0, data.find(function(d) {
					return d.beneficiary === "total"
				}).targeted]);

				const title = pictogramsPanel.main.selectAll(".pbiobePictogramsPanelTitle")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbiobePictogramsPanelTitle")
					.attr("x", pictogramsPanel.padding[3])
					.attr("y", pictogramsPanel.padding[0] - titlePadding)
					.text("Beneficiaries, real proportions");

				let pictogramGroupGray = pictogramsPanel.main.selectAll(".pbiobePictogramGroupGray")
					.data(data, function(d) {
						return d.beneficiary;
					});

				const pictogramGroupExitGray = pictogramGroupGray.exit()
					.remove();

				const pictogramGroupEnterGray = pictogramGroupGray.enter()
					.append("g")
					.attr("class", "pbiobePictogramGroupGray")
					.attr("clip-path", function(d) {
						return "url(#pbiobeClipPathGray" + d.beneficiary + ")"
					})
					.attr("transform", function(d) {
						return "translate(0," + (yScalePictograms(d.beneficiary) - pictogramHeight / 2) + ")";
					});

				const clipPathsGray = pictogramGroupEnterGray.append("clipPath")
					.attr("id", function(d) {
						return "pbiobeClipPathGray" + d.beneficiary;
					})
					.append("rect")
					.attr("width", 0)
					.attr("height", yScalePercentage.bandwidth());

				const pathGroupGray = pictogramGroupEnterGray.selectAll(".pbiobePathGroupGray")
					.data(d3.range(~~(pictogramsPanel.width / pictogramWidth)))
					.enter()
					.append("g")
					.attr("class", "pbiobePathGroupGray")
					.attr("transform", function(d) {
						return "translate(" + (d * pictogramWidth) + ",0)";
					});

				const headPathGray = pathGroupGray.append("path")
					.attr("d", headDAttribute)
					.style("fill", "#ccc");

				const bodyPathGray = pathGroupGray.append("path")
					.attr("d", bodyDAttribute)
					.style("fill", "#ccc");

				pictogramGroupGray = pictogramGroupEnterGray.merge(pictogramGroupGray);

				pictogramGroupGray.select("clipPath rect")
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScalePictograms(d.targeted) - xScalePictograms(0);
					});

				let pictogramGroupBlue = pictogramsPanel.main.selectAll(".pbiobePictogramGroupBlue")
					.data(data, function(d) {
						return d.beneficiary;
					});

				const pictogramGroupExitBlue = pictogramGroupBlue.exit()
					.remove();

				const pictogramGroupEnterBlue = pictogramGroupBlue.enter()
					.append("g")
					.attr("class", "pbiobePictogramGroupBlue")
					.attr("clip-path", function(d) {
						return "url(#pbiobeClipPathBlue" + d.beneficiary + ")"
					})
					.attr("transform", function(d) {
						return "translate(0," + (yScalePictograms(d.beneficiary) - pictogramHeight / 2) + ")";
					});

				const clipPathsBlue = pictogramGroupEnterBlue.append("clipPath")
					.attr("id", function(d) {
						return "pbiobeClipPathBlue" + d.beneficiary;
					})
					.append("rect")
					.attr("width", 0)
					.attr("height", yScalePercentage.bandwidth());

				const pathGroupBlue = pictogramGroupEnterBlue.selectAll(".pbiobePathGroupBlue")
					.data(d3.range(~~(pictogramsPanel.width / pictogramWidth)))
					.enter()
					.append("g")
					.attr("class", "pbiobePathGroupBlue")
					.attr("transform", function(d) {
						return "translate(" + (d * pictogramWidth) + ",0)";
					});

				const headPathBlue = pathGroupBlue.append("path")
					.attr("d", headDAttribute)
					.classed("contributionColorFill", true)

				const bodyPathBlue = pathGroupBlue.append("path")
					.attr("d", bodyDAttribute)
					.classed("contributionColorFill", true)

				pictogramGroupBlue = pictogramGroupEnterBlue.merge(pictogramGroupBlue);

				pictogramGroupBlue.select("clipPath rect")
					.transition()
					.duration(duration)
					.attr("width", function(d) {
						return xScalePictograms(d.actual) - xScalePictograms(0);
					});

				//end of createPictogramPanel
			};

			function createBottomLegend() {

				const legendGroup = bottomGroup.selectAll(".pbiobeLegendGroup")
					.data(legendData)
					.enter()
					.append("g")
					.attr("class", "pbiobeLegendGroup")
					.attr("transform", function(_, i) {
						return "translate(" + (padding[3] + percentagePanel.padding[3] + 130 * i) + "," + (height - padding[2] / 2) + ")";
					});

				const legendRect = legendGroup.append("rect")
					.attr("width", 14)
					.attr("height", 14)
					.attr("fill", "#ccc")
					.classed("contributionColorFill", function(_, i) {
						return !i;
					});

				const legendText = legendGroup.append("text")
					.attr("x", 18)
					.attr("y", 10)
					.text(function(d) {
						return d;
					});

				const pictogramLegendGroup = bottomGroup.selectAll(".pbiobePictogramLegendGroup")
					.data([true])
					.enter()
					.append("g")
					.attr("class", "pbiobePictogramLegendGroup")
					.attr("transform", function() {
						return "translate(" + (padding[3] + percentagePanel.width + panelVerticalPadding) + "," + (height - padding[2] / 2) + ")";
					});

				const headPath = pictogramLegendGroup.append("path")
					.attr("d", headDAttribute)
					.style("fill", "#666")
					.attr("transform", "translate(0," + (-pictogramHeight / 5) + ") scale(0.7,0.7)");

				const bodyPath = pictogramLegendGroup.append("path")
					.attr("d", bodyDAttribute)
					.style("fill", "#666")
					.attr("transform", "translate(0," + (-pictogramHeight / 5) + ") scale(0.7,0.7)");

				let pictogramLegendText = bottomGroup.selectAll(".pbiobePictogramLegendText")
					.data([xScalePictograms.domain()[1]]);

				pictogramLegendText = pictogramLegendText.enter()
					.append("text")
					.attr("class", "pbiobePictogramLegendText")
					.attr("x", padding[3] + percentagePanel.width + panelVerticalPadding + 12)
					.attr("y", height - padding[2] / 2 + 8)
					.merge(pictogramLegendText)
					.text(function(d) {
						return ": approx. " + calculateRoundNumber((d / ~~(pictogramsPanel.width / pictogramWidth))) + " people";
					});

				function calculateRoundNumber(people) {
					const rounded = formatRoundPeople(people);
					const unit = rounded[rounded.length - 1];
					const unitText = unit === "k" ? " thousand" : unit === "M" ? " million" : unit === "G" ? " billion" : "";
					return rounded.slice(0, -1) + unitText;
				};

				//end of createBottomLegend
			};

			function createDownloadGroup() {

				const downloadGroup = bottomGroup.append("g")
					.attr("class", "pbiobeDownloadGroup")
					.attr("transform", "translate(" + (width - padding[1] - excelIconSize - 6) +
						"," + (height - padding[2]) + ")");

				const downloadText = downloadGroup.append("text")
					.attr("class", "pbiobeDownloadText")
					.attr("x", -2)
					.attr("text-anchor", "end")
					.style("cursor", "pointer")
					.text("Save data")
					.attr("y", excelIconSize - excelVerticalPadding);

				const excelIcon = downloadGroup.append("image")
					.style("cursor", "pointer")
					.attr("x", 2)
					.attr("width", excelIconSize + "px")
					.attr("height", excelIconSize + "px")
					.attr("xlink:href", excelIconPath)
					.attr("y", excelVerticalPadding);

				downloadGroup.on("click", function() {

					const csv = createCSV(rawData);

					const fileName = "Beneficiaries" + chartState.selectedYear + ".csv";

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

				//end of createDownloadGroup
			};

			function clickButtonsRects(d) {

				chartState.selectedYear = d;

				d3.selectAll(".pbiobebuttonsRects")
					.style("stroke", function(e) {
						return e === chartState.selectedYear ? "#666" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedYear ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbiobebuttonsText")
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "#666" : "#888"
					});

				const data = processData(rawData);

				createPercentagePanel(data);

				createPictogramPanel(data);

				createBottomLegend();

				//end of clickButtonsRects
			};

			svg.selectAll(".pbiobeBeneficiaryGroup, .pbiobePictogramGroupGray, .pbiobePictogramGroupBlue")
				.on("mouseover", mouseOverGroups)
				.on("mousemove", mouseMoveGroups)
				.on("mouseout", mouseOutGroups);

			function mouseOverButtonsRects(d) {
				d3.select(this).style("fill", "whitesmoke");
			};

			function mouseOutButtonsRects(d) {
				if (d === chartState.selectedYear) return;
				d3.select(this).style("fill", "white");
			};

			function mouseOverGroups(d) {
				svg.selectAll(".pbiobeBeneficiaryGroup, .pbiobePictogramGroupGray, .pbiobePictogramGroupBlue")
					.style("opacity", function(e) {
						return e.beneficiary === d.beneficiary ? 1 : fadeOpacity;
					});

				const mouse = d3.mouse(svg.node());

				const percentageText = d.targeted ? "(actual beneficiaries: <strong>" + formatPercent2Decimals(d.actual / d.targeted) + "</strong> of the target)" : "";

				tooltip.style("display", "block")
					.html("<strong>" + capitalize(d.beneficiary) + "</strong><br><div style='margin:8px 0px 8px 0px;display:flex;flex-wrap:wrap;align-items:center;width:" + tooltipWidth +
						"px;'><div style='display:flex;margin-bottom:4px;flex:0 65%;white-space:initial;'>Number of " + (d.beneficiary === "total" ? "people" : d.beneficiary) + " targeted as beneficiaries:</div><div style='display:flex;margin-bottom:4px;flex:0 35%;justify-content:flex-end;'><strong>" +
						formatComma(d.targeted) + "</strong></div><div style='display:flex;margin-bottom:4px;flex:0 65%;white-space:initial;'>Number of " + (d.beneficiary === "total" ? "people" : d.beneficiary) + " actually benefited:</div><div style='display:flex;margin-bottom:4px;flex:0 35%;justify-content:flex-end;'><strong>" +
						formatComma(d.actual) + "</strong></div></div><div>" + percentageText + "</div>");

				const tooltipSize = tooltip.node().getBoundingClientRect();

				localVariable.set(this, tooltipSize);

				tooltip.style("left", mouse[0] < tooltipSize.width / 2 ?
						d3.event.pageX - mouse[0] + "px" :
						mouse[0] > (width - tooltipSize.width / 2) ?
						d3.event.pageX - (mouse[0] - (width - tooltipSize.width)) + "px" :
						d3.event.pageX - (tooltipSize.width / 2) + "px")
					.style("top", mouse[1] > height - tooltipSize.height + yScalePercentage.bandwidth() ?
						d3.event.pageY - tooltipSize.height - yScalePercentage.bandwidth() + "px" :
						d3.event.pageY + yScalePercentage.bandwidth() + "px");

			};

			function mouseMoveGroups(d) {

				if (!localVariable.get(this)) return;

				const mouse = d3.mouse(svg.node());

				const tooltipSize = localVariable.get(this);

				tooltip.style("left", mouse[0] < tooltipSize.width / 2 ?
						d3.event.pageX - mouse[0] + "px" :
						mouse[0] > (width - tooltipSize.width / 2) ?
						d3.event.pageX - (mouse[0] - (width - tooltipSize.width)) + "px" :
						d3.event.pageX - (tooltipSize.width / 2) + "px")
					.style("top", mouse[1] > height - tooltipSize.height + yScalePercentage.bandwidth() ?
						d3.event.pageY - tooltipSize.height - yScalePercentage.bandwidth() + "px" :
						d3.event.pageY + yScalePercentage.bandwidth() + "px");

			};

			function mouseOutGroups() {
				svg.selectAll(".pbiobeBeneficiaryGroup, .pbiobePictogramGroupGray, .pbiobePictogramGroupBlue")
					.style("opacity", 1);
				tooltip.style("display", "none");
			};

			//end of draw
		};


		function processData(rawData) {

			const filteredData = rawData.filter(function(d) {
				return +d.AllocationYear === chartState.selectedYear;
			});

			const aggregatedData = filteredData.reduce(function(acc, curr) {
				return {
					boysActual: acc.boysActual + (+curr.ActualBoys),
					boysTargeted: acc.boysTargeted + (+curr.PlannedBoys),
					girlsActual: acc.girlsActual + (+curr.ActualGirls),
					girlsTargeted: acc.girlsTargeted + (+curr.PlannedGirls),
					menActual: acc.menActual + (+curr.ActualMen),
					menTargeted: acc.menTargeted + (+curr.PlannedMen),
					womenActual: acc.womenActual + (+curr.ActualWomen),
					womenTargeted: acc.womenTargeted + (+curr.PlannedWomen),
					totalActual: acc.totalActual + (+curr.ActualTotal),
					totalTargeted: acc.totalTargeted + (+curr.PlannedTotal),
				}
			}, {
				boysActual: 0,
				boysTargeted: 0,
				girlsActual: 0,
				girlsTargeted: 0,
				menActual: 0,
				menTargeted: 0,
				womenActual: 0,
				womenTargeted: 0,
				totalActual: 0,
				totalTargeted: 0
			});

			const data = beneficiariesTypes.map(function(d) {
				const percentage = aggregatedData[d + "Targeted"] !== 0 ?
					aggregatedData[d + "Actual"] / aggregatedData[d + "Targeted"] : Math.PI;
				return {
					beneficiary: d,
					targeted: aggregatedData[d + "Targeted"],
					actual: aggregatedData[d + "Actual"],
					percentage: percentage
				};
			});

			return data;

			//end of processData
		};

		function createCSV(rawData) {

			const filteredData = rawData.filter(function(d) {
				return +d.AllocationYear === chartState.selectedYear;
			});

			filteredData.forEach(function(d) {
				for (let key in d) {
					if (key !== "PooledFundName" && key !== "ChfProjectCode") {
						d.key = +d.key;
					};
				};
			});

			const header = rawData.columns;

			const replacer = function(key, value) {
				return value === null ? '' : value
			};

			let rows = filteredData.map(function(row) {
				return header.map(function(fieldName) {
					return JSON.stringify(row[fieldName], replacer)
				}).join(',')
			});

			rows.unshift(header.join(','));

			return rows.join('\r\n');

			//end of createCSV
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

		function parseTransform(translate) {
			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.setAttributeNS(null, "transform", translate);
			const matrix = group.transform.baseVal.consolidate().matrix;
			return [matrix.e, matrix.f];
		};

		function restart() {
			started = false;
			const all = svg.selectAll(".pbiobeButtonsPanel, .pbiobePercentagePanel, .pbiobePictogramsPanel, .pbiobeBottomGroup")
				.selectAll("*");
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

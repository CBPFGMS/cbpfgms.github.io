(function d3ChartIIFE() {

	const isInternetExplorer = window.navigator.userAgent.indexOf("MSIE") > -1 || window.navigator.userAgent.indexOf("Trident") > -1 ? true : false;

	const fontAwesomeLink = "https://use.fontawesome.com/releases/v5.6.3/css/all.css";

	const cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylespbiclc.css", fontAwesomeLink];

	const d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js";

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

		const width = 900,
			padding = [4, 10, 4, 10],
			topPanelHeight = 60,
			buttonPanelHeight = 30,
			panelHorizontalPadding = 4,
			panelVerticalPadding = 12,
			windowHeight = window.innerHeight,
			currentYear = new Date().getFullYear(),
			lollipopGroupHeight = 18,
			stickHeight = 2,
			lollipopRadius = 4,
			fadeOpacity = 0.15,
			contributionType = ["paid", "pledge", "total"],
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			flagPadding = 22,
			flagSize = 16,
			paidSymbolSize = 16,
			localVariable = d3.local(),
			buttonsNumber = 8,
			verticalLabelPadding = 4,
			chartTitleDefault = "CBPF Contributions",
			contributionsTotals = {},
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags16/",
			moneyBagdAttribute = ["M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z"
			],
			duration = 1000,
			shortDuration = 500,
			titlePadding = 24,
			chartState = {
				selectedYear: null,
				selectedContribution: null
			};

		let height = 500,
			yearsArray;

		const containerDiv = d3.select("#d3chartcontainerpbiclc");

		const showHelp = (containerDiv.node().getAttribute("data-showhelp") === "true");

		const chartTitle = containerDiv.node().getAttribute("data-title") ? containerDiv.node().getAttribute("data-title") : chartTitleDefault;

		const selectedResponsiveness = (containerDiv.node().getAttribute("data-responsive") === "true");

		const selectedYearString = containerDiv.node().getAttribute("data-year");

		const selectedContribution = contributionType.indexOf(containerDiv.node().getAttribute("data-contribution")) > -1 ?
			containerDiv.node().getAttribute("data-contribution") : "total";

		const lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		if (selectedResponsiveness === false || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		const topDiv = containerDiv.append("div")
			.attr("class", "pbiclcTopDiv");

		const titleDiv = topDiv.append("div")
			.attr("class", "pbiclcTitleDiv");

		const iconsDiv = topDiv.append("div")
			.attr("class", "pbiclcIconsDiv d3chartIconsDiv");

		const svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		const footerDiv = containerDiv.append("div")
			.attr("class", "pbiclcFooterDiv");

		createProgressWheel();

		const tooltip = containerDiv.append("div")
			.attr("id", "pbiclctooltipdiv")
			.style("display", "none");

		const topPanel = {
			main: svg.append("g")
				.attr("class", "pbiclcTopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			moneyBagPadding: 94,
			leftPadding: [176, 484, 632],
			mainValueVerPadding: 12,
			mainValueHorPadding: 4
		};

		const buttonPanel = {
			main: svg.append("g")
				.attr("class", "pbiclcButtonPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: buttonPanelHeight,
			padding: [0, 0, 0, 90],
			buttonWidth: 54,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonContributionsWidth: 70,
			buttonContributionsPadding: 590
		};

		const donorsPanel = {
			main: svg.append("g")
				.attr("class", "pbiclcDonorsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + buttonPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			padding: [44, 64, 4, 0],
			labelPadding: 6
		};

		const cbpfsPanel = {
			main: svg.append("g")
				.attr("class", "pbiclcCbpfsPanel")
				.attr("transform", "translate(" + (padding[3] + donorsPanel.width + panelVerticalPadding) + "," +
					(padding[0] + topPanel.height + buttonPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: (width - padding[1] - padding[3] - panelVerticalPadding) / 2,
			padding: [44, 64, 4, 0],
			labelPadding: 6
		};

		const donorsPanelClip = donorsPanel.main.append("clipPath")
			.attr("id", "pbiclcDonorsPanelClip")
			.append("rect")
			.attr("width", donorsPanel.width)
			.attr("transform", "translate(0," + (-donorsPanel.padding[0]) + ")");

		const cbpfsPanelClip = cbpfsPanel.main.append("clipPath")
			.attr("id", "pbiclcCbpfsPanelClip")
			.append("rect")
			.attr("width", cbpfsPanel.width)
			.attr("transform", "translate(0," + (-cbpfsPanel.padding[0]) + ")");

		const xScaleDonors = d3.scaleLinear();

		const xScaleCbpfs = d3.scaleLinear();

		const yScaleDonors = d3.scalePoint()
			.padding(0.5);

		const yScaleCbpfs = d3.scalePoint()
			.padding(0.5);

		const xAxisDonors = d3.axisTop(xScaleDonors)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisCbpfs = d3.axisTop(xScaleCbpfs)
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const yAxisDonors = d3.axisLeft(yScaleDonors)
			.tickSizeInner(2)
			.tickSizeOuter(0)
			.tickPadding(flagPadding);

		const yAxisCbpfs = d3.axisLeft(yScaleCbpfs)
			.tickSizeInner(0)
			.tickSizeOuter(0)
			.tickPadding(6 + lollipopRadius);

		const groupXAxisDonors = donorsPanel.main.append("g")
			.attr("class", "pbiclcgroupXAxisDonors")
			.attr("clip-path", "url(#pbiclcDonorsPanelClip)")
			.attr("transform", "translate(0," + donorsPanel.padding[0] + ")");

		const groupXAxisCbpfs = cbpfsPanel.main.append("g")
			.attr("class", "pbiclcgroupXAxisCbpfs")
			.attr("clip-path", "url(#pbiclcCbpfsPanelClip)")
			.attr("transform", "translate(0," + cbpfsPanel.padding[0] + ")");

		const groupYAxisDonors = donorsPanel.main.append("g")
			.attr("class", "pbiclcgroupYAxisDonors");

		const groupYAxisCbpfs = cbpfsPanel.main.append("g")
			.attr("class", "pbiclcgroupYAxisCbpfs");

		const paidSymbol = d3.symbol()
			.type(d3.symbolTriangle)
			.size(paidSymbolSize);

		d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv")
			.then(function(rawData) {

				removeProgressWheel();

				yearsArray = rawData.map(function(d) {
					return +d.FiscalYear
				}).filter(function(value, index, self) {
					return self.indexOf(value) === index;
				}).sort();

				chartState.selectedYear = validateYear(selectedYearString);

				chartState.selectedContribution = selectedContribution;

				const allDonors = rawData.map(function(d) {
					if (d.GMSDonorISO2Code === "") d.GMSDonorISO2Code = "UN";
					return d.GMSDonorISO2Code.toLowerCase();
				}).filter(function(value, index, self) {
					return self.indexOf(value) === index;
				});

				saveFlags(allDonors);

				if (!lazyLoad) {
					draw(rawData);
				} else {
					d3.select(window).on("scroll.pbiclc", checkPosition);
					checkPosition();
				};

				function checkPosition() {
					const containerPosition = containerDiv.node().getBoundingClientRect();
					if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
						d3.select(window).on("scroll.pbiclc", null);
						draw(rawData);
					};
				};

				//end of d3.csv
			});

		function draw(rawData) {

			const dataArray = processData(rawData);

			const data = {
				dataDonors: dataArray[0],
				dataCbpfs: dataArray[1]
			};

			createTitle();

			createFooterDiv();

			recalculateAndResize();

			translateAxes();

			createTopPanel(data.dataDonors, data.dataCbpfs);

			createButtonPanel();

			createDonorsPanel(data.dataDonors, null);

			createCbpfsPanel(data.dataCbpfs, null);

			if (showHelp) createAnnotationsDiv();

			function clickButtonsRects(d) {

				chartState.selectedYear = d;

				d3.selectAll(".pbiclcbuttonsRects")
					.style("stroke", function(e) {
						return e === chartState.selectedYear ? "#444" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedYear ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbiclcbuttonsText")
					.style("fill", function(e) {
						return e === chartState.selectedYear ? "#444" : "#888"
					});

				const dataArray = processData(rawData);

				data.dataDonors = dataArray[0];

				data.dataCbpfs = dataArray[1];

				recalculateAndResize();

				createTopPanel(data.dataDonors, data.dataCbpfs);

				createDonorsPanel(data.dataDonors, null);

				createCbpfsPanel(data.dataCbpfs, null);

				//end of clickButtonsRects
			};

			function clickButtonsContributionsRects(d) {

				chartState.selectedContribution = d;

				d3.selectAll(".pbiclcbuttonsContributionsRects")
					.style("stroke", function(e) {
						return e === chartState.selectedContribution ? "#444" : "#aaa";
					})
					.style("stroke-width", function(e) {
						return e === chartState.selectedContribution ? "2px" : "1px";
					})
					.style("fill", function(e) {
						return e === chartState.selectedContribution ? "whitesmoke" : "white";
					});

				d3.selectAll(".pbiclcbuttonsContributionsText")
					.style("fill", function(e) {
						return e === chartState.selectedContribution ? "#444" : "#888"
					});

				createTopPanel(data.dataDonors, data.dataCbpfs);

				createDonorsPanel(data.dataDonors, null);

				createCbpfsPanel(data.dataCbpfs, null);

				//end of clickButtonsContributionsRects
			};

			function createTitle() {

				const title = titleDiv.append("p")
					.attr("id", "pbiclcd3chartTitle")
					.html(chartTitle);

				const helpIcon = iconsDiv.append("button")
					.attr("id", "pbiclcHelpButton");

				helpIcon.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info")

				const downloadIcon = iconsDiv.append("button")
					.attr("id", "pbiclcDownloadButton");

				downloadIcon.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				helpIcon.on("click", createAnnotationsDiv);

				downloadIcon.on("click", function() {

					const csv = createCsv(rawData);

					const fileName = "contributions" + chartState.selectedYear + ".csv";

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

			function createTopPanel(dataDonors, dataCbpfs) {

				contributionType.forEach(function(d) {
					contributionsTotals[d] = d3.sum(data.dataDonors, function(e) {
						return e[d]
					});
				});

				const mainValue = d3.sum(dataDonors, function(d) {
					return d[chartState.selectedContribution]
				});

				const topPanelMoneyBag = topPanel.main.selectAll(".pbiclctopPanelMoneyBag")
					.data([true])
					.enter()
					.append("g")
					.attr("class", "pbiclctopPanelMoneyBag contributionColorFill")
					.attr("transform", "translate(" + topPanel.moneyBagPadding + ",6) scale(0.5)")
					.each(function(_, i, n) {
						moneyBagdAttribute.forEach(function(d) {
							d3.select(n[i]).append("path")
								.attr("d", d);
						});
					});

				const previousValue = d3.select(".pbiclctopPanelMainValue").size() !== 0 ? d3.select(".pbiclctopPanelMainValue").datum() : 0;

				const previousDonors = d3.select(".pbiclctopPanelDonorsNumber").size() !== 0 ? d3.select(".pbiclctopPanelDonorsNumber").datum() : 0;

				const previousCbpfs = d3.select(".pbiclctopPanelCbpfsNumber").size() !== 0 ? d3.select(".pbiclctopPanelCbpfsNumber").datum() : 0;

				let mainValueGroup = topPanel.main.selectAll(".pbiclcmainValueGroup")
					.data([true]);

				mainValueGroup = mainValueGroup.enter()
					.append("g")
					.attr("class", "pbiclcmainValueGroup")
					.merge(mainValueGroup);

				let topPanelMainValue = mainValueGroup.selectAll(".pbiclctopPanelMainValue")
					.data([mainValue]);

				topPanelMainValue = topPanelMainValue.enter()
					.append("text")
					.attr("class", "pbiclctopPanelMainValue contributionColorFill")
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

				let topPanelMainText = mainValueGroup.selectAll(".pbiclctopPanelMainText")
					.data([mainValue]);

				topPanelMainText = topPanelMainText.enter()
					.append("text")
					.attr("class", "pbiclctopPanelMainText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelMainText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 2.7)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

				topPanelMainText.transition()
					.duration(duration)
					.style("opacity", 1)
					.text(function(d) {
						const valueSI = formatSIFloat(d);
						const unit = valueSI[valueSI.length - 1];
						return (unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "") +
							" received in " + chartState.selectedYear;
					});

				let topPanelSubText = mainValueGroup.selectAll(".pbiclctopPanelSubText")
					.data([true]);

				topPanelSubText = topPanelSubText.enter()
					.append("text")
					.attr("class", "pbiclctopPanelSubText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelSubText)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.2)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[0] + topPanel.mainValueHorPadding);

				topPanelSubText.transition()
					.duration(duration)
					.style("opacity", 1)
					.text(function(d) {
						return "(Total " +
							(chartState.selectedContribution === "total" ? "Contributions" :
								chartState.selectedContribution === "pledge" ? "Pledged" : "Paid") +
							")"
					});

				let topPanelDonorsNumber = mainValueGroup.selectAll(".pbiclctopPanelDonorsNumber")
					.data([dataDonors.length]);

				topPanelDonorsNumber = topPanelDonorsNumber.enter()
					.append("text")
					.attr("class", "pbiclctopPanelDonorsNumber contributionColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelDonorsNumber)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] - topPanel.mainValueHorPadding);

				topPanelDonorsNumber.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousDonors, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				const topPanelDonorsText = mainValueGroup.selectAll(".pbiclctopPanelDonorsText")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbiclctopPanelDonorsText")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.9)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[1] + topPanel.mainValueHorPadding)
					.attr("text-anchor", "start")
					.text("Donors");

				let topPanelCbpfsNumber = mainValueGroup.selectAll(".pbiclctopPanelCbpfsNumber")
					.data([dataCbpfs.length]);

				topPanelCbpfsNumber = topPanelCbpfsNumber.enter()
					.append("text")
					.attr("class", "pbiclctopPanelCbpfsNumber allocationColorFill")
					.attr("text-anchor", "end")
					.merge(topPanelCbpfsNumber)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] - topPanel.mainValueHorPadding);

				topPanelCbpfsNumber.transition()
					.duration(duration)
					.tween("text", function(d) {
						const node = this;
						const i = d3.interpolate(previousCbpfs, d);
						return function(t) {
							node.textContent = ~~(i(t));
						};
					});

				const topPanelCbpfsText = mainValueGroup.selectAll(".pbiclctopPanelCbpfsText")
					.data([true])
					.enter()
					.append("text")
					.attr("class", "pbiclctopPanelCbpfsText")
					.attr("y", topPanel.height - topPanel.mainValueVerPadding * 1.9)
					.attr("x", topPanel.moneyBagPadding + topPanel.leftPadding[2] + topPanel.mainValueHorPadding)
					.attr("text-anchor", "start")
					.text("CBPFs");

				const overRectangle = topPanel.main.selectAll(".pbiclctopPanelOverRectangle")
					.data([true])
					.enter()
					.append("rect")
					.attr("class", "pbiclctopPanelOverRectangle")
					.attr("width", topPanel.width)
					.attr("height", topPanel.height)
					.style("opacity", 0);

				overRectangle.on("mouseover", mouseOverTopPanel)
					.on("mousemove", mouseMoveTopPanel)
					.on("mouseout", mouseOutTopPanel);

				//end of createTopPanel
			};

			function createButtonPanel() {

				const clipPath = buttonPanel.main.append("clipPath")
					.attr("id", "pbiclcclip")
					.append("rect")
					.attr("width", buttonsNumber * buttonPanel.buttonWidth)
					.attr("height", buttonPanel.height);

				const clipPathGroup = buttonPanel.main.append("g")
					.attr("class", "pbiclcClipPathGroup")
					.attr("transform", "translate(" + (buttonPanel.padding[3] + buttonPanel.arrowPadding) + ",0)")
					.attr("clip-path", "url(#pbiclcclip)");

				const buttonsGroup = clipPathGroup.append("g")
					.attr("class", "pbiclcbuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiclcbuttonsRects")
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
					.attr("class", "pbiclcbuttonsText")
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

				const buttonsContributionsGroup = buttonPanel.main.append("g")
					.attr("class", "pbiclcbuttonsContributionsGroup")
					.attr("transform", "translate(" + (buttonPanel.buttonContributionsPadding) + ",0)")
					.style("cursor", "pointer");

				const buttonsContributionsRects = buttonsContributionsGroup.selectAll(null)
					.data(contributionType)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiclcbuttonsContributionsRects")
					.attr("width", buttonPanel.buttonContributionsWidth - buttonPanel.buttonPadding)
					.attr("height", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2)
					.attr("y", buttonPanel.buttonVerticalPadding)
					.attr("x", function(_, i) {
						return i * buttonPanel.buttonContributionsWidth + buttonPanel.buttonPadding / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedContribution ? "whitesmoke" : "white";
					})
					.style("stroke", function(d) {
						return d === chartState.selectedContribution ? "#444" : "#aaa";
					})
					.style("stroke-width", function(d) {
						return d === chartState.selectedContribution ? "2px" : "1px";
					});

				const buttonsContributionsText = buttonsContributionsGroup.selectAll(null)
					.data(contributionType)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiclcbuttonsContributionsText")
					.attr("y", buttonPanel.height / 1.6)
					.attr("x", function(_, i) {
						return i * buttonPanel.buttonContributionsWidth + buttonPanel.buttonContributionsWidth / 2;
					})
					.style("fill", function(d) {
						return d === chartState.selectedContribution ? "#444" : "#888"
					})
					.text(function(d) {
						if (d === "pledge") {
							return "Pledged"
						} else {
							return capitalize(d);
						};
					});

				const leftArrow = buttonPanel.main.append("g")
					.attr("class", "pbiclcLeftArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + buttonPanel.padding[3] + ",0)");

				const leftArrowRect = leftArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				const leftArrowText = leftArrow.append("text")
					.attr("class", "pbiclcleftArrowText")
					.attr("x", 0)
					.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonPanel.main.append("g")
					.attr("class", "pbiclcRightArrowGroup")
					.style("cursor", "pointer")
					.attr("transform", "translate(" + (buttonPanel.padding[3] + buttonPanel.arrowPadding +
						(buttonsNumber * buttonPanel.buttonWidth)) + ",0)");

				const rightArrowRect = rightArrow.append("rect")
					.style("fill", "white")
					.attr("width", buttonPanel.arrowPadding)
					.attr("height", buttonPanel.height);

				const rightArrowText = rightArrow.append("text")
					.attr("class", "pbiclcrightArrowText")
					.attr("x", -1)
					.attr("y", buttonPanel.height - buttonPanel.buttonVerticalPadding * 2.1)
					.style("fill", "#666")
					.text("\u25ba");

				buttonsRects.on("mouseover", mouseOverButtonsRects)
					.on("mouseout", mouseOutButtonsRects)
					.on("click", clickButtonsRects);

				buttonsContributionsRects.on("mouseover", mouseOverButtonsContributionsRects)
					.on("mouseout", mouseOutButtonsContributionsRects)
					.on("click", clickButtonsContributionsRects);

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
					const currentTranslate = parseTransform(buttonsGroup.attr("transform"))[0];
					leftArrow.select("text").style("fill", "#666");
					leftArrow.attr("pointer-events", "all");
					buttonsGroup.transition()
						.duration(duration)
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

				//end of createButtonPanel
			};

			function createDonorsPanel(donorsArray, cbpfRecipient) {

				donorsArray.sort(function(a, b) {
					return b[chartState.selectedContribution] - a[chartState.selectedContribution] ||
						(a.donor.toLowerCase() < b.donor.toLowerCase() ? -1 :
							a.donor.toLowerCase() > b.donor.toLowerCase() ? 1 : 0);
				});

				yScaleDonors.domain(donorsArray.map(function(d) {
					return d.donor;
				}));

				yScaleDonors.range([donorsPanel.padding[0],
					(donorsArray.length * lollipopGroupHeight) + donorsPanel.padding[0]
				]);

				const cbpfName = cbpfRecipient ? " (donations to " + cbpfRecipient + ")" : "";

				let donorsPanelTitle = donorsPanel.main.selectAll(".pbiclcDonorsPanelTitle")
					.data([true]);

				donorsPanelTitle = donorsPanelTitle.enter()
					.append("text")
					.attr("class", "pbiclcDonorsPanelTitle")
					.attr("y", donorsPanel.padding[0] - titlePadding)
					.merge(donorsPanelTitle)
					.text("Donors" + cbpfName)
					.transition()
					.duration(duration)
					.attr("x", donorsPanel.padding[3]);

				let donorGroup = donorsPanel.main.selectAll(".pbiclcDonorGroup")
					.data(donorsArray, function(d) {
						return d.isoCode;
					});

				const donorGroupExit = donorGroup.exit()
					.remove();

				const donorGroupEnter = donorGroup.enter()
					.append("g")
					.attr("class", "pbiclcDonorGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScaleDonors(d.donor) + ")";
					});

				const donorStickEnter = donorGroupEnter.append("rect")
					.attr("class", "pbiclcDonorStick")
					.attr("x", donorsPanel.padding[3])
					.attr("y", -(stickHeight / 2 - (stickHeight / 4)))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const donorLollipopEnter = donorGroupEnter.append("circle")
					.attr("class", "pbiclcDonorLollipop")
					.attr("cx", donorsPanel.padding[3])
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed("contributionColorFill", true);

				const donorFlagEnter = donorGroupEnter.append("image")
					.attr("class", "pbiclcDonorFlag")
					.attr("width", flagSize)
					.attr("height", flagSize)
					.attr("x", donorsPanel.padding[3] - flagPadding)
					.attr("y", -flagSize / 2 + 1)
					.attr("xlink:href", function(d) {
						return localStorage.getItem("storedFlag" + d.isoCode) ? localStorage.getItem("storedFlag" + d.isoCode) :
							flagsDirectory + d.isoCode + ".png";
					});

				const donorPaidIndicatorEnter = donorGroupEnter.append("path")
					.attr("class", "pbiclcDonorPaidIndicator")
					.attr("d", paidSymbol)
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
					.attr("transform", "translate(" + donorsPanel.padding[3] + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

				const donorLabelEnter = donorGroupEnter.append("text")
					.attr("class", "pbiclcDonorLabel")
					.attr("x", donorsPanel.padding[3] + donorsPanel.labelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const donorTooltipRectangleEnter = donorGroupEnter.append("rect")
					.attr("class", "pbiclcDonorTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", donorsPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all");

				donorGroup = donorGroupEnter.merge(donorGroup);

				donorGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + yScaleDonors(d.donor) + ")";
					});

				donorGroup.select(".pbiclcDonorStick")
					.transition()
					.duration(duration)
					.attr("x", donorsPanel.padding[3])
					.attr("width", function(d) {
						return xScaleDonors(d[chartState.selectedContribution]) - donorsPanel.padding[3];
					});

				donorGroup.select(".pbiclcDonorLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleDonors(d[chartState.selectedContribution]);
					});

				donorGroup.select(".pbiclcDonorFlag")
					.transition()
					.duration(duration)
					.attr("x", donorsPanel.padding[3] - flagPadding);

				donorGroup.select(".pbiclcDonorPaidIndicator")
					.transition()
					.duration(duration)
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
					.attr("transform", function(d) {
						const thisPadding = xScaleDonors(d.total) - xScaleDonors(d.paid) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + xScaleDonors(d.paid) + "," +
							((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
					});

				donorGroup.select(".pbiclcDonorLabel")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleDonors(d[chartState.selectedContribution]) + donorsPanel.labelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const percentPaid = chartState.selectedContribution === "total" ?
							" (" + formatPercent(d.paid / d.total) + " paid)" : "";
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedContribution]);
						return function(t) {
							d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedContribution])(i(t)))
								.append("tspan")
								.attr("class", "pbiclcDonorLabelPercentage")
								.attr("dy", "-0.5px")
								.text(percentPaid);
						};
					});

				const donorTooltipRectangle = donorGroup.select(".pbiclcDonorTooltipRectangle");

				donorTooltipRectangle.on("mouseover", null)
					.on("mousemove", null)
					.on("mouseout", null);

				setTimeout(function() {
					donorTooltipRectangle.on("mouseover", mouseoverTooltipRectangle)
						.on("mouseout", mouseoutTooltipRectangle);
				}, duration * 1.1);

				xAxisDonors.tickSizeInner(-(lollipopGroupHeight * donorsArray.length));

				groupYAxisDonors.transition()
					.duration(duration)
					.attr("transform", "translate(" + donorsPanel.padding[3] + ",0)")
					.call(yAxisDonors);

				groupXAxisDonors.transition()
					.duration(duration)
					.call(xAxisDonors);

				groupXAxisDonors.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				function mouseoverTooltipRectangle(datum) {

					donorGroup.style("opacity", function(d) {
						return d.donor === datum.donor ? 1 : fadeOpacity;
					});

					groupYAxisDonors.selectAll(".tick")
						.style("opacity", function(d) {
							return d === datum.donor ? 1 : fadeOpacity;
						});

					tooltip.style("display", "block")
						.html("Donor: <strong>" + datum.donor + "</strong><br><br><div style='margin:0px;display:flex;flex-wrap:wrap;width:262px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.total) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercent(datum.paid / datum.total)) +
							")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.paid) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledged <span style='color: #888;'>(" + (formatPercent(datum.pledge / datum.total)) +
							")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.pledge) + "</span></div></div>");

					const thisBox = this.getBoundingClientRect();

					const containerBox = containerDiv.node().getBoundingClientRect();

					const tooltipBox = tooltip.node().getBoundingClientRect();

					const thisOffsetTop = thisBox.top - containerBox.top;

					const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

					tooltip.style("top", thisOffsetTop + 22 + "px")
						.style("left", thisOffsetLeft + "px");

					createCbpfsPanel(datum.donations, datum.donor);

				};

				function mouseoutTooltipRectangle(datum) {

					donorGroup.style("opacity", 1);

					groupYAxisDonors.selectAll(".tick")
						.style("opacity", 1);

					tooltip.style("display", "none");

				};

				donorGroup.on("mouseout", null);

				setTimeout(function() {
					donorGroup.on("mouseout", function() {
						createCbpfsPanel(data.dataCbpfs, null);
					});
				}, duration * 1.1);

				//end of createDonorsPanel
			};

			function createCbpfsPanel(cbpfsArray, donorCountry) {

				cbpfsArray.sort(function(a, b) {
					return b[chartState.selectedContribution] - a[chartState.selectedContribution] ||
						(a.cbpf.toLowerCase() < b.cbpf.toLowerCase() ? -1 :
							a.cbpf.toLowerCase() > b.cbpf.toLowerCase() ? 1 : 0);
				});

				yScaleCbpfs.domain(cbpfsArray.map(function(d) {
					return d.cbpf;
				}));

				yScaleCbpfs.range([cbpfsPanel.padding[0],
					(cbpfsArray.length * lollipopGroupHeight) + cbpfsPanel.padding[0]
				]);

				const donorName = donorCountry ? " (donations from " + donorCountry + ")" : "";

				let cbpfsPanelTitle = cbpfsPanel.main.selectAll(".pbiclcCbpfsPanelTitle")
					.data([true]);

				cbpfsPanelTitle = cbpfsPanelTitle.enter()
					.append("text")
					.attr("class", "pbiclcCbpfsPanelTitle")
					.attr("y", cbpfsPanel.padding[0] - titlePadding)
					.merge(cbpfsPanelTitle)
					.text("CBPFs" + donorName)
					.transition()
					.duration(duration)
					.attr("x", cbpfsPanel.padding[3]);

				let cbpfGroup = cbpfsPanel.main.selectAll(".pbiclcCbpfGroup")
					.data(cbpfsArray, function(d) {
						return d.isoCode;
					});

				const cbpfGroupExit = cbpfGroup.exit()
					.remove();

				const cbpfGroupEnter = cbpfGroup.enter()
					.append("g")
					.attr("class", "pbiclcCbpfGroup")
					.attr("transform", function(d) {
						return "translate(0," + yScaleCbpfs(d.cbpf) + ")";
					});

				const cbpfStickEnter = cbpfGroupEnter.append("rect")
					.attr("class", "pbiclcCbpfStick")
					.attr("x", cbpfsPanel.padding[3])
					.attr("y", -(stickHeight / 2 - (stickHeight / 4)))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("allocationColorFill", true);

				const cbpfLollipopEnter = cbpfGroupEnter.append("circle")
					.attr("class", "pbiclcCbpfLollipop")
					.attr("cx", cbpfsPanel.padding[3])
					.attr("cy", (stickHeight / 4))
					.attr("r", lollipopRadius)
					.classed("allocationColorFill", true);

				const cbpfPaidIndicatorEnter = cbpfGroupEnter.append("path")
					.attr("class", "pbiclcCbpfPaidIndicator")
					.attr("d", paidSymbol)
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
					.attr("transform", "translate(" + cbpfsPanel.padding[3] + "," +
						((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight) + ")");

				const cbpfLabelEnter = cbpfGroupEnter.append("text")
					.attr("class", "pbiclcCbpfLabel")
					.attr("x", cbpfsPanel.padding[3] + cbpfsPanel.labelPadding)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const cbpfTooltipRectangleEnter = cbpfGroupEnter.append("rect")
					.attr("class", "pbiclcCbpfTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", cbpfsPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all");

				cbpfGroup = cbpfGroupEnter.merge(cbpfGroup);

				cbpfGroup.transition()
					.duration(duration)
					.attr("transform", function(d) {
						return "translate(0," + yScaleCbpfs(d.cbpf) + ")";
					});

				cbpfGroup.select(".pbiclcCbpfStick")
					.transition()
					.duration(duration)
					.attr("x", cbpfsPanel.padding[3])
					.attr("width", function(d) {
						return xScaleCbpfs(d[chartState.selectedContribution]) - cbpfsPanel.padding[3];
					});

				cbpfGroup.select(".pbiclcCbpfLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function(d) {
						return xScaleCbpfs(d[chartState.selectedContribution]);
					});

				cbpfGroup.select(".pbiclcCbpfPaidIndicator")
					.transition()
					.duration(duration)
					.style("opacity", chartState.selectedContribution === "total" ? 1 : 0)
					.attr("transform", function(d) {
						const thisPadding = xScaleCbpfs(d.total) - xScaleCbpfs(d.paid) < lollipopRadius ?
							lollipopRadius - (stickHeight / 2) : 0;
						return "translate(" + xScaleCbpfs(d.paid) + "," +
							((Math.sqrt(4 * paidSymbolSize / Math.sqrt(3)) / 2) + stickHeight + thisPadding) + ")";
					});

				cbpfGroup.select(".pbiclcCbpfLabel")
					.transition()
					.duration(duration)
					.attr("x", function(d) {
						return xScaleCbpfs(d[chartState.selectedContribution]) + cbpfsPanel.labelPadding;
					})
					.tween("text", function(d) {
						const node = this;
						const percentPaid = chartState.selectedContribution === "total" ?
							" (" + formatPercent(d.paid / d.total) + " received)" : "";
						const i = d3.interpolate(reverseFormat(node.textContent) || 0, d[chartState.selectedContribution]);
						return function(t) {
							d3.select(node).text(d3.formatPrefix(".0", d[chartState.selectedContribution])(i(t)))
								.append("tspan")
								.attr("class", "pbiclcDonorLabelPercentage")
								.attr("dy", "-0.5px")
								.text(percentPaid);
						};
					});

				const cbpfTooltipRectangle = cbpfGroup.select(".pbiclcCbpfTooltipRectangle");

				cbpfTooltipRectangle.on("mouseover", null)
					.on("mousemove", null)
					.on("mouseout", null);

				setTimeout(function() {
					cbpfTooltipRectangle.on("mouseover", mouseoverTooltipRectangle)
						.on("mouseout", mouseoutTooltipRectangle);
				}, duration * 1.1);

				xAxisCbpfs.tickSizeInner(-(lollipopGroupHeight * cbpfsArray.length));

				groupYAxisCbpfs.transition()
					.duration(duration)
					.attr("transform", "translate(" + cbpfsPanel.padding[3] + ",0)")
					.call(yAxisCbpfs);

				groupXAxisCbpfs.transition()
					.duration(duration)
					.call(xAxisCbpfs);

				groupXAxisCbpfs.selectAll(".tick")
					.filter(function(d) {
						return d === 0;
					})
					.remove();

				function mouseoverTooltipRectangle(datum) {

					cbpfGroup.style("opacity", function(d) {
						return d.cbpf === datum.cbpf ? 1 : fadeOpacity;
					});

					groupYAxisCbpfs.selectAll(".tick")
						.style("opacity", function(d) {
							return d === datum.cbpf ? 1 : fadeOpacity;
						});

					tooltip.style("display", "block")
						.html("CBPF: <strong>" + datum.cbpf + "</strong><br><br><div style='margin:0px;display:flex;flex-wrap:wrap;width:290px;'><div style='display:flex;flex:0 62%;'>Total contributions:</div><div style='display:flex;flex:0 38%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.total) +
							"</span></div><div style='display:flex;flex:0 62%;white-space:pre;'>Contribution paid <span style='color: #888;'>(" + (formatPercent(datum.paid / datum.total)) +
							")</span>:</div><div style='display:flex;flex:0 38%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.paid) +
							"</span></div><div style='display:flex;flex:0 62%;white-space:pre;'>Contribution unpaid <span style='color: #888;'>(" + (formatPercent(datum.pledge / datum.total)) +
							")</span>:</div><div style='display:flex;flex:0 38%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(datum.pledge) + "</span></div></div>");

					const thisBox = this.getBoundingClientRect();

					const containerBox = containerDiv.node().getBoundingClientRect();

					const tooltipBox = tooltip.node().getBoundingClientRect();

					const thisOffsetTop = thisBox.top - containerBox.top;

					const thisOffsetLeft = thisBox.left - containerBox.left + (thisBox.width - tooltipBox.width) / 2;

					tooltip.style("top", thisOffsetTop + 22 + "px")
						.style("left", thisOffsetLeft + "px");

					createDonorsPanel(datum.donors, datum.cbpf);

				};

				function mouseoutTooltipRectangle(datum) {

					cbpfGroup.style("opacity", 1);

					groupYAxisCbpfs.selectAll(".tick")
						.style("opacity", 1);

					tooltip.style("display", "none");

				};

				cbpfGroup.on("mouseout", null);

				setTimeout(function() {
					cbpfGroup.on("mouseout", function() {
						createDonorsPanel(data.dataDonors, null);
					});
				}, duration * 1.1);

				//end of createCbpfsPanel
			};

			function mouseOverTopPanel() {

				const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouse = d3.mouse(this);

				tooltip.style("display", "block")
					.html("<div style='margin:0px;display:flex;flex-wrap:wrap;width:256px;'><div style='display:flex;flex:0 54%;'>Total contributions:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.total) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total paid <span style='color: #888;'>(" + (formatPercent(contributionsTotals.paid / contributionsTotals.total)) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.paid) +
						"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Total pledge <span style='color: #888;'>(" + (formatPercent(contributionsTotals.pledge / contributionsTotals.total)) +
						")</span>:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" + formatMoney0Decimals(contributionsTotals.pledge) + "</span></div></div>");

				const tooltipSize = tooltip.node().getBoundingClientRect();

				localVariable.set(this, tooltipSize);

				tooltip.style("top", thisOffset + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						mouseContainer[0] + 14 + "px" :
						mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseMoveTopPanel() {

				const thisOffset = this.getBoundingClientRect().top - containerDiv.node().getBoundingClientRect().top;

				const mouseContainer = d3.mouse(containerDiv.node());

				const mouse = d3.mouse(this);

				const tooltipSize = localVariable.get(this);

				tooltip.style("top", thisOffset + "px")
					.style("left", mouse[0] < topPanel.width - 14 - tooltipSize.width ?
						mouseContainer[0] + 14 + "px" :
						mouseContainer[0] - (mouse[0] - (topPanel.width - tooltipSize.width)) + "px");

			};

			function mouseOutTopPanel() {
				tooltip.style("display", "none");
			};

			function mouseOverButtonsRects(d) {
				d3.select(this).style("fill", "whitesmoke");
			};

			function mouseOutButtonsRects(d) {
				if (d === chartState.selectedYear) return;
				d3.select(this).style("fill", "white");
			};

			function mouseOverButtonsContributionsRects(d) {
				d3.select(this).style("fill", "whitesmoke");
			};

			function mouseOutButtonsContributionsRects(d) {
				if (d === chartState.selectedContribution) return;
				d3.select(this).style("fill", "white");
			};

			function recalculateAndResize() {

				resizeSVGHeight(data.dataDonors.length, data.dataCbpfs.length);

				const biggestLabelLengthDonors = calculateBiggestLabel(data.dataDonors, "donor");

				const biggestLabelLengthCbpfs = calculateBiggestLabel(data.dataCbpfs, "cbpf");

				setRanges(biggestLabelLengthDonors, biggestLabelLengthCbpfs);

				setDomains(data.dataDonors, data.dataCbpfs, "total");

				//end of recalculateAndResize
			};

			//end of draw
		};

		function processData(rawData) {

			const aggregatedDonors = [];

			const aggregatedCbpfs = [];

			let tempSetDonors = [],
				tempSetCbpfs = [];

			const filteredData = rawData.filter(function(d) {
				return +d.FiscalYear === chartState.selectedYear;
			});

			filteredData.forEach(function(d) {

				if (tempSetDonors.indexOf(d.GMSDonorName) > -1) {

					const tempObject = aggregatedDonors.filter(function(e) {
						return e.donor === d.GMSDonorName
					})[0];

					const foundDonations = tempObject.donations.filter(function(e) {
						return e.cbpf === d.PooledFundName
					})[0];

					if (foundDonations) {

						foundDonations.paid += +d.PaidAmt;
						foundDonations.pledge += +d.PledgeAmt;
						foundDonations.total += (+d.PaidAmt) + (+d.PledgeAmt);

					} else {

						tempObject.donations.push({
							cbpf: d.PooledFundName,
							isoCode: d.PooledFundISO2Code.toLowerCase(),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
							total: (+d.PaidAmt) + (+d.PledgeAmt)
						});

					};

					tempObject.paid += +d.PaidAmt;
					tempObject.pledge += +d.PledgeAmt;
					tempObject.total += (+d.PaidAmt) + (+d.PledgeAmt);

				} else {

					aggregatedDonors.push({
						donor: d.GMSDonorName,
						isoCode: d.GMSDonorISO2Code.toLowerCase(),
						donations: [{
							cbpf: d.PooledFundName,
							isoCode: d.PooledFundISO2Code.toLowerCase(),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
							total: (+d.PaidAmt) + (+d.PledgeAmt)
						}],
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
						total: (+d.PaidAmt) + (+d.PledgeAmt)
					});

					tempSetDonors.push(d.GMSDonorName);

				};

				if (tempSetCbpfs.indexOf(d.PooledFundName) > -1) {

					const tempObject = aggregatedCbpfs.filter(function(e) {
						return e.cbpf === d.PooledFundName
					})[0];

					const foundDonor = tempObject.donors.filter(function(e) {
						return e.donor === d.GMSDonorName
					})[0];

					if (foundDonor) {

						foundDonor.paid += +d.PaidAmt;
						foundDonor.pledge += +d.PledgeAmt;
						foundDonor.total += (+d.PaidAmt) + (+d.PledgeAmt);

					} else {

						tempObject.donors.push({
							donor: d.GMSDonorName,
							isoCode: d.GMSDonorISO2Code.toLowerCase(),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
							total: (+d.PaidAmt) + (+d.PledgeAmt)
						});

					};

					tempObject.paid += +d.PaidAmt;
					tempObject.pledge += +d.PledgeAmt;
					tempObject.total += (+d.PaidAmt) + (+d.PledgeAmt);

				} else {

					aggregatedCbpfs.push({
						cbpf: d.PooledFundName,
						isoCode: d.PooledFundISO2Code.toLowerCase(),
						donors: [{
							donor: d.GMSDonorName,
							isoCode: d.GMSDonorISO2Code.toLowerCase(),
							paid: +d.PaidAmt,
							pledge: +d.PledgeAmt,
							total: (+d.PaidAmt) + (+d.PledgeAmt)
						}],
						paid: +d.PaidAmt,
						pledge: +d.PledgeAmt,
						total: (+d.PaidAmt) + (+d.PledgeAmt)
					});

					tempSetCbpfs.push(d.PooledFundName);

				};

			});

			const macedoniaObject = aggregatedDonors.find(function(d) {
				return d.donor.indexOf("Macedonia") > -1;
			});

			if (macedoniaObject) macedoniaObject.donor = "Macedonia";

			tempSetDonors = [];

			tempSetCbpfs = [];

			return [aggregatedDonors, aggregatedCbpfs];

			//end of processData
		};

		function createCsv(rawData) {

			const filteredData = rawData.filter(function(d) {
				return +d.FiscalYear === chartState.selectedYear;
			}).sort(function(a, b) {
				return b.PaidAmt - a.PaidAmt;
			});

			filteredData.forEach(function(d) {
				d.FiscalYear = +d.FiscalYear;
				d.PaidAmt = +d.PaidAmt;
				d.PledgeAmt = +d.PledgeAmt;
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

			//end of createCsv
		};

		function resizeSVGHeight(donorsLength, cbpfsLength) {

			donorsPanel.height = (donorsLength * lollipopGroupHeight) + donorsPanel.padding[0] + donorsPanel.padding[2];

			cbpfsPanel.height = (cbpfsLength * lollipopGroupHeight) + cbpfsPanel.padding[0] + cbpfsPanel.padding[2];

			donorsPanelClip.attr("height", donorsPanel.height);

			cbpfsPanelClip.attr("height", cbpfsPanel.height);

			height = padding[0] + padding[2] + topPanel.height + buttonPanel.height +
				Math.max(donorsPanel.height, cbpfsPanel.height) + (2 * panelHorizontalPadding);

			if (selectedResponsiveness === false) {
				containerDiv.style("height", height + "px");
			};

			svg.transition()
				.duration(shortDuration)
				.attr("viewBox", "0 0 " + width + " " + height);

			//end of resizeSvg
		};

		function calculateBiggestLabel(dataArray, property) {

			const allTexts = dataArray.map(function(d) {
				return d[property]
			}).sort(function(a, b) {
				return b.length - a.length;
			}).slice(0, 5);

			const textSizeArray = [];

			allTexts.forEach(function(d) {

				const fakeText = svg.append("text")
					.attr("class", "pbiclcgroupYAxisDonorsFake")
					.style("opacity", 0)
					.text(d);

				const fakeTextLength = Math.ceil(fakeText.node().getComputedTextLength());

				textSizeArray.push(fakeTextLength);

				fakeText.remove();

			});

			return d3.max(textSizeArray);

			//end of calculateBiggestLabel
		};

		function setDomains(donors, cbpfs, property) {

			const maxXValue = Math.max(d3.max(donors, function(d) {
				return d[property]
			}), d3.max(cbpfs, function(d) {
				return d[property]
			}));

			xScaleDonors.domain([0, ~~(maxXValue * 1.1)]);

			xScaleCbpfs.domain([0, ~~(maxXValue * 1.1)]);

		};

		function setRanges(labelSizeDonors, labelSizeCbpfs) {

			const labelSize = Math.max(labelSizeDonors + yAxisDonors.tickPadding() + yAxisDonors.tickSizeInner(),
				labelSizeCbpfs + yAxisCbpfs.tickPadding() + yAxisCbpfs.tickSizeInner());

			donorsPanel.padding[3] = labelSize;

			cbpfsPanel.padding[3] = labelSize;

			xScaleDonors.range([donorsPanel.padding[3], donorsPanel.width - donorsPanel.padding[1]]);

			xScaleCbpfs.range([cbpfsPanel.padding[3], cbpfsPanel.width - cbpfsPanel.padding[1]])

			yScaleDonors.range([donorsPanel.padding[0], donorsPanel.height - donorsPanel.padding[2]]);

			yScaleCbpfs.range([cbpfsPanel.padding[0], cbpfsPanel.height - cbpfsPanel.padding[2]]);

		};

		function translateAxes() {

			groupYAxisDonors.attr("transform", "translate(" + donorsPanel.padding[3] + ",0)");

			groupYAxisCbpfs.attr("transform", "translate(" + cbpfsPanel.padding[3] + ",0)");

		};

		function parseTransform(translate) {

			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

			group.setAttributeNS(null, "transform", translate);

			const matrix = group.transform.baseVal.consolidate().matrix;

			return [matrix.e, matrix.f];

		};

		function saveFlags(donorsList) {

			const unocha = donorsList.indexOf("");

			if (unocha > -1) {
				donorsList[unocha] = "un";
			};

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

		function createAnnotationsDiv() {

			const padding = 6;

			const overDiv = containerDiv.append("div")
				.attr("class", "pbiclcOverDivHelp");

			const helpSVG = overDiv.append("svg")
				.attr("viewBox", "0 0 " + width + " " + height);

			const arrowMarker = helpSVG.append("defs")
				.append("marker")
				.attr("id", "pbiclcArrowMarker")
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
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const mainText = helpSVG.append("text")
				.attr("class", "pbiclcAnnotationMainText contributionColorFill")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 320)
				.text("CLICK ANYWHERE TO START");

			const yearsAnnotationRect = helpSVG.append("rect")
				.attr("x", 290 - padding)
				.attr("y", 60 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const yearsAnnotation = helpSVG.append("text")
				.attr("class", "pbiclcAnnotationText")
				.attr("x", 290)
				.attr("y", 60)
				.text("Use these buttons to select the year. Click the arrows to reveal more years.")
				.call(wrapText2, 200);

			const yearsPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiclcArrowMarker)")
				.attr("d", "M480,70 Q510,70 510,95");

			yearsAnnotationRect.attr("width", yearsAnnotation.node().getBBox().width + padding * 2)
				.attr("height", yearsAnnotation.node().getBBox().height + padding * 2);

			const paidPledgeAnnotationRect = helpSVG.append("rect")
				.attr("x", 400 - padding)
				.attr("y", 180 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const paidPledgeAnnotation = helpSVG.append("text")
				.attr("class", "pbiclcAnnotationText")
				.attr("x", 400)
				.attr("y", 180)
				.text("Use these buttons to filter by “paid” or “pledged” values. “Total” shows both paid and pledged.")
				.call(wrapText2, 220);

			const paidPledgePath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiclcArrowMarker)")
				.attr("d", "M600,180 Q690,180 690,150");

			paidPledgeAnnotationRect.attr("width", paidPledgeAnnotation.node().getBBox().width + padding * 2)
				.attr("height", paidPledgeAnnotation.node().getBBox().height + padding * 2);

			const lollipopsAnnotationRect = helpSVG.append("rect")
				.attr("x", 270 - padding)
				.attr("y", 390 - padding - 14)
				.style("fill", "white")
				.style("opacity", 0.95);

			const lollipopsAnnotation = helpSVG.append("text")
				.attr("class", "pbiclcAnnotationText")
				.attr("x", 270)
				.attr("y", 390)
				.text("Hover over the donors or CBPFs to get additional information. Hovering over a donor filters the CBPFs accordingly, as well as hovering over a CBPFs filters the donors accordingly. When “total” is selected, the black triangle indicates the paid amount.")
				.call(wrapText2, 250);

			const lollipopsPath = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiclcArrowMarker)")
				.attr("d", "M260,430 Q200,430 200,370");

			const lollipopsPath2 = helpSVG.append("path")
				.style("fill", "none")
				.style("stroke", "#E56A54")
				.attr("pointer-events", "none")
				.attr("marker-end", "url(#pbiclcArrowMarker)")
				.attr("d", "M530,430 Q590,430 590,370");

			lollipopsAnnotationRect.attr("width", lollipopsAnnotation.node().getBBox().width + padding * 2)
				.attr("height", lollipopsAnnotation.node().getBBox().height + padding * 2);

			helpSVG.on("click", function() {
				overDiv.remove();
			});

			//end of createAnnotationsDiv
		};

		function createFooterDiv() {

			const footerText = "© OCHA CBPF Section " + currentYear + " | For more information, please visit ";

			const footerLink = "<a href='https://gms.unocha.org/content/cbpf-contributions'>gms.unocha.org/bi</a>";

			footerDiv.append("div")
				.attr("class", "d3chartFooterText")
				.html(footerText + footerLink + ".");

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

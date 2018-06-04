(function d3ChartIIFE() {

	var userAgent = window.navigator.userAgent;

	var isInternetExplorer = userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1 ? true : false;

	var cssLink = "https://cbpfgms.github.io/css/d3chartstyles.css";

	var externalCSS = document.createElement("link");
	externalCSS.setAttribute("rel", "stylesheet");
	externalCSS.setAttribute("type", "text/css");
	externalCSS.setAttribute("href", cssLink);
	document.getElementsByTagName("head")[0].appendChild(externalCSS);

	function loadScript(url, callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
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

		var width = 1160,
			height = 750,
			padding = [4, 4, 4, 4],
			topPanelHeightFactor = 0.12,
			barsPanelHeightFactor = 0.55,
			beeswarmPanelHeightFactor = 0.22,
			bottomPanelHeightFactor = 0.11,
			panelHorizontalPadding = 6,
			duration = 1500,
			shortDuration = 200,
			secondDelay = duration,
			thirdDelay = secondDelay + duration,
			started = false,
			formatMoney2Decimals = d3.format(",.2f"),
			formatInteger = d3.format(".0f"),
			formatPercent = d3.format(".0%"),
			formatPercent2Decimals = d3.format(".2%"),
			topPanelGroupWidth = 288,
			barsContributionsLabelsPadding = 4,
			localVariable = d3.local(),
			circleRadius = 4,
			bottomBarsHeight = 16,
			beeswarmTransitionEnded = false,
			flagPadding = 30,
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags/";

		var moneyBagd1 = "M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z";
		var moneyBagd2 = "M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z";
		var moneyBagd3 = "M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z";
		var moneyBagd4 = "M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z";

		var windowHeight = window.innerHeight;

		var containerDiv = d3.select("#d3chartcontainercbpfbp");

		var selectedResponsiveness = containerDiv.node().getAttribute("data-responsive");

		if (selectedResponsiveness === "false") {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		var distancetoTop = containerDiv.node().offsetTop;

		var year = +containerDiv.node().getAttribute("data-year");

		var svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		createProgressWhell();

		var tooltip = d3.select("body").append("div")
			.attr("id", "cbpfbptooltipdiv")
			.style("display", "none");

		var preloadedImagesDiv = d3.select("body").append("div")
			.style("display", "none");

		var topPanel = {
			main: svg.append("g")
				.attr("class", "cbpfbptopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: (height - padding[0] - padding[2] - (3 * panelHorizontalPadding)) * topPanelHeightFactor,
			moneyBagPadding: 70,
			paidValuePadding: 330
		};

		var barsPanel = {
			main: svg.append("g")
				.attr("class", "cbpfbpbarsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: (height - padding[0] - padding[2] - (3 * panelHorizontalPadding)) * barsPanelHeightFactor,
			padding: [42, 30, 20, 30],
			centralSpace: 250 + flagPadding,
			get barsSpace() {
				return (this.width - this.centralSpace) / 2;
			}
		};

		var beeswarmPanel = {
			main: svg.append("g")
				.attr("class", "cbpfbpbeeswarmPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + barsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: (height - padding[0] - padding[2] - (3 * panelHorizontalPadding)) * beeswarmPanelHeightFactor,
			padding: [40, 10, 24, 124],
			titlePadding: 10
		};

		var bottomPanel = {
			main: svg.append("g")
				.attr("class", "cbpfbpbottomPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + barsPanel.height + beeswarmPanel.height + (3 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: (height - padding[0] - padding[2] - (3 * panelHorizontalPadding)) * bottomPanelHeightFactor,
			padding: [26, 10, 16, 10]
		};

		var barsContributionsYScale = d3.scaleBand()
			.range([barsPanel.padding[0], barsPanel.height - barsPanel.padding[2]])
			.paddingOuter(0.1)
			.paddingInner(0.4);

		var barsAllocationsYScale = d3.scaleBand()
			.range([barsPanel.padding[0], barsPanel.height - barsPanel.padding[2]])
			.paddingOuter(0.1)
			.paddingInner(0.4);

		var barsContributionsXScale = d3.scaleLinear()
			.range([barsPanel.barsSpace, barsPanel.padding[3]]);

		var barsAllocationsXScale = d3.scaleLinear()
			.range([0, barsPanel.barsSpace - barsPanel.padding[1]]);

		var linksWidthScale = d3.scaleLinear()
			.range([1, 12]);

		var linksYPosScale = d3.scalePoint();

		var beeswarmXScale = d3.scaleLinear()
			.range([beeswarmPanel.padding[3], beeswarmPanel.width - beeswarmPanel.padding[1]]);

		var beeswarmYScale = d3.scalePoint()
			.domain(["Contributions", "Allocations"])
			.range([beeswarmPanel.padding[0], beeswarmPanel.height - beeswarmPanel.padding[2]])
			.padding(0.75);

		var bottomScaleValues = d3.scaleLinear()
			.range([bottomPanel.padding[3], bottomPanel.width - bottomPanel.padding[1]]);

		var barsContributionsYAxis = d3.axisRight(barsContributionsYScale)
			.tickPadding(flagPadding);

		var barsAllocationsYAxis = d3.axisLeft(barsAllocationsYScale);

		var barsContributionsXAxis = d3.axisBottom(barsContributionsXScale)
			.tickPadding(2)
			.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIInteger(d)
			});

		var barsAllocationsXAxis = d3.axisBottom(barsAllocationsXScale)
			.tickPadding(2)
			.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]))
			.tickSizeOuter(0)
			.ticks(5)
			.tickFormat(function(d) {
				return "$" + formatSIInteger(d)
			});

		var beeswarmXAxis = d3.axisBottom(beeswarmXScale)
			.tickFormat(function(d) {
				return "$" + formatSIInteger(d)
			})
			.tickSizeOuter(0)
			.ticks(5);

		var beeswarmYAxis = d3.axisLeft(beeswarmYScale)
			.tickPadding(30)
			.tickSizeInner(-(beeswarmPanel.width - beeswarmPanel.padding[1] - beeswarmPanel.padding[3]));

		var file1 = d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv", filterYearContribution);

		var file2 = d3.csv("https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund?poolfundAbbrv=&$format=csv", filterYearAllocation);

		Promise.all([file1, file2]).then(function(rawData) {

			removeProgressWheel();

			var aggregatedDataContributions = [];

			var aggregatedDataAllocations = [];

			var tempSet = new Set();

			rawData[0].forEach(function(d) {
				if (tempSet.has(d.GMSDonorName)) {
					var tempObject = aggregatedDataContributions.find(function(e) {
						return e.donor === d.GMSDonorName
					});
					tempObject.donations.push({
						cbpf: d.PooledFundName,
						amountPaid: +d.PaidAmt,
						amountPledge: +d.PledgeAmt
					});
					tempObject.totalPaid += +d.PaidAmt;
					tempObject.totalPledge += +d.PledgeAmt;
				} else {
					aggregatedDataContributions.push({
						donor: d.GMSDonorName,
						isoCode: d.GMSDonorISO2Code.toLowerCase(),
						donations: [{
							cbpf: d.PooledFundName,
							amountPaid: +d.PaidAmt,
							amountPledge: +d.PledgeAmt
						}],
						totalPaid: +d.PaidAmt,
						totalPledge: +d.PledgeAmt
					});
					tempSet.add(d.GMSDonorName);
				}
			});

			tempSet.clear();

			rawData[1].forEach(function(d) {
				if (tempSet.has(d.PooledFundName)) {
					var tempObject = aggregatedDataAllocations.find(function(e) {
						return e.cbpf === d.PooledFundName
					});
					tempObject.organizations.push({
						type: d.OrganizationType,
						budget: +d.ApprovedBudget
					});
					tempObject.totalBudget += +d.ApprovedBudget;
					tempObject.totalReserve += +d.ApprovedReserveBudget;
					tempObject.totalStandard += +d.ApprovedStandardBudget;
					tempObject.totalPipeline += +d.PipelineBudget;
				} else {
					aggregatedDataAllocations.push({
						cbpf: d.PooledFundName,
						organizations: [{
							type: d.OrganizationType,
							budget: +d.ApprovedBudget
						}],
						totalBudget: +d.ApprovedBudget,
						totalReserve: +d.ApprovedReserveBudget,
						totalStandard: +d.ApprovedStandardBudget,
						totalPipeline: +d.PipelineBudget,
						donors: []
					});
					tempSet.add(d.PooledFundName);
				}
			});

			rawData[0].forEach(function(d) {
				var tempObject = aggregatedDataAllocations.find(function(e) {
					return e.cbpf === d.PooledFundName
				});
				tempObject.donors.push({
					donor: d.GMSDonorName,
					amount: +d.PaidAmt
				});
			});

			var partnersList = [...new Set(rawData[1].map(function(d) {
				return d.OrganizationType
			}))];

			tempSet.clear();

			var allDonorFlags = aggregatedDataContributions.map(function(d) {
				return d.isoCode;
			});

			var preloadedImages = preloadedImagesDiv.selectAll(null)
				.data(allDonorFlags)
				.enter()
				.append("img")
				.attr("src", function(d) {
					return flagsDirectory + d + ".png";
				});

			preloadedImages.on("load", function(d) {
				var canvas = document.createElement("canvas");
				canvas.width = 24;
				canvas.height = 24;

				var context = canvas.getContext("2d");
				context.drawImage(this, 0, 0);

				var dataURL = canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");

				localStorage.setItem("storedFlag" + d, dataURL);
			});

			d3.select(window).on("scroll", function() {

				var amountScrolled = window.pageYOffset;

				if (amountScrolled > ((distancetoTop - windowHeight) + height / 10) &&
					amountScrolled < (distancetoTop + height * 0.9)) {
					if (!started) {
						draw(aggregatedDataContributions, aggregatedDataAllocations, partnersList);
					}
				}

				if (started) {
					if (amountScrolled < (distancetoTop - windowHeight) ||
						amountScrolled > (distancetoTop + height)) {
						restart();
					}
				}

			});

			(function checkPosition() {

				var amountScrolled = window.pageYOffset;

				if (amountScrolled > ((distancetoTop - windowHeight) + height / 10) &&
					amountScrolled < (distancetoTop + height * 0.9)) {
					if (!started) {
						draw(aggregatedDataContributions, aggregatedDataAllocations, partnersList);
					}
				}

				if (started) {
					if (amountScrolled < (distancetoTop - windowHeight) ||
						amountScrolled > (distancetoTop + height)) {
						restart();
					}
				}

			})();
		});

		function draw(dataContributions, dataAllocations, partnersList) {

			started = true;

			dataContributions.forEach(function(d) {
				d.totalPaidPlusPledge = d.totalPaid + d.totalPledge;
			});

			dataContributions.sort(function(a, b) {
				return d3.descending(a.totalPaidPlusPledge, b.totalPaidPlusPledge)
			});

			dataAllocations.sort(function(a, b) {
				return d3.descending(a.totalBudget, b.totalBudget)
			});

			var top10Contributions = dataContributions.slice(0, 10);

			var top10Allocations = dataAllocations.slice(0, 10);

			var otherContributions = {
				donor: "Other Donors",
				donorsList: [],
				donations: [],
				totalPaid: 0,
				totalPledge: 0
			};

			dataContributions.slice(10).forEach(function(d) {
				otherContributions.totalPaid += d.totalPaid;
				otherContributions.totalPledge += d.totalPledge;
				otherContributions.donorsList.push(d.donor)
				d.donations.forEach(function(e) {
					var found = otherContributions.donations.filter(function(f) {
						return e.cbpf === f.cbpf
					})[0];
					if (found) {
						found.amountPaid += e.amountPaid;
						found.amountPledge += e.amountPledge;
						found.donorsFromOthers.push(d.donor);
					} else {
						otherContributions.donations.push({
							cbpf: e.cbpf,
							amountPaid: e.amountPaid,
							amountPledge: e.amountPledge,
							donorsFromOthers: [d.donor]
						})
					}
				})
			});

			otherContributions.totalPaidPlusPledge = otherContributions.totalPaid + otherContributions.totalPledge;

			var otherAllocations = {
				cbpf: "Other CBPFs",
				cbpfList: [],
				donors: [],
				organizations: [],
				totalBudget: 0,
				totalReserve: 0,
				totalStandard: 0,
				totalPipeline: 0
			};

			dataAllocations.slice(10).forEach(function(d) {
				otherAllocations.totalBudget += d.totalBudget;
				otherAllocations.totalReserve += d.totalReserve;
				otherAllocations.totalStandard += d.totalStandard;
				otherAllocations.totalPipeline += d.totalPipeline;
				otherAllocations.cbpfList.push(d.cbpf);
				d.donors.forEach(function(e) {
					var found = otherAllocations.donors.filter(function(f) {
						return e.donor === f.donor
					})[0];
					if (found) {
						found.amount += e.amount;
					} else {
						otherAllocations.donors.push({
							donor: e.donor,
							amount: e.amount
						})
					}
				});
				d.organizations.forEach(function(e) {
					var found = otherAllocations.organizations.filter(function(f) {
						return e.type === f.type
					})[0];
					if (found) {
						found.budget += e.budget;
					} else {
						otherAllocations.organizations.push({
							type: e.type,
							budget: e.budget
						})
					}
				});
			});

			top10Contributions.push(otherContributions);

			top10Allocations.push(otherAllocations);

			var totalPaidAllCountries = d3.sum(dataContributions, function(d) {
				return d.totalPaid;
			});

			var totalPledgeAllCountries = d3.sum(dataContributions, function(d) {
				return d.totalPledge;
			});

			var totalAmountAllCountries = totalPaidAllCountries + totalPledgeAllCountries;

			var totalAllocatedAllCountries = d3.sum(dataAllocations, function(d) {
				return d.totalBudget;
			});

			var totalPipelineAllCountries = d3.sum(dataAllocations, function(d) {
				return d.totalPipeline;
			});

			var top10ContributionsNames = top10Contributions.map(function(d) {
				return d.donor
			});

			var top10AllocationsNames = top10Allocations.map(function(d) {
				return d.cbpf
			});

			var partnersData = partnersList.map(function(d) {
				return {
					partner: d,
					value: d3.sum(dataAllocations, function(e) {
						var found = e.organizations.find(function(f) {
							return f.type === d
						});
						return found ? found.budget : 0;
					}),
					get percentage() {
						return this.value / totalAllocatedAllCountries;
					}
				}
			});

			barsContributionsYScale.domain(top10ContributionsNames);

			barsAllocationsYScale.domain(top10AllocationsNames);

			linksYPosScale.range([-barsContributionsYScale.bandwidth() / 4, barsContributionsYScale.bandwidth() / 4])

			var maxXValue = d3.max([d3.max(top10Contributions, function(d) {
				return d.totalPaidPlusPledge
			}), d3.max(top10Allocations, function(d) {
				return d.totalBudget
			})]);

			barsContributionsXScale.domain([0, ~~(maxXValue * 1.05)]);

			barsAllocationsXScale.domain([0, ~~(maxXValue * 1.05)]);

			beeswarmXScale.domain([0, ~~(maxXValue * 1.05)]);

			//TOP PANEL

			var topPanelTitle = topPanel.main.selectAll(null)
				.data([year + " CBPF Contributions", year + " CBPF Allocations"])
				.enter()
				.append("text")
				.attr("class", "cbpfbptopPanelTitle")
				.attr("text-anchor", "middle")
				.attr("y", 16)
				.attr("x", function(_, i) {
					return i ? (barsPanel.barsSpace * 1.5) + barsPanel.centralSpace : barsPanel.barsSpace / 2;
				})
				.text(function(d) {
					return d
				});

			var topPanelGroup = topPanel.main.selectAll(null)
				.data([totalAmountAllCountries, totalAllocatedAllCountries])
				.enter()
				.append("g")
				.attr("transform", function(_, i) {
					return "translate(" + (i ? (barsPanel.barsSpace * 1.5) + barsPanel.centralSpace - (topPanelGroupWidth / 2) :
						(barsPanel.barsSpace / 2) - (topPanelGroupWidth / 2)) + ",0)"
				});

			var topPanelMoneyBag = topPanelGroup.append("g")
				.attr("class", function(_, i) {
					return i ? "allocationColorFill" : "contributionColorFill";
				})
				.attr("transform", "translate(0,26) scale(0.6)");

			topPanelMoneyBag.append("path")
				.attr("d", moneyBagd1);

			topPanelMoneyBag.append("path")
				.attr("d", moneyBagd2);

			topPanelMoneyBag.append("path")
				.attr("d", moneyBagd3);

			topPanelMoneyBag.append("path")
				.attr("d", moneyBagd4);

			var topValueMain = topPanelGroup.append("text")
				.attr("class", function(_, i) {
					return i ? "cbpfbptopValueMain allocationColorFill" : "cbpfbptopValueMain contributionColorFill";
				})
				.attr("y", 56)
				.attr("x", topPanel.moneyBagPadding);

			topValueMain.transition()
				.duration(duration)
				.tween("text", function(d) {
					var node = this;
					var i = d3.interpolate(0, d);
					return function(t) {
						var siString = formatSIInteger(i(t))
						node.textContent = "$" + siString.substring(0, siString.length - 1);
					};
				})
				.on("end", function(d, i) {
					var finalValue = formatSIInteger(d);
					var unit = finalValue[finalValue.length - 1]
					var thisBox = this.getBBox();
					var topValueUnits = d3.select(this.parentNode).append("text")
						.style("opacity", 0)
						.attr("pointer-events", "none")
						.attr("class", "cbpfbptopValueUnits")
						.attr("y", 52)
						.attr("x", thisBox.x + thisBox.width + 10);

					topValueUnits.append("tspan")
						.text(unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "")
						.append("tspan")
						.attr("dy", "1.1em")
						.attr("x", thisBox.x + thisBox.width + 10)
						.text(i ? "Allocated" : "Received");

					topValueUnits.transition()
						.duration(duration / 2)
						.style("opacity", 1);
				});

			var topPanelRects = topPanel.main.selectAll(null)
				.data([1, 1])
				.enter()
				.append("rect")
				.attr("x", function(_, i) {
					return i ? topPanel.width / 2 : 0
				})
				.attr("y", 26)
				.attr("width", topPanel.width / 2 - 2)
				.attr("height", topPanel.height - 26)
				.style("opacity", 0)
				.on("mousemove", function(_, i) {
					var mouse = d3.mouse(this)[0];
					tooltip.style("display", "block").html(i ? "Received amount: <span class='allocationColorHTMLcolor'>$" + formatMoney2Decimals(totalAllocatedAllCountries) +
						"</span><br>Under approval: <span class='allocationColorHTMLcolor'>$" + formatMoney2Decimals(totalPipelineAllCountries) + "</span>" :
						"Paid amount: <span class='contributionColorHTMLcolor'>$" + formatMoney2Decimals(totalPaidAllCountries) +
						"</span><br>Pledged amount: <span class='contributionColorHTMLcolor'>$" + formatMoney2Decimals(totalPledgeAllCountries) + "</span>");
					var tooltipSize = tooltip.node().getBoundingClientRect();
					tooltip.style("top", d3.event.pageY - 26 + "px")
						.style("left", mouse < topPanel.width - 16 - tooltipSize.width ?
							d3.event.pageX + 16 + "px" : d3.event.pageX - (tooltipSize.width + 8) + "px");
				})
				.on("mouseout", function() {
					tooltip.style("display", "none");
				});

			//END TOP PANEL

			//BARS PANEL

			var barsContributionsTitle = barsPanel.main.append("text")
				.attr("text-anchor", "end")
				.attr("class", "cbpfbpbarsPanelTitle")
				.attr("y", barsPanel.padding[0] - 12)
				.attr("dominant-baseline", "ideographic")
				.attr("x", barsPanel.barsSpace)
				.text("Top 10 Contributions");

			var barsAllocationsTitle = barsPanel.main.append("text")
				.attr("class", "cbpfbpbarsPanelTitle")
				.attr("y", barsPanel.padding[0] - 12)
				.attr("dominant-baseline", "ideographic")
				.attr("x", barsPanel.barsSpace + barsPanel.centralSpace)
				.text("Top 10 Allocations");

			var barsTransition = d3.transition()
				.duration(duration);

			var gBarsContributionsYAxis = barsPanel.main.append("g")
				.attr("class", "cbpfbpgBarsContributionsYAxis")
				.attr("transform", "translate(" + barsPanel.barsSpace + ",0)")
				.style("opacity", 0)
				.call(barsContributionsYAxis);

			gBarsContributionsYAxis.transition(barsTransition)
				.style("opacity", 1);

			var gBarsAllocationsYAxis = barsPanel.main.append("g")
				.attr("class", "cbpfbpgBarsAllocationsYAxis")
				.attr("transform", "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + ",0)")
				.style("opacity", 0)
				.call(barsAllocationsYAxis);

			gBarsAllocationsYAxis.transition(barsTransition)
				.style("opacity", 1);

			gBarsContributionsYAxis.selectAll(".tick text").each(function(d) {
				wrapLabels(d, this);
			});

			gBarsAllocationsYAxis.selectAll(".tick text").each(function(d) {
				wrapLabels(d, this);
			});

			var gBarsContributionsXAxis = barsPanel.main.append("g")
				.attr("class", "cbpfbpgBarsContributionsXAxis")
				.attr("transform", "translate(0, " + (barsPanel.height - barsPanel.padding[2]) + ")")
				.style("opacity", 0)
				.call(barsContributionsXAxis);

			gBarsContributionsXAxis.transition(barsTransition)
				.style("opacity", 1);

			var gBarsAllocationsXAxis = barsPanel.main.append("g")
				.attr("class", "cbpfbpgBarsAllocationsXAxis")
				.attr("transform", "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + ", " + (barsPanel.height - barsPanel.padding[2]) + ")")
				.style("opacity", 0)
				.call(barsAllocationsXAxis);

			gBarsAllocationsXAxis.transition(barsTransition)
				.style("opacity", 1);

			d3.selectAll(".cbpfbpgBarsContributionsXAxis, .cbpfbpgBarsAllocationsXAxis")
				.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			var barsContributions = barsPanel.main.selectAll(null)
				.data(top10Contributions)
				.enter()
				.append("g")
				.attr("transform", function(d) {
					return "translate(0," + barsContributionsYScale(d.donor) + ")"
				});

			var barsContributionsRects = barsContributions.append("rect")
				.attr("class", "cbpfbpbarsContributionsRects")
				.attr("x", barsPanel.barsSpace)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsContributionsYScale.bandwidth())
				.classed("contributionColorFill", true);

			barsContributionsRects.transition(barsTransition)
				.attr("x", function(d) {
					return barsContributionsXScale(d.totalPaidPlusPledge)
				})
				.attr("width", function(d) {
					return barsPanel.barsSpace - barsContributionsXScale(d.totalPaidPlusPledge)
				});

			var barsAllocations = barsPanel.main.selectAll(null)
				.data(top10Allocations)
				.enter()
				.append("g")
				.attr("transform", function(d) {
					return "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + "," + barsAllocationsYScale(d.cbpf) + ")"
				});

			var barsAllocationsRects = barsAllocations.append("rect")
				.attr("class", "cbpfbpbarsAllocationsRects")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsAllocationsYScale.bandwidth())
				.classed("allocationColorFill", true);

			barsAllocationsRects.transition(barsTransition)
				.attr("width", function(d) {
					return barsAllocationsXScale(d.totalBudget);
				});

			var barsContributionsLabels = barsContributions.append("text")
				.attr("class", "cbpfbpbarsLabels")
				.attr("text-anchor", "end")
				.attr("dominant-baseline", "central")
				.attr("x", barsPanel.barsSpace - barsContributionsLabelsPadding)
				.attr("y", barsContributionsYScale.bandwidth() / 2);

			barsContributionsLabels.transition(barsTransition)
				.attr("x", function(d) {
					return barsContributionsXScale(d.totalPaidPlusPledge) - barsContributionsLabelsPadding
				})
				.tween("text", function(d) {
					var node = this;
					var i = d3.interpolate(0, d.totalPaidPlusPledge);
					return function(t) {
						node.textContent = "$" + formatSIInteger(i(t));
					};
				});

			var barsAllocationsLabels = barsAllocations.append("text")
				.attr("class", "cbpfbpbarsLabels")
				.attr("dominant-baseline", "central")
				.attr("x", barsContributionsLabelsPadding)
				.attr("y", barsAllocationsYScale.bandwidth() / 2);

			barsAllocationsLabels.transition(barsTransition)
				.attr("x", function(d) {
					return barsAllocationsXScale(d.totalBudget) + barsContributionsLabelsPadding
				})
				.tween("text", function(d) {
					var node = this;
					var i = d3.interpolate(0, d.totalBudget);
					return function(t) {
						node.textContent = "$" + formatSIInteger(i(t));
					};
				});

			var barsContributionsOverRect = barsContributions.append("rect")
				.attr("class", "cbpfbpbarsContributionsOverRect")
				.style("opacity", 0)
				.attr("x", barsPanel.barsSpace)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsContributionsYScale.bandwidth())
				.classed("contributionColorDarkerFill", true);

			var barsAllocationsOverRect = barsAllocations.append("rect")
				.attr("class", "cbpfbpbarsAllocationsOverRect")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsAllocationsYScale.bandwidth())
				.classed("allocationColorDarkerFill", true);

			var barsContributionsOverLine = barsContributions.append("line")
				.attr("class", "cbpfbpbarsContributionsOverLine")
				.style("opacity", 0)
				.style("stroke", "white")
				.style("stroke-width", "2px")
				.attr("x1", barsPanel.barsSpace)
				.attr("x2", barsPanel.barsSpace)
				.attr("y1", 0)
				.attr("y2", barsContributionsYScale.bandwidth());

			var barsAllocationsOverLine = barsAllocations.append("line")
				.attr("class", "cbpfbpbarsAllocationsOverLine")
				.style("opacity", 0)
				.style("stroke", "white")
				.style("stroke-width", "2px")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", 0)
				.attr("y2", barsAllocationsYScale.bandwidth());

			var barsContributionsOverText = barsContributions.append("text")
				.attr("class", "cbpfbpbarsContributionsOverText")
				.attr("dominant-baseline", "middle")
				.attr("y", barsContributionsYScale.bandwidth() / 2)
				.attr("x", barsPanel.barsSpace)
				.style("opacity", 0);

			var barsAllocationsOverText = barsAllocations.append("text")
				.attr("class", "cbpfbpbarsAllocationsOverText")
				.attr("dominant-baseline", "middle")
				.attr("y", barsAllocationsYScale.bandwidth() / 2)
				.attr("x", 0)
				.style("opacity", 0);

			var barsMiddleText = barsPanel.main.append("text")
				.attr("class", "cbpfbpbarsMiddleText")
				.attr("pointer-events", "none")
				.attr("x", barsPanel.width / 2)
				.attr("y", barsPanel.padding[0] - 8)
				.attr("dominant-baseline", "ideographic")
				.attr("text-anchor", "middle")
				.style("opacity", 0);

			var flags = barsContributions.append("image")
				.attr("width", 24)
				.attr("height", 24)
				.attr("y", -3)
				.attr("x", barsPanel.barsSpace + 8)
				.attr("xlink:href", function(d) {
					return d.donor === "Other Donors" ? null :
						localStorage.getItem("storedFlag" + d.isoCode) ? "data:image/png;base64," + localStorage.getItem("storedFlag" + d.isoCode) :
						flagsDirectory + d.isoCode + ".png";
				})
				.style("opacity", 0);

			flags.transition(barsTransition)
				.style("opacity", 1);

			var linksData = [];

			top10Contributions.forEach(function(d) {
				var counter = -1;
				var thisBoxContributions = gBarsContributionsYAxis.selectAll(".tick text")
					.filter(function(e) {
						return e === d.donor;
					}).node().getBBox();
				linksWidthScale.domain([0, d.totalPaid]);
				var numberOfLinks = d.donations.length;
				linksYPosScale.domain(d3.range(numberOfLinks));
				d.donations.forEach(function(e) {
					var donorsNames = e.donorsFromOthers ? e.donorsFromOthers : null;
					var cbpfName = otherAllocations.cbpfList.indexOf(e.cbpf) > -1 ? "Other CBPFs" : e.cbpf;
					if (top10AllocationsNames.indexOf(cbpfName) > -1) {
						counter += 1;
						var thisBoxAllocations = gBarsAllocationsYAxis.selectAll(".tick text")
							.filter(function(f) {
								return f === cbpfName;
							}).node().getBBox();
						linksData.push({
							source: {
								value: e.amountPaid,
								donor: d.donor,
								donorNames: donorsNames,
								x: barsPanel.barsSpace + thisBoxContributions.width + barsContributionsYAxis.tickPadding() +
									barsContributionsYAxis.tickSizeInner() + 4,
								y: barsContributionsYScale(d.donor) + barsContributionsYScale.bandwidth() / 2 - linksYPosScale(counter)
							},
							target: {
								value: e.amountPaid,
								cbpf: cbpfName,
								cbpfNameInOthers: e.cbpf,
								x: barsPanel.barsSpace + barsPanel.centralSpace - thisBoxAllocations.width - barsAllocationsYAxis.tickPadding() -
									barsAllocationsYAxis.tickSizeInner() - 4,
								y: barsAllocationsYScale(cbpfName) + barsAllocationsYScale.bandwidth() / 2
							},
							width: linksWidthScale(e.amountPaid)
						})
					}
				})
			});

			var linkGenerator = d3.linkHorizontal()
				.x(function(d) {
					return d.x;
				})
				.y(function(d) {
					return d.y;
				});

			var links = barsPanel.main.selectAll(null)
				.data(linksData)
				.enter()
				.append("path")
				.style("stroke", "slategray")
				.style("fill", "none")
				.style("stroke-width", function(d) {
					return d.width + "px"
				})
				.style("opacity", 0)
				.attr("pointer-events", "none")
				.attr("d", linkGenerator);

			links.transition(barsTransition)
				.style("opacity", 0.1);

			var barsContributionsTooltipRect = barsContributions.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", barsContributionsYScale.bandwidth())
				.attr("width", function(d) {
					var thisTick = gBarsContributionsYAxis.selectAll(".tick text")
						.filter(function(e) {
							return e === d.donor
						}).node().getBBox().width;
					return barsPanel.barsSpace + thisTick + barsContributionsYAxis.tickPadding() +
						barsContributionsYAxis.tickSizeInner();
				})
				.style("opacity", 0)
				.attr("pointer-events", "none");

			var barsAllocationsTooltipRect = barsAllocations.append("rect")
				.attr("y", 0)
				.attr("height", barsAllocationsYScale.bandwidth())
				.attr("width", function(d) {
					var thisTick = gBarsAllocationsYAxis.selectAll(".tick text")
						.filter(function(e) {
							return e === d.cbpf
						}).node().getBBox().width;
					localVariable.set(this, thisTick)
					return barsPanel.barsSpace + thisTick;
				})
				.attr("x", function() {
					return -localVariable.get(this) - barsAllocationsYAxis.tickPadding() -
						barsAllocationsYAxis.tickSizeInner();
				})
				.style("opacity", 0)
				.attr("pointer-events", "none");

			d3.timeout(function() {
				barsContributionsTooltipRect.attr("pointer-events", "all");
				barsAllocationsTooltipRect.attr("pointer-events", "all");
				links.attr("pointer-events", "auto");
			}, duration);

			barsContributionsTooltipRect.on("mouseenter", mouseenterBarsContributions)
				.on("mousemove", mousemoveBarsContributions)
				.on("mouseout", mouseoutBarsContributions);

			barsAllocationsTooltipRect.on("mouseenter", mouseenterBarsAllocations)
				.on("mousemove", mousemoveBarsAllocations)
				.on("mouseout", mouseoutBarsAllocations);

			links.on("mouseenter", mouseenterLinks)
				.on("mousemove", mousemoveLinks)
				.on("mouseout", mouseoutLinks);

			//END BARS PANEL

			//BEESWARM PANEL

			var beeswarmTitle = beeswarmPanel.main.append("text")
				.attr("class", "cbpfbpbarsPanelTitle")
				.attr("y", beeswarmPanel.padding[0] - 2)
				.attr("x", beeswarmPanel.titlePadding)
				.text("All Contributions and Allocations");

			var gBeeswarmXAxis = beeswarmPanel.main.append("g")
				.attr("class", "cbpfbpgBeeswarmXAxis")
				.attr("transform", "translate(0, " + (beeswarmPanel.height - beeswarmPanel.padding[2]) + ")")
				.call(beeswarmXAxis);

			var gBeeswarmYAxis = beeswarmPanel.main.append("g")
				.attr("class", "cbpfbpgBeeswarmYAxis")
				.attr("transform", "translate(" + beeswarmPanel.padding[3] + ",0)")
				.call(beeswarmYAxis);

			var verticalLine = beeswarmPanel.main.append("line")
				.style("stroke-width", "1px")
				.style("stroke-dasharray", "2, 2")
				.style("stroke", "#ccc")
				.attr("pointer-events", "none");

			beeswarmYScale.domain().forEach(function(d) {
				drawBeeswarm(d);
			});

			function drawBeeswarm(category) {

				var beeswarmData = category === "Contributions" ? JSON.parse(JSON.stringify(dataContributions)) :
					JSON.parse(JSON.stringify(dataAllocations));

				var maximumTicks = d3.min([beeswarmData.length * 2, 150]);

				var simulation = d3.forceSimulation(beeswarmData)
					.force("x", d3.forceX(function(d) {
						return category === "Contributions" ? beeswarmXScale(d.totalPaidPlusPledge) :
							beeswarmXScale(d.totalBudget)
					}).strength(1))
					.force("y", d3.forceY(function(d) {
						return beeswarmYScale(category)
					}).strength(0.1))
					.force("collide", d3.forceCollide(function(d) {
						return (circleRadius) + 0.5;
					}))
					.stop();

				for (var i = 0; i < maximumTicks; i++) simulation.tick();

				var circles = beeswarmPanel.main.selectAll(null)
					.data(beeswarmData)
					.enter()
					.append("circle")
					.attr("r", circleRadius)
					.attr("cx", beeswarmXScale(0))
					.attr("cy", beeswarmYScale(category))
					.attr("class", category === "Contributions" ? "contributionColorFill" : "allocationColorFill");

				circles.transition()
					.delay(secondDelay)
					.duration(duration)
					.attr("cx", function(d) {
						return d.x
					})
					.attr("cy", function(d) {
						return d.y
					})
					.on("end", function() {
						beeswarmTransitionEnded = true;
					});

				circles.on("mouseover", function(d) {
						var name = category === "Contributions" ? "donor" : "cbpf";
						var value = category === "Contributions" ? "totalPaidPlusPledge" : "totalBudget";
						var displayName = category === "Contributions" ? "Donor" : "CBPF";
						var circleClass = category === "Contributions" ? "contributionColorHTMLcolor" : "allocationColorHTMLcolor";
						verticalLine.attr("x1", beeswarmXScale(d[value]))
							.attr("x2", beeswarmXScale(d[value]))
							.attr("y1", d.y)
							.attr("y2", beeswarmPanel.height - beeswarmPanel.padding[2])
							.style("opacity", 1);
						gBeeswarmXAxis.select("path").style("stroke", "#ccc");
						beeswarmPanel.main.selectAll("circle")
							.style("opacity", function(e) {
								return e[name] === d[name] ? 1 : 0.15;
							});
						tooltip.style("display", "block").html(displayName + ": <strong><span class=" + circleClass + ">" + d[name] + "</span></strong><br>" +
							category + ": $" + formatMoney2Decimals(d[value]));
						var mouse = d3.mouse(this)[0];
						var tooltipSize = tooltip.node().getBoundingClientRect();
						tooltip.style("top", d3.event.pageY - tooltipSize.height - 20 + "px")
							.style("left", mouse > beeswarmPanel.width - (tooltipSize.width / 2) ? d3.event.pageX - (mouse - (beeswarmPanel.width - (tooltipSize.width))) + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");
					})
					.on("mouseout", function() {
						beeswarmPanel.main.selectAll("circle").style("opacity", 1);
						tooltip.style("display", "none");
						verticalLine.style("opacity", 0);
						gBeeswarmXAxis.select("path").style("stroke", "none");
					});

				//end of drawBeeswarm
			}

			//ENDS BEESWARM PANEL

			//BOTTOM PANEL

			var sortingOrder = ["National NGO", "UN", "Red Cross/Crescent Movement", "International NGO"];

			partnersData.sort(function(a, b) {
				return sortingOrder.indexOf(a.partner) > sortingOrder.indexOf(b.partner) ? 1 : -1
			});

			var partnersNamesData = partnersData.map(function(d) {
				return {
					name: d.partner
				}
			});

			var bottomPanelTitle = bottomPanel.main.append("text")
				.attr("class", "cbpfbpbarsPanelTitle")
				.attr("y", bottomPanel.padding[0])
				.attr("x", bottomPanel.padding[3])
				.text("All Allocations by Partner");

			var bottomBars = bottomPanel.main.selectAll(null)
				.data(partnersData)
				.enter()
				.append("rect")
				.attr("class", function(d) {
					return d.partner.replace(/[^a-zA-Z]+/g, '') + "PartnerColor";
				})
				.attr("y", bottomPanel.padding[0] + 10)
				.attr("x", bottomPanel.padding[3])
				.attr("height", bottomBarsHeight)
				.attr("width", 0)
				.attr("stroke", "white");

			bottomBars.transition()
				.delay(thirdDelay)
				.duration(duration)
				.attr("x", (d, i) => {
					if (i === 0) {
						d.cumulativePercentage = 0;
						return bottomScaleValues(0);
					} else {
						var counter = 0;
						for (var j = 0; j < i; j++) {
							counter += partnersData[j].percentage;
						};
						d.cumulativePercentage = counter;
						return bottomScaleValues(counter);
					}
				})
				.attr("width", function(d) {
					return bottomScaleValues(d.percentage) - bottomPanel.padding[3]
				});

			var bottomNames = bottomPanel.main.selectAll(null)
				.data(partnersNamesData)
				.enter()
				.append("text")
				.attr("class", "cbpfbpbottomNames")
				.attr("dominant-baseline", "hanging")
				.attr("text-anchor", "middle")
				.style("opacity", 0)
				.attr("y", bottomPanel.height - bottomPanel.padding[2])
				.text(function(d) {
					return d.name;
				});

			bottomNames.attr("x", function(d, i) {
				var found = partnersData.find(function(e) {
					return e.partner === d.name
				});
				var middlePosition = bottomScaleValues(found.cumulativePercentage) + (bottomScaleValues(found.percentage) - bottomPanel.padding[3]) / 2;
				if (!i) {
					var thisBox = this.getBBox().width;
					return (found.textPosition = middlePosition < (bottomPanel.padding[3] + thisBox / 2) ?
						(bottomPanel.padding[3] + thisBox / 2) : middlePosition);
				} else {
					var previousPosition = this.previousSibling.getBBox();
					var thisBox = this.getBBox();
					return (found.textPosition = middlePosition - (thisBox.width / 2) < previousPosition.x + previousPosition.width ?
						previousPosition.x + previousPosition.width + 16 + (thisBox.width / 2) : middlePosition);
				}
			});

			var bottomPolylines = bottomPanel.main.selectAll(null)
				.data(partnersData)
				.enter()
				.append("polyline")
				.style("stroke-width", "1px")
				.style("stroke", "#888")
				.style("fill", "none")
				.style("opacity", 0)
				.attr("points", function(d) {
					return "" + (bottomScaleValues(d.cumulativePercentage) - bottomPanel.padding[3] / 2 + bottomScaleValues(d.percentage) / 2) + "," +
						(bottomPanel.padding[0] + 12 + bottomBarsHeight) + " " + (bottomScaleValues(d.cumulativePercentage) - bottomPanel.padding[3] / 2 + bottomScaleValues(d.percentage) / 2) +
						"," + (bottomPanel.padding[0] + 16 + bottomBarsHeight) + " " + d.textPosition + "," + (bottomPanel.padding[0] + 16 + bottomBarsHeight) +
						" " + d.textPosition + "," + (bottomPanel.height - bottomPanel.padding[2] - 2)
				});

			bottomNames.transition()
				.delay(thirdDelay)
				.duration(duration)
				.style("opacity", 1);

			bottomPolylines.transition()
				.delay(thirdDelay)
				.duration(duration)
				.style("opacity", 1);

			bottomBars.on("mousemove", function(d, i) {
					bottomBars.style("opacity", function(_, j) {
						return i === j ? 1 : 0.15
					});
					bottomNames.style("opacity", function(e) {
						return e.name === d.partner ? 1 : 0.15;
					});
					bottomPolylines.style("opacity", function(e) {
						return e.partner === d.partner ? 1 : 0.15;
					});
					tooltip.style("display", "block").html("Partner: " + d.partner + "<br>Allocation: $" + formatMoney2Decimals(d.value) +
						"<br>(" + formatPercent2Decimals(d.percentage) + " of the total)");
					var mouse = d3.mouse(this)[0];
					var tooltipSize = tooltip.node().getBoundingClientRect();
					tooltip.style("top", d3.event.pageY - tooltipSize.height - 20 + "px")
						.style("left", mouse > bottomPanel.width - (tooltipSize.width / 2) ?
							d3.event.pageX - (mouse - (bottomPanel.width - (tooltipSize.width))) + "px" :
							mouse < (tooltipSize.width / 2) ?
							d3.event.pageX - mouse + "px" :
							d3.event.pageX - tooltipSize.width / 2 + "px");
				})
				.on("mouseout", function() {
					bottomPolylines.style("opacity", 1)
					bottomNames.style("opacity", 1);
					bottomBars.style("opacity", 1);
					tooltip.style("display", "none");
				});

			//END BOTTOM PANEL

			function mouseenterBarsContributions(d, barNumber) {
				barsContributions.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels").style("opacity", function(e) {
					return e.donor === d.donor ? 1 : 0.15
				});
				gBarsContributionsYAxis.selectAll(".tick").style("opacity", function(e) {
					return e === d.donor ? 1 : 0.15
				});
				links.style("opacity", function(e) {
					return e.source.donor === d.donor ? 0.2 : 0;
				});
				barsAllocations.each(function(e) {
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
									amount: a.amount + b.amount
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
					if (donorFound === undefined || donorFound.amount === 0) {
						thisGroup.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels")
							.style("opacity", 0.15);
						gBarsAllocationsYAxis.selectAll(".tick").filter(function(f) {
								return f === e.cbpf;
							})
							.style("opacity", 0.15);
					} else {
						thisGroup.select(".cbpfbpbarsAllocationsOverRect")
							.transition()
							.duration(shortDuration)
							.style("opacity", 1)
							.attr("width", barsAllocationsXScale(donorFound.amount));
						thisGroup.select(".cbpfbpbarsAllocationsOverLine")
							.transition()
							.duration(shortDuration)
							.style("opacity", 1)
							.attr("x1", barsAllocationsXScale(donorFound.amount))
							.attr("x2", barsAllocationsXScale(donorFound.amount));
						thisGroup.select(".cbpfbpbarsAllocationsOverText")
							.transition()
							.duration(shortDuration)
							.style("opacity", (barsAllocationsXScale(e.totalBudget) - barsAllocationsXScale(donorFound.amount)) < 20 && barsAllocationsXScale(donorFound.mount) < 20 ? 0 : 1)
							.attr("x", barsAllocationsXScale(donorFound.amount) > 24 ?
								barsAllocationsXScale(donorFound.amount) - 4 :
								barsAllocationsXScale(donorFound.amount) + 4)
							.attr("text-anchor", barsAllocationsXScale(donorFound.amount) > 24 ? "end" : "start")
							.text(formatPercent(donorFound.amount / e.totalBudget) === "0%" ? "<1%" : formatPercent(donorFound.amount / e.totalBudget))
					}
				});
				var donorText = d.donor === "Other Donors" ? "Donors" : "Donor"
				var donorCountry = d.donor === "Other Donors" ? generateOtherDonorsList(d.donorsList) : d.donor;
				tooltip.style("display", "block").html(donorText + ": <strong><span class='contributionColorHTMLcolor'>" + donorCountry +
					"</span></strong><br style=\"line-height:170%;\"/><div id=contributionsTooltipBar></div>Total Paid: <span class='contributionColorDarkerHTMLcolor' style='font-weight:700;'>$" + formatMoney2Decimals(d.totalPaid) +
					" (" + formatPercent(d.totalPaid / d.totalPaidPlusPledge) +
					")</span><br>Total Pledged: <span class='contributionColorHTMLcolor' style='font-weight:700;'>$" + formatMoney2Decimals(d.totalPledge) +
					" (" + formatPercent(d.totalPledge / d.totalPaidPlusPledge) + ")</span>");
				createContributionsTooltipBar(d);
				var tooltipSize = tooltip.node().getBoundingClientRect();
				localVariable.set(tooltip.node(), tooltipSize);
				var mouse = d3.mouse(this)[0];
				tooltip.style("top", barNumber === 10 ? d3.event.pageY - tooltipSize.height - 6 + "px" : d3.event.pageY + 20 + "px")
					.style("left", mouse < (tooltipSize.width / 2) ? d3.event.pageX - mouse + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");
				barsMiddleText.text("Donated to...")
					.style("opacity", 1);
				highlightBeeswarm(d, "Contributions");
				flags.style("opacity", function(e) {
					return e.donor === d.donor ? 1 : 0.15;
				});
				//end of mouseenterBarsContributions
			};

			function mouseenterBarsAllocations(d, barNumber) {
				barsAllocations.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels").style("opacity", function(e) {
					return e.cbpf === d.cbpf ? 1 : 0.15
				});
				gBarsAllocationsYAxis.selectAll(".tick").style("opacity", function(e) {
					return e === d.cbpf ? 1 : 0.15
				});
				links.style("opacity", function(e) {
					return e.target.cbpf === d.cbpf ? 0.2 : 0;
				})
				barsContributions.each(function(e) {
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
									amountPaid: a.amountPaid + b.amountPaid
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
					if (cbpfFound === undefined || cbpfFound.amountPaid === 0) {
						thisGroup.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels")
							.style("opacity", 0.15);
						gBarsContributionsYAxis.selectAll(".tick").filter(function(f) {
								return f === e.donor;
							})
							.style("opacity", 0.15);
					} else {
						thisGroup.select(".cbpfbpbarsContributionsOverRect")
							.transition()
							.duration(shortDuration)
							.style("opacity", 1)
							.attr("x", barsContributionsXScale(cbpfFound.amountPaid))
							.attr("width", barsPanel.barsSpace - barsContributionsXScale(cbpfFound.amountPaid));
						thisGroup.select(".cbpfbpbarsContributionsOverLine")
							.transition()
							.duration(shortDuration)
							.style("opacity", 1)
							.attr("x1", barsContributionsXScale(cbpfFound.amountPaid))
							.attr("x2", barsContributionsXScale(cbpfFound.amountPaid));
						thisGroup.select(".cbpfbpbarsContributionsOverText")
							.transition()
							.duration(shortDuration)
							.style("opacity", (barsContributionsXScale(cbpfFound.amountPaid) - barsContributionsXScale(e.totalPaidPlusPledge)) < 20 && barsPanel.barsSpace - barsContributionsXScale(cbpfFound.amountPaid) < 20 ? 0 : 1)
							.attr("x", barsPanel.barsSpace - barsContributionsXScale(cbpfFound.amountPaid) < 24 ?
								barsContributionsXScale(cbpfFound.amountPaid) - 4 :
								barsContributionsXScale(cbpfFound.amountPaid) + 4)
							.attr("text-anchor", barsPanel.barsSpace - barsContributionsXScale(cbpfFound.amountPaid) < 24 ? "end" : "start")
							.text(formatPercent(cbpfFound.amountPaid / e.totalPaidPlusPledge) === "0%" ? "<1%" : formatPercent(cbpfFound.amountPaid / e.totalPaidPlusPledge));
					}
				});
				var cbpfText = d.cbpf === "Other CBPFs" ? "CBPFs" : "CBPF"
				var cbpfCountry = d.cbpf === "Other CBPFs" ? d.cbpfList.slice(0, d.cbpfList.length - 1).join(", ") + " and " + d.cbpfList[d.cbpfList.length - 1] : d.cbpf;
				tooltip.style("display", "block").html(cbpfText + ": <strong><span class='allocationColorHTMLcolor'>" + cbpfCountry + "</span></strong><br style=\"line-height:170%;\"/>Total received: $" + formatMoney2Decimals(d.totalBudget) +
					"<br>Under approval: $" + formatMoney2Decimals(d.totalPipeline) + "<br style=\"line-height:170%;\"/><div id=allocationsTooltipBar></div>Standard: <span class='allocationColorDarkerHTMLcolor' style='font-weight:700;'>$" + formatMoney2Decimals(d.totalStandard) +
					" (" + formatPercent(d.totalStandard / d.totalBudget) +
					")</span><br>Reserve: <span class='allocationColorHTMLcolor' style='font-weight:700;'>$" + formatMoney2Decimals(d.totalReserve) + " (" + formatPercent(d.totalReserve / d.totalBudget) +
					")</span><br style=\"line-height:170%;\"/>Allocations by Partner:<div id='cbpfbptooltipDonutDiv'></div>");
				createAllocationsTooltipBar(d);
				createTooltipSVG(d.organizations);
				var tooltipSize = tooltip.node().getBoundingClientRect();
				localVariable.set(tooltip.node(), tooltipSize);
				var mouse = d3.mouse(this)[0];
				tooltip.style("top", barNumber > 7 ? d3.event.pageY - tooltipSize.height - 6 + "px" : d3.event.pageY + 20 + "px")
					.style("left", mouse > barsPanel.width - (tooltipSize.width / 2) ? d3.event.pageX - mouse + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");
				barsMiddleText.text("Received from...")
					.style("opacity", 1);
				highlightBeeswarm(d, "Allocations");
				var donorsList = d.donors.map(function(e) {
					return e.donor
				});
				flags.style("opacity", function(e) {
					return donorsList.indexOf(e.donor) > -1 ? 1 : 0.15;
				});
				//end of mouseenterBarsAllocations
			};

			function mousemoveBarsContributions(_, barNumber) {
				var tooltipSize = localVariable.get(tooltip.node());
				var mouse = d3.mouse(this)[0];
				tooltip.style("top", barNumber === 10 ? d3.event.pageY - tooltipSize.height - 6 + "px" : d3.event.pageY + 20 + "px")
					.style("left", mouse < (tooltipSize.width / 2) ? d3.event.pageX - mouse + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");
			}

			function mousemoveBarsAllocations(_, barNumber) {
				var tooltipSize = localVariable.get(tooltip.node());
				var mouse = d3.mouse(this)[0];
				tooltip.style("top", barNumber > 7 ? d3.event.pageY - tooltipSize.height - 6 + "px" : d3.event.pageY + 20 + "px")
					.style("left", mouse > barsPanel.barsSpace - (tooltipSize.width / 2) ? d3.event.pageX - (mouse - (barsPanel.barsSpace - (tooltipSize.width))) + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");
			}

			function mouseoutBarsContributions(d) {
				barsPanel.main.selectAll("*").interrupt();
				clearContributions();
				tooltip.style("display", "none");
				barsMiddleText.style("opacity", 0);
				links.style("opacity", 0.1);
				restoreBeeswarm();
				flags.style("opacity", 1);
				//end of mouseoutBarsContributions
			};

			function mouseoutBarsAllocations(d) {
				barsPanel.main.selectAll("*").interrupt();
				clearAllocations();
				tooltip.style("display", "none");
				barsMiddleText.style("opacity", 0);
				links.style("opacity", 0.1);
				restoreBeeswarm();
				flags.style("opacity", 1);
				//end of mouseoutBarsAllocations
			};

			function mouseenterLinks(d) {
				links.style("opacity", 0);
				d3.select(this).style("opacity", 0.4);
				var thisBarsContributionsGroup = barsContributions.filter(function(e) {
					return e.donor === d.source.donor;
				});
				var thisBarsAllocationsGroup = barsAllocations.filter(function(e) {
					return e.cbpf === d.target.cbpf;
				});
				var thisDonor = top10Contributions.find(function(e) {
					return e.donor === d.source.donor
				});
				var thisCbpf = top10Allocations.find(function(e) {
					return e.cbpf === d.target.cbpf
				});
				barsContributions.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels")
					.style("opacity", function(e) {
						return e.donor === d.source.donor ? 1 : 0.15;
					});
				barsAllocations.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels")
					.style("opacity", function(e) {
						return e.cbpf === d.target.cbpf ? 1 : 0.15;
					});
				gBarsContributionsYAxis.selectAll(".tick").style("opacity", function(e) {
					return e === d.source.donor ? 1 : 0.15
				});
				gBarsAllocationsYAxis.selectAll(".tick").style("opacity", function(e) {
					return e === d.target.cbpf ? 1 : 0.15
				});
				thisBarsContributionsGroup.select(".cbpfbpbarsContributionsOverRect")
					.transition()
					.duration(shortDuration)
					.style("opacity", 1)
					.attr("x", barsContributionsXScale(d.source.value))
					.attr("width", barsPanel.barsSpace - barsContributionsXScale(d.source.value));
				thisBarsContributionsGroup.select(".cbpfbpbarsContributionsOverLine")
					.transition()
					.duration(shortDuration)
					.style("opacity", 1)
					.attr("x1", barsContributionsXScale(d.source.value))
					.attr("x2", barsContributionsXScale(d.source.value));
				thisBarsContributionsGroup.select(".cbpfbpbarsContributionsOverText")
					.transition()
					.duration(shortDuration)
					.style("opacity", 1)
					.attr("x", barsPanel.barsSpace - barsContributionsXScale(d.source.value) < 24 ?
						barsContributionsXScale(d.source.value) - 4 :
						barsContributionsXScale(d.source.value) + 4)
					.attr("text-anchor", barsPanel.barsSpace - barsContributionsXScale(d.source.value) < 24 ? "end" : "start")
					.text(formatPercent(d.source.value / thisDonor.totalPaidPlusPledge));
				thisBarsAllocationsGroup.select(".cbpfbpbarsAllocationsOverRect")
					.transition()
					.duration(shortDuration)
					.style("opacity", 1)
					.attr("width", barsAllocationsXScale(d.target.value));
				thisBarsAllocationsGroup.select(".cbpfbpbarsAllocationsOverLine")
					.transition()
					.duration(shortDuration)
					.style("opacity", 1)
					.attr("x1", barsAllocationsXScale(d.target.value))
					.attr("x2", barsAllocationsXScale(d.target.value));
				thisBarsAllocationsGroup.select(".cbpfbpbarsAllocationsOverText")
					.transition()
					.duration(shortDuration)
					.style("opacity", 1)
					.attr("x", barsAllocationsXScale(d.target.value) > 24 ?
						barsAllocationsXScale(d.target.value) - 4 :
						barsAllocationsXScale(d.target.value) + 4)
					.attr("text-anchor", barsAllocationsXScale(d.target.value) > 24 ? "end" : "start")
					.text(formatPercent(d.target.value / thisCbpf.totalBudget));
				var thisCbpfName = d.target.cbpf === "Other CBPFs" ? "Other CBPFs (" + d.target.cbpfNameInOthers + ")" : d.target.cbpf;
				var thisDonorName = d.source.donor === "Other Donors" ? "Other Donors (" + d.source.donorNames.join(", ") + ")" : d.source.donor;
				tooltip.style("display", "block").html("Donor: <strong><span class='contributionColorHTMLcolor'>" +
					thisDonorName + "</span></strong><br>CBPF: <strong><span class='allocationColorHTMLcolor'>" + thisCbpfName + "</span></strong><br style=\"line-height:170%;\"/>Value: $" +
					formatMoney2Decimals(d.source.value));
				var tooltipSize = tooltip.node().getBoundingClientRect();
				localVariable.set(tooltip.node(), tooltipSize);
				tooltip.style("top", d3.event.pageY - tooltipSize.height - 20 + "px")
					.style("left", d3.event.pageX - tooltipSize.width / 2 + "px");
				flags.style("opacity", function(e) {
					return e.donor === thisDonor.donor ? 1 : 0.15;
				});
				highlightBeeswarmLinks(d.source, d.target);
				//end of mouseenterLinks
			};

			function mousemoveLinks(d) {
				var tooltipSize = localVariable.get(tooltip.node());
				tooltip.style("top", d3.event.pageY - tooltipSize.height - 20 + "px")
					.style("left", d3.event.pageX - tooltipSize.width / 2 + "px");
				//end of mousemoveLinks
			};

			function mouseoutLinks() {
				barsPanel.main.selectAll("*").interrupt();
				clearContributions();
				clearAllocations();
				links.style("opacity", 0.1);
				tooltip.style("display", "none");
				flags.style("opacity", 1);
				restoreBeeswarm();
				//end of mouseoutLinks
			};

			function clearContributions() {
				barsContributions.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels")
					.style("opacity", 1);
				gBarsContributionsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsAllocations.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels")
					.style("opacity", 1);
				gBarsAllocationsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsAllocations.selectAll(".cbpfbpbarsAllocationsOverRect")
					.style("opacity", 0)
					.attr("width", 0);
				barsAllocations.selectAll(".cbpfbpbarsAllocationsOverLine")
					.style("opacity", 0)
					.attr("x1", 0)
					.attr("x2", 0);
				barsAllocations.selectAll(".cbpfbpbarsAllocationsOverText")
					.style("opacity", 0)
					.attr("x", 0);
				//end of clearContributions
			};

			function clearAllocations() {
				barsAllocations.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels")
					.style("opacity", 1);
				gBarsAllocationsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsContributions.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels")
					.style("opacity", 1);
				gBarsContributionsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsContributions.selectAll(".cbpfbpbarsContributionsOverRect")
					.style("opacity", 0)
					.attr("x", barsPanel.barsSpace)
					.attr("width", 0);
				barsContributions.selectAll(".cbpfbpbarsContributionsOverLine")
					.style("opacity", 0)
					.attr("x1", barsPanel.barsSpace)
					.attr("x2", barsPanel.barsSpace);
				barsContributions.selectAll(".cbpfbpbarsContributionsOverText")
					.style("opacity", 0)
					.attr("x", barsPanel.barsSpace);
				//end of clearAllocations
			};

			function highlightBeeswarm(datum, type) {
				if (!beeswarmTransitionEnded) return;
				var dataList = datum.donor === "Other Donors" ? "donorsList" : datum.cbpf === "Other CBPFs" ? "cbpfList" : null;
				var thisCircle = [];
				var prop = type === "Contributions" ? "donor" : "cbpf";
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
						}
						if (d[prop] === datum[prop]) {
							found = true;
							thisCircle.push({
								x: d3.select(this).attr("cx"),
								y: d3.select(this).attr("cy"),
								fill: d3.select(this).style("fill")
							});
						}
						return found ? 1 : 0.15;
					});
				verticalLine.attr("x1", beeswarmXScale(datum.totalPaidPlusPledge || datum.totalBudget))
					.attr("x2", beeswarmXScale(datum.totalPaidPlusPledge || datum.totalBudget))
					.attr("y1", Object.keys(datum)[0] === "donor" ? beeswarmYScale("Contributions") : beeswarmYScale("Allocations"))
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
					.attr("class", "cbpfbpenlargedCircles")
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
					.attr("class", "cbpfbpenlargedCircles")
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
				var secondLine = verticalLine.clone();
				var circleDonor = theseCircles.find(function(d) {
					return d.type === "donor"
				});
				var circleCBPF = theseCircles.find(function(d) {
					return d.type === "cbpf"
				});
				verticalLine.attr("x1", circleDonor ? circleDonor.x : 0)
					.attr("x2", circleDonor ? circleDonor.x : 0)
					.attr("y1", beeswarmYScale("Contributions"))
					.attr("y2", beeswarmPanel.height - beeswarmPanel.padding[2])
					.style("opacity", circleDonor ? 1 : 0);
				secondLine.attr("class", "cbpfbpsecondVerticalLine")
					.attr("x1", circleCBPF.x)
					.attr("x2", circleCBPF.x)
					.attr("y1", beeswarmYScale("Allocations"))
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
				d3.selectAll(".cbpfbpenlargedCircles").remove();
				d3.select(".cbpfbpsecondVerticalLine").remove();
				//end of restoreBeeswarm
			};

			function createTooltipSVG(partners) {

				partners.sort(function(a, b) {
					return d3.ascending(a.budget, b.budget)
				});

				var svgTooltipWidth = 250,
					svgTooltipGroupSpace = 18,
					squareSize = 14,
					svgTooltipPaddings = [10, 50, 10, 50],
					donutRadius = (svgTooltipWidth - svgTooltipPaddings[3] - svgTooltipPaddings[1]) / 2,
					textRadius = donutRadius - 10,
					svgTooltipHeight = (svgTooltipWidth - svgTooltipPaddings[3] - svgTooltipPaddings[1] + svgTooltipPaddings[0] +
						svgTooltipPaddings[2]) + (svgTooltipGroupSpace * partners.length) - (svgTooltipGroupSpace - squareSize);

				var svgTooltip = d3.select("#cbpfbptooltipDonutDiv")
					.append("svg")
					.attr("width", svgTooltipWidth)
					.attr("height", svgTooltipHeight)
					.style("background-color", "#f1f1f1");

				var totalValue = d3.sum(partners, function(d) {
					return d.budget;
				});

				var pie = d3.pie()
					.sort(null)
					.value(function(d) {
						return d.budget;
					});

				var arc = d3.arc()
					.outerRadius(donutRadius - 15)
					.innerRadius(donutRadius - 45);

				var donutGroup = svgTooltip.append("g")
					.attr("transform", "translate(" + (svgTooltipPaddings[3] + donutRadius) + "," + (svgTooltipPaddings[0] + donutRadius) + ")");

				var donutSlice = donutGroup.selectAll(null)
					.data(pie(partners))
					.enter()
					.append("g");

				var donutSlicePath = donutSlice.append("path")
					.attr("class", function(d) {
						return d.data.type.replace(/[^a-zA-Z]+/g, '') + "PartnerColor"
					})
					.transition()
					.duration(shortDuration)
					.attrTween("d", function(d) {
						d.innerRadius = 0;
						var i = d3.interpolate({
							startAngle: 0,
							endAngle: 0
						}, d);
						return function(t) {
							return arc(i(t));
						};
					});

				var donutSliceText = donutSlice.append("text")
					.attr("font-size", "12px")
					.attr("font-family", "Roboto")
					.style("fill", "darkslategray")
					.attr("text-anchor", function(d, i) {
						return i === 0 && (d.value / totalValue) < 0.1 ? "middle" : (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
					})
					.attr("dy", function(d) {
						return (d.endAngle + d.startAngle) / 2 < Math.PI / 2 || (d.endAngle + d.startAngle) / 2 > Math.PI * 1.5 ? "0em" : "0.5em";
					})
					.attr("transform", function(d) {
						var c = arc.centroid(d),
							xPos = c[0],
							yPos = c[1],
							h = Math.sqrt(xPos * xPos + yPos * yPos);
						return "translate(" + (xPos / h * textRadius) + "," + (yPos / h * textRadius) + ")";
					})
					.text(function(d) {
						return d3.format(".0%")(d.value / totalValue)
					});

				var legendsGroup = svgTooltip.selectAll(null)
					.data(partners)
					.enter()
					.append("g")
					.attr("transform", function(_, i) {
						return "translate(0," + ((donutRadius * 2 + svgTooltipPaddings[0] + svgTooltipPaddings[2]) + i * svgTooltipGroupSpace) + ")";
					});

				legendsGroup.append("rect")
					.attr("width", squareSize)
					.attr("height", squareSize)
					.attr("class", function(d) {
						return d.type.replace(/[^a-zA-Z]+/g, '') + "PartnerColor"
					});

				legendsGroup.append("text")
					.style("font-family", "Roboto")
					.style("font-size", "12px")
					.style("fill", "darkslategray")
					.attr("x", 20)
					.attr("y", 11)
					.text(function(d) {
						return d.type
					});

				//end of createTooltipSVG
			};

			function createContributionsTooltipBar(datum) {

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
					.style("border-right", "1px solid white");

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

				//end of createContributionsTooltipBar
			};

			function createAllocationsTooltipBar(datum) {

				var containerDiv = d3.select("#allocationsTooltipBar");

				containerDiv.style("margin-bottom", "8px")
					.style("width", "250px");

				var scaleDiv = d3.scaleLinear()
					.domain([0, datum.totalBudget])
					.range([0, 250]);

				var div1 = containerDiv.append("div")
					.style("float", "left")
					.classed("allocationColorDarkerHTMLbc", true)
					.style("height", "14px")
					.style("width", "0px")
					.style("border-right", scaleDiv(datum.totalStandard) < 1 ? "0px solid white" : "1px solid white");

				div1.transition()
					.duration(shortDuration)
					.style("width", scaleDiv(datum.totalStandard) + "px");

				var div2 = containerDiv.append("div")
					.classed("allocationColorHTMLbc", true)
					.style("margin-left", "0px")
					.style("height", "14px")
					.style("width", "0px");

				div2.transition()
					.duration(shortDuration)
					.style("margin-left", scaleDiv(datum.totalStandard) + 1 + "px")
					.style("width", scaleDiv(datum.totalReserve) + "px");

				//end of createAllocationsTooltipBar
			}

			function generateOtherDonorsList(donorsList) {
				var div = "<div style='margin-left:54px;margin-top:-20px;margin-bottom:-14px'>";
				donorsList.forEach(function(d) {
					var thisIsoCode = dataContributions.filter(function(e) {
						return e.donor === d;
					})[0].isoCode;
					var imageSource = localStorage.getItem("storedFlag" + thisIsoCode) ? "data:image/png;base64," + localStorage.getItem("storedFlag" + thisIsoCode) : flagsDirectory + thisIsoCode + ".png";
					div += "<img src='" + imageSource + "' height='24' width='24' style='margin-bottom:-8px;padding:1px;'>  " + d + "<br>";
				});
				div += "</div>";
				return div;
			}

			//end of draw
		};

		function restart() {
			started = false;
			var all = svg.selectAll(".cbpfbptopPanel, .cbpfbpbarsPanel, .cbpfbpbeeswarmPanel, .cbpfbpbottomPanel")
				.selectAll("*");
			all.interrupt();
			all.remove();
		};

		function filterYearContribution(d) {
			if (+d.FiscalYear === year) {
				return d
			};
		};

		function filterYearAllocation(d) {
			if (+d.AllocationYear === year) {
				return d
			};
		};

		function wrapLabels(label, element) {
			var splitLabel = label.split(" ");
			var em = 1.2;
			var dy = parseFloat(d3.select(element).attr("dy"));
			var x = d3.select(element).attr("x");
			if (splitLabel.length > 1) {
				d3.select(element).text(splitLabel[0])
					.attr("dy", dy - (em / 2) + "em")
					.append("tspan")
					.attr("x", x)
					.attr("dy", em + "em")
					.text(splitLabel[1])
			}
		};

		function formatSIInteger(value) {
			return d3.formatPrefix(".0", value)(value);
		};

		function createProgressWhell() {
			var wheelGroup = svg.append("g")
				.attr("class", "gmslpgwheelGroup")
				.attr("transform", "translate(" + width / 2 + "," + height / 4 + ")");

			var arc = d3.arc()
				.outerRadius(30)
				.innerRadius(25);

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
		}

		function removeProgressWheel() {
			d3.select(".gmslpgwheelGroup").select("path").interrupt().remove();
		}

		//end of d3Chart
	}

	//end of cbpfPageChart
}());
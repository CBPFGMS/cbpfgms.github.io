(function d3ChartIIFE() {

	var userAgent = window.navigator.userAgent;

	var isInternetExplorer = userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1 ? true : false;

	var cssLinks = ["https://cbpfgms.github.io/css/d3chartstyles.css", "https://cbpfgms.github.io/css/d3chartstylescbpfbp.css"];

	const d3URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js";

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

		var width = 743,
			height = 600,
			padding = [4, 4, 4, 4],
			topPanelHeightFactor = 0.17,
			barsPanelHeightFactor = 0.63,
			beeswarmPanelHeightFactor = 0.2,
			panelHorizontalPadding = 6,
			duration = 1500,
			shortDuration = 200,
			formatMoney2Decimals = d3.format(",.2f"),
			formatPercent = d3.format(".0%"),
			formatSI2Decimals = d3.format(".2s"),
			formatSIaxes = d3.format("~s"),
			topPanelGroupWidth = 288,
			barsDonorsLabelsPadding = 4,
			localVariable = d3.local(),
			circleRadius = 4,
			beeswarmTransitionEnded = false,
			flagPadding = 30,
			yearsArray,
			barsHeightUnit = ((height - padding[0] - padding[2] - (2 * panelHorizontalPadding)) * barsPanelHeightFactor) / 11,
			flagsDirectory = "https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/img/flags/";

		var moneyBagd1 = "M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z";
		var moneyBagd2 = "M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z";
		var moneyBagd3 = "M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z";
		var moneyBagd4 = "M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z";

		var windowHeight = window.innerHeight;

		var containerDiv = d3.select("#d3chartcontainercbpfbp");

		var selectedResponsiveness = containerDiv.node().getAttribute("data-responsive");

		if (selectedResponsiveness !== "true" && selectedResponsiveness !== "false") {
			selectedResponsiveness = "true"
		};

		if (selectedResponsiveness === "false" || isInternetExplorer) {
			containerDiv.style("width", width + "px")
				.style("height", height + "px");
		};

		var years = extractYear(containerDiv.node().getAttribute("data-year"));

		var lazyLoad = (containerDiv.node().getAttribute("data-lazyload") === "true");

		var svg = containerDiv.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		var actualSvgSize = svg.node().getBoundingClientRect();

		var actualWidth = actualSvgSize.width;

		var actualHeight = actualSvgSize.height;

		createProgressWhell();

		var tooltip = d3.select("body").append("div")
			.attr("id", "cbpfbptooltipdiv")
			.style("display", "none");

		var topPanel = {
			main: svg.append("g")
				.attr("class", "cbpfbptopPanel")
				.attr("transform", "translate(" + padding[3] + "," + padding[0] + ")"),
			width: width - padding[1] - padding[3],
			height: (height - padding[0] - padding[2] - (2 * panelHorizontalPadding)) * topPanelHeightFactor,
			moneyBagPadding: 70,
			paidValuePadding: 330
		};

		var barsPanel = {
			main: svg.append("g")
				.attr("class", "cbpfbpbarsPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + panelHorizontalPadding) + ")"),
			width: width - padding[1] - padding[3],
			height: (height - padding[0] - padding[2] - (2 * panelHorizontalPadding)) * barsPanelHeightFactor,
			padding: [22, 32, 20, 32],
			centralSpace: 220 + flagPadding,
			get barsSpace() {
				return (this.width - this.centralSpace) / 2;
			}
		};

		var beeswarmPanel = {
			main: svg.append("g")
				.attr("class", "cbpfbpbeeswarmPanel")
				.attr("transform", "translate(" + padding[3] + "," + (padding[0] + topPanel.height + barsPanel.height + (2 * panelHorizontalPadding)) + ")"),
			width: width - padding[1] - padding[3],
			height: (height - padding[0] - padding[2] - (2 * panelHorizontalPadding)) * beeswarmPanelHeightFactor,
			padding: [18, 10, 20, 124],
			titlePadding: 10
		};

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
			.tickPadding(2)
			.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]))
			.tickSizeOuter(0)
			.ticks(3)
			.tickFormat(function(d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		var barsCbpfsXAxis = d3.axisBottom(barsCbpfsXScale)
			.tickPadding(2)
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

		d3.csv("https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?$format=csv", filterYear).then(function(rawData) {

			removeProgressWheel();

			var aggregatedDonors = [];

			var aggregatedCbpfs = [];

			var tempSetDonors = [];

			var tempSetCbpfs = [];

			rawData.forEach(function(d) {
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
			});

			tempSetDonors = [];

			tempSetCbpfs = [];

			aggregatedDonors.sort(function(a, b) {
				return d3.descending(a.totalPaidPlusPledge, b.totalPaidPlusPledge)
			});

			aggregatedCbpfs.sort(function(a, b) {
				return d3.descending(a.totalPaidPlusPledge, b.totalPaidPlusPledge)
			});

			var allDonorFlags = aggregatedDonors.map(function(d) {
				return d.isoCode;
			});

			if (!lazyLoad) {
				draw(aggregatedDonors, aggregatedCbpfs);
			} else {
				d3.select(window).on("scroll.cbpfbp", checkPosition);
				checkPosition();
			};

			function checkPosition() {
				const containerPosition = containerDiv.node().getBoundingClientRect();
				if (!(containerPosition.bottom < 0 || containerPosition.top - windowHeight > 0)) {
					d3.select(window).on("scroll.cbpfbp", null);
					draw(aggregatedDonors, aggregatedCbpfs);
				};
			};

			//end of d3.csv
		});

		function draw(dataDonors, dataCbpfs) {

			saveFlags(dataDonors);

			var maxBarsNumber = Math.max(dataDonors.length, dataCbpfs.length);

			if (maxBarsNumber < 11) {

				barsPanel.height = barsHeightUnit * maxBarsNumber;
				beeswarmPanel.main.attr("transform", "translate(" + padding[3] + "," +
					(padding[0] + topPanel.height + barsPanel.height + (2 * panelHorizontalPadding)) + ")");
				var newHeight = ~~(padding[3] + padding[0] + topPanel.height + barsPanel.height + beeswarmPanel.height + (2 * panelHorizontalPadding));
				svg.attr("viewBox", "0 0 " + width + " " + newHeight);
				if (selectedResponsiveness === "false") {
					containerDiv.style("height", newHeight + "px");
				};
				barsDonorsYScale.range([barsPanel.padding[0], (dataDonors.length * barsHeightUnit) -
					(dataDonors.length > dataCbpfs.length ? barsPanel.padding[2] : 0)
				]);
				barsCbpfsYScale.range([barsPanel.padding[0], (dataCbpfs.length * barsHeightUnit) -
					(dataCbpfs.length > dataDonors.length ? barsPanel.padding[2] : 0)
				]);
				barsDonorsXAxis.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]));
				barsCbpfsXAxis.tickSizeInner(-(barsPanel.height - barsPanel.padding[0] - barsPanel.padding[2]));

			};

			if (maxBarsNumber > 10 && (dataDonors.length < 11 || dataCbpfs.length < 11)) {
				barsDonorsYScale.range([barsPanel.padding[0], dataDonors.length < 11 ?
					(dataDonors.length * barsHeightUnit) - barsPanel.padding[2] :
					barsPanel.height - barsPanel.padding[2]
				]);
				barsCbpfsYScale.range([barsPanel.padding[0], dataCbpfs.length < 11 ?
					(dataCbpfs.length * barsHeightUnit) - barsPanel.padding[2] :
					barsPanel.height - barsPanel.padding[2]
				]);
			};

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

			var topPanelTitle = topPanel.main.append("text")
				.attr("class", "cbpfbptopPanelTitle")
				.attr("text-anchor", "middle")
				.attr("y", 16)
				.attr("x", topPanel.width / 2)
				.text(yearsArray.length === 1 ? yearsArray[0] + " Contributions" :
					yearsArray[0] + " to " + yearsArray[1] + " Contributions");

			var placeholderText1 = svg.append("text")
				.style("opacity", "0")
				.attr("class", "cbpfbptopValueMain")
				.text(formatSIFloat(totalAmountAllCountries));

			var placeholderText2 = svg.append("text")
				.style("opacity", "0")
				.attr("class", "cbpfbptopValueUnits")
				.text("Donated");

			var placeholderWidths = placeholderText1.node().getBBox().width + placeholderText2.node().getBBox().width;

			placeholderText1.remove();
			placeholderText2.remove();

			var topPanelGroup = topPanel.main.append("g")
				.attr("transform", "translate(" + (width / 2 - (topPanel.moneyBagPadding + placeholderWidths) / 2) + ",0)")

			var topPanelMoneyBag = topPanelGroup.append("g")
				.attr("class", "contributionColorFill")
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
				.attr("class", "cbpfbptopValueMain contributionColorFill")
				.attr("y", 78)
				.attr("x", topPanel.moneyBagPadding);

			topValueMain.transition()
				.duration(duration)
				.tween("text", function(d) {
					var node = this;
					var i = d3.interpolate(0, totalAmountAllCountries);
					return function(t) {
						var siString = formatSIFloat(i(t))
						node.textContent = "$" + siString.substring(0, siString.length - 1);
					};
				})
				.on("end", function(d, i) {

					var finalValue = formatSIFloat(totalAmountAllCountries);
					var unit = finalValue[finalValue.length - 1]
					var thisBox = this.getBBox();

					var topValueUnits = d3.select(this.parentNode).append("text")
						.style("opacity", 0)
						.attr("pointer-events", "none")
						.attr("class", "cbpfbptopValueUnits")
						.attr("y", 54)
						.attr("x", thisBox.x + thisBox.width + 10);

					topValueUnits.append("tspan")
						.text(unit === "k" ? "Thousand" : unit === "M" ? "Million" : unit === "G" ? "Billion" : "")
						.append("tspan")
						.attr("dy", "1.1em")
						.attr("x", thisBox.x + thisBox.width + 10)
						.text("Donated");

					topValueUnits.transition()
						.duration(duration / 2)
						.style("opacity", 1);

				});

			var topPanelRect = topPanel.main.append("rect")
				.attr("x", width / 2 - (topPanel.moneyBagPadding + placeholderWidths) / 2)
				.attr("y", 26)
				.attr("width", (topPanel.moneyBagPadding + placeholderWidths))
				.attr("height", topPanel.height - 26)
				.style("opacity", 0)
				.on("mousemove", function() {
					var mouse = d3.mouse(this)[0];
					tooltip.style("display", "block")
						.html("Paid amount: <span class='contributionColorHTMLcolor'>$" + formatMoney2Decimals(totalPaidAllCountries) +
							"</span><br>Pledged amount: <span class='contributionColorHTMLcolor'>$" +
							formatMoney2Decimals(totalPledgeAllCountries) + "</span>");
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

			var barsDonorsTitle = barsPanel.main.append("text")
				.attr("text-anchor", "end")
				.attr("class", "cbpfbpbarsPanelTitle")
				.attr("y", barsPanel.padding[0] - 7)
				.attr("x", barsPanel.barsSpace)
				.text(dataDonors.length > 10 ? "Top 10 Donors" : "Donors");

			var barsCbpfsTitle = barsPanel.main.append("text")
				.attr("class", "cbpfbpbarsPanelTitle")
				.attr("y", barsPanel.padding[0] - 7)
				.attr("x", barsPanel.barsSpace + barsPanel.centralSpace)
				.text(dataCbpfs.length > 10 ? "Top 10 CBPFs" : "CBPFs");

			var barsTransition = d3.transition()
				.duration(duration);

			var gBarsDonorsYAxis = barsPanel.main.append("g")
				.attr("class", "cbpfbpgBarsContributionsYAxis")
				.attr("transform", "translate(" + barsPanel.barsSpace + ",0)")
				.style("opacity", 0)
				.call(barsDonorsYAxis);

			gBarsDonorsYAxis.transition(barsTransition)
				.style("opacity", 1);

			var gBarsCbpfsYAxis = barsPanel.main.append("g")
				.attr("class", "cbpfbpgBarsAllocationsYAxis")
				.attr("transform", "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + ",0)")
				.style("opacity", 0)
				.call(barsCbpfsYAxis);

			gBarsCbpfsYAxis.transition(barsTransition)
				.style("opacity", 1);

			gBarsDonorsYAxis.selectAll(".tick text").each(function(d) {
				wrapLabels(d, this);
			});

			gBarsCbpfsYAxis.selectAll(".tick text").each(function(d) {
				wrapLabels(d, this);
			});

			var gBarsDonorsXAxis = barsPanel.main.append("g")
				.attr("class", "cbpfbpgBarsContributionsXAxis")
				.attr("transform", "translate(0, " + (barsPanel.height - barsPanel.padding[2]) + ")")
				.style("opacity", 0)
				.call(barsDonorsXAxis);

			gBarsDonorsXAxis.transition(barsTransition)
				.style("opacity", 1);

			var gBarsCbpfsXAxis = barsPanel.main.append("g")
				.attr("class", "cbpfbpgBarsAllocationsXAxis")
				.attr("transform", "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + ", " + (barsPanel.height - barsPanel.padding[2]) + ")")
				.style("opacity", 0)
				.call(barsCbpfsXAxis);

			gBarsCbpfsXAxis.transition(barsTransition)
				.style("opacity", 1);

			d3.selectAll(".cbpfbpgBarsContributionsXAxis, .cbpfbpgBarsAllocationsXAxis")
				.selectAll(".tick")
				.filter(function(d) {
					return d === 0;
				})
				.remove();

			var barsDonors = barsPanel.main.selectAll(null)
				.data(top10Donors)
				.enter()
				.append("g")
				.attr("transform", function(d) {
					return "translate(0," + barsDonorsYScale(d.donor) + ")"
				});

			var barsDonorsRects = barsDonors.append("rect")
				.attr("class", "cbpfbpbarsContributionsRects")
				.attr("x", barsPanel.barsSpace)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsDonorsYScale.bandwidth())
				.classed("contributionColorFill", true);

			barsDonorsRects.transition(barsTransition)
				.attr("x", function(d) {
					return barsDonorsXScale(d.totalPaidPlusPledge)
				})
				.attr("width", function(d) {
					return barsPanel.barsSpace - barsDonorsXScale(d.totalPaidPlusPledge)
				});

			var barsCbpfs = barsPanel.main.selectAll(null)
				.data(top10Cbpfs)
				.enter()
				.append("g")
				.attr("transform", function(d) {
					return "translate(" + (barsPanel.barsSpace + barsPanel.centralSpace) + "," + barsCbpfsYScale(d.cbpf) + ")"
				});

			var barsCbpfsRects = barsCbpfs.append("rect")
				.attr("class", "cbpfbpbarsAllocationsRects")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsCbpfsYScale.bandwidth())
				.classed("allocationColorFill", true);

			barsCbpfsRects.transition(barsTransition)
				.attr("width", function(d) {
					return barsCbpfsXScale(d.totalPaidPlusPledge);
				});

			var barsDonorsLabels = barsDonors.append("text")
				.attr("class", "cbpfbpbarsLabels")
				.attr("text-anchor", "end")
				.attr("x", barsPanel.barsSpace - barsDonorsLabelsPadding)
				.attr("y", 4 + barsDonorsYScale.bandwidth() / 2);

			barsDonorsLabels.transition(barsTransition)
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

			var barsCbpfsLabels = barsCbpfs.append("text")
				.attr("class", "cbpfbpbarsLabels")
				.attr("x", barsDonorsLabelsPadding)
				.attr("y", 4 + barsCbpfsYScale.bandwidth() / 2);

			barsCbpfsLabels.transition(barsTransition)
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

			var barsDonorsOverRect = barsDonors.append("rect")
				.attr("class", "cbpfbpbarsContributionsOverRect")
				.style("opacity", 0)
				.attr("x", barsPanel.barsSpace)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsDonorsYScale.bandwidth())
				.classed("contributionColorDarkerFill", true);

			var barsCbpfsOverRect = barsCbpfs.append("rect")
				.attr("class", "cbpfbpbarsAllocationsOverRect")
				.style("opacity", 0)
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", barsCbpfsYScale.bandwidth())
				.classed("allocationColorDarkerFill", true);

			var barsDonorsOverLine = barsDonors.append("line")
				.attr("class", "cbpfbpbarsContributionsOverLine")
				.style("opacity", 0)
				.style("stroke", "white")
				.style("stroke-width", "1px")
				.attr("x1", barsPanel.barsSpace)
				.attr("x2", barsPanel.barsSpace)
				.attr("y1", 0)
				.attr("y2", barsDonorsYScale.bandwidth());

			var barsCbpfsOverLine = barsCbpfs.append("line")
				.attr("class", "cbpfbpbarsAllocationsOverLine")
				.style("opacity", 0)
				.style("stroke", "white")
				.style("stroke-width", "1px")
				.attr("x1", 0)
				.attr("x2", 0)
				.attr("y1", 0)
				.attr("y2", barsCbpfsYScale.bandwidth());

			var barsMiddleText = barsPanel.main.append("text")
				.attr("class", "cbpfbpbarsMiddleText")
				.attr("pointer-events", "none")
				.attr("x", barsPanel.width / 2 + flagPadding / 2)
				.attr("y", barsPanel.padding[0] - 26)
				.attr("text-anchor", "middle");

			var flags = barsDonors.append("image")
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

			flags.transition(barsTransition)
				.style("opacity", 1);

			var linksData = [];

			linksWidthScale.domain([0, totalAmountAllCountries]);

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

			var barsDonorsTooltipRect = barsDonors.append("rect")
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

			var barsCbpfsTooltipRect = barsCbpfs.append("rect")
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

			d3.timeout(function() {
				barsDonorsTooltipRect.attr("pointer-events", "all");
				barsCbpfsTooltipRect.attr("pointer-events", "all");
				links.attr("pointer-events", "auto");
			}, duration * 2);

			barsDonorsTooltipRect.on("mouseenter", mouseenterBarsDonors)
				.on("mousemove", mousemoveBarsDonors)
				.on("mouseout", mouseoutBarsDonors);

			barsCbpfsTooltipRect.on("mouseenter", mouseenterBarsCbpfs)
				.on("mousemove", mousemoveBarsCbpfs)
				.on("mouseout", mouseoutBarsCbpfs);

			links.on("mouseenter", mouseenterLinks)
				.on("mousemove", mousemoveLinks)
				.on("mouseout", mouseoutLinks);

			//END BARS PANEL

			//BEESWARM PANEL

			circleRadius = dataDonors.length > 100 ? 1 :
				dataDonors.length > 50 ? 2 :
				dataDonors.length > 40 ? 2.5 :
				dataDonors.length > 30 ? 3 :
				dataDonors.length > 25 ? 3.5 :
				circleRadius;

			var beeswarmTitle = beeswarmPanel.main.append("text")
				.attr("class", "cbpfbpbarsPanelTitle")
				.attr("y", beeswarmPanel.padding[0] - 2)
				.attr("x", beeswarmPanel.titlePadding)
				.text("All Donors and CBPFs");

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

				var circles = beeswarmPanel.main.selectAll(null)
					.data(beeswarmData)
					.enter()
					.append("circle")
					.attr("r", circleRadius)
					.attr("cx", beeswarmXScale(0))
					.attr("cy", beeswarmYScale(category))
					.attr("class", category === "Donors" ? "contributionColorFill" : "allocationColorFill");

				circles.transition()
					.delay(duration)
					.duration(duration)
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
							description + ": $" + formatMoney2Decimals(d.totalPaidPlusPledge));

						var mouse = d3.mouse(this)[0];
						var tooltipSize = tooltip.node().getBoundingClientRect();

						tooltip.style("top", d3.event.pageY - tooltipSize.height - 20 + "px")
							.style("left", mouse > beeswarmPanel.width - (tooltipSize.width / 2) ? d3.event.pageX - (mouse - (beeswarmPanel.width - (tooltipSize.width))) + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");

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

				barsDonors.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels").style("opacity", function(e) {
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
						thisGroup.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels")
							.style("opacity", 0.05);
						gBarsCbpfsYAxis.selectAll(".tick").filter(function(f) {
								return f === e.cbpf;
							})
							.style("opacity", 0.05);
					} else {

						thisGroup.select(".cbpfbpbarsAllocationsOverRect")
							.transition()
							.duration(shortDuration * 2)
							.style("opacity", 1)
							.attr("width", barsCbpfsXScale(donorFound.amountPaid));

						thisGroup.select(".cbpfbpbarsAllocationsOverLine")
							.transition()
							.duration(shortDuration * 2)
							.style("opacity", 1)
							.attr("x1", barsCbpfsXScale(donorFound.amountPaid))
							.attr("x2", barsCbpfsXScale(donorFound.amountPaid));

						thisGroup.select(".cbpfbpbarsAllocationsRects")
							.transition()
							.duration(shortDuration * 2)
							.attr("width", barsCbpfsXScale(donorFound.amountPaidPlusPledge));

						thisGroup.select(".cbpfbpbarsLabels")
							.transition()
							.duration(shortDuration * 2)
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
										.attr("class", "cbpfbpbarsMiddleText")
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
						"</span></strong><br style='line-height:170%;'/><div id=contributionsTooltipBar></div>Total Paid: <span class='contributionColorDarkerHTMLcolor' style='font-weight:700;'>$" + formatMoney2Decimals(d.totalPaid) +
						" (" + (formatPercent(d.totalPaid / d.totalPaidPlusPledge) === "0%" && d.totalPaid !== 0 ? "<1%" : formatPercent(d.totalPaid / d.totalPaidPlusPledge)) +
						")</span><br>Total Pledged: <span class='contributionColorHTMLcolor' style='font-weight:700;'>$" + formatMoney2Decimals(d.totalPledge) +
						" (" + (formatPercent(d.totalPledge / d.totalPaidPlusPledge) === "0%" && d.totalPledge !== 0 ? "<1%" : formatPercent(d.totalPledge / d.totalPaidPlusPledge)) + ")</span>" + cbpfsInOthersText);

				createDonorsTooltipBar(d);

				if (cbpfsInOthers.length > 0) createTooltipSVG(cbpfsInOthers, "cbpf", "allocationColorFill");

				var tooltipSize = tooltip.node().getBoundingClientRect();
				localVariable.set(tooltip.node(), tooltipSize);
				var mouse = d3.mouse(this)[0];

				tooltip.style("top", barNumber > 7 ? d3.event.pageY - tooltipSize.height - 12 + "px" : d3.event.pageY + 20 + "px")
					.style("left", mouse < (tooltipSize.width / 2) ? d3.event.pageX - mouse + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");

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

				barsCbpfs.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels").style("opacity", function(e) {
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
						thisGroup.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels")
							.style("opacity", 0.05);
						gBarsDonorsYAxis.selectAll(".tick").filter(function(f) {
								return f === e.donor;
							})
							.style("opacity", 0.05);
					} else {

						thisGroup.select(".cbpfbpbarsContributionsOverRect")
							.transition()
							.duration(shortDuration * 2)
							.style("opacity", 1)
							.attr("x", barsDonorsXScale(cbpfFound.amountPaid))
							.attr("width", barsPanel.barsSpace - barsDonorsXScale(cbpfFound.amountPaid));

						thisGroup.select(".cbpfbpbarsContributionsOverLine")
							.transition()
							.duration(shortDuration * 2)
							.style("opacity", 1)
							.attr("x1", barsDonorsXScale(cbpfFound.amountPaid))
							.attr("x2", barsDonorsXScale(cbpfFound.amountPaid));

						thisGroup.select(".cbpfbpbarsContributionsRects")
							.transition()
							.duration(shortDuration * 2)
							.attr("x", barsDonorsXScale(cbpfFound.amountPaidPlusPledge))
							.attr("width", barsPanel.barsSpace - barsDonorsXScale(cbpfFound.amountPaidPlusPledge));

						thisGroup.select(".cbpfbpbarsLabels")
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
										.attr("class", "cbpfbpbarsMiddleText")
										.attr("dy", "-1px")
										.text(percentPaid)
										.append("tspan")
										.attr("class", "cbpfbpbarsLabels")
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
						formatMoney2Decimals(d.totalPaid) + " (" + (formatPercent(d.totalPaid / d.totalPaidPlusPledge) === "0%" && d.totalPaid !== 0 ? "<1%" : formatPercent(d.totalPaid / d.totalPaidPlusPledge)) +
						")</span><br>Pledged donations: <span class='allocationColorHTMLcolor' style='font-weight:700;'>$" +
						formatMoney2Decimals(d.totalPledge) + " (" + (formatPercent(d.totalPledge / d.totalPaidPlusPledge) === "0%" && d.totalPledge !== 0 ? "<1%" : formatPercent(d.totalPledge / d.totalPaidPlusPledge)) +
						")</span>" + donorsInOthersText);

				createCbpfsTooltipBar(d);

				if (donorsInOthers.length > 0) createTooltipSVG(donorsInOthers, "donor", "contributionColorFill");

				var tooltipSize = tooltip.node().getBoundingClientRect();
				localVariable.set(tooltip.node(), tooltipSize);
				var mouse = d3.mouse(this)[0];

				tooltip.style("top", barNumber > 7 ? d3.event.pageY - tooltipSize.height - 6 + "px" : d3.event.pageY + 20 + "px")
					.style("left", mouse > barsPanel.width - (tooltipSize.width / 2) ? d3.event.pageX - mouse + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");

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

				barsDonors.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels")
					.style("opacity", function(e) {
						return e.donor === d.source.donor ? 1 : 0.05;
					});

				barsCbpfs.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels")
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

				thisBarsCbpfsGroup.select(".cbpfbpbarsAllocationsOverRect")
					.transition()
					.duration(shortDuration * 2)
					.style("opacity", 1)
					.attr("width", barsCbpfsXScale(d.source.valuePaid));

				thisBarsCbpfsGroup.select(".cbpfbpbarsAllocationsOverLine")
					.transition()
					.duration(shortDuration * 2)
					.style("opacity", 1)
					.attr("x1", barsCbpfsXScale(d.source.valuePaid))
					.attr("x2", barsCbpfsXScale(d.source.valuePaid));

				thisBarsCbpfsGroup.select(".cbpfbpbarsAllocationsRects")
					.transition()
					.duration(shortDuration * 2)
					.attr("width", barsCbpfsXScale((d.source.valuePaid + d.source.valuePledge)));

				thisBarsCbpfsGroup.select(".cbpfbpbarsLabels")
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
								.attr("class", "cbpfbpbarsMiddleText")
								.attr("dy", "-1px")
								.text(percentPaid);
						};
					});

				thisBarsDonorsGroup.select(".cbpfbpbarsContributionsOverRect")
					.transition()
					.duration(shortDuration * 2)
					.style("opacity", 1)
					.attr("x", barsDonorsXScale(d.target.valuePaid))
					.attr("width", barsPanel.barsSpace - barsDonorsXScale(d.target.valuePaid));

				thisBarsDonorsGroup.select(".cbpfbpbarsContributionsOverLine")
					.transition()
					.duration(shortDuration * 2)
					.style("opacity", 1)
					.attr("x1", barsDonorsXScale(d.target.valuePaid))
					.attr("x2", barsDonorsXScale(d.target.valuePaid));

				thisBarsDonorsGroup.select(".cbpfbpbarsContributionsRects")
					.transition()
					.duration(shortDuration * 2)
					.attr("x", barsDonorsXScale((d.target.valuePaid + d.target.valuePledge)))
					.attr("width", barsPanel.barsSpace - barsDonorsXScale((d.target.valuePaid + d.target.valuePledge)));

				thisBarsDonorsGroup.select(".cbpfbpbarsLabels")
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
								.attr("class", "cbpfbpbarsMiddleText")
								.attr("dy", "-1px")
								.text(percentPaid)
								.append("tspan")
								.attr("class", "cbpfbpbarsLabels")
								.text("$" + formatSIFloat1decimal(i(t)));
						};
					});

				var thisCbpfName = d.target.cbpf === "Other CBPFs" ? "Other CBPFs (" + d.target.cbpfNameInOthers + ")" : d.target.cbpf;
				var thisDonorName = d.source.donor === "Other Donors" ? "Other Donors (" + d.source.donorNames.join(", ") + ")" : d.source.donor;

				tooltip.style("display", "block")
					.html("Donor: <strong><span class='contributionColorHTMLcolor'>" +
						thisDonorName + "</span></strong><br>CBPF: <strong><span class='allocationColorHTMLcolor'>" + thisCbpfName + "</span></strong><br style='line-height:230%;'/>Total paid: $" +
						formatMoney2Decimals(d.source.valuePaid) + "<br>Total pledged: $" + formatMoney2Decimals(d.source.valuePledge));

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

			function mousemoveBarsDonors(_, barNumber) {
				var tooltipSize = localVariable.get(tooltip.node());
				var mouse = d3.mouse(this)[0];
				tooltip.style("top", barNumber > 7 ? d3.event.pageY - tooltipSize.height - 12 + "px" : d3.event.pageY + 20 + "px")
					.style("left", mouse < (tooltipSize.width / 2) ? d3.event.pageX - mouse + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");
			};

			function mousemoveBarsCbpfs(_, barNumber) {
				var tooltipSize = localVariable.get(tooltip.node());
				var mouse = d3.mouse(this)[0];
				tooltip.style("top", barNumber > 7 ? d3.event.pageY - tooltipSize.height - 6 + "px" : d3.event.pageY + 20 + "px")
					.style("left", mouse > barsPanel.barsSpace - (tooltipSize.width / 2) ? d3.event.pageX - (mouse - (barsPanel.barsSpace - (tooltipSize.width))) + "px" : d3.event.pageX - tooltipSize.width / 2 + "px");
			};

			function mousemoveLinks(d) {
				var tooltipSize = localVariable.get(tooltip.node());
				tooltip.style("top", d3.event.pageY - tooltipSize.height - 20 + "px")
					.style("left", d3.event.pageX - tooltipSize.width / 2 + "px");
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

				barsDonors.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels")
					.style("opacity", 1);
				gBarsDonorsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsCbpfs.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels")
					.style("opacity", 1);
				gBarsCbpfsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsCbpfs.selectAll(".cbpfbpbarsAllocationsOverRect")
					.style("opacity", 0)
					.attr("width", 0);
				barsCbpfs.selectAll(".cbpfbpbarsAllocationsOverLine")
					.style("opacity", 0)
					.attr("x1", 0)
					.attr("x2", 0);

				barsCbpfs.selectAll(".cbpfbpbarsAllocationsRects")
					.transition()
					.duration(shortDuration)
					.attr("width", function(d) {
						return barsCbpfsXScale(d.totalPaidPlusPledge)
					})
					.on("end", function() {
						barsCbpfsTooltipRect.attr("pointer-events", "all");
					})

				barsCbpfs.selectAll(".cbpfbpbarsLabels")
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

				barsCbpfs.selectAll(".cbpfbpbarsAllocationsRects, .cbpfbpbarsLabels")
					.style("opacity", 1);
				gBarsCbpfsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsDonors.selectAll(".cbpfbpbarsContributionsRects, .cbpfbpbarsLabels")
					.style("opacity", 1);
				gBarsDonorsYAxis.selectAll(".tick")
					.style("opacity", 1);
				barsDonors.selectAll(".cbpfbpbarsContributionsOverRect")
					.style("opacity", 0)
					.attr("x", barsPanel.barsSpace)
					.attr("width", 0);
				barsDonors.selectAll(".cbpfbpbarsContributionsOverLine")
					.style("opacity", 0)
					.attr("x1", barsPanel.barsSpace)
					.attr("x2", barsPanel.barsSpace);

				barsDonors.selectAll(".cbpfbpbarsContributionsRects")
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

				barsDonors.selectAll("text.cbpfbpbarsLabels")
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

				secondLine.attr("class", "cbpfbpsecondVerticalLine")
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
				d3.selectAll(".cbpfbpenlargedCircles").remove();
				d3.select(".cbpfbpsecondVerticalLine").remove();
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

				var svgTooltip = d3.select("#cbpfbptooltipdiv")
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
					.attr("class", "cbpfbpyAxisTooltip")
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
					.attr("class", "cbpfbpxAxisTooltip")
					.attr("transform", "translate(0," + (svgTooltipHeight - tooltipPadding[2]) + ")")
					.call(xAxisTooltip);

				d3.select(".cbpfbpxAxisTooltip")
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

		function saveFlags(donors) {

			const donorsList = donors.map(function(d) {
				return d.isoCode;
			}).filter(function(value, index, self) {
				return self.indexOf(value) === index;
			});

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

		function extractYear(yearParameter) {
			yearsArray = yearParameter.split(",").map(function(d) {
				return +d
			});
			if (yearsArray.length === 1 && yearsArray[0] === yearsArray[0]) {
				return yearsArray
			} else if (yearsArray.length === 2 && yearsArray[0] === yearsArray[0] && yearsArray[1] === yearsArray[1]) {
				yearsArray.sort();
				return d3.range(yearsArray[0], yearsArray[1] + 1, 1)
			} else {
				return yearsArray = [new Date().getFullYear()]
			}
		}

		function filterYear(d) {
			if (years.indexOf(+d.FiscalYear) > -1) {
				return d
			};
		};

		function wrapLabels(label, element) {
			var splitLabel = label;
			if (splitLabel.length > 10) {
				splitLabel = splitLabel.split(" ");
			} else {
				splitLabel = splitLabel.split()
			}
			if (splitLabel.length > 2) {
				var middleElement = splitLabel.splice(1, 1);
				splitLabel[0] = splitLabel[0] + " " + middleElement;
			}
			var em = 1;
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

		function formatSIFloat(value) {
			var length = (~~Math.log10(value) + 1) % 3;
			var digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			const result = d3.formatPrefix("." + digits + "~", value)(value);
			return parseInt(result) === 1000 ? formatSIFloat(--value) : result;
		};

		function formatSIFloat1decimal(value) {
			var length = (~~Math.log10(value) + 1) % 3;
			var digits = length === 1 ? 1 : 0;
			return d3.formatPrefix("." + digits, value)(value).replace("G", "B");
		};

		function formatSIInteger(value) {
			return d3.formatPrefix(".0", value)(value);
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
	}

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

	//end of d3ChartIIFE
}());
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
			"https://cbpfgms.github.io/css/d3chartstylespbiolc-stg.css",
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

		//Math.log10

		Math.log10 =
			Math.log10 ||
			function (x) {
				return Math.log(x) * Math.LOG10E;
			};

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
			padding = [4, 4, 40, 4],
			topPanelHeight = 60,
			panelHorizontalPadding = 4,
			panelVerticalPadding = 4,
			buttonsPanelHeight = 30,
			clusters = [
				"Water Sanitation Hygiene",
				"Coordination and Support Services",
				"Emergency Shelter and NFI",
				"Health",
				"Food Security",
				"Education",
				"Protection",
				"Nutrition",
				"Logistics",
				"Camp Coordination / Management",
				"Early Recovery",
				"Emergency Telecommunications",
				"Multi-Sector",
				"COVID-19",
				"Multi-purpose CASH",
			],
			numberOfClusters = clusters.length,
			lollipopGroupHeight = 26,
			lollipopTitlePadding = 50,
			titleMargin = 24,
			sortByPadding = 4,
			lollipopPanelsHeight =
				+lollipopTitlePadding + numberOfClusters * lollipopGroupHeight,
			height =
				padding[0] +
				topPanelHeight +
				buttonsPanelHeight +
				2 * panelHorizontalPadding +
				lollipopPanelsHeight +
				padding[2],
			stickHeight = 2,
			lollipopRadius = 4,
			lollipopsPanelsRatio = 0.345,
			buttonsTitleMargin = 4,
			buttonsNumber = 8,
			duration = 1000,
			legendVerticalPadding = 22,
			unBlue = "#1F69B3",
			highlightColor = "#F79A3B",
			chartTitleDefault = "Sector Overview",
			currentDate = new Date(),
			currentYear = currentDate.getFullYear(),
			localStorageTime = 600000,
			csvDateFormat = d3.utcFormat("_%Y%m%d_%H%M%S_UTC"),
			formatSIaxes = d3.format("~s"),
			formatMoney0Decimals = d3.format(",.0f"),
			formatPercent = d3.format(".0%"),
			formatNumberSI = d3.format(".3s"),
			formatComma = d3.format(","),
			clusterSymbolsDirectory = "",
			clusterIconSize = 20,
			clusterIconPadding = 6,
			disabledOpacity = 0.6,
			windowHeight = window.innerHeight,
			symbolSize = 16,
			xScaleDomainMargin = 1.1,
			verticalLabelPadding = 4,
			fadeOpacity = 0.3,
			localVariable = d3.local(),
			tooltipBarWidth = 326,
			vizNameQueryString = "clusters",
			classPrefix = "pbiolc",
			dataFileUrl =
				"https://cbpfapi.unocha.org/vo2/odata/PoolFundBeneficiarySummary?$format=csv&ShowAllPooledFunds=1",
			launchedAllocationsDataUrl =
				"https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&$format=csv",
			bookmarkSite =
				"https://cbpfgms.github.io/cbpf-bi-stag/bookmark.html?",
			helpPortalUrl = "https://gms.unocha.org/content/sectors",
			modalities = ["total", "standard", "reserve"],
			beneficiaries = ["targeted", "actual"],
			moneyBagdAttribute = [
				"M83.277,10.493l-13.132,12.22H22.821L9.689,10.493c0,0,6.54-9.154,17.311-10.352c10.547-1.172,14.206,5.293,19.493,5.56 c5.273-0.267,8.945-6.731,19.479-5.56C76.754,1.339,83.277,10.493,83.277,10.493z",
				"M48.297,69.165v9.226c1.399-0.228,2.545-0.768,3.418-1.646c0.885-0.879,1.321-1.908,1.321-3.08 c0-1.055-0.371-1.966-1.113-2.728C51.193,70.168,49.977,69.582,48.297,69.165z",
				"M40.614,57.349c0,0.84,0.299,1.615,0.898,2.324c0.599,0.729,1.504,1.303,2.718,1.745v-8.177 c-1.104,0.306-1.979,0.846-2.633,1.602C40.939,55.61,40.614,56.431,40.614,57.349z",
				"M73.693,30.584H19.276c0,0-26.133,20.567-17.542,58.477c0,0,2.855,10.938,15.996,10.938h57.54 c13.125,0,15.97-10.938,15.97-10.938C99.827,51.151,73.693,30.584,73.693,30.584z M56.832,80.019 c-2.045,1.953-4.89,3.151-8.535,3.594v4.421H44.23v-4.311c-3.232-0.318-5.853-1.334-7.875-3.047 c-2.018-1.699-3.307-4.102-3.864-7.207l7.314-0.651c0.3,1.25,0.856,2.338,1.677,3.256c0.823,0.911,1.741,1.575,2.747,1.979v-9.903 c-3.659-0.879-6.348-2.22-8.053-3.997c-1.716-1.804-2.565-3.958-2.565-6.523c0-2.578,0.96-4.753,2.897-6.511 c1.937-1.751,4.508-2.767,7.721-3.034v-2.344h4.066v2.344c2.969,0.306,5.338,1.159,7.09,2.565c1.758,1.406,2.877,3.3,3.372,5.658 l-7.097,0.774c-0.43-1.849-1.549-3.118-3.365-3.776v9.238c4.485,1.035,7.539,2.357,9.16,3.984c1.634,1.635,2.441,3.725,2.441,6.289 C59.898,75.656,58.876,78.072,56.832,80.019z",
			],
			cbpfsList = {},
			yearsWithUnderApprovalAboveMin = {},
			topValuesLaunchedData = {},
			chartState = {
				selectedYear: [],
				selectedModality: null,
				selectedBeneficiary: null,
				sorting: "allocations",
				selectedCbpfs: null,
				cbpfsInData: [],
			};

		const clusterIcons = {
			"Water Sanitation Hygiene":
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADBklEQVRoge2ZTWhTWRiGn/eYabWOXQguxqp0qoioC0EZyoCmEcQBBWdhXQwKItKuRGOXLurGYWawiX+gFcGFunEjDAXbjb8VhNGVVkRJqtafjah00dZq7udCw6QhSZPQ1FPIuzqc7/3O+Z577r3n5EaUoZZY8k9Eh6Cm1FyDccHR69GmQ+XMna1QSyyxBdEt1JAxy0tJbdeiP1/NlSTYRxnFf8ut4Wv+lAA4oTMTiv86yyLDugtUccJgvJwJDcYxTpSTm7OUSDxp+YLXo00qZbBcY5U6RqlylRx8OlQF+N6a8QAFH+LplY2a6TWyF5h6AxdcuXVg2dPJsjwCyCGjJ+WCg4VA/L6FxFYXuAfh+ODufBa/AQCJWoedj8QTh3PFvQf4X+oMxxJ7s3tnEAAInQp3PV2W2TezAEStnDuS2TejAABktGauQqiQudIHsUw1d72YM9t93iDsGGhFXqMkx6zfgaPg0Qrc7VgyeiPa1De3bvZasMcFzWJzuukNQFo97Q0jQeCik9ga0w3vAADm/Vhzq1DczBam214C9LQ3jBSKS6pLtx3Gyzy+oSmtqkIKSWozs7OIRRn9Q0Ggtu9RUEsseUfi18l8kXjSMPqn7TVZrEo9HXv5DJSiKsCUy+gv3srtSpZSVVVVTZFaYol/IvHE37li3m1k2dp4LLHJAvoAJLcl+5O/1wC/HX9S/zEVGsg45gzVus+re/cvH057/NsHMjSWCv2VdUZbPJYKTfhN7O0KhLsGm+WCO0ITLrJhgYnwzQNL+8HTFejsNOcUnM4uHkDIuYCTmAk8BbhR/2wH0pq8BmlNJD7YCh7eQq2XbdbbV8mHBb9MAAZP7MPzVd6twNtXiR2TFQ8gWE5943bvAMy0q1ivc7bTOwDgl2KNZtbsHYCk4v9Al0LeAYANFG9lwDsAC7hQrFeyi94BLBgePYdxvwjrveG69+e82wcA1see/RRS8C+wLlfcjP9SuG23Dza+8RIAYG33vR/mjczfg9kfklYCmNkjoUvDc9+dv9++7hPAF0Z96GNzO74WAAAAAElFTkSuQmCC",
			"Coordination and Support Services":
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADiklEQVRogc1ZTU8TURQ9ZwbDD5AdSkIxLgyJ7HBHYWWiiQsxRCWRjRATv4q/wxZdCRtdFA2JCzUaXWFZqTsWxgWGIRFZGxMTUMscF7Sknc7Hm/bZ9uzmzX2957x3b++8+zhxf2tcjpYguQJzpfnMS3QxsnnvAqGCQNeBbnK84H0FcKLyvixgupTLrHSSZBSyBW+KQBFADwAI2nEguTU2PQSK2YI31RmK0QiSr6Ds+HTmAZRrBrtORBR5gredtdzgC1+6jIAISMtjC5vT7aXaiIkF71KQvKR9STPvc5lXrA5GqYzKiWx+8xyIRYoiObuaG3ybhpjJfBNOTnW0lMusCJiGYTgRfESwH8QxQYtpyJvMN11Qp3ZSKZdZMQ4n4ljN0/G0AuLmx4VNMBrqBADA2vzQ86AIki59PGlHTkwseJckPEWAPIBrpfmh5aB9gwCgcyLSkgciBADtF9EMeSBGAHAgIpjYJF1HfGyBcx2C5AGUQV6NIw8kCABiEts+EhM2DIkCgPBw+l8wCZtahK7kYZEB+62yMwBJF0BxvOAVDweF71HFLnQHDotMtyCmWBqFkAG2U88QvttwHL4D5GwKB9u+z9m0jm35YNhgKzj7YKN3z++Zo3RFxDAAUPgMcLnXLS+9u3Pyt01/VgVM3P/W7zt/3xA8HWogrVNHzq/eG9ix5dOagIOVdz9Fkq9CWu9198/Y2glbSYw9v2cukTwAkCN/5F635deaAABXTQ0lc9skWBNA4ZSxsThsy6/NHTCGAN/Wb1kTIOKLqS0pY9sk2AyhYrJVxZYw+lAzgTUBvW55CdJ6oqG0fvTH7pItv9YLmfj3NciRUIP/UMisJvHqvYGdvp+7o6RuAfoI4ReEX5I+kLrV93N31CZ5IGIHUp0HYr7V42DLR+vngVYbWy36sBVCrTa2moaN80A7EHkeCD0TV2Ktod0X0vqwDkn7cjCzdnfIqK4YhVC7yAPpm2eJArIFbyq06WQfDc0zk0uWWAFxXeJWmIah2UuWSAHN9iqbRbO92FAB7SZfRTMiGgR0inwVaUXUCYhM2LAucX2daLWxVTc/riseTOxDAWkv+WqKXauNrdD5pnd2BDofNnEYy29OOuQzBP8JK8WO2bx3gcRzGK58JxAZHcKkA+Bhw4suIg9EhxOovAOoq8lXES6CZYfkDQnfIG0BuNiN5Kso5TIrEiYFeQI2BM79A7D9dwIFdOgTAAAAAElFTkSuQmCC",
			"Emergency Shelter and NFI":
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFNklEQVRoge1ZXWxURRg9Z3YXqqj8tUSSUtilYGOIMcKDJsC2S8Co0cQoTTQxJIQHAsR2KQUUBaoQwba7LRpME+MLkICFGHmByM9miVETiWjiD3/dBQJiFGJr+O/uPT5QSrvdvezeXakPPU/3znxzvnPunTszd4b4DzC38eKIbte11SQXQ5CgNk/ywU0H6sdfLXQuFpRNYqA1/qolNRKc2L9KvxNsmN3l/bShgVahUhbMQCB05inBagUx0y5OwvcusuZQ0PttIfLmbWDOR+fHWt031wpYStKVVSNJIrar26yMrvT+kU9+xwamtx31PHx1zBIQDQRGOuEQdJVA03CT/GB/zdSbTjgcGQiE489ZssIkH7uHwC9uJ+HLtnHSCUMTPBz07stVS04GZrecnmIss5HE/FwEBZrjVRbVQuKJe6Q4CCVrI8un/JKtpqwMzG28OCLhvlYvcTWJ4TbK/xa5uaTzWri9YdqtvlX+dRG3GTlxIYANIEoyc6Ab0CeuW1h7cPXkrvwMSKxqib8BaDPARzPnlAVghyehFQfqy/+0o5y59exoz43EepBLALgzp9ZlgO+XlHo/bq9mMmcD/tDpGQS3kHzGThCgKCzWROp8P9nHpfA3xSuMsVpAPmvLDv0goiZaO/nrdPUDDMwKnRnvZnK9gEUEjQ3zeRBrIrXebSDVT9y6iNuMLHsX4EIBHlI7r1uet76rK7ueShMIdbwooBWkN3MuSeBut9GKg7WTz6U10DssAu+ReCQjGXQdwhZr2PUN0WXTrqSLqAx3rCG4IaV4ayToW5ou/unmcw8UmcSbFN4B8ZCNj2skGq1Osyna4L3Ra6AqHHtJQojE5MzCAUGfu4n61KeQiqpQ7CSIKf2T4x9/l3e03TJiVtOpCW5jGgFUg8zYvSV0kFgeCfr2sioUWwGi0U4QpB9B1kSCviO2cT2oDHUcT50jBHT5O71jslkHVYVjsyG1gnzSVhZUZ0Cssom5JGBxcalvRrbiAQDEtoFF2J7tIi4S9B0pLvXNELAYwCWbRKvcAIrT1CQAfWYlu9dEV1TYEKSHOs9t5qgyD8CFgDwSdt6Q5+1cOHqGzjZ/OL7LyFotMkhgWD/5wDhWhWMa0FrJabnMhvcDgdYzj8uyBmhKO0z+38QDwOGaSb+mK884EzqBv/lUOY3rFQhzSFQA6umevCThOIhDNIndkZqpHYXKWRAD/taTpUy6PwRUTcB1d3bpvZhAYgKAuUq6NlaGY7uM5V55uK7sQr65M8+0WaIqFJtnLPcxEq9l80ND0kXgdTFxLNDSMTff/HkZqGyO+UF9iTsjmTRwQEjFnRiiRMLeQKhjVj4aHBuY13xuDA12AywCAEEXLJnn79WONC8I6uk6LBK4xx+Oj3Kqw7GBbtO9Fj1PXtJlmqQ/Wufdf692h4PefbKsytvLZQBECaG1TnU4MjB/3c/DICy4c09wSS4jS7RuymnJLLtbogXT2456nGhxZOCv0UWzQN5+7VK8uNS7J1eOcRMmtQs6CwAEx4y8MtZ2OyYTnHUhmfLea/Ibuz+mTGivZpJA796QjMrt4jPBoYE+2yjCCUccAAT+1ufW0YfsyABdiT2STkg6YeDa4YQDAGgSO3p55Mq5GwIOZ+KeD7bCSdtC8+Q9Ew82hgwMNoYM2CES9DES9BX2ECUFQ29gsDFkYLAxZGCwMWRgsDFkYLBhBPQ7TZTg6MD5fiCdVkMgdd8/+3MAmyR9H0S6MidIp9UggUUSDkC4Iugrt9GiPJM0QbhCoMmuzBHSaP0XYBkfLLhiquwAAAAASUVORK5CYII=",
			Health: "data:image/png;base64,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",
			"Food Security":
				"data:image/png;base64,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",
			Education:
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA7CAYAAAA9xQlEAAAACXBIWXMAAAsTAAALEwEAmpwYAAACWUlEQVRoge2av2tTURSAv/OSWLCgFrolQ0pc/BfEYiIqUnRw6OzYQQnaTRARHSyIDXWQ2k0noU7S2R/YxUWobtW86qBd/VG1oXnvOLRSTZ7pizftfa/cb0rePfdwP7jnnpdLpFLzFZuoXn46Xpr41/Dxifr+oE8+Rww1gRlv+1a27WRVdSzNAohIJtUCANn2RzoVKnMAGQ8JQ7kmwuGdXlhc2gRC4dHzS6X539/LNf8YJFcg9VvICdgmcQKn733c2018xCm08xy5+2Eg1wjOoIyu/GicrEzWPwGPQ49ZVnnTaW4CBOR8bjW4jpBDQABEikDVU6rBHl3qNNu+gFDoPC5DnYYTVwPd4gRs4wRsk3oB82NUWUNYAKJ+9v1HPj240QdiYSSgylfP0+EnF0uvTfK0Uqn5V4AbcWKNtpDAbK8XDzCYH7qJshIn1rQGDhjOj+Tb8tt+oC9OrJGAip4t1/yxE7eW+03y/MnRqcVCI8jcR8jFiTeqAUE8YLqZ/TldqfkmqTYJ2Xiji0fqj1EnYBvjRqaqDzzxHgYarvViQag36El4FZFDccLNBJT5Z+Olc0Y5Ihi+8/5lthnUEdmynM22kNDzJgbwolpcAr7EiTUTUB05NbW4zyhHBJXb70YQidUkzbaQSLERZBbKk/6coN+Ncm3mLCiMxm0F5m+jIkWBC111n61SdhGb+mPUCdjGCdjGCdjGCdjGCdjGCdjGCdjGCdjGCdhm9wmISv7vJ5pvjUkS0vq3S0VD0fVLJUUyIvT83qeXtF2rCOIhDKx/Tj67rwbShKKvfgFZK5MCBawJXgAAAABJRU5ErkJggg==",
			Protection:
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFOElEQVRoge1YXWwUZRQ9ZxZpaEwoJsaoaNhuIYEor/jAzy5FA0FSBQsYhZoA4UVhdzYRJGohxuBD7RQfrGJ46IMJlMSARDAI+9OCmvhkIjFBdmpC0AewCAiVlp3jQ0vDtjOzu53RxoTzNt+9595zkvm+784QIWNpR+FZiWslLQIxEwAIXJTQK6A7b8ZOhdmPYRVqbCvMKRr4jORi/0zli9SWnmTDL2H0DcVAwrIXQzoCckZFBOkqgaaMGesN2juwgca2whzHwPcVix+BoH45zoJ8evaFIP2NIGQAKEbwSbXiAYDgQ6RxIGh/Nrf+NPVyXe0eSBtHlroevnZr9+E9Tw2WI49s2JNBBIjOslyy4XS5PC+dUy7X1e4hsBMcfZveujy9FgB2lW3ucF3Ql5DiWgBlDXjpNAi1jCtKvVZJc0ELqxHrgTKn1jC8dBoAH3VJd1lzK8rHK8nzhTizskR3nYE3cVAIcILwAxkQdCkIHwAYsEYgAyQDX0QAeoKQAxlwpENB+MNQdxB2IAN5M3ZKQGbiFZTPmg0B+KHcxMZmAFeq5Qnqdxxnc9D+gQ30bpvVR2m1oP5KOYL6DeGFoHMQEIIBAMiYsV6HegZSrlyuoKwcZ0EYkygATAmjCACMzPeJeMeFRoprISwC+MRwVBdB9EI6lAv4zo9FaAbuYmQwKzvbhIWyBpZYfXURYb2o37LJ6DGQ+lcVSUx09K2i+FiROJhPRf/0S/fdA8v3na8x5HwrqhPA0XiH3dXcrUiogu9Bc7ci8Q67C8BRUZ2Uc3b5vvM1fhxfA0OKzAc59+4zwQ1XLtkHWlsV+gzV2irjyiX7AMENo/3IeQNF42k/nr+QSI0N4EbpIlt6pvfthxTaDwFI7Jnetx9gS+kyrtdoqu1H9TVw+o2Zf0jYAGGoJEBsSlh2ZygmJCYsuxPEptJ1DAHYeDL9pO/94mkgbtk7ACBn1h8FnfUA7pQkkFvjlv1pIBMS41bfRyC3li6r6Igbc2b9UQCIt9utPgY04BagtDdu2VsBIJtq+ELAq5KKpR64JdFhWxPVn+iwLRKvjxUP8pV8OnoQABKW/TaJ3e4VNGAI/M41RhLQxwnrwssAkEvVHwLQMtYEwO0Jy26rWrxltwHcPk480DLSC/H2wi4A73lX4VmDKm4TcM01DBqQ0RVvL6wEgJwZ+xzAuy6p6UR74YOKxQ/npsf1I94Z6YFEe2Enyfe9aki4DhWTRtacfS4CrsC402bUxQMkDicse/Ew0XA/FcgdcatglhMf/7CQBrnDVRRoA0C83X4T5F6fMjcYKa7ImrPPjW7AJR2FhYbDEyAedOdoAOJxQI0g6zwK3ymC83tS0Z/dgkv3/TpPjvMjvCYA6aqIHwg+5yld+MsxtCKfjJ0B7jmF8snYGRArBd10Z3IaiDU+4gFgSgRO0rO346Q8xQMAOcNPvKCbEp6/K77EAABkU/U9hmOsknTLR6QvJDb6BJdNvK5uGY6xKpeuz9+7Pu4eyKSjWQFNXsdrBa28/ykRj0yoonCbUnMmHc2OjbleZHkzdopEE6C/q21GstYnOq3aegIGAa3JphuOu8U9b+JMMvYNxAmZCAsCBg3ppZwZ+8orx3cWypr1Jx3HeFHC7fDl+UPAIIHmjBk75pdXdizOp6NfG+R/a0IYErgum6r/slxqRXN9JhU9QTmrvW7sMCHgGsmmfCp6pJL8ij9MsumG40UZc8tnBkNRxtxMKnqi0vyqvqx6zVm/Vy+pOlTbY9J/rwfFfQOTjfsGJhv3DUw2/vcG/gEn4Sfa3kOf1wAAAABJRU5ErkJggg==",
			Nutrition:
				"data:image/png;base64,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",
			Logistics:
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAnCAYAAABJ0cukAAAACXBIWXMAAAsTAAALEwEAmpwYAAAENElEQVRYhe1ZXWgcVRg9Z2ay2/zUvkSwfwnJSuiDDyoBi6ZmExuoNC+CodD4JLXB2rjN1jbagmExCpIwmzQqpOIPCAr+IBoLhSzNtokUWksfLEhrd9KWNhGNtBVCNsnOfD4ku2w2G3cmY7MGe16Wvff7zvkOc+98d+8SLrGj94o3bqmdBJpFIAQ+K7079eZXoUdm3HLbgeaWIG6qb5F8DQBIAED7H+uKLABH3HLbgeKWgMQLdsbuFVwbgOChRUMiG1zz2oR7A3nGfQP5xn0D+caqN+C6kTlFfXj0WRE5DmLTcjkEcguClmjQd2LZBrZ1/7pZU5WDqf6bBgKKP2zooiT004Gqmxni/W6Kn+PnRqH0A9jkeAnVdo9u8YeNj1VVvQowkF2BJNBGS4v5deOjBXMiropPSYAbIULbT6A2PPooYQUh1m6Cqj0ReEC8CJE9IGX55S6NnAZqe2I1isV2QBoBAosWTH6R1UBHhyjD64ydQhyBcOt/reh0LDDQ1HHJM/HAmuYzinEY4JZ7JSrA74AcU4gBD83LJwNV07lyGrrGi6cZr1IVaQTQCuJBYN5AQ9d4sanFX5oQOej2DZET5DfatOyJvO676yRt8ND6SQAXAVzc0XulN25qnwCA5tdjOxOc+hRAqdOlIoIbJMqyTAiAayArMqeevlOxKxSi5e+5+gwspZ3EYwBKc2pBJik4DzJ8MlD5fUeHNEVJUUC8b5PAAvAzgA9gSXPCNMuiwcry+WIzYmENBX2VlpLYDFi7099AoRCtOt3opCgREg12tAGAYDFIP4Dv/LrxTihECwA0gkv0AolD+JMQIxAZESo/Rtsq7tgRS2K+iX2RPlbbE2uE4KgTnkyQeKNej509FfQNaCLyMokPBfASPAuREUvBSCHN83Y2l2NxYVvqi+AHVZFXIgd8N3Llbe+7vsGcNftBNM6lIghgQIsGfScArNhPQAiqk3tNLVBbIq3lY3bSIq3lY9v7rreYCfPW3AirgTycRglZmypqf9m4k9xIa/lYas8RJRBZav2vHqx6A64PCXV6zAIXHqlFxIwGfYuOKXW6MQyixq1mSgcYXuEnIE/9m2wUqVn1SyhvBkTkqJYoLAHE1h3qUvF5MzAzO9M3eGj9pFUw1ecmPm8GPB7Pq7XvXSpRZgtb3cSv+K1EEgQ7OVvU6Tb+/72J63Rjb2YPAOauVep0Y68bbrtYViNr+lLUiZvG2yDb/zlSjv9VdHv/hZbqWQDwh40zBLYtR3MJ/tOODTz57i9rvQXez5PH2pwSgsHEGnXXyL7y28mx9O49dKBCsXvlki3P8RLyFniHFhQvMiqQbgG20pInRKQLIqPJaRINBfHEqQWmwJm5Tzj6IzBbnuO3kFD+hOAyyG+pWF8PBR6+kBFyDsDhev3a4xas50l5DsRv6QEEuiEIkDjm5MIrW97fd1Of+s4MDIEAAAAASUVORK5CYII=",
			"Camp Coordination / Management":
				"data:image/png;base64,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",
			"Early Recovery":
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAtCAYAAADoSujCAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEYElEQVRogdWXX0xbZRjGf++hIAUdm24xCwHTMi80xAtYtBcmZVUDcbJpBBbjjFtixCiJUrLsTsKVmUkBE6Mj8ca4+Qc2FyYxUQKli5mLgRi98cbCJHMmZmHgxh8LPa8XUIECpedwSspz+Z33+d7nd877fWmFDMjf+Xu5oVKHylOKekEeQHQa5C/gF+ByLPbvt1dPP3Jnq71k63GXFfjg+qNqxkMo1Yik3FvRCVF5z5ySDyNtnjm7PR0DCLSPvaFidoDkW/Gp8quKHI00e67b6WvYMa0bRPR9q+EBRHjMUP0pEIo+bqevcwBwClW1ZRb2mYZ8X9Ux+oRVq2MAQ83eLhNeV9S04xcoAr7zh8Z8Fn3Oyt8efU2ELkFsvRyFKTWlJtLiuZZOveMAsL0QGQGA7YNw7AwkKxIs+0Sgye7BFigSQ3tRTfmSMwYAEG4u+xjhLdu3kzKMSEpvRgFgEUJFzlg2KgNz6qrbrCzjAAA5ol9b9ajonl3gBqjsGs6t6hh9t6oz+mJy3bYAxKHUqkeQipgx3x/ojD5438yerwTaxKSnqmO0cXVdhuULjbvzjfkfBKmw41d0WpDC5QVVwXhzMOg5C9vwBUpKSmKC/GbXvyo8gIgo5keBzmjT4vMMyRcadxcQ9w22eML+1rBLdpeeF6TBsQaqisiJjAD4QuPufFnoFeGQqfpSJFh2wd8adhlFpecQOeZUH1W96fgIrQj/DOAyRL7wt0frIm2HFsyp8eOgXy4nYEBMCShM2eklEHMcwG0stCyFT2gVxN5i7yKEMjCrrtrBFk8YqLYKoapxUSPoOMA/BRNnFL2UtPw/RE+DxPcWe4/Pqqv2WkvpLMC+yZmfgZF0e6hqHHh1sMVzyZEz4AuNu93GQo8pejbyTllfZddw7uLdLS8klS6gZnU4eGAwsVDfrTm3boxeQOR5K+GHgmXnwYFrNDHzwGFRuejvjD430nhw/k7B7WNrvoQSmdW8H1cuTdwcrbAbfssASQcWgTxRuRhoj9augVia+cTYJPTkbe+IKj12wi/1dCb8qmYQM1TrBoNl31R2Defumrn/9KzpCiWHT8jfGnZJ0UOfi1BvJbxtgKWZvww8vVGNQgylYSjo7U1nz/puzbn159inwMur9lGNC3IyHPR+tp7P8gitmPkNw8PiOIE2pqpZqZ4GiZuTf5xQtDuxlnjzG4Vf6pO+Uo3NGikDhYX3HOlrLJ6x0qO+W3P+vjF60hDKMczu8NsPX01VnzZAOmOTkKpe0bzZw5Gm8rvp7m9XaQFka3hIAyCbw8MmANkeHlIA7ITwsAHATgkP6wDspPCQBLDTwsMKAKvhc+MFz/af2j+d0XRpSGDnhgeQnRwewJVvzHeBbBoeZeDewvwjfY37Lf22ybQMIY1/QzZ/mG2HDJRIyoosDg9gmCKvAMPrPVTVK664+2i2hoelW8jfMbbbQPuBg4kH2Xhg15MBEGn2TBquvBqUPpS7KOfmNLcm28MD/Ac0rl/qXg0VxwAAAABJRU5ErkJggg==",
			"Emergency Telecommunications":
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA8CAYAAAAgwDn8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAGl0lEQVRoge1aW2wcZxk955+169TQoNxAIo3jS42spkU0JoQm7q7jRFQ0KoI2PABCXFS5akLiC6VUohg/UanxLSKIIFKpEQKpqUQCPISAveskRAk0BNpSUOK1E1TKJUpcJ3XsjWfm8ND1ev6ZdaPYCduHPW//+c583zk7Mzv/eE0EsHnPP28fH5/cLeJhislka+UWkEIhITHRM/ISoDjAg5OKbTvRvmJiumyC2vHxzD6QXyG4CMQjjbvS9/3/Hdto6huuJ/E5kotJfG2BcfcF67kA8d70ZhCPBIvelOOHG67e83JJY9fQp+O9Q6tulsl418jaxu6hDZAYrvlU2MOjie70Q9MLAkC8Y6TMLPRfB1k5XZB0JNVWHQ8euem5oWWuwxTIOgCu73t1g+13Dc3H/Ibe9CaJh7NDU+XlZQ/9uvnDV3MCiYme4RTJB2YopMsc9+5DO2ozBgDMQm0JmocwJaOt4WGuY/ZmzQNAzIAN8zE/7S+3IBPj45PftwSkfGEbAHeGQvWk5zwKZC8hAY/bB+mHgy01rwWpeM9IAsRmazhxZr4BfPCs3ZOPN3WfrwpyR9qrX5XwI9sjmwEg1rQzXesT9+caQL6j2K7wIEJtNqPBVFvN72cz1rDrXKXj+vcCgBczrxzdvnIkn27ZW+M/u/CBBc8QrHpnDkp9eFsBtFvT5PURZitIZnUN8a6zNcY3gVMIgOBAf1vFcJBb33dmKYUHg5zvm2/PZjzRnT4Y8/xhEgdIHIh5/nBjT/pAvGdkZVi/v3PVNYrfs0jqC/GOZCxIDbbfNSQyackcEzei1ttJ8dvwEMctaQJRktMAfx1srzwR1m3sTa9wXD9F8uFoNH6G8FPxvjPLwxV/jPshvRXQfsgsuvOjkRZSv73mOkPhHoszOh4ZbbTGPhC/jBoEXJ8/IbEiXw0ACFbQc34c5gc7KydB/s4ifa4J60ges9bCvQbgElvlnYscKFUG18bgdFgT7zuznNDG2cznegEPNuw8e2e0oj9ZK6EyrHAoy5uApQbU4iCZccsuRloDi0LN/xMx5saqp2+wdwXJGHlPmBbx35BwcVjztldywW6lpUaCtddZ8j4nYoKA9TSkTyesMY5Kr+c9Z9ZBJjIj0lNeZIY7HrMZuoak9YmPXbkaSS7wUnDtGy0La0rpnZSiQyO9JO9aZuoPkQJh9SQxGpaUlJbZ3qSLRpB1Whw61kMkq0yH1vVhxaEdtZcBvvBu5rPG9h5/qu5KdIRWh5SRLYqRZ3kTeMEA/It9nNZFmhucDDXP8zUJOCWl34LwWr5aFq+W+CVPh8lNz/2rHGSTNYE6GdYJpiGkOW0IHQvpPhU+0C2NDUgz1y2B2njPSCKs6//G8ouZqcz9kP4c9a7TmWuZdYfbV1wKV1xn4osA3h9w+kbDaFXkgyBgfctJPG5cx0lCUkDU8EDPSF1QeOyJilESvwpyRv6z+ba/x5+qu6LQ/iY7bCjfpbO26x8LADxjaYmfdnbS+uJo7D57N4iZh64kekiZo9tXjohIzcQkHfgtEQPAzmBQkJ/Y0H0uEdbdKBYY90sgAk9nTci4u6NKp9Vakv3JJ6vOGwCgaO30JHw93j1k3aip1qqTAl8Kcp5BxTz9Awr1EHYN7qh9I0g19aY/LuqrQc6X9gDZ7fTl8ku/APT36SJJhzS7OzpkvXK6ZU6zhD8CgISMcWVtruYCQr8Rsm9d0oElYxPfDdY7OmQ88QcEc14kvf52+ejBXIBTzfVTorbZjbEmtdB+Jz72RMVofKxyreSvp4ePJJ+sOj/fAANt1Ud9mFWex/uSbdWf3d+56lqwfvSO4XoC1r7IyGw71Vw/BQC5J1uqpaY/0Z3eR/LL05xjaDUDgOzNNet7wFxwpLXyb7PVXJkpx9os6IWB9qrcmbcukaVjE48J6JGQhrB3oKX6lZtpdC448s3K0xKeBzAEoOvy7aOPBevX33zNAYnu4RdJbAlyEvan2qo+f7NnmetL3tsoBig0igEKjWKAQqMYoNAoBig0igEKjWKAQqMYoNAoBig0igEKjWKAQqMYoNAoBig0igEKjVn/Or16z8sld1xd9EkSH7zRppLaAK4NsSdIdt+wQ1//HisfPTH9g0YYeQNsfDa90LsNSYAfu+GBtwLCqdscd8M7P6bbyHsJuaVsec+YBwBidcaPbc9XyhuA0MpbamgOEJDnXyBmu4mpw7fUzRxA4VA+Pm+AZGvNzwV9R9Kbt9bW9SHpTUhPJ9uqXsxX/x9naX98X733zAAAAABJRU5ErkJggg==",
			"Multi-Sector":
				"data:image/png;base64,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",
			"COVID-19":
				"data:image/png;base64,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",
			"Multi-purpose CASH":
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD3klEQVRoge2ZQWgcVRjH//+dyW4TaiqYeEkQOhWlRz16cfegBFpPprGFtAdzsFJqNi00QltLQ5FUMJtN8FCVoI2gzV4riD1kT8VbPQhCaHYRmksaxNradHdn5u8h7u402dnskqGzK/md9n3fN+/7f7Nv3ps3j2gD4p8vnyVxAcCNnn7rVGaITtkXCVFXw5BMgnwe5AdrK7nvjizIKPvaogAQ1z2No94i6I07fG2l6y/Hjj1bddvTtU4WWUqRPFG16oeePmu4UkBiajkN4DRI1uijJZH0lVlt8n0QbSMeAAgeqxQgapLiKCCz3kVhITJCYN8m6xdtccePLMhYu5f/BsRw1aovF5PWybaYhdZW8jNe8YJmF5PWSZBqiwIEHfL8ns0mrVGQAtplHRDOQ/gN0GWv+F12CQACQHwq9zOJt8IW0wwSbmXPWG9HAKDdxANVze0xC9Uh8AIErAq64IKvmXbnXtPu3Os4fB3ARQGrQecL9L1HQqZYKozcHj/4cJPrDoA7b1z9PR2LxuYADAaVM7ACJGSyY/vfq7fI3B4/+BDSUGI6v4CAighkCAlYLZYKIw2tkKRiEXsEwv0gctcsQEBRwrhhGn2GafQJ+FhA0b8bzdQYNr78NPrK3wBmfXtrIr/fEPoke8b6zNO+Gk/lAGCyVjBd3mxQewXH5U3D0MRO89f8BxxFrm+2qcRv/cS4scfL9eVuxXae3PXzNZO/ZgGxjq37YsMwjFqxAFD6x2h6Y9S9x/+aZvLXLMC2neObbWJpi61MR3TPAT+fH+tuh+Xnaya/3zMwEU/lYJrGPAA4JfuEyMt+tywCHQbw6zaan75GeqfOJ4SG8xMAEqncjjYIAlaLxcLLjc5EA+ml7oJj3gXRu5O8i2MWA1kHCLwYi8bmIG3/LEgsOObcTsWXCfJdaDAxnV8YSC91+wUMpJe6E6l8BsS7QSUN+hvQYMEx30xM5WaJyI9O9NFSdP0FOUbhVcE9VHDxEYieIBMG/xFrY2hMCO5EpNQF21wPPIWX/8d+QMKtsIU0Sztq3qUleXrhkZiYzl2SOAxiJjtmzYSkq2Gqs5DE+HQuDfASiQMELoaoq2E2CvhPPMHTHt+NcCQ1h1lLvISMHvyRDFNYozAxtTwJctxrFPCAkhuWqPrQBjGzOGZdAQAT4KktIcA+tPZh5TkAVwAgIuj7kMU0hSBXwNflttnbb324tpJ7DuBRT9B81O1IPu5Uy52E2Ot88svZlypviAQ2TgHv38vPkzjmif10ccw6/8wVNkkEADJDdHr79x+XUBlOkvdIs3WpLGTlIiBdE/QnoekwhTXKvx//eq77xCqaAAAAAElFTkSuQmCC",
		};

		let yearsArray,
			isSnapshotTooltipVisible = false,
			timer,
			launchedValuePadding,
			currentHoveredElem;

		const queryStringValues = new URLSearchParams(location.search);

		if (!queryStringValues.has("viz"))
			queryStringValues.append("viz", vizNameQueryString);

		const containerDiv = d3.select("#d3chartcontainerpbiolc");

		const showHelp =
			containerDiv.node().getAttribute("data-showhelp") === "true";

		const minimumUnderApprovalPercentage = +containerDiv.node().getAttribute("data-minpercentage") || 0;

		const showLink =
			containerDiv.node().getAttribute("data-showlink") === "true";

		const chartTitle = containerDiv.node().getAttribute("data-title")
			? containerDiv.node().getAttribute("data-title")
			: chartTitleDefault;

		const selectedYearString = queryStringValues.has("year")
			? queryStringValues.get("year").replace(/\|/g, ",")
			: containerDiv.node().getAttribute("data-year");

		const selectedCbpfsString = queryStringValues.has("fund")
			? queryStringValues.get("fund").replace(/\|/g, ",")
			: containerDiv.node().getAttribute("data-cbpf");

		const selectedModality =
			queryStringValues.has("modality") &&
			modalities.indexOf(
				queryStringValues.get("modality").toLowerCase()
			) > -1
				? queryStringValues.get("modality").toLowerCase()
				: modalities.indexOf(
						containerDiv
							.node()
							.getAttribute("data-modality")
							.toLowerCase()
				  ) > -1
				? containerDiv
						.node()
						.getAttribute("data-modality")
						.toLowerCase()
				: "total";

		const selectedBeneficiary =
			queryStringValues.has("persons") &&
			beneficiaries.indexOf(
				queryStringValues.get("persons").toLowerCase()
			) > -1
				? queryStringValues.get("persons").toLowerCase()
				: beneficiaries.indexOf(
						containerDiv
							.node()
							.getAttribute("data-beneficiaries")
							.toLowerCase()
				  ) > -1
				? containerDiv
						.node()
						.getAttribute("data-beneficiaries")
						.toLowerCase()
				: "targeted";

		const selectedResponsiveness =
			containerDiv.node().getAttribute("data-responsive") === "true";

		const lazyLoad =
			containerDiv.node().getAttribute("data-lazyload") === "true";

		if (selectedResponsiveness === "false") {
			containerDiv
				.style("width", width + "px")
				.style("height", height + "px");
		}

		const topDiv = containerDiv.append("div").attr("class", "pbiolcTopDiv");

		const titleDiv = topDiv.append("div").attr("class", "pbiolcTitleDiv");

		const iconsDiv = topDiv
			.append("div")
			.attr("class", "pbiolcIconsDiv d3chartIconsDiv");

		const selectTitleDiv = containerDiv
			.append("div")
			.attr("class", "pbiolcSelectTitleDiv");

		const selectDiv = containerDiv
			.append("div")
			.attr("class", "pbiolcSelectDiv");

		const launchedValueDiv = containerDiv
			.append("div")
			.attr("class", "pbiolclaunchedValueDiv");

		const launchedValue = launchedValueDiv
			.append("p")
			.attr("class", "pbiolclaunchedValue");

		const svg = containerDiv
			.append("svg")
			.attr("viewBox", "0 0 " + width + " " + height)
			.style("background-color", "white");

		if (isInternetExplorer) {
			svg.attr("height", height);
		}

		const yearsDescriptionDiv = containerDiv
			.append("div")
			.attr("class", "pbiolcYearsDescriptionDiv");

		const footerDiv = !isPfbiSite
			? containerDiv.append("div").attr("class", "pbiolcFooterDiv")
			: null;

		createProgressWheel(svg, width, height, "Loading visualisation...");

		const snapshotTooltip = containerDiv
			.append("div")
			.attr("id", "pbiolcSnapshotTooltip")
			.attr("class", "pbiolcSnapshotContent")
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
			.attr("id", "pbiolcSnapshotTooltipPdfText")
			.html("Download PDF")
			.on("click", function () {
				isSnapshotTooltipVisible = false;
				createSnapshot("pdf", true);
			});

		snapshotTooltip
			.append("p")
			.attr("id", "pbiolcSnapshotTooltipPngText")
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
				.attr("id", "pbiolcTooltipBestVisualizedText")
				.html(
					"For best results use Chrome, Firefox, Opera or Chromium-based Edge."
				)
				.attr("pointer-events", "none")
				.style("cursor", "default");
		}

		const tooltip = containerDiv
			.append("div")
			.attr("id", "pbiolctooltipdiv")
			.style("max-width", "326px")
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
				.attr("class", "pbiolcTopPanel")
				.attr(
					"transform",
					"translate(" + padding[3] + "," + padding[0] + ")"
				),
			width: width - padding[1] - padding[3],
			height: topPanelHeight,
			padding: [0, 0, 0, 0],
			moneyBagPadding: 22,
			leftPadding: [182, 540],
			mainValueVerPadding: 10,
			mainValueHorPadding: 2,
		};

		const buttonsPanel = {
			main: svg
				.append("g")
				.attr("class", "pbiolcButtonsPanel")
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
			padding: [0, 0, 0, 0],
			buttonWidth: 52,
			buttonPadding: 4,
			buttonVerticalPadding: 4,
			arrowPadding: 18,
			buttonModalitiesWidth: 68,
			buttonBeneficiariesWidth: 62,
			beneficiariesPadding: 750,
		};

		const allocationsPanel = {
			main: svg
				.append("g")
				.attr("class", "pbiolcAllocationsPanel")
				.attr(
					"transform",
					"translate(" +
						padding[3] +
						"," +
						(padding[0] +
							buttonsPanel.height +
							topPanel.height +
							2 * panelHorizontalPadding) +
						")"
				),
			width:
				(width - padding[1] - padding[3] - 2 * panelVerticalPadding) *
				lollipopsPanelsRatio,
			height: lollipopPanelsHeight,
			padding: [lollipopTitlePadding, 0, 0, 82],
			labelPadding: 6,
		};

		const labelsPanel = {
			main: svg
				.append("g")
				.attr("class", "pbiolcLabelsPanel")
				.attr(
					"transform",
					"translate(" +
						(padding[3] +
							allocationsPanel.width +
							panelVerticalPadding) +
						"," +
						(padding[0] +
							buttonsPanel.height +
							topPanel.height +
							2 * panelHorizontalPadding) +
						")"
				),
			width:
				(width - padding[1] - padding[3] - 2 * panelVerticalPadding) *
				(1 - 2 * lollipopsPanelsRatio),
			height: lollipopPanelsHeight,
			padding: [lollipopTitlePadding, 0, 0, 0],
		};

		const beneficiariesPanel = {
			main: svg
				.append("g")
				.attr("class", "pbiolcBeneficiariesPanel")
				.attr(
					"transform",
					"translate(" +
						(padding[3] +
							allocationsPanel.width +
							labelsPanel.width +
							2 * panelVerticalPadding) +
						"," +
						(padding[0] +
							buttonsPanel.height +
							topPanel.height +
							2 * panelHorizontalPadding) +
						")"
				),
			width:
				(width - padding[1] - padding[3] - 2 * panelVerticalPadding) *
				lollipopsPanelsRatio,
			height: lollipopPanelsHeight,
			padding: [lollipopTitlePadding, 62, 0, 0],
			labelPadding: 6,
		};

		const allocationsPanelClip = allocationsPanel.main
			.append("clipPath")
			.attr("id", "pbiolcAllocationsPanelClip")
			.append("rect")
			.attr("width", allocationsPanel.width)
			.attr("height", allocationsPanel.height)
			.attr(
				"transform",
				"translate(0," + -allocationsPanel.padding[0] + ")"
			);

		const beneficiariesPanelClip = beneficiariesPanel.main
			.append("clipPath")
			.attr("id", "pbiolcBeneficiariesPanelClip")
			.append("rect")
			.attr("width", beneficiariesPanel.width)
			.attr("height", beneficiariesPanel.height)
			.attr(
				"transform",
				"translate(0," + -beneficiariesPanel.padding[0] + ")"
			);

		const xScaleAllocations = d3
			.scaleLinear()
			.range([
				allocationsPanel.width - allocationsPanel.padding[1],
				allocationsPanel.padding[3],
			]);

		const xScaleBeneficiaries = d3
			.scaleLinear()
			.range([
				beneficiariesPanel.padding[3],
				beneficiariesPanel.width - beneficiariesPanel.padding[1],
			]);

		const yScale = d3
			.scalePoint()
			.range([
				labelsPanel.padding[0],
				labelsPanel.height - labelsPanel.padding[2],
			])
			.padding(0.5);

		const xAxisAllocations = d3
			.axisTop(xScaleAllocations)
			.tickSizeOuter(0)
			.tickSizeInner(-(lollipopGroupHeight * clusters.length))
			.ticks(3)
			.tickFormat(function (d) {
				return "$" + formatSIaxes(d).replace("G", "B");
			});

		const xAxisBeneficiaries = d3
			.axisTop(xScaleBeneficiaries)
			.tickSizeOuter(0)
			.tickSizeInner(-(lollipopGroupHeight * clusters.length))
			.ticks(3)
			.tickFormat(function (d) {
				return formatSIaxes(d).replace("G", "B");
			});

		const groupXAxisAllocations = allocationsPanel.main
			.append("g")
			.attr("class", "pbiolcgroupXAxisAllocations")
			.attr("clip-path", "url(#pbiolcAllocationsPanelClip)")
			.attr(
				"transform",
				"translate(0," + allocationsPanel.padding[0] + ")"
			);

		const groupXAxisBeneficiaries = beneficiariesPanel.main
			.append("g")
			.attr("class", "pbiolcgroupXAxisBeneficiaries")
			.attr("clip-path", "url(#pbiolcBeneficiariesPanelClip)")
			.attr(
				"transform",
				"translate(0," + beneficiariesPanel.padding[0] + ")"
			);

		const symbolTriangle = d3
			.symbol()
			.type(d3.symbolTriangle)
			.size(symbolSize);

		if (!isScriptLoaded(html2ToCanvas)) loadScript(html2ToCanvas, null);

		if (!isScriptLoaded(jsPdf)) loadScript(jsPdf, null);

		if (isPfbiSite && !isBookmarkPage) {
			Promise.all([
				window.cbpfbiDataObject.targetedPersonsData,
				window.cbpfbiDataObject.launchedAllocationsData,
			]).then(allData => csvCallback(allData));
		} else {
			Promise.all([
				fetchFile(
					classPrefix + "data",
					dataFileUrl,
					"sectors data",
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

		function csvCallback([rawData, rawLaunchedAllocationsData]) {
			removeProgressWheel();

			yearsArray = rawData
				.map(function (d) {
					if (!cbpfsList["id" + d.PooledFundId]) {
						cbpfsList["id" + d.PooledFundId] = d.PooledFundName;
					}
					return +d.AllocationYear;
				})
				.filter(function (value, index, self) {
					return self.indexOf(value) === index;
				})
				.sort(function (a, b) {
					return a - b;
				});

			validateYear(selectedYearString);

			chartState.selectedModality = selectedModality;

			chartState.selectedBeneficiary = selectedBeneficiary;

			chartState.selectedCbpfs =
				populateSelectedCbpfs(selectedCbpfsString);

			if (!lazyLoad) {
				draw(rawData, rawLaunchedAllocationsData);
			} else {
				d3.select(window).on("scroll.pbiolc", checkPosition);
				d3.select("body").on("d3ChartsYear.pbiolc", function () {
					chartState.selectedYear = [
						validateCustomEventYear(+d3.event.detail),
					];
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
					d3.select(window).on("scroll.pbiolc", null);
					draw(rawData, rawLaunchedAllocationsData);
				}
			}

			//end of csvCallback
		}

		function draw(rawData, rawLaunchedAllocationsData) {
			let data = processData(rawData, rawLaunchedAllocationsData);

			setxScaleDomains(data);

			sortData(data);

			createTitle();

			createCheckboxes();

			if (!isPfbiSite) createFooterDiv();

			createTopPanel();

			createButtonsPanel();

			createLabelsPanel();

			createAllocationsPanel();

			createBeneficiariesPanel();

			createLegend();

			setYearsDescriptionDiv();

			if (showHelp) createAnnotationsDiv();

			function createTitle() {
				const title = titleDiv
					.append("p")
					.attr("id", "pbiolcd3chartTitle")
					.html(chartTitle);

				const helpIcon = iconsDiv
					.append("button")
					.attr("id", "pbiolcHelpButton");

				helpIcon
					.html("HELP  ")
					.append("span")
					.attr("class", "fas fa-info");

				const downloadIcon = iconsDiv
					.append("button")
					.attr("id", "pbiolcDownloadButton");

				downloadIcon
					.html(".CSV  ")
					.append("span")
					.attr("class", "fas fa-download");

				const snapshotDiv = iconsDiv
					.append("div")
					.attr("class", "pbiolcSnapshotDiv");

				const snapshotIcon = snapshotDiv
					.append("button")
					.attr("id", "pbiolcSnapshotButton");

				snapshotIcon
					.html("IMAGE ")
					.append("span")
					.attr("class", "fas fa-camera");

				const snapshotContent = snapshotDiv
					.append("div")
					.attr("class", "pbiolcSnapshotContent");

				const pdfSpan = snapshotContent
					.append("p")
					.attr("id", "pbiolcSnapshotPdfText")
					.html("Download PDF")
					.on("click", function () {
						createSnapshot("pdf", false);
					});

				const pngSpan = snapshotContent
					.append("p")
					.attr("id", "pbiolcSnapshotPngText")
					.html("Download Image (PNG)")
					.on("click", function () {
						createSnapshot("png", false);
					});

				const playIcon = iconsDiv
					.append("button")
					.datum({
						clicked: false,
					})
					.attr("id", "pbiolcPlayButton");

				playIcon
					.html("PLAY  ")
					.append("span")
					.attr("class", "fas fa-play");

				playIcon.on("click", function (d) {
					d.clicked = !d.clicked;

					playIcon
						.html(d.clicked ? "PAUSE " : "PLAY  ")
						.append("span")
						.attr(
							"class",
							d.clicked ? "fas fa-pause" : "fas fa-play"
						);

					if (d.clicked) {
						chartState.selectedYear.length = 1;
						loopButtons();
						timer = d3.interval(loopButtons, 3 * duration);
					} else {
						timer.stop();
					}

					function loopButtons() {
						const index = yearsArray.indexOf(
							chartState.selectedYear[0]
						);

						chartState.selectedYear[0] =
							yearsArray[(index + 1) % yearsArray.length];

						const yearButton = d3
							.selectAll(".pbiolcbuttonsRects")
							.filter(function (d) {
								return d === chartState.selectedYear[0];
							});

						yearButton.dispatch("click");

						if (yearsArray.length > buttonsNumber) {
							const firstYearIndex =
								chartState.selectedYear[0] <
								yearsArray[buttonsNumber / 2]
									? 0
									: chartState.selectedYear[0] >
									  yearsArray[
											yearsArray.length -
												buttonsNumber / 2
									  ]
									? yearsArray.length - buttonsNumber
									: yearsArray.indexOf(
											chartState.selectedYear[0]
									  ) -
									  buttonsNumber / 2;

							const currentTranslate = -(
								buttonsPanel.buttonWidth * firstYearIndex
							);

							if (currentTranslate === 0) {
								svg.select(".pbiolcLeftArrowGroup")
									.select("text")
									.style("fill", "#ccc");
								svg.select(".pbiolcLeftArrowGroup").attr(
									"pointer-events",
									"none"
								);
							} else {
								svg.select(".pbiolcLeftArrowGroup")
									.select("text")
									.style("fill", "#666");
								svg.select(".pbiolcLeftArrowGroup").attr(
									"pointer-events",
									"all"
								);
							}

							if (
								Math.abs(currentTranslate) >=
								(yearsArray.length - buttonsNumber) *
									buttonsPanel.buttonWidth
							) {
								svg.select(".pbiolcRightArrowGroup")
									.select("text")
									.style("fill", "#ccc");
								svg.select(".pbiolcRightArrowGroup").attr(
									"pointer-events",
									"none"
								);
							} else {
								svg.select(".pbiolcRightArrowGroup")
									.select("text")
									.style("fill", "#666");
								svg.select(".pbiolcRightArrowGroup").attr(
									"pointer-events",
									"all"
								);
							}

							svg.select(".pbiolcbuttonsGroup")
								.transition()
								.duration(duration)
								.attrTween("transform", function () {
									return d3.interpolateString(
										this.getAttribute("transform"),
										"translate(" + currentTranslate + ",0)"
									);
								});
						}
					}
				});

				if (!isBookmarkPage) {
					const shareIcon = iconsDiv
						.append("button")
						.attr("id", "pbiolcShareButton");

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
						.attr("id", "pbiolcBestVisualizedText")
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

				selectTitleDiv.html("Select CBPF:");

				helpIcon.on("click", createAnnotationsDiv);

				downloadIcon.on("click", function () {
					const csv = createCSV(rawData);

					const currentDate = new Date();

					const fileName =
						"SectorsOverview_" +
						csvDateFormat(currentDate) +
						".csv";

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

			function createLegend() {
				let allocationLegendGroup = svg
					.selectAll(".pbiolcAllocationLegendGroup")
					.data([true]);

				allocationLegendGroup = allocationLegendGroup
					.enter()
					.append("g")
					.attr("class", "pbiolcAllocationLegendGroup")
					.attr(
						"transform",
						"translate(" +
							padding[3] +
							"," +
							(height - padding[2] + legendVerticalPadding) +
							")"
					)
					.merge(allocationLegendGroup);

				let beneficiariesLegendGroup = svg
					.selectAll(".pbiolcBeneficiariesLegendGroup")
					.data([true]);

				beneficiariesLegendGroup = beneficiariesLegendGroup
					.enter()
					.append("g")
					.attr("class", "pbiolcBeneficiariesLegendGroup")
					.attr(
						"transform",
						"translate(" +
							(padding[3] +
								allocationsPanel.width +
								labelsPanel.width +
								2 * panelVerticalPadding) +
							"," +
							(height - padding[2] + legendVerticalPadding) +
							")"
					)
					.merge(beneficiariesLegendGroup);

				allocationLegendGroup.selectAll("*").remove();

				beneficiariesLegendGroup.selectAll("*").remove();

				console.log(allocationLegendGroup.size());

				const legendAllocation1 = allocationLegendGroup
					.append("text")
					.attr("class", "pbiolcLegendText")
					.attr("x", allocationsPanel.width)
					.attr("text-anchor", "end")
					.text("Figures represent: ")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", "#666")
					.text(
						(chartState.selectedModality === "total"
							? ""
							: capitalize(chartState.selectedModality) + " ") +
							"Allocations in sector "
					)
					.append("tspan")
					.style("font-weight", "normal")
					.text("(")
					.append("tspan")
					.style("font-weight", "bold")
					.text("% of total")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(")");

				const legendAllocation2 = allocationLegendGroup
					.append("text")
					.attr("class", "pbiolcLegendText")
					.attr("x", allocationsPanel.width)
					.attr("y", 12)
					.attr("text-anchor", "end")
					.text("The arrow (")
					.append("tspan")
					.style("fill", "black")
					.text("\u25B2")
					.append("tspan")
					.style("fill", "#666")
					.text(") indicates the standard allocation amount.");

				const legendBeneficiaries1 = beneficiariesLegendGroup
					.append("text")
					.attr("class", "pbiolcLegendText")
					.text("Figures represent: ")
					.append("tspan")
					.style("font-weight", "bold")
					.style("fill", "#666")
					.text(
						(chartState.selectedBeneficiary === "actual"
							? "Reached"
							: "Targeted") + " people in sector "
					)
					.append("tspan")
					.style("font-weight", "normal")
					.text("(")
					.append("tspan")
					.style("font-weight", "bold")
					.text("% of the total")
					.append("tspan")
					.style("font-weight", "normal")
					.style("fill", "#666")
					.text(")");

				const legendBeneficiaries2 = beneficiariesLegendGroup
					.append("text")
					.attr("class", "pbiolcLegendText")
					.attr("y", 12)
					.text("The arrow (")
					.append("tspan")
					.style("fill", "black")
					.text("\u25B2")
					.append("tspan")
					.style("fill", "#666")
					.text(") indicates the number of reached persons.");

				//end of createLegend
			}

			function createCheckboxes() {
				const checkboxData = d3.keys(cbpfsList);

				checkboxData.unshift("All CBPFs");

				const checkboxDivs = selectDiv
					.selectAll(null)
					.data(checkboxData)
					.enter()
					.append("div")
					.attr("class", "pbiolcCheckboxDiv");

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
					.attr("class", "pbiolcCheckboxText")
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
					"pbiolcCheckboxTextAllCbpfs"
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

					data = processData(rawData, rawLaunchedAllocationsData);

					setxScaleDomains(data);

					sortData(data);

					createTopPanel();

					createLabelsPanel();

					createAllocationsPanel();

					createBeneficiariesPanel();
				});

				//end of createCheckboxes
			}

			function createTopPanel() {
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
					return d[chartState.selectedModality];
				});

				const personsValue = d3.sum(data, function (d) {
					return d[
						chartState.selectedModality +
							chartState.selectedBeneficiary
					];
				});

				const topPanelMoneyBag = topPanel.main
					.selectAll(".pbiolctopPanelMoneyBag")
					.data([true])
					.enter()
					.append("g")
					.attr(
						"class",
						"pbiolctopPanelMoneyBag contributionColorFill"
					)
					.attr(
						"transform",
						"translate(" +
							topPanel.moneyBagPadding +
							",6) scale(0.5)"
					)
					.each(function (_, i, n) {
						moneyBagdAttribute.forEach(function (d) {
							d3.select(n[i]).append("path").attr("d", d);
						});
					});

				const previousValue =
					d3.select(".pbiolctopPanelMainValue").size() !== 0
						? d3.select(".pbiolctopPanelMainValue").datum()
						: 0;

				const previousPersons =
					d3.select(".pbiolctopPanelPersonsNumber").size() !== 0
						? d3.select(".pbiolctopPanelPersonsNumber").datum()
						: 0;

				let mainValueGroup = topPanel.main
					.selectAll(".pbiolcmainValueGroup")
					.data([true]);

				mainValueGroup = mainValueGroup
					.enter()
					.append("g")
					.attr("class", "pbiolcmainValueGroup")
					.merge(mainValueGroup);

				let topPanelMainValue = mainValueGroup
					.selectAll(".pbiolctopPanelMainValue")
					.data([mainValue]);

				topPanelMainValue = topPanelMainValue
					.enter()
					.append("text")
					.attr(
						"class",
						"pbiolctopPanelMainValue contributionColorFill"
					)
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
								(i(t) < 1e3
									? ~~i(t)
									: siString.substring(
											0,
											siString.length - 1
									  ));
						};
					})
					.on("end", function () {
						const thisBox = this.getBoundingClientRect();
						const containerBox = containerDiv
							.node()
							.getBoundingClientRect();
						const thisLeftPadding =
							thisBox.left - containerBox.left;
						launchedValue.style(
							"padding-left",
							thisLeftPadding + "px",
							"important"
						);
					});

				let topPanelMainText = mainValueGroup
					.selectAll(".pbiolctopPanelMainText")
					.data([mainValue]);

				topPanelMainText = topPanelMainText
					.enter()
					.append("text")
					.attr("class", "pbiolctopPanelMainText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelMainText)
					.attr(
						"y",
						topPanel.height - topPanel.mainValueVerPadding * 3.1
					)
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
						const yearsText =
							chartState.selectedYear.length === 1
								? chartState.selectedYear[0]
								: "years\u002A";
						const valueSI = formatSIFloat(d);
						const unit = valueSI[valueSI.length - 1];
						return (
							(unit === "k"
								? "Thousand"
								: unit === "M"
								? "Million"
								: unit === "G"
								? "Billion"
								: "") +
							" Allocated in " +
							yearsText
						);
					});

				let topPanelSubText = mainValueGroup
					.selectAll(".pbiolctopPanelSubText")
					.data([true]);

				topPanelSubText = topPanelSubText
					.enter()
					.append("text")
					.attr("class", "pbiolctopPanelSubText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelSubText)
					.attr(
						"y",
						topPanel.height - topPanel.mainValueVerPadding * 1.2
					)
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
					.text(
						"(" +
							capitalize(chartState.selectedModality) +
							" Allocations)"
					);

				let topPanelPersonsNumber = mainValueGroup
					.selectAll(".pbiolctopPanelPersonsNumber")
					.data([personsValue]);

				topPanelPersonsNumber = topPanelPersonsNumber
					.enter()
					.append("text")
					.attr(
						"class",
						"pbiolctopPanelPersonsNumber contributionColorFill"
					)
					.attr("text-anchor", "end")
					.merge(topPanelPersonsNumber)
					.attr("y", topPanel.height - topPanel.mainValueVerPadding)
					.attr(
						"x",
						topPanel.moneyBagPadding +
							topPanel.leftPadding[1] -
							topPanel.mainValueHorPadding
					);

				topPanelPersonsNumber
					.transition()
					.duration(duration)
					.tween("text", function (d) {
						const node = this;
						const i = d3.interpolate(previousPersons, d);
						return function (t) {
							const siString = formatSIFloat(i(t));
							node.textContent =
								i(t) < 1e3
									? ~~i(t)
									: siString.substring(
											0,
											siString.length - 1
									  );
						};
					});

				let topPanelPersonsText = mainValueGroup
					.selectAll(".pbiolctopPanelPersonsText")
					.data([personsValue]);

				topPanelPersonsText = topPanelPersonsText
					.enter()
					.append("text")
					.attr("class", "pbiolctopPanelPersonsText")
					.style("opacity", 0)
					.attr("text-anchor", "start")
					.merge(topPanelPersonsText)
					.attr(
						"y",
						topPanel.height - topPanel.mainValueVerPadding * 3.1
					)
					.attr(
						"x",
						topPanel.moneyBagPadding +
							topPanel.leftPadding[1] +
							topPanel.mainValueHorPadding
					);

				topPanelPersonsText
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
								: unit === "G"
								? "Billion"
								: "") + " People"
						);
					});

				let topPanelPersonsTextSubText = mainValueGroup
					.selectAll(".pbiolctopPanelPersonsTextSubText")
					.data([true]);

				topPanelPersonsTextSubText = topPanelPersonsTextSubText
					.enter()
					.append("text")
					.attr("class", "pbiolctopPanelPersonsTextSubText")
					.attr(
						"y",
						topPanel.height - topPanel.mainValueVerPadding * 1.2
					)
					.attr(
						"x",
						topPanel.moneyBagPadding +
							topPanel.leftPadding[1] +
							topPanel.mainValueHorPadding
					)
					.attr("text-anchor", "start")
					.merge(topPanelPersonsTextSubText)
					.text(function () {
						const yearsText =
							chartState.selectedYear.length === 1
								? chartState.selectedYear[0]
								: "years\u002A";
						return (
							(chartState.selectedBeneficiary === "actual"
								? "Reached"
								: "Targeted") +
							" in " +
							yearsText
						);
					});

				// 	//end of createTopPanel
			}

			function createButtonsPanel() {
				const clipPathButtons = buttonsPanel.main
					.append("clipPath")
					.attr("id", "pbiolcclipPathButtons")
					.append("rect")
					.attr("width", buttonsNumber * buttonsPanel.buttonWidth)
					.attr("height", buttonsPanel.height);

				const clipPathGroup = buttonsPanel.main
					.append("g")
					.attr("class", "pbiolcClipPathGroup")
					.attr(
						"transform",
						"translate(" +
							(buttonsPanel.padding[3] +
								buttonsPanel.arrowPadding) +
							",0)"
					)
					.attr("clip-path", "url(#pbiolcclipPathButtons)");

				const buttonsGroup = clipPathGroup
					.append("g")
					.attr("class", "pbiolcbuttonsGroup")
					.attr("transform", "translate(0,0)")
					.style("cursor", "pointer");

				const buttonsRects = buttonsGroup
					.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiolcbuttonsRects")
					.attr(
						"width",
						buttonsPanel.buttonWidth - buttonsPanel.buttonPadding
					)
					.attr(
						"height",
						buttonsPanel.height -
							buttonsPanel.padding[0] -
							buttonsPanel.buttonVerticalPadding * 2
					)
					.attr(
						"y",
						buttonsPanel.padding[0] +
							buttonsPanel.buttonVerticalPadding
					)
					.attr("x", function (_, i) {
						return (
							i * buttonsPanel.buttonWidth +
							buttonsPanel.buttonPadding / 2
						);
					})
					.style("fill", function (d) {
						return chartState.selectedYear.indexOf(d) > -1
							? unBlue
							: "#eaeaea";
					});

				const buttonsText = buttonsGroup
					.selectAll(null)
					.data(yearsArray)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiolcbuttonsText")
					.attr(
						"y",
						buttonsPanel.height -
							2.8 * buttonsPanel.buttonVerticalPadding
					)
					.attr("x", function (_, i) {
						return (
							i * buttonsPanel.buttonWidth +
							buttonsPanel.buttonWidth / 2
						);
					})
					.style("fill", function (d) {
						return chartState.selectedYear.indexOf(d) > -1
							? "white"
							: "#444";
					})
					.text(function (d) {
						return d;
					});

				const leftArrow = buttonsPanel.main
					.append("g")
					.attr("class", "pbiolcLeftArrowGroup")
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
							buttonsPanel.buttonVerticalPadding * 2
					)
					.attr(
						"y",
						buttonsPanel.padding[0] +
							buttonsPanel.buttonVerticalPadding
					);

				const leftArrowText = leftArrow
					.append("text")
					.attr("class", "pbiolcleftArrowText")
					.attr("x", 0)
					.attr(
						"y",
						buttonsPanel.height -
							buttonsPanel.buttonVerticalPadding * 2.1
					)
					.style("fill", "#666")
					.text("\u25c4");

				const rightArrow = buttonsPanel.main
					.append("g")
					.attr("class", "pbiolcRightArrowGroup")
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
							buttonsPanel.buttonVerticalPadding * 2
					)
					.attr(
						"y",
						buttonsPanel.padding[0] +
							buttonsPanel.buttonVerticalPadding
					);

				const rightArrowText = rightArrow
					.append("text")
					.attr("class", "pbiolcrightArrowText")
					.attr("x", -1)
					.attr(
						"y",
						buttonsPanel.height -
							buttonsPanel.buttonVerticalPadding * 2.1
					)
					.style("fill", "#666")
					.text("\u25ba");

				if (yearsArray.length > buttonsNumber) {
					rightArrow
						.style("opacity", 1)
						.attr("pointer-events", "all");

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
											buttonsNumber *
												buttonsPanel.buttonWidth
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
											(yearsArray.length -
												buttonsNumber) *
											buttonsPanel.buttonWidth
										),
										-(
											Math.abs(currentTranslate) +
											buttonsNumber *
												buttonsPanel.buttonWidth
										)
									) +
									",0)"
							)
							.on("end", checkArrows);
					});
				}

				const buttonsModalitiesGroup = buttonsPanel.main
					.append("g")
					.attr("class", "pbiolcbuttonsModalitiesGroup")
					.style("cursor", "pointer");

				const buttonsModalitiesRects = buttonsModalitiesGroup
					.selectAll(null)
					.data(modalities)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiolcbuttonsModalitiesRects")
					.attr(
						"width",
						buttonsPanel.buttonModalitiesWidth -
							buttonsPanel.buttonPadding
					)
					.attr(
						"height",
						buttonsPanel.height -
							buttonsPanel.padding[0] -
							buttonsPanel.buttonVerticalPadding * 2
					)
					.attr(
						"y",
						buttonsPanel.padding[0] +
							buttonsPanel.buttonVerticalPadding
					)
					.attr("x", function (_, i) {
						return (
							i * buttonsPanel.buttonModalitiesWidth +
							buttonsPanel.buttonPadding / 2
						);
					})
					.style("fill", function (d) {
						return d === chartState.selectedModality
							? unBlue
							: "#eaeaea";
					});

				const buttonsModalitiesText = buttonsModalitiesGroup
					.selectAll(null)
					.data(modalities)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiolcbuttonsModalitiesText")
					.attr(
						"y",
						buttonsPanel.height -
							2.8 * buttonsPanel.buttonVerticalPadding
					)
					.attr("x", function (_, i) {
						return (
							i * buttonsPanel.buttonModalitiesWidth +
							buttonsPanel.buttonModalitiesWidth / 2
						);
					})
					.style("fill", function (d) {
						return d === chartState.selectedModality
							? "white"
							: "#444";
					})
					.text(function (d) {
						return capitalize(d);
					});

				const buttonsGroupSize = Math.min(
					buttonsPanel.padding[3] +
						buttonsPanel.arrowPadding +
						buttonsGroup.node().getBoundingClientRect().width,
					buttonsPanel.padding[3] +
						buttonsNumber * buttonsPanel.buttonWidth +
						2 * buttonsPanel.arrowPadding
				);

				const buttonsModalitiesSize = buttonsModalitiesGroup
					.node()
					.getBoundingClientRect().width;

				const modalitiesPosition =
					buttonsGroupSize +
					(buttonsPanel.beneficiariesPadding -
						buttonsGroupSize -
						buttonsModalitiesSize) /
						2;

				buttonsModalitiesGroup.attr(
					"transform",
					"translate(" + modalitiesPosition + ",0)"
				);

				const buttonsBeneficiariesGroup = buttonsPanel.main
					.append("g")
					.attr("class", "pbiolcbuttonsBeneficiariesGroup")
					.attr(
						"transform",
						"translate(" + buttonsPanel.beneficiariesPadding + ",0)"
					)
					.style("cursor", "pointer");

				const buttonsBeneficiariesRects = buttonsBeneficiariesGroup
					.selectAll(null)
					.data(beneficiaries)
					.enter()
					.append("rect")
					.attr("rx", "2px")
					.attr("ry", "2px")
					.attr("class", "pbiolcbuttonsBeneficiariesRects")
					.attr(
						"width",
						buttonsPanel.buttonBeneficiariesWidth -
							buttonsPanel.buttonPadding
					)
					.attr(
						"height",
						buttonsPanel.height -
							buttonsPanel.padding[0] -
							buttonsPanel.buttonVerticalPadding * 2
					)
					.attr(
						"y",
						buttonsPanel.padding[0] +
							buttonsPanel.buttonVerticalPadding
					)
					.attr("x", function (_, i) {
						return (
							i * buttonsPanel.buttonBeneficiariesWidth +
							buttonsPanel.buttonPadding / 2
						);
					})
					.style("fill", function (d) {
						return d === chartState.selectedBeneficiary
							? unBlue
							: "#eaeaea";
					});

				const buttonsBeneficiariesText = buttonsBeneficiariesGroup
					.selectAll(null)
					.data(beneficiaries)
					.enter()
					.append("text")
					.attr("text-anchor", "middle")
					.attr("class", "pbiolcbuttonsBeneficiariesText")
					.attr(
						"y",
						buttonsPanel.height -
							2.8 * buttonsPanel.buttonVerticalPadding
					)
					.attr("x", function (_, i) {
						return (
							i * buttonsPanel.buttonBeneficiariesWidth +
							buttonsPanel.buttonBeneficiariesWidth / 2
						);
					})
					.style("fill", function (d) {
						return d === chartState.selectedBeneficiary
							? "white"
							: "#444";
					})
					.text(function (d) {
						const buttonName = d === "actual" ? "reached" : d;
						return capitalize(buttonName);
					});

				buttonsRects
					.on("mouseover", function (d) {
						mouseOverButtonsRects(d, this, "year");
					})
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

				d3.select("body").on("d3ChartsYear.pbiolc", function () {
					clickButtonsRects(
						validateCustomEventYear(+d3.event.detail),
						true
					);
					if (yearsArray.length > buttonsNumber) {
						repositionButtonsGroup();
						checkArrows();
					}
				});

				buttonsModalitiesRects
					.on("mouseover", function (d) {
						mouseOverButtonsRects(d, this, "modality");
					})
					.on("mouseout", mouseOutButtonsModalitiesRects)
					.on("click", clickButtonsModalitiesRects);

				buttonsBeneficiariesRects
					.on("mouseover", function (d) {
						mouseOverButtonsRects(d, this, "beneficiary");
					})
					.on("mouseout", mouseOutButtonsBeneficiariesRects)
					.on("click", clickButtonsBeneficiariesRects);

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
					const firstYearIndex =
						chartState.selectedYear[0] <
						yearsArray[buttonsNumber / 2]
							? 0
							: chartState.selectedYear[0] >
							  yearsArray[yearsArray.length - buttonsNumber / 2]
							? yearsArray.length - buttonsNumber
							: yearsArray.indexOf(chartState.selectedYear[0]) -
							  buttonsNumber / 2;

					buttonsGroup.attr(
						"transform",
						"translate(" +
							-(buttonsPanel.buttonWidth * firstYearIndex) +
							",0)"
					);
				}

				//end of createButtonsPanel
			}

			function createLabelsPanel() {
				if (data.some(e => e.cluster === "COVID-19")) {
					d3.select(".pbiolccovidDisclaimer").style("display", null);
				} else {
					d3.select(".pbiolccovidDisclaimer").style(
						"display",
						"none"
					);
				}

				let labelGroup = labelsPanel.main
					.selectAll(".pbiolcLabelGroup")
					.data(data, function (d) {
						return d.clusterKey;
					});

				const labelGroupExit = labelGroup
					.exit()
					.transition()
					.duration(duration)
					.style("opacity", 0)
					.remove();

				const labelGroupEnter = labelGroup
					.enter()
					.append("g")
					.attr("class", "pbiolcLabelGroup")
					.attr("transform", function (d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				const labelGroupEnterText = labelGroupEnter
					.append("text")
					.attr("class", "pbiolcLabelGroupText")
					.attr("text-anchor", "middle")
					.attr("y", clusterIconSize / 5)
					.attr("x", labelsPanel.width / 2 + clusterIconSize / 2)
					.text(function (d) {
						return d.cluster;
					});

				const labelGroupEnterIcon = labelGroupEnter
					.append("image")
					.attr("width", clusterIconSize + "px")
					.attr("height", clusterIconSize + "px")
					.attr("x", function () {
						return (
							(labelsPanel.width -
								this.previousSibling.getComputedTextLength()) /
								2 -
							clusterIconSize / 2 -
							clusterIconPadding
						);
					})
					.attr("y", -(clusterIconSize / 2))
					.attr("xlink:href", function (d) {
						return clusterIcons[d.cluster];
					});

				const labelTooltipRectangleEnter = labelGroupEnter
					.append("rect")
					.attr("class", "pbiolcLabelsTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", labelsPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all");

				labelGroup
					.transition()
					.duration(duration)
					.attr("transform", function (d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				labelGroup = labelGroupEnter.merge(labelGroup);

				const labelTooltipRectangle = labelGroup.select(
					".pbiolcLabelsTooltipRectangle"
				);

				labelTooltipRectangle
					.on("mouseover", clusterMouseOver)
					.on("mouseout", clusterMouseOut);

				//end of createLabelsPanel
			}

			function createAllocationsPanel() {
				const totalAllocations = d3.sum(data, function (d) {
					return d[chartState.selectedModality];
				});

				const allocationsPanelTitle = allocationsPanel.main
					.selectAll(".pbiolcAllocationsPanelTitle")
					.data([true])
					.enter()
					.append("text")
					.attr("cursor", "pointer")
					.attr("class", "pbiolcAllocationsPanelTitle")
					.attr("text-anchor", "end")
					.attr("y", allocationsPanel.padding[0] - titleMargin)
					.attr("x", xScaleAllocations(0))
					.text("Allocations in US$")
					.append("tspan")
					.attr("class", "pbiolcAllocationsPanelSubTitle")
					.text(" (% of total)");

				allocationsPanel.main
					.select(".pbiolcAllocationsPanelTitle")
					.on("mouseover", function () {
						mouseOverTitles("value of allocations.", this);
					})
					.on("mouseout", mouseOutTooltip);

				let sortByAllocations = allocationsPanel.main
					.selectAll(".pbiolcSortByAllocations")
					.data([true]);

				sortByAllocations = sortByAllocations
					.enter()
					.append("text")
					.attr("class", "pbiolcSortByAllocations")
					.attr("y", allocationsPanel.padding[0] - titleMargin)
					.attr("x", xScaleAllocations(0) + sortByPadding)
					.attr("cursor", "pointer")
					.text("\u2190 sort by")
					.merge(sortByAllocations)
					.style(
						"opacity",
						chartState.sorting === "allocations" ? 1 : 0
					);

				let allocationsGroup = allocationsPanel.main
					.selectAll(".pbiolcAllocationsGroup")
					.data(data, function (d) {
						return d.clusterKey;
					});

				const allocationsGroupExit = allocationsGroup
					.exit()
					.transition()
					.duration(duration)
					.style("opacity", 0)
					.remove();

				const allocationsGroupEnter = allocationsGroup
					.enter()
					.append("g")
					.attr("class", "pbiolcAllocationsGroup")
					.attr("transform", function (d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				const allocationsStickEnter = allocationsGroupEnter
					.append("rect")
					.attr("class", "pbiolcAllocationsStick")
					.attr("x", xScaleAllocations(0))
					.attr("y", -(stickHeight / 4))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const allocationsLollipopEnter = allocationsGroupEnter
					.append("circle")
					.attr("class", "pbiolcAllocationsLollipop")
					.attr("cx", xScaleAllocations(0))
					.attr("cy", stickHeight / 4)
					.attr("r", lollipopRadius)
					.classed("contributionColorFill", true);

				const allocationsPaidIndicatorEnter = allocationsGroupEnter
					.append("path")
					.attr("class", "pbiolcAllocationsPaidIndicator")
					.attr("d", symbolTriangle)
					.style(
						"opacity",
						chartState.selectedModality === "total" ? 1 : 0
					)
					.attr(
						"transform",
						"translate(" +
							xScaleAllocations(0) +
							"," +
							(Math.sqrt((4 * symbolSize) / Math.sqrt(3)) / 2 +
								stickHeight) +
							")"
					);

				const allocationsLabelEnter = allocationsGroupEnter
					.append("text")
					.attr("class", "pbiolcAllocationsLabel")
					.attr("text-anchor", "end")
					.attr(
						"x",
						xScaleAllocations(0) - allocationsPanel.labelPadding
					)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const allocationsTooltipRectangleEnter = allocationsGroupEnter
					.append("rect")
					.attr("class", "pbiolcAllocationsTooltipRectangle")
					.attr("y", -lollipopGroupHeight / 2)
					.attr("height", lollipopGroupHeight)
					.attr("width", allocationsPanel.width)
					.style("fill", "none")
					.attr("pointer-events", "all");

				allocationsGroup =
					allocationsGroupEnter.merge(allocationsGroup);

				allocationsGroup
					.transition()
					.duration(duration)
					.attr("transform", function (d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				allocationsGroup
					.select(".pbiolcAllocationsStick")
					.transition()
					.duration(duration)
					.attr("x", function (d) {
						return xScaleAllocations(
							d[chartState.selectedModality]
						);
					})
					.attr("width", function (d) {
						return (
							xScaleAllocations.range()[0] -
							xScaleAllocations(d[chartState.selectedModality])
						);
					});

				allocationsGroup
					.select(".pbiolcAllocationsLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function (d) {
						return xScaleAllocations(
							d[chartState.selectedModality]
						);
					});

				allocationsGroup
					.select(".pbiolcAllocationsPaidIndicator")
					.transition()
					.duration(duration)
					.style(
						"opacity",
						chartState.selectedModality === "total" ? 1 : 0
					)
					.attr("transform", function (d) {
						const thisPadding =
							xScaleAllocations(d.standard) -
								xScaleAllocations(d.total) <
							lollipopRadius
								? lollipopRadius - stickHeight / 2
								: 0;
						return (
							"translate(" +
							xScaleAllocations(d.standard) +
							"," +
							(Math.sqrt((4 * symbolSize) / Math.sqrt(3)) / 2 +
								stickHeight +
								thisPadding) +
							")"
						);
					});

				allocationsGroup
					.select(".pbiolcAllocationsLabel")
					.transition()
					.duration(duration)
					.attr("x", function (d) {
						return (
							xScaleAllocations(d[chartState.selectedModality]) -
							allocationsPanel.labelPadding
						);
					})
					.tween("text", function (d) {
						const node = this;
						const percentOfTotalValue = formatPercent(
							d[chartState.selectedModality] / totalAllocations
						);
						const percentOfTotal =
							d[chartState.selectedModality] === 0
								? ""
								: " (" +
								  (percentOfTotalValue === "0%"
										? "<1%"
										: percentOfTotalValue) +
								  ")";
						const i = d3.interpolate(
							reverseFormat(node.textContent) || 0,
							d[chartState.selectedModality]
						);
						return function (t) {
							d3.select(node)
								.text(
									d3
										.formatPrefix(
											".0",
											d[chartState.selectedModality]
										)(i(t))
										.replace("G", "B")
								)
								.append("tspan")
								.attr(
									"class",
									"pbiolcAllocationsLabelPercentage"
								)
								.attr("dy", "-0.5px")
								.text(percentOfTotal);
						};
					});

				const allocationsTooltipRectangle = allocationsGroup.select(
					".pbiolcAllocationsTooltipRectangle"
				);

				allocationsTooltipRectangle
					.on("mouseover", clusterMouseOver)
					.on("mouseout", clusterMouseOut);

				groupXAxisAllocations
					.transition()
					.duration(duration)
					.call(xAxisAllocations);

				groupXAxisAllocations
					.selectAll(".tick")
					.filter(function (d) {
						return d === 0;
					})
					.remove();

				//end of createAllocationsPanel
			}

			function createBeneficiariesPanel() {
				const totalBeneficiaries = d3.sum(data, function (d) {
					return d[
						chartState.selectedModality +
							chartState.selectedBeneficiary
					];
				});

				let beneficiariesPanelTitle = beneficiariesPanel.main
					.selectAll(".pbiolcBeneficiariesPanelTitle")
					.data([true]);

				beneficiariesPanelTitle = beneficiariesPanelTitle
					.enter()
					.append("text")
					.attr("cursor", "pointer")
					.attr("class", "pbiolcBeneficiariesPanelTitle")
					.attr("y", beneficiariesPanel.padding[0] - titleMargin)
					.attr("x", xScaleBeneficiaries(0))
					.merge(beneficiariesPanelTitle)
					.text(
						"People " +
							(chartState.selectedBeneficiary === "actual"
								? "Reached"
								: "Targeted") +
							" in numbers"
					);

				let beneficiariesPanelTitleSpan = beneficiariesPanelTitle
					.selectAll(".pbiolcBeneficiariesPanelSubTitleSpan")
					.data([true])
					.enter()
					.append("tspan")
					.attr(
						"class",
						"pbiolcBeneficiariesPanelSubTitle pbiolcBeneficiariesPanelSubTitleSpan"
					)
					.text(" (% of total)");

				beneficiariesPanel.main
					.select(".pbiolcBeneficiariesPanelTitle")
					.on("mouseover", function () {
						mouseOverTitles("number of beneficiaries.", this);
					})
					.on("mouseout", mouseOutTooltip);

				let sortByBeneficiaries = beneficiariesPanel.main
					.selectAll(".pbiolcSortByBeneficiaries")
					.data([true]);

				sortByBeneficiaries = sortByBeneficiaries
					.enter()
					.append("text")
					.attr("class", "pbiolcSortByBeneficiaries")
					.attr("y", beneficiariesPanel.padding[0] - titleMargin)
					.attr("x", xScaleBeneficiaries(0) - sortByPadding)
					.attr("text-anchor", "end")
					.attr("cursor", "pointer")
					.text("sort by \u2192")
					.merge(sortByBeneficiaries)
					.style(
						"opacity",
						chartState.sorting === "beneficiaries" ? 1 : 0
					);

				let beneficiariesGroup = beneficiariesPanel.main
					.selectAll(".pbiolcBeneficiariesGroup")
					.data(data, function (d) {
						return d.clusterKey;
					});

				const beneficiariesGroupExit = beneficiariesGroup
					.exit()
					.transition()
					.duration(duration)
					.style("opacity", 0)
					.remove();

				const beneficiariesGroupEnter = beneficiariesGroup
					.enter()
					.append("g")
					.attr("class", "pbiolcBeneficiariesGroup")
					.attr("transform", function (d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				const beneficiariesStickEnter = beneficiariesGroupEnter
					.append("rect")
					.attr("class", "pbiolcBeneficiariesStick")
					.attr("x", xScaleBeneficiaries(0))
					.attr("y", -(stickHeight / 4))
					.attr("height", stickHeight)
					.attr("width", 0)
					.classed("contributionColorFill", true);

				const beneficiariesLollipopEnter = beneficiariesGroupEnter
					.append("circle")
					.attr("class", "pbiolcBeneficiariesLollipop")
					.attr("cx", xScaleBeneficiaries(0))
					.attr("cy", stickHeight / 4)
					.attr("r", lollipopRadius)
					.classed("contributionColorFill", true);

				const beneficiariesStandardIndicatorEnter =
					beneficiariesGroupEnter
						.append("path")
						.attr("class", "pbiolcBeneficiariesStandardIndicator")
						.attr("d", symbolTriangle)
						.style(
							"opacity",
							chartState.selectedModality === "total" ? 1 : 0
						)
						.attr(
							"transform",
							"translate(" +
								xScaleBeneficiaries(0) +
								"," +
								(Math.sqrt((4 * symbolSize) / Math.sqrt(3)) /
									2 +
									stickHeight) +
								")"
						);

				const beneficiariesLabelEnter = beneficiariesGroupEnter
					.append("text")
					.attr("class", "pbiolcBeneficiariesLabel")
					.attr(
						"x",
						xScaleBeneficiaries(0) + beneficiariesPanel.labelPadding
					)
					.attr("y", verticalLabelPadding)
					.text(formatNumberSI(0));

				const beneficiariesTooltipRectangleEnter =
					beneficiariesGroupEnter
						.append("rect")
						.attr("class", "pbiolcBeneficiariesTooltipRectangle")
						.attr("y", -lollipopGroupHeight / 2)
						.attr("height", lollipopGroupHeight)
						.attr("width", beneficiariesPanel.width)
						.style("fill", "none")
						.attr("pointer-events", "all");

				beneficiariesGroup =
					beneficiariesGroupEnter.merge(beneficiariesGroup);

				beneficiariesGroup
					.transition()
					.duration(duration)
					.attr("transform", function (d) {
						return "translate(0," + yScale(d.cluster) + ")";
					});

				beneficiariesGroup
					.select(".pbiolcBeneficiariesStick")
					.transition()
					.duration(duration)
					.attr("width", function (d) {
						return (
							xScaleBeneficiaries(
								d[
									chartState.selectedModality +
										chartState.selectedBeneficiary
								]
							) - beneficiariesPanel.padding[3]
						);
					});

				beneficiariesGroup
					.select(".pbiolcBeneficiariesLollipop")
					.transition()
					.duration(duration)
					.attr("cx", function (d) {
						return xScaleBeneficiaries(
							d[
								chartState.selectedModality +
									chartState.selectedBeneficiary
							]
						);
					});

				beneficiariesGroup
					.select(".pbiolcBeneficiariesStandardIndicator")
					.transition()
					.duration(duration)
					.style(
						"opacity",
						chartState.selectedBeneficiary === "targeted" ? 1 : 0
					)
					.attr("transform", function (d) {
						const thisPadding =
							xScaleBeneficiaries(
								d[chartState.selectedModality + "targeted"]
							) -
								xScaleBeneficiaries(
									d[chartState.selectedModality + "actual"]
								) <
							lollipopRadius
								? lollipopRadius - stickHeight / 2
								: 0;
						return (
							"translate(" +
							Math.min(
								xScaleBeneficiaries(
									d[chartState.selectedModality + "actual"]
								),
								xScaleBeneficiaries(
									d[chartState.selectedModality + "targeted"]
								)
							) +
							"," +
							(Math.sqrt((4 * symbolSize) / Math.sqrt(3)) / 2 +
								stickHeight +
								thisPadding) +
							")"
						);
					});

				beneficiariesGroup
					.select(".pbiolcBeneficiariesLabel")
					.transition()
					.duration(duration)
					.attr("x", function (d) {
						return (
							xScaleBeneficiaries(
								d[
									chartState.selectedModality +
										chartState.selectedBeneficiary
								]
							) + beneficiariesPanel.labelPadding
						);
					})
					.tween("text", function (d) {
						const node = this;
						const percentage = formatPercent(
							d[
								chartState.selectedModality +
									chartState.selectedBeneficiary
							] / totalBeneficiaries
						);
						const percentageText =
							d[
								chartState.selectedModality +
									chartState.selectedBeneficiary
							] === 0
								? ""
								: " (" +
								  (percentage === "0%" ? "<1%" : percentage) +
								  ")";
						const i = d3.interpolate(
							reverseFormat(node.textContent) || 0,
							d[
								chartState.selectedModality +
									chartState.selectedBeneficiary
							]
						);
						return function (t) {
							d3.select(node)
								.text(
									d3
										.formatPrefix(
											".0",
											d[
												chartState.selectedModality +
													chartState.selectedBeneficiary
											]
										)(i(t))
										.replace("G", "B")
								)
								.append("tspan")
								.attr(
									"class",
									"pbiolcBeneficiariesLabelPercentage"
								)
								.attr("dy", "-0.5px")
								.text(percentageText);
						};
					});

				const beneficiariesTooltipRectangle = beneficiariesGroup.select(
					".pbiolcBeneficiariesTooltipRectangle"
				);

				beneficiariesTooltipRectangle
					.on("mouseover", clusterMouseOver)
					.on("mouseout", clusterMouseOut);

				groupXAxisBeneficiaries
					.transition()
					.duration(duration)
					.call(xAxisBeneficiaries);

				groupXAxisBeneficiaries
					.selectAll(".tick")
					.filter(function (d) {
						return d === 0;
					})
					.remove();

				//end of createBeneficiariesPanel
			}

			function clickButtonsRects(d, singleSelection) {
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

				d3.selectAll(".pbiolcbuttonsRects").style("fill", function (e) {
					return chartState.selectedYear.indexOf(e) > -1
						? unBlue
						: "#eaeaea";
				});

				d3.selectAll(".pbiolcbuttonsText").style("fill", function (e) {
					return chartState.selectedYear.indexOf(e) > -1
						? "white"
						: "#444";
				});

				setYearsDescriptionDiv();

				data = processData(rawData, rawLaunchedAllocationsData);

				selectDiv
					.selectAll(".pbiolcCheckboxDiv")
					.filter(function (d) {
						return d !== "All CBPFs";
					})
					.select("input")
					.property("disabled", function (d) {
						return chartState.cbpfsInData.indexOf(d) === -1;
					});

				selectDiv
					.selectAll(".pbiolcCheckboxDiv")
					.filter(function (d) {
						return d !== "All CBPFs";
					})
					.style("opacity", function (d) {
						return chartState.cbpfsInData.indexOf(d) === -1
							? disabledOpacity
							: 1;
					});

				setxScaleDomains(data);

				sortData(data);

				createTopPanel();

				createLabelsPanel();

				createAllocationsPanel();

				createBeneficiariesPanel();

				//end of clickButtonsRects
			}

			function clickButtonsModalitiesRects(d) {
				chartState.selectedModality = d;

				if (queryStringValues.has("modality")) {
					queryStringValues.set("modality", d);
				} else {
					queryStringValues.append("modality", d);
				}

				d3.selectAll(".pbiolcbuttonsModalitiesRects").style(
					"fill",
					function (e) {
						return e === chartState.selectedModality
							? unBlue
							: "#eaeaea";
					}
				);

				d3.selectAll(".pbiolcbuttonsModalitiesText").style(
					"fill",
					function (e) {
						return e === chartState.selectedModality
							? "white"
							: "#444";
					}
				);

				createLegend();

				sortData(data);

				createTopPanel();

				createLabelsPanel();

				createAllocationsPanel();

				createBeneficiariesPanel();
			}

			function clickButtonsBeneficiariesRects(d) {
				chartState.selectedBeneficiary = d;

				if (queryStringValues.has("persons")) {
					queryStringValues.set("persons", d);
				} else {
					queryStringValues.append("persons", d);
				}

				d3.selectAll(".pbiolcbuttonsBeneficiariesRects").style(
					"fill",
					function (e) {
						return e === chartState.selectedBeneficiary
							? unBlue
							: "#eaeaea";
					}
				);

				d3.selectAll(".pbiolcbuttonsBeneficiariesText").style(
					"fill",
					function (e) {
						return e === chartState.selectedBeneficiary
							? "white"
							: "#444";
					}
				);

				createLegend();

				if (chartState.sorting === "beneficiaries") {
					sortData(data);
				}

				xScaleBeneficiaries.domain([
					0,
					Math.max(
						1e3,
						d3.max(data, function (d) {
							return d["total" + chartState.selectedBeneficiary];
						})
					) * xScaleDomainMargin,
				]);

				createTopPanel();

				createLabelsPanel();

				createBeneficiariesPanel();
			}

			svg.selectAll(".pbiolcAllocationsPanelTitle").on(
				"click",
				function () {
					tooltip.style("display", "none");
					if (chartState.sorting === "allocations") return;
					chartState.sorting = "allocations";
					svg.select(".pbiolcSortByAllocations").style("opacity", 1);
					svg.select(".pbiolcSortByBeneficiaries").style(
						"opacity",
						0
					);
					sortData(data);
					createAllocationsPanel();
					createLabelsPanel();
					createBeneficiariesPanel();
				}
			);

			svg.selectAll(".pbiolcBeneficiariesPanelTitle").on(
				"click",
				function () {
					tooltip.style("display", "none");
					if (chartState.sorting === "beneficiaries") return;
					chartState.sorting = "beneficiaries";
					svg.select(".pbiolcSortByAllocations").style("opacity", 0);
					svg.select(".pbiolcSortByBeneficiaries").style(
						"opacity",
						1
					);
					sortData(data);
					createAllocationsPanel();
					createLabelsPanel();
					createBeneficiariesPanel();
				}
			);

			function mouseOverButtonsRects(d, thisElement, type) {
				if (type === "year") {
					tooltip.style("display", "block").html(null);

					const innerTooltip = tooltip
						.append("div")
						.style("max-width", "200px")
						.attr("id", "pbiolcInnerTooltipDiv");

					innerTooltip.html(
						"Click for selecting a single year. Double-click or ALT + click for selecting multiple years."
					);

					const containerSize = containerDiv
						.node()
						.getBoundingClientRect();

					const thisSize = thisElement.getBoundingClientRect();

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
							thisSize.top +
								thisSize.height / 2 -
								containerSize.top <
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
				}

				d3.select(thisElement).style("fill", unBlue);
				d3.select(thisElement.parentNode)
					.selectAll("text")
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "white");
			}

			function mouseOutButtonsRects(d) {
				tooltip.style("display", "none");
				if (chartState.selectedYear.indexOf(d) > -1) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbiolcbuttonsText")
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "#444");
			}

			function mouseOutButtonsModalitiesRects(d) {
				if (d === chartState.selectedModality) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbiolcbuttonsModalitiesText")
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "#444");
			}

			function mouseOutButtonsBeneficiariesRects(d) {
				if (d === chartState.selectedBeneficiary) return;
				d3.select(this).style("fill", "#eaeaea");
				d3.selectAll(".pbiolcbuttonsBeneficiariesText")
					.filter(function (e) {
						return e === d;
					})
					.style("fill", "#444");
			}

			function mouseOverTitles(type, self) {
				tooltip
					.style("display", "block")
					.html(
						"<div style='max-width:190px;'>Click here to sort the sectors according to the " +
							type +
							"</div>"
					);

				const thisBox = self.getBoundingClientRect();

				const containerBox = containerDiv
					.node()
					.getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top;

				const thisOffsetLeft =
					thisBox.left -
					containerBox.left +
					(thisBox.width - tooltipBox.width) / 2;

				tooltip
					.style("left", thisOffsetLeft + "px")
					.style("top", thisOffsetTop + 26 + "px");
			}

			function mouseOutTooltip() {
				tooltip.style("display", "none");
			}

			function clusterMouseOver(d) {
				currentHoveredElem = this;

				svg.selectAll(
					".pbiolcLabelGroup, .pbiolcAllocationsGroup, .pbiolcBeneficiariesGroup"
				).style("opacity", function (e) {
					return d.cluster === e.cluster ? 1 : fadeOpacity;
				});

				tooltip.style("display", "block");

				if (d.total !== 0) {
					tooltip.html(
						"Sector: <strong>" +
							d.cluster +
							"</strong><br><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
							tooltipBarWidth +
							"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Total Allocated (US$):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>$" +
							formatMoney0Decimals(d.total) +
							"</div></div><div id='pbiolcAllocationsTooltipBar'></div><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
							tooltipBarWidth +
							"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard (" +
							formatPercent(d.standard / d.total) +
							"):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>$" +
							formatMoney0Decimals(d.standard) +
							"</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve (" +
							formatPercent(d.reserve / d.total) +
							"):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>$" +
							formatMoney0Decimals(d.reserve) +
							"</span></div></div><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
							tooltipBarWidth +
							"px;'><div style='display:flex;flex:0 60%;white-space:pre;'>People Targeted (number):</div><div style='display:flex;flex:0 40%;justify-content:flex-end;'>" +
							formatComma(d.totaltargeted) +
							"</div></div><div id='pbiolcBeneficiariesTargetedTooltipBar'></div>" +
							(d.totaltargeted
								? "<div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
								  tooltipBarWidth +
								  "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard (" +
								  formatPercent(
										d.standardtargeted / d.totaltargeted ||
											0
								  ) +
								  "):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>" +
								  formatComma(d.standardtargeted) +
								  "</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve (" +
								  formatPercent(
										d.reservetargeted / d.totaltargeted || 0
								  ) +
								  "):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>" +
								  formatComma(d.reservetargeted) +
								  "</span></div></div>"
								: "") +
							"<br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
							tooltipBarWidth +
							"px;'><div style='display:flex;flex:0 55%;white-space:pre;'>People Reached (number):</div><div style='display:flex;flex:0 45%;justify-content:flex-end;'>" +
							formatComma(d.totalactual) +
							(d.totalactual
								? "<span style='font-size:10px;white-space:pre;'> (" +
								  formatPercent(
										d.totalactual / d.totaltargeted
								  ) +
								  " of targeted)</span>"
								: "") +
							"</div></div><div id='pbiolcBeneficiariesReachedTooltipBar'></div>" +
							(d.totalactual
								? "<div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
								  tooltipBarWidth +
								  "px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Standard (" +
								  formatPercent(
										d.standardactual / d.totalactual || 0
								  ) +
								  "):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorDarkerHTMLcolor'>" +
								  formatComma(d.standardactual) +
								  "</span></div><div style='display:flex;flex:0 54%;white-space:pre;'>Reserve (" +
								  formatPercent(
										d.reserveactual / d.totalactual || 0
								  ) +
								  "):</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'><span class='contributionColorHTMLcolor'>" +
								  formatComma(d.reserveactual) +
								  "</span></div></div>"
								: "")
					);

					createTooltipBar(
						d,
						"pbiolcAllocationsTooltipBar",
						tooltipBarWidth,
						"total",
						"standard",
						"reserve"
					);

					if (d.totaltargeted) {
						createTooltipBar(
							d,
							"pbiolcBeneficiariesTargetedTooltipBar",
							tooltipBarWidth,
							"totaltargeted",
							"standardtargeted",
							"reservetargeted"
						);
					}

					if (d.totalactual) {
						createTooltipBar(
							d,
							"pbiolcBeneficiariesReachedTooltipBar",
							tooltipBarWidth,
							"totalactual",
							"standardactual",
							"reserveactual"
						);
					}
				} else {
					tooltip.html(
						"Sector: <strong>" +
							d.cluster +
							"</strong><br><br><div style='margin:0px 0px 6px 0px;display:flex;flex-wrap:wrap;width:" +
							tooltipBarWidth +
							"px;'><div style='display:flex;flex:0 54%;white-space:pre;'>Total Allocated:</div><div style='display:flex;flex:0 46%;justify-content:flex-end;'>No Value Allocated</div></div>"
					);
				}

				const thisBox = this.getBoundingClientRect();

				const containerBox = containerDiv
					.node()
					.getBoundingClientRect();

				const tooltipBox = tooltip.node().getBoundingClientRect();

				const thisOffsetTop = thisBox.top - containerBox.top;

				const thisOffsetLeft = width / 2 - tooltipBox.width / 2;

				tooltip
					.style("left", thisOffsetLeft + "px")
					.style(
						"top",
						containerBox.bottom - thisBox.bottom < tooltipBox.height
							? thisOffsetTop - tooltipBox.height - 6 + "px"
							: thisOffsetTop + 28 + "px"
					);

				//end of clusterMouseOver
			}

			function clusterMouseOut() {
				if (isSnapshotTooltipVisible) return;

				currentHoveredElem = null;

				svg.selectAll(
					".pbiolcLabelGroup, .pbiolcAllocationsGroup, .pbiolcBeneficiariesGroup"
				).style("opacity", 1);

				tooltip.style("display", "none");

				//end of clusterMouseOut
			}

			function createTooltipBar(
				datum,
				container,
				containerWidth,
				total,
				property1,
				property2
			) {
				const containerDiv = d3.select("#" + container);

				containerDiv
					.style("margin-bottom", "4px")
					.style("margin-top", "4px")
					.style("width", containerWidth + "px");

				const scaleDiv = d3
					.scaleLinear()
					.domain([0, datum[total]])
					.range([0, containerWidth]);

				const div1 = containerDiv
					.append("div")
					.style("float", "left")
					.classed("contributionColorDarkerHTMLbc", true)
					.style("height", "14px")
					.style("width", "0px")
					.style(
						"border-right",
						scaleDiv(datum[property1]) < 1
							? "0px solid white"
							: "1px solid white"
					);

				div1.transition()
					.duration(duration / 4)
					.style("width", scaleDiv(datum[property1]) + "px");

				const div2 = containerDiv
					.append("div")
					.classed("contributionColorHTMLbc", true)
					.style("margin-left", "0px")
					.style("height", "14px")
					.style("width", "0px");

				div2.transition()
					.duration(duration / 4)
					.style("margin-left", scaleDiv(datum[property1]) + 1 + "px")
					.style("width", scaleDiv(datum[property2]) + "px");

				//end of createTooltipBar
			}

			//end of draw
		}

		function safeDivide(underApproval, approved, launched){
			if (launched === 0) return {underApprovalPercent: 0, underPlusApprovedPercent: 0};
			return {
				underApprovalPercent: (underApproval / launched) * 100,
				underPlusApprovedPercent: ((underApproval + approved) / launched) * 100
			}
		}

		function processData(rawData, rawLaunchedAllocationsData) {
			topValuesLaunchedData.launched = 0;
			topValuesLaunchedData.underApproval = 0;

			for (const key in yearsWithUnderApprovalAboveMin)
				delete yearsWithUnderApprovalAboveMin[key];

			const aggregatedLaunchedValues = {};

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
					aggregatedLaunchedValues[row.AllocationYear] = {
						underApproval: (aggregatedLaunchedValues[row.AllocationYear] ? aggregatedLaunchedValues[row.AllocationYear].underApproval : 0) + row.TotalUnderApprovalBudget,
						approved: (aggregatedLaunchedValues[row.AllocationYear] ? aggregatedLaunchedValues[row.AllocationYear].approved : 0) + row.TotalApprovedBudget,
						launched: (aggregatedLaunchedValues[row.AllocationYear] ? aggregatedLaunchedValues[row.AllocationYear].launched : 0) + row.TotalUSDPlanned
					};
					topValuesLaunchedData.launched += row.TotalUSDPlanned;
					topValuesLaunchedData.underApproval +=
						row.TotalUnderApprovalBudget;
				}
			});

			for (const year in aggregatedLaunchedValues) {
				const {underApprovalPercent, underPlusApprovedPercent} = safeDivide(aggregatedLaunchedValues[year].underApproval, aggregatedLaunchedValues[year].approved, aggregatedLaunchedValues[year].launched);
				yearsWithUnderApprovalAboveMin[year] = underApprovalPercent > minimumUnderApprovalPercentage || underPlusApprovedPercent < minimumUnderApprovalPercentage;
			};

			chartState.cbpfsInData.length = 0;

			const clustersFiltered =
				chartState.selectedYear.indexOf(2020) > -1
					? clusters
					: clusters.filter(function (d) {
							return d !== "COVID-19";
					  });

			const data = clustersFiltered.map(function (d) {
				return {
					cluster: d,
					clusterKey: d.replace(/\W/g, ""),
					standard: 0,
					reserve: 0,
					total: 0,
					standardactual: 0,
					reserveactual: 0,
					totalactual: 0,
					standardtargeted: 0,
					reservetargeted: 0,
					totaltargeted: 0,
				};
			});

			rawData.forEach(function (row) {
				if (
					chartState.selectedYear.indexOf(+row.AllocationYear) > -1 &&
					chartState.cbpfsInData.indexOf("id" + row.PooledFundId) ===
						-1
				) {
					chartState.cbpfsInData.push("id" + row.PooledFundId);
				}
			});

			const filteredData = rawData.filter(function (d) {
				return (
					chartState.selectedYear.indexOf(+d.AllocationYear) > -1 &&
					chartState.selectedCbpfs.indexOf("id" + d.PooledFundId) > -1
				);
			});

			filteredData.forEach(function (d) {
				const foundCluster = data.find(function (e) {
					return e.cluster === d.Cluster;
				});

				if (foundCluster) {
					if (d.AllocationSourceName === "Standard") {
						foundCluster.standard += +d.BudgetByCluster;
						foundCluster.total += +d.BudgetByCluster;
						foundCluster.standardactual +=
							~~+d.BeneficiariesActualTotal;
						foundCluster.totalactual +=
							~~+d.BeneficiariesActualTotal;
						foundCluster.standardtargeted +=
							~~+d.BeneficiariesPlannedTotal;
						foundCluster.totaltargeted +=
							~~+d.BeneficiariesPlannedTotal;
					} else {
						foundCluster.reserve += +d.BudgetByCluster;
						foundCluster.total += +d.BudgetByCluster;
						foundCluster.reserveactual +=
							~~+d.BeneficiariesActualTotal;
						foundCluster.totalactual +=
							~~+d.BeneficiariesActualTotal;
						foundCluster.reservetargeted +=
							~~+d.BeneficiariesPlannedTotal;
						foundCluster.totaltargeted +=
							~~+d.BeneficiariesPlannedTotal;
					}
				}
			});

			return data;

			//end of processData
		}

		function sortData(data) {
			if (chartState.sorting === "allocations") {
				data.sort(function (a, b) {
					return (
						b[chartState.selectedModality] -
						a[chartState.selectedModality]
					);
				});
			} else {
				data.sort(function (a, b) {
					return (
						b[
							chartState.selectedModality +
								chartState.selectedBeneficiary
						] -
						a[
							chartState.selectedModality +
								chartState.selectedBeneficiary
						]
					);
				});
			}

			const yScaleDomain = data.map(function (d) {
				return d.cluster;
			});

			yScaleDomain.splice(yScaleDomain.indexOf("Multi-Sector"), 1);

			yScaleDomain.push("Multi-Sector");

			yScale.domain(yScaleDomain);
		}

		function setxScaleDomains(data) {
			xScaleAllocations.domain([
				0,
				Math.max(
					1e3,
					d3.max(data, function (d) {
						return d.total;
					})
				) * xScaleDomainMargin,
			]);

			xScaleBeneficiaries.domain([
				0,
				Math.max(
					1e3,
					d3.max(data, function (d) {
						return d["total" + chartState.selectedBeneficiary];
					})
				) * xScaleDomainMargin,
			]);
		}

		function validateYear(yearString) {
			const allYears = yearString
				.split(",")
				.map(function (d) {
					return +d.trim();
				})
				.sort(function (a, b) {
					return a - b;
				});
			allYears.forEach(function (d) {
				if (d && yearsArray.indexOf(d) > -1)
					chartState.selectedYear.push(d);
			});
			if (!chartState.selectedYear.length)
				chartState.selectedYear.push(yearsArray[yearsArray.length - 1]);
		}

		function validateCustomEventYear(yearNumber) {
			if (yearsArray.indexOf(yearNumber) > -1) {
				return yearNumber;
			}
			while (yearsArray.indexOf(yearNumber) === -1) {
				yearNumber =
					yearNumber >= currentYear ? yearNumber - 1 : yearNumber + 1;
			}
			return yearNumber;
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

		function capitalize(str) {
			return str[0].toUpperCase() + str.substring(1);
		}

		function formatSIFloat(value) {
			const length = (~~Math.log10(value) + 1) % 3;
			const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
			const result = d3.formatPrefix("." + digits + "~", value)(value);
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
				if (chartState.selectedYear.length === 1) return null;
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
				y: Math.pow(10, -24),
			};
			Object.keys(transformation).some(function (k) {
				if (s.indexOf(k) > 0) {
					returnValue = parseFloat(s.split(k)[0]) * transformation[k];
					return true;
				}
			});
			return returnValue;
		}

		function createCSV(sourceData) {
			const csvData = processDataToCsv(sourceData).sort(function (a, b) {
				return (
					+b.Year - +a.Year ||
					(a["CBPF Name"].toLowerCase() < b["CBPF Name"].toLowerCase()
						? -1
						: a["CBPF Name"].toLowerCase() >
						  b["CBPF Name"].toLowerCase()
						? 1
						: 0) ||
					(a.Cluster.toLowerCase() < b.Cluster.toLowerCase()
						? -1
						: a.Cluster.toLowerCase() > b.Cluster.toLowerCase()
						? 1
						: 0)
				);
			});

			const header = d3.keys(csvData[0]);

			const replacer = function (key, value) {
				return value === null ? "" : value;
			};

			let rows = csvData.map(function (row) {
				return header
					.map(function (fieldName) {
						return JSON.stringify(row[fieldName], replacer);
					})
					.join(",");
			});

			rows.unshift(header.join(","));

			return rows.join("\r\n");

			//end of createCSV
		}

		function processDataToCsv(rawData) {
			const filteredData = rawData.filter(function (d) {
				return (
					chartState.selectedYear.indexOf(+d.AllocationYear) > -1 &&
					chartState.selectedCbpfs.indexOf("id" + d.PooledFundId) > -1
				);
			});

			const aggregatedData = [];

			filteredData.forEach(function (d) {
				const foundCluster = aggregatedData.find(function (e) {
					return (
						e.Year === +d.AllocationYear &&
						e.Cluster === d.Cluster &&
						e["CBPF Name"] === d.PooledFundName
					);
				});

				if (foundCluster) {
					foundCluster["Total Allocations"] += +d.BudgetByCluster;
					foundCluster["Targeted People"] +=
						~~+d.BeneficiariesPlannedTotal;
					foundCluster["Reached People"] +=
						~~+d.BeneficiariesActualTotal;
				} else {
					aggregatedData.push({
						Year: +d.AllocationYear,
						"CBPF Name": d.PooledFundName,
						Cluster: d.Cluster,
						"Total Allocations": +d.BudgetByCluster,
						"Targeted People": ~~+d.BeneficiariesPlannedTotal,
						"Reached People": ~~+d.BeneficiariesActualTotal,
					});
				}
			});

			return aggregatedData;

			//end of processDataToCsv
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

		function createAnnotationsDiv() {
			iconsDiv.style("opacity", 0).style("pointer-events", "none");

			const overDiv = containerDiv
				.append("div")
				.attr("class", "pbiolcOverDivHelp");

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
				.attr("class", "pbiolcAnnotationMainText")
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
					x: 20,
					y:
						topDivHeight +
						(totalSelectHeight - selectDivSize.height) *
							(topDivSize.width / width),
					width: width - 40,
					height: selectDivSize.height * (width / topDivSize.width),
					xTooltip: 300 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 8) *
						(topDivSize.width / width),
					text: "Use these checkboxes to select the CBPF. A disabled checkbox means that the correspondent CBPF has no data for that year.",
				},
				{
					x: 20,
					y: 118 + topDivHeight + totalSelectHeight,
					width: 420,
					height: 30,
					xTooltip: 78 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 154) *
						(topDivSize.width / width),
					text: "Use these buttons to select year. Double click or press ALT when clicking to select multiple years",
				},
				{
					x: 488,
					y: 118 + topDivHeight + totalSelectHeight,
					width: 212,
					height: 30,
					xTooltip: 444 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 154) *
						(topDivSize.width / width),
					text: "Use these buttons to select the modality type.",
				},
				{
					x: 750,
					y: 118 + topDivHeight + totalSelectHeight,
					width: 134,
					height: 30,
					xTooltip: 720 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 154) *
						(topDivSize.width / width),
					text: "Use these buttons to show targeted or actual persons.",
				},
				{
					x: 190,
					y: 156 + topDivHeight + totalSelectHeight,
					width: 170,
					height: 30,
					xTooltip: 142 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 192) *
						(topDivSize.width / width),
					text: "Click here to sort the sectors by allocations.",
				},
				{
					x: 586,
					y: 156 + topDivHeight + totalSelectHeight,
					width: 186,
					height: 30,
					xTooltip: 520 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 192) *
						(topDivSize.width / width),
					text: "Click here to sort the sectors by persons (targeted or reached).",
				},
				{
					x: 6,
					y: 202 + topDivHeight + totalSelectHeight,
					width: 312,
					height: 334,
					xTooltip: 326 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 242) *
						(topDivSize.width / width),
					text: "This area depicts the amount allocated by sector. The black triangles, when present, indicate standard allocations.",
				},
				{
					x: 582,
					y: 202 + topDivHeight + totalSelectHeight,
					width: 312,
					height: 334,
					xTooltip: 268 * (topDivSize.width / width),
					yTooltip:
						(topDivHeight + totalSelectHeight + 242) *
						(topDivSize.width / width),
					text: "This area depicts the number of targeted or reached persons for each sector. The black triangles, when present, indicate the number of reached persons.",
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
					.attr("class", "pbiolcHelpRectangle")
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
				.attr("y", 180 + topDivHeight + totalSelectHeight)
				.attr("width", 360)
				.attr("height", 50)
				.attr("pointer-events", "none")
				.style("fill", "white")
				.style("stroke", "#888");

			const explanationText = helpSVG
				.append("text")
				.attr("class", "pbiolcAnnotationExplanationText")
				.attr("font-family", "Roboto")
				.attr("font-size", "18px")
				.style("fill", "#222")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", 200 + topDivHeight + totalSelectHeight)
				.attr("pointer-events", "none")
				.text(
					"Hover over the elements surrounded by a blue rectangle to get additional information"
				)
				.call(wrapText2, 350);

			function createTooltip(xPos, yPos, text, self) {
				explanationText.style("opacity", 0);
				explanationTextRect.style("opacity", 0);
				helpSVG.selectAll(".pbiolcHelpRectangle").style("opacity", 0.1);
				d3.select(self).style("opacity", 1);
				const containerBox = containerDiv
					.node()
					.getBoundingClientRect();
				tooltip
					.style("top", yPos + "px")
					.style("left", xPos + "px")
					.style("display", "block")
					.html(text);
			}

			function removeTooltip() {
				tooltip.style("display", "none");
				explanationText.style("opacity", 1);
				explanationTextRect.style("opacity", 1);
				helpSVG.selectAll(".pbiolcHelpRectangle").style("opacity", 0.5);
			}

			//end of createAnnotationsDiv
		}

		function wrapText2(text, width) {
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
				.attr("id", "pbiolcDownloadingDiv")
				.style("left", window.innerWidth / 2 - 100 + "px")
				.style("top", window.innerHeight / 2 - 100 + "px");

			const downloadingDivSvg = downloadingDiv
				.append("svg")
				.attr("class", "pbiolcDownloadingDivSvg")
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

			svg.selectAll("image").attr("xlink:href", function (d) {
				return localStorage.getItem(
					"storedCluster" + d.clusterKey.toLowerCase()
				);
			});

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
				"SectorsOverview_" + csvDateFormat(currentDate) + ".png";

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

			d3.select("#pbiolcDownloadingDiv").remove();
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
				let pdfTextPosition;

				const pdf = new jsPDF();

				createLetterhead();

				const intro = pdf.splitTextToSize(
					"CBPF receives broad support from United Nations Member States, the private sectors and individuals.",
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

				const modality = capitalize(chartState.selectedModality);

				const reachedPersons = capitalize(
					chartState.selectedBeneficiary
				);

				const selectedCountry = countriesList();

				pdf.fromHTML(
					"<div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Date: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						fullDate +
						"</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>" +
						yearsText +
						"<span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						yearsList +
						"</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Modality: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						modality +
						"</span></div><div style='margin-bottom: 2px; font-family: Arial, sans-serif; color: rgb(60, 60 60);'>Reached People: <span style='color: rgb(65, 143, 222); font-weight: 700;'>" +
						reachedPersons +
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

				const sourceDimentions = containerDiv
					.node()
					.getBoundingClientRect();
				const widthInMilimeters = 210 - pdfMargins.left * 2;

				pdf.addImage(
					source,
					"PNG",
					pdfMargins.left,
					pdfTextPosition.y + 2,
					widthInMilimeters,
					widthInMilimeters *
						(sourceDimentions.height / sourceDimentions.width)
				);

				const currentDate = new Date();

				pdf.save(
					"SectorsOverview_" + csvDateFormat(currentDate) + ".pdf"
				);

				removeProgressWheel();

				d3.select("#pbiolcDownloadingDiv").remove();

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
					pdf.rect(0, 297 - pdfMargins.bottom, 210, 2, "F");

					pdf.setTextColor(60);
					pdf.setFont("arial");
					pdf.setFontType("normal");
					pdf.setFontSize(10);
					pdf.text(
						footer,
						pdfMargins.left,
						297 - pdfMargins.bottom + 10
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
				.attr("class", "pbiolcd3chartwheelGroup")
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
			const wheelGroup = d3.select(".pbiolcd3chartwheelGroup");
			wheelGroup.select("path").interrupt();
			wheelGroup.remove();
		}

		//end of d3Chart
	}

	//end of d3ChartIIFE
})();

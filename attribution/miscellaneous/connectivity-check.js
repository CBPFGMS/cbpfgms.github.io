/*!
 * PF Connectivity Check v0.1
 * Pre-flight diagnostic for pages that depend on third-party hosts
 * (GitHub raw data, CDNs, external APIs). Detects hosts blocked by
 * corporate firewalls, VPNs, proxies or DNS filtering and tells the
 * user up front, with a copyable report for their IT team.
 *
 * - Zero dependencies. MUST be served from the page's own origin
 *   (e.g. pfdata.unocha.org/assets/js/), never from a CDN.
 * - Load it in <head>, before the app bundle.
 * - Advisory only: it never stops the app from loading.
 *
 * Usage:
 *   <script src="/assets/js/connectivity-check.js"></script>
 *   <script>PFConnectivityCheck.run(PFConnectivityCheck.presets.cbpfAttribution);</script>
 *
 * The app can listen for the outcome:
 *   window.addEventListener('pf:connectivity', e => console.log(e.detail));
 *   PFConnectivityCheck.ready.then(result => ...);
 */
(function (global) {
	"use strict";

	var GH =
		"https://raw.githubusercontent.com/CBPFGMS/cbpfgms-data/master/utils/attribution/data/";

	/* ------------------------------------------------------------------ */
	/* Presets                                                              */
	/* level: 'critical' -> page cannot work; full warning panel            */
	/*        'degraded' -> page works but looks incomplete; slim bar       */
	/*        'info'     -> listed in the report only, never alerts user    */
	/* expect: 'csv' | 'json' | 'css' -> peek at first bytes to catch proxy  */
	/*         "block pages" that come back as HTTP 200                     */
	/* method: 'fetch' (default) | 'image' | 'opaque' (reachability only)   */
	/* ------------------------------------------------------------------ */
	var presets = {
		cbpfAttribution: {
			targets: [
				{
					id: "gh-data",
					level: "critical",
					expect: "csv",
					label: "Dashboard data files",
					host: "raw.githubusercontent.com",
					url: GH + "MstOrgType.csv",
					impact: "Charts, maps and figures cannot load.",
				},
				{
					id: "attr-api",
					level: "critical",
					expect: "json",
					label: "Donor attribution API",
					host: "pfbi-eastus2-api-site.azurewebsites.net",
					url: "https://pfbi-eastus2-api-site.azurewebsites.net/donor_attribution/api/public/donors",
					impact: "Donor list and attribution figures cannot load.",
				},
				{
					id: "flags",
					level: "degraded",
					method: "image",
					label: "Country flags",
					host: "flagcdn.com",
					url: "https://flagcdn.com/w40/un.png",
					impact: "Flags will not be displayed.",
				},
				{
					id: "icons",
					level: "degraded",
					expect: "css",
					label: "Icons and animations",
					host: "cdnjs.cloudflare.com",
					url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css",
					impact: "Icons will be missing; some animations will not run.",
				},
				{
					id: "fonts-css",
					level: "info",
					expect: "css",
					label: "Web fonts",
					host: "fonts.googleapis.com",
					url: "https://fonts.googleapis.com/css?family=Lora",
					impact: "Standard system fonts are used instead.",
				},
				{
					id: "fonts-files",
					level: "info",
					method: "opaque",
					label: "Web font files",
					host: "fonts.gstatic.com",
					url: "https://fonts.gstatic.com/",
					impact: "Standard system fonts are used instead.",
				},
				{
					id: "analytics",
					level: "info",
					method: "opaque",
					label: "Usage analytics",
					host: "www.googletagmanager.com",
					url: "https://www.googletagmanager.com/gtag/js?id=UA-1884029-23",
					impact: "None for the user.",
				},
			],
		},
	};

	var DEFAULTS = {
		timeoutMs: 8000, // per-host budget, including fallback probe
		progressDelayMs: 900, // show "checking…" only if slower than this
		cacheKey: "pfConnCheck.v1",
		cacheTtlMs: 30 * 60 * 1000, // skip re-checks for 30 min after an all-clear
		contactText:
			"If the problem persists, share the report with your IT team or contact the OCHA pooled funds team.",
		onComplete: null, // function(result) – e.g. send a same-origin beacon
	};

	/* ------------------------------------------------------------------ */
	/* Helpers                                                              */
	/* ------------------------------------------------------------------ */
	function now() {
		return global.performance && performance.now
			? performance.now()
			: Date.now();
	}
	function assign(a) {
		for (var i = 1; i < arguments.length; i++) {
			var s = arguments[i] || {};
			for (var k in s)
				if (Object.prototype.hasOwnProperty.call(s, k)) a[k] = s[k];
		}
		return a;
	}
	function esc(s) {
		return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
			return {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			}[c];
		});
	}
	function hostOf(t) {
		if (t.host) return t.host;
		try {
			return new URL(t.url).hostname;
		} catch (e) {
			return t.url;
		}
	}
	function store(op, key, val) {
		try {
			if (op === "get") return JSON.parse(sessionStorage.getItem(key));
			if (op === "set") sessionStorage.setItem(key, JSON.stringify(val));
			if (op === "del") sessionStorage.removeItem(key);
		} catch (e) {
			/* storage unavailable: run every time */
		}
		return null;
	}

	var VALIDATORS = {
		notHtml: function (head) {
			return /^\s*<(!doctype|html|head|body|title)/i.test(head)
				? "Received a web page instead of data – likely a proxy or firewall block page"
				: true;
		},
		csv: function (head) {
			var r = VALIDATORS.notHtml(head);
			if (r !== true) return r;
			return head.indexOf(",") > -1
				? true
				: "Response does not look like CSV data";
		},
		json: function (head) {
			var r = VALIDATORS.notHtml(head);
			if (r !== true) return r;
			return /^\s*[\[{]/.test(head)
				? true
				: "Response does not look like JSON data";
		},
		css: function (head) {
			return VALIDATORS.notHtml(head);
		},
	};

	// Read only the first n characters, then cancel – avoids downloading big files.
	function readHead(res, n) {
		if (!res.body || !res.body.getReader || !global.TextDecoder) {
			return res.text().then(function (t) {
				return t.slice(0, n);
			});
		}
		var reader = res.body.getReader(),
			dec = new TextDecoder(),
			buf = "";
		function pump() {
			return reader.read().then(function (r) {
				if (r.done) return buf;
				buf += dec.decode(r.value, { stream: true });
				if (buf.length >= n) {
					reader.cancel().catch(function () {});
					return buf;
				}
				return pump();
			});
		}
		return pump().then(function (b) {
			return b.slice(0, n);
		});
	}

	/* ------------------------------------------------------------------ */
	/* Probes                                                               */
	/* ------------------------------------------------------------------ */
	function failTimeout(ms) {
		return {
			state: "fail",
			reason: "timeout",
			detail:
				"No response within " +
				Math.round(ms / 100) / 10 +
				" s (traffic may be silently dropped)",
		};
	}
	var FAIL_BLOCKED = {
		state: "fail",
		reason: "blocked",
		detail: "Connection refused, reset or blocked (firewall, VPN, proxy or DNS filter)",
	};

	function probeImage(t, timeoutMs) {
		return new Promise(function (resolve) {
			var img = new Image(),
				settled = false;
			var timer = setTimeout(function () {
				finish(failTimeout(timeoutMs));
			}, timeoutMs);
			function finish(r) {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				img.onload = img.onerror = null;
				resolve(r);
			}
			img.onload = function () {
				finish({ state: "ok" });
			};
			img.onerror = function () {
				finish(FAIL_BLOCKED);
			};
			img.referrerPolicy = "no-referrer";
			img.src =
				t.url +
				(t.url.indexOf("?") > -1 ? "&" : "?") +
				"_pfcc=" +
				Date.now();
		});
	}

	function probeFetch(t, timeoutMs) {
		var ctrl = global.AbortController ? new AbortController() : null;
		var timedOut = false;
		var timer = setTimeout(function () {
			timedOut = true;
			if (ctrl) ctrl.abort();
		}, timeoutMs);
		var base = {
			cache: "no-store",
			credentials: "omit",
			redirect: "follow",
			signal: ctrl ? ctrl.signal : undefined,
		};

		function opaque() {
			// no-cors resolves on ANY HTTP response and rejects only on network failure,
			// so it separates "host unreachable" from "reachable but CORS-restricted".
			return fetch(t.url, assign({ mode: "no-cors" }, base)).then(
				function () {
					return t.method === "opaque"
						? { state: "ok" }
						: {
								state: "ok",
								note: "Host reachable; content could not be verified from this origin",
							};
				},
				function () {
					return timedOut ? failTimeout(timeoutMs) : FAIL_BLOCKED;
				},
			);
		}

		var p =
			t.method === "opaque"
				? opaque()
				: fetch(t.url, assign({ mode: "cors" }, base)).then(
						function (res) {
							if (!res.ok)
								return {
									state: "fail",
									reason: "http",
									detail:
										"Server answered HTTP " + res.status,
								};
							var v = VALIDATORS[t.expect];
							if (!v) {
								try {
									res.body && res.body.cancel();
								} catch (e) {}
								return { state: "ok" };
							}
							return readHead(res, 600).then(function (head) {
								var m = v(head);
								return m === true
									? { state: "ok" }
									: {
											state: "fail",
											reason: "intercepted",
											detail: m,
										};
							});
						},
						function () {
							return timedOut ? failTimeout(timeoutMs) : opaque();
						},
					);

		return p
			.catch(function () {
				return timedOut ? failTimeout(timeoutMs) : FAIL_BLOCKED;
			})
			.then(function (r) {
				clearTimeout(timer);
				return r;
			});
	}

	function probe(t, timeoutMs) {
		var t0 = now();
		if (!global.fetch && t.method !== "image")
			return Promise.resolve(
				assign({}, t, {
					state: "skipped",
					detail: "Browser too old to test",
					ms: 0,
				}),
			);
		var p =
			t.method === "image"
				? probeImage(t, timeoutMs)
				: probeFetch(t, timeoutMs);
		return p.then(function (r) {
			return assign({}, t, r, {
				host: hostOf(t),
				ms: Math.round(now() - t0),
			});
		});
	}

	/* ------------------------------------------------------------------ */
	/* UI                                                                   */
	/* ------------------------------------------------------------------ */
	var CSS = [
		'.pfcc-bar,.pfcc-panel,.pfcc-toast{font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1f2933;box-sizing:border-box}',
		".pfcc-bar *,.pfcc-panel *,.pfcc-toast *{box-sizing:border-box}",
		".pfcc-toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#1f2933;color:#fff;padding:8px 16px;border-radius:20px;z-index:2147483646;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.25)}",
		'.pfcc-toast:before{content:"";display:inline-block;width:10px;height:10px;margin-right:8px;border:2px solid #fff;border-right-color:transparent;border-radius:50%;animation:pfcc-spin .8s linear infinite;vertical-align:-1px}',
		"@keyframes pfcc-spin{to{transform:rotate(360deg)}}",
		".pfcc-bar{position:fixed;top:0;left:0;right:0;z-index:2147483645;background:#fff4d6;border-bottom:2px solid #e8a317;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}",
		".pfcc-bar.pfcc-critical{background:#fde8e8;border-color:#c62828}",
		".pfcc-bar .pfcc-msg{flex:1 1 280px}",
		".pfcc-btn{font:inherit;font-size:13px;border:1px solid #1f2933;background:#fff;color:#1f2933;border-radius:4px;padding:5px 12px;cursor:pointer}",
		".pfcc-btn.pfcc-primary{background:#009edb;border-color:#009edb;color:#fff}",
		".pfcc-btn:focus-visible{outline:3px solid #009edb;outline-offset:2px}",
		".pfcc-x{background:none;border:0;font-size:20px;line-height:1;cursor:pointer;color:inherit;padding:0 4px}",
		".pfcc-backdrop{position:fixed;inset:0;background:rgba(15,23,32,.55);z-index:2147483646;display:flex;align-items:flex-start;justify-content:center;padding:6vh 16px;overflow:auto}",
		".pfcc-panel{background:#fff;max-width:680px;width:100%;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.3);border-top:6px solid #c62828}",
		".pfcc-panel.pfcc-degraded{border-top-color:#e8a317}",
		".pfcc-panel header{padding:20px 24px 8px}",
		".pfcc-panel h2{margin:0 0 6px;font-size:19px;line-height:1.3}",
		".pfcc-panel p{margin:0 0 10px}",
		".pfcc-body{padding:0 24px 8px}",
		".pfcc-table{width:100%;border-collapse:collapse;margin:8px 0 14px;font-size:13px}",
		".pfcc-table th,.pfcc-table td{text-align:left;padding:7px 8px;border-bottom:1px solid #e4e7eb;vertical-align:top}",
		".pfcc-table th{font-size:12px;text-transform:uppercase;letter-spacing:.03em;color:#52606d}",
		".pfcc-host{font-family:ui-monospace,Consolas,monospace;font-size:12px;word-break:break-all}",
		".pfcc-tag{display:inline-block;font-size:11px;font-weight:600;padding:1px 7px;border-radius:10px;white-space:nowrap}",
		".pfcc-ok{background:#e3f6ea;color:#1b6b3a}.pfcc-fail{background:#fde8e8;color:#a61b1b}.pfcc-warn{background:#fff4d6;color:#8a5a00}.pfcc-muted{background:#eef1f4;color:#52606d}",
		".pfcc-allow{background:#f5f7fa;border:1px solid #e4e7eb;border-radius:6px;padding:10px 12px;margin:0 0 12px}",
		".pfcc-allow code{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;display:block}",
		".pfcc-panel details{margin:0 0 12px;font-size:13px}",
		".pfcc-panel summary{cursor:pointer;color:#0074a8}",
		".pfcc-panel footer{padding:12px 24px 20px;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;border-top:1px solid #e4e7eb}",
		".pfcc-small{font-size:12px;color:#52606d}",
		"@media (max-width:560px){.pfcc-table .pfcc-col-impact{display:none}.pfcc-panel header,.pfcc-body,.pfcc-panel footer{padding-left:16px;padding-right:16px}}",
	].join("\n");

	function el(html) {
		var d = document.createElement("div");
		d.innerHTML = html.trim();
		return d.firstChild;
	}
	function onBody(fn) {
		if (document.body) fn();
		else document.addEventListener("DOMContentLoaded", fn);
	}
	function injectCss() {
		if (document.getElementById("pfcc-style")) return;
		var s = document.createElement("style");
		s.id = "pfcc-style";
		s.textContent = CSS;
		(document.head || document.documentElement).appendChild(s);
	}
	function clearUi() {
		["pfcc-toast", "pfcc-bar", "pfcc-backdrop"].forEach(function (id) {
			var n = document.getElementById(id);
			if (n) n.parentNode.removeChild(n);
		});
	}

	function statusTag(r) {
		if (r.state === "ok")
			return r.note
				? '<span class="pfcc-tag pfcc-ok" title="' +
						esc(r.note) +
						'">Reachable</span>'
				: '<span class="pfcc-tag pfcc-ok">OK</span>';
		if (r.state === "skipped")
			return '<span class="pfcc-tag pfcc-muted">Not tested</span>';
		var label =
			{
				blocked: "Blocked",
				timeout: "Timed out",
				intercepted: "Intercepted",
				http: "Error",
			}[r.reason] || "Failed";
		return (
			'<span class="pfcc-tag ' +
			(r.level === "critical"
				? "pfcc-fail"
				: r.level === "degraded"
					? "pfcc-warn"
					: "pfcc-muted") +
			'">' +
			label +
			"</span>"
		);
	}

	function buildReport(result) {
		var lines = [
			"Connectivity report – " +
				new Date(result.finishedAt).toISOString(),
			"Page: " + location.origin + location.pathname,
			"Browser: " + navigator.userAgent,
			"Overall: " + result.status.toUpperCase(),
			"",
		];
		result.results.forEach(function (r) {
			lines.push(
				"[" +
					(r.state === "ok"
						? "OK  "
						: r.state === "skipped"
							? "SKIP"
							: "FAIL") +
					"] " +
					r.host +
					"  (" +
					r.label +
					", " +
					r.level +
					", " +
					r.ms +
					" ms)" +
					(r.detail ? " – " + r.detail : "") +
					(r.note ? " – " + r.note : ""),
			);
		});
		lines.push("", "Hosts this page needs (HTTPS, port 443):");
		uniqueHosts(
			result.results.filter(function (r) {
				return r.level !== "info";
			}),
		).forEach(function (h) {
			lines.push("  " + h);
		});
		return lines.join("\n");
	}

	function uniqueHosts(list) {
		var seen = {},
			out = [];
		list.forEach(function (r) {
			if (!seen[r.host]) {
				seen[r.host] = 1;
				out.push(r.host);
			}
		});
		return out;
	}

	function copy(text, btn) {
		function done(ok) {
			var o = btn.textContent;
			btn.textContent = ok ? "Copied ✓" : "Copy failed";
			setTimeout(function () {
				btn.textContent = o;
			}, 1800);
		}
		if (navigator.clipboard && global.isSecureContext) {
			navigator.clipboard.writeText(text).then(function () {
				done(true);
			}, fallback);
		} else fallback();
		function fallback() {
			var ta = document.createElement("textarea");
			ta.value = text;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			var ok = false;
			try {
				ok = document.execCommand("copy");
			} catch (e) {}
			document.body.removeChild(ta);
			done(ok);
		}
	}

	function showPanel(result, api) {
		clearUi();
		var failed = result.results.filter(function (r) {
			return r.state === "fail" && r.level !== "info";
		});
		var critical = result.status === "critical";
		// HTTP errors mean the host answered: a service outage, not a network block.
		var outageOnly =
			failed.length > 0 &&
			failed.every(function (r) {
				return r.reason === "http";
			});
		var blockedHosts = uniqueHosts(
			failed.filter(function (r) {
				return r.reason !== "http";
			}),
		);
		var rank = function (r) {
			return r.state !== "fail"
				? 9
				: { critical: 0, degraded: 1, info: 2 }[r.level];
		};
		var rows = result.results
			.slice()
			.sort(function (a, b) {
				return rank(a) - rank(b);
			})
			.map(function (r) {
				return (
					"<tr><td>" +
					esc(r.label) +
					'<div class="pfcc-host">' +
					esc(r.host) +
					"</div></td>" +
					"<td>" +
					statusTag(r) +
					(r.detail && r.state === "fail"
						? '<div class="pfcc-small">' + esc(r.detail) + "</div>"
						: "") +
					"</td>" +
					'<td class="pfcc-col-impact">' +
					(r.state === "fail"
						? esc(r.impact)
						: '<span class="pfcc-small">–</span>') +
					"</td></tr>"
				);
			})
			.join("");

		var node = el(
			'<div class="pfcc-backdrop" id="pfcc-backdrop">' +
				'<section class="pfcc-panel' +
				(critical ? "" : " pfcc-degraded") +
				'" role="alertdialog" aria-modal="true" aria-labelledby="pfcc-title" aria-describedby="pfcc-desc">' +
				'<header><h2 id="pfcc-title">' +
				(outageOnly
					? "A data service is temporarily unavailable"
					: critical
						? "Your network is blocking data this page needs"
						: "Parts of this page may not display correctly") +
				"</h2>" +
				'<p id="pfcc-desc">' +
				(outageOnly
					? "Your connection is fine, but a service this dashboard relies on returned an error. Figures may be missing; please try again later."
					: critical
						? "This dashboard loads its data from external services that your network (firewall, VPN or proxy) is not allowing. The page will open, but charts and figures will be empty or incomplete."
						: "Some supporting services are blocked on your network. The data is fine, but icons, flags or styling may be missing.") +
				"</p></header>" +
				'<div class="pfcc-body">' +
				'<table class="pfcc-table"><thead><tr><th>Service</th><th>Status</th><th class="pfcc-col-impact">Effect</th></tr></thead><tbody>' +
				rows +
				"</tbody></table>" +
				(blockedHosts.length
					? '<div class="pfcc-allow"><strong>What you can do</strong><p style="margin:6px 0">Try disconnecting from the VPN or switching network, then press <em>Check again</em>. To fix it permanently, ask your IT team to allow HTTPS access to:</p>' +
						blockedHosts
							.map(function (h) {
								return "<code>" + esc(h) + "</code>";
							})
							.join("") +
						"</div>"
					: "") +
				'<p class="pfcc-small">' +
				esc(api.cfg.contactText) +
				"</p>" +
				'<details><summary>Technical details</summary><pre class="pfcc-host" style="white-space:pre-wrap;margin:8px 0 0">' +
				esc(buildReport(result)) +
				"</pre></details>" +
				"</div><footer>" +
				'<button type="button" class="pfcc-btn" data-act="copy">Copy report for IT</button>' +
				'<button type="button" class="pfcc-btn" data-act="retry">Check again</button>' +
				'<button type="button" class="pfcc-btn pfcc-primary" data-act="close">Continue to page</button>' +
				"</footer></section></div>",
		);
		node.addEventListener("click", function (e) {
			var act =
				e.target.getAttribute && e.target.getAttribute("data-act");
			if (e.target === node) act = "close";
			if (act === "copy") copy(buildReport(result), e.target);
			if (act === "retry") {
				clearUi();
				api.run(api.cfg, { force: true });
			}
			if (act === "close") showBar(result, api);
		});
		node.addEventListener("keydown", function (e) {
			if (e.key === "Escape") showBar(result, api);
		});
		document.body.appendChild(node);
		var primary = node.querySelector('[data-act="close"]');
		if (primary) {
			try {
				primary.focus({ preventScroll: true });
			} catch (e) {
				primary.focus();
			}
		}
	}

	function showBar(result, api) {
		clearUi();
		var critical = result.status === "critical";
		var n = result.results.filter(function (r) {
			return r.state === "fail" && r.level !== "info";
		}).length;
		var bar = el(
			'<div class="pfcc-bar' +
				(critical ? " pfcc-critical" : "") +
				'" id="pfcc-bar" role="status">' +
				'<span class="pfcc-msg"><strong>' +
				(critical
					? "Data blocked on your network."
					: "Limited connectivity.") +
				"</strong> " +
				n +
				" service" +
				(n === 1 ? " is" : "s are") +
				" not reachable" +
				(critical
					? " – figures may be missing."
					: " – some visuals may be missing.") +
				"</span>" +
				'<button type="button" class="pfcc-btn" data-act="details">Details</button>' +
				'<button type="button" class="pfcc-btn" data-act="retry">Check again</button>' +
				'<button type="button" class="pfcc-x" data-act="dismiss" aria-label="Dismiss">×</button></div>',
		);
		bar.addEventListener("click", function (e) {
			var act = e.target.getAttribute("data-act");
			if (act === "details") showPanel(result, api);
			if (act === "retry") {
				clearUi();
				api.run(api.cfg, { force: true });
			}
			if (act === "dismiss") clearUi();
		});
		document.body.appendChild(bar);
	}

	/* ------------------------------------------------------------------ */
	/* Runner                                                               */
	/* ------------------------------------------------------------------ */
	var resolveReady;
	var api = {
		version: "0.1.0",
		presets: presets,
		validators: VALIDATORS,
		cfg: null,
		last: null,
		ready: new Promise(function (r) {
			resolveReady = r;
		}),

		run: function (config, opts) {
			opts = opts || {};
			var cfg = (api.cfg = assign({}, DEFAULTS, config || {}));
			var targets = cfg.targets || [];
			var cached = !opts.force && store("get", cfg.cacheKey);
			if (
				cached &&
				cached.status === "ok" &&
				Date.now() - cached.finishedAt < cfg.cacheTtlMs
			) {
				return finish(assign(cached, { fromCache: true }), true);
			}

			injectCss();
			var startedAt = Date.now(),
				toastTimer = setTimeout(function () {
					onBody(function () {
						if (document.getElementById("pfcc-toast")) return;
						var t = el(
							'<div class="pfcc-toast" id="pfcc-toast" role="status">Checking access to data sources…</div>',
						);
						document.body.appendChild(t);
					});
				}, cfg.progressDelayMs);

			return Promise.all(
				targets.map(function (t) {
					return probe(t, cfg.timeoutMs);
				}),
			).then(function (results) {
				clearTimeout(toastTimer);
				var status = "ok";
				results.forEach(function (r) {
					if (r.state !== "fail") return;
					if (r.level === "critical") status = "critical";
					else if (r.level === "degraded" && status === "ok")
						status = "degraded";
				});
				var result = {
					status: status,
					startedAt: startedAt,
					finishedAt: Date.now(),
					results: results,
				};
				if (status === "ok") store("set", cfg.cacheKey, result);
				else store("del", cfg.cacheKey);
				return finish(result, false);
			});

			function finish(result, quiet) {
				api.last = result;
				result.report = function () {
					return buildReport(result);
				};
				if (!quiet)
					onBody(function () {
						var t = document.getElementById("pfcc-toast");
						if (t) t.parentNode.removeChild(t);
						if (result.status === "critical")
							showPanel(result, api);
						else if (result.status === "degraded")
							showBar(result, api);
					});
				try {
					global.dispatchEvent(
						new CustomEvent("pf:connectivity", { detail: result }),
					);
				} catch (e) {}
				if (typeof cfg.onComplete === "function") {
					try {
						cfg.onComplete(result);
					} catch (e) {}
				}
				resolveReady(result);
				return result;
			}
		},

		showDetails: function () {
			if (api.last)
				onBody(function () {
					injectCss();
					showPanel(api.last, api);
				});
		},
	};

	global.PFConnectivityCheck = api;
})(window);

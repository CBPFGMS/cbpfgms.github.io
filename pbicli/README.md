# GMS BI: CBPF Contributions, line graph

Data visualisation for the Country-based Pooled Funds (CBPF) contributions in the Business Inteligence Portal at [gms.unocha.org](https://gms.unocha.org/content/cbpf-contributions) . The datavis contains several elements:

- Two sets of buttons at the top, allowing the user to hover and click the donor/CBPF (hover highlights, click keeps the highlighted selection) ;
- Two line graphs, one for the donors and one for the CBPFs;
- Two control buttons at the bottom, allowing the visualisation of future donations (pledge values) and downloading the corresponding CSV;

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbicli.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbicli" data-localcurrency="false" data-showfuture="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbicli/src/d3chartpbicli.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5 and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

*Important*: The code uses `window.innerHeight`  and `element.offsetTop` to start the animation. Do not copy the snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`  and `element.offsetTop`.

## Parameters

There are four parameters:

**`data-localcurrency`**: defines if the values in the tooltips and in the axes are shown in the local currency or in USD. The value has to be a string. Accepted values:

- `"true"`: values in the local currency.
- `"false"`: values in USD.

If the value is not an accepted value, it defaults to `"false"`.

**`data-showfuture`**: defines if the contributions for future years are showed when the page loads. The value has to be a string. Accepted values:

- `"true"`: shows contributions (pledge values) for years after the current year.
- `"false"`: shows only contributions until the current year.

If the value is not an accepted value, it defaults to `"false"`.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 1130px width and 486px height.

Note: On Internet Explorer this parameter will default to `"false"`, meaning that the SVG will not be responsive.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

*Recommended size*: 1130px width, 486px height.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbicli.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbicli.css).

---
Chart code: `pbicli`

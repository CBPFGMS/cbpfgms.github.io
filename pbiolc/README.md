# GMS BI: CBPF Overview, lollipop chart

Data visualisation for the Country-based Pooled Funds (CBPF) overview in the Business Inteligence Portal at [gms.unocha.org](https://gms.unocha.org/content/cbpf-overview) . The datavis contains several elements:

- A set of control buttons allowing the selection of the year, modality (total, standard or reserve) and beneficiary type (targeted or actual), as well as downloading the corresponding CSV;
- Two lollipop charts, one depicting the allocations by cluster and another one depicting beneficiaries by cluster, (according to the selected year, modality and beneficiary).

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiolc.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbiolc" data-year="2018" data-modality="total" data-beneficiaries="targeted" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbiolc/src/d3chartpbiolc.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5 and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

*Important*: The code uses `window.innerHeight`  and `element.offsetTop` to start the animation. Do not copy the snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`  and `element.offsetTop`.

## Parameters

There are five parameters:

**`data-year`**: defines the year depicted by the data visualisation when the page loads. The value has to be a string containing the year with century as a decimal number, such as:

 `"2018"`

If the provided value is not a valid number the datavis will default to the current year.

For the accepted values for the years/periods please refer to the data API.

This value defines the selected year only when the page loads: the user can easily change the selected year by clicking the corresponding buttons.

**`data-modality`**: defines the modality type of the allocations depicted by the data visualisation when the page loads. The value has to be a string. Accepted values:

- `"total"`: shows total allocations (standard + reserve).
- `"standard"`: shows only standard allocations.
- `"reserve"`: shows only reserve allocations.

**`data-beneficiaries`**: defines the type of beneficiaries depicted by the data visualisation when the page loads. The value has to be a string. Accepted values:

- `"targeted"`: shows targeted beneficiaries.
- `"actual"`: shows actual beneficiaries.

If the value is not an accepted value, it defaults to `"targeted"`.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 1130px width (the height of the SVG varies according to the number of donors/CBPFs in the selected year).

Note: On Internet Explorer this parameter will default to `"false"`, meaning that the SVG will not be responsive.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

*Recommended size*: 1130px width x 424px height.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbiolc.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbiolc.css).

---
Chart code: `pbiolc`

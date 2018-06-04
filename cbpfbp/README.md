# CBPF Unocha Page

Data visualisation for the Country-based Pooled Funds (CBPF) page at unocha.org . The datavis contains several elements:

- A top banner showing the total contributions and allocations;
- A bar chart showing the top 10 contributions and the top 10 allocations, plus other contributions and allocations;
- A beeswarm chart showing all contributions and allocations;
- A stacked bar showing allocations by partners; 

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/cbpfbp.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainercbpfbp" data-year="2017" data-responsive="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/cbpfbp/src/d3chartcbpfbp.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5 and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

*Important*: The code uses `window.innerHeight`  and `element.offsetTop` to start the animation. Do not copy the snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`  and `element.offsetTop`.

## Parameters

There are two parameters:

**`data-yearStart`**: defines the year depicted by the data visualisation. The value has to be the year with century as a decimal number, such as:

 `"2017"`

For the accepted values please refer to the data API.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 1160px width and 750px height.

*Recommended size*: 1160px x 750px.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles are listed under `cbpfbp` section.

---
Chart code: `cbpfbp`

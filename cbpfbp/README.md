# CBPF Unocha Page

Data visualisation for the Country-based Pooled Funds (CBPF) page at [unocha.org](http://www.unocha.org/our-work/humanitarian-financing/country-based-pooled-funds-cbpfs) . The datavis contains several elements:

- A top banner showing the total contributions for the selected year or period;
- A bar chart showing the top 10 donors and the top 10 CBPFs, plus other donors and CBPFs for the selected year or period, and the relationship between donors and CBPFs;
- A beeswarm chart showing all donors and CBPFs for the selected year or period;

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/cbpfbp.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainercbpfbp" data-year="2018" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/cbpfbp/src/d3chartcbpfbp.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5 and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

*Important*: The code uses `window.innerHeight`  and `element.offsetTop` to start the animation. Do not copy the snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`  and `element.offsetTop`.

## Parameters

There are three parameters:

**`data-year`**: defines the year depicted by the data visualisation. The value has to be the year with century as a decimal number, such as:

 `"2018"`

Alternatively, for defining a period, provide two years (with century) separated by comma. For instance:

`"2016, 2018"`

Will create a chart showing all donations from 2016 to 2018 (both start and end values included). If the years are not in the correct sequence the datavis will take the smallest value as the start year and the biggest value as the end year.

If the provided value is not a valid number or if the provided period is not separated by a comma, the datavis will default to the current year.

For the accepted values for the years/periods please refer to the data API.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 743px width and 600px height.

Note: On Internet Explorer this parameter will default to `"false"`, meaning that the SVG will not be responsive.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` or `"false"`, it defaults to `"false" `.

*Recommended size*: 743px x 600px.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles are listed under `cbpfbp` section.

---
Chart code: `cbpfbp`

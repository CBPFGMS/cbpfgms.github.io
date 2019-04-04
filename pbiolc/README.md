# GMS BI: Cluster Overview, lollipop chart

Data visualisation for the Country-based Pooled Funds (CBPF) overview in the Business Inteligence Portal at [gms.unocha.org](https://gms.unocha.org/content/cbpf-overview) . The datavis contains several elements:

- A set of checkboxes for the selection of CBPFs.
- A set of control buttons allowing the selection of the year, Modality type (total, standard or reserve) and Affected Person type (targeted or actual).
- Two lollipop charts, one depicting the allocations by cluster and another one depicting affected persons by cluster, (according to the selected year, modality and beneficiary).
- Two buttons at the top right hand side, for downloading the CSV file (according to the selected options) and for displaying a description of the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiolc.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbiolc" data-title="Cluster Overview" data-showhelp="true" data-cbpf="all" data-year="2018" data-modality="total" data-beneficiaries="targeted" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbiolc/src/d3chartpbiolc.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbiolc.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight`  and to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are eight parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *Cluster Overview*.

**`data-showhelp`**: shows the annotations explaining how to use the data visualisation. Accepted values:

- `"true"`: annotations shown when the page loads.
- `"false"`: annotations not shown when the page loads. The user can easily show the annotations by clicking the "help" button.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-year`**: defines the year depicted by the data visualisation when the page loads. The value has to be a string containing the year with century as a decimal number, such as:

 `"2019"`

If the provided value is not a valid number the datavis will default to the current year.

For the accepted values for the years please refer to the data API.

**`data-cbpf`**: defines the selected CBPFs when the page loads. For showing all CBPFs, set the value to `"all"`. For individual CBPFs set the value accordingly, such as:

`"Yemen"`.

For more than one CBPF separate the values with commas, such as:

`"Yemen, Sudan, Iraq"`.

For the accepted values, please refer to the data API.

If the value is not a valid one it defaults to `"all"`.

**`data-modality`**: defines the modality type of the allocations depicted by the data visualisation when the page loads. The value has to be a string. Accepted values:

- `"total"`: shows total allocations (standard + reserve).
- `"standard"`: shows only standard allocations.
- `"reserve"`: shows only reserve allocations.

If the value is not an accepted value, it defaults to `"total"`.

**`data-beneficiaries`**: defines the type of affected persons depicted by the data visualisation when the page loads. The value has to be a string. Accepted values:

- `"targeted"`: shows targeted affected persons.
- `"actual"`: shows actual affected persons.

If the value is not an accepted value, it defaults to `"targeted"`.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 900px wide (the height of the SVG varies according to the number of donors/CBPFs in the selected year).

Note: On Internet Explorer this parameter will default to `"false"`, meaning that the SVG will not be responsive.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

*Recommended size*: 900px width.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbiolc.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbiolc.css).

---
Chart code: `pbiolc`

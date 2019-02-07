# GMS BI: Allocations by Organization Type, lollipop and parallel coordinates chart

Data visualisation for the Country-based Pooled Funds (CBPF) allocations in the Business Inteligence Portal at [gms.unocha.org](https://gms.unocha.org/content/cbpf-allocations) . The datavis contains several elements:

- A top banner showing the value allocated, the value under approval and the number of CBPFs both for the selected partner and the selected year;
- A control banner allowing the selection of the year and the partner type (International NGO, National NGO, Red Cross/Crescent Movement, UN Agency or All Partners);
- A lollipop chart for the CBPF allocations, according to the selected year and contribution type.
- A parallel coordinates chart showing the percentage of allocations by partner type for all CBPFs.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbialp.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbialp" data-title="Allocations by Organization Type" data-year="2018" data-partner="total" data-showaverage="true" data-responsive="true" data-lazyload="true" data-showhelp="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbialp/src/d3chartpbialp.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbialp.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight`  and to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are seven parameters:

**`data-title`**: sets the title of the chart. If left empty the chart title defaults to *Allocations by Organization Type*.

**`data-showhelp`**: shows the annotations explaining how to use the data visualisation. Accepted values:

- `"true"`: annotations shown when the page loads.
- `"false"`: annotations no shown. The user can easily show the annotations by clicking the "help" button.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-year`**: defines the year depicted by the data visualisation when the page loads. The value has to be a string containing the year with century as a decimal number, such as:

 `"2018"`

If the provided value is not a valid number the datavis will default to the current year.

For the accepted values for the years/periods please refer to the data API.

This value defines only the selected year when the page loads: the user can easily change the selected year by clicking the corresponding buttons.

**`data-partner`**: defines the partner type depicted by the data visualisation when the page loads. The value has to be a string. Accepted values:

- `"total"`: shows all partners.
- `"International NGO"`: shows only the allocations for International NGOs.
- `"National NGO"`: shows only the allocations for National NGOs.
- `"Red Cross/Crescent Movement"`: shows only the allocations for Red Cross/Crescent Movement.
- `"UN Agency"`: shows only the allocations for UN Agencies.

If the value is not an accepted value, it defaults to `"total"`.

This value defines only the selected partner when the page loads: the user can easily change the selected partner by clicking the corresponding buttons.

**`data-showaverage`**: defines if the average line is shown in the parallel coordinates chart. Accepted values:

- `"true"`: the average line is shown.
- `"false"`: the average line is not shown.  

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 1130px width (the height of the SVG varies according to the number of CBPFs in the selected year).

Note: On Internet Explorer this parameter will default to `"false"`, meaning that the SVG will not be responsive.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

*Recommended size*: 900px width.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbialp.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbialp.css).

---
Chart code: `pbialp`

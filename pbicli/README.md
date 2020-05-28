# PFBI: CBPF Contribution Trends, line graph

Data visualisation for the Country-based Pooled Funds (CBPF) contributions in the Business Inteligence Portal at [pfbi.unocha.org](https://pfbi.unocha.org). The datavis contains several elements:

- A set of dropdown menus to select the donor or the CBPF. If a donor is selected, the donors line chart shows the amount donated by that donor, while the CBPF line chart shows all the CBPFs that received from that donor. If a CBPF is selected, the CBPF line chart shows the amount received by that CBPF, while the donor line chart shows all donors that donated to that CBPF. Multiple selection is allowed. The “Currency” dropdown allows selecting donors by currency;
- A set of radio buttons for choosing USD or local currency;
- A set of checkboxes for showing future donations and the donation trend (if “future donations” is selected);
- Depending on the current selection (donor or CBPF), a set of buttons to deselect a country and a set of checkboxes to show/hide a country;
- Two line graphs, one for the donors and one for the CBPFs;

Also, at the top right corner, there is a set of buttons:

- **Share**: copies a link with all the current selections to the clipboard. Use that link to go to the Bookmark page;
- **Image**: downloads a snapshot of the chart, as a .png file or as a .pdf file. You can also right-click anywhere in the chart to download a snapshot containing the tooltip;
- **Csv**: downloads the data as a .csv file;
- **Help**: shows an annotated layer with tips about how to use and how to understand the chart.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbicli.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbicli" data-title="Contribution Trends" data-showfuture="false" data-selectedcountry="none" data-showhelp="false" data-showlink="true" data-responsive="true" data-lazyload="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbicli/src/d3chartpbicli.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet. For better results, the snippet should be inside a container 900px wide.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5, the [specific CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstylespbicli.css) file and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/d3chartstyles.css) file.

***Important***: The code uses `window.innerHeight` to start the animation when `"data-lazyload"` is set to `true`. If you copy this snippet inside an iframe or any other element that avoids the correct calculation of `window.innerHeight`, set `"data-lazyload"` to `false`.

## Parameters

There are six parameters:

**`data-title`**: sets the title of the chart. If left empty ("") the chart title defaults to *Contribution Trends*.

**`data-showfuture`**: defines if the contributions for future years are showed when the page loads. The value has to be a string. Accepted values:

- `"true"`: shows contributions (pledge values) for years after the current year.
- `"false"`: shows only contributions until the current year.

If the value is not an accepted value, it defaults to `"false"`.

**`data-selectedcountry`**: defines the selected country (donor or CBPF) when the page loads, and sets the view for those selected countries (e. g., if the selected country is a CBPF the donor line chart shows all donors that donated to those selected CBPF, and vice versa). For not selecting any country set the value to `"none"`, or just leave it empty:

`""`

For individual countries set the value accordingly, such as:

`"Yemen"`.

For more than one country separate the values with commas, such as:

`"Yemen, Sudan, Iraq"`.

In such cases, the list must contain only donors or only CBPFs.

If the selected country is both a donor and a CBPF, define which one will be selected by using `"@"` followed by `"donor"` or `"fund"`. For instance, `"Ukraine@donor"` will select Ukraine as a donor, while `"Ukraine@fund"` will select Ukraine as a fund. If the selected country is both a donor and a CBPF but there is no indication regarding which one should be selected (`"@fund"` or `"@donor"`), the value will default to `"none"`.

For the accepted values, please refer to the data API. If the value is not a valid one it defaults to `"none"`. This value defines only the selected country when the page loads: the CBPFs (and donors) can be easily selected by using the corresponding dropdown menu.

**`data-showhelp`**: shows the annotations explaining how to use the data visualisation. Accepted values:

- `"true"`: annotations shown when the page loads.
- `"false"`: annotations not shown when the page loads. The user can easily show the annotations by clicking the "help" button.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-showlink`**: shows the *"for more information"* link in the footer. Accepted values:

- `"true"`: shows the link.
- `"false"`: doesn't show the link.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 900px width.

**`data-lazyload`**: defines if the animation starts when the SVG is visible. Accepted values:

- `"true"`: the animation starts only when the SVG is visible in the browser window.
- `"false"`: the animation starts when the page is loaded, regardless if the SVG is visible.

If the value is neither `"true" ` nor `"false"`, it defaults to `"false" `.

*Recommended size*: 900px (width).


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbiclc.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbicli.css).

---
Chart code: `pbicli`
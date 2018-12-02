# GMS BI: CBPF Allocations, line graph

Data visualisation for the Country-based Pooled Funds (CBPF) allocations in the Business Inteligence Portal at [gms.unocha.org](https://gms.unocha.org/content/cbpf-allocations) . The datavis contains several elements:

- A main area for the multi-line graph showing the allocations over the years ;
- A set of small multiples of multi-line graphs that work as buttons, allowing the user to select one or more CBPFs;
- Two control buttons at the bottom for sorting the small multiples and a button for downloading a CSV with the data;

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiali.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainerpbiali" data-sortbuttons="total" data-responsive="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/pbiali/src/d3chartpbiali.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5 and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

## Parameters

There are two parameters:

**`data-sortbuttons`**: defines the criterion for ordering the small multiples. Accepted values:

- `"total"`: sorts the buttons according to the total allocated for the respective CBPF.
- `"alphabetically"`: sorts the buttons alphabetically.

If the value is not an accepted value, it defaults to `"total"`.

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 1130px width (the height of the SVG varies according to the number of CBPFs).

Note: On Internet Explorer this parameter will default to `"false"`, meaning that the SVG will not be responsive.

*Recommended size*: 1130px width (height varies).


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles can be found in [d3chartstylespbiali.css](https://github.com/CBPFGMS/cbpfgms.github.io/blob/master/css/d3chartstylespbiali.css).

---
Chart code: `pbiali`

# GMS Landing Page

Data visualisation for the Grant Management System landing page. The datavis contains two grouped bar charts (contributions & allocations, projects & partners) for the selected year, and two line charts (contributions & allocations, projects & partners) for showing the data for all the years.

<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/gmslpg.png" width="450">

## Getting started

Copy this snippet to the HTML:

```<div id="d3chartcontainergmslpg" data-yearStart="2014" data-yearEnd="2018" data-yearSelected="2018" data-sorting="contributions" data-responsive="true"></div><script type="text/javascript" src="https://cbpfgms.github.io/gmslpg/src/d3chartgmslpg.js"></script>```

The script will create an SVG inside the `<div>` specified in the snippet.

The JavaScript code will also reference [D3.js](https://d3js.org) version 5 and the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

## Parameters

There are four parameters:

**`data-yearStart`**: defines the starting year for the radio buttons. The value has to be the year with century as a decimal number, such as:

 `"2014"`

For the accepted values please refer to the data API.

**`data-yearEnd`**: defines the ending year for the radio buttons. The value has to be the year with century as a decimal number, such as:

 `"2018"`

For the accepted values please refer to the data API.

**`data-yearSelected`**: defines the selected year when the chart loads. The value has to be the year with century as a decimal number, such as:

 `"2018"`

If the value is not between `data-yearStart`  and `data-yearEnd` it defaults to `data-yearEnd`.

**`data-sorting`**: defines the initial sorting criterion when the chart loads. Accepted values:

- `"contributions"`: sorts the countries by contributions
- `"allocations"`: sorts the countries by allocations
- `"projects"`: sorts the countries by number of projects
- `"partners"`: sorts the countries by number of partners
- `"pooledFundName"` : sorts the countries alphabetically

**`data-responsive`**: defines if the SVG stretches to the width of the containing element. Accepted values:

- `"true"`: the SVG will stretch to the width of the element containing the code snippet.
- `"false"`: the SVG will be created with a fixed size, which is 900px width and 350px height.

Note: On Internet Explorer this parameter will default to `"false"`, meaning that the SVG will not be responsive.

*Recommended size*: 900px x 350px.


## CSS

This chart uses the [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) for all OCHA charts. The specific styles are listed under `gmslpg` section.

---
Chart code: `gmslpg`

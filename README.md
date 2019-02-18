  
# OCHA Charts

This is the repository for the charts and data visualisations at the OCHA sites. 

All the charts and data visualisations in this repository are SVG elements created using [D3.js](https://d3js.org), a JavaScript library for manipulating documents based on data. 

Instructions for the use of the charts and data visualisations can be found in their specific links.


## CSS

All charts and data visualisations in this repository use a [common CSS](https://github.com/CBPFGMS/cbpfgms.github.io/raw/master/css/) file.

## List of charts

- **GMS Landing Page**

Chart for the Grant Management System landing page.

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/gmslpg.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/gmslpg)

This chart shows Contributions, Allocations, Partners and Projects for the selected years. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/gmslpg) for more information.

- **CBPF Blog Page**

Chart for the Country-based Pooled Funds (CBPF) Page at the OCHA blog (Humanitarian Financing).

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/cbpfbp.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/cbpfbp)

This charts shows the top 10 Donors and the top 10 CBPFs. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/cbpfbp) for more information.

- **GMS BI: CBPF Contributions, lollipop chart**

Chart for the Country-based Pooled Funds (CBPF) contributions in the Business Intelligence Portal at the OCHA GMS.

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiclc.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbiclc)

This charts shows the Donors and the CBPFs for selected years. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbiclc) for more information.

- **GMS BI: CBPF Contributions, line graph**

Chart for the Country-based Pooled Funds (CBPF) contributions in the Business Intelligence Portal at the OCHA GMS.

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbicli.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbicli)

This charts shows the changes for Donors and CBPFs over the years. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbicli) for more information.

- **GMS BI: Allocations by Organization Type, lollipop and parallel coordinates chart**

Chart for the Country-based Pooled Funds (CBPF) allocations in the Business Intelligence Portal at the OCHA GMS.

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbialp.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbialp)

This charts shows the CBPF allocations and partner types for selected years. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbialp) for more information.

- **GMS BI: Allocation Trends, line graph**

Chart for the Country-based Pooled Funds (CBPF) allocations in the Business Intelligence Portal at the OCHA GMS.

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiali.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbiali)

This charts shows the changes for allocations over the years. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbiali) for more information.

- **GMS BI: CBPF Contributions, force-directed graph**

Chart for the Country-based Pooled Funds (CBPF) contributions in the Business Intelligence Portal at the OCHA GMS.

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbifdc.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbifdc)

This charts shows a force-directed graph will all the Donors and the CBPFs for selected years. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbifdc) for more information.

- **GMS BI: CBPF Overview, beneficiaries bar and pictogram chart**

Chart for the Country-based Pooled Funds (CBPF) overview in the Business Intelligence Portal at the OCHA GMS.

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiobe.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbiobe)

This charts shows the percentage and proportions of targeted and actual beneficiaries, for the selected years. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbiobe) for more information.

- **GMS BI: CBPF Overview, lollipop chart**

Chart for the Country-based Pooled Funds (CBPF) overview in the Business Intelligence Portal at the OCHA GMS.

[<img alt="GMS Landing Page" src="https://cbpfgms.github.io/img/thumbnails/pbiolc.png" width="450">](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbiolc)

This charts shows allocations and beneficiaries by cluster, for the selected years. See the [chart's page](https://github.com/CBPFGMS/cbpfgms.github.io/tree/master/pbiolc) for more information.

## Chart codes

Each chart and data visualisation is identified by a unique six-letter code. 

This unique code is present in the JavaScript file name, in the `<div>` ID name, and in all CSS classes and IDs used by that respective script.

**List of chart codes**:

| Chart  | Code |
| ------------- | ------------- |
| GMS Landing Page chart  | `gmslpg`  |
| CBPF Blog Page chart  | `cbpfbp`  |
|GMS BI: CBPF Contributions, lollipop chart|`pbiclc`|
|GMS BI: CBPF Contributions, line graph|`pbicli`|
|GMS BI: CBPF Allocations, lollipop and parallel graph|`pbialp`|
|GMS BI: CBPF Allocations, line graph|`pbiali`|
|GMS BI: CBPF Contributions, force-directed graph|`pbifdc`|
|GMS BI: CBPF Overview, beneficiaries bar and pictogram chart|`pbiobe`|
|GMS BI: CBPF Overview, lollipop chart|`pbiolc`|

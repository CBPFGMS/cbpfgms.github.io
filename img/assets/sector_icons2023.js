/*Icons for the CBPF and CERF sectors
Size is 48px
PNG icons obtained from: https://brand.unocha.org/d/xEPytAUjC3sH/icons#/-/humanitarian-icons

Sectors as described in: https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json
- "id":1,"ClustNm":"Camp Coordination / Management","ClustCode":"CCM"
- "id":2,"ClustNm":"Early Recovery","ClustCode":"ER"
- "id":3,"ClustNm":"Education","ClustCode":"E"
- "id":4,"ClustNm":"Emergency Shelter and NFI","ClustCode":"NFI"
- "id":5,"ClustNm":"Emergency Telecommunications","ClustCode":"ET"
- "id":6,"ClustNm":"Food Security","ClustCode":"FS"
- "id":7,"ClustNm":"Health","ClustCode":"H"
- "id":8,"ClustNm":"Logistics","ClustCode":"L"
- "id":9,"ClustNm":"Nutrition","ClustCode":"N"
- "id":10,"ClustNm":"Protection","ClustCode":"P"
- "id":11,"ClustNm":"Water Sanitation Hygiene","ClustCode":"WASH"
- "id":12,"ClustNm":"Coordination and Support Services","ClustCode":"CSS"
- "id":13,"ClustNm":"Multi-Sector","ClustCode":"MS"
- "id":14,"ClustNm":"Multi-purpose cash (not sector-specific)","ClustCode":"MPC"
- "id":15,"ClustNm":"Mine Action","ClustCode":"MA"
- "id":16,"ClustNm":"COVID-19","ClustCode":"COVID"
- "id":14,"ClustNm":"Multi-purpose CASH","ClustCode":"MPC"
- "id":17,"ClustNm":"To be determined","ClustCode":"TBD"
*/

const sectorIcons = {
	1: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAhFBMVEUAAABBj95Bj94/j91Bj95Bj95Bj95Bj99Aj95Bj95Aj95Ajt5Aj95Aj95Ajt5Aj91Bj95Ajt5Aj95Aj95Aj95Ajt5Aj95Aj95Aj95Aj95Aj95Aj95Aj95Aj95Aj95Aj95Bj95Aj95Aj95Bj95Aj95Bj95Bj95Aj95Ajt5Bj95Bj95Bj97r4rkmAAAAK3RSTlMABuUe8dcKLBnhzQ32cSgR7BUj04hdHLVMNMGnUTzFj92XQq5mR7qAeaBXi6LqswAAAy5JREFUSMeVlomOgyAQhsEDUbyr9T5q7877v98OVkE322xK0kSG+eVnviktUWMwBvLNSFw4pJ8Wj6+O/o6ZBtjOJ8EJ7GozZaFQAhaybSbtZGIygnvdRLP+LhYBzepsK2i9eiKkjMHjm6gFvbMI0gOMyWbpDPEF3+j7zfY1AF61CBwbDFOvcFd6oTewArQX0X8FLXpJ5mBF2BAP/whWLxeUUdIdINZnCPUZ3GQrsHIsqu8PKMO0Jfy4BWyt0uP2IHo49yAh/AZ+i44A7iuHNFIcRCp2HPAzoU1O0htAt0JOqGoNmhx1+uMkUy4+FIw4NRxWFrFR54Lc7TsReW14SnG8+caDkgwgoITmTanLCtY9ooxEmQW6StKL5PY6eOFiTwvksQjJLUCB2uEip31E0oSYXXt1lELGoYkIf8oHN1rjgY/TUR6jPFuYodqpwLg8UdjLh0LtnMcAc5tebbmQqfqVllw4kvAgT1MqQVoDyFqLYjadqwURWEpgIUO9hQFQUzKNUuBVeoFdm9FDS/XYTDo/Eqz1jAxxSAfWg+qtU86onFLKeJou0bAvSiEmR/YS+G4W6Q2M8Zy/Oy7Jz/YKbvIXf7Qdntn0Dmpw8wuSDTgWAGLrdE/tBWC96B5cNEM5yUx+OT0HVbwtuGYBpwU1enIa5OHL1v4ETlmSgoW/IVvnT3Dxunc1vi2V8UzB3AhYYCiBocpNc1S8CLvPmPf3Lm2b+owt2fRNu+SbpSOuTW+S42z4trt2p4pTfkTdkRNedfTdqf1F0JSStIjjw2l/69peEURvcEHh1fx95UEcSCmr2rZTfboBJ1HzYQUXjZt246bmpr9xGpwUhIYM5rKVX7XronQ75rqdd+BMVz6iJzG3aqyKqsHZCM6bwenYBQtizUViOwGi0eCMN7iri++9EvqEZSuyA+di4lvgrmu5B3VIktnaIST7wcqhkOCexVCqzasgF+TqS7dI8/cQpongTDPa8kdtd/bqDFH+NdLwV7mjMKIs4VyQP4dpW97e6mSP903y/7/TF4DTN4LkhKjpFwLEGFfkC0Hny2/B5xH9/nNSquv3wwj6YDc/ns5/OfoB8P1hLDV7HqwAAAAASUVORK5CYII=",
	2: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAclBMVEUAAAA9j+BAj95Ajt1Ajt1Aj95Aj95Ajt5Ajt4/j946kdFAj91Bj94/jt1Aj95Ajt5Aj95Bj95Bj95Bj95BjuBAj95Aj95Ajt5Bjt5Bjd5Bj95Akd5CkeFBjt1Aj95Ajt5Bj91Aj95Bjt5CkN0/j99Bj97OhVDZAAAAJXRSTlMACbv9wfD6N1tUBa5oZE3oqqejfRD1zba0QckrFd/U0ZCHdGwgbQpTlAAAAPNJREFUSMftkm1vgjAURm9bS1fRgbwobO599///xbmMJr0WeGbiB6OebyTnAE0fOg/P9aLI7OvGN//Td4YH7KfC/qrliLdvGFgWFA5+wcjCwmJ9JcXxyQs6sdgR5CP2tcKBi4NtQ8vazweeRbHP2azmfLVlQcsMiopTzNfk+3uicqx4mPB15ok2nFJM+MxDoXu59pfRoGYeCq3IxYXxo8EyD4U6PGhwBNU9hqKnAznyNWe/RdiDwz7/FWE/JfSHog57K4EfiujOgZ/uvwR+uv/1u5v3F4qOuPs351Ml94Ox0sd00sc0T8n/w0L6mH3XVoouhx/yglCnk/ZyWAAAAABJRU5ErkJggg==",
	3: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAaVBMVEUAAABBj95Aj95Aj95Bj94/jt5Bj95Bj95Bj95Bjt1Bjt5Bj95Bjt5Ajt5Bj95Aj91Ajt5Bj95Bj95Ajt5Ajt5Aj95Bj95Aj95Bj95Bj95Bj95Cj91Aj95Aj95Bj95Bjt5Bjt1Aj95Bj95teoTtAAAAInRSTlMA32VB3Sf7eCuQar34M+5z0qyglVjy6dm2hkYYCe7jxMMgx+fiLQAAAKhJREFUSMft1ckOwiAUheFbbVGRqUBH68T7P6TiDoyXEBdNm/47Fl9IzuaCz/2KUPh09o8efBnA/Qd6SXWTA+gEY5EDdgD7ZQDJB/WQFQKiWkbeTLAkiFs7ILcySCRAY49hXOOgniCqYii4X2Iw4j+Q+hA2dLPPKsqwguGgtVUYN4lZIe6Jz6q+ZrUEn1WZU5C+zj7rBjawOmA4lyIHOH/MckC6fNCB7wWVvL/UvNMPDgAAAABJRU5ErkJggg==",
	4: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAflBMVEUAAABAj95HktpAj95Aj95Ajt5Ajt1Aj95Aj9xCjt4/jOJBj95Ajt5Aj95Bjt5Ajt5Ajt5Ajt5Bj99Bj95Ajt5AjN1BkOFAj95Aj95Bj95Ajt5Bj95Bjt5Ajt5Bj95Aj91Aj95Bjt5Ajt9Bj95Ajt5Aj91Ajt5Bjt1Bj95Bj95knq2TAAAAKXRSTlMA+QTs5PHZfiMdCvWQduneuoRIPc4WEKijl3BCKsO7uWdmVk0xrqqIXn3NlHQAAAFrSURBVEjH7ZPZloMgEERbgopxicvELJp99f9/cPoM3YREQ3zP1ANHoC5C0cCgpsUkK6YwWsdZh5KHkfbzpiP9VCPs88TrHlrOwS2x9rsnxaFw+cuAjZcLfwXlW7u62qbmh3vbdjjKkDc/SQWgxCGjAS+p+/677B+0Tswaa/Euys0ZLLW7wYjnKx6Wdx1WKLNE3/RpxnPXqBdlfKNyCDvUis6Wmulw+rzEIgLSX7o+96IFO2YngHRokwywKhPxGiYUw55jsLdkJPbky0AHvTJR8qElHZpV33TEGmhhhFoLgFF6C6g0l3Es81S5AROieRDeMvoMlBQHhdJ8Aqr45QFVbqDG9WXJ7lLiP2onkOAVKmAAFPKJCxBoOMIDgCMuIBxAg/UlbEBgZTYOYI/vDWwAsFAPDgBLN7QAXYapA1BBoGyAR9ylYQFaXwMA/APfDnjYeKMAsm6xzXszHjW2yBrl/i56mSn8ghpb2voLyDSEWQomDVwAAAAASUVORK5CYII=",
	5: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAh1BMVEUAAABAjt5Bj95Bj95CkN5Bjt5Bj95Aj95Aj91Bj95Bj95Ajt5Bj95Aj95Bjt5Bj95Bj95Aj95Aj95Aj95Bj95Aj95Aj95Aj95Aj95Aj95Aj95Aj91Aj95Bj95Bj95Aj95Aj95Bj95Bjt5Bj95Bj95Bjt5Bj95Aj95Ajt5Aj95Aj95Bjt1Bj952+uIzAAAALHRSTlMAOeH6TQ0nBiD16hPkqEXUj6OfdM2XC4l+YlscF/3uxq1pMtu7VCzmtG09PLYzA+kAAAHJSURBVEjH7ZTZduIwEEQNQt4XeYFgMMasIUn9//dN9WgYy4eQl7xSLy2pz3VVG2Hvn5IqPXhPdUirbnoSGIVMC7iaNhI51BmUCSbneQq1ljpU2j3fZtkXy1ohzd1zvQSK0PP8Bv2X27hEOPM8LICl+ySfBgcGWwMp+9TKRpvFQMv6oTD3HWADnBIGPgFvf5O0xrRbWZXAXrMzBzYOUNFRJgBiMQhvClA3WR4V1JWVmSsHKCzPRINEySDalTLdnplshsYBmHRm/dcBA0WAKKJFsLQpZzR3AAXISDfgQ5p34JPAm03rc+sAPXCUKNYhvAPb0eE4dSiACwufVsoMgwUyeb1n4MB6AQoHyADDsgDeO/Fvdpy58WUZQYm5AUr3cpHn2+7egVr2ecwEuayM7WhmaB3gGkNt7ISnrYw9B+YzacgjONZGIb46gJYftONoJ/SfLsC7JMm6PTC9lYsekYRpi33iAn7TLFjqCD2ro1W1s/+HTnsjQCXC6ww7GkzkD2k97kbAqk4HBpsqCfVzQIeJ91wj4OoFvIAX8AJ+DYT54q46BuL6/zYPvW+Up2oUKGeb5t6DghI/qAweAfMTYB4Bzz8rPJE6j5/iP9B3RhuyeaRPAAAAAElFTkSuQmCC",
	6: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAjVBMVEUAAAA8luFBjt1Ajt5Eic5Bjt5Aj94/jt5BjdxAjthAjt5Aj9xBjt9Ajt5Bj95Aj95Ajt5Aj95Aj95Aj95Ajt5Ajt5Ajt5Aj95Aj98/kN5Aj95Aj95Aj95Ajt4/j91Bj95Ajt5Ajt1Bj95Aj95Bjt5Aj+BAjt1Ajt5Aj95Ajt5Ajt5Ajt5Ajt9ChuRBj96a1UZiAAAALnRSTlMAEe/7BTfkGxUNtiQf1qcr0qqSferCr4hmW9rOvm9jUElE9XZzMd7FoJmDXz8JZpHX5QAAAaFJREFUSMft0+luozAUBeATbHbCGgg0AUKWZu19/8cbfOkoQ5R0sPqz/STki8TB18bgJystb3+Ahph6lonJroZKpKjm6UZiCmlm69UByz4W+/hScI3uNxduzYHj1S9jb0SL8GqDbUhZ8rj2XwXYPG1dACtVv6FVwyIA9hsXD+wsF8RE3sF/7wsDASkFPgSJMMAjd5PGwzR9nc3V4PEbXIdnivCEXZ0sSofS7C81E0Xg7V7hBRd3znlLZCMlxcRIZeWZKTlRnkJVMnnbATPekwYjOTfaAQeLlPWo1UIQVRhp+bkQzoJYDQTlrnX+RpokwoNo7x1NLInFUqaC1/pxPw7Ljm/GQsENOTgRywH4Hb+9JNp6OxsPZu2+NgGTmLjBXKnVJT6Sz8/03NDatsJtOyQd+GViqCPzwmEXJpkN+U7s/PkDNAG+1hFbu5hoVp1jKy8lvkXOtEjEpCWGoRcwMNcLzOHpBTzUeoEagV4ggF5PBYBI0GQiGs7mZBewYvIWSTB3YqK4n9qLmNB/hn/4yX8iIvEx5jTh0TKeso5h4+CXhj+9iZTw5oJH9QAAAABJRU5ErkJggg==",
	7: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAe1BMVEUAAABQkc1QkMxQkM1Qkc1Qkc1Pkc1QkMxQkc1Qkc1Pkc1Qkc1Pkc1Qkc1Pkc1OkMxQkc1RkMtPkc1Qkc1Qkc1Qkc1Qkc1Pkc1Pkc1Qkc1Pkc1Qkc1Pkc1Qkc1Pkc1Qkc1Qkc1Qkc1Qkc1Pkc1QkM1Pkc1PkM1Pkc1Qkc21UjuAAAAAKHRSTlMA5AvY/PAEHvfoGOs1LCQI4BUQl7y0iUgo3NLFpqFyHM2tazwyfVxTD6aClAAAAbhJREFUSMe11dm6giAQAGCUxRXS3CpN28+8/xMehOp8FiA35792YphhJmS2bbOs3SJvrAWp3XgHhBikU+odsE1A2kf/FxD2WKpXUtqUM33RSEgRc9Xl1sTaOY8W0q0x7lYAjUGhwQLuq84Qcgba5WBBq+8eUogfP2DVlJ8BGQCl9gBSfXb9CG40/wjgGF4yvPAsRYs+iCFRgkGEC6U+/GBoXDpTubIdlwTTFU9UTu6ncUikXj+NPHMHpIJz/U3Rcel6htnJ8kK64bSX7SWqlkkgPYt9RyblkYBZwo3Z1NbGtcyUT2X9/mwc79yWT3A3r4MBlHh5adxcdsyxKshQIvaaaSYhq6lQv8+9ZzrVAbk6TUFumwPM6i5/4+4znlWl2VtSNJ3jEjtqasFxskfcjY2oI/uGND+litnnYAxMWV2RFZsudUH/6BMH5CvVOeIQrWBiJwmGeKxGL1r9fwiAEIIndNUBK29E3K7Pmf7p9YphyGFqaBzr6sRfS8xv7KhwPsHiqw3jypv9WtwrRR3Jcp4vq2MxHvaFnukC15cUeQhTPdMC+QpPIPWldwAbyVwdhryFj6Z5GLfXLzSZZRttJDmcAAAAAElFTkSuQmCC",
	8: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAeFBMVEUAAABAjt1Aj95Aj91BkN0+j9ZAjt5Aj95Aj95Aj95Aj95Ajt5Bjt5Bjt5Bjt5Aj95Bj95Aj95Ajt9Fi+dNjNlAj91Bjt5Aj95Bjt5Bj90/j99IkdpAj91Ajt5Aj91Bjt5Bjt0/kN1Bj91Cj99BjdxAkNw/jN9Bj96Ivkb2AAAAJ3RSTlMA/eR6GwyH+YxL69+zhPPDv5owCwXYz6lNNRAH9Lq4Zlk8x3BhQyhk7h4XAAABKklEQVRIx+2T546DMBCEwYAxhNBCJ/XavP8bHsb4OAyiSFekJPOHXe98WuFda/eomhFCkw0AQyO6ASAcIBsAnQP6E/hFwCEYijiq3WRoAWbyTPGPJ/oR2bJiR223kb7b43xgWAJuXpOuB4oXYD2QvKXAJOAaca1JHWLDBf++EmAayCttKCtv7tod2HbiWndd8/dTXz6GBT9qHcKVRVdTDs688uIeQ9Gv4RwD6lTjSUNVwcfvesatnlyNEPDMfgs8IJzfJR9o/ZIA/BlAxGrtn4EAYwVzgI6x9J8GjIPROdt4GbA0q7OLeLmDJTt0sf73P30Rx5eVQEJlIUqmBqeuq+X1lVMlesxuRsbfKCtLxp9h1hzYsGVNyYTOKS1FFNP0zJ+ov5e1LntMfQKyN2RqtU/KEQAAAABJRU5ErkJggg==",
	9: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAh1BMVEUAAABAjt5Bj95Bj95Aj95Bj95Bj95Bjd9Aj95Aj95Bj95Bj95Bj95Bj95Ajt5Bj95Ajt4/jt1Bj95Aj95Bj95Aj95Ajt1Bj95Aj95Aj95Aj95Bjt5Aj95Aj95Aj95Bj95Aj95Aj95Aj95Aj95Aj95Aj95Bj95Bj95Ajt5Bj95Aj91Bj95Bj9568QY6AAAALHRSTlMAIPzY0PC2CMcS+OJNI2UvHA3t5d1XGPOueb4mwoE119ShkF1SQzwpm4dGpQZ81JQAAAG4SURBVEjH1ZTXeoQgEIVHIoJr7yXZnq2Z93++fAsSXcSEm73If6dwYDhTwMilc2njdu9gSVyioIwt9+c4QK0UlxJ/CBILQYcjZG0h4DjB8/8W5FOBm75AoIX0gke/W9uqiKnavzpapjogIp7gCJYka891vXUC9vhp6sM/xXdm1PALZ2/7prHtP2GR7AMNFMv2Hima+Fhy2PfQyKoDM/cVmgkuYIL1uMSemQSfRM4WOp4cqL6oli3iyYYP7RlGUeiigBveXVFx1kld5YqMpVLRxHOLWml6BFCLx4cgCJea+7Qax0TwiD8aOraQ1m50i7whSY9A9nMB6uMgJCj4yh4lRWchIdcuUFV0E18HomZYukNJPrNI0EjD617ZqvYj1S2SlM4QeS8sKyYzULdIclV/Ir0Qn7tCrZLRvLR9KsX2OQ+NoWayGxn3b7UmatVC7lXZT1QlKko9bfW+UWukOJxl3ztb9Ysn816Id5MO47c7A6j5YPXBMU756+SRJOchsKtQe2cGZqo3giP0Dklf7vYnBotEhxxHegDmZPArbNOS8QqwgVVc+eWCHdmxFYGRGGzJLh2nRWcO/xusUHP/zMpdswAAAABJRU5ErkJggg==",
	10: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAb1BMVEUAAABAjt5Ajt5Aj95Aj95Ajt1Ajt5Bjt5Aj95Bjt5Bj95QhtdBj91Ajt5Ajt1Bj91Ajt5Ajt5Bj91Ajt1Aj91Aj95Bj95Aj95Ajt0+jt1CkOJAj95BkN1Ajt5Bj95Cjt9Ajt09juBBjt5Aj95Bj95K27GqAAAAJHRSTlMA9PvuvteHTPebRgaZWEI8e3Xm5aFQPiolIxGRN96MaFsZrGfi+DkRAAABYklEQVRIx+2UyXLCMBBER3jfMIvxhtkS/f83piR5MO7IFlW55EAfgJp5r0DQgmxJk0CIIEnpvbS+HOO37/C1J5/xSjffGp6Nzin4chafMFl4PIbZdF4J2SIZqmlInASFnDdMHtTTgTgBCgFvmDRj4ggUBG+Y/IPg+EgguA6NgvNrRWHlh3MJHVTDKVAJ5VsVsN4drQucba4uUM7ndQoYu9DfomU2uvUoZIGUVWbHs0rKIANhUI+VXajUbgCh161LCMNtET0IdNpwcyC5mm9OcIY9GwnyZ80XRDtD8gX4Jiq0cV7nhSobz+7auL7yV727K57L2HijEfE0nPhQD3ZEe75/DdEgxtc1FXwgE8aKiS91Pdn44jdrDN9sxs76E69TC7yW9usq6mc7wbiY8QX4l/amc0PY/nLiWTnTeLY0w988GiggjwYKwGOi2C5w9yyGtyR4EVnzWBIetJAlgT7CvxN+ACmxkJltfgDiAAAAAElFTkSuQmCC",
	11: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAYFBMVEUAAABBj95Ajt5Aj95Bj99Aj95AktJAjt5Bj95Bj95Bj95Ajt4/jd9GleRAj91Ajt1Bj95Aj95Bjt1Aj95Ajt5Ajt4/j94+kNw/jds9juBIkdpAj90/j99Bj9xAjt1Bj97RzczJAAAAH3RSTlMA48SGSPkEZ/LYy7VXCfbs69zPvZV1OiUkGQ6pYFlLZWqjEAAAAN5JREFUSMfl1NeOwyAQheHBYHBJNr3ubs77v2WKIdhK0ZmLSFHy34H0CSExyCBbol9p5baDAWBct6gwrLoDDM4Z/gR0Sa/exmeDJ/3MFqsNCXLtRglQ/iVAZ7UAQQvKrRLgVwuwzUAeN3Z1AisKnEgSCxKIQ9eMBeP0SlggiOUR5YGLn8CzClwrhAm93gQM7vBVWSuqHOBE0d4AZq8AS5xaCt0al9Y0mHdgLmQjxEZC5esEak+Bf0B3RJtBS4FJBhMKVBlUrxmgkEGggG8Qa7xQ7aJodkLmQzGdFsGLHAEWn1fuechJvgAAAABJRU5ErkJggg==",
	12: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAOVBMVEUAAABAj95Bj95Bjt8/kN1Ajt1Ajt5Bjt1Bj95Mi9hAjt5Ajt1Aj95Aj95Ajt1CjeJAjt9Ajt5Bj956ZMlGAAAAEnRSTlMAVuNJXFtO0G0G9N7ayMYbQPF5lehvAAABBUlEQVRIx62WWxKDIAxFY1SqiI9m/4utHdveUl7JTPOjjOdIFAjQERZHynALOwoi0un47kSZFoHR5mUhJzDavLj3zaDjx+sWffTMPSC0Af00WISBox3x31k9rx8abeQTGwUBfGLkBfCpkRPAZ4ycUBqoriaM+aFJhRLfsyAiARGNKEtbEC4ITNUHSAk9tx6kMU+r9+s0kzL22/XO267j55N/Gbo+JnznpBJWCJtK8BC8VbibUzJ/tPm3/nvgMDU277dkapgnn3l6mxeQeYkaisBApC8zMOyFLOXHcqkcsnytGA85Pi/ASPiCAMO+Zdk3ReRTDWRl39jZenRg2+EkkGPL8SccD73mLyNbGVhsAAAAAElFTkSuQmCC",
	13: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAflBMVEUAAABAj95Aj95Bid5Aj95Ajt1Aj9xAj91Lh9JBj95Aj+BAj91Aj91CkdpAj95Ajt5Ajt5Ajt9Ajt5Ajt5Aj95Bjt5Bj91Bj95Bj95Ajt5Ajt5Aj95Aj95Aj95Ajt1Ajt5Ajt1Bj95Ajt5AkN4/kt1AkeFAj95Bjt5Ajt5Bj94j3A1BAAAAKXRSTlMA1PoHk5AsmAXzKYHPDN21RDHruqtv9+S/2MrFwoZ3aj0c8F0iGZ6cTyNYQpcAAAGCSURBVEjHrZXrkoMgDIUDgvVatba193t3l/d/wZ3qIHpmaezMfv/CnAycQAhNIdHiFgsd0jQCZTqkiqboo9r0bKZkKDNA8fpQDhMk70ObEZo4snGC4PSX9Tghfn/+dN4r+YTq6NT8kZJ0O5Sh6Wq2lVIoW7LHSRgfyevqZzZSAdH1tAMNbhAcXFyv9ig5nAsXFAERfRs/u9WVKOq31C995VVnpwe1NF19dNJG1gAg0qSvWPeKcur4q9jzY0iOc7u2t6FEdaMrGrFsl4+ehPWFkIV5Udpwzlw9WkDTS9SjBQrBQkrAEpexrrPIY8ESbCCjyEc9ARbc43NkT3KsuhcFnaXEIs70T2MvLvRYQJ6ZbcTSYwHJ7VOWd9uoXRiQh6j3kw4tbFAHJlu+IsaC5S5t++W9hQu9o7zZ8pZKdC8yYP7fxozZcr/8NYOMmsmw5WXnApbXIRPiKD6dCwI7kSPGb54DB8n/H0l9ajrEucAy++Ti8HOoA1aOk2kalRYybmef4xc494mByM3A/QAAAABJRU5ErkJggg==",
	14: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAVFBMVEUAAABBjt08luFAj95CkeFAjthAj95Aj95Aj95Bjt5Aj95Aj95Aj95Ajt1EjuZAjt4/j99Ajt5Ajt5Aj91Ajt5Ajt5Bj95CjuA+jN9GjeJAjt1Bj95fcEk4AAAAG3RSTlMA7hF3GQ3qq6V9+ZPymQq6L+KKe3HYgzIxEls81xsFAAAA6ElEQVRIx82V2w6CMBBEF6EtFakI3nD//z9FGmgTYjJjfOC8DofssqUrMNeiFYqLak0Jd12NcEAY68VolODTx4kRTpMw2AJifnEvOHWsCCS22pBzaIThdfOyV85KcJ4EpfiTYIcuhKe3qOCMzBiHCU5WHCJYkwRjvwjHsqrKo84MkuFVU54JpUyUMexy4ama8kyoZKKKockFo5pyWkBK6jYlbZv2QNPUZ+UHxx+NLdY/THgAhw+AFvhfdK/421UYGlUr7D1OPu8Ep583VwFh/S8rsWWEftl19XhACGk73gUmGhehaAt80m+Hw2QnCpsalgAAAABJRU5ErkJggg==",
	15: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAOVBMVEUAAABBj95Aj95Aj95Ajt9Bjt9Aj91Aj95Aj95Ajt1Aj91Bjt89jNs/kdpBjt4/j91Bj95CjeJBj96rXpOqAAAAEnRSTlMA5FfyT0ne26rtU0AdHK5bJxsjLb4YAAAAsklEQVRIx+2SSw7CMAxE7ab50B8w9z8sIBUsmITKsOmibxUl8xTHsdSJqlE8KKAuAXcO4Y0xp35b6FMe12UG0G0JHYC8rhPMYMHySM/LYAYLlser8AEPziw0A53dQbNEx7xl08qHXCQzWL7WBkYpT41mwfL8lbyv2suBMS0BH4Tl8iV/QoXT1BQKqpSmEFAl/Cz8X9Jcf/QsTa6F21pm2TtR4UCjKFyowMkh7ETw/rR7lm40tkFIt9wISQAAAABJRU5ErkJggg==",
	16: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAV1BMVEUAAABAj95Aj95Aj95Bjt5Bj91Aj90/jt9Ajt5Ajt5Aj95Aj95Ajt1Aj95Ajt9Bj91Aj95DjdBBjt1Bjt49jNxAj91Bj95Ajt1Ajt5Aj95Bj91Bjt5Bj97kjX3KAAAAHHRSTlMA+vSWjzQbWK2dhbPHXg/PhwXvhAvt0ra1VLd0WwRF3QAAAV9JREFUSMfNltmWwiAQRMOaBLMbdZb6/++cA8FphybbPHmfMFYFG3qxyDAIBIQrjiERkQcN7rnDtTiM1+9ptHRrhkFqrleAZAYKqs7oodYMCsyhAfTjsu5a1XhDo9pueTL2qWMIh1L6pakEfhGV8c9Kgb+ObyA67AUJF+v1AYr8DtyFd+gJjEmHr/rXQ2lv9Rxfw4mbj0om9/gptvTZm1t+s5kNC0Tn9PYW9GFdpXHYjGF5rQlrg4QqEZNmDh9mpBhmqMB22NyiEwDF8MHPqaPUdeEq4ImnRHqifYoFxJKQW8RUDuKYx82eoYlZX+AM72s4FfT5Y3VLXbR7Bl8RUUypwevZPig1WPJxbFHY1fw22waTKyDGw9ov2iBfonkmu94ECN4ETrSZNhlqUo0HGpl77f/9qVapqRlXrPpZM/bUJ9o9OfhAKflAIcfRkUWO3aHIx+51zeCk/v9gf8M/Jz9Hz3sgk6XtrgAAAABJRU5ErkJggg==",
	17: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAdVBMVEUAAABAj95Di9xAjt5Ajt5Bjt5Ajt1Aj95Aj95Ajt5Ajt5Bjt1Bj95Aj95Aj95Aj95Fj+NAj95Ajt4/j91Bj95Aj91Bj95Aj948kdo/jNhAjt5Ajt5Bjt5Ajt5Bjt1Bjt5Bj95Ajt5Bi95EkN08luE/j99Bj95cz1BgAAAAJnRSTlMA4QflSTL1947p3VmyOoZ4Er+QHKtTZ00VFLaBdWxC09KqHx4RIDq4ZC8AAAG/SURBVEjHlZTZuoIwDIS7ABUEwQ1BcPfM+z/iMRVEsC3w34h+E0mT6TAzBymXbA4SwELMLMC6nF5wCKiC+5PEfrq7hNAE3qh6W0l8wUfkxUYBgwKR2fXLEH2opXO4t8jFplHd8uSkPoeOgY0w6o8govr5GWvxekrpKRY2vVqJweJWsFTofiL/1xoJB1X/nFfrH8ZJR3gxOHkWkn7LjNzpHWHWP4F3BBLr7pWpqXTFrNDJ1ZZNR1BTVffdi6IRl9U9X/kBoNxOfpLdW0nJtQ0KZ8UOQNr0t4Zm7byRJwA7plmgYeEqSABc2xW3WHPCkzyn3XlceoxPuF4SUNr4pOH0SXuxF/T+lF7nkZFyet0v5ravsBrJPBga8om5OPZHn+ohuyjeyy1bb9AEjGlisw/V18yJx/nXUCq6b3PCekt7cV2g1JQZyncYKT73Gyhpd/xu1j8MIcD2sMbG3ztmjEHGk9YMUh7cQcZEDLQnF2QF+f65i0pzRUprXbdmz2re6G1xH9NStUjlSX4LRu7iPjy/Vhqgj9wzK5kgm/RQC7fJBgW8GgvIrqXwskt9Nk576ODAJlM2Y51It7g5LKUtQ/4BAbJHap49nEgAAAAASUVORK5CYII=",
};

export default sectorIcons;
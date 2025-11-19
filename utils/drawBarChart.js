// utils/drawBarChart.js
export function drawBarChart(containerSel, items, colors, chartWidth = 500, chartHeight = 300) {
  containerSel.html(""); // clear
  const margin = {top: 6, right: 6, bottom: 28, left: 8};
  const w = chartWidth - margin.left - margin.right;
  const h = chartHeight - margin.top - margin.bottom;

  const svg = containerSel.append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(items.map(d => d.label)).range([0, w]).padding(0.15);
  const y = d3.scaleLinear().domain([0, d3.max(items, d => d.value) || 1]).range([h, 0]);

  g.selectAll("rect")
    .data(items)
    .join("rect")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => Math.max(1, h - y(d.value)))
    .attr("fill", (d,i) => (colors && colors[i]) ? colors[i] : "#69b3a2");

  g.selectAll(".xlab")
    .data(items)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", d => x(d.label) + x.bandwidth()/2)
    .attr("y", h + 14)
    .attr("text-anchor", "middle")
    .text(d => d.label)
    .style("font-size", "11px");

  g.selectAll(".val")
    .data(items)
    .join("text")
    .attr("x", d => x(d.label) + x.bandwidth()/2)
    .attr("y", d => y(d.value) - 4)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .text(d => (Math.round(d.value * 10) / 10) + (d.unit || "%"));
}

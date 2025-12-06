export function drawBarChart(
  containerSel,
  items,
  color,
  {
    title = "",
    xLabel = "",
    chartHeight = 350
  } = {}
) {
  containerSel.html("");
  // auto-fit width to sidebar
  const containerNode = containerSel.node();
  const chartWidth = containerNode.getBoundingClientRect().width - 4;

  const margin = {
    top: 40,
    right: 20,
    bottom: 60,
    left: 35
  };

  const w = chartWidth - margin.left - margin.right;
  const h = chartHeight - margin.top - margin.bottom;

  const svg = containerSel.append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(items.map(d => d.label))
    .range([0, w])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(items, d => d.value) || 1])
    .nice()
    .range([h, 0]);

  // Title
  if (title) {
    svg.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text(title);
  }

  // Bars
  g.selectAll("rect")
    .data(items)
    .join("rect")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => Math.max(1, h - y(d.value)))
    .attr("fill", color);

  // Value labels above bars
  g.selectAll(".val")
    .data(items)
    .join("text")
    .attr("class", "val")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", d => y(d.value) - 6)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#111")
    .text(d => (Math.round(d.value * 10) / 10) + (d.unit || "%"));

  // X labels
  g.selectAll(".xlab")
    .data(items)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", h + 24)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "600")
    .style("fill", "#333")
    .text(d => d.label);

  // X-axis label
  if (xLabel) {
    svg.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#444")
      .style("margin-top", '10px')
      .text(xLabel);
  }

  // Y-axis (grid only)
  g.append("g")
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickSize(-w)
    )
    .call(g => g.selectAll("text").style("font-size", "11px"))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
}
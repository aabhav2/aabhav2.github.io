let currentScene =0;d3.csv("climate_anomalies.csv").then(data => {
  data.forEach(d => {
    d.Year = +d.Year;
    d.Anomaly = +d.Anomaly;
  });

  renderScene(data);
  d3.select("#next").on("click", () => {
    currentScene++;
    renderScene(data);
  });
});

function renderScene(data) {
  d3.select("#chart").html("");
  if (currentScene === 0) showScene1(data);
  else if (currentScene === 1) showScene2(data);
  else showScene3(data);
}

function showScene1(data) {
  const svg = d3.select("#chart")
                .append("svg")
                .attr("width", 800)
                .attr("height", 400);

  const margin = {top: 20, right: 30, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
              .domain(d3.extent(data, d => d.Year))
              .range([0, width]);

  const y = d3.scaleLinear()
              .domain(d3.extent(data, d => d.Anomaly))
              .range([height, 0]);

  const line = d3.line()
                 .x(d => x(d.Year))
                 .y(d => y(d.Anomaly));

  g.append("path")
   .datum(data)
   .attr("fill", "none")
   .attr("stroke", "steelblue")
   .attr("stroke-width", 2)
   .attr("d", line);

  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  g.append("g").call(d3.axisLeft(y));

  svg.append("text")
     .attr("x", 100)
     .attr("y", 20)
     .text("Scene 1: Global Temperature Anomalies (°C)")
     .attr("font-size", "16px");
}


function showScene2(data) {
  const recent = data.filter(d => d.Year >= 2000);
  showScene1(data);
  d3.select("svg").append("text")
    .attr("x", 100)
    .attr("y", 40)
    .text("Scene 2: Post-2000 warming accelerates")
    .attr("font-size", "16px")
    .attr("fill", "darkred");
}


function showScene3(data) {
  const grouped = d3.groups(data, d => Math.floor(d.Year / 10) * 10);
  const avgData = grouped.map(([decade, values]) => ({
    Decade: decade,
    AvgAnomaly: d3.mean(values, d => d.Anomaly)
  }));

  const svg = d3.select("#chart")
                .append("svg")
                .attr("width", 800)
                .attr("height", 400);

  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  const margin = {top: 20, right: 30, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
              .domain(avgData.map(d => d.Decade))
              .range([0, width])
              .padding(0.1);

  const y = d3.scaleLinear()
              .domain([d3.min(avgData, d => d.AvgAnomaly), d3.max(avgData, d => d.AvgAnomaly)])
              .nice()
              .range([height, 0]);

  g.selectAll("rect")
    .data(avgData)
    .enter()
    .append("rect")
    .attr("x", d => x(d.Decade))
    .attr("y", d => y(d.AvgAnomaly))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.AvgAnomaly))
    .attr("fill", "orange")
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
             .html(`<strong>Decade:</strong> ${d.Decade}s<br><strong>Avg Anomaly:</strong> ${d.AvgAnomaly.toFixed(2)}°C`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x));

  g.append("g").call(d3.axisLeft(y));

  svg.append("text")
     .attr("x", 100)
     .attr("y", 20)
     .text("Scene 3: Explore Avg Anomalies by Decade")
     .attr("font-size", "16px");
}

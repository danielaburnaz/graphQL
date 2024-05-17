function createGraph(data) {
  const svgWidth = 500;
  const svgHeight = 200;
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const maxValue = Math.max(...data.map((item) => item.value));
  const xScale = chartWidth / (data.length - 1);
  const yScale = chartHeight / maxValue;

  const points = data.map((item, index) => {
    const x = index * xScale;
    const y = chartHeight - item.value * yScale;
    return `${x},${y}`;
  });

  const pathData = `M${points.join("L")}`;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#F09D51");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);

  svg.appendChild(path);

  return svg;
}

export { createGraph };


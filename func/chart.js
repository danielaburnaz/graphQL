function createGraph(data, svgId) {
  const svgWidth = 700;
  const svgHeight = window.innerHeight;
  const barHeight = 30; // thicc bar
  const barMargin = 10; // space between bars
  const maxValue = Math.max(...data.map((item) => item.value));
  const scale = (svgWidth - 100) / maxValue;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);
  svg.setAttribute("id", svgId);

  // make bars
  data.forEach((item, index) => {
    const barWidth = item.value * scale;
    const barX = 100;
    const barY = index * (barHeight + barMargin) + 60;

    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", barX);
    bar.setAttribute("y", barY);
    bar.setAttribute("width", barWidth);
    bar.setAttribute("height", barHeight);
    bar.setAttribute("fill", "steelblue");
    svg.appendChild(bar);

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    label.setAttribute("x", 30);
    label.setAttribute("y", barY + barHeight / 2 + 5);
    label.setAttribute("text-anchor", "end");
    label.textContent = item.label;
    svg.appendChild(label);
  });

  return svg;
}

export { createGraph };

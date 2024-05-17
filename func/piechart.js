function pieGraph(data) {
    const svgWidth = 400;
    const svgHeight = 400;
    const radius = Math.min(svgWidth, svgHeight) / 2 - 10;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
  
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
  
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
  
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
  
    data.forEach((item, index) => {
      const sliceAngle = (item.value / totalValue) * 360;
      const endAngle = startAngle + sliceAngle;
  
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
  
      const startX = centerX + radius * Math.cos(startAngle * Math.PI / 180);
      const startY = centerY + radius * Math.sin(startAngle * Math.PI / 180);
      const endX = centerX + radius * Math.cos(endAngle * Math.PI / 180);
      const endY = centerY + radius * Math.sin(endAngle * Math.PI / 180);
  
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        "Z",
      ].join(" ");
  
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", colors[index % colors.length]);
      path.setAttribute("stroke", "white");
      path.setAttribute("stroke-width", "2");
  
      svg.appendChild(path);
  
      startAngle = endAngle;
    });
  
    return svg;
  }
  
  export { pieGraph };
  
  
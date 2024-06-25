let canvasLeft;
let canvasTop;
let displayBoxWidth = 200;
let displayBoxHeight = 80;
let data; // Declare data variable
let rows; // Declare rows variable
let hoveredIndex = -1; // Declare hoveredIndex variable
let starColors = []; // Array to store star colors
let robotoSlab; // Declare font variable

function preload() {
  data = loadTable("world_poverty_geo.csv", "csv", "header");
  robotoSlab = loadFont("RobotoSlab-VariableFont_wght.ttf"); // Correct usage of loadFont
}

function setup() {
  createCanvas(1535, 600);
  rows = data.getRows();

  // Initialize colors correctly within setup
  continentColors = {
    "Africa": color(255, 0, 0), // Red
    "Europe": color(0, 255, 0), // Green
    "Asia": color(0, 0, 255), // Blue
    "North America": color(255, 255, 0), // Yellow
    "South America": color(255, 165, 0), // Orange
    "Oceania": color(255, 105, 180) // Pink
  };

  canvasLeft = width / 2; // Calculate canvasLeft based on the canvas width
  canvasTop = height / 1.35; // Calculate canvasTop based on the canvas height

  // Generate random colors for stars
  let startColor = color(255, 255, 200); // Very pale yellow
  let midColor = color(255, 255, 255); // White
  let endColor = color(200, 255, 255); // Very pale blue

  for (let i = 0; i < rows.length; i++) {
    let gradientPos = random();
    let starColor;
    if (gradientPos < 0.5) {
      starColor = lerpColor(startColor, midColor, gradientPos * 2);
    } else {
      starColor = lerpColor(midColor, endColor, (gradientPos - 0.5) * 2);
    }

    // Add a little gray/silver to the color
    starColor = lerpColor(starColor, color(192, 192, 192), 0.2); // 20% gray/silver
    starColors.push(starColor);
  }
}

function draw() {
  background(25, 25, 50);
  drawTwilight();

  // Draw the title with shadow effect
  textFont(robotoSlab); // Use the loaded font
  fill(255);
  textSize(32);
  textAlign(CENTER, TOP);
  
  // Adding shadow effect
  drawingContext.shadowOffsetX = 4;
  drawingContext.shadowOffsetY = 4;
  drawingContext.shadowBlur = 8;
  drawingContext.shadowColor = 'rgba(255, 77, 150, 0.5)'; // Dark shadow for a poverty theme

  text("Poverty Turning Off the Lights Around the World", width / 2, 10);
  
  // Reset shadow effect for other texts
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = 0;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0)';

  textFont('sans-serif'); // Reset to default font
  textSize(12);
  textAlign(LEFT, TOP);

  hoveredIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    let dataRow = rows[i].obj;
    let gdp = dataRow['GDP per capita, PPP (constant 2017 international $)'];
    let population = dataRow.population_y;
    let povertyRatio = dataRow['Poverty headcount ratio at national poverty lines (% of population)'];
    let meanIncome = dataRow['Mean income or consumption'];
    let nationalPovertyLine = dataRow['Harmonized national poverty line_y'];

    // Use precomputed star color
    let starColor = starColors[i];

    // Check if the star should be highlighted
    let isHovered = mouseX > 10 * i && mouseX < 10 * i + Math.sqrt((gdp / 100) * 10) && mouseY < 600 && mouseY > 600 - Math.sqrt((population / 1000000) * 100);
    if (isHovered) {
      starColor = color(255, 255, 255); // Change to bright white when hovered
      hoveredIndex = i;
    }
    fill(starColor);

    // Draw stars behind buildings
    let starY = canvasTop - nationalPovertyLine * 10;
    let starSize = meanIncome ? Math.sqrt(meanIncome) * 2 : 5;

    // Apply twinkling effect if hovered
    if (hoveredIndex === i && isHovered) {
      let oscillation = sin(frameCount * 0.1) * 0.5 + 1; // Oscillate between 0.5 and 1.5
      starSize *= oscillation;
    } else if (hoveredIndex === i && !isHovered) {
      hoveredIndex = -1; // Reset hoveredIndex when mouse is no longer over the star
    }

    ellipse(10 * i + 5, starY, starSize);
  }

  for (let i = 0; i < rows.length; i++) {
    let dataRow = rows[i].obj;
    let gdp = dataRow['GDP per capita, PPP (constant 2017 international $)'];
    let population = dataRow.population_y;
    let povertyRatio = dataRow['Poverty headcount ratio at national poverty lines (% of population)'];
    let meanIncome = dataRow['Mean income or consumption'];

    // Building representation
    let buildingHeight = Math.sqrt((population / 1000000) * 100); // Square root of population, scaled by 100
    let buildingWidth = Math.sqrt((gdp / 100) * 10); // Square root of gdp, scaled by 10

    let continent = dataRow.Continent;
    let col;
    if (continentColors[continent]) {
      col = continentColors[continent];
    } else {
      col = color(255); // Default color if continent is not found
    }
    fill(col);
    
    // Draw the building
    rect(10 * i, 600, buildingWidth, -buildingHeight);

    // Calculate number of windows set on the buildings
    const totalWindows = Math.floor((buildingWidth / 5) * (buildingHeight / 5));
    const povertyWindows = Math.floor(totalWindows * (povertyRatio / 100));
    const nonPovertyWindows = totalWindows - povertyWindows;

    // Draw windows with spacing on the buildings
    const windowSize = 4; // Adjust the size of the windows
    const windowSpacing = 1; // Adjust the spacing between windows

    for (let windowIndex = 0; windowIndex < totalWindows; windowIndex++) {
      const x = 10 * i + (windowIndex % (Math.floor(buildingWidth / (windowSize + windowSpacing))) * (windowSize + windowSpacing));
      const y = 600 - buildingHeight + Math.floor(windowIndex / (Math.floor(buildingWidth / (windowSize + windowSpacing)))) * (windowSize + windowSpacing);

      if (windowIndex < povertyWindows) {
        fill(110, 110, 110); // Light grey (200) for poverty windows
      } else {
        fill(255, 255, 150); // Light yellow for non-poverty windows
      }

      // Draw smaller windows with spacing without covering up the buildings
      if ((x > 10 * i) && (x < (10 * i + buildingWidth)) && (y > 600 - buildingHeight)) {
        rect(x, y, windowSize, windowSize);
      }
    }
  }

  if (hoveredIndex !== -1) {
    let dataRow = rows[hoveredIndex].obj;
    let gdp = dataRow['GDP per capita, PPP (constant 2017 international $)'];
    let population = dataRow.population_y;
    let povertyRatio = dataRow['Poverty headcount ratio at national poverty lines (% of population)'];
    let nationalPovertyLine = dataRow['Harmonized national poverty line_y'];
    let meanIncome = dataRow['Mean income or consumption'];

    let displayBoxX = mouseX > canvasLeft ? mouseX - displayBoxWidth : mouseX;
    let displayBoxY = mouseY - 80;

    fill(25, 25, 50, 200); // Semi-transparent blackish-purple background
    rect(displayBoxX, displayBoxY, displayBoxWidth, displayBoxHeight);
    fill(255); // Solid white text
    textSize(12);
    text(`Country: ${dataRow.Entity}`, displayBoxX + 5, displayBoxY + 5); // Adjust these values to position the text correctly
    text(`GDP per capita: ${Number(gdp).toLocaleString()}`, displayBoxX + 5, displayBoxY + 20);
    text(`Population: ${Number(population).toLocaleString()}`, displayBoxX + 5, displayBoxY + 35);
    text(`Poverty Ratio: ${povertyRatio} Percent`, displayBoxX + 5, displayBoxY + 50);
    text(`National Hourly Poverty Line: ${Number(nationalPovertyLine).toFixed(2)}`, displayBoxX + 5, displayBoxY + 65);
  }
}

function drawTwilight() {
  let startColor = color(255, 77, 150); // Light red-pink
  let endColor = color(25, 25, 50); // Dark blue-purple
  let twilightHeight = 300; // Adjust this to cover the lower half

  for (let y = 0; y < twilightHeight; y++) {
    let inter = map(y, 0, twilightHeight, 0, 1);
    let c = lerpColor(startColor, endColor, inter);
    stroke(c);
    line(0, height - y, width, height - y);
  }
}



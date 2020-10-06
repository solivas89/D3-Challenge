// @TODO: YOUR CODE HERE!

// Does this need to be put into a makeResponsive function???
// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {

// If the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    };

    // Day 03 - Act. 06
    // SVG wrapper dimensions are determined by the current width and height of the browser window.
    var svgWidth = 960;
    var svgHeight = 500;

    var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import Data
    d3.csv("assets/data/data.csv").then(function(govData) {
        console.log(govData)

        // Parse Data/Cast as numbers
        govData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        // Create scale functions
        var xLinearScale = d3.scaleLinear()
            .domain([20, d3.max(govData, d => d.poverty)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(govData, d => d.healthcare)])
            .range([height, 0]);

        // Create axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axes to the chart
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // Create Circles
        var circlesGroup = chartGroup.selectAll(".stateCircle")
            .data(govData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15")
            .attr("class", "stateCircle")
            .attr("opacity", ".5");

        // Add text to circles
        var textGroup = chartGroup.selectAll(".stateText")
            .data(govData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d.poverty))
            .attr("y", d => yLinearScale(d.healthcare))
            .text(d => (d.abbr))
            .attr("font-size", "12px")
            .attr("class", "stateText")
            .attr("text-anchor", "middle");
        
        // Initialize tool tip
        var toolTip = d3.tip()
          .attr("class", "tooltip")
          .offset([80, -60])
          .html(function(d) {
            return (`${d.state}<br>${d.poverty}<br>${d.healthcare}`);
          });
      
        // Create tooltip in the chart
        chartGroup.call(toolTip);
      
        // Create event listeners to display and hide the tooltip
        circlesGroup.on("mouseover", function(data) {
          toolTip.show(data);
        })
          // onmouseout event
          .on("mouseout", function(data, index) {
            toolTip.hide(data);
          });

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("In Poverty (%)");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("class", "axisText")
            .text("Lacks Healthcare (%)");

    }).catch(function(error) {
        console.log(error);
    });
};   

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);

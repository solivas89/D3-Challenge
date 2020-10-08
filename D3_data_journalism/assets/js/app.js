// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {

    // If the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    };

    // Day 03 - Act. 06
    // SVG wrapper dimensions are determined by the current width and height of the browser window.
     var svgHeight = window.innerHeight/1.6;
    var svgWidth = window.innerWidth/2.15;

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

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(govData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
        .domain([d3.min(govData, d => d[chosenXAxis]) * 0.8,
            d3.max(govData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    
        return xLinearScale;
    };

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
    
        return xAxis;
    };

    // function used for updating y-scale var upon click on axis label
    function yScale(govData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
        .domain([d3.min(govData, d => d[chosenYAxis]) * 0.8,
            d3.max(govData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
    
        return yLinearScale;
    };

     // function used for updating yAxis var upon click on axis label
     function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisBottom(newYScale);
    
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
    
        return yAxis;
    };
    
    // function used for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    };

    // function used for updating text group with a transition to new circles
    function renderText(circlesGroup, chosenXAxis, newXScale, chosenYAxis, newYScale) {

        textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    
        return textGroup;
    };

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

        var xlabel;
        var ylabel;
        
        if (chosenXAxis === "poverty") {
            xlabel = "Poverty: ";
          }
        else if (chosenXAxis === "age") {
            xlabel = "Age: ";
          }
        else {
            xlabel = "Income: ";
        }

        if (chosenYAxis === "healthcare") {
            ylabel = "Lacks Healthcare: ";
          }
        else if (chosenYAxis === "smokes") {
            ylabel = "Smokes: ";
          }
        else {
            ylabel = "Obese: ";
        }

        // Initialize tool tip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
            });
    
        // Create tooltip in the chart
        circlesGroup.call(toolTip);
    
        // Create event listeners to display and hide the tooltip
        circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

        textGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
            })
            // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });
        return circlesGroup;
    };

    // Import Data
    d3.csv("assets/data/data.csv").then(function(govData, err) {
        console.log(govData);
        if (err) throw err;

        // Parse Data/Cast as numbers
        govData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = +data.obesity;
        });

         // xLinearScale function above csv import
        var xLinearScale = xScale(govData, chosenXAxis);
        var yLinearScale = yScale(govData, chosenYAxis);


        // Create axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axes to the chart
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Create Circles
        var circlesGroup = chartGroup.selectAll(".stateCircle")
            .data(govData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", "15")
            .attr("class", "stateCircle")
            .attr("opacity", ".5");

        // Add text to circles
        var textGroup = chartGroup.selectAll(".stateText")
            .data(govData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("dy", ".35em")
            .text(d => (d.abbr))
            .attr("font-size", "12px")
            .attr("class", "stateText");
        
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup)

        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`)
        // Create axes labels
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");

        
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)")
        // Create axes labels
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0-(height/2))
            .attr("y", 40-margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0-(height/2))
            .attr("y", 20-margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");

        var obesityLabel = yLabelsGroup.append("text")
            .attr("x", 0-(height/2))
            .attr("y", 0-margin.left)
            .attr("dy", "1em")
            .attr("value", "obese")
            .classed("inactive", true)
            .text("Obese (%)");

        // x axis labels event listener
        xLabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // Replaces chosenXAxis with Value
                chosenXAxis = value;
                // console.log(chosenXaxis)

                // updates x scale for new data
                xLinearScale = xScale(govData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates Text with New Values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // Changes Classes to Change Bold Text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    }
                    else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    }
                    else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    
        // yAxis Labels Event Listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {
            // Get Value of Selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;
                console.log(chosenYAxis)

                // Updates yScale for New Data
                yLinearScale = yScale(govData, chosenYAxis);

                // Updates yAxis with Transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Updates Circles with New Values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Updates Text with New Values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                // Updates Tooltips with New Information
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // Changes Classes to Change Bold Text
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

    }).catch(function(error) {
        console.log(error);
    });
};   

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);

/* * * * * * * * * * * * * *
*      class LineGraph        *
* * * * * * * * * * * * * */


class LineGraph{

    constructor(parentElement, Data){

        this.parentElement = parentElement;
        this.data = Data;
        this.displayData = [];

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 100, bottom: 80, left: 100};

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add clip path
        vis.svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.width)
            .attr("height", vis.height)

        // add title
        vis.svg.append('text')
            .attr('class', 'title line-title')
            //.append('text')
            .text('Title for Line Graph')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // Scales
        vis.x = d3.scaleTime()
            .rangeRound([0, vis.width])

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // axis
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")

        this.wrangleData();
    }

    wrangleData(){
        let vis = this;
        vis.displayData = [];

        vis.data.forEach(function(d){
            d.Year = +d.Year;
            d.Mean = +d.Mean;
            if (d.Source === "GCAG" && d.Year > 1984) {
                vis.displayData.push(d);
            }
        });
        console.log(vis.displayData);

        // code to filter data based on start and end date
        // let start = selectedTimeRange[0];
        // let end = selectedTimeRange[1];
        // vis.helperData = vis.displayData.filter(function(d) {
        //     // date is between start and end
        //     return end >= d.Year && start <= d.Year ;
        // });
        //
        // vis.displayData = vis.helperData;

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.svg.selectAll(".line").remove();

        vis.svg.selectAll('.line-title')
            .text("Global Annual Mean Temperature \"Anomalies\" in degrees Celsius relative to 20th century average")
        //from" + selectedTimeRange[0] + " to " + selectedTimeRange[1])

        vis.x.domain(d3.extent(vis.displayData, d => d.Year));
        vis.y.domain(d3.extent(vis.displayData, d => d.Mean));

        // Add the line
        vis.svg.append("path")
            .attr("clip-path", "url(#clip)")
            .attr("class", "line")
            .datum(vis.displayData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return vis.x(d.Year) })
                .y(function(d) { return vis.y(d.Mean) })
            )

        // circles
        vis.circle = vis.svg.selectAll("circle")
            .attr("clip-path", "url(#clip)")
            .data(vis.displayData);

        vis.circle.enter().append("circle")
            .attr("class", "circle")
            .merge(vis.circle)
            .style("fill", "steelblue")
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .transition()
            .duration(1000)
            .attr("r", 3)
            .attr("cx", d => vis.x(d.Year))
            .attr("cy", d => vis.y(d.Mean))

        vis.circle.exit().remove();

        function mouseover(event, d){
            d3.select(this)
                .attr('stroke-width', '2px')
                .attr('stroke', 'black')
                .attr('fill', 'black')

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                         <h3>${d.Year}<h3>
                         <h4>Mean: ${d.Mean}</h4>
                     </div>`);
        }

        function mouseout(event, d) {
            d3.select(this)
                .attr('stroke-width', '2px')
                .attr('stroke', 'steelblue')
                .attr("fill", "steelblue");

            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        };

        vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .transition()
            .duration(1000)
            .call(vis.xAxis)
        // .selectAll("text")
        // .attr("font-size", 10)
        // .attr("transform", "translate (0,6) rotate(-22)");

        vis.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(vis.yAxis);
    }



}
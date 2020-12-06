/* * * * * * * * * * * * * *
*     class BrushVis       *
* * * * * * * * * * * * * */

BrushVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.parseDate = d3.timeParse("%Y");
    this.drought_color = '#fee6ce'


    // call method initVis
    this.initVis();
};

// init brushVis
BrushVis.prototype.initVis = function() {
    let vis = this;

    vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // clip path
    vis.svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // add title
    vis.svg.append('g')
        .attr('class', 'title')
        .append('text')
        .text('It\'s Getting Hotter')
        .style('font-size', '18px')
        .attr('transform', `translate(${vis.width/2}, 20)`)
        .attr('text-anchor', 'middle');
    vis.svg.append('g')
        .attr('class', 'title')
        .append('text')
        .style('font-size', '14px')
        .text('Global Annual Mean Temperature \"Anomalies\" Relative to 20th Century Average (Celsius)')
        .attr('transform', `translate(${vis.width/2}, 40)`)
        .attr('text-anchor', 'middle');

    // init scales
    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    // init x & y axis
    vis.xAxis = vis.svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.svg.append("g")
        .attr("class", "axis axis--y");

    // init pathGroup
    vis.pathGroup = vis.svg.append('g').attr('class','pathGroup');

    // init paths (drought and non-dought years)
    vis.pathOne = vis.pathGroup
        .append('path')
        .attr("class", "pathOne");
    vis.pathTwo = vis.pathGroup
        .append('path')
        .attr("class", "pathTwo");
    vis.pathThree = vis.pathGroup
        .append('path')
        .attr("class", "pathThree");
    vis.pathFour = vis.pathGroup
        .append('path')
        .attr("class", "pathFour");
    vis.pathFive = vis.pathGroup
        .append('path')
        .attr("class", "pathFive");

    vis.svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(" + ((15)) + "," + (50) + ")")
        .style('font-size', '11')

    // scale for cause of fire
    let ordinal = d3.scaleOrdinal()
        .domain(["Major Drought", "Minor Drought/Normal"])
        .range([ vis.drought_color, "darkred"]);

    let legendOrdinal = d3.legendColor()
        //d3 symbol creates a path-string, for example
        //"M0,-8.059274488676564L9.306048591020996,
        //8.059274488676564 -9.306048591020996,8.059274488676564Z"
        .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
        .shapePadding(10)
        .title("Drought Legend")
        //use cellFilter to hide the "e" cell
        //.cellFilter(function(d){ return d.label !== "e" })
        .scale(ordinal);

    vis.svg.select(".legendOrdinal")
        .call(legendOrdinal);

    // // init path two (single state)
    // vis.pathTwo = vis.pathGroup
    //     .append('path')
    //     .attr("class", "pathTwo");

    //drought years 1986-1992, 2007-2009, 2011-2016
    //areas 1, 2, 3, 4, 5 (2 and 4 are non-drought color fill)
    // init path generator
    vis.area = d3.area()
        .curve(d3.curveMonotoneX)
        .y0(vis.y(0))
        .y1(function(d) {
            return vis.y(d.Mean); })
        .x(function(d) {
            if (d.Year<=vis.parseDate(1992)){
                return vis.x(d.Year)
            }
            else{
                return vis.x(vis.parseDate(1992));
            }
        });
    vis.area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .y0(vis.y(0))
        .y1(function(d) {
            return vis.y(d.Mean); })
        .x(function(d) {
            if (d.Year<vis.parseDate(2007) && d.Year>vis.parseDate(1992) ){
                return vis.x(d.Year)
            }
            else if (d.Year<=vis.parseDate(1992)){
                return vis.x(vis.parseDate(1992));
            }
            else{
                return vis.x(vis.parseDate(2007));
            }
        });
    vis.area3 = d3.area()
        .curve(d3.curveMonotoneX)
        .y0(vis.y(0))
        .y1(function(d) {
            return vis.y(d.Mean); })
        .x(function(d) {
            if (d.Year<=vis.parseDate(2009) && d.Year>=vis.parseDate(2007) ){
                return vis.x(d.Year)
            }
            else if (d.Year<=vis.parseDate(2007)){
                return vis.x(vis.parseDate(2007));
            }
            else{
                return vis.x(vis.parseDate(2009));
            }
        });
    vis.area4 = d3.area()
        .curve(d3.curveMonotoneX)
        .y0(vis.y(0))
        .y1(function(d) {
            return vis.y(d.Mean); })
        .x(function(d) {
            if (d.Year<vis.parseDate(2011) && d.Year>vis.parseDate(2009) ){
                return vis.x(d.Year)
            }
            else if (d.Year<=vis.parseDate(2009)){
                return vis.x(vis.parseDate(2009));
            }
            else{
                return vis.x(vis.parseDate(2011));
            }
        });
    vis.area5 = d3.area()
        .curve(d3.curveMonotoneX)
        .y0(vis.y(0))
        .y1(function(d) {
            return vis.y(d.Mean); })
        .x(function(d) {
            if (d.Year<=vis.parseDate(2016) && d.Year>=vis.parseDate(2011) ){
                return vis.x(d.Year)
            }
            else if (d.Year<=vis.parseDate(2011)){
                return vis.x(vis.parseDate(2011));
            }
            else{
                return vis.x(vis.parseDate(2016));
            }
        });

    // init brushGroup:
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush");

    // init brush
    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush end", function(event){
            selectedTimeRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
            myDataTable.wrangleData();
            myMapVis.wrangleData();
            myBarVisOne.wrangleData();
            myBarVisTwo.wrangleData();
            // @TODO come back here
            // console.log(selectedTimeRange)

        });

    // init basic data processing
    this.wrangleDataStatic();
};

// init basic data processing - prepares data for brush - done only once
BrushVis.prototype.wrangleDataStatic = function() {
    let vis = this;

    // rearrange data structure and group by state
    // let dataByDate = Array.from(d3.group(vis.data, d =>d.submission_date), ([key, value]) => ({key, value}))


    vis.preProcessedData = [];


    vis.data.forEach(function(d){
        d.Year = +d.Year;
        d.Mean = +d.Mean;
        if (d.Source === "GCAG" && d.Year > 1984) {
            //vis.displayData.push(d);
            vis.preProcessedData.push (
                {Year: vis.parseDate(d.Year), Mean: d.Mean}
            )
        }

    });

    this.wrangleDataResponsive();
    //this.wrangleData();

};

// // additional DataFiltering - only needed if we want to draw a second chart
BrushVis.prototype.wrangleDataResponsive = function() {
    let vis = this;

    vis.filteredData = [];

    // filter
    if (selectedYear !== ''){
        vis.data.forEach(date => {
            if (selectedYear === date.Year){
                vis.filteredData.push(date)
            }
        })
    }

    // //rearrange data structure and group by state
    // let dataByDate = Array.from(d3.group(vis.filteredData, d =>d.submission_date), ([key, value]) => ({key, value}))
    //
    //
    // vis.dataPathTwo = [];
    //
    // // iterate over each year
    // dataByDate.forEach( year => {
    //     let tmpSumNewCases = 0;
    //     let tmpSumNewDeaths = 0;
    //     year.value.forEach( entry => {
    //         tmpSumNewCases += +entry['new_case'];
    //         tmpSumNewDeaths += +entry['new_death'];
    //     });
    //
    //     vis.dataPathTwo.push (
    //         {date: vis.parseDate(year.key), newCases: tmpSumNewCases, newDeaths: tmpSumNewDeaths}
    //     )
    // });

    this.wrangleData();
};

// wrangleData - gets called whenever a state is selected
BrushVis.prototype.wrangleData = function(){
    let vis = this;

    // Update the visualization
    this.updateVis();
};

// updateVis
BrushVis.prototype.updateVis = function() {
    let vis = this;

    // update domains
    vis.x.domain( d3.extent(vis.preProcessedData, function(d) { return d.Year }) );
    vis.y.domain( d3.extent(vis.preProcessedData, function(d) {
        return d.Mean }) );

    // draw x & y axis
    vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x));
    vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5));

    // let dateFormat = d3.time.format("%Y");

    // draw areas of drought and non-dorught years
    vis.pathOne.data([vis.preProcessedData])
        .attr("d", vis.area)
        .attr('fill', vis.drought_color)

    vis.pathTwo.datum(vis.preProcessedData)
        .attr("d", vis.area2)
        .attr('fill', 'darkred')

    vis.pathThree.datum(vis.preProcessedData)
        .attr("d", vis.area3)
        .attr('fill', vis.drought_color)

    vis.pathFour.datum(vis.preProcessedData)
        .attr("d", vis.area4)
        .attr('fill', 'darkred')

    vis.pathFive.datum(vis.preProcessedData)
        .attr("d", vis.area5)
        .attr('fill', vis.drought_color)

        // .attr("stroke", "#136D70")

    // // draw pathOne
    // vis.pathTwo.datum(vis.dataPathTwo)
    //     .transition().duration(400)
    //     .attr("d", vis.area)
    //     .attr('fill', 'rgba(255,0,0,0.47)')
    //     .attr("stroke", "#darkred")
    //     .attr("clip-path", "url(#clip)");


    vis.brushGroup
        .call(vis.brush);
};
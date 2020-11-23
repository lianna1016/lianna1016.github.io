/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class HeatMapVis {

    constructor(parentElement, Data){

        this.parentElement = parentElement;
        this.data = Data;

        this.initVis()
    }

    initVis(){
        let vis = this;
        console.log(vis.data)

        vis.margin = {top: 60, right: 90, bottom: 50, left: 130};

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('text')
            .attr('class', 'title heatmap-title')
            //.append('text')
            .text('Title for HeatMap')
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');


        vis.x = d3.scaleBand()
            .range([ 0, vis.width ])
            //.domain(vis.data.map(d=> d.year))
            .padding(0.05);


        vis.y = d3.scaleBand()
            .range([ vis.height, 0 ])
            //.domain(vis.causes)
            .padding(0.05);

        vis.myColor = d3.scaleLinear()
            .range(["white", "#C22E0F"])
            .domain([1,10000])
            // d3.scaleSequential()
            // .interpolator(d3.interpolateInferno)
            // .domain([1,100000])

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")

        vis.brush = d3.brushX()
            .extent([[0,0], [vis.width, vis.height]])
            .on("brush", brushed);

        function brushed({selection}) {
            if (selection) {
                const range = vis.x.domain().map(vis.x);
                const i0 = d3.bisectRight(range, selection[0]);
                const i1 = d3.bisectRight(range, selection[1]);
                console.log(i0 + 1991, i1+1991)
                selectedTimeRangeHeatMap = [i0 + 1991, i1+1991];
                myBarVis.wrangleData();
                changeTitle();
            } else {
                // not sure what this line does lol
                vis.svg.property("value", []).dispatch("input");
            }
        }

        function changeTitle(){
            vis.svg.selectAll('.heatmap-title')
                .text("HeatMap of Fire Causes and Year - Selected: " + selectedTimeRangeHeatMap[0] + " to " + selectedTimeRangeHeatMap[1] )
        }

        //Append a defs (for definition) element to your SVG
        let defs = vis.svg.append("defs");

        //Append a linearGradient element to the defs and give it a unique id
        let linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        //Set the color for the start (0%)
        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white"); //light blue

        linearGradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "#C22E0F"); //light blue

        //Set the color for the end (100%)
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#8d0000"); //dark blue

        //Draw the rectangle and fill with gradient
        vis.svg.append("rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient)")
            .attr('transform', `translate (${vis.width+20}, ${vis.height-150}) rotate(-90)`);

        vis.yLegend = d3.scaleLinear()
            .range([vis.height/2, vis.height/2+200]);

        vis.yAxis = d3.axisRight()
            .scale(vis.yLegend)
            .ticks(5);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");


        this.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.data.forEach(function(d){
            d.value = +d.value;
        });

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.svg.selectAll('.heatmap-title')
            .text("HeatMap of Fire Causes and Year - Selected: 1992 to 2015"  )

        vis.x.domain(vis.data.map(d=> d.year));
        vis.y.domain(vis.data.map(d=> d.cause));
        vis.yLegend.domain([d3.max(vis.data, d => d.value), 0]);

        let rect = vis.svg.selectAll(".square")
            .data(vis.data, function(d) {return d.year+':'+d.cause;})

        rect.enter().append("rect")
            .attr("class", "square")
            .merge(rect)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .transition()
            .duration(1000)
            .attr("x", d => vis.x(d.year))
            .attr("y", d => vis.y(d.cause))
            .attr("height", vis.y.bandwidth())
            .attr("width", vis.x.bandwidth())
            .style("fill", function(d) { return vis.myColor(d.value)} )
            .style("stroke", "#C22E0F")

        rect.exit().remove();

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
                         <h3>${d.cause}<h3>
                         <h4>Counts: ${d.value}</h4>
                     </div>`);
        }

        function mouseout(event, d) {
            d3.select(this)
                .attr('stroke-width', '0px')
                .attr("fill", "black");

            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        };

        vis.svg.append("g")
            .style("font-size", 14)
            .style("font-family", "Charter")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.x).tickSize(0))
            .select(".domain").remove()

        vis.svg.append("g")
            .style("font-size", 15)
            .style("font-family", "Charter")
            .call(d3.axisLeft(vis.y).tickSize(0))
            .select(".domain").remove()

        vis.svg.append("g")
            .attr("class", "x brush")
            .call(vis.brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", vis.height + 7);


        vis.svg.select(".y-axis")
            .attr("transform", `translate (${vis.width+40}, -176)`)
            .transition()
            .duration(1000)
            .call(vis.yAxis);

        //
        // vis.svg.select(".x-axis")
        //     .attr("transform", "translate(0," + vis.height + ")")
        //     .transition()
        //     .duration(1000)
        //     .call(vis.xAxis);
        //
        // vis.svg.select(".y-axis")
        //     .transition()
        //     .duration(1000)
        //     .call(vis.yAxis);


    }




}
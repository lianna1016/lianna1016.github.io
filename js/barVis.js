/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVis {

    constructor(parentElement, Data){

        this.parentElement = parentElement;
        this.data = Data;
        this.displayData = [];
        this.total = 0;
        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 100, bottom: 60, left: 100};

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
            .attr('class', 'title bar-title')
            .text('Title for Barchart')
            .attr('transform', `translate(${vis.width / 2.2}, 0)`)
            .attr('text-anchor', 'middle');

        vis.svg.append('text')
            .attr('class', 'total')
            .text('Title for total')
            .attr('transform', `translate(${vis.width/ 2.2}, 20)`)
            .attr('text-anchor', 'middle');

        // Scales
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // axis
        vis.xAxis = d3.axisBottom()
            .scale(vis.x)

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")


        vis.box = vis.svg.append("rect")
            .attr("width", 170)
            .attr("height", 40)
            .style("fill", "darkred")
            .attr('transform', `translate (${3*vis.width/4-5}, ${-15})`)


        vis.svg.append('g')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 20)
            .style("font-size", 16)
            .style('font-weight', 'bold')
            .attr("dy", "-1em")
            .style("fill", "white")
            .text('Click to See Some of')
            .on("click", function(event, d){
                console.log('hi')
                d3.selectAll('.takeaways')
                    .attr('opacity', 1)
            })

        vis.svg.append('g')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 20)
            .style("font-size", 16)
            .style('font-weight', 'bold')
            .style("fill", "white")
            .text('our Main Takeaways')
            .on("click", function(event, d){
                console.log('hi')
                d3.selectAll('.takeaways')
                    .attr('opacity', 1)
            })

        vis.svg.append('g')
            .attr('class', 'takeaways')
            .attr('opacity', '0')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 22)
            .style("font-size", 15)
            .attr("dy", "1.5em")
            .text("1. Debris burning, Arson, and Lightning  ")


        vis.svg.append('g')
            .attr('class', 'takeaways')
            .attr('opacity', '0')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 22)
            .style("font-size", 15)
            .attr("dy", "2.5em")
            .text("are consistently the top 3 fire starters.")

        vis.svg.append('g')
            .attr('class', 'takeaways')
            .attr('opacity', '0')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 22)
            .style("font-size", 15)
            .attr("dy", "4em")
            .text("2. There is an overall positive trend in the ")

        vis.svg.append('g')
            .attr('class', 'takeaways')
            .attr('opacity', '0')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 22)
            .style("font-size", 15)
            .attr("dy", "5em")
            .text("total number of fires over time.")

        vis.svg.append('g')
            .attr('class', 'takeaways')
            .attr('opacity', '0')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 22)
            .style("font-size", 15)
            .attr("dy", "6.5em")
            .text("3. Many of these fires are man-made, and ")

        vis.svg.append('g')
            .attr('class', 'takeaways')
            .attr('opacity', '0')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 22)
            .style("font-size", 15)
            .attr("dy", "7.5em")
            .text("steps can be taken in order to prevent ")

        vis.svg.append('g')
            .attr('class', 'takeaways')
            .attr('opacity', '0')
            .append("text")
            .attr('x', 3*vis.width/4)
            .attr('y', 22)
            .style("font-size", 15)
            .attr("dy", "8.5em")
            .text("them in the future. ")


        this.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.data.forEach(function(d){
            d.year = +d.year;
            d.count = +d.count;
        });
        // console.log(vis.data)

        let start = selectedTimeRangeHeatMap[0];
        let end = selectedTimeRangeHeatMap[1];
        vis.helperData = vis.data.filter(function(d) {
            // date is between start and end
            return end >= d.year && start <= d.year ;
        });

        vis.displayData = [];
        vis.helperData.reduce(function(res, value) {
            if (!res[value.cause]) {
                res[value.cause] = { cause: value.cause, counts: 0 };
                vis.displayData.push(res[value.cause])
            }
            res[value.cause].counts += value.count;
            return res;
        }, {});

        vis.total = 0;
        vis.displayData.forEach(function(d){
            vis.total += d.counts
        });
        // console.log(vis.total);

        vis.displayData.sort( (a, b) => {
            return b.counts - a.counts;
        });

        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.svg.selectAll('.total')
            .text("Total Number of Fires: " + vis.total)

        vis.svg.selectAll('.bar-title')
            .text("Causes of Fires in United States - " + selectedTimeRangeHeatMap[0] + " to " + selectedTimeRangeHeatMap[1])

        vis.x.domain(vis.displayData.map(d=> d.cause));
        vis.y.domain([0, d3.max(vis.displayData, d => d.counts)])

        let rect = vis.svg.selectAll(".bar")
            .data(vis.displayData)

        rect.enter().append("rect")
            .attr("class", "bar")
            .merge(rect)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .transition()
            .duration(1000)
            .attr("x", d => vis.x(d.cause))
            .attr("y", d => vis.y(d.counts))
            .attr("height", d => vis.height - vis.y(d.counts))
            .attr("width", vis.x.bandwidth())
            .attr("fill", "#C22E0F")

        rect.exit().remove();


        let label = vis.svg.selectAll(".label")
            .data(vis.displayData);

        label.enter()
            .append("text")
            .attr("class", "label")
            .merge(label)
            .transition()
            .duration(1000)
            .attr("y", d => vis.y(d.counts))
            .attr("x", d => vis.x(d.cause) + 6)
            .text(d => d.counts)

        label.exit().remove;

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
                         <h5>${d.cause}<h5>
                         <h6>Counts: ${d.counts}</h6>
                     </div>`);
        }

        function mouseout(event, d) {
            d3.select(this)
                .attr('stroke-width', '0px')
                .attr("fill", "#C22E0F");

            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        };


        vis.svg.select(".x-axis")
            .transition()
            .duration(500)
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis)
            .selectAll("text")
            .attr("font-size", 18)
            .attr("transform", "translate (0,6) rotate(-17)");

        vis.svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(vis.yAxis);




    }
}
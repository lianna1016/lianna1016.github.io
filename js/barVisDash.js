/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVisDash {

    constructor(parentElement, type, fireData, fireDataDisplay){

        this.parentElement = parentElement;
        this.fires = fireData;
        this.displayData = fireDataDisplay; //deep copy of fireData (not pass by reference)
        this.graphDataSelector = type;
        this.titles = ['Total Acres Burned', 'Total Wildfires (\'Larger than 5k\')']
        this.title = this.titles[1]
        if (type === 'acresBurned'){
            this.title = this.titles[0]
        }
        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");
        this.parseYear = d3.timeParse("%Y")
        this.man = [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19]
        this.natural = [1, 17]
        this.other = [0, 9, 14]
        this.all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ,16, 17, 18, 19]
        this.bar_color ='darkred'
        this.drought_bar_color = '#fee6ce'
        this.drought_years = [1986,1987,1988,1989,1990,1991,1992, 2007, 2008, 2009, 2011, 2012, 2013, 2014, 2015, 2016]   //drought years 1986-1992, 2007-2009, 2011-2016
        this.initVis()
    }

    initVis(){
        let vis = this


        vis.margin = {top: 30, right: 20, bottom:30, left: 60};
        vis.width = ($("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right);
        vis.height = ($("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom);

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        // vis.svg.append('g')
        //     // .attr('class', 'title bar-title')
        //     .append('text')
        //     .text(vis.title)
        //     .attr('transform', `translate(${vis.width/2}, 5)`)
        //     .attr('text-anchor', 'middle')
        //     .style('fill', 'black')
        vis.svg.append('text')
            .text(vis.title)
            .attr('x', vis.width/2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('fill', 'black')
        // Scales and axes
        // vis.x = d3.scaleBand()
        //     .range([0, vis.width])
        //     .padding(0.1);
        //
        // vis.y = d3.scaleLinear()
        //     .range([vis.height, 0]);

        // Scales
        // vis.x = d3.scaleLinear()
        //     .range([0, vis.width])

        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // INITIALIZING AXES
        // creating x-axis
        vis.xAxis = d3.axisBottom()
            .scale(vis.x)

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(10," + vis.height + ")")
            .style("font-size",7);

        // creating y-axis
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "axis y-axis")
        // .attr("transform", "translate(30,0)");

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')
        // // TO-DO (Activity IV): Add Tooltip placeholder
        // vis.text = vis.svg.append("text")

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        //code from dataTable here!


        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];

        // console.log(vis.fires.objects.fires_great_5k.geometries)
        // if there is a region selected
        if (selectedTimeRange.length !== 0){

            // iterate over all rows the csv (dataFill)
            vis.fires.objects.fires_great_5k.geometries.forEach( row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0] <= vis.parseYear(row.properties.year) && vis.parseYear(row.properties.year) <= selectedTimeRange[1]){
                    if (selectedCategory === 'all' | vis[selectedCategory].includes(row.properties.cause)){
                        filteredData.push(row);
                    }
                }
            });
            filteredData.sort(function(x, y){
                return d3.ascending(x.properties.year, y.properties.year);
            })
        } else {
            // iterate over all rows the csv (dataFill)
            vis.fires.objects.fires_great_5k.geometries.forEach( row => {
                // and push rows with proper dates into filteredData
                //our temperature data starts from 1986 whereas the fires data goes all the way back to 1878
                if (vis.parseYear(1986) <= vis.parseYear(row.properties.year) && vis.parseYear(row.properties.year) <= vis.parseYear(2016)){
                    if (selectedCategory === 'all' | vis[selectedCategory].includes(row.properties.cause)){
                        filteredData.push(row);
                    }
                }
            });
            filteredData.sort(function(x, y){
                return d3.ascending(x.properties.year, y.properties.year);
            })
        }

        // prepare covid data by grouping all rows by state
        let fireDataByYear = Array.from(d3.group(filteredData, d =>d.properties.year), ([key, value]) => ({key, value}))


        // init final data structure in which both data sets will be merged into
        vis.yearInfo = []

        // merge
        fireDataByYear.forEach( year => {

            // get full state name
            // let stateName = nameConverter.getFullName(state.key)
            let yearName = year.key.toString();

            // init counters
            let acresBurnedSum = 0;
            let total_fires = 0;
            let causesSum = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0,
                10: 0,
                11: 0,
                12: 0,
                13: 0,
                14: 0,
                15: 0,
                16: 0,
                17: 0,
                18: 0,
                19: 0
            }

            // // look up population for the state in the census data set
            // vis.usaData.forEach( row => {
            //     if(row.state === stateName){
            //         population += +row["2019"].replaceAll(',', '');
            //     }
            // })

            // calculate new cases by summing up all the entries for each state
            year.value.forEach( entry => {
                acresBurnedSum += +entry.properties['acres'];
                let causeNum = entry.properties['cause']
                causesSum[causeNum] +=1;
                total_fires+=1
            });

            // populate the final data structure
            vis.yearInfo.push(
                {
                    year: yearName,
                    acresBurned: acresBurnedSum,
                    total_fires: total_fires,
                    c1: causesSum[1],
                    c2: causesSum[2],
                    c3: causesSum[3],
                    c4: causesSum[4],
                    c5: causesSum[5],
                    c6: causesSum[6],
                    c7: causesSum[7],
                    c8: causesSum[8],
                    c9: causesSum[9],
                    c10: causesSum[10],
                    c11: causesSum[11],
                    c12: causesSum[12],
                    c13: causesSum[13],
                    c14: causesSum[14],
                    c15: causesSum[15],
                    c16: causesSum[16],
                    c17: causesSum[17],
                    c18: causesSum[18],
                    c19: causesSum[19],

                }
            )
        })



        let min = d3.min(vis.yearInfo.map(fire => fire[vis.graphDataSelector]))
        let max = d3.max(vis.yearInfo.map(fire => fire[vis.graphDataSelector]))


        // console.log('final data structure', vis.displayData);

        //vis.topTenData = vis.displayData.slice(0, 10)

        vis.topTenData = vis.yearInfo;
        vis.y.domain([min,max]) //counts
        vis.x.domain(vis.topTenData.map(d => d.year)) //year

        // console.log('final data structure', vis.topTenData);



        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        // (1) Update domains
        // let temp = Array.from(d3.rollup(vis.data, leaves => leaves.length, d => d[vis.config]), ([key, value]) => ({
        //     key,
        //     value
        // }))


        // console.log(vis.topTenData[0][selectedCategory])


        // (2) Draw rectangles
        //console.log(vis.data)

        //draw bars
        let bars = vis.svg.selectAll("rect")
            .data(vis.topTenData)
        // console.log('sanity')
        // console.log(vis.topTenData)
        vis.percent_formatter= d3.format(".2n")


        let acre_format = d3.format(",.2f")

        bars.enter().append("rect")
            .attr('class', 'bar')
            .on('mouseover', function (event, d) {
                // console.log(d.year.replace(/\s+/g, '-') + '-bar')
                // myMapVis.svg.select("#"+d.state.replace(/\s+/g, '-'))
                //     .attr('stroke-width', '2px')
                //     .attr('stroke', 'black')
                //     .style('fill', 'red')
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .style('fill', 'yellow')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                            <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                                 <h5>${JSON.stringify(d.year).replace(/\"/g, "")}</h5>
                              <div class="tiptext">Total Acres Burned: ${acre_format(d.acresBurned)}</div>
                             </div>`);
                myMapVis.svg.selectAll('.map-'+ d.year)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .style('fill', 'red')
            })
            .on('mouseout', function (event, d) {

                d3.select(this)
                    .attr('stroke-width', '0px')
                    .style('fill', function (d, index) {
                        // this.bar_color ='darkred'
                        // this.drought_bar_color = '#fee6ce'
                        // this.drought_years = [1986,1987,1988,1989,1990,1991,1992, 2007, 2008, 2009, 2011, 2012, 2013, 2014, 2015, 2016]   //drought years 1986-1992, 2007-2009, 2011-2016
                        // return vis.graph_color
                        if (vis.drought_years.includes(parseInt(d.year))){
                            return vis.drought_bar_color
                        }else{
                            return vis.bar_color
                        }
                    })
                myMapVis.svg.selectAll('.map-'+ d.year)
                    .attr('stroke-width', '0.8px')
                    .style('fill', function (d, index) {
                        if (vis.man.includes(d.properties.cause)) {
                            return "firebrick";
                        } else if (vis.natural.includes(d.properties.cause)){
                            return "orange";
                        } else if (vis.other.includes(d.properties.cause)){
                            //console.log('bye')
                            return "yellow";
                        }
                    })
                    .attr('stroke', 'black')

                // myMapVis.svg.select("#"+d.state.replace(/\s+/g, '-'))
                //     .attr('stroke-width', '0px')
                //     .style("fill", function (d, index) {
                //         if (selectedCategory == 'absCases' || selectedCategory == 'absDeaths'){
                //             return 'darkred'
                //         }
                //         else{
                //             return universalColorScale(vis.stateInfoDict[d.properties.name][selectedCategory])
                //         }})
                // d3.select(this)
                //     .attr('stroke-width', '0px')
                //     .style('fill', function (d, index) {
                //         if (vis.stateList.includes(d.state)){
                //             if (selectedCategory == 'absCases' || selectedCategory == 'absDeaths'){
                //                 return 'darkred'
                //             }
                //             else{
                //                 return universalColorScale(vis.stateInfoDict[d.state][selectedCategory])
                //             }
                //         }
                //         else{
                //             return 'black' //no data available for territories like American Samoa
                //         }
                //     })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .merge(bars)
            .transition()
            .duration(500)
            .attr('class', d => 'bar-'+d.year)
            .attr("x", d => vis.x(d.year)+10)
            .attr("width", vis.x.bandwidth())
            .attr("height", (d,i) => vis.height - vis.y(d[vis.graphDataSelector]))
            .attr("y", (d, i) => vis.y(vis.topTenData[i][vis.graphDataSelector]))
            .style('fill', function (d, index) {
                if (vis.drought_years.includes(parseInt(d.year))){
                    return vis.drought_bar_color
                }else{
                    return vis.bar_color
                }
            })

        bars.exit().remove();


        // Update the x-axis
        vis.svg.select(".x-axis")
            .transition()
            .duration(750)
            .call(vis.xAxis)
            .selectAll("text")
            .attr("font-size", 9)
            .attr("y", 10)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "center");

        // Update the y-axis
        vis.svg.select(".y-axis")
            .transition()
            .duration(750)
            .call(vis.yAxis);

    }



}
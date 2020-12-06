/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

class MapVis {

    constructor(parentElement,fireData, fireDataDisplay) {
        this.parentElement = parentElement;
        this.fires = fireData;
        this.displayData = fireDataDisplay;

        this.commaFormatter = d3.format(",.2f")
        this.parseYear = d3.timeParse("%Y")
        this.man = [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19]
        this.natural = [1, 17]
        this.other = [0, 9, 14]
        this.all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ,16, 17, 18, 19]
        this.bar_color ='#e7c8aa'
        this.drought_bar_color = 'darkred'
        this.drought_years = [1986,1987,1988,1989,1990,1991,1992, 2007, 2008, 2009, 2011, 2012, 2013, 2014, 2015, 2016]   //drought years 1986-1992, 2007-2009, 2011-2016

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
    }

    initVis() {
        let vis = this;
        d3.select('#mapvis').remove()

        vis.margin = {top: 0, right: 0, bottom: 0, left: 0};
        vis.padding = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr('id', 'mapvis')
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.maptitle = vis.svg.append('g')
            .attr('class', 'title map-title')
            .attr('id', 'map-title')

        vis.projection = d3.geoAlbersUsa() // d3.geoStereographic()
            .translate([vis.width, vis.height])
            // .translate([((vis.width- vis.padding.left - vis.padding.right) / 2)+20, ((vis.height- vis.padding.top - vis.padding.bottom) / 2)+200])
            .scale(800)

        vis.path = d3.geoPath()
            .projection(scale(zoom)) //Use this to resize by a scale factor e.g. 2x, 0.5x, etc.

        //custom function to resize the already pre-projected California polygon data
        function scale (scaleFactor) {
            return d3.geoTransform({
                point: function(x, y) {
                    this.stream.point(x * scaleFactor, y  * scaleFactor);
                }
            });
        }

        //Symbol Map Logic
        vis.colorScale = d3.scaleLinear()
            .range(["white", "DarkCyan"]);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'usaTooltip')

        vis.percent_formatter = d3.format(".3n")

        vis.radius = d3.scaleSqrt()
            .range([5, 20]);

        // vis.svg.append("path")
        //     .datum(topojson.feature(vis.geoData, vis.geoData.objects.states).features)
        //     .attr("class", "land")
        //     .attr("d", vis.path);

        vis.svg.append("path")
            .datum(topojson.feature(vis.displayData, vis.displayData.objects.counties))
            // .datum(topojson.feature(vis.geoData, vis.geoData.objects.nation))
            .attr("class", "land")
            .attr("d", vis.path)

        // vis.svg.append("path")
        //     .datum(topojson.mesh(vis.geoData, vis.geoData.objects.states, function (a, b) {
        //         return a !== b;
        //     }))
        //     .attr("class", "border border--state")
        //     .style("stroke", "#fff")
        //     .attr("d", vis.path);

        //reset button for brush vis
        vis.svg.append('g')
            .append("text")
            .attr('x', vis.width + 20)
            .attr('y', vis.height - 4 )
            .text('Reset Brush')
            .style("fill", "white")
            .style("font-size", 15)
            .on("click", function(event, d){
                selectedTimeRangeHeatMap = [1986, 2016]
                vis.wrangleData();
                // changeTitle();
                d3.selectAll(".brush").call(vis.brush.move, null)
            })

        vis.wrangleData()

    }

    wrangleData(){
        let vis = this

        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];

        // console.log( vis.fires.objects.fires_great_5k.geometries)

        console.log('selected time range')
        console.log(selectedTimeRange)


        // if there is a region selected
        if (selectedTimeRange.length !== 0) {
            // iterate over all rows the csv (dataFill)
            vis.fires.objects.fires_great_5k.geometries.forEach(row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0]<= vis.parseYear(row.properties.year)&& vis.parseYear(row.properties.year) <= selectedTimeRange[1]) {
                    if (selectedCategory === 'all' | vis[selectedCategory].includes(row.properties.cause)){
                        filteredData.push(row);
                    }

                }
            });

            filteredData.sort(function(x, y){
                return d3.ascending(x.properties.year, y.properties.year);
            })

            vis.displayData.objects.fires_great_5k.geometries = filteredData
        } else {
            // iterate over all rows the csv (dataFill)
            vis.fires.objects.fires_great_5k.geometries.forEach(row => {
                // and push rows with proper dates into filteredData
                if (vis.parseYear(1986) <= vis.parseYear(row.properties.year) && vis.parseYear(row.properties.year) <= vis.parseYear(2016)){
                    try{
                        if (selectedCategory === 'all' |(vis[selectedCategory].includes(row.properties.cause))){
                            filteredData.push(row);
                        }
                    }catch(err){
                        console.log('select category filter failed on bar vis, likely missing year')
                        // console.log('select category cause group value')
                        // console.log(vis[selectedCategory])
                        // console.log('row value')
                        // console.log(row)
                    }


                }
            });

            filteredData.sort(function(x, y){
                return d3.ascending(x.properties.year, y.properties.year);
            })

            vis.displayData.objects.fires_great_5k.geometries = filteredData
        }

        // init final data structure in which both data sets will be merged into
        vis.fireDict = []
        vis.fireList = []
        vis.fireNameList = []


        // merge
        topojson.feature(vis.displayData, vis.displayData.objects.fires_great_5k).features.forEach(fire => {
            // get full state name
            let fireName = nameConverter.getFullName(fire.properties.name)

            // populate the final data structure
            vis.fireDict[fireName] = fire.properties.acres

            vis.fireList.push(
                {
                    name: fireName,
                    acres: fire.properties.acres
                }
            )
            vis.fireNameList.push(fireName)
        })



        let min = d3.min(vis.fireList.map(fire => fire['acres']))
        let max = d3.max(vis.fireList.map(fire => fire['acres']))

        vis.svg.selectAll(".legend").remove();

        vis.colorScale.domain([min, max])
        vis.radius.domain([min,max])

        universalColorScale = vis.colorScale
        vis.svg.selectAll(".legendSize").remove();


        // vis.radius.domain(d3.min(vis.stateInfo.map(state => state[selectedCategory])), d3.max(vis.stateInfo.map(state => state[selectedCategory])))

        vis.svg.append("g")
            .attr("class", "legendSize")
            .attr("transform", "translate(" + ((vis.width/2)+120) + "," + (50) + ")")
            .style('fill', 'beige')
        let comma_format = d3.format(",.0f")

        //Custom legend taken from following resource
        //https://d3-legend.susielu.com/#color-doc
        vis.legendSize = d3.legendSize()
            .scale(vis.radius)
            .shape('circle')
            .shapePadding(1)
            .labelOffset(10)
            .labelFormat(comma_format)
            .title("Acres Burned")
            .orient('vertical');

        vis.svg.select(".legendSize")
            .call(vis.legendSize);


        vis.svg.selectAll(".bubble").remove(); //remove bubbles if previously created
        // vis.svg.selectAll("#map-title").remove();


        // scale for cause of fire
        let ordinal = d3.scaleOrdinal()
            .domain(["Man-Made", "Natural", "Other"])
            .range([ "firebrick", "orange", "yellow"]);


        vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(" + ((vis.width/2)) + "," + (50) + ")")

        let legendOrdinal = d3.legendColor()
            //d3 symbol creates a path-string, for example
            //"M0,-8.059274488676564L9.306048591020996,
            //8.059274488676564 -9.306048591020996,8.059274488676564Z"
            .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
            .shapePadding(10)
            .title("Cause of Fire")
            //use cellFilter to hide the "e" cell
            //.cellFilter(function(d){ return d.label !== "e" })
            .scale(ordinal);

        vis.svg.select(".legendOrdinal")
            .call(legendOrdinal);

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        vis.svg.selectAll('text').style('fill', 'black')

        vis.title = 'California Historic Wildfires'

        d3.select('#mapSelection').remove()
        vis.maptitle.append('text')
            .text(vis.title)
            .attr('id', 'mapSelection')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');


        // console.log(vis.fires.objects.fires_great_5k)

        //draw circles for absolutes
        vis.mapSymbols = vis.svg.append("g")
            .attr("class", "bubble")
            .selectAll("circle")
            .data(topojson.feature(vis.displayData, vis.displayData.objects.fires_great_5k).features);

        let acre_format = d3.format(",.2f")
        vis.mapSymbols.enter().append("circle")
            .attr('class', function (d) { return 'bubble map-'+d.properties.year})
            .on('mouseover', function (event, d) {
                console.log('map-'+d.properties.year)
                // console.log(d3.select("#" + d.properties.name.replace(/\s+/g, '-') + '-bar'))
                // console.log(d.properties.name.replace(/\s+/g, '-'))
                // d3.select("#" + d.properties.name.replace(/\s+/g, '-') + '-bar')
                //     .attr('stroke-width', '2px')
                //     .attr('stroke', 'black')
                //     .style('fill', 'red')
                //     .attr('stroke', 'black')
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .style('fill', 'red')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h5>Fire Name: ${JSON.stringify(d.properties.name).replace(/\"/g, "")}</h5>
                              <div class="tiptext">Acres: ${acre_format(d.properties.acres)}</div>
                              <div class="tiptext">Year: ${JSON.stringify(d.properties.year)}</div>
                              <div class="tiptext">Cause: ${causes[d.properties.cause]}</div>
                              <div class="tiptext">Alarm Date: ${d.properties.alarm_date}</div>
                         </div>`);
                //select corresponding bars
                d3.selectAll('.bar-'+d.properties.year)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .style('fill', 'yellow')
            })
            .on('mouseout', function (event, d) {
                //deselect corresponding bars
                d3.selectAll('.bar-'+d.properties.year)
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
                //return map bubble state
                d3.select(this)
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
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .attr("transform", function (d) {
                if (vis.path.centroid(d)[0]) {
                    return "translate(" + vis.path.centroid(d) + ")";
                } else {
                    //NAN cases
                    return "translate(" + [400.3925246978879, 355.45729497829905] + ")" //pick random state and set radius to 0 in next step;
                }

            })
            .merge(vis.mapSymbols)
            .transition()
            .duration(500)
            .attr("r", function (d, index) {
                return vis.radius(d.properties.acres)
            })
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
        //'darkred')
            .style("opacity", 0.8)
            .attr('stroke', 'black')


        // vis.mapSymbols.exit().remove();
    }


}
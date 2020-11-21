/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

class MapVis {

    constructor(parentElement,fireData, fireDataDisplay) {
        this.parentElement = parentElement;
        // this.geoData = geoData;
        // this.covidData = covidData;
        // this.usaData = usaData;
        // this.stateCentroids = stateCentroids;
        this.commaFormatter = d3.format(",.2f")
        this.fires = fireData;
        this.displayData = fireDataDisplay;
        this.parseYear = d3.timeParse("%Y")
        this.man = [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19]
        this.natural = [1, 17]
        this.other = [0, 9, 14]
        this.all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ,16, 17, 18, 19]


        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");


        this.initVis()
    }

    initVis() {
        let vis = this;
        d3.select('#mapvis').remove()


        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr('id', 'mapvis')
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top + 10})`);

        // add title
        vis.maptitle = vis.svg.append('g')
            .attr('class', 'title map-title')
            .attr('id', 'map-title')

        vis.projection = d3.geoAlbersUsa() // d3.geoStereographic()
            .translate([vis.width / 2, vis.height / 2])
            .scale(800)

        vis.path = d3.geoPath()
            .projection(scale(0.45)) //Use this to resize by a scale factor e.g. 2x, 0.5x, etc.

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
            .range([5, 25]);

        // vis.svg.append("path")
        //     .datum(topojson.feature(vis.geoData, vis.geoData.objects.states).features)
        //     .attr("class", "land")
        //     .attr("d", vis.path);

        vis.svg.append("path")
            .datum(topojson.feature(vis.displayData, vis.displayData.objects.counties))
            // .datum(topojson.feature(vis.geoData, vis.geoData.objects.nation))
            .attr("class", "land")
            .attr("d", vis.path)
            .attr('fill', 'beige')

        // vis.svg.append("path")
        //     .datum(topojson.mesh(vis.geoData, vis.geoData.objects.states, function (a, b) {
        //         return a !== b;
        //     }))
        //     .attr("class", "border border--state")
        //     .style("stroke", "#fff")
        //     .attr("d", vis.path);

        vis.wrangleData()

    }

    wrangleData(){
        let vis = this

        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];

        console.log( vis.fires.objects.fires_great_5k.geometries)


        // if there is a region selected
        if (selectedTimeRange.length !== 0) {
            // iterate over all rows the csv (dataFill)
            vis.fires.objects.fires_great_5k.geometries.forEach(row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0]<= vis.parseYear(row.properties.year)&& vis.parseYear(row.properties.year) <= selectedTimeRange[1]) {
                    if (selectedCategory === 'all' | row.properties.cause in vis[selectedCategory]){
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
                    if (selectedCategory === 'all' | vis[selectedCategory].includes(row.properties.cause)){
                        filteredData.push(row);
                    }

                }
            });

            filteredData.sort(function(x, y){
                return d3.ascending(x.properties.year, y.properties.year);
            })

            vis.displayData.objects.fires_great_5k.geometries = filteredData
        }



        // prepare covid data by grouping all rows by state
        // let covidDataByState = Array.from(d3.group(filteredData, d => d.state), ([key, value]) => ({key, value}))

        // have a look
        // console.log(covidDataByState)
        // console.log(vis.fires.objects.fires_great_5k.geometries)
        // let test = {fires_great_5k: filteredData}
        // console.log(topojson.feature(vis.fires, vis.fires.objects.fires_great_5k))

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
            .attr("transform", "translate(" + ((vis.width)-130) + "," + (80) + ")")
            //  .style('fill', 'grey')
        let comma_format = d3.format(",.0f")

        //Custom legend taken from following resource
        //https://d3-legend.susielu.com/#color-doc
        vis.legendSize = d3.legendSize()
            .scale(vis.radius)
            .shape('circle')
            .shapePadding(5)
            .labelOffset(20)
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
            .attr("transform", "translate(" + ((vis.width)-120) + "," + ((vis.height)-150) + ")")

        let legendOrdinal = d3.legendColor()
            //d3 symbol creates a path-string, for example
            //"M0,-8.059274488676564L9.306048591020996,
            //8.059274488676564 -9.306048591020996,8.059274488676564Z"
            .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
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

        vis.mapSymbols.enter().append("circle")
            .attr('id', d => d.properties.name.replace(/\s+/g, '-'))
            .on('mouseover', function (event, d) {
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
                              <div class="tiptext">Fire Name: ${JSON.stringify(d.properties.name)}</div>
                              <div class="tiptext">Acres: ${JSON.stringify(d.properties.acres)}</div>
                              <div class="tiptext">Year: ${JSON.stringify(d.properties.year)}</div>
                              <div class="tiptext">Cause: ${JSON.stringify(d.properties.cause)}</div>
                              <div class="tiptext">Alarm Date: ${JSON.stringify(d.properties.alarm_date)}</div>
                         </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select("#" + d.properties.name.replace(/\s+/g, '-') + '-bar')
                    .attr('stroke-width', '0px')
                    .style('fill', function (d, index) {
                        return 'darkred'
                    })
                d3.select(this)
                    .attr('stroke-width', '0px')
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
            .attr('stroke', 'red');

        vis.mapSymbols.exit().remove();
    }


}
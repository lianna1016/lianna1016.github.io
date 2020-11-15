

/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let myBarVis,
    myHeatMapVis;

let selectedTimeRange = [1992, 2015];


// load data using promises
let promises = [
    // d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),  // not projected -> you need to do it
    //d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"), // already projected -> you can just scale it to ft your browser window
    d3.csv("data/causes_by_year.csv"),
    d3.csv("data/crosstab.csv"),
    d3.csv("data/cause_counts.csv")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );


// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);

    // init bar graph above heat map
    myBarVis = new BarVis('cause-bar', dataArray[0]);

    // init heat map
    myHeatMapVis = new HeatMapVis('heat-map', dataArray[1])

}

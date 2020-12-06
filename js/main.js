

/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// Dash suffix refers to dashboard

// init global variables & switches
let myMapVis,
    myBarVis,
    myBarVisOne,
    myBarVisTwo,
    myBrushVis,
    myHeatMapVis,
    mySets,
    myLineGraphVis,
    selectedCategory,
    loadedDataArray,
    universalColorScale;

let selectedTimeRangeHeatMap = [1992, 2015];
let selectedTimeRange = [];
let selectedYear= '';
let zoom=0.45;
let dataInitLoad;


// load data using promises
let promises = [
    d3.csv("data/causes_by_year.csv"),
    d3.csv("data/crosstab.csv"),
    d3.csv("data/cause_counts.csv"),
    d3.csv('data/demographics_agg.csv', function(d) {
        return {
            best_worst_labels: d.best_worst_labels,
            gender_labels: d.gender_labels,
            race_labels: d.race_labels,
            POP: +d.POP
        }
    }),
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.csv("data/census_usa.csv"),
    d3.json("data/us-state-centroids.json"),
    d3.json("data/caFire.json"),
    d3.csv("data/annual_temps.csv")
];

Promise.all(promises)
    .then( function(data){
        initMainPage(data) ;
        dataInitLoad=data;
    })
    .catch( function (err){ console.log(err)} );


// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);

    selectedCategory = $('#categorySelector').val();
    console.log(selectedCategory)

    // init map fires dashboard
    let copiedFireData = JSON.parse(JSON.stringify(dataArray[7])); //avoiding pass by reference for map display data filtering
    myMapVis = new MapVis('mapDiv', dataArray[7], copiedFireData);
    //myMapVis = new MapVis('mapDiv', dataArray[4], dataArray[5], dataArray[7]);

    // init dashboard bars
    myBarVisOne = new BarVisDash('barchart', 'acresBurned', dataArray[7], copiedFireData) //acres Burned
    myBarVisTwo = new BarVisDash('barchart2', 'total_fires', dataArray[7], copiedFireData) //total fires above 5k

    // init brush
    myBrushVis = new BrushVis('brushDiv', dataArray[8]);
    // myLineGraphVis = new LineGraph('temps-line', dataArray[5])

    // init table
    myDataTable = new DataTable('tableDiv', dataArray[7]);

    // init bar graph above heat map
    myBarVis = new BarVis('cause-bar', dataArray[0]);

    // init heat map
    myHeatMapVis = new HeatMapVis('heat-map', dataArray[1])

    // init parallel sets diagram
    mySets = new Sets('sankey', dataArray[3]);

    //myLineGraphVis = new LineGraph('temps-line', dataArray[8])
}

function clearBrush(){
    selectedTimeRange = []
    categoryChange()
    try
    {
        //statements expected to throw exception.
        myBrushVis.brushGroup.call(myBrushVis.brush.move, null);
    }
    catch(e)
    {
        console.log('brush reset called for dashboard')
    }
}

function categoryChange() {
    selectedCategory = $('#categorySelector').val();
    myMapVis.wrangleData(); // maybe you need to change this slightly depending on the name of your MapVis instance
    myDataTable.wrangleData(); // maybe you need to change this slightly depending on the name of your MapVis instance
    myBarVisOne.wrangleData()
    myBarVisTwo.wrangleData()
}

function zoomIn() {
    if (zoom>0){
        zoom+=.05
        let copiedFireData = JSON.parse(JSON.stringify(dataInitLoad[7])); //avoiding pass by reference for map display data filtering
        myMapVis = new MapVis('mapDiv', dataInitLoad[7], copiedFireData);
    }
}

function zoomOut() {
    if (zoom<1.0){
        zoom-=.05
        let copiedFireData = JSON.parse(JSON.stringify(dataInitLoad[7])); //avoiding pass by reference for map display data filtering
        myMapVis = new MapVis('mapDiv', dataInitLoad[7], copiedFireData);
    }}
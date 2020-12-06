
class DataTable {

    // constructor method to initialize Timeline object
    constructor(parentElement, fireData) {
        this.parentElement = parentElement;
        this.fires= fireData;
        this.displayData = [];
        //mapping of cause number to description
        this.causes = {
            1: 'Lightning',
            2: 'Equipment Use',
            3: 'Smoking',
            4: 'Campfire',
            5: 'Debris',
            6: 'Railroad',
            7: 'Arson',
            8: 'Playing with Fire',
            9: 'Miscellaneous',
            10: 'Vehicle',
            11: 'Power Line',
            12: 'Firefighter Training',
            13: 'Non-Firefighter Training',
            14: 'Unknown/Unidentified',
            15: 'Structure',
            16: 'Aircraft',
            17: 'Volcanic',
            18: 'Escaped Prescribed Burn',
            19: 'Illegal Alien Campfire'
        }

        this.man = [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19]
        this.natural = [1, 17]
        this.other = [9, 14]
        this.all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ,16, 17, 18, 19]




        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");
        this.parseYear = d3.timeParse("%Y")

        this.initTable()
    }

    initTable(){
        let vis = this
        vis.table = d3.select(`#${vis.parentElement}`)
            .append("table")
            .attr("class", "table table-hover")

        // append table head
        vis.thead = vis.table.append("thead")
        vis.thead.html(
            `<tr>
                <th scope="col">Year</th>
                <th scope="col">Acres Burned</th>
                <th scope="col">Total Fires</th>
                <th scope="col">Total Man Caused</th>
                <th scope="col">Total Natural Causes</th>
                <th scope="col">Total Other/Unknown</th>
                <th scope="col">Lightning</th>
                <th scope="col">Equipment Use</th>
                <th scope="col">Smoking</th>
                <th scope="col">Campfire</th>
                <th scope="col">Debris</th>
                <th scope="col">Railroad</th>
                <th scope="col">Arson</th>
                <th scope="col">Playing with Fire</th>
                <th scope="col">Miscellaneous</th>
                <th scope="col">Vehicle</th>
                <th scope="col">Power Line</th>
                <th scope="col">Firefighter Training</th>
                <th scope="col">Non-Firefighter Training</th>
                <th scope="col">Unknown/Unidentified</th>
                <th scope="col">Structure</th>
                <th scope="col">Aircraft</th>
                <th scope="col">Volcanic</th>
                <th scope="col">Escaped Prescribed Burn</th>
                <th scope="col">Illegal Alien Campfire</th>
            </tr>`
        )

        // append table body
        vis.tbody = vis.table.append("tbody")

        // wrangleData
        vis.wrangleData()
    }

    wrangleData(){
        let vis = this


        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];

        // console.log(vis.fires.objects.fires_great_5k.geometries)

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

            // this.manmade = [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19]
            // this.natural = [1, 17]
            // this.other = [9, 14]

            // populate the final data structure
            vis.yearInfo.push(
                {
                    year: yearName,
                    acresBurned: acresBurnedSum.toFixed(2),
                    total_fires: total_fires,
                    total_man_caused: causesSum[2] + causesSum[3] + causesSum[4] + causesSum[5] +causesSum[6] + causesSum[17] + causesSum[8] + causesSum[10] + causesSum[11] + causesSum[12] + causesSum[13] + causesSum[15] + causesSum[16] + causesSum[18] + causesSum[19],
                    total_natural_causes: causesSum[1] + causesSum[17],
                    total_other_causes: causesSum[9]+causesSum[14],
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

        // console.log('final data structure for myDataTable', vis.yearInfo);

        vis.updateTable()

    }

    updateTable(){
        let vis = this;

        // reset tbody
        vis.tbody.html('')
        let comma_format = d3.format(",.0f")

        // loop over all states
        vis.yearInfo.forEach(year =>{
            let row = vis.tbody.append("tr")
                row.html(
                `<td>${year.year}</td>
                <td
                >${comma_format(year.acresBurned)}</td>
                <td>${year.total_fires}</td>
                <td>${year.total_man_caused}</td>
                <td>${year.total_natural_causes}</td>
                <td>${year.total_other_causes}</td>
                <td>${year.c1}</td>
                <td>${year.c2}</td>
                <td>${year.c3}</td>
                <td>${year.c4}</td>
                <td>${year.c5}</td>
                <td>${year.c6}</td>
                <td>${year.c7}</td>
                <td>${year.c8}</td>
                <td>${year.c9}</td>
                <td>${year.c10}</td>
                <td>${year.c11}</td>
                <td>${year.c12}</td>
                <td>${year.c13}</td>
                <td>${year.c14}</td>
                <td>${year.c15}</td>
                <td>${year.c16}</td>
                <td>${year.c17}</td>
                <td>${year.c18}</td>
                <td>${year.c19}</td>`
                )
            row.on('mouseover', function(){
                console.log(' you hovered over a row - the selected year is', year.year)
                selectedYear = year.year;
                myBrushVis.wrangleDataResponsive();
            })
        })
    }
}
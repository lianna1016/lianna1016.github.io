/* * * * * * * * * * * * * *
*          Sets            *
* * * * * * * * * * * * * */

class Sets {

    constructor(parentElement, dataDemos) {
        this.parentElement = parentElement;
        this.dataDemos = dataDemos;

        this.displayData = [];

        this.initVis();
    }

    initVis() {

        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select('#' + vis.parentElement).append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // data already pre-cleaned and pre-wrangled!
        vis.displayData = vis.dataDemos;
        console.log(vis.displayData);

        vis.updateVis();
    }


    // adapted from https://observablehq.com/@d3/parallel-sets
    updateVis() {
        let vis = this;

        vis.keys = vis.displayData.columns.slice(1, -1)

        console.log(vis.keys);

        vis.color = d3.scaleOrdinal(["Most Affected"], ["#fa5f43"]).unknown("#ccc")

        let index = -1;
        let nodes = [];
        let nodeByKey = new Map;
        let indexByKey = new Map;
        let links = [];

        for (let k of vis.keys) {
            for (let d of vis.displayData) {
                let key = JSON.stringify([k, d[k]]);
                if (nodeByKey.has(key)) continue;
                let node = {name: d[k]};
                nodes.push(node);
                nodeByKey.set(key, node);
                indexByKey.set(key, ++index);
            }
        }

        for (let i = 1; i < vis.keys.length; ++i) {
            let a = vis.keys[i - 1];
            let b = vis.keys[i];
            let prefix = vis.keys.slice(0, i + 1);
            let linkByKey = new Map;
            for (let d of vis.displayData) {
                let names = prefix.map(k => d[k]);
                let key = JSON.stringify(names);
                let value = d.POP;
                let link = linkByKey.get(key);
                if (link) { link.value += value; continue; }
                link = {
                    source: indexByKey.get(JSON.stringify([a, d[a]])),
                    target: indexByKey.get(JSON.stringify([b, d[b]])),
                    names,
                    value
                };
                links.push(link);
                linkByKey.set(key, link);
            }
        }

        vis.graph = {nodes, links};

        vis.Sankey = d3.sankey()
            .nodeSort(null)
            .linkSort(null)
            .nodeWidth(4)
            .nodePadding(20)
            .extent([[0, 5], [vis.width, vis.height - 5]]);

        vis.graph = vis.Sankey({
            nodes: vis.graph.nodes.map(d => Object.assign({}, d)),
            links: vis.graph.links.map(d => Object.assign({}, d))
        });

        vis.svg.append("g")
            .selectAll("rect")
            .data(vis.graph.nodes)
            .join("rect")
            .attr("class", "nodes")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        vis.svg.append("g")
            .selectAll("rect")
            .data(vis.graph.nodes)
            .join("rect")
            .attr("x", d => d.x0 < vis.width / 2 ? d.x1 - 5: d.x0 - 5)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("width", 8)
            .attr("height", 2)
            .attr("dy", "0.35em")
            .attr("fill", "black");

        vis.svg.append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(vis.graph.links)
            .join("path")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => vis.color(d.names[0]))
            .attr("stroke-width", d => d.width)
            .attr("class", "links")
            .style("mix-blend-mode", "multiply");

        vis.svg.append("g")
            .style("font", "14px sans-serif")
            .selectAll("text")
            .data(vis.graph.nodes)
            .join("text")
            .attr("x", d => d.x0 < vis.width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < vis.width / 2 ? "start" : "end")
            .text(d => d.name)
            .style("font-family", "Charter")
            .append("tspan")
            .attr("fill-opacity", 0.9)
            .text(d => `     (${d.value.toLocaleString()})`)
            .style("font-family", "Charter")

        function mouseover(event, d){
            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`
                     <div style="border: thin solid grey; border-radius: 5px; opacity: 0.9; background: lightgrey; padding: 20px">
                         <h6>${d.names.join(" → ")}<h6>
                         <h6>${d.value.toLocaleString()}</h6>
                     </div>`);

            d3.selectAll(".links").transition()
                .duration(300)
                .style("opacity", .1);
            d3.selectAll(".links").filter(function(s) { return (d.names[0] == s.names[0]) ; }).transition()
                .duration(300)
                .style("opacity", 1);
        }

        function mouseout(event, d) {
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);

            d3.selectAll(".links").transition()
                .duration(700)
                .style("opacity", 1);
        };

        vis.chart = vis.svg.node();

    }
}
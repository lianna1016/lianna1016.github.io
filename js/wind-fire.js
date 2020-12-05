
var map, fireLayer, rasterLayer;
var canvasSupport;

require([
    "esri/map", "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/domUtils", "esri/request",
    "dojo/parser", "dojo/number", "dojo/json", "dojo/dom",
    "dijit/registry", "plugins/RasterLayer",
    "esri/layers/WebTiledLayer",
    "esri/config",
    // "esri/Map",
    // "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleFillSymbol",
    "esri/Color", "esri/renderers/ClassBreaksRenderer",  "esri/InfoTemplate", 'esri/symbols/PictureMarkerSymbol',
    "dojo/domReady!"
], function(
    Map, ArcGISTiledMapServiceLayer,
    domUtils, esriRequest,
    parser, number, JSON, dom,
    registry, RasterLayer,
    WebTiledLayer,
    esriConfig,
    // , map2,
    // MapView
    MapImageLayer,
    FeatureLayer,SimpleFillSymbol, Color, ClassBreaksRenderer, InfoTemplate, PictureMarkerSymbol
){
    const wildfireLayerUrl = "https://utility.arcgis.com/usrsvcs/servers/141efcbd82fd4c129f5b784c2bc85229/rest/services/LiveFeeds/Wildfire_Activity/MapServer";
    esriConfig.defaults.io.alwaysUseProxy = false;

    const fireflySymbols = [
        {
            "url": "https://static.arcgis.com/images/Symbols/Firefly/FireflyB17.png",
            "type":"picture-marker",
            "height": 15,
            "width": 15,
        },
        {
            "url": "https://static.arcgis.com/images/Symbols/Firefly/FireflyB17.png",
            "type":"picture-marker",
            "height": 25,
            "width": 25,
        },
        {
            "url": "https://static.arcgis.com/images/Symbols/Firefly/FireflyB17.png",
            "type":"picture-marker",
            "height": 35,
            "width": 35,
        },
        {
            "url": "https://static.arcgis.com/images/Symbols/Firefly/FireflyB17.png",
            "type":"picture-marker",
            "height": 45,
            "width": 45,
        },
        {
            "url": "https://static.arcgis.com/images/Symbols/Firefly/FireflyB17.png",
            "type":"picture-marker",
            "height": 55,
            "width": 55,
        },
    ];

    parser.parse();
    // does the browser support canvas?
    canvasSupport = supports_canvas();

    map = new Map("mapCanvas", {
        center: [-98.5, 40],
        zoom: 4,
        basemap: "dark-gray"
    });

    map.on("load", mapLoaded);

    // wind map continued
    function mapLoaded() {

        // Add raster layer for wind
        if ( canvasSupport ) {
            rasterLayer = new RasterLayer(null, {
                opacity: 0.25 //set wind opacity
            });

            map.addLayer(rasterLayer);
            map.on("extent-change", redraw);
            map.on("resize", function(){});
            map.on("zoom-start", redraw);
            map.on("pan-start", redraw);

            //request wind data
            var layersRequest = esriRequest({
                url: './data/gfs.json',
                content: {},
                handleAs: "json"
            });

            //request fire data
            var fireLayerRequest = esriRequest({
                url: wildfireLayerUrl + '/dynamicLayer/generateRenderer',
                content: {classificationDef: JSON.stringify({
                        "type":"classBreaksDef",
                        "classificationField": "AREA_", // field name for burned area
                        "classificationMethod":"esriClassifyNaturalBreaks",
                        "breakCount":5
                    }),
                    layer: JSON.stringify({
                        "source": {
                            "type":"mapLayer",
                            "mapLayerId":0
                        }
                    }),
                    f: 'json',
                    where: ''},
                responseType: "json"
            })

            //draw fire layer
            fireLayerRequest.then(function(response){
                console.log(response)

                const classBreakInfos = response.classBreakInfos.map(function(item, index){
                    // use the max value from previous item as minValue, if first item, use 0 instead
                    const minValue = index === 0 ? 0 : response.classBreakInfos[index - 1].classMaxValue;
                    const maxValue = item.classMaxValue;
                    return {
                        minValue: minValue,
                        maxValue: maxValue,
                        symbol: fireflySymbols[index],
                    };
                });

                console.log('classbreak infos')
                console.log(classBreakInfos)

                var symbol = new SimpleFillSymbol();
                symbol.setColor(new Color([150, 150, 150, 0.5]));

                let picture_url = "https://media.giphy.com/media/26DNj3iQi58mrvTDW/giphy.gif"

                var renderer = new ClassBreaksRenderer(symbol, "AREA_");
                renderer.addBreak(classBreakInfos[0].minValue, classBreakInfos[0].maxValue, new PictureMarkerSymbol(picture_url, classBreakInfos[0].symbol.width, classBreakInfos[0].symbol.height));
                renderer.addBreak(classBreakInfos[1].minValue, classBreakInfos[1].maxValue, new PictureMarkerSymbol(picture_url, classBreakInfos[0].symbol.width, classBreakInfos[0].symbol.height));
                renderer.addBreak(classBreakInfos[2].minValue, classBreakInfos[2].maxValue, new PictureMarkerSymbol(picture_url, classBreakInfos[0].symbol.width, classBreakInfos[0].symbol.height));
                renderer.addBreak(classBreakInfos[3].minValue, classBreakInfos[3].maxValue, new PictureMarkerSymbol(picture_url, classBreakInfos[0].symbol.width, classBreakInfos[0].symbol.height));
                renderer.addBreak(classBreakInfos[4].minValue, classBreakInfos[4].maxValue, new PictureMarkerSymbol(picture_url, classBreakInfos[0].symbol.width, classBreakInfos[0].symbol.height));

                var infoTemplate = new InfoTemplate("${FIRE_NAME}", "${*}");
                var featureLayer = new FeatureLayer("https://utility.arcgis.com/usrsvcs/servers/141efcbd82fd4c129f5b784c2bc85229/rest/services/LiveFeeds/Wildfire_Activity/MapServer/0", {
                    mode: FeatureLayer.MODE_SNAPSHOT,
                    outFields: ["*"],
                    infoTemplate: infoTemplate
                });

                //featureLayer.setDefinitionExpression("STATE_NAME = 'Kansas'");
                featureLayer.setRenderer(renderer);
                map.addLayer(featureLayer);

                console.log('featureLayer')
                console.log(featureLayer)
            })

            //draw wind layer
            layersRequest.then(
                function(response) {
                    windy = new Windy({ canvas: rasterLayer._element, data: response });
                    redraw();
                }, function(error) {
                    console.log("Error: ", error.message);
                });

        } else {
            dom.byId("mapCanvas").innerHTML = "This browser doesn't support canvas. Visit <a target='_blank' href='http://www.caniuse.com/#search=canvas'>caniuse.com</a> for supported browsers";
        }

    }

    // does the browser support canvas?
    function supports_canvas() {
        return !!document.createElement("canvas").getContext;
    }

    function redraw(){

        rasterLayer._element.width = map.width;
        rasterLayer._element.height = map.height;

        windy.stop();

        var extent = map.geographicExtent;
        setTimeout(function(){
            windy.start(
                [[0,0],[map.width, map.height]],
                map.width,
                map.height,
                [[extent.xmin, extent.ymin],[extent.xmax, extent.ymax]]
            );
        },500);
    }
});

/**
 * Created by Cristina on 12/30/14.
 */
var map;
var red = [0,0,255,1];

require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/dijit/Legend",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/graphic",
    "dojo/_base/array",
    "esri/InfoTemplate",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/TimeExtent",
    "esri/dijit/TimeSlider",
    "dojo/dom",
    "dojo/domReady!"
], function(
    Map,
    FeatureLayer,
    Legend,
    Point,
    SimpleMarkerSymbol,
    Graphic,
    arrayUtils,
    InfoTemplate,
    ArcGISDynamicMapServiceLayer,
    TimeExtent,
    TimeSlider,
    dom
    ) {

    map = new Map("map",{
        basemap: "oceans",
        center: [0, 37.75],
        zoom: 2
    });

    map.on("layers-add-result", initSlider);

    var opLayer = new ArcGISDynamicMapServiceLayer("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Petroleum/KSWells/MapServer");
    opLayer.setVisibleLayers([0]);

    //apply a definition expression so only some features are shown
    var layerDefinitions = [];
    layerDefinitions[0] = "FIELD_KID=1000148164";
    opLayer.setLayerDefinitions(layerDefinitions);

    //add the gas fields layer to the map
    map.addLayers([opLayer]);

    function initSlider() {
        var timeSlider = new TimeSlider({
            style: "width: 78%;"
        }, dom.byId("timeSliderDiv"));
        map.setTimeSlider(timeSlider);

        var timeExtent = new TimeExtent();
        timeExtent.startTime = new Date("1/1/1921 UTC");
        timeExtent.endTime = new Date("12/31/2009 UTC");
        timeSlider.setThumbCount(2);
        timeSlider.createTimeStopsByTimeInterval(timeExtent, 2, "esriTimeUnitsYears");
        timeSlider.setThumbIndexes([0,1]);
        timeSlider.setThumbMovingRate(2000);
        timeSlider.startup();

        //add labels for every other time stop
        var labels = arrayUtils.map(timeSlider.timeStops, function(timeStop, i) {
            if ( i % 2 === 0 ) {
                return timeStop.getUTCFullYear();
            } else {
                return "";
            }
        });

        timeSlider.setLabels(labels);

        timeSlider.on("time-extent-change", function(evt) {
            var startValString = evt.startTime.getUTCFullYear();
            var endValString = evt.endTime.getUTCFullYear();
            dom.byId("daterange").innerHTML = "<i>" + startValString + " and " + endValString  + "<\/i>";
        });
    }

    map.on("load", function(){
        var points = [[19.82,41.33],[16.37,48.21],[18.38,43.85],[23.32,42.7],[16,45.8],[19.08,47.5],[12.48,41.9],[21.17,42.67],[21.43,42],[19.26,42.44],[26.1,44.43],[12.45,43.93],[20.47,44.82],[17.12,48.15],[14.51,46.06],[12.45,41.9]];
        var initColor = [0,0,255,1];
        arrayUtils.forEach(points, function(point) {
            var graphic = new Graphic(new Point(point), createSymbol(initColor));

            var json = {
                title:"Attributes",
                content:"<tr>State Name: <td>State</tr></td><br><tr>Population: <td>200</tr></td>"
            }
            var infoTemplate = new InfoTemplate(json);
            graphic.setInfoTemplate(infoTemplate);

            map.graphics.add(graphic);
        });
        map.graphics.on("click", function(e){
            //get the associated node info when the graphic is clicked
            var node = e.graphic.getNode();
            console.log(node);
        });
    });

    function createSymbol(color, size){
        var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
        markerSymbol.setColor(new dojo.Color(color));
        markerSymbol.setSize(size);
        markerSymbol.setOutline(null);
        return markerSymbol;
    }

});
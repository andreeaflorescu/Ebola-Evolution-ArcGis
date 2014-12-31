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
    "esri/InfoTemplate"
], function(
    Map,
    FeatureLayer,
    Legend,
    Point,
    SimpleMarkerSymbol,
    Graphic,
    arrayUtils,
    InfoTemplate
    ) {

    map = new Map("map",{
        basemap: "oceans",
        center: [0, 37.75],
        zoom: 2
    });

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

    //add the legend
    map.on("layers-add-result", function (evt) {
        var layerInfo = arrayUtils.map(evt.layers, function (layer, index) {
            return {layer:layer.layer, title:layer.layer.name};
        });
        if (layerInfo.length > 0) {
            var legendDijit = new Legend({
                map: map,
                layerInfos: layerInfo
            }, "legendDiv");
            legendDijit.startup();
        }
    });

    function createSymbol(color, size){
        var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
        markerSymbol.setColor(new dojo.Color(color));
        markerSymbol.setSize(size);
        markerSymbol.setOutline(null);
        return markerSymbol;
    }
});
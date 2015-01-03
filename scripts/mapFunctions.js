/**
 * Created by Cristina on 12/30/14.
 */
var map;
var colorZair = [255,0,0,1];
var colorReston = [255, 255, 0, 1];
var colorSudan = [255, 165, 0, 1];
var colorTai = [0, 128, 0, 1];
var colorBundibugyo = [39, 46, 128, 1];

function initMap() {
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

        console.log(getCountryCoordinates("gabon"));

        map = new Map("map",{
            basemap: "oceans",
            center: [0, 37.75],
            zoom: 2
        });
        map.on("load", function(){
            addPoints();
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

        function addCountry(attr) {
            var json = {
                title:"${tara}",
                content:"${detalii}"
            }
            var infoTemplate = new InfoTemplate(json);
            var point = getCountryCoordinates(attr.taraEn);
            var color = getCountryColor(attr.virus);
            var size = getBulletSize(attr.mortalitate);
            var graphic = new Graphic(new Point(point), createSymbol(color, size), attr, infoTemplate);
            map.graphics.add(graphic);
        }

        function addPoints() {
            var points = [[19.82,41.33],[16.37,48.21],[18.38,43.85],[23.32,42.7],[16,45.8],[19.08,47.5],[12.48,41.9],[21.17,42.67],[21.43,42],[19.26,42.44],[26.1,44.43],[12.45,43.93],[20.47,44.82],[17.12,48.15],[14.51,46.06],[12.45,41.9]];
            arrayUtils.forEach(points, function(point) {

                var attributes = {
                    tara: "vlad"
                };
                var json = {
                    title:"${tara}",
                    content:" lorem ipsum vla faslkdjsalda "
                }
                var infoTemplate = new InfoTemplate(json);
                var graphic = new Graphic(new Point(point), createSymbol(colorReston, 5), attributes, infoTemplate);
                map.graphics.add(graphic);
            });

            var gr = new Graphic(new Point([-98.499998910999693, 39.759997789000465]), createSymbol(colorSudan, 15));
            map.graphics.add(gr);
        }
    });

}

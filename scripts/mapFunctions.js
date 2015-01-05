/**
 * Created by Cristina on 12/30/14.
 */
var map;
var colorZair = [255,0,0,1];
var colorReston = [255, 255, 0, 1];
var colorSudan = [255, 165, 0, 1];
var colorTai = [0, 128, 0, 1];
var colorBundibugyo = [39, 46, 128, 1];

var graphicArray = [];


function initMap() {
    require([
        "esri/map",
        "esri/request",
        "esri/layers/FeatureLayer",
        "esri/dijit/Legend",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/graphic",
        "dojo/_base/array",
        "esri/InfoTemplate",
        "esri/TimeExtent",
        "esri/dijit/TimeSlider",
        "dojo/dom",
        "dojo/domReady!"
    ], function(
        Map,
        Request,
        FeatureLayer,
        Legend,
        Point,
        SimpleMarkerSymbol,
        Graphic,
        arrayUtils,
        InfoTemplate,
        TimeExtent,
        TimeSlider,
        dom
        ) {

        //create map
        map = new Map("map",{
            basemap: "oceans",
            center: [0, 37.75],
            zoom: 2
        });

        map.on("load", function(){

        });

        map.on("layers-add-result", requestData);

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

        //create empty feature collection
        var featureCollection = {
            "layerDefinition": null,
            "featureSet": {
                "features": [],
                "geometryType": "esriGeometryPoint"
            }
        };

        //create layer definition
        featureCollection.layerDefinition = {
            "geometryType": "esriGeometryPoint",
            "objectIdField": "ObjectID",
            "fields": [{
                "name": "ObjectID",
                "alias": "ObjectID",
                "type": "esriFieldTypeOID"
            }, {
                "name": "sliderYear",
                "alias": "sliderYear",
                "type": "esriFieldTypeString"
            }
            ]
        };

        //create feature layer from feature collection
        featureLayer = new FeatureLayer(featureCollection, {
            id: 'myFeatureLayer',
            mode: FeatureLayer.MODE_ONDEMAND
        });
        map.addLayers([featureLayer]);

        function requestData() {
            var requestHandle = Request({
                url: "data/geo.json",
                callbackParamName: "jsoncallback"
            });
            requestHandle.then(requestSucceeded, requestFailed);
        }

        function requestSucceeded(response, io) {
            //loop through the items and add to the feature layer

            var features = [];
            arrayUtils.forEach(response.features, function(item) {

                var point = new Point(item.geometry.coordinates[0], item.geometry.coordinates[1]);
                var country = item.properties.taraRO;
                var year = item.properties.an;
                var details = item.properties.Detalii;
                var nrOfCases = item.properties.nrCazuri;
                var nrOfDeaths = item.properties.nrDecese;
                var mortality = item.properties.mortalitate;
                var typeOfVirus = item.properties.virus;

                var attributes = {
                    tara: country,
                    an: year,
                    nrCazuri: nrOfCases,
                    nrDecese: nrOfDeaths,
                    mortalitate: mortality,
                    detalii: details
                };
                var json = {
                    title:"${tara}",
                    content:"<b>An: </b>${an} <br>" +
                            "<b>Numar de cazuri:</b> ${nrCazuri} <br>" +
                            "<b>Numar de decese:</b> ${nrDecese} <br>" +
                            "<b>Mortalitate:</b> ${mortalitate}% <br>" +
                            "<b>Detalii:</b> ${detalii}<br>"
                }
                var infoTemplate = new InfoTemplate(json);
                var graphic = new Graphic(new Point(point), createSymbol(colorReston, 20), attributes, infoTemplate);
                graphic.id = year;
                map.graphics.add(graphic);
                graphicArray.push(graphic);
            });

            initSlider();
        }

        function requestFailed(error) {
            console.log('failed');
        }

        function initSlider(){

            console.log(featureLayer);

            var timeSlider = new TimeSlider({
                style: "width: 78%;"
            }, dom.byId("timeSliderDiv"));
            map.setTimeSlider(timeSlider);

            var timeExtent = new TimeExtent();
            timeExtent.startTime = new Date("1/1/1974 UTC");
            timeExtent.endTime = new Date("1/1/2014 UTC");
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
                var startValString = evt.startTime;
                var endValString = evt.endTime;
                console.log(startValString, endValString);
                map.graphics.clear();
                for(i = 0; i < graphicArray.length; i++){
                    var graphicYear = new Date(graphicArray[i].id);
                    console.log(graphicYear);
                    if(graphicYear <= endValString && graphicYear >= startValString){
                        console.log(graphicYear);
                        map.graphics.add(graphicArray[i]);
                    }
                }
            });
        }
    }
    )};
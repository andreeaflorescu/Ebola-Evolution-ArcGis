/**
 * Created by Cristina on 12/30/14.
 */
var map;
var colorZair = [255,0,0,0.5];
var colorReston = [255, 255, 0, 0.75];
var colorSudan = [255, 165, 0, 0.75];
var colorTai = [0, 128, 0, 0.75];
var colorBundibugyo = [39, 46, 128, 0.75];

var graphicArray = [];
var plotJson = {};
var plotJsonDeaths = {};
var plotJsonCases = {};
var yearsArray = [];

function initMap() {
    require([
        "esri/map",
        "esri/request",
        "esri/layers/FeatureLayer",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/graphic",
        "dojo/_base/array",
        "esri/InfoTemplate",
        "esri/TimeExtent",
        "esri/dijit/TimeSlider",
        "dojo/dom",
        "esri/dijit/InfoWindow",
        "dijit/layout/TabContainer",
        "dojo/dom-construct",
        "dijit/layout/ContentPane",
        "dojo/dom-class",
        "dojox/charting/Chart2D",
        "dojox/charting/plot2d/Pie",
        "dojox/charting/plot2d/Lines",
        "dojox/charting/axis2d/Default",
        "dojox/charting/action2d/Highlight",
        "dojox/charting/action2d/MoveSlice",
        "dojox/charting/action2d/Tooltip",
        "dojo/number",
        "dojox/charting/themes/Wetland",
        "dojox/charting/widget/Legend",
        "dojo/domReady!"
    ], function(
        Map,
        Request,
        FeatureLayer,
        Point,
        SimpleMarkerSymbol,
        Graphic,
        arrayUtils,
        InfoTemplate,
        TimeExtent,
        TimeSlider,
        dom,
        InfoWindow,
        TabContainer,
        domConstruct,
        ContentPane,
        domClass,
        Chart2D,
        Pie,
        Lines,
        Default,
        Highlight, MoveSlice, Tooltip,
        number,
        dojoxTheme,
        Legend
        ) {

        // Use the info window instead of the popup.
        var infoWindow = new InfoWindow(null, domConstruct.create("div"));
        infoWindow.startup();



        //create map
        map = new Map("map",{
            basemap: "oceans",
            center: [0, 37.75],
            infoWindow: infoWindow,
            zoom: 2
        });

        map.infoWindow.resize(275, 275);

        dojo.connect(map.infoWindow._hide, "onclick", function(){
            map.infoWindow.resize(275, 275);
        });

        map.on("load", function(){
            for(var i = 1974; i <= 2014; i++){
                yearsArray.push({"x": i, "y": 0});
            }
        });

        map.on("layers-add-result", requestData);

        function createSymbol(color, size){
            var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
            markerSymbol.setColor(new dojo.Color(color));
            markerSymbol.setSize(size);
            markerSymbol.setOutline(null);
            return markerSymbol;
        }



        function getWindowContent(graphic) {
            // Make a tab container.
            var tc = new TabContainer({
                style: "width:100%;height:100%;"
            }, domConstruct.create("div"));

            // Display attribute information.
            var cp1 = new ContentPane({
                title: "Detalii",
                content: "<b>An: </b>" + graphic.attributes.an +  "<br>" +
                    "<b>Numar de cazuri:</b>" + graphic.attributes.nrCazuri +" <br>" +
                    "<b>Numar de decese:</b>" +graphic.attributes.nrDecese + "<br>" +
                    "<b>Mortalitate:</b>" + graphic.attributes.mortalitate + "%<br>" +
                    "<b>Detalii:</b>" + graphic.attributes.detalii +"<br>"
            });

            tc.watch("selectedChildWidget", function(name, oldVal, newVal){
                if ( newVal.title === "Detalii" ) {
                    infoWindow.resize(275, 275);
                    tc.resize();
                    chart.resize(180,180);
                }
            });

            // Display a dojo pie chart for the deaths/cures percentage.
            var cp2 = new ContentPane({
                title: "Grafic Mortalitate"
            });

            var cp3 = new ContentPane({
                title: "Situatia pe ani"
            });

            tc.addChild(cp1);
            tc.addChild(cp2);
            tc.addChild(cp3);

            //create the chart that will display in the third tab
            var columnChart = domConstruct.create("div", {
                id: "columnChart"
            }, domConstruct.create("div"));

            var secondChart = new Chart2D(columnChart);
            domClass.add(secondChart, "secondChart");

            // Apply a color theme to the chart.
            secondChart.setTheme(dojoxTheme);

            tc.watch("selectedChildWidget", function(name, oldVal, newVal){
                if ( newVal.title === "Situatia pe ani" ) {
                    infoWindow.resize(500, 365);
                    tc.resize();
                    secondChart.resize(450, 250);
                }
            });

            secondChart.addPlot("default", {type: Lines, markers: true});
            secondChart.addAxis("x", {title: "Ani", titleOrientation: "away", labelFunc: function(n){
                var date = new Date(parseInt(n * 1000) + "");
                return dojo.date.locale.format(date,  {
                    selector: "date",
                    datePattern: "y"
                });
            }});

            secondChart.addAxis("y", {vertical: true, title:"Decese"});
            secondChart.addSeries("Numar de decese", plotJsonDeaths[graphic.attributes.tara],
                {plot: "other", stroke: {color:"red"}, fill: "red"});
            secondChart.addSeries("Numar de cazuri", plotJsonCases[graphic.attributes.tara],
                {plot: "other", stroke: {color:"green"}, fill: "green"});

            cp3.set("content", secondChart.node);

            dojo.place(
              '<div>'+
                '<table>' +
                '<tr>' +
                    '<td><div style="border: solid 1px red; width: 50px"></div></td>' +
                    '<td>Numar decese</td>' +
                    '<td><div style="border: solid 1px green; width: 50px"></div></td>' +
                    '<td>Numar total de cazuri</td>' +
                '</tr>' +
                '</table>' +
            '</div>', cp3.containerNode);
            var legend = new Legend({ chart: secondChart }, "legend");
            // Create the chart that will display in the second tab.
            var c = domConstruct.create("div", {
                id: "demoChart"
            }, domConstruct.create("div"));
            var chart = new Chart2D(c);
            domClass.add(chart, "chart");

            // Apply a color theme to the chart.
            chart.setTheme(dojoxTheme);
            chart.addPlot("default", {
                type: "Pie",
                radius: 70,
                htmlLabels: true
            });
            tc.watch("selectedChildWidget", function(name, oldVal, newVal){
                if ( newVal.title === "Grafic Mortalitate" ) {
                    infoWindow.resize(275, 275);
                    tc.resize();
                    chart.resize(180,180);
                }
            });

            // Calculate percent deaths/cures.
            var total = parseInt(graphic.attributes.nrCazuri);
            var decese = parseInt(graphic.attributes.nrDecese);
            var vindecari = total - decese;
            chart.addSeries("PopulationSplit", [{
                y: decese,
                tooltip: decese,
                text: "Decese"
            },
                {
                    y: vindecari,
                    tooltip: vindecari,
                    text: "Vindecari"
                }
            ]);
            //highlight the chart and display tooltips when you mouse over a slice.
            new Highlight(chart, "default");
            new Tooltip(chart, "default");
            new MoveSlice(chart, "default");

            cp2.set("content", chart.node);
            return tc.domNode;
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
                            "<b>Detalii:</b> ${detalii}<br>" +
                            "<button>Vezi situatia pe ani</button>"
                }

                var template = new InfoTemplate();
                template.setTitle("<b>${tara}</b>");
                template.setContent(getWindowContent);
                var color = getCountryColor(typeOfVirus);
                var bulletSize = getBulletSize(mortality);
                var graphic = new Graphic(new Point(point), createSymbol(color, bulletSize), attributes, template);
                graphic.id = year + country;
                map.graphics.add(graphic);
                graphicArray.push(graphic);

                var currentYear = parseInt(year);
                var tempYears = [];
                if(plotJsonDeaths[country] == undefined){
                    tempYears = yearsArray.slice();
                    tempYears[currentYear - 1974] = {"x": currentYear, "y": nrOfDeaths};
                    plotJsonDeaths[country] = tempYears;
                }
                else{
                    tempYears = plotJsonDeaths[country].slice();
                    tempYears[currentYear - 1974] = {"x": currentYear, "y": nrOfDeaths};
                    plotJsonDeaths[country] = tempYears;
                }
                if(plotJsonCases[country] == undefined){
                    tempYears = yearsArray.slice();
                    tempYears[currentYear - 1974] = {"x": currentYear, "y": nrOfCases};
                    plotJsonCases[country] = tempYears;
                }
                else{
                    tempYears = plotJsonCases[country].slice();
                    tempYears[currentYear - 1974] = {"x": currentYear, "y": nrOfCases};
                    plotJsonCases[country] = tempYears;
                }

            });

            initSlider();
        }

        function requestFailed(error) {
            console.log('failed');
        }

        function initSlider(){

            map.graphics.clear();
            var startYear = new Date("1974");
            var endYear = new Date("1976");
            for(i = 0; i < graphicArray.length; i++){
                var graphicYear = new Date(graphicArray[i].id.substr(0, 4));
                if(graphicYear <= endYear && graphicYear >= startYear){
                    map.graphics.add(graphicArray[i]);
                }
            }

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
                map.graphics.clear();
                for(var i = 0; i < graphicArray.length; i++){
                    var graphicYear = new Date(graphicArray[i].id.substr(0, 4));
                    if(graphicYear <= endValString && graphicYear >= startValString){
                        map.graphics.add(graphicArray[i]);
                    }
                }
            });
        }
    }
    )};
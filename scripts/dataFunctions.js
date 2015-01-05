/**
 * Created by Andreea on 12/31/14.
 */

var countriesJSON;
var coordinatesJSON;

function makeHttpRequest(url, type,  callback) {
    var xmlhttp;
    // code for IE7+, Firefox, Chrome, Opera, Safari
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (type == "country") {
                countriesJSON = JSON.parse(xmlhttp.responseText)
            } else {
                coordinatesJSON = JSON.parse(xmlhttp.responseText)
            }
            callback();
        }

    }
    xmlhttp.open("GET",url,true);
    xmlhttp.send();
}

function initData() {
    var url = "data/bigData.json";
    makeHttpRequest(url, "country", initCoord);
}

function initCoord() {
    var url = "data/coordinates.json";
    makeHttpRequest(url, "coord", finishedLoading);
}

function finishedLoading() {
    initMap();
}

function getCountriesNames(countriesJSON) {
    var i;
    var res = new Array();
    for (i = 0; i < countriesJSON.length; i++) {
        res[i] = countriesJSON[i].taraEN;
    }

    console.log(res);
    return res;
}

function getCountryCoordinates(nameEn) {
    var i;
    for (i = 0; i < coordinatesJSON.length; i++) {
        if (coordinatesJSON[i].taraEN.toUpperCase() === nameEn.toUpperCase()) {
            return [coordinatesJSON[i].Lat, coordinatesJSON[i].Long];
        }
    }
}

function getCountryColor(virusType) {
    if (virusType.trim().toUpperCase() === "Ebola virusul Sudan".toUpperCase()) {
        return colorSudan;
    } else if (virusType.trim().toUpperCase() === "Ebola virusul Zair".toUpperCase()) {
        return colorZair;
    } else if (virusType.trim().toUpperCase() === "Ebola virusul pădurii Taï".toUpperCase()) {
        return colorTai;
    } else if (virusType.trim().toUpperCase() === "Ebola virusul Reston".toUpperCase()) {
        return colorReston;
    } else if (virusType.trim().toUpperCase() === "Ebola virusul Bundibugyo".toUpperCase()) {
        return colorBundibugyo;
    } else {
        return [0,0,0,1];
    }
}

function getBulletSize(mortality) {
    if (mortality <= 25) {
        return 15;
    } else if (mortality <= 50) {
        return 25;
    } else if (mortality <= 75) {
        return 35;
    } else {
        return 45;
    }
}

initData();
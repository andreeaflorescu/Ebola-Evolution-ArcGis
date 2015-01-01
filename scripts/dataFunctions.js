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
    console.log(countriesJSON);
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

initData();
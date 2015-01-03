/**
 * Created by Andreea on 12/31/14.
 */

var countriesJSON;

function makeHttpRequest(url, callback_function) {
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
            callback_function(JSON.parse(xmlhttp.responseText));
        }

    }
    xmlhttp.open("GET",url,true);
    xmlhttp.send();
}


function initData() {
    var url = "data/bigData.json";
    makeHttpRequest(url, getCountriesNames);
    url = "data/coordinates.json";
    makeHttpRequest(url, print);
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

function print(json) {
    console.log(json);
}

function getCoordinates(countryName) {

}
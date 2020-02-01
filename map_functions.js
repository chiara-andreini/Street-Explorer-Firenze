//Centered in Piazza Duomo
var center = [43.772829,11.255043];

// Initialize the map
var map = L.map('map');


//variable that indicates if it is shown any info about stradario or quartiere
var flagInfo = false;


attr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | ' +
    '&copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

// Set source for the tiles used
cdb_url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

// Add tiles to map
L.tileLayer(cdb_url, {attribution: attr}).addTo(map);


// Center on user location and Florence
map.locate({
    setView: true
});

function onLocationFound(e) {
    var my_position = L.marker(e.latlng);

    my_position.addTo(map);
    my_position.bindPopup("Posizione attuale.");
    my_position.openPopup();

    var include_florence = L.marker(center,
        {opacity: 0}
    ).addTo(map);

    var to_be_shown = new L.featureGroup([my_position, include_florence]);
    map.fitBounds(to_be_shown.getBounds());
}
map.on('locationfound', onLocationFound);

function onLocationError(e) {
    map.setView(center, 13);
    console.log(e.message);
}
map.on('locationerror', onLocationError);


// Define projected coordinates
proj4.defs("EPSG:3003","+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl " +
    "+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs");


// Set crs field for EPSG:3003 projected coordinates
quartieri.crs =  {
    'type': 'name',
    'properties': {
        'name': 'urn:ogc:def:crs:EPSG::3003'
    }
};


var quartieriLayer = new L.Proj.GeoJSON(quartieri, {
    style: function () {
        return {
            weight: 1.6,
            opacity: 0.8,
            fillOpacity: 0,
            color: '#6f6263',
        }
    },
    onEachFeature: function (feature, layer) {

            layer.on('click', function () {
            info.update(layer.feature, null);
        });

    }
}).addTo(map);


// Set crs field for EPSG:3003 projected coordinates
stradario.crs =  {
        'type': 'name',
        'properties': {
            'name': 'urn:ogc:def:crs:EPSG::3003'
        }
    };


// Define feature colour
function getColor(length) {
        return parseFloat(length) >= 800 ? '#581642' :
            parseFloat(length) >= 400 ? '#9e3966' :
                parseFloat(length) >= 200 ? '#c06e68' :
                            '#ef9995';
}


var stradarioLayer = new L.Proj.GeoJSON(stradario, {
    style: function (feature) {
        if (feature.properties.TOPONIMO != null && feature.properties.TOPONIMO.indexOf("Piazz") == 0) {
            return {
                color: '#290029',
                weight: 4,
                opacity: 0.3,
            };
        } else if (feature.properties.TOPONIMO == null && feature.properties.USO_PARLATO.indexOf("PIATZ") == 0) {
            return {
                color: '#290029',
                weight: 4,
                opacity: 0.3,
            };

        } else
            return {
            color: getColor(feature.properties.LUNGHEZZA),
            weight: 4,
            opacity: 0.3,
        }
    },
    onEachFeature: function (feature, layer) {

        layer.on('click', function () {
            info.update(null, layer.feature);
        });

    }
}).addTo(map);


var marker;

var searchControl = new L.Control.Search({
    layer: stradarioLayer,
    propertyName: 'TOPONIMO',
    marker: false,
    initial: false,

    moveToLocation: function(latlng, title, map) {

        var zoom = map.getBoundsZoom(latlng.layer.getBounds());
        map.setView(latlng, 17); // Access the zoom
        marker = L.marker(latlng).addTo(map);

    },


});


map.addControl( searchControl );  // Initialize search control


var info = L.control({position:'bottomright'});

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};


info.write = function (e) {

    this._div.innerHTML = '<h4>Informazioni </h4>' + '<table><tbody><tr><td><b>Nome:' +
        '</b></td><td>' + e.text + '</td></tr></tbody></table>' + '<br />' +
            "Clicca sull'elemento per dettagli storici ed etimologici.";


};

function getNames(numero) {
    var names;
    var result = "";
    switch(numero) {
        case 1:
            names = nomi1;
            break;
        case 2:
            names = nomi2;
            break;
        case 3:
            names = nomi3;
            break;
        case 4:
            names = nomi4;
            break;
        case 5:
            names = nomi5;
            break;
        default:
            return "Non identificato."
    }
    for (var i = 0; i < names.length - 1; i++) {
        result = result + names[i].nome + ', ';
    }
    return result + names[names.length - 1].nome;
}

info.update = function (quartiere, stradario) {

    if (flagInfo == false){
        this._div.innerHTML = '<h4>Informazioni </h4>' +'Seleziona un quartiere o una via';
        flagInfo=true;
    }
    else{
        if (quartiere==null){
            if(stradario==null){
                this._div.innerHTML = '<h4>Informazioni </h4>' +'Seleziona un quartiere o una via';
                flagInfo=true;
            }else{

                this._div.innerHTML ='<h4>Informazioni </h4>' + '<table><tbody><tr><td><b>Nome:</b></td><td>' +
                    stradario.properties.TOPONIMO + '</td></tr><tr><td><b>In uso parlato:</b></td><td>' +
                    stradario.properties.USO_PARLATO + '</td></tr><tr><td><b>Accessi:</b></td><td>'
                    + stradario.properties.ACCESSI + '</td></tr><tr><td><b>Origine del nome:</b></td><td>'
                    + stradario.properties.ORIGINE_NOME + '</td></tr><tr><td><b>Lunghezza:</b></td><td>' +
                    stradario.properties.LUNGHEZZA + '</td></tr><tr><td><b>Quartiere:</b></td><td>'
                    + belongsTo(stradario.geometry.coordinates[0]) + '</td></tr></tbody></table>';
                flagInfo=false;

            }
        }else{

            this._div.innerHTML = '<h4>Informazioni </h4>' + '<table><tbody><tr><td><b>Nome:</b></td><td>' +
                quartiere.properties.NOME + '</td></tr><tr><td><b>Numero:</b></td><td>' +
                quartiere.properties.NUMERO + '</td></tr><tr><td><b>Nomi piu\' diffusi:</b></td><td>' +
                getNames(quartiere.properties.NUMERO) + '</td></tr></tbody></table>';
            flagInfo=false;
        }
    }

};

info.addTo(map);


searchControl.on('search:locationfound', function(e) {

    e.layer.setStyle({color: '#0d45b3', weight: 5});
    info.write(e);


}).on('search:collapsed', function(e) {

    stradarioLayer.eachLayer(function(layer) {	// Restore feature color
        stradarioLayer.resetStyle(layer);
        map.removeLayer(marker);
    });
});


function belongsTo(strada) {

    for (var i = 0; i < 5; i++) {

        type = quartieri.features[i].geometry.type;
        if (type == "Polygon"){

            if (isMarkerInsidePolygon(strada[1], quartieri.features[i].geometry.coordinates[0])){
                return quartieri.features[i].properties.NOME;
            }

        }else{ //it means it is of type MultiPolygon

            for (var j=0; j < quartieri.features[i].geometry.coordinates.length; j++) {
                if (isMarkerInsidePolygon(strada[1], quartieri.features[i].geometry.coordinates[j][0])) {
                    return quartieri.features[i].properties.NOME;
                }
            }
        }
    }
}


// Checks whether marker point is inside a polygon or not (Ray Casting algorithm)

function isMarkerInsidePolygon(point, vs){


    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

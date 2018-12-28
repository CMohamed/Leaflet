// Create map Object

var mymap = L.map('map', {
	zoomsliderControl : true,
	zoomControl : false,
	minZoom : 5
}).setView([ 30, -8 ], 5);

// Add Tiles

streets = L
		.tileLayer(
				'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
				{
					attribution : 'Source: Esri, NAVTEQ, 2012'
				});
world = L
		.tileLayer(
				'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				{
					attribution : 'Esri'
				});
streets.addTo(mymap);

// Add Group Layers Control

var baseMaps = {
	"World Street map" : streets,
	"World Imagery" : world
};

L.control.layers(baseMaps).addTo(mymap);

// Cursor coordinates

L.control.coordinates({
	position : "bottomright",
	decimals : 2,
	decimalSeperator : ",",
	labelTemplateLat : "Latitude: {y}",
	labelTemplateLng : "Longitude: {x}"
}).addTo(mymap);

// Add user GPS localisation control

mymap.addControl(new L.Control.Gps());

// Add zoom box control

var control = L.control.zoomBox({
	modal : true
});
mymap.addControl(control);

// Measurement tool

var measureControl = new L.Control.Measure({
	position : "topright",
	primaryLengthUnit : 'meters',
	primaryAreaUnit : 'sqmeters',
	completedColor : '#295b9b',
	activeColor : '#295b9b'
});
measureControl.addTo(mymap);

// display scale symbol

L.control.betterscale().addTo(mymap);

// Add Layers from GeoServer

// Add Gradient colors

function getColor(d) {
	return d > 5000000 ? '#040354' : d > 4000000 ? '#202168'
			: d > 3000000 ? '#3D407D' : d > 2000000 ? '#5A5F91'
					: d > 1000000 ? '#777DA6' : d > 700000 ? '#949CBA'
							: d > 40000 ? '#B1BBCF' : '#DDE9EE';
}

function style(feature) {
	return {
		fillColor : getColor(feature.properties.population_2014),
		weight : 2,
		opacity : 1,
		color : 'white',
		fillOpacity : 0.7
	};
}

function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight : 5,
		color : '#EFAA6C',
		dashArray : '',
		fillOpacity : 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
}

// Load Geodemat:regions Layer from
// Geoserver//////////////////////////////////////////////////////

var rootUrl = 'http://localhost:8080/geoserver/GeoDemat/ows';

var defaultParameters = {
	service : 'WFS',
	version : '1.0.0',
	request : 'GetFeature',
	typeName : 'GeoDemat:regions',
	maxFeatures : 50,
	outputFormat : 'text/javascript',
	format_options : 'callback: getJson'

};

var parameters = L.Util.extend(defaultParameters);

$.ajax({
	url : rootUrl + L.Util.getParamString(parameters),
	dataType : 'jsonp',
	jsonpCallback : 'getJson',
	success : handleJson
});

var regionsLayer;

function handleJson(data) {
	regionsLayer = L.geoJson(
			data,
			{
				onEachFeature : function(feature, layer) {
					layer.bindPopup('<b>' + feature.properties.name_region
							+ '</b>' + '<br/>' + ' Population 2014 : ' + '<b>'
							+ feature.properties.population_2014 + '</b>'
							+ ' habitants');
					layer.on({
						mouseover : highlightFeature,
						mouseout : function resetHighlight(e) {
							regionsLayer.resetStyle(e.target);
						},
						dblclick : function zoomToFeature(e) {
							mymap.fitBounds(e.target.getBounds());
						}
					});
				},
				style : style
			}).addTo(mymap);
}

// Load Geodemat:provinces Layer from
// Geoserver///////////////////////////////////////////////////////////

var rootUrl2 = 'http://localhost:8080/geoserver/GeoDemat/ows';

var defaultParameters2 = {
	service : 'WFS',
	version : '1.0.0',
	request : 'GetFeature',
	typeName : 'GeoDemat:provinces',
	outputFormat : 'text/javascript',
	format_options : 'callback: getJson'

};

var parameters2 = L.Util.extend(defaultParameters2);

$.ajax({
	url : rootUrl2 + L.Util.getParamString(parameters2),
	dataType : 'jsonp',
	jsonpCallback : 'getJson',
	success : handleJson2
});

function style2(feature) {
	return {
		fillColor : getColor(feature.properties.populationp_2014),
		weight : 2,
		opacity : 1,
		color : 'white',
		fillOpacity : 0.7
	};
}

var provincesLayer;

function handleJson2(data) {
	provincesLayer = L.geoJson(data, {
		onEachFeature : function(feature, layer) {
			layer.bindPopup('<b>' + feature.properties.name_province + '</b>'
					+ '<br/>' + ' Population 2014 : ' + '<b>'
					+ feature.properties.populationp_2014 + '</b>'
					+ ' habitants');
			layer.on({
				mouseover : highlightFeature,
				mouseout : function resetHighlight(e) {
					provincesLayer.resetStyle(e.target);
				},
				dblclick : function zoomToFeature(e) {
					mymap.fitBounds(e.target.getBounds());
				}
			});
		},
		style : style2
	});
}

// ///////////////////////////////////////////////////////////////////////////////////////

// Display Each Layer in a specific zoom level

mymap.on('zoomend', function(e) {
	zoom_based_layerchange();
});

function zoom_based_layerchange() {

	var currentZoom = mymap.getZoom();

	switch (currentZoom) {
	case 5:
		mymap.removeLayer(provincesLayer);
		regionsLayer.addTo(mymap);

		break;
	case 6:
		mymap.removeLayer(regionsLayer);
		provincesLayer.addTo(mymap);
		break;
	default:
		mymap.removeLayer(regionsLayer);
		mymap.removeLayer(provincesLayer);
		break;
	}
}

// ////////////////////////////////////////////////////////

// Add Legend

var legend = L.control({
	position : 'bottomright'
});

legend.onAdd = function(mymap) {

	var div = L.DomUtil.create('div', 'info legend'), grades = [ 0, 40000,
			700000, 1000000, 2000000, 3000000, 4000000, 5000000 ], labels = [];

	// loop through our density intervals and generate a label with a colored
	// square for each interval
	div.innerHTML = "<b>Nombre d'habitants</b><br/><br/>";
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML += '<i style="background:' + getColor(grades[i] + 1)
				+ '"></i> ' + grades[i]
				+ (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}

	return div;
};

legend.addTo(mymap);

///////////////////////////////////////////////////////////
// Add Search Tool


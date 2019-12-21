var starttime = '2019-11-01';
var latitude = '31.2252985';
var longitude = '121.4890497';
var maxrad = '2500';
var limit = '2000';
var orderby = 'magnitude';
var geolink = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${starttime}&latitude=${latitude}&longitude=${longitude}&maxradiuskm=${maxrad}&limit=${limit}&orderby=${orderby}`;

var tectlink = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

d3.json(geolink, function(EQdata){
    console.log(EQdata);
    d3.json(tectlink, function(tecdata){
      console.log(tecdata);
      createMap(EQdata.features, tecdata.features);
    })
})

function styles(mag){
    if(mag<5){
        return {color: 'gray', fillColor: 'green', fillOpacity: 0.25, radius: 10};
    } else if(mag<5.3){
        return {color: 'gray', fillColor: 'orange', fillOpacity: 0.75, radius: 20};
    } else{
        return {color: 'gray', fillColor: 'red', fillOpacity: 1, radius: 40};
    }
}

function createMarkers(EQdata){
    console.log(EQdata);
      // Create a GeoJSON layer containing the features array on the earthquakeData object
      // Run the onEachFeature function once for each piece of data in the array
      var earthquakes = L.geoJSON(EQdata, {
        pointToLayer: function onEachFeature(feature) {
            // console.log(feature);
            var coord = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
            var magnitude = feature.properties.mag;
            var style = styles(magnitude);
            return L.circleMarker(coord, style).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${magnitude} on ${Date(feature.properties.time)}</</p>`);}
      });
      
      // Sending our earthquakes layer to the createMap function
      return earthquakes;
    }
    
    function createMap(earthquakes, tPlates) {
    
      // Define streetmap and darkmap layers
      var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
      });
    
    
      // Define a baseMaps object to hold our base layers
      var baseMaps = {
        "Light Map": lightmap
      };
    
      // Create overlay object to hold our overlay layer
      var weakEQ = [];
      var midEQ = [];
      var strongEQ = [];
      earthquakes.forEach(function(feature, index){
        var mag = feature.properties.mag;
        if(mag<5)
            weakEQ.push(earthquakes[index]);
        else if(mag<5.3){
            midEQ.push(earthquakes[index]);
        } else{
            strongEQ.push(earthquakes[index]);
        }
      });
      console.log(weakEQ);
      console.log(midEQ);
      console.log(strongEQ);
      
      var teclayer = L.geoJSON(tPlates);

      var overlayMaps = {
        'Weak Earthquakes': createMarkers(weakEQ),
        'Medium Earthquakes': createMarkers(midEQ),
        'Strong Earthquakes': createMarkers(strongEQ),
        'Tectonic Plates': teclayer
      };
    
      // Create our map, giving it the streetmap and earthquakes layers to display on load
      var myMap = L.map("map", {
        center: [latitude, longitude],
        zoom: 4,
        layers: [lightmap, teclayer]
      });
    
      // Create a layer control
      // Pass in our baseMaps and overlayMaps
      // Add the layer control to the map
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

      // Create a legend to display information about our map
    var info = L.control({
    position: "bottomright"
    });
  
    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h2>Western Pacific Earthquakes since November 2019</h2>"
    return div;
    };
    // Add the info legend to the map
    info.addTo(myMap);
    }
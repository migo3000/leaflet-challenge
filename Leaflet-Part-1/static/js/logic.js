// Create a map object
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5
  });
  
  // Add a tile layer (the background map image)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
  }).addTo(myMap);
  
  // Define the URL for the USGS GeoJSON data (replace with your selected URL)
  const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  
  // Fetch the earthquake data using D3
  fetch(earthquakeUrl)
    .then(response => response.json())
    .then(data => {
      // Define a function to determine the marker size based on earthquake magnitude
      function markerSize(magnitude) {
        return magnitude * 4;
      }
  
      // Define a function to determine the marker color based on earthquake depth
      function markerColor(depth) {
        if (depth > 90) return "#d73027";
        else if (depth > 70) return "#fc8d59";
        else if (depth > 50) return "#fee08b";
        else if (depth > 30) return "#d9ef8b";
        else if (depth > 10) return "#91cf60";
        else return "#1a9850";
      }
  
      // Loop through the earthquake data and create circle markers
      var earthquakes = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.8
          });
        },
        onEachFeature: function (feature, layer) {
          // Add a popup to each marker
          layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3>
                           <hr>
                           <p>Magnitude: ${feature.properties.mag}</p>
                           <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
        }
      });
  
      earthquakes.addTo(myMap);
  
      // Add a legend to the map
      var legend = L.control({ position: "bottomright" });
  
      legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
          depths = [-10, 10, 30, 50, 70, 90],
          colors = [
            "#1a9850",
            "#91cf60",
            "#d9ef8b",
            "#fee08b",
            "#fc8d59",
            "#d73027"
          ];
  
        // Loop through the depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depths.length; i++) {
          div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
        }
  
        return div;
      };
  
      legend.addTo(myMap);
  
      // Fetch the tectonic plates data and add to the map
      const tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  
      fetch(tectonicPlatesUrl)
        .then(response => response.json())
        .then(plateData => {
          var tectonicPlates = L.geoJSON(plateData, {
            style: {
              color: "#ff6500",
              weight: 2
            }
          });
  
          tectonicPlates.addTo(myMap);
  
          // Add layer controls
          var baseMaps = {
            "Street Map": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
            })
          };
  
          var overlayMaps = {
            "Earthquakes": earthquakes,
            "Tectonic Plates": tectonicPlates
          };
  
          L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
          }).addTo(myMap);
        })
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
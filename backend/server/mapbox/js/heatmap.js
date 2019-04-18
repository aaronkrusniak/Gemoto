mapboxgl.accessToken =
  "pk.eyJ1IjoidG9tbGVld3UiLCJhIjoiY2pzZHo3eXZxMTE2NzQ2b2E4Y3BycHNjZyJ9.7QT62BItg33RniE2SMuBDg";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v9",
  center: [-95.992775, 36.15398],
  zoom: 12,
  pitch: 45
});

// DEFINING VARIABLES
const granularities = ["zero_five_km", "one_km", "one_five_km"];
const layers = [
  "joy-zero_five_km-map",
  "joy-zero_five_km-count",
  "joy-one_km-map",
  "joy-one_km-count",
  "joy-one_five_km-map",
  "joy-one_five_km-count",
  "joy-point-map",
  "sadness-zero_five_km-map",
  "sadness-zero_five_km-count",
  "sadness-one_km-map",
  "sadness-one_km-count",
  "sadness-one_five_km-map",
  "sadness-one_five_km-count",
  "sadness-point-map",
  "total-zero_five_km-map",
  "total-zero_five_km-count",
  "total-point-map",
  "total-one_km-map",
  "total-one_km-count",
  "total-one_five_km-map",
  "total-one_five_km-count",
  "anger-zero_five_km-map",
  "anger-zero_five_km-count",
  "anger-one_km-map",
  "anger-one_km-count",
  "anger-map",
  "anger-one_five_km-map",
  "anger-one_five_km-count",
  "anger-point-map"
];

var previousCamera = {
  speed: 0.4
};
const gran = document.getElementById("myRange");
const emotions = ["joy", "anger", "sadness", "total"];

var dateString = "";

var popups = [];
const grans = {
  1: "zero_five_km",
  2: "one_km",
  3: "one_five_km"
};

// const bbox = [
//   -96.27091250682199,
//   35.92788866676072,
//   -95.714637493178,
//   36.38007453323928
// ];
// const hexgrid = turf.hexGrid(bbox, 1.5);

// Used to track the hex user hovers on
var gridActive = {
  type: "FeatureCollection",
  features: []
};

var activeCamera = "hexbin";
var animationOptions = { duration: 3000, easing: 0.3 };

// Date picker
$('input[name="daterange"]').on("apply.daterangepicker", function(ev, picker) {
  sDate = picker.startDate.format("MM-DD-YYYY");
  eDate = picker.endDate.format("MM-DD-YYYY");

  // Hide current layers
  hideAllLayers();

  // Remove date sources (so names can be reused)
  removeSources();

  dateString = "Date";

  refreshPopupFocus();

  for (let e of emotions) {
    map.addSource(e + "Date", {
      type: "geojson",
      data:
        "http://129.244.254.112/index?t=" +
        e +
        "&from=" +
        sDate +
        "&to=" +
        eDate
    });

    for (let g of granularities) {
      map.addSource(e + g + "-hexesDate", {
        type: "geojson",
        data:
          "http://129.244.254.112/newindex?name=" +
          g +
          "&t=" +
          e +
          "&from=" +
          sDate +
          "&to=" +
          eDate
      });
      addEmoLayer(e, g);
    }
  }
  showLayer();
  map.moveLayer("grid-active");
});

// DEFINING FUNCTIONS
function findDiff(a1, a2) {
  var result = [];
  if (!a1) {
    return a2;
  } else if (!a2) {
    return a1;
  }

  for (var i = 0; i < a1.length; i++) {
    if (a2.indexOf(a1[i]) === -1) {
      result.push(a1[i]);
    }
  }
  return result;
}

// Gets currently selected emotion
function checkboxVals() {
  var boxes = document.getElementsByName("emotion");
  var retArr = [];

  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      retArr.push(boxes[i].value);
    }
  }

  return retArr.length > 0 ? retArr : null;
}

function addEmoLayer(emo, gran) {
  var col1;
  var col2;
  var col3;
  var col4;
  var col5;
  switch (emo) {
    case "joy":
      col1 = "rgb(255,255,212)";
      col2 = "rgb(254,217,142)";
      col3 = "rgb(254,153,41)";
      col4 = "rgb(217,95, 14)";
      col5 = "rgb(153,52,4)";
      primaryCol = "#E8A87C";
      break;
    case "sadness":
      col1 = "rgb(241,238,246)";
      col2 = "rgb(189,201,225)";
      col3 = "rgb(116,169,207)";
      col4 = "rgb(43,140,190)";
      col5 = "rgb(4, 90, 141)";
      primaryCol = "#84CDCA";
      break;
    case "anger":
      col1 = "rgb(254,220,217)";
      col2 = "rgb(252,174,145)";
      col3 = "rgb(251,106,74)";
      col4 = "rgb(222,45,38)";
      col5 = "rgb(165, 15, 21)";
      primaryCol = "#E27D60";
      break;
    case "total":
      col1 = "rgb(242,240,247)";
      col2 = "rgb(203,201,226)";
      col3 = "rgb(158,154,200)";
      col4 = "rgb(117,107,177)";
      col5 = "rgb(84, 39, 143)";
      primaryCol = "#C38D9E";
      break;
  }

  // Add hexbin layer
  map.addLayer({
    id: emo + "-" + gran + "-map" + dateString,
    type: "fill-extrusion",
    source: emo + gran + "-hexes" + dateString,
    maxzoom: 17,
    layout: {
      visibility: "none"
    },
    paint: {
      "fill-extrusion-height": {
        property: "height",
        stops: [[0, 0], [1, 5000]]
      },
      "fill-extrusion-color": {
        property: "color",
        type: "identity"
      },
      "fill-extrusion-opacity": {
        stops: [[13, 0.6], [14, 0.1]]
      }
    }
  });

  // Add count of tweets within hexbin layer
  map.addLayer({
    id: emo + "-" + gran + "-count" + dateString,
    type: "symbol",
    source: emo + gran + "-hexes" + dateString,
    layout: {
      "text-field": "{numTweets}",
      "text-size": 14,
      visibility: "none"
    },
    paint: {
      "text-color": "#3cc",
      "text-opacity": {
        stops: [[13, 0], [14, 0.8]]
      },
      "text-halo-color": "#2d2d2d",
      "text-halo-width": 2,
      "text-halo-blur": 1
    }
  });

  if (!map.getLayer(emo + "-point-map" + dateString)) {
    if (emo == "total") {
      map.addLayer({
        id: emo + "-point-map" + dateString,
        type: "circle",
        source: emo + dateString,
        minzoom: 14,
        layout: {
          visibility: "none"
        },
        paint: {
          "circle-color": [
            "interpolate",
            ["linear"],
            [
              "case",
              ["has", "joy"],
              ["to-number", ["get", "joy"]],
              ["has", "anger"],
              ["to-number", ["get", "anger"]],
              ["has", "sadness"],
              ["to-number", ["get", "sadness"]],
              0.2
            ],
            0.0,
            [
              "case",
              ["has", "joy"],
              "rgb(255,255,212)",
              ["has", "anger"],
              "rgb(254,220,217)",
              ["has", "sadness"],
              "rgb(241,238,246)",
              col1
            ],
            0.2,
            [
              "case",
              ["has", "joy"],
              "rgb(254,217,142)",
              ["has", "anger"],
              "rgb(252,174,145)",
              ["has", "sadness"],
              "rgb(189,201,225)",
              col2
            ],
            0.4,
            [
              "case",
              ["has", "joy"],
              "rgb(254,153,41)",
              ["has", "anger"],
              "rgb(251,106,74)",
              ["has", "sadness"],
              "rgb(116,169,207)",
              col3
            ],
            0.6,
            [
              "case",
              ["has", "joy"],
              "rgb(217,95, 14)",
              ["has", "anger"],
              "rgb(222,45,38)",
              ["has", "sadness"],
              "rgb(43,140,190)",
              col4
            ],
            0.8,
            [
              "case",
              ["has", "joy"],
              "rgb(153,52,4)",
              ["has", "anger"],
              "rgb(165, 15, 21)",
              ["has", "sadness"],
              "rgb(4, 90, 141)",
              col5
            ]
          ],
          "circle-stroke-color": "white",
          "circle-stroke-width": 1,
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            [
              "*",
              15,
              [
                "case",
                ["has", "joy"],
                ["to-number", ["get", "joy"]],
                ["has", "anger"],
                ["to-number", ["get", "anger"]],
                ["has", "sadness"],
                ["to-number", ["get", "sadness"]],
                0.2
              ]
            ],
            22,
            [
              "*",
              30,
              [
                "case",
                ["has", "joy"],
                ["to-number", ["get", "joy"]],
                ["has", "anger"],
                ["to-number", ["get", "anger"]],
                ["has", "sadness"],
                ["to-number", ["get", "sadness"]],
                0.2
              ]
            ]
          ],
          "circle-opacity": {
            stops: [[13, 0], [14, 0.8]]
          }
        }
      });
    } else {
      map.addLayer({
        id: emo + "-point-map" + dateString,
        type: "circle",
        source: emo + dateString,
        minzoom: 14,
        layout: {
          visibility: "none"
        },
        paint: {
          "circle-color": {
            property: emo,
            type: "exponential",
            stops: [
              [0.0, col1],
              [0.2, col2],
              [0.4, col3],
              [0.6, col4],
              [0.8, col5]
            ]
          },
          "circle-stroke-color": "white",
          "circle-stroke-width": 1,
          "circle-radius": {
            property: emo,
            type: "exponential",
            stops: [
              [{ zoom: 14, value: 0 }, 5],
              [{ zoom: 14, value: 1 }, 10],
              [{ zoom: 22, value: 0 }, 20],
              [{ zoom: 22, value: 1 }, 50]
            ]
          },
          "circle-opacity": {
            stops: [[13, 0], [14, 0.8]]
          }
        }
      });
    }
  }

  // Add pop ups to circles
  map.on("click", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: [emo + "-point-map" + dateString]
    });

    if (!features.length) {
      return;
    }
    var feature = features[0];
    var emoVal = "";
    var emoDisplay = "";
    var setE;

    for (let e of emotions) {
      if (e in feature.properties) {
        emoVal = feature.properties[e].toString().slice(0, 5);
        emoDisplay = e.charAt(0).toUpperCase() + e.slice(1) + ": ";
        setE = e;
      }
    }
    var d = feature.properties.date;

    var popup = new mapboxgl.Popup({ offset: [0, -15], anchor: "bottom" })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        "<div class=" +
          setE +
          ">" +
          "<h4>" +
          feature.properties.text +
          "</h4><p><b>" +
          emoDisplay +
          "</b>" +
          emoVal +
          " | <b>Date: </b> " +
          d.toString().slice(0, -13) +
          " | <b>User: </b>@" +
          feature.properties.name +
          "</p></div>"
      )
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);

    popups.push(popup);
  });
}

function setLayers(activeLayer) {
  if (activeCamera === "hexbin") {
    map.setPaintProperty(
      activeLayer + "-" + grans[gran.value] + "-map" + dateString,
      "fill-extrusion-opacity",
      {
        stops: [[13, 0.6], [14, 0.1]]
      }
    );
    map.setPaintProperty("grid-active", "fill-extrusion-opacity", {
      stops: [[14, 0.6], [15, 0.1]]
    });
  } else if (activeCamera === "inspector") {
    map.setPaintProperty(
      activeLayer + "-point-map" + dateString,
      "circle-opacity",
      0.8
    );
    map.setPaintProperty(
      activeLayer + "-" + grans[gran.value] + "-map" + dateString,
      "fill-extrusion-opacity",
      0
    );
    map.setPaintProperty("grid-active", "fill-extrusion-opacity", 0.2);
    map.setPaintProperty("grid-active", "fill-extrusion-height", 0);
  }
}

function getCamera() {
  // if pitch==0, don't update Camera
  if (map.getPitch()) {
    previousCamera.center = map.getCenter();
    previousCamera.zoom = map.getZoom();
    previousCamera.pitch = map.getPitch();
    previousCamera.bearing = map.getBearing();
  }
}

function returnCamera() {
  var activeLayer = checkboxVals();

  activeCamera = "hexbin";
  // exception: only for inspector > hexbin case
  map.setPaintProperty("grid-active", "fill-extrusion-height", {
    property: "height",
    stops: [[0, 0], [1, 5000]]
  });
  setLayers(activeLayer);

  // Remove any open popups
  for (let pop of popups) {
    if (pop.isOpen()) {
      pop.remove();
    }
  }
  popups = [];

  map.flyTo(previousCamera, animationOptions);
  $("#back").hide();
}

function hideAllLayers() {
  gridActive.features = [];
  map.getSource("grid-active").setData(gridActive);

  for (let l of layers) {
    l += dateString;
    var c = map.getLayer(l);

    // Check if layer exists
    if (typeof c !== "undefined") {
      // Remove Date layers (only using one at a time)
      if (dateString == "Date") {
        map.removeLayer(l);
        continue;
      }

      // Set any visible layers to be invisible
      var m = map.getLayoutProperty(l, "visibility");
      if (m === "visible") {
        map.setLayoutProperty(l, "visibility", "none");
      }
    }
  }
}

function refreshPopupFocus() {
  for (let emo of emotions) {
    // Center the map on the coordinates of any clicked point from the emotion point map
    map.on("click", emo + "-point-map" + dateString, function(e) {
      map.flyTo({ center: e.features[0].geometry.coordinates });
    });

    // Change the cursor to a pointer when the it enters the point layer
    map.on("mouseenter", emo + "-point-map" + dateString, function() {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", emo + "-point-map" + dateString, function() {
      map.getCanvas().style.cursor = "";
    });
  }
}
function removeSources() {
  for (let e of emotions) {
    var emoDate = e + "Date";
    if (map.getSource(emoDate)) {
      map.removeSource(emoDate);
    }
    for (let g of granularities) {
      var emoGranDate = e + g + "-hexesDate";
      if (map.getSource(emoGranDate)) {
        map.removeSource(emoGranDate);
      }
    }
  }
}

function showLayer() {
  // Make new emotions visible
  var checked = checkboxVals();
  if (checked) {
    for (let e of checked) {
      var v = map.getLayoutProperty(
        e + "-" + grans[gran.value] + "-map" + dateString,
        "visibility"
      );
      if (v === "none") {
        map.setLayoutProperty(
          e + "-" + grans[gran.value] + "-map" + dateString,
          "visibility",
          "visible"
        );
        map.setLayoutProperty(
          e + "-" + grans[gran.value] + "-count" + dateString,
          "visibility",
          "visible"
        );
        map.setLayoutProperty(
          e + "-point-map" + dateString,
          "visibility",
          "visible"
        );
      }
      var diffGrans = findDiff(Object.values(grans), [grans[gran.value]]);
      for (let g of diffGrans) {
        map.setLayoutProperty(
          e + "-" + g + "-map" + dateString,
          "visibility",
          "none"
        );
        map.setLayoutProperty(
          e + "-" + g + "-count" + dateString,
          "visibility",
          "none"
        );
      }
    }
    gridActive.features = [];
    map.getSource("grid-active").setData(gridActive);

    // Remove popups
    for (let pop of popups) {
      if (pop.isOpen()) {
        pop.remove();
      }
    }
  }
  // Remove visibility of any unchecked emotions
  var unchecked = findDiff(emotions, checked);
  if (unchecked) {
    for (let e of unchecked) {
      var v = map.getLayoutProperty(
        e + "-" + grans[gran.value] + "-map" + dateString,
        "visibility"
      );
      if (v === "visible") {
        map.setLayoutProperty(
          e + "-" + grans[gran.value] + "-count" + dateString,
          "visibility",
          "none"
        );
        map.setLayoutProperty(
          e + "-" + grans[gran.value] + "-map" + dateString,
          "visibility",
          "none"
        );
        map.setLayoutProperty(
          e + "-point-map" + dateString,
          "visibility",
          "none"
        );
      }
    }
  }
}

document.getElementById("back").onclick = returnCamera;
gran.onchange = showLayer;

map.on("load", function() {
  map.addControl(
    new mapboxgl.NavigationControl({
      position: "top-right"
    })
  );

  // Populate map with all data
  for (let e of emotions) {
    map.addSource(e, {
      type: "geojson",
      data: "http://129.244.254.112/index?t=" + e
    });
    for (let g of granularities) {
      map.addSource(e + g + "-hexes", {
        type: "geojson",
        data: "http://129.244.254.112/newindex?name=" + g + "&t=" + e
      });
      addEmoLayer(e, g);
    }
  }

  //map.on("zoom", function() {
  //  if (activeCamera !== "inspector") {
  //    var zoom = map.getZoom();
  //    activeCamera = zoom > 14 ? "dotted" : "hexbin";
  //    var activeLayer = checkboxVals("emotion")[0];
  //    //setLayers(activeLayer);
  //  }
  //});

  // Highlight the bin
  map.addSource("grid-active", {
    type: "geojson",
    data: gridActive
  });

  map.addLayer({
    id: "grid-active",
    type: "fill-extrusion",
    source: "grid-active",
    paint: {
      "fill-extrusion-color": "#3cc",
      "fill-extrusion-opacity": {
        stops: [[14, 0.6], [15, 0.1]]
      },
      "fill-extrusion-height": {
        property: "height",
        stops: [[0, 0], [1, 5000]]
      },
      "fill-extrusion-height-transition": {
        duration: 1500
      },
      "fill-extrusion-color-transition": {
        duration: 1500
      }
    }
  });

  var activeLayer = checkboxVals();

  map.on("mousemove", function(e) {
    var currEmo = checkboxVals();
    if (currEmo.length == 1) {
      if (activeCamera == "hexbin") {
        var query = map.queryRenderedFeatures(e.point, {
          layers: [currEmo[0] + "-" + grans[gran.value] + "-map" + dateString]
        });
        if (query.length) {
          gridActive.features = [query[0]];
          var numTweets = query[0].properties[numTweets];
        } else {
          gridActive.features = [];
        }
        map.getSource("grid-active").setData(gridActive);
      }
    }
  });

  map.on("click", function(e) {
    if (activeCamera === "hexbin") {
      var currEmo = checkboxVals();
      if (currEmo.length == 1) {
        var query = map.queryRenderedFeatures(e.point, {
          layers: [currEmo[0] + "-" + grans[gran.value] + "-map" + dateString]
        });
        // it's the same hexbin as the current highlight
        if (
          query.length &&
          query[0].properties.height ===
            gridActive.features[0].properties.height
        ) {
          // UI changes
          $("#back").show();

          // prepare layers
          activeCamera = "inspector";
          setLayers(currEmo[0]);

          // Camera
          getCamera();

          var center = turf.center(gridActive);
          map.flyTo({
            center: center.geometry.coordinates,
            zoom: 14.5,
            pitch: 0,
            speed: 0.3
          });
        }
      }
    }
  });
  // Only show hexes/points for selected emotion on initial load
  var checked = checkboxVals();

  if (checked) {
    for (let e of checked) {
      var v = map.getLayoutProperty(
        e + "-" + grans[gran.value] + "-map" + dateString,
        "visibility"
      );
      if (v === "none") {
        map.setLayoutProperty(
          e + "-" + grans[gran.value] + "-map" + dateString,
          "visibility",
          "visible"
        );
        map.setLayoutProperty(
          e + "-" + grans[gran.value] + "-count" + dateString,
          "visibility",
          "visible"
        );
        map.setLayoutProperty(
          e + "-point-map" + dateString,
          "visibility",
          "visible"
        );
      }
    }
  }

  var inputs = Array.prototype.slice.call(
    document.getElementsByName("emotion")
  );
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("click", showLayer);
  }
  refreshPopupFocus();
});

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9tbGVld3UiLCJhIjoiY2pzZHo3eXZxMTE2NzQ2b2E4Y3BycHNjZyJ9.7QT62BItg33RniE2SMuBDg";

const map = new mapboxgl.Map({
  container: "map",
  //style: "mapbox://styles/tomleewu/cjsdzzt720e1y1fpn9aln8k4m",
  style: "mapbox://styles/mapbox/dark-v9",
  center: [-95.942434, 36.148201],
  zoom: 14.8
});

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

function checkboxVals(name) {
  var boxes = document.getElementsByName(name);
  var retArr = [];

  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      retArr.push(boxes[i].value);
    }
  }

  return retArr.length > 0 ? retArr : null;
}

function addEmoLayer(emo) {
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
      break;
    case "sadness":
      col1 = "rgb(241,238,246)";
      col2 = "rgb(189,201,225)";
      col3 = "rgb(116,169,207)";
      col4 = "rgb(43,140,190)";
      col5 = "rgb(4, 90, 141)";
      break;
    case "anger":
      col1 = "rgb(254,220,217)";
      col2 = "rgb(252,174,145)";
      col3 = "rgb(251,106,74)";
      col4 = "rgb(222,45,38)";
      col5 = "rgb(165, 15, 21)";
      break;
    case "fear":
      col1 = "rgb(242,240,247)";
      col2 = "rgb(203,201,226)";
      col3 = "rgb(158,154,200)";
      col4 = "rgb(117,107,177)";
      col5 = "rgb(84, 39, 143)";
      break;
  }

  map.addLayer({
    id: emo + "-map",
    type: "heatmap",
    source: emo,
    maxzoom: 17,
    layout: {
      visibility: "none"
    },
    paint: {
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 25, 22, 50],
      "heatmap-weight": {
        property: emo,
        type: "exponential",
        stops: [[0.5, 0], [1, 0.4]]
      },
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0, 0, 255, 0)",
        0.1,
        col1,
        0.3,
        col2,
        0.5,
        col3,
        0.7,
        col4,
        1,
        col5
      ],
      "heatmap-opacity": {
        default: 1,
        stops: [[16, 1], [17, 0]]
      },
      "heatmap-intensity": {
        stops: [[11, 1], [15, 3]]
      }
    }
  });
  map.addLayer({
    id: emo + "-point-map",
    type: "circle",
    source: emo,
    minzoom: 16,
    layout: {
      visibility: "none"
    },
    paint: {
      "circle-color": {
        property: "joy",
        type: "exponential",
        stops: [[0.5, col1], [0.6, col2], [0.7, col3], [0.8, col4], [0.9, col5]]
      },
      "circle-stroke-color": "white",
      "circle-stroke-width": 1,
      "circle-radius": {
        property: emo,
        type: "exponential",
        stops: [
          [{ zoom: 15, value: 0.5 }, 5],
          [{ zoom: 15, value: 1 }, 10],
          [{ zoom: 22, value: 0.5 }, 20],
          [{ zoom: 22, value: 1 }, 50]
        ]
      },
      "circle-opacity": {
        stops: [[16, 0], [17, 0.7]]
      }
    }
  });
  map.on("click", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: [emo + "-point-map"]
    });

    if (!features.length) {
      return;
    }
    var feature = features[0];
    var popup = new mapboxgl.Popup({ offset: [0, -15], anchor: "bottom" })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        "<div class=" +
          emo +
          ">" +
          "<h4>" +
          feature.properties.text +
          "</h4><p><b>" +
          emo.charAt(0).toUpperCase() +
          emo.slice(1) +
          ": </b>" +
          feature.properties[emo].toString().slice(0, 5) +
          "<p></div>"
      )
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
  });
}

map.on("load", function() {
  var emotions = ["joy", "fear", "anger", "sadness"];
  // Populate map with all data
  for (let e of emotions) {
    map.addSource(e, {
      type: "geojson",
      data: "http://129.244.254.112/index?t=" + e
    });
    addEmoLayer(e);
  }

  // Only show heatmap/points for checkboxed emotions on initial load
  var checked = checkboxVals("emotion");
  if (checked) {
    for (let e of checked) {
      var v = map.getLayoutProperty(e + "-map", "visibility");
      if (v === "none") {
        map.setLayoutProperty(e + "-map", "visibility", "visible");
        map.setLayoutProperty(e + "-point-map", "visibility", "visible");
      }
    }
  }

  var checkDiv = document.getElementsByClassName("map-overlay-inner");
  checkDiv[0].addEventListener("click", function() {
    // Make new emotions visible
    var checked = checkboxVals("emotion");
    if (checked) {
      for (let e of checked) {
        var v = map.getLayoutProperty(e + "-map", "visibility");
        if (v === "none") {
          map.setLayoutProperty(e + "-map", "visibility", "visible");
          map.setLayoutProperty(e + "-point-map", "visibility", "visible");
        }
      }
    }

    // Remove visibility of any unchecked emotions
    var unchecked = findDiff(emotions, checked);
    if (unchecked) {
      for (let e of unchecked) {
        var v = map.getLayoutProperty(e + "-map", "visibility");
        if (v === "visible") {
          map.setLayoutProperty(e + "-map", "visibility", "none");
          map.setLayoutProperty(e + "-point-map", "visibility", "none");
        }
      }
    }
  });

  for (let emo of emotions) {
    // Center the map on the coordinates of any clicked point from the emotion point map
    map.on("click", emo + "-point-map", function(e) {
      map.flyTo({ center: e.features[0].geometry.coordinates });
    });

    // Change the cursor to a pointer when the it enters the point layer
    map.on("mouseenter", emo + "-point-map", function() {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", emo + "-point-map", function() {
      map.getCanvas().style.cursor = "";
    });
  }
});

mapboxgl.accessToken =
  "pk.eyJ1IjoidG9tbGVld3UiLCJhIjoiY2pzZHo3eXZxMTE2NzQ2b2E4Y3BycHNjZyJ9.7QT62BItg33RniE2SMuBDg";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v9",
  center: [-95.992775, 36.15398],
  zoom: 12,
  pitch: 45
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
  map.addLayer({
    id: emo + "-map",
    type: "fill-extrusion",
    source: emo + "-hexes",
    maxzoom: 17,
    layout: {
      visibility: "none"
    },
    paint: {
      "fill-extrusion-height": {
        property: "height",
        stops: [[0, 0], [1, 5000]]
      },
      "fill-extrusion-color": primaryCol,
      "fill-extrusion-opacity": {
        stops: [[13, 0.6], [14, 0.1]]
      },
      "fill-extrusion-color": col5
    }
  });

  map.addLayer({
    id: emo + "-point-map",
    type: "circle",
    source: emo,
    minzoom: 14,
    layout: {
      visibility: "none"
    },
    paint: {
      "circle-color": {
        property: emo,
        type: "exponential",
        stops: [[0.0, col1], [0.2, col2], [0.4, col3], [0.6, col4], [0.8, col5]]
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

  map.addLayer({
    id: emo + "-count",
    type: "symbol",
    source: emo + "-hexes",
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

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

var previousCamera = {
  speed: 0.3
};

// const bbox = [
//   -96.27091250682199,
//   35.92788866676072,
//   -95.714637493178,
//   36.38007453323928
// ];
// const hexgrid = turf.hexGrid(bbox, 1.5);
//download(JSON.stringify(hexgrid), "1-5km.json", "text/javascript");
//
var gridActive = {
  type: "FeatureCollection",
  features: []
};

var activeCamera = "hexbin";
var animationOptions = { duration: 5000, easing: 0.4 };

function setLayers(activeLayer) {
  if (activeCamera === "hexbin") {
    map.setPaintProperty(activeLayer + "-map", "fill-extrusion-opacity", {
      stops: [[13, 0.6], [14, 0.1]]
    });
    map.setPaintProperty("grid-active", "fill-extrusion-opacity", {
      stops: [[14, 0.6], [15, 0.1]]
    });
  } else if (activeCamera === "inspector") {
    map.setPaintProperty(activeLayer + "-point-map", "circle-opacity", 0.8);
    map.setPaintProperty(activeLayer + "-map", "fill-extrusion-opacity", 0);
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
  var activeLayer = checkboxVals("emotion")[0];

  activeCamera = "hexbin";
  // exception: only for inspector > hexbin case
  map.setPaintProperty("grid-active", "fill-extrusion-height", {
    property: "height",
    stops: [[0, 0], [1, 5000]]
  });
  setLayers(activeLayer);

  map.flyTo(previousCamera, animationOptions);
  $("#back").hide();
}

document.getElementById("back").onclick = returnCamera;

map.on("load", function() {
  var emotions = ["joy", "anger", "sadness", "total"];

  // Populate map with all data
  for (let e of emotions) {
    map.addSource(e + "-hexes", {
      type: "geojson",
      data: "http://129.244.254.112/newindex?name=zero_five_km&t=" + e
      // data: "http://129.244.254.112/newindex?name=tract&t=" + e
      // data: "/index?t=" + e
    });
    map.addSource(e, {
      type: "geojson",
      data: "http://129.244.254.112/index?name=zero_five_km&t=" + e
      // data: "/index?t=" + e
    });
    addEmoLayer(e);
  }

  map.on("zoom", function() {
    if (activeCamera !== "inspector") {
      var zoom = map.getZoom();
      activeCamera = zoom > 14 ? "dotted" : "hexbin";
      var activeLayer = checkboxVals("emotion")[0];
      //setLayers(activeLayer);
    }
  });

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

  var activeLayer = checkboxVals("emotion")[0];

  map.on("mousemove", function(e) {
    var currEmo = checkboxVals("emotion");
    if (currEmo.length == 1) {
      if (activeCamera == "hexbin") {
        var query = map.queryRenderedFeatures(e.point, {
          layers: [currEmo[0] + "-map"]
        });
        if (query.length) {
          gridActive.features = [query[0]];
          var numTweets = query[0].properties[numTweets];
        }
        map.getSource("grid-active").setData(gridActive);
      }
    }
  });

  map.on("click", function(e) {
    if (activeCamera === "hexbin") {
      var currEmo = checkboxVals("emotion");
      if (currEmo.length == 1) {
        var query = map.queryRenderedFeatures(e.point, {
          layers: [currEmo[0] + "-map"]
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
            zoom: 15,
            pitch: 0,
            speed: 0.3
          });
        }
      }
    }
  });
  // Only show hexes/points for checkboxed emotions on initial load
  var checked = checkboxVals("emotion");
  console.log(checked);
  if (checked) {
    for (let e of checked) {
      var v = map.getLayoutProperty(e + "-map", "visibility");
      if (v === "none") {
        map.setLayoutProperty(e + "-map", "visibility", "visible");
        map.setLayoutProperty(e + "-count", "visibility", "visible");
        map.setLayoutProperty(e + "-point-map", "visibility", "visible");
      }
    }
  }

  var inputs = Array.prototype.slice.call(
    document.getElementsByName("emotion")
  );
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("click", function() {
      // Make new emotions visible
      var checked = checkboxVals("emotion");
      if (checked) {
        for (let e of checked) {
          var v = map.getLayoutProperty(e + "-map", "visibility");
          if (v === "none") {
            map.setLayoutProperty(e + "-count", "visibility", "visible");
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
            map.setLayoutProperty(e + "-count", "visibility", "none");
            map.setLayoutProperty(e + "-map", "visibility", "none");
            map.setLayoutProperty(e + "-point-map", "visibility", "none");
          }
        }
      }
    });
  }

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

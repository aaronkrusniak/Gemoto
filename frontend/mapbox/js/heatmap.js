mapboxgl.accessToken =
  "pk.eyJ1IjoidG9tbGVld3UiLCJhIjoiY2pzZHo3eXZxMTE2NzQ2b2E4Y3BycHNjZyJ9.7QT62BItg33RniE2SMuBDg";

const map = new mapboxgl.Map({
  container: "map",
  //style: "mapbox://styles/tomleewu/cjsdzzt720e1y1fpn9aln8k4m",
  style: "mapbox://styles/mapbox/dark-v9",
  center: [-95.942434, 36.148201],
  zoom: 14.8
});

function addEmoLayer(srcName, emo) {
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
      col1 = "rbg(241,238,246)";
      col2 = "rbg(189,201,225)";
      col3 = "rbg(116,169,207)";
      col4 = "rbg(43,140,190)";
      col5 = "rbg(4, 90, 141)";
      break;
    case "anger":
      col1 = "rbg(254,220,217)";
      col2 = "rbg(252,174,145)";
      col3 = "rbg(251,106,74)";
      col4 = "rbg(222,45,38)";
      col5 = "rbg(165, 15, 21)";
      break;
    case "fear":
      col1 = "rbg(242,240,247)";
      col2 = "rbg(203,201,226)";
      col3 = "rbg(158,154,200)";
      col4 = "rbg(117,107,177)";
      col5 = "rbg(84, 39, 143)";
      break;
  }

  map.addLayer({
    id: emo + "-map",
    type: "heatmap",
    source: srcName,
    maxzoom: 15,
    paint: {
      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 5, 22, 30],
      "heatmap-weight": {
        property: emo,
        type: "exponential",
        stops: [[0.5, 0], [1, 1]]
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
        stops: [[14, 1], [15, 0]]
      },
      "heatmap-intensity": {
        stops: [[11, 1], [15, 3]]
      }
    }
  });
  map.addLayer({
    id: emo + "-point-map",
    type: "circle",
    source: srcName,
    minzoom: 14,
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
        stops: [[14, 0], [15, 0.7]]
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
    var popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        "<h5>" +
          feature.properties.text +
          "</h5><p>" +
          feature.properties[emo] +
          "<p>"
      )
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
  });
}

map.on("load", function() {
  emotions = ["joy", "fear", "anger", "sadness"];
  // HARDCODED FOR JOY CURRENTLY
  map.addSource(emotions[0], {
    type: "geojson",
    data: "http://localhost/?m=watson&t=" + emotions[0]
  });
  addEmoLayer("joy", "joy");
});

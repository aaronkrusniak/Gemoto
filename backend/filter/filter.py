#!/usr/bin/env python3
# Authors: Benjamin T James, Tom Wu
from flask import Flask, request, jsonify
import json
import re
import time

app = Flask(__name__)

def calculateRatio(rows, rowNames):
    indices = {'sad': rowNames.index('sadness'),
               'joy': rowNames.index('joy'),
               'anger': rowNames.index('anger'),
               'fear': rowNames.index('fear')
               }
    sums = {'sad': 0, 'joy': 0, 'anger': 0, 'fear': 0}
    for r in rows:
        for i, v in indices.items():
            sums[i] += r[v]

    total = sum([v for k, v in sums.items()])
    if total > 0:
        ratios = {k: v/total for k, v in sums.items()}
        return ratios
    else:
        return sums

def calculateColor(ratio_dict):
    return "#FFFF00"

@app.route("/geo", methods=["POST"])
def geo():
    all_data = json.loads(request.data)
    rownames = all_data['rownames']
    args = all_data['args']
    areas = all_data['data']
    data = []

    for hexid, area in areas.items():
        cur = {}
        cur['geometry'] = area['geometry']
        cur['numTweets'] = len(area['rows'])
        cur['color'] = calculateColor(calculateRatio(area['rows'], rownames))
        cur['height'] = len(area['rows'])
        data.append(cur)
    return jsonify({'type': 'FeatureCollection', 'features': data})

def tmreplace(in_time):
    tm = time.strptime(in_time, '%a %b %d %H:%M:%S %z %Y')
    return time.strftime('%Y-%m-%d', tm)

def clean_tweet(tweet):
    tweet = re.sub(r"https?://\S+", "", tweet).strip()
    return tweet

def centroid_box(coords):
    list_x = [c[0] for c in coords]
    list_y = [c[1] for c in coords]
    avg_x = sum(list_x)/len(list_x)
    avg_y = sum(list_y)/len(list_y)
    return {'coordinates': [avg_x, avg_y],
            'type': 'Point'}

@app.route("/", methods=["POST"])
def handle():
    data = request.data
    status_list = json.loads(data)
    text_list = []
    for tweet in status_list:
        text_item = dict()
        properties = dict()
        # All user data is held in "properties"
        properties["text"] = clean_tweet(tweet["full_text"])
        properties["name"] = tweet["user"]["screen_name"]
        properties["id"] = tweet["id"]
        properties["date"] = tmreplace(tweet["created_at"])
        text_item["properties"] = properties
        text_item["type"] = "Feature"
        text_item["geometry"] = tweet["coordinates"]
        if not text_item["geometry"] and tweet["place"]:
            coords = tweet['place']['bounding_box']['coordinates'][0]
            text_item["geometry"] = centroid_box(coords)
        if text_item["geometry"]:
            text_list.append(text_item)
    return jsonify({"type": "FeatureCollection", "features": text_list})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

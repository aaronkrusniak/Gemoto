#!/usr/bin/env python3
# Authors: Benjamin T James, Tom Wu
from flask import Flask, request, jsonify
import json
import re

app = Flask(__name__)


def clean_tweet(tweet):
    tweet = re.sub(r"https?://\S+", "", tweet).strip()
    return tweet


@app.route("/", methods=["POST"])
def handle():
    data = request.data
    status_list = json.loads(data)
    text_list = []
    for tweet in status_list:
        text_item = dict()
        properties = dict()
        # All user data is held in "properties"
        properties["text"] = clean_tweet(tweet["text"])
        text_item["properties"] = properties
        text_item["type"] = "Feature"
        text_item["geometry"] = tweet["coordinates"]
        text_list.append(text_item)
    return jsonify({"type": "FeatureCollection", "features": text_list})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

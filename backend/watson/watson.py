#!/usr/bin/env python3
# Authors: Benjamin T James, Tom Wu
from flask import Flask, request, jsonify
import subprocess as sp
import json
import copy
import sys
from watson_developer_cloud import ToneAnalyzerV3

app = Flask(__name__)

tones = set(["anger", "fear", "joy", "sadness"])


def process(tweet_text):
    json_output = tone_analyzer.tone(
        tweet_text, content_type="text/plain", sentences=False
    )
    res = json_output.get_result()
    # Filter down various tone objects returned for given tweet
    tone_objs = [
        obj for obj in res["document_tone"]["tones"] if obj["tone_id"] in tones
    ]
    return tone_objs


# incoming data should be an array
@app.route("/", methods=["POST"])
def handle():
    args = request.args.to_dict()
    # Only support one emotion
    tone = ""
    if len(args.keys()) == 1:
        for k in args.keys():
            tone = args[k]
    data = request.data
    dataDict = json.loads(data)
    retDict = {"features": [], "type": "FeatureCollection"}
    for tweet in dataDict["features"]:
        in_text = tweet["properties"]["text"]
        tones = process(in_text)
        for obj in tones:
            if tone == obj["tone_id"]:
                # Create a copy of the tweet for each tone analyzed
                newTweet = copy.deepcopy(tweet)
                newTweet["properties"][obj["tone_id"]] = obj["score"]
                retDict["features"].append(newTweet)

    return jsonify(retDict)


if __name__ == "__main__":
    tone_analyzer = ToneAnalyzerV3(
        iam_apikey="8dwDRbTgEDH4U0ubDhuM3uRw3pGIyX5axQrlYlc35law",
        version="2017-09-21",
        url="https://gateway.watsonplatform.net/tone-analyzer/api",
    )
    app.run(debug=True, host="0.0.0.0")

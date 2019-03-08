#!/usr/bin/env python3
# Authors: Benjamin T James, Tom Wu
from flask import Flask, request, jsonify
import subprocess as sp
import json
import copy
import sys
from watson_developer_cloud import ToneAnalyzerV3

app = Flask(__name__)

tone_list = set(["anger", "fear", "joy", "sadness"])


def process(tweet_text):
    json_output = tone_analyzer.tone(
        tweet_text, content_type="text/plain", sentences=False
    )
    res = json_output.get_result()
    return {obj['tone_id']: obj['score'] for obj in res['document_tone']['tones'] if obj['tone_id'] in tone_list}


# incoming data should be an array
@app.route("/", methods=["POST"])
def handle():
    args = request.args.to_dict()
    data = request.data
    dataDict = json.loads(data)
    retDict = {"features": [], "type": "FeatureCollection"}
    for tweet in dataDict["features"]:
        in_text = tweet["properties"]["text"]
        tones = process(in_text)
        for key in tone_list: # default values
                tweet['properties'][key] = 0
        for key, val in tones.items():
                tweet['properties'][key] = val
        retDict["features"].append(tweet)
    return jsonify(retDict)


if __name__ == "__main__":
    tone_analyzer = ToneAnalyzerV3(
        iam_apikey="8dwDRbTgEDH4U0ubDhuM3uRw3pGIyX5axQrlYlc35law",
        version="2017-09-21",
        url="https://gateway.watsonplatform.net/tone-analyzer/api",
    )
    app.run(debug=True, host="0.0.0.0")

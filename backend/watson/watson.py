#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify
import subprocess as sp
import json
import sys
from watson_developer_cloud import ToneAnalyzerV3

app = Flask(__name__)

tones = set(["Anger", "Fear", "Joy", "Sadness", "Analytical", "Confident", "Tentative"])


def process(tweet_text):
    json_output = tone_analyzer.tone(
        tweet_text, content_type="text/plain", sentences=False
    )
    res = json_output.get_result()
    tone_objs = [obj for obj in res["document_tone"]["tones"]]
    tone = None
    if tone_objs:
        tone = max(tone_objs, key=lambda x: x["score"])
    return tone


# incoming data should be an array
@app.route("/", methods=["POST"])
def handle():
    data = request.data
    dataDict = json.loads(data)
    for tweet in dataDict["features"]:
        in_text = tweet["properties"]["text"]
        out_text = process(in_text)
        if out_text:
            tweet["properties"][out_text["tone_name"]] = out_text["score"]
    dataDict["features"] = [
        t for t in dataDict["features"] if set(t["properties"]) & tones
    ]
    return jsonify(dataDict)


if __name__ == "__main__":
    tone_analyzer = ToneAnalyzerV3(
        iam_apikey="8dwDRbTgEDH4U0ubDhuM3uRw3pGIyX5axQrlYlc35law",
        version="2017-09-21",
        url="https://gateway.watsonplatform.net/tone-analyzer/api",
    )
    app.run(debug=True, host="0.0.0.0")

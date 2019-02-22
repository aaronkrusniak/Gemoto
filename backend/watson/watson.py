#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify
import subprocess as sp
import json
import sys
from watson_developer_cloud import ToneAnalyzerV3

app = Flask(__name__)

def process(tweet_text):
        json_output = tone_analyzer.tone(tweet_text, content_type='text/plain', sentences=False)
        # watsonReturn = {"document_tone":{"tones":[{"score":0.6165,"tone_id":"sadness","tone_name":"Sadness"},{"score":0.829888,"tone_id":"analytical","tone_name":"Analytical"}]}}
        return json_output.get_result()

# incoming data should be an array
@app.route("/", methods=['POST'])
def handle():
        data = request.data
        dataDict = json.loads(data)
        out = []
        for tweet in dataDict["features"]:
                in_text = tweet["properties"]["text"]
                out_text = process(in_text)
                tweet["properties"]["watson"] = out_text
        return jsonify(dataDict)

if __name__ == "__main__":
        tone_analyzer = ToneAnalyzerV3(
                iam_apikey="8dwDRbTgEDH4U0ubDhuM3uRw3pGIyX5axQrlYlc35law",
                version='2017-09-21',
                url='https://gateway.watsonplatform.net/tone-analyzer/api')
        app.run(debug=True, host='0.0.0.0')

#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify
import subprocess as sp
import json
import sys

app = Flask(__name__)

def process(tweet_text):
        return "watson says: " + tweet_text

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
        app.run(debug=True, host='0.0.0.0')

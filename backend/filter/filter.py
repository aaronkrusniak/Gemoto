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
    dataDict = json.loads(data)
    status_list = dataDict["statuses"]
    text_list = [clean_tweet(tweet["text"]) for tweet in status_list]
    return jsonify(text_list)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

#!/usr/bin/env python3
# Authors: Benjamin T James, Tom Wu
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests

app = Flask(__name__)
CORS(app)


def get_filter(data):
    """POST request with tweet data (param) to filter"""
    app.logger.info("filter: " + str(len(data)) + " items")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
    response = requests.post("http://filter:5000/", headers=headers, json=data)
    p_data = json.loads(response.text)
    return p_data


def get_tweet(query, rpp=100):
    if query:
        query = "?q=" + query
    else:
        query = "?q=geocode:36.1523237,-95.94596152761295,1km"
    if rpp:
        query += "&rpp=" + str(rpp)
    app.logger.info("tweet query: " + query)
    response = requests.get("http://twitter:5000/" + query)
    app.logger.info(response)
    return json.loads(response.text)


def get_watson(tone, data):
    if tone:
        tone = "?t=" + tone
    else:
        tone = "?t=joy"
    app.logger.info("watson: " + str(len(data)) + " items")
    app.logger.info("watson tone: " + tone)
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
    response = requests.post("http://watson:5000/" + tone, headers=headers, json=data)
    p_data = json.loads(response.text)
    return p_data


def default():
    return "sample text"


@app.route("/filter", methods=["POST"])
def handle_post_filter():
    data = json.loads(request.data)
    return jsonify(get_filter(data))


@app.route("/watson", methods=["POST"])
def handle_post_watson():
    data = json.loads(request.data)
    return jsonify(get_watson(data))


@app.route("/", methods=["GET"])
def handle():
    args = request.args.to_dict()
    if "m" not in args.keys():
        return default()
    method = args["m"]
    q = ""
    if "q" in args.keys():
        q = args["q"]
    t = ""
    if "t" in args.keys():
        t = args["t"]
    if method == "twitter":
        return jsonify(get_tweet(q, 10))
    elif method == "filter":
        return jsonify(get_filter(get_tweet(q)))
    elif method == "watson":
        return jsonify(get_watson(t, get_filter(get_tweet(q))))
    else:
        return default()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

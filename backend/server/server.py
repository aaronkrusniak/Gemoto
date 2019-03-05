#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify, send_from_directory, send_file, Response
from flask_cors import CORS
import subprocess as sp
import json
import sys
import requests

app = Flask(__name__)
CORS(app)


def get_filter(data):
    """POST request with tweet data (param) to filter"""
    app.logger.info("filter: " + str(len(data)) + " items")
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
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
    with open("mapbox/index.html", "r") as fl:
        html = fl.read()
        return html


@app.route("/filter", methods=["POST"])
def handle_post_filter():
    data = json.loads(request.data)
    return jsonify(get_filter(data))


@app.route("/watson", methods=["POST"])
def handle_post_watson():
    data = json.loads(request.data)
    return jsonify(get_watson(data))


# @app.route('/<path:path>')
# def css_return(path):
#         return app.send_static_file(path)


@app.route("/style.css")
def css_return():
    with open("mapbox/style.css", "r") as fl:
        css = fl.read()
        return Response(css, mimetype="text/css")


@app.route("/js/heatmap.js")
def js_return():
    with open("mapbox/js/heatmap.js", "r") as fl:
        js = fl.read()
        return Response(js, mimetype="text/javascript")


@app.route("/heatmap.html")
def map_return():
    with open("mapbox/heatmap.html", "r") as fl:
        htmlmap = fl.read()
        return htmlmap
    # return app.send_static_file("mapbox/style.css")


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

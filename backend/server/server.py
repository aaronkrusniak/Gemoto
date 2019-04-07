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
    response = requests.post(
        "http://db_iface:5000/save_twitter", headers=headers, json=p_data
    )
    return p_data


def get_tweet(query, since_id=None, max_id=None):
    if query:
        query = "?q=" + query
    else:
        query = "?q=geocode:36.1523237,-95.94596152761295,2km"
    if since_id:
        query += "&since_id=" + since_id
    if max_id:
        query += "&max_id=" + max_id
    app.logger.info("tweet query: " + query)
    response = requests.get("http://twitter:5000/" + query)
    app.logger.info(response)
    return json.loads(response.text)


def get_n_tweets(query, num=100, since_id=None, max_id=None):
    total_data = get_tweet(query, since_id=since_id, max_id=max_id)
    while len(total_data) < num:
        data = get_tweet(query, since_id=since_id, max_id=max_id)
        if not data:
            num = len(total_data)
            break
        total_data += data
    return total_data[:num]


def get_watson(data):
    app.logger.info("watson: " + str(len(data)) + " items")
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    response = requests.post("http://watson:5000/", headers=headers, json=data)
    p_data = json.loads(response.text)
    response = requests.post(
        "http://db_iface:5000/save_watson", headers=headers, json=p_data
    )
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


def post_filter(data, emotion):
    for item in data["features"]:
        prop = item["properties"]
        item["properties"] = {"text": prop["text"], emotion: prop[emotion]}
    return data


@app.route("/index", methods=["GET"])
def get_endpoint():
    args = request.args.to_dict()
    site = "http://db_iface:5000/index"
    val = "anger"
    if "t" in args.keys() and args["t"] in ["joy", "anger", "fear", "sadness"]:
        val = args["t"]
        site += "?e=" + val
    r = requests.get(site)
    return jsonify(post_filter(json.loads(r.text), val))


@app.route("/query", methods=["GET"])
def get_db():
    args = request.args.to_dict()
    site = "http://db_iface:5000/query"
    if "db" in args.keys():
        site += "?db=" + args["db"]
    r = requests.get(site)
    return jsonify(json.loads(r.text))


@app.route("/refresh", methods=["GET"])
def get_refresh():
    args = request.args.to_dict()
    site = "http://db_iface:5000/untagged"
    r = requests.get(site)
    data = json.loads(r.text)["features"]
    if "num" in args.keys():
        number = int(args["num"])
        data = data[:number]
    geojson = {"type": "FeatureCollection", "features": data}
    return jsonify(geojson)


@app.route("/", methods=["GET"])
def handle():
    args = request.args.to_dict()
    if "m" not in args.keys():
        return default()
    method = args["m"]
    targs = {"q": "", "since_id": None, "max_id": None, "num": 100}
    if "q" in args.keys():
        targs["q"] = args["q"]
    if "since_id" in args.keys():
        targs["since_id"] = args["since_id"]
    if "max_id" in args.keys():
        targs["max_id"] = args["max_id"]
    if "num" in args.keys():
        targs["num"] = int(args["num"])
    tweets = get_n_tweets(
        targs["q"], targs["num"], since_id=targs["since_id"], max_id=targs["max_id"]
    )

    if method == "twitter":
        return jsonify(tweets)
    if method == "filter":
        return jsonify(get_filter(tweets))
    if method == "watson":
        return jsonify(get_watson(get_filter(tweets)))

    return default()


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


@app.route("/js/joy1k.js")
def joy1k():
    with open("mapbox/js/joy1k.js", "r") as fl:
        js = fl.read()
        return Response(js, mimetype="text/javascript")


@app.route("/js/anger1k.js")
def anger1k():
    with open("mapbox/js/anger1k.js", "r") as fl:
        js = fl.read()
        return Response(js, mimetype="text/javascript")


@app.route("/js/sadness1k.js")
def sadness1k():
    with open("mapbox/js/sadness1k.js", "r") as fl:
        js = fl.read()
        return Response(js, mimetype="text/javascript")


@app.route("/js/total1k.js")
def total1k():
    with open("mapbox/js/total1k.js", "r") as fl:
        js = fl.read()
        return Response(js, mimetype="text/javascript")


@app.route("/js/joy1-5k.js")
def joy15k():
    with open("mapbox/js/joy1-5k.js", "r") as fl:
        js = fl.read()
        return Response(js, mimetype="text/javascript")


@app.route("/heatmap.html")
def map_return():
    with open("mapbox/heatmap.html", "r") as fl:
        htmlmap = fl.read()
        return htmlmap
    # return app.send_static_file("mapbox/style.css")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

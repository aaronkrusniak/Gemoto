#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify, send_from_directory, send_file
import subprocess as sp
import json
import sys
import requests

app = Flask(__name__)

def get_filter(data):
        """POST request with tweet data (param) to filter"""
        app.logger.info("filter: " + str(len(data)) + " items")
        headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
        response = requests.post("http://filter:5000/", headers=headers, json=data)
        p_data = json.loads(response.text)
        return p_data

def get_tweet(query, rpp=100):
        if query:
                query = "?q=" + query
        else:
                query = '?q=geocode:36.1523237,-95.94596152761295,1km'
        if rpp:
                query += '&rpp=' + str(rpp)
        app.logger.info("tweet query: " + query)
        response = requests.get("http://twitter:5000/" + query)
        app.logger.info(response)
        return json.loads(response.text)

def get_watson(data):
        app.logger.info("watson: " + str(len(data)) + " items")
        headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
        response = requests.post("http://watson:5000/", headers=headers, json=data)
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
        if 'm' not in args.keys():
                return default()
        method = args['m']
        q = ""
        if 'q' in args.keys():
                q = args['q']
        if method == "twitter":
                return jsonify(get_tweet(q, 10))
        elif method == "filter":
                return jsonify(get_filter(get_tweet(q)))
        elif method == "watson":
                return jsonify(get_watson(get_filter(get_tweet(q))))
        else:
                return default()

if __name__ == "__main__":
        app.run(debug=True, host='0.0.0.0')

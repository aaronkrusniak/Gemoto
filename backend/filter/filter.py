#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify
import subprocess as sp
import json
import sys


app = Flask(__name__)

@app.route("/", methods=['POST'])
def handle():
        data = request.data
        dataDict = json.loads(data)
        status_list = dataDict["statuses"]
        text_list = [tweet["text"] for tweet in status_list]
        return jsonify(text_list)

if __name__ == "__main__":
        app.run(debug=True, host='0.0.0.0')

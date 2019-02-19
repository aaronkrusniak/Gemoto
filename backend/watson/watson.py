#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify
import subprocess as sp
import json
import sys


app = Flask(__name__)

# incoming data should be an array
@app.route("/", methods=['POST'])
def handle():
        data = request.data
        dataDict = json.loads(data)
#        for tweet in dataDict:
        return jsonify("my name is watson")

if __name__ == "__main__":
        app.run(debug=True, host='0.0.0.0')

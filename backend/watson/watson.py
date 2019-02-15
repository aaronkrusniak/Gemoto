#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify
import subprocess as sp
import json
import sys


app = Flask(__name__)

@app.route("/")
@app.route("/index")
def handle():
	return "my name is watson"

if __name__ == "__main__":
        app.run(debug=True, host='0.0.0.0')

#!/usr/bin/env python2
from __future__ import print_function
from flask import Flask, request, jsonify
import subprocess as sp
import json
import sys


app = Flask(__name__)

@app.route("/")
@app.route("/index")
def handle():
        q = request.args.get('q')
        print("DEBUG: \"%s\"" % q, file=sys.stderr)
        if not q:
                print("WARNING: Empty request", file=sys.stderr)
                q = 'geocode:36.1523237,-95.94596152761295,1km'
        output = sp.check_output(["twurl", "/1.1/search/tweets.json?q=" + q])
        j_out = json.loads(output)
        return jsonify(j_out)

if __name__ == "__main__":
        app.run(debug=True, host='0.0.0.0')

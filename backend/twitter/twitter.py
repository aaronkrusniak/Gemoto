#!/usr/bin/env python2
# Authors: Benjamin T James
from __future__ import print_function
from flask import Flask, request, jsonify
import subprocess as sp
import json
import sys


app = Flask(__name__)

@app.route("/")
@app.route("/index")
def handle():
        args = request.args.to_dict()
        other_arg_str = []
        q = 'geocode:36.1523237,-95.94596152761295,1km'
        for k in args.keys():
                if k == 'q':
                        q = request.args.get('q')
                else:
                        other_arg_str.append(k + "=" + args[k])

        query_str = "?q=" + q
        if len(other_arg_str) > 0:
                query_str = query_str + "&" + '&'.join(other_arg_str)
        print("DEBUG_TWITTER: " + query_str, file=sys.stderr)

        output = sp.check_output(["twurl", "/1.1/search/tweets.json" + query_str])
        j_out = json.loads(output)
        return jsonify(j_out)

if __name__ == "__main__":
        app.run(debug=True, host='0.0.0.0')

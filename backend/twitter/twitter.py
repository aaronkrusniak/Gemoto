#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify
import json
import sys
import tweepy
import geojson

app = Flask(__name__)
api = None

@app.route("/")
@app.route("/index")
def handle():
        cursor_args = {"q": 'geocode:36.1523237,-95.94596152761295,1km',
                       "rpp": 100,
                       "result_type": "recent",
                       "include_entities": True,
                       "lang": "en"
                       }
        args = request.args.to_dict()
        for k in args.keys():
                if k in cursor_args.keys():
                        cursor_args[k] = args[k]

        app.logger.info(cursor_args)
        tweets = tweepy.Cursor(api.search,
                               q=cursor_args['q'],
                               rpp=cursor_args['rpp'],
                               result_type=cursor_args['result_type'],
                               include_entities=cursor_args['include_entities'],
                               lang=cursor_args['lang']).items()
        # app.logger.info("Tweets:" + str(len(tweets)))
        obj_list = [t._json for t in tweets]
        return jsonify(obj_list)

if __name__ == "__main__":
        if len(sys.argv) != 2:
                print("Usage: %s auth_file.txt" % sys.argv[0])
                exit(1)
        with open(sys.argv[1]) as f:
                lines = [l.strip() for l in f.readlines()]
                auth = tweepy.OAuthHandler(lines[0], lines[1])
                auth.set_access_token(lines[2], lines[3])
                api = tweepy.API(auth)
        app.run(debug=True, host='0.0.0.0')

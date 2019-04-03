#!/usr/bin/env python3
# Authors: Benjamin T James
from flask import Flask, request, jsonify
import json
import math
import psycopg2
import datetime as dt

app = Flask(__name__)
conn = None


def str2date(s):
    a = s.split("-")
    return dt.date(int(a[0]), int(a[1]), int(a[2]))


def scaleEmotion(value):
    value = float(value)
    if value == 0.0:
        return str(0.0)
    oldMin = 0.5
    oldMax = 1.0

    newMax = 1.0
    newMin = 0.1

    normVal = (value - oldMin) / (oldMax - oldMin)

    normVal = 1 / (1 + math.exp(-normVal))  # Activation here

    value = newMin + normVal * (newMax - newMin)
    return value


@app.route("/recent", methods=["GET"])
def handle_get_recent():
    """Gets most recent entry, which has maximum ID value"""
    args = request.args.to_dict()
    dbname = "tweets"
    if "db" in args.keys():
        dbname = args["db"]
    sql = "SELECT * FROM %s WHERE id = (SELECT MAX(id) FROM %s);" % (dbname, dbname)
    with conn.cursor() as cursor:
        cursor.execute(sql)
        data = cursor.fetchall()
    return jsonify(data)


@app.route("/query", methods=["GET"])
def handle_query():
    args = request.args.to_dict()
    dbname = "tweets"
    if "db" in args.keys():
        dbname = args["db"]
    sql = "SELECT * FROM %s" % (dbname)
    with conn.cursor() as cursor:
        cursor.execute(sql)
        data = cursor.fetchall()
    return jsonify(data)


def unpack_tweet(item):
    return {
        "properties": {
            "id": item[0],
            "text": item[3],
            "name": item[4],
            "date": item[5],
        },
        "type": "Feature",
        "geometry": {"coordinates": [item[1], item[2]], "type": "Point"},
    }


@app.route("/load_twitter", methods=["POST"])
def load_twitter():
    sql = json.loads(request.data)["sql"]
    with conn.cursor() as cursor:
        cursor.execute(sql)
        data = cursor.fetchall()
    geojson = {"type": "FeatureCollection", "features": [unpack_tweet(i) for i in data]}
    return jsonify(geojson)


@app.route("/save_twitter", methods=["POST"])
def save_twitter():
    data = json.loads(request.data)["features"]
    app.logger.info(data)
    trans_data = [(i['properties']['id'],
                   i['geometry']['coordinates'][0],
                   i['geometry']['coordinates'][1],
                   i['properties']['text'],
                   i['properties']['name'],
                   str2date(i['properties']['date']))
                 for i in data]
    for item in trans_data:
        app.logger.info(item)
    sql = """INSERT INTO tweets(id, loc, tweet, name, post_time) VALUES(%s,ST_PointFromText('POINT(%s %s)'),%s,%s,%s) ON CONFLICT DO NOTHING"""
    with conn.cursor() as cursor:
        cursor.executemany(sql, trans_data)
    conn.commit()
    return jsonify(["OK"])


def unpack_watson(item):
    return {
        "properties": {
            "id": item[0],
            "text": item[3],
            "name": item[4],
            "date": item[5],
            "joy": scaleEmotion(item[6]),
            "anger": scaleEmotion(item[7]),
            "fear": scaleEmotion(item[8]),
            "sadness": scaleEmotion(item[9]),
        },
        "type": "Feature",
        "geometry": {"coordinates": [item[1], item[2]], "type": "Point"},
    }


@app.route("/index", methods=["GET"])
def index():
    args = request.args.to_dict()
    sql = "SELECT tweets.id, ST_X(ST_ASTEXT(loc)), ST_Y(ST_ASTEXT(loc)), tweet, name, post_time, joy, anger, fear, sadness FROM tweets, emotions WHERE tweets.id = emotions.id"
    if 'e' in args.keys():
        if args['e'] == 'joy':
            sql += ' AND emotions.joy >= 0.5'
        elif args['e'] == 'anger':
            sql += ' AND emotions.anger >= 0.5'
        elif args['e'] == 'fear':
            sql += ' AND emotions.fear >= 0.5'
        elif args['e'] == 'sadness':
            sql += ' AND emotions.sadness >= 0.5'
    with conn.cursor() as cursor:
        cursor.execute(sql)
        data = cursor.fetchall()
    geojson = {
        "type": "FeatureCollection",
        "features": [unpack_watson(i) for i in data],
    }
    return jsonify(geojson)


@app.route("/load_watson", methods=["POST"])
def load_watson():
    sql = json.loads(request.data)["sql"]
    with conn.cursor() as cursor:
        cursor.execute(sql)
        data = cursor.fetchall()
    geojson = {
        "type": "FeatureCollection",
        "features": [unpack_watson(i) for i in data],
    }
    return jsonify(geojson)


@app.route("/save_watson", methods=["POST"])
def save_watson():
    data = json.loads(request.data)["features"]

    trans_data = [
        (
            i["properties"]["id"],
            i["properties"]["joy"],
            i["properties"]["anger"],
            i["properties"]["fear"],
            i["properties"]["sadness"],
        )
        for i in data
    ]
    sql = """INSERT INTO emotions(id, joy, anger, fear, sadness) VALUES(%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING"""
    with conn.cursor() as cursor:
        cursor.executemany(sql, trans_data)
    conn.commit()
    return jsonify(["OK"])


# @app.route("/post_twitter", methods=["POST"])
# def handle_post_twitter():
#     data = request.data
#     status_list = json.loads(data)
#     sql = """INSERT INTO tweets(id, latitude, longitude, tweet, name) VALUES(%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING"""
#     with conn.cursor() as cursor:
#         cursor.executemany(sql, [(i['id'], None, None, i['text'], i['user']['screen_name']) for i in status_list])
#         cursor.commit()
#         data = cursor.fetchall()
#     return jsonify(data)


@app.route("/untagged", methods=["GET"])
def handle_get_untagged():
    with conn.cursor() as cursor:
        cursor.execute("""SELECT tweets.id,ST_X(ST_ASTEXT(loc)),ST_Y(ST_ASTEXT(loc)),tweet,name,post_time FROM tweets WHERE tweets.id NOT IN (SELECT id FROM emotions);""")
        data = cursor.fetchall()
    geojson = {"type": "FeatureCollection", "features": [unpack_tweet(i) for i in data]}
    return jsonify(geojson)


if __name__ == "__main__":
    connect_str = "dbname='gis' user='docker' host='db' password='docker'"
    conn = psycopg2.connect(connect_str)

    app.run(debug=True, host="0.0.0.0")
    with conn.cursor() as cursor:
        cursor.execute("""SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'""")
        for table in cursor.fetchall():
            app.logger.info("Table: " + table)
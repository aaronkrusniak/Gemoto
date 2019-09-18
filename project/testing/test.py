#!/usr/bin/env python3
import requests
import json

def get_tweets(site='http://129.244.254.112'):
        raw_data = requests.get(site + "/?m=filter&num=10").text
        data = json.loads(raw_data)
        with open('tweets.json', 'w') as t:
                json.dump(data, t)
        try:

                text_data = [i["properties"]['text'] for i in data["features"]]
                return len(text_data) > 0
        except:
                return False


def get_watson(site='http://129.244.254.112', tweet_file='tweets.json'):
        with open(tweet_file) as t:
                raw_data = json.load(t)
        headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
        response = requests.post(site + "/watson", headers=headers, json=raw_data)
        data = json.loads(response.text)['features']
        try:
                all_keys = set()
                for i in data:
                        for k in i["properties"]:
                                all_keys.add(k)
                return "joy" in all_keys
        except:
                return False

if __name__ == "__main__":
        print("==TEST==", "get_tweets", get_tweets())
        print("==TEST==", "get_watson", get_watson())

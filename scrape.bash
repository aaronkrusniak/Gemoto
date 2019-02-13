#!/usr/bin/env bash
#
# Author: Benjamin T James
#
# Requirements: twurl
# Install with:
# gem i twurl --source http://rubygems.org
#
# Register developer keys
# twurl authorize --consumer-key XXXXXXXXX --consumer-secret YYYYYYYYYY
#twurl authorize -u $USER -p $PASS --consumer-key $API_KEY --consumer-secret $API_SECRET_KEY
base_url='/1.1/search/tweets.json'
q_str='geocode:36.1523237,-95.94596152761295,1km'
total_str="$base_url?q=$q_str"
twurl "$base_url?q=$q_str" | python -m json.tool

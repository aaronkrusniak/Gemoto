# Gemoto backend

### To build/run:

```
docker-compose up --build
```

which serves a web server on port 80.

Currently, all "services" are reachable from the "server" service.
Examples of reaching all of them are in the request handler function.


Demo:
```
http://localhost/?m=twitter
```
returns a JSON-formatted twitter search for Tulsa campus within 1km


```
http://localhost/?m=twitter&q=search_term
```
is the same, but searches for a term,


```
http://localhost/?m=filter
```
returns a JSON list of the tweet text


Combine each:
```
http://localhost/?m=filter&q=search_term
```


Access watson (currently does nothing useful):
```
http://localhost/?m=watson
```

### Notes

The compose is live, so editing a file will refresh the server
and load the new code, which is great for development


### TODO
tweepy seems like a good package to use instead of the twurl
which seems like it can only get 15 tweets at a time

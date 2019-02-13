FROM debian
RUN apt-get update && apt-get install -y rubygems python
RUN gem i twurl --source http://rubygems.org
COPY scrape.bash .
COPY twurlrc /root/.twurlrc
CMD ["sh", "-c", "./scrape.bash"]

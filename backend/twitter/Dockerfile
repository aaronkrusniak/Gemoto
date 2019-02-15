FROM debian
RUN apt-get update && apt-get install -y rubygems python python-pip python-dev
RUN gem i twurl --source http://rubygems.org

COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r requirements.txt
COPY twurlrc /root/.twurlrc
COPY twitter.py /app
EXPOSE 5000
CMD ["python2", "/app/twitter.py"]

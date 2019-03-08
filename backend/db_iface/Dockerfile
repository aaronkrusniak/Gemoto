FROM python:3.7-alpine
COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN apk add postgresql-dev build-base musl-dev
RUN pip install -r requirements.txt
COPY . /app
EXPOSE 5000
CMD ["python3", "/app/db.py"]

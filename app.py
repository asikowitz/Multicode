from flask import Flask, render_template, request
from pymongo import MongoClient

app = Flask(__name__)

mongo = MongoClient()
db = mongo['stuff']

@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
   app.debug = True
   app.run(host="0.0.0.0",port=5678)

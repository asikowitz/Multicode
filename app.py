from flask import Flask, render_template, request
from pymongo import MongoClient
import json

app = Flask(__name__)
mongo = MongoClient()
db = mongo['filesdb']

@app.route("/")
def index():
    return render_template("index.html")

#---------------- REST CALLS ----------------------------------------

@app.route("/files")
def files():
    files = [x for x in db.files.find()]
    print files
    return json.dumps(files)

@app.route("/file",methods=['GET','POST','DELETE','PUT'])
@app.route("/file/<id>",methods=['GET','POST','DELETE','PUT'])
def file(id=None):
    method = request.method
    j = request.get_json();
    #if id ==None:
    #    id =j['content']

    if method == "GET":
        try:
            return db.files.find_one({'name':j['name']})
        except:
            return "Failure"
    
    if method == "POST" or method == "PUT":
        #j['_id']=id
        try:
            x = db.files.update({'name':j['name']},j,upsert=True)
        except:
            j.pop("_id",None)
            x = db.files.update({'name':j['name']},j)
    
    if method == "DELETE":
        x = db.files.remove({'name':j['name']})

    return json.dumps({'result':x})

if __name__ == "__main__":
   app.debug = True
   app.run(host="0.0.0.0",port=5678)

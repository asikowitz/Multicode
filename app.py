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
    return json.dumps(files)

@app.route("/file",methods=['GET','POST','DELETE','PUT'])
def file(id=None):
    method = request.method
    j = request.get_json();

    if id ==None:
        id =j['content']
        
    if method == "POST" or method == "PUT":
        j['_id']=id
        try:
            x = db.files.update({'_id':id},j,upsert=True)
        except:
            j.pop("_id",None)
            x = db.files.update({'_id':id},j)
    
    if method == "DELETE":
        x = db.notes.remove({'_id':id})

    return json.dumps({'result':x})

if __name__ == "__main__":
   app.debug = True
   app.run(host="0.0.0.0",port=5678)

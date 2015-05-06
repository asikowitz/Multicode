from flask import Flask, render_template, request
from pymongo import MongoClient
import json
import db

app = Flask(__name__)
mongo = MongoClient()
db = mongo['filesdb']

@app.route("/")
def index():
    if request.method=="GET":
        return render_template("index.html");
    
if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0",port=5678)
        
@app.route("/ufile",methods=['GET','POST','DELETE','PUT'])
@app.route("/ufile/<id>",methods=['GET','POST','DELETE','PUT'])
def ufile(id=None):
    method = request.method
    j = request.get_json();
    #print method, id, j

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


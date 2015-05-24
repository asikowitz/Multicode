from flask import Flask, render_template, request, redirect, session, flash
from pymongo import MongoClient
from functools import wraps
import json
import db, logindb

app = Flask(__name__)
mongo = MongoClient()
db = mongo['filesdb']

def authenticate(func):
    @wraps(func)
    def inner():
        if 'username' in session:
            return func()
        else:
            return redirect('/login')
    return inner

@app.route("/")
def index():
    return render_template("homepage.html")

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    button = request.form['button']
    username = request.form['username']
    password = request.form['password']
    first = request.form['first']
    last = request.form['last']
    if button == 'cancel':
        return redirect('/')
    else:
        if not password or not first or not last:
            return render_template('register.html',error='incomplete')
        criteria = {'username': username}
        if logindb.find_user(criteria):
            return render_template('register.html',error='username taken')
        else:
            user_params = {'username': username, 'password': password, 'first': first, 'last': last}
            logindb.new_user(user_params)
            session['username'] = username
            return redirect('/')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    button = request.form['button']
    username = request.form['username']
    password = request.form['password']
    if button == 'cancel':
        return redirect('/')
    else:
        criteria = {'username': username, 'password': password}
        user = logindb.find_user(criteria)
        if user:
            session['username'] = username
            return redirect('/')
        else:
            return render_template('login.html',error=True)

        
@app.route('/logout', methods=['GET','POST'])
@authenticate
def logout():
    criteria = {'username': session['username']}
    session.pop('username', None)
    #return render_template('logout.html',logged_out=True)
    flash("You have been logged out")
    return render_template("homepage.html")
    
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
    if id == None:
        id =j['name']

    if method == "GET":
        try:
            return db.files.find_one({'name':j['name']})
        except:
            return "Failure"
    
    if method == "POST" or method == "PUT":
        j['_id']=id
        try:
            x = db.files.update({'name':j['name']},j,upsert=True)
        except:
            j.pop("_id",None)
            x = db.files.update({'name':j['name']},j)
    
    if method == "DELETE":
        x = db.files.remove({'name':j['name']})

    return json.dumps({'result':x})

@app.route("/projects", methods=['GET','POST','DELETE','PUT'])
def projects(id = None):
    projects = [x for x in db.projects.find()]
    print projects
    return json.dumps(projects)

@app.route("/project", methods=['GET','POST','DELETE','PUT'])
@app.route("/project/<id>", methods=['GET','POST','DELETE','PUT'])
def project(id = None):
    method = request.method
    j = request.get_json();
    if id == None:
        id = j['name']

    if method == "GET":
        try:
            return db.projects.find_one({'name':j['name']})
        except:
            return "Failure"
    if method == "POST" or method == "PUT":
        j['_id']=id
        try:
            x = db.projects.update({'name':j['name']},j,upsert=True)
        except:
            j.pop("_id",None)
            x = db.projects.update({'name':j['name']},j)
    
    if method == "DELETE":
        x = db.projects.remove({'name':j['name']})

    return "Success"
        

if __name__ == "__main__":
    app.secret_key = 'Hola'
    app.debug = True
    print [x for x in db.files.find()]
    #app.run()
    app.run(host="0.0.0.0",port=5678)

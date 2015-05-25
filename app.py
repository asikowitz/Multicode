from flask import Flask, render_template, request, redirect, session, flash, url_for
from pymongo import MongoClient
from functools import wraps
import json
import db, logindb

app = Flask(__name__)
mongo = MongoClient()
db = mongo['filesdb']

def authenticate(func):
    @wraps(func)
    def inner(*args, **kwds):
        if 'username' in session:
            return func(*args, **kwds)
        else:
            flash("Please login")
            return redirect('/login')
    return inner

@app.route("/")
def index():
    if 'username' in session:
        return render_template("homepage.html", username=session['username'])
    else:
        return render_template("index.html")

@app.route("/editor/<project>/")
@app.route("/editor/<project>/<name>")
@authenticate
def editor(project = None, name = None):
    if project == None:
        flash("You did not select a project")
        return redirect("/")
    return render_template("project.html",project=project,name=name,username=session['username'])

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method != 'POST' and 'username' in session:
        flash("You are already logged in.")
        return redirect("/")
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
            flash("Please complete the required fields.")
            return render_template('register.html')
        criteria = {'username': username}
        if logindb.find_user(criteria):
            flash("That username has been taken. Please select another username.")
            return render_template('register.html')
        else:
            user_params = {'username': username, 'password': password, 'first': first, 'last': last}
            logindb.new_user(user_params)
            session['username'] = username
            return redirect('/')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method != 'POST' and 'username' in session:
        flash("You are already logged in.")
        return redirect("/")
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
            flash("Invalid username and password combination. Please try again.")
            return render_template('login.html')

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
    print 'file method'
    method = request.method
    if method == "GET":
        try:
            user = request.args.get('user')
            name = request.args.get('name')
            return json.dumps({'content':db.files.find_one({'name':name,'user':user})['content']})
        except:
            return "Failure"
        
    elif method == "POST" or method == "PUT":
        j = request.get_json()
        if id == None:
            id =j['name']

        j['_id']=id
        try:
            x = db.files.update({'name':j['name']},j,upsert=True)
        except:
            j.pop("_id",None)
            x = db.files.update({'name':j['name']},j)
    
    if method == "DELETE":
        x = db.files.remove({'name':j['name']})

    return json.dumps({'result':x})

@app.route("/projects/<user>", methods=['GET','POST','DELETE','PUT'])
def projects(user = None):
    projects = [x for x in db.projects.find({'user':user})]
    print "Projects",projects
    return json.dumps(projects)

@app.route("/project", methods=['GET','POST','DELETE','PUT'])
@app.route("/project/<id>", methods=['GET','POST','DELETE','PUT'])
def project(id = None):
    print 'project method'
    method = request.method

    if method == "GET":
        try:
            return db.projects.find_one({'name':j['name'],'user':j['user']})
        except:
            return "Failure"
    elif method == "POST" or method == "PUT":
        j = request.get_json()
        print j
        if id == None:
            id = j['name']
        j['_id']=id
        try:
            j['user'] = session['username']
        except:
            return json.dumps({"result":"You are not logged in"})

        if db.projects.find_one({'name':j['name'],'user':j['user']}) == None:
            try:
                x = db.projects.update({'name':j['name']},j,upsert=True)
            except:
                j.pop("_id",None)
                x = db.projects.update({'name':j['name']},j)
        else:
            return json.dumps({"result":"This project name already exists"})
            
    if method == "DELETE":
        x = db.projects.remove({'name':j['name']})

    return json.dumps({"result":"Success"})

if __name__ == "__main__":
    app.secret_key = 'Hola'
    app.debug = True
    print [x for x in db.files.find()]
    #app.run()
    app.run(host="0.0.0.0",port=5678)

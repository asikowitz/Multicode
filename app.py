from flask import Flask, render_template, request, redirect, session, flash, url_for
from pymongo import MongoClient
from functools import wraps
import json
import db, logindb

app = Flask(__name__)
app.secret_key = 'Hola'
app.debug = True
mongo = MongoClient()
db = mongo['filesdb']
print [x for x in db.files.find()]

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

@app.route("/sharing/<project>", methods=["GET","POST"])
@authenticate
def sharing(project = None): #Only creator can change sharing
    if project == None:
        flash("You did not select a project for sharing")
        return redirect("/")
    if request.method == "GET":
        user = session['username']
        users = [x['username'] for x in logindb.find_things({}) if x['username'] != user]
        shared = [x['shared'] for x in db.projects.find({'name':project,'user':user})][0] #Double list
        return render_template("sharing.html",project=project,username=user,users=users,shared=shared)
    elif request.method == "POST":
        shared = [x for x in request.form if request.form[x] == "on"]
        button = request.form['button']
        user = session['username']
        if button == "cancel":
            return redirect("/editor/"+user+"/"+project)
        elif button == "submit":
            db.projects.update({'name':project,'user':user},{"$set":{'shared':shared}}) #upsert=False
            db.files.update({'project':project,'user':user},{"$set":{'shared':shared}})
            return redirect("/editor/"+user+"/"+project)
        else:
            return redirect("/") #If someone names username button
    
@app.route("/editor/<p_user>/<project>/")
@app.route("/editor/<p_user>/<project>/<name>")
@authenticate
def editor(project = None, name = None, p_user=None):
    if project == None:
        flash("You did not select a project")
        return redirect("/")
    elif p_user == None:
        flash("Bad URL")
        return redirect("/")
    user = session['username']
    if db.files.find_one({'user':p_user,'project':project}) == None:
        flash("Create your first file")
        return redirect("/newfile/"+user+"/"+project)

    return render_template("project.html",project=project,name=name,p_user=p_user,username=session['username'])

@authenticate
@app.route("/newfile/", methods=['GET', 'POST'])
@app.route("/newfile/<p_user>/<project>", methods=['GET', 'POST'])
def newfile(project = None, p_user = None):
    if project == None:
        flash("Please select a project")
        return redirect("/")
    elif p_user == None:
        flash("Bad URL")
        return redirect("/")
    if request.method == "GET":
        return render_template("newfile.html")
    if request.method == "POST":
        button = request.form['button']
        filename = request.form['filename']
        user = session['username']
        
        if button == 'cancel':
            if db.files.find_one({'user':user,'project':project}) == None:
                return redirect("/")
            else:
                return redirect("/editor/"+user+"/"+project+"/"+filename)

        if not filename:
            flash("Please input a new file name")
            return redirect("")
        elif db.files.find_one({'user':user,'project':project,'name':filename}) == None:
            project_var = db.projects.find_one({'name':project,'user':p_user})
            shared = project_var['shared']
            p_user = project_var['user']
            db.files.insert({'_id':p_user+':'+project+':'+filename,'content':"",'shared':shared,'name':filename,'project':project,'user':p_user})
            return redirect("/editor/"+p_user+"/"+project+"/"+filename)
        else:
            flash("Filename already taken")
            return redirect("")

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
    return redirect("/")

#---------------- REST CALLS ----------------------------------------

@app.route("/files")
def files():
    try:
        user = request.args.get('user')
        project = request.args.get('project')
        files = [x for x in db.files.find({'project':project,'user':user})]
        return json.dumps(files)
    except:
        return "Failure"

@app.route("/files-share")
def files_share():
    try:
        user = request.args.get('user')
        project = request.args.get('project')
        files = [x for x in db.files.find({'project':project,'user':user})]
        print user,project,files
        files.extend([x for x in db.files.find({'project':project}) if user in x['shared']])
        return json.dumps(files)
    except:
        return "Failure"

@app.route("/file",methods=['GET','POST','DELETE','PUT'])
@app.route("/file/<id>",methods=['GET','POST','DELETE','PUT'])
def file(id=None):
    method = request.method
    if method == "GET":
        try:
            user = request.args.get('user')
            name = request.args.get('name')
            project = request.args.get('project')
            return json.dumps({'content':db.files.find_one({'name':name,'user':user,'project':project})['content']})
        except:
            return "Failure"
        
    elif method == "POST" or method == "PUT":
        j = request.get_json()
        if id == None:
            id =j['user']+":"+j['project']+":"+j['name']
        if 'shared' not in j:
            j['shared'] = []

        j['_id']=id
        try:
            x = db.files.update({'name':j['name'],'project':j['project'],'user':j['user']},{"$set":j},upsert=True)
        except:
            j.pop("_id",None)
            x = db.files.update({'name':j['name'],'project':j['project'],'user':j['user']},j)
        
    if method == "DELETE":
        x = db.files.remove({'name':j['name'],'project':j['project'],'user':j['user']})

    return json.dumps({'result':x})

@app.route("/projects/<user>", methods=['GET','POST','DELETE','PUT'])
def projects(user = None):
    projects = [x for x in db.projects.find({'user':user})]
    return json.dumps(projects)

@app.route("/projects-share/<user>", methods=['GET','POST','DELETE','PUT'])
def projects_share(user = None):
    projects = [x for x in db.projects.find({'user':user})]
    print [x for x in db.projects.find({}) if user in x['shared']]
    projects.extend([x for x in db.projects.find({}) if user in x['shared']])
    return json.dumps(projects)

@app.route("/project", methods=['GET','POST','DELETE','PUT'])
@app.route("/project/<id>", methods=['GET','POST','DELETE','PUT'])
def project(id = None):
    method = request.method

    if method == "GET":
        try:
            return db.projects.find_one({'name':j['name'],'user':j['user']})
        except:
            return "Failure"
    elif method == "POST" or method == "PUT":
        j = request.get_json()
        #print j
        if id == None:
            id = j['user']+j['name']
        if 'shared' not in j:
            j['shared'] = []
            
        j['_id']=id
        try:
            j['user'] = session['username']
        except:
            return json.dumps({"result":"You are not logged in"})

        if db.projects.find_one({'name':j['name'],'user':j['user']}) == None:
            try:
                print j,db
                x = db.projects.update({"name":j["name"]},{"$set":j},upsert=True)
            except:
                print j,db
                x = db.projects.insert(j)
        else:
            return json.dumps({"result":"This project name already exists"})
            
    if method == "DELETE":
        x = db.projects.remove({'name':j['name']})

    return json.dumps({"result":"Success"})

if __name__ == "__main__":
    app.secret_key = 'Hola'
    app.debug = True
    #print [x for x in db.files.find()]
    #app.run()
    app.run(host="0.0.0.0",port=5679)

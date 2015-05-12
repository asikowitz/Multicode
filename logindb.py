import datetime
from pymongo import MongoClient
client = MongoClient()
db = client['login']
users = db['users']

def new_user(user_params):
    user_id = users.insert(user_params)
    return user_id

def find_user(criteria):
    user = users.find_one(criteria)
    return user

def find_things(criteria):
    things = users.find(criteria)
    return things

def update_user(criteria, changeset):
    db.users.update(criteria, {'$set':changeset}, upsert=False)

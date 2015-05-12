from pymongo import MongoClient

client = MongoClient()
db = client['multicode']
code = db['code']



def save_code(newCode):
    code.update({"$set":{"newCode:newCode"}})

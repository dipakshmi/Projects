from flask import Flask,request
from flask_cors import CORS
from User_Controller import *
import json
from cerberus import Validator

app = Flask(__name__)

CORS(app)
@app.route("/user",methods=['POST'])
def create_user():
   data=request.get_json()
   user=User(data['name'],data['gender'],data['address'],data['contact'])
   um=UserManager()
   schema={'name':{'type':'string','maxlength':20,'regex':'^[a-zA-Z]+$'}}
   v = Validator(schema)

   n = {'name': data['name']}
   if v.validate(n):
      um.insert_user_details(user)
      data['id']=user.id
      return data,200
   else:
    return{"Error":"Name should contain maximum 20 characters"},400

@app.route("/user",methods=['PUT'])
def update_user():
   data=request.get_json()
   user=User(data['name'],data['gender'],data['address'],data['contact'],data['id'])
   um=UserManager()
   um.update_user_details_by_id(user)
   return data


@app.route("/deleteuser/<userId>",methods=['DELETE'])
def delete_user(userId):
   um=UserManager()
   um.delete_user_details_by_id(userId)
   return {'isDeleted':True}

@app.route("/user/<userId>",methods=['GET'])
def get_user(userId):
   um=UserManager()
   return um.get_user_by_id(userId)

@app.route("/search/<query>",methods=['GET'])
def list_user(query):
   um=UserManager()
   return um.get_user_by_query(query)

@app.route("/users",methods=['GET'])
def list_users():
   start=int(request.args.get('start',0))
   end=int(request.args.get('end',0))
   um=UserManager()
   return um.get_users(start,end)

@app.route("/datacount",methods=['GET'])
def total_data():
   um=UserManager()
   return um.total_count()


@app.route("/divide/<n>/<d>", methods=["GET"])
def method(n,d):
    try:
        result = int(n)/int(d)
    except Exception as e:
        return {"Error": "Zero division error"}, 400
    return {"result": result}, 200




 

   









if __name__ == '__main__':
   app.run(port=5002,debug = True)

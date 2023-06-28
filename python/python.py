from flask import Flask, request, jsonify
from flask_pymongo import PyMongo, ObjectId, MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv('MONGODB_URI')
mongo = PyMongo(app)
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.testData
collection = db.crud_example_data

if client:
    print('Client loaded')
else:
    print('Client failed to laoad')

# CREATE
# Example POST Request:
# http://localhost:4000/insert

# With JSON body:
# {
#     "_id": "649c1699a6236366d64844b6",
#     "field1": "field1TestValueNEW",
#     "field2": "field2TestValueNEW",
#     "field3": "field3TestValueNEW"
# }

@app.route('/insert', methods=['POST'])
def insert():
    try:   
        new_doc = {
            "field1": request.json['field1'],
            "field2": request.json['field2'],
            "field3": request.json['field3'],     
        }

        collection.insert_one(new_doc)

        return jsonify(message="Document inserted"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

# READ
# Example GET Request:
# http://localhost:4000/search?field1=field1TestValue&field2=field2TestValue

@app.route('/search', methods=['GET'])
def search():
    try:
        query = {}

        if 'field1' in request.args:
            query['field1'] = request.args['field1']
        if 'field2' in request.args:
            query['field2'] = request.args['field2']
        if 'field3' in request.args:
            query['field3'] = request.args['field3']

        data = collection.find(query)
        
        return jsonify([{"_id": str(doc["_id"]), "field1": doc["field1"], "field2": doc["field2"], "field3": doc["field3"],} for doc in data]), 200
    except Exception as e:
        return jsonify(error=str(e)), 500


# UPDATE
# Example PUT Request:
# http://localhost:4000/update

# With JSON body:
# {
#     "_id": "649c1699a6236366d64844b6",
#     "field1": "field1TestValueUpdated",
#     "field2": "field2TestValueUpdated",
#     "field3": "field3TestValueUpdated"
# }

@app.route('/update', methods=['PUT'])
def update():
    try:
        id = ObjectId(request.json['_id'])

        new_data = {
            "field1": request.json['field1'],
            "field2": request.json['field2'],
            "field3": request.json['field3'],
        }

        result = collection.replace_one({ '_id': id }, new_data)

        if result.matched_count == 0:
            return jsonify(message="No document found with that id"), 404
        else:
            return jsonify(message="Document updated"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500



# DELETE
# Example DELETE Request:
# http://localhost:4000/delete?_id=649b840893ea3ec5775396cd

@app.route('/delete', methods=['DELETE'])
def delete():
    try:
        id = ObjectId(request.args['_id'])
        
        result = collection.delete_one({ '_id': id })

        if result.deleted_count == 0:
            return jsonify(message="No document found with that id"), 404
        else:
            return jsonify(message="Document deleted"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(port=int(os.getenv('PORT', 4000)))

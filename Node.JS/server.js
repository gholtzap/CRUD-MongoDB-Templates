const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

app.use(cors());
app.use(bodyParser.json());

const url = process.env.MONGODB_URL;
const dbName = 'testData';
const collectionName = 'crud_example_data'
const client = new MongoClient(url);


// CREATE
// Example POST Request with JSON param
// http://localhost:4000/insert

/*
{
    "field1": "field1New",
    "field2": "field2New",
    "field2": "field3New"
}
*/

app.post('/insert', async (req, res) => {
    try {
        const newDoc = {
            field1: req.body.field1,
            field2: req.body.field2,
            field3: req.body.field3,
        };
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.insertOne(newDoc);

        res.json({
            message: "Document inserted",
            result: result.result,
            ops: result.ops
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while inserting data' });
    } finally {
        await client.close();
    }
});


// READ 
// Example GET Request
// http://localhost:4000/search?field1=field1TestValue&field2=field2TestValue

app.get('/search', async (req, res) => {
    try {
        console.log("Connecting to client");
        await client.connect();
        console.log("Connected to client");

        const db = client.db(dbName);
        console.log(`Using database ${dbName}`);
        const collection = db.collection(collectionName);
        console.log(`Using collection mycollection`);

        const query = {};
        if (req.query.field1) query.field1 = req.query.field1;
        if (req.query.field2) query.field2 = req.query.field2;
        if (req.query.field3) query.field3 = req.query.field3;

        console.log(`Searching with query: ${JSON.stringify(query)}`);

        const data = await collection.find(query).toArray();
        console.log(`Found ${data.length} result(s)`);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    } finally {
        await client.close();
        console.log("Client connection closed");
    }
});

// UPDATE
// Example PUT Request with JSON body
// http://localhost:4000/update

/*
{
    "_id": "your_id_here",
    "field1": "field1",
    "field2": "field2",
    "field3": "field3"
}
*/

app.put('/update', async (req, res) => {
    try {
        const id = new ObjectId(req.body._id);

        const newData = {
            field1: req.body.field1,
            field2: req.body.field2,
            field3: req.body.field3,
        };

        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.replaceOne({ _id: id }, newData);

        if (result.matchedCount === 0) {
            res.status(404).json({ message: "No document found with that id" });
        } else {
            res.json({ message: "Document updated" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating data' });
    } finally {
        await client.close();
    }
});

// DELETE
// Example DELETE Request
// http://localhost:4000/delete?_id=649b840893ea3ec5775396cd

app.delete('/delete', async (req, res) => {
    try {
        const id = new ObjectId(req.query._id);

        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            res.status(404).json({ message: "No document found with that id" });
        } else {
            res.json({ message: "Document deleted" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting data' });
    } finally {
        await client.close();
    }
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

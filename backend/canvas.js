const MongoClient = require("mongodb").MongoClient;
const mongoURL="mongodb://localhost:27017"
const ObjectID = require('mongodb').ObjectID;
var roomID="public"
var connection;
MongoClient.connect(mongoURL, function(err, db) {
  if (err) throw err;
  
  connection=db
  const dbo=connection.db(roomID)
  dbo.collection("objects").deleteMany({}, function(err, obj) { //Delete all for testing purposes
    if (err) throw err;
    console.log(obj.result.n + " document(s) deleted");
  }); //On startup, delete old objects without an type
});


function addObject(room,obj,callback){ 
  const dbo=connection.db(room)
  dbo.collection("objects").insertOne(obj, function(err, res) { 
    if (err) throw err;
    callback(err,res["insertedId"]) //Return assigned ID by mongoDB
  });
    
}

function updatePoint(room,objID,x,y){
  const dbo=connection.db(room)
  dbo.collection("objects").findOne({_id: ObjectID(objID)}, function(err, result) {
    if (err) throw err;
    if(!result){
      console.log("didn't find anything for",objID) 
      return
    }
    const update={} //Instantiate update object
    switch(result["type"]){ 
      case "free-line":
        update.$push= {points:{$each:[x,y]}}; //Add extra point for free lines
        break;
      case "straight-line":
        update.$set={points:[result["points"][0],result["points"][1],x,y]}; //Change last point for straight lines
        break;
      default:
        return; //Of unknown type: ignore
    }
    dbo.collection("objects").updateOne({_id: ObjectID(objID)}, update, function(err, result) { //Apply update, no return
      if (err) throw err;
    });
    
  });
}

function getAll(room,callback){ //Returns all objects
  const dbo=connection.db(room)
  dbo.collection("objects").find({},function(err, result) {
    if (err) throw err;
    callback(err,result);
    
  });
  
}




module.exports.add=addObject
module.exports.updatePoint = updatePoint
module.exports.load = getAll


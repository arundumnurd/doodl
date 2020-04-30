const MongoClient = require("mongodb").MongoClient;
const mongoURL="mongodb://localhost:27017"
const uuidv4 = require("uuid/v4")
var roomID="1234"
var connection;
MongoClient.connect(mongoURL, function(err, db) {
  if (err) throw err;
  
  connection=db

});


function addObject(room,obj){
  const dbo=connection.db(room)

  obj["id"]=uuidv4()
  console.log(obj)
  dbo.collection("objects").insertOne(obj, function(err, res) {
    if (err) throw err;
    console.log(obj["id"]);
  });
  return obj["id"]
    
}

function updatePoint(room,objID,x,y){
  const dbo=connection.db(room)
  console.log(objID)
  dbo.collection("objects").findOne({id:objID}, function(err, result) {
    if (err) throw err;
    const update={}
    switch(result["type"]){
      case "free-line":
        update.$push= {points:{$each:[x,y]}};
        break;
      case "straight-line":
        update.$set={points:[result["points"][0],result["points"][1],x,y]};
        break;
    }

    dbo.collection("objects").updateOne({id:objID}, update, function(err, result) {
      if (err) throw err;
    });
    
  });
}

function getAll(room,callback){

  const dbo=connection.db(room)
  dbo.collection("objects").deleteMany({type:{$exists:false}}, function(err, obj) {
    if (err) throw err;
    console.log(obj.result.n + " document(s) deleted");
  });
  console.log(dbo.collection("objects").find({}).toArray(function(err, result) {
    if (err) throw err;
    callback(err,result);
  }));
  
}




module.exports.add=addObject
module.exports.updatePoint = updatePoint
module.exports.getAll = getAll


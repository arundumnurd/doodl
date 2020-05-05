const express = require('express');
const http = require("http");
const socketIO = require("socket.io");
const canvas = require("./canvas")

const port = process.env.PORT || 5000;
const app = express();

const room = "public" //Placeholder for a single room: can branch out to multiple eventually

// our server instance
const server = http.createServer(app);
// This creates our socket using the instance of the server
const io = socketIO(server).of("public"); // Currently just have 1 public room for now


io.on("connection", socket => {
    canvas.load(room,function(err, objects) { //Send all objects on update
        console.log(objects)
        if (err) throw err;
        socket.emit("objects",objects)
        socket.emit("ready")
    })

    socket.on("update",(update) =>{ //Send all updates to canvas interface
        canvas.updatePoint(room,update["_id"],update["x"],update["y"])
        socket.broadcast.emit("update",update)
    })

    socket.on("add",(object) =>{
        //Add new drawing object to database
        //Return a new id
        canvas.add(room,object,function(err,id){
            socket.emit("newid",id)
            object["_id"]=id
            console.log(object)
            socket.broadcast.emit("add",object)
        })
        
        
        
        
    })



});


server.listen(port, () => console.log(`Listening on port ${port}`));
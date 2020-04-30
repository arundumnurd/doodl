const express = require('express');
const http = require("http");
const socketIO = require("socket.io");
const canvas = require("./canvas")

const port = process.env.PORT || 5000;
const app = express();



// our server instance
const server = http.createServer(app);
// This creates our socket using the instance of the server
const io = socketIO(server);

io.on("connection", socket => {
    //  console.log("New client connected" + socket.id);
    //console.log(socket);
    canvas.getAll("1234",function(err, objects) {
        if (err) throw err;
        objects.forEach(obj => {
            socket.emit("new", obj)
        });
        
      }
    );


    socket.on("update",(data) =>{
        canvas.updatePoint("1234",data["id"],data["x"],data["y"])
    })

    socket.on("add",(object) =>{
        //Add new drawing object to database
        //Return a new id
        socket.emit("newid",canvas.add("1234",object))
    })



});


server.listen(port, () => console.log(`Listening on port ${port}`));
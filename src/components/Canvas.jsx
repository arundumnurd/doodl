import React, { Component } from 'react';
import Konva from 'konva'
import { render } from 'react-dom';
import { Stage, Layer, Rect, Text, Circle, Line } from 'react-konva';
import socketIOClient from "socket.io-client";
import Toolbar from './Toolbar';
const penMode={
    FREE:"free",
    LINE:"line",
    GRAB:"grab",
    ERASE:"erase"
}
const socket = socketIOClient("http://localhost:5000");


function getAll(){
    var objs=[]
    socket.on("new",(data) => {
        objs.push(data)

    })
    return objs
} 



class Canvas extends Component {
    state = {  
        zoom:100,
        drawMode: penMode.FREE,
        drawingShape: {points:[],color:"#000000"},
        lines: getAll(),
        color: "#000000",
        cursor: {
            x: null,
            y: null
        },

        isDrawing: false
    }


    getMousePosition(){
        const stage=this.stageRef.getStage();
        var mousePosition=this.stageRef.getStage().getPointerPosition()
        var transform=stage.getAbsoluteTransform().copy()
        transform.invert()
        return transform.point(mousePosition)
    }

    stage_onClick = e => {
        console.log(this.state.lines)
        var mousePosition=this.getMousePosition()

        this.setState({isDrawing:true})

        switch(this.state.drawMode){
            case penMode.FREE:
                this.state.drawingShape={type:"free-line",globalCompositeOperation:'source-over',color:this.state.color,points:[mousePosition.x,mousePosition.y, mousePosition.x, mousePosition.y]}
                this.setState({lines:this.state.lines.concat(this.state.drawingShape)});
                break;
            case penMode.LINE:
                this.state.drawingShape={type:"straight-line",globalCompositeOperation:'source-over',color:this.state.color,points:[mousePosition.x,mousePosition.y,mousePosition.x,mousePosition.y]}
                this.setState({lines:this.state.lines.concat(this.state.drawingShape)});
                break;
            case penMode.GRAB:
                this.stageRef.getStage().setDraggable(true)
                break;
            case penMode.ERASE:
                this.state.drawingShape={type: "free-line",globalCompositeOperation:"destination-out", color:this.state.color,points:[mousePosition.x,mousePosition.y, mousePosition.x, mousePosition.y]}
                this.setState({lines:this.state.lines.concat(this.state.drawingShape)});
                break;
        }
        if(this.state.drawingShape){
            socket.emit("add",this.state.drawingShape)
            socket.on("newid", (data) => {this.state.drawingShape["id"]=data})
        }
    };

    stage_onMove = e => {
        
        
        var mousePosition=this.getMousePosition()

        if(this.state.isDrawing){
            var shape= this.state.drawingShape
            switch(this.state.drawMode){
                case penMode.FREE:
                    shape.points=shape.points.concat([mousePosition.x,mousePosition.y])
                    break;
                case penMode.ERASE:
                    shape.points=shape.points.concat([mousePosition.x,mousePosition.y])
                    break;
                case penMode.LINE:
                    shape.points=[shape.points[0],shape.points[1],mousePosition.x,mousePosition.y]
                    break;
            }
            this.setState({drawingShape:shape})
            if(this.state.drawingShape){
                const updateShape={id:this.state.drawingShape["id"],x:mousePosition.x,y:mousePosition.y}
                socket.emit("update",updateShape)
            }
        }
        
    };
    stage_onRelease= e => {
        this.setState({isDrawing:false})
        const stage=this.stageRef.getStage();
        this.state.drawModedrawingShape = null
        stage.setDraggable(false)

    };
    changeMode= (mode)=>{
        this.setState({drawMode:mode})
        console.log(this.state.drawMode)
    }


    render() { 
        console.log(this.state.lines)
        return (
            
        <React.Fragment>
        <Toolbar onSelect={this.changeMode}/>
        <Stage 
            width={window.innerWidth} 
            height={window.innerHeight*0.7}
            ref={ref => {
                this.stageRef = ref;
              }}
            onMouseDown = {this.stage_onClick}
            onMouseMove = {this.stage_onMove}
            onMouseUp = {this.stage_onRelease}
            onMouseLeave = {this.stage_onRelease}
            style = {{border: "solid", cursor:"crosshair"}}
            >
          <Layer>
              {this.state.lines.map(function(line){
                return <Line globalCompositeOperation={line.globalCompositeOperation} points={line.points} stroke={line.color} />
              })
              }
              {this.state.pointer}


          </Layer>
        </Stage>
        </React.Fragment>
        );
    }
}
 
export default Canvas;
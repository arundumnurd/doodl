import React, { Component } from 'react';

import { Stage, Layer, Line,Circle } from 'react-konva';
import socketIOClient from "socket.io-client";
import Toolbar from './Toolbar';
import './Canvas.css';
import uuid from "uuid";
const penMode={
    FREE:"free",
    LINE:"line",
    GRAB:"grab",
    ERASE:"erase",
    TEXT:"text"
}
const socket = socketIOClient("http://192.168.0.19:5000/public"); //public is the room name


class Canvas extends Component {
    state = {  
        zoom:100,
        drawMode: penMode.FREE,
        drawingShape: null,
        lines: [],
        penColor: "#000000",
        penSize:1,
        cursor: {
            x: 0,
            y: 0
        },
        ready:true,
        scale:1,
        isDrawing: false
    }

    componentDidMount(){
        socket.on("object",(obj) => {
            this.setState({lines:this.state.lines.concat(obj)});
        })

        socket.on("ready",() => {
            this.setState({ready:true});
        })

        socket.on("update",(update) => { //Update existing line
            for (var i=0; i < this.state.lines.length; i++) {
                if(update["_id"]==this.state.lines[i]["_id"]){
                    switch(this.state.lines[i]["type"]){
                        case "free-line":
                            this.state.lines[i]["points"]=this.state.lines[i]["points"].concat([update.point.x,update.point.y]);
                            break;
                        case "straight-line":
                            this.state.lines[i]["points"]=[this.state.lines[i]["points"][0],this.state.lines[i]["points"][1],update.point.x,update.point.y];
                            break;
                    }
                    this.forceUpdate();
                    break;
                }
            }
        })

        socket.on("add",(obj) => { //Update existing line
            this.setState({lines:this.state.lines.concat(obj)});
        })
    }


    getMousePosition(){
        const stage=this.stageRef.getStage();
        var mousePosition=this.stageRef.getStage().getPointerPosition()
        var transform=stage.getAbsoluteTransform().copy()
        transform.invert()
        this.setState({cursor:transform.point(mousePosition)})

        return this.state.cursor

    }

    stage_onClick = () => {
        const mousePosition=this.getMousePosition()

        if(this.state.drawMode==penMode.GRAB){ 
            this.stageRef.getStage().setDraggable(true) //Konva already allows canvas to be moved around: just set draggable to true
            return
        }
        
        switch(this.state.drawMode){
            //For all: onclick set the current shape to a newly created one, then add it to the end of the objects lists (lines only for now)
            case penMode.FREE:
                this.setState(
                    {drawingShape: 
                        {_id: uuid.v4(),
                        strokeWidth:this.state.penSize, 
                        type:"free-line",
                        globalCompositeOperation:'source-over',
                        color:this.state.penColor,
                        points:[mousePosition.x,mousePosition.y, mousePosition.x+1, mousePosition.y+1] //+1 to create a dot,
                        }}) 

                break;
            case penMode.LINE:
                this.setState(
                    {drawingShape: 
                        {_id: uuid.v4(),
                        strokeWidth:this.state.penSize, 
                        type:"straight-line",
                        globalCompositeOperation:'source-over',
                        color:this.state.penColor,
                        points:[mousePosition.x,mousePosition.y, mousePosition.x+1, mousePosition.y+1]}
                    }) 
                break;

            case penMode.ERASE:
                this.setState(
                    {drawingShape: 
                        {_id: uuid.v4(),
                        strokeWidth:this.state.penSize, 
                        type:"free-line",
                        globalCompositeOperation:"destination-out",
                        color:this.state.penColor,
                        points:[mousePosition.x,mousePosition.y, mousePosition.x+1, mousePosition.y+1]
                        }}) 
                break;
        }
        
        if(this.state.drawingShape){
            this.setState({lines:this.state.lines.concat(this.state.drawingShape)}); 
            socket.emit("add",this.state.drawingShape)
            this.setState({isDrawing:true})
            
        }
    };

  
    stage_onMove = () => {
        const mousePosition=this.getMousePosition()
        if(this.state.drawMode==penMode.GRAB){ //Moving canvas: already built into konva
            return
        }
        
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
                    shape.points=[shape.points[0],shape.points[1],mousePosition.x,mousePosition.y] //Simply change last point [x1, y1, x2, y2]
                    break;
            }
            this.setState({drawingShape:shape})
            socket.emit("update",{_id:this.state.drawingShape["_id"],point:mousePosition})
        }
    };
    stage_onRelease= () => {
        if(this.state.drawMode==penMode.GRAB){
            this.stageRef.getStage().setDraggable(false)
            return
        }
        this.setState({isDrawing:false})


    };
    changeMode= (mode)=>{
        this.setState({drawMode:mode})
    }
    changeColor= (color)=>{
        this.setState({ penColor: color.hex });
    }

    changeSize=(input)=>{
        this.setState({penSize:input.target.value})
    }

    stage_zoom = (wheel)=>{
        var deltaY = wheel.evt.deltaY;
        const currentScale=this.state.scale
        const scrollStep = Math.abs(deltaY/30);

        // Scrolling up
          if (deltaY < 0 && currentScale<5) {
            this.setState({scale:Math.min(5,currentScale+scrollStep)}) //Increase scale, maximum of 5
        // Scrolling down
          } else if (deltaY > 0 && currentScale>0.5) {
            this.setState({scale:Math.max(0.5,currentScale-scrollStep)}) //Decrease scale, minimum of 0.5
            
          }
          
        
        

    }


    render() {
            if(this.state.ready){
                return (
                
                    <React.Fragment>
                    <Toolbar
                        currentSize={this.state.penSize} 
                        changeSize={this.changeSize} 
                        mode={this.state.drawMode} 
                        onSelect={this.changeMode} 
                        onColorChange={this.changeColor} 
                        currentColor={this.state.penColor} 
                        style = {{background:"blue"}}/>
                    <Stage 
                        width={window.innerWidth} 
                        height={window.innerHeight*0.9}
                        scaleX={this.state.scale}
                        scaleY={this.state.scale}
                        ref={ref => {
                            this.stageRef = ref;
                        }}
                        onWheel = {this.stage_zoom}
                        onMouseDown = {this.stage_onClick}
                        onMouseMove = {this.stage_onMove}
                        onMouseUp = {this.stage_onRelease}
                        onMouseLeave = {this.stage_onRelease}
                        style = {{border: "solid", cursor:"none"}}
                        >
                    <Layer><Circle fill={this.state.penColor} stroke={this.state.penColor} radius={this.state.penSize/2} position={this.state.cursor} currentSize={this.state.penSize}/></Layer>
                    <Layer>
                        {
                        this.state.lines.map(function(line){
                            return <Line 
                            lineCap= 'round'
                            lineJoin= 'round'
                            strokeWidth={line.strokeWidth} globalCompositeOperation={line.globalCompositeOperation} points={line.points} stroke={line.color} />
                        })
                        }
                        {this.state.pointer}
                        


                    </Layer>
            
                    </Stage>
                    </React.Fragment>
                    );
            } else{
                return(<React.Fragment><h1>Loading...</h1></React.Fragment>)
            }


    }
}
 
export default Canvas;
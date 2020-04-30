import React, { Component } from 'react';
import Konva from 'konva'
import { render } from 'react-dom';
import { Line } from 'react-konva';

class line_free extends Component {
    state = {  
        color: "#000000",
        points: []
    }
    constructor(props){
        super(props)
        this.state={
            color: props.color,
            points: props.points
        }
    }
    mouseMove(mousePos){
        this.state.points.push(mousePos.x)
        this.state.points.push(mousePos.y)
    }

    render() { 
        console.log(this.state)
        return (
            <Line
                points={this.state.points}
                stroke={this.state.color}

            />        
        );
    }
}
 
export default line_free;
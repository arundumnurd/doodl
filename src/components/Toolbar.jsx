import React, { Component } from 'react';
import { SketchPicker } from 'react-color';
import './Toolbar.css';
const penMode={
    FREE:"free",
    LINE:"line",
    GRAB:"grab",
    ERASE:"erase"
}
class Toolbar extends Component {
    buttons = [
        {innerText:"free", tool: penMode.FREE},
        {innerText:"line", tool: penMode.LINE},
        {innerText:"eraser", tool: penMode.ERASE},
        {innerText:"move", tool:penMode.GRAB}
    ]
    state={
        colorMenu:false
    }

    
    optionClick= (e)=> {
        this.props.onSelect(e.target.value)
    }


    render() {
        
        const clickFunc=this.optionClick
        return (
            <div id="toolbar" >
                <ul>
                <li><h5>Mode: {this.props.mode}</h5></li>
                {this.buttons.map(function(tool){
                    return(
                        <li>
                        <button onClick={clickFunc} value={tool.tool}>
                            {tool.innerText}
                        </button>
                        </li>

                    )
                 })
                }
                <li>
                    Size
                </li>
                <li>
                    <input value={this.props.currentSize} onChange={this.props.changeSize} type="range" id="sizeSlider" min="1" max="20"/>
                </li>
                <li>
                    <button onClick={()=>{this.setState({colorMenu:!this.state.colorMenu});}} style={{background:this.props.currentColor}}></button>
                    <div style={{display: this.state.colorMenu ? 'inline' : 'none' }}>
                    <SketchPicker
                        color={ this.props.currentColor }
                        onChangeComplete={ this.props.onColorChange }
                    />
                    </div>
                </li>
                </ul>

                
            </div>
        );
    }

}
 
export default Toolbar;
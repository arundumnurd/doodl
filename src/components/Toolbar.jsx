import React, { Component } from 'react';

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
    styles={
        //css styles here
    };
    
    optionClick= (e)=> {
        console.log(e.target.value)
        this.props.onSelect(e.target.value)
    }


    render() {
        
        const clickFunc=this.optionClick
        return (
            <React.Fragment>
                <ul>
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
                </ul>
            </React.Fragment>
        );
    }

}
 
export default Toolbar;
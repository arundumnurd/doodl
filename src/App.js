import React, {Component } from 'react';
import './App.css';
import Canvas from './components/Canvas'


class App extends Component{
  componentDidMount(){
    document.title = "Doodl.io"
  }
  render() {
    return (
      <div>
      <h1>Doodl.io</h1>
      
      <Canvas />
      </div>
    );
  }
}

export default App;

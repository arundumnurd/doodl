import React, {Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Canvas from './components/Canvas'

class App extends Component{
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

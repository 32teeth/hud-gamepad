import React, { Component, Fragment } from 'react';

import './App.css';

import {GamePad, MultiKey} from 'hud-gamepad';
//const hudGamePad = require('hud-gamepad');

/*
 *
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logger:{}
    }
    // var handler = this.handler.bind(this);
  }

  componentDidMount() {
    GamePad.setup({
      start:{name:"start", key:"b"}
      ,select:{name:"select", key:"v"}
      ,trace:true
      ,debug:true
      ,hint:true
      ,buttons:[
        {name:"a", "key":"s"}
        ,{name:"b", "key":"a"}
        ,{name:"x", "key":"w"}
        ,{name:"y", "key":"q"}
      ]
    });
    MultiKey.setup(GamePad.events, "qwasbv", true)
  }

  handler(logger = {}){
    this.setState({
      logger:logger
    })
  }

  redirect(redirect) {
    this.setState({
      redirect: redirect
    })
  }

  render() {
    return (
      <Fragment>
        <div className='App'>

        </div>
      </Fragment>
    )
  }
}

export default App;

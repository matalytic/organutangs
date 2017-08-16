import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import axios from 'axios';
import Map from './components/Map.jsx';
import MeetUpForm from './components/MeetUpForm.jsx';
import Title from './components/Title.jsx';
import sampleData from './sampleData.js';
import LogoutButton from './components/LogoutButton.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ChatContainer from './components/ChatContainer.jsx'
const io = require('socket.io-client');
const socket = io();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: !!localStorage.getItem('username') || false,
      userId: localStorage.getItem('username') || '',
      // meetingLocations: [],
      meetingLocations: sampleData.sampleData,
      allMeetingLocations: sampleData.sampleData,
      displayAllLocations: false,
      midpoint: { "lat": 40.751094, "lng": -73.987597 },
      center: { "lat": 40.751094, "lng": -73.987597 }
    };

    this.showSignUp = false;

    this.setAuth = this.setAuth.bind(this);
    this.setuserId = this.setuserId.bind(this);
    // this.handleClick = this.handleClick.bind(this);
  }

  setuserId(input) {
    this.setState({userId: input});
  }

  setAuth(input) {
    this.setState({auth: input});
  }

  handleListClick(item, key) {
    console.log("item:", item, ", key:", key);
    this.setState({center: {"lat": item.coordinates.latitude, "lng": item.coordinates.longitude} })
  }

  handleMarkerClick(item, key) {
    console.log("item:", item, ", key:", key);
    this.setState({center: {"lat": item.coordinates.latitude, "lng": item.coordinates.longitude} })
  };

  handleAllLocationsToggle() {
    this.setState({displayAllLocations : !this.state.displayAllLocations})
    console.log('handleAllLocationsToggle clicked');
  }

  toggleLocations() {
    return this.state.displayAllLocations ? this.state.allMeetingLocations : this.state.meetingLocations
  }

  componentDidMount() {
    socket.on('mid meeting locations', (data) => {
      this.setState({ meetingLocations: data });
    });

    socket.on('all meeting locations', (data) => {
      this.setState({ allMeetingLocations: data });
    });

    socket.on('match status', (data) => {
      console.log('match status inside index.jsx');
    });

    socket.on('midpoint', (data) => {
      console.log('midpoint listener data', data);
      this.setState({ midpoint: data, center: data });
    });
  }

//this render method renders title,meetup,map if you're logged in, else it renders login/register components
  render () {
    return (
      <div>
      {this.state.auth ? (
        <div>
          <div className="top">
            <Title />
            <LogoutButton setuserId={this.setuserId} setAuth={this.setAuth}/>
          </div>
          <ChatContainer userId={this.state.userId} 
                         socket={ socket } />
          <MeetUpForm userId={this.state.userId}
                      socket = { socket } 
                      handleAllLocationsToggle = {this.handleAllLocationsToggle.bind(this) } />
          <div className="resultsContainer">
            <div className= "mapBox" >
              <div className="subMapBox">
                <Map
                  socket = { socket }
                  markers={ this.toggleLocations() }
                  midpoint={ this.state.midpoint }
                  center={ this.state.center }
                  containerElement={<div style={{height:100+'%'}} />}
                  mapElement={<div style={{height:100+'%'}} />}
                  handleMarkerClick={this.handleMarkerClick.bind(this)}
                />
              </div>
            </div>
            <div className="listContainer">
              <List handleClick={this.handleListClick.bind(this)} items={ this.toggleLocations() }/>
            </div>
          </div>
        </div>
      ) : (
        <div className="signInContainer">
          <div className="signInForms">
            <div className="card">
              <div className="title">Login Here!</div>
              <Login setAuth={this.setAuth} setuserId={this.setuserId}/>
            </div>
            <div className="card">
              <div className="title">New User? Register here!</div>
              <Register setAuth={this.setAuth} setuserId={this.setuserId}/>
            </div>
          </div>
        </div>
      )}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

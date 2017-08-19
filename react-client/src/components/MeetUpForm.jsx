import React from 'react';
import axios from 'axios';
import Title from './Title.jsx';
import Autocomplete from 'react-google-autocomplete';
import moment from 'moment';
// import 'rc-time-picker/assets/index.css';
import TimePicker from 'rc-time-picker';
import { LatLngToAddress } from '../../../server/utils';
import $ from 'jquery';
class MeetUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      friendId: "",
      userLocationAddress: 'Locating You...',
      status: '',
      meetUpTime: moment(),
      leaveBy: moment(),
    };

    this.getCurrentLocation = this.getCurrentLocation.bind(this);
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleFriendChange = this.handleFriendChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitFriendOrAddress = this.handleSubmitFriendOrAddress.bind(this);

    this.handleMeetUpTime = (e) => {
      //console.log('handleMeetUpTime clicked', e);
      this.setState({ meetUpTime: e });
    };

    this.handleSubmitTime = (minutes) => {
      //console.log(this.state.meetUpTime);
      this.setState({ meetUpTime: this.state.meetUpTime.add(minutes, 'minutes') });
      this.setState({ leaveBy: this.state.leaveBy.add(minutes, 'minutes') });
    };
  }

  componentDidMount() {
    this.getCurrentLocation();
    this.props.socket.on('match status', (data) => {
      this.setState({ status : data.statusMessage });
    });
    // this.setState({ meetUpTime: moment() });
  }

  componentWillReceiveProps(nextProps) {
    console.log('updated props', nextProps);
    if (!!nextProps.departure_time) {
      let minutes = -Math.floor(nextProps.departure_time / 60);
      this.setState({ leaveBy: this.state.meetUpTime.clone().add(minutes, 'minutes') });
    }
  }

  handleUserChange(event) {
    this.setState({ userId: event.target.value });
  }

  handleFriendChange(event) {
    this.setState({ friendId: event.target.value });
  }

  handleAddressChange(event) {
    this.setState({ userLocationAddress: event.target.value });
  }

  handleSubmitFriendOrAddress(e) {
    e.preventDefault();
    e.stopPropagation();


    // If the user entered an address (identified by a space)
    if (this.state.friendId.includes(' ')) {
      console.log(1);
      // socket.emit('match status', 'Searching...');
      this.setState({ status : 'Searching...' });
      this.props.socket.emit('match status', { statusMessage: 'Searching...' });
      var userId = this.props.userId;
      var location1 = { "address" : this.state.userLocationAddress, "coordinates": [0,0] };
      var location2 = { "address": this.state.friendId, "coordinates": [0,0] };
      const arrivalTime = this.state.meetUpTime.utc().valueOf();
      const { transportation } = this.props;
      axios.post('/two-locations', {
        userId,
        location1,
        location2,
        arrivalTime,
        transportation,
      }).then((res) => {
        // do something with the res
        this.setState({ status : 'Results found.' });
        // console.log('res', res)
      });
    }

    // Else the user entered a friend
    else {
      console.log(2);
      this.handleSubmit(e);
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    const arrivalTime = this.state.meetUpTime.utc().valueOf();
    const { transportation } = this.state;
    var userId = this.props.userId;
    var friendId = this.state.friendId;
    var userLocation = {
      "address" : this.state.userLocationAddress,
      "coordinates": [0,0]
    };
    // this.setState({ status: 'Looking for your friend...'});

    // If Join button is clicked, then the midpoint is reset (chat relies on checking the status of midpoint for displaying)
    this.props.resetMidpoint();

    axios.post('/meetings', {
      userId,
      friendId,
      userLocation
    })
      .then( (response) => {
        this.props.socket.emit('user looking for friend',
          {
            userId,
            friendId,
            userLocation,
            arrivalTime,
            transportation
          });
      })
      .catch( (error) => {
        console.log('error', error);
      });
  }

  getCurrentLocation() {
    this.setState( {userLocationAddress: 'Locating You...'} );
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          LatLngToAddress(position)
            .then((location) => {
              this.setState({ userLocationAddress:location.data.results[0].formatted_address })
          })
        });
    } else {
        console.log('Could not get geolocation');
    }
  }

  render(){
    return (
      <div>
        <table>
          <tbody>

          <tr>
            <div className="search">
              <p>Your name</p>
              <input type="text" value={ this.props.userId }/>
            </div>
          </tr>

          <tr>
            <div className="search">
              <p>Enter your location</p>
              <Autocomplete
                value={this.state.userLocationAddress}
                onPlaceSelected={ (place) => {
                  this.setState({ userLocationAddress: place.formatted_address })
                } }
                types={['address']}
                onChange={ this.handleAddressChange }
              />
              <img
                src="https://image.flaticon.com/icons/svg/130/130066.svg"
                className={ `transportation ${ this.props.transportation === 'bicycling' ? 'selected' : '' }` }
                name="bicycling"
                onClick={ this.props.handleTransportationChange }
              />
              <img
                src="https://image.flaticon.com/icons/svg/10/10624.svg"
                className={ `transportation ${ this.props.transportation === 'walking' ? 'selected' : '' }` }
                name="walking"
                onClick={ this.props.handleTransportationChange }
              />
              <img
                src="https://image.flaticon.com/icons/svg/310/310733.svg"
                className={ `transportation ${ this.props.transportation === 'driving' ? 'selected' : '' }` }
                name="driving"
                onClick={ this.props.handleTransportationChange }
              />

              <img
                src="https://image.flaticon.com/icons/svg/118/118753.svg"
                className="location"
                onClick={ this.getCurrentLocation }
              />
            </div>
          </tr>

          <tr>
            <div className="search">
              <p>Your friend's name or address</p>
              <Autocomplete
                placeholder="Enter a friend or location"
                value={ this.state.friendId }
                onPlaceSelected={ (place) => {
                  this.setState({ friendId: place.formatted_address })
                } }
                types={['address']}
                onChange={ this.handleFriendChange } />
            </div>
          </tr>

          <tr>
            <div className="search">
              <p>Meet up time</p>
              <row id="time-picker">
                <TimePicker
                  showSecond={false}
                  // defaultValue={this.state.meetUpTime}
                  className="meet-up-time"
                  onChange={this.handleMeetUpTime}
                  use12Hours
                  value={this.state.meetUpTime.local()}
                />
                {/* <span id="time-picker-in">add</span> */}
                <button className="submit submit-time" onClick={() => this.handleSubmitTime(10)}>+10 Minutes</button>
                <button className="submit submit-time" onClick={() => this.handleSubmitTime(-10)}>-10 Minutes</button>
              </row>
            </div>
          </tr>

          <tr>
            <div className="search">
              <p>Leave by: { this.state.leaveBy.local().format('h:mm A') }</p>
            </div>
          </tr>

          <tr>
            <button className="submit" onClick={this.handleSubmitFriendOrAddress}>Join</button>
            <div id="toggle-btn-container">
              <p>Show All Locations</p>
              <label className="switch search">
                <input type="checkbox" onChange={ this.props.handleAllLocationsToggle } />
                <span className="slider round"></span>
              </label>
            </div>
          </tr>
          <p className="messageText">{ this.state.status }</p>
          </tbody>
        </table>
      </div>
    );
  }
}

export default MeetUpForm;

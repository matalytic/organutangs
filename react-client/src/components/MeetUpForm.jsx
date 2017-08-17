import React from 'react';
import axios from 'axios';
import Title from './Title.jsx';
import Autocomplete from 'react-google-autocomplete';


class MeetUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      friendId: "",
      userLocationAddress: '',
      status: '',
      meetUpTime: ''
    };

    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleFriendChange = this.handleFriendChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitFriendOrAddress = this.handleSubmitFriendOrAddress.bind(this);

    this.handleMeetUpTime = () => {
      console.log('handleMeetUpTime clicked');
    };
  }

  componentDidMount() {
    this.props.socket.on('match status', (data) => {
      this.setState({ status : data.statusMessage });
    });
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

    // If Join button is clicked, then the midpoint is reset (chat relies on checking the status of midpoint for displaying)
    this.props.resetMidpoint();

    // If the user entered an address (identified by a space)
    if (this.state.friendId.includes(' ')) {
      console.log(1);
      // socket.emit('match status', 'Searching...');
      this.setState({ status : 'Searching...' });
      this.props.socket.emit('match status', { statusMessage: 'Searching...' });
      var userId = this.props.userId;
      var location1 = { "address" : this.state.userLocationAddress, "coordinates": [0,0] };
      var location2 = { "address": this.state.friendId, "coordinates": [0,0] };
      axios.post('/two-locations', {
        userId,
        location1,
        location2
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
    var userId = this.props.userId;
    var friendId = this.state.friendId;
    var userLocation = {
      "address" : this.state.userLocationAddress,
      "coordinates": [0,0]
    };

    // this.setState({ status: 'Looking for your friend...'});

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
            userLocation
          });
      })
      .catch( (error) => {
        console.log('error', error);
      });
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
                onPlaceSelected={ (place) => {
                  this.setState({ userLocationAddress: place.formatted_address })
                } }
                types={['address']}
                onChange={ this.handleAddressChange }
              />
            </div>
          </tr>
          <tr>
            <div className="search">
              <p>Your friend's name or address</p>
              <input type="text" value={ this.state.friendId } onChange={ this.handleFriendChange } />
            </div>
          </tr>
          <tr>
            <div className="search">
              <p>Meet up time</p>
              <input type="text" value={ this.state.meetUpTime } onChange={ this.handleMeetUpTime } />
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

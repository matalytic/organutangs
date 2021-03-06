import React from "react";
import { withGoogleMap, GoogleMap, Marker, Polyline, DirectionsRenderer } from 'react-google-maps';


class Map extends React.Component {
  constructor(props){
    super(props);
    this.state = { 
      location1: null,
      location2: null,
      directions: null
    }
  }

  componentDidMount() {
    this.props.socket.on('user locations', (data) => {
      this.setState({
        location1: data.location1,
        location2: data.location2
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const transportation = nextProps.transportation.toUpperCase();
    console.log('component updated')
    const DirectionsService = new google.maps.DirectionsService();
    
    this.state.location2 && DirectionsService.route({
      origin: this.state.location1,
      destination: this.state.location2,
      travelMode: google.maps.TravelMode[transportation],
    }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.setState({
          directions: result,
        });
      } else {
        console.error(`error fetching directions ${result}`);
      }
    });
  }

  render() {
    const markers = this.props.markers.map(function(obj,index){
      return {
        position: {
          lat: obj.coordinates.latitude,
          lng: obj.coordinates.longitude
        },
        label: obj.name,
        key: index,
        data: obj
      }
    });

    return(
      <GoogleMap 
        ref={this.props.onMapMounted}
        defaultZoom={16} 
        center={ this.props.center } 
        defaultCenter={ this.props.center } >
        { markers.map((marker, index) => {
            return(
              <Marker
                key={ marker.key }
                position={ marker.position }
                label={ marker.label }
                onClick={(e)=> this.props.handleMarkerClick(marker.data, marker.key)}
              />
            )
          }
        )}
        <Marker
          key="midpoint"
          position={ this.props.midpoint }
          label="Midpoint"
          icon={{ url: "./images/midPointIcon.png" }}
          />
        { this.state.location1 && <Marker
          key="User 1"
          position={ this.state.location1 }
          label="Your location"
          icon={{ url: "./images/user1.png" }}
        /> }
        { this.state.location2 && <Marker
          key="Friend"
          position={ this.state.location2 }
          label="Friend's location"
          icon={{ url: "./images/user2.png" }}
        /> }
        {this.state.directions && <DirectionsRenderer 
                                      directions={this.state.directions}
                                      options={ { 
                                        preserveViewport: true, 
                                        polylineOptions: { strokeColor: '#00BA6A' },
                                        markerOptions: { visible: false },
                                      } } />}
      </GoogleMap>
    )
  }
}
//higher functionality component
export default withGoogleMap(Map);

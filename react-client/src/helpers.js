export const getCurrentLocation = () => {
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
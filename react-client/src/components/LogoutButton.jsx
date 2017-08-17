import React from 'react';
import axios from 'axios';

class LogoutButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.logoutFunc = this.logoutFunc.bind(this);
  }

  //set the state of Auth to false from database req.isAuthenticated
  logoutFunc(e) {
    e.preventDefault();
    localStorage.clear();
    axios.get('/users/logout')
      .then((res)=>{
        console.log(res.data);
        this.props.setAuth(res.data[1]);
        this.props.setuserId(res.data[0]);
      })
      .catch((err)=>{
        console.log(err);
      });
  }

  render() {
    return (
      <div>
        <button className="submit" onClick={(event)=>{this.logoutFunc(event)}} name="Logout" color="#841584">Logout</button>
      </div>
    );
  }
}

export default LogoutButton;

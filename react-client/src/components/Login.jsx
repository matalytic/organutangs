import React from 'react';
import axios from 'axios';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      password: ''
    };
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.loggingIn = this.loggingIn.bind(this);
  }

  handleChangeName(event) {
    event.preventDefault();
    this.setState({userName: event.target.value});
  }

  handleChangePassword(event) {
    event.preventDefault();
    this.setState({password: event.target.value});
  }

  loggingIn(e, user, pw) {
    //this.props.setAuth(true);
    e.preventDefault();
    axios.post('/users/login', {
      username: user,
      password: pw
    })
    .then((response) =>{
      console.log("responsefrom login ", response);
      this.props.setAuth(response.data.auth); //FUCK FUCK FUCK
      this.props.setuserId(response.data.username);
      localStorage.clear();
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('user_id', response.data.user_id);
    })
    .catch(function (error) {
      console.log("error logging in ", error);
    });
  }

  render() {
    return (
    <form className="loginForm" onSubmit={(event)=>{this.loggingIn(event, this.state.userName, this.state.password)}}>
      Username:
      <input className="username" type="text" value={this.state.userName} onChange={this.handleChangeName}/>
      Password:
      <input className="password" type="password" value={this.state.password} onChange={this.handleChangePassword}/>
      <input className="submit" type="submit" value="Submit"/>
    </form>
    );
  }
}

export default Login;

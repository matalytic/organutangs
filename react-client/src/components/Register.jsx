import React from 'react';
import axios from 'axios';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      password2: '',
      msg: ''
    };
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangePassword2 = this.handleChangePassword2.bind(this);
    this.register = this.register.bind(this);
  }

  handleChangeName(event) {
    event.preventDefault();
    this.setState({username: event.target.value});
  }

  handleChangePassword(event) {
    event.preventDefault();
    this.setState({password: event.target.value});
  }

  handleChangePassword2(event) {
    event.preventDefault();
    this.setState({password2: event.target.value});
  }

  register(e, user, pw, pw2) {
    e.preventDefault();

    /** reset error msg */
    this.setState({msg: ''});

    axios.post('/users/register', {
      username: user,
      password: pw,
      password2: pw2
    })
    .then((response) =>{
      console.log("successfully registered");
      console.log(response.data);

      /** auto login user */
      axios.post('/users/login', {
        username: user,
        password: pw
      })
      .then((response) =>{
        console.log("responsefrom login ", response);
        this.props.setAuth(response.data[1]); //FUCK FUCK FUCK
        this.props.setuserId(response.data[0]);
      })
      .catch((error) => {
        console.log("error logging in ", error.response.data);
      });
    })
    .catch( (error) => {
      console.log(error.response.data);
      this.setState({msg: error.response.data});
      setTimeout(() => {
        this.setState({msg: ''});
      }, 2000);
    });
  }

  render() {
    return (
    <form className="registerForm" onSubmit={(event)=>{this.register(event, this.state.username, this.state.password, this.state.password2)}}>
      <label id="register-error-msg">{this.state.msg}</label>
      Please enter a username:
      <input className="username" type="text" value={this.state.username} onChange={this.handleChangeName}/>
      Please enter a password:
      <input className="password" type="password" value={this.state.password} onChange={this.handleChangePassword}/>
      Please confirm password:
      <input className="password2" type="password" value={this.state.password2} onChange={this.handleChangePassword2}/>
      <input className="submit" type="submit" value="Submit"/>
    </form>
    );
  }
}

export default Register;

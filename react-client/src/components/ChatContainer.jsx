import React from 'react';

class ChatContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      status : '',
      message: ''
    };
  }

  componentDidMount() {
    console.log('[ChatContainer] mounted.');
    this.props.socket.on('match status', (data) => {
      console.log('[ChatContainer] SOCKET data.', data);
      this.setState({ status : data });
    });
  }

  handleSubmitMessage(e) {

    e.preventDefault();

    // Send the message data to server via socket
    this.props.socket.emit('chat', {
      username: this.props.userId,
      message: this.chatMessageInput.value
    });

  }

  render() {

    return (
      <div id="chatContainer">
        <span>test</span>
        <div className="chatMessageDisplay">
        </div>
        <form id="chatForm" onSubmit={ (e) => this.handleSubmitMessage(e) }>
          <input className="chatMessageInput" type="text" ref={ (input) => { this.chatMessageInput = input; } }/>
          <input className="chatSendButton" type="submit" value="Send" />
        </form>
      </div>
    )
  }
}

export default ChatContainer;
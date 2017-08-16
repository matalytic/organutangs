import React from 'react';

class ChatContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      status : '',
      chatMessagesDisplay: []
    };
  }

  componentDidMount() {
    console.log('[ChatContainer] mounted.');
    this.props.socket.on('match status', (data) => {
      console.log('[ChatContainer] SOCKET data.', data);
      this.setState({ status : data });
    });

    this.props.socket.on('chat', (chatData) => {
      let newChatMessage = `${chatData.username}: ${chatData.message}`;
      let chatsArray = this.state.chatMessagesDisplay;
      console.log('type of chatsarray', typeof chatsArray, chatsArray);
      chatsArray.push(newChatMessage);
      console.log('type of chatsarray', typeof chatsArray, chatsArray);
      this.setState({ chatMessagesDisplay: chatsArray });
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
          { (this.state.chatMessagesDisplay).map((item, i) => (
              <p key={i}>{ item }</p>
            )
          )}
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
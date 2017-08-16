import React from 'react';

class ChatContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      status : '',
      chatMessagesDisplay: [],
      matchRoom: ''
    };
  }

  componentDidMount() {
    console.log('[ChatContainer] mounted.');

    // if there is a match, the socket will let us know the room and the status message
    this.props.socket.on('match status', (data) => {

      console.log('[Chat listen on matchstatus]. SOCKET data.', data);

      this.setState({ status : data.statusMessage });
      this.setState({ matchRoom: data.matchRoom });
    });

    // Listen for the room's chat data
    this.props.socket.on('chat', (chatData) => {
      console.log('[Chat listen on chat]. CLIENT RECEIVE CHAT Broadcast', chatData);

      let newChatMessage = `${chatData.username}: ${chatData.message}`;
      let chatsArray = this.state.chatMessagesDisplay;
      chatsArray.push(newChatMessage);
      // console.log('[Chat listen on chat]. updateChatsArray:', chatsArray);
      this.setState({ chatMessagesDisplay: chatsArray });
    });
  }

  componentWillReceiveProps(nextProps) {
    // Clear the chat when Join button is clicked
    if (nextProps.midpoint === null) {
      this.setState({chatMessagesDisplay: []});
    }
  }

  handleSubmitMessage(e) {

    e.preventDefault();

    console.log('click send. should go to room', this.state.matchRoom);

    // Send the message data to server via socket
    this.props.socket.emit(this.state.matchRoom, {
      username: this.props.userId,
      message: this.chatMessageInput.value
    });

    // clear chat input
    e.target.reset();
  }

  render() {
    let chatTitle = '';

    // when the Join button is clicked, midpoint will be null
    if (this.props.midpoint === null ) {
      // reset chat
      chatTitle = 'Waiting for friend...';

    } else {
      chatTitle = 'Chat';
    }

    return (
      <div id="chatContainer">
        <div>{ chatTitle }</div>
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
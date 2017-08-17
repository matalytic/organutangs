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

    // if there is a match, the socket will let us know the room and the status message
    this.props.socket.on('match status', (data) => {

      console.log('[Chat listen on matchstatus]. SOCKET data.', data);

      this.setState({ status : data.statusMessage });
      this.setState({ matchRoom: data.matchRoom });
    });

    // Listen for the room's chat data
    this.props.socket.on('chat', (chatData) => {
      console.log('[Chat listen on chat]. Receive chat:', chatData);
      
      // if database sends back an array of messages
      if (Array.isArray(chatData)) {

        let newChatLoad = [];

        for (let message of chatData) {
          let formatTime = new Date(message.timestamp).toLocaleTimeString();
          let newChatMessage = `${message.fromUser} [${formatTime}]: ${message.msg}`;
          newChatLoad.push(newChatMessage);
        }

        this.setState({ chatMessagesDisplay: newChatLoad }, function() {

        });
        

      // if a live message is sent as an object
      } else {
        let updatedChats = this.state.chatMessagesDisplay;
        let formatTime = new Date(chatData.timestamp).toLocaleTimeString();
        let newChatMessage = `${chatData.fromUser} [${formatTime}]: ${chatData.msg}`;
        updatedChats.push(newChatMessage);

        this.setState({ chatMessagesDisplay: updatedChats });
      }

    });
  }

  componentWillReceiveProps(nextProps) {
    // Clear the chat when Join button is clicked
    // if (nextProps.midpoint === null) {
    //   this.setState({chatMessagesDisplay: []});
    // }
  }

  handleSubmitMessage(e) {

    e.preventDefault();

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
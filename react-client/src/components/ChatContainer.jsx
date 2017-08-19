import React from 'react';

class ChatContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      status : '',
      chatMessagesDisplay: [],
      matchRoom: '',
      shouldBeHidden: true,
      matchUser: '',
      newMessage: false
    };

    this.handleToggleChat = this.handleToggleChat.bind(this);
  }

  componentDidMount() {

    // if there is a match, the socket will let us know the room and the status message
    this.props.socket.on('match status', (data) => {

      // get the toUser and fromUser from the matchRoom name
      var names = data.matchRoom.split('-');
      var fromUserIndex = names.indexOf(this.props.userId);
      var toUserIndex = fromUserIndex === 0 ? 1 : 0;
      var toUsername = names[toUserIndex];

      this.setState({ 
        status : data.statusMessage,
        matchRoom: data.matchRoom,
        matchUser: toUsername
      });
    });

    // Listen for the room's chat data
    this.props.socket.on('chat', (chatData) => {

      // if database sends back an array of messages
      if (Array.isArray(chatData)) {

        let newChatLoad = [];

        for (let message of chatData) {
          let formatTime = new Date(message.timestamp).toLocaleTimeString();
          let newChatMessage = `${message.fromUser} [${formatTime}]: ${message.msg}`;
          newChatLoad.push(newChatMessage);
        }

        this.setState({ 
          chatMessagesDisplay: newChatLoad
        }, function() {
          this.chatDiv.scrollTop = this.chatDiv.scrollHeight;
        });
        

      // if a live message is sent as an object
      } else {
        let updatedChats = this.state.chatMessagesDisplay;
        let formatTime = new Date(chatData.timestamp).toLocaleTimeString();
        let newChatMessage = `${chatData.fromUser} [${formatTime}]: ${chatData.msg}`;
        updatedChats.push(newChatMessage);

        this.setState({ chatMessagesDisplay: updatedChats });

        this.chatDiv.scrollTop = this.chatDiv.scrollHeight;

        // if the chat window is currently closed, update newMessage state
        if (this.isChatToggled.checked === false) {
          this.setState({ newMessage: true });
        }
      }

    });
  }

  componentWillReceiveProps(nextProps) {
    // When Join button is clicked
    if (nextProps.midpoint === null) {
      this.setState({shouldBeHidden: false}, function() {
        console.log('unhiding chat');
      });
    }
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
    this.sendMessageButton.disabled = true;
  }

  handleTypeMessage(e) {
    if (e.target.value === "") {
      this.sendMessageButton.disabled = true;
    } else {
      this.sendMessageButton.disabled = false;
    }
  }

  handleToggleChat() {
    if (this.isChatToggled.checked === true) {
      this.setState({newMessage : false});
      this.chatDiv.scrollTop = this.chatDiv.scrollHeight;
    }
  }

  render() {
    let chatTitle = '';

    // when the Join button is clicked, midpoint will be null
    if (this.props.midpoint === null ) {
      chatTitle = 'Waiting for friend...';

    } else {
      chatTitle = 'Chat with ' + this.state.matchUser;
    }

    // Chat view is hidden initially
    if (this.state.shouldBeHidden) {
      return (
        <div></div>
      )

    // if click Join (with a friend username), chat will be opened
    } else {
      return (
        <div id="chatContainer">
          <input type="checkbox" 
                 ref={ checkboxInput => this.isChatToggled = checkboxInput }
                 onChange = { this.handleToggleChat } />
          <label data-expanded="" data-collapsed=""></label>
          { this.state.newMessage === true && 
            <div className="chatNotification"></div>
          }
          <div className="chatContainerContent">
            <div>{ chatTitle }</div>
            <div className="chatMessageDisplay" ref={ chatDiv => { this.chatDiv = chatDiv; }}>
              { (this.state.chatMessagesDisplay).map((item, i) => (
                  <p key={i}>{ item }</p>
                )
              )}
            </div>
            <form id="chatForm" onSubmit={ (e) => this.handleSubmitMessage(e) }>
              <input className="chatMessageInput"
                     type="text"
                     ref={ (input) => { this.chatMessageInput = input; } }
                     onChange = { (e) => this.handleTypeMessage(e) } />
              <input className="chatSendButton"
                     type="submit"
                     value="Send"
                     disabled="true"
                     ref={ button => this.sendMessageButton = button }/>
            </form>
          </div>
        </div>
      )
      
    }

  }
}

export default ChatContainer;
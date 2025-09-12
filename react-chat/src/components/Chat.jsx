import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4004'); // adjust if hosted elsewhere

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Listen for incoming messages
    socket.on('onMessage', (data) => {
      setMessages((prev) => [...prev, { type: 'message', text: data.message }]);
    });

    socket.on('user-joined', (data) => {
      setMessages((prev) => [...prev, { type: 'info', text: data.message }]);
    });

    socket.on('user-left', (data) => {
      setMessages((prev) => [...prev, { type: 'info', text: data.message }]);
    });

    return () => {
      socket.off('onMessage');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('newMessage', input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={styles.container}>
      <h2>Simple Chat</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.type === 'info' ? styles.infoMsg : styles.chatMsg}>
            {msg.text}
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '400px',
    margin: '50px auto',
    fontFamily: 'Arial, sans-serif',
  },
  chatBox: {
    border: '1px solid #ccc',
    height: '300px',
    padding: '10px',
    overflowY: 'auto',
    backgroundColor: '#f9f9f9',
    marginBottom: '10px',
  },
  chatMsg: {
    marginBottom: '8px',
  },
  infoMsg: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: '8px',
  },
  inputArea: {
    display: 'flex',
  },
  input: {
    flex: 1,
    padding: '8px',
    fontSize: '16px',
  },
  button: {
    padding: '8px 16px',
    fontSize: '16px',
    marginLeft: '8px',
  },
};

export default ChatApp;

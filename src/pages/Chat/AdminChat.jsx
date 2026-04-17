import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const AdminChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [roomId, setRoomId] = useState(''); 
  
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser = sessionStorage.getItem("username"); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = async () => {
    if (!isOpen) {
      try {
        const token = sessionStorage.getItem("accessToken"); 
        
        const axiosConfig = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const roomRes = await axios.post('/api/chat/room/admin', {
        },axiosConfig);
        
        let realRoomId = roomRes.data.roomId;
        if (currentUser === "admin") {
          realRoomId = "0b4c63e1-16da-4051-abb1-302048f8f733"; 
        }
        setRoomId(realRoomId);

        const historyRes = await axios.get(`/api/chat/room/${realRoomId}/messages`);
        setMessages(historyRes.data);

        connectStomp(realRoomId); 

      } catch (error) {
        console.error("고객센터 방 생성 및 연결 실패:", error);
      }
    } else {
      disconnectStomp();
    }
    setIsOpen(!isOpen);
  };

  const connectStomp = (currentRoomId) => {

    const token = sessionStorage.getItem("accessToken");
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws-chat'),
      connectHeaders: {
        Authorization: `Bearer ${token}` 
      },
      onConnect: () => {
        client.subscribe(`/sub/chat/room/${currentRoomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
      },
    });

    client.activate();
    stompClient.current = client;
  };

  const disconnectStomp = () => {
    if (stompClient.current) {
      stompClient.current.deactivate();
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() !== '' && stompClient.current && stompClient.current.connected && roomId) {
      const messageData = {
        roomId: roomId,
        sender: currentUser,
        content: inputMessage
      };

      stompClient.current.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(messageData),
      });

      setInputMessage('');
    }
  };

  return (
    <div className="admin-chat-wrapper">
      <div className={`admin-chat-modal ${isOpen ? 'open' : ''}`}>
        <div className="admin-chat-header">
          <div className="header-info">
            <i className="fas fa-headset"></i>
            <div>
              <h3>환승마켓 고객센터</h3>
              <p>무엇을 도와드릴까요?</p>
            </div>
          </div>
          <button className="close-btn" onClick={toggleChat}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="admin-chat-body">
          {messages.length === 0 && (
            <div className="empty-message">
              <i className="far fa-comment-dots"></i>
              <p>관리자에게 문의를 남겨주세요.<br/>(현재 관리자 시스템 점검 중)</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble-wrap ${msg.sender === currentUser ? 'me' : 'admin'}`}>
              <div className="chat-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="admin-chat-footer">
          <input 
            type="text" 
            placeholder="메시지를 입력하세요..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={!roomId}
          />
          <button onClick={sendMessage} disabled={!inputMessage.trim() || !roomId}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      <button className="admin-chat-fab" onClick={toggleChat}>
        {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
      </button>
    </div>
  );
};

export default AdminChat;
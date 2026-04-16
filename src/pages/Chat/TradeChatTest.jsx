import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const TradeChatTest = () => {
  const mockProduct = {
    itemId: 101, 
    title: "맥북 프로 16인치 M3 팝니다",
    sellerId: "admin",
    price: "2,500,000원"
  };

  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser = sessionStorage.getItem("username"); 
  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const startTradeChat = async () => {
    try {
      const res = await axios.post('/api/chat/room/trade', {
        itemId: mockProduct.itemId,
        sellerId: mockProduct.sellerId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const realRoomId = res.data.roomId;
      setRoomId(realRoomId);

      const historyRes = await axios.get(`/api/chat/room/${realRoomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(historyRes.data);

      connectStomp(realRoomId);
      setIsOpen(true);

    } catch (error) {
      console.error("중고거래 방 생성 실패:", error);
    }
  };

  const connectStomp = (currentRoomId) => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws-chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/sub/chat/room/${currentRoomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      }
    });
    client.activate();
    stompClient.current = client;
  };

  const closeChat = () => {
    if (stompClient.current) stompClient.current.deactivate();
    setIsOpen(false);
  };

  const sendMessage = () => {
    if (inputMessage.trim() !== '' && stompClient.current?.connected && roomId) {
      const messageData = {
        roomId: roomId,
        senderId: currentUser,
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
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      
      <h2>임시 상품 상세 페이지 (테스트용)</h2>
      <div style={{ border: '1px solid #ddd', padding: '20px', width: '300px', borderRadius: '8px' }}>
        <h3>{mockProduct.title}</h3>
        <p style={{ color: 'gray' }}>판매자: {mockProduct.sellerId}</p>
        <p style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{mockProduct.price}</p>
        <button 
          onClick={startTradeChat} 
          style={{ width: '100%', padding: '10px', backgroundColor: '#ff6f0f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          채팅으로 거래하기
        </button>
      </div>

      <div className="admin-chat-wrapper">
        <div className={`admin-chat-modal ${isOpen ? 'open' : ''}`}>
          
          <div className="admin-chat-header">
            <div className="header-info">
              <i className="fas fa-store"></i>
              <div>
                <h3>{mockProduct.sellerId} 님과의 대화</h3>
                <p>{mockProduct.title}</p>
              </div>
            </div>
            <button className="close-btn" onClick={closeChat}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="admin-chat-body">
            {messages.length === 0 && (
              <div className="empty-message">
                <i className="far fa-comment-dots"></i>
                <p>판매자에게 인사해보세요!</p>
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
            />
            <button onClick={sendMessage} disabled={!inputMessage.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default TradeChatTest;
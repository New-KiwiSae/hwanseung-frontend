import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
// import './AdminChat.css'; // 🚨 기존 CSS 꼭 임포트 유지!

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const [activeRoom, setActiveRoom] = useState(null); 

  const [chatRooms, setChatRooms] = useState([
    { roomId: "1", buyerId: "apple_lover", itemName: "아이폰 15 Pro", unreadCount: 2, lastMessage: "네고 가능한가요?" },
    { roomId: "2", buyerId: "camp_master", itemName: "캠핑 의자", unreadCount: 0, lastMessage: "내일 거래 가능합니다!" },
    { roomId: "admin-room", buyerId: "환승마켓 고객센터", itemName: "1:1 문의", unreadCount: 0, lastMessage: "무엇을 도와드릴까요?" }
  ]);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser = "es"; 
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  // 🚀 동그란 플로팅 버튼을 눌렀을 때의 동작 (기존 AdminChat 방식!)
  const toggleChat = () => {
    if (isOpen) {
      // 열려있는데 누르면? -> 닫으면서 연결 끊고 초기화!
      if (stompClient.current) stompClient.current.deactivate();
      setActiveRoom(null); 
      setIsOpen(false);
    } else {
      // 닫혀있는데 누르면? -> 목록 창 열기!
      setIsOpen(true);
    }
  };

  const enterRoom = async (room) => {
    setActiveRoom(room); 
    setMessages([]); 

    try {
      // const historyRes = await axios.get(`http://localhost/api/chat/room/${room.roomId}/messages`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setMessages(historyRes.data);

      connectStomp(room.roomId);
    } catch (error) {
      console.error("대화 기록 불러오기 실패:", error);
    }
  };

  const backToList = () => {
    if (stompClient.current) {
      stompClient.current.deactivate(); 
    }
    setActiveRoom(null); 
  };

  const connectStomp = (currentRoomId) => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost/ws-chat'),
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

  const sendMessage = () => {
    if (inputMessage.trim() !== '' && stompClient.current?.connected && activeRoom) {
      const messageData = {
        roomId: activeRoom.roomId,
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
    <div className="admin-chat-wrapper">
      
      {/* 1. 플로팅 모달창 */}
      <div className={`admin-chat-modal ${isOpen ? 'open' : ''}`}>
        
        {/* === 상태 1: 채팅 목록 화면 === */}
        {!activeRoom ? (
          <>
            <div className="admin-chat-header" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>내 채팅방</h3>
              <button className="close-btn" onClick={toggleChat}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="admin-chat-body" style={{ padding: '0', backgroundColor: '#fff' }}>
              {chatRooms.map((room) => (
                <div 
                  key={room.roomId} 
                  onClick={() => enterRoom(room)}
                  style={{ 
                    padding: '15px', 
                    borderBottom: '1px solid #eee', 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold' }}>{room.buyerId}</span>
                    {room.unreadCount > 0 && (
                      <span style={{ backgroundColor: '#ff6f0f', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '0.8em', fontWeight: 'bold' }}>
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#888', marginBottom: '3px' }}>
                    [{room.itemName}]
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {room.lastMessage}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          
        /* === 상태 2: 채팅방 내부 화면 === */
          <>
            <div className="admin-chat-header" style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={backToList} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', marginRight: '10px' }}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="header-info" style={{ flex: 1 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px' }}>{activeRoom.buyerId}</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>{activeRoom.itemName}</p>
                </div>
              </div>
              <button className="close-btn" onClick={toggleChat}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="admin-chat-body">
              {messages.length === 0 && (
                <div className="empty-message">
                  <p>대화를 시작해보세요!</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`chat-bubble-wrap ${msg.senderId === currentUser ? 'me' : 'admin'}`}>
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
          </>
        )}
      </div>

      {/* 2. 🚨 사용자가 원했던 기존 플로팅 둥근 버튼 적용! */}
      <button className="admin-chat-fab" onClick={toggleChat}>
        {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
      </button>

    </div>
  );
};

export default FloatingChat;
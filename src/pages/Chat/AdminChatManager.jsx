import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import styles from "../Admin/AdminContent.module.css";

const AdminChatManager = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser = sessionStorage.getItem("username") || "admin"; 
  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/chat/admin/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data);
    } catch (error) {
      console.error("방 목록 불러오기 실패:", error);
    }
  };

  const handleRoomSelect = async (roomId) => {
    if (stompClient.current) {
        stompClient.current.deactivate();
    }
    
    setSelectedRoomId(roomId);

    try {
      const historyRes = await axios.get(`/api/chat/room/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(historyRes.data);
      connectStomp(roomId);
    } catch (error) {
      console.error("대화 기록 불러오기 실패:", error);
    }
  };

  const connectStomp = (roomId) => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws-chat'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        
        client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
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

  const sendMessage = () => {
    if (inputMessage.trim() !== '' && stompClient.current?.connected && selectedRoomId) {
      const messageData = {
        roomId: selectedRoomId,
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
    <div className={styles.container}>
      <h2 className={styles.title}>고객 문의 관리</h2>

      <div style={{ 
        display: 'flex', 
        height: '75vh', 
        width: '100%', 
        backgroundColor: 'var(--sidebar-color)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}>
        <div style={{ width: '30%', borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>문의 내역</h3>
              <button onClick={fetchRooms} style={{ 
                padding: '6px 12px', 
                cursor: 'pointer',
                backgroundColor: 'var(--primary-color-light)',
                color: 'var(--primary-color)',
                border: 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '600'
              }}>
                <i className="bx bx-refresh"></i> 새로고침
              </button>
            </div>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {rooms.length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--text-color)', opacity: 0.6, textAlign: 'center' }}>열려있는 문의가 없습니다.</p>
            ) : null}
            
            {rooms.map((room) => (
              <div 
                key={room.roomId} 
                onClick={() => handleRoomSelect(room.roomId)}
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid rgba(0,0,0,0.04)', 
                  cursor: 'pointer',
                  backgroundColor: selectedRoomId === room.roomId ? 'var(--primary-color-light)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text-color)' }}>{room.buyerId} 님의 문의</strong>
                <div style={{ fontSize: '0.85em', color: 'var(--text-color)', opacity: 0.6 }}>방 번호: {room.roomId.substring(0, 8)}...</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: '70%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sidebar-color)' }}>
          {selectedRoomId ? (
            <>
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>
                  현재 연결된 방: <span style={{ opacity: 0.7, fontWeight: 'normal' }}>{selectedRoomId.substring(0, 8)}...</span>
                </h3>
              </div>
              
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                {messages.map((msg, index) => (
                  <div key={index} style={{ textAlign: msg.sender === currentUser ? 'right' : 'left', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.8em', color: 'var(--text-color)', opacity: 0.6, marginRight: '8px', marginLeft: '8px' }}>
                      {msg.sender === currentUser ? '관리자' : msg.sender}
                    </span>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      backgroundColor: msg.sender === currentUser ? 'var(--primary-color)' : 'var(--sidebar-color)',
                      color: msg.sender === currentUser ? '#fff' : 'var(--text-color)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      border: msg.sender === currentUser ? 'none' : '1px solid rgba(0,0,0,0.08)',
                      maxWidth: '70%',
                      wordBreak: 'break-word',
                      textAlign: 'left'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '20px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  style={{ 
                    flex: 1, 
                    padding: '14px 16px', 
                    border: '1px solid rgba(0,0,0,0.1)', 
                    borderRadius: '8px', 
                    outline: 'none',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    color: 'var(--text-color)'
                  }}
                  placeholder="고객에게 보낼 메시지를 입력하세요..."
                />
                <button 
                  onClick={sendMessage} 
                  style={{ 
                    padding: '0 24px', 
                    backgroundColor: inputMessage.trim() ? 'var(--primary-color)' : 'var(--primary-color-light)', 
                    color: inputMessage.trim() ? '#fff' : 'var(--primary-color)', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  disabled={!inputMessage.trim()}
                >
                  전송
                </button>
              </div>
            </>
          ) : (
            <div style={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-color)', opacity: 0.6 }}>
              <i className="bx bx-message-square-dots" style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--primary-color)' }}></i>
              <p>왼쪽 목록에서 답변할 고객의 문의방을 선택해주세요.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminChatManager;
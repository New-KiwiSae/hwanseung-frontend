import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const AdminChatManager = () => {
  const [rooms, setRooms] = useState([]); // 전체 문의방 목록
  const [selectedRoomId, setSelectedRoomId] = useState(null); // 관리자가 클릭한 방 번호
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  // 관리자 권한 확인용 토큰 및 아이디
  const currentUser = sessionStorage.getItem("username") || "admin"; 
  const token = sessionStorage.getItem("accessToken");

  // 1. 관리자가 '문의 내역' 탭에 들어오면 전체 방 목록을 불러옵니다.
  useEffect(() => {
    fetchRooms();
  }, []);

  // 대화가 추가될 때마다 스크롤을 맨 아래로 내려줍니다.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🚀 전체 방 목록 불러오기 API 호출
  const fetchRooms = async () => {
    try {
      // 🚨 백엔드에 이 API(GET /api/chat/admin/rooms)가 만들어져 있어야 합니다!
      const res = await axios.get('http://localhost/api/chat/admin/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("백엔드가 준 방 목록 데이터:", res.data);

      setRooms(res.data);
    } catch (error) {
      console.error("방 목록 불러오기 실패:", error);
    }
  };

  // 🚀 왼쪽 방 목록에서 특정 고객의 방을 클릭했을 때!
  const handleRoomSelect = async (roomId) => {
    // 1. 다른 방과 연결되어 있었다면 기존 웹소켓 연결을 안전하게 끊습니다.
    if (stompClient.current) {
        stompClient.current.deactivate();
    }
    
    setSelectedRoomId(roomId);

    try {
      // 2. 클릭한 방의 이전 대화 기록 불러오기
      const historyRes = await axios.get(`http://localhost/api/chat/room/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(historyRes.data);

      // 3. 클릭한 방 번호로 웹소켓 연결 시작!
      connectStomp(roomId);
    } catch (error) {
      console.error("대화 기록 불러오기 실패:", error);
    }
  };

  // 🚀 STOMP 웹소켓 연결 로직 (고객용과 동일)
  const connectStomp = (roomId) => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost/ws-chat'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log("관리자 모드: 웹소켓 연결 성공! 현재 접속한 방:", roomId);
        
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

  // 🚀 관리자가 고객에게 메시지 전송
  const sendMessage = () => {
    if (inputMessage.trim() !== '' && stompClient.current?.connected && selectedRoomId) {
      const messageData = {
        roomId: selectedRoomId,
        sender: currentUser, // "admin"으로 전송됨
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
    // 대시보드 우측 영역을 가득 채울 수 있도록 width: 100% 로 설정
    <div style={{ display: 'flex', height: '80vh', width: '100%', border: '1px solid #ccc', backgroundColor: '#fff' }}>
      
      {/* 1. 왼쪽 패널: 고객 문의 방 목록 */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>문의 내역</h3>
          <button onClick={fetchRooms} style={{ padding: '5px 10px', cursor: 'pointer' }}>
            새로고침 🔄
          </button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {rooms.length === 0 ? (
            <p style={{ padding: '15px', color: 'gray', textAlign: 'center' }}>열려있는 문의가 없습니다.</p>
          ) : null}
          
          {rooms.map((room) => (
            <div 
              key={room.roomId} 
              onClick={() => handleRoomSelect(room.roomId)}
              style={{ 
                padding: '15px', 
                borderBottom: '1px solid #eee', 
                cursor: 'pointer',
                // 관리자가 선택한 방은 색깔을 다르게 표시해줍니다.
                backgroundColor: selectedRoomId === room.roomId ? '#e6f7ff' : 'white' 
              }}
            >
              <strong style={{ display: 'block', marginBottom: '5px' }}>{room.buyerId} 님의 문의</strong>
              <div style={{ fontSize: '0.8em', color: 'gray' }}>방 번호: {room.roomId.substring(0, 8)}...</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 오른쪽 패널: 채팅창 */}
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
        {selectedRoomId ? (
          <>
            {/* 채팅창 헤더 */}
            <div style={{ padding: '15px', borderBottom: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: 0 }}>현재 연결된 방: {selectedRoomId.substring(0, 8)}...</h3>
            </div>
            
            {/* 채팅 내역 영역 */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f0f2f5' }}>
              {messages.map((msg, index) => (
                <div key={index} style={{ textAlign: msg.sender === currentUser ? 'right' : 'left', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8em', color: 'gray', marginRight: '5px', marginLeft: '5px' }}>
                    {msg.sender === currentUser ? '관리자' : msg.sender}
                  </span>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '10px', 
                    borderRadius: '10px', 
                    backgroundColor: msg.sender === currentUser ? '#007bff' : '#fff',
                    color: msg.sender === currentUser ? '#fff' : '#000',
                    border: msg.sender === currentUser ? 'none' : '1px solid #ccc',
                    maxWidth: '70%',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 채팅 입력 영역 */}
            <div style={{ padding: '15px', borderTop: '1px solid #ccc', display: 'flex', backgroundColor: '#fff' }}>
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{ flex: 1, padding: '10px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                placeholder="고객에게 보낼 메시지를 입력하세요..."
              />
              <button 
                onClick={sendMessage} 
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={!inputMessage.trim()}
              >
                전송
              </button>
            </div>
          </>
        ) : (
          /* 방을 선택하기 전 안내 문구 */
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'gray', backgroundColor: '#f8f9fa' }}>
            <p>왼쪽 목록에서 답변할 고객의 문의방을 선택해주세요.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminChatManager;
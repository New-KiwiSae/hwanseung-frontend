import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const [activeRoom, setActiveRoom] = useState(null); 

  const [chatRooms, setChatRooms] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); 

  // 🚨 1. 로그인 정보 (팀 규칙에 맞게 sessionStorage 사용!)
  const token = sessionStorage.getItem("accessToken");
  const currentUser = sessionStorage.getItem("username") || "알수없음";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  // 🚀 2. 채팅창 열릴 때 내 방 목록 불러오기
  useEffect(() => {
    if (isOpen && !activeRoom) {
      fetchMyChatRooms();
    }
  }, [isOpen, activeRoom]);

  const fetchMyChatRooms = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost/api/chat/my-rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatRooms(res.data);
    } catch (error) {
      console.error("채팅방 목록 불러오기 실패:", error);
    }
  };

  // 🚀 3. 상품 상세페이지에서 '채팅하기' 눌렀을 때 처리
  useEffect(() => {
    const handleOpenChat = async (e) => {
      const { roomId, buyerId, sellerId, itemName } = e.detail;
      setIsOpen(true);
      
      // 방금 연 방을 객체로 만듭니다. (상대방 이름 표시에 쓸 sellerId도 추가)
      const newRoom = { roomId, buyerId, sellerId, itemName, unreadCount: 0, lastMessage: "새로운 대화가 시작되었습니다." };
      setActiveRoom(newRoom);
      setMessages([]);

      // 💡 [핵심] 뒤로 가기 했을 때 방이 사라지지 않도록 내 목록에 강제 추가!
      setChatRooms((prev) => {
        const exists = prev.find(r => r.roomId === roomId);
        if (exists) return prev;
        return [newRoom, ...prev]; 
      });

      try {
        const historyRes = await axios.get(`http://localhost/api/chat/room/${roomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(historyRes.data);
        connectStomp(roomId); 
      } catch (error) {
        console.error("대화 기록 불러오기 실패:", error);
      }
    };

    window.addEventListener('openTradeChat', handleOpenChat);
    return () => window.removeEventListener('openTradeChat', handleOpenChat);
  }, [token]);

  const toggleChat = () => {
    if (isOpen) {
      if (stompClient.current) stompClient.current.deactivate();
      setActiveRoom(null); 
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const backToList = () => {
    if (stompClient.current) stompClient.current.deactivate(); 
    setActiveRoom(null); 
  };

  const enterRoom = async (room) => {
    setActiveRoom(room); 
    setMessages([]); 
    try {
      const historyRes = await axios.get(`http://localhost/api/chat/room/${room.roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(historyRes.data);
      connectStomp(room.roomId);
    } catch (error) {
      console.error("방 입장 실패:", error);
    }
  };

  const startAdminChat = async () => {
    try {
      const roomRes = await axios.post('http://localhost/api/chat/room/admin', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const realRoomId = roomRes.data.roomId;
      
      setActiveRoom({ roomId: realRoomId, buyerId: "환승마켓 고객센터", itemName: "1:1 문의", unreadCount: 0 });
      setMessages([]);

      const historyRes = await axios.get(`http://localhost/api/chat/room/${realRoomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(historyRes.data);
      connectStomp(realRoomId);
    } catch (error) {
      console.error("고객센터 방 생성 실패:", error);
      alert("고객센터에 연결할 수 없습니다.");
    }
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
      const messageData = { roomId: activeRoom.roomId, senderId: currentUser, content: inputMessage };
      stompClient.current.publish({ destination: '/pub/chat/message', body: JSON.stringify(messageData) });
      setInputMessage('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); 

    try {
      const uploadRes = await axios.post('http://localhost/api/chat/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      const imageUrl = uploadRes.data; 

      if (stompClient.current?.connected && activeRoom) {
        const messageData = { roomId: activeRoom.roomId, senderId: currentUser, content: imageUrl };
        stompClient.current.publish({ destination: '/pub/chat/message', body: JSON.stringify(messageData) });
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      e.target.value = ''; 
    }
  };

  // 💡 [핵심] 대화 상대방 이름을 정확히 계산해주는 똑똑한 함수!
  const getOpponentName = (room) => {
    if (!room) return "";
    // 관리자 채팅방인 경우 무조건 고객센터 표시
    if (room.buyerId === "환승마켓 고객센터") return "환승마켓 고객센터";
    // 내가 구매자면 판매자 이름을, 내가 판매자면 구매자 이름을 띄움!
    if (room.sellerId) {
      return currentUser === room.buyerId ? room.sellerId : room.buyerId;
    }
    return room.buyerId; // 백업용
  };

  return (
    <>
      <div className="admin-chat-wrapper">
        <div className={`admin-chat-modal ${isOpen ? 'open' : ''}`} style={{ width: '400px', height: '650px', maxWidth: '90vw', maxHeight: '80vh' }}>
          
          {!activeRoom ? (
            /* [화면 1] 채팅방 목록 */
            <>
              <div className="admin-chat-header" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>내 채팅방</h3>
                <button className="close-btn" onClick={toggleChat}><i className="fas fa-times"></i></button>
              </div>
              
              <div className="admin-chat-body" style={{ padding: '0', backgroundColor: '#f0f2f5' }}>
                {currentUser !== "admin" && (
                  <div onClick={startAdminChat} style={{ padding: '15px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ff6f0f', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px', fontSize: '18px' }}>
                      <i className="fas fa-headset"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#ff6f0f', marginBottom: '2px', fontSize: '15px' }}>관리자와 1:1 문의하기</div>
                      <div style={{ fontSize: '0.85em', color: '#888' }}>환승마켓 고객센터 연결</div>
                    </div>
                  </div>
                )}
                
                <div style={{ backgroundColor: '#fff' }}>
                  {chatRooms.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>참여 중인 채팅방이 없습니다.</div>}
                  {chatRooms.map((room) => (
                    <div key={room.roomId} onClick={() => enterRoom(room)} style={{ padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        
                        {/* 💡 계산된 상대방 이름 띄우기! */}
                        <span style={{ fontWeight: 'bold' }}>{getOpponentName(room)}</span>
                        
                        {room.unreadCount > 0 && <span style={{ backgroundColor: '#ff6f0f', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '0.8em', fontWeight: 'bold' }}>{room.unreadCount}</span>}
                      </div>
                      {room.itemName && (
                      <div style={{ fontSize: '0.85em', color: '#888', marginBottom: '3px' }}>[{room.itemName}]</div>
                      )}
                      
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            
            /* [화면 2] 채팅방 내부 */
            <>
              <div className="admin-chat-header" style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={backToList} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', marginRight: '10px' }}><i className="fas fa-chevron-left"></i></button>
                <div className="header-info" style={{ flex: 1 }}>
                  <div>
                    {/* 💡 헤더에도 계산된 상대방 이름 띄우기! */}
                    <h3 style={{ margin: 0, fontSize: '15px' }}>{getOpponentName(activeRoom)}</h3>
                    
                    {activeRoom.itemName && <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>{activeRoom.itemName}</p>}
                  </div>
                </div>
                <button className="close-btn" onClick={toggleChat}><i className="fas fa-times"></i></button>
              </div>

              <div className="admin-chat-body">
                {messages.length === 0 && <div className="empty-message"><p>대화를 시작해보세요!</p></div>}
                
                {messages.map((msg, index) => {
                  const isImage = msg.content && msg.content.includes('/api/imgs/');

                  return (
                    <div key={index} className={`chat-bubble-wrap ${msg.senderId === currentUser ? 'me' : 'admin'}`}>
                      <div className="chat-bubble" style={{ padding: isImage ? '0' : '10px', backgroundColor: isImage ? 'transparent' : '', boxShadow: isImage ? 'none' : '' }}>
                        {isImage ? (
                          <img 
                            src={`http://localhost${msg.content}`} 
                            alt="전송된 이미지" 
                            style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '10px', cursor: 'pointer', border: '1px solid #eee' }} 
                            onClick={() => setSelectedImage(`http://localhost${msg.content}`)}
                          />
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="admin-chat-footer" style={{ display: 'flex', alignItems: 'center' }}>
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current.click()} style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer', marginRight: '10px' }} title="사진 첨부"><i className="far fa-image"></i></button>
                <input 
                  type="text" placeholder="메시지를 입력하세요..." value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '20px' }}
                />
                <button onClick={sendMessage} disabled={!inputMessage.trim()} style={{ background: '#ff6f0f', color: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', marginLeft: '10px', cursor: 'pointer' }}><i className="fas fa-paper-plane"></i></button>
              </div>
            </>
          )}
        </div>

        <button className="admin-chat-fab" onClick={toggleChat}>
          {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
        </button>
      </div>

      {/* 이미지 전체화면 모달 */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' }}
        >
          <img src={selectedImage} alt="확대된 이미지" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }} />
          <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '40px', cursor: 'pointer' }}>&times;</button>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
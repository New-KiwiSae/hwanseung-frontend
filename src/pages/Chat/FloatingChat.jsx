import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

import { useUser } from '../../UserContext';

const FloatingChat = () => {

  const { userInfo } = useUser();

  const [isOpen, setIsOpen] = useState(false); 
  const [activeRoom, setActiveRoom] = useState(null); 

  const [chatRooms, setChatRooms] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); 

  const notiStompClient = useRef(null);

  const token = sessionStorage.getItem("accessToken");
  const currentUser = userInfo?.username || userInfo?.userId || sessionStorage.getItem("username");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  useEffect(() => {
    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    fetchMyChatRooms();

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws-chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },

      reconnectDelay: 0,
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame);
        client.deactivate();
      },
      onWebSocketClose: () => {
        client.deactivate();
      },

      onConnect: () => {
        client.subscribe(`/sub/user/${currentUser}/notification`, (message) => {
          const newNoti = JSON.parse(message.body);
          
          if (newNoti.type === 'CHAT') {
            const incomingRoomId = String(newNoti.relatedStringId);
            let isNewRoom = false;

            setChatRooms((prevRooms) => {
              let currentActiveRoomId = null;
              setActiveRoom(current => {
                currentActiveRoomId = current?.roomId ? String(current.roomId) : null;
                return current;
              });

              if (currentActiveRoomId === incomingRoomId) {
                return prevRooms; 
              }

              const roomExists = prevRooms.find(r => String(r.roomId) === incomingRoomId);

              if (roomExists) {
                const updatedRoom = { ...roomExists, unreadCount: roomExists.unreadCount + 1, lastMessage: newNoti.content };
                return [updatedRoom, ...prevRooms.filter(r => String(r.roomId) !== incomingRoomId)];
              } else {
                isNewRoom = true; 
                const newTempRoom = {
                  roomId: incomingRoomId, 
                  buyerId: "새로운 대화",
                  unreadCount: 1,
                  lastMessage: newNoti.content
                };
                return [newTempRoom, ...prevRooms];
              }
            });
            if (isNewRoom) {
              fetchMyChatRooms(); 
            }
          }
        });
      }
    });

    client.activate();
    notiStompClient.current = client;

    return () => {
      if (notiStompClient.current) notiStompClient.current.deactivate();
    };
  }, [token, currentUser]);

  const fetchMyChatRooms = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/chat/my-rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setChatRooms(currentRooms => {
        const mergedRooms = res.data.map(serverRoom => {
          const localRoom = currentRooms.find(r => String(r.roomId) === String(serverRoom.roomId));
          
          if (localRoom && localRoom.unreadCount > serverRoom.unreadCount) {
            return { ...serverRoom, unreadCount: localRoom.unreadCount, lastMessage: localRoom.lastMessage };
          }
          return serverRoom;
        });

        currentRooms.forEach(localRoom => {
          if (!mergedRooms.find(r => String(r.roomId) === String(localRoom.roomId))) {
            mergedRooms.push(localRoom);
          }
        });

        return mergedRooms;
      });
    } catch (error) {
      console.error("채팅방 목록 불러오기 실패:", error);
    }
  };

  const totalUnreadCount = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

  useEffect(() => {
    const handleOpenChat = async (e) => {
      const { roomId, buyerId, sellerId, itemName } = e.detail;
      setIsOpen(true);
      
      const newRoom = { roomId, buyerId, sellerId, itemName, unreadCount: 0, lastMessage: "새로운 대화가 시작되었습니다." };
      setActiveRoom(newRoom);
      setMessages([]);

      setChatRooms((prev) => {
        const exists = prev.find(r => r.roomId === roomId);
        if (exists) return prev;
        return [newRoom, ...prev]; 
      });

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

    window.addEventListener('openTradeChat', handleOpenChat);
    return () => window.removeEventListener('openTradeChat', handleOpenChat);
  }, [token]);

  const toggleChat = () => {
    if (isOpen) {
      setActiveRoom(null); 
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const backToList = () => {
    setActiveRoom(null); 
  };

  const enterRoom = async (room) => {
    setActiveRoom(room); 
    setMessages([]); 

    setChatRooms(prev => prev.map(r => r.roomId === room.roomId ? { ...r, unreadCount: 0 } : r));
    
    try {
      const historyRes = await axios.get(`/api/chat/room/${room.roomId}/messages`, {
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
      const roomRes = await axios.post('/api/chat/room/admin', {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const realRoomId = roomRes.data.roomId;
      
      const newAdminRoom = { roomId: realRoomId, buyerId: "환승마켓 고객센터", itemName: "1:1 문의", unreadCount: 0 };
      setActiveRoom(newAdminRoom);
      setMessages([]);

      setChatRooms((prev) => {
        const exists = prev.find(r => r.roomId === realRoomId);
        if (exists) return prev;
        return [newAdminRoom, ...prev]; 
      });

      const historyRes = await axios.get(`/api/chat/room/${realRoomId}/messages`, {
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
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws-chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },

      reconnectDelay: 0,
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame);
        client.deactivate();
      },
      onWebSocketClose: () => {
        client.deactivate();
      },
      
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
      
      const opponentId = getOpponentName(activeRoom);

      const messageData = { 
        roomId: activeRoom.roomId, 
        sender: currentUser, 
        senderId: currentUser, 
        content: inputMessage,
        receiverId: opponentId === "환승마켓 고객센터" ? "admin" : opponentId
      };

      
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
      const uploadRes = await axios.post('/api/chat/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      const imageUrl = uploadRes.data; 

      if (stompClient.current?.connected && activeRoom) {
        const messageData = { roomId: activeRoom.roomId, sender: currentUser, senderId: currentUser, content: imageUrl };
        stompClient.current.publish({ destination: '/pub/chat/message', body: JSON.stringify(messageData) });
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      e.target.value = ''; 
    }
  };

  const getOpponentName = (room) => {
    if (!room) return "";
    if (room.buyerId === "환승마켓 고객센터") return "환승마켓 고객센터";
    if (room.sellerId) {
      return currentUser === room.buyerId ? room.sellerId : room.buyerId;
    }
    return room.buyerId; 
  };

  return (
    <>
      <div className="admin-chat-wrapper">
        <div className={`admin-chat-modal ${isOpen ? 'open' : ''}`}>
          
          {!activeRoom ? (
            <>
              <div className="admin-chat-header">
                <h3>내 채팅방</h3>
                <button className="close-btn" onClick={toggleChat}><i className="fas fa-times"></i></button>
              </div>
              
              <div className="chat-list-body">
                {currentUser !== "admin" && (
                  <div className="admin-contact-item" onClick={startAdminChat}>
                    <div className="admin-icon-box"><i className="fas fa-headset"></i></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--brand-color, #ff6f0f)', marginBottom: '2px', fontSize: '15px' }}>관리자와 1:1 문의하기</div>
                      <div style={{ fontSize: '0.85em', color: '#888' }}>환승마켓 고객센터 연결</div>
                    </div>
                  </div>
                )}
                
                <div style={{ backgroundColor: '#fff' }}>
                  {chatRooms.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>참여 중인 채팅방이 없습니다.</div>}
                  {chatRooms.map((room) => (
                    <div key={room.roomId} className="chat-room-item" onClick={() => enterRoom(room)}>
                      <div className="chat-room-header">
                        <span className="opponent-name">{getOpponentName(room)}</span>
                        {room.unreadCount > 0 && <span className="unread-badge">{room.unreadCount}</span>}
                      </div>
                      {room.itemName && (
                        <div className="item-name-preview">[{room.itemName}]</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            
            <>
              <div className="admin-chat-header">
                <button className="back-btn" onClick={backToList}><i className="fas fa-chevron-left"></i></button>
                <div className="header-info">
                  <div>
                    <h3>{getOpponentName(activeRoom)}</h3>
                    {activeRoom.itemName && <p>{activeRoom.itemName}</p>}
                  </div>
                </div>
                <button className="close-btn" onClick={toggleChat}><i className="fas fa-times"></i></button>
              </div>

              <div className="admin-chat-body">
                {messages.length === 0 && <div className="empty-message"><p>대화를 시작해보세요!</p></div>}
                
                {messages.map((msg, index) => {

                  const isImage = msg.content && msg.content.includes('/api/imgs/');
                  const isMe = (msg.senderId || msg.sender) === currentUser;

                  return (
                    <div key={index} className={`chat-bubble-wrap ${isMe ? 'me' : 'admin'}`}>
                      {!isMe && (
                        <div className="sender-name">
                          {(msg.senderId || msg.sender) === "admin" ? "고객센터" : (msg.senderId || msg.sender)}
                        </div>
                      )}
                      
                      <div className={`chat-bubble ${isImage ? 'image-bubble' : ''}`}>
                        {isImage ? (
                          <img 
                            src={`${msg.content}`} 
                            alt="전송된 이미지" 
                            onClick={() => setSelectedImage(`${msg.content}`)}
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

              <div className="admin-chat-footer">
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                <button className="btn-attach" onClick={() => fileInputRef.current.click()} title="사진 첨부"><i className="far fa-image"></i></button>
                <input 
                  type="text" placeholder="메시지를 입력하세요..." value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="btn-send" onClick={sendMessage} disabled={!inputMessage.trim()}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </>
          )}
        </div>

        <button className="admin-chat-fab" onClick={toggleChat}>
          {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-comment-dots"></i>}
          
          {!isOpen && totalUnreadCount > 0 && (
            <span className="fab-unread-badge">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </span>
          )}
        </button>
      </div>

      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="확대된 이미지" />
          <button className="image-modal-close" onClick={() => setSelectedImage(null)}>&times;</button>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
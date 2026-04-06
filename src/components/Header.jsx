import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Header.css';
import axios from 'axios';
import { Client } from '@stomp/stompjs'; 
import SockJS from 'sockjs-client';      

// 🌟 1. 우리가 만든 전역 창고 도구를 가져옵니다.
import { useUser } from '../UserContext';

const Header = () => {
  // 🌟 2. 창고에서 내 정보(userInfo)와 정보 변경 함수(setUserInfo)를 꺼내옵니다.
  const { userInfo, setUserInfo } = useUser();
  
  // 🌟 3. 핵심! 로그인 상태는 "창고에 내 정보가 있나?" 하나로 완벽하게 판단 끝!
  const isLoggedIn = !!userInfo; 

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 알림 관련 상태값들
  const [isNotiOpen, setIsNotiOpen] = useState(false); 
  const [notifications, setNotifications] = useState([]); 
  const stompClient = useRef(null); 

  // ✅ 화면 점진적 확대/축소 상태 (기본 1.0 = 100%)
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // ➕ 확대 버튼을 눌렀을 때 (최대 1.5까지)
  const handleZoomIn = () => {
    if (zoomLevel < 1.5) {
      // 💡 컴퓨터의 소수점 계산 오차를 막기 위해 Math.round를 사용합니다.
      const nextZoom = Math.round((zoomLevel + 0.1) * 10) / 10;
      setZoomLevel(nextZoom);
      document.body.style.zoom = nextZoom.toString();
    }
  };

  // ➖ 축소 버튼을 눌렀을 때 (최소 1.0까지)
  const handleZoomOut = () => {
    if (zoomLevel > 1.0) {
      const nextZoom = Math.round((zoomLevel - 0.1) * 10) / 10;
      setZoomLevel(nextZoom);
      document.body.style.zoom = nextZoom.toString();
    }
  };
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("accessToken"); 
  const currentUser = sessionStorage.getItem("username");

 // 🌟 내 근처 클릭 로직 (지오코딩 + load 신호 추가)
  const handleNearMeClick = () => {
    // 1️⃣ 만약 로그인한 유저 정보에 '주소(address)'가 있다면?
    if (userInfo && userInfo.address) {
      const { kakao } = window;
      
      if (!kakao || !kakao.maps) {
        alert("카카오 지도 스크립트를 불러오지 못했습니다.");
        return;
      }

      // 🌟 핵심 해결 포인트: 카카오 지도가 준비될 때까지 기다렸다가 실행합니다!
      kakao.maps.load(() => {
        // 혹시 index.html에 &libraries=services 를 깜빡하셨을 경우를 대비한 방어 로직
        if (!kakao.maps.services) {
          console.error("주소 변환 라이브러리(services)가 없습니다. index.html을 확인하세요.");
          fallbackToBrowserLocation();
          return;
        }

        // 주소-좌표 변환 객체를 생성합니다.
        const geocoder = new kakao.maps.services.Geocoder();

        // 내 주소를 넣어서 좌표를 찾습니다.
        geocoder.addressSearch(userInfo.address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const lat = result[0].y; // 위도
            const lng = result[0].x; // 경도
            navigate(`/near-me?lat=${lat}&lng=${lng}`);
          } else {
            console.warn("주소 변환 실패, 브라우저 GPS를 사용합니다.");
            fallbackToBrowserLocation();
          }
        });
      });
    } 
    // 2️⃣ 주소가 없거나 비로그인 상태라면? (기존 브라우저 GPS 사용)
    else {
      fallbackToBrowserLocation();
    }
  };

  // 🌟 (도우미 함수) 기존 브라우저 GPS 위치 찾기
  const fallbackToBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;   
          const lng = position.coords.longitude;  
          navigate(`/near-me?lat=${lat}&lng=${lng}`);
        },
        (error) => {
          console.error("위치 정보 에러:", error);
          alert("위치 권한을 허용하시거나, 마이페이지에서 주소를 등록해 주세요.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("이 브라우저에서는 위치 정보(Geolocation)를 지원하지 않습니다.");
    }
  };

  // 🌟 4. 권한 체크 로직
  useEffect(() => {
    // 1. 스토리지에서 토큰 가져오기 (저장 방식에 따라 sessionStorage 또는 sessionStorage 등 사용)
    const token = sessionStorage.getItem("accessToken"); 

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role; 
        const authorizedRoles = ["SUPER", "SUB", "ROLE_SUPER", "ROLE_SUB", "ADMIN", "ROLE_ADMIN"];
        if (authorizedRoles.includes(userRole)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [userInfo], [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!sessionStorage.getItem("accessToken"));
    };
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  // ========================================================
  // 🚨 [알림 구독] 헤더는 '채팅'을 제외한 시스템 알림(찜 등)만 받습니다!
  // ========================================================
  useEffect(() => {
    if (!token || !currentUser) return;

    // 1. 과거 알림 불러오기 (백엔드 API에서 CHAT 타입은 제외하고 주면 가장 좋습니다)
    const fetchHistoryNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // 🚀 만약 백엔드에서 채팅 알림도 같이 보내준다면, 프론트에서 필터링해서 버립니다!
        const systemNotis = res.data.filter(n => n.type !== 'CHAT');
        setNotifications(systemNotis);

      } catch (error) {
        console.error("알림 내역 불러오기 실패:", error);
      }
    };
    fetchHistoryNotifications();

    // 2. 실시간 STOMP 연결
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost/ws-chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/sub/user/${currentUser}/notification`, (message) => {
          const newNoti = JSON.parse(message.body);
          
          // 🚀 [교통정리] 채팅 알림(CHAT)은 플로팅 아이콘이 알아서 하도록 무시합니다!
          if (newNoti.type === 'CHAT') {
            return; 
          }
          
          // 시스템 알림(FAVORITE, NOTICE 등)만 헤더 목록에 추가
          setNotifications(prev => [newNoti, ...prev]);
        });
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, [token, currentUser]);

  const unreadNotiCount = (notifications || []).filter(noti => noti && noti.isRead !== true && noti.read !== true).length;

  const handleNotiClick = async (noti) => {
    setIsNotiOpen(false); 

    setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, isRead: true, read: true } : n));
    
    // 알림 종류에 따라 페이지 이동
    if (noti.type === 'FAVORITE' && noti.relatedItemId) {
      navigate(`/products/${noti.relatedItemId}`); 
    }

    try {
      await axios.put(`http://localhost/api/notifications/${noti.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(e) { console.error(e); }
  };

  const handleReadAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));

    try {
      await axios.put(`http://localhost/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(e) { console.error(e); }
  };

  const handleDeleteNoti = async (e, notiId) => {
    e.stopPropagation(); 
    setNotifications(prev => prev.filter(n => n.id !== notiId));

    try {
      await axios.delete(`http://localhost/api/notifications/${notiId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(error) { 
      console.error("알림 삭제 통신 실패:", error); 
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("tokenType");
    setUserInfo(null); 
    navigate('/'); 
  };

  const handleChatClick = (roomId) => {
    setIsChatOpen(false); 
    navigate(`/chat/${roomId}`); 
  };

  return (
    <header className={`header-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* 로고 */}
        <a href="/" className="logo">
          <div className="logo-icon">
            <i className="fas fa-exchange-alt"></i>
          </div>
          <span><span className="logo-brand">환승</span>마켓</span>
        </a>

        {/* 검색 영역 */}
        <div className="search-area" ref={searchRef}>
          <div className={`search-input-wrapper ${isSearchOpen ? 'active' : ''}`}>
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="어떤 물건을 환승할까요?"
              onFocus={() => setIsSearchOpen(true)}
            />
          </div>
          {isSearchOpen && (
             <div className="search-dropdown">
               {/* ... 기존 코드가 길어서 생략했습니다. 그대로 두시면 됩니다! ... */}
             </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="header-actions">
          <div className="nav-links">
            <button className="nav-link" onClick={handleNearMeClick}>내 근처</button>
            <button className="nav-link">인기매물</button>
          </div>
          
          {isLoggedIn && (
            <>
              {/* 🚀 채팅 아이콘 영역 완전 삭제! */}

              {/* 시스템 알림(종 모양) 버튼 */}
              <div 
                className="user-profile-container" // 프로필 컨테이너 CSS 재활용
                onMouseEnter={() => setIsChatOpen(true)}
                onMouseLeave={() => setIsChatOpen(false)}
              >
                <button className="icon-btn" title="알림" style={{ position: 'relative' }}>
                  <i className="far fa-bell"></i>
                  {unreadNotiCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '2px', right: '2px', backgroundColor: '#ff4d4f', color: 'white',
                      borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', border: '2px solid white'
                    }}>
                      {unreadNotiCount > 9 ? '9+' : unreadNotiCount}
                    </span>
                  )}
                </button>

                {isNotiOpen && (
                  <div className="profile-dropdown" style={{ width: '320px', right: '-60px', maxHeight: '400px', overflowY: 'auto' }}>
                    <div style={{ padding: '12px 15px', fontWeight: 'bold', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                      <span>새로운 알림</span>
                      {unreadNotiCount > 0 && (
                        <span style={{ fontSize: '0.8em', color: '#007bff', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleReadAll(); }}>
                          모두 읽음
                        </span>
                      )}
                    </div>
                    
                    {!(notifications && notifications.length > 0) ? (
                      <div style={{ padding: '30px 15px', textAlign: 'center', color: '#999', fontSize: '0.9em' }}>
                        새로운 알림이 없습니다.
                      </div>
                    ) : (
                      notifications.map((noti) => (
                        <div key={noti.id} className="dropdown-item" onClick={() => handleNotiClick(noti)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px 15px', backgroundColor: noti.isRead ? '#fff' : '#f0f8ff', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '4px' }}>
                            <div style={{ fontSize: '0.9em', color: '#333', lineHeight: '1.4', paddingRight: '10px' }}>
                              {noti.type === 'FAVORITE' && <i className="fas fa-heart" style={{ color: '#ff4d4f', marginRight: '6px' }}></i>}
                              {noti.type === 'NOTICE' && <i className="fas fa-bullhorn" style={{ color: '#007bff', marginRight: '6px' }}></i>}
                              {noti.content}
                            </div>
                            <button onClick={(e) => handleDeleteNoti(e, noti.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: '0', fontSize: '1.1em', flexShrink: 0 }} title="알림 삭제">
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                          <div style={{ fontSize: '0.75em', color: '#999', width: '100%' }}>
                            {new Date(noti.createdAt || Date.now()).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                    <div className="dropdown-item" style={{ justifyContent: 'center', color: '#666', fontSize: '0.85em', borderTop: '1px solid #eee' }} onClick={() => navigate('/notifications')}>
                      알림 전체보기
                    </div>
                  </div>
                )}
              </div>

              {/* 알림 버튼 */}
              <button className="icon-btn" title="알림">
                <i className="far fa-bell"></i>
                <span className="notification-dot"></span>
              </button>

             {/* 🌟 화면 축소 / 확대 버튼 그룹 */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="icon-btn" 
                  title="화면 축소" 
                  onClick={handleZoomOut}
                  style={{ opacity: zoomLevel <= 1.0 ? 0.3 : 1 }} // 최소 크기일 땐 흐리게!
                >
                  <i className="fas fa-search-minus"></i>
                </button>
                <button 
                  className="icon-btn" 
                  title="화면 확대" 
                  onClick={handleZoomIn}
                  style={{ opacity: zoomLevel >= 1.5 ? 0.3 : 1 }} // 최대 크기일 땐 흐리게!
                >
                  <i className="fas fa-search-plus"></i>
                </button>
              </div>

              {/* ✅ 프로필 버튼 (복구 완료!) */}
              <div
                className="user-profile-container"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button className="icon-btn user-avatar" title="내 프로필">
                  <i className="far fa-user"></i> 
                </button>
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-item" style={{ fontWeight: 'bold', color: '#ff6f0f' }}>
                      {userInfo.nickname || userInfo.username}님 환영합니다!
                    </div>
                    <hr style={{ margin: '5px 0' }} />
                    <div className="dropdown-item" onClick={() => navigate('/mypage')}><i className="far fa-id-card"></i> 내 정보 보기</div>
                    <div className="dropdown-item" onClick={() => navigate('/sales')}><i className="fas fa-box-open"></i> 판매 내역</div>
                    <div className="dropdown-item" onClick={() => navigate('/purchase')}><i className="fas fa-shopping-bag"></i> 구매 내역</div>
                    <div className="dropdown-item" onClick={() => navigate('/wishlist')}><i className="fas fa-heart"></i> 관심 목록</div>
                    <hr />
                    <div className="dropdown-item logout-item" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> 로그아웃</div>
                  </div>
                )}
              </div>

              {/* 판매 버튼 */}
              <button className="sell-btn" onClick={() => navigate("/products/create")}>
                <i className="fas fa-plus"></i>
                <span>판매하기</span>
              </button>

              {isAdmin && (
                <button className="admin-btn" onClick={() => navigate("/admin/dashboard")}>
                  <i className="fas"></i>
                  <span>관리자 페이지</span>
                </button>
              )}
            </>
          )}

          {!isLoggedIn && (
            <button className="login-btn" onClick={() => navigate('/login')}>
              로그인 / 회원가입
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
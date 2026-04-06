import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Header.css';

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
  const [isChatOpen, setIsChatOpen] = useState(false); 

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
  const [isAdmin, setIsAdmin] = useState(false);

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
        console.error("유효하지 않은 토큰입니다.", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [userInfo]);

  // 📦 가짜 채팅방 데이터 
  const [chatRooms, setChatRooms] = useState([
    { roomId: "1", buyerId: "apple_lover", itemName: "아이폰 15 Pro", unreadCount: 2, lastMessage: "네고 가능한가요?" },
    { roomId: "2", buyerId: "camp_master", itemName: "캠핑 의자", unreadCount: 0, lastMessage: "내일 거래 가능합니다!" }
  ]);

  const hasUnreadChats = chatRooms.some(room => room.unreadCount > 0);

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

  // 🌟 5. 로그아웃 로직
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
               {/* 💡 기존 검색 드롭다운 내용 (생략됨) */}
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
              {/* ✅ 채팅 영역 (복구 완료!) */}
              <div 
                className="user-profile-container" 
                onMouseEnter={() => setIsChatOpen(true)}
                onMouseLeave={() => setIsChatOpen(false)}
              >
                <button className="icon-btn" title="채팅">
                  <i className="far fa-comment-dots"></i>
                  {hasUnreadChats && <span className="notification-dot"></span>}
                </button>
                {isChatOpen && (
                  <div className="profile-dropdown" style={{ width: '280px', right: '-80px' }}>
                    <div style={{ padding: '10px 15px', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                      채팅 알림
                    </div>
                    {chatRooms.length === 0 ? (
                      <div className="dropdown-item" style={{ justifyContent: 'center', color: 'gray' }}>
                        진행 중인 채팅이 없습니다.
                      </div>
                    ) : (
                      chatRooms.map((room) => (
                        <div 
                          key={room.roomId} 
                          className="dropdown-item" 
                          onClick={() => handleChatClick(room.roomId)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px 15px' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{room.buyerId}</span>
                            {room.unreadCount > 0 && (
                              <span style={{ backgroundColor: '#ff6f0f', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '0.7em', fontWeight: 'bold' }}>
                                {room.unreadCount}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8em', color: '#666', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            [{room.itemName}] {room.lastMessage}
                          </div>
                        </div>
                      ))
                    )}
                    <hr style={{ margin: 0 }} />
                    <div className="dropdown-item" style={{ justifyContent: 'center', color: '#007bff', fontWeight: 'bold' }} onClick={() => navigate('/chat')}>
                      모든 채팅 보기
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
                <button className="admin-btn" onClick={() => navigate("/admin/adminpage")}>
                  <i className="fas fa-cog"></i>
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
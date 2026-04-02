import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 🚨 프로필 드롭다운 상태
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // 🚨 1. 채팅 드롭다운 상태 추가!
  const [isChatOpen, setIsChatOpen] = useState(false); 

  const searchRef = useRef(null);
  const navigate = useNavigate();

  // 📦 2. 가짜 채팅방 데이터 (나중에 백엔드 API로 불러올 부분입니다)
  const [chatRooms, setChatRooms] = useState([
    { roomId: "1", buyerId: "apple_lover", itemName: "아이폰 15 Pro", unreadCount: 2, lastMessage: "네고 가능한가요?" },
    { roomId: "2", buyerId: "camp_master", itemName: "캠핑 의자", unreadCount: 0, lastMessage: "내일 거래 가능합니다!" }
  ]);

  // 안 읽은 메시지가 하나라도 있는지 계산
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

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const recentSearches = ['아이폰 15 Pro', '캠핑 의자', '맥북 에어 M2'];
  const trendingKeywords = ['자전거', '플레이스테이션 5', '에어팟 맥스'];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenType");
    setIsLoggedIn(false);
    navigate('/'); 
  };

  // 🚀 3. 채팅 목록 클릭 시 이동할 함수
  const handleChatClick = (roomId) => {
    setIsChatOpen(false); // 드롭다운 닫기
    navigate(`/chat/${roomId}`); // 나중에 만들 전체 채팅 페이지로 이동!
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

        {/* 검색 영역 (기존과 동일) */}
        <div className="search-area" ref={searchRef}>
          {/* ... 기존 검색 영역 코드 동일 ... */}
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
            <button className="nav-link">내 근처</button>
            <button className="nav-link">인기매물</button>
          </div>
          
          {isLoggedIn && (
            <>
              {/* 🚨 4. 채팅 아이콘 영역 변경! (마우스 호버 시 드롭다운 열림) */}
              <div 
                className="user-profile-container" // 프로필 컨테이너 CSS 재활용
                onMouseEnter={() => setIsChatOpen(true)}
                onMouseLeave={() => setIsChatOpen(false)}
              >
                <button className="icon-btn" title="채팅">
                  <i className="far fa-comment-dots"></i>
                  {/* 안 읽은 메시지가 있으면 빨간 점 표시 */}
                  {hasUnreadChats && <span className="notification-dot"></span>}
                </button>

                {/* 채팅 드롭다운 창 */}
                {isChatOpen && (
                  <div className="profile-dropdown" style={{ width: '280px', right: '-80px' }}> {/* 위치/너비 살짝 조정 */}
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

              {/* 알림 버튼 (기존) */}
              <button className="icon-btn" title="알림">
                <i className="far fa-bell"></i>
                <span className="notification-dot"></span>
              </button>

              {/* 프로필 버튼 (기존) */}
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
                    <div className="dropdown-item" onClick={() => navigate('/mypage')}><i className="far fa-id-card"></i> 내 정보 보기</div>
                    <div className="dropdown-item" onClick={() => navigate('/sales')}><i className="fas fa-box-open"></i> 판매 내역</div>
                    <div className="dropdown-item" onClick={() => navigate('/purchase')}><i className="fas fa-shopping-bag"></i> 구매 내역</div>
                    <div className="dropdown-item" onClick={() => navigate('/wishlist')}><i className="fas fa-heart"></i> 관심 목록</div>
                    <hr />
                    <div className="dropdown-item logout-item" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> 로그아웃</div>
                  </div>
                )}
              </div>

              {/* 판매 버튼 (기존) */}
              <button className="sell-btn" onClick={() => navigate("/products/create")}>
                <i className="fas fa-plus"></i>
                <span>판매하기</span>
              </button>
            </>
          )}

          {!isLoggedIn && (
            <button className="login-btn" onClick={() => window.location.href = '/login'}>
              로그인 / 회원가입
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Header.css';

// 🌟 1. 우리가 만든 전역 창고 도구를 가져옵니다.
import { useUser } from '../UserContext'; // (경로가 ../contexts/UserContext 인지 확인해주세요!)

const Header = () => {
  // 🌟 2. 창고에서 내 정보(userInfo)와 정보 변경 함수(setUserInfo)를 꺼내옵니다.
  const { userInfo, setUserInfo } = useUser();
  
  // 🌟 3. 핵심! 로그인 상태는 "창고에 내 정보가 있나?" 하나로 완벽하게 판단 끝!
  const isLoggedIn = !!userInfo; 

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); 

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // 🌟 4. 권한 체크 로직: 토큰 주머니를 localStorage로 통일!
  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // 변경: sessionStorage -> localStorage

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
  }, [userInfo]); // userInfo가 바뀔 때(로그인/로그아웃)마다 다시 체크하도록 설정

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

  const recentSearches = ['아이폰 15 Pro', '캠핑 의자', '맥북 에어 M2'];
  const trendingKeywords = ['자전거', '플레이스테이션 5', '에어팟 맥스'];

  // 🌟 5. 로그아웃 로직 수정: localStorage 삭제 및 전역 창고 비우기!
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenType");
    setUserInfo(null); // 전역 창고를 텅 비웁니다.
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
               {/* 💡 기존 검색 드롭다운 내용 유지 */}
             </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="header-actions">
          <div className="nav-links">
            <button className="nav-link">내 근처</button>
            <button className="nav-link">인기매물</button>
          </div>
          
          {/* 🌟 isLoggedIn이 true일 때 (로그인 완료) 보여줄 버튼들 */}
          {isLoggedIn && (
            <>
              {/* 채팅 영역 */}
              <div 
                className="user-profile-container" 
                onMouseEnter={() => setIsChatOpen(true)}
                onMouseLeave={() => setIsChatOpen(false)}
              >
                <button className="icon-btn" title="채팅">
                  <i className="far fa-comment-dots"></i>
                  {hasUnreadChats && <span className="notification-dot"></span>}
                </button>

                {/* 채팅 드롭다운 창 */}
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

              {/* 프로필 버튼 */}
              <div
                className="user-profile-container"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button className="icon-btn user-avatar" title="내 프로필">
                  {/* 🌟 닉네임의 첫 글자를 보여주면 더 예쁩니다! */}
                  <i className="far fa-user"></i> 
                </button>
                {isProfileOpen && (
                  <div className="profile-dropdown">
                    {/* 🌟 내 닉네임을 상단에 띄워줍니다! */}
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

          {/* 🌟 isLoggedIn이 false일 때 (비로그인) 보여줄 로그인 버튼 */}
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
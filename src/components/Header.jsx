import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Header.css';

// 🌟 1. 우리가 만든 전역 창고 도구를 가져옵니다.
import { useUser } from '../UserContext';

// 👇 여기에 있던 isZoomed와 handleZoomToggle을 아래 Header 안으로 옮겼습니다!

const Header = () => {
  // 🌟 2. 창고에서 내 정보(userInfo)와 정보 변경 함수(setUserInfo)를 꺼내옵니다.
  const { userInfo, setUserInfo } = useUser();
  
  // 🌟 3. 핵심! 로그인 상태는 "창고에 내 정보가 있나?" 하나로 완벽하게 판단 끝!
  const isLoggedIn = !!userInfo; 

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); 

  // ✅ 컴포넌트 내부로 안전하게 이사 온 상태와 함수!
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed); // 상태를 반대로 뒤집음
    
    if (!isZoomed) {
      document.body.style.zoom = "1.15"; 
    } else {
      document.body.style.zoom = "1.0"; 
    }
  };

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleNearMeClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;   
          const lng = position.coords.longitude;  
          navigate(`/near-me?lat=${lat}&lng=${lng}`);
        },
        (error) => {
          console.error("위치 정보 에러:", error);
          alert("주변 매물을 보려면 위치 권한 허용이 필요합니다.");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert("이 브라우저에서는 위치 정보(Geolocation)를 지원하지 않습니다.");
    }
  };

  // 🌟 4. 권한 체크 로직: 토큰 주머니를 localStorage로 통일!
  useEffect(() => {
    const token = localStorage.getItem("accessToken"); 

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

  // 🌟 5. 로그아웃 로직 수정: sessionStorage 삭제 및 전역 창고 비우기!
  // (이전 대화에서 맞췄던 sessionStorage로 수정해두었습니다!)
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
               {/* 💡 기존 검색 드롭다운 내용 유지 */}
             </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="header-actions">
          <div className="nav-links">
            {/* 🌟 '내 근처' 버튼 */}
            <button className="nav-link" onClick={handleNearMeClick}>내 근처</button>
            <button className="nav-link">인기매물</button>
          </div>
          
          {/* 🌟 isLoggedIn이 true일 때 (로그인 완료) 보여줄 버튼들 */}
          {isLoggedIn && (
            <>
              {/* 채팅 영역 (생략) */}
              <div 
                className="user-profile-container" 
                onMouseEnter={() => setIsChatOpen(true)}
                onMouseLeave={() => setIsChatOpen(false)}
              >
                <button className="icon-btn" title="채팅">
                  <i className="far fa-comment-dots"></i>
                  {hasUnreadChats && <span className="notification-dot"></span>}
                </button>
                {/* ... 채팅 드롭다운 ... */}
              </div>

              {/* 알림 버튼 */}
              <button className="icon-btn" title="알림">
                <i className="far fa-bell"></i>
                <span className="notification-dot"></span>
              </button>

              {/* 🌟 화면 확대/축소 버튼 */}
              <button className="icon-btn" title="화면 확대/축소" onClick={handleZoomToggle}>
                <i className={`fas ${isZoomed ? 'fa-search-minus' : 'fa-search-plus'}`}></i>
              </button>

              {/* 프로필 버튼 */}
              <div
                className="user-profile-container"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <button className="icon-btn user-avatar" title="내 프로필">
                  <i className="far fa-user"></i> 
                </button>
                {/* ... 프로필 드롭다운 ... */}
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
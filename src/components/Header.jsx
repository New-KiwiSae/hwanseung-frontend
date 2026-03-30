import { useState, useRef, useEffect } from 'react';
import './Header.css'; // 전용 CSS 임포트

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  
  const currentUser = { id: 'tester123', name: '김관리', role: 'admin' };

  // 외부 클릭 시 검색창 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="header-nav">
      <div className="header-container">
        {/* 로고 */}
        <a href="/" className="logo">
          <span className="logo-brand">환승</span>마켓
        </a>

        {/* 검색 영역 */}
        <div className="search-area" ref={searchRef}>
          <div className={`search-input-wrapper ${isSearchOpen ? 'active' : ''}`}>
            {/* SVG 속성은 반드시 camelCase (strokeWidth 등) */}
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="어떤 물건을 찾으시나요?" 
              onFocus={() => setIsSearchOpen(true)}
            />
          </div>
          
          {isSearchOpen && (
            <div className="search-dropdown animate-slide-up">
              <p>최근 검색어: 아이폰 15</p>
            </div>
          )}
        </div>

        {/* 메뉴 영역 */}
        <div className="header-menus">
          {(currentUser.role === 'admin' || currentUser.role === 'super') && (
            <a href="/admin" className="admin-btn">⚙️ 관리자 페이지</a>
          )}
          <button className="menu-btn">채팅</button>
          <button className="menu-btn">알림</button>
          <button className="menu-btn">내 정보</button>
          <button className="sell-btn">판매하기</button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
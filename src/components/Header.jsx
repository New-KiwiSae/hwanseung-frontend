import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './Header.css';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

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
              <div className="search-dropdown-grid">
                <div className="search-dropdown-col">
                  <div className="dropdown-label">최근 검색어</div>
                  <div className="recent-tags">
                    {recentSearches.map((tag, idx) => (
                      <button key={idx} className="recent-tag">{tag}</button>
                    ))}
                  </div>
                </div>
                <div className="search-dropdown-col">
                  <div className="dropdown-label">인기 키워드 <i className="fas fa-fire" style={{ color: '#ef4444', marginLeft: 4 }}></i></div>
                  <div className="trending-list">
                    {trendingKeywords.map((keyword, idx) => (
                      <div key={idx} className="trending-item">
                        <span className="trending-rank">{idx + 1}</span>
                        <span>{keyword}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="header-actions">
          <div className="nav-links">
            <button className="nav-link">내 근처</button>
            <button className="nav-link">인기매물</button>
          </div>

          <button className="icon-btn" title="채팅">
            <i className="far fa-comment-dots"></i>
          </button>
          <button className="icon-btn" title="알림">
            <i className="far fa-bell"></i>
            <span className="notification-dot"></span>
          </button>
          <button className="icon-btn user-avatar" title="내 프로필">
            <i className="far fa-user"></i>
          </button>

          <button className="sell-btn" onClick={() => navigate("/products/create")}>
            <i className="fas fa-plus"></i>
            <span>판매하기</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

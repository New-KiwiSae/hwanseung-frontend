import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import './Header.css';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useUser } from '../UserContext';

const Header = () => {
  const { userInfo, setUserInfo } = useUser();
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // ★ 검색 관련 state 추가
  const [searchKeyword, setSearchKeyword] = useState('');
  const [popularKeywords, setPopularKeywords] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // 알림 관련 상태값들
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const stompClient = useRef(null);

  const searchRef = useRef(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("accessToken");
  const currentUser = userInfo?.username || userInfo?.userId || sessionStorage.getItem("username");

  // ★ 인기 검색어 로드
  const fetchPopularKeywords = async () => {
    try {
      const res = await axios.get('/api/search/popular');
      setPopularKeywords(res.data || []);
    } catch (e) {
      console.error('인기 검색어 로드 실패:', e);
    }
  };

  // ★ localStorage에서 최근 검색어 로드
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentSearches');
      setRecentSearches(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setRecentSearches([]);
    }
  };

  // ★ 검색 실행
  const handleSearch = async (keyword) => {
    const trimmed = (keyword || searchKeyword).trim();
    if (!trimmed) return;

    // 최근 검색어 저장 (중복 제거, 최대 10개)
    try {
      const prev = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updated = [trimmed, ...prev.filter(k => k !== trimmed)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (e) {
      // localStorage 접근 실패 시 무시
    }

    // 키워드 카운트 증가 (실패해도 검색은 진행)
    axios.post('/api/search/log', { keyword: trimmed }).catch(() => {});

    setIsSearchOpen(false);
    setSearchKeyword('');
    navigate(`/products?keyword=${encodeURIComponent(trimmed)}`);
  };

  // ★ 최근 검색어 개별 삭제
  const removeRecentSearch = (e, keyword) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter(k => k !== keyword);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (err) {
      // localStorage 접근 실패 시 무시
    }
  };

  // ★ 최근 검색어 전체 삭제
  const clearAllRecentSearches = () => {
    try {
      localStorage.removeItem('recentSearches');
    } catch (e) {}
    setRecentSearches([]);
  };

  // ★ Enter 키 검색
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ★ 검색창 열릴 때 데이터 로드
  useEffect(() => {
    if (isSearchOpen) {
      fetchPopularKeywords();
      loadRecentSearches();
    }
  }, [isSearchOpen]);

  // --- 아래부터 기존 코드 그대로 유지 ---

  const handleNearMeClick = () => {
    if (userInfo && userInfo.address) {
      const { kakao } = window;
      if (!kakao || !kakao.maps) {
        alert("카카오 지도 스크립트를 불러오지 못했습니다.");
        return;
      }
      kakao.maps.load(() => {
        if (!kakao.maps.services) {
          fallbackToBrowserLocation();
          return;
        }
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(userInfo.address, (result, status) => {
          if (status === kakao.maps.services.Status.OK) {
            const lat = result[0].y;
            const lng = result[0].x;
            navigate(`/near-me?lat=${lat}&lng=${lng}`);
          } else {
            fallbackToBrowserLocation();
          }
        });
      });
    } else {
      fallbackToBrowserLocation();
    }
  };

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

  useEffect(() => {
    const status = sessionStorage.getItem('status');
    const currentPath = window.location.pathname;
    const allowedPaths = ['/login', '/social-signup-extra', '/oauth/callback'];
    if (status === 'PENDING' && !allowedPaths.includes(currentPath)) {
      alert("추가 정보 입력이 필요합니다.");
      navigate("/social-signup-extra");
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;
        const authorizedRoles = ["SUPER", "SUB", "ROLE_SUPER", "ROLE_SUB", "ADMIN", "ROLE_ADMIN"];
        setIsAdmin(authorizedRoles.includes(userRole));
        setisLoggedIn(true);
      } catch (error) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [token]);

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
    const sessionStatus = sessionStorage.getItem('status');
    if (!token || !currentUser || sessionStatus === 'PENDING') return;

    const fetchHistoryNotifications = async () => {
      try {
        const res = await axios.get(`/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const systemNotis = res.data.filter(n => n.type !== 'CHAT');
        setNotifications(systemNotis);
      } catch (error) {
        console.error("알림 내역 불러오기 실패:", error);
      }
    };
    fetchHistoryNotifications();

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws-chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/sub/user/${currentUser}/notification`, (message) => {
          const newNoti = JSON.parse(message.body);
          if (newNoti.type === 'CHAT') return;
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
    if (noti.type === 'FAVORITE' && noti.relatedItemId) {
      navigate(`/products/${noti.relatedItemId}`);
    }
    try {
      await axios.put(`/api/notifications/${noti.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.error(e); }
  };

  const handleReadAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    try {
      await axios.put(`/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.error(e); }
  };

  const handleDeleteNoti = async (e, notiId) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== notiId));
    try {
      await axios.delete(`/api/notifications/${notiId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("알림 삭제 통신 실패:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setUserInfo(null);
    window.location.href = '/';
  };

  return (
    <header className={`header-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <a href="/" className="logo">
          <div className="logo-icon"><i className="fas fa-exchange-alt"></i></div>
          <span><span className="logo-brand">환승</span>마켓</span>
        </a>

        {/* ★ 검색 영역 전체 교체 */}
        <div className="search-area" ref={searchRef}>
          <div className={`search-input-wrapper ${isSearchOpen ? 'active' : ''}`}>
            <i className="fas fa-search search-icon" onClick={() => handleSearch()} style={{ cursor: 'pointer' }}></i>
            <input
              type="text"
              placeholder="어떤 물건을 환승할까요?"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchKeyword && (
              <i
                className="fas fa-times search-clear-btn"
                onClick={() => setSearchKeyword('')}
              ></i>
            )}
          </div>

          {/* ★ 검색 드롭다운 */}
          {isSearchOpen && (
            <div className="search-dropdown">
              <div className="search-dropdown-grid">

                {/* 좌측: 최근 검색어 */}
                <div className="search-dropdown-col">
                  <div className="dropdown-label-row">
                    <span className="dropdown-label">최근 검색어</span>
                    {recentSearches.length > 0 && (
                      <span className="dropdown-clear-all" onClick={clearAllRecentSearches}>
                        전체 삭제
                      </span>
                    )}
                  </div>
                  {recentSearches.length === 0 ? (
                    <div className="search-empty">최근 검색어가 없습니다.</div>
                  ) : (
                    <div className="recent-search-list">
                      {recentSearches.map((keyword, idx) => (
                        <div
                          key={idx}
                          className="recent-search-item"
                          onClick={() => handleSearch(keyword)}
                        >
                          <div className="recent-search-left">
                            <i className="fas fa-clock recent-search-icon"></i>
                            <span>{keyword}</span>
                          </div>
                          <button
                            className="recent-search-delete"
                            onClick={(e) => removeRecentSearch(e, keyword)}
                            title="삭제"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 우측: 실시간 인기 검색어 */}
                <div className="search-dropdown-col search-dropdown-col-right">
                  <div className="dropdown-label">실시간 인기 검색어</div>
                  {popularKeywords.length === 0 ? (
                    <div className="search-empty">인기 검색어가 없습니다.</div>
                  ) : (
                    <div className="trending-list">
                      {popularKeywords.map((item, idx) => (
                        <div
                          key={idx}
                          className="trending-item"
                          onClick={() => handleSearch(item.keyword)}
                        >
                          <span className="trending-rank">{idx + 1}</span>
                          <span className="trending-keyword">{item.keyword}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* ★ 검색 영역 끝 */}

        <div className="header-actions">
          <div className="nav-links">
            <button className="nav-link" onClick={handleNearMeClick}>내 근처</button>
            <button className="nav-link" onClick={() => navigate('/products?filter=popular')}>인기매물</button>
          </div>

          {isLoggedIn && (
            <>
              <div className="user-profile-container" onMouseEnter={() => setIsNotiOpen(true)} onMouseLeave={() => setIsNotiOpen(false)}>
                <button className="icon-btn" title="알림">
                  <i className="far fa-bell"></i>
                  {unreadNotiCount > 0 && (
                    <span className="noti-badge">
                      {unreadNotiCount > 9 ? '9+' : unreadNotiCount}
                    </span>
                  )}
                </button>

                {isNotiOpen && (
                  <div className="profile-dropdown noti-dropdown">
                    <div className="noti-header">
                      <span>새로운 알림</span>
                      {unreadNotiCount > 0 && (
                        <span className="noti-read-all" onClick={(e) => { e.stopPropagation(); handleReadAll(); }}>
                          모두 읽음
                        </span>
                      )}
                    </div>

                    {!(notifications && notifications.length > 0) ? (
                      <div className="noti-empty">새로운 알림이 없습니다.</div>
                    ) : (
                      notifications.map((noti) => (
                        <div
                          key={noti.id}
                          className={`noti-item ${!noti.isRead ? 'unread' : ''}`}
                          onClick={() => handleNotiClick(noti)}
                        >
                          <div className="noti-item-top">
                            <div className="noti-content">
                              {noti.type === 'FAVORITE' && <i className="fas fa-heart noti-icon heart"></i>}
                              {noti.type === 'NOTICE' && <i className="fas fa-bullhorn noti-icon notice"></i>}
                              {noti.content}
                            </div>
                            <button onClick={(e) => handleDeleteNoti(e, noti.id)} className="noti-delete-btn" title="알림 삭제">
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                          <div className="noti-date">
                            {new Date(noti.createdAt || Date.now()).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {isLoggedIn && (
                <div className="user-profile-container" onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                  <button className="icon-btn user-avatar" title="내 프로필"><i className="far fa-user"></i></button>
                  {isProfileOpen && (
                    <div className="profile-dropdown">
                      <div className="dropdown-item" style={{ fontWeight: 'bold', color: '#ff6f0f' }}>{(userInfo?.nickname || userInfo?.username || sessionStorage.getItem("username") || "사용자")}님 환영합니다!</div>
                      <hr style={{ margin: '5px 0' }} />
                      <div className="dropdown-item" onClick={() => navigate('/mypage')}><i className="far fa-id-card"></i> 내 정보 보기</div>
                      <div className="dropdown-item" onClick={() => navigate('/sales')}><i className="fas fa-box-open"></i> 거래 내역</div>
                      <div className="dropdown-item" onClick={() => navigate('/wishlist')}><i className="fas fa-heart"></i> 관심 목록</div>
                      <hr />
                      <div className="dropdown-item logout-item" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> 로그아웃</div>
                    </div>
                  )}
                </div>
              )}

              <button className="sell-btn" onClick={() => navigate("/products/create")}><i className="fas fa-plus"></i><span>판매하기</span></button>
              {isAdmin && <button className="admin-btn" onClick={() => navigate("/admin/dashboard")}><i className="fas fa-lock"></i><span>관리자 페이지</span></button>}
            </>
          )}

          {!isLoggedIn && <button className="login-btn" onClick={() => navigate('/login')}>로그인 / 회원가입</button>}
        </div>
      </div>
    </header>
  );
};

export default Header;
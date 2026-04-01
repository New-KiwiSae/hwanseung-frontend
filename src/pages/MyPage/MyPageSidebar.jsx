import React from 'react';
import { NavLink } from 'react-router-dom';

export default function MyPageSidebar({ userInfo }) {
    return (
        <aside className="sidebar">
            {/* 프로필 영역 */}
            <div className="sidebar-profile">
                <div className="avatar">👤</div>
                <div className="info"> {/* CSS에서 이 부분을 flex: 1로 넓혀줍니다 */}
                    <div className="name-wrapper">
                        <p className="name">{userInfo?.nickname}</p>
                        <NavLink to="/mypage" className="edit-profile-btn-link">
                            <button className="edit-profile-btn" title="정보 수정">
                                수정
                            </button>
                        </NavLink>
                    </div>
                </div>
            </div>

            {/* 페이 영역 */}
            <div className="sidebar-pay">
                <p>환승Pay <b>₩ 2,450</b></p>
                <button onClick={() => alert('충전 페이지로 이동')}>충전</button>
            </div>

            {/* 메뉴 네비게이션 */}
            <nav className="sidebar-nav">
                <p className="nav-label">활동 관리</p>

                <NavLink to="/sales" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="fas fa-box-open"></i> 판매 내역
                    </button>
                </NavLink>

                <NavLink to="/purchase" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="fas fa-shopping-bag"></i> 구매 내역
                    </button>
                </NavLink>

                <NavLink to="/wishlist" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="fas fa-heart"></i> 관심 목록
                    </button>
                </NavLink>

                <p className="nav-label" style={{ marginTop: '20px' }}>고객지원</p>

                <button onClick={() => window.location.href = '/faq'}>
                    <i className="fas fa-question-circle"></i> 자주 묻는 질문
                </button>
                <button onClick={() => window.location.href = '/notice'}>
                    <i className="fas fa-bullhorn"></i> 공지사항
                </button>
            </nav>

            {/* 로그아웃 */}
            <button className="sidebar-logout" onClick={() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }}>로그아웃</button>
        </aside>
    );
}
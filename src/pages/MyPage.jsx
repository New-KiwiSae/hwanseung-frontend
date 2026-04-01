import React, { useState, useEffect } from 'react';
import { fetchUser } from '../api/UserAPI';
import './MyPage.css';

export default function MyPage() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState('dashboard'); // 현재 보고 있는 화면 상태

    useEffect(() => {
        fetchUser().then(res => {
            setUserInfo(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="mypage-body">로딩 중...</div>;

    // 오른쪽 메인 영역에 렌더링될 컨텐츠 결정
    const renderMainContent = () => {
        switch (activeMenu) {
            case 'sales': return <div className="content-view"><h2>판매 내역</h2><p>준비 중인 서비스입니다.</p></div>;
            case 'purchase': return <div className="content-view"><h2>구매 내역</h2><p>준비 중인 서비스입니다.</p></div>;
            case 'wishlist': return <div className="content-view"><h2>관심 목록</h2><p>준비 중인 서비스입니다.</p></div>;
            case 'mypage': return <div className="content-view"><h2>마이페이지</h2><p>마이페이지</p></div>;
            default: return <DashboardView userInfo={userInfo} />;
        }
    };

    return (
        <div className="mypage-body">
            <div className="web-sidebar-layout">

                {/* 왼쪽 사이드바: 프로필 + 페이 + 메뉴 */}
                <aside className="sidebar">
                    <div className="sidebar-profile">
                        <div className="avatar">👤</div>
                        <div className="info">
                            <div className="name-wrapper">
                                <p className="name">{userInfo?.nickname}</p>
                                {/* 정보 수정 버튼 추가 */}
                                <button
                                    className="edit-profile-btn"
                                    onClick={() => setActiveMenu('mypage')}
                                    title="정보 수정"
                                >
                                    수정
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-pay">
                        <p>환승Pay <b>₩ 2,450</b></p>
                        <button onClick={() => alert('충전 페이지로 이동')}>충전</button>
                    </div>

                    <nav className="sidebar-nav">
                        <p className="nav-label">활동 관리</p>
                        
                        <button className={activeMenu === 'sales' ? 'active' : ''} onClick={() => setActiveMenu('sales')}>
                            <i className="fas fa-box-open"></i> 판매 내역
                        </button>
                        <button className={activeMenu === 'purchase' ? 'active' : ''} onClick={() => setActiveMenu('purchase')}>
                            <i className="fas fa-shopping-bag"></i> 구매 내역
                        </button>
                        <button className={activeMenu === 'wishlist' ? 'active' : ''} onClick={() => setActiveMenu('wishlist')}>
                            <i className="fas fa-heart"></i> 관심 목록
                        </button>

                        <p className="nav-label" style={{ marginTop: '20px' }}>고객지원</p>
                        <button onClick={() => window.location.href = '/faq'}>
                            <i className="fas fa-question-circle"></i> 자주 묻는 질문
                        </button>
                        <button onClick={() => window.location.href = '/notice'}>
                            <i className="fas fa-bullhorn"></i> 공지사항
                        </button>
                    </nav>

                    <button className="sidebar-logout" onClick={() => {
                        localStorage.removeItem('accessToken');
                        window.location.href = '/login';
                    }}>로그아웃</button>
                </aside>

                {/* 오른쪽 메인 콘텐츠 영역 */}
                <main className="main-viewport">
                    {renderMainContent()}
                </main>

            </div>
        </div>
    );
}

// 기본 화면: 대시보드 뷰
function DashboardView({ userInfo }) {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>ㅎㅅㅎ</h1>
            </header>

            <div className="stat-cards">
                <div className="stat-card"><span>판매 중</span><strong>12</strong></div>
                <div className="stat-card"><span>구매 완료</span><strong>48</strong></div>
                <div className="stat-card"><span>관심 상품</span><strong>15</strong></div>
            </div>

            <div className="dashboard-grid">
                <div className="grid-item">
                    <h3>최근 거래 활동</h3>
                    <p className="empty-text">최근 활동 내역이 없습니다.</p>
                </div>
                <div className="grid-item">
                    <h3>내 동네 정보</h3>
                    <p className="text">{userInfo?.address || '지역을 설정해주세요.'}</p>
                </div>
            </div>
        </div>
    );
}
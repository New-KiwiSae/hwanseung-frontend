import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';

export default function MyPageSidebar({ userInfo }) {
    const navigate = useNavigate();
    // const IMG_BASE_URL = "http://localhost:8080";
    const IMG_BASE_URL = "";

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("tokenType");
        window.location.href = '/';
    };

    // 1. 내 잔액을 저장할 상태(State) 창고 만들기 (기본값은 0원)
    const [balance, setBalance] = useState(0);

    // [신규 추가] 점수에 따른 레벨 계산 함수 (요구 점수가 점진적으로 증가)
    const getTrustLevel = (score) => {
        if (!score || score < 0) return 0; // 점수가 없거나 음수면 레벨 0
        if (score >= 1500) return 6; // +600
        if (score >= 900) return 5;  // +500
        if (score >= 400) return 4;  // +300
        if (score >= 100) return 3;  // +100
        if (score >= 20) return 2;   // +20
        return 1;                    // 0~19
    };

    // 2. 사이드바 화면이 처음 켜질 때 딱 한 번 실행 (잔액 물어보기)
    // 🌟 무전기 수신기 설치 완료!
    useEffect(() => {
        const fetchBalance = async () => {
            const token = sessionStorage.getItem('accessToken');
            if (!token) return;

            try {
                // 💡 주의: 백엔드 주소가 /api/v1/pay/balance 인지 /api/pay/balance 인지 확인하고 맞춰주세요!
                const response = await axios.get('/api/v1/pay/balance', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBalance(response.data);
            } catch (error) {
                console.error("잔액을 불러오지 못했습니다.", error);
            }
        };

        // 1. 화면이 처음 켜질 때 잔액 가져오기
        fetchBalance();

        // 2. 무전기 켜기: 누군가 'updateBalance' 라고 방송하면, fetchBalance를 다시 실행해라!
        window.addEventListener('updateBalance', fetchBalance);

        // 3. 컴포넌트가 꺼질 때는 무전기도 끕니다. (메모리 누수 방지)
        return () => {
            window.removeEventListener('updateBalance', fetchBalance);
        };
    }, []);
    return (
        <aside className="sidebar">
            {/* 프로필 영역 */}
            <div className="sidebar-profile">
                <div className="avatar" >
                    {userInfo?.profileImagePath ? (
                        <img
                            src={`${IMG_BASE_URL}${userInfo.profileImagePath}`}
                            alt="Profile"
                        />
                    ) : (
                        <span style={{ fontSize: '24px' }}>👤</span>
                    )}
                </div>
                <div className="info">
                    <div className="name-wrapper">
                        <p className="name">{userInfo?.nickname}</p>
                        {/* 레벨 표시부 수정 */}
                        <div className="level-badge">
                            <span className="level-text" style={{ color: 'var(--accent-color)' }}>
                                {userInfo?.level ? `Lv.${userInfo.level}` : 'Lv.0'}
                            </span>
                        </div>

                        {/* 👇 새로 추가하는 문구 */}
                        {userInfo?.level < 5 ? (
                            <p className="next-level-info">
                                다음 레벨까지 <strong>{userInfo?.nextLevelRemaining ?? 0}</strong> 남았습니다.
                            </p>
                        ) : (
                            <p className="next-level-info max-level">최고 레벨에 도달했습니다!</p>
                        )}<br/>
                        <NavLink to="/mypage" className="edit-profile-btn-link">
                            <button className="edit-profile-btn">
                                내정보 보기
                            </button>
                        </NavLink>
                    </div>
                </div>
            </div>

            {/* 페이 영역 */}
            <div className="sidebar-pay">
                {/* 🌟 매직으로 쓴 가짜 숫자 대신, 받아온 진짜 balance를 씁니다. */}
                {/* 💡 toLocaleString() 함수를 쓰면 2450 -> 2,450 처럼 예쁘게 콤마(,)가 찍힙니다! */}
                <p style={{ color: '#00D27A', fontSize: '16px', fontWeight: 'bold' }}>환승Pay <b>₩ {balance.toLocaleString()}</b></p>
            </div>

            {/* 메뉴 네비게이션 */}
            <nav className="sidebar-nav">
                <p className="nav-label">활동 관리</p>

                <NavLink to="/sales" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="fas fa-box-open"></i> 거래 내역
                    </button>
                </NavLink>

                {/* [신규 추가] 신뢰도 레벨 내역 메뉴 */}
                <NavLink to="/trust-score" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="fas fa-shield-alt"></i> 신뢰도 레벨 내역
                    </button>
                </NavLink>

                <NavLink to="/wishlist" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="fas fa-heart"></i> 관심 목록
                    </button>
                </NavLink>

                <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="far fa-bell"></i> 알림 보기
                    </button>
                </NavLink>

                <p className="nav-label" style={{ marginTop: '20px' }}>고객지원</p>

                <button onClick={() => window.location.href = '/inquiries'}>
                    <i className="fas fa-question-circle"></i> 자주 묻는 질문
                </button>

                <NavLink to="/notices" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="fas fa-heart"></i> 공지사항
                    </button>
                </NavLink>
            </nav>

            <button className="sidebar-logout" onClick={handleLogout}>
                로그아웃
            </button>
        </aside>
    );
}
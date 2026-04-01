import React, { useState, useEffect } from 'react'; // 🌟 useState, useEffect 추가
import { NavLink } from 'react-router-dom';
import axios from 'axios'; // 🌟 은행원 역할을 할 axios 추가

export default function MyPageSidebar({ userInfo }) {
    // 1. 내 잔액을 저장할 상태(State) 창고 만들기 (기본값은 0원)
    const [balance, setBalance] = useState(0);

    // 2. 사이드바 화면이 처음 켜질 때 딱 한 번 실행 (잔액 물어보기)
    useEffect(() => {
        const fetchBalance = async () => {
            const token = localStorage.getItem('accessToken');
            
            // 출입증(토큰)이 없으면 그냥 함수를 종료합니다.
            if (!token) return; 

            try {
                // 우리가 백엔드에 만들어둔 잔액 조회 API 호출!
                const response = await axios.get('/api/pay/balance', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // 서버가 준 진짜 잔액을 내 화면 상태(balance)에 저장합니다.
                setBalance(response.data); 
            } catch (error) {
                console.error("잔액을 불러오지 못했습니다.", error);
            }
        };

        fetchBalance();
    }, []); // 빈 배열[]을 넣어야 무한 반복되지 않고 처음 한 번만 실행됩니다.

    return (
        <aside className="sidebar">
            {/* 프로필 영역 */}
            <div className="sidebar-profile">
                <div className="avatar">👤</div>
                <div className="info">
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
                {/* 🌟 매직으로 쓴 가짜 숫자 대신, 받아온 진짜 balance를 씁니다. */}
                {/* 💡 toLocaleString() 함수를 쓰면 2450 -> 2,450 처럼 예쁘게 콤마(,)가 찍힙니다! */}
                <p>환승Pay <b>₩ {balance.toLocaleString()}</b></p>
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
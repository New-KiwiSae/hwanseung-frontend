import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';

export default function MyPageSidebar({ userInfo }) {
    const navigate = useNavigate();
    const IMG_BASE_URL = "";

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("tokenType");
        window.location.href = '/';
    };

    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const fetchBalance = async () => {
            const token = sessionStorage.getItem('accessToken');
            if (!token) return;

            try {
                const response = await axios.get('/api/v1/pay/balance', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBalance(response.data);
            } catch (error) {
                console.error("잔액을 불러오지 못했습니다.", error);
            }
        };

        fetchBalance();

        window.addEventListener('updateBalance', fetchBalance);

        return () => {
            window.removeEventListener('updateBalance', fetchBalance);
        };
    }, []);
    return (
        <aside className="sidebar">
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
                        <NavLink to="/mypage" className="edit-profile-btn-link">
                            <button className="edit-profile-btn">
                                내정보 보기
                            </button>
                        </NavLink>
                    </div>
                </div>
            </div>

            <div className="sidebar-pay">
                <p style={{ color: '#00D27A', fontSize: '16px', fontWeight: 'bold' }}>환승Pay <b>₩ {balance.toLocaleString()}</b></p>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-label">활동 관리</p>

                <NavLink to="/sales" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <button>
                        <i className="fas fa-box-open"></i> 거래 내역
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
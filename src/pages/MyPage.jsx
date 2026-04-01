import React, { useState, useEffect } from 'react';
import { fetchUser } from '../api/UserAPI';
import axios from 'axios'; // axios 설치 필요: npm install axios
import './MyPage.css';

export default function MyPage() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                
                // 1. 이미 정의된 fetchUser 함수 호출
                const response = await fetchUser();
                
                // 2. 서버 응답 데이터 구조에 맞춰 저장
                // 보통 response.data에 실제 데이터가 들어있습니다.
                setUserInfo(response.data); 
            } catch (err) {
                console.error('마이페이지 정보 로드 실패:', err);
                
                // 에러 메시지 세분화 (401: 인증만료 등)
                if (err.response && err.response.status === 401) {
                    setError('세션이 만료되었습니다. 다시 로그인해주세요.');
                } else {
                    setError('사용자 정보를 가져오는 중 오류가 발생했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const menuItems = [
        { title: '구매 내역', desc: '내가 구매한 상품 확인', icon: '📦' },
        { title: '판매 내역', desc: '내가 판매 중인 상품 관리', icon: '💰' },
        { title: '관심 목록', desc: '찜한 아이템 모아보기', icon: '❤️' },
        { title: '계정 설정', desc: '회원 정보 및 보안 관리', icon: '⚙️' }
    ];

    if (loading) return <div className="mypage-container">데이터를 불러오는 중입니다...</div>;
    if (error) return <div className="mypage-container">{error}</div>;

    return (
        <div className="mypage-container">
            <section className="profile-card">
                <div className="profile-img-wrap">
                    <div className="profile-image-placeholder">
                        {userInfo?.profileImgUrl ? <img src={userInfo.profileImgUrl} alt="profile" /> : '👤'}
                    </div>
                    <div className="profile-edit-badge">📸</div>
                </div>

                <div className="profile-info">
                    <span className="user-badge">{userInfo?.level || '그린 등급'}</span>
                    <h2>
                        {userInfo?.name || '사용자'} <span>님, 안녕하세요!</span>
                    </h2>
                    <div className="profile-meta">
                        <span><strong>이메일</strong> {userInfo?.email}</span>
                        <span><strong>가입일</strong> {userInfo?.createdAt || userInfo?.joinDate}</span>
                    </div>
                </div>
            </section>

            <div className="mypage-menu-grid">
                {menuItems.map((item, index) => (
                    <div key={index} className="menu-item-card">
                        <div className="menu-item-content">
                            <div className="menu-icon">{item.icon}</div>
                            <div className="menu-text">
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        </div>
                        <div className="menu-arrow">→</div>
                    </div>
                ))}
            </div>

            <footer className="mypage-footer">
                <button className="logout-button" onClick={() => {
                    localStorage.removeItem('accessToken'); // 사용하시는 토큰 키값에 맞춰 수정
                    window.location.href = '/login';
                }}>
                    로그아웃
                </button>
            </footer>
        </div>
    );
}
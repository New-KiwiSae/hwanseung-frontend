import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import '../../pages/MyPage.css'; // 기존 스타일 재활용 또는 분리

const TrustScoreHistory = () => {
    // MyPageLayout의 Outlet에서 넘겨준 userInfo 받기
    const { userInfo } = useOutletContext(); 
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = sessionStorage.getItem('accessToken');
                const response = await axios.get('/api/user/trust-score/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(response.data);
            } catch (error) {
                console.error("신뢰도 내역을 불러오는데 실패했습니다.", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className="mypage-container">
            <div className="mypage-header">
                <h2>신뢰도 레벨 내역</h2>
                <p>현재 나의 신뢰 점수는 <strong>{userInfo?.trustScore || 0}점</strong> 입니다.</p>
            </div>

            <div className="mypage-card" style={{ marginTop: '20px' }}>
                {history.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>점수 변동 내역이 없습니다.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {history.map((item) => (
                            <li key={item.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '15px 0',
                                borderBottom: '1px solid #eee'
                            }}>
                                <div>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{item.reason}</p>
                                    <span style={{ fontSize: '12px', color: '#999' }}>
                                        {new Date(item.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div style={{
                                    fontWeight: 'bold',
                                    color: item.scoreChange > 0 ? '#00D27A' : '#FF6F0F'
                                }}>
                                    {item.scoreChange > 0 ? `+${item.scoreChange}` : item.scoreChange}점
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TrustScoreHistory;
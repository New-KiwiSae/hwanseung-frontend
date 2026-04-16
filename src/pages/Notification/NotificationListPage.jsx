import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginChk } from "../../api/LoginChk"; // 본인 경로에 맞게 수정
// import './NotificationListPage.css'; // 필요시 CSS 파일 생성

function NotificationListPage() {
  if (loginChk()) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const limitno = 10; // 알림은 한 번에 10개씩 보여주기

    const token = sessionStorage.getItem("accessToken");

    // 데이터 로드 함수
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // CHAT 타입 제외한 시스템/관심매물 알림만 필터링
        const allList = res.data.filter(n => n.type !== 'CHAT');

        if (allList.length === 0) {
          setHasMore(false);
        } else {
          // 프론트엔드 슬라이싱 기법 (NoticeListPage와 동일)
          const newData = allList.slice(0, page * limitno);
          setList(newData);

          if (newData.length >= allList.length) {
            setHasMore(false);
          }
        }
        setPage((prev) => prev + 1);
      } catch (err) {
        console.error('알림 데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchNotifications();
    }, []);

    const handleLoadMore = () => {
      fetchNotifications();
    };

    // 개별 알림 클릭 (읽음 처리 + 이동)
    const handleNotiClick = async (noti) => {
      // 읽음 상태 업데이트 (화면 즉각 반영)
      setList(prev => prev.map(n => n.id === noti.id ? { ...n, isRead: true, read: true } : n));
      
      try {
        await axios.put(`/api/notifications/${noti.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) { 
        console.error("읽음 처리 실패", e); 
      }

      // 알림 타입에 따른 페이지 이동
      if (noti.type === 'FAVORITE' && noti.relatedItemId) {
        navigate(`/products/${noti.relatedItemId}`);
      } else if (noti.type === 'NOTICE') {
        // 공지사항 페이지로 이동하고 싶다면 추가
        // navigate(`/notices/${noti.relatedItemId}`);
      }
    };

    // 알림 개별 삭제
    const handleDeleteNoti = async (e, notiId) => {
      e.stopPropagation();
      setList(prev => prev.filter(n => n.id !== notiId)); // 화면에서 즉시 삭제
      try {
        await axios.delete(`/api/notifications/${notiId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error("알림 삭제 통신 실패:", error);
      }
    };

    return (
      <div className="main-viewport">
        <div className="content-view">
          <h2 className="notice-title" style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
            <i className="far fa-bell"></i> 전체 알림
          </h2>

          <div className="notice-list-container">
            {list.map((noti) => (
              <div
                key={noti.id}
                className="notice-list-item"
                onClick={() => handleNotiClick(noti)}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: (!noti.isRead && !noti.read) ? '#fff9f5' : '#fff' // 안 읽은 알림 배경색 강조
                }}
              >
                <div className="notice-item-info" style={{ flex: 1 }}>
                  <div className="notice-item-category" style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                    {new Date(noti.createdAt || Date.now()).toLocaleString()}
                  </div>
                  <div className="notice-item-title" style={{ fontSize: '15px', color: (!noti.isRead && !noti.read) ? '#000' : '#888' }}>
                    {noti.type === 'FAVORITE' && <i className="fas fa-heart" style={{ color: '#ff4d4f', marginRight: '8px' }}></i>}
                    {noti.type === 'NOTICE' && <i className="fas fa-bullhorn" style={{ color: '#ff6f0f', marginRight: '8px' }}></i>}
                    {noti.content}
                  </div>
                </div>
                
                {/* 삭제 버튼 */}
                <button 
                  onClick={(e) => handleDeleteNoti(e, noti.id)} 
                  style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: '10px' }}
                  title="알림 삭제"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>

          {!loading && list.length === 0 && (
            <div className="notice-empty-state" style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
              <i className="far fa-bell-slash" style={{ fontSize: '40px', marginBottom: '15px', color: '#ddd' }}></i>
              <p>수신된 알림이 없습니다.</p>
            </div>
          )}

          {loading && <p style={{ textAlign: 'center', padding: '20px' }}>데이터를 불러오는 중입니다...</p>}

          {!loading && hasMore && list.length > 0 && (
            <div className="more-btn-container" style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                className="notice-more-btn" 
                onClick={handleLoadMore}
                style={{ padding: '10px 30px', borderRadius: '20px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                더보기 <i className="fas fa-chevron-down"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null; // loginChk가 실패하면 자동으로 로그인 페이지로 튕기므로 null 반환
}

export default NotificationListPage;
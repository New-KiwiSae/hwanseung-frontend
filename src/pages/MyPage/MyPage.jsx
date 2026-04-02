import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ChargePay from '../../ChargePay'; 
import '../../chargepay.css'; 
import '../../pages/MyPage.css';

// 🌟 1. 우리가 만든 전역 창고 도구를 가져옵니다! (경로 확인 필수)
import { useUser } from '../../UserContext';

const MyPage = () => {
  const navigate = useNavigate();
  
  // 🌟 2. 창고에서 내 정보(userInfo)와 재요청 함수(fetchUser), 로딩 상태를 꺼내옵니다.
  const { userInfo, isLoading, fetchUser } = useUser();
  
  // 수정 모드일 때 임시로 타이핑할 공간 (기존 데이터를 덮어쓰지 않기 위함)
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false); 
  const [isPayModalOpen, setIsPayModalOpen] = useState(false); 

  // 🌟 3. 창고에서 userInfo가 도착하면, 수정 창(editData)에도 미리 세팅해 줍니다.
  useEffect(() => {
    if (userInfo) {
      setEditData(userInfo);
    }
  }, [userInfo]);

  // 비로그인 사용자 튕겨내기 로직 (로딩이 끝났는데도 정보가 없으면 튕겨냅니다)
  useEffect(() => {
    if (!isLoading && !userInfo) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
    }
  }, [isLoading, userInfo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target; 
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.put('/api/user', editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("성공적으로 정보가 수정되었습니다! 🎉");
      
      // 🌟 4. 수정을 완료했으니, 창고 관리자에게 "서버에서 최신 정보 다시 가져와 줘!" 라고 부탁합니다.
      await fetchUser(); 
      setIsEditing(false); 
    } catch (error) {
      console.error("수정 실패:", error);
      alert("정보 수정에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // 🌟 5. 로딩 중이거나 정보가 없을 때 껍데기 화면이 보이지 않도록 막아줍니다.
  if (isLoading) return <div className="mypage-container" style={{ padding: '50px', textAlign: 'center' }}>정보를 불러오는 중입니다...</div>;
  if (!userInfo) return null; // 위에서 로그인 화면으로 튕겨냈으니 여긴 null

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h2>내 정보 보기</h2>
        <p>환승마켓에서의 내 프로필과 결제 정보를 관리하세요.</p>
      </div>

      <div className="mypage-card">
        <div className="profile-section">
          <div className="profile-avatar">
            <i className="far fa-user"></i>
          </div>
          
          <div className="info-list">
            
            <div className="info-item">
              <label>아이디(이메일)</label>
              <span className="info-value email-value">{userInfo.email}</span>
            </div>

            <div className="info-item">
              <label>이름</label>
              {isEditing ? (
                // 🌟 수정 중일 때는 editData(임시 공간)와 연결
                <input type="text" name="username" value={editData.username || ''} onChange={handleChange} className="edit-input" />
              ) : (
                // 🌟 읽기 모드일 때는 userInfo(진짜 내 정보)와 연결
                <span className="info-value">{userInfo.username}</span>
              )}
            </div>

            <div className="info-item">
              <label>별명(닉네임)</label>
              {isEditing ? (
                <input type="text" name="nickname" value={editData.nickname || ''} onChange={handleChange} className="edit-input" placeholder="사용하실 별명을 입력하세요" />
              ) : (
                <span className="info-value">{userInfo.nickname || '별명이 없습니다.'}</span>
              )}
            </div>

            <div className="info-item">
              <label>연락처</label>
              {isEditing ? (
                <input type="text" name="contact" value={editData.contact || ''} onChange={handleChange} className="edit-input" />
              ) : (
                <span className="info-value">{userInfo.contact}</span>
              )}
            </div>

            <div className="info-item">
              <label>주소</label>
              {isEditing ? (
                <input type="text" name="address" value={editData.address || ''} onChange={handleChange} className="edit-input" placeholder="거주하시는 주소를 입력하세요" />
              ) : (
                <span className="info-value">{userInfo.address || '주소가 등록되지 않았습니다.'}</span>
              )}
            </div>

          </div>
        </div>

        <div className="mypage-actions">
          {isEditing ? (
            <>
              <button className="btn-save" onClick={handleSave}><i className="fas fa-check"></i> 저장하기</button>
              <button className="btn-cancel" onClick={() => {
                setIsEditing(false);
                setEditData(userInfo); // 취소 누르면 임시 공간을 다시 원래 데이터로 돌려놓음
              }}>취소</button>
            </>
          ) : (
            <button className="btn-edit" onClick={() => setIsEditing(true)}><i className="fas fa-pen"></i> 수정하기</button>
          )}
        </div>
      </div>

      <div className="mypage-pay-section">
        <div className="pay-banner">
          <div className="pay-text">
            <h3>환승Pay 충전</h3>
            <p>안전한 중고 거래의 시작, 환승Pay를 충전해보세요.</p>
          </div>
          <button className="btn-charge" onClick={() => setIsPayModalOpen(true)}>
            <i className="fas fa-wallet"></i> 충전하기
          </button>
        </div>
      </div>

      {isPayModalOpen && (
        <ChargePay onClose={() => setIsPayModalOpen(false)} userInfo={userInfo} />
      )}
    </div>
  );
};

export default MyPage;
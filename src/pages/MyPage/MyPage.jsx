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
  
  const { userInfo, isLoading, fetchUser } = useUser();
  
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false); 
  const [isPayModalOpen, setIsPayModalOpen] = useState(false); 

  useEffect(() => {
    if (userInfo) {
      setEditData(userInfo);
    }
  }, [userInfo]);

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
      
      await fetchUser(); 
      setIsEditing(false); 
    } catch (error) {
      console.error("수정 실패:", error);
      alert("정보 수정에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  if (isLoading) return <div className="mypage-container" style={{ padding: '50px', textAlign: 'center' }}>정보를 불러오는 중입니다...</div>;
  if (!userInfo) return null; 

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
            
            {/* 🌟 1. 아이디 영역 추가 (수정 불가, username 연결) */}
            <div className="info-item">
              <label>아이디</label>
              <span className="info-value" style={{ fontWeight: 'bold', color: '#555' }}>
                {userInfo.username}
              </span>
            </div>

            {/* 🌟 2. 이메일 영역 (수정 불가 유지) */}
            <div className="info-item">
              <label>이메일</label>
              <span className="info-value email-value">{userInfo.email}</span>
            </div>

            {/* 🌟 3. 이름(실명) 영역 (name 연결로 변경) */}
          <div className="info-item">
              <label>이름</label>
              {/* input 창을 아예 없애고, 아이디처럼 텍스트로만 보여줍니다. */}
              <span className="info-value" style={{ fontWeight: 'bold', color: '#555' }}>
                {userInfo.name}
              </span>
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
                setEditData(userInfo); 
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
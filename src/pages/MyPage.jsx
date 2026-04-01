import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ChargePay from '../ChargePay'; 
import './MyPage.css'; 

const MyPage = () => {
  const navigate = useNavigate();
  
  // 🌟 1. 상태에 nickname과 address를 추가했습니다.
  const [userInfo, setUserInfo] = useState({ 
    username: '', 
    email: '', 
    contact: '',
    nickname: '',
    address: '' 
  });
  const [isEditing, setIsEditing] = useState(false); 
  const [isPayModalOpen, setIsPayModalOpen] = useState(false); 

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert("로그인이 필요한 서비스입니다.");
        navigate('/login');
        return;
      }

      try {
        const response = await axios.post('/api/v1/user', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserInfo(response.data); 
      } catch (error) {
        console.error("정보를 불러오지 못했습니다.", error);
        alert("내 정보를 불러오는 중 오류가 발생했습니다.");
      }
    };
    fetchUserInfo();
  }, [navigate]);

  // 🌟 2. 버그 수정 완료! 반드시 'name'으로 꺼내야 합니다.
  const handleChange = (e) => {
    const { name, value } = e.target; 
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.put('/api/v1/user', userInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("성공적으로 정보가 수정되었습니다! 🎉");
      setIsEditing(false); 
    } catch (error) {
      console.error("수정 실패:", error);
      alert("정보 수정에 실패했습니다. 다시 시도해 주세요.");
    }
  };

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
            
            {/* 이메일 영역 (수정 불가) */}
            <div className="info-item">
              <label>아이디(이메일)</label>
              <span className="info-value email-value">{userInfo.email}</span>
            </div>

            {/* 이름 영역 */}
            <div className="info-item">
              <label>이름</label>
              {isEditing ? (
                <input type="text" name="username" value={userInfo.username || ''} onChange={handleChange} className="edit-input" />
              ) : (
                <span className="info-value">{userInfo.username}</span>
              )}
            </div>

            {/* 🌟 별명 영역 추가 */}
            <div className="info-item">
              <label>별명(닉네임)</label>
              {isEditing ? (
                <input type="text" name="nickname" value={userInfo.nickname || ''} onChange={handleChange} className="edit-input" placeholder="사용하실 별명을 입력하세요" />
              ) : (
                <span className="info-value">{userInfo.nickname || '별명이 없습니다.'}</span>
              )}
            </div>

            {/* 전화번호 영역 */}
            <div className="info-item">
              <label>연락처</label>
              {isEditing ? (
                <input type="text" name="contact" value={userInfo.contact || ''} onChange={handleChange} className="edit-input" />
              ) : (
                <span className="info-value">{userInfo.contact}</span>
              )}
            </div>

            {/* 🌟 주소 영역 추가 */}
            <div className="info-item">
              <label>주소</label>
              {isEditing ? (
                <input type="text" name="address" value={userInfo.address || ''} onChange={handleChange} className="edit-input" placeholder="거주하시는 주소를 입력하세요" />
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
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>취소</button>
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
        <ChargePay onClose={() => setIsPayModalOpen(false)} />
      )}
    </div>
  );
};

export default MyPage;

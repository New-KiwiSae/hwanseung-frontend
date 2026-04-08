import React, { useState, useEffect, useRef } from 'react';
import DaumPostcode from 'react-daum-postcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ChargePay from '../../ChargePay';
import '../../chargepay.css';
import '../../pages/MyPage.css';
// 🌟 1. 우리가 만든 전역 창고 도구를 가져옵니다! (경로 확인 필수)
import { useUser } from '../../UserContext';

const MyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const IMG_BASE_URL = "http://localhost:8080";

  const { userInfo, isLoading, fetchUser } = useUser();

  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  useEffect(() => {
    if (userInfo) {
      console.log("현재 로그인한 유저 정보:", userInfo);
      setEditData(userInfo);
      if (userInfo.profileImagePath) {
        setImagePreview(`${IMG_BASE_URL}${userInfo.profileImagePath}`);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    if (!isLoading && !userInfo) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/login');
    }
  }, [isLoading, userInfo, navigate]);

  // 🌟 이미지 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // 화면에 보여줄 미리보기 주소
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleNeighborhoodAuth = () => {
    // 1. 브라우저가 GPS를 지원하는지 확인
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      return;
    }

    alert("현재 위치를 확인 중입니다. 잠시만 기다려주세요...");

    // 2. 현재 내 위치(GPS) 가져오기
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // 🌟 핵심 해결 로직: 카카오 지도가 "완전히 조립될 때까지" 기다립니다!
        window.kakao.maps.load(() => {

          // 이제 조립이 끝났으니 Geocoder 부품을 안전하게 꺼낼 수 있습니다.
          const geocoder = new window.kakao.maps.services.Geocoder();

          // 3. 카카오 지도 API로 좌표 -> 동네 이름 변환 (리버스 지오코딩)
          geocoder.coord2RegionCode(lng, lat, async (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const myNeighborhood = result[0].region_3depth_name;

              try {
                const token = sessionStorage.getItem('accessToken');

                // 4. 백엔드에 동네 이름 저장 요청
                await axios.put(`/api/user`, {
                  ...userInfo, // 기존 유저 정보가 날아가지 않게 같이 담아줍니다.
                  neighborhood: myNeighborhood,
                  isNeighborhoodAuthenticated: true
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                });

                alert(`🎉 성공! [${myNeighborhood}] 동네 인증이 완료되었습니다.`);

                // 정보가 바뀌었으니 최신 정보로 새로고침!
                if (fetchUser) fetchUser();

              } catch (error) {
                console.error("인증 실패:", error);
                alert("인증 정보를 서버에 저장하는데 실패했습니다.");
              }
            } else {
              alert("해당 좌표의 동네 이름을 찾을 수 없습니다.");
            }
          });
        }); // 🌟 load 괄호 닫기
      },
      (error) => {
        console.error("GPS 에러:", error);
        alert("위치 권한을 허용해주셔야 동네 인증이 가능합니다.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };


  const handleSave = async () => {
    const token = sessionStorage.getItem('accessToken');
    const formData = new FormData();

    // 1. 일반 수정 데이터 추가 (JSON 문자열로 변환하여 넣거나 각각 추가)
    // 백엔드 컨트롤러 설정에 따라 다르지만, 보통 파일을 포함할 땐 FormData를 씁니다.
    formData.append('userData', new Blob([JSON.stringify(editData)], { type: 'application/json' }));

    // 2. 파일이 있다면 추가
    if (selectedFile) {
      formData.append('profileImage', selectedFile);
    }

    try {
      await axios.put('/api/user', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // 파일 전송 필수 헤더
        }
      });
      alert("성공적으로 정보가 수정되었습니다! 🎉");
      await fetchUser();
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("수정 실패:", error);
      alert("정보 수정에 실패했습니다.");
    }
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        // 검색 결과에서 주소를 가져옵니다.
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') extraAddress += data.bname;
          if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        // 🌟 중요: editData 상태를 업데이트합니다.
        setEditData(prev => ({
          ...prev,
          zipCode: data.zonecode, // 우편번호
          address: fullAddress     // 기본 주소
        }));
      }
    }).open();
  };

  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setEditData({
      ...editData,
      zipCode: data.zonecode,
      address: fullAddress,
    });

    setIsPostcodeOpen(false); // 주소 선택 완료 후 닫기
  };

  if (isLoading) return <div className="mypage-container" style={{ padding: '50px', textAlign: 'center' }}>정보를 불러오는 중입니다...</div>;
  if (!userInfo) return null;

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h2>내 정보 보기</h2>
        <p>환승마켓에서의 내 프로필과 결제 정보를 관리하세요.</p>
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
      <br/>
      <div className="mypage-card">
        <div className="profile-section">
          {/* 🌟 프로필 이미지 영역 수정 */}
          <div className="profile-avatar-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div className="profile-avatar" onClick={() => isEditing && fileInputRef.current.click()}
              style={{ cursor: isEditing ? 'pointer' : 'default', overflow: 'hidden' }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <i className="far fa-user"></i>
              )}
              {/* {isEditing && (
                <div className="avatar-edit-overlay" style={{ position: 'absolute', bottom: 0, background: 'rgba(0,0,0,0.5)', width: '100%', color: '#fff', fontSize: '12px' }}>
                  변경
                </div>
              )} */}
            </div>
            {/* 숨겨진 파일 input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="info-list">
            {!isEditing && userInfo.profileOriginalName && (
              <div className="info-item">
                <label>프로필 파일명(없앨예정)</label>
                <span className="info-value" style={{ fontSize: '12px', color: '#888' }}>
                  {userInfo.profileOriginalName}
                </span>
              </div>
            )}
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
                <div className="address-section">
                  {/* 우편번호 + 주소검색 버튼 */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={editData.zipCode || ''}
                      readOnly
                      placeholder="우편번호"
                      className="edit-input"
                      style={{ width: '120px' }}
                    />
                    <button
                      type="button"
                      className="btn-address-search"
                      onClick={() => setIsPostcodeOpen(true)}
                    >
                      주소 검색
                    </button>
                  </div>

                  {/* 기본 주소 입력란 */}
                  <input
                    type="text"
                    value={editData.address || ''}
                    readOnly
                    className="edit-input"
                    style={{ marginBottom: '8px' }}
                    placeholder="주소를 검색해주세요"
                  />

                  {/* 상세 주소 입력란 */}
                  <input
                    type="text"
                    name="detailAddress"
                    value={editData.detailAddress || ''}
                    onChange={handleChange}
                    className="edit-input"
                    placeholder="상세주소를 입력해주세요"
                  />

                  {/* 주소 검색 모달 (CSS 클래스 통일) */}
                  {isPostcodeOpen && (
                    <>
                      <div className="postcode-overlay" onClick={() => setIsPostcodeOpen(false)} />
                      <div className="postcode-modal">
                        <div className="postcode-header">
                          <span>주소 검색</span>
                          <button type="button" className="postcode-close-btn" onClick={() => setIsPostcodeOpen(false)}>&times;</button>
                        </div>
                        <DaumPostcode
                          onComplete={handleComplete}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <span className="info-value">
                  {userInfo.zipCode ? `(${userInfo.zipCode}) ` : ''}
                  {userInfo.address} {userInfo.detailAddress}
                </span>
              )}
            </div>

            {/* 🌟 3단계: 여기에 동네 인증 버튼 영역을 새로 추가합니다! 🌟 */}
            <div className="info-item">
              <label>동네 인증</label>
              <div className="auth-badge-area">
                {userInfo.isNeighborhoodAuthenticated ? (
                  <span className="auth-badge success" style={{ padding: '6px 10px', background: '#00d26a', color: 'white', borderRadius: '12px', fontSize: '13px', display: 'inline-block' }}>
                    <i className="fas fa-check-circle"></i> {userInfo.neighborhood} 인증됨
                  </span>
                ) : (
                  <button
                    onClick={handleNeighborhoodAuth}
                    className="auth-btn"
                    style={{ padding: '6px 12px', background: '#00D27A', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    <i className="fas fa-map-marker-alt"></i> 내 동네 인증하기
                  </button>
                )}
              </div>
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
    </div>
  );
};

export default MyPage;
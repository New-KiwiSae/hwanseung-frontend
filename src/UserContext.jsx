import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🌟 앱이 켜질 때 딱 한 번 실행되는 '신원 확인' 로직
    const fetchUser = async () => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // 백엔드에서 내 정보를 가져오는 API 호출
            const response = await axios.get('/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserInfo(response.data); // 성공하면 창고에 저장!
        } catch (error) {
            console.error("사용자 정보를 불러오는데 실패했습니다.", error);

        // 🌟 수정 포인트: 403 에러(권한없음)이고 status가 PENDING이면 지우지 않습니다.
        const status = sessionStorage.getItem('status');
        if (error.response?.status === 403 && status === 'PENDING') {
            console.log("추가 정보 입력이 필요한 유저입니다. 세션을 유지합니다.");
            
            // Context에 최소한의 정보라도 넣어두어 Header가 터지지 않게 합니다.
            setUserInfo({ 
                username: sessionStorage.getItem('username'), 
                status: 'PENDING' 
            });
        } else {
            // 진짜 토큰 만료나 인증 에러일 때만 지웁니다.
            sessionStorage.clear();
            alert("에러확인 UserCOntext.jsx")
            setUserInfo(null);
        }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ userInfo, setUserInfo, isLoading, fetchUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
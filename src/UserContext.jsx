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
            // 토큰이 만료되었거나 오류나면 로그아웃 처리
            sessionStorage.clear();
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
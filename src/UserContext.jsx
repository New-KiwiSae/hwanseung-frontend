import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get('/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserInfo(response.data);
        } catch (error) {
            console.error("사용자 정보를 불러오는데 실패했습니다.", error);

        const status = sessionStorage.getItem('status');
        if (error.response?.status === 403 && status === 'PENDING') {
            console.log("추가 정보 입력이 필요한 유저입니다. 세션을 유지합니다.");
            
            setUserInfo({ 
                username: sessionStorage.getItem('username'), 
                status: 'PENDING' 
            });
        } else {
            sessionStorage.clear();
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
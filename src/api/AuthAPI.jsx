import axios from "axios";

/** * 필요할 때마다 최신 헤더를 가져오는 함수
 * (회원가입 등 토큰이 필요 없는 곳에서는 안 써도 됩니다)
 */
const getHeader = () => {
    return {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${sessionStorage.getItem("tokenType")} ${sessionStorage.getItem("accessToken")}`,
        }
    };
};

/** LOGIN API */
export const login = (data) => {
    return axios.post('/api/auth/login', data); 
};

/** SIGNUP API */
export const signUp = async (values) => {
    const response = await axios.post(`/api/auth/signup`, values); 
    return response.data;
}
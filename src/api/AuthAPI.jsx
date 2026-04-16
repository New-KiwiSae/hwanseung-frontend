import axios from "axios";

const getHeader = () => {
    return {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${sessionStorage.getItem("tokenType")} ${sessionStorage.getItem("accessToken")}`,
        }
    };
};

export const login = (data) => {
    return axios.post('/api/auth/login', data); 
};

export const adminlogin = async ({ userid, password }) => {
    const data = { userid, password };
    const response = await axios.post(`/api/admin/login`, data);
    return response;
}

export const signUp = async (values) => {
    const response = await axios.post(`/api/auth/signup`, values); 
    return response.data;
}


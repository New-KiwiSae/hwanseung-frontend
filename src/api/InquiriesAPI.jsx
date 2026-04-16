import axios from "axios";
const API_BASE = '/api/inquiries';


function getToken(auth) {
    const headersAuth = {
        'Authorization': `${sessionStorage.getItem("tokenType")} ${sessionStorage.getItem("accessToken")}`,
    };
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `${sessionStorage.getItem("tokenType")} ${sessionStorage.getItem("accessToken")}`,
    };

    return auth === 'auth' ? headersAuth : headers;
}

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const currentPath = window.location.pathname;

        if (currentPath === '/login') {
            return Promise.reject(error);
        }
        if (sessionStorage.getItem("tokenType") === null || sessionStorage.getItem("tokenType") === undefined || sessionStorage.getItem("tokenType") === '') {
            window.location.href = "/login";
            return Promise.reject(error);
        }
        const originalRequest = error.config;
        if (originalRequest?.url === '/api/user/verify-password') {
            return Promise.reject(error);
        }
        if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return axios(originalRequest);

            } catch (refreshError) {
                sessionStorage.clear();
                window.location.href = "/";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


export const getInquiries = (params) => {
    let res = null;
    try {
        res = axios.get(`${API_BASE}/all`, { params, withCredentials: true, headers: getToken('auth') });
    } catch (error) {
    }

    return res;
}


export const fetchInquiries = (params) =>
    axios.get(API_BASE, { params, headers: getToken('auth') });

export const createInquiry = (data) => axios.post(API_BASE, data, { withCredentials: true, headers: getToken('content') });

export const updateInquiry = (id, data) => axios.put(`${API_BASE}/${id}`, data, { withCredentials: true, headers: getToken('content') });

export const deleteInquiry = (id) => axios.delete(`${API_BASE}/${id}`, { withCredentials: true, headers: getToken('content') });


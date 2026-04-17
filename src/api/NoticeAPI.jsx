import axios from "axios";


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


// axios.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     async (error) => {
//         const originalRequest = error.config;
//         if (originalRequest?.url === '/api/user/verify-password') {
//             return Promise.reject(error);
//         }
//         if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
//             originalRequest._retry = true;

//             try {
//                 const newAccessToken = await refreshAccessToken();

//                 originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

//                 return axios(originalRequest);

//             } catch (refreshError) {
//                 sessionStorage.clear();
//                 window.location.href = "/";
//                 return Promise.reject(refreshError);
//             }
//         }

//         return Promise.reject(error);
//     }
// );


export const getNoticesList = () => {
    let res = null;
    try {
        res = axios.get(`/api/notices/all/list`, { withCredentials: true, headers: getToken('auth') });
    } catch (error) {
    }

    return res;
}
export const getNotices = (params) => {
    return axios.get("/api/notices", { params, headers: getToken('auth') });
}
export const getNotice = (id) => axios.get(`/api/notices/${id}`, { withCredentials: true, headers : getToken('content')});
export const createNotice = (data) => axios.post("/api/notices", data, { withCredentials: true, headers : getToken('content')});
export const updateNotice = (id, data) => {
    axios.put(`/api/notices/${id}`, data, { withCredentials: true, headers : getToken('content')})
};
export const deleteNotice = (id) => axios.delete(`/api/notices/${id}`, { withCredentials: true, headers : getToken('content') });

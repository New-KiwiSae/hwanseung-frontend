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

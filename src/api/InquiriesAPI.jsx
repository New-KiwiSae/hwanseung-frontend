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


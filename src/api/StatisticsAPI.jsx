import axios from "axios";

const getHeader = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    return {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': accessToken ? `Bearer ${accessToken}` : null,
            'REFRESH_TOKEN': refreshToken,
        }
    };
};

export const fetchUserStats = async () => {
    const response = await axios.get('/api/admin/statistics/users', getHeader());
    return response.data;
};

export const fetchTransactionStats = async () => {
    const response = await axios.get('/api/admin/statistics/transactions', getHeader());
    return response.data;
};

export const fetchProductStats = async () => {
    const response = await axios.get('/api/admin/statistics/products', getHeader());
    return response.data;
};

export const fetchSearchStats = async () => {
    const response = await axios.get('/api/admin/statistics/search', getHeader());
    return response.data;
};

export const fetchReportStats = async () => {
    const response = await axios.get('/api/admin/statistics/reports', getHeader());
    return response.data;
};
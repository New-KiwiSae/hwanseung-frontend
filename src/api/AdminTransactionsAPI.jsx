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
        },
    };
};


export const fetchTransactionSeries = async (period, startDate, endDate) => {
    const res = await axios.get('/api/admin/transactions/series', {
        ...getHeader(),
        params: { period, startDate, endDate },
    });
    return res.data;
};

export const fetchTransactionStatusBreakdown = async (startDate, endDate) => {
    const res = await axios.get('/api/admin/transactions/status-breakdown', {
        ...getHeader(),
        params: { startDate, endDate },
    });
    return res.data;
};

export const fetchTopCategories = async (startDate, endDate, limit = 8) => {
    const res = await axios.get('/api/admin/transactions/top-categories', {
        ...getHeader(),
        params: { startDate, endDate, limit },
    });
    return res.data;
};

export const fetchTransactionList = async (startDate, endDate, page = 0, size = 20) => {
    const res = await axios.get('/api/admin/transactions', {
        ...getHeader(),
        params: { startDate, endDate, page, size },
    });
    return res.data;
};

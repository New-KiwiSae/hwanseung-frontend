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

/**
 * 거래 시계열 통계 조회
 * @param {('daily'|'weekly'|'monthly')} period
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate   - YYYY-MM-DD
 * @returns {Promise<{period:string, series:Array<{bucket:string,count:number,amount:number}>, summary:{totalCount:number,totalAmount:number,avgAmount:number}}>}
 */
export const fetchTransactionSeries = async (period, startDate, endDate) => {
    const res = await axios.get('/api/admin/transactions/series', {
        ...getHeader(),
        params: { period, startDate, endDate },
    });
    return res.data;
};

/** 거래 상태별 분포 (SALE, SOLD_OUT) */
export const fetchTransactionStatusBreakdown = async (startDate, endDate) => {
    const res = await axios.get('/api/admin/transactions/status-breakdown', {
        ...getHeader(),
        params: { startDate, endDate },
    });
    return res.data; // [{status:'COMPLETED', count:123, amount:45000}, ...]
};

/** 카테고리별 거래 TOP N */
export const fetchTopCategories = async (startDate, endDate, limit = 8) => {
    const res = await axios.get('/api/admin/transactions/top-categories', {
        ...getHeader(),
        params: { startDate, endDate, limit },
    });
    return res.data; // [{categoryName:'전자제품', count:50, amount:1200000}, ...]
};

/** 거래 내역 페이지 조회 (표/엑셀 원본) */
export const fetchTransactionList = async (startDate, endDate, page = 0, size = 20) => {
    const res = await axios.get('/api/admin/transactions', {
        ...getHeader(),
        params: { startDate, endDate, page, size },
    });
    return res.data; // {content:[...], totalElements, totalPages, number}
};

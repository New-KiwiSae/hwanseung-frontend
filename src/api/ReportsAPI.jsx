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

export const fetchReports = async ({ page = 0, size = 10, keyword = '', status = '', type = '' }) => {
    const params = new URLSearchParams({ page, size });
    if (keyword) params.append('keyword', keyword);
    if (status) params.append('status', status);
    if (type) params.append('type', type);

    const response = await axios.get(`/api/admin/reports?${params.toString()}`, getHeader());
    return response.data;
};

export const fetchReportDetail = async (reportId) => {
    const response = await axios.get(`/api/admin/reports/${reportId}`, getHeader());
    return response.data;
};

export const warnReportedUser = async (reportId, memo) => {
    const response = await axios.patch(`/api/admin/reports/${reportId}/warn`, { memo }, getHeader());
    return response.data;
};

export const suspendReportedUser = async (reportId, { days, memo }) => {
    const response = await axios.patch(`/api/admin/reports/${reportId}/suspend`, { days, memo }, getHeader());
    return response.data;
};

export const dismissReport = async (reportId, memo) => {
    const response = await axios.patch(`/api/admin/reports/${reportId}/dismiss`, { memo }, getHeader());
    return response.data;
};

export const deleteReportedContent = async (reportId) => {
    const response = await axios.delete(`/api/admin/reports/${reportId}/content`, getHeader());
    return response.data;
};

export const fetchSuspendedUsers = async ({ page = 0, size = 10, keyword = '' }) => {
    const params = new URLSearchParams({ page, size });
    if (keyword) params.append('keyword', keyword);

    const response = await axios.get(`/api/admin/reports/suspended-users?${params.toString()}`, getHeader());
    return response.data;
};

export const unsuspendUser = async (userId) => {
    const response = await axios.patch(`/api/admin/users/${userId}/status`, { status: 'ACTIVE' }, getHeader());
    return response.data;
};

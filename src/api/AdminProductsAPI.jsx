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

export const fetchAdminProducts = async ({ page = 0, size = 10, keyword = '', status = '', category = '', sort = 'latest' }) => {
    const params = new URLSearchParams({ page, size, sort });
    if (keyword) params.append('keyword', keyword);
    if (status) params.append('status', status);
    if (category) params.append('category', category);

    const response = await axios.get(`/api/admin/products?${params.toString()}`, getHeader());
    return response.data;
};

export const fetchAdminProductDetail = async (productId) => {
    const response = await axios.get(`/api/admin/products/${productId}`, getHeader());
    return response.data;
};

export const approveProduct = async (productId) => {
    const response = await axios.patch(`/api/admin/products/${productId}/approve`, {}, getHeader());
    return response.data;
};

export const rejectProduct = async (productId, reason) => {
    const response = await axios.patch(`/api/admin/products/${productId}/reject`, { reason }, getHeader());
    return response.data;
};

export const hideProduct = async (productId, reason) => {
    const response = await axios.patch(`/api/admin/products/${productId}/hide`, { reason }, getHeader());
    return response.data;
};

export const unhideProduct = async (productId) => {
    const response = await axios.patch(`/api/admin/products/${productId}/unhide`, {}, getHeader());
    return response.data;
};

export const deleteAdminProduct = async (productId) => {
    const response = await axios.delete(`/api/admin/products/${productId}`, getHeader());
    return response.data;
};

export const bulkApprove = async (productIds) => {
    const response = await axios.patch('/api/admin/products/bulk/approve', { productIds }, getHeader());
    return response.data;
};

export const bulkDelete = async (productIds) => {
    const response = await axios.delete('/api/admin/products/bulk', { ...getHeader(), data: { productIds } });
    return response.data;
};

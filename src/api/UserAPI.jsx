import axios from "axios";

export const getHeader = () => {
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

export const refreshAccessToken = async () => {
    const response = await axios.get(`/api/auth/refresh`, getHeader());
    const newAccessToken = response.data;
    sessionStorage.setItem('accessToken', newAccessToken);
    return newAccessToken;
};

export const fetchUser = async () => {
    const config = getHeader();
    const response = await axios.get(`/api/user`, config);
    
    return response;
};

export const updateUser = async (data) => {
    const response = await axios.put(`/api/user`, data, getHeader());
    return response.data;
};

export const deleteUser = async () => {
    await axios.delete(`/api/user`, getHeader());
};

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
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
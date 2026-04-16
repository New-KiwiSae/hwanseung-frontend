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

// --- Axios 인터셉터 (자동 토큰 갱신 마법사) ---
axios.interceptors.response.use(
    (response) => {
        // 1. 정상적인 응답은 그냥 통과시킵니다.
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
        // 방금 실패한 원래의 API 요청 정보를 가져옵니다.
        const originalRequest = error.config;

        // 2. 만약 에러가 401(토큰 만료)이고, 아직 재시도를 안 한 요청이라면?
        // if (error.response && error.response.status === 401 && !originalRequest._retry) {
        // 만약 에러가 난 곳이 '/api/auth/refresh' 라면 무한 갱신 시도를 하지 않고 멈춥니다!
        if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
            originalRequest._retry = true; // 무한 루프 방지용 꼬리표 붙이기

            try {
                console.log("토큰이 만료되었습니다. 자동 갱신을 시도합니다...");

                // 3. 서랍(SessionStorage)에서 Refresh Token을 꺼내서 새 토큰을 받아옵니다.
                const newAccessToken = await refreshAccessToken();

                // 4. 실패했던 원래 요청의 헤더에 '새로 발급받은 삐까뻔쩍한 출입증'을 달아줍니다.
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // 5. 아무 일 없었다는 듯이 원래 하려던 요청(예: fetchUser)을 다시 보냅니다!
                return axios(originalRequest);

            } catch (refreshError) {
                // 6. 만약 Refresh Token마저도 기간이 끝나서 갱신에 실패했다면?
                console.log("리프레시 토큰도 만료되었습니다. 다시 로그인해야 합니다.");
                sessionStorage.clear(); // 낡은 토큰들 싹 갖다 버리고
                window.location.href = "/"; // 로그인 페이지로 쫓아냅니다.
                return Promise.reject(refreshError);
            }
        }


        // 401 에러가 아니면 그냥 에러를 발생시킵니다.
        return Promise.reject(error);
    }
);


export const getInquiries = (params) => {
    let res = null;
    try {
        res = axios.get(`${API_BASE}/all`, { params, withCredentials: true, headers: getToken('auth') });
    } catch (error) {
        console.log('공지사항 목록을 불러오지 못했습니다.');
    }

    return res;
}


export const fetchInquiries = (params) =>
    axios.get(API_BASE, { params, headers: getToken('auth') });

export const createInquiry = (data) => axios.post(API_BASE, data, { withCredentials: true, headers: getToken('content') });

export const updateInquiry = (id, data) => axios.put(`${API_BASE}/${id}`, data, { withCredentials: true, headers: getToken('content') });

export const deleteInquiry = (id) => axios.delete(`${API_BASE}/${id}`, { withCredentials: true, headers: getToken('content') });


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

/** 실시간 접속자 수 */
export const fetchOnlineUsers = async () => {
    // 기존 '/api/stats/active-users' 에서 아래 경로로 변경
    const response = await axios.get('/api/admin/statistics/online-users', getHeader());
    return response.data;
};

/** 사용자 통계 (전체 가입자, 일간/월간 신규) */
export const fetchUserStats = async () => {
    const response = await axios.get('/api/admin/statistics/users', getHeader());
    return response.data;
};

/** 거래 통계 (총 거래 수, GMV) */
export const fetchTransactionStats = async () => {
    const response = await axios.get('/api/admin/statistics/transactions', getHeader());
    return response.data;
};

/** 상품 통계 (등록 수, 카테고리별 분포, 가격 분포) */
export const fetchProductStats = async () => {
    const response = await axios.get('/api/admin/statistics/products', getHeader());
    return response.data;
};

/** 검색 & 탐색 행동 (인기 검색어, 찜 수) */
export const fetchSearchStats = async () => {
    const response = await axios.get('/api/admin/statistics/search', getHeader());
    return response.data;
};

/** 신고/신뢰 관련 (신고 건수, 차단/정지 사용자 수) */
export const fetchReportStats = async () => {
    const response = await axios.get('/api/admin/statistics/reports', getHeader());
    return response.data;
};




// --- Axios 인터셉터 (자동 토큰 갱신 마법사) ---
axios.interceptors.response.use(
    (response) => {
        console.log('인터셉터정상동작');
        // 1. 정상적인 응답은 그냥 통과시킵니다.
        return response;
    },
    async (error) => {
        console.log('인터셉터에러');
        // 방금 실패한 원래의 API 요청 정보를 가져옵니다.
        const originalRequest = error.config;

        // 2. 만약 에러가 401(토큰 만료)이고, 아직 재시도를 안 한 요청이라면?
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
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
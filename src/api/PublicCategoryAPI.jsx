import axios from "axios";

/** 카테고리 전체 목록 조회 (권한 불필요) */
export const fetchPublicCategories = async () => {
    // 관리자 엔드포인트(/api/admin/...)가 아닌 일반 엔드포인트 호출
    // 이 요청에는 Authorization 헤더가 포함되지 않아야 합니다.
    const response = await axios.get('/api/categories');
    return response.data;
};
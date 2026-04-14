import styles from './AdminContent.module.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
// Recharts 라이브러리 추가
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function AdminDashBoard() {
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ users: 0, products: 0, sellproducts: 0 , activeTransactions: 0, completedTransactions: 0, pendingReports: 0});
    // 주간 트렌드 데이터를 저장할 상태 추가
    const [trendData, setTrendData] = useState([]);
    // 권고사항 2: 로딩 및 에러 상태 관리 추가
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const getHeader = () => {
        const accessToken = sessionStorage.getItem("accessToken");
        const refreshToken = sessionStorage.getItem("refreshToken");
        return {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Refresh-Token": refreshToken,
            },
        };
    };
    useEffect(() => {
        // 데이터 페칭 함수 분리 (재사용성 및 Polling 목적)
        const fetchDashboardData = async () => {
            try {
                setError(null); // 재호출 시 이전 에러 초기화

                // HTTP 응답 상태(res.ok)를 1차적으로 검증하는 로직 추가
                const [userData, productData, sellData, summaryData, trendRes] = await Promise.all([

                    axios.get('/api/user/count', getHeader()).then(res => {
                        console.log('사용자 통계 API 응답 상태:', res.status);
                        if (!res.status) throw new Error('사용자 통계 API 응답 오류');
                        return res.data;
                    }),
                    axios.get('/api/products/count', getHeader()).then(res => {
                        if (!res.status) throw new Error('상품 통계 API 응답 오류');
                        return res.data;
                    }),
                    axios.get('/api/products/sellcount', getHeader()).then(res => {
                        if (!res.status) throw new Error('판매 상품 통계 API 응답 오류');
                        return res.data;
                    }),
                    axios.get('/api/admin/dashboard/summary', getHeader()).then(res => {
                        if (!res.status) throw new Error('대시보드 요약 API 응답 오류');
                        return res.data;
                    }),
                    axios.get('/api/admin/dashboard/weekly-trend', getHeader()).then(res => {
                        if (res.status !== 200) throw new Error('주간 트렌드 API 응답 오류');
                        return res.data;
                    })
                ]);

                setCounts({
                    users: userData.totalCount,
                    products: productData.totalCount,
                    sellproducts: sellData.sellCount,
                    ...summaryData
                });

                // 백엔드 데이터(3개의 배열)를 Recharts용 객체 배열로 변환
                if (trendRes && trendRes.labels) {
                    const formattedTrendData = trendRes.labels.map((label, index) => ({
                        name: label,
                        거래건수: trendRes.transactions[index] || 0,
                        가입자수: trendRes.signups[index] || 0
                    }));
                    setTrendData(formattedTrendData);
                }
            } catch (err) {
                console.error("대시보드 통계 데이터 로드 실패:", err);
                setError("데이터를 불러오는 중 문제가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        // 1. 마운트 시 최초 데이터 페칭
        fetchDashboardData();

        // 권고사항 3: Polling 적용 (30초마다 데이터 자동 갱신)
        const intervalId = setInterval(fetchDashboardData, 30000);

        // 언마운트 시 메모리 누수 방지를 위한 클린업 처리
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>대시보드</h2>

            {/* 에러 발생 시 UI 노출 처리 */}
            {error && (
                <div className={styles.errorAlert} style={{ color: '#d9534f', padding: '10px 0', fontWeight: 'bold' }}>
                    <i className="bx bx-error-circle" style={{ marginRight: '8px' }}></i>
                    {error}
                </div>
            )}

            <div className={styles.cardGrid}>
                {/* 권고사항 1: 모든 아이콘을 boxicons(bx)로 통일 */}
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        <i className="bx bx-user"></i>
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>총 사용자</span>
                        <span className={styles.cardValue}>
                            {isLoading ? '로딩중...' : `${counts.users?.toLocaleString() || 0}명`}
                        </span>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        <i className="bx bx-package"></i>
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>등록 상품</span>
                        <span className={styles.cardValue}>
                            {isLoading ? '로딩중...' : `${counts.products?.toLocaleString() || 0}개`}
                        </span>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        <i className="bx bx-store-alt"></i>
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>판매 중인 상품</span>
                        <span className={styles.cardValue}>
                            {isLoading ? '로딩중...' : `${counts.sellproducts?.toLocaleString() || 0}개`}
                        </span>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        <i className="bx bx-transfer"></i>
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>진행 중 거래</span>
                        <span className={styles.cardValue}>{counts.activeTransactions?.toLocaleString() || 0}건</span>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        {/* FontAwesome 제거 및 Boxicons로 대체 */}
                        <i className="bx bx-check-circle"></i>
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>거래 완료</span>
                        <span className={styles.cardValue}>{counts.completedTransactions?.toLocaleString() || 0}건</span>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}>
                        <i className="bx bx-error-circle"></i>
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>미처리 신고</span>
                        <span className={styles.cardValue}>{counts.pendingReports?.toLocaleString() || 0}건</span>
                    </div>
                </div>
            </div>

            <p style={{ color: 'var(--text-color)', marginTop: '10px', fontSize: '0.85rem', opacity: 0.7 }}>
                <i className="bx bx-time-five" style={{ marginRight: '5px' }}></i>
                데이터는 30초 주기로 자동 갱신됩니다.
            </p>

            {/* --- 하단 시각화 레이아웃 영역 (이전 제안 기반) --- */}
            <div className={styles.dashboardBody} style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                {/* 1. 통계 그래프 섹션 (Recharts 연동) */}
                <div className={styles.chartSection} style={{ flex: 2, minWidth: 0 ,background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>주간 거래 및 가입 추이</h3>
                    
                    {/* 그래프 무한 확장 버그 방지를 위해 height 300px 고정 및 width 100% 명시 */}
                    <div style={{ width: '100%', height: '300px', backgroundColor: '#fff' }}>
                        {isLoading ? (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                데이터를 불러오는 중...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorSignup" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Area type="monotone" dataKey="거래건수" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorTx)" />
                                    <Area type="monotone" dataKey="가입자수" stroke="#82ca9d" strokeWidth={2} fillOpacity={1} fill="url(#colorSignup)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 2. 빠른 처리 요망 섹션 */}
                <div className={styles.listSection} style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>🚨미처리 신고 내역</h3>
                        <span style={{ fontSize: '0.8rem', color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/admin/reports')}>전체 보기</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {/* API 연동 전 UI 스켈레톤 */}
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong style={{ color: '#d9534f' }}>사기 의심</strong> (user_123)</span>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>대기중</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* --- 3. 하단 실시간 시스템 및 상품 모니터링 영역 --- */}
            <div className={styles.dashboardFooter} style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>

                {/* 3-1. 실시간 거래완료 로그 */}
                <div className={styles.logSection} style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>실시간 거래완료 로그</h3>
                        <span style={{ fontSize: '0.8rem', color: '#28a745' }}><i className="bx bx-radio-circle-marked bx-burst"></i> Live</span>
                    </div>
                    <div style={{ height: '250px', overflowY: 'auto', backgroundColor: '#2b2b2b', borderRadius: '6px', padding: '15px', color: '#a9b7c6', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {/* API 연동 전 가상 로그 데이터 */}
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: '#6a8759' }}>[2026-04-03 14:25:11]</span> [AI_IMG] user_8821 상품 이미지 분석 완료 (위변조 확률: 2%)
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: '#6a8759' }}>[2026-04-03 14:26:05]</span> <span style={{ color: '#cc7832' }}>[FDS_WARN]</span> user_104 단기간 다중 접속 감지 (IP: 192.168.***)
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: '#6a8759' }}>[2026-04-03 14:26:30]</span> [AI_TEXT] PRD_9932 상품명 자동 추출 성공 ('아이폰 15 프로')
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: '#6a8759' }}>[2026-04-03 14:27:01]</span> <span style={{ color: '#cc4b37', fontWeight: 'bold' }}>[AI_IMG_FAIL]</span> PRD_9935 이미지 필터링 서버(FastAPI) 응답 지연
                        </div>
                    </div>
                </div>

                {/* 3-2. 최근 등록 상품 */}
                <div className={styles.recentProductSection} style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem' }}>최근 등록 상품 모니터링</h3>
                        <span style={{ fontSize: '0.8rem', color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/admin/products')}>상품 관리로 이동</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        {/* 더미 상품 카드 1 */}
                        <div style={{ display: 'flex', gap: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '6px' }}>
                            <div style={{ width: '60px', height: '60px', backgroundColor: '#e9ecef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bx bx-image" style={{ color: '#adb5bd', fontSize: '1.5rem' }}></i>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>아이폰 15 프로</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>1,050,000원</span>
                                <span style={{ fontSize: '0.75rem', color: '#17a2b8' }}><i className="bx bx-bot"></i> 이름 자동추출됨</span>
                            </div>
                        </div>
                        {/* 더미 상품 카드 2 */}
                        <div style={{ display: 'flex', gap: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '6px' }}>
                            <div style={{ width: '60px', height: '60px', backgroundColor: '#e9ecef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bx bx-image" style={{ color: '#adb5bd', fontSize: '1.5rem' }}></i>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>나이키 조던 1</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>200,000원</span>
                                <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bx bx-check-shield"></i> 이미지 정상</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashBoard;

import styles from './AdminContent.module.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
// Recharts 라이브러리 추가
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function AdminDashBoard() {
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ users: 0, products: 0, sellproducts: 0, activeTransactions: 0, completedTransactions: 0, pendingReports: 0 });
    // 주간 트렌드 데이터를 저장할 상태 추가
    const [trendData, setTrendData] = useState([]);
    // 권고사항 2: 로딩 및 에러 상태 관리 추가
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pendingReports, setPendingReports] = useState([]);
    const [transactionLogs, setTransactionLogs] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);

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
                const [userData, productData, sellData, summaryData, trendRes,
                    pendingReportsRes, txLogsRes, recentProductsRes] = await Promise.all([
                        // ── 기존 5개 유지 (변경 없음) ──
                        axios.get('/api/user/count', getHeader()).then(res => {
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
                        }),
                        // ── 추가 3개 (개별 catch로 하나 실패해도 나머지 정상 동작) ──
                        axios.get('/api/admin/dashboard/pending-reports', getHeader())
                            .then(res => res.data).catch(() => []),
                        axios.get('/api/admin/dashboard/transaction-logs', getHeader())
                            .then(res => res.data).catch(() => []),
                        axios.get('/api/admin/dashboard/recent-products', getHeader())
                            .then(res => res.data).catch(() => []),
                    ]);

                setCounts({
                    users: userData.totalCount,
                    products: productData.totalCount,
                    sellproducts: sellData.sellCount,
                    ...summaryData
                });

                setPendingReports(Array.isArray(pendingReportsRes) ? pendingReportsRes : []);
                setTransactionLogs(Array.isArray(txLogsRes) ? txLogsRes : []);
                setRecentProducts(Array.isArray(recentProductsRes) ? recentProductsRes : []);

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
                <div className={styles.chartSection} style={{ flex: 2, minWidth: 0, background: 'var(--sidebar-color)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-color)' }}>주간 거래 및 가입 추이</h3>

                    {/* 그래프 무한 확장 버그 방지를 위해 height 300px 고정 및 width 100% 명시 */}
                    <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--sidebar-color)' }}>
                        {isLoading ? (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)' }}>
                                데이터를 불러오는 중...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSignup" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Area type="monotone" dataKey="거래건수" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorTx)" />
                                    <Area type="monotone" dataKey="가입자수" stroke="#82ca9d" strokeWidth={2} fillOpacity={1} fill="url(#colorSignup)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 2. 빠른 처리 요망 섹션 */}
                <div className={styles.listSection} style={{ flex: 1, background: 'var(--sidebar-color)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>🚨미처리 신고 내역</h3>
                        <span style={{ fontSize: '0.8rem', color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/admin/reports')}>전체 보기</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '280px', overflowY: 'auto' }}>
                        {pendingReports.length === 0 ? (
                            <li style={{ padding: '10px 0', color: 'var(--text-color)', opacity: 0.5, textAlign: 'center' }}>
                                미처리 신고가 없습니다.
                            </li>
                        ) : (
                            pendingReports.map((report) => (
                                <li key={report.id}
                                    style={{
                                        padding: '10px 0', borderBottom: '1px solid var(--primary-color-light)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                    <span>
                                        <strong style={{ color: '#d9534f' }}>{report.reasonCategory}</strong>
                                        <span style={{ color: 'var(--text-color)', opacity: 0.7, fontSize: '0.85rem', marginLeft: '6px' }}>
                                            ({report.reportedNickname})
                                        </span>
                                    </span>
                                    <span style={{ color: 'var(--text-color)', opacity: 0.6, fontSize: '0.8rem' }}>
                                        {report.createdAt}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>

            {/* --- 3. 하단 실시간 시스템 및 상품 모니터링 영역 --- */}
            <div className={styles.dashboardFooter} style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>

                {/* 3-1. 실시간 거래완료 로그 */}
                <div className={styles.logSection} style={{ flex: 1, background: 'var(--sidebar-color)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>실시간 거래완료 로그</h3>
                        <span style={{ fontSize: '0.8rem', color: '#28a745' }}><i className="bx bx-radio-circle-marked bx-burst"></i> Live</span>
                    </div>
                    <div style={{
                        height: '250px', overflowY: 'auto', backgroundColor: '#2b2b2b',
                        borderRadius: '6px', padding: '15px', color: '#a9b7c6',
                        fontSize: '0.85rem', fontFamily: 'monospace'
                    }}>
                        {transactionLogs.length === 0 ? (
                            <div style={{ textAlign: 'center', opacity: 0.5, paddingTop: '100px' }}>
                                거래완료 로그가 없습니다.
                            </div>
                        ) : (
                            transactionLogs.map((log) => (
                                <div key={log.productId} style={{ marginBottom: '8px' }}>
                                    <span style={{ color: '#6a8759' }}>[{log.completedAt}]</span>
                                    {' '}
                                    <span style={{ color: '#cc7832' }}>[거래완료]</span>
                                    {' '}
                                    <span>{log.sellerNickname}</span>
                                    {' '}
                                    <span style={{ color: '#ffc66d' }}>"{log.title}"</span>
                                    {' '}
                                    <span style={{ color: '#6897bb' }}>{log.price?.toLocaleString()}원</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3-2. 최근 등록 상품 */}
                <div className={styles.recentProductSection} style={{ flex: 1, background: 'var(--sidebar-color)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>최근 등록 상품 모니터링</h3>
                        <span style={{ fontSize: '0.8rem', color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/admin/products')}>상품 관리로 이동</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        {recentProducts.length === 0 ? (
                            <div style={{
                                gridColumn: '1 / -1', textAlign: 'center',
                                color: 'var(--text-color)', opacity: 0.5, padding: '20px 0'
                            }}>
                                등록된 상품이 없습니다.
                            </div>
                        ) : (
                            recentProducts.map((product) => (
                                <div key={product.productId}
                                    style={{
                                        display: 'flex', gap: '10px', padding: '10px',
                                        border: '1px solid var(--primary-color-light)', borderRadius: '6px'
                                    }}>
                                    <div style={{
                                        width: '60px', height: '60px',
                                        backgroundColor: 'var(--primary-color-light)',
                                        borderRadius: '4px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', flexShrink: 0
                                    }}>
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <i className="bx bx-image"
                                                style={{ color: '#adb5bd', fontSize: '1.5rem' }}></i>
                                        )}
                                    </div>
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        justifyContent: 'center', minWidth: 0
                                    }}>
                                        <span style={{
                                            fontWeight: 'bold', fontSize: '0.9rem',
                                            color: 'var(--text-color)',
                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {product.title}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-color)', opacity: 0.6 }}>
                                            {product.price?.toLocaleString()}원
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                            {product.createdAt}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashBoard;

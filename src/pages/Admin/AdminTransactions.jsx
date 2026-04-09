import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    LineChart, Line,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import styles from './AdminTransactions.module.css';
import {
    fetchTransactionSeries,
    fetchTransactionStatusBreakdown,
    fetchTopCategories,
} from '../../api/AdminTransactionsAPI';

// 숫자/통화 포맷
const fmt = (v) => (v != null ? Number(v).toLocaleString() : '0');
const fmtWon = (v) => `${fmt(v)}원`;

// 기본 기간: 오늘 기준 최근 30일
const toYmd = (d) => d.toISOString().slice(0, 10);
const getDefaultRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    return { startDate: toYmd(start), endDate: toYmd(end) };
};

const STATUS_COLORS = ['#2d6cdf', '#27ae60', '#e67e22', '#c0392b', '#8e44ad', '#16a085'];
const STATUS_LABEL = {
    SALE: '판매중',
    SOLD_OUT: '판매완료',
    RESERVED: '예약중',
};

/** CSV(UTF-8 BOM) 다운로드 — Excel에서 바로 열림. 별도 라이브러리 불필요 */
const downloadCsv = (filename, rows) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const escape = (v) => {
        if (v == null) return '';
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [
        headers.join(','),
        ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

function AdminTransactions() {
    const defaults = useMemo(getDefaultRange, []);
    const [period, setPeriod] = useState('daily'); // daily | weekly | monthly
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [series, setSeries] = useState([]);       // [{bucket,count,amount}]
    const [summary, setSummary] = useState(null);   // {totalCount,totalAmount,avgAmount}
    const [statusData, setStatusData] = useState([]);
    const [topCategories, setTopCategories] = useState([]);

    const loadAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [seriesRes, statusRes, topRes] = await Promise.all([
                fetchTransactionSeries(period, startDate, endDate),
                fetchTransactionStatusBreakdown(startDate, endDate),
                fetchTopCategories(startDate, endDate, 8),
            ]);
            setSeries(seriesRes?.series ?? []);
            setSummary(seriesRes?.summary ?? null);
            setStatusData(
                (statusRes ?? []).map((s) => ({
                    ...s,
                    label: STATUS_LABEL[s.status] ?? s.status,
                }))
            );
            setTopCategories(topRes ?? []);
        } catch (e) {
            console.error(e);
            setError('거래 통계 데이터를 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [period, startDate, endDate]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    // ---- 엑셀(CSV) 다운로드 ----
    const exportSeriesCsv = () => {
        const rows = series.map((r) => ({
            기간구분: period,
            구간: r.bucket,
            거래건수: r.count,
            총거래금액: r.amount,
        }));
        downloadCsv(`거래통계_${period}_${startDate}_${endDate}.csv`, rows);
    };

    const exportAllCsv = () => {
        // 시트 대용으로 섹션을 한 파일에 모음
        const rows = [];
        rows.push({ 섹션: '요약', 항목: '총 거래건수', 값: summary?.totalCount ?? 0 });
        rows.push({ 섹션: '요약', 항목: '총 거래금액', 값: summary?.totalAmount ?? 0 });
        rows.push({ 섹션: '요약', 항목: '평균 거래금액', 값: summary?.avgAmount ?? 0 });
        series.forEach((r) =>
            rows.push({ 섹션: `시계열(${period})`, 항목: r.bucket, 값: `건수 ${r.count} / 금액 ${r.amount}` })
        );
        statusData.forEach((s) =>
            rows.push({ 섹션: '상태별', 항목: s.label, 값: `건수 ${s.count} / 금액 ${s.amount}` })
        );
        topCategories.forEach((c) =>
            rows.push({ 섹션: '카테고리TOP', 항목: c.categoryName, 값: `건수 ${c.count} / 금액 ${c.amount}` })
        );
        downloadCsv(`거래관리_리포트_${startDate}_${endDate}.csv`, rows);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>거래 관리</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={`${styles.btn} ${styles.btnGhost}`} onClick={loadAll} disabled={isLoading}>
                        <i className="bx bx-refresh"></i> 새로고침
                    </button>
                    <button className={styles.btn} onClick={exportAllCsv} disabled={isLoading}>
                        <i className="bx bx-download"></i> 전체 리포트 엑셀
                    </button>
                </div>
            </div>

            {/* 툴바 */}
            <div className={styles.toolbar}>
                <div className={styles.periodTabs}>
                    {[
                        { key: 'daily', label: '일별' },
                        { key: 'weekly', label: '주간별' },
                        { key: 'monthly', label: '월별' },
                    ].map((p) => (
                        <button
                            key={p.key}
                            className={`${styles.periodTab} ${period === p.key ? styles.periodTabActive : ''}`}
                            onClick={() => setPeriod(p.key)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <label>
                    시작일
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label>
                    종료일
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>

                <button className={`${styles.btn} ${styles.btnGhost}`} onClick={exportSeriesCsv} disabled={isLoading}>
                    <i className="bx bx-spreadsheet"></i> 차트 데이터 엑셀
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {isLoading ? (
                <div className={styles.loading}>
                    <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }}></i>
                    <p>데이터를 불러오는 중...</p>
                </div>
            ) : (
                <>
                    {/* 요약 카드 */}
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>총 거래 건수</div>
                            <div className={styles.summaryValue}>{fmt(summary?.totalCount)}건</div>
                        </div>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>총 거래 금액 (GMV)</div>
                            <div className={styles.summaryValue}>{fmtWon(summary?.totalAmount)}</div>
                        </div>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>평균 거래 금액</div>
                            <div className={styles.summaryValue}>{fmtWon(summary?.avgAmount)}</div>
                        </div>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>선택 기간</div>
                            <div className={styles.summaryValue} style={{ fontSize: 16 }}>
                                {startDate} ~ {endDate}
                            </div>
                        </div>
                    </div>

                    {/* 시계열 차트 (거래금액 라인 + 거래건수 바) */}
                    <div className={styles.chartCard} style={{ marginBottom: 20 }}>
                        <h3 className={styles.chartTitle}>
                            거래 추이 ({period === 'daily' ? '일별' : period === 'weekly' ? '주간별' : '월별'})
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="bucket" />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(v) => (v >= 10000 ? `${(v / 10000).toFixed(0)}만` : v)}
                                />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip
                                    formatter={(value, name) =>
                                        name === '거래금액' ? fmtWon(value) : `${fmt(value)}건`
                                    }
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="amount"
                                    name="거래금액"
                                    stroke="#2d6cdf"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="count"
                                    name="거래건수"
                                    stroke="#27ae60"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 상태 분포 + 카테고리 TOP */}
                    <div className={`${styles.chartGrid} ${styles.two}`}>
                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>카테고리별 거래 TOP</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topCategories} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(v) => fmt(v)} />
                                    <YAxis type="category" dataKey="categoryName" width={90} />
                                    <Tooltip formatter={(v, name) => (name === '금액' ? fmtWon(v) : `${fmt(v)}건`)} />
                                    <Legend />
                                    <Bar dataKey="count" name="건수" fill="#2d6cdf" />
                                    <Bar dataKey="amount" name="금액" fill="#27ae60" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className={styles.chartCard}>
                            <h3 className={styles.chartTitle}>거래 상태 분포</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        dataKey="count"
                                        nameKey="label"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={(e) => `${e.label} ${e.count}`}
                                    >
                                        {statusData.map((_, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => `${fmt(v)}건`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminTransactions;

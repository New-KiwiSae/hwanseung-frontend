import styles from './AdminContent.module.css';

function AdminStatistics() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>통계</h2>
            <div className={styles.placeholder}>
                <i className="bx bx-bar-chart-alt-2"></i>
                <p>거래 현황, 사용자 통계 등이 표시될 예정입니다.</p>
            </div>
        </div>
    );
}

export default AdminStatistics;

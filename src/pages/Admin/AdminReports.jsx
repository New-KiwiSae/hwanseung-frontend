import styles from './AdminContent.module.css';

function AdminReports() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>신고/정지</h2>
            <div className={styles.placeholder}>
                <i className="bx bx-user-x"></i>
                <p>사용자 신고 내역 및 계정 정지 관리가 표시될 예정입니다.</p>
            </div>
        </div>
    );
}

export default AdminReports;

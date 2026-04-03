import styles from './AdminContent.module.css';

function AdminInquiries() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>문의 내역</h2>
            <div className={styles.placeholder}>
                <i className="bx bx-chat"></i>
                <p>사용자 문의 내역 및 답변 관리가 표시될 예정입니다.</p>
            </div>
        </div>
    );
}

export default AdminInquiries;

import styles from './AdminContent.module.css';

function AdminUsers() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>사용자 관리</h2>
            <div className={styles.placeholder}>
                <i className="bx bx-group"></i>
                <p>회원 목록, 권한 관리 등이 표시될 예정입니다.</p>
            </div>
        </div>
    );
}

export default AdminUsers;

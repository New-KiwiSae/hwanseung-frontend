import styles from './AdminContent.module.css';

function AdminProducts() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>상품 관리</h2>
            <div className={styles.placeholder}>
                <i className="bx bx-package"></i>
                <p>등록된 상품 목록, 상품 승인/삭제 관리가 표시될 예정입니다.</p>
            </div>
        </div>
    );
}

export default AdminProducts;

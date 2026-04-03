import styles from './AdminContent.module.css';

function AdminCategories() {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>카테고리 관리</h2>
            <div className={styles.placeholder}>
                <i className="bx bx-category"></i>
                <p>상품 카테고리 추가/수정/삭제 관리가 표시될 예정입니다.</p>
            </div>
        </div>
    );
}

export default AdminCategories;

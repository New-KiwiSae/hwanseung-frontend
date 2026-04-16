import { useEffect, useState } from 'react';
import axios from 'axios';
import { getHeader } from '../../api/UserAPI';
import styles from './AdminContent.module.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `/api/admin/users?page=${page-1}&size=10&keyword=${encodeURIComponent(searchKeyword)}`,
                    getHeader() 
                );
                
                const data = response.data; 
                
                setUsers(data.content || []);
                setTotalPages(data.totalPages || 1);
            } catch (err) {
                console.error("사용자 로드 에러:", err);
                setError(err.response?.data?.message || err.message || '사용자 데이터를 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [page, searchKeyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearchKeyword(searchInput);
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const action = currentStatus === 'ACTIVE' ? '정지' : '활성화';
        if (!window.confirm(`해당 사용자를 ${action} 처리하시겠습니까?`)) return;

        try {
            const requestBody = { status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
            const response = await axios.patch(
                `/api/admin/users/${userId}/status`, 
                requestBody,
                getHeader()
            );

            setUsers(users.map(user => 
                user.id === userId 
                    ? { ...user, status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } 
                    : user
            ));
        } catch (err) {
            alert(`처리 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>사용자 관리</h2>
            </div>

            <div className={styles.searchSection} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <i className="bx bx-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
                        <input 
                            type="text" 
                            placeholder="이메일 또는 닉네임 검색" 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px 8px 35px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        검색
                    </button>
                </form>
            </div>

            {error && <div style={{ color: '#d9534f', marginBottom: '15px' }}><i className="bx bx-error"></i> {error}</div>}

            <div className={styles.tableContainer} style={{ background: 'var(--sidebar-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--primary-color)', borderBottom: '2px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '12px 15px' }}>회원번호</th>
                            <th style={{ padding: '12px 15px' }}>아이디</th>
                            <th style={{ padding: '12px 15px' }}>닉네임</th>
                            <th style={{ padding: '12px 15px' }}>신뢰도 레벨</th>
                            <th style={{ padding: '12px 15px' }}>누적신고</th>
                            <th style={{ padding: '12px 15px' }}>상태</th>
                            <th style={{ padding: '12px 15px' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                    <i className="bx bx-loader-alt bx-spin" style={{ marginRight: '8px' }}></i> 로딩 중...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                                    사용자 데이터가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee', color: 'var(--text-color)' }}>
                                    <td style={{ padding: '12px 15px' }}>{user.id}</td>
                                    <td style={{ padding: '12px 15px' }}>{user.username}</td>
                                    <td style={{ padding: '12px 15px' }}>{user.nickname}</td>
                                    <td style={{ padding: '12px 15px', color: user.trustScore < 30 ? '#d9534f' : 'inherit' }}>
                                        Lv.{user.trustScore}
                                    </td>
                                    <td style={{ padding: '12px 15px' }}>
                                        {user.reportCount > 0 ? (
                                            <span style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>{user.reportCount}건</span>
                                        ) : '0건'}
                                    </td>
                                    <td style={{ padding: '12px 15px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                                            backgroundColor: user.status === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                                            color: user.status === 'ACTIVE' ? '#155724' : '#721c24'
                                        }}>
                                            {user.status === 'ACTIVE' ? '정상' : '정지됨'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 15px' }}>
                                        <button 
                                            onClick={() => toggleUserStatus(user.id, user.status)}
                                            style={{ 
                                                padding: '5px 10px', fontSize: '0.85rem', cursor: 'pointer',
                                                backgroundColor: user.status === 'ACTIVE' ? '#fff' : '#333',
                                                border: '1px solid #ccc', borderRadius: '4px',
                                                color: user.status === 'ACTIVE' ? '#333' : '#fff'
                                            }}
                                        >
                                            {user.status === 'ACTIVE' ? '계정 정지' : '정지 해제'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    
                    </tbody>
                </table>
            </div>

            {!isLoading && users.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '5px' }}>
                    <button 
                        disabled={page === 1} 
                        onClick={() => setPage(p => p - 1)}
                        style={{ padding: '5px 10px', border: '1px solid #ddd', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        이전
                    </button>
                    <span style={{ padding: '5px 15px', background: '#333', color: '#fff', borderRadius: '4px' }}>
                        {page} / {totalPages}
                    </span>
                    <button 
                        disabled={page === totalPages} 
                        onClick={() => setPage(p => p + 1)}
                        style={{ padding: '5px 10px', border: '1px solid #ddd', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
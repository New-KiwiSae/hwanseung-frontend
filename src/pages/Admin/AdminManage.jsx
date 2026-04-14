import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './AdminManage.module.css';

const API_BASE = '/api/admin/manage';

const getUserRole = () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch (e) {
    return null;
  }
};

const getAuthHeader = () => {
  const token = sessionStorage.getItem("accessToken");
  const tokenType = sessionStorage.getItem("tokenType") || "Bearer";
  return { Authorization: `${tokenType} ${token}` };
};

const ROLE_OPTIONS = [
  { value: 'ROLE_SUPER', label: 'SUPER' },
  { value: 'ROLE_ADMIN', label: 'ADMIN' },
  { value: 'ROLE_SUB', label: 'SUB' },
];

const AdminManage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 관리자 생성 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    name: '',
    nickname: '',
    role: 'ROLE_ADMIN',
  });
  const [createError, setCreateError] = useState('');

  // 권한 수정 중인 행
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');

  const role = getUserRole();
  const isSuperAdmin = role === 'ROLE_SUPER';

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    fetchAdmins();
  }, [isSuperAdmin]);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/list`, {
        headers: getAuthHeader(),
      });
      setAdmins(res.data);
    } catch (err) {
      console.error('관리자 목록 조회 실패:', err);
      setError('관리자 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 권한 수정 ──
  const handleEditClick = (admin) => {
    setEditingId(admin.id);
    setEditRole(admin.role);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditRole('');
  };

  const handleRoleUpdate = async (userId) => {
    try {
      await axios.put(
        `${API_BASE}/role`,
        { userId, role: editRole },
        { headers: getAuthHeader() }
      );
      setEditingId(null);
      setEditRole('');
      fetchAdmins();
    } catch (err) {
      console.error('권한 수정 실패:', err);
      alert(err.response?.data?.message || '권한 수정에 실패했습니다.');
    }
  };

  // ── 관리자 생성 ──
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async () => {
    setCreateError('');
    const { username, password, name, nickname, role: newRole } = createForm;

    if (!username.trim() || !password.trim() || !name.trim() || !nickname.trim()) {
      setCreateError('모든 항목을 입력해 주세요.');
      return;
    }
    if (password.length < 4) {
      setCreateError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/create`,
        { username, password, name, nickname, role: newRole },
        { headers: getAuthHeader() }
      );
      setShowCreateModal(false);
      setCreateForm({ username: '', password: '', name: '', nickname: '', role: 'ROLE_ADMIN' });
      fetchAdmins();
    } catch (err) {
      console.error('관리자 생성 실패:', err);
      setCreateError(err.response?.data?.message || '관리자 생성에 실패했습니다.');
    }
  };

  // ── SUPER가 아니면 메시지만 표시, 테이블·버튼 전부 숨김 ──
  if (!isSuperAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.denyContainer}>
          <i className="bx bx-lock-alt" style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }}></i>
          <p className={styles.denyMessage}>권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>&nbsp;&nbsp;관리자 관리</h2>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          관리자 계정 생성
        </button>
      </div>

      {loading && <p className={styles.info}>로딩 중...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>회원 번호</th>
              <th>아이디</th>
              <th>이름</th>
              <th>별명</th>
              <th>권한</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyRow}>관리자 데이터가 없습니다.</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.username}</td>
                  <td>{admin.name}</td>
                  <td>{admin.nickname}</td>
                  <td>
                    {editingId === admin.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className={styles.roleSelect}
                      >
                        {ROLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`${styles.roleBadge} ${styles[admin.role]}`}>
                        {admin.role?.replace('ROLE_', '')}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === admin.id ? (
                      <div className={styles.actionBtns}>
                        <button className={styles.saveBtn} onClick={() => handleRoleUpdate(admin.id)}>
                          저장
                        </button>
                        <button className={styles.cancelBtn} onClick={handleEditCancel}>
                          취소
                        </button>
                      </div>
                    ) : (
                      <button className={styles.editBtn} onClick={() => handleEditClick(admin)}>
                        수정
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* ── 관리자 계정 생성 모달 ── */}
      {showCreateModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>관리자 계정 생성</h3>
              <button
                className={styles.closeBtn}
                onClick={() => { setShowCreateModal(false); setCreateError(''); }}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              {createError && <p className={styles.errorText}>{createError}</p>}

              <div className={styles.formGroup}>
                <label>아이디</label>
                <input
                  type="text"
                  name="username"
                  value={createForm.username}
                  onChange={handleCreateChange}
                  placeholder="아이디 입력"
                />
              </div>
              <div className={styles.formGroup}>
                <label>비밀번호</label>
                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={handleCreateChange}
                  placeholder="비밀번호 입력"
                />
              </div>
              <div className={styles.formGroup}>
                <label>이름</label>
                <input
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateChange}
                  placeholder="이름 입력"
                />
              </div>
              <div className={styles.formGroup}>
                <label>별명</label>
                <input
                  type="text"
                  name="nickname"
                  value={createForm.nickname}
                  onChange={handleCreateChange}
                  placeholder="별명 입력"
                />
              </div>
              <div className={styles.formGroup}>
                <label>권한</label>
                <select name="role" value={createForm.role} onChange={handleCreateChange}>
                  {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <button className={styles.submitBtn} onClick={handleCreateSubmit}>
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManage;

import React, { useState, useEffect } from 'react';
import * as api from '../../api/InquiriesAPI';
import './AdminInquiries.css';
import { loginChk, adminChk } from "../../api/LoginChk";

const AdminInquiries = () => {
  if (loginChk() && adminChk()) {
    const [error, setError] = useState(false);
    const [inquiries, setInquiries] = useState([]);
    const [category, setCategory] = useState('all');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [expandedId, setExpandedId] = useState(null);
    const limitsize = 5;

    // 모달 상태 (등록/수정)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    useEffect(() => {
      loadData();
    }, [category, page]);

    const loadData = async () => {
      const params = { category, page };
      const res = await api.fetchInquiries(params).then((res) => {
        console.log('res: ', res);
        setInquiries(res.data.content);
        setTotalPages(res.data.totalPages);
      }).catch(() => setError(true));
    };

    const handleToggle = (id) => setExpandedId(expandedId === id ? null : id);

    //페이징 그룹 계산(5개씩)
    const pageGroup = Math.floor(page / limitsize);
    const startPage = pageGroup * limitsize;
    const endPage = Math.min(startPage + limitsize, totalPages);



    // 추가 페이지 이동 함수
    const handlePageChange = (p) => {
      setPage(p);
    };


    const handleDelete = async (e) => {
      const tag = e.target;
      let dataval;
      if (tag.tagName === 'I') { dataval = tag.parentElement.getAttribute('dataVal'); }
      else { dataval = tag.getAttribute('dataVal'); }
      console.log('dataval: ', dataval);
      if (window.confirm("삭제하시겠습니까?")) {
        await api.deleteInquiry(dataval);
        loadData();
        setIsModalOpen(false);
      }
    };


    return (
      <div className="container faq-container">
        <div className="faq-header">
          <h2 className="title">자주묻는 질문</h2>
          <button className="btn-register" onClick={() => { setSelectedInquiry(null); setIsModalOpen(true); }}>+ 질문 등록</button>
        </div>

        {/* 에러 */}
        {
          error && (
            <div className="errorBox">
              ⚠ 목록을 불러오는 데 실패했습니다.
            </div>
          )
        }

        <div className="category-tabs">
          {['all', 'pay', 'user', 'product'].map(cat => (
            <button key={cat} className={`tab ${category === cat ? 'active' : ''}`} onClick={() => {
              setCategory(cat);
              setPage(0);
            }}>
              {cat === 'all' ? '전체' : cat === 'pay' ? '페이' : cat === 'user' ? '회원' : '상품/거래'}
            </button>
          ))}
        </div>

        <div className="faq-list" style={inquiries.length <= 0 ? { backgroundColor: '#fff', borderRadius: '8px' } : { backgroundColor: 'transparent', borderRadius: 'none' }}>
          {inquiries.length > 0 ? inquiries.map((item) => (
            <div key={item.id} className="faq-item">
              <div className="faq-question" onClick={() => handleToggle(item.id)}>
                <div>
                  <span className="badge-pay">{item.category === 'all' ? '전체' : item.category === 'pay' ? '페이' : item.category === 'user' ? '회원' : '상품/거래'}</span>
                  <strong>{item.question}</strong>
                </div>
                <span className="upDownIcon">{expandedId === item.id ? '⌃' : '⌄'}</span>
              </div>
              {expandedId === item.id && (
                <div className="faq-answer">
                  <span dangerouslySetInnerHTML={{ __html: item.answer }} />
                  <div className="btnBox">
                    <button className="btnall btn-modi" onClick={() => { setSelectedInquiry(item); setIsModalOpen(true); }}>
                      <i className="bx bx-edit-alt"></i>수정
                    </button>
                    <button className="btnall btn-delete" onClick={handleDelete} dataVal={item.id}>
                      <i className="bx bx-trash"></i>삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
            : (
              <div className="empty">
                <i className="bx bx-grid-alt"></i>
                <p>등록된 카테고리가 없습니다.</p>
              </div>
            )}
        </div>

        {/* [추가] 페이징 UI */}
        {inquiries.length > 0 && (
          <>
            <div className="pagination">
              {startPage > 0 && (<button onClick={() => handlePageChange(startPage - 1)}>&lt;</button>)}

              {Array.from({ length: endPage - startPage }, (_, i) => {
                const p = startPage + i;
                return (
                  <button
                    key={p}
                    className={p === page ? "active" : ""}
                    onClick={() => handlePageChange(p)}
                  >
                    {p + 1}
                  </button>
                );
              })}

              {endPage < totalPages && (<button onClick={() => handlePageChange(endPage)}>&gt;</button>)}
            </div>
          </>
        )}



        {/* 모달창 (자주묻는 질문 등록/수정) */}
        {isModalOpen && (
          <InquiryModal
            data={selectedInquiry}
            onClose={(e) => {
              setIsModalOpen(false);
            }}
            refresh={loadData}
          />
        )}
      </div>
    );
  };
};


// 등록/수정 모달 컴포넌트
const InquiryModal = ({ data, onClose, refresh }) => {
  const [form, setForm] = useState(data || { category: null, question: '', answer: '' });

  const handleSubmit = async () => {
    if (!form.question || !form.answer) {
      alert("질문과 답변을 모두 입력해주세요.");
      return;
    }
    if (data) await api.updateInquiry(data.id, form);
    else await api.createInquiry(form);
    refresh();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content faq-register-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 부분 */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="plus-icon">+</span> 자주묻는 질문 {data ? '수정' : '등록'}
          </div>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* 질문 입력 */}
          <div className="form-group">
            <label>질문 <span className="required">*</span></label>
            <input
              type="text"
              placeholder="질문을 입력하세요"
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
            />
          </div>

          {/* 카테고리 선택 (체크박스 형태) */}
          <div className="category-selection">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.category === 'pay'} onChange={() => setForm({ ...form, category: 'pay' })} />
              <span>페이</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.category === 'user'} onChange={() => setForm({ ...form, category: 'user' })} />
              <span>회원</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.category === 'product'} onChange={() => setForm({ ...form, category: 'product' })} />
              <span>상품/거래</span>
            </label>
          </div>

          {/* 답변 입력 */}
          <div className="form-group">
            <label>답변 <span className="required">*</span></label>
            <textarea
              placeholder="답변 내용을 입력 하세요"
              value={form.answer}
              onChange={e => setForm({ ...form, answer: e.target.value })}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="modal-footer">
          <button className="btnall btn-modi" onClick={onClose}>취소</button>
          <button className="btnall btn-submit" onClick={handleSubmit}>
            {data ? (<><i className="bx bx-edit-alt"></i>수정</>) : (<><i className="bx bx-check"></i>등록하기</>)}
          </button>
        </div>
      </div>
    </div>

  );
}

export default AdminInquiries;
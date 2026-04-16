import React, { useState, useEffect } from 'react';
import * as api from '../../api/InquiriesAPI';
import './Inquiries.css';
import { loginChk } from "../../api/LoginChk";

const Inquiries = () => {
  if (loginChk()) {
    const [error, setError] = useState(false);
    const [inquiries, setInquiries] = useState([]);
    const [category, setCategory] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limitno = 5;
    let allList = [];


    const loadData = async () => {
      setLoading(true);
      const params = { category };
      await api.getInquiries(params)
        .then(res => {
          allList = res.data;

          if (allList.length === 0) {
            setHasMore(false);
          } else {
            const newData = allList.filter((item, index) => index < page * limitno);
            setInquiries([...newData]);

            if (newData.length === allList.length) {
              setHasMore(false);
            }
          }
          setPage((prev) => prev + 1);
        })
        .catch((err) => {
          console.error('데이터 로드 실패:', err);
        })
        .finally(() => {
          setLoading(false);
        });

    };

    useEffect(() => {
      setHasMore(true);
      allList = [];
      loadData();
    }, [category]);

    const handleToggle = (id) => setExpandedId(expandedId === id ? null : id);

    const handleLoadMore = () => {
      loadData();
    };

    return (
      <div className="container inquiry-container">
        <div className="inquiry-header">
          <h2 className="title">
            <i className="fas fa-question-circle"></i>
            자주묻는 질문
          </h2>
        </div>

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
              setPage(1);
              setCategory(cat);
            }}>
              {cat === 'all' ? '전체' : cat === 'pay' ? '페이' : cat === 'user' ? '회원' : '상품/거래'}
            </button>
          ))}
        </div>

        <div className="inquiry-list" style={inquiries.length <= 0 ? { backgroundColor: '#fff', borderRadius: '8px' } : { backgroundColor: 'transparent', borderRadius: 'none' }}>
          {inquiries.length > 0 ? inquiries.map((item) => (
            <div key={item.id} className="inquiry-item">
              <div className="inquiry-question" onClick={() => handleToggle(item.id)}>
                <div>
                  <span className="badge-pay">{item.category === 'all' ? '전체' : item.category === 'pay' ? '페이' : item.category === 'user' ? '회원' : '상품/거래'}</span>
                  <strong>{item.question}</strong>
                </div>
                <span className="upDownIcon">{expandedId === item.id ? '⌃' : '⌄'}</span>
              </div>
              {expandedId === item.id && (
                <div className="inquiry-answer">
                  {item.answer}
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

        {!loading && hasMore && inquiries.length > 0 && (
          <div className="more-btn-container">
            <button className="notice-more-btn" onClick={handleLoadMore}>
              더보기 <i className="fas fa-chevron-down"></i>
            </button>
          </div>
        )}

      </div>
    );
  }

};

export default Inquiries;
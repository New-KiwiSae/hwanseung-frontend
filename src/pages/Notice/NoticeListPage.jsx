import { useEffect, useState } from "react";
import { getNoticesList } from "../../api/NoticeAPI";
import { useNavigate } from 'react-router-dom';

import './NoticeListPage.css';
import { loginChk } from "../../api/LoginChk";


function NoticeListPage() {
  if (loginChk()) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const limitno = 5;
    let allList = [];

    const fetchNotices = () => {
      setLoading(true);

      getNoticesList()
        .then(res => {
          allList = res.data;

          if (allList.length === 0) {
            setHasMore(false);
          } else {
            const newData = allList.filter((item, index) => index < page * limitno);
            setList([...newData]);

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
      fetchNotices();
    }, []);

    const handleLoadMore = () => {
      fetchNotices();
    };

    return (
      <div className="main-viewport">
        <div className="content-view">
          <h2 className="notice-title">
            <i className="fas fa-heart"></i> 공지사항
          </h2>

          {loading && <p style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중입니다...</p>}
          <div className="notice-list-container">
            {list.map((notice, index) => (
              <div
                key={index}
                className="notice-list-item"
                onClick={() => navigate(`/notices/${notice.id}`)}
              >
                <div className="notice-item-info">
                  <div className="notice-item-category">No. {notice.id}</div>
                  <div className="notice-item-title">
                    {notice.title.length > 50 ? notice.title.substring(0, 50) + '...' : notice.title}
                  </div>
                  <div className="notice-item-price">{notice.created_at}</div>
                </div>
                <div>{notice.pinned !== 0 && <span className="notice-status-badge selling">중요</span>}</div>
              </div>
            ))}
          </div>

          {!loading && list.length === 0 && (
            <div className="notice-empty-state">
              <i className="fas fa-ghost"></i>
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          )}

          {loading && <p style={{ textAlign: 'center', padding: '20px' }}>데이터를 불러오는 중입니다...</p>}

          {!loading && hasMore && list.length > 0 && (
            <div className="more-btn-container">
              <button className="notice-more-btn" onClick={handleLoadMore}>
                더보기 <i className="fas fa-chevron-down"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

}

export default NoticeListPage;
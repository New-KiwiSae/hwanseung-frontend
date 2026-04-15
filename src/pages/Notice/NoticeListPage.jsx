import { useEffect, useState } from "react";
import { getNoticesList } from "../../api/NoticeAPI";
import { useNavigate } from 'react-router-dom';

import './NoticeListPage.css';
import { loginChk } from "../../api/LoginChk";


function NoticeListPage() {
  if (loginChk()) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1); // 현재 페이지 추적
    const [hasMore, setHasMore] = useState(true); // 더 가져올 데이터가 있는지 여부
    const navigate = useNavigate();
    const limitno = 5;
    let allList = [];

    // 데이터를 가져오는 함수
    const fetchNotices = () => {
      setLoading(true);

      // API 호출 시 page 파라미터를 넘긴다고 가정 (예: getNoticesList(pageNum))
      getNoticesList()
        .then(res => {
          allList = res.data;
          console.log('allList', allList);

          if (allList.length === 0) {
            setHasMore(false); // 데이터가 없으면 버튼 숨김
          } else {
            const newData = allList.filter((item, index) => index < page * limitno);
            // 기존 리스트에 새 데이터를 이어 붙임
            setList([...newData]);

            // 만약 가져온 데이터가 모두 다 보여졌으면 실행
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

    // 컴포넌트 마운트 시 첫 페이지 로드
    useEffect(() => {
      fetchNotices();
    }, []);

    // [더보기] 버튼 클릭 핸들러
    const handleLoadMore = () => {
      fetchNotices();
    };

    return (
      <div className="main-viewport">
        <div className="content-view">
          <h2 className="notice-title">
            <i className="fas fa-heart"></i> 공지사항
          </h2>

          {/* 로딩 중 */}
          {loading && <p style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중입니다...</p>}
          {/* 목록 리스트 */}
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

          {/* 목록이 없을 때 */}
          {!loading && list.length === 0 && (
            <div className="notice-empty-state">
              <i className="fas fa-ghost"></i>
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          )}

          {/* 로딩 표시 */}
          {loading && <p style={{ textAlign: 'center', padding: '20px' }}>데이터를 불러오는 중입니다...</p>}

          {/* 더보기 버튼 */}
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
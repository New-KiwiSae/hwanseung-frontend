import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getNotice, deleteNotice } from "../../api/NoticeAPI";
import './NoticeDetailPage.css';
import { loginChk } from "../../api/LoginChk";

function NoticeDetailPage({ handler, value, setNo }) {
  if (loginChk()) {
    let { id } = useParams();
    id = Boolean(id) ? id : value;
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState("");
    const [isAuthPage, setisAuthPage] = useState(false);
    const isAdminPage = location.pathname.startsWith('/admin');

    useEffect(() => {
      const adminId = sessionStorage.getItem("username");
      if (adminId === 'admin') setisAuthPage(true);
      else setisAuthPage(false);
      getNotice(id)
        .then((res) => setNotice(res.data))
        .catch((err) => {
          console.error(err);
          setError("공지사항을 불러오는 중 오류가 발생했습니다.");
        });
    }, [id, isAuthPage]);

    const handleDelete = async () => {
      if (window.confirm("정말로 삭제하시겠습니까?")) {
        try {
          await deleteNotice(id);
          alert("공지사항이 삭제되었습니다.");
          navigate("/notices");
        } catch (err) {
          console.error(err);
          setError("삭제 중 오류가 발생했습니다.");
        }
      }
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!notice) return <p>로딩 중...</p>;

    return (
      <div className="notice-detail-page">
        <h2 className="page-title"><i className="fas fa-heart"></i> 공지사항</h2>

        <div className="notice-card">
          {/* 제목 영역 */}
          <div className="notice-header">
            <div className="notice-title">
              {notice.title}
            </div>
            <div className="notice-date">
              {new Date(notice.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* 본문 */}
          <div className="notice-body">{notice.content}</div>
        </div>

        <div className="button-group">
          {isAdminPage && (
            <>
              <button className="NoticeDelBtn" onClick={() => {
                if (confirm('정말로 삭제하시겠습니까?')) {
                  deleteNotice(value);
                  alert('삭제 되었습니다.');
                  handler(null);
                }
              }}><i className="bx bx-trash"></i> 삭제</button>
              <button className="NoticeModiBtn" onClick={() => {
                setNo(value);
                handler('modi');
              }
              }><i className="bx bx-check"></i> 수정</button>
              <button className="NoticeListBack" onClick={() => handler(null)}>목록으로 돌아가기</button>
            </>

          )}
          {!isAdminPage && (
            <Link to={`/notices`}>
              <button className="NoticeListBack">목록으로 돌아가기</button>
            </Link>
          )}

        </div>


      </div>
    );
  }
}

export default NoticeDetailPage;
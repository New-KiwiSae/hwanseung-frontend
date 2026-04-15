import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotice, updateNotice } from "../../api/NoticeAPI";
import './NoticeCreatePage.css';
import { loginChk, adminChk } from "../../api/LoginChk";

function NoticeModiPage({ handler, value }) {
  if (loginChk() && adminChk()) {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [pinned, setPinned] = useState(false); // pinned 상태 추가
    const [error, setError] = useState("");
    const [isAuthPage, setisAuthPage] = useState(false);

    useEffect(() => {
      const adminId = sessionStorage.getItem("username");
      if (adminId === 'admin') setisAuthPage(true);
      else setisAuthPage(false);
      getNotice(value)
        .then((res) => {
          let notice = res.data;
          setTitle(notice.title);
          setContent(notice.content);
          setPinned(notice.pinned);
        })
        .catch((err) => {
          console.error(err);
          setError("공지사항을 불러오는 중 오류가 발생했습니다.");
        });
    }, [value, isAuthPage]);



    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!title.trim() || !content.trim()) {
        setError("제목과 내용을 모두 입력해주세요.");
        return;
      }

      try {
        // API 호출 시 pinned 값도 함께 전송 (0 또는 1)
        console.log('pinned: ', pinned ? 1 : 0);
        updateNotice(value, { title, content, pinned: pinned ? 1 : 0 });

        alert("공지사항이 수정되었습니다.");
        handler(null);
      } catch (err) {
        console.error(err);
        setError("공지사항 수정 중 오류가 발생했습니다.");
      }
    };

    return (
      <div className="notice-create-page">
        <header className="page-header">
          <h3><i className="bx bx-plus-circle"></i>공지사항 수정</h3>
          <button className="close-btn" onClick={() => handler(null)}><i className="bx bx-x"></i></button>
        </header>


        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">제목 <span className="span-group">*</span></label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 고정 여부 체크박스 추가 */}
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            <label htmlFor="pinned" className="inline-label">상단고정</label>
          </div>

          <div className="form-group">
            <label htmlFor="title">내용 <span className="span-group">*</span></label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 작성하세요"
              rows={10}
            />
          </div>

          <div className="button-container">
            <button type="button" className="cancel-btn" onClick={() => handler(null)}>취소</button>
            <button type="submit" className="submit-btn"><i className="bx bx-check"></i> 수정하기</button>
          </div>
        </form>
      </div>
    );
  }

}

export default NoticeModiPage;
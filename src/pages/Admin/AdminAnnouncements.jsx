import './AdminAnnouncements.css';
import { useEffect, useState } from "react";
import { getNotices } from "../../api/NoticeAPI";
import { loginChk, adminChk } from "../../api/LoginChk";
import { useNavigate } from 'react-router-dom';
import { NoticeCreatePage, NoticeDetailPage, NoticeModiPage } from '../Notice';

function AdminAnnouncements() {
    if (loginChk() && adminChk()) {
        const [list, setList] = useState([]);
        const [error, setError] = useState(false);
        const navigate = useNavigate();
        const [modalMode, setModalMode] = useState(null);
        const [rowno, setRowno] = useState(null);
        const [no, setNo] = useState(0);

        const [page, setPage] = useState(0);
        const [totalPages, setTotalPages] = useState(0);

        const handlerModal = (e) => {
            let id = e.target.parentElement.getAttribute('id');
            if (id !== 'add') setRowno(e.target.parentElement.getAttribute('dataval'))
            setModalMode(id);
        };


        useEffect(() => {
            getNotices({ page: page, size: 10 })
                .then(res => {
                    setList(res.data.content);
                    setTotalPages(res.data.totalPages);
                })
                .catch(() => setError(true));
        }, [no, modalMode, page]);



        const pageGroup = Math.floor(page / 5);
        const startPage = pageGroup * 5;
        const endPage = Math.min(startPage + 5, totalPages);



        const handlePageChange = (p) => {
            setPage(p);
        };

        return (
            <div className="container adminNotice">

                < div className="header" id='add'>
                    <h2 className="title">공지사항 관리</h2>
                    <button className="addButton" onClick={handlerModal}>+ 공지사항 등록</button>
                </div>

                {
                    error && (
                        <div className="errorBox">
                            ⚠ 공지사항 목록을 불러오는 데 실패했습니다.
                        </div>
                    )
                }

                <div className="stats">
                    <span>전체 <strong>{list.length}</strong> 개</span>
                    <span>활성 <strong>{list.length}</strong> 개</span>
                    <span>등록 공지 <strong>{list.length}</strong> 개</span>
                </div>

                <div className="tableCard">
                    <div className="tableHeader">
                        <div>순서</div>
                        <div>제목</div>
                        <div>내용</div>
                        <div>날짜</div>
                    </div>

                    {list.length > 0 ? (
                        list.map((n, idx) => (
                            <div className="tableRow" key={n.id} onClick={handlerModal} id='detail' dataval={n.id}>
                                <div className="no"><span>{n.id}</span></div>
                                <div className="titleText" >{n.pinned ? <span className="sales-status-badge selling">중요</span> : ''} {n.title.length > 15 ? n.title.substring(0, 15) + '...' : n.title}</div>
                                <div className="contentText">{n.content.length > 25 ? n.content.substring(0, 25) + '...' : n.content}</div>
                                <div className="dateText">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty">
                            <i className="bx bx-grid-alt"></i>
                            <p>등록된 카테고리가 없습니다.</p>
                        </div>
                    )}
                </div>

                {list.length > 0 && (
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

                {modalMode === 'add' && (<NoticeCreatePage handler={setModalMode} setNo={setNo} />)}

                {modalMode === 'detail' && (
                    <div className='notice-detail-page-wrap'>
                        <NoticeDetailPage handler={setModalMode} value={rowno} setNo={setNo} />
                    </div>
                )}

                {modalMode === 'modi' && (
                    <div className='notice-detail-page-wrap'>
                        <NoticeModiPage handler={setModalMode} value={no} />
                    </div>
                )}
            </div >
        );
    }
}

export default AdminAnnouncements;

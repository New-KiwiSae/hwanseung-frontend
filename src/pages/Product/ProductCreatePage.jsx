import { useState } from "react";
import "./ProductCreatePage.css";

export default function ProductCreatePage() {
    const [form, setForm] = useState({
        title: "",
        category: "",
        price: "",
        content: "",
    });

    const [imageName, setImageName] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "price" ? value.replace(/[^0-9]/g, "") : value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageName(file.name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
        alert("상품 등록 API 연결 전입니다.");
    };

    return (
        <main className="product-create-page">
            <div className="product-create-inner">
                <section className="product-create-hero">
                    <span className="product-create-badge">판매 등록</span>
                    <h1>새 상품 등록</h1>
                    <p>
                        환승마켓에 판매할 상품 정보를 입력해주세요.
                        <br />
                        제목과 가격, 설명만 깔끔하게 적어도 충분히 보기 좋아요.
                    </p>
                </section>

                <form className="product-create-form" onSubmit={handleSubmit}>
                    <div className="product-create-top">
                        <section className="product-create-card image-card">
                            <div className="section-head">
                                <div>
                                    <h2>상품 이미지</h2>
                                    <p>대표 이미지 1장</p>
                                </div>
                            </div>

                            <label className="image-upload-box">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div className="image-upload-content">
                                    <div className="image-upload-plus">+</div>
                                    <strong>이미지 업로드</strong>
                                    <span>JPG, PNG 파일을 올려주세요</span>
                                    {imageName && (
                                        <p className="image-file-name">선택 파일: {imageName}</p>
                                    )}
                                </div>
                            </label>
                        </section>

                        <section className="product-create-card info-card">
                            <div className="section-head">
                                <div>
                                    <h2>기본 정보</h2>
                                    <p>상품 기본 정보를 입력해주세요</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="title">상품명</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="예: 아이폰 14 128GB 블루"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="category">카테고리</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                    >
                                        <option value="">카테고리 선택</option>
                                        <option value="digital">디지털기기</option>
                                        <option value="fashion">의류/잡화</option>
                                        <option value="furniture">가구/인테리어</option>
                                        <option value="life">생활/가전</option>
                                        <option value="hobby">취미/도서</option>
                                        <option value="sports">스포츠/레저</option>
                                        <option value="ticket">티켓/교환권</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price">가격</label>
                                    <div className="price-input-wrap">
                                        <input
                                            id="price"
                                            name="price"
                                            type="text"
                                            value={form.price}
                                            onChange={handleChange}
                                            placeholder="가격 입력"
                                        />
                                        <span>원</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="product-create-card detail-card">
                        <div className="section-head">
                            <div>
                                <h2>상품 설명</h2>
                                <p>상품 상태, 사용감, 거래 방법 등을 적어주세요</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">상세 설명</label>
                            <textarea
                                id="content"
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                placeholder={`예:
- 구매 시기
- 사용감 여부
- 하자 유무
- 직거래 / 택배 가능 여부`}
                            />
                        </div>
                    </section>

                    <div className="product-create-submit">
                        <p>입력한 내용을 확인한 뒤 상품을 등록해주세요.</p>
                        <div className="submit-buttons">
                            <button type="button" className="cancel-btn">
                                취소
                            </button>
                            <button type="submit" className="submit-btn">
                                상품 등록하기
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

//스크롤 상단으로 이동
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;

//로그인 체크
export function loginChk() {
    if (sessionStorage.getItem("tokenType") === null || sessionStorage.getItem("tokenType") === undefined || sessionStorage.getItem("tokenType") === '') {
        alert('로그인 후 사용하실 수 있습니다.');
        window.location.href = "/login";
        return false;
    }else{
        return true;
    }
}

//관리자 체크
export function adminChk() {
    if (sessionStorage.getItem('username') === 'admin') {
        return true;
    }else{
        alert('관리자만 사용하실 수 있습니다.');
        window.location.href = "/";
        return false;
    }
}

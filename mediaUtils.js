// 공식 미디어는 각 URL의 확장자로 판별한다. 개인 blob 파일은 저장된 MIME 정보를 사용한다.
window.MediaUtils = {
    isVideo(source) {
        try {
            return /\.(mp4|webm|mov|m4v|ogv)$/i.test(new URL(String(source || ''), document.baseURI).pathname);
        } catch {
            return false;
        }
    }
};

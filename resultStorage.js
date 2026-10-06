// resultStorage.js
// 시즌(연도+분기)별로 수상 결과를 분리 저장/조회하는 공통 헬퍼

window.ResultStorage = (function () {
    function getSeasonKey() {
        return `anime_awards_result_${SeasonFilter.getSeasonKey()}`;
    }

    function getResults() {
        const raw = localStorage.getItem(getSeasonKey());
        return raw ? JSON.parse(raw) : {};
    }

    function saveResults(resultsObj) {
        localStorage.setItem(getSeasonKey(), JSON.stringify(resultsObj));
    }

    // 특정 상 하나만 업데이트할 때 편하게 쓰는 헬퍼
    function saveOne(awardName, winnerData) {
        const results = getResults();
        results[awardName] = winnerData;
        saveResults(results);
    }

    function clearResults() {
        localStorage.removeItem(getSeasonKey());
    }

    return { getSeasonKey, getResults, saveResults, saveOne, clearResults };
})();

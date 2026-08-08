// seasonFilter.js
// 모든 Nominate 페이지에서 공통으로 사용하는 시즌(연도+분기) 필터 유틸

window.SeasonFilter = (function () {
    function getSelectedSeason() {
        return {
            year: localStorage.getItem("selected_year"),
            quarter: localStorage.getItem("selected_quarter")
        };
    }

    // anime 한 개가 현재 선택된 시즌에 포함되는지 여부
    function isInSeason(anime) {
        const { year, quarter } = getSelectedSeason();
        if (!year || !quarter) return true; // 시즌 미선택 시엔 필터링 안 함 (안전장치)

        if (String(anime.year) !== String(year)) return false;
        if (quarter !== "모든 분기" && anime.quarter !== quarter) return false;
        return true;
    }

    // AnimeList(원본)를 시즌 기준으로 걸러낸 배열
    function filterAnimeList(list) {
        return list.filter(isInSeason);
    }

    // AnimeList에서 시즌에 해당하는 title들만 Set으로 (다른 데이터와 매칭용)
    function getSeasonAnimeTitleSet(animeList) {
        return new Set(filterAnimeList(animeList).map(a => a.title));
    }

    // AnimeList에서 시즌에 해당하는 id들만 Set으로
    function getSeasonAnimeIdSet(animeList) {
        return new Set(filterAnimeList(animeList).map(a => a.id));
    }

    return { getSelectedSeason, isInSeason, filterAnimeList, getSeasonAnimeTitleSet, getSeasonAnimeIdSet };
})();
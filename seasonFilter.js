// seasonFilter.js
// 모든 Nominate 페이지에서 공통으로 사용하는 시즌(연도+분기) 필터 유틸

window.SeasonFilter = (function () {
    // 저장 형식은 배열, 이전의 단일 문자열/쉼표 구분 문자열도 읽는다.
    function getQuarters(value) {
        return [...new Set((Array.isArray(value) ? value : [value])
            .flatMap(q => String(q ?? "").split(/[,，]/))
            .map(q => q.trim().replace(/^Q([1-4])$/, "$1분기"))
            .filter(Boolean))];
    }

    function expandQuarters(list) {
        return list.flatMap(item => {
            const quarters = getQuarters(item.quarter);
            return quarters.length ? quarters.map(quarter => ({ ...item, quarter })) : [item];
        });
    }
    function normalizeSelection(value) {
        const values = getQuarters(value);
        if (values.includes("모든 분기")) return "모든 분기";
        const quarters = ["1분기", "2분기", "3분기", "4분기"].filter(q => values.includes(q));
        return quarters.length === 4 ? "모든 분기" : quarters.join(",");
    }
    function getSelectedSeason() {
        const quarter = normalizeSelection(localStorage.getItem("selected_quarter"));
        return {
            year: localStorage.getItem("selected_year"),
            quarter,
            quarters: quarter === "모든 분기" ? ["1분기", "2분기", "3분기", "4분기"] : getQuarters(quarter),
            label: quarter.replace(/,/g, " · ")
        };
    }
    function matchesQuarter(value) {
        const season = getSelectedSeason();
        return !season.quarter || season.quarter === "모든 분기" ||
            getQuarters(value).some(q => season.quarters.includes(q));
    }
    function showQuarterAccordion() {
        const season = getSelectedSeason();
        return !season.quarter || season.quarters.length > 1;
    }
    function getSeasonKey() {
        const season = getSelectedSeason();
        return `${season.year || "unknown"}_${season.quarter || "unknown"}`;
    }

    // anime 한 개가 현재 선택된 시즌에 포함되는지 여부
    function isInSeason(anime) {
        const { year, quarter } = getSelectedSeason();
        if (!year || !quarter) return true; // 시즌 미선택 시엔 필터링 안 함 (안전장치)

        if (String(anime.year) !== String(year)) return false;
        if (!matchesQuarter(anime.quarter)) return false;
        return true;
    }

    // AnimeList(원본)를 시즌 기준으로 걸러낸 배열
    function filterAnimeList(list) {
        return expandQuarters(list).filter(isInSeason);
    }

    // Flat grids show a candidate only once; accordion grids retain quarter membership.
    function filterUniqueAnimeList(list) {
        const grouped = new Map();
        filterAnimeList(list).forEach(item => {
            const key = item.id == null ? item : String(item.id);
            if (!grouped.has(key)) grouped.set(key, { ...item });
            else {
                const first = grouped.get(key);
                first.quarter = getQuarters([first.quarter, item.quarter]).join(", ");
            }
        });
        return [...grouped.values()];
    }

    // AnimeList에서 시즌에 해당하는 title들만 Set으로 (다른 데이터와 매칭용)
    function getSeasonAnimeTitleSet(animeList) {
        return new Set(filterAnimeList(animeList).map(a => a.title));
    }

    // AnimeList에서 시즌에 해당하는 id들만 Set으로
    function getSeasonAnimeIdSet(animeList) {
        return new Set(filterAnimeList(animeList).map(a => a.id));
    }

    const TOP3_NAMES = ["대상", "최우수상", "우수상"];

    function toDisplayAwardName(rawName) {
        if (!rawName) return rawName;
        if (rawName.includes("신인")) return rawName; // 신인 부문은 원본 유지

        const { quarter, label } = getSelectedSeason();
        if (!quarter || quarter === "모든 분기") return rawName;

        // ✅ 추가: top3(대상/최우수상/우수상)는 "베스트" 없이 [분기] [이름] 형식
        if (TOP3_NAMES.includes(rawName)) {
            return `${label} ${rawName}`;
        }

        let core = rawName;
        if (core.startsWith("올해의 ")) {
            core = core.slice("올해의 ".length);
        } else if (core.startsWith("베스트 ")) {
            core = core.slice("베스트 ".length);
        }

        return `${label} 베스트 ${core}`;
    }

    return { 
        normalizeSelection, matchesQuarter, showQuarterAccordion, getSeasonKey, filterUniqueAnimeList,
            getQuarters,
            expandQuarters,
        getSelectedSeason, 
        isInSeason, 
        filterAnimeList, 
        getSeasonAnimeTitleSet, 
        getSeasonAnimeIdSet,
        toDisplayAwardName
    };
})();

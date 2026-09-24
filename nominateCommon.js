/**
 * AnimeAwards - Nominate 공통 기능
 *
 * 현재는 공통화가 확실한 기능만 담당한다.
 * 후보 생성/선택/렌더링 등 페이지별 도메인 로직은 각 Nominate JS에 남긴다.
 */
(function (global) {
    let cachedVoteData = null;
    let firebaseRetryTimer = null;

    function fireConfetti() {
        const canvas = document.getElementById("confettiCanvas");
        if (!canvas || typeof global.confetti !== "function") {
            console.warn("[NominateCommon] confetti 실행 대상 또는 라이브러리가 없습니다.");
            return;
        }

        try {
            const myConfetti = global.confetti.create(canvas, {
                resize: true,
                useWorker: true
            });
            const animationEnd = Date.now() + 3000;

            (function frame() {
                if (Date.now() >= animationEnd) return;

                myConfetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ["#d4af37", "#ffffff", "#aa8a2e"]
                });
                myConfetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ["#d4af37", "#ffffff", "#aa8a2e"]
                });

                requestAnimationFrame(frame);
            }());
        } catch (error) {
            console.error("[NominateCommon] confetti 실행 실패:", error);
        }
    }

    function applyVoteBadges() {
        if (!cachedVoteData) return;

        const total = cachedVoteData._participants || 0;

        document.querySelectorAll('.card').forEach(card => {
            const animeId = card.getAttribute('data-anime-id');
            const rateBadge = card.querySelector('.card-selection-rate');
            if (!rateBadge || !animeId) return;

            const count = cachedVoteData[animeId] || 0;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            rateBadge.innerText = `${percent}%`;
            rateBadge.style.display = "block";
        });
    }

    function listenToVoteRates(awardName) {
        if (!global.fbOnValue || !global.fbDB) return false;
        if (!global.fbRef || !global.getVotesCategoryPath) return false;
        if (!awardName) return false;

        const categoryRef = global.fbRef(
            global.fbDB,
            global.getVotesCategoryPath(awardName)
        );

        global.fbOnValue(categoryRef, (snapshot) => {
            cachedVoteData = snapshot.val() || {};
            applyVoteBadges();
        });

        return true;
    }

    function waitForFirebaseAndListen(awardNameGetter) {
        if (firebaseRetryTimer) {
            clearTimeout(firebaseRetryTimer);
            firebaseRetryTimer = null;
        }

        const awardName = typeof awardNameGetter === 'function'
            ? awardNameGetter()
            : awardNameGetter;

        if (listenToVoteRates(awardName)) return;

        firebaseRetryTimer = setTimeout(() => {
            waitForFirebaseAndListen(awardNameGetter);
        }, 300);
    }

    global.NominateCommon = {
        fireConfetti,
        applyVoteBadges,
        listenToVoteRates,
        waitForFirebaseAndListen
    };
})(window);

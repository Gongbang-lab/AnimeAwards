(function (global) {
    let cachedVoteData = null;
    let firebaseRetryTimer = null;

    function fireConfetti() {
        const canvas = document.getElementById("confettiCanvas");
        if (!canvas || typeof global.confetti !== "function") {
            // cinemaNominate historically used the document-level confetti API.
            // Keep a fallback so pages without a dedicated canvas still celebrate.
            if (typeof global.confetti === "function") {
                const duration = 3000;
                const end = Date.now() + duration;
                (function frame() {
                    global.confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, zIndex: 9999, colors: ["#d4af37", "#ffffff"] });
                    global.confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, zIndex: 9999, colors: ["#d4af37", "#ffffff"] });
                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
            }
            return;
        }

        try {
            const myConfetti = global.confetti.create(canvas, { resize: true, useWorker: true });
            const animationEnd = Date.now() + 3000;
            (function frame() {
                if (Date.now() >= animationEnd) return;
                myConfetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: ["#d4af37", "#ffffff", "#aa8a2e"] });
                myConfetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: ["#d4af37", "#ffffff", "#aa8a2e"] });
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
            const identifier = card.getAttribute('data-anime-id');
            const rateBadge = card.querySelector('.card-selection-rate');
            if (!rateBadge || !identifier) return;
            const count = cachedVoteData[identifier] || 0;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            rateBadge.innerText = `${percent}%`;
            rateBadge.style.display = "block";
        });
    }

    function listenToVoteRates(awardName) {
        if (!global.fbOnValue || !global.fbDB || !global.fbRef || !global.getVotesCategoryPath) return;
        const categoryRef = global.fbRef(global.fbDB, global.getVotesCategoryPath(awardName));
        global.fbOnValue(categoryRef, (snapshot) => {
            cachedVoteData = snapshot.val() || {};
            applyVoteBadges();
        });
    }

    function waitForFirebaseAndListen(awardNameGetter) {
        if (global.fbOnValue && global.fbDB && global.fbRef && global.getVotesCategoryPath) {
            if (firebaseRetryTimer) clearTimeout(firebaseRetryTimer);
            listenToVoteRates(awardNameGetter());
            return;
        }
        firebaseRetryTimer = setTimeout(() => waitForFirebaseAndListen(awardNameGetter), 300);
    }

    global.NominateCommon = {
        fireConfetti,
        applyVoteBadges,
        listenToVoteRates,
        waitForFirebaseAndListen
    };
})(window);

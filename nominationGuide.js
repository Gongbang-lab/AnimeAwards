(function () {
    const guides = {
        meme: {
            title: '밈 선정 안내',
            items: [
                '밈을 선택해주세요.',
                '추가하고 싶은 밈이 있다면 직접 추가해주세요.',
                '현재 내 시상식에만 추가됩니다. 파일은 공개되지 않고 현재 이 브라우저에만 저장됩니다.'
            ]
        },
        pv: {
            title: '설레발상 선정 안내',
            items: [
                'PV와 원작으로 기대했지만, 막상 보니 아쉬웠던 작품을 골라주세요!',
                '작품 이미지 우측 상단의 ‘PV 보기’를 누르면 PV 목록을 확인할 수 있습니다. 썸네일을 누르면 유튜브로 이동합니다.',
                '후보를 1개 이상 선택한 뒤, 다음 단계에서 최종 수상작을 결정해 주세요.'
            ]
        },
        ost: {
            title: 'OST 선정 안내',
            items: [
                '앨범 이미지 우측 상단의 ‘듣기’를 누르면 OST 트랙 목록을 확인할 수 있습니다.',
                '‘아이튠즈로 이동’을 누르면 해당 트랙의 페이지가 열립니다. 유료 구독을 하지 않은 경우 30초 미리듣기만 가능합니다.',
                '‘유튜브로 이동’은 검색 결과로 연결되므로 정확한 곡이 나오지 않을 수 있습니다. 곡명과 작품명을 확인해 주세요.',
                '감상한 뒤 마음에 드는 작품을 후보로 선택하고, 다음 단계에서 최종 수상작을 결정해 주세요.'
            ]
        },
        voice: {
            title: '성우상 선정 안내',
            items: [
                '성우 이미지 우측 상단의 ‘작품’을 누르면 참여 작품과 담당 캐릭터를 확인할 수 있습니다.',
                '배역을 살펴본 뒤 후보를 선택하고, 다음 단계에서 최종 수상자를 결정해 주세요.'
            ]
        },
        couple: {
            title: '베스트 커플상 선정 안내',
            items: [
                '애니메이션 제목 카드를 누르면 캐릭터 선택창이 열립니다.',
                '커플로 선정할 캐릭터 두 명을 선택한 뒤 ‘후보 등록’을 눌러 주세요.',
                '첫 커플을 등록하면 작품 목록이 오른쪽 사이드바로 이동합니다. 다른 커플도 이어서 등록할 수 있습니다.',
                '등록한 커플 중 최종 수상 커플을 선택해 주세요.'
            ]
        },
        director: {
            title: '감독상 선정 안내',
            items: [
                '감독 이미지 우측 상단의 ‘작품’을 누르면 해당 감독의 참여 작품을 확인할 수 있습니다.',
                '작품 목록을 살펴본 뒤 후보를 선택하고, 다음 단계에서 최종 수상자를 결정해 주세요.'
            ]
        },
        top3: {
            title: '올해의 시리즈상 선정 안내',
            items: [
                '먼저 후보 작품을 3개 이상 선택한 뒤 ‘후보 확정’을 눌러 주세요.',
                '다음 단계에서 우수상 → 최우수상 → 대상 순서로 서로 다른 세 작품을 선택해 주세요.',
                '결과를 저장한 뒤에도 메인 화면에서 각 상을 눌러 수상작을 변경할 수 있습니다.'
            ]
        }
    };
    const pageKeys = {
        ostnominate: 'ost', cvnominate: 'voice', bestcouplenominate: 'couple',
        directornominate: 'director', top3nominate: 'top3', memenominate: 'meme'
    };

    function showGuide() {
        const page = location.pathname.split('/').pop().replace(/\.html$/i, '').toLowerCase();
        const params = new URLSearchParams(location.search);
        const key = page === 'nominate' && params.get('awardName') === '올해의 설레발 상'
            ? 'pv' : pageKeys[page];
        const guide = guides[key];
        if (!guide) return;
        const storageKey = `anime_awards_hide_guide_v1_${key}`;
        try { if (localStorage.getItem(storageKey) === '1') return; } catch { /* 저장 불가 시 안내는 표시한다. */ }

        const dialog = document.createElement('dialog');
        dialog.className = 'nomination-guide';
        dialog.setAttribute('aria-labelledby', 'nomination-guide-title');
        const title = document.createElement('h2');
        title.id = 'nomination-guide-title';
        title.textContent = guide.title;
        const list = document.createElement('ul');
        guide.items.forEach(text => {
            const item = document.createElement('li');
            item.textContent = text;
            list.appendChild(item);
        });
        const label = document.createElement('label');
        label.className = 'nomination-guide-preference';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        label.append(checkbox, document.createTextNode('다음부터 표시하지 않기'));
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nomination-guide-confirm';
        button.textContent = '확인하고 시작하기';
        button.autofocus = true;
        dialog.append(title, list, label, button);
        document.body.appendChild(dialog);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        button.addEventListener('click', () => {
            if (checkbox.checked) {
                try { localStorage.setItem(storageKey, '1'); } catch { /* 안내 확인은 저장 실패와 무관하게 가능하다. */ }
            }
            dialog.close();
        });
        dialog.addEventListener('close', () => {
            document.body.style.overflow = previousOverflow;
            dialog.remove();
        }, { once: true });
        dialog.showModal();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showGuide, { once: true });
    else showGuide();
})();

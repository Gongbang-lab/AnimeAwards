// 목록/용량 계산은 metadata만 읽고 파일은 ID로 한 건씩 읽는다.
window.PersonalMemeStorage = (() => {
    const LIMIT = 1024 * 1024 * 1024;
    const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    function open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('AnimeAwardsPersonalMemes', 2);
            let blocked = false;
            request.onupgradeneeded = () => {
                const db = request.result;
                const metadata = db.createObjectStore('metadata', { keyPath: 'id' });
                const files = db.createObjectStore('files', { keyPath: 'id' });
                // 기존 데이터는 한 건씩 이전. 실패하면 업그레이드 전체가 롤백된다.
                if (db.objectStoreNames.contains('memes')) {
                    request.transaction.objectStore('memes').openCursor().onsuccess = event => {
                        const cursor = event.target.result;
                        if (!cursor) { db.deleteObjectStore('memes'); return; }
                        const { file, ...record } = cursor.value;
                        metadata.put({ ...record, size: file.size });
                        files.put({ id: record.id, file });
                        cursor.continue();
                    };
                }
            };
            request.onerror = () => reject(request.error);
            request.onblocked = () => { blocked = true; reject(new Error('다른 시상식 탭을 닫은 후 새로고침해주세요.')); };
            request.onsuccess = () => {
                const db = request.result;
                if (blocked) { db.close(); return; }
                db.onversionchange = () => db.close();
                resolve(db);
            };
        });
    }
    async function transaction(stores, mode, action) {
        const db = await open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(stores, mode);
            let result, failure;
            tx.oncomplete = () => { db.close(); resolve(result); };
            tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('저장에 실패했습니다.')); };
            try { action(tx, value => { result = value; }, error => { failure = error; tx.abort(); }); }
            catch (error) { failure = error; tx.abort(); }
        });
    }
    const all = () => transaction(['metadata'], 'readonly', (tx, done) => {
        tx.objectStore('metadata').getAll().onsuccess = e => done(e.target.result);
    });
    const get = id => transaction(['metadata', 'files'], 'readonly', (tx, done) => {
        tx.objectStore('metadata').get(id).onsuccess = e => {
            const record = e.target.result;
            if (!record) { done(undefined); return; }
            tx.objectStore('files').get(id).onsuccess = f => done(f.target.result ? { ...record, file: f.target.result.file } : undefined);
        };
    });
    async function makeVideoPoster(file) {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.muted = true;
        video.preload = 'auto';
        try {
            await new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('thumbnail timeout')), 10000);
                video.onloadeddata = () => { clearTimeout(timer); resolve(); };
                video.onerror = () => { clearTimeout(timer); reject(new Error('thumbnail decode failed')); };
                video.src = url;
            });
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 480 / Math.max(video.videoWidth, video.videoHeight));
            canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
            canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.75);
        } catch {
            return '';
        } finally {
            video.removeAttribute('src');
            video.load();
            URL.revokeObjectURL(url);
        }
    }
    async function save(record) {
        if (!record.name.trim() || !record.origin.trim()) throw new Error('이름과 애니메이션 이름을 입력해주세요.');
        if (!/^[1-4]분기$/.test(record.quarter)) {
            throw new Error('분기를 선택해주세요.');
        }
        const { file, ...fields } = record;
        if (file && (!(file instanceof Blob) || !file.size || !TYPES.includes(file.type))) {
            throw new Error('JPG, PNG, WebP, GIF 이미지 또는 MP4, WebM 영상을 선택해주세요.');
        }
        const poster = file?.type.startsWith('video/') ? await makeVideoPoster(file) : '';
        return transaction(['metadata', 'files'], 'readwrite', (tx, done, fail) => {
            const metadata = tx.objectStore('metadata');
            metadata.getAll().onsuccess = e => {
                const previous = e.target.result.find(item => item.id === record.id);
                if (!file && !previous) return fail(new Error('이미지 또는 영상 파일을 선택해주세요.'));
                const size = file ? file.size : previous.size;
                const used = e.target.result.reduce((sum, item) => sum + (item.id === record.id ? 0 : item.size), 0);
                if (used + size > LIMIT) return fail(new Error('개인 밈 전체 저장 한도 1GB를 초과합니다. 기존 파일을 삭제하거나 작은 파일을 선택해주세요.'));
                metadata.put({ ...fields, size, poster: file ? poster : previous?.poster || '', type: file ? (file.type.startsWith('video/') ? 'video' : 'image') : previous.type });
                if (file) tx.objectStore('files').put({ id: record.id, file });
                done(record.id);
            };
        });
    }
    const remove = id => transaction(['metadata', 'files'], 'readwrite', tx => {
        tx.objectStore('metadata').delete(id);
        tx.objectStore('files').delete(id);
    });
    return { LIMIT, all, get, save, remove };
})();

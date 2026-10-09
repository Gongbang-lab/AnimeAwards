// Shared by the browser and the trusted vote catalog builder.
function buildSongBundles(groups, anime, year, selection, type) {
    const quarters = value => [...new Set((Array.isArray(value) ? value : [value])
        .flatMap(v => String(v || '').split(/[,，]/)).map(v => v.trim().replace(/^Q([1-4])$/, '$1분기'))
        .filter(v => /^[1-4]분기$/.test(v)))];
    const all = !selection || selection === '모든 분기';
    const selected = quarters(selection);
    const works = new Map(anime.map(a => [String(a.id), a]));
    const result = new Map();
    for (const group of groups) {
        if (String(group.year) !== String(year)) continue;
        const work = works.get(String(group.id));
        for (const song of group.songs || []) {
            if (String(song.type).toLowerCase() !== type || !String(song.title || '').trim()) continue;
            const inherited = quarters(group.quarter || work?.quarter);
            // Multi-quarter legacy tracks require a manual assignment; never guess their airing quarter.
            const used = Object.hasOwn(song, 'quarter') ? quarters(song.quarter) : inherited.length === 1 ? inherited : [];
            if (!all && !used.some(q => selected.includes(q))) continue;
            const key = `songbundle:${year}:${group.id}:${type}`;
            if (!result.has(key)) result.set(key, {
                uniqueId: key, candidateId: key, id: group.id, songBundle: true,
                animeTitle: work?.title || group.animeTitle || `작품 ID ${group.id}`,
                title: work?.title || group.animeTitle || `작품 ID ${group.id}`,
                thumbnail: work?.thumbnail || 'image/no-image.svg', day: work?.day || group.day || '기타',
                tracks: [], quarters: []
            });
            const bundle = result.get(key);
            const duplicate = bundle.tracks.find(t => t.title === song.title && t.artist === (song.artist || '') && t.youtube === (song.youtube || ''));
            if (duplicate) duplicate.quarter = [...new Set([...duplicate.quarter, ...used])];
            else bundle.tracks.push({ title: song.title, artist: song.artist || '', youtube: song.youtube || '', quarter: used });
            bundle.quarters = [...new Set([...bundle.quarters, ...used.filter(q => all || selected.includes(q))])].sort();
        }
    }
    return [...result.values()].map(b => ({ ...b, artist: [...new Set(b.tracks.map(t => t.artist).filter(Boolean))].join(', '),
        displayQuarter: b.quarters.join(', '), youtube: b.tracks[0]?.youtube || '' }));
}
if (typeof module !== 'undefined') module.exports = { buildSongBundles };

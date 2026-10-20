#!/usr/bin/env node
'use strict';

// No dependencies or network requests. Data files are never rewritten.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const DATASETS = [
  ['animeData','AnimeCatalog','array'], ['animeCharacterData','CharacterData','array'],
  ['animeCVData','CharacterVoiceData','array'], ['animeSongsData','AnimeSongs','array'],
  ['animeOSTData','animeOSTData','array'], ['animeStudioData','AnimeStudioData','array'],
  ['animeDirectorData','animeDirectorData','array'], ['animeAdaptorData','AnimeAdaptorData','array'],
  ['animescriptwriterData','scriptwriterData','array'], ['animeRookieCVData','RookieCVData','object'],
  ['animeEPData','animeEPData','object'], ['animeMemeData','AnimeMemeData','array']
];
const SKIP = new Set(['.git','node_modules','reports','_site','dist','build','.cache-thumbnail-tools']);
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = v => typeof v === 'string' && v.trim() !== '';
const id = v => /^[1-9]\d*$/.test(String(v ?? ''));
const posix = v => v.split(path.sep).join('/');
const quarters = v => (Array.isArray(v) ? v : [v]).flatMap(q => String(q ?? '').split(/[,，]/)).map(q => q.trim()).filter(Boolean);

function validateProject({ root = path.resolve(__dirname,'..'), years, relationshipsOnly = false } = {}) {
  root = path.resolve(root);
  const issues = [], stats = { years: [], datasets: 0, references: 0, assets: 0 };
  const add = level => (code,message,file='',context='') => issues.push({ level,code,message,file:posix(file),context });
  const error=add('error'), warning=add('warning'), info=add('info');
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
      if (SKIP.has(e.name)) continue;
      const full=path.join(dir,e.name);
      if (e.isSymbolicLink()) warning('SYMLINK','심볼릭 링크는 배포 대상에서 제외하세요.',path.relative(root,full));
      else if (e.isDirectory()) walk(full);
      else if (e.isFile()) files.push(posix(path.relative(root,full)));
    }
  }
  walk(root);
  const exact=new Set(files), folded=new Map(), sources=new Map();
  files.forEach(f => { const k=f.normalize('NFC').toLowerCase(); if(!folded.has(k))folded.set(k,[]); folded.get(k).push(f); });
  const read = f => { if(!sources.has(f))sources.set(f,fs.readFileSync(path.join(root,f),'utf8')); return sources.get(f); };
  function evaluate(file,variable) {
    if(!exact.has(file)){ error('DATA_FILE_MISSING',`필수 파일이 없습니다: ${file}`,file); return; }
    try {
      const ctx=vm.createContext(Object.create(null),{codeGeneration:{strings:false,wasm:false}});
      new vm.Script(read(file),{filename:file}).runInContext(ctx,{timeout:1500});
      const value=new vm.Script(`typeof ${variable} === 'undefined' ? undefined : ${variable}`).runInContext(ctx,{timeout:100});
      if(value===undefined)error('DATA_VARIABLE',`${variable} 선언이 없습니다. 연도와 변수명을 확인하세요.`,file);
      return value;
    } catch(e){ error('DATA_JS_ERROR',e.message,file); }
  }
  const published=evaluate('data/manifest.js','AvailableYears');
  const manifestYears=Array.isArray(published)?published.map(Number):[];
  const validYear=y=>Number.isInteger(y)&&y>=2000&&y<=2200;
  if(!manifestYears.length||manifestYears.some(y=>!validYear(y))||new Set(manifestYears).size!==manifestYears.length)
    error('MANIFEST_INVALID','AvailableYears는 중복 없는 연도 배열이어야 합니다.','data/manifest.js');
  const selected=years?[...new Set(years.map(Number))]:manifestYears;
  if(selected.some(y=>!validYear(y)))error('YEAR_INVALID','연도는 2000~2200 사이의 정수여야 합니다.');
  let policy={optionalPortraitFields:['cvimg','director_img'],missingAssets:[]};
  const policyFile='dataCollector/validation-policy.json';
  if(exact.has(policyFile))try{
    policy=JSON.parse(read(policyFile));
    if(!Array.isArray(policy.optionalPortraitFields)||!Array.isArray(policy.missingAssets)||policy.missingAssets.some(e=>!object(e)||!text(e.path)||!text(e.reason)))throw new Error('예외에는 path와 reason이 필요합니다.');
  }catch(e){error('POLICY_INVALID',e.message,policyFile);policy={optionalPortraitFields:[],missingAssets:[]};}
  const exceptions=new Map(policy.missingAssets.map(e=>[e.path,e.reason]));
  const portraits=new Set(policy.optionalPortraitFields), assetSeen=new Set();
  function asset(raw,file,context,{base='',optional=false}={}){
    if(!text(raw)||/^(?:https?:\/\/|\/\/|data:)/i.test(raw))return;
    if(raw.includes('${')||raw.includes('{{'))return; // Runtime template, not a literal file reference.
    if(/^(?:blob:|javascript:|file:)/i.test(raw)){error('ASSET_PROTOCOL',`배포에 사용할 수 없는 경로: ${raw}`,file,context);return;}
    let clean;
    try{clean=decodeURIComponent(raw.split(/[?#]/)[0]);}catch{error('ASSET_ENCODING',`경로 인코딩 오류: ${raw}`,file,context);return;}
    if(!clean||clean.startsWith('#'))return;
    if(clean.includes('\\')){error('ASSET_SEPARATOR',`웹 경로에는 /를 사용하세요: ${raw}`,file,context);return;}
    const target=path.posix.normalize(path.posix.join(clean.startsWith('/')?'':base,clean.replace(/^\//,'')));
    if(target==='..'||target.startsWith('../')||path.isAbsolute(target)||/^[A-Za-z]:/.test(target)){error('ASSET_OUTSIDE_ROOT',`프로젝트 바깥 경로: ${raw}`,file,context);return;}
    const key=`${file}\n${target}\n${optional}`;
    if(assetSeen.has(key))return; assetSeen.add(key);stats.assets++;
    if(exact.has(target))return;
    const match=folded.get(target.normalize('NFC').toLowerCase());
    if(match)(optional?warning:error)('ASSET_CASE',`파일명 대소문자/유니코드 불일치: ${target} → ${match.join(', ')}`,file,context);
    else if(exceptions.has(target))info('ASSET_EXCEPTION',`${target}: ${exceptions.get(target)}`,file,context);
    else (optional?warning:error)(optional?'PORTRAIT_MISSING':'ASSET_MISSING',`실제 파일이 없습니다: ${target}`,file,context);
  }
  function media(value,file,at='',field=''){
    if(Array.isArray(value))return value.forEach((v,i)=>media(v,file,`${at}[${i}]`,field));
    if(object(value))return Object.entries(value).forEach(([k,v])=>media(v,file,at?`${at}.${k}`:k,k));
    if(!text(value))return;
    if(/^(?:thumbnail|thumb|img|cvimg|director_img|studio_img|image|charimg|poster|src\d*)$/.test(field))asset(value,file,at,{optional:portraits.has(field)});
    else if(/^(?:url|youtube|youtube_url|itunes_url)$/.test(field)){
      try{if(!['http:','https:'].includes(new URL(value).protocol))throw new Error();}
      catch{error('URL_INVALID',`http(s) URL 형식을 확인하세요: ${value}`,file,at);}
    }
  }
  function array(value,file,at){if(Array.isArray(value))return value;error('ARRAY_REQUIRED',`${at}는 배열이어야 합니다.`,file,at);return [];}
  function unique(rows,keyOf,file,code){const seen=new Set();rows.forEach((r,i)=>{const k=keyOf(r);if(k==null)return;if(seen.has(k))error(code,`중복 식별자: ${k}`,file,`[${i}]`);seen.add(k);});}
  function quarter(value,file,at){const qs=quarters(value);if(!qs.length)warning('QUARTER_MISSING','분기가 비어 있습니다.',file,at);else if(qs.some(q=>!/^[1-4]분기$/.test(q)))error('QUARTER_INVALID',`분기 형식 오류: ${qs.join(', ')}`,file,at);return [...new Set(qs)];}
  for(const year of selected.filter(validYear)){
    stats.years.push(year);
    if(!manifestYears.includes(year))warning('YEAR_NOT_PUBLISHED',`${year}년은 공개 연도 목록에 없습니다.`,'data/manifest.js');
    const data=new Map(),fileFor=suffix=>`data/${year}/${year}${suffix}.js`;
    for(const [suffix,prefix,type]of DATASETS){
      if(relationshipsOnly&&!['animeData','animeCharacterData','animeCVData'].includes(suffix))continue;
      const f=fileFor(suffix),v=evaluate(f,`${prefix}_${year}`);
      if(v===undefined)continue;
      if(!(type==='array'?Array.isArray(v):object(v))){error('DATA_SHAPE',`${prefix}_${year}는 ${type==='array'?'배열':'객체'}여야 합니다.`,f);continue;}
      data.set(suffix,v);stats.datasets++;if(!relationshipsOnly)media(v,f);
    }
    const catalog=data.get('animeData')||[], chars=data.get('animeCharacterData')||[], voices=data.get('animeCVData')||[];
    const animeIds=new Set(), titles=new Set(), idQuarters=new Set(),cvIds=new Set(),pairs=new Set();
    catalog.forEach((a,i)=>{
      const f=fileFor('animeData'),at=`[${i}]`;
      if(!object(a))return error('ANIME_OBJECT','작품은 객체여야 합니다.',f,at);
      if(!id(a.id))error('ANIME_ID',`유효하지 않은 작품 ID: ${a.id}`,f,at);
      animeIds.add(String(a.id));titles.add(a.title);
      if(!text(a.title))error('ANIME_TITLE','작품 제목이 없습니다.',f,at);
      if(Number(a.year)!==year)error('YEAR_MISMATCH',`작품 ${a.id}: year=${a.year}, 파일 연도=${year}`,f,at);
      if(!text(a.thumbnail))error('ANIME_POSTER',`작품 ${a.id}: 포스터 경로가 없습니다.`,f,at);
      for(const q of quarter(a.quarter,f,at)){const k=`${a.id}:${q}`;if(idQuarters.has(k))error('ANIME_DUPLICATE',`동일 작품·분기 중복: ${k}`,f,at);idQuarters.add(k);}
      if(!['Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays','Sundays','Anomaly','Web','Cinema','Unknown'].includes(a.day))warning('ANIME_DAY',`요일/극장판 구분 확인: ${a.day}`,f,at);
      array(a.pv??[],f,`${at}.pv`).forEach((p,n)=>{if(!object(p))error('PV_OBJECT','PV는 title과 url을 가진 객체여야 합니다.',f,`${at}.pv[${n}]`);});
    });
    unique(voices.filter(object),v=>String(v.id),fileFor('animeCVData'),'CV_DUPLICATE');
    voices.forEach((v,i)=>{if(!object(v)||!id(v.id)||!text(v.name))error('CV_SHAPE','성우는 유효한 id와 name이 필요합니다.',fileFor('animeCVData'),`[${i}]`);else cvIds.add(String(v.id));});
    chars.forEach((g,i)=>{
      const f=fileFor('animeCharacterData'),at=`[${i}]`;
      if(!object(g))return error('CHARACTER_GROUP','캐릭터 작품 항목은 객체여야 합니다.',f,at);
      if(!animeIds.has(String(g.id)))error('CHARACTER_ANIME_ORPHAN',`작품 ID ${g.id}가 기본 데이터에 없습니다.`,f,at);
      array(g.characters,f,`${at}.characters`).forEach((c,j)=>{
        const loc=`${at}.characters[${j}]`;
        if(!object(c)||!id(c.characterId)||!text(c.name))return error('CHARACTER_SHAPE','캐릭터는 characterId와 name이 필요합니다.',f,loc);
        const k=`${g.id}:${c.characterId}`;if(pairs.has(k))error('CHARACTER_PAIR_DUPLICATE',`동일 작품·캐릭터 중복: ${k}`,f,loc);pairs.add(k);stats.references++;
        if(!cvIds.has(String(c.cvId)))error('CHARACTER_CV_ORPHAN',`성우 ID ${c.cvId}가 성우 데이터에 없습니다.`,f,loc);
      });
    });
    if(relationshipsOnly)continue;
    function linked(suffix,{allowRepeatedId=false}={}){
      const rows=data.get(suffix)||[],f=fileFor(suffix);if(!allowRepeatedId)unique(rows.filter(object),r=>String(r.id),f,'WORK_DUPLICATE');
      rows.forEach((r,i)=>{if(!object(r))return error('WORK_OBJECT','작품 데이터는 객체여야 합니다.',f,`[${i}]`);if(!animeIds.has(String(r.id)))error('WORK_ORPHAN',`작품 ID ${r.id}가 기본 데이터에 없습니다.`,f,`[${i}]`);if(r.year!=null&&Number(r.year)!==year)error('YEAR_MISMATCH',`작품 ${r.id}: year=${r.year}, 파일 연도=${year}`,f,`[${i}]`);});return rows.filter(object);
    }
    ['animeAdaptorData','animescriptwriterData'].forEach(suffix=>linked(suffix));
    for(const g of linked('animeSongsData',{allowRepeatedId:true}))array(g.songs,fileFor('animeSongsData'),`ID ${g.id}.songs`).forEach((s,i)=>{
      const f=fileFor('animeSongsData'),at=`ID ${g.id}.songs[${i}]`;
      if(!object(s)||!['op','ed','ost'].includes(String(s.type).toLowerCase()))return error('SONG_SHAPE','곡 type과 객체 형식을 확인하세요.',f,at);
      if(!text(s.title)&&!text(s.youtube))return; // Intentional empty placeholders.
      const qs=Object.hasOwn(s,'quarter')?quarters(s.quarter):quarters(g.quarter);
      if(!qs.length||(!Object.hasOwn(s,'quarter')&&qs.length>1))warning('SONG_QUARTER_UNCONFIRMED','곡의 사용 분기를 지정해주세요. 단일 분기 시상식에서 제외될 수 있습니다.',f,at);
      if(qs.some(q=>!/^[1-4]분기$/.test(q)))error('SONG_QUARTER_INVALID','곡 분기 형식 오류',f,at);
    });
    for(const w of linked('animeOSTData')){
      const f=fileFor('animeOSTData'),seen=new Set();
      array(w.albums,f,`ID ${w.id}.albums`).forEach((al,n)=>{
        const at=`ID ${w.id}.albums[${n}]`;
        if(!object(al))return error('OST_ALBUM','앨범은 객체여야 합니다.',f,at);
        if(al.collection_id&&seen.has(String(al.collection_id)))error('OST_ALBUM_DUPLICATE',`collection_id 중복: ${al.collection_id}`,f,at);if(al.collection_id)seen.add(String(al.collection_id));
        const slots=new Set();array(al.discs,f,`${at}.discs`).forEach(d=>{
          if(!object(d))return error('OST_DISC','디스크는 객체여야 합니다.',f,at);
          array(d.tracks,f,`${at}.tracks`).forEach(t=>{if(!object(t)||!text(t.title))return error('OST_TRACK','트랙 title이 없습니다.',f,at);const k=`${d.disc}:${t.track_no}`;if(slots.has(k))error('OST_TRACK_DUPLICATE',`디스크·트랙 번호 중복: ${k}`,f,at);slots.add(k);});
        });
      });
    }
    for(const suffix of ['animeDirectorData','animeStudioData'])(data.get(suffix)||[]).forEach((p,i)=>{
      const f=fileFor(suffix);if(!object(p))return error('STAFF_SHAPE','제작진은 객체여야 합니다.',f,`[${i}]`);
      array(p.works,f,`[${i}].works`).forEach((w,n)=>{const at=`[${i}].works[${n}]`;if(!object(w))return error('STAFF_WORK','참여 작품은 객체여야 합니다.',f,at);if(!titles.has(w.title))warning('STAFF_TITLE_UNMATCHED',`기본 데이터와 다른 작품명: ${w.title}`,f,at);if(w.year!=null&&Number(w.year)!==year)error('YEAR_MISMATCH',`참여 작품 ${w.title}: year=${w.year}, 파일 연도=${year}`,f,at);});
    });
    for(const [animeId,rows]of Object.entries(data.get('animeEPData')||{})){
      const f=fileFor('animeEPData');if(!animeIds.has(animeId))error('EP_ORPHAN',`작품 ID ${animeId}가 기본 데이터에 없습니다.`,f,animeId);
      const list=array(rows,f,animeId),episodeKeys=new Set(),episodeNumbers=new Set();
      list.forEach((e,i)=>{
        const at=`${animeId}[${i}]`;
        if(!object(e)||!text(String(e['episode no']??'')))return error('EP_FIELDS','에피소드 회차가 필요합니다.',f,at);
        const number=String(e['episode no']).normalize('NFKC').replace(/\s/g,''),key=JSON.stringify([number,e['episode title']??'']);
        if(episodeKeys.has(key))error('EP_DUPLICATE',`동일 회차·제목 중복: ${e['episode no']} / ${e['episode title']??''}`,f,at);
        else if(episodeNumbers.has(number))warning('EP_NUMBER_REUSED',`같은 회차에 다른 제목이 있습니다. 막/단편 구분인지 확인하세요: ${e['episode no']}`,f,at);
        episodeKeys.add(key);episodeNumbers.add(number);
        if(!text(e['episode title']))warning('EP_TITLE_EMPTY','제목 미등록: 회차만 표시됩니다.',f,at);
      });
    }
    const memes=data.get('animeMemeData')||[];unique(memes.filter(object),m=>String(m.id),fileFor('animeMemeData'),'MEME_DUPLICATE');
    memes.forEach((m,i)=>{const f=fileFor('animeMemeData');if(!object(m))return error('MEME_SHAPE','밈은 객체여야 합니다.',f,`[${i}]`);if(Number(m.year)!==year)error('YEAR_MISMATCH',`밈 ${m.id}: year=${m.year}, 파일 연도=${year}`,f,`[${i}]`);quarter(m.quarter,f,`[${i}]`);if(!Object.entries(m).some(([k,v])=>/^src\d*$/.test(k)&&text(v)))warning('MEME_SOURCE','밈 미디어가 없습니다.',f,`[${i}]`);});
    const ranks=new Set();Object.values(data.get('animeRookieCVData')||{}).forEach((r,i)=>{
      const f=fileFor('animeRookieCVData');if(!object(r)||!text(r.name))return error('ROOKIE_SHAPE','루키 name이 필요합니다.',f,`[${i}]`);
      array(r.characters,f,`${r.name}.characters`);if(r.rank!=null){if(ranks.has(String(r.rank)))error('ROOKIE_RANK',`순위 중복: ${r.rank}`,f,r.name);ranks.add(String(r.rank));}
      if(object(r.scoreBreakdown)&&Number.isFinite(r.score)){const sum=Object.values(r.scoreBreakdown).reduce((s,v)=>s+Number(v||0),0);if(Math.abs(sum-r.score)>.01)error('ROOKIE_SCORE',`score=${r.score}, 항목 합계=${sum}`,f,r.name);}
    });
  }
  if(!relationshipsOnly){
    const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(m=>[m[1].toLowerCase(),m[3]]));
    for(const file of files.filter(f=>/\.(?:html|js|css)$/.test(f))){
      const src=read(file),base=path.posix.dirname(file);
      if(file.endsWith('.js'))try{new vm.Script(src,{filename:file});}catch(e){
        const mod=/\b(?:import|export)\b/.test(src)&&spawnSync(process.execPath,['--input-type=module','--check'],{input:src,encoding:'utf8',timeout:5000});
        if(!mod||mod.status!==0)error('JS_SYNTAX',e.message,file);
      }
      if(file.endsWith('.html')){
        for(const tag of src.matchAll(/<(?:script|link|img)\b([^>]*)>/gi)){
          const a=attrs(tag[1]);
          if(Object.hasOwn(a,'data-collector-data')&&!DATASETS.some(([suffix])=>suffix===a['data-collector-data']))error('COLLECTOR_DATASET',`알 수 없는 수집기 데이터 이름: ${a['data-collector-data']}`,file,'data-collector-data');
          const raw=a['data-year-src']||a['data-app-src']||a['data-collector-src']||a.src||(a.rel==='stylesheet'?a.href:'');if(!raw)continue;
          if(a['data-year-src'])stats.years.forEach(y=>asset(raw.replaceAll('{year}',y),file,'script',{base}));else asset(raw,file,'HTML',{base});
        }
        for(const s of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
          const a=attrs(s[1]);if(a.src||a['data-app-src']||a['data-year-src']||a['data-collector-src']||!s[2].trim()||(a.type&&!['text/plain','text/javascript','module'].includes(a.type)))continue;
          try{new vm.Script(s[2],{filename:file});}catch(e){
            const mod=a.type==='module'&&spawnSync(process.execPath,['--input-type=module','--check'],{input:s[2],encoding:'utf8',timeout:5000});
            if(!mod||mod.status!==0)error('INLINE_JS_SYNTAX',e.message,file);
          }
        }
      }
      if(file.endsWith('.css'))for(const m of src.matchAll(/url\(\s*['"]?([^\s)'";]+)['"]?\s*\)/g))asset(m[1],file,'CSS url',{base});
      if(file.endsWith('.js')&&!/^data\/\d{4}\//.test(file)&&!file.startsWith('functions/')&&!file.endsWith('.test.js'))for(const m of src.matchAll(/(['"])((?:\.\.?\/)?image\/[^'"\r\n]+?\.(?:png|jpe?g|webp|gif|svg|mp4|webm))\1/gi))asset(m[2],file,'JS media',{base:m[2].startsWith('image/')?'':base});
      const ym=file.match(/^data\/(\d{4})\/(\d{4}).*\.js$/);if(ym&&ym[1]!==ym[2])error('FILE_YEAR','폴더 연도와 파일명 연도가 다릅니다.',file);
    }
    if(exact.has('data/awardData.js')){const awards=evaluate('data/awardData.js','Awards');if(Array.isArray(awards))media(awards,'data/awardData.js');}
  }
  const counts=Object.fromEntries(['error','warning','info'].map(l=>[l,issues.filter(i=>i.level===l).length]));
  return {generatedAt:new Date().toISOString(),ok:counts.error===0,counts,stats,issues};
}
function markdown(report){
  const escape=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[|\r\n]/g,' ');
  const order={error:0,warning:1,info:2};
  const sorted=[...report.issues].sort((a,b)=>order[a.level]-order[b.level]);
  const groups=new Map();
  for(const i of sorted){const k=`${i.level} | ${i.code}`;groups.set(k,(groups.get(k)||0)+1);}
  return `# 데이터 검사 ${report.ok?'통과':'실패'}\n\n연도: ${report.stats.years.join(', ')} · 오류 ${report.counts.error} · 경고 ${report.counts.warning} · 참고 ${report.counts.info}\n\n`+
    '## 항목별 요약\n\n| 구분 | 코드 | 건수 |\n|---|---|---|\n'+[...groups].map(([k,n])=>`| ${k} | ${n} |`).join('\n')+'\n\n'+
    '## 상세 결과\n\n| 구분 | 코드 | 파일 | 위치 | 내용 |\n|---|---|---|---|---|\n'+sorted.map(i=>`| ${i.level} | ${i.code} | ${escape(i.file)} | ${escape(i.context)} | ${escape(i.message)} |`).join('\n')+'\n';
}
function runCli(argv=process.argv.slice(2)){
  let years,relationshipsOnly=false;
  for(let i=0;i<argv.length;i++){
    if(argv[i]==='--relationships-only')relationshipsOnly=true;
    else if(argv[i]==='--year'){
      const raw=argv[++i]||'';
      if(!/^\d{4}(,\d{4})*$/.test(raw)){console.error('--year 뒤에 2026 또는 2026,2027 형식으로 입력하세요.');process.exitCode=2;return;}
      years=raw.split(',').map(Number);
      if(years.some(y=>y<2000||y>2200)){console.error('연도는 2000~2200 사이여야 합니다.');process.exitCode=2;return;}
    }
    else if(/^\d{4}$/.test(argv[i]))years=[Number(argv[i])];
    else if(['--help','-h'].includes(argv[i])){console.log('node dataCollector/dataValidator.js [--year 2026,2027] [--relationships-only]');return;}
    else{console.error(`알 수 없는 옵션: ${argv[i]}`);process.exitCode=2;return;}
  }
  const report=validateProject({years,relationshipsOnly}),dir=path.resolve(__dirname,'..','reports');fs.mkdirSync(dir,{recursive:true});
  const name=relationshipsOnly?'data-relationships':'data-validation';
  fs.writeFileSync(path.join(dir,`${name}.json`),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(dir,`${name}.md`),markdown(report));
  console.log(`데이터 검사 ${report.ok?'통과':'실패'}: 오류 ${report.counts.error}, 경고 ${report.counts.warning}, 참고 ${report.counts.info}`);
  const errors=report.issues.filter(i=>i.level==='error');
  for(const i of errors.slice(0,30))console.log(`[ERROR ${i.code}] ${i.file} ${i.context}: ${i.message}`);
  if(errors.length>30)console.log(`... 나머지 오류 ${errors.length-30}건은 reports/${name}.md에서 확인하세요.`);
  const warningGroups=new Map();
  for(const i of report.issues.filter(i=>i.level==='warning'))warningGroups.set(i.code,(warningGroups.get(i.code)||0)+1);
  for(const [code,count]of warningGroups)console.log(`[WARNING ${code}] ${count}건 (개별 위치는 reports/${name}.md 참고)`);
  console.log(`상세 결과: reports/${name}.md`);
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown(report));
  process.exitCode=report.ok?0:1;return report;
}
module.exports={DATASETS,validateProject,markdown,runCli};
if(require.main===module)runCli();

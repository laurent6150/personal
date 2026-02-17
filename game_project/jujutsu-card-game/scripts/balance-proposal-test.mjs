// ═══════════════════════════════════════════════════════════
// 밸런스 조정안 검증 시뮬레이션
// 조정 전/후 비교하여 최적 파라미터 탐색
// ═══════════════════════════════════════════════════════════

// ─── 속성 상성 ───
const ATTR_ADV = {
  BARRIER: ['CURSE','CONVERT'], BODY: ['BARRIER','CONVERT'],
  CURSE: ['BODY','RANGE'], SOUL: ['BARRIER','CURSE'],
  CONVERT: ['SOUL','RANGE'], RANGE: ['BODY','SOUL']
};
function getAttrMult(a, d) {
  if (ATTR_ADV[a]?.includes(d)) return 1.5;
  if (ATTR_ADV[d]?.includes(a)) return 0.7;
  return 1.0;
}

// ─── 경기장 ───
const ARENAS = [
  { bonus:'CURSE', bonusPct:10, penalty:'BARRIER', penaltyPct:5 },
  { bonus:'BODY', bonusPct:10, penalty:'CURSE', penaltyPct:5 },
  { bonus:'BARRIER', bonusPct:10, penalty:'BODY', penaltyPct:5 },
  { bonus:'SOUL', bonusPct:10, penalty:'BODY', penaltyPct:5 },
  { bonus:'CURSE', bonusPct:15, penalty:'SOUL', penaltyPct:10 },
  { bonus:'BARRIER', bonusPct:15, penalty:'CURSE', penaltyPct:10 },
  { bonus:'BODY', bonusPct:15, penalty:'SOUL', penaltyPct:10 },
  { bonus:'SOUL', bonusPct:15, penalty:'BARRIER', penaltyPct:10 },
  { bonus:'BODY', bonusPct:3, penalty:'SOUL', penaltyPct:3 },
  { bonus:'CURSE', bonusPct:20, penalty:'BARRIER', penaltyPct:15 },
];

// ─── 등급별 기본 CRT (migrateCharacterStats에서 할당) ───
const GRADE_CRT = { '특급': 15, '준특급': 14, '1급': 12, '준1급': 10, '2급': 8, '3급': 5 };

// ─── 캐릭터 생성 함수 ───
function makeChar(id, name, grade, attr, atk, def, spd, ce, hp, crt = null) {
  return { id, name, grade, attr, atk, def, spd, ce, hp, crt: crt ?? GRADE_CRT[grade] };
}

// ─── 기본 캐릭터 데이터 (현재 상태) ───
function getBaseCharacters() {
  return [
    // 특급
    makeChar("gojo","고죠 사토루","특급","BARRIER",22,20,22,25,100),
    makeChar("sukuna","료멘 스쿠나","특급","CURSE",25,18,22,24,100),
    makeChar("yuta","옷코츠 유타","특급","CURSE",21,18,20,26,100),
    makeChar("kenjaku","켄자쿠","특급","SOUL",18,17,18,25,100),
    makeChar("yuki","츠쿠모 유키","특급","BODY",23,16,19,24,95),
    makeChar("yuji_final","이타도리(최종전)","특급","SOUL",23,18,23,22,95),
    // 준특급
    makeChar("geto","게토 스구루","준특급","CURSE",19,18,18,22,93),
    makeChar("tengen","텐겐","준특급","BARRIER",12,20,10,25,100),
    makeChar("toji","후시구로 토우지","준특급","BODY",25,16,24,0,92,26),
    makeChar("mahoraga","마허라","준특급","BODY",22,18,18,20,100),
    makeChar("rika","완전체 리카","준특급","SOUL",22,17,19,24,95),
    makeChar("tamamo","타마모노마에","준특급","CURSE",21,19,20,22,95),
    makeChar("dabura","다부라","준특급","BODY",23,18,21,20,95),
    // 1급 (대표)
    makeChar("yuji","이타도리 유지","1급","BODY",19,16,20,18,90),
    makeChar("maki_aw","젠인 마키(각성)","1급","BODY",23,15,24,0,88,23),
    makeChar("nanami","나나미 켄토","1급","BODY",18,17,16,18,88),
    makeChar("jogo","죠고","1급","CONVERT",22,13,17,23,88),
    makeChar("hanami","하나미","1급","CONVERT",16,19,14,20,92),
    makeChar("kashimo","카시모 하지메","1급","CONVERT",22,15,22,21,86),
    makeChar("ryu","이시고리 류","1급","RANGE",23,15,14,20,88),
    makeChar("hakari","하카리 킨지","1급","BARRIER",21,16,20,22,87),
    makeChar("choso","쵸소","1급","CURSE",18,16,17,19,88),
    makeChar("todo","토도 아오이","1급","BODY",20,16,17,17,90),
    makeChar("mahito","마히토","1급","SOUL",19,15,19,22,83),
    makeChar("mechamaru","메카마루","1급","RANGE",19,17,14,21,85),
    makeChar("miguel","미겔","1급","BODY",20,16,19,18,88),
    makeChar("tsurugi","옷코츠 츠루기","1급","BODY",23,15,23,0,87,23),
    makeChar("higuruma","히구루마","1급","BARRIER",17,18,16,23,86),
    makeChar("naobito","나오비토","1급","BODY",17,14,24,19,80),
    makeChar("naoya","나오야","1급","BODY",18,13,23,18,78),
    makeChar("uro","우로 타카코","1급","BARRIER",18,16,20,19,82),
    makeChar("yorozu","요로즈","1급","CONVERT",19,15,17,21,83),
    makeChar("uraume","우라우메","1급","CONVERT",17,17,18,20,85),
    makeChar("mei_mei","메이메이","1급","RANGE",16,15,16,18,80),
    makeChar("smallpox","포창신","1급","CURSE",16,18,12,22,90),
    makeChar("kurourushi","쿠로우루시","1급","CURSE",18,14,18,20,82),
    makeChar("bansho","만상","1급","CONVERT",17,16,15,20,85),
    makeChar("dagon","다곤","1급","CONVERT",17,17,14,21,90),
    // 준1급 (대표)
    makeChar("megumi","메구미","준1급","SOUL",16,15,17,19,82),
    makeChar("inumaki","이누마키","준1급","CURSE",14,13,16,21,75),
    makeChar("maki","젠인 마키","준1급","BODY",17,15,18,5,82),
    makeChar("angel","천사/하나","준1급","BARRIER",15,17,16,22,78),
    makeChar("reggie","레지 스타","준1급","RANGE",16,14,17,19,78),
    makeChar("takaba","타카바","준1급","SOUL",14,18,15,20,82),
    makeChar("jinichi","진이치","준1급","BODY",17,16,15,16,85),
    makeChar("ogi","오기","준1급","CONVERT",18,14,16,17,82),
    makeChar("kamo","카모","준1급","CONVERT",15,14,17,18,78),
    makeChar("hazenoki","하제노키","준1급","RANGE",16,12,17,17,75),
    makeChar("kusakabe","쿠사카베","준1급","BODY",16,16,15,14,85),
    makeChar("uiui","우이우이","준1급","BARRIER",10,14,20,21,72),
    makeChar("yuka","유카","준1급","BODY",16,13,18,17,76),
    makeChar("cross","크로스","준1급","CONVERT",18,15,17,19,80),
    makeChar("marulu","마루","준1급","BARRIER",15,16,16,23,78),
    makeChar("usami","우사미","준1급","CURSE",13,14,16,22,75),
    makeChar("yaga","야가","준1급","SOUL",14,15,11,18,82),
    // 2급 (대표)
    makeChar("nobara","노바라","2급","RANGE",15,13,15,17,75),
    makeChar("panda","판다","2급","BODY",16,15,14,15,82),
    makeChar("ino","이노","2급","CURSE",14,14,15,17,78),
    makeChar("momo","니시미야","2급","RANGE",12,12,18,16,70),
    makeChar("miwa","미와","2급","BODY",13,14,16,14,75),
    makeChar("mai","마이","2급","RANGE",14,12,15,16,72),
    makeChar("eso","에소","2급","CURSE",15,13,14,17,78),
    makeChar("kechizu","케치즈","2급","CURSE",14,14,13,16,80),
    makeChar("utahime","우타히메","2급","BARRIER",12,15,13,19,75),
    makeChar("shoko","쇼코","2급","SOUL",10,14,12,20,80),
    makeChar("ogami","오가미","2급","SOUL",10,13,11,19,75),
    makeChar("charles","찰스","2급","SOUL",14,12,16,17,75),
    // 3급
    makeChar("haibara","하이바라","3급","BODY",13,13,14,14,75),
    makeChar("ijichi","이지치","3급","BARRIER",8,16,10,18,70),
    makeChar("nitta","닛타","3급","SOUL",8,13,12,17,72),
    makeChar("kuroi","쿠로이","3급","BODY",10,14,13,12,75),
  ];
}

// ─── 개인리그 시뮬레이션 (CE 계수 파라미터 추가) ───
function simIndividual(c1, c2, arena, ceFactor = 0) {
  const total = c => c.atk + c.def + c.spd + c.ce + c.hp;
  let t1 = total(c1), t2 = total(c2);

  let b1 = 0, p1 = 0, b2 = 0, p2 = 0;
  if (arena.bonus === c1.attr) b1 = arena.bonusPct;
  if (arena.penalty === c1.attr) p1 = arena.penaltyPct;
  if (arena.bonus === c2.attr) b2 = arena.bonusPct;
  if (arena.penalty === c2.attr) p2 = arena.penaltyPct;
  let adj1 = Math.round(t1*(1+b1/100)*(1-p1/100));
  let adj2 = Math.round(t2*(1+b2/100)*(1-p2/100));

  let hp1 = 100, hp2 = 100, g1 = 0, g2 = 0;
  let attacker = c1.spd >= c2.spd ? 1 : 2;

  for (let turn = 0; turn < 30 && hp1 > 0 && hp2 > 0; turn++) {
    const isF1 = attacker === 1;
    const ac = isF1 ? c1 : c2;
    const dc = isF1 ? c2 : c1;
    const aAdj = isF1 ? adj1 : adj2;
    const dAdj = isF1 ? adj2 : adj1;
    const aG = isF1 ? g1 : g2;

    let dmg = Math.round(ac.atk * 0.4 + 5);
    dmg = Math.round(dmg * (1 - Math.min(dc.def*0.3,30)/100));
    dmg = Math.max(5, dmg);
    dmg = Math.round(dmg * Math.max(0.8, Math.min(1.2, 1+(aAdj-dAdj)/1000)));

    // CE 계수 적용 (핵심 변경: CE 0 페널티)
    if (ceFactor > 0) {
      const ceMult = 1 + (ac.ce / (1/ceFactor));
      dmg = Math.round(dmg * ceMult);
    }

    dmg = Math.round(dmg * (0.9+Math.random()*0.2));

    let mult = 1.0;
    if (aG >= 100) mult = 2.0;
    else if (Math.random() < 0.3) mult = 1.3;

    if (Math.random() < ac.crt/150) mult *= 1.5;
    let fd = Math.max(5, Math.round(dmg*mult));

    if (isF1) { hp2 -= fd; if (aG>=100) g1=0; else { g1=Math.min(100,g1+25); g2=Math.min(100,g2+25); } }
    else { hp1 -= fd; if (aG>=100) g2=0; else { g1=Math.min(100,g1+25); g2=Math.min(100,g2+25); } }
    attacker = attacker === 1 ? 2 : 1;
  }
  if (hp1>0&&hp2<=0) return 1;
  if (hp2>0&&hp1<=0) return 2;
  return hp1>hp2?1:(hp2>hp1?2:0);
}

// ─── 팀리그 시뮬레이션 ───
function simTeam(c1, c2, arena) {
  const am1 = getAttrMult(c1.attr, c2.attr), am2 = getAttrMult(c2.attr, c1.attr);
  const cm1 = 1+c1.ce/100, cm2 = 1+c2.ce/100;
  let ab1 = 1, ab2 = 1;
  if (arena.bonus===c1.attr) ab1=1+arena.bonusPct/100;
  if (arena.penalty===c1.attr) ab1=1-arena.penaltyPct/100;
  if (arena.bonus===c2.attr) ab2=1+arena.bonusPct/100;
  if (arena.penalty===c2.attr) ab2=1-arena.penaltyPct/100;

  const d1 = Math.max(1, Math.floor(c1.atk*am1*cm1*ab1 - c2.def));
  const d2 = Math.max(1, Math.floor(c2.atk*am2*cm2*ab2 - c1.def));

  let hp1=c1.hp, hp2=c2.hp;
  const pf = c1.spd>c2.spd?true:(c1.spd<c2.spd?false:Math.random()>0.5);
  for (let t=0; t<100&&hp1>0&&hp2>0; t++) {
    if (pf) { hp2-=d1; if(hp2<=0)break; hp1-=d2; }
    else { hp1-=d2; if(hp1<=0)break; hp2-=d1; }
  }
  if (hp1>0&&hp2<=0) return 1;
  if (hp2>0&&hp1<=0) return 2;
  return hp1>hp2?1:(hp2>hp1?2:0);
}

// ─── 전체 매치업 승률 계산 ───
function calcWinRates(chars, simFn, sims=30) {
  const N = chars.length;
  const res = {};
  for (const c of chars) res[c.id] = { wins:0, total:0 };

  for (let i=0;i<N;i++) for (let j=i+1;j<N;j++) {
    for (const arena of ARENAS) {
      for (let s=0;s<sims;s++) {
        const w = simFn(chars[i], chars[j], arena);
        res[chars[i].id].total++; res[chars[j].id].total++;
        if (w===1) res[chars[i].id].wins++;
        else if (w===2) res[chars[j].id].wins++;
      }
    }
  }

  return chars.map(c => ({
    ...c,
    winRate: res[c.id].total > 0 ? (res[c.id].wins/res[c.id].total*100) : 0
  }));
}

// ═══════════════════════════════════════════════════════════
// 조정안 테스트
// ═══════════════════════════════════════════════════════════

function applyAdjustments(chars, adjustments) {
  return chars.map(c => {
    const adj = adjustments[c.id];
    if (!adj) return {...c};
    return { ...c, ...adj };
  });
}

// ─── 목표 등급별 승률 ───
const TARGET_RATES = { '특급': 72, '준특급': 67, '1급': 57, '준1급': 42, '2급': 30, '3급': 15 };

function gradeAvg(results, grade) {
  const g = results.filter(r => r.grade === grade);
  return g.length > 0 ? g.reduce((s,r)=>s+r.winRate,0)/g.length : 0;
}

function printGradeComparison(label, before, after) {
  console.log(`\n${label}`);
  console.log(`${'─'.repeat(65)}`);
  console.log(`등급      목표     조정 전    조정 후    변화`);
  console.log(`${'─'.repeat(65)}`);
  for (const g of ['특급','준특급','1급','준1급','2급','3급']) {
    const b = gradeAvg(before, g);
    const a = gradeAvg(after, g);
    const t = TARGET_RATES[g];
    const diff = a - b;
    console.log(`${g.padEnd(6)}  ${String(t).padStart(4)}%   ${b.toFixed(1).padStart(6)}%   ${a.toFixed(1).padStart(6)}%   ${diff>=0?'+':''}${diff.toFixed(1)}%`);
  }
}

function printKeyChars(label, results, charIds) {
  console.log(`\n${label}`);
  console.log(`${'─'.repeat(55)}`);
  for (const id of charIds) {
    const r = results.find(x => x.id === id);
    if (r) console.log(`  ${r.name.padEnd(18)} (${r.grade}) → ${r.winRate.toFixed(1)}%`);
  }
}

// ═══════════════════════════════════════════════════════════
// 메인
// ═══════════════════════════════════════════════════════════

console.log(`\n🔬 밸런스 조정안 검증 시뮬레이션`);
console.log(`${'═'.repeat(65)}`);
console.log(`매치업당 30회 × 10경기장 (빠른 검증용)\n`);

const BASE = getBaseCharacters();
const SIMS = 30;

// ───────────────────────────────
// A. 조정 전 기준치
// ───────────────────────────────
console.log(`[A] 조정 전 기준치 계산 중...`);
const beforeInd = calcWinRates(BASE, (a,b,ar)=>simIndividual(a,b,ar,0), SIMS);
const beforeTeam = calcWinRates(BASE, simTeam, SIMS);

// ───────────────────────────────
// B. 조정안 1: 텐겐 버프 + CE 0 CRT 하향
// ───────────────────────────────
console.log(`[B] 조정안 1 테스트 중... (텐겐 버프 + CE 0 CRT 너프)`);
const adj1 = {
  tengen: { atk: 16, spd: 15 },           // ATK +4, SPD +5
  toji: { crt: 20 },                       // CRT 26→20
  maki_aw: { crt: 17 },                    // CRT 23→17
  tsurugi: { crt: 17 },                    // CRT 23→17
};
const chars1 = applyAdjustments(BASE, adj1);
const after1Ind = calcWinRates(chars1, (a,b,ar)=>simIndividual(a,b,ar,0), SIMS);
const after1Team = calcWinRates(chars1, simTeam, SIMS);

// ───────────────────────────────
// C. 조정안 2: 텐겐 버프 + CE 0 CRT 하향 + 개인리그 CE 계수 도입
// ───────────────────────────────
console.log(`[C] 조정안 2 테스트 중... (조정안1 + 개인리그 CE 계수 추가)`);
const CE_FACTOR = 0.004; // ceMult = 1 + (ce * 0.004), CE 0→1.0, CE 25→1.10
const after2Ind = calcWinRates(chars1, (a,b,ar)=>simIndividual(a,b,ar,CE_FACTOR), SIMS);

// ───────────────────────────────
// D. 조정안 3: 강화된 조정 (CE 0 ATK/SPD도 일부 하향)
// ───────────────────────────────
console.log(`[D] 조정안 3 테스트 중... (CE 0 ATK/SPD도 소폭 하향 + CE 계수)`);
const adj3 = {
  tengen: { atk: 16, spd: 15 },
  toji: { atk: 23, spd: 22, crt: 20 },     // ATK 25→23, SPD 24→22
  maki_aw: { atk: 21, spd: 22, crt: 17 },  // ATK 23→21, SPD 24→22
  tsurugi: { atk: 21, spd: 21, crt: 17 },  // ATK 23→21, SPD 23→21
};
const chars3 = applyAdjustments(BASE, adj3);
const after3Ind = calcWinRates(chars3, (a,b,ar)=>simIndividual(a,b,ar,CE_FACTOR), SIMS);
const after3Team = calcWinRates(chars3, simTeam, SIMS);

// ═══════════════════════════════════════════════════════════
// 결과 비교
// ═══════════════════════════════════════════════════════════

console.log(`\n${'═'.repeat(65)}`);
console.log(`  📋 개인리그 등급별 평균 승률 비교`);
console.log(`${'═'.repeat(65)}`);

printGradeComparison('조정안 1 (텐겐 버프 + CE 0 CRT 너프)', beforeInd, after1Ind);
printGradeComparison('조정안 2 (조정안1 + CE 계수 도입)', beforeInd, after2Ind);
printGradeComparison('조정안 3 (CE 0 ATK/SPD 하향 + CE 계수)', beforeInd, after3Ind);

console.log(`\n${'═'.repeat(65)}`);
console.log(`  🏆 팀리그 등급별 평균 승률 비교`);
console.log(`${'═'.repeat(65)}`);
printGradeComparison('조정안 1 (텐겐 버프 + CE 0 CRT 너프)', beforeTeam, after1Team);
printGradeComparison('조정안 3 (CE 0 ATK/SPD 하향 + CE 계수)', beforeTeam, after3Team);

// 핵심 캐릭터 상세
const KEY_IDS = ['tengen','toji','maki_aw','tsurugi','gojo','sukuna','yuji_final','kashimo','dabura'];

console.log(`\n${'═'.repeat(65)}`);
console.log(`  📌 개인리그 핵심 캐릭터 승률 비교`);
console.log(`${'═'.repeat(65)}`);
printKeyChars('조정 전', beforeInd, KEY_IDS);
printKeyChars('조정안 1', after1Ind, KEY_IDS);
printKeyChars('조정안 2 (CE계수)', after2Ind, KEY_IDS);
printKeyChars('조정안 3 (최종안)', after3Ind, KEY_IDS);

console.log(`\n${'═'.repeat(65)}`);
console.log(`  📌 팀리그 핵심 캐릭터 승률 비교`);
console.log(`${'═'.repeat(65)}`);
printKeyChars('조정 전', beforeTeam, KEY_IDS);
printKeyChars('조정안 1', after1Team, KEY_IDS);
printKeyChars('조정안 3 (최종안)', after3Team, KEY_IDS);

// 동급 내 비교
console.log(`\n${'═'.repeat(65)}`);
console.log(`  📊 준특급 내부 승률 비교 (개인리그)`);
console.log(`${'═'.repeat(65)}`);
const semiSpecIds = ['geto','tengen','toji','mahoraga','rika','tamamo','dabura'];
printKeyChars('조정 전', beforeInd, semiSpecIds);
printKeyChars('조정안 3 (최종안)', after3Ind, semiSpecIds);

console.log(`\n${'═'.repeat(65)}`);
console.log(`  📊 1급 CE 0 vs 일반 1급 비교 (개인리그)`);
console.log(`${'═'.repeat(65)}`);
const g1CompareIds = ['maki_aw','tsurugi','kashimo','jogo','yuji','hakari','nanami','todo','ryu'];
printKeyChars('조정 전', beforeInd, g1CompareIds);
printKeyChars('조정안 3 (최종안)', after3Ind, g1CompareIds);

console.log(`\n${'═'.repeat(65)}`);
console.log(`  시뮬레이션 완료`);
console.log(`${'═'.repeat(65)}\n`);

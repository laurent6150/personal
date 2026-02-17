/**
 * 최종 밸런스 튜닝 v2 — 반복 자동 조정
 *
 * 문제: 1급 신체(62.5%) vs 변환(39.8%) 구조적 격차
 * BODY→[BARRIER, CONVERT] 상성이 8:8 비율로 직접 충돌
 *
 * 전략:
 * 1. 다양한 속성 배율에서, 실제 OP/WK를 자동 감지
 * 2. OP 캐릭터 스탯 너프, WK 캐릭터 스탯 버프 (자동)
 * 3. 조정 후 재시뮬레이션하여 최적 조합 선택
 */

const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'], BODY: ['BARRIER', 'CONVERT'],
  CURSE: ['BODY', 'RANGE'], SOUL: ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'], RANGE: ['BODY', 'SOUL']
};

interface C {
  name: string; grade: string; attr: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number; tec: number; mnt: number;
}

// 속성 복구 반영: 리카→CURSE, 쵸소→CONVERT, 이지치→BARRIER
const BASE_CHARS: C[] = [
  // 특급
  { name: "고죠 사토루", grade: "특급", attr: "BARRIER", atk: 22, def: 20, spd: 22, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "료멘 스쿠나", grade: "특급", attr: "CURSE", atk: 25, def: 18, spd: 22, ce: 24, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "켄자쿠", grade: "특급", attr: "SOUL", atk: 20, def: 17, spd: 18, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "츠쿠모 유키", grade: "특급", attr: "BODY", atk: 23, def: 16, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "옷코츠 유타", grade: "특급", attr: "CURSE", atk: 22, def: 18, spd: 20, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "이타도리(최종전)", grade: "특급", attr: "SOUL", atk: 21, def: 18, spd: 21, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },
  // 준특급
  { name: "게토 스구루", grade: "준특급", attr: "CURSE", atk: 19, def: 18, spd: 18, ce: 22, hp: 93, crt: 10, tec: 10, mnt: 10 },
  { name: "텐겐", grade: "준특급", attr: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "토우지", grade: "준특급", attr: "BODY", atk: 23, def: 16, spd: 22, ce: 0, hp: 92, crt: 18, tec: 20, mnt: 10 },
  { name: "마허라", grade: "준특급", attr: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "완전체 리카", grade: "준특급", attr: "CURSE", atk: 22, def: 17, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "타마모노마에", grade: "준특급", attr: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "다부라", grade: "준특급", attr: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: 10, tec: 10, mnt: 10 },
  // 1급
  { name: "이타도리 유지", grade: "1급", attr: "BODY", atk: 19, def: 16, spd: 20, ce: 18, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { name: "마키(각성)", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 88, crt: 15, tec: 19, mnt: 8 },
  { name: "나나미 켄토", grade: "1급", attr: "BODY", atk: 18, def: 17, spd: 16, ce: 18, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "죠고", grade: "1급", attr: "CONVERT", atk: 22, def: 13, spd: 17, ce: 23, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "하나미", grade: "1급", attr: "CONVERT", atk: 18, def: 19, spd: 16, ce: 20, hp: 92, crt: 10, tec: 10, mnt: 10 },
  { name: "나오비토", grade: "1급", attr: "BODY", atk: 19, def: 14, spd: 22, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "나오야", grade: "1급", attr: "BODY", atk: 18, def: 13, spd: 23, ce: 18, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "히구루마", grade: "1급", attr: "BARRIER", atk: 17, def: 18, spd: 16, ce: 23, hp: 86, crt: 10, tec: 10, mnt: 10 },
  { name: "카시모", grade: "1급", attr: "CONVERT", atk: 22, def: 15, spd: 22, ce: 21, hp: 86, crt: 10, tec: 10, mnt: 10 },
  { name: "이시고리 류", grade: "1급", attr: "RANGE", atk: 23, def: 15, spd: 14, ce: 20, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "우로 타카코", grade: "1급", attr: "BARRIER", atk: 18, def: 16, spd: 20, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "하카리", grade: "1급", attr: "BARRIER", atk: 21, def: 16, spd: 20, ce: 22, hp: 87, crt: 10, tec: 10, mnt: 10 },
  { name: "쵸소", grade: "1급", attr: "CONVERT", atk: 18, def: 16, spd: 17, ce: 19, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "토도 아오이", grade: "1급", attr: "BODY", atk: 20, def: 16, spd: 17, ce: 17, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { name: "우라우메", grade: "1급", attr: "CONVERT", atk: 17, def: 17, spd: 18, ce: 20, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "요로즈", grade: "1급", attr: "CONVERT", atk: 19, def: 15, spd: 17, ce: 21, hp: 83, crt: 10, tec: 10, mnt: 10 },
  { name: "마히토", grade: "1급", attr: "SOUL", atk: 19, def: 15, spd: 19, ce: 22, hp: 83, crt: 10, tec: 10, mnt: 10 },
  { name: "메이메이", grade: "1급", attr: "RANGE", atk: 18, def: 15, spd: 16, ce: 18, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "다곤", grade: "1급", attr: "CONVERT", atk: 19, def: 17, spd: 16, ce: 21, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { name: "메카마루", grade: "1급", attr: "RANGE", atk: 19, def: 17, spd: 14, ce: 21, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "미겔", grade: "1급", attr: "BODY", atk: 20, def: 16, spd: 19, ce: 18, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "포창신", grade: "1급", attr: "CURSE", atk: 18, def: 18, spd: 14, ce: 22, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { name: "쿠로우루시", grade: "1급", attr: "CURSE", atk: 18, def: 14, spd: 18, ce: 20, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "만상", grade: "1급", attr: "CONVERT", atk: 19, def: 16, spd: 16, ce: 20, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "츠루기", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 87, crt: 15, tec: 19, mnt: 8 },
  // 준1급
  { name: "후시구로 메구미", grade: "준1급", attr: "SOUL", atk: 16, def: 15, spd: 17, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "이누마키 토게", grade: "준1급", attr: "CURSE", atk: 14, def: 13, spd: 16, ce: 21, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { name: "젠인 마키", grade: "준1급", attr: "BODY", atk: 17, def: 15, spd: 18, ce: 5, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "천사/하나", grade: "준1급", attr: "BARRIER", atk: 15, def: 17, spd: 16, ce: 22, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "레지 스타", grade: "준1급", attr: "RANGE", atk: 16, def: 14, spd: 17, ce: 19, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "타카바", grade: "준1급", attr: "SOUL", atk: 14, def: 18, spd: 15, ce: 20, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "젠인 진이치", grade: "준1급", attr: "BODY", atk: 17, def: 16, spd: 15, ce: 16, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "젠인 오기", grade: "준1급", attr: "CONVERT", atk: 18, def: 14, spd: 16, ce: 17, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "카모 노리토시", grade: "준1급", attr: "CONVERT", atk: 15, def: 14, spd: 17, ce: 18, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "하제노키", grade: "준1급", attr: "RANGE", atk: 16, def: 12, spd: 17, ce: 17, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { name: "쿠사카베", grade: "준1급", attr: "BODY", atk: 16, def: 16, spd: 15, ce: 14, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "우이우이", grade: "준1급", attr: "BARRIER", atk: 14, def: 14, spd: 18, ce: 21, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { name: "옷코츠 유카", grade: "준1급", attr: "BODY", atk: 16, def: 13, spd: 18, ce: 17, hp: 76, crt: 10, tec: 10, mnt: 10 },
  { name: "크로스", grade: "준1급", attr: "CONVERT", atk: 18, def: 15, spd: 17, ce: 19, hp: 80, crt: 10, tec: 10, mnt: 10 },
  { name: "마루", grade: "준1급", attr: "BARRIER", atk: 15, def: 16, spd: 16, ce: 23, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "우사미", grade: "준1급", attr: "CURSE", atk: 15, def: 14, spd: 16, ce: 21, hp: 76, crt: 10, tec: 10, mnt: 10 },
  { name: "야가 마사미치", grade: "준1급", attr: "SOUL", atk: 15, def: 15, spd: 14, ce: 18, hp: 82, crt: 10, tec: 10, mnt: 10 },
];

function getAttrMult(a: string, b: string, adv: number, dis: number): number {
  if (ATTRIBUTE_ADVANTAGE[a]?.includes(b)) return adv;
  if (ATTRIBUTE_ADVANTAGE[b]?.includes(a)) return dis;
  return 1.0;
}

function calcDmg(a: C, b: C, adv: number, dis: number): number {
  let dmg = Math.round(a.atk * 0.4 + 5);
  dmg = Math.round(dmg * (1 - Math.min(b.def * 0.7, 22) / 100));
  dmg = Math.round(dmg * (1 - b.mnt * 0.5 / 100));
  dmg = Math.round(dmg * getAttrMult(a.attr, b.attr, adv, dis));
  const ceM = a.ce === 0 ? 1.12 : 1 + a.ce * 0.006;
  dmg = Math.round(dmg * ceM);
  if (Math.random() < (20 + a.tec * 1.0) / 100) dmg = Math.round(dmg * 1.3);
  if (Math.random() < a.crt / 150) dmg = Math.round(dmg * 1.5);
  return Math.max(5, dmg);
}

function simTeam(a: C, b: C, adv: number, dis: number, trials: number): number {
  let aw = 0;
  for (let t = 0; t < trials; t++) {
    let ah = a.hp, bh = b.hp;
    const aF = a.spd >= b.spd;
    for (let i = 0; i < 100 && ah > 0 && bh > 0; i++) {
      if (aF) { bh -= calcDmg(a, b, adv, dis); if (bh <= 0) break; ah -= calcDmg(b, a, adv, dis); }
      else { ah -= calcDmg(b, a, adv, dis); if (ah <= 0) break; bh -= calcDmg(a, b, adv, dis); }
    }
    if (ah > bh) aw++;
  }
  return aw / trials;
}

function simIndiv(a: C, b: C, adv: number, dis: number, trials: number): number {
  let aw = 0;
  const aT = a.atk + a.def + a.spd + a.ce + a.hp;
  const bT = b.atk + b.def + b.spd + b.ce + b.hp;
  for (let t = 0; t < trials; t++) {
    let ah = a.hp, bh = b.hp;
    let aF = a.spd > b.spd ? true : b.spd > a.spd ? false : Math.random() > 0.5;
    let aG = 0, bG = 0;
    for (let turn = 1; turn <= 30 && ah > 0 && bh > 0; turn++) {
      const isA = (turn % 2 === 1) ? aF : !aF;
      const atk = isA ? a : b, dfd = isA ? b : a;
      let dmg = calcDmg(atk, dfd, adv, dis);
      const diff = (isA ? aT : bT) - (isA ? bT : aT);
      dmg = Math.round(dmg * Math.max(0.8, Math.min(1.2, 1 + diff / 1000)));
      dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));
      const g = isA ? aG : bG;
      if (g >= 100) { dmg = Math.round(dmg * 2.0); if (isA) aG = 0; else bG = 0; }
      dmg = Math.max(5, dmg);
      if (isA) bh -= dmg; else ah -= dmg;
      aG = Math.min(100, aG + 25); bG = Math.min(100, bG + 25);
    }
    if (ah > bh) aw++;
  }
  return aw / trials;
}

interface SimResult {
  name: string; grade: string; attr: string; avg: number; tWR: number; iWR: number;
  atk: number; def: number; spd: number; ce: number; hp: number;
}

function runSim(chars: C[], adv: number, dis: number, tTrials: number, iTrials: number): { results: SimResult[], ok: number, op: number, wk: number } {
  const grades = ['특급', '준특급', '1급', '준1급'];
  const allResults: SimResult[] = [];
  let totalOK = 0, totalOP = 0, totalWK = 0;

  for (const grade of grades) {
    const gc = chars.filter(c => c.grade === grade);
    const n = gc.length;
    const tMat: number[][] = Array.from({length: n}, () => new Array(n).fill(0.5));
    const iMat: number[][] = Array.from({length: n}, () => new Array(n).fill(0.5));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        tMat[i][j] = simTeam(gc[i], gc[j], adv, dis, tTrials);
        tMat[j][i] = 1 - tMat[i][j];
        iMat[i][j] = simIndiv(gc[i], gc[j], adv, dis, iTrials);
        iMat[j][i] = 1 - iMat[i][j];
      }

    for (let i = 0; i < n; i++) {
      const tWR = +(tMat[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1) * 100).toFixed(1);
      const iWR = +(iMat[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1) * 100).toFixed(1);
      const avg = +((tWR + iWR) / 2).toFixed(1);
      const st = avg >= 65 ? 'op' : avg <= 35 ? 'wk' : 'ok';
      if (st === 'ok') totalOK++; else if (st === 'op') totalOP++; else totalWK++;
      allResults.push({ ...gc[i], tWR, iWR, avg });
    }
  }
  return { results: allResults, ok: totalOK, op: totalOP, wk: totalWK };
}

// ====================================================================
// 자동 스탯 조정: OP는 소폭 너프, WK는 소폭 버프
// ====================================================================
function autoAdjust(chars: C[], results: SimResult[]): C[] {
  const adjusted = chars.map(c => ({ ...c }));
  for (const r of results) {
    const c = adjusted.find(x => x.name === r.name);
    if (!c) continue;

    if (r.avg >= 65) {
      // OP 너프: 가장 높은 공격 스탯 -1~2
      const excess = r.avg - 50; // 초과분
      const nerfAmt = excess > 20 ? 2 : 1;
      // SPD가 높으면 SPD 너프, 아니면 ATK 너프
      if (c.spd >= 21) c.spd -= nerfAmt;
      else if (c.atk >= 20) c.atk -= nerfAmt;
      else c.hp -= nerfAmt * 2;
    } else if (r.avg <= 35) {
      // WK 버프: 가장 약한 스탯 보강
      const deficit = 50 - r.avg;
      const buffAmt = deficit > 15 ? 2 : 1;
      // HP와 ATK 위주로 버프
      c.hp += buffAmt * 2;
      c.atk += buffAmt;
    }
  }
  return adjusted;
}

// ====================================================================
// 메인: 2라운드 자동 조정
// ====================================================================
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  최종 밸런스 튜닝 v2 — 반복 자동 조정                       ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

// ═══ STEP 1: 다양한 속성 배율 × 자동 스탯 조정 ═══
console.log('═══ STEP 1: 속성 배율별 자동 스탯 조정 탐색 ═══\n');

const candidates = [
  { adv: 1.08, dis: 0.96 },
  { adv: 1.10, dis: 0.95 },
  { adv: 1.12, dis: 0.93 },
  { adv: 1.13, dis: 0.92 },
  { adv: 1.14, dis: 0.91 },
  { adv: 1.15, dis: 0.92 },
  { adv: 1.18, dis: 0.90 },
];

interface SearchResult {
  adv: number; dis: number;
  beforeOK: number; beforeOP: number; beforeWK: number;
  afterOK: number; afterOP: number; afterWK: number;
  bodyAvg: number; convAvg: number; gap: number;
  adjustedChars: C[];
  afterResults: SimResult[];
  score: number;
}

const searchResults: SearchResult[] = [];

for (const c of candidates) {
  process.stdout.write(`  ${c.adv}/${c.dis} 테스트 중...                    \r`);

  // 1차: 기본 스탯으로 시뮬
  const before = runSim(BASE_CHARS, c.adv, c.dis, 20, 150);

  // 자동 스탯 조정
  const adj1 = autoAdjust(BASE_CHARS, before.results);

  // 2차: 조정 후 시뮬
  const after1 = runSim(adj1, c.adv, c.dis, 20, 150);

  // 2라운드 자동 조정 (아직 OP/WK가 남아있으면)
  const adj2 = autoAdjust(adj1, after1.results);

  // 3차: 최종 시뮬 (더 높은 trial)
  const after2 = runSim(adj2, c.adv, c.dis, 30, 300);

  // 1급 속성별 평균
  const g1Results = after2.results.filter(r => r.grade === '1급');
  const bodyChars = g1Results.filter(r => r.attr === 'BODY');
  const convChars = g1Results.filter(r => r.attr === 'CONVERT');
  const bodyAvg = bodyChars.reduce((s, r) => s + r.avg, 0) / bodyChars.length;
  const convAvg = convChars.reduce((s, r) => s + r.avg, 0) / convChars.length;
  const gap = Math.abs(bodyAvg - convAvg);

  // 점수: OP/WK 적고, 격차 작을수록 좋음
  const score = after2.op * 15 + after2.wk * 15 + gap * 3 + Math.abs(50 - (bodyAvg + convAvg) / 2) * 2;

  searchResults.push({
    adv: c.adv, dis: c.dis,
    beforeOK: before.ok, beforeOP: before.op, beforeWK: before.wk,
    afterOK: after2.ok, afterOP: after2.op, afterWK: after2.wk,
    bodyAvg, convAvg, gap,
    adjustedChars: adj2,
    afterResults: after2.results,
    score
  });
}

// 결과 표시
console.log(`${'배율'.padEnd(12)} ${'[조정전]'.padEnd(18)} ${'[조정후]'.padEnd(18)} ${'신체avg'.padStart(7)} ${'변환avg'.padStart(7)} ${'격차'.padStart(5)} ${'점수'.padStart(5)}`);
console.log('─'.repeat(85));

for (const r of searchResults) {
  const bStr = `✅${r.beforeOK} OP:${r.beforeOP} WK:${r.beforeWK}`;
  const aStr = `✅${r.afterOK} OP:${r.afterOP} WK:${r.afterWK}`;
  console.log(
    `${r.adv}/${r.dis}`.padEnd(12) +
    `${bStr.padEnd(18)} ${aStr.padEnd(18)} ` +
    `${r.bodyAvg.toFixed(1).padStart(7)} ${r.convAvg.toFixed(1).padStart(7)} ${r.gap.toFixed(1).padStart(5)} ${r.score.toFixed(1).padStart(5)}`
  );
}

// 최적 선택
const best = searchResults.sort((a, b) => a.score - b.score)[0];
console.log(`\n→ 최적: ${best.adv}/${best.dis} (점수 ${best.score.toFixed(1)})`);

// ═══ STEP 2: 최적 결과 상세 출력 ═══
console.log('\n' + '═'.repeat(95));
console.log(`최종 결과 (속성 배율 ${best.adv}/${best.dis} + 2라운드 자동 스탯 조정)`);
console.log('═'.repeat(95));

// 스탯 변경 내역 출력
console.log('\n【스탯 변경 내역】');
for (let i = 0; i < BASE_CHARS.length; i++) {
  const orig = BASE_CHARS[i];
  const adj = best.adjustedChars[i];
  const changes: string[] = [];
  if (adj.atk !== orig.atk) changes.push(`ATK ${orig.atk}→${adj.atk}`);
  if (adj.def !== orig.def) changes.push(`DEF ${orig.def}→${adj.def}`);
  if (adj.spd !== orig.spd) changes.push(`SPD ${orig.spd}→${adj.spd}`);
  if (adj.ce !== orig.ce) changes.push(`CE ${orig.ce}→${adj.ce}`);
  if (adj.hp !== orig.hp) changes.push(`HP ${orig.hp}→${adj.hp}`);
  if (changes.length > 0) {
    console.log(`  ${adj.name.padEnd(14)} [${adj.grade}] ${changes.join(', ')}`);
  }
}

// 등급별 상세 결과
for (const grade of ['특급', '준특급', '1급', '준1급']) {
  const results = best.afterResults.filter(r => r.grade === grade).sort((a, b) => b.avg - a.avg);
  const n = results.length;

  console.log(`\n【${grade}】 ${n}명`);
  console.log(`${'#'.padStart(2)}  ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)} ${'ATK'.padStart(3)} ${'DEF'.padStart(3)} ${'SPD'.padStart(3)} ${'CE'.padStart(3)} ${'HP'.padStart(3)}  ${'팀WR'.padStart(6)} ${'개인WR'.padStart(7)}  ${'평균'.padStart(5)}  상태`);
  console.log('─'.repeat(85));

  let ok = 0, op = 0, wk = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    let flag = '';
    if (r.avg >= 65) { flag = '⚠OP'; op++; }
    else if (r.avg <= 35) { flag = '⚠WK'; wk++; }
    else { flag = '✅'; ok++; }
    console.log(
      `${(i+1).toString().padStart(2)}  ${r.name.padEnd(14)} ${ATTR_KO[r.attr].padEnd(4)} ` +
      `${r.atk.toString().padStart(3)} ${r.def.toString().padStart(3)} ${r.spd.toString().padStart(3)} ${r.ce.toString().padStart(3)} ${r.hp.toString().padStart(3)}  ` +
      `${r.tWR.toFixed(1).padStart(5)}% ${r.iWR.toFixed(1).padStart(6)}%  ${r.avg.toFixed(1).padStart(5)}%  ${flag}`
    );
  }

  // 속성별 평균
  const attrG: Record<string, number[]> = {};
  for (const r of results) {
    const ak = ATTR_KO[r.attr];
    if (!attrG[ak]) attrG[ak] = [];
    attrG[ak].push(r.avg);
  }
  const attrLine = Object.entries(attrG).map(([k, v]) => `${k}(${v.length}):${(v.reduce((s,x)=>s+x,0)/v.length).toFixed(1)}%`).join(' ');
  console.log(`  ✅${ok} ⚠OP:${op} ⚠WK:${wk} | ${attrLine}`);
}

const total = best.afterOK + best.afterOP + best.afterWK;
console.log('\n' + '═'.repeat(95));
console.log(`종합: 전체 ${total}명 — ✅${best.afterOK} (${(best.afterOK/total*100).toFixed(1)}%)  ⚠OP:${best.afterOP}  ⚠WK:${best.afterWK}`);
console.log(`1급 속성 격차: 신체 ${best.bodyAvg.toFixed(1)}% vs 변환 ${best.convAvg.toFixed(1)}% (격차 ${best.gap.toFixed(1)}%p)`);
console.log('═'.repeat(95));

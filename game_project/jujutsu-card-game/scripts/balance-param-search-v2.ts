/**
 * 밸런스 파라미터 정밀 탐색 v2
 *
 * 1차 탐색 결과 유망 영역:
 *   CE계수: 0.005-0.007, DEF율: 0.6-0.8, DEF캡: 20-25, CE0보너스: 0.10-0.15
 *
 * v2 추가 탐색:
 *   - ATK 계수 및 baseDmg 변형 (stat 영향력 조정)
 *   - HP 스케일링 보정 (저HP 캐릭터 보상)
 *   - 더 촘촘한 격자 탐색 (50+ 후보)
 */

const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'], BODY: ['BARRIER', 'CONVERT'],
  CURSE: ['BODY', 'RANGE'], SOUL: ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'], RANGE: ['BODY', 'SOUL']
};

interface Params {
  atkCoeff: number; baseDmg: number;
  defRate: number; defCap: number;
  ceCoeff: number; ce0Bonus: number;
  advMult: number; disadvMult: number;
  spdWeight: number; // SPD 영향력 (0=무시, 1=현재)
}

interface C {
  name: string; grade: string; attr: string;
  atk: number; def: number; spd: number; ce: number; hp: number; crt: number;
}

const CHARS: C[] = [
  // 특급
  { name: "고죠 사토루", grade: "특급", attr: "BARRIER", atk: 22, def: 20, spd: 22, ce: 25, hp: 100, crt: 10 },
  { name: "료멘 스쿠나", grade: "특급", attr: "CURSE", atk: 25, def: 18, spd: 22, ce: 24, hp: 100, crt: 10 },
  { name: "켄자쿠", grade: "특급", attr: "SOUL", atk: 20, def: 17, spd: 18, ce: 25, hp: 100, crt: 10 },
  { name: "츠쿠모 유키", grade: "특급", attr: "BODY", atk: 23, def: 16, spd: 19, ce: 24, hp: 95, crt: 10 },
  { name: "옷코츠 유타", grade: "특급", attr: "CURSE", atk: 22, def: 18, spd: 20, ce: 25, hp: 100, crt: 10 },
  { name: "이타도리(최종전)", grade: "특급", attr: "SOUL", atk: 21, def: 18, spd: 21, ce: 22, hp: 95, crt: 10 },
  // 준특급
  { name: "게토 스구루", grade: "준특급", attr: "CURSE", atk: 19, def: 18, spd: 18, ce: 22, hp: 93, crt: 10 },
  { name: "텐겐", grade: "준특급", attr: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: 10 },
  { name: "토우지", grade: "준특급", attr: "BODY", atk: 23, def: 16, spd: 22, ce: 0, hp: 92, crt: 18 },
  { name: "마허라", grade: "준특급", attr: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: 10 },
  { name: "완전체 리카", grade: "준특급", attr: "SOUL", atk: 22, def: 17, spd: 19, ce: 24, hp: 95, crt: 10 },
  { name: "타마모노마에", grade: "준특급", attr: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 95, crt: 10 },
  { name: "다부라", grade: "준특급", attr: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: 10 },
  // 1급 (25명)
  { name: "이타도리 유지", grade: "1급", attr: "BODY", atk: 19, def: 16, spd: 20, ce: 18, hp: 90, crt: 10 },
  { name: "마키(각성)", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 88, crt: 15 },
  { name: "나나미 켄토", grade: "1급", attr: "BODY", atk: 18, def: 17, spd: 16, ce: 18, hp: 88, crt: 10 },
  { name: "죠고", grade: "1급", attr: "CONVERT", atk: 22, def: 13, spd: 17, ce: 23, hp: 88, crt: 10 },
  { name: "하나미", grade: "1급", attr: "CONVERT", atk: 18, def: 19, spd: 16, ce: 20, hp: 92, crt: 10 },
  { name: "나오비토", grade: "1급", attr: "BODY", atk: 19, def: 14, spd: 22, ce: 19, hp: 82, crt: 10 },
  { name: "나오야", grade: "1급", attr: "BODY", atk: 18, def: 13, spd: 23, ce: 18, hp: 78, crt: 10 },
  { name: "히구루마", grade: "1급", attr: "BARRIER", atk: 17, def: 18, spd: 16, ce: 23, hp: 86, crt: 10 },
  { name: "카시모", grade: "1급", attr: "CONVERT", atk: 22, def: 15, spd: 22, ce: 21, hp: 86, crt: 10 },
  { name: "이시고리 류", grade: "1급", attr: "RANGE", atk: 23, def: 15, spd: 14, ce: 20, hp: 88, crt: 10 },
  { name: "우로 타카코", grade: "1급", attr: "BARRIER", atk: 18, def: 16, spd: 20, ce: 19, hp: 82, crt: 10 },
  { name: "하카리", grade: "1급", attr: "BARRIER", atk: 21, def: 16, spd: 20, ce: 22, hp: 87, crt: 10 },
  { name: "쵸소", grade: "1급", attr: "CURSE", atk: 18, def: 16, spd: 17, ce: 19, hp: 88, crt: 10 },
  { name: "토도 아오이", grade: "1급", attr: "BODY", atk: 20, def: 16, spd: 17, ce: 17, hp: 90, crt: 10 },
  { name: "우라우메", grade: "1급", attr: "CONVERT", atk: 17, def: 17, spd: 18, ce: 20, hp: 85, crt: 10 },
  { name: "요로즈", grade: "1급", attr: "CONVERT", atk: 19, def: 15, spd: 17, ce: 21, hp: 83, crt: 10 },
  { name: "마히토", grade: "1급", attr: "SOUL", atk: 19, def: 15, spd: 19, ce: 22, hp: 83, crt: 10 },
  { name: "메이메이", grade: "1급", attr: "RANGE", atk: 18, def: 15, spd: 16, ce: 18, hp: 82, crt: 10 },
  { name: "다곤", grade: "1급", attr: "CONVERT", atk: 19, def: 17, spd: 16, ce: 21, hp: 90, crt: 10 },
  { name: "메카마루", grade: "1급", attr: "RANGE", atk: 19, def: 17, spd: 14, ce: 21, hp: 85, crt: 10 },
  { name: "미겔", grade: "1급", attr: "BODY", atk: 20, def: 16, spd: 19, ce: 18, hp: 88, crt: 10 },
  { name: "포창신", grade: "1급", attr: "CURSE", atk: 18, def: 18, spd: 14, ce: 22, hp: 90, crt: 10 },
  { name: "쿠로우루시", grade: "1급", attr: "CURSE", atk: 18, def: 14, spd: 18, ce: 20, hp: 82, crt: 10 },
  { name: "만상", grade: "1급", attr: "CONVERT", atk: 19, def: 16, spd: 16, ce: 20, hp: 85, crt: 10 },
  { name: "츠루기", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 87, crt: 15 },
  // 준1급 (17명)
  { name: "후시구로 메구미", grade: "준1급", attr: "SOUL", atk: 16, def: 15, spd: 17, ce: 19, hp: 82, crt: 10 },
  { name: "이누마키 토게", grade: "준1급", attr: "CURSE", atk: 14, def: 13, spd: 16, ce: 21, hp: 75, crt: 10 },
  { name: "젠인 마키", grade: "준1급", attr: "BODY", atk: 17, def: 15, spd: 18, ce: 5, hp: 82, crt: 10 },
  { name: "천사/하나", grade: "준1급", attr: "BARRIER", atk: 15, def: 17, spd: 16, ce: 22, hp: 78, crt: 10 },
  { name: "레지 스타", grade: "준1급", attr: "RANGE", atk: 16, def: 14, spd: 17, ce: 19, hp: 78, crt: 10 },
  { name: "타카바", grade: "준1급", attr: "SOUL", atk: 14, def: 18, spd: 15, ce: 20, hp: 82, crt: 10 },
  { name: "젠인 진이치", grade: "준1급", attr: "BODY", atk: 17, def: 16, spd: 15, ce: 16, hp: 85, crt: 10 },
  { name: "젠인 오기", grade: "준1급", attr: "CONVERT", atk: 18, def: 14, spd: 16, ce: 17, hp: 82, crt: 10 },
  { name: "카모 노리토시", grade: "준1급", attr: "CONVERT", atk: 15, def: 14, spd: 17, ce: 18, hp: 78, crt: 10 },
  { name: "하제노키", grade: "준1급", attr: "RANGE", atk: 16, def: 12, spd: 17, ce: 17, hp: 75, crt: 10 },
  { name: "쿠사카베", grade: "준1급", attr: "BODY", atk: 16, def: 16, spd: 15, ce: 14, hp: 85, crt: 10 },
  { name: "우이우이", grade: "준1급", attr: "BARRIER", atk: 14, def: 14, spd: 18, ce: 21, hp: 75, crt: 10 },
  { name: "옷코츠 유카", grade: "준1급", attr: "BODY", atk: 16, def: 13, spd: 18, ce: 17, hp: 76, crt: 10 },
  { name: "크로스", grade: "준1급", attr: "CONVERT", atk: 18, def: 15, spd: 17, ce: 19, hp: 80, crt: 10 },
  { name: "마루", grade: "준1급", attr: "BARRIER", atk: 15, def: 16, spd: 16, ce: 23, hp: 78, crt: 10 },
  { name: "우사미", grade: "준1급", attr: "CURSE", atk: 15, def: 14, spd: 16, ce: 21, hp: 76, crt: 10 },
  { name: "야가 마사미치", grade: "준1급", attr: "SOUL", atk: 15, def: 15, spd: 14, ce: 18, hp: 82, crt: 10 },
];

// === 데미지 계산 ===
function calcDmg(a: C, b: C, p: Params): number {
  let dmg = Math.round(a.atk * p.atkCoeff + p.baseDmg);
  const defRed = Math.min(b.def * p.defRate, p.defCap);
  dmg = Math.round(dmg * (1 - defRed / 100));

  // 속성
  let attrM = 1.0;
  if (ATTRIBUTE_ADVANTAGE[a.attr]?.includes(b.attr)) attrM = p.advMult;
  else if (ATTRIBUTE_ADVANTAGE[b.attr]?.includes(a.attr)) attrM = p.disadvMult;
  dmg = Math.round(dmg * attrM);

  // CE (CE0 보너스 적용)
  const ceM = a.ce === 0 ? (1 + p.ce0Bonus) : (1 + a.ce * p.ceCoeff);
  dmg = Math.round(dmg * ceM);

  return Math.max(5, dmg);
}

// === 팀리그 시뮬 (결정적, SPD weight 포함) ===
function simTeam(a: C, b: C, p: Params): 'A' | 'B' | 'DRAW' {
  const dAB = calcDmg(a, b, p), dBA = calcDmg(b, a, p);
  let ah = a.hp, bh = b.hp;

  // SPD weight: 1.0 = 현재(완전 결정), 0.5 = 약화(SPD 차이가 클 때만)
  let aFirst: boolean;
  if (p.spdWeight >= 1.0) {
    aFirst = a.spd >= b.spd;
  } else {
    const spdDiff = a.spd - b.spd;
    if (Math.abs(spdDiff) <= 2) {
      // SPD 차이 2 이하: 교대 공격 (실질적 동시)
      aFirst = true; // 번갈아가므로 무의미
    } else {
      aFirst = spdDiff > 0;
    }
  }

  for (let t = 0; t < 100 && ah > 0 && bh > 0; t++) {
    if (p.spdWeight < 1.0 && Math.abs(a.spd - b.spd) <= 2) {
      // 동시 공격 (SPD 근소 차이)
      bh -= dAB;
      ah -= dBA;
    } else if (aFirst) {
      bh -= dAB; if (bh <= 0) break; ah -= dBA;
    } else {
      ah -= dBA; if (ah <= 0) break; bh -= dAB;
    }
  }
  return ah > bh ? 'A' : bh > ah ? 'B' : 'DRAW';
}

// === 개인리그 시뮬 (랜덤) ===
function simIndiv(a: C, b: C, p: Params, trials: number): number {
  let aw = 0;
  for (let t = 0; t < trials; t++) {
    let ah = a.hp, bh = b.hp;
    let aF = a.spd > b.spd ? true : b.spd > a.spd ? false : Math.random() > 0.5;
    let aG = 0, bG = 0;
    for (let turn = 1; turn <= 30 && ah > 0 && bh > 0; turn++) {
      const isA = (turn % 2 === 1) ? aF : !aF;
      const atk = isA ? a : b, dfd = isA ? b : a;
      let dmg = calcDmg(atk, dfd, p);
      dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));
      const g = isA ? aG : bG;
      if (g >= 100) { dmg = Math.round(dmg * 2.0); if (isA) aG = 0; else bG = 0; }
      else if (Math.random() < 0.3) dmg = Math.round(dmg * 1.3);
      if (Math.random() < atk.crt / 150) dmg = Math.round(dmg * 1.5);
      dmg = Math.max(5, dmg);
      if (isA) bh -= dmg; else ah -= dmg;
      aG = Math.min(100, aG + 25); bG = Math.min(100, bG + 25);
    }
    if (ah > bh) aw++;
  }
  return aw / trials;
}

// === 밸런스 점수 계산 (개선된 스코어링) ===
function calcBalanceScore(p: Params, trials: number): {
  score: number;
  gradeDetails: Record<string, { tStd: number; iStd: number; maxWR: number; minWR: number; tiGap: number }>;
} {
  const grades = ['특급', '준특급', '1급', '준1급'];
  let totalScore = 0;
  const gradeDetails: Record<string, any> = {};

  for (const grade of grades) {
    const chars = CHARS.filter(c => c.grade === grade);
    const n = chars.length;

    // 팀리그
    const tWins = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (i !== j && simTeam(chars[i], chars[j], p) === 'A') tWins[i]++;
    const tRates = tWins.map(w => w / (n - 1) * 100);

    // 개인리그
    const iMat: number[][] = Array.from({length: n}, () => new Array(n).fill(50));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        iMat[i][j] = simIndiv(chars[i], chars[j], p, trials) * 100;
        iMat[j][i] = 100 - iMat[i][j];
      }
    const iRates = chars.map((_, i) => {
      const sum = iMat[i].reduce((s, v, j) => j === i ? s : s + v, 0);
      return sum / (n - 1);
    });

    const tAvg = tRates.reduce((s, v) => s + v, 0) / n;
    const iAvg = iRates.reduce((s, v) => s + v, 0) / n;
    const tStd = Math.sqrt(tRates.reduce((s, v) => s + (v - tAvg) ** 2, 0) / n);
    const iStd = Math.sqrt(iRates.reduce((s, v) => s + (v - iAvg) ** 2, 0) / n);

    // 최대/최소 승률
    const tMax = Math.max(...tRates), tMin = Math.min(...tRates);
    const iMax = Math.max(...iRates), iMin = Math.min(...iRates);

    // 팀-개인 격차
    const tiGap = chars.reduce((s, _, i) => s + Math.abs(tRates[i] - iRates[i]), 0) / n;

    // 가중치: 1급(25명)이 가장 중요
    const weight = grade === '1급' ? 3.0 : grade === '준1급' ? 2.0 : 1.0;

    // 스코어: 표준편차 + 범위 패널티 + 극단값 패널티 + 팀-개인 격차
    const rangeP = ((tMax - tMin) + (iMax - iMin)) * 0.2;
    const extremeP = (Math.max(0, tMax - 75) + Math.max(0, iMax - 75) +
                      Math.max(0, 25 - tMin) + Math.max(0, 25 - iMin)) * 0.5;
    const gapP = tiGap * 0.3;

    totalScore += (tStd + iStd + rangeP + extremeP + gapP) * weight;

    gradeDetails[grade] = {
      tStd: Math.round(tStd * 10) / 10,
      iStd: Math.round(iStd * 10) / 10,
      maxWR: Math.round(Math.max(tMax, iMax) * 10) / 10,
      minWR: Math.round(Math.min(tMin, iMin) * 10) / 10,
      tiGap: Math.round(tiGap * 10) / 10,
    };
  }

  return { score: Math.round(totalScore * 10) / 10, gradeDetails };
}

// ===================================================
// 메인: 정밀 격자 탐색
// ===================================================
console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  밸런스 파라미터 정밀 탐색 v2                                     ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝');

// 기본 파라미터
const BASE: Params = {
  atkCoeff: 0.4, baseDmg: 5, defRate: 0.3, defCap: 30,
  ceCoeff: 0.01, ce0Bonus: 0, advMult: 1.1, disadvMult: 0.95, spdWeight: 1.0
};

// 후보 생성
const CANDIDATES: { name: string; params: Params }[] = [];

// Phase 1: CE/DEF 정밀 격자 (고정: ATK0.4, baseDmg5, 속성1.1/0.95)
const ceCoeffs = [0.005, 0.006, 0.007, 0.008];
const defRates = [0.5, 0.6, 0.7, 0.8];
const defCaps  = [20, 22, 25];
const ce0Bonuses = [0.10, 0.12, 0.15];

for (const ce of ceCoeffs) {
  for (const dr of defRates) {
    for (const dc of defCaps) {
      for (const c0 of ce0Bonuses) {
        CANDIDATES.push({
          name: `CE${ce*1000}+D${dr}/${dc}+C0_${c0*100}`,
          params: { ...BASE, ceCoeff: ce, defRate: dr, defCap: dc, ce0Bonus: c0, advMult: 1.1, disadvMult: 0.95 }
        });
      }
    }
  }
}

// Phase 2: ATK 계수 변형 (CE6, DEF0.7/22 기반)
const atkVariants = [
  { atkCoeff: 0.35, baseDmg: 6 },
  { atkCoeff: 0.45, baseDmg: 4 },
  { atkCoeff: 0.3, baseDmg: 7 },
  { atkCoeff: 0.5, baseDmg: 3 },
];
for (const av of atkVariants) {
  for (const ce of [0.005, 0.006, 0.007]) {
    for (const c0 of [0.10, 0.12, 0.15]) {
      CANDIDATES.push({
        name: `ATK${av.atkCoeff}+${av.baseDmg}+CE${ce*1000}+C0_${c0*100}`,
        params: { ...BASE, ...av, ceCoeff: ce, defRate: 0.7, defCap: 22, ce0Bonus: c0, advMult: 1.1, disadvMult: 0.95 }
      });
    }
  }
}

// Phase 3: 속성 배율 변형 (CE6+DEF0.7/22+CE0_12 기반)
const attrVariants = [
  { advMult: 1.05, disadvMult: 0.97 },
  { advMult: 1.08, disadvMult: 0.96 },
  { advMult: 1.12, disadvMult: 0.93 },
  { advMult: 1.15, disadvMult: 0.92 },
];
for (const av of attrVariants) {
  CANDIDATES.push({
    name: `속성${av.advMult}/${av.disadvMult}`,
    params: { ...BASE, ceCoeff: 0.006, defRate: 0.7, defCap: 22, ce0Bonus: 0.12, ...av }
  });
}

// Phase 4: SPD weight 변형
for (const sw of [0.5]) {
  CANDIDATES.push({
    name: `SPD약화+CE6+D0.7`,
    params: { ...BASE, ceCoeff: 0.006, defRate: 0.7, defCap: 22, ce0Bonus: 0.12, advMult: 1.1, disadvMult: 0.95, spdWeight: sw }
  });
}

// 현재도 추가
CANDIDATES.unshift({ name: "현재", params: BASE });

console.log(`\n총 ${CANDIDATES.length}개 후보 탐색 (개인리그 150회)\n`);

const SEARCH_TRIALS = 150;
let results: { name: string; score: number; details: any; params: Params }[] = [];

for (let i = 0; i < CANDIDATES.length; i++) {
  const cand = CANDIDATES[i];
  const result = calcBalanceScore(cand.params, SEARCH_TRIALS);
  results.push({ name: cand.name, score: result.score, details: result.gradeDetails, params: cand.params });
  if ((i + 1) % 50 === 0 || i === CANDIDATES.length - 1) {
    process.stdout.write(`  진행: ${i + 1}/${CANDIDATES.length} 완료\r`);
  }
}

// 정렬
results.sort((a, b) => a.score - b.score);

console.log('\n\n═══ TOP 20 파라미터 셋 ═══\n');
console.log(`${'#'.padStart(3)} ${'이름'.padEnd(28)} ${'점수'.padStart(7)} | ${'특tσ'.padStart(5)} ${'특iσ'.padStart(5)} | ${'준tσ'.padStart(5)} ${'준iσ'.padStart(5)} | ${'1tσ'.padStart(5)} ${'1iσ'.padStart(5)} | ${'준1tσ'.padStart(5)} ${'준1iσ'.padStart(5)} | ${'max'.padStart(5)} ${'min'.padStart(5)}`);
console.log('─'.repeat(120));

for (let i = 0; i < Math.min(20, results.length); i++) {
  const r = results[i];
  const d = r.details;
  const maxWR = Math.max(d['특급'].maxWR, d['준특급'].maxWR, d['1급'].maxWR, d['준1급'].maxWR);
  const minWR = Math.min(d['특급'].minWR, d['준특급'].minWR, d['1급'].minWR, d['준1급'].minWR);
  console.log(
    `${(i+1).toString().padStart(3)} ${r.name.padEnd(28)} ${r.score.toFixed(1).padStart(7)} | ` +
    `${d['특급'].tStd.toFixed(1).padStart(5)} ${d['특급'].iStd.toFixed(1).padStart(5)} | ` +
    `${d['준특급'].tStd.toFixed(1).padStart(5)} ${d['준특급'].iStd.toFixed(1).padStart(5)} | ` +
    `${d['1급'].tStd.toFixed(1).padStart(5)} ${d['1급'].iStd.toFixed(1).padStart(5)} | ` +
    `${d['준1급'].tStd.toFixed(1).padStart(5)} ${d['준1급'].iStd.toFixed(1).padStart(5)} | ` +
    `${maxWR.toFixed(1).padStart(5)} ${minWR.toFixed(1).padStart(5)}`
  );
}

// === 최적 파라미터 상세 분석 ===
const best = results[0];
console.log('\n' + '═'.repeat(80));
console.log(`🏆 최적 파라미터: ${best.name} (점수: ${best.score})`);
console.log('═'.repeat(80));
console.log(`  ATK계수: ${best.params.atkCoeff} | 기본데미지: ${best.params.baseDmg}`);
console.log(`  DEF감소율: ${best.params.defRate} | DEF상한: ${best.params.defCap}%`);
console.log(`  CE계수: ${best.params.ceCoeff} | CE0보너스: ${(best.params.ce0Bonus * 100).toFixed(0)}%`);
console.log(`  속성배율: ${best.params.advMult}/${best.params.disadvMult}`);
console.log(`  SPD: ${best.params.spdWeight >= 1 ? '현재(완전 결정)' : '약화(SPD차이 2이하 동시공격)'}`);

// 2위/3위도 비교
console.log('\n--- 2위/3위 비교 ---');
for (let i = 1; i < Math.min(3, results.length); i++) {
  const r = results[i];
  console.log(`  ${i+1}위: ${r.name} (점수: ${r.score}) | CE:${r.params.ceCoeff} DEF:${r.params.defRate}/${r.params.defCap} CE0:${r.params.ce0Bonus} ATK:${r.params.atkCoeff}+${r.params.baseDmg}`);
}

// === 최적 파라미터 상세 전투 결과 (500회) ===
console.log('\n' + '═'.repeat(80));
console.log('최적 파라미터 상세 전투 결과 (500회 시뮬레이션)');
console.log('═'.repeat(80));

const DETAIL_TRIALS = 500;
const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

for (const grade of ['특급', '준특급', '1급', '준1급']) {
  const chars = CHARS.filter(c => c.grade === grade);
  const n = chars.length;

  const tWins = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (i !== j && simTeam(chars[i], chars[j], best.params) === 'A') tWins[i]++;

  const iMat: number[][] = Array.from({length: n}, () => new Array(n).fill(50));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      iMat[i][j] = simIndiv(chars[i], chars[j], best.params, DETAIL_TRIALS) * 100;
      iMat[j][i] = 100 - iMat[i][j];
    }

  console.log(`\n【${grade}】 ${n}명`);
  console.log(`${'순위'.padEnd(4)} ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)} CE  HP  ${'팀WR'.padStart(6)} ${'개인WR'.padStart(7)} ${'차이'.padStart(6)} ${'평균'.padStart(6)}    상태`);
  console.log('─'.repeat(85));

  const charResults = chars.map((c, i) => {
    const tWR = Math.round(tWins[i] / (n - 1) * 1000) / 10;
    const iWR = Math.round((iMat[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1)) * 10) / 10;
    const avg = (tWR + iWR) / 2;
    return { name: c.name, attr: c.attr, ce: c.ce, hp: c.hp, tWR, iWR, diff: Math.abs(tWR - iWR), avg };
  }).sort((a, b) => b.avg - a.avg);

  let opCount = 0, weakCount = 0, okCount = 0;

  charResults.forEach((r, i) => {
    let flag = '';
    if (r.avg >= 65) { flag = '⚠️OP'; opCount++; }
    else if (r.avg <= 35) { flag = '⚠️WEAK'; weakCount++; }
    else if (r.diff >= 20) { flag = '⚠️격차'; }
    else { flag = '✅'; okCount++; }
    console.log(
      `${(i+1).toString().padStart(2)}   ${r.name.padEnd(14)} ${(ATTR_KO[r.attr]||r.attr).padEnd(4)} ${r.ce.toString().padStart(2)} ${r.hp.toString().padStart(3)}  ` +
      `${r.tWR.toFixed(1).padStart(5)}% ${r.iWR.toFixed(1).padStart(6)}%  ${r.diff.toFixed(1).padStart(4)}%p  ${r.avg.toFixed(1).padStart(5)}%    ${flag}`
    );
  });

  const tRates = charResults.map(r => r.tWR);
  const iRates = charResults.map(r => r.iWR);
  const tStd = Math.sqrt(tRates.reduce((s, v) => s + (v - 50) ** 2, 0) / n);
  const iStd = Math.sqrt(iRates.reduce((s, v) => s + (v - 50) ** 2, 0) / n);
  console.log(`  요약: ✅${okCount} ⚠️OP:${opCount} ⚠️WEAK:${weakCount} | 팀σ=${tStd.toFixed(1)} 개인σ=${iStd.toFixed(1)} | 평균차이=${(charResults.reduce((s,r)=>s+r.diff,0)/n).toFixed(1)}%p`);
}

// === 현재 vs 최적 비교 ===
console.log('\n' + '═'.repeat(80));
console.log('📊 현재 → 최적 변경 요약');
console.log('═'.repeat(80));
console.log(`
${'항목'.padEnd(18)} ${'현재'.padStart(12)} ${'최적'.padStart(12)}    변경
${'─'.repeat(60)}
${'ATK 계수'.padEnd(18)} ${BASE.atkCoeff.toString().padStart(12)} ${best.params.atkCoeff.toString().padStart(12)}    ${best.params.atkCoeff === BASE.atkCoeff ? '동일' : '변경'}
${'기본 데미지'.padEnd(16)} ${BASE.baseDmg.toString().padStart(12)} ${best.params.baseDmg.toString().padStart(12)}    ${best.params.baseDmg === BASE.baseDmg ? '동일' : '변경'}
${'DEF 감소율'.padEnd(17)} ${BASE.defRate.toString().padStart(12)} ${best.params.defRate.toString().padStart(12)}    ${best.params.defRate === BASE.defRate ? '동일' : '강화 ↑'}
${'DEF 상한'.padEnd(18)} ${(BASE.defCap + '%').padStart(12)} ${(best.params.defCap + '%').padStart(12)}    ${best.params.defCap === BASE.defCap ? '동일' : '조정'}
${'CE 계수'.padEnd(18)} ${BASE.ceCoeff.toString().padStart(12)} ${best.params.ceCoeff.toString().padStart(12)}    ${best.params.ceCoeff === BASE.ceCoeff ? '동일' : '축소 ↓'}
${'CE0 보너스'.padEnd(17)} ${(BASE.ce0Bonus * 100 + '%').padStart(12)} ${(best.params.ce0Bonus * 100 + '%').padStart(12)}    ${best.params.ce0Bonus === BASE.ce0Bonus ? '동일' : '추가 ↑'}
${'속성 유리'.padEnd(17)} ${'×' + BASE.advMult.toString()} ${'×' + best.params.advMult.toString()}    ${best.params.advMult === BASE.advMult ? '동일' : '조정'}
${'속성 불리'.padEnd(17)} ${'×' + BASE.disadvMult.toString()} ${'×' + best.params.disadvMult.toString()}    ${best.params.disadvMult === BASE.disadvMult ? '동일' : '조정'}
`);

// 데미지 비교
console.log('주요 캐릭터 데미지 변화:');
const samples = [
  ['카시모', '하나미'], ['토우지', '마허라'], ['켄자쿠', '고죠 사토루'],
  ['메이메이', '이타도리 유지'], ['마키(각성)', '나나미 켄토'], ['이누마키 토게', '후시구로 메구미']
];
for (const [aName, bName] of samples) {
  const a = CHARS.find(c => c.name === aName)!, b = CHARS.find(c => c.name === bName)!;
  if (!a || !b) continue;
  const curDmg = calcDmg(a, b, BASE);
  const newDmg = calcDmg(a, b, best.params);
  console.log(`  ${aName} → ${bName}: ${curDmg}dmg → ${newDmg}dmg (${newDmg > curDmg ? '+' : ''}${newDmg - curDmg})`);
}

console.log('\n' + '═'.repeat(80));
console.log('시뮬레이션 완료');
console.log('═'.repeat(80));

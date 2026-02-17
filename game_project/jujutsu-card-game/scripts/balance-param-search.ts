/**
 * 종합 밸런스 파라미터 탐색 시뮬레이션
 *
 * 근본 원인 분석:
 *   1. CE 영향력 과다: CE25 → ×1.25 vs CE0 → ×1.0 (25% 격차)
 *   2. DEF 영향력 미미: DEF12=3.6% vs DEF20=6% 감소 (거의 무의미)
 *   3. SPD 이진성: 선공이 100% 결정적 (팀리그)
 *   4. CE0 보상 부재: 팀리그에서 CRT/TEC 미사용
 *
 * 탐색할 파라미터:
 *   - CE 계수: 0.005 ~ 0.01
 *   - DEF 감소율: 0.3 ~ 1.0
 *   - DEF 감소 상한: 20% ~ 35%
 *   - CE0 고정 보너스: 0 ~ 0.20
 *   - 속성 배율: 1.05/0.97 ~ 1.15/0.92
 */

const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'], BODY: ['BARRIER', 'CONVERT'],
  CURSE: ['BODY', 'RANGE'], SOUL: ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'], RANGE: ['BODY', 'SOUL']
};

interface Params {
  atkCoeff: number;     // ATK 계수 (기본 0.4)
  baseDmg: number;      // 기본 데미지 (기본 5)
  defRate: number;       // DEF 감소율 (기본 0.3)
  defCap: number;        // DEF 감소 상한% (기본 30)
  ceCoeff: number;       // CE 계수 (기본 0.01)
  ce0Bonus: number;      // CE0 캐릭터 고정 보너스 (기본 0)
  advMult: number;       // 속성 유리 배율
  disadvMult: number;    // 속성 불리 배율
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

// === 팀리그 시뮬 (결정적) ===
function simTeam(a: C, b: C, p: Params): 'A' | 'B' | 'DRAW' {
  const dAB = calcDmg(a, b, p), dBA = calcDmg(b, a, p);
  let ah = a.hp, bh = b.hp;
  const aF = a.spd > b.spd ? true : b.spd > a.spd ? false : true;
  for (let t = 0; t < 100 && ah > 0 && bh > 0; t++) {
    if (aF) { bh -= dAB; if (bh <= 0) break; ah -= dBA; }
    else { ah -= dBA; if (ah <= 0) break; bh -= dAB; }
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

// === 밸런스 점수 계산 ===
function calcBalanceScore(p: Params, trials: number): { score: number; details: Record<string, { tStd: number; iStd: number; tRange: number; iRange: number }> } {
  const grades = ['특급', '준특급', '1급', '준1급'];
  let totalScore = 0;
  const details: Record<string, any> = {};

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
    const iRates = chars.map((_, i) => iMat[i].reduce((s, v) => s + v, 0) / n);

    const tAvg = tRates.reduce((s, v) => s + v, 0) / n;
    const iAvg = iRates.reduce((s, v) => s + v, 0) / n;
    const tStd = Math.sqrt(tRates.reduce((s, v) => s + (v - tAvg) ** 2, 0) / n);
    const iStd = Math.sqrt(iRates.reduce((s, v) => s + (v - iAvg) ** 2, 0) / n);
    const tRange = Math.max(...tRates) - Math.min(...tRates);
    const iRange = Math.max(...iRates) - Math.min(...iRates);

    // 가중치: 1급(25명)이 가장 중요
    const weight = grade === '1급' ? 3 : grade === '준1급' ? 2 : 1;
    totalScore += (tStd + iStd + tRange * 0.3 + iRange * 0.3) * weight;

    details[grade] = { tStd: Math.round(tStd * 10) / 10, iStd: Math.round(iStd * 10) / 10, tRange: Math.round(tRange * 10) / 10, iRange: Math.round(iRange * 10) / 10 };
  }

  return { score: Math.round(totalScore * 10) / 10, details };
}

// === 메인: 파라미터 탐색 ===
console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  종합 밸런스 파라미터 탐색 시뮬레이션                              ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝');

// 현재 파라미터
const CURRENT: Params = {
  atkCoeff: 0.4, baseDmg: 5, defRate: 0.3, defCap: 30,
  ceCoeff: 0.01, ce0Bonus: 0, advMult: 1.1, disadvMult: 0.95
};

// 탐색할 후보들
const CANDIDATES: { name: string; params: Params }[] = [
  { name: "현재", params: CURRENT },
  // CE 영향력 축소
  { name: "CE÷2", params: { ...CURRENT, ceCoeff: 0.005 } },
  { name: "CE÷1.5+CE0보너스15%", params: { ...CURRENT, ceCoeff: 0.007, ce0Bonus: 0.15 } },
  // DEF 영향력 강화
  { name: "DEF강화(0.6/25)", params: { ...CURRENT, defRate: 0.6, defCap: 25 } },
  { name: "DEF강화(0.8/20)", params: { ...CURRENT, defRate: 0.8, defCap: 20 } },
  // 복합: CE축소 + DEF강화
  { name: "CE0.007+DEF0.6+CE0보15%", params: { ...CURRENT, ceCoeff: 0.007, defRate: 0.6, defCap: 25, ce0Bonus: 0.15 } },
  { name: "CE0.005+DEF0.8+CE0보15%", params: { ...CURRENT, ceCoeff: 0.005, defRate: 0.8, defCap: 20, ce0Bonus: 0.15 } },
  // 속성 배율 조정
  { name: "속성1.08/0.96", params: { ...CURRENT, advMult: 1.08, disadvMult: 0.96 } },
  { name: "속성1.12/0.93", params: { ...CURRENT, advMult: 1.12, disadvMult: 0.93 } },
  // 종합 최적 후보
  { name: "종합A: CE7+DEF0.6+CE0_15+속성1.08", params: {
    atkCoeff: 0.4, baseDmg: 5, defRate: 0.6, defCap: 25,
    ceCoeff: 0.007, ce0Bonus: 0.15, advMult: 1.08, disadvMult: 0.96
  }},
  { name: "종합B: CE5+DEF0.8+CE0_15+속성1.1", params: {
    atkCoeff: 0.4, baseDmg: 5, defRate: 0.8, defCap: 20,
    ceCoeff: 0.005, ce0Bonus: 0.15, advMult: 1.1, disadvMult: 0.95
  }},
  { name: "종합C: CE6+DEF0.7+CE0_12+속성1.1", params: {
    atkCoeff: 0.4, baseDmg: 5, defRate: 0.7, defCap: 22,
    ceCoeff: 0.006, ce0Bonus: 0.12, advMult: 1.1, disadvMult: 0.95
  }},
  { name: "종합D: CE7+DEF0.5+CE0_10+ATK0.35", params: {
    atkCoeff: 0.35, baseDmg: 6, defRate: 0.5, defCap: 25,
    ceCoeff: 0.007, ce0Bonus: 0.10, advMult: 1.1, disadvMult: 0.95
  }},
];

const SEARCH_TRIALS = 200; // 탐색 시 trial 수 (속도 위해)

console.log(`\n탐색 조건: ${CANDIDATES.length}개 파라미터 셋, 개인리그 ${SEARCH_TRIALS}회\n`);
console.log(`${'이름'.padEnd(36)} ${'점수'.padStart(7)} | ${'특급t'.padStart(5)} ${'특급i'.padStart(5)} | ${'준특t'.padStart(5)} ${'준특i'.padStart(5)} | ${'1급t'.padStart(5)} ${'1급i'.padStart(5)} | ${'준1t'.padStart(5)} ${'준1i'.padStart(5)}`);
console.log('─'.repeat(110));

let bestScore = Infinity;
let bestName = '';
let bestParams: Params = CURRENT;

for (const cand of CANDIDATES) {
  const result = calcBalanceScore(cand.params, SEARCH_TRIALS);
  const d = result.details;

  const line = `${cand.name.padEnd(36)} ${result.score.toFixed(1).padStart(7)} | ${d['특급'].tStd.toFixed(1).padStart(5)} ${d['특급'].iStd.toFixed(1).padStart(5)} | ${d['준특급'].tStd.toFixed(1).padStart(5)} ${d['준특급'].iStd.toFixed(1).padStart(5)} | ${d['1급'].tStd.toFixed(1).padStart(5)} ${d['1급'].iStd.toFixed(1).padStart(5)} | ${d['준1급'].tStd.toFixed(1).padStart(5)} ${d['준1급'].iStd.toFixed(1).padStart(5)}`;
  console.log(line);

  if (result.score < bestScore) {
    bestScore = result.score;
    bestName = cand.name;
    bestParams = cand.params;
  }
}

console.log('─'.repeat(110));
console.log(`\n🏆 최적 파라미터: ${bestName} (점수: ${bestScore})`);
console.log(`  ATK계수: ${bestParams.atkCoeff} | 기본데미지: ${bestParams.baseDmg}`);
console.log(`  DEF감소율: ${bestParams.defRate} | DEF상한: ${bestParams.defCap}%`);
console.log(`  CE계수: ${bestParams.ceCoeff} | CE0보너스: ${bestParams.ce0Bonus}`);
console.log(`  속성배율: ${bestParams.advMult}/${bestParams.disadvMult}`);

// === 최적 파라미터로 상세 분석 ===
console.log('\n' + '═'.repeat(75));
console.log('최적 파라미터 상세 결과 (500회 시뮬레이션)');
console.log('═'.repeat(75));

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
      if (i !== j && simTeam(chars[i], chars[j], bestParams) === 'A') tWins[i]++;

  const iMat: number[][] = Array.from({length: n}, () => new Array(n).fill(50));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      iMat[i][j] = simIndiv(chars[i], chars[j], bestParams, DETAIL_TRIALS) * 100;
      iMat[j][i] = 100 - iMat[i][j];
    }

  console.log(`\n【${grade}】 ${n}명`);
  console.log(`${'순위'.padEnd(4)} ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)} CE  HP  ${'팀리그'.padStart(6)} ${'개인리그'.padStart(7)} ${'차이'.padStart(5)}`);

  const results = chars.map((c, i) => {
    const tWR = Math.round(tWins[i] / (n - 1) * 1000) / 10;
    const iWR = Math.round((iMat[i].reduce((s, v) => s + v, 0) / n) * 10) / 10;
    return { name: c.name, attr: c.attr, ce: c.ce, hp: c.hp, tWR, iWR, diff: Math.round(Math.abs(tWR - iWR) * 10) / 10 };
  }).sort((a, b) => ((b.tWR + b.iWR) / 2) - ((a.tWR + a.iWR) / 2));

  results.forEach((r, i) => {
    const avg = ((r.tWR + r.iWR) / 2).toFixed(1);
    let flag = '';
    if (r.tWR >= 70 || r.iWR >= 70) flag = '⚠️OP';
    else if (r.tWR <= 30 || r.iWR <= 30) flag = '⚠️WEAK';
    else if (r.diff >= 20) flag = '⚠️격차';
    else flag = '✅';
    console.log(`${(i+1).toString().padStart(2)}   ${r.name.padEnd(14)} ${(ATTR_KO[r.attr]||r.attr).padEnd(4)} ${r.ce.toString().padStart(2)} ${r.hp.toString().padStart(3)}  ${r.tWR.toFixed(1).padStart(5)}% ${r.iWR.toFixed(1).padStart(5)}%  ${r.diff.toFixed(1).padStart(4)}%p  ${flag}  평균${avg}%`);
  });

  const tRates = results.map(r => r.tWR);
  const iRates = results.map(r => r.iWR);
  const tStd = Math.sqrt(tRates.reduce((s, v) => s + (v - 50) ** 2, 0) / n);
  const iStd = Math.sqrt(iRates.reduce((s, v) => s + (v - 50) ** 2, 0) / n);
  console.log(`  밸런스: 팀 표준편차 ${tStd.toFixed(1)}%p | 개인 표준편차 ${iStd.toFixed(1)}%p | 팀-개인 평균차이 ${(results.reduce((s,r)=>s+r.diff,0)/n).toFixed(1)}%p`);
}

// === 현재 vs 최적 비교 ===
console.log('\n' + '═'.repeat(75));
console.log('현재 파라미터 vs 최적 파라미터 비교');
console.log('═'.repeat(75));
console.log(`
${'항목'.padEnd(20)} ${'현재'.padStart(15)} ${'최적'.padStart(15)} ${'변화'.padStart(10)}
${'─'.repeat(65)}
${'ATK 계수'.padEnd(20)} ${CURRENT.atkCoeff.toString().padStart(15)} ${bestParams.atkCoeff.toString().padStart(15)} ${(bestParams.atkCoeff === CURRENT.atkCoeff ? '동일' : '변경').padStart(10)}
${'기본 데미지'.padEnd(18)} ${CURRENT.baseDmg.toString().padStart(15)} ${bestParams.baseDmg.toString().padStart(15)} ${(bestParams.baseDmg === CURRENT.baseDmg ? '동일' : '변경').padStart(10)}
${'DEF 감소율'.padEnd(19)} ${CURRENT.defRate.toString().padStart(15)} ${bestParams.defRate.toString().padStart(15)} ${(bestParams.defRate === CURRENT.defRate ? '동일' : '강화↑').padStart(10)}
${'DEF 감소 상한'.padEnd(18)} ${(CURRENT.defCap + '%').padStart(15)} ${(bestParams.defCap + '%').padStart(15)} ${(bestParams.defCap === CURRENT.defCap ? '동일' : '조정').padStart(10)}
${'CE 계수'.padEnd(20)} ${CURRENT.ceCoeff.toString().padStart(15)} ${bestParams.ceCoeff.toString().padStart(15)} ${(bestParams.ceCoeff === CURRENT.ceCoeff ? '동일' : '축소↓').padStart(10)}
${'CE0 보너스'.padEnd(19)} ${(CURRENT.ce0Bonus * 100 + '%').padStart(15)} ${(bestParams.ce0Bonus * 100 + '%').padStart(15)} ${(bestParams.ce0Bonus === CURRENT.ce0Bonus ? '동일' : '추가↑').padStart(10)}
${'속성 유리 배율'.padEnd(17)} ${'×' + CURRENT.advMult.toString()} ${'×' + bestParams.advMult.toString()} ${(bestParams.advMult === CURRENT.advMult ? '동일' : '조정').padStart(10)}
${'속성 불리 배율'.padEnd(17)} ${'×' + CURRENT.disadvMult.toString()} ${'×' + bestParams.disadvMult.toString()} ${(bestParams.disadvMult === CURRENT.disadvMult ? '동일' : '조정').padStart(10)}
`);

// 데미지 예시 비교
console.log('주요 캐릭터 데미지 비교 (상성 동등, 기본 전투):');
const samplePairs = [
  ['카시모', '하나미'], ['토우지', '마허라'], ['켄자쿠', '고죠 사토루'], ['메이메이', '이타도리 유지']
];
for (const [aName, bName] of samplePairs) {
  const a = CHARS.find(c => c.name === aName)!, b = CHARS.find(c => c.name === bName)!;
  const curDmg = calcDmg(a, b, CURRENT);
  const newDmg = calcDmg(a, b, bestParams);
  console.log(`  ${aName} → ${bName}: 현재 ${curDmg}dmg → 최적 ${newDmg}dmg (${newDmg > curDmg ? '+' : ''}${newDmg - curDmg})`);
}

console.log('\n' + '═'.repeat(75));
console.log('시뮬레이션 완료');
console.log('═'.repeat(75));

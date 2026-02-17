/**
 * 최종 밸런스 분석 시뮬레이션
 * 팀리그/개인리그 최종 차이점 + 전 캐릭터 밸런스 약점 도출
 */

// ============================
// 공통 상수
// ============================
const ADVANTAGE_MULTIPLIER = 1.1;
const DISADVANTAGE_MULTIPLIER = 0.95;

const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'],
  BODY:    ['BARRIER', 'CONVERT'],
  CURSE:   ['BODY', 'RANGE'],
  SOUL:    ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'],
  RANGE:   ['BODY', 'SOUL']
};

function getAttributeMultiplier(attacker: string, defender: string): number {
  if (ATTRIBUTE_ADVANTAGE[attacker]?.includes(defender)) return ADVANTAGE_MULTIPLIER;
  if (ATTRIBUTE_ADVANTAGE[defender]?.includes(attacker)) return DISADVANTAGE_MULTIPLIER;
  return 1.0;
}

const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주',
  SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

// ============================
// 전체 캐릭터 데이터 (최종 밸런스)
// ============================
interface CharData {
  name: string; grade: string; attribute: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number; tec: number; mnt: number;
}

const ALL_CHARS: CharData[] = [
  // === 특급 (6명) ===
  { name: "고죠 사토루", grade: "특급", attribute: "BARRIER", atk: 22, def: 20, spd: 22, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "료멘 스쿠나", grade: "특급", attribute: "CURSE", atk: 25, def: 18, spd: 22, ce: 24, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "켄자쿠", grade: "특급", attribute: "SOUL", atk: 20, def: 17, spd: 18, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "츠쿠모 유키", grade: "특급", attribute: "BODY", atk: 23, def: 16, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "옷코츠 유타", grade: "특급", attribute: "CURSE", atk: 22, def: 18, spd: 20, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "이타도리(최종전)", grade: "특급", attribute: "SOUL", atk: 21, def: 18, spd: 21, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },

  // === 준특급 (7명) ===
  { name: "게토 스구루", grade: "준특급", attribute: "CURSE", atk: 19, def: 18, spd: 18, ce: 22, hp: 93, crt: 10, tec: 10, mnt: 10 },
  { name: "텐겐", grade: "준특급", attribute: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "토우지", grade: "준특급", attribute: "BODY", atk: 23, def: 16, spd: 22, ce: 0, hp: 92, crt: 18, tec: 20, mnt: 10 },
  { name: "마허라", grade: "준특급", attribute: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "완전체 리카", grade: "준특급", attribute: "SOUL", atk: 22, def: 17, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "타마모노마에", grade: "준특급", attribute: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "다부라", grade: "준특급", attribute: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: 10, tec: 10, mnt: 10 },

  // === 1급 (25명) ===
  { name: "이타도리 유지", grade: "1급", attribute: "BODY", atk: 19, def: 16, spd: 20, ce: 18, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { name: "마키(각성)", grade: "1급", attribute: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 88, crt: 15, tec: 19, mnt: 8 },
  { name: "나나미 켄토", grade: "1급", attribute: "BODY", atk: 18, def: 17, spd: 16, ce: 18, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "죠고", grade: "1급", attribute: "CONVERT", atk: 22, def: 13, spd: 17, ce: 23, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "하나미", grade: "1급", attribute: "CONVERT", atk: 18, def: 19, spd: 16, ce: 20, hp: 92, crt: 10, tec: 10, mnt: 10 },
  { name: "나오비토", grade: "1급", attribute: "BODY", atk: 19, def: 14, spd: 22, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "나오야", grade: "1급", attribute: "BODY", atk: 18, def: 13, spd: 23, ce: 18, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "히구루마", grade: "1급", attribute: "BARRIER", atk: 17, def: 18, spd: 16, ce: 23, hp: 86, crt: 10, tec: 10, mnt: 10 },
  { name: "카시모", grade: "1급", attribute: "CONVERT", atk: 22, def: 15, spd: 22, ce: 21, hp: 86, crt: 10, tec: 10, mnt: 10 },
  { name: "이시고리 류", grade: "1급", attribute: "RANGE", atk: 23, def: 15, spd: 14, ce: 20, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "우로 타카코", grade: "1급", attribute: "BARRIER", atk: 18, def: 16, spd: 20, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "하카리", grade: "1급", attribute: "BARRIER", atk: 21, def: 16, spd: 20, ce: 22, hp: 87, crt: 10, tec: 10, mnt: 10 },
  { name: "쵸소", grade: "1급", attribute: "CURSE", atk: 18, def: 16, spd: 17, ce: 19, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "토도 아오이", grade: "1급", attribute: "BODY", atk: 20, def: 16, spd: 17, ce: 17, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { name: "우라우메", grade: "1급", attribute: "CONVERT", atk: 17, def: 17, spd: 18, ce: 20, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "요로즈", grade: "1급", attribute: "CONVERT", atk: 19, def: 15, spd: 17, ce: 21, hp: 83, crt: 10, tec: 10, mnt: 10 },
  { name: "마히토", grade: "1급", attribute: "SOUL", atk: 19, def: 15, spd: 19, ce: 22, hp: 83, crt: 10, tec: 10, mnt: 10 },
  { name: "메이메이", grade: "1급", attribute: "RANGE", atk: 18, def: 15, spd: 16, ce: 18, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "다곤", grade: "1급", attribute: "CONVERT", atk: 19, def: 17, spd: 16, ce: 21, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { name: "메카마루", grade: "1급", attribute: "RANGE", atk: 19, def: 17, spd: 14, ce: 21, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "미겔", grade: "1급", attribute: "BODY", atk: 20, def: 16, spd: 19, ce: 18, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { name: "포창신", grade: "1급", attribute: "CURSE", atk: 18, def: 18, spd: 14, ce: 22, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { name: "쿠로우루시", grade: "1급", attribute: "CURSE", atk: 18, def: 14, spd: 18, ce: 20, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "만상", grade: "1급", attribute: "CONVERT", atk: 19, def: 16, spd: 16, ce: 20, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "츠루기", grade: "1급", attribute: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 87, crt: 15, tec: 19, mnt: 8 },

  // === 준1급 (17명) ===
  { name: "후시구로 메구미", grade: "준1급", attribute: "SOUL", atk: 16, def: 15, spd: 17, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "이누마키 토게", grade: "준1급", attribute: "CURSE", atk: 14, def: 13, spd: 16, ce: 21, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { name: "젠인 마키", grade: "준1급", attribute: "BODY", atk: 17, def: 15, spd: 18, ce: 5, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "천사/하나", grade: "준1급", attribute: "BARRIER", atk: 15, def: 17, spd: 16, ce: 22, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "레지 스타", grade: "준1급", attribute: "RANGE", atk: 16, def: 14, spd: 17, ce: 19, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "타카바", grade: "준1급", attribute: "SOUL", atk: 14, def: 18, spd: 15, ce: 20, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "젠인 진이치", grade: "준1급", attribute: "BODY", atk: 17, def: 16, spd: 15, ce: 16, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "젠인 오기", grade: "준1급", attribute: "CONVERT", atk: 18, def: 14, spd: 16, ce: 17, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { name: "카모 노리토시", grade: "준1급", attribute: "CONVERT", atk: 15, def: 14, spd: 17, ce: 18, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "하제노키", grade: "준1급", attribute: "RANGE", atk: 16, def: 12, spd: 17, ce: 17, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { name: "쿠사카베", grade: "준1급", attribute: "BODY", atk: 16, def: 16, spd: 15, ce: 14, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { name: "우이우이", grade: "준1급", attribute: "BARRIER", atk: 14, def: 14, spd: 18, ce: 21, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { name: "옷코츠 유카", grade: "준1급", attribute: "BODY", atk: 16, def: 13, spd: 18, ce: 17, hp: 76, crt: 10, tec: 10, mnt: 10 },
  { name: "크로스", grade: "준1급", attribute: "CONVERT", atk: 18, def: 15, spd: 17, ce: 19, hp: 80, crt: 10, tec: 10, mnt: 10 },
  { name: "마루", grade: "준1급", attribute: "BARRIER", atk: 15, def: 16, spd: 16, ce: 23, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { name: "우사미", grade: "준1급", attribute: "CURSE", atk: 15, def: 14, spd: 16, ce: 21, hp: 76, crt: 10, tec: 10, mnt: 10 },
  { name: "야가 마사미치", grade: "준1급", attribute: "SOUL", atk: 15, def: 15, spd: 14, ce: 18, hp: 82, crt: 10, tec: 10, mnt: 10 },
];

// ============================
// 통일 데미지 공식 (기본)
// ============================
function calcBaseDamage(atk: number, def: number, atkAttr: string, defAttr: string, ce: number): number {
  let dmg = Math.round(atk * 0.4 + 5);
  const defRed = Math.min(def * 0.3, 30);
  dmg = Math.round(dmg * (1 - defRed / 100));
  dmg = Math.round(dmg * getAttributeMultiplier(atkAttr, defAttr));
  dmg = Math.round(dmg * (1 + ce / 100));
  return Math.max(5, dmg);
}

// ============================
// 팀리그 시뮬 (결정적 + 스킬 없는 기본 전투)
// ============================
function simTeam(a: CharData, b: CharData): { winner: 'A' | 'B' | 'DRAW'; turns: number } {
  const dmgAB = calcBaseDamage(a.atk, b.def, a.attribute, b.attribute, a.ce);
  const dmgBA = calcBaseDamage(b.atk, a.def, b.attribute, a.attribute, b.ce);
  let aHp = a.hp, bHp = b.hp;
  const aFirst = a.spd > b.spd ? true : b.spd > a.spd ? false : true;
  let t = 0;
  while (aHp > 0 && bHp > 0 && t < 100) {
    t++;
    if (aFirst) { bHp -= dmgAB; if (bHp <= 0) break; aHp -= dmgBA; }
    else { aHp -= dmgBA; if (aHp <= 0) break; bHp -= dmgAB; }
  }
  return { winner: aHp > bHp ? 'A' : aHp < bHp ? 'B' : 'DRAW', turns: t };
}

// ============================
// 개인리그 시뮬 (랜덤 + 게이지/스킬/크리티컬)
// ============================
function simIndiv(a: CharData, b: CharData, trials: number): number {
  let aWins = 0;
  for (let tr = 0; tr < trials; tr++) {
    let aHp = a.hp, bHp = b.hp;
    let aFirst = a.spd > b.spd ? true : b.spd > a.spd ? false : Math.random() > 0.5;
    let aG = 0, bG = 0;
    for (let t = 1; t <= 30 && aHp > 0 && bHp > 0; t++) {
      const isA = (t % 2 === 1) ? aFirst : !aFirst;
      const atk = isA ? a : b, dfd = isA ? b : a;
      let dmg = calcBaseDamage(atk.atk, dfd.def, atk.attribute, dfd.attribute, atk.ce);
      dmg = Math.round(dmg * (0.9 + Math.random() * 0.2)); // ±10%
      const g = isA ? aG : bG;
      if (g >= 100) { dmg = Math.round(dmg * 2.0); if (isA) aG = 0; else bG = 0; }
      else if (Math.random() < 0.3) dmg = Math.round(dmg * 1.3);
      if (Math.random() < atk.crt / 150) dmg = Math.round(dmg * 1.5);
      dmg = Math.max(5, dmg);
      if (isA) bHp -= dmg; else aHp -= dmg;
      aG = Math.min(100, aG + 25); bG = Math.min(100, bG + 25);
    }
    if (aHp > bHp) aWins++;
  }
  return aWins / trials;
}

// ============================
// 실행
// ============================
const TRIALS = 500;
const grades = ['특급', '준특급', '1급', '준1급'];

console.log('╔═══════════════════════════════════════════════════════════════════════╗');
console.log('║  최종 밸런스 분석 리포트                                              ║');
console.log('╚═══════════════════════════════════════════════════════════════════════╝');

// ==============================
// PART 1: 최종 차이점 정리
// ==============================
console.log('\n' + '═'.repeat(75));
console.log('PART 1: 팀리그 vs 개인리그 최종 차이점');
console.log('═'.repeat(75));
console.log(`
┌─────────────────────┬──────────────────────────┬──────────────────────────┐
│        항목          │       팀리그              │       개인리그            │
├─────────────────────┼──────────────────────────┼──────────────────────────┤
│ 기본 데미지          │ ATK×0.4+5 (동일)         │ ATK×0.4+5 (동일)         │
│ 방어력              │ min(DEF×0.3,30)% (동일)   │ min(DEF×0.3,30)% (동일)  │
│ 속성 배율           │ 1.1/0.95 (동일)           │ 1.1/0.95 (동일)          │
│ CE 배율             │ 1+CE/100 (동일)           │ 1+CE/100 (동일)          │
│ HP                  │ 캐릭터 HP (동일)          │ 캐릭터 HP (동일)         │
│ 최소 데미지          │ 5 (동일)                 │ 5 (동일)                 │
├─────────────────────┼──────────────────────────┼──────────────────────────┤
│ 데미지 변동          │ 없음 (결정적)             │ ±10% 랜덤               │
│ 스킬 시스템          │ 캐릭터 고유 스킬효과       │ 30% 확률 ×1.3 스킬       │
│ 필살기              │ 게이지 시스템 (별도)       │ 게이지 +25/턴, 2.0× 필살 │
│ 크리티컬            │ 스킬 기반               │ CRT/150 확률 × 1.5       │
│ 경기장              │ 속성보너스/봉인/속도역전   │ 속성보너스/패널티         │
│ 스탯총합 보정        │ 없음                    │ ±20% (총합차/1000)       │
│ 턴 제한             │ 100턴                   │ 30턴                    │
│ 선공                │ SPD 비교                │ SPD 비교 (교대 공격)     │
│ 전투 방식           │ 선/후공 고정 교대         │ 턴별 교대               │
└─────────────────────┴──────────────────────────┴──────────────────────────┘
`);

// ==============================
// PART 2: 등급별 전체 시뮬레이션
// ==============================
console.log('═'.repeat(75));
console.log('PART 2: 등급별 전체 카드 시뮬레이션 (팀리그 + 개인리그)');
console.log('═'.repeat(75));

interface CardResult {
  name: string; attr: string; ce: number; hp: number;
  teamWR: number; indivWR: number; diff: number;
  teamRank: number; indivRank: number;
}

const allResults: Record<string, CardResult[]> = {};

for (const grade of grades) {
  const chars = ALL_CHARS.filter(c => c.grade === grade);
  const n = chars.length;

  // 팀리그 (결정적)
  const teamWins = new Array(n).fill(0);
  const teamTotal = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const r = simTeam(chars[i], chars[j]);
      if (r.winner === 'A') teamWins[i]++;
      teamTotal[i]++;
    }
  }

  // 개인리그 (랜덤)
  const indivRates: number[][] = Array.from({length: n}, () => new Array(n).fill(0.5));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      indivRates[i][j] = simIndiv(chars[i], chars[j], TRIALS);
      indivRates[j][i] = 1 - indivRates[i][j];
    }
  }

  const results: CardResult[] = chars.map((c, i) => {
    const twr = Math.round((teamWins[i] / teamTotal[i]) * 1000) / 10;
    const iwr = Math.round((indivRates[i].reduce((s, v) => s + v, 0) / n) * 1000) / 10;
    return {
      name: c.name, attr: c.attribute, ce: c.ce, hp: c.hp,
      teamWR: twr, indivWR: iwr, diff: Math.round(Math.abs(twr - iwr) * 10) / 10,
      teamRank: 0, indivRank: 0
    };
  });

  // 순위 매기기
  const teamSorted = [...results].sort((a, b) => b.teamWR - a.teamWR);
  teamSorted.forEach((r, i) => r.teamRank = i + 1);
  const indivSorted = [...results].sort((a, b) => b.indivWR - a.indivWR);
  indivSorted.forEach((r, i) => r.indivRank = i + 1);

  allResults[grade] = results;

  // 출력
  console.log(`\n${'─'.repeat(75)}`);
  console.log(`【${grade}】 ${n}명 라운드로빈 (팀리그: 결정적 | 개인리그: ${TRIALS}회)`);
  console.log(`${'─'.repeat(75)}`);

  // 팀리그 순위 기준 출력
  const sorted = [...results].sort((a, b) => b.teamWR - a.teamWR);
  console.log(`${'순위'.padEnd(4)} ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(5)} CE  HP  ${'팀리그'.padStart(6)} ${'개인리그'.padStart(7)} ${'차이'.padStart(6)}  판정`);
  for (const r of sorted) {
    const ceStr = r.ce.toString().padStart(2);
    const hpStr = r.hp.toString().padStart(3);
    const team = r.teamWR.toFixed(1).padStart(5) + '%';
    const indiv = r.indivWR.toFixed(1).padStart(5) + '%';
    const diff = r.diff.toFixed(1).padStart(5) + '%p';

    let flag = '';
    if (r.teamWR >= 75 || r.indivWR >= 75) flag = '⚠️OP';
    else if (r.teamWR <= 25 || r.indivWR <= 25) flag = '⚠️WEAK';
    else if (r.diff >= 20) flag = '⚠️격차';
    else if (r.ce === 0) flag = '📌CE0';
    else flag = '✅';

    console.log(`${r.teamRank.toString().padStart(2)}/${r.indivRank.toString().padStart(2)} ${r.name.padEnd(14)} ${(ATTR_KO[r.attr] || r.attr).padEnd(5)} ${ceStr} ${hpStr}  ${team} ${indiv}  ${diff}  ${flag}`);
  }

  // 밸런스 지표
  const teamWRs = results.map(r => r.teamWR);
  const indivWRs = results.map(r => r.indivWR);
  const tAvg = teamWRs.reduce((s, v) => s + v, 0) / n;
  const iAvg = indivWRs.reduce((s, v) => s + v, 0) / n;
  const tStd = Math.sqrt(teamWRs.reduce((s, v) => s + (v - tAvg) ** 2, 0) / n);
  const iStd = Math.sqrt(indivWRs.reduce((s, v) => s + (v - iAvg) ** 2, 0) / n);

  console.log(`\n  밸런스 지표:`);
  console.log(`  팀리그:  ${Math.min(...teamWRs).toFixed(1)}%~${Math.max(...teamWRs).toFixed(1)}% (표준편차 ${tStd.toFixed(1)}%p)`);
  console.log(`  개인리그: ${Math.min(...indivWRs).toFixed(1)}%~${Math.max(...indivWRs).toFixed(1)}% (표준편차 ${iStd.toFixed(1)}%p)`);
  console.log(`  팀-개인 평균 차이: ${(results.reduce((s, r) => s + r.diff, 0) / n).toFixed(1)}%p`);
}

// ==============================
// PART 3: 속성별 밸런스 분석
// ==============================
console.log('\n' + '═'.repeat(75));
console.log('PART 3: 속성별 평균 승률 분석 (개인리그 기준)');
console.log('═'.repeat(75));

for (const grade of grades) {
  const results = allResults[grade];
  const attrGroups: Record<string, number[]> = {};
  for (const r of results) {
    if (!attrGroups[r.attr]) attrGroups[r.attr] = [];
    attrGroups[r.attr].push(r.indivWR);
  }

  console.log(`\n【${grade}】`);
  const entries = Object.entries(attrGroups).sort((a, b) => {
    const avgA = a[1].reduce((s, v) => s + v, 0) / a[1].length;
    const avgB = b[1].reduce((s, v) => s + v, 0) / b[1].length;
    return avgB - avgA;
  });

  for (const [attr, wrs] of entries) {
    const avg = wrs.reduce((s, v) => s + v, 0) / wrs.length;
    const cnt = wrs.length;
    const bar = '█'.repeat(Math.round(avg / 2));
    console.log(`  ${(ATTR_KO[attr] || attr).padEnd(4)} (${cnt}명) 평균 ${avg.toFixed(1).padStart(5)}%  ${bar}`);
  }
}

// ==============================
// PART 4: 밸런스 약점 종합
// ==============================
console.log('\n' + '═'.repeat(75));
console.log('PART 4: 밸런스 약점 종합 리포트');
console.log('═'.repeat(75));

// OP 캐릭터
console.log('\n🔴 과도하게 강한 캐릭터 (어느 리그든 승률 ≥70%):');
for (const grade of grades) {
  for (const r of allResults[grade]) {
    if (r.teamWR >= 70 || r.indivWR >= 70) {
      console.log(`  ${r.name.padEnd(14)} [${grade}] 팀${r.teamWR.toFixed(1)}%/개인${r.indivWR.toFixed(1)}% | ATK${r.attr === 'BODY' ? '💪' : ''}${(allResults[grade] as any).__proto__ ? '' : ''} CE:${r.ce} HP:${r.hp}`);
    }
  }
}

// WEAK 캐릭터
console.log('\n🔵 과도하게 약한 캐릭터 (어느 리그든 승률 ≤30%):');
for (const grade of grades) {
  for (const r of allResults[grade]) {
    if (r.teamWR <= 30 || r.indivWR <= 30) {
      console.log(`  ${r.name.padEnd(14)} [${grade}] 팀${r.teamWR.toFixed(1)}%/개인${r.indivWR.toFixed(1)}% | CE:${r.ce} HP:${r.hp} 속성:${ATTR_KO[r.attr]}`);
    }
  }
}

// 팀/개인 큰 격차
console.log('\n🟡 팀-개인 승률 격차 ≥20%p:');
for (const grade of grades) {
  for (const r of allResults[grade]) {
    if (r.diff >= 20) {
      console.log(`  ${r.name.padEnd(14)} [${grade}] 팀${r.teamWR.toFixed(1)}% vs 개인${r.indivWR.toFixed(1)}% (차이: ${r.diff.toFixed(1)}%p) | 팀${r.teamRank}위/개인${r.indivRank}위`);
    }
  }
}

// CE 0 캐릭터 분석
console.log('\n📌 CE 0 캐릭터 분석:');
for (const grade of grades) {
  for (const r of allResults[grade]) {
    if (r.ce === 0) {
      const chars = ALL_CHARS.filter(c => c.grade === grade);
      const char = chars.find(c => c.name === r.name)!;
      const avgTeam = allResults[grade].reduce((s, x) => s + x.teamWR, 0) / allResults[grade].length;
      const avgIndiv = allResults[grade].reduce((s, x) => s + x.indivWR, 0) / allResults[grade].length;
      console.log(`  ${r.name.padEnd(14)} [${grade}] 팀${r.teamWR.toFixed(1)}%(평균${avgTeam.toFixed(1)}%) 개인${r.indivWR.toFixed(1)}%(평균${avgIndiv.toFixed(1)}%)`);
      console.log(`    → ATK:${char.atk} DEF:${char.def} SPD:${char.spd} CE:0 HP:${char.hp} CRT:${char.crt} TEC:${char.tec}`);
      console.log(`    → CE 배율 ×1.0 (타 캐릭: ×1.17~1.25) = 데미지 17~25% 불이익`);
    }
  }
}

// 속성 불균형
console.log('\n📊 등급내 속성 수 분포:');
for (const grade of grades) {
  const chars = ALL_CHARS.filter(c => c.grade === grade);
  const attrCount: Record<string, number> = {};
  for (const c of chars) {
    attrCount[c.attribute] = (attrCount[c.attribute] || 0) + 1;
  }
  const counts = Object.entries(attrCount)
    .sort((a, b) => b[1] - a[1])
    .map(([a, n]) => `${ATTR_KO[a]}:${n}`)
    .join(' ');
  console.log(`  ${grade.padEnd(4)}: ${counts}`);

  // 없는 속성 체크
  const allAttrs = ['BARRIER', 'BODY', 'CURSE', 'SOUL', 'CONVERT', 'RANGE'];
  const missing = allAttrs.filter(a => !attrCount[a]);
  if (missing.length > 0) {
    console.log(`    ⚠️ 없는 속성: ${missing.map(a => ATTR_KO[a]).join(', ')}`);
  }
}

console.log('\n' + '═'.repeat(75));
console.log('분석 완료');
console.log('═'.repeat(75));

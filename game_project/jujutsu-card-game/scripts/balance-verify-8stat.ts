/**
 * 8스탯 통합 밸런스 검증 시뮬레이션
 *
 * 실제 구현 코드(battleCalculator.ts / individualBattleSimulator.ts)를
 * 정확히 미러링하여 전체 카드 라운드로빈 밸런스 분석
 *
 * 팀리그 공식 (battleCalculator.ts):
 *   (ATK×0.4+5) × (1-min(DEF×0.7,22)%) × (1-MNT×0.5%)
 *   × 속성배율 × CE배율 × [TEC스킬 30%→×1.3] × [CRT크리 CRT/150→×1.5]
 *
 * 개인리그 공식 (individualBattleSimulator.ts):
 *   위 + 총합보정(±20%) + 랜덤(±10%) + 게이지필살기(×2.0) + TEC스킬 + CRT크리
 */

const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'], BODY: ['BARRIER', 'CONVERT'],
  CURSE: ['BODY', 'RANGE'], SOUL: ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'], RANGE: ['BODY', 'SOUL']
};

// 속성 배율 (constants.ts 반영)
const ADV_MULT = 1.15;
const DISADV_MULT = 0.92;

function getAttrMult(aAttr: string, dAttr: string): number {
  if (ATTRIBUTE_ADVANTAGE[aAttr]?.includes(dAttr)) return ADV_MULT;
  if (ATTRIBUTE_ADVANTAGE[dAttr]?.includes(aAttr)) return DISADV_MULT;
  return 1.0;
}

interface C {
  name: string; grade: string; attr: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number; tec: number; mnt: number;
}

// CE0: 실제 TEC/MNT, 일반: 기본값 10/10 (battleCalculator.ts ensureFullStats 반영)
const CHARS: C[] = [
  // 특급 (6명)
  { name: "고죠 사토루", grade: "특급", attr: "BARRIER", atk: 22, def: 20, spd: 22, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "료멘 스쿠나", grade: "특급", attr: "CURSE", atk: 25, def: 18, spd: 22, ce: 24, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "켄자쿠", grade: "특급", attr: "SOUL", atk: 20, def: 17, spd: 18, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "츠쿠모 유키", grade: "특급", attr: "BODY", atk: 23, def: 16, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "옷코츠 유타", grade: "특급", attr: "CURSE", atk: 22, def: 18, spd: 20, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "이타도리(최종전)", grade: "특급", attr: "SOUL", atk: 21, def: 18, spd: 21, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },
  // 준특급 (7명)
  { name: "게토 스구루", grade: "준특급", attr: "CURSE", atk: 19, def: 18, spd: 18, ce: 22, hp: 93, crt: 10, tec: 10, mnt: 10 },
  { name: "텐겐", grade: "준특급", attr: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "토우지", grade: "준특급", attr: "BODY", atk: 23, def: 16, spd: 22, ce: 0, hp: 92, crt: 18, tec: 20, mnt: 10 },
  { name: "마허라", grade: "준특급", attr: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "완전체 리카", grade: "준특급", attr: "SOUL", atk: 22, def: 17, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "타마모노마에", grade: "준특급", attr: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "다부라", grade: "준특급", attr: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: 10, tec: 10, mnt: 10 },
  // 1급 (25명)
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
  { name: "쵸소", grade: "1급", attr: "CURSE", atk: 18, def: 16, spd: 17, ce: 19, hp: 88, crt: 10, tec: 10, mnt: 10 },
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
  // 준1급 (17명)
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

// === 팀리그 데미지 계산 (battleCalculator.ts 미러링, 스킬효과/경기장 제외) ===
function teamCalcDmg(a: C, b: C): number {
  // 1. ATK 기반
  let dmg = Math.round(a.atk * 0.4 + 5);
  // 2. DEF 감소 (max 22%)
  const defRed = Math.min(b.def * 0.7, 22);
  dmg = Math.round(dmg * (1 - defRed / 100));
  // 3. MNT 감소
  const mntRed = b.mnt * 0.5;
  dmg = Math.round(dmg * (1 - mntRed / 100));
  // 4. 속성
  dmg = Math.round(dmg * getAttrMult(a.attr, b.attr));
  // 5. CE
  const ceM = a.ce === 0 ? 1.12 : 1 + a.ce * 0.006;
  dmg = Math.round(dmg * ceM);
  // 6. 경기장 (시뮬에서는 생략 - 평균 효과)
  // 7. TEC 스킬 (20% + TEC×1%)
  if (Math.random() < (20 + a.tec * 1.0) / 100) {
    dmg = Math.round(dmg * 1.3);
  }
  // 8. CRT 크리티컬 (CRT/150)
  if (Math.random() < a.crt / 150) {
    dmg = Math.round(dmg * 1.5);
  }
  return Math.max(5, dmg);
}

// === 팀리그 1회 전투 ===
function simTeamOnce(a: C, b: C): 'A' | 'B' | 'DRAW' {
  let ah = a.hp, bh = b.hp;
  const aFirst = a.spd >= b.spd;
  for (let t = 0; t < 100 && ah > 0 && bh > 0; t++) {
    if (aFirst) {
      bh -= teamCalcDmg(a, b); if (bh <= 0) break;
      ah -= teamCalcDmg(b, a);
    } else {
      ah -= teamCalcDmg(b, a); if (ah <= 0) break;
      bh -= teamCalcDmg(a, b);
    }
  }
  return ah > bh ? 'A' : bh > ah ? 'B' : 'DRAW';
}

// 팀리그 N회 평균
function simTeam(a: C, b: C, trials: number): number {
  let aw = 0;
  for (let i = 0; i < trials; i++) if (simTeamOnce(a, b) === 'A') aw++;
  return aw / trials;
}

// === 개인리그 데미지 계산 (individualBattleSimulator.ts 미러링) ===
function indivCalcDmg(a: C, b: C, aTotal: number, bTotal: number, forceUlt: boolean): { dmg: number; crit: boolean } {
  // 1. ATK
  let dmg = Math.round(a.atk * 0.4 + 5);
  // 2. DEF
  const defRed = Math.min(b.def * 0.7, 22);
  dmg = Math.round(dmg * (1 - defRed / 100));
  // 3. MNT
  const mntRed = b.mnt * 0.5;
  dmg = Math.round(dmg * (1 - mntRed / 100));
  // 4. 속성
  dmg = Math.round(dmg * getAttrMult(a.attr, b.attr));
  // 5. CE
  const ceM = a.ce === 0 ? 1.12 : 1 + a.ce * 0.006;
  dmg = Math.round(dmg * ceM);
  // 6. 최소
  dmg = Math.max(5, dmg);
  // 7. 총합 보정
  const diff = aTotal - bTotal;
  dmg = Math.round(dmg * Math.max(0.8, Math.min(1.2, 1 + diff / 1000)));
  // 8. 랜덤 ±10%
  dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));
  // 9. 액션: 필살기 or TEC스킬 or 기본
  let mult = 1.0;
  if (forceUlt) {
    mult = 2.0;
  } else {
    const tecChance = 20 + a.tec * 1.0;
    if (Math.random() * 100 < tecChance) mult = 1.3;
  }
  // 10. CRT
  const crit = Math.random() < a.crt / 150;
  let finalDmg = Math.round(dmg * mult);
  if (crit) finalDmg = Math.round(finalDmg * 1.5);
  return { dmg: Math.max(5, finalDmg), crit };
}

function calcTotal(c: C): number {
  return c.atk + c.def + c.spd + c.ce + c.hp;
}

// === 개인리그 1세트 ===
function simIndivOnce(a: C, b: C): 'A' | 'B' | 'DRAW' {
  let ah = a.hp, bh = b.hp;
  let aF = a.spd > b.spd ? true : b.spd > a.spd ? false : Math.random() > 0.5;
  let aG = 0, bG = 0;
  const aT = calcTotal(a), bT = calcTotal(b);

  for (let turn = 1; turn <= 30 && ah > 0 && bh > 0; turn++) {
    const isA = (turn % 2 === 1) ? aF : !aF;
    const atk = isA ? a : b, dfd = isA ? b : a;
    const atkT = isA ? aT : bT, dfdT = isA ? bT : aT;
    const g = isA ? aG : bG;

    const forceUlt = g >= 100;
    const { dmg } = indivCalcDmg(atk, dfd, atkT, dfdT, forceUlt);

    if (forceUlt) { if (isA) aG = 0; else bG = 0; }
    if (isA) bh -= dmg; else ah -= dmg;
    aG = Math.min(100, aG + 25);
    bG = Math.min(100, bG + 25);
  }
  return ah > bh ? 'A' : bh > ah ? 'B' : 'DRAW';
}

// 개인리그 N회
function simIndiv(a: C, b: C, trials: number): number {
  let aw = 0;
  for (let i = 0; i < trials; i++) if (simIndivOnce(a, b) === 'A') aw++;
  return aw / trials;
}

// ====================================================================
// 메인
// ====================================================================
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  8스탯 통합 밸런스 검증 (실제 구현 로직 미러링)              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('현재 적용된 8스탯 전투 공식:');
console.log('  ATK → (ATK×0.4+5) 기본 데미지');
console.log('  DEF → min(DEF×0.7, 22%) 피해 감소');
console.log('  SPD → 선공 판정');
console.log('  CE  → 1+CE×0.006 배율 (CE0: ×1.12)');
console.log('  HP  → 캐릭터 고유 체력');
console.log('  CRT → CRT/150 크리티컬 확률, ×1.5');
console.log('  TEC → (20%+TEC×1%) 스킬 발동, ×1.3');
console.log('  MNT → MNT×0.5% 추가 피해 감소');
console.log('  속성 → 유리 ×1.15 / 불리 ×0.92\n');

const TEAM_TRIALS = 30;  // 팀리그 (랜덤 요소 있으므로 다회)
const INDIV_TRIALS = 500; // 개인리그

const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

const allGradeResults: Record<string, any[]> = {};

for (const grade of ['특급', '준특급', '1급', '준1급']) {
  const chars = CHARS.filter(c => c.grade === grade);
  const n = chars.length;

  process.stdout.write(`  ${grade} 시뮬레이션 중... `);

  // 팀리그 (N회 평균)
  const tMat: number[][] = Array.from({length: n}, () => new Array(n).fill(0.5));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      tMat[i][j] = simTeam(chars[i], chars[j], TEAM_TRIALS);
      tMat[j][i] = 1 - tMat[i][j];
    }

  // 개인리그
  const iMat: number[][] = Array.from({length: n}, () => new Array(n).fill(0.5));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      iMat[i][j] = simIndiv(chars[i], chars[j], INDIV_TRIALS);
      iMat[j][i] = 1 - iMat[i][j];
    }

  console.log('완료');

  const charResults = chars.map((c, i) => {
    const tWR = +(tMat[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1) * 100).toFixed(1);
    const iWR = +(iMat[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1) * 100).toFixed(1);
    const avg = +((tWR + iWR) / 2).toFixed(1);
    const diff = +Math.abs(tWR - iWR).toFixed(1);
    return { ...c, tWR, iWR, avg, diff };
  }).sort((a, b) => b.avg - a.avg);

  allGradeResults[grade] = charResults;
}

// === 출력 ===
console.log('\n' + '═'.repeat(95));
console.log('등급별 상세 전투 결과');
console.log('═'.repeat(95));

let totalOK = 0, totalOP = 0, totalWK = 0, totalGap = 0;

for (const grade of ['특급', '준특급', '1급', '준1급']) {
  const results = allGradeResults[grade];
  const n = results.length;

  console.log(`\n【${grade}】 ${n}명`);
  console.log(`${'#'.padStart(2)}  ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)} ${'ATK'.padStart(3)} ${'DEF'.padStart(3)} ${'SPD'.padStart(3)} ${'CE'.padStart(3)} ${'HP'.padStart(3)} ${'CRT'.padStart(3)} ${'TEC'.padStart(3)} ${'MNT'.padStart(3)}  ${'팀WR'.padStart(6)} ${'개인WR'.padStart(7)}  ${'평균'.padStart(5)}  ${'차이'.padStart(5)}  상태`);
  console.log('─'.repeat(95));

  let ok = 0, op = 0, wk = 0, gap = 0;
  results.forEach((r: any, i: number) => {
    let flag = '';
    if (r.avg >= 65) { flag = '⚠OP'; op++; }
    else if (r.avg <= 35) { flag = '⚠WK'; wk++; }
    else if (r.diff >= 20) { flag = '⚠격차'; gap++; }
    else { flag = '✅'; ok++; }
    console.log(
      `${(i+1).toString().padStart(2)}  ${r.name.padEnd(14)} ${ATTR_KO[r.attr].padEnd(4)} ` +
      `${r.atk.toString().padStart(3)} ${r.def.toString().padStart(3)} ${r.spd.toString().padStart(3)} ${r.ce.toString().padStart(3)} ${r.hp.toString().padStart(3)} ${r.crt.toString().padStart(3)} ${r.tec.toString().padStart(3)} ${r.mnt.toString().padStart(3)}  ` +
      `${r.tWR.toFixed(1).padStart(5)}% ${r.iWR.toFixed(1).padStart(6)}%  ${r.avg.toFixed(1).padStart(5)}%  ${r.diff.toFixed(1).padStart(4)}%p  ${flag}`
    );
  });

  const tRates = results.map((r: any) => r.tWR);
  const iRates = results.map((r: any) => r.iWR);
  const tAvg = tRates.reduce((s: number, v: number) => s + v, 0) / n;
  const iAvg = iRates.reduce((s: number, v: number) => s + v, 0) / n;
  const tStd = Math.sqrt(tRates.reduce((s: number, v: number) => s + (v - tAvg) ** 2, 0) / n);
  const iStd = Math.sqrt(iRates.reduce((s: number, v: number) => s + (v - iAvg) ** 2, 0) / n);
  const avgDiff = results.reduce((s: number, r: any) => s + r.diff, 0) / n;

  console.log(`  ✅${ok}  ⚠OP:${op}  ⚠WK:${wk}  ⚠격차:${gap}  |  팀σ=${tStd.toFixed(1)}  개인σ=${iStd.toFixed(1)}  |  팀-개인 평균차이=${avgDiff.toFixed(1)}%p`);
  totalOK += ok; totalOP += op; totalWK += wk; totalGap += gap;
}

// === 속성별 분석 ===
console.log('\n' + '═'.repeat(95));
console.log('속성별 평균 승률 분석');
console.log('═'.repeat(95));

for (const grade of ['특급', '준특급', '1급', '준1급']) {
  const results = allGradeResults[grade];
  const attrGroups: Record<string, { tWR: number[]; iWR: number[] }> = {};
  for (const r of results) {
    const ak = ATTR_KO[r.attr];
    if (!attrGroups[ak]) attrGroups[ak] = { tWR: [], iWR: [] };
    attrGroups[ak].tWR.push(r.tWR);
    attrGroups[ak].iWR.push(r.iWR);
  }
  console.log(`\n【${grade}】`);
  for (const [attr, g] of Object.entries(attrGroups)) {
    const tAvg = (g.tWR.reduce((s, v) => s + v, 0) / g.tWR.length).toFixed(1);
    const iAvg = (g.iWR.reduce((s, v) => s + v, 0) / g.iWR.length).toFixed(1);
    const cnt = g.tWR.length;
    console.log(`  ${attr.padEnd(4)} (${cnt}명): 팀 평균 ${tAvg}% | 개인 평균 ${iAvg}%`);
  }
}

// === CE0 캐릭터 전용 분석 ===
console.log('\n' + '═'.repeat(95));
console.log('CE0 캐릭터 보상 효과 분석');
console.log('═'.repeat(95));

const ce0Names = ['토우지', '마키(각성)', '츠루기'];
for (const grade of ['준특급', '1급']) {
  const results = allGradeResults[grade];
  const gradeChars = results.filter((r: any) => ce0Names.includes(r.name));
  const normalAvg = results.filter((r: any) => !ce0Names.includes(r.name)).reduce((s: number, r: any) => s + r.avg, 0)
    / results.filter((r: any) => !ce0Names.includes(r.name)).length;

  for (const c of gradeChars) {
    const crtPct = (c.crt / 150 * 100).toFixed(1);
    const tecPct = (20 + c.tec * 1.0).toFixed(0);
    const mntPct = (c.mnt * 0.5).toFixed(1);
    console.log(`\n  ${c.name} (${grade}) — 평균승률 ${c.avg}% (등급 일반 평균: ${normalAvg.toFixed(1)}%)`);
    console.log(`    CE0 보너스: ×1.12 | CRT ${c.crt} → 크리${crtPct}% | TEC ${c.tec} → 스킬${tecPct}% | MNT ${c.mnt} → 감소${mntPct}%`);
    console.log(`    팀 ${c.tWR}% / 개인 ${c.iWR}% | 차이 ${c.diff}%p`);
  }
}

// === 종합 요약 ===
console.log('\n' + '═'.repeat(95));
console.log('종합 밸런스 요약');
console.log('═'.repeat(95));
const total = totalOK + totalOP + totalWK + totalGap;
console.log(`\n  전체 ${total}명: ✅${totalOK} (${(totalOK/total*100).toFixed(0)}%)  ⚠OP:${totalOP}  ⚠WK:${totalWK}  ⚠격차:${totalGap}`);
console.log(`  밸런스 통과율: ${(totalOK/total*100).toFixed(1)}%`);
console.log(`\n  판정 기준: 평균승률 35~65% = ✅ | 65%+ = ⚠OP | 35%- = ⚠WK | 차이20%p+ = ⚠격차`);

console.log('\n' + '═'.repeat(95));
console.log('시뮬레이션 완료');
console.log('═'.repeat(95));

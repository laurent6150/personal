/**
 * CE0 캐릭터 밸런스 튜닝
 * CRT/TEC/MNT 값을 탐색하여 등급 내 ~50% 승률 달성하는 최적값 찾기
 *
 * 대상: 토우지(준특급), 마키각성(1급), 츠루기(1급)
 */

const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'], BODY: ['BARRIER', 'CONVERT'],
  CURSE: ['BODY', 'RANGE'], SOUL: ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'], RANGE: ['BODY', 'SOUL']
};
const ADV = 1.08, DIS = 0.96;
function getAttrMult(a: string, b: string): number {
  if (ATTRIBUTE_ADVANTAGE[a]?.includes(b)) return ADV;
  if (ATTRIBUTE_ADVANTAGE[b]?.includes(a)) return DIS;
  return 1.0;
}

interface C {
  id: string; name: string; grade: string; attr: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number; tec: number; mnt: number; total: number;
}
const D = 50;

// 준특급 7명
const SEMI_SPECIAL: C[] = [
  { id: "geto", name: "게토 스구루", grade: "준특급", attr: "CURSE", atk: 21, def: 18, spd: 18, ce: 22, hp: 98, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tengen", name: "텐겐", grade: "준특급", attr: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "toji", name: "토우지", grade: "준특급", attr: "BODY", atk: 23, def: 16, spd: 21, ce: 0, hp: 92, crt: 18, tec: 20, mnt: 10, total: 0 },
  { id: "mahoraga", name: "마허라", grade: "준특급", attr: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "rika", name: "완전체 리카", grade: "준특급", attr: "CURSE", atk: 21, def: 17, spd: 19, ce: 24, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tamamo", name: "타마모노마에", grade: "준특급", attr: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 96, crt: D, tec: D, mnt: D, total: 0 },
  { id: "dabura", name: "다부라", grade: "준특급", attr: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
];

// 1급 25명
const FIRST_GRADE: C[] = [
  { id: "yuji", name: "이타도리 유지", grade: "1급", attr: "BODY", atk: 18, def: 16, spd: 19, ce: 18, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "maki_aw", name: "마키(각성)", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 19, ce: 0, hp: 88, crt: 15, tec: 19, mnt: 8, total: 0 },
  { id: "nanami", name: "나나미 켄토", grade: "1급", attr: "BODY", atk: 18, def: 17, spd: 16, ce: 18, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "jogo", name: "죠고", grade: "1급", attr: "CONVERT", atk: 21, def: 13, spd: 17, ce: 23, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "hanami", name: "하나미", grade: "1급", attr: "CONVERT", atk: 18, def: 19, spd: 16, ce: 20, hp: 92, crt: D, tec: D, mnt: D, total: 0 },
  { id: "naobito", name: "나오비토", grade: "1급", attr: "BODY", atk: 18, def: 14, spd: 20, ce: 19, hp: 82, crt: D, tec: D, mnt: D, total: 0 },
  { id: "naoya", name: "나오야", grade: "1급", attr: "BODY", atk: 18, def: 13, spd: 23, ce: 18, hp: 78, crt: D, tec: D, mnt: D, total: 0 },
  { id: "higuruma", name: "히구루마", grade: "1급", attr: "BARRIER", atk: 17, def: 18, spd: 16, ce: 23, hp: 86, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kashimo", name: "카시모", grade: "1급", attr: "CONVERT", atk: 21, def: 15, spd: 20, ce: 21, hp: 86, crt: D, tec: D, mnt: D, total: 0 },
  { id: "ryu", name: "이시고리 류", grade: "1급", attr: "RANGE", atk: 23, def: 15, spd: 14, ce: 20, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "uro", name: "우로 타카코", grade: "1급", attr: "BARRIER", atk: 18, def: 16, spd: 20, ce: 19, hp: 82, crt: D, tec: D, mnt: D, total: 0 },
  { id: "hakari", name: "하카리", grade: "1급", attr: "BARRIER", atk: 19, def: 16, spd: 19, ce: 22, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "choso", name: "쵸소", grade: "1급", attr: "CONVERT", atk: 19, def: 16, spd: 17, ce: 19, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "todo", name: "토도 아오이", grade: "1급", attr: "BODY", atk: 20, def: 16, spd: 17, ce: 17, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "uraume", name: "우라우메", grade: "1급", attr: "CONVERT", atk: 17, def: 17, spd: 18, ce: 20, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yorozu", name: "요로즈", grade: "1급", attr: "CONVERT", atk: 21, def: 15, spd: 17, ce: 21, hp: 87, crt: D, tec: D, mnt: D, total: 0 },
  { id: "mahito", name: "마히토", grade: "1급", attr: "SOUL", atk: 19, def: 15, spd: 19, ce: 22, hp: 83, crt: D, tec: D, mnt: D, total: 0 },
  { id: "meimei", name: "메이메이", grade: "1급", attr: "RANGE", atk: 20, def: 15, spd: 16, ce: 18, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "dagon", name: "다곤", grade: "1급", attr: "CONVERT", atk: 19, def: 17, spd: 16, ce: 21, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "mechamaru", name: "메카마루", grade: "1급", attr: "RANGE", atk: 19, def: 17, spd: 14, ce: 21, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "miguel", name: "미겔", grade: "1급", attr: "BODY", atk: 18, def: 16, spd: 19, ce: 18, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "smallpox", name: "포창신", grade: "1급", attr: "CURSE", atk: 18, def: 18, spd: 14, ce: 22, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kurourushi", name: "쿠로우루시", grade: "1급", attr: "CURSE", atk: 19, def: 14, spd: 18, ce: 20, hp: 84, crt: D, tec: D, mnt: D, total: 0 },
  { id: "bansho", name: "만상", grade: "1급", attr: "CONVERT", atk: 21, def: 16, spd: 16, ce: 20, hp: 91, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tsurugi", name: "츠루기", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 19, ce: 0, hp: 87, crt: 15, tec: 19, mnt: 8, total: 0 },
];

function initTotals(chars: C[]) {
  for (const c of chars) c.total = c.atk + c.def + c.spd + c.ce + c.hp;
}

// ═══ 전투 로직 ═══
const B = {
  ATK_COEFF: 0.4, BASE_DMG: 5,
  DEF_RATE: 0.7, MAX_DEF: 22,
  CE_COEFF: 0.006, CE0_BONUS: 0.12,
  TEC_BASE: 20, TEC_RATE: 1.0,
  SKILL_MULT: 1.3, ULT_MULT: 2.0,
  CRT_DIV: 150, CRT_MULT: 1.5,
  MNT_RATE: 0.5, MIN_DMG: 5, MAX_TURNS: 30,
  GAUGE_CHARGE: 25,
};

function calcDamage(atk: C, def: C, forceUlt: boolean): number {
  let dmg = Math.round(atk.atk * B.ATK_COEFF + B.BASE_DMG);
  dmg = Math.round(dmg * (1 - Math.min(def.def * B.DEF_RATE, B.MAX_DEF) / 100));
  dmg = Math.round(dmg * (1 - def.mnt * B.MNT_RATE / 100));
  dmg = Math.round(dmg * getAttrMult(atk.attr, def.attr));
  const ceM = atk.ce === 0 ? (1 + B.CE0_BONUS) : (1 + atk.ce * B.CE_COEFF);
  dmg = Math.round(dmg * ceM);
  dmg = Math.max(dmg, B.MIN_DMG);
  const diff = atk.total - def.total;
  dmg = Math.round(dmg * Math.max(0.8, Math.min(1.2, 1 + diff / 1000)));
  dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));

  let mult = 1.0;
  if (forceUlt) mult = B.ULT_MULT;
  else {
    const tecChance = B.TEC_BASE + atk.tec * B.TEC_RATE;
    if (Math.random() * 100 < tecChance) mult = B.SKILL_MULT;
  }
  const isCrit = Math.random() < atk.crt / B.CRT_DIV;
  let finalDmg = Math.round(dmg * mult);
  if (isCrit) finalDmg = Math.round(finalDmg * B.CRT_MULT);
  return Math.max(B.MIN_DMG, finalDmg);
}

function simBattle(a: C, b: C): boolean {
  let aHp = a.hp, bHp = b.hp;
  let aG = 0, bG = 0;
  let aIsAttacker = a.spd >= b.spd;
  for (let turn = 1; turn <= B.MAX_TURNS && aHp > 0 && bHp > 0; turn++) {
    const atk = aIsAttacker ? a : b;
    const def = aIsAttacker ? b : a;
    const atkG = aIsAttacker ? aG : bG;
    const forceUlt = atkG >= 100;
    const dmg = calcDamage(atk, def, forceUlt);
    if (aIsAttacker) {
      bHp = Math.max(0, bHp - dmg);
      if (forceUlt) aG = 0;
      else { aG = Math.min(100, aG + B.GAUGE_CHARGE); bG = Math.min(100, bG + B.GAUGE_CHARGE); }
    } else {
      aHp = Math.max(0, aHp - dmg);
      if (forceUlt) bG = 0;
      else { aG = Math.min(100, aG + B.GAUGE_CHARGE); bG = Math.min(100, bG + B.GAUGE_CHARGE); }
    }
    aIsAttacker = !aIsAttacker;
  }
  return aHp > bHp;
}

function gradeWR(target: C, group: C[], trials: number): number {
  let totalWR = 0;
  for (const opp of group) {
    if (opp.id === target.id) continue;
    let wins = 0;
    for (let t = 0; t < trials; t++) {
      if (simBattle(target, opp)) wins++;
    }
    totalWR += wins / trials;
  }
  return totalWR / (group.length - 1);
}

// ═══ CE0 캐릭터별 최적값 탐색 ═══

const TRIALS = 3000;

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  CE0 캐릭터 CRT/TEC/MNT 최적값 탐색                         ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// CE0 캐릭터의 컨셉:
// - 저주력이 0이지만 신체능력이 극대화
// - CRT(크리티컬): 높아야 함 (신체능력 = 정밀한 공격)
// - TEC(기술): 높아야 함 (전투 기술)
// - MNT(정신력): 보통~낮음 (저주력 없으므로 정신적 방어 약함, 하지만 전투 의지는 강함)

// 탐색 범위: CRT 40~70, TEC 40~70, MNT 20~50 (5 단위)
const crtRange = [40, 45, 50, 55, 60, 65, 70];
const tecRange = [40, 45, 50, 55, 60, 65, 70];
const mntRange = [20, 25, 30, 35, 40, 45, 50];

// ──── 토우지 (준특급) ────
console.log('━━━ 토우지 (준특급/신체) ━━━');
console.log('현재: CRT18/TEC20/MNT10 → 등급내 3.2%\n');

const toji = SEMI_SPECIAL.find(c => c.id === 'toji')!;
let bestToji = { crt: 0, tec: 0, mnt: 0, wr: 0, diff: 1 };

// 거친 탐색 (10단위)
const coarseResults: { crt: number, tec: number, mnt: number, wr: number }[] = [];

for (const crt of crtRange) {
  for (const mnt of mntRange) {
    // TEC는 50으로 고정하여 탐색 시간 절약 (후에 미세 조정)
    const tec = 50;
    toji.crt = crt; toji.tec = tec; toji.mnt = mnt;
    initTotals(SEMI_SPECIAL);
    const wr = gradeWR(toji, SEMI_SPECIAL, TRIALS);
    coarseResults.push({ crt, tec, mnt, wr });
    if (Math.abs(wr - 0.50) < bestToji.diff) {
      bestToji = { crt, tec, mnt, wr, diff: Math.abs(wr - 0.50) };
    }
  }
}

console.log('  CRT/MNT 탐색 (TEC=50 고정):');
console.log(`  ${'CRT\\MNT'.padEnd(8)} ${mntRange.map(m => m.toString().padStart(5)).join('')}`);
for (const crt of crtRange) {
  const row = mntRange.map(mnt => {
    const r = coarseResults.find(x => x.crt === crt && x.mnt === mnt)!;
    const wrStr = (r.wr * 100).toFixed(0);
    return wrStr.padStart(5);
  }).join('');
  console.log(`  ${('CRT' + crt).padEnd(8)} ${row}`);
}

// 50% 근처 조합 미세 조정 (TEC도 탐색)
console.log(`\n  1차 최적: CRT${bestToji.crt}/TEC50/MNT${bestToji.mnt} → ${(bestToji.wr*100).toFixed(1)}%`);

// 미세 조정: 최적 CRT/MNT 근처에서 TEC도 탐색
const fineCrt = [bestToji.crt - 5, bestToji.crt, bestToji.crt + 5];
const fineMnt = [bestToji.mnt - 5, bestToji.mnt, bestToji.mnt + 5];
let finalToji = { ...bestToji };

console.log('\n  미세 조정 (CRT/TEC/MNT 동시 탐색):');
for (const crt of fineCrt) {
  for (const tec of tecRange) {
    for (const mnt of fineMnt) {
      if (crt < 35 || mnt < 15) continue;
      toji.crt = crt; toji.tec = tec; toji.mnt = mnt;
      initTotals(SEMI_SPECIAL);
      const wr = gradeWR(toji, SEMI_SPECIAL, TRIALS);
      if (Math.abs(wr - 0.50) < finalToji.diff) {
        finalToji = { crt, tec, mnt, wr, diff: Math.abs(wr - 0.50) };
      }
    }
  }
}
console.log(`  ★ 토우지 최적: CRT${finalToji.crt}/TEC${finalToji.tec}/MNT${finalToji.mnt} → ${(finalToji.wr*100).toFixed(1)}%\n`);

// 토우지 값 확정
toji.crt = finalToji.crt; toji.tec = finalToji.tec; toji.mnt = finalToji.mnt;
initTotals(SEMI_SPECIAL);

// ──── 마키(각성) & 츠루기 (1급) ────
console.log('━━━ 마키(각성) & 츠루기 (1급/신체) ━━━');
console.log('현재: 마키 CRT15/TEC19/MNT8 → 6.2%, 츠루기 CRT15/TEC19/MNT8 → 2.9%\n');

const maki = FIRST_GRADE.find(c => c.id === 'maki_aw')!;
const tsurugi = FIRST_GRADE.find(c => c.id === 'tsurugi')!;

// 마키와 츠루기는 같은 CRT/TEC/MNT를 공유 (비슷한 신체능력 캐릭터)
// 단, 마키가 ATK+0, HP+1 더 높으므로 약간 더 강할 것
let bestMaki = { crt: 0, tec: 0, mnt: 0, wrMaki: 0, wrTsurugi: 0, diff: 1 };

console.log('  CRT/MNT 탐색 (TEC=50 고정):');
console.log(`  ${'CRT\\MNT'.padEnd(8)} ${mntRange.map(m => ('MNT' + m).padStart(8)).join('')}`);

for (const crt of crtRange) {
  const rowParts: string[] = [];
  for (const mnt of mntRange) {
    maki.crt = crt; maki.tec = 50; maki.mnt = mnt;
    tsurugi.crt = crt; tsurugi.tec = 50; tsurugi.mnt = mnt;
    initTotals(FIRST_GRADE);
    const wrM = gradeWR(maki, FIRST_GRADE, TRIALS);
    const wrT = gradeWR(tsurugi, FIRST_GRADE, TRIALS);
    const avgWR = (wrM + wrT) / 2;
    rowParts.push(`${(wrM*100).toFixed(0)}/${(wrT*100).toFixed(0)}`.padStart(8));
    if (Math.abs(avgWR - 0.50) < bestMaki.diff) {
      bestMaki = { crt, tec: 50, mnt, wrMaki: wrM, wrTsurugi: wrT, diff: Math.abs(avgWR - 0.50) };
    }
  }
  console.log(`  ${('CRT' + crt).padEnd(8)} ${rowParts.join('')}`);
}

console.log(`\n  1차 최적: CRT${bestMaki.crt}/TEC50/MNT${bestMaki.mnt} → 마키 ${(bestMaki.wrMaki*100).toFixed(1)}%, 츠루기 ${(bestMaki.wrTsurugi*100).toFixed(1)}%`);

// 미세 조정
const fineCrt2 = [bestMaki.crt - 5, bestMaki.crt, bestMaki.crt + 5];
const fineMnt2 = [bestMaki.mnt - 5, bestMaki.mnt, bestMaki.mnt + 5];
let finalMaki = { ...bestMaki };

for (const crt of fineCrt2) {
  for (const tec of tecRange) {
    for (const mnt of fineMnt2) {
      if (crt < 35 || mnt < 15) continue;
      maki.crt = crt; maki.tec = tec; maki.mnt = mnt;
      tsurugi.crt = crt; tsurugi.tec = tec; tsurugi.mnt = mnt;
      initTotals(FIRST_GRADE);
      const wrM = gradeWR(maki, FIRST_GRADE, TRIALS);
      const wrT = gradeWR(tsurugi, FIRST_GRADE, TRIALS);
      const avgWR = (wrM + wrT) / 2;
      if (Math.abs(avgWR - 0.50) < finalMaki.diff) {
        finalMaki = { crt, tec, mnt, wrMaki: wrM, wrTsurugi: wrT, diff: Math.abs(avgWR - 0.50) };
      }
    }
  }
}
console.log(`  ★ 마키/츠루기 최적: CRT${finalMaki.crt}/TEC${finalMaki.tec}/MNT${finalMaki.mnt} → 마키 ${(finalMaki.wrMaki*100).toFixed(1)}%, 츠루기 ${(finalMaki.wrTsurugi*100).toFixed(1)}%\n`);

// ──── 최종 결과 ────
console.log('═══════════════════════════════════════════════════════════════');
console.log('  최종 추천 CE0 스탯');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`  토우지 (준특급):  CRT ${finalToji.crt} / TEC ${finalToji.tec} / MNT ${finalToji.mnt}  → 등급내 ${(finalToji.wr*100).toFixed(1)}%`);
console.log(`    (변경: CRT 18→${finalToji.crt}, TEC 20→${finalToji.tec}, MNT 10→${finalToji.mnt})`);
console.log(`  마키각성 (1급):   CRT ${finalMaki.crt} / TEC ${finalMaki.tec} / MNT ${finalMaki.mnt}  → 등급내 ${(finalMaki.wrMaki*100).toFixed(1)}%`);
console.log(`    (변경: CRT 15→${finalMaki.crt}, TEC 19→${finalMaki.tec}, MNT 8→${finalMaki.mnt})`);
console.log(`  츠루기 (1급):    CRT ${finalMaki.crt} / TEC ${finalMaki.tec} / MNT ${finalMaki.mnt}  → 등급내 ${(finalMaki.wrTsurugi*100).toFixed(1)}%`);
console.log(`    (변경: CRT 15→${finalMaki.crt}, TEC 19→${finalMaki.tec}, MNT 8→${finalMaki.mnt})`);

/**
 * 특급 등급 내부 편차 소폭 조정 튜닝
 *
 * 현재 문제:
 *   이타도리(최종전) 74.1% OP — SPD21(선공 독점) + SOUL(3명에게 유리)
 *   옷코츠 유타 31.0% WK — CURSE 속성이 SOUL 2명에게 약함
 *   츠쿠모 유키 40.5% — 살짝 약함
 *
 * 목표: 격차 43%p → 30%p 이하로 축소 (소폭 조정)
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

function gradeWRs(chars: C[], trials: number): { name: string, wr: number }[] {
  const n = chars.length;
  return chars.map((c, i) => {
    let totalWR = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      let wins = 0;
      for (let t = 0; t < trials; t++) {
        if (simBattle(c, chars[j])) wins++;
      }
      totalWR += wins / trials;
    }
    return { name: c.name, wr: totalWR / (n - 1) };
  }).sort((a, b) => b.wr - a.wr);
}

function evalGrade(chars: C[], trials: number): { results: { name: string, wr: number }[], std: number, range: number } {
  for (const c of chars) c.total = c.atk + c.def + c.spd + c.ce + c.hp;
  const results = gradeWRs(chars, trials);
  const avg = results.reduce((s, r) => s + r.wr, 0) / results.length;
  const std = Math.sqrt(results.reduce((s, r) => s + (r.wr - avg) ** 2, 0) / results.length);
  const range = results[0].wr - results[results.length - 1].wr;
  return { results, std, range };
}

const TRIALS = 5000;

// ═══ 현재 상태 확인 ═══

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  특급 등급 내부 편차 조정 (소폭)                              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

function makeSpecialGrade(overrides: Partial<Record<string, Partial<C>>> = {}): C[] {
  const base: C[] = [
    { id: "gojo", name: "고죠 사토루", grade: "특급", attr: "BARRIER", atk: 22, def: 20, spd: 20, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
    { id: "sukuna", name: "료멘 스쿠나", grade: "특급", attr: "CURSE", atk: 25, def: 18, spd: 20, ce: 24, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
    { id: "kenjaku", name: "켄자쿠", grade: "특급", attr: "SOUL", atk: 22, def: 17, spd: 18, ce: 25, hp: 104, crt: D, tec: D, mnt: D, total: 0 },
    { id: "yuki", name: "츠쿠모 유키", grade: "특급", attr: "BODY", atk: 24, def: 16, spd: 19, ce: 24, hp: 97, crt: D, tec: D, mnt: D, total: 0 },
    { id: "yuta", name: "옷코츠 유타", grade: "특급", attr: "CURSE", atk: 23, def: 18, spd: 20, ce: 25, hp: 102, crt: D, tec: D, mnt: D, total: 0 },
    { id: "yuji_final", name: "이타도리(최종전)", grade: "특급", attr: "SOUL", atk: 22, def: 18, spd: 21, ce: 22, hp: 97, crt: D, tec: D, mnt: D, total: 0 },
  ];
  for (const c of base) {
    if (overrides[c.id]) Object.assign(c, overrides[c.id]);
  }
  return base;
}

// 현재 상태
console.log('━━━ 현재 상태 ━━━\n');
const current = makeSpecialGrade();
const currentEval = evalGrade(current, TRIALS);
for (const r of currentEval.results) {
  const flag = r.wr >= 0.65 ? ' OP' : r.wr <= 0.35 ? ' WK' : '';
  console.log(`  ${r.name.padEnd(14)} ${(r.wr*100).toFixed(1)}%${flag}`);
}
console.log(`\n  표준편차: ${(currentEval.std*100).toFixed(1)}%, 격차: ${(currentEval.range*100).toFixed(1)}%p\n`);

// ═══ 조정 시나리오 탐색 ═══

console.log('━━━ 조정 시나리오 탐색 ━━━\n');

// 이타도리(최종전) OP 원인: SPD21(선공독점) + SOUL(3명에게 유리)
// 옷코츠 유타 WK 원인: 같은 CURSE인 스쿠나보다 약함 + SOUL 2명에게 불리
// 츠쿠모 유키 약세: BODY가 CURSE 2명에게 불리

// 시나리오 A: 이타도리 SPD 21→20 (선공 독점 해제)
// 시나리오 B: A + 유타 HP 102→105 (방어력 보강)
// 시나리오 C: A + 유키 HP 97→100 (방어력 보강)
// 시나리오 D: A + B + C (복합)
// 시나리오 E: 이타도리 SPD21→20, DEF18→17 + 유타 HP102→105 + 유키 DEF16→17
// 시나리오 F: 이타도리 CE22→21 + 유타 DEF18→19 + 유키 HP97→99

interface Scenario {
  label: string;
  overrides: Partial<Record<string, Partial<C>>>;
}

const scenarios: Scenario[] = [
  {
    label: 'A: 이타도리 SPD 21→20',
    overrides: { yuji_final: { spd: 20 } }
  },
  {
    label: 'B: A + 유타 HP 102→105',
    overrides: { yuji_final: { spd: 20 }, yuta: { hp: 105 } }
  },
  {
    label: 'C: A + 유키 HP 97→100',
    overrides: { yuji_final: { spd: 20 }, yuki: { hp: 100 } }
  },
  {
    label: 'D: A + 유타 HP+3, 유키 HP+3',
    overrides: { yuji_final: { spd: 20 }, yuta: { hp: 105 }, yuki: { hp: 100 } }
  },
  {
    label: 'E: 이타도리 SPD-1/DEF-1, 유타 HP+3, 유키 DEF+1',
    overrides: { yuji_final: { spd: 20, def: 17 }, yuta: { hp: 105 }, yuki: { def: 17 } }
  },
  {
    label: 'F: 이타도리 SPD-1, 유타 DEF+1, 유키 HP+2',
    overrides: { yuji_final: { spd: 20 }, yuta: { def: 19 }, yuki: { hp: 99 } }
  },
];

const scenarioResults: {
  label: string;
  results: { name: string, wr: number }[];
  std: number;
  range: number;
}[] = [];

for (const s of scenarios) {
  const chars = makeSpecialGrade(s.overrides);
  const evaluation = evalGrade(chars, TRIALS);
  scenarioResults.push({ label: s.label, ...evaluation });

  console.log(`  【${s.label}】`);
  for (const r of evaluation.results) {
    const flag = r.wr >= 0.65 ? ' OP' : r.wr <= 0.35 ? ' WK' : '';
    console.log(`    ${r.name.padEnd(14)} ${(r.wr*100).toFixed(1)}%${flag}`);
  }
  console.log(`    → 표준편차: ${(evaluation.std*100).toFixed(1)}%, 격차: ${(evaluation.range*100).toFixed(1)}%p\n`);
}

// ═══ 최적 시나리오 선택 ═══

console.log('━━━ 시나리오 비교 ━━━\n');
console.log(`  ${'시나리오'.padEnd(44)} 표준편차  격차    최고    최저`);
console.log('  ' + '─'.repeat(80));
console.log(`  ${'현재'.padEnd(44)} ${(currentEval.std*100).toFixed(1).padStart(5)}%  ${(currentEval.range*100).toFixed(0).padStart(3)}%p  ${(currentEval.results[0].wr*100).toFixed(0).padStart(4)}%  ${(currentEval.results[5].wr*100).toFixed(0).padStart(4)}%`);

for (const s of scenarioResults) {
  const best = s.results[0];
  const worst = s.results[s.results.length - 1];
  const improved = s.range < currentEval.range;
  console.log(`  ${s.label.padEnd(44)} ${(s.std*100).toFixed(1).padStart(5)}%  ${(s.range*100).toFixed(0).padStart(3)}%p  ${(best.wr*100).toFixed(0).padStart(4)}%  ${(worst.wr*100).toFixed(0).padStart(4)}%  ${improved ? '✅' : ''}`);
}

// 최적 선택 (격차가 가장 작은 시나리오)
const bestScenario = scenarioResults.reduce((best, s) => s.range < best.range ? s : best);
console.log(`\n  ★ 최적: ${bestScenario.label}`);
console.log(`    격차 ${(currentEval.range*100).toFixed(0)}%p → ${(bestScenario.range*100).toFixed(0)}%p (${((currentEval.range - bestScenario.range)*100).toFixed(0)}%p 감소)`);

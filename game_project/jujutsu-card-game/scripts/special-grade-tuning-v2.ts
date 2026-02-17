/**
 * 특급 등급 내부 편차 소폭 조정 v2
 * - 10000회 × 3라운드로 노이즈 감소
 * - 이타도리(최종전) OP 원인: SPD21 선공독점 + SOUL(결계/저주 3명에게 유리)
 * - 츠쿠모 유키 약세: BODY가 저주 2명에게 불리
 * - 옷코츠 유타 WK: SOUL 2명에게 불리 (전체 3~5위이므로 허용 범위)
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
  id: string; name: string; attr: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number; tec: number; mnt: number; total: number;
}
const D = 50;
const BB = {
  ATK_COEFF: 0.4, BASE_DMG: 5, DEF_RATE: 0.7, MAX_DEF: 22,
  CE_COEFF: 0.006, CE0_BONUS: 0.12, TEC_BASE: 20, TEC_RATE: 1.0,
  SKILL_MULT: 1.3, ULT_MULT: 2.0, CRT_DIV: 150, CRT_MULT: 1.5,
  MNT_RATE: 0.5, MIN_DMG: 5, MAX_TURNS: 30, GAUGE_CHARGE: 25,
};

function calcDmg(atk: C, def: C, ult: boolean): number {
  let d = Math.round(atk.atk * BB.ATK_COEFF + BB.BASE_DMG);
  d = Math.round(d * (1 - Math.min(def.def * BB.DEF_RATE, BB.MAX_DEF) / 100));
  d = Math.round(d * (1 - def.mnt * BB.MNT_RATE / 100));
  d = Math.round(d * getAttrMult(atk.attr, def.attr));
  d = Math.round(d * (atk.ce === 0 ? 1 + BB.CE0_BONUS : 1 + atk.ce * BB.CE_COEFF));
  d = Math.max(d, BB.MIN_DMG);
  d = Math.round(d * Math.max(0.8, Math.min(1.2, 1 + (atk.total - def.total) / 1000)));
  d = Math.round(d * (0.9 + Math.random() * 0.2));
  let m = ult ? BB.ULT_MULT : (Math.random() * 100 < BB.TEC_BASE + atk.tec * BB.TEC_RATE ? BB.SKILL_MULT : 1.0);
  let f = Math.round(d * m);
  if (Math.random() < atk.crt / BB.CRT_DIV) f = Math.round(f * BB.CRT_MULT);
  return Math.max(BB.MIN_DMG, f);
}

function sim(a: C, b: C): boolean {
  let aH = a.hp, bH = b.hp, aG = 0, bG = 0, aAtk = a.spd >= b.spd;
  for (let t = 1; t <= BB.MAX_TURNS && aH > 0 && bH > 0; t++) {
    const atk = aAtk ? a : b, def = aAtk ? b : a;
    const ult = (aAtk ? aG : bG) >= 100;
    const d = calcDmg(atk, def, ult);
    if (aAtk) { bH -= d; if (ult) aG = 0; else { aG = Math.min(100, aG + BB.GAUGE_CHARGE); bG = Math.min(100, bG + BB.GAUGE_CHARGE); } }
    else { aH -= d; if (ult) bG = 0; else { aG = Math.min(100, aG + BB.GAUGE_CHARGE); bG = Math.min(100, bG + BB.GAUGE_CHARGE); } }
    aAtk = !aAtk;
  }
  return aH > bH;
}

// ═══ 다라운드 평가 ═══
const ROUNDS = 3;
const TRIALS = 10000;

function evalMultiRound(chars: C[]): { name: string, avgWR: number, std: number }[] {
  for (const c of chars) c.total = c.atk + c.def + c.spd + c.ce + c.hp;
  const n = chars.length;
  const roundWRs: number[][] = chars.map(() => []);

  for (let r = 0; r < ROUNDS; r++) {
    const wm: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let w = 0;
        for (let t = 0; t < TRIALS; t++) { if (sim(chars[i], chars[j])) w++; }
        wm[i][j] = w / TRIALS; wm[j][i] = 1 - wm[i][j];
      }
    }
    for (let i = 0; i < n; i++) {
      const wr = wm[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1);
      roundWRs[i].push(wr);
    }
  }

  return chars.map((c, i) => {
    const avg = roundWRs[i].reduce((s, x) => s + x, 0) / ROUNDS;
    const std = Math.sqrt(roundWRs[i].reduce((s, x) => s + (x - avg) ** 2, 0) / ROUNDS);
    return { name: c.name, avgWR: avg, std };
  }).sort((a, b) => b.avgWR - a.avgWR);
}

function make(overrides: Record<string, Partial<C>> = {}): C[] {
  const base: C[] = [
    { id: "gojo", name: "고죠 사토루", attr: "BARRIER", atk: 22, def: 20, spd: 20, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
    { id: "sukuna", name: "료멘 스쿠나", attr: "CURSE", atk: 25, def: 18, spd: 20, ce: 24, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
    { id: "kenjaku", name: "켄자쿠", attr: "SOUL", atk: 22, def: 17, spd: 18, ce: 25, hp: 104, crt: D, tec: D, mnt: D, total: 0 },
    { id: "yuki", name: "츠쿠모 유키", attr: "BODY", atk: 24, def: 16, spd: 19, ce: 24, hp: 97, crt: D, tec: D, mnt: D, total: 0 },
    { id: "yuta", name: "옷코츠 유타", attr: "CURSE", atk: 23, def: 18, spd: 20, ce: 25, hp: 102, crt: D, tec: D, mnt: D, total: 0 },
    { id: "yuji_final", name: "이타도리(최종전)", attr: "SOUL", atk: 22, def: 18, spd: 21, ce: 22, hp: 97, crt: D, tec: D, mnt: D, total: 0 },
  ];
  for (const c of base) if (overrides[c.id]) Object.assign(c, overrides[c.id]);
  return base;
}

function printResult(label: string, results: { name: string, avgWR: number, std: number }[]) {
  console.log(`\n  【${label}】`);
  for (const r of results) {
    const flag = r.avgWR >= 0.65 ? ' OP' : r.avgWR <= 0.35 ? ' WK' : '';
    console.log(`    ${r.name.padEnd(14)} ${(r.avgWR*100).toFixed(1)}% ±${(r.std*100).toFixed(1)}%${flag}`);
  }
  const max = results[0].avgWR, min = results[results.length-1].avgWR;
  const range = max - min;
  const avg = results.reduce((s, r) => s + r.avgWR, 0) / results.length;
  const std = Math.sqrt(results.reduce((s, r) => s + (r.avgWR - avg) ** 2, 0) / results.length);
  console.log(`    → 표준편차 ${(std*100).toFixed(1)}%, 격차 ${(range*100).toFixed(0)}%p`);
  return { range, std, max, min };
}

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  특급 내부 편차 조정 v2 (3라운드 × 10000회)                   ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

// 현재 상태
const curRes = evalMultiRound(make());
const curStat = printResult('현재 상태', curRes);

// 시나리오들
const scenarios: { label: string, changes: string, o: Record<string, Partial<C>> }[] = [
  {
    label: 'A: 이타도리 소폭 너프',
    changes: '이타도리 SPD 21→20, CE 22→21',
    o: { yuji_final: { spd: 20, ce: 21 } }
  },
  {
    label: 'B: 하위 소폭 버프',
    changes: '유키 HP 97→100, 유타 HP 102→104',
    o: { yuki: { hp: 100 }, yuta: { hp: 104 } }
  },
  {
    label: 'C: 복합 (너프+버프)',
    changes: '이타도리 SPD 21→20 / 유키 HP 97→100',
    o: { yuji_final: { spd: 20 }, yuki: { hp: 100 } }
  },
  {
    label: 'D: 복합 (약한 너프+양쪽 버프)',
    changes: '이타도리 HP 97→95 / 유키 HP 97→100 / 유타 HP 102→104',
    o: { yuji_final: { hp: 95 }, yuki: { hp: 100 }, yuta: { hp: 104 } }
  },
  {
    label: 'E: 복합 (SPD 너프+양쪽 버프)',
    changes: '이타도리 SPD 21→20 / 유키 HP 97→100 / 유타 HP 102→104',
    o: { yuji_final: { spd: 20 }, yuki: { hp: 100 }, yuta: { hp: 104 } }
  },
];

const allStats: { label: string, range: number, std: number, max: number, min: number }[] = [
  { label: '현재', ...curStat }
];

for (const s of scenarios) {
  console.log(`\n  변경: ${s.changes}`);
  const res = evalMultiRound(make(s.o));
  const stat = printResult(s.label, res);
  allStats.push({ label: s.label, ...stat });
}

// 비교 요약
console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('  시나리오 비교 요약');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`  ${'시나리오'.padEnd(36)} 표준편차  격차    최고    최저   개선`);
console.log('  ' + '─'.repeat(75));

for (const s of allStats) {
  const improved = s.range < curStat.range ? `▼${((curStat.range - s.range)*100).toFixed(0)}%p` : (s === allStats[0] ? '기준' : '  -');
  console.log(
    `  ${s.label.padEnd(36)} ${(s.std*100).toFixed(1).padStart(5)}%  ${(s.range*100).toFixed(0).padStart(3)}%p` +
    `  ${(s.max*100).toFixed(0).padStart(4)}%  ${(s.min*100).toFixed(0).padStart(4)}%   ${improved}`
  );
}

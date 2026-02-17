/**
 * 개인리그 다회차 시뮬레이션 — 5라운드 × 2000회/매치업
 * 각 라운드별 순위 → 평균 순위 산출
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
  crt: number; tec: number; mnt: number;
  total: number;
}

const D = 50;

const ALL_CHARS: C[] = [
  // 특급 (6)
  { id: "gojo", name: "고죠 사토루", grade: "특급", attr: "BARRIER", atk: 22, def: 20, spd: 20, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "sukuna", name: "료멘 스쿠나", grade: "특급", attr: "CURSE", atk: 25, def: 18, spd: 20, ce: 24, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kenjaku", name: "켄자쿠", grade: "특급", attr: "SOUL", atk: 22, def: 17, spd: 18, ce: 25, hp: 104, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuki", name: "츠쿠모 유키", grade: "특급", attr: "BODY", atk: 24, def: 16, spd: 19, ce: 24, hp: 97, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuta", name: "옷코츠 유타", grade: "특급", attr: "CURSE", atk: 23, def: 18, spd: 20, ce: 25, hp: 102, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuji_final", name: "이타도리(최종전)", grade: "특급", attr: "SOUL", atk: 22, def: 18, spd: 21, ce: 22, hp: 97, crt: D, tec: D, mnt: D, total: 0 },
  // 준특급 (7)
  { id: "geto", name: "게토 스구루", grade: "준특급", attr: "CURSE", atk: 21, def: 18, spd: 18, ce: 22, hp: 98, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tengen", name: "텐겐", grade: "준특급", attr: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "toji", name: "토우지", grade: "준특급", attr: "BODY", atk: 23, def: 16, spd: 21, ce: 0, hp: 92, crt: 35, tec: 50, mnt: 45, total: 0 },
  { id: "mahoraga", name: "마허라", grade: "준특급", attr: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "rika", name: "완전체 리카", grade: "준특급", attr: "CURSE", atk: 21, def: 17, spd: 19, ce: 24, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tamamo", name: "타마모노마에", grade: "준특급", attr: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 96, crt: D, tec: D, mnt: D, total: 0 },
  { id: "dabura", name: "다부라", grade: "준특급", attr: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
  // 1급 (25)
  { id: "yuji", name: "이타도리 유지", grade: "1급", attr: "BODY", atk: 18, def: 16, spd: 19, ce: 18, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "maki_aw", name: "마키(각성)", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 19, ce: 0, hp: 88, crt: 35, tec: 50, mnt: 40, total: 0 },
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
  { id: "tsurugi", name: "츠루기", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 19, ce: 0, hp: 87, crt: 35, tec: 50, mnt: 40, total: 0 },
  // 준1급 (17)
  { id: "megumi", name: "후시구로 메구미", grade: "준1급", attr: "SOUL", atk: 14, def: 15, spd: 17, ce: 19, hp: 80, crt: D, tec: D, mnt: D, total: 0 },
  { id: "inumaki", name: "이누마키 토게", grade: "준1급", attr: "CURSE", atk: 15, def: 13, spd: 16, ce: 21, hp: 77, crt: D, tec: D, mnt: D, total: 0 },
  { id: "maki", name: "젠인 마키", grade: "준1급", attr: "BODY", atk: 17, def: 15, spd: 18, ce: 5, hp: 82, crt: D, tec: D, mnt: D, total: 0 },
  { id: "angel", name: "천사/하나", grade: "준1급", attr: "BARRIER", atk: 15, def: 17, spd: 16, ce: 22, hp: 79, crt: D, tec: D, mnt: D, total: 0 },
  { id: "reggie", name: "레지 스타", grade: "준1급", attr: "RANGE", atk: 16, def: 14, spd: 17, ce: 19, hp: 78, crt: D, tec: D, mnt: D, total: 0 },
  { id: "takaba", name: "타카바", grade: "준1급", attr: "SOUL", atk: 14, def: 18, spd: 15, ce: 20, hp: 83, crt: D, tec: D, mnt: D, total: 0 },
  { id: "jinichi", name: "젠인 진이치", grade: "준1급", attr: "BODY", atk: 17, def: 16, spd: 15, ce: 16, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "ogi", name: "젠인 오기", grade: "준1급", attr: "CONVERT", atk: 18, def: 14, spd: 16, ce: 17, hp: 82, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kamo", name: "카모 노리토시", grade: "준1급", attr: "CONVERT", atk: 15, def: 14, spd: 17, ce: 18, hp: 78, crt: D, tec: D, mnt: D, total: 0 },
  { id: "hazenoki", name: "하제노키", grade: "준1급", attr: "RANGE", atk: 16, def: 12, spd: 17, ce: 17, hp: 75, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kusakabe", name: "쿠사카베", grade: "준1급", attr: "BODY", atk: 16, def: 16, spd: 15, ce: 14, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "uiui", name: "우이우이", grade: "준1급", attr: "BARRIER", atk: 14, def: 14, spd: 18, ce: 21, hp: 75, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuka", name: "옷코츠 유카", grade: "준1급", attr: "BODY", atk: 14, def: 13, spd: 18, ce: 17, hp: 74, crt: D, tec: D, mnt: D, total: 0 },
  { id: "cross", name: "크로스", grade: "준1급", attr: "CONVERT", atk: 18, def: 15, spd: 17, ce: 19, hp: 80, crt: D, tec: D, mnt: D, total: 0 },
  { id: "marulu", name: "마루", grade: "준1급", attr: "BARRIER", atk: 15, def: 16, spd: 16, ce: 23, hp: 79, crt: D, tec: D, mnt: D, total: 0 },
  { id: "usami", name: "우사미", grade: "준1급", attr: "CURSE", atk: 16, def: 14, spd: 16, ce: 21, hp: 79, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yaga", name: "야가 마사미치", grade: "준1급", attr: "SOUL", atk: 16, def: 15, spd: 14, ce: 18, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
];

for (const c of ALL_CHARS) c.total = c.atk + c.def + c.spd + c.ce + c.hp;

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

function calcDamage(atk: C, def: C, forceUlt: boolean): { dmg: number } {
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
  if (forceUlt) {
    mult = B.ULT_MULT;
  } else {
    const tecChance = B.TEC_BASE + atk.tec * B.TEC_RATE;
    if (Math.random() * 100 < tecChance) mult = B.SKILL_MULT;
  }

  const isCrit = Math.random() < atk.crt / B.CRT_DIV;
  let finalDmg = Math.round(dmg * mult);
  if (isCrit) finalDmg = Math.round(finalDmg * B.CRT_MULT);
  finalDmg = Math.max(B.MIN_DMG, finalDmg);
  return { dmg: finalDmg };
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

    const result = calcDamage(atk, def, forceUlt);

    if (aIsAttacker) {
      bHp = Math.max(0, bHp - result.dmg);
      if (forceUlt) aG = 0;
      else { aG = Math.min(100, aG + B.GAUGE_CHARGE); bG = Math.min(100, bG + B.GAUGE_CHARGE); }
    } else {
      aHp = Math.max(0, aHp - result.dmg);
      if (forceUlt) bG = 0;
      else { aG = Math.min(100, aG + B.GAUGE_CHARGE); bG = Math.min(100, bG + B.GAUGE_CHARGE); }
    }
    aIsAttacker = !aIsAttacker;
  }
  return aHp > bHp;
}

// ═══ 다회차 시뮬레이션 ═══

const ROUNDS = 5;
const TRIALS = 2000;
const n = ALL_CHARS.length;
const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  개인리그 다회차 시뮬레이션 (5라운드 × 2000회/매치업)         ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`총 시뮬레이션: ${ROUNDS}라운드 × ${n*(n-1)/2} 매치업 × ${TRIALS}회 = ${(ROUNDS * n*(n-1)/2 * TRIALS).toLocaleString()}전\n`);

// 라운드별 전체 순위 & 승률 저장
const roundGlobalRanks: number[][] = []; // [charIndex][round] = rank
const roundGlobalWRs: number[][] = [];   // [charIndex][round] = wr
const roundGradeRanks: Record<string, number[][]> = {};  // [grade][charIndexInGrade][round]
const roundGradeWRs: Record<string, number[][]> = {};

const grades = ['특급', '준특급', '1급', '준1급'];
const gradeCharIndices: Record<string, number[]> = {};
for (const g of grades) {
  gradeCharIndices[g] = ALL_CHARS.map((c, i) => c.grade === g ? i : -1).filter(i => i >= 0);
  roundGradeRanks[g] = gradeCharIndices[g].map(() => []);
  roundGradeWRs[g] = gradeCharIndices[g].map(() => []);
}

for (let i = 0; i < n; i++) {
  roundGlobalRanks.push([]);
  roundGlobalWRs.push([]);
}

const totalStart = Date.now();

for (let round = 0; round < ROUNDS; round++) {
  const roundStart = Date.now();
  const winMatrix: number[][] = Array.from({length: n}, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let aWins = 0;
      for (let t = 0; t < TRIALS; t++) {
        if (simBattle(ALL_CHARS[i], ALL_CHARS[j])) aWins++;
      }
      winMatrix[i][j] = aWins / TRIALS;
      winMatrix[j][i] = 1 - winMatrix[i][j];
    }
  }

  // 전체 승률 & 순위
  const globalWRs = ALL_CHARS.map((_, i) => {
    const wr = winMatrix[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1);
    return { idx: i, wr };
  }).sort((a, b) => b.wr - a.wr);

  for (let rank = 0; rank < globalWRs.length; rank++) {
    const { idx, wr } = globalWRs[rank];
    roundGlobalRanks[idx].push(rank + 1);
    roundGlobalWRs[idx].push(wr);
  }

  // 등급별 순위
  for (const g of grades) {
    const indices = gradeCharIndices[g];
    const gn = indices.length;
    const results = indices.map((ci, localIdx) => {
      let totalWR = 0;
      for (const cj of indices) {
        if (ci !== cj) totalWR += winMatrix[ci][cj];
      }
      return { localIdx, wr: totalWR / (gn - 1) };
    }).sort((a, b) => b.wr - a.wr);

    for (let rank = 0; rank < results.length; rank++) {
      const { localIdx, wr } = results[rank];
      roundGradeRanks[g][localIdx].push(rank + 1);
      roundGradeWRs[g][localIdx].push(wr);
    }
  }

  const elapsed = ((Date.now() - roundStart) / 1000).toFixed(1);
  console.log(`  라운드 ${round + 1}/${ROUNDS} 완료 (${elapsed}s)`);
}

const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
console.log(`\n  전체 소요: ${totalElapsed}s\n`);

// ═══ 결과 집계 ═══

function avg(arr: number[]): number { return arr.reduce((s, x) => s + x, 0) / arr.length; }
function std(arr: number[]): number { const a = avg(arr); return Math.sqrt(arr.reduce((s, x) => s + (x - a) ** 2, 0) / arr.length); }

interface CharSummary {
  idx: number;
  char: C;
  avgGlobalRank: number;
  avgGlobalWR: number;
  stdGlobalWR: number;
  minRank: number;
  maxRank: number;
  avgGradeRank: number;
  avgGradeWR: number;
}

const summaries: CharSummary[] = ALL_CHARS.map((c, i) => ({
  idx: i,
  char: c,
  avgGlobalRank: avg(roundGlobalRanks[i]),
  avgGlobalWR: avg(roundGlobalWRs[i]),
  stdGlobalWR: std(roundGlobalWRs[i]),
  minRank: Math.min(...roundGlobalRanks[i]),
  maxRank: Math.max(...roundGlobalRanks[i]),
  avgGradeRank: 0,
  avgGradeWR: 0,
}));

// 등급별 평균 순위/승률 집계
for (const g of grades) {
  const indices = gradeCharIndices[g];
  indices.forEach((ci, localIdx) => {
    summaries[ci].avgGradeRank = avg(roundGradeRanks[g][localIdx]);
    summaries[ci].avgGradeWR = avg(roundGradeWRs[g][localIdx]);
  });
}

// 전체 순위 정렬
const byGlobalRank = [...summaries].sort((a, b) => a.avgGlobalRank - b.avgGlobalRank);

// ──── TOP 10 ────
console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║                    전체 TOP 10 (평균 순위 기준)                           ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

console.log(`${'평균순위'.padStart(6)}  ${'캐릭터'.padEnd(14)} ${'등급'.padEnd(4)} ${'속성'.padEnd(4)} ${'ATK'.padStart(3)} ${'DEF'.padStart(3)} ${'SPD'.padStart(3)} ${'CE'.padStart(3)} ${'HP'.padStart(3)}  ${'평균WR'.padStart(7)}  ${'±편차'.padStart(6)} ${'순위범위'.padStart(7)}  ${'등급내순위'.padStart(7)}`);
console.log('─'.repeat(105));

for (let i = 0; i < 10; i++) {
  const s = byGlobalRank[i];
  const c = s.char;
  console.log(
    `${s.avgGlobalRank.toFixed(1).padStart(6)}  ${c.name.padEnd(14)} ${c.grade.padEnd(4)} ${ATTR_KO[c.attr].padEnd(4)} ` +
    `${c.atk.toString().padStart(3)} ${c.def.toString().padStart(3)} ${c.spd.toString().padStart(3)} ${c.ce.toString().padStart(3)} ${c.hp.toString().padStart(3)}  ` +
    `${(s.avgGlobalWR*100).toFixed(1).padStart(6)}%  ±${(s.stdGlobalWR*100).toFixed(1).padStart(4)}% ${s.minRank}~${s.maxRank}`.padEnd(10) +
    `  ${s.avgGradeRank.toFixed(1).padStart(5)}위`
  );
}

// ──── BOTTOM 10 ────
console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║                    전체 BOTTOM 10 (평균 순위 기준)                        ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');
console.log(`${'평균순위'.padStart(6)}  ${'캐릭터'.padEnd(14)} ${'등급'.padEnd(4)} ${'속성'.padEnd(4)} ${'ATK'.padStart(3)} ${'DEF'.padStart(3)} ${'SPD'.padStart(3)} ${'CE'.padStart(3)} ${'HP'.padStart(3)}  ${'평균WR'.padStart(7)}  ${'±편차'.padStart(6)} ${'순위범위'.padStart(7)}  ${'등급내순위'.padStart(7)}`);
console.log('─'.repeat(105));

for (let i = n - 10; i < n; i++) {
  const s = byGlobalRank[i];
  const c = s.char;
  console.log(
    `${s.avgGlobalRank.toFixed(1).padStart(6)}  ${c.name.padEnd(14)} ${c.grade.padEnd(4)} ${ATTR_KO[c.attr].padEnd(4)} ` +
    `${c.atk.toString().padStart(3)} ${c.def.toString().padStart(3)} ${c.spd.toString().padStart(3)} ${c.ce.toString().padStart(3)} ${c.hp.toString().padStart(3)}  ` +
    `${(s.avgGlobalWR*100).toFixed(1).padStart(6)}%  ±${(s.stdGlobalWR*100).toFixed(1).padStart(4)}% ${s.minRank}~${s.maxRank}`.padEnd(10) +
    `  ${s.avgGradeRank.toFixed(1).padStart(5)}위`
  );
}

// ──── 등급별 전체 순위 ────
for (const g of grades) {
  const indices = gradeCharIndices[g];
  const gradeSummaries = indices.map(ci => summaries[ci]).sort((a, b) => a.avgGradeRank - b.avgGradeRank);

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  【${g}】 ${indices.length}명 (등급 내 매치업, ${ROUNDS}라운드 평균)`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);
  console.log(`${'#'.padStart(4)}  ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)} ${'ATK'.padStart(3)} ${'DEF'.padStart(3)} ${'SPD'.padStart(3)} ${'CE'.padStart(3)} ${'HP'.padStart(3)}  ${'등급WR'.padStart(7)} ${'전체WR'.padStart(7)} ${'전체순위'.padStart(6)}`);
  console.log('─'.repeat(85));

  for (let i = 0; i < gradeSummaries.length; i++) {
    const s = gradeSummaries[i];
    const c = s.char;
    const wrStr = (s.avgGradeWR * 100).toFixed(1);
    const gwrStr = (s.avgGlobalWR * 100).toFixed(1);
    const flag = s.avgGradeWR >= 0.65 ? ' ⚠OP' : s.avgGradeWR <= 0.35 ? ' ⚠WK' : '';

    console.log(
      `${s.avgGradeRank.toFixed(1).padStart(4)}  ${c.name.padEnd(14)} ${ATTR_KO[c.attr].padEnd(4)} ` +
      `${c.atk.toString().padStart(3)} ${c.def.toString().padStart(3)} ${c.spd.toString().padStart(3)} ${c.ce.toString().padStart(3)} ${c.hp.toString().padStart(3)}  ` +
      `${wrStr.padStart(6)}% ${gwrStr.padStart(6)}% ${s.avgGlobalRank.toFixed(1).padStart(6)}위${flag}`
    );
  }

  // 속성별 평균
  const attrG: Record<string, number[]> = {};
  for (const ci of indices) {
    const c = ALL_CHARS[ci];
    const ak = ATTR_KO[c.attr];
    if (!attrG[ak]) attrG[ak] = [];
    attrG[ak].push(summaries[ci].avgGradeWR);
  }
  const attrLine = Object.entries(attrG).map(([k, v]) => `${k}(${v.length}):${(avg(v)*100).toFixed(1)}%`).join('  ');
  console.log(`\n  속성 평균: ${attrLine}`);
}

// ──── CE0 캐릭터 ────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  CE0 캐릭터 분석 (5라운드 평균)');
console.log('═══════════════════════════════════════════════════════════════\n');

const ce0 = ALL_CHARS.map((c, i) => ({ c, i })).filter(x => x.c.ce === 0);
for (const { c, i } of ce0) {
  const s = summaries[i];
  console.log(`  ${c.name} [${c.grade}/${ATTR_KO[c.attr]}]`);
  console.log(`    스탯: ATK${c.atk} DEF${c.def} SPD${c.spd} CE0 HP${c.hp} CRT${c.crt} TEC${c.tec} MNT${c.mnt}`);
  console.log(`    등급 내: ${s.avgGradeRank.toFixed(1)}위 (${(s.avgGradeWR*100).toFixed(1)}%)`);
  console.log(`    전체: ${s.avgGlobalRank.toFixed(1)}위 (${(s.avgGlobalWR*100).toFixed(1)}%)`);
  console.log(`    ※ 일반 캐릭터 CRT/TEC/MNT 기본값=50 대비 크게 불리\n`);
}

// ──── 종합 ────
console.log('═══════════════════════════════════════════════════════════════');
console.log('  종합 통계 (5라운드 평균)');
console.log('═══════════════════════════════════════════════════════════════\n');

const allWRs = summaries.map(s => s.avgGlobalWR);
const meanWR = avg(allWRs);
const stdWR = std(allWRs);
const maxS = byGlobalRank[0];
const minS = byGlobalRank[n - 1];

console.log(`  평균 승률: ${(meanWR*100).toFixed(1)}%`);
console.log(`  표준편차: ${(stdWR*100).toFixed(1)}%`);
console.log(`  최고: ${maxS.char.name} ${(maxS.avgGlobalWR*100).toFixed(1)}% (평균 ${maxS.avgGlobalRank.toFixed(1)}위)`);
console.log(`  최저: ${minS.char.name} ${(minS.avgGlobalWR*100).toFixed(1)}% (평균 ${minS.avgGlobalRank.toFixed(1)}위)\n`);

// 등급별 전체 평균 승률
for (const g of grades) {
  const indices = gradeCharIndices[g];
  const gAvgGlobal = avg(indices.map(i => summaries[i].avgGlobalWR));
  const gAvgGrade = avg(indices.map(i => summaries[i].avgGradeWR));
  console.log(`  ${g.padEnd(4)}: 등급내 ${(gAvgGrade*100).toFixed(1)}%, 전체 ${(gAvgGlobal*100).toFixed(1)}%`);
}

// 밸런스 판정
console.log('\n───────────────────────────────────────');
console.log('  밸런스 판정 (등급내 승률 35~65% = ✅)');
console.log('───────────────────────────────────────\n');

let ok = 0, op = 0, wk = 0;
for (const s of summaries) {
  if (s.avgGradeWR >= 0.35 && s.avgGradeWR <= 0.65) ok++;
  else if (s.avgGradeWR > 0.65) op++;
  else wk++;
}
console.log(`  ✅ 밸런스: ${ok}/55 (${(ok/55*100).toFixed(1)}%)`);
console.log(`  ⚠ OP(65%+): ${op}명`);
console.log(`  ⚠ WK(35%-): ${wk}명`);

// OP/WK 캐릭터 상세
const opChars = summaries.filter(s => s.avgGradeWR > 0.65).sort((a, b) => b.avgGradeWR - a.avgGradeWR);
const wkChars = summaries.filter(s => s.avgGradeWR < 0.35).sort((a, b) => a.avgGradeWR - b.avgGradeWR);

if (opChars.length > 0) {
  console.log('\n  OP 캐릭터:');
  for (const s of opChars) {
    console.log(`    ${s.char.name} [${s.char.grade}/${ATTR_KO[s.char.attr]}] - 등급내 ${(s.avgGradeWR*100).toFixed(1)}%`);
  }
}
if (wkChars.length > 0) {
  console.log('\n  WK 캐릭터:');
  for (const s of wkChars) {
    console.log(`    ${s.char.name} [${s.char.grade}/${ATTR_KO[s.char.attr]}] - 등급내 ${(s.avgGradeWR*100).toFixed(1)}%`);
  }
}

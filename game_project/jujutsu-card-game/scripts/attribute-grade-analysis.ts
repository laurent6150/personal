/**
 * 속성별 / 등급별 심층 분석 시뮬레이션
 * - 속성 vs 속성 매치업 매트릭스 (전체 + 등급별)
 * - 등급별 속성 분포 및 승률
 * - 등급 간 크로스 매치업
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

// ═══ 시뮬레이션 실행 ═══

const TRIALS = 3000;
const n = ALL_CHARS.length;
const ATTRS = ['BARRIER', 'BODY', 'CURSE', 'SOUL', 'CONVERT', 'RANGE'] as const;
const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};
const grades = ['특급', '준특급', '1급', '준1급'];

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║    속성별 / 등급별 심층 분석 시뮬레이션 (3000회/매치업)            ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

const start = Date.now();

// 전체 매치업 승률 매트릭스 계산
const winMatrix: number[][] = Array.from({length: n}, () => new Array(n).fill(0));
let matchCount = 0;
const totalMatches = n * (n - 1) / 2;

for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    let aWins = 0;
    for (let t = 0; t < TRIALS; t++) {
      if (simBattle(ALL_CHARS[i], ALL_CHARS[j])) aWins++;
    }
    winMatrix[i][j] = aWins / TRIALS;
    winMatrix[j][i] = 1 - winMatrix[i][j];
    matchCount++;
    if (matchCount % 300 === 0) {
      process.stdout.write(`  진행: ${matchCount}/${totalMatches} 매치업 (${(matchCount/totalMatches*100).toFixed(0)}%)\r`);
    }
  }
}
const elapsed = ((Date.now() - start) / 1000).toFixed(1);
console.log(`  완료: ${totalMatches} 매치업 × ${TRIALS}회 = ${(totalMatches * TRIALS).toLocaleString()}전 (${elapsed}s)\n`);

// ═══════════════════════════════════════════════════════════════
// PART 1: 속성 vs 속성 전체 매치업 매트릭스
// ═══════════════════════════════════════════════════════════════

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  PART 1: 속성 vs 속성 전체 매치업 매트릭스                        ║');
console.log('║  (행 속성이 열 속성을 상대할 때의 평균 승률)                        ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

// 속성별로 캐릭터 인덱스 그룹핑
const attrGroups: Record<string, number[]> = {};
for (const attr of ATTRS) {
  attrGroups[attr] = ALL_CHARS.map((c, i) => c.attr === attr ? i : -1).filter(i => i >= 0);
}

// 속성 A의 캐릭터들 vs 속성 B의 캐릭터들 평균 승률
function attrVsAttr(attrA: string, attrB: string): { wr: number, matches: number } {
  const groupA = attrGroups[attrA];
  const groupB = attrGroups[attrB];
  if (attrA === attrB) {
    // 동일 속성 미러: 항상 50%
    return { wr: 0.5, matches: groupA.length * (groupA.length - 1) / 2 };
  }
  let totalWR = 0, count = 0;
  for (const ai of groupA) {
    for (const bi of groupB) {
      totalWR += winMatrix[ai][bi];
      count++;
    }
  }
  return { wr: count > 0 ? totalWR / count : 0.5, matches: count };
}

// 상성 관계 표시
function getRelation(attrA: string, attrB: string): string {
  if (attrA === attrB) return '  ';
  if (ATTRIBUTE_ADVANTAGE[attrA]?.includes(attrB)) return '▲';
  if (ATTRIBUTE_ADVANTAGE[attrB]?.includes(attrA)) return '▼';
  return '  ';
}

// 매트릭스 출력
const header = '  공격\\방어  ' + ATTRS.map(a => ATTR_KO[a].padStart(6)).join('') + '  총합WR';
console.log(header);
console.log('  ' + '─'.repeat(header.length));

for (const aA of ATTRS) {
  const cells: string[] = [];
  let totalWR = 0, totalCount = 0;
  for (const aB of ATTRS) {
    const { wr, matches } = attrVsAttr(aA, aB);
    const rel = getRelation(aA, aB);
    if (aA === aB) {
      cells.push('  ── '.padStart(6));
    } else {
      totalWR += wr * matches;
      totalCount += matches;
      const wrStr = (wr * 100).toFixed(1);
      cells.push(`${rel}${wrStr}`.padStart(6));
    }
  }
  const avgWR = totalCount > 0 ? totalWR / totalCount : 0.5;
  console.log(`  ${ATTR_KO[aA].padEnd(6)}  ${cells.join('')}  ${(avgWR*100).toFixed(1)}%`);
}

console.log('\n  범례: ▲ = 유리 (×1.08), ▼ = 불리 (×0.96), 무표시 = 중립');

// 속성별 전체 평균 승률 (캐릭터별)
console.log('\n  ── 속성별 캐릭터 수 & 전체 평균 승률 ──');
for (const attr of ATTRS) {
  const group = attrGroups[attr];
  const avgWR = group.reduce((sum, ci) => {
    const wr = winMatrix[ci].reduce((s, v, j) => j === ci ? s : s + v, 0) / (n - 1);
    return sum + wr;
  }, 0) / group.length;
  const charNames = group.map(ci => ALL_CHARS[ci].name).join(', ');
  console.log(`  ${ATTR_KO[attr].padEnd(4)} (${group.length}명): 전체WR ${(avgWR*100).toFixed(1)}%`);
}

// ═══════════════════════════════════════════════════════════════
// PART 2: 등급별 속성 매치업 분석
// ═══════════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║  PART 2: 등급별 속성 매치업 분석                                 ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

for (const grade of grades) {
  const gradeChars = ALL_CHARS.map((c, i) => ({ c, i })).filter(x => x.c.grade === grade);
  const gn = gradeChars.length;

  // 등급 내 속성 그룹핑
  const gradeAttrGroups: Record<string, number[]> = {};
  for (const attr of ATTRS) {
    const group = gradeChars.filter(x => x.c.attr === attr).map(x => x.i);
    if (group.length > 0) gradeAttrGroups[attr] = group;
  }

  const presentAttrs = Object.keys(gradeAttrGroups);

  console.log(`\n  ═══ 【${grade}】 ${gn}명 ═══`);
  console.log(`  속성 분포: ${presentAttrs.map(a => `${ATTR_KO[a]}(${gradeAttrGroups[a].length})`).join(' / ')}\n`);

  // 등급 내 속성 vs 속성
  if (presentAttrs.length >= 2) {
    const hdr = '    공격\\방어' + presentAttrs.map(a => ATTR_KO[a].padStart(7)).join('') + '  평균WR';
    console.log(hdr);
    console.log('    ' + '─'.repeat(hdr.length));

    for (const aA of presentAttrs) {
      const groupA = gradeAttrGroups[aA];
      const cells: string[] = [];
      let totalWR = 0, totalCount = 0;

      for (const aB of presentAttrs) {
        const groupB = gradeAttrGroups[aB];
        if (aA === aB) {
          cells.push('  ── '.padStart(7));
          continue;
        }
        let wrSum = 0, cnt = 0;
        for (const ai of groupA) {
          for (const bi of groupB) {
            wrSum += winMatrix[ai][bi];
            cnt++;
          }
        }
        const wr = cnt > 0 ? wrSum / cnt : 0.5;
        totalWR += wrSum;
        totalCount += cnt;
        const rel = getRelation(aA, aB);
        cells.push(`${rel}${(wr*100).toFixed(0)}`.padStart(7));
      }
      const avgWR = totalCount > 0 ? totalWR / totalCount : 0.5;
      console.log(`    ${ATTR_KO[aA].padEnd(6)} ${cells.join('')}  ${(avgWR*100).toFixed(1)}%`);
    }
  }

  // 등급 내 캐릭터별 승률 (속성별 그룹핑)
  console.log(`\n    ── 캐릭터별 등급 내 승률 (속성별 정렬) ──\n`);
  console.log(`    ${'캐릭터'.padEnd(16)} 속성   등급내WR  전체WR   순위`);
  console.log('    ' + '─'.repeat(55));

  const gradeResults = gradeChars.map(({ c, i }) => {
    let gradeWR = 0;
    for (const { i: j } of gradeChars) {
      if (i !== j) gradeWR += winMatrix[i][j];
    }
    gradeWR /= (gn - 1);
    const globalWR = winMatrix[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1);
    return { c, i, gradeWR, globalWR };
  }).sort((a, b) => b.gradeWR - a.gradeWR);

  for (const r of gradeResults) {
    const flag = r.gradeWR >= 0.65 ? ' OP' : r.gradeWR <= 0.35 ? ' WK' : '';
    const rank = gradeResults.indexOf(r) + 1;
    console.log(
      `    ${r.c.name.padEnd(16)} ${ATTR_KO[r.c.attr].padEnd(4)}  ` +
      `${(r.gradeWR*100).toFixed(1).padStart(5)}%   ${(r.globalWR*100).toFixed(1).padStart(5)}%   ${rank}위${flag}`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PART 3: 등급 간 크로스 매치업
// ═══════════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║  PART 3: 등급 간 크로스 매치업 (행 등급이 열 등급을 상대할 때 승률)   ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

const gradeGroups: Record<string, number[]> = {};
for (const g of grades) {
  gradeGroups[g] = ALL_CHARS.map((c, i) => c.grade === g ? i : -1).filter(i => i >= 0);
}

const grHdr = '  ' + '등급 '.padEnd(8) + grades.map(g => g.padStart(8)).join('');
console.log(grHdr);
console.log('  ' + '─'.repeat(grHdr.length));

for (const gA of grades) {
  const cells: string[] = [];
  for (const gB of grades) {
    if (gA === gB) {
      cells.push(' 50.0%'.padStart(8));
      continue;
    }
    let totalWR = 0, cnt = 0;
    for (const ai of gradeGroups[gA]) {
      for (const bi of gradeGroups[gB]) {
        totalWR += winMatrix[ai][bi];
        cnt++;
      }
    }
    const wr = cnt > 0 ? totalWR / cnt : 0.5;
    cells.push(`${(wr*100).toFixed(1)}%`.padStart(8));
  }
  console.log(`  ${gA.padEnd(8)} ${cells.join('')}`);
}

// ═══════════════════════════════════════════════════════════════
// PART 4: 종합 밸런스 평가
// ═══════════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║  PART 4: 종합 밸런스 평가                                        ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

// 속성별 전체 승률 순위
console.log('  ── 속성 파워 랭킹 (전체 캐릭터 평균 승률) ──\n');
const attrPower: { attr: string, avgWR: number, count: number }[] = [];
for (const attr of ATTRS) {
  const group = attrGroups[attr];
  const avgWR = group.reduce((sum, ci) => {
    const wr = winMatrix[ci].reduce((s, v, j) => j === ci ? s : s + v, 0) / (n - 1);
    return sum + wr;
  }, 0) / group.length;
  attrPower.push({ attr, avgWR, count: group.length });
}
attrPower.sort((a, b) => b.avgWR - a.avgWR);

for (let i = 0; i < attrPower.length; i++) {
  const p = attrPower[i];
  const bar = '█'.repeat(Math.round(p.avgWR * 100 / 2));
  console.log(`  ${(i+1)}위 ${ATTR_KO[p.attr].padEnd(4)} (${p.count.toString().padStart(2)}명): ${(p.avgWR*100).toFixed(1)}% ${bar}`);
}

// 속성 상성 효과 분석
console.log('\n  ── 상성 효과 실측치 ──');
console.log('  (유리/불리 매치업에서 실제로 몇 % 승률 차이가 나는가)\n');

let advWins = 0, advTotal = 0, disWins = 0, disTotal = 0, neutralWins = 0, neutralTotal = 0;
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    const aI = ALL_CHARS[i].attr, aJ = ALL_CHARS[j].attr;
    if (ATTRIBUTE_ADVANTAGE[aI]?.includes(aJ)) {
      advWins += winMatrix[i][j]; advTotal++;
      disWins += winMatrix[j][i]; disTotal++;
    } else if (ATTRIBUTE_ADVANTAGE[aJ]?.includes(aI)) {
      advWins += winMatrix[j][i]; advTotal++;
      disWins += winMatrix[i][j]; disTotal++;
    } else if (aI !== aJ) {
      neutralWins += winMatrix[i][j]; neutralTotal++;
      neutralWins += winMatrix[j][i]; neutralTotal++;
    }
  }
}

const advAvg = advTotal > 0 ? advWins / advTotal : 0.5;
const disAvg = disTotal > 0 ? disWins / disTotal : 0.5;
const neutralAvg = neutralTotal > 0 ? neutralWins / neutralTotal : 0.5;

console.log(`  유리 매치업 (×1.08):  평균 승률 ${(advAvg*100).toFixed(1)}%  (${advTotal}건)`);
console.log(`  불리 매치업 (×0.96):  평균 승률 ${(disAvg*100).toFixed(1)}%  (${disTotal}건)`);
console.log(`  중립 매치업 (×1.00):  평균 승률 ${(neutralAvg*100).toFixed(1)}%  (${neutralTotal}건)`);
console.log(`  상성 승률 차이:       ${((advAvg - disAvg)*100).toFixed(1)}%p`);

// 등급별 밸런스 점수
console.log('\n  ── 등급별 밸런스 점수 ──');
console.log('  (등급 내 승률의 표준편차 — 낮을수록 균형)\n');

for (const grade of grades) {
  const gradeChars = ALL_CHARS.map((c, i) => ({ c, i })).filter(x => x.c.grade === grade);
  const gn = gradeChars.length;
  const wrs = gradeChars.map(({ i }) => {
    let wr = 0;
    for (const { i: j } of gradeChars) {
      if (i !== j) wr += winMatrix[i][j];
    }
    return wr / (gn - 1);
  });
  const avgWR = wrs.reduce((s, w) => s + w, 0) / wrs.length;
  const stdWR = Math.sqrt(wrs.reduce((s, w) => s + (w - avgWR) ** 2, 0) / wrs.length);
  const minWR = Math.min(...wrs);
  const maxWR = Math.max(...wrs);
  const range = maxWR - minWR;
  const score = range < 0.3 ? '양호' : range < 0.4 ? '보통' : '조정 필요';

  console.log(`  ${grade.padEnd(4)}: 표준편차 ${(stdWR*100).toFixed(1)}%, 범위 ${(minWR*100).toFixed(0)}~${(maxWR*100).toFixed(0)}% (격차 ${(range*100).toFixed(0)}%p) → ${score}`);
}

// CE0 캐릭터 최종 상태
console.log('\n  ── CE0 캐릭터 최종 상태 ──\n');
const ce0 = ALL_CHARS.map((c, i) => ({ c, i })).filter(x => x.c.ce === 0);
for (const { c, i } of ce0) {
  const gradeChars = ALL_CHARS.map((cc, ii) => ({ cc, ii })).filter(x => x.cc.grade === c.grade);
  const gn = gradeChars.length;
  let gradeWR = 0;
  for (const { ii: j } of gradeChars) {
    if (i !== j) gradeWR += winMatrix[i][j];
  }
  gradeWR /= (gn - 1);
  const globalWR = winMatrix[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1);

  // 속성별 매치업
  const attrMatchups: string[] = [];
  for (const attr of ATTRS) {
    if (attr === c.attr) continue;
    const group = attrGroups[attr];
    if (group.length === 0) continue;
    let wr = 0;
    for (const j of group) {
      if (i !== j) wr += winMatrix[i][j];
    }
    wr /= group.length;
    const rel = getRelation(c.attr, attr);
    attrMatchups.push(`vs${ATTR_KO[attr]}${rel}${(wr*100).toFixed(0)}%`);
  }

  const status = gradeWR >= 0.45 && gradeWR <= 0.55 ? '✅ 균형' :
                 gradeWR >= 0.35 && gradeWR <= 0.65 ? '⚡ 양호' : '⚠ 조정 필요';

  console.log(`  ${c.name} [${c.grade}/${ATTR_KO[c.attr]}] ${status}`);
  console.log(`    CRT${c.crt}/TEC${c.tec}/MNT${c.mnt} | 등급내 ${(gradeWR*100).toFixed(1)}% | 전체 ${(globalWR*100).toFixed(1)}%`);
  console.log(`    ${attrMatchups.join('  ')}`);
}

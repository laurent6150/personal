/**
 * 개인리그 대규모 시뮬레이션
 * 실제 구현된 individualBattleSimulator.ts 로직을 그대로 재현
 *
 * 주의: CRT/TEC/MNT 미지정 캐릭터 → 기본값 50 (실제 코드 line 59-61 || 50)
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
  total: number; // atk+def+spd+ce+hp
}

// 실제 코드 기본값: CRT/TEC/MNT 미지정 시 50
const D = 50; // default for crt/tec/mnt

const ALL_CHARS: C[] = [
  // ──── 특급 (6) ────
  { id: "gojo", name: "고죠 사토루", grade: "특급", attr: "BARRIER", atk: 22, def: 20, spd: 20, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "sukuna", name: "료멘 스쿠나", grade: "특급", attr: "CURSE", atk: 25, def: 18, spd: 20, ce: 24, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kenjaku", name: "켄자쿠", grade: "특급", attr: "SOUL", atk: 22, def: 17, spd: 18, ce: 25, hp: 104, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuki", name: "츠쿠모 유키", grade: "특급", attr: "BODY", atk: 24, def: 16, spd: 19, ce: 24, hp: 97, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuta", name: "옷코츠 유타", grade: "특급", attr: "CURSE", atk: 23, def: 18, spd: 20, ce: 25, hp: 102, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuji_final", name: "이타도리(최종전)", grade: "특급", attr: "SOUL", atk: 22, def: 18, spd: 21, ce: 22, hp: 97, crt: D, tec: D, mnt: D, total: 0 },
  // ──── 준특급 (7) ────
  { id: "geto", name: "게토 스구루", grade: "준특급", attr: "CURSE", atk: 21, def: 18, spd: 18, ce: 22, hp: 98, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tengen", name: "텐겐", grade: "준특급", attr: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "toji", name: "토우지", grade: "준특급", attr: "BODY", atk: 23, def: 16, spd: 21, ce: 0, hp: 92, crt: 18, tec: 20, mnt: 10, total: 0 },
  { id: "mahoraga", name: "마허라", grade: "준특급", attr: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "rika", name: "완전체 리카", grade: "준특급", attr: "CURSE", atk: 21, def: 17, spd: 19, ce: 24, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tamamo", name: "타마모노마에", grade: "준특급", attr: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 96, crt: D, tec: D, mnt: D, total: 0 },
  { id: "dabura", name: "다부라", grade: "준특급", attr: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
  // ──── 1급 (25) ────
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
  // ──── 준1급 (17) ────
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

// total 계산
for (const c of ALL_CHARS) {
  c.total = c.atk + c.def + c.spd + c.ce + c.hp;
}

// ═══════════════════════════════════════════════════════
// 전투 로직 (individualBattleSimulator.ts 완전 재현)
// ═══════════════════════════════════════════════════════

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

function calcDamage(atk: C, def: C, forceUlt: boolean): { dmg: number, isCrit: boolean, type: string } {
  // 1. ATK 기반
  let dmg = Math.round(atk.atk * B.ATK_COEFF + B.BASE_DMG);
  // 2. DEF 감소
  dmg = Math.round(dmg * (1 - Math.min(def.def * B.DEF_RATE, B.MAX_DEF) / 100));
  // 3. MNT 감소
  dmg = Math.round(dmg * (1 - def.mnt * B.MNT_RATE / 100));
  // 4. 속성 배율
  dmg = Math.round(dmg * getAttrMult(atk.attr, def.attr));
  // 5. CE 배율
  const ceM = atk.ce === 0 ? (1 + B.CE0_BONUS) : (1 + atk.ce * B.CE_COEFF);
  dmg = Math.round(dmg * ceM);
  // 6. 최소 보장
  dmg = Math.max(dmg, B.MIN_DMG);
  // 7. 총합 차이 보정 (±20%)
  const diff = atk.total - def.total;
  dmg = Math.round(dmg * Math.max(0.8, Math.min(1.2, 1 + diff / 1000)));
  // 8. 랜덤 ±10%
  dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));

  // 9. 액션 타입
  let type = 'basic';
  let mult = 1.0;
  if (forceUlt) {
    type = 'ultimate';
    mult = B.ULT_MULT;
  } else {
    const tecChance = B.TEC_BASE + atk.tec * B.TEC_RATE;
    if (Math.random() * 100 < tecChance) {
      type = 'skill';
      mult = B.SKILL_MULT;
    }
  }

  // 10. CRT
  const isCrit = Math.random() < atk.crt / B.CRT_DIV;

  let finalDmg = Math.round(dmg * mult);
  if (isCrit) finalDmg = Math.round(finalDmg * B.CRT_MULT);
  finalDmg = Math.max(B.MIN_DMG, finalDmg);

  return { dmg: finalDmg, isCrit, type };
}

function simBattle(a: C, b: C): boolean {
  let aHp = a.hp, bHp = b.hp;
  let aG = 0, bG = 0;
  // 선공: SPD 높은 쪽
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

    // 공수 교대
    aIsAttacker = !aIsAttacker;
  }

  return aHp > bHp;
}

// ═══════════════════════════════════════════════════════
// 대규모 시뮬레이션
// ═══════════════════════════════════════════════════════

const TRIALS = 1000;  // 매치업당 1000회

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  개인리그 대규모 시뮬레이션 (구현 로직 재현)                  ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`설정: 속성배율 ${ADV}/${DIS}, 시행횟수 ${TRIALS}회/매치업`);
console.log(`CRT/TEC/MNT 기본값: ${D} (실제 코드 || 50)\n`);

const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

// ──── 등급 내 + 전체 매치업 ────
interface CharResult {
  char: C;
  gradeWR: number;   // 등급 내 승률
  globalWR: number;   // 전체 승률
  gradeRank: number;  // 등급 내 순위
  globalRank: number; // 전체 순위
}

const n = ALL_CHARS.length;
const winMatrix: number[][] = Array.from({length: n}, () => new Array(n).fill(0));

// 모든 매치업 시뮬레이션
const totalMatchups = n * (n - 1) / 2;
let done = 0;
const startTime = Date.now();

for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    let aWins = 0;
    for (let t = 0; t < TRIALS; t++) {
      if (simBattle(ALL_CHARS[i], ALL_CHARS[j])) aWins++;
    }
    winMatrix[i][j] = aWins / TRIALS;
    winMatrix[j][i] = 1 - winMatrix[i][j];
    done++;
    if (done % 100 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const eta = (elapsed / done) * (totalMatchups - done);
      process.stdout.write(`  진행: ${done}/${totalMatchups} (${(done/totalMatchups*100).toFixed(1)}%) ETA: ${eta.toFixed(0)}s\r`);
    }
  }
}

console.log(`  완료: ${totalMatchups} 매치업 × ${TRIALS}회 = ${(totalMatchups * TRIALS).toLocaleString()}전` + ' '.repeat(30));
console.log(`  소요시간: ${((Date.now() - startTime) / 1000).toFixed(1)}초\n`);

// ──── 전체 승률 계산 ────
const globalWRs = ALL_CHARS.map((c, i) => {
  const wr = winMatrix[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1);
  return { char: c, wr };
}).sort((a, b) => b.wr - a.wr);

// ──── 등급별 승률 계산 ────
const grades = ['특급', '준특급', '1급', '준1급'];
const gradeResults: Record<string, { char: C, wr: number }[]> = {};

for (const grade of grades) {
  const indices = ALL_CHARS.map((c, i) => ({ c, i })).filter(x => x.c.grade === grade);
  const gn = indices.length;

  const results = indices.map(({ c, i }) => {
    let totalWR = 0;
    for (const { i: j } of indices) {
      if (i !== j) totalWR += winMatrix[i][j];
    }
    return { char: c, wr: totalWR / (gn - 1) };
  }).sort((a, b) => b.wr - a.wr);

  gradeResults[grade] = results;
}

// ═══════════════════════════════════════════════════════
// 결과 출력
// ═══════════════════════════════════════════════════════

// ──── 전체 TOP 10 ────
console.log('═══════════════════════════════════════════════════════════════');
console.log('  전체 TOP 10 (55명 올 매치업 기준)');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`${'순위'.padStart(4)}  ${'캐릭터'.padEnd(14)} ${'등급'.padEnd(4)} ${'속성'.padEnd(4)} ${'ATK'.padStart(3)} ${'DEF'.padStart(3)} ${'SPD'.padStart(3)} ${'CE'.padStart(3)} ${'HP'.padStart(3)} ${'CRT'.padStart(3)} ${'TEC'.padStart(3)} ${'MNT'.padStart(3)}  ${'전체WR'.padStart(6)}  ${'등급내WR'.padStart(7)}`);
console.log('─'.repeat(95));

for (let i = 0; i < 10; i++) {
  const { char: c, wr } = globalWRs[i];
  const gradeWR = gradeResults[c.grade].find(x => x.char.id === c.id)!.wr;
  console.log(
    `${(i+1).toString().padStart(4)}  ${c.name.padEnd(14)} ${c.grade.padEnd(4)} ${ATTR_KO[c.attr].padEnd(4)} ` +
    `${c.atk.toString().padStart(3)} ${c.def.toString().padStart(3)} ${c.spd.toString().padStart(3)} ${c.ce.toString().padStart(3)} ${c.hp.toString().padStart(3)} ` +
    `${c.crt.toString().padStart(3)} ${c.tec.toString().padStart(3)} ${c.mnt.toString().padStart(3)}  ` +
    `${(wr*100).toFixed(1).padStart(5)}%  ${(gradeWR*100).toFixed(1).padStart(6)}%`
  );
}

// ──── 전체 BOTTOM 10 ────
console.log('\n  전체 BOTTOM 10');
console.log('─'.repeat(95));
for (let i = n - 10; i < n; i++) {
  const { char: c, wr } = globalWRs[i];
  const gradeWR = gradeResults[c.grade].find(x => x.char.id === c.id)!.wr;
  console.log(
    `${(i+1).toString().padStart(4)}  ${c.name.padEnd(14)} ${c.grade.padEnd(4)} ${ATTR_KO[c.attr].padEnd(4)} ` +
    `${c.atk.toString().padStart(3)} ${c.def.toString().padStart(3)} ${c.spd.toString().padStart(3)} ${c.ce.toString().padStart(3)} ${c.hp.toString().padStart(3)} ` +
    `${c.crt.toString().padStart(3)} ${c.tec.toString().padStart(3)} ${c.mnt.toString().padStart(3)}  ` +
    `${(wr*100).toFixed(1).padStart(5)}%  ${(gradeWR*100).toFixed(1).padStart(6)}%`
  );
}

// ──── 등급별 전체 순위 ────
for (const grade of grades) {
  const results = gradeResults[grade];
  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  【${grade}】 ${results.length}명 (등급 내 매치업 기준)`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);
  console.log(`${'#'.padStart(2)}  ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)} ${'ATK'.padStart(3)} ${'DEF'.padStart(3)} ${'SPD'.padStart(3)} ${'CE'.padStart(3)} ${'HP'.padStart(3)} ${'CRT'.padStart(3)} ${'TEC'.padStart(3)} ${'MNT'.padStart(3)}  ${'등급WR'.padStart(6)}  ${'전체WR'.padStart(6)}`);
  console.log('─'.repeat(90));

  for (let i = 0; i < results.length; i++) {
    const { char: c, wr } = results[i];
    const gwr = globalWRs.find(x => x.char.id === c.id)!.wr;
    const globalRank = globalWRs.findIndex(x => x.char.id === c.id) + 1;

    console.log(
      `${(i+1).toString().padStart(2)}  ${c.name.padEnd(14)} ${ATTR_KO[c.attr].padEnd(4)} ` +
      `${c.atk.toString().padStart(3)} ${c.def.toString().padStart(3)} ${c.spd.toString().padStart(3)} ${c.ce.toString().padStart(3)} ${c.hp.toString().padStart(3)} ` +
      `${c.crt.toString().padStart(3)} ${c.tec.toString().padStart(3)} ${c.mnt.toString().padStart(3)}  ` +
      `${(wr*100).toFixed(1).padStart(5)}%  ${(gwr*100).toFixed(1).padStart(5)}% (#${globalRank})`
    );
  }

  // 속성별 평균
  const attrG: Record<string, number[]> = {};
  for (const { char: c, wr } of results) {
    const ak = ATTR_KO[c.attr];
    if (!attrG[ak]) attrG[ak] = [];
    attrG[ak].push(wr);
  }
  const attrLine = Object.entries(attrG).map(([k, v]) => `${k}(${v.length}):${(v.reduce((s,x)=>s+x,0)/v.length*100).toFixed(1)}%`).join('  ');
  console.log(`\n  속성 평균: ${attrLine}`);
}

// ──── CE0 캐릭터 특별 분석 ────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  CE0 캐릭터 분석 (CRT/TEC/MNT 명시, 기본값 50과 비교)');
console.log('═══════════════════════════════════════════════════════════════\n');

const ce0Chars = ALL_CHARS.filter(c => c.ce === 0);
for (const c of ce0Chars) {
  const gwr = globalWRs.find(x => x.char.id === c.id)!.wr;
  const globalRank = globalWRs.findIndex(x => x.char.id === c.id) + 1;
  const gradeWR = gradeResults[c.grade].find(x => x.char.id === c.id)!.wr;
  const gradeRank = gradeResults[c.grade].findIndex(x => x.char.id === c.id) + 1;

  console.log(`  ${c.name} [${c.grade}/${ATTR_KO[c.attr]}]`);
  console.log(`    스탯: ATK${c.atk} DEF${c.def} SPD${c.spd} CE0 HP${c.hp} CRT${c.crt} TEC${c.tec} MNT${c.mnt}`);
  console.log(`    등급 ${gradeRank}위 (${(gradeWR*100).toFixed(1)}%) | 전체 ${globalRank}위 (${(gwr*100).toFixed(1)}%)`);
  console.log(`    ※ 일반 캐릭터 기본값: CRT50/TEC50/MNT50 → CE0 캐릭터의 CRT/TEC/MNT가 오히려 낮음\n`);
}

// ──── 종합 통계 ────
console.log('═══════════════════════════════════════════════════════════════');
console.log('  종합 통계');
console.log('═══════════════════════════════════════════════════════════════\n');

const avgWR = globalWRs.reduce((s, x) => s + x.wr, 0) / n;
const stdWR = Math.sqrt(globalWRs.reduce((s, x) => s + (x.wr - avgWR) ** 2, 0) / n);
const maxWR = globalWRs[0].wr;
const minWR = globalWRs[n-1].wr;

console.log(`  평균 승률: ${(avgWR*100).toFixed(1)}% (이론적 50%)`);
console.log(`  표준편차: ${(stdWR*100).toFixed(1)}%`);
console.log(`  최고: ${globalWRs[0].char.name} ${(maxWR*100).toFixed(1)}%`);
console.log(`  최저: ${globalWRs[n-1].char.name} ${(minWR*100).toFixed(1)}%`);
console.log(`  범위: ${((maxWR-minWR)*100).toFixed(1)}%p\n`);

// 등급별 평균
for (const grade of grades) {
  const gAvg = gradeResults[grade].reduce((s, x) => s + x.wr, 0) / gradeResults[grade].length;
  const gGlobal = gradeResults[grade].map(x => globalWRs.find(g => g.char.id === x.char.id)!.wr);
  const gGlobalAvg = gGlobal.reduce((s, x) => s + x, 0) / gGlobal.length;
  console.log(`  ${grade.padEnd(4)}: 등급내 평균 ${(gAvg*100).toFixed(1)}%, 전체 평균 ${(gGlobalAvg*100).toFixed(1)}%`);
}

/**
 * 최종 밸런스 튜닝 시뮬레이션
 *
 * 1단계: 속성 복구 반영 (리카→저주, 쵸소→변환, 이지치→결계)
 * 2단계: 속성 배율 조정으로 불균형 해소
 * 3단계: 개별 OP/WK 캐릭터 스탯 미세 조정
 *
 * 1급 속성 분포 (수정 후):
 *   신체 8, 변환 8(+쵸소), 결계 3, 저주 2(-쵸소), 원거리 3, 혼백 1
 */

const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'], BODY: ['BARRIER', 'CONVERT'],
  CURSE: ['BODY', 'RANGE'], SOUL: ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'], RANGE: ['BODY', 'SOUL']
};

interface C {
  name: string; grade: string; attr: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number; tec: number; mnt: number;
}

// 속성 복구 반영: 리카→CURSE, 쵸소→CONVERT
const BASE_CHARS: C[] = [
  // 특급
  { name: "고죠 사토루", grade: "특급", attr: "BARRIER", atk: 22, def: 20, spd: 22, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "료멘 스쿠나", grade: "특급", attr: "CURSE", atk: 25, def: 18, spd: 22, ce: 24, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "켄자쿠", grade: "특급", attr: "SOUL", atk: 20, def: 17, spd: 18, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "츠쿠모 유키", grade: "특급", attr: "BODY", atk: 23, def: 16, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "옷코츠 유타", grade: "특급", attr: "CURSE", atk: 22, def: 18, spd: 20, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "이타도리(최종전)", grade: "특급", attr: "SOUL", atk: 21, def: 18, spd: 21, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },
  // 준특급 - 리카: SOUL→CURSE
  { name: "게토 스구루", grade: "준특급", attr: "CURSE", atk: 19, def: 18, spd: 18, ce: 22, hp: 93, crt: 10, tec: 10, mnt: 10 },
  { name: "텐겐", grade: "준특급", attr: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "토우지", grade: "준특급", attr: "BODY", atk: 23, def: 16, spd: 22, ce: 0, hp: 92, crt: 18, tec: 20, mnt: 10 },
  { name: "마허라", grade: "준특급", attr: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { name: "완전체 리카", grade: "준특급", attr: "CURSE", atk: 22, def: 17, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "타마모노마에", grade: "준특급", attr: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { name: "다부라", grade: "준특급", attr: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: 10, tec: 10, mnt: 10 },
  // 1급 - 쵸소: CURSE→CONVERT
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
  { name: "쵸소", grade: "1급", attr: "CONVERT", atk: 18, def: 16, spd: 17, ce: 19, hp: 88, crt: 10, tec: 10, mnt: 10 },
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
  // 준1급
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

// OP/WK 스탯 조정 후보
function applyStatFixes(chars: C[]): C[] {
  return chars.map(c => {
    const copy = { ...c };
    switch (c.name) {
      // OP 너프
      case '료멘 스쿠나': copy.atk = 23; break;  // ATK 25→23
      case '완전체 리카': copy.atk = 20; copy.ce = 22; break;  // ATK22→20, CE24→22
      case '이타도리 유지': copy.spd = 18; copy.hp = 86; break; // SPD20→18, HP90→86
      // WK 버프
      case '옷코츠 유타': copy.atk = 24; break;  // ATK22→24
      case '츠쿠모 유키': copy.def = 18; break;  // DEF16→18
      case '텐겐': copy.atk = 22; copy.spd = 19; break;  // ATK20→22, SPD17→19
      case '마허라': copy.spd = 20; copy.ce = 22; break;  // SPD18→20, CE20→22
      case '요로즈': copy.atk = 21; copy.hp = 88; break;  // ATK19→21, HP83→88
      case '만상': copy.atk = 21; copy.hp = 90; break;  // ATK19→21, HP85→90
      case '메이메이': copy.atk = 20; copy.spd = 18; copy.hp = 86; break;  // ATK+2, SPD+2, HP+4
    }
    return copy;
  });
}

function getAttrMult(a: string, b: string, adv: number, dis: number): number {
  if (ATTRIBUTE_ADVANTAGE[a]?.includes(b)) return adv;
  if (ATTRIBUTE_ADVANTAGE[b]?.includes(a)) return dis;
  return 1.0;
}

function calcDmg(a: C, b: C, adv: number, dis: number): number {
  let dmg = Math.round(a.atk * 0.4 + 5);
  dmg = Math.round(dmg * (1 - Math.min(b.def * 0.7, 22) / 100));
  dmg = Math.round(dmg * (1 - b.mnt * 0.5 / 100));
  dmg = Math.round(dmg * getAttrMult(a.attr, b.attr, adv, dis));
  const ceM = a.ce === 0 ? 1.12 : 1 + a.ce * 0.006;
  dmg = Math.round(dmg * ceM);
  if (Math.random() < (20 + a.tec * 1.0) / 100) dmg = Math.round(dmg * 1.3);
  if (Math.random() < a.crt / 150) dmg = Math.round(dmg * 1.5);
  return Math.max(5, dmg);
}

function simTeam(a: C, b: C, adv: number, dis: number, trials: number): number {
  let aw = 0;
  for (let t = 0; t < trials; t++) {
    let ah = a.hp, bh = b.hp;
    const aF = a.spd >= b.spd;
    for (let i = 0; i < 100 && ah > 0 && bh > 0; i++) {
      if (aF) { bh -= calcDmg(a, b, adv, dis); if (bh <= 0) break; ah -= calcDmg(b, a, adv, dis); }
      else { ah -= calcDmg(b, a, adv, dis); if (ah <= 0) break; bh -= calcDmg(a, b, adv, dis); }
    }
    if (ah > bh) aw++;
  }
  return aw / trials;
}

function simIndiv(a: C, b: C, adv: number, dis: number, trials: number): number {
  let aw = 0;
  const aT = a.atk + a.def + a.spd + a.ce + a.hp;
  const bT = b.atk + b.def + b.spd + b.ce + b.hp;
  for (let t = 0; t < trials; t++) {
    let ah = a.hp, bh = b.hp;
    let aF = a.spd > b.spd ? true : b.spd > a.spd ? false : Math.random() > 0.5;
    let aG = 0, bG = 0;
    for (let turn = 1; turn <= 30 && ah > 0 && bh > 0; turn++) {
      const isA = (turn % 2 === 1) ? aF : !aF;
      const atk = isA ? a : b, dfd = isA ? b : a;
      let dmg = calcDmg(atk, dfd, adv, dis);
      const diff = (isA ? aT : bT) - (isA ? bT : aT);
      dmg = Math.round(dmg * Math.max(0.8, Math.min(1.2, 1 + diff / 1000)));
      dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));
      const g = isA ? aG : bG;
      if (g >= 100) { dmg = Math.round(dmg * 2.0); if (isA) aG = 0; else bG = 0; }
      dmg = Math.max(5, dmg);
      if (isA) bh -= dmg; else ah -= dmg;
      aG = Math.min(100, aG + 25); bG = Math.min(100, bG + 25);
    }
    if (ah > bh) aw++;
  }
  return aw / trials;
}

function runSim(chars: C[], adv: number, dis: number, tTrials: number, iTrials: number) {
  const grades = ['특급', '준특급', '1급', '준1급'];
  const allResults: Record<string, any[]> = {};
  let totalOK = 0, totalOP = 0, totalWK = 0;

  for (const grade of grades) {
    const gc = chars.filter(c => c.grade === grade);
    const n = gc.length;
    const tMat: number[][] = Array.from({length: n}, () => new Array(n).fill(0.5));
    const iMat: number[][] = Array.from({length: n}, () => new Array(n).fill(0.5));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        tMat[i][j] = simTeam(gc[i], gc[j], adv, dis, tTrials);
        tMat[j][i] = 1 - tMat[i][j];
        iMat[i][j] = simIndiv(gc[i], gc[j], adv, dis, iTrials);
        iMat[j][i] = 1 - iMat[i][j];
      }

    const results = gc.map((c, i) => {
      const tWR = +(tMat[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1) * 100).toFixed(1);
      const iWR = +(iMat[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1) * 100).toFixed(1);
      const avg = +((tWR + iWR) / 2).toFixed(1);
      return { ...c, tWR, iWR, avg };
    }).sort((a, b) => b.avg - a.avg);

    let ok = 0, op = 0, wk = 0;
    for (const r of results) {
      if (r.avg >= 65) op++; else if (r.avg <= 35) wk++; else ok++;
    }
    totalOK += ok; totalOP += op; totalWK += wk;
    allResults[grade] = results;
  }
  return { allResults, totalOK, totalOP, totalWK };
}

const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

// ====================================================================
// 메인
// ====================================================================
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  최종 밸런스 튜닝 시뮬레이션                                 ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('속성 복구: 리카→저주, 쵸소→변환, 이지치→결계\n');
console.log('1급 속성 분포 (수정 후):');
const g1 = BASE_CHARS.filter(c => c.grade === '1급');
const attrCount: Record<string, number> = {};
for (const c of g1) { attrCount[ATTR_KO[c.attr]] = (attrCount[ATTR_KO[c.attr]] || 0) + 1; }
console.log('  ' + Object.entries(attrCount).map(([k, v]) => `${k}:${v}`).join('  '));

// === STEP 1: 속성 배율 탐색 (스탯 미조정) ===
console.log('\n═══ STEP 1: 속성 배율 탐색 (스탯 변경 없이, 속성 복구만) ═══\n');

const attrCandidates = [
  { name: '현재(1.15/0.92)', adv: 1.15, dis: 0.92 },
  { name: '1.12/0.93', adv: 1.12, dis: 0.93 },
  { name: '1.10/0.95', adv: 1.10, dis: 0.95 },
  { name: '1.08/0.96', adv: 1.08, dis: 0.96 },
  { name: '1.18/0.90', adv: 1.18, dis: 0.90 },
  { name: '1.20/0.88', adv: 1.20, dis: 0.88 },
];

console.log(`${'배율'.padEnd(18)} ${'✅'.padStart(4)} ${'OP'.padStart(4)} ${'WK'.padStart(4)} | ${'1급 신체avg'.padStart(10)} ${'1급 변환avg'.padStart(10)} ${'격차'.padStart(6)}`);
console.log('─'.repeat(70));

let bestAttr = attrCandidates[0];
let bestAttrScore = Infinity;

for (const ac of attrCandidates) {
  process.stdout.write(`  ${ac.name} 테스트 중...\r`);
  const { allResults, totalOK, totalOP, totalWK } = runSim(BASE_CHARS, ac.adv, ac.dis, 20, 150);

  const bodyAvg = allResults['1급'].filter(r => r.attr === 'BODY').reduce((s: number, r: any) => s + r.avg, 0) / allResults['1급'].filter(r => r.attr === 'BODY').length;
  const convAvg = allResults['1급'].filter(r => r.attr === 'CONVERT').reduce((s: number, r: any) => s + r.avg, 0) / allResults['1급'].filter(r => r.attr === 'CONVERT').length;
  const gap = Math.abs(bodyAvg - convAvg);

  const score = totalOP * 10 + totalWK * 10 + gap * 2;
  if (score < bestAttrScore) { bestAttrScore = score; bestAttr = ac; }

  console.log(`${ac.name.padEnd(18)} ${totalOK.toString().padStart(4)} ${totalOP.toString().padStart(4)} ${totalWK.toString().padStart(4)} | ${bodyAvg.toFixed(1).padStart(10)} ${convAvg.toFixed(1).padStart(10)} ${gap.toFixed(1).padStart(6)}`);
}
console.log(`\n→ 최적 속성 배율: ${bestAttr.name}`);

// === STEP 2: 스탯 조정 + 최적 속성 배율 ===
console.log('\n═══ STEP 2: OP/WK 스탯 조정 + 최적 속성 배율 ═══\n');

const fixedChars = applyStatFixes(BASE_CHARS);
console.log('스탯 변경 사항:');
console.log('  OP 너프: 스쿠나 ATK 25→23, 리카 ATK 22→20 CE 24→22, 이타도리유지 SPD 20→18 HP 90→86');
console.log('  WK 버프: 유타 ATK+2, 유키 DEF+2, 텐겐 ATK+2 SPD+2, 마허라 SPD+2 CE+2');
console.log('  WK 버프: 요로즈 ATK+2 HP+5, 만상 ATK+2 HP+5, 메이메이 ATK+2 SPD+2 HP+4\n');

// 비교: 속성복구만 vs 속성복구+스탯조정
console.log('--- A: 속성 복구만 (스탯 미변경) ---');
const resA = runSim(BASE_CHARS, bestAttr.adv, bestAttr.dis, 30, 300);
console.log(`  ✅${resA.totalOK}  OP:${resA.totalOP}  WK:${resA.totalWK}`);

console.log('\n--- B: 속성 복구 + 스탯 조정 ---');
const resB = runSim(fixedChars, bestAttr.adv, bestAttr.dis, 30, 300);
console.log(`  ✅${resB.totalOK}  OP:${resB.totalOP}  WK:${resB.totalWK}`);

// === STEP 3: 최종 상세 결과 출력 ===
const finalRes = resB;
console.log('\n' + '═'.repeat(95));
console.log(`최종 결과 (속성 배율 ${bestAttr.name} + 스탯 조정)`);
console.log('═'.repeat(95));

for (const grade of ['특급', '준특급', '1급', '준1급']) {
  const results = finalRes.allResults[grade];
  const n = results.length;

  console.log(`\n【${grade}】 ${n}명`);
  console.log(`${'#'.padStart(2)}  ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)} ${'ATK'.padStart(3)} ${'DEF'.padStart(3)} ${'SPD'.padStart(3)} ${'CE'.padStart(3)} ${'HP'.padStart(3)}  ${'팀WR'.padStart(6)} ${'개인WR'.padStart(7)}  ${'평균'.padStart(5)}  상태`);
  console.log('─'.repeat(85));

  let ok = 0, op = 0, wk = 0;
  results.forEach((r: any, i: number) => {
    let flag = '';
    if (r.avg >= 65) { flag = '⚠OP'; op++; }
    else if (r.avg <= 35) { flag = '⚠WK'; wk++; }
    else { flag = '✅'; ok++; }
    console.log(
      `${(i+1).toString().padStart(2)}  ${r.name.padEnd(14)} ${ATTR_KO[r.attr].padEnd(4)} ` +
      `${r.atk.toString().padStart(3)} ${r.def.toString().padStart(3)} ${r.spd.toString().padStart(3)} ${r.ce.toString().padStart(3)} ${r.hp.toString().padStart(3)}  ` +
      `${r.tWR.toFixed(1).padStart(5)}% ${r.iWR.toFixed(1).padStart(6)}%  ${r.avg.toFixed(1).padStart(5)}%  ${flag}`
    );
  });

  // 속성별 평균
  const attrG: Record<string, number[]> = {};
  for (const r of results) {
    const ak = ATTR_KO[r.attr];
    if (!attrG[ak]) attrG[ak] = [];
    attrG[ak].push(r.avg);
  }
  const attrLine = Object.entries(attrG).map(([k, v]) => `${k}(${v.length}):${(v.reduce((s,x)=>s+x,0)/v.length).toFixed(1)}%`).join(' ');
  console.log(`  ✅${ok} ⚠OP:${op} ⚠WK:${wk} | ${attrLine}`);
}

const total = finalRes.totalOK + finalRes.totalOP + finalRes.totalWK;
console.log('\n' + '═'.repeat(95));
console.log(`종합: 전체 ${total}명 — ✅${finalRes.totalOK} (${(finalRes.totalOK/total*100).toFixed(1)}%)  ⚠OP:${finalRes.totalOP}  ⚠WK:${finalRes.totalWK}`);
console.log('═'.repeat(95));

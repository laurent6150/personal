/**
 * HP 시스템 비교 분석
 * 4가지 방식 비교:
 *   A. 현재 팀리그: 캐릭터 HP (72~100)
 *   B. 현재 개인리그: 고정 HP 100
 *   C. 등급별 고정 HP (특급100, 준특96, 1급86, 준1급80)
 *   D. 압축 HP: 캐릭터 HP를 90~100 범위로 압축
 */

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

interface CharData {
  name: string; grade: string; attribute: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number;
}

// 등급별 대표 캐릭터 (다양한 스탯 프로필)
const TEST_CHARS: CharData[] = [
  // 특급
  { name: "고죠 사토루", grade: "특급", attribute: "BARRIER", atk: 22, def: 20, spd: 22, ce: 25, hp: 100, crt: 10 },
  { name: "료멘 스쿠나", grade: "특급", attribute: "CURSE", atk: 25, def: 18, spd: 22, ce: 24, hp: 100, crt: 10 },
  { name: "켄자쿠", grade: "특급", attribute: "SOUL", atk: 20, def: 17, spd: 18, ce: 25, hp: 100, crt: 10 },
  { name: "이타도리(최종전)", grade: "특급", attribute: "SOUL", atk: 21, def: 18, spd: 21, ce: 22, hp: 95, crt: 10 },
  { name: "츠쿠모 유키", grade: "특급", attribute: "BODY", atk: 23, def: 16, spd: 19, ce: 24, hp: 95, crt: 10 },
  { name: "옷코츠 유타", grade: "특급", attribute: "CURSE", atk: 22, def: 18, spd: 20, ce: 25, hp: 100, crt: 10 },
  // 1급 (다양한 프로필)
  { name: "카시모 하지메", grade: "1급", attribute: "CONVERT", atk: 22, def: 15, spd: 22, ce: 21, hp: 86, crt: 10 },
  { name: "젠인 나오야", grade: "1급", attribute: "BODY", atk: 18, def: 13, spd: 23, ce: 18, hp: 78, crt: 10 },
  { name: "하나미", grade: "1급", attribute: "CONVERT", atk: 18, def: 19, spd: 16, ce: 20, hp: 92, crt: 10 },
  { name: "마키(각성)", grade: "1급", attribute: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 88, crt: 15 },
  { name: "다곤", grade: "1급", attribute: "CONVERT", atk: 19, def: 17, spd: 16, ce: 21, hp: 90, crt: 10 },
  { name: "히구루마", grade: "1급", attribute: "BARRIER", atk: 17, def: 18, spd: 16, ce: 23, hp: 86, crt: 10 },
  { name: "이시고리 류", grade: "1급", attribute: "RANGE", atk: 23, def: 15, spd: 14, ce: 20, hp: 88, crt: 10 },
  { name: "나나미 켄토", grade: "1급", attribute: "BODY", atk: 18, def: 17, spd: 16, ce: 18, hp: 88, crt: 10 },
  // 준1급 (다양한 HP)
  { name: "젠인 진이치", grade: "준1급", attribute: "BODY", atk: 17, def: 16, spd: 15, ce: 16, hp: 85, crt: 10 },
  { name: "이누마키 토게", grade: "준1급", attribute: "CURSE", atk: 14, def: 13, spd: 16, ce: 21, hp: 75, crt: 10 },
  { name: "옷코츠 유카", grade: "준1급", attribute: "BODY", atk: 16, def: 13, spd: 18, ce: 17, hp: 76, crt: 10 },
  { name: "우이우이", grade: "준1급", attribute: "BARRIER", atk: 14, def: 14, spd: 18, ce: 21, hp: 75, crt: 10 },
  { name: "야가 마사미치", grade: "준1급", attribute: "SOUL", atk: 15, def: 15, spd: 14, ce: 18, hp: 82, crt: 10 },
];

// === 데미지 계산 (통일된 공식) ===
function calcDamage(atk: number, def: number, atkAttr: string, defAttr: string, ce: number): number {
  let baseDmg = Math.round(atk * 0.4 + 5);
  const defReduction = Math.min(def * 0.3, 30);
  baseDmg = Math.round(baseDmg * (1 - defReduction / 100));
  baseDmg = Math.round(baseDmg * getAttributeMultiplier(atkAttr, defAttr));
  baseDmg = Math.round(baseDmg * (1 + ce / 100));
  return Math.max(5, baseDmg);
}

// === 시뮬레이션 (결정적 전투) ===
function simulateDeterministic(a: CharData, b: CharData, aHp: number, bHp: number): 'A' | 'B' | 'DRAW' {
  const dmgAB = calcDamage(a.atk, b.def, a.attribute, b.attribute, a.ce);
  const dmgBA = calcDamage(b.atk, a.def, b.attribute, a.attribute, b.ce);

  let aFirst = a.spd > b.spd ? true : b.spd > a.spd ? false : true; // 동속은 A 유리 (단순화)
  let aLife = aHp, bLife = bHp;
  let turn = 0;

  while (aLife > 0 && bLife > 0 && turn < 100) {
    turn++;
    if (aFirst) {
      bLife -= dmgAB; if (bLife <= 0) return 'A';
      aLife -= dmgBA; if (aLife <= 0) return 'B';
    } else {
      aLife -= dmgBA; if (aLife <= 0) return 'B';
      bLife -= dmgAB; if (bLife <= 0) return 'A';
    }
  }
  return aLife > bLife ? 'A' : aLife < bLife ? 'B' : 'DRAW';
}

// === 랜덤 시뮬레이션 (개인리그 스타일) ===
function simulateRandom(a: CharData, b: CharData, aHp: number, bHp: number, trials: number): number {
  let aWins = 0;
  for (let t = 0; t < trials; t++) {
    let aLife = aHp, bLife = bHp;
    let aFirst = a.spd > b.spd ? true : b.spd > a.spd ? false : Math.random() > 0.5;
    let aGauge = 0, bGauge = 0;
    let turn = 0;

    while (aLife > 0 && bLife > 0 && turn < 30) {
      turn++;
      const isATurn = (turn % 2 === 1) ? aFirst : !aFirst;
      const attacker = isATurn ? a : b;
      const defender = isATurn ? b : a;

      let dmg = calcDamage(attacker.atk, defender.def, attacker.attribute, defender.attribute, attacker.ce);
      dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));

      const gauge = isATurn ? aGauge : bGauge;
      if (gauge >= 100) { dmg = Math.round(dmg * 2.0); if (isATurn) aGauge = 0; else bGauge = 0; }
      else if (Math.random() < 0.3) dmg = Math.round(dmg * 1.3);

      if (Math.random() < attacker.crt / 150) dmg = Math.round(dmg * 1.5);
      dmg = Math.max(5, dmg);

      if (isATurn) { bLife -= dmg; } else { aLife -= dmg; }
      aGauge = Math.min(100, aGauge + 25);
      bGauge = Math.min(100, bGauge + 25);
    }
    if (aLife > bLife) aWins++;
  }
  return aWins / trials;
}

// === HP 시스템별 HP 계산 ===
const GRADE_AVG_HP: Record<string, number> = { "특급": 98, "준특급": 96, "1급": 86, "준1급": 80, "2급": 77, "3급": 74 };

function getHpForSystem(c: CharData, system: string): number {
  switch (system) {
    case 'A': return c.hp;                    // 캐릭터 HP (72~100)
    case 'B': return 100;                     // 고정 HP 100
    case 'C': return GRADE_AVG_HP[c.grade] || 80; // 등급별 고정 HP
    case 'D': return Math.round(90 + (c.hp - 72) * (10 / 28)); // 90~100 압축
    default: return c.hp;
  }
}

// === 분석 실행 ===
const TRIALS = 500;
const systems = ['A', 'B', 'C', 'D'];
const systemNames: Record<string, string> = {
  'A': '캐릭터 HP (72~100)',
  'B': '고정 HP 100',
  'C': '등급별 고정 HP',
  'D': '압축 HP (90~100)',
};

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  HP 시스템 비교 분석                                       ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

// 1. HP 분포 표시
console.log('\n' + '='.repeat(70));
console.log('1. 시스템별 HP 분포');
console.log('='.repeat(70));
console.log(`${'캐릭터'.padEnd(14)} ${'등급'.padEnd(5)} ${'A(원본)'.padStart(8)} ${'B(고정)'.padStart(8)} ${'C(등급)'.padStart(8)} ${'D(압축)'.padStart(8)}`);
console.log('-'.repeat(60));
for (const c of TEST_CHARS) {
  console.log(`${c.name.padEnd(14)} ${c.grade.padEnd(5)} ${getHpForSystem(c, 'A').toString().padStart(8)} ${getHpForSystem(c, 'B').toString().padStart(8)} ${getHpForSystem(c, 'C').toString().padStart(8)} ${getHpForSystem(c, 'D').toString().padStart(8)}`);
}

// 2. 등급 내 결정적 전투 분석 (팀리그)
console.log('\n' + '='.repeat(70));
console.log('2. 등급 내 밸런스 비교 (결정적 전투 - 팀리그 스타일)');
console.log('='.repeat(70));

for (const grade of ['특급', '1급', '준1급']) {
  const chars = TEST_CHARS.filter(c => c.grade === grade);
  const n = chars.length;

  console.log(`\n【${grade}】`);
  for (const sys of systems) {
    const wins = chars.map(() => 0);
    const total = chars.map(() => 0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const aHp = getHpForSystem(chars[i], sys);
        const bHp = getHpForSystem(chars[j], sys);
        const result = simulateDeterministic(chars[i], chars[j], aHp, bHp);
        if (result === 'A') wins[i]++;
        total[i]++;
      }
    }

    const winRates = chars.map((c, i) => ({
      name: c.name,
      rate: Math.round((wins[i] / total[i]) * 1000) / 10
    })).sort((a, b) => b.rate - a.rate);

    const range = winRates[0].rate - winRates[winRates.length - 1].rate;
    const avg = winRates.reduce((s, w) => s + w.rate, 0) / winRates.length;
    const stdDev = Math.sqrt(winRates.reduce((s, w) => s + Math.pow(w.rate - avg, 2), 0) / winRates.length);

    console.log(`  시스템 ${sys} (${systemNames[sys]}):`);
    console.log(`    범위: ${winRates[winRates.length-1].rate}% ~ ${winRates[0].rate}% | 편차: ${range.toFixed(1)}%p | 표준편차: ${stdDev.toFixed(1)}%p`);
    console.log(`    최강: ${winRates[0].name}(${winRates[0].rate}%) | 최약: ${winRates[winRates.length-1].name}(${winRates[winRates.length-1].rate}%)`);
  }
}

// 3. 등급 내 랜덤 전투 분석 (개인리그)
console.log('\n' + '='.repeat(70));
console.log('3. 등급 내 밸런스 비교 (랜덤 전투 - 개인리그 스타일, 500회)');
console.log('='.repeat(70));

for (const grade of ['특급', '1급', '준1급']) {
  const chars = TEST_CHARS.filter(c => c.grade === grade);
  const n = chars.length;

  console.log(`\n【${grade}】`);
  for (const sys of systems) {
    const winRates: number[][] = Array.from({length: n}, () => new Array(n).fill(0.5));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const aHp = getHpForSystem(chars[i], sys);
        const bHp = getHpForSystem(chars[j], sys);
        winRates[i][j] = simulateRandom(chars[i], chars[j], aHp, bHp, TRIALS);
        winRates[j][i] = 1 - winRates[i][j];
      }
    }

    const avgRates = chars.map((c, i) => ({
      name: c.name,
      rate: Math.round((winRates[i].reduce((s, v) => s + v, 0) / n) * 1000) / 10
    })).sort((a, b) => b.rate - a.rate);

    const range = avgRates[0].rate - avgRates[avgRates.length - 1].rate;
    const avg = avgRates.reduce((s, w) => s + w.rate, 0) / avgRates.length;
    const stdDev = Math.sqrt(avgRates.reduce((s, w) => s + Math.pow(w.rate - avg, 2), 0) / avgRates.length);

    console.log(`  시스템 ${sys} (${systemNames[sys]}):`);
    for (const r of avgRates) {
      const bar = '█'.repeat(Math.round(r.rate / 2));
      console.log(`    ${r.name.padEnd(14)} ${r.rate.toFixed(1).padStart(5)}% ${bar}`);
    }
    console.log(`    범위편차: ${range.toFixed(1)}%p | 표준편차: ${stdDev.toFixed(1)}%p`);
  }
}

// 4. HP 스탯 유효성 분석
console.log('\n' + '='.repeat(70));
console.log('4. HP 스탯 유효성 분석 (HP 스탯이 승률에 미치는 영향)');
console.log('='.repeat(70));

// 표준 캐릭터로 HP만 변화시키며 테스트
const baseChar: CharData = {
  name: "표준", grade: "1급", attribute: "BODY", atk: 18, def: 16, spd: 17, ce: 20, hp: 85, crt: 10
};
const enemy: CharData = {
  name: "적", grade: "1급", attribute: "CONVERT", atk: 18, def: 16, spd: 17, ce: 20, hp: 85, crt: 10
};

console.log('\n표준 캐릭터 (ATK18/DEF16/SPD17/CE20) vs 적 (동일 스탯, 속성 유리)');
console.log('HP 변화에 따른 승률 변동:');

for (const hp of [72, 78, 85, 90, 95, 100]) {
  const testChar = { ...baseChar, hp };
  // 결정적
  const detResult = simulateDeterministic(testChar, enemy, hp, 85);
  // 랜덤 (시스템 A: 캐릭터 HP)
  const rndRateA = simulateRandom(testChar, enemy, hp, 85, 1000);
  // 랜덤 (시스템 B: 고정 HP 100)
  const rndRateB = simulateRandom(testChar, enemy, 100, 100, 1000);

  console.log(`  HP ${hp.toString().padStart(3)} → 결정적: ${detResult === 'A' ? '승' : detResult === 'B' ? '패' : '무'} | 랜덤(캐릭HP): ${(rndRateA * 100).toFixed(1).padStart(5)}% | 랜덤(고정100): ${(rndRateB * 100).toFixed(1).padStart(5)}%`);
}

// 5. 전투 턴수 분석
console.log('\n' + '='.repeat(70));
console.log('5. 전투 턴수 분석 (시스템별 평균 전투 길이)');
console.log('='.repeat(70));

function countTurns(a: CharData, b: CharData, aHp: number, bHp: number): number {
  const dmgAB = calcDamage(a.atk, b.def, a.attribute, b.attribute, a.ce);
  const dmgBA = calcDamage(b.atk, a.def, b.attribute, a.attribute, b.ce);
  let aFirst = a.spd >= b.spd;
  let aLife = aHp, bLife = bHp, turn = 0;
  while (aLife > 0 && bLife > 0 && turn < 100) {
    turn++;
    if (aFirst) { bLife -= dmgAB; if (bLife <= 0) break; aLife -= dmgBA; }
    else { aLife -= dmgBA; if (aLife <= 0) break; bLife -= dmgAB; }
  }
  return turn;
}

for (const grade of ['특급', '1급', '준1급']) {
  const chars = TEST_CHARS.filter(c => c.grade === grade);
  const n = chars.length;

  for (const sys of systems) {
    let totalTurns = 0, count = 0;
    let minTurns = 999, maxTurns = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const t = countTurns(chars[i], chars[j], getHpForSystem(chars[i], sys), getHpForSystem(chars[j], sys));
        totalTurns += t;
        count++;
        if (t < minTurns) minTurns = t;
        if (t > maxTurns) maxTurns = t;
      }
    }

    console.log(`  ${grade} 시스템${sys}: 평균 ${(totalTurns / count).toFixed(1)}턴 (${minTurns}~${maxTurns}턴)`);
  }
}

// 6. 종합 평가
console.log('\n' + '='.repeat(70));
console.log('6. 종합 평가');
console.log('='.repeat(70));
console.log(`
  시스템 A (캐릭터 HP 72~100):
    ✅ HP 스탯이 의미 있음 → 탱커/딜러 역할 분화
    ✅ 등급 간 차이 자연스러움 (상위 등급 = 높은 HP)
    ❌ 등급 내 HP 편차가 승률에 과도한 영향 (1급: 78~92 = 18% 차이)
    ❌ 저HP 캐릭터는 다른 스탯이 아무리 좋아도 불리

  시스템 B (고정 HP 100):
    ✅ 순수 스탯 경쟁 (ATK/DEF/SPD/CE만으로 승부)
    ✅ 등급 내 밸런스가 가장 좋음
    ❌ HP 스탯이 완전히 무의미 (8개 스탯 중 1개 사장)
    ❌ 등급 간 전투에서 차이가 사라짐 (3급도 HP 100)

  시스템 C (등급별 고정 HP):
    ✅ 등급 간 차이 유지 (상위 등급 유리)
    ✅ 등급 내에서는 순수 스탯 경쟁
    ❌ 개인 HP 스탯 무의미 (같은 등급 내에서)
    ❌ 등급 간 경계가 기계적으로 느껴짐

  시스템 D (압축 HP 90~100):
    ✅ HP 스탯이 여전히 의미 있되 영향력 제한
    ✅ HP 차이가 최대 10%p → 다른 스탯으로 역전 가능
    ✅ 등급 간 차이도 자연스럽게 유지
    ❌ HP 72→90, 100→100 이므로 저등급 상대적 버프
`);

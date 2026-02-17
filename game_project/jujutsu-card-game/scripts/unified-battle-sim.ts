/**
 * 통합 시뮬레이션: 팀리그 & 개인리그 동일 매치업 비교
 * 특급 ~ 준1급 캐릭터 대상
 *
 * 목표: 속성 배율/CE 계수 통일 후 양쪽 승률 수렴 확인
 */

// ============================
// 상수 (constants.ts에서 가져옴)
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

// ============================
// 캐릭터 데이터 (밸런스 조정 후)
// ============================
interface CharData {
  id: string;
  name: string;
  grade: string;
  attribute: string;
  atk: number;
  def: number;
  spd: number;
  ce: number;
  hp: number;
  crt: number;
  tec: number;
  mnt: number;
}

const CHARACTERS: CharData[] = [
  // === 특급 (6명) ===
  { id: "gojo_satoru", name: "고죠 사토루", grade: "특급", attribute: "BARRIER", atk: 22, def: 20, spd: 22, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { id: "ryomen_sukuna", name: "료멘 스쿠나", grade: "특급", attribute: "CURSE", atk: 25, def: 18, spd: 22, ce: 24, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { id: "kenjaku", name: "켄자쿠", grade: "특급", attribute: "SOUL", atk: 20, def: 17, spd: 18, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { id: "yuki_tsukumo", name: "츠쿠모 유키", grade: "특급", attribute: "BODY", atk: 23, def: 16, spd: 19, ce: 24, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { id: "okkotsu_yuta", name: "옷코츠 유타", grade: "특급", attribute: "CURSE", atk: 22, def: 18, spd: 20, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { id: "itadori_final", name: "이타도리(최종전)", grade: "특급", attribute: "SOUL", atk: 21, def: 18, spd: 21, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },

  // === 준특급 (7명) ===
  { id: "geto_suguru", name: "게토 스구루", grade: "준특급", attribute: "CURSE", atk: 19, def: 18, spd: 18, ce: 22, hp: 93, crt: 10, tec: 10, mnt: 10 },
  { id: "tengen", name: "텐겐", grade: "준특급", attribute: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { id: "fushiguro_toji", name: "후시구로 토우지", grade: "준특급", attribute: "BODY", atk: 23, def: 16, spd: 22, ce: 0, hp: 92, crt: 18, tec: 20, mnt: 10 },
  { id: "mahoraga", name: "마허라", grade: "준특급", attribute: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: 10, tec: 10, mnt: 10 },
  { id: "rika_full", name: "완전체 리카", grade: "준특급", attribute: "SOUL", atk: 22, def: 17, spd: 19, ce: 24, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { id: "tamamo_no_mae", name: "타마모노마에", grade: "준특급", attribute: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 95, crt: 10, tec: 10, mnt: 10 },
  { id: "dabura", name: "다부라", grade: "준특급", attribute: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: 10, tec: 10, mnt: 10 },

  // === 1급 (25명) ===
  { id: "itadori_yuji", name: "이타도리 유지", grade: "1급", attribute: "BODY", atk: 19, def: 16, spd: 20, ce: 18, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { id: "maki_zenin_awakened", name: "젠인 마키(각성)", grade: "1급", attribute: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 88, crt: 15, tec: 19, mnt: 8 },
  { id: "nanami_kento", name: "나나미 켄토", grade: "1급", attribute: "BODY", atk: 18, def: 17, spd: 16, ce: 18, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { id: "jogo", name: "죠고", grade: "1급", attribute: "CONVERT", atk: 22, def: 13, spd: 17, ce: 23, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { id: "hanami", name: "하나미", grade: "1급", attribute: "CONVERT", atk: 18, def: 19, spd: 16, ce: 20, hp: 92, crt: 10, tec: 10, mnt: 10 },
  { id: "naobito_zenin", name: "젠인 나오비토", grade: "1급", attribute: "BODY", atk: 19, def: 14, spd: 22, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { id: "naoya_zenin", name: "젠인 나오야", grade: "1급", attribute: "BODY", atk: 18, def: 13, spd: 23, ce: 18, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { id: "hiromi_higuruma", name: "히구루마 히로미", grade: "1급", attribute: "BARRIER", atk: 17, def: 18, spd: 16, ce: 23, hp: 86, crt: 10, tec: 10, mnt: 10 },
  { id: "hajime_kashimo", name: "카시모 하지메", grade: "1급", attribute: "CONVERT", atk: 22, def: 15, spd: 22, ce: 21, hp: 86, crt: 10, tec: 10, mnt: 10 },
  { id: "ryu_ishigori", name: "이시고리 류", grade: "1급", attribute: "RANGE", atk: 23, def: 15, spd: 14, ce: 20, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { id: "takako_uro", name: "우로 타카코", grade: "1급", attribute: "BARRIER", atk: 18, def: 16, spd: 20, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { id: "kinji_hakari", name: "하카리 킨지", grade: "1급", attribute: "BARRIER", atk: 21, def: 16, spd: 20, ce: 22, hp: 87, crt: 10, tec: 10, mnt: 10 },
  { id: "choso", name: "쵸소", grade: "1급", attribute: "CURSE", atk: 18, def: 16, spd: 17, ce: 19, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { id: "todo_aoi", name: "토도 아오이", grade: "1급", attribute: "BODY", atk: 20, def: 16, spd: 17, ce: 17, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { id: "uraume", name: "우라우메", grade: "1급", attribute: "CONVERT", atk: 17, def: 17, spd: 18, ce: 20, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { id: "yorozu", name: "요로즈", grade: "1급", attribute: "CONVERT", atk: 19, def: 15, spd: 17, ce: 21, hp: 83, crt: 10, tec: 10, mnt: 10 },
  { id: "mahito", name: "마히토", grade: "1급", attribute: "SOUL", atk: 19, def: 15, spd: 19, ce: 22, hp: 83, crt: 10, tec: 10, mnt: 10 },
  { id: "mei_mei", name: "메이메이", grade: "1급", attribute: "RANGE", atk: 18, def: 15, spd: 16, ce: 18, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { id: "dagon", name: "다곤", grade: "1급", attribute: "CONVERT", atk: 19, def: 17, spd: 16, ce: 21, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { id: "mechamaru", name: "메카마루", grade: "1급", attribute: "RANGE", atk: 19, def: 17, spd: 14, ce: 21, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { id: "miguel", name: "미겔", grade: "1급", attribute: "BODY", atk: 20, def: 16, spd: 19, ce: 18, hp: 88, crt: 10, tec: 10, mnt: 10 },
  { id: "smallpox_deity", name: "포창신", grade: "1급", attribute: "CURSE", atk: 18, def: 18, spd: 14, ce: 22, hp: 90, crt: 10, tec: 10, mnt: 10 },
  { id: "kurourushi", name: "쿠로우루시", grade: "1급", attribute: "CURSE", atk: 18, def: 14, spd: 18, ce: 20, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { id: "bansho", name: "만상", grade: "1급", attribute: "CONVERT", atk: 19, def: 16, spd: 16, ce: 20, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { id: "tsurugi_okkotsu", name: "옷코츠 츠루기", grade: "1급", attribute: "BODY", atk: 20, def: 15, spd: 21, ce: 0, hp: 87, crt: 15, tec: 19, mnt: 8 },

  // === 준1급 (17명) ===
  { id: "fushiguro_megumi", name: "후시구로 메구미", grade: "준1급", attribute: "SOUL", atk: 16, def: 15, spd: 17, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { id: "inumaki_toge", name: "이누마키 토게", grade: "준1급", attribute: "CURSE", atk: 14, def: 13, spd: 16, ce: 21, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { id: "maki_zenin", name: "젠인 마키", grade: "준1급", attribute: "BODY", atk: 17, def: 15, spd: 18, ce: 5, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { id: "angel_hana", name: "천사/하나", grade: "준1급", attribute: "BARRIER", atk: 15, def: 17, spd: 16, ce: 22, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { id: "reggie_star", name: "레지 스타", grade: "준1급", attribute: "RANGE", atk: 16, def: 14, spd: 17, ce: 19, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { id: "takaba_fumihiko", name: "타카바 후미히코", grade: "준1급", attribute: "SOUL", atk: 14, def: 18, spd: 15, ce: 20, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { id: "jinichi_zenin", name: "젠인 진이치", grade: "준1급", attribute: "BODY", atk: 17, def: 16, spd: 15, ce: 16, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { id: "ogi_zenin", name: "젠인 오기", grade: "준1급", attribute: "CONVERT", atk: 18, def: 14, spd: 16, ce: 17, hp: 82, crt: 10, tec: 10, mnt: 10 },
  { id: "noritoshi_kamo", name: "카모 노리토시", grade: "준1급", attribute: "CONVERT", atk: 15, def: 14, spd: 17, ce: 18, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { id: "iori_hazenoki", name: "하제노키 이오리", grade: "준1급", attribute: "RANGE", atk: 16, def: 12, spd: 17, ce: 17, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { id: "atsuya_kusakabe", name: "쿠사카베 아츠야", grade: "준1급", attribute: "BODY", atk: 16, def: 16, spd: 15, ce: 14, hp: 85, crt: 10, tec: 10, mnt: 10 },
  { id: "ui_ui", name: "우이우이", grade: "준1급", attribute: "BARRIER", atk: 14, def: 14, spd: 18, ce: 21, hp: 75, crt: 10, tec: 10, mnt: 10 },
  { id: "yuka_okkotsu", name: "옷코츠 유카", grade: "준1급", attribute: "BODY", atk: 16, def: 13, spd: 18, ce: 17, hp: 76, crt: 10, tec: 10, mnt: 10 },
  { id: "cross", name: "크로스", grade: "준1급", attribute: "CONVERT", atk: 18, def: 15, spd: 17, ce: 19, hp: 80, crt: 10, tec: 10, mnt: 10 },
  { id: "marulu", name: "마루", grade: "준1급", attribute: "BARRIER", atk: 15, def: 16, spd: 16, ce: 23, hp: 78, crt: 10, tec: 10, mnt: 10 },
  { id: "usami", name: "우사미", grade: "준1급", attribute: "CURSE", atk: 15, def: 14, spd: 16, ce: 21, hp: 76, crt: 10, tec: 10, mnt: 10 },
  { id: "yaga_masamichi", name: "야가 마사미치", grade: "준1급", attribute: "SOUL", atk: 15, def: 15, spd: 14, ce: 18, hp: 82, crt: 10, tec: 10, mnt: 10 },
];

// ============================
// 팀리그 시뮬레이션 (battleCalculator.ts 공식 - 개인리그와 동일한 데미지 공식)
// ============================
function calcTeamDamage(attacker: CharData, defender: CharData): number {
  // 1. 기본 데미지 (ATK×0.4+5)
  let baseDmg = Math.round(attacker.atk * 0.4 + 5);
  // 2. 방어력 퍼센트 감소 (최대 30%)
  const defReduction = Math.min(defender.def * 0.3, 30);
  baseDmg = Math.round(baseDmg * (1 - defReduction / 100));
  // 3. 속성 배율
  const attrMult = getAttributeMultiplier(attacker.attribute, defender.attribute);
  baseDmg = Math.round(baseDmg * attrMult);
  // 4. CE 배율
  const ceMult = 1 + (attacker.ce / 100);
  baseDmg = Math.round(baseDmg * ceMult);
  // 5. 최소 데미지 5
  return Math.max(5, baseDmg);
}

function simulateTeamLeagueBattle(a: CharData, b: CharData, trials: number): number {
  let aWins = 0;

  for (let t = 0; t < trials; t++) {
    let aHp = a.hp;
    let bHp = b.hp;

    const dmgAtoB = calcTeamDamage(a, b);
    const dmgBtoA = calcTeamDamage(b, a);

    // 선공 결정
    let aFirst: boolean;
    if (a.spd > b.spd) aFirst = true;
    else if (b.spd > a.spd) aFirst = false;
    else aFirst = Math.random() > 0.5;

    let turn = 0;
    while (aHp > 0 && bHp > 0 && turn < 100) {
      turn++;
      if (aFirst) {
        bHp -= dmgAtoB;
        if (bHp <= 0) break;
        aHp -= dmgBtoA;
      } else {
        aHp -= dmgBtoA;
        if (aHp <= 0) break;
        bHp -= dmgAtoB;
      }
    }

    if (aHp > bHp) aWins++;
  }

  return aWins / trials;
}

// ============================
// 개인리그 시뮬레이션 (individualBattleSimulator.ts 공식)
// ============================
function simulateIndividualBattle(a: CharData, b: CharData, trials: number): number {
  let aWins = 0;

  for (let t = 0; t < trials; t++) {
    let aHp = 100; // 개인리그: 고정 HP 100
    let bHp = 100;

    const attrMultAB = getAttributeMultiplier(a.attribute, b.attribute);
    const attrMultBA = getAttributeMultiplier(b.attribute, a.attribute);

    // 선공 결정
    let aFirst: boolean;
    if (a.spd > b.spd) aFirst = true;
    else if (b.spd > a.spd) aFirst = false;
    else aFirst = Math.random() > 0.5;

    // 게이지 추적
    let aGauge = 0, bGauge = 0;
    const GAUGE_CHARGE = 25;

    let turn = 0;
    while (aHp > 0 && bHp > 0 && turn < 30) {
      turn++;

      // 공격자/수비자 결정 (교대 방식)
      const isATurn = (turn % 2 === 1) ? aFirst : !aFirst;
      const attacker = isATurn ? a : b;
      const defender = isATurn ? b : a;
      const attackerAttrMult = isATurn ? attrMultAB : attrMultBA;
      const attackerGauge = isATurn ? aGauge : bGauge;

      // 데미지 계산
      let baseDmg = Math.round(attacker.atk * 0.4 + 5);
      const defReduction = Math.min(defender.def * 0.3, 30);
      baseDmg = Math.round(baseDmg * (1 - defReduction / 100));
      baseDmg = Math.round(baseDmg * attackerAttrMult);
      const ceMult = 1 + (attacker.ce * 0.01);
      baseDmg = Math.round(baseDmg * ceMult);
      baseDmg = Math.max(5, baseDmg);

      // 랜덤 변동 (±10%)
      const variance = 0.9 + Math.random() * 0.2;
      baseDmg = Math.round(baseDmg * variance);

      // 액션 타입 (필살기 / 스킬 / 일반)
      let multiplier = 1.0;
      const forceUltimate = attackerGauge >= 100;
      if (forceUltimate) {
        multiplier = 2.0;
      } else if (Math.random() < 0.3) {
        multiplier = 1.3;
      }

      // 크리티컬 (crt/150 확률)
      const critChance = attacker.crt / 150;
      const isCrit = Math.random() < critChance;

      let finalDmg = Math.round(baseDmg * multiplier);
      if (isCrit) finalDmg = Math.round(finalDmg * 1.5);
      finalDmg = Math.max(5, finalDmg);

      // 데미지 적용
      if (isATurn) {
        bHp -= finalDmg;
        if (forceUltimate) aGauge = 0;
        else { aGauge = Math.min(100, aGauge + GAUGE_CHARGE); bGauge = Math.min(100, bGauge + GAUGE_CHARGE); }
      } else {
        aHp -= finalDmg;
        if (forceUltimate) bGauge = 0;
        else { aGauge = Math.min(100, aGauge + GAUGE_CHARGE); bGauge = Math.min(100, bGauge + GAUGE_CHARGE); }
      }
    }

    if (aHp > bHp) aWins++;
  }

  return aWins / trials;
}

// ============================
// 시뮬레이션 실행
// ============================
const TRIALS = 500;

function getCharsByGrade(grade: string): CharData[] {
  return CHARACTERS.filter(c => c.grade === grade);
}

interface GradeResult {
  grade: string;
  teamResults: { name: string; attr: string; avgWinRate: number }[];
  indivResults: { name: string; attr: string; avgWinRate: number }[];
  maxDiff: number;
  avgDiff: number;
}

function simulateGrade(grade: string): GradeResult {
  const chars = getCharsByGrade(grade);
  const n = chars.length;

  const teamWins: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const indivWins: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) { teamWins[i][j] = 0.5; indivWins[i][j] = 0.5; continue; }
      if (j > i) {
        teamWins[i][j] = simulateTeamLeagueBattle(chars[i], chars[j], TRIALS);
        teamWins[j][i] = 1 - teamWins[i][j];
        indivWins[i][j] = simulateIndividualBattle(chars[i], chars[j], TRIALS);
        indivWins[j][i] = 1 - indivWins[i][j];
      }
    }
  }

  // 평균 승률 계산
  const teamResults = chars.map((c, i) => {
    const avg = teamWins[i].reduce((s, v) => s + v, 0) / n;
    return { name: c.name, attr: c.attribute, avgWinRate: Math.round(avg * 1000) / 10 };
  }).sort((a, b) => b.avgWinRate - a.avgWinRate);

  const indivResults = chars.map((c, i) => {
    const avg = indivWins[i].reduce((s, v) => s + v, 0) / n;
    return { name: c.name, attr: c.attribute, avgWinRate: Math.round(avg * 1000) / 10 };
  }).sort((a, b) => b.avgWinRate - a.avgWinRate);

  // 팀/개인 승률 차이 분석
  let maxDiff = 0;
  let totalDiff = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    const teamAvg = teamWins[i].reduce((s, v) => s + v, 0) / n;
    const indivAvg = indivWins[i].reduce((s, v) => s + v, 0) / n;
    const diff = Math.abs(teamAvg - indivAvg) * 100;
    if (diff > maxDiff) maxDiff = diff;
    totalDiff += diff;
    count++;
  }

  return {
    grade,
    teamResults,
    indivResults,
    maxDiff: Math.round(maxDiff * 10) / 10,
    avgDiff: Math.round((totalDiff / count) * 10) / 10
  };
}

// ============================
// 속성 상성 매트릭스 시뮬레이션
// ============================
function simulateAttributeMatrix() {
  const attrs = ['BARRIER', 'BODY', 'CURSE', 'SOUL', 'CONVERT', 'RANGE'];
  const attrKo: Record<string, string> = {
    BARRIER: '결계', BODY: '신체', CURSE: '저주',
    SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
  };

  // 표준 캐릭터 (ATK 18, DEF 16, SPD 17, CE 20)
  const makeChar = (attr: string): CharData => ({
    id: attr, name: attrKo[attr], grade: "test", attribute: attr,
    atk: 18, def: 16, spd: 17, ce: 20, hp: 88, crt: 10, tec: 10, mnt: 10
  });

  console.log('\n' + '='.repeat(70));
  console.log('속성 상성 매트릭스 (표준 캐릭터 기준, 개인리그 500회)');
  console.log('='.repeat(70));

  // 헤더
  const header = '          ' + attrs.map(a => attrKo[a].padStart(6)).join('');
  console.log(header);

  for (const atkAttr of attrs) {
    const row: string[] = [attrKo[atkAttr].padEnd(8)];
    for (const defAttr of attrs) {
      if (atkAttr === defAttr) {
        row.push('  -   ');
      } else {
        const wr = simulateIndividualBattle(makeChar(atkAttr), makeChar(defAttr), TRIALS);
        row.push((Math.round(wr * 1000) / 10).toFixed(1).padStart(5) + '%');
      }
    }
    console.log(row.join(''));
  }
}

// ============================
// 실행
// ============================
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  주술회전 카드게임 - 통합 밸런스 시뮬레이션               ║');
console.log('║  데미지 공식: (ATK×0.4+5)×(1-DEF%)×속성×CE (통일)      ║');
console.log('║  속성 배율: 1.1/0.95 | CE 계수: 0.01 | 매치업당 500회  ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

// 속성 매트릭스
simulateAttributeMatrix();

// 등급별 시뮬레이션
const grades = ['특급', '준특급', '1급', '준1급'];

for (const grade of grades) {
  console.log('\n' + '='.repeat(70));
  console.log(`【${grade}】 등급 내 시뮬레이션`);
  console.log('='.repeat(70));

  const result = simulateGrade(grade);

  console.log(`\n▶ 팀리그 순위 (캐릭터 HP 기반):`);
  result.teamResults.forEach((r, i) => {
    const bar = '█'.repeat(Math.round(r.avgWinRate / 2));
    console.log(`  ${(i+1).toString().padStart(2)}. ${r.name.padEnd(14)} [${r.attr.padEnd(7)}] ${r.avgWinRate.toFixed(1).padStart(5)}% ${bar}`);
  });

  console.log(`\n▶ 개인리그 순위 (HP 100 기반):`);
  result.indivResults.forEach((r, i) => {
    const bar = '█'.repeat(Math.round(r.avgWinRate / 2));
    console.log(`  ${(i+1).toString().padStart(2)}. ${r.name.padEnd(14)} [${r.attr.padEnd(7)}] ${r.avgWinRate.toFixed(1).padStart(5)}% ${bar}`);
  });

  // 승률 범위
  const teamRange = result.teamResults[0].avgWinRate - result.teamResults[result.teamResults.length-1].avgWinRate;
  const indivRange = result.indivResults[0].avgWinRate - result.indivResults[result.indivResults.length-1].avgWinRate;

  console.log(`\n▶ 밸런스 지표:`);
  console.log(`  팀리그 승률 범위:   ${result.teamResults[result.teamResults.length-1].avgWinRate.toFixed(1)}% ~ ${result.teamResults[0].avgWinRate.toFixed(1)}% (편차: ${teamRange.toFixed(1)}%p)`);
  console.log(`  개인리그 승률 범위: ${result.indivResults[result.indivResults.length-1].avgWinRate.toFixed(1)}% ~ ${result.indivResults[0].avgWinRate.toFixed(1)}% (편차: ${indivRange.toFixed(1)}%p)`);
  console.log(`  팀-개인 최대 차이:  ${result.maxDiff.toFixed(1)}%p`);
  console.log(`  팀-개인 평균 차이:  ${result.avgDiff.toFixed(1)}%p`);
}

console.log('\n' + '='.repeat(70));
console.log('시뮬레이션 완료');
console.log('='.repeat(70));

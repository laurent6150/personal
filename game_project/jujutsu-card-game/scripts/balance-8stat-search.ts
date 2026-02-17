/**
 * 8스탯 통합 밸런스 시뮬레이션
 *
 * 8스탯 역할:
 *   ATK → 기본 데미지
 *   DEF → 피해 감소%
 *   SPD → 선공 판정
 *   CE  → 데미지 배율 (CE0: 고정 보너스)
 *   HP  → 체력
 *   CRT → 크리티컬 확률 (양 리그 공통)
 *   TEC → 스킬 발동률 증가 (기본 20% + TEC×rate)
 *   MNT → 피해 감소 추가 보정 (MNT×rate%)
 *
 * CE0 캐릭터: TEC/MNT 높게 세팅 → CE 부재 보상
 * 일반 캐릭터: TEC=10, MNT=10 (동일 기본값)
 */

const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'], BODY: ['BARRIER', 'CONVERT'],
  CURSE: ['BODY', 'RANGE'], SOUL: ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'], RANGE: ['BODY', 'SOUL']
};

interface Params {
  atkCoeff: number; baseDmg: number;
  defRate: number; defCap: number;
  ceCoeff: number; ce0Bonus: number;
  advMult: number; disadvMult: number;
  // 새 파라미터
  crtRate: number;      // CRT → 크리티컬 확률 = CRT × crtRate (기본 1/150)
  crtDmg: number;       // 크리티컬 데미지 배율
  tecSkillBase: number; // 스킬 기본 발동률 (%)
  tecRate: number;      // TEC → 스킬 발동률 추가 = TEC × tecRate (%)
  skillMult: number;    // 스킬 데미지 배율
  mntRate: number;      // MNT → 추가 피해 감소 = MNT × mntRate (%)
}

interface C {
  name: string; grade: string; attr: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number; tec: number; mnt: number;
}

// CE0 캐릭터: 실제 TEC/MNT 값 사용, 일반: 기본값 10/10
const CHARS: C[] = [
  // 특급 (6명) - tec:10, mnt:10
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
  // 1급 (25명) - CE0: 마키각성, 츠루기
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

// === 데미지 계산 (8스탯 통합) ===
function calcDmg(a: C, b: C, p: Params): number {
  // 1. ATK → 기본 데미지
  let dmg = Math.round(a.atk * p.atkCoeff + p.baseDmg);

  // 2. DEF → 피해 감소%
  const defRed = Math.min(b.def * p.defRate, p.defCap);
  dmg = Math.round(dmg * (1 - defRed / 100));

  // 3. MNT → 추가 피해 감소% (수비자)
  const mntRed = b.mnt * p.mntRate;
  dmg = Math.round(dmg * (1 - mntRed / 100));

  // 4. 속성 배율
  let attrM = 1.0;
  if (ATTRIBUTE_ADVANTAGE[a.attr]?.includes(b.attr)) attrM = p.advMult;
  else if (ATTRIBUTE_ADVANTAGE[b.attr]?.includes(a.attr)) attrM = p.disadvMult;
  dmg = Math.round(dmg * attrM);

  // 5. CE 배율 (CE0 보너스)
  const ceM = a.ce === 0 ? (1 + p.ce0Bonus) : (1 + a.ce * p.ceCoeff);
  dmg = Math.round(dmg * ceM);

  return Math.max(5, dmg);
}

// === 팀리그 시뮬 (CRT + TEC 적용) ===
function simTeam(a: C, b: C, p: Params): 'A' | 'B' | 'DRAW' {
  const dAB = calcDmg(a, b, p), dBA = calcDmg(b, a, p);
  let ah = a.hp, bh = b.hp;
  const aFirst = a.spd >= b.spd;

  // TEC → 스킬 발동률
  const aSkillRate = (p.tecSkillBase + a.tec * p.tecRate) / 100;
  const bSkillRate = (p.tecSkillBase + b.tec * p.tecRate) / 100;

  // CRT → 크리티컬 확률
  const aCrtRate = a.crt * p.crtRate;
  const bCrtRate = b.crt * p.crtRate;

  for (let t = 0; t < 100 && ah > 0 && bh > 0; t++) {
    // A 공격
    const doA = () => {
      let d = dAB;
      // TEC: 스킬 발동 시 배율 적용
      if (Math.random() < aSkillRate) d = Math.round(d * p.skillMult);
      // CRT: 크리티컬
      if (Math.random() < aCrtRate) d = Math.round(d * p.crtDmg);
      bh -= Math.max(5, d);
    };
    // B 공격
    const doB = () => {
      let d = dBA;
      if (Math.random() < bSkillRate) d = Math.round(d * p.skillMult);
      if (Math.random() < bCrtRate) d = Math.round(d * p.crtDmg);
      ah -= Math.max(5, d);
    };

    if (aFirst) { doA(); if (bh <= 0) break; doB(); }
    else { doB(); if (ah <= 0) break; doA(); }
  }
  return ah > bh ? 'A' : bh > ah ? 'B' : 'DRAW';
}

// === 개인리그 시뮬 (기존 + 8스탯) ===
function simIndiv(a: C, b: C, p: Params, trials: number): number {
  let aw = 0;
  for (let t = 0; t < trials; t++) {
    let ah = a.hp, bh = b.hp;
    let aF = a.spd > b.spd ? true : b.spd > a.spd ? false : Math.random() > 0.5;
    let aG = 0, bG = 0;

    const aSkillRate = (p.tecSkillBase + a.tec * p.tecRate) / 100;
    const bSkillRate = (p.tecSkillBase + b.tec * p.tecRate) / 100;

    for (let turn = 1; turn <= 30 && ah > 0 && bh > 0; turn++) {
      const isA = (turn % 2 === 1) ? aF : !aF;
      const atk = isA ? a : b, dfd = isA ? b : a;
      let dmg = calcDmg(atk, dfd, p);
      // 랜덤 ±10%
      dmg = Math.round(dmg * (0.9 + Math.random() * 0.2));

      const g = isA ? aG : bG;
      const skillRate = isA ? aSkillRate : bSkillRate;

      // 게이지 100% → 필살기 ×2.0
      if (g >= 100) {
        dmg = Math.round(dmg * 2.0);
        if (isA) aG = 0; else bG = 0;
      }
      // TEC 기반 스킬 발동
      else if (Math.random() < skillRate) {
        dmg = Math.round(dmg * p.skillMult);
      }

      // CRT 기반 크리티컬
      if (Math.random() < atk.crt * p.crtRate) {
        dmg = Math.round(dmg * p.crtDmg);
      }

      dmg = Math.max(5, dmg);
      if (isA) bh -= dmg; else ah -= dmg;
      aG = Math.min(100, aG + 25); bG = Math.min(100, bG + 25);
    }
    if (ah > bh) aw++;
  }
  return aw / trials;
}

// === 밸런스 점수 ===
function calcScore(p: Params, trials: number): { score: number; details: Record<string, any> } {
  const grades = ['특급', '준특급', '1급', '준1급'];
  let totalScore = 0;
  const details: Record<string, any> = {};

  for (const grade of grades) {
    const chars = CHARS.filter(c => c.grade === grade);
    const n = chars.length;

    // 팀리그 (10회 평균 - 랜덤 요소 있으므로)
    const tWinTotal = new Array(n).fill(0);
    const teamTrials = 10;
    for (let r = 0; r < teamTrials; r++) {
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
          if (i !== j && simTeam(chars[i], chars[j], p) === 'A') tWinTotal[i]++;
    }
    const tRates = tWinTotal.map(w => w / ((n - 1) * teamTrials) * 100);

    // 개인리그
    const iMat: number[][] = Array.from({length: n}, () => new Array(n).fill(50));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        iMat[i][j] = simIndiv(chars[i], chars[j], p, trials) * 100;
        iMat[j][i] = 100 - iMat[i][j];
      }
    const iRates = chars.map((_, i) => {
      const sum = iMat[i].reduce((s, v, j) => j === i ? s : s + v, 0);
      return sum / (n - 1);
    });

    const tAvg = tRates.reduce((s, v) => s + v, 0) / n;
    const iAvg = iRates.reduce((s, v) => s + v, 0) / n;
    const tStd = Math.sqrt(tRates.reduce((s, v) => s + (v - tAvg) ** 2, 0) / n);
    const iStd = Math.sqrt(iRates.reduce((s, v) => s + (v - iAvg) ** 2, 0) / n);
    const tMax = Math.max(...tRates), tMin = Math.min(...tRates);
    const iMax = Math.max(...iRates), iMin = Math.min(...iRates);
    const tiGap = chars.reduce((s, _, i) => s + Math.abs(tRates[i] - iRates[i]), 0) / n;

    const weight = grade === '1급' ? 3.0 : grade === '준1급' ? 2.0 : 1.0;
    const rangeP = ((tMax - tMin) + (iMax - iMin)) * 0.2;
    const extremeP = (Math.max(0, tMax - 70) + Math.max(0, iMax - 70) +
                      Math.max(0, 30 - tMin) + Math.max(0, 30 - iMin)) * 0.5;
    totalScore += (tStd + iStd + rangeP + extremeP + tiGap * 0.3) * weight;

    details[grade] = { tStd: +tStd.toFixed(1), iStd: +iStd.toFixed(1), tMax: +tMax.toFixed(1), tMin: +tMin.toFixed(1), iMax: +iMax.toFixed(1), iMin: +iMin.toFixed(1) };
  }
  return { score: +totalScore.toFixed(1), details };
}

// ===================================================
// 메인: 파라미터 탐색
// ===================================================
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  8스탯 통합 밸런스 파라미터 탐색                       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('8스탯 역할:');
console.log('  ATK → 기본 데미지       DEF → 피해 감소%');
console.log('  SPD → 선공 판정         CE  → 데미지 배율');
console.log('  HP  → 체력              CRT → 크리티컬 확률 (양 리그)');
console.log('  TEC → 스킬 발동률 증가   MNT → 추가 피해 감소%\n');
console.log('CE0 캐릭터: CRT↑ TEC↑ MNT로 CE 부재 보상');
console.log('일반 캐릭터: CRT=10, TEC=10, MNT=10\n');

// 기본 (v2 최적 기반)
const BASE: Params = {
  atkCoeff: 0.4, baseDmg: 5,
  defRate: 0.7, defCap: 22,
  ceCoeff: 0.006, ce0Bonus: 0.12,
  advMult: 1.15, disadvMult: 0.92,
  crtRate: 1/150, crtDmg: 1.5,
  tecSkillBase: 20, tecRate: 1.0, skillMult: 1.3,
  mntRate: 0.3,
};

const CANDIDATES: { name: string; params: Params }[] = [
  { name: "기본(8스탯)", params: BASE },

  // CRT 가중치 탐색
  { name: "CRT강화(1/100)", params: { ...BASE, crtRate: 1/100 } },
  { name: "CRT약화(1/200)", params: { ...BASE, crtRate: 1/200 } },
  { name: "CRT배율1.3", params: { ...BASE, crtDmg: 1.3 } },
  { name: "CRT배율1.8", params: { ...BASE, crtDmg: 1.8 } },

  // TEC 가중치 탐색
  { name: "TEC기본15+1.5", params: { ...BASE, tecSkillBase: 15, tecRate: 1.5 } },
  { name: "TEC기본10+2.0", params: { ...BASE, tecSkillBase: 10, tecRate: 2.0 } },
  { name: "TEC기본25+0.5", params: { ...BASE, tecSkillBase: 25, tecRate: 0.5 } },
  { name: "TEC스킬1.2", params: { ...BASE, skillMult: 1.2 } },
  { name: "TEC스킬1.4", params: { ...BASE, skillMult: 1.4 } },

  // MNT 가중치 탐색
  { name: "MNT0.2", params: { ...BASE, mntRate: 0.2 } },
  { name: "MNT0.5", params: { ...BASE, mntRate: 0.5 } },
  { name: "MNT0.8", params: { ...BASE, mntRate: 0.8 } },

  // 종합 후보 A: CRT 강화 + TEC 차별화 + MNT 중간
  { name: "종합A: CRT1/100+TEC15/1.5+MNT0.5", params: {
    ...BASE, crtRate: 1/100, tecSkillBase: 15, tecRate: 1.5, mntRate: 0.5
  }},
  // 종합 B: CE0 보상 극대화
  { name: "종합B: CRT1/80+TEC10/2+MNT0.3", params: {
    ...BASE, crtRate: 1/80, tecSkillBase: 10, tecRate: 2.0, mntRate: 0.3
  }},
  // 종합 C: 밸런스형
  { name: "종합C: CRT1/120+TEC20/1+MNT0.4", params: {
    ...BASE, crtRate: 1/120, tecSkillBase: 20, tecRate: 1.0, mntRate: 0.4
  }},
  // 종합 D: 스킬 중시
  { name: "종합D: TEC10/2+스킬1.4+MNT0.5", params: {
    ...BASE, tecSkillBase: 10, tecRate: 2.0, skillMult: 1.4, mntRate: 0.5
  }},
  // 종합 E: CE/DEF 재조정 포함
  { name: "종합E: CE7+DEF0.6+CRT1/100+TEC15/1.5", params: {
    ...BASE, ceCoeff: 0.007, defRate: 0.6, defCap: 25, crtRate: 1/100, tecSkillBase: 15, tecRate: 1.5, mntRate: 0.4
  }},
  // 종합 F: 속성 약화 + 스탯 강화
  { name: "종합F: 속성1.1+CRT1/80+TEC10/2+MNT0.6", params: {
    ...BASE, advMult: 1.1, disadvMult: 0.95, crtRate: 1/80, tecSkillBase: 10, tecRate: 2.0, mntRate: 0.6
  }},
];

const SEARCH_TRIALS = 100;
console.log(`${CANDIDATES.length}개 후보 탐색 (팀 10회, 개인 ${SEARCH_TRIALS}회)\n`);

let results: { name: string; score: number; details: any; params: Params }[] = [];

for (let i = 0; i < CANDIDATES.length; i++) {
  const c = CANDIDATES[i];
  const r = calcScore(c.params, SEARCH_TRIALS);
  results.push({ name: c.name, score: r.score, details: r.details, params: c.params });
  process.stdout.write(`  ${i+1}/${CANDIDATES.length}\r`);
}

results.sort((a, b) => a.score - b.score);

console.log('\n═══ TOP 10 ═══\n');
console.log(`${'#'.padStart(3)} ${'이름'.padEnd(36)} ${'점수'.padStart(7)} | ${'1급tσ'.padStart(5)} ${'1급iσ'.padStart(5)} ${'1급범위t'.padStart(7)} ${'1급범위i'.padStart(7)} | ${'준1tσ'.padStart(5)} ${'준1iσ'.padStart(5)}`);
console.log('─'.repeat(105));

for (let i = 0; i < Math.min(10, results.length); i++) {
  const r = results[i];
  const d1 = r.details['1급'];
  const dj = r.details['준1급'];
  console.log(
    `${(i+1).toString().padStart(3)} ${r.name.padEnd(36)} ${r.score.toFixed(1).padStart(7)} | ` +
    `${d1.tStd.toFixed(1).padStart(5)} ${d1.iStd.toFixed(1).padStart(5)} ${(d1.tMax-d1.tMin).toFixed(0).padStart(5)}%p ${(d1.iMax-d1.iMin).toFixed(0).padStart(5)}%p | ` +
    `${dj.tStd.toFixed(1).padStart(5)} ${dj.iStd.toFixed(1).padStart(5)}`
  );
}

// === 최적 파라미터 상세 ===
const best = results[0];
console.log('\n' + '═'.repeat(80));
console.log(`🏆 최적: ${best.name} (점수: ${best.score})`);
console.log('═'.repeat(80));
console.log(`  ATK:${best.params.atkCoeff}×+${best.params.baseDmg} | DEF:${best.params.defRate}/${best.params.defCap}% | CE:${best.params.ceCoeff}/CE0:${(best.params.ce0Bonus*100).toFixed(0)}%`);
console.log(`  속성:${best.params.advMult}/${best.params.disadvMult}`);
console.log(`  CRT: 확률=${(best.params.crtRate*100).toFixed(1)}%(@10) 배율=×${best.params.crtDmg}`);
console.log(`  TEC: 스킬기본=${best.params.tecSkillBase}%+TEC×${best.params.tecRate}% 배율=×${best.params.skillMult}`);
console.log(`  MNT: 피해감소=MNT×${best.params.mntRate}%`);

// === 최적으로 상세 전투 ===
console.log('\n' + '═'.repeat(80));
console.log('상세 전투 결과 (팀 20회, 개인 300회)');
console.log('═'.repeat(80));

const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

for (const grade of ['특급', '준특급', '1급', '준1급']) {
  const chars = CHARS.filter(c => c.grade === grade);
  const n = chars.length;

  // 팀 (20회 평균)
  const tWins = new Array(n).fill(0);
  const tTrials = 20;
  for (let r = 0; r < tTrials; r++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (i !== j && simTeam(chars[i], chars[j], best.params) === 'A') tWins[i]++;

  // 개인
  const iMat: number[][] = Array.from({length: n}, () => new Array(n).fill(50));
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      iMat[i][j] = simIndiv(chars[i], chars[j], best.params, 300) * 100;
      iMat[j][i] = 100 - iMat[i][j];
    }

  console.log(`\n【${grade}】 ${n}명`);
  console.log(`${'#'.padStart(2)}  ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)} CE CRT TEC MNT  ${'팀WR'.padStart(6)} ${'개인WR'.padStart(7)}  ${'평균'.padStart(5)}  상태`);
  console.log('─'.repeat(85));

  const charResults = chars.map((c, i) => {
    const tWR = +(tWins[i] / ((n - 1) * tTrials) * 100).toFixed(1);
    const iWR = +(iMat[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1)).toFixed(1);
    return { ...c, tWR, iWR, avg: +((tWR + iWR) / 2).toFixed(1), diff: Math.abs(tWR - iWR) };
  }).sort((a, b) => b.avg - a.avg);

  let ok = 0, op = 0, weak = 0;
  charResults.forEach((r, i) => {
    let flag = '';
    if (r.avg >= 65) { flag = '⚠OP'; op++; }
    else if (r.avg <= 35) { flag = '⚠WK'; weak++; }
    else if (r.diff >= 20) { flag = '⚠격차'; }
    else { flag = '✅'; ok++; }
    console.log(
      `${(i+1).toString().padStart(2)}  ${r.name.padEnd(14)} ${(ATTR_KO[r.attr]).padEnd(4)} ${r.ce.toString().padStart(2)} ${r.crt.toString().padStart(3)} ${r.tec.toString().padStart(3)} ${r.mnt.toString().padStart(3)}  ` +
      `${r.tWR.toFixed(1).padStart(5)}% ${r.iWR.toFixed(1).padStart(6)}%  ${r.avg.toFixed(1).padStart(5)}%  ${flag}`
    );
  });
  console.log(`  ✅${ok}  ⚠OP:${op}  ⚠WK:${weak}`);
}

// === CE0 캐릭터 분석 ===
console.log('\n' + '═'.repeat(80));
console.log('CE0 캐릭터 보상 분석');
console.log('═'.repeat(80));
const ce0Chars = CHARS.filter(c => c.ce === 0);
console.log(`\nCE0 캐릭터 (${ce0Chars.length}명): CE 없는 대신 CRT↑ TEC↑로 보상`);
for (const c of ce0Chars) {
  const skillRate = best.params.tecSkillBase + c.tec * best.params.tecRate;
  const crtChance = (c.crt * best.params.crtRate * 100).toFixed(1);
  const mntRed = (c.mnt * best.params.mntRate).toFixed(1);
  console.log(`  ${c.name} (${c.grade}): CRT ${c.crt}→크리${crtChance}%, TEC ${c.tec}→스킬${skillRate.toFixed(0)}%, MNT ${c.mnt}→감소${mntRed}%, CE보너스 ${(best.params.ce0Bonus*100).toFixed(0)}%`);
}
console.log(`\n일반 캐릭터(CRT=10): 크리${(10*best.params.crtRate*100).toFixed(1)}%, 스킬${(best.params.tecSkillBase+10*best.params.tecRate).toFixed(0)}%, MNT감소${(10*best.params.mntRate).toFixed(1)}%`);

console.log('\n' + '═'.repeat(80));
console.log('시뮬레이션 완료');
console.log('═'.repeat(80));

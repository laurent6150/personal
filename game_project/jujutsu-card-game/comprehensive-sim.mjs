// ═══════════════════════════════════════════════════════════
// 종합 시뮬레이션: 등급별/카드별 팀리그+개인리그 + 레벨/아이템 변수 분석
// ═══════════════════════════════════════════════════════════

// ========== 속성 상성 시스템 ==========
const ATTRIBUTE_ADVANTAGE = {
  BARRIER: ['CURSE', 'CONVERT'],
  BODY:    ['BARRIER', 'CONVERT'],
  CURSE:   ['BODY', 'RANGE'],
  SOUL:    ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'],
  RANGE:   ['BODY', 'SOUL']
};

// ========== 전체 71 캐릭터 데이터 ==========
const ALL_CHARACTERS = [
  // === 특급 (6명) ===
  { id: "gojo_satoru", name: "고죠 사토루", grade: "특급", attribute: "BARRIER", stats: { atk: 22, def: 20, spd: 22, ce: 25, hp: 100, crt: 15, tec: 15, mnt: 15 } },
  { id: "ryomen_sukuna", name: "료멘 스쿠나", grade: "특급", attribute: "CURSE", stats: { atk: 25, def: 18, spd: 22, ce: 24, hp: 100, crt: 15, tec: 15, mnt: 15 } },
  { id: "yuta_okkotsu", name: "옷코츠 유타", grade: "특급", attribute: "CURSE", stats: { atk: 21, def: 18, spd: 20, ce: 26, hp: 100, crt: 15, tec: 15, mnt: 15 } },
  { id: "kenjaku", name: "켄자쿠", grade: "특급", attribute: "SOUL", stats: { atk: 18, def: 17, spd: 18, ce: 25, hp: 100, crt: 15, tec: 15, mnt: 15 } },
  { id: "yuki_tsukumo", name: "츠쿠모 유키", grade: "특급", attribute: "BODY", stats: { atk: 23, def: 16, spd: 19, ce: 24, hp: 95, crt: 15, tec: 15, mnt: 15 } },
  { id: "itadori_yuji_final", name: "이타도리 유지 (최종전)", grade: "특급", attribute: "SOUL", stats: { atk: 23, def: 18, spd: 23, ce: 22, hp: 95, crt: 15, tec: 15, mnt: 15 } },

  // === 준특급 (7명) ===
  { id: "geto_suguru", name: "게토 스구루", grade: "준특급", attribute: "CURSE", stats: { atk: 19, def: 18, spd: 18, ce: 22, hp: 93, crt: 14, tec: 14, mnt: 14 } },
  { id: "tengen", name: "텐겐", grade: "준특급", attribute: "BARRIER", stats: { atk: 18, def: 20, spd: 16, ce: 25, hp: 100, crt: 14, tec: 14, mnt: 14 } },
  { id: "fushiguro_toji", name: "후시구로 토우지", grade: "준특급", attribute: "BODY", stats: { atk: 22, def: 16, spd: 22, ce: 0, hp: 92, crt: 18, tec: 20, mnt: 10 } },
  { id: "mahoraga", name: "마허라", grade: "준특급", attribute: "BODY", stats: { atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: 14, tec: 14, mnt: 14 } },
  { id: "rika_full", name: "완전체 리카", grade: "준특급", attribute: "SOUL", stats: { atk: 22, def: 17, spd: 19, ce: 24, hp: 95, crt: 14, tec: 14, mnt: 14 } },
  { id: "tamamo_no_mae", name: "타마모노마에", grade: "준특급", attribute: "CURSE", stats: { atk: 21, def: 19, spd: 20, ce: 22, hp: 95, crt: 14, tec: 14, mnt: 14 } },
  { id: "dabura", name: "다부라", grade: "준특급", attribute: "BODY", stats: { atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: 14, tec: 14, mnt: 14 } },

  // === 1급 (25명) ===
  { id: "itadori_yuji", name: "이타도리 유지", grade: "1급", attribute: "BODY", stats: { atk: 19, def: 16, spd: 20, ce: 18, hp: 90, crt: 12, tec: 12, mnt: 12 } },
  { id: "maki_zenin_awakened", name: "젠인 마키 (각성)", grade: "1급", attribute: "BODY", stats: { atk: 20, def: 15, spd: 21, ce: 0, hp: 88, crt: 15, tec: 19, mnt: 8 } },
  { id: "nanami_kento", name: "나나미 켄토", grade: "1급", attribute: "BODY", stats: { atk: 18, def: 17, spd: 16, ce: 18, hp: 88, crt: 12, tec: 12, mnt: 12 } },
  { id: "jogo", name: "죠고", grade: "1급", attribute: "CONVERT", stats: { atk: 22, def: 13, spd: 17, ce: 23, hp: 88, crt: 12, tec: 12, mnt: 12 } },
  { id: "hanami", name: "하나미", grade: "1급", attribute: "CONVERT", stats: { atk: 16, def: 19, spd: 14, ce: 20, hp: 92, crt: 12, tec: 12, mnt: 12 } },
  { id: "naobito_zenin", name: "젠인 나오비토", grade: "1급", attribute: "BODY", stats: { atk: 17, def: 14, spd: 24, ce: 19, hp: 80, crt: 12, tec: 12, mnt: 12 } },
  { id: "naoya_zenin", name: "젠인 나오야", grade: "1급", attribute: "BODY", stats: { atk: 18, def: 13, spd: 23, ce: 18, hp: 78, crt: 12, tec: 12, mnt: 12 } },
  { id: "hiromi_higuruma", name: "히구루마 히로미", grade: "1급", attribute: "BARRIER", stats: { atk: 17, def: 18, spd: 16, ce: 23, hp: 86, crt: 12, tec: 12, mnt: 12 } },
  { id: "hajime_kashimo", name: "카시모 하지메", grade: "1급", attribute: "CONVERT", stats: { atk: 22, def: 15, spd: 22, ce: 21, hp: 86, crt: 12, tec: 12, mnt: 12 } },
  { id: "ryu_ishigori", name: "이시고리 류", grade: "1급", attribute: "RANGE", stats: { atk: 23, def: 15, spd: 14, ce: 20, hp: 88, crt: 12, tec: 12, mnt: 12 } },
  { id: "takako_uro", name: "우로 타카코", grade: "1급", attribute: "BARRIER", stats: { atk: 18, def: 16, spd: 20, ce: 19, hp: 82, crt: 12, tec: 12, mnt: 12 } },
  { id: "kinji_hakari", name: "하카리 킨지", grade: "1급", attribute: "BARRIER", stats: { atk: 21, def: 16, spd: 20, ce: 22, hp: 87, crt: 12, tec: 12, mnt: 12 } },
  { id: "choso", name: "쵸소", grade: "1급", attribute: "CURSE", stats: { atk: 18, def: 16, spd: 17, ce: 19, hp: 88, crt: 12, tec: 12, mnt: 12 } },
  { id: "todo_aoi", name: "토도 아오이", grade: "1급", attribute: "BODY", stats: { atk: 20, def: 16, spd: 17, ce: 17, hp: 90, crt: 12, tec: 12, mnt: 12 } },
  { id: "uraume", name: "우라우메", grade: "1급", attribute: "CONVERT", stats: { atk: 17, def: 17, spd: 18, ce: 20, hp: 85, crt: 12, tec: 12, mnt: 12 } },
  { id: "yorozu", name: "요로즈", grade: "1급", attribute: "CONVERT", stats: { atk: 19, def: 15, spd: 17, ce: 21, hp: 83, crt: 12, tec: 12, mnt: 12 } },
  { id: "mahito", name: "마히토", grade: "1급", attribute: "SOUL", stats: { atk: 19, def: 15, spd: 19, ce: 22, hp: 83, crt: 12, tec: 12, mnt: 12 } },
  { id: "mei_mei", name: "메이메이", grade: "1급", attribute: "RANGE", stats: { atk: 16, def: 15, spd: 16, ce: 18, hp: 80, crt: 12, tec: 12, mnt: 12 } },
  { id: "dagon", name: "다곤", grade: "1급", attribute: "CONVERT", stats: { atk: 17, def: 17, spd: 14, ce: 21, hp: 90, crt: 12, tec: 12, mnt: 12 } },
  { id: "mechamaru", name: "메카마루", grade: "1급", attribute: "RANGE", stats: { atk: 19, def: 17, spd: 14, ce: 21, hp: 85, crt: 12, tec: 12, mnt: 12 } },
  { id: "miguel", name: "미겔", grade: "1급", attribute: "BODY", stats: { atk: 20, def: 16, spd: 19, ce: 18, hp: 88, crt: 12, tec: 12, mnt: 12 } },
  { id: "smallpox_deity", name: "포창신", grade: "1급", attribute: "CURSE", stats: { atk: 16, def: 18, spd: 12, ce: 22, hp: 90, crt: 12, tec: 12, mnt: 12 } },
  { id: "kurourushi", name: "쿠로우루시", grade: "1급", attribute: "CURSE", stats: { atk: 18, def: 14, spd: 18, ce: 20, hp: 82, crt: 12, tec: 12, mnt: 12 } },
  { id: "bansho", name: "만상", grade: "1급", attribute: "CONVERT", stats: { atk: 17, def: 16, spd: 15, ce: 20, hp: 85, crt: 12, tec: 12, mnt: 12 } },
  { id: "tsurugi_okkotsu", name: "옷코츠 츠루기", grade: "1급", attribute: "BODY", stats: { atk: 20, def: 15, spd: 21, ce: 0, hp: 87, crt: 15, tec: 19, mnt: 8 } },

  // === 준1급 (17명) ===
  { id: "fushiguro_megumi", name: "후시구로 메구미", grade: "준1급", attribute: "SOUL", stats: { atk: 16, def: 15, spd: 17, ce: 19, hp: 82, crt: 10, tec: 10, mnt: 10 } },
  { id: "inumaki_toge", name: "이누마키 토게", grade: "준1급", attribute: "CURSE", stats: { atk: 14, def: 13, spd: 16, ce: 21, hp: 75, crt: 10, tec: 10, mnt: 10 } },
  { id: "maki_zenin", name: "젠인 마키", grade: "준1급", attribute: "BODY", stats: { atk: 17, def: 15, spd: 18, ce: 5, hp: 82, crt: 10, tec: 10, mnt: 10 } },
  { id: "angel_hana", name: "천사/쿠루스 하나", grade: "준1급", attribute: "BARRIER", stats: { atk: 15, def: 17, spd: 16, ce: 22, hp: 78, crt: 10, tec: 10, mnt: 10 } },
  { id: "reggie_star", name: "레지 스타", grade: "준1급", attribute: "RANGE", stats: { atk: 16, def: 14, spd: 17, ce: 19, hp: 78, crt: 10, tec: 10, mnt: 10 } },
  { id: "fumihiko_takaba", name: "타카바 후미히코", grade: "준1급", attribute: "SOUL", stats: { atk: 14, def: 18, spd: 15, ce: 20, hp: 82, crt: 10, tec: 10, mnt: 10 } },
  { id: "jinichi_zenin", name: "젠인 진이치", grade: "준1급", attribute: "BODY", stats: { atk: 17, def: 16, spd: 15, ce: 16, hp: 85, crt: 10, tec: 10, mnt: 10 } },
  { id: "ogi_zenin", name: "젠인 오기", grade: "준1급", attribute: "CONVERT", stats: { atk: 18, def: 14, spd: 16, ce: 17, hp: 82, crt: 10, tec: 10, mnt: 10 } },
  { id: "noritoshi_kamo", name: "카모 노리토시", grade: "준1급", attribute: "CONVERT", stats: { atk: 15, def: 14, spd: 17, ce: 18, hp: 78, crt: 10, tec: 10, mnt: 10 } },
  { id: "iori_hazenoki", name: "하제노키 이오리", grade: "준1급", attribute: "RANGE", stats: { atk: 16, def: 12, spd: 17, ce: 17, hp: 75, crt: 10, tec: 10, mnt: 10 } },
  { id: "kusakabe_atsuya", name: "쿠사카베 아츠야", grade: "준1급", attribute: "BODY", stats: { atk: 16, def: 16, spd: 15, ce: 14, hp: 85, crt: 10, tec: 10, mnt: 10 } },
  { id: "ui_ui", name: "우이우이", grade: "준1급", attribute: "BARRIER", stats: { atk: 10, def: 14, spd: 20, ce: 21, hp: 72, crt: 10, tec: 10, mnt: 10 } },
  { id: "yuka_okkotsu", name: "옷코츠 유카", grade: "준1급", attribute: "BODY", stats: { atk: 16, def: 13, spd: 18, ce: 17, hp: 76, crt: 10, tec: 10, mnt: 10 } },
  { id: "cross", name: "크로스", grade: "준1급", attribute: "CONVERT", stats: { atk: 18, def: 15, spd: 17, ce: 19, hp: 80, crt: 10, tec: 10, mnt: 10 } },
  { id: "marulu", name: "마루", grade: "준1급", attribute: "BARRIER", stats: { atk: 15, def: 16, spd: 16, ce: 23, hp: 78, crt: 10, tec: 10, mnt: 10 } },
  { id: "usami", name: "우사미", grade: "준1급", attribute: "CURSE", stats: { atk: 13, def: 14, spd: 16, ce: 22, hp: 75, crt: 10, tec: 10, mnt: 10 } },
  { id: "masamichi_yaga", name: "야가 마사미치", grade: "준1급", attribute: "SOUL", stats: { atk: 14, def: 15, spd: 11, ce: 18, hp: 82, crt: 10, tec: 10, mnt: 10 } },

  // === 2급 (12명) ===
  { id: "kugisaki_nobara", name: "쿠기사키 노바라", grade: "2급", attribute: "RANGE", stats: { atk: 15, def: 13, spd: 15, ce: 17, hp: 75, crt: 8, tec: 8, mnt: 8 } },
  { id: "panda", name: "판다", grade: "2급", attribute: "BODY", stats: { atk: 16, def: 15, spd: 14, ce: 15, hp: 82, crt: 8, tec: 8, mnt: 8 } },
  { id: "ino_takuma", name: "이노 타쿠마", grade: "2급", attribute: "CURSE", stats: { atk: 14, def: 14, spd: 15, ce: 17, hp: 78, crt: 8, tec: 8, mnt: 8 } },
  { id: "nishimiya_momo", name: "니시미야 모모", grade: "2급", attribute: "RANGE", stats: { atk: 12, def: 12, spd: 18, ce: 16, hp: 70, crt: 8, tec: 8, mnt: 8 } },
  { id: "kasumi_miwa", name: "미와 카스미", grade: "2급", attribute: "BODY", stats: { atk: 13, def: 14, spd: 16, ce: 14, hp: 75, crt: 8, tec: 8, mnt: 8 } },
  { id: "mai_zenin", name: "젠인 마이", grade: "2급", attribute: "RANGE", stats: { atk: 14, def: 12, spd: 15, ce: 16, hp: 72, crt: 8, tec: 8, mnt: 8 } },
  { id: "eso", name: "에소", grade: "2급", attribute: "CURSE", stats: { atk: 15, def: 13, spd: 14, ce: 17, hp: 78, crt: 8, tec: 8, mnt: 8 } },
  { id: "kechizu", name: "케치즈", grade: "2급", attribute: "CURSE", stats: { atk: 14, def: 14, spd: 13, ce: 16, hp: 80, crt: 8, tec: 8, mnt: 8 } },
  { id: "utahime_iori", name: "이오리 우타히메", grade: "2급", attribute: "BARRIER", stats: { atk: 12, def: 15, spd: 13, ce: 19, hp: 75, crt: 8, tec: 8, mnt: 8 } },
  { id: "shoko_ieiri", name: "이에이리 쇼코", grade: "2급", attribute: "SOUL", stats: { atk: 10, def: 14, spd: 12, ce: 20, hp: 80, crt: 8, tec: 8, mnt: 8 } },
  { id: "granny_ogami", name: "오가미 할멈", grade: "2급", attribute: "SOUL", stats: { atk: 10, def: 13, spd: 11, ce: 19, hp: 75, crt: 8, tec: 8, mnt: 8 } },
  { id: "charles_bernard", name: "찰스 버나드", grade: "2급", attribute: "SOUL", stats: { atk: 14, def: 12, spd: 16, ce: 17, hp: 75, crt: 8, tec: 8, mnt: 8 } },

  // === 3급 (4명) ===
  { id: "yu_haibara", name: "하이바라 유", grade: "3급", attribute: "BODY", stats: { atk: 13, def: 13, spd: 14, ce: 14, hp: 75, crt: 5, tec: 5, mnt: 5 } },
  { id: "kiyotaka_ijichi", name: "이지치 키요타카", grade: "3급", attribute: "BARRIER", stats: { atk: 8, def: 16, spd: 10, ce: 18, hp: 70, crt: 5, tec: 5, mnt: 5 } },
  { id: "akari_nitta", name: "닛타 아카리", grade: "3급", attribute: "SOUL", stats: { atk: 8, def: 13, spd: 12, ce: 17, hp: 72, crt: 5, tec: 5, mnt: 5 } },
  { id: "misato_kuroi", name: "쿠로이 미사토", grade: "3급", attribute: "BODY", stats: { atk: 10, def: 14, spd: 13, ce: 12, hp: 75, crt: 5, tec: 5, mnt: 5 } },
];

// ========== 유틸리티 ==========
function totalStats5(s) { return s.atk + s.def + s.spd + s.ce + s.hp; }
function totalStats8(s) { return s.atk + s.def + s.spd + s.ce + s.hp + s.crt + s.tec + s.mnt; }

function getAttrMultiplier(attrA, attrB) {
  if (ATTRIBUTE_ADVANTAGE[attrA]?.includes(attrB)) return 1.5;
  if (ATTRIBUTE_ADVANTAGE[attrB]?.includes(attrA)) return 0.7;
  return 1.0;
}

// ========== 개인리그 전투 시뮬레이션 ==========
function simulateIndividual(charA, charB, trials = 100) {
  let winsA = 0, winsB = 0, totalTurns = 0;
  let totalDmgA = 0, totalDmgB = 0;

  for (let t = 0; t < trials; t++) {
    let hpA = 100, hpB = 100;
    let gaugeA = 0, gaugeB = 0;
    let turn = 0;
    let dmgDealtA = 0, dmgDealtB = 0;

    // 선공 결정
    let aFirst = charA.stats.spd >= charB.stats.spd;

    while (hpA > 0 && hpB > 0 && turn < 30) {
      const attacker = aFirst ? charA : charB;
      const defender = aFirst ? charB : charA;
      const atkGauge = aFirst ? gaugeA : gaugeB;

      // 데미지 계산 (개인리그 공식)
      let baseDmg = Math.round(attacker.stats.atk * 0.4 + 5);
      const defRed = Math.min(defender.stats.def * 0.3, 30);
      baseDmg = Math.round(baseDmg * (1 - defRed / 100));

      // 속성 상성 (개인리그: 스케일 0.5)
      const rawMult = getAttrMultiplier(attacker.attribute, defender.attribute);
      const scaledMult = 1.0 + (rawMult - 1.0) * 0.5;
      baseDmg = Math.round(baseDmg * scaledMult);

      // CE 배율
      const ceMult = 1 + (attacker.stats.ce * 0.006);
      baseDmg = Math.round(baseDmg * ceMult);

      // 총합 보정
      const statDiff = totalStats5(attacker.stats) - totalStats5(defender.stats);
      const statBonus = Math.max(0.8, Math.min(1.2, 1 + statDiff / 1000));
      baseDmg = Math.round(baseDmg * statBonus);

      // 랜덤 변동 ±10%
      baseDmg = Math.round(baseDmg * (0.9 + Math.random() * 0.2));
      baseDmg = Math.max(5, baseDmg);

      // 액션 타입
      const forceUlt = atkGauge >= 100;
      let multiplier = 1.0;
      if (forceUlt) { multiplier = 2.0; }
      else if (Math.random() < 0.3) { multiplier = 1.3; }

      // 크리티컬
      const critChance = attacker.stats.crt / 150;
      const isCrit = Math.random() < critChance;

      let finalDmg = Math.round(baseDmg * multiplier);
      if (isCrit) finalDmg = Math.round(finalDmg * 1.5);
      finalDmg = Math.max(5, finalDmg);

      // 적용
      if (aFirst) {
        hpB -= finalDmg;
        dmgDealtA += finalDmg;
        if (forceUlt) gaugeA = 0; else { gaugeA = Math.min(100, gaugeA + 25); gaugeB = Math.min(100, gaugeB + 25); }
      } else {
        hpA -= finalDmg;
        dmgDealtB += finalDmg;
        if (forceUlt) gaugeB = 0; else { gaugeA = Math.min(100, gaugeA + 25); gaugeB = Math.min(100, gaugeB + 25); }
      }

      aFirst = !aFirst;
      turn++;
    }

    if (hpA > hpB) winsA++; else winsB++;
    totalTurns += turn;
    totalDmgA += dmgDealtA;
    totalDmgB += dmgDealtB;
  }

  return {
    winRateA: (winsA / trials * 100).toFixed(1),
    winRateB: (winsB / trials * 100).toFixed(1),
    avgTurns: (totalTurns / trials).toFixed(1),
    avgDmgA: (totalDmgA / trials).toFixed(1),
    avgDmgB: (totalDmgB / trials).toFixed(1),
  };
}

// ========== 팀리그 전투 시뮬레이션 ==========
function simulateTeam(charA, charB, trials = 100) {
  let winsA = 0, winsB = 0, totalTurns = 0;

  for (let t = 0; t < trials; t++) {
    let hpA = 100, hpB = 100;
    let turn = 0;
    let aFirst = charA.stats.spd >= charB.stats.spd;

    while (hpA > 0 && hpB > 0 && turn < 30) {
      const attacker = aFirst ? charA : charB;
      const defender = aFirst ? charB : charA;

      // 팀리그 데미지 = (ATK × attrMult × ceMult) - effective DEF
      const attrMult = getAttrMultiplier(attacker.attribute, defender.attribute);
      const ceMult = 1 + (attacker.stats.ce / 100);
      let dmg = Math.round(attacker.stats.atk * attrMult * ceMult) - Math.max(0, defender.stats.def);
      dmg = Math.max(3, dmg);

      // 스킬/크리티컬 변동
      if (Math.random() < 0.3) dmg = Math.round(dmg * 1.3);
      if (Math.random() < attacker.stats.crt / 150) dmg = Math.round(dmg * 1.5);

      // 랜덤 변동 ±15%
      dmg = Math.round(dmg * (0.85 + Math.random() * 0.3));
      dmg = Math.max(3, dmg);

      if (aFirst) hpB -= dmg; else hpA -= dmg;
      aFirst = !aFirst;
      turn++;
    }

    if (hpA > hpB) winsA++; else winsB++;
    totalTurns += turn;
  }

  return {
    winRateA: (winsA / trials * 100).toFixed(1),
    avgTurns: (totalTurns / trials).toFixed(1),
  };
}

// ========== 레벨 영향 시뮬레이션 ==========
function simulateWithLevel(charA, charB, levelA, levelB, trials = 200) {
  // 레벨당 primary/secondary 스탯 +2
  const modA = { ...charA, stats: { ...charA.stats } };
  const modB = { ...charB, stats: { ...charB.stats } };

  // 레벨업 보너스: (level-1) * 2를 primary/secondary에
  // 간소화: 레벨당 ATK+1, SPD+1 (대부분 캐릭터의 성장 방향)
  modA.stats.atk += (levelA - 1) * 2;
  modA.stats.spd += (levelA - 1) * 2;
  modB.stats.atk += (levelB - 1) * 2;
  modB.stats.spd += (levelB - 1) * 2;

  return simulateIndividual(modA, modB, trials);
}

// ========== 아이템 영향 시뮬레이션 ==========
const SAMPLE_ITEMS = {
  LEGENDARY: { atk: 5, def: 3, spd: 3, ce: 5, hp: 0, crt: 0, tec: 0, mnt: 0 },  // 평균 레전더리
  EPIC: { atk: 3, def: 2, spd: 2, ce: 3, hp: 0, crt: 2, tec: 0, mnt: 0 },
  RARE: { atk: 2, def: 2, spd: 2, ce: 0, hp: 0, crt: 2, tec: 0, mnt: 0 },
  COMMON: { atk: 3, def: 0, spd: 0, ce: 0, hp: 0, crt: 0, tec: 0, mnt: 0 },
};

function simulateWithItems(charA, charB, itemA, itemB, trials = 200) {
  const modA = { ...charA, stats: { ...charA.stats } };
  const modB = { ...charB, stats: { ...charB.stats } };

  if (itemA) {
    for (const [k, v] of Object.entries(itemA)) {
      modA.stats[k] = (modA.stats[k] || 0) + v;
    }
  }
  if (itemB) {
    for (const [k, v] of Object.entries(itemB)) {
      modB.stats[k] = (modB.stats[k] || 0) + v;
    }
  }

  return simulateIndividual(modA, modB, trials);
}

// ========== 실행 ==========
const grades = ["특급", "준특급", "1급", "준1급", "2급", "3급"];
const gradeMap = {};
for (const g of grades) gradeMap[g] = ALL_CHARACTERS.filter(c => c.grade === g);

console.log("═══════════════════════════════════════════════════════════");
console.log("  주술회전 카드게임 종합 시뮬레이션 리포트");
console.log("  시뮬레이션 횟수: 각 매치업 200회");
console.log("═══════════════════════════════════════════════════════════\n");

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 1: 등급별 개인리그 시뮬레이션
// ━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PART 1: 등급별 개인리그 1v1 시뮬레이션");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const individualResults = {};

for (const grade of grades) {
  const chars = gradeMap[grade];
  if (chars.length < 2) continue;

  console.log(`\n▸ ${grade} (${chars.length}명) - 개인리그`);
  console.log("─".repeat(80));

  const charStats = {};
  for (const c of chars) {
    charStats[c.id] = { wins: 0, losses: 0, totalDmg: 0, matches: 0, totalTurns: 0 };
  }

  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      const result = simulateIndividual(chars[i], chars[j], 200);
      const wA = parseFloat(result.winRateA);
      const wB = parseFloat(result.winRateB);

      charStats[chars[i].id].wins += wA * 2;
      charStats[chars[i].id].losses += wB * 2;
      charStats[chars[i].id].matches += 200;
      charStats[chars[i].id].totalDmg += parseFloat(result.avgDmgA) * 200;
      charStats[chars[i].id].totalTurns += parseFloat(result.avgTurns) * 200;

      charStats[chars[j].id].wins += wB * 2;
      charStats[chars[j].id].losses += wA * 2;
      charStats[chars[j].id].matches += 200;
      charStats[chars[j].id].totalDmg += parseFloat(result.avgDmgB) * 200;
      charStats[chars[j].id].totalTurns += parseFloat(result.avgTurns) * 200;
    }
  }

  // 승률 기준 정렬
  const ranked = chars.map(c => {
    const s = charStats[c.id];
    const wr = s.wins / (s.wins + s.losses) * 100;
    const avgDmg = s.totalDmg / s.matches;
    const avgTurns = s.totalTurns / s.matches;
    return { ...c, winRate: wr, avgDmg, avgTurns };
  }).sort((a, b) => b.winRate - a.winRate);

  individualResults[grade] = ranked;

  console.log(`${"순위".padEnd(4)} ${"캐릭터".padEnd(22)} ${"속성".padEnd(8)} ${"승률".padEnd(8)} ${"평균DMG".padEnd(10)} ${"평균턴".padEnd(8)} ATK DEF SPD  CE`);
  console.log("─".repeat(80));
  ranked.forEach((r, idx) => {
    console.log(
      `${String(idx + 1).padEnd(4)} ${r.name.padEnd(20)} ${r.attribute.padEnd(8)} ${r.winRate.toFixed(1).padStart(5)}% ${r.avgDmg.toFixed(1).padStart(8)} ${r.avgTurns.toFixed(1).padStart(6)}   ${String(r.stats.atk).padStart(3)} ${String(r.stats.def).padStart(3)} ${String(r.stats.spd).padStart(3)} ${String(r.stats.ce).padStart(3)}`
    );
  });

  // 밸런스 지표
  const wrs = ranked.map(r => r.winRate);
  const maxWr = Math.max(...wrs);
  const minWr = Math.min(...wrs);
  const avgWr = wrs.reduce((a, b) => a + b, 0) / wrs.length;
  const stdWr = Math.sqrt(wrs.reduce((a, b) => a + (b - avgWr) ** 2, 0) / wrs.length);
  console.log(`\n  [밸런스 지표] 최고승률: ${maxWr.toFixed(1)}% | 최저승률: ${minWr.toFixed(1)}% | 편차: ${stdWr.toFixed(1)}% | 범위: ${(maxWr - minWr).toFixed(1)}%`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 2: 등급별 팀리그 시뮬레이션
// ━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PART 2: 등급별 팀리그 1v1 시뮬레이션");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const teamResults = {};

for (const grade of grades) {
  const chars = gradeMap[grade];
  if (chars.length < 2) continue;

  console.log(`\n▸ ${grade} (${chars.length}명) - 팀리그`);
  console.log("─".repeat(70));

  const charStats = {};
  for (const c of chars) {
    charStats[c.id] = { wins: 0, losses: 0, matches: 0 };
  }

  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      const result = simulateTeam(chars[i], chars[j], 200);
      const wA = parseFloat(result.winRateA);

      charStats[chars[i].id].wins += wA * 2;
      charStats[chars[i].id].losses += (100 - wA) * 2;
      charStats[chars[i].id].matches += 200;

      charStats[chars[j].id].wins += (100 - wA) * 2;
      charStats[chars[j].id].losses += wA * 2;
      charStats[chars[j].id].matches += 200;
    }
  }

  const ranked = chars.map(c => {
    const s = charStats[c.id];
    const wr = s.wins / (s.wins + s.losses) * 100;
    return { ...c, winRate: wr };
  }).sort((a, b) => b.winRate - a.winRate);

  teamResults[grade] = ranked;

  console.log(`${"순위".padEnd(4)} ${"캐릭터".padEnd(22)} ${"속성".padEnd(8)} ${"승률".padEnd(8)} ATK DEF SPD  CE`);
  console.log("─".repeat(70));
  ranked.forEach((r, idx) => {
    console.log(
      `${String(idx + 1).padEnd(4)} ${r.name.padEnd(20)} ${r.attribute.padEnd(8)} ${r.winRate.toFixed(1).padStart(5)}% ${String(r.stats.atk).padStart(3)} ${String(r.stats.def).padStart(3)} ${String(r.stats.spd).padStart(3)} ${String(r.stats.ce).padStart(3)}`
    );
  });

  const wrs = ranked.map(r => r.winRate);
  const maxWr = Math.max(...wrs);
  const minWr = Math.min(...wrs);
  const stdWr = Math.sqrt(wrs.reduce((a, b) => a + (b - wrs.reduce((x, y) => x + y, 0) / wrs.length) ** 2, 0) / wrs.length);
  console.log(`\n  [밸런스 지표] 최고승률: ${maxWr.toFixed(1)}% | 최저승률: ${minWr.toFixed(1)}% | 편차: ${stdWr.toFixed(1)}% | 범위: ${(maxWr - minWr).toFixed(1)}%`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 3: 크로스 등급 매치업 (개인리그)
// ━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PART 3: 크로스 등급 매치업 (개인리그 - 등급 간 대결)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// 각 등급의 대표 캐릭터 (승률 중위값)
const representatives = {};
for (const grade of grades) {
  if (individualResults[grade]) {
    const r = individualResults[grade];
    representatives[grade] = r[Math.floor(r.length / 2)]; // 중위값 캐릭터
  }
}

console.log("등급 간 상위/중위/하위 대결 승률 (상위 등급 기준):");
console.log("─".repeat(70));

for (let i = 0; i < grades.length - 1; i++) {
  for (let j = i + 1; j < grades.length; j++) {
    const gradeA = grades[i], gradeB = grades[j];
    const charsA = individualResults[gradeA];
    const charsB = individualResults[gradeB];
    if (!charsA || !charsB) continue;

    // 상위 등급 상위 vs 하위 등급 상위
    const topA = charsA[0], topB = charsB[0];
    const midA = charsA[Math.floor(charsA.length / 2)];
    const midB = charsB[Math.floor(charsB.length / 2)];

    const topVsTop = simulateIndividual(topA, topB, 200);
    const midVsMid = simulateIndividual(midA, midB, 200);

    console.log(`  ${gradeA} vs ${gradeB}:`);
    console.log(`    상위전: ${topA.name} vs ${topB.name} → ${topA.name} ${topVsTop.winRateA}% 승률 (${topVsTop.avgTurns}턴)`);
    console.log(`    중위전: ${midA.name} vs ${midB.name} → ${midA.name} ${midVsMid.winRateA}% 승률 (${midVsMid.avgTurns}턴)`);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 4: 레벨 변수 영향도 분석
// ━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PART 4: 레벨 변수 영향도 분석 (개인리그)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// 대표 매치업: 1급 중간 캐릭터 2명
const testCharA = ALL_CHARACTERS.find(c => c.id === "itadori_yuji");
const testCharB = ALL_CHARACTERS.find(c => c.id === "choso");

console.log(`기준 매치업: ${testCharA.name} vs ${testCharB.name} (1급 동급)`);
console.log("─".repeat(70));
console.log(`${"레벨A".padEnd(8)} ${"레벨B".padEnd(8)} ${"A승률".padEnd(10)} ${"B승률".padEnd(10)} ${"평균턴".padEnd(8)} 레벨차 영향`);
console.log("─".repeat(70));

const levelCombos = [
  [1, 1], [3, 1], [5, 1], [7, 1], [10, 1],
  [5, 5], [7, 5], [10, 5], [10, 7], [10, 10],
];

for (const [lvA, lvB] of levelCombos) {
  const r = simulateWithLevel(testCharA, testCharB, lvA, lvB, 300);
  const diff = lvA - lvB;
  const impact = diff === 0 ? "동등" : diff > 0 ? `+${diff} → A 유리` : `${diff} → B 유리`;
  console.log(`  Lv${String(lvA).padEnd(4)}  Lv${String(lvB).padEnd(4)}  ${r.winRateA.padStart(5)}%    ${r.winRateB.padStart(5)}%    ${r.avgTurns.padStart(5)}   ${impact}`);
}

// 등급 간 레벨 보정 테스트
console.log(`\n\n등급 간 레벨 보정 효과:`);
console.log("─".repeat(70));
const crossGradeTests = [
  { a: "itadori_yuji", b: "gojo_satoru", lvA: 10, lvB: 1, label: "1급 Lv10 vs 특급 Lv1" },
  { a: "itadori_yuji", b: "gojo_satoru", lvA: 10, lvB: 5, label: "1급 Lv10 vs 특급 Lv5" },
  { a: "kugisaki_nobara", b: "itadori_yuji", lvA: 10, lvB: 1, label: "2급 Lv10 vs 1급 Lv1" },
  { a: "kugisaki_nobara", b: "itadori_yuji", lvA: 10, lvB: 5, label: "2급 Lv10 vs 1급 Lv5" },
  { a: "yu_haibara", b: "kugisaki_nobara", lvA: 10, lvB: 1, label: "3급 Lv10 vs 2급 Lv1" },
];

for (const test of crossGradeTests) {
  const cA = ALL_CHARACTERS.find(c => c.id === test.a);
  const cB = ALL_CHARACTERS.find(c => c.id === test.b);
  const r = simulateWithLevel(cA, cB, test.lvA, test.lvB, 300);
  console.log(`  ${test.label}: ${cA.name} ${r.winRateA}% vs ${cB.name} ${r.winRateB}% (${r.avgTurns}턴)`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 5: 아이템 장착 영향도 분석
// ━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PART 5: 아이템 장착 영향도 분석 (개인리그)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log(`기준 매치업: ${testCharA.name} vs ${testCharB.name} (둘 다 Lv1)`);
console.log("─".repeat(70));

// 기본 (아이템 없음)
const baseResult = simulateWithItems(testCharA, testCharB, null, null, 300);
console.log(`  기본 (아이템 없음): A ${baseResult.winRateA}% vs B ${baseResult.winRateB}%`);

// A만 장착
for (const [rarity, item] of Object.entries(SAMPLE_ITEMS)) {
  const r = simulateWithItems(testCharA, testCharB, item, null, 300);
  console.log(`  A에 ${rarity} 장착: A ${r.winRateA}% vs B ${r.winRateB}% (A +${parseFloat(r.winRateA) - parseFloat(baseResult.winRateA) > 0 ? '+' : ''}${(parseFloat(r.winRateA) - parseFloat(baseResult.winRateA)).toFixed(1)}%p)`);
}

// 양측 동일 장착
console.log(`\n  양측 동일 아이템:`);
for (const [rarity, item] of Object.entries(SAMPLE_ITEMS)) {
  const r = simulateWithItems(testCharA, testCharB, item, item, 300);
  console.log(`  양측 ${rarity}: A ${r.winRateA}% vs B ${r.winRateB}%`);
}

// CE 0 캐릭터 아이템 영향
console.log(`\n  CE 0 캐릭터 아이템 영향 (토지 vs 마허라):`);
const toji = ALL_CHARACTERS.find(c => c.id === "fushiguro_toji");
const maho = ALL_CHARACTERS.find(c => c.id === "mahoraga");

const tojiBare = simulateWithItems(toji, maho, null, null, 300);
console.log(`  기본: 토지 ${tojiBare.winRateA}% vs 마허라 ${tojiBare.winRateB}%`);

const tojiLeg = simulateWithItems(toji, maho, SAMPLE_ITEMS.LEGENDARY, null, 300);
console.log(`  토지 LEGENDARY: 토지 ${tojiLeg.winRateA}% vs 마허라 ${tojiLeg.winRateB}%`);

const tojiBothLeg = simulateWithItems(toji, maho, SAMPLE_ITEMS.LEGENDARY, SAMPLE_ITEMS.LEGENDARY, 300);
console.log(`  양측 LEGENDARY: 토지 ${tojiBothLeg.winRateA}% vs 마허라 ${tojiBothLeg.winRateB}%`);

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 6: 속성별 상성 매트릭스
// ━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PART 6: 속성별 승률 매트릭스 (전체 캐릭터, 개인리그)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const attrs = ["BARRIER", "BODY", "CURSE", "SOUL", "CONVERT", "RANGE"];
const attrNames = { BARRIER: "결계", BODY: "신체", CURSE: "저주", SOUL: "혼백", CONVERT: "변환", RANGE: "원거리" };

const attrWinMatrix = {};
for (const a of attrs) {
  attrWinMatrix[a] = {};
  for (const b of attrs) {
    attrWinMatrix[a][b] = { wins: 0, total: 0 };
  }
}

// 전체 1v1 중 속성별 집계 (샘플링: 같은 등급 내)
for (const grade of grades) {
  const chars = gradeMap[grade];
  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      const r = simulateIndividual(chars[i], chars[j], 100);
      const wA = parseFloat(r.winRateA);

      attrWinMatrix[chars[i].attribute][chars[j].attribute].wins += wA;
      attrWinMatrix[chars[i].attribute][chars[j].attribute].total += 100;
      attrWinMatrix[chars[j].attribute][chars[i].attribute].wins += (100 - wA);
      attrWinMatrix[chars[j].attribute][chars[i].attribute].total += 100;
    }
  }
}

console.log("속성 간 평균 승률 (행 = 공격 속성, 열 = 방어 속성):");
console.log("─".repeat(70));
process.stdout.write("         ");
for (const b of attrs) process.stdout.write(`${attrNames[b].padStart(8)}`);
console.log("");

for (const a of attrs) {
  process.stdout.write(`${attrNames[a].padEnd(8)} `);
  for (const b of attrs) {
    if (a === b) {
      process.stdout.write("    -   ");
    } else {
      const d = attrWinMatrix[a][b];
      const wr = d.total > 0 ? (d.wins / d.total * 100).toFixed(1) : "N/A";
      process.stdout.write(`${String(wr + "%").padStart(8)}`);
    }
  }
  console.log("");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 7: CE 0 캐릭터 특별 분석
// ━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PART 7: CE 0 캐릭터 특별 분석");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const ce0Chars = ALL_CHARACTERS.filter(c => c.stats.ce === 0);
const ceNormalChars = ALL_CHARACTERS.filter(c => c.stats.ce > 0 && (c.grade === "준특급" || c.grade === "1급"));

console.log("CE 0 캐릭터 목록:");
ce0Chars.forEach(c => {
  console.log(`  ${c.name} (${c.grade}) - ATK:${c.stats.atk} DEF:${c.stats.def} SPD:${c.stats.spd} CE:0 CRT:${c.stats.crt} TEC:${c.stats.tec}`);
});

console.log(`\nCE 0 vs CE 보유 캐릭터 (동급) 매치업:`);
console.log("─".repeat(70));

for (const ce0 of ce0Chars) {
  const sameGrade = ALL_CHARACTERS.filter(c => c.grade === ce0.grade && c.stats.ce > 0);
  let totalWr = 0, count = 0;

  for (const opp of sameGrade) {
    const r = simulateIndividual(ce0, opp, 200);
    totalWr += parseFloat(r.winRateA);
    count++;
  }

  const avgWr = count > 0 ? (totalWr / count).toFixed(1) : "N/A";
  console.log(`  ${ce0.name} (${ce0.grade}): 동급 CE 보유 캐릭터 대비 평균 승률 = ${avgWr}%`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// PART 8: 종합 인사이트
// ━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  PART 8: 종합 인사이트 요약");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// 전체 OP/UP 캐릭터 찾기
console.log("【개인리그 전등급 종합 - 주목 캐릭터】\n");

for (const grade of grades) {
  const ranked = individualResults[grade];
  if (!ranked || ranked.length < 3) continue;

  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const range = top.winRate - bottom.winRate;

  console.log(`  ${grade}:`);
  console.log(`    OP: ${top.name} (${top.winRate.toFixed(1)}%) - ATK:${top.stats.atk} CE:${top.stats.ce}`);
  console.log(`    UP: ${bottom.name} (${bottom.winRate.toFixed(1)}%) - ATK:${bottom.stats.atk} CE:${bottom.stats.ce}`);
  console.log(`    밸런스 범위: ${range.toFixed(1)}%p ${range > 30 ? "⚠️ 조정 필요" : range > 20 ? "⚡ 주의" : "✅ 양호"}`);
}

console.log("\n\n═══════════════════════════════════════════════════════════");
console.log("  시뮬레이션 완료");
console.log("═══════════════════════════════════════════════════════════\n");

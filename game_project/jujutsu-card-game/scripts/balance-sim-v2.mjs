// ═══════════════════════════════════════════════════════════
// 밸런스 검증 시뮬레이션 v2 (속성 상성 + CE 배율 반영)
// 개인리그: 속성 상성 ×0.5 스케일 + CE 배율 (1 + CE × 0.006) 추가
// 캐릭터 스탯 변경: 텐겐 버프, CE 0 캐릭터 너프
// ═══════════════════════════════════════════════════════════

// ─── 캐릭터 데이터 (v2: 스탯 조정 반영) ───
const CHARACTERS = [
  // 특급 (6)
  { id:"gojo_satoru", name:"고죠 사토루", grade:"특급", attr:"BARRIER", atk:22, def:20, spd:22, ce:25, hp:100, crt:18, tec:18, mnt:18 },
  { id:"ryomen_sukuna", name:"료멘 스쿠나", grade:"특급", attr:"CURSE", atk:25, def:18, spd:22, ce:24, hp:100, crt:18, tec:18, mnt:18 },
  { id:"yuta_okkotsu", name:"옷코츠 유타", grade:"특급", attr:"CURSE", atk:21, def:18, spd:20, ce:26, hp:100, crt:18, tec:18, mnt:18 },
  { id:"kenjaku", name:"켄자쿠", grade:"특급", attr:"SOUL", atk:18, def:17, spd:18, ce:25, hp:100, crt:18, tec:18, mnt:18 },
  { id:"yuki_tsukumo", name:"츠쿠모 유키", grade:"특급", attr:"BODY", atk:23, def:16, spd:19, ce:24, hp:95, crt:18, tec:18, mnt:18 },
  { id:"itadori_yuji_final", name:"이타도리 유지(최종전)", grade:"특급", attr:"SOUL", atk:23, def:18, spd:23, ce:22, hp:95, crt:18, tec:18, mnt:18 },

  // 준특급 (7) - 텐겐 버프, 토지 너프
  { id:"geto_suguru", name:"게토 스구루", grade:"준특급", attr:"CURSE", atk:19, def:18, spd:18, ce:22, hp:93, crt:16, tec:16, mnt:16 },
  { id:"tengen", name:"텐겐", grade:"준특급", attr:"BARRIER", atk:18, def:20, spd:16, ce:25, hp:100, crt:16, tec:16, mnt:16 },  // ATK 12→18, SPD 10→16
  { id:"fushiguro_toji", name:"후시구로 토우지", grade:"준특급", attr:"BODY", atk:22, def:16, spd:22, ce:0, hp:92, crt:18, tec:20, mnt:10 },  // ATK 25→22, SPD 24→22, CRT 26→18
  { id:"mahoraga", name:"마허라", grade:"준특급", attr:"BODY", atk:22, def:18, spd:18, ce:20, hp:100, crt:16, tec:16, mnt:16 },
  { id:"rika_full", name:"완전체 리카", grade:"준특급", attr:"SOUL", atk:22, def:17, spd:19, ce:24, hp:95, crt:16, tec:16, mnt:16 },
  { id:"tamamo_no_mae", name:"화신 타마모노마에", grade:"준특급", attr:"CURSE", atk:21, def:19, spd:20, ce:22, hp:95, crt:16, tec:16, mnt:16 },
  { id:"dabura", name:"다부라", grade:"준특급", attr:"BODY", atk:23, def:18, spd:21, ce:20, hp:95, crt:16, tec:16, mnt:16 },

  // 1급 (25) - 마키(각성), 츠루기 너프
  { id:"itadori_yuji", name:"이타도리 유지", grade:"1급", attr:"BODY", atk:19, def:16, spd:20, ce:18, hp:90, crt:14, tec:14, mnt:14 },
  { id:"maki_zenin_awakened", name:"젠인 마키(각성)", grade:"1급", attr:"BODY", atk:20, def:15, spd:21, ce:0, hp:88, crt:15, tec:19, mnt:8 },  // ATK 23→20, SPD 24→21, CRT 23→15
  { id:"nanami_kento", name:"나나미 켄토", grade:"1급", attr:"BODY", atk:18, def:17, spd:16, ce:18, hp:88, crt:14, tec:14, mnt:14 },
  { id:"jogo", name:"죠고", grade:"1급", attr:"CONVERT", atk:22, def:13, spd:17, ce:23, hp:88, crt:14, tec:14, mnt:14 },
  { id:"hanami", name:"하나미", grade:"1급", attr:"CONVERT", atk:16, def:19, spd:14, ce:20, hp:92, crt:14, tec:14, mnt:14 },
  { id:"naobito_zenin", name:"젠인 나오비토", grade:"1급", attr:"BODY", atk:17, def:14, spd:24, ce:19, hp:80, crt:14, tec:14, mnt:14 },
  { id:"naoya_zenin", name:"젠인 나오야", grade:"1급", attr:"BODY", atk:18, def:13, spd:23, ce:18, hp:78, crt:14, tec:14, mnt:14 },
  { id:"hiromi_higuruma", name:"히구루마 히로미", grade:"1급", attr:"BARRIER", atk:17, def:18, spd:16, ce:23, hp:86, crt:14, tec:14, mnt:14 },
  { id:"hajime_kashimo", name:"카시모 하지메", grade:"1급", attr:"CONVERT", atk:22, def:15, spd:22, ce:21, hp:86, crt:14, tec:14, mnt:14 },
  { id:"ryu_ishigori", name:"이시고리 류", grade:"1급", attr:"RANGE", atk:23, def:15, spd:14, ce:20, hp:88, crt:14, tec:14, mnt:14 },
  { id:"takako_uro", name:"우로 타카코", grade:"1급", attr:"BARRIER", atk:18, def:16, spd:20, ce:19, hp:82, crt:14, tec:14, mnt:14 },
  { id:"kinji_hakari", name:"하카리 킨지", grade:"1급", attr:"BARRIER", atk:21, def:16, spd:20, ce:22, hp:87, crt:14, tec:14, mnt:14 },
  { id:"choso", name:"쵸소", grade:"1급", attr:"CURSE", atk:18, def:16, spd:17, ce:19, hp:88, crt:14, tec:14, mnt:14 },
  { id:"todo_aoi", name:"토도 아오이", grade:"1급", attr:"BODY", atk:20, def:16, spd:17, ce:17, hp:90, crt:14, tec:14, mnt:14 },
  { id:"uraume", name:"우라우메", grade:"1급", attr:"CONVERT", atk:17, def:17, spd:18, ce:20, hp:85, crt:14, tec:14, mnt:14 },
  { id:"yorozu", name:"요로즈", grade:"1급", attr:"CONVERT", atk:19, def:15, spd:17, ce:21, hp:83, crt:14, tec:14, mnt:14 },
  { id:"mahito", name:"마히토", grade:"1급", attr:"SOUL", atk:19, def:15, spd:19, ce:22, hp:83, crt:14, tec:14, mnt:14 },
  { id:"mei_mei", name:"메이메이", grade:"1급", attr:"RANGE", atk:16, def:15, spd:16, ce:18, hp:80, crt:14, tec:14, mnt:14 },
  { id:"dagon", name:"다곤", grade:"1급", attr:"CONVERT", atk:17, def:17, spd:14, ce:21, hp:90, crt:14, tec:14, mnt:14 },
  { id:"mechamaru", name:"메카마루", grade:"1급", attr:"RANGE", atk:19, def:17, spd:14, ce:21, hp:85, crt:14, tec:14, mnt:14 },
  { id:"miguel", name:"미겔", grade:"1급", attr:"BODY", atk:20, def:16, spd:19, ce:18, hp:88, crt:14, tec:14, mnt:14 },
  { id:"smallpox_deity", name:"포창신", grade:"1급", attr:"CURSE", atk:16, def:18, spd:12, ce:22, hp:90, crt:14, tec:14, mnt:14 },
  { id:"kurourushi", name:"쿠로우루시", grade:"1급", attr:"CURSE", atk:18, def:14, spd:18, ce:20, hp:82, crt:14, tec:14, mnt:14 },
  { id:"bansho", name:"만상", grade:"1급", attr:"CONVERT", atk:17, def:16, spd:15, ce:20, hp:85, crt:14, tec:14, mnt:14 },
  { id:"tsurugi_okkotsu", name:"옷코츠 츠루기", grade:"1급", attr:"BODY", atk:20, def:15, spd:21, ce:0, hp:87, crt:15, tec:19, mnt:8 },  // ATK 23→20, SPD 23→21, CRT 23→15

  // 준1급 (17)
  { id:"fushiguro_megumi", name:"후시구로 메구미", grade:"준1급", attr:"SOUL", atk:16, def:15, spd:17, ce:19, hp:82, crt:12, tec:12, mnt:12 },
  { id:"inumaki_toge", name:"이누마키 토게", grade:"준1급", attr:"CURSE", atk:14, def:13, spd:16, ce:21, hp:75, crt:12, tec:12, mnt:12 },
  { id:"maki_zenin", name:"젠인 마키", grade:"준1급", attr:"BODY", atk:17, def:15, spd:18, ce:5, hp:82, crt:12, tec:12, mnt:12 },
  { id:"angel_hana", name:"천사/쿠루스 하나", grade:"준1급", attr:"BARRIER", atk:15, def:17, spd:16, ce:22, hp:78, crt:12, tec:12, mnt:12 },
  { id:"reggie_star", name:"레지 스타", grade:"준1급", attr:"RANGE", atk:16, def:14, spd:17, ce:19, hp:78, crt:12, tec:12, mnt:12 },
  { id:"fumihiko_takaba", name:"타카바 후미히코", grade:"준1급", attr:"SOUL", atk:14, def:18, spd:15, ce:20, hp:82, crt:12, tec:12, mnt:12 },
  { id:"jinichi_zenin", name:"젠인 진이치", grade:"준1급", attr:"BODY", atk:17, def:16, spd:15, ce:16, hp:85, crt:12, tec:12, mnt:12 },
  { id:"ogi_zenin", name:"젠인 오기", grade:"준1급", attr:"CONVERT", atk:18, def:14, spd:16, ce:17, hp:82, crt:12, tec:12, mnt:12 },
  { id:"noritoshi_kamo", name:"카모 노리토시", grade:"준1급", attr:"CONVERT", atk:15, def:14, spd:17, ce:18, hp:78, crt:12, tec:12, mnt:12 },
  { id:"iori_hazenoki", name:"하제노키 이오리", grade:"준1급", attr:"RANGE", atk:16, def:12, spd:17, ce:17, hp:75, crt:12, tec:12, mnt:12 },
  { id:"kusakabe_atsuya", name:"쿠사카베 아츠야", grade:"준1급", attr:"BODY", atk:16, def:16, spd:15, ce:14, hp:85, crt:12, tec:12, mnt:12 },
  { id:"ui_ui", name:"우이우이", grade:"준1급", attr:"BARRIER", atk:10, def:14, spd:20, ce:21, hp:72, crt:12, tec:12, mnt:12 },
  { id:"yuka_okkotsu", name:"옷코츠 유카", grade:"준1급", attr:"BODY", atk:16, def:13, spd:18, ce:17, hp:76, crt:12, tec:12, mnt:12 },
  { id:"cross", name:"크로스", grade:"준1급", attr:"CONVERT", atk:18, def:15, spd:17, ce:19, hp:80, crt:12, tec:12, mnt:12 },
  { id:"marulu", name:"마루", grade:"준1급", attr:"BARRIER", atk:15, def:16, spd:16, ce:23, hp:78, crt:12, tec:12, mnt:12 },
  { id:"usami", name:"우사미", grade:"준1급", attr:"CURSE", atk:13, def:14, spd:16, ce:22, hp:75, crt:12, tec:12, mnt:12 },
  { id:"masamichi_yaga", name:"야가 마사미치", grade:"준1급", attr:"SOUL", atk:14, def:15, spd:11, ce:18, hp:82, crt:12, tec:12, mnt:12 },

  // 2급 (12)
  { id:"kugisaki_nobara", name:"쿠기사키 노바라", grade:"2급", attr:"RANGE", atk:15, def:13, spd:15, ce:17, hp:75, crt:10, tec:10, mnt:10 },
  { id:"panda", name:"판다", grade:"2급", attr:"BODY", atk:16, def:15, spd:14, ce:15, hp:82, crt:10, tec:10, mnt:10 },
  { id:"ino_takuma", name:"이노 타쿠마", grade:"2급", attr:"CURSE", atk:14, def:14, spd:15, ce:17, hp:78, crt:10, tec:10, mnt:10 },
  { id:"nishimiya_momo", name:"니시미야 모모", grade:"2급", attr:"RANGE", atk:12, def:12, spd:18, ce:16, hp:70, crt:10, tec:10, mnt:10 },
  { id:"kasumi_miwa", name:"미와 카스미", grade:"2급", attr:"BODY", atk:13, def:14, spd:16, ce:14, hp:75, crt:10, tec:10, mnt:10 },
  { id:"mai_zenin", name:"젠인 마이", grade:"2급", attr:"RANGE", atk:14, def:12, spd:15, ce:16, hp:72, crt:10, tec:10, mnt:10 },
  { id:"eso", name:"에소", grade:"2급", attr:"CURSE", atk:15, def:13, spd:14, ce:17, hp:78, crt:10, tec:10, mnt:10 },
  { id:"kechizu", name:"케치즈", grade:"2급", attr:"CURSE", atk:14, def:14, spd:13, ce:16, hp:80, crt:10, tec:10, mnt:10 },
  { id:"utahime_iori", name:"이오리 우타히메", grade:"2급", attr:"BARRIER", atk:12, def:15, spd:13, ce:19, hp:75, crt:10, tec:10, mnt:10 },
  { id:"shoko_ieiri", name:"이에이리 쇼코", grade:"2급", attr:"SOUL", atk:10, def:14, spd:12, ce:20, hp:80, crt:10, tec:10, mnt:10 },
  { id:"granny_ogami", name:"오가미 할멈", grade:"2급", attr:"SOUL", atk:10, def:13, spd:11, ce:19, hp:75, crt:10, tec:10, mnt:10 },
  { id:"charles_bernard", name:"찰스 버나드", grade:"2급", attr:"SOUL", atk:14, def:12, spd:16, ce:17, hp:75, crt:10, tec:10, mnt:10 },

  // 3급 (4)
  { id:"yu_haibara", name:"하이바라 유", grade:"3급", attr:"BODY", atk:13, def:13, spd:14, ce:14, hp:75, crt:8, tec:8, mnt:8 },
  { id:"kiyotaka_ijichi", name:"이지치 키요타카", grade:"3급", attr:"BARRIER", atk:8, def:16, spd:10, ce:18, hp:70, crt:8, tec:8, mnt:8 },
  { id:"akari_nitta", name:"닛타 아카리", grade:"3급", attr:"SOUL", atk:8, def:13, spd:12, ce:17, hp:72, crt:8, tec:8, mnt:8 },
  { id:"misato_kuroi", name:"쿠로이 미사토", grade:"3급", attr:"BODY", atk:10, def:14, spd:13, ce:12, hp:75, crt:8, tec:8, mnt:8 },
];

// ─── 속성 상성 ───
const ATTR_ADV = {
  BARRIER: ['CURSE','CONVERT'],
  BODY:    ['BARRIER','CONVERT'],
  CURSE:   ['BODY','RANGE'],
  SOUL:    ['BARRIER','CURSE'],
  CONVERT: ['SOUL','RANGE'],
  RANGE:   ['BODY','SOUL']
};

function getAttrMult(a, d) {
  if (ATTR_ADV[a]?.includes(d)) return 1.5;
  if (ATTR_ADV[d]?.includes(a)) return 0.7;
  return 1.0;
}

// ─── 경기장 (개인리그) ───
const ARENAS = [
  { id:'tokyo_shibuya', name:'시부야', bonus:'CURSE', bonusPct:10, penalty:'BARRIER', penaltyPct:5 },
  { id:'jujutsu_stadium', name:'주술고전', bonus:'BODY', bonusPct:10, penalty:'CURSE', penaltyPct:5 },
  { id:'barrier_dojo', name:'결계 수련장', bonus:'BARRIER', bonusPct:10, penalty:'BODY', penaltyPct:5 },
  { id:'soul_valley', name:'영혼의 계곡', bonus:'SOUL', bonusPct:10, penalty:'BODY', penaltyPct:5 },
  { id:'cursed_sea', name:'저주의 바다', bonus:'CURSE', bonusPct:15, penalty:'SOUL', penaltyPct:10 },
  { id:'infinite_prison', name:'무한의 감옥', bonus:'BARRIER', bonusPct:15, penalty:'CURSE', penaltyPct:10 },
  { id:'training_mountain', name:'수련의 산', bonus:'BODY', bonusPct:15, penalty:'SOUL', penaltyPct:10 },
  { id:'meditation_temple', name:'명상의 사원', bonus:'SOUL', bonusPct:15, penalty:'BARRIER', penaltyPct:10 },
  { id:'neutral_arena', name:'중립 경기장', bonus:'BODY', bonusPct:3, penalty:'SOUL', penaltyPct:3 },
  { id:'chaos_realm', name:'혼돈의 영역', bonus:'CURSE', bonusPct:20, penalty:'BARRIER', penaltyPct:15 },
];

// ─── 스탯 총합 계산 ───
function totalStats(c) {
  return c.atk + c.def + c.spd + c.ce + c.hp;
}

// ─── [시뮬레이션] 개인리그 전투 v2 (속성 상성 + CE 배율 반영) ───
function simIndividualBattle(c1, c2, arena) {
  // 경기장 적용
  let total1 = totalStats(c1);
  let total2 = totalStats(c2);

  let bonus1 = 0, penalty1 = 0;
  if (arena.bonus === c1.attr) bonus1 = arena.bonusPct;
  if (arena.penalty === c1.attr) penalty1 = arena.penaltyPct;
  let adj1 = Math.round(total1 * (1 + bonus1/100) * (1 - penalty1/100));

  let bonus2 = 0, penalty2 = 0;
  if (arena.bonus === c2.attr) bonus2 = arena.bonusPct;
  if (arena.penalty === c2.attr) penalty2 = arena.penaltyPct;
  let adj2 = Math.round(total2 * (1 + bonus2/100) * (1 - penalty2/100));

  let hp1 = 100, hp2 = 100;
  let gauge1 = 0, gauge2 = 0;

  // 선공 결정
  let attacker = c1.spd >= c2.spd ? 1 : 2;
  let turn = 0;

  // 속성 상성 계수 (개인리그 완화 버전)
  const ATTR_ADVANTAGE_SCALE = 0.5;
  const CE_MULT_COEFF = 0.006;

  while (hp1 > 0 && hp2 > 0 && turn < 30) {
    turn++;
    const isF1 = (attacker === 1);
    const atkC = isF1 ? c1 : c2;
    const defC = isF1 ? c2 : c1;
    const atkAdj = isF1 ? adj1 : adj2;
    const defAdj = isF1 ? adj2 : adj1;
    const atkGauge = isF1 ? gauge1 : gauge2;

    // 1. 기본 데미지 (ATK 기반)
    let baseDmg = Math.round(atkC.atk * 0.4 + 5);

    // 2. 방어력 적용 (최대 30% 감소)
    const defRed = Math.min(defC.def * 0.3, 30);
    baseDmg = Math.round(baseDmg * (1 - defRed / 100));

    // 3. 속성 상성 배율 적용 (v2 신규!)
    // 팀리그: 유리 ×1.5 / 불리 ×0.7 → 개인리그: 유리 ×1.25 / 불리 ×0.85
    const rawAttrMult = getAttrMult(atkC.attr, defC.attr);
    const scaledAttrMult = 1.0 + (rawAttrMult - 1.0) * ATTR_ADVANTAGE_SCALE;
    baseDmg = Math.round(baseDmg * scaledAttrMult);

    // 4. CE 배율 적용 (v2 신규!)
    // CE 0: ×1.0, CE 18: ×1.108, CE 25: ×1.15
    const ceMultiplier = 1 + (atkC.ce * CE_MULT_COEFF);
    baseDmg = Math.round(baseDmg * ceMultiplier);

    // 5. 최소 데미지 보장
    baseDmg = Math.max(baseDmg, 5);

    // 6. 총합 차이에 따른 미세 보정 (±20% 범위)
    const statDiff = atkAdj - defAdj;
    const statBonus = Math.max(0.8, Math.min(1.2, 1 + statDiff / 1000));
    baseDmg = Math.round(baseDmg * statBonus);

    // 7. 랜덤 변동 (±10%)
    const variance = 0.9 + Math.random() * 0.2;
    baseDmg = Math.round(baseDmg * variance);

    // 액션 결정
    let mult = 1.0;
    const forceUlt = atkGauge >= 100;
    if (forceUlt) {
      mult = 2.0;
    } else if (Math.random() < 0.3) {
      mult = 1.3;
    }

    // 크리티컬
    const critChance = atkC.crt / 150;
    const isCrit = Math.random() < critChance;

    let finalDmg = Math.round(baseDmg * mult);
    if (isCrit) finalDmg = Math.round(finalDmg * 1.5);
    finalDmg = Math.max(5, finalDmg);

    // 데미지 적용
    if (isF1) {
      hp2 -= finalDmg;
      if (forceUlt) gauge1 = 0;
      else { gauge1 = Math.min(100, gauge1 + 25); gauge2 = Math.min(100, gauge2 + 25); }
    } else {
      hp1 -= finalDmg;
      if (forceUlt) gauge2 = 0;
      else { gauge1 = Math.min(100, gauge1 + 25); gauge2 = Math.min(100, gauge2 + 25); }
    }

    // 공수 교대
    attacker = attacker === 1 ? 2 : 1;
  }

  if (hp1 > 0 && hp2 <= 0) return { winner: 1, turns: turn, hp1, hp2 };
  if (hp2 > 0 && hp1 <= 0) return { winner: 2, turns: turn, hp1, hp2 };
  if (hp1 > hp2) return { winner: 1, turns: turn, hp1, hp2 };
  if (hp2 > hp1) return { winner: 2, turns: turn, hp1, hp2 };
  return { winner: 0, turns: turn, hp1, hp2 }; // draw
}

// ─── [시뮬레이션 2] 팀리그 전투 (battleCalculator 공식) ───
function simTeamBattle(c1, c2, arena) {
  const attrMult1 = getAttrMult(c1.attr, c2.attr);
  const attrMult2 = getAttrMult(c2.attr, c1.attr);

  const ceMult1 = 1 + c1.ce / 100;
  const ceMult2 = 1 + c2.ce / 100;

  let arenaBonus1 = 1.0, arenaBonus2 = 1.0;
  if (arena.bonus === c1.attr) arenaBonus1 = 1 + arena.bonusPct / 100;
  if (arena.penalty === c1.attr) arenaBonus1 = 1 - arena.penaltyPct / 100;
  if (arena.bonus === c2.attr) arenaBonus2 = 1 + arena.bonusPct / 100;
  if (arena.penalty === c2.attr) arenaBonus2 = 1 - arena.penaltyPct / 100;

  const dmg1 = Math.max(1, Math.floor(c1.atk * attrMult1 * ceMult1 * arenaBonus1 - c2.def));
  const dmg2 = Math.max(1, Math.floor(c2.atk * attrMult2 * ceMult2 * arenaBonus2 - c1.def));

  let hp1 = c1.hp;
  let hp2 = c2.hp;
  const playerFirst = c1.spd > c2.spd ? true : (c1.spd < c2.spd ? false : Math.random() > 0.5);
  let turn = 0;

  while (hp1 > 0 && hp2 > 0 && turn < 100) {
    turn++;
    if (playerFirst) {
      hp2 -= dmg1;
      if (hp2 <= 0) break;
      hp1 -= dmg2;
    } else {
      hp1 -= dmg2;
      if (hp1 <= 0) break;
      hp2 -= dmg1;
    }
  }

  if (hp1 > 0 && hp2 <= 0) return { winner: 1, turns: turn };
  if (hp2 > 0 && hp1 <= 0) return { winner: 2, turns: turn };
  if (hp1 > hp2) return { winner: 1, turns: turn };
  if (hp2 > hp1) return { winner: 2, turns: turn };
  return { winner: 0, turns: turn };
}


// ═══════════════════════════════════════════════════════════
// 메인 시뮬레이션 실행
// ═══════════════════════════════════════════════════════════

const SIMS_PER_MATCHUP = 50;
const N = CHARACTERS.length;

const indResults = {};
const teamResults = {};

for (const c of CHARACTERS) {
  indResults[c.id] = { wins: 0, losses: 0, draws: 0, total: 0, winsUnfavorable: 0, matchesUnfavorable: 0 };
  teamResults[c.id] = { wins: 0, losses: 0, draws: 0, total: 0, winsUnfavorable: 0, matchesUnfavorable: 0 };
}

function isUnfavorable(c, opp, arena) {
  const attrDisadv = ATTR_ADV[opp.attr]?.includes(c.attr);
  const arenaDisadv = arena.penalty === c.attr;
  return attrDisadv || arenaDisadv;
}

console.log(`\n========================================`);
console.log(`  밸런스 시뮬레이션 v2 (속성상성+CE배율 반영)`);
console.log(`========================================`);
console.log(`캐릭터: ${N}명 | 매치업당 ${SIMS_PER_MATCHUP}회 | 경기장: ${ARENAS.length}개`);
console.log(`변경사항:`);
console.log(`  [개인리그] 속성 상성 배율 추가 (유리 x1.25, 불리 x0.85)`);
console.log(`  [개인리그] CE 배율 추가 (1 + CE x 0.006)`);
console.log(`  [스탯] 텐겐: ATK 12->18, SPD 10->16`);
console.log(`  [스탯] 토지: ATK 25->22, SPD 24->22, CRT 26->18`);
console.log(`  [스탯] 마키(각성): ATK 23->20, SPD 24->21, CRT 23->15`);
console.log(`  [스탯] 츠루기: ATK 23->20, SPD 23->21, CRT 23->15\n`);

let matchCount = 0;

for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    const c1 = CHARACTERS[i];
    const c2 = CHARACTERS[j];

    for (const arena of ARENAS) {
      for (let s = 0; s < SIMS_PER_MATCHUP; s++) {
        // 개인리그
        const ir = simIndividualBattle(c1, c2, arena);
        indResults[c1.id].total++;
        indResults[c2.id].total++;

        if (ir.winner === 1) { indResults[c1.id].wins++; indResults[c2.id].losses++; }
        else if (ir.winner === 2) { indResults[c2.id].wins++; indResults[c1.id].losses++; }
        else { indResults[c1.id].draws++; indResults[c2.id].draws++; }

        if (isUnfavorable(c1, c2, arena)) {
          indResults[c1.id].matchesUnfavorable++;
          if (ir.winner === 1) indResults[c1.id].winsUnfavorable++;
        }
        if (isUnfavorable(c2, c1, arena)) {
          indResults[c2.id].matchesUnfavorable++;
          if (ir.winner === 2) indResults[c2.id].winsUnfavorable++;
        }

        // 팀리그
        const tr = simTeamBattle(c1, c2, arena);
        teamResults[c1.id].total++;
        teamResults[c2.id].total++;

        if (tr.winner === 1) { teamResults[c1.id].wins++; teamResults[c2.id].losses++; }
        else if (tr.winner === 2) { teamResults[c2.id].wins++; teamResults[c1.id].losses++; }
        else { teamResults[c1.id].draws++; teamResults[c2.id].draws++; }

        if (isUnfavorable(c1, c2, arena)) {
          teamResults[c1.id].matchesUnfavorable++;
          if (tr.winner === 1) teamResults[c1.id].winsUnfavorable++;
        }
        if (isUnfavorable(c2, c1, arena)) {
          teamResults[c2.id].matchesUnfavorable++;
          if (tr.winner === 2) teamResults[c2.id].winsUnfavorable++;
        }
      }
      matchCount++;
    }
  }
}

console.log(`총 ${matchCount} 매치업 x ${SIMS_PER_MATCHUP}회 = ${matchCount * SIMS_PER_MATCHUP * 2} 전투 시뮬 완료\n`);

// ═══════════════════════════════════════════════════════════
// 결과 분석 & 출력
// ═══════════════════════════════════════════════════════════

function analyzeAndPrint(label, results) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${label} 전투 밸런스 분석`);
  console.log(`${'='.repeat(70)}`);

  const sorted = CHARACTERS.map(c => {
    const r = results[c.id];
    const winRate = r.total > 0 ? (r.wins / r.total * 100) : 0;
    const lossRate = r.total > 0 ? (r.losses / r.total * 100) : 0;
    const unfavWinRate = r.matchesUnfavorable > 0 ? (r.winsUnfavorable / r.matchesUnfavorable * 100) : 0;
    return { ...c, ...r, winRate, lossRate, unfavWinRate };
  }).sort((a, b) => b.winRate - a.winRate);

  // 전체 승률 순위
  console.log(`\n[전체 승률 순위]`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`순위  캐릭터                    등급     속성     승률    패율    불리시승률`);
  console.log(`${'─'.repeat(80)}`);

  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    console.log(
      `${String(i+1).padStart(2)}위  ${s.name.padEnd(20)} ${s.grade.padEnd(5)} ${s.attr.padEnd(8)} ${s.winRate.toFixed(1).padStart(5)}%  ${s.lossRate.toFixed(1).padStart(5)}%  ${s.unfavWinRate.toFixed(1).padStart(5)}%`
    );
  }

  // 문제 캐릭터 식별
  console.log(`\n[밸런스 이상 캐릭터]`);
  console.log(`${'─'.repeat(80)}`);

  const opChars = sorted.filter(s => s.winRate >= 65);
  const weakChars = sorted.filter(s => s.winRate <= 35);
  const unfavTanks = sorted.filter(s => s.unfavWinRate >= 55 && s.matchesUnfavorable > 100);

  if (opChars.length > 0) {
    console.log(`\n[!] 너무 강한 캐릭터 (승률 >= 65%):`);
    for (const c of opChars) {
      console.log(`   ${c.name} (${c.grade}, ${c.attr}) - 승률 ${c.winRate.toFixed(1)}%, 불리시 ${c.unfavWinRate.toFixed(1)}%`);
      console.log(`     ATK:${c.atk} DEF:${c.def} SPD:${c.spd} CE:${c.ce} HP:${c.hp} CRT:${c.crt}`);
    }
  } else {
    console.log(`\n[OK] 승률 65% 이상 캐릭터 없음`);
  }

  if (weakChars.length > 0) {
    console.log(`\n[i] 약한 캐릭터 (승률 <= 35%):`);
    for (const c of weakChars) {
      console.log(`   ${c.name} (${c.grade}, ${c.attr}) - 승률 ${c.winRate.toFixed(1)}%, 불리시 ${c.unfavWinRate.toFixed(1)}%`);
    }
  } else {
    console.log(`\n[OK] 승률 35% 이하 캐릭터 없음`);
  }

  if (unfavTanks.length > 0) {
    console.log(`\n[!] 불리해도 안 지는 캐릭터 (불리시 승률 >= 55%):`);
    for (const c of unfavTanks) {
      console.log(`   ${c.name} (${c.grade}, ${c.attr}) - 불리시 승률 ${c.unfavWinRate.toFixed(1)}% (${c.winsUnfavorable}/${c.matchesUnfavorable})`);
    }
  }

  // 핵심 캐릭터 비교
  const keyChars = ['tengen', 'fushiguro_toji', 'maki_zenin_awakened', 'tsurugi_okkotsu'];
  console.log(`\n[핵심 캐릭터 변경 결과]`);
  console.log(`${'─'.repeat(80)}`);
  for (const id of keyChars) {
    const s = sorted.find(c => c.id === id);
    if (s) {
      const rank = sorted.indexOf(s) + 1;
      console.log(`  ${s.name} (${s.grade}): 승률 ${s.winRate.toFixed(1)}% [${rank}위/${sorted.length}명], 불리시 ${s.unfavWinRate.toFixed(1)}%`);
      console.log(`    ATK:${s.atk} DEF:${s.def} SPD:${s.spd} CE:${s.ce} HP:${s.hp} CRT:${s.crt}`);
    }
  }
}

analyzeAndPrint('[개인리그]', indResults);
analyzeAndPrint('[팀리그]', teamResults);

// ═══════════════════════════════════════════════════════════
// 등급별 평균 승률
// ═══════════════════════════════════════════════════════════

console.log(`\n${'='.repeat(70)}`);
console.log(`  등급별 평균 승률 비교`);
console.log(`${'='.repeat(70)}`);

const grades = ['특급', '준특급', '1급', '준1급', '2급', '3급'];
for (const g of grades) {
  const chars = CHARACTERS.filter(c => c.grade === g);
  const indAvg = chars.reduce((sum, c) => sum + (indResults[c.id].wins / indResults[c.id].total * 100), 0) / chars.length;
  const teamAvg = chars.reduce((sum, c) => sum + (teamResults[c.id].wins / teamResults[c.id].total * 100), 0) / chars.length;
  console.log(`  ${g.padEnd(5)} (${String(chars.length).padStart(2)}명): 개인리그 ${indAvg.toFixed(1)}% | 팀리그 ${teamAvg.toFixed(1)}%`);
}

// ═══════════════════════════════════════════════════════════
// 속성별 평균 승률
// ═══════════════════════════════════════════════════════════

console.log(`\n${'='.repeat(70)}`);
console.log(`  속성별 평균 승률 비교`);
console.log(`${'='.repeat(70)}`);

const attrs = ['BARRIER', 'BODY', 'CURSE', 'SOUL', 'CONVERT', 'RANGE'];
for (const a of attrs) {
  const chars = CHARACTERS.filter(c => c.attr === a);
  const indAvg = chars.reduce((sum, c) => sum + (indResults[c.id].wins / indResults[c.id].total * 100), 0) / chars.length;
  const teamAvg = chars.reduce((sum, c) => sum + (teamResults[c.id].wins / teamResults[c.id].total * 100), 0) / chars.length;
  console.log(`  ${a.padEnd(8)} (${String(chars.length).padStart(2)}명): 개인리그 ${indAvg.toFixed(1)}% | 팀리그 ${teamAvg.toFixed(1)}%`);
}

console.log(`\n${'='.repeat(70)}`);
console.log(`  시뮬레이션 v2 완료`);
console.log(`${'='.repeat(70)}\n`);

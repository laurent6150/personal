// ========================================
// 1급 캐릭터 (25명)
// 기존 16명 + 마히토/메이메이 승급 + 신규 7명
// ========================================

import type { CharacterCard } from '../../types';
import { getCharacterImage } from '../../utils/imageHelper';

export const FIRST_GRADE: CharacterCard[] = [
  {
    id: "itadori_yuji",
    name: { ko: "이타도리 유지", ja: "虎杖悠仁", en: "Itadori Yuji" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("itadori_yuji", "이타도리 유지", "BODY"),
    baseStats: { atk: 19, def: 16, spd: 20, ce: 18, hp: 90 },
    growthStats: { primary: "spd", secondary: "atk" },
    skill: { name: "흑섬", description: "저주력의 핵심을 찌르는 일격", effect: { type: "CRITICAL_GUARANTEED", damage: 220, multiplier: 2.5 } },
    basicSkills: [
      { id: "yuji_1", name: "일격", type: "ATTACK", description: "빠른 주먹 공격", effect: { type: "DAMAGE", value: 100 } },
      { id: "yuji_2", name: "연타", type: "ATTACK", description: "연속 주먹 공격", effect: { type: "MULTI_HIT", hits: 3, value: 40 } },
      { id: "yuji_3", name: "발경", type: "ATTACK", description: "저주력을 담은 타격", effect: { type: "TRUE_DAMAGE", value: 80 } }
    ],
    ultimateSkill: { id: "yuji_ult", name: "흑섬 (黑閃)", description: "저주력의 핵심을 찌르는 일격", effect: { type: "CRITICAL_GUARANTEED", damage: 220, multiplier: 2.5 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "maki_zenin_awakened",
    name: { ko: "젠인 마키 (각성)", ja: "禪院真希 (覚醒)", en: "Maki Zenin (Awakened)" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("maki_zenin_awakened", "젠인 마키 (각성)", "BODY"),
    baseStats: { atk: 22, def: 14, spd: 23, ce: 0, hp: 85 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "천여함수 완성", description: "토지와 동등한 경지", effect: { type: "STAT_BOOST", atkBonus: 60, spdBonus: 40, damage: 180 } },
    basicSkills: [
      { id: "maki_aw_1", name: "혼폭도 (魂爆刀)", type: "ATTACK", description: "영혼을 베는 특급 저주도구", effect: { type: "DAMAGE", value: 130, ignoreBarrier: true } },
      { id: "maki_aw_2", name: "천여함수의 동체시력", type: "DEFENSE", description: "모든 움직임을 포착", effect: { type: "DODGE", chance: 60 } },
      { id: "maki_aw_3", name: "연속 참격", type: "ATTACK", description: "빠른 연속 베기", effect: { type: "MULTI_HIT", hits: 4, value: 40 } }
    ],
    ultimateSkill: { id: "maki_aw_ult", name: "천여함수 완성", description: "토지와 동등한 경지에 도달", effect: { type: "STAT_BOOST", atkBonus: 60, spdBonus: 40, damage: 180 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "nanami_kento",
    name: { ko: "나나미 켄토", ja: "七海建人", en: "Nanami Kento" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("nanami_kento", "나나미 켄토", "BODY"),
    baseStats: { atk: 18, def: 17, spd: 16, ce: 18, hp: 88 },
    growthStats: { primary: "atk", secondary: "def" },
    skill: { name: "시간외 노동", description: "리미터 해제, 모든 능력 극대화", effect: { type: "STAT_BOOST", atkBonus: 50, spdBonus: 30, damage: 180 } },
    basicSkills: [
      { id: "nanami_1", name: "십획상사", type: "ATTACK", description: "7:3 비율의 약점을 노린다", effect: { type: "RATIO_DAMAGE", value: 110, damage: 40 } },
      { id: "nanami_2", name: "둔도 일격", type: "ATTACK", description: "둔도를 이용한 강력한 일격", effect: { type: "DAMAGE", value: 100 } },
      { id: "nanami_3", name: "방어 태세", type: "DEFENSE", description: "단단한 방어 태세", effect: { type: "DAMAGE_REDUCE", value: 45 } }
    ],
    ultimateSkill: { id: "nanami_ult", name: "시간외 노동 (오버타임)", description: "리미터 해제, 모든 능력 강화", effect: { type: "STAT_BOOST", atkBonus: 50, spdBonus: 30, damage: 180 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "jogo",
    name: { ko: "죠고", ja: "漏瑚", en: "Jogo" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("jogo", "죠고", "CONVERT"),
    baseStats: { atk: 20, def: 12, spd: 16, ce: 22, hp: 85 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "개문돈갑", description: "태양 온도의 영역", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 20, damage: 230 } },
    basicSkills: [
      { id: "jogo_1", name: "화염탄", type: "ATTACK", description: "강력한 화염 투사체", effect: { type: "DAMAGE", value: 120, element: "FIRE" } },
      { id: "jogo_2", name: "용암 분출", type: "ATTACK", description: "땅에서 용암을 분출", effect: { type: "AOE_DAMAGE", value: 90 } },
      { id: "jogo_3", name: "소각", type: "ATTACK", description: "모든 것을 태운다", effect: { type: "BURN", value: 70, dotDamage: 25, duration: 2 } }
    ],
    ultimateSkill: { id: "jogo_ult", name: "개문돈갑 (철위산)", description: "내부 온도가 태양 수준인 영역", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 20, damage: 230 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "hanami",
    name: { ko: "하나미", ja: "花御", en: "Hanami" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("hanami", "하나미", "CONVERT"),
    baseStats: { atk: 16, def: 20, spd: 14, ce: 20, hp: 95 },
    growthStats: { primary: "def", secondary: "ce" },
    skill: { name: "재앙의 꽃", description: "모든 생물의 저주력을 강제 흡수", effect: { type: "DRAIN", value: 160, healPercent: 60 } },
    basicSkills: [
      { id: "hanami_1", name: "저주의 새싹", type: "ATTACK", description: "저주의 나무를 소환하여 공격", effect: { type: "DAMAGE", value: 100 } },
      { id: "hanami_2", name: "목룡", type: "ATTACK", description: "거대한 나무 용을 소환", effect: { type: "DAMAGE", value: 120 } },
      { id: "hanami_3", name: "자연 흡수", type: "UTILITY", description: "주변의 생명력을 흡수", effect: { type: "HEAL", value: 50 } }
    ],
    ultimateSkill: { id: "hanami_ult", name: "재앙의 꽃 (災花)", description: "주변 생물의 저주력을 강제 흡수", effect: { type: "DRAIN", value: 160, healPercent: 60 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "naobito_zenin",
    name: { ko: "젠인 나오비토", ja: "禪院直毘人", en: "Naobito Zenin" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("naobito_zenin", "젠인 나오비토", "BODY"),
    baseStats: { atk: 17, def: 14, spd: 24, ce: 19, hp: 80 },
    growthStats: { primary: "spd", secondary: "atk" },
    skill: { name: "투사호법 - 극", description: "프레임을 완전히 지배하는 궁극 투사", effect: { type: "MULTI_HIT", hits: 5, value: 45, guaranteed_first: true } },
    basicSkills: [
      { id: "naobito_1", name: "투사호법", type: "ATTACK", description: "프레임 단위의 빠른 공격", effect: { type: "DAMAGE", value: 110, guaranteed_first: true } },
      { id: "naobito_2", name: "프레임 이동", type: "DEFENSE", description: "프레임 사이로 회피", effect: { type: "DODGE", chance: 65 } },
      { id: "naobito_3", name: "연속 타격", type: "ATTACK", description: "빠른 연속 공격", effect: { type: "MULTI_HIT", hits: 3, value: 45 } }
    ],
    ultimateSkill: { id: "naobito_ult", name: "투사호법 - 극 (極)", description: "프레임을 완전히 지배하는 궁극 투사", effect: { type: "MULTI_HIT", hits: 5, value: 45, guaranteed_first: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "naoya_zenin",
    name: { ko: "젠인 나오야", ja: "禪院直哉", en: "Naoya Zenin" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("naoya_zenin", "젠인 나오야", "BODY"),
    baseStats: { atk: 18, def: 13, spd: 23, ce: 18, hp: 78 },
    growthStats: { primary: "spd", secondary: "atk" },
    skill: { name: "시강원둔", description: "투사호법의 영역", effect: { type: "DOMAIN", damage: 180 } },
    basicSkills: [
      { id: "naoya_1", name: "투사호법", type: "ATTACK", description: "프레임 단위 공격", effect: { type: "DAMAGE", value: 105, guaranteed_first: true } },
      { id: "naoya_2", name: "초월 속도", type: "ATTACK", description: "엄청난 속도로 급습", effect: { type: "CRITICAL_ATTACK", value: 120, critRate: 40 } },
      { id: "naoya_3", name: "프레임 회피", type: "DEFENSE", description: "프레임 사이로 회피", effect: { type: "DODGE", chance: 55 } }
    ],
    ultimateSkill: { id: "naoya_ult", name: "시강원둔", description: "투사호법의 영역전개", effect: { type: "DOMAIN", damage: 180 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "hiromi_higuruma",
    name: { ko: "히구루마 히로미", ja: "日車寛見", en: "Hiromi Higuruma" },
    grade: "1급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("hiromi_higuruma", "히구루마 히로미", "BARRIER"),
    baseStats: { atk: 16, def: 18, spd: 15, ce: 22, hp: 85 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "사법암흑계 - 사형선고", description: "영역 내 재판에서 유죄 시 심판인의 검으로 처형", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 240 } },
    basicSkills: [
      { id: "higuruma_1", name: "법정봉 타격", type: "ATTACK", description: "법정봉으로 타격", effect: { type: "DAMAGE", value: 90 } },
      { id: "higuruma_2", name: "심문", type: "UTILITY", description: "상대의 약점을 심문", effect: { type: "WEAKNESS_FIND", critRate: 30 } },
      { id: "higuruma_3", name: "증거 수집", type: "UTILITY", description: "증거를 모아 게이지 충전", effect: { type: "CHARGE", gaugeBonus: 30 } }
    ],
    ultimateSkill: { id: "higuruma_ult", name: "사법암흑계 (誅伏賜死)", description: "유죄 판결 시 심판인의 검으로 처형", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 240 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "hajime_kashimo",
    name: { ko: "카시모 하지메", ja: "鹿紫雲一", en: "Hajime Kashimo" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("hajime_kashimo", "카시모 하지메", "CONVERT"),
    baseStats: { atk: 21, def: 14, spd: 21, ce: 20, hp: 82 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "환상의 수", description: "번개의 신으로 변신", effect: { type: "TRANSFORM", damage: 230, spdBonus: 60, duration: 3 } },
    basicSkills: [
      { id: "kashimo_1", name: "뇌격", type: "ATTACK", description: "번개를 내리친다", effect: { type: "DAMAGE", value: 120, element: "LIGHTNING" } },
      { id: "kashimo_2", name: "방전", type: "ATTACK", description: "주변으로 전기 방출", effect: { type: "AOE_DAMAGE", value: 85 } },
      { id: "kashimo_3", name: "전격 가속", type: "UTILITY", description: "전기로 속도 증가", effect: { type: "STAT_BOOST", spdBonus: 40 } }
    ],
    ultimateSkill: { id: "kashimo_ult", name: "환상의 수 (호박)", description: "번개의 신으로 변신", effect: { type: "TRANSFORM", damage: 230, spdBonus: 60, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "ryu_ishigori",
    name: { ko: "이시고리 류", ja: "石流龍", en: "Ryu Ishigori" },
    grade: "1급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("ryu_ishigori", "이시고리 류", "RANGE"),
    baseStats: { atk: 23, def: 15, spd: 14, ce: 20, hp: 88 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "화산두", description: "최대 출력 저주력 방출", effect: { type: "DAMAGE", value: 250 } },
    basicSkills: [
      { id: "ryu_1", name: "저주력 포격", type: "ATTACK", description: "강력한 저주력 방출", effect: { type: "DAMAGE", value: 120 } },
      { id: "ryu_2", name: "연속 포격", type: "ATTACK", description: "연속으로 포격", effect: { type: "MULTI_HIT", hits: 3, value: 50 } },
      { id: "ryu_3", name: "포격 집중", type: "UTILITY", description: "다음 공격 강화", effect: { type: "STAT_BOOST", atkBonus: 50 } }
    ],
    ultimateSkill: { id: "ryu_ult", name: "화산두", description: "최대 출력 저주력 방출", effect: { type: "DAMAGE", value: 250 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "takako_uro",
    name: { ko: "우로 타카코", ja: "烏路陽子", en: "Takako Uro" },
    grade: "1급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("takako_uro", "우로 타카코", "BARRIER"),
    baseStats: { atk: 18, def: 16, spd: 20, ce: 19, hp: 82 },
    growthStats: { primary: "spd", secondary: "atk" },
    skill: { name: "하늘 접기", description: "하늘 전체를 접어 압축", effect: { type: "DAMAGE", value: 240 } },
    basicSkills: [
      { id: "uro_1", name: "공간 조작", type: "ATTACK", description: "공간을 비틀어 공격", effect: { type: "DAMAGE", value: 110 } },
      { id: "uro_2", name: "반사", type: "DEFENSE", description: "공격을 반사", effect: { type: "REFLECT_DAMAGE", reflectPercent: 60 } },
      { id: "uro_3", name: "공간 비틀기", type: "ATTACK", description: "광역 공간 공격", effect: { type: "AOE_DAMAGE", value: 90 } }
    ],
    ultimateSkill: { id: "uro_ult", name: "하늘 접기", description: "하늘 전체를 접어 압축", effect: { type: "DAMAGE", value: 240 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "kinji_hakari",
    name: { ko: "하카리 킨지", ja: "秤金次", en: "Kinji Hakari" },
    grade: "1급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("kinji_hakari", "하카리 킨지", "BARRIER"),
    baseStats: { atk: 19, def: 16, spd: 18, ce: 21, hp: 85 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "좌살박도", description: "잭팟! 무한 저주력 + 불사", effect: { type: "TRANSFORM", damage: 200, duration: 3 } },
    basicSkills: [
      { id: "hakari_1", name: "권투", type: "ATTACK", description: "주먹으로 공격", effect: { type: "DAMAGE", value: 100 } },
      { id: "hakari_2", name: "도박", type: "UTILITY", description: "랜덤 게이지 충전", effect: { type: "CHARGE", gaugeBonus: 30 } },
      { id: "hakari_3", name: "러쉬", type: "ATTACK", description: "연속 펀치", effect: { type: "MULTI_HIT", hits: 4, value: 30 } }
    ],
    ultimateSkill: { id: "hakari_ult", name: "좌살박도 (坐殺博徒)", description: "잭팟! 무한 저주력 + 자동 반전술식으로 불사", effect: { type: "TRANSFORM", damage: 200, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "choso",
    name: { ko: "쵸소", ja: "脹相", en: "Choso" },
    grade: "1급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("choso", "쵸소", "CURSE"),
    baseStats: { atk: 18, def: 16, spd: 17, ce: 19, hp: 88 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "초노바", description: "혈액을 독으로 변환 폭발", effect: { type: "POISON_EXPLOSION", damage: 220, dotDamage: 35, duration: 2 } },
    basicSkills: [
      { id: "choso_1", name: "적혈조작 - 천혈", type: "ATTACK", description: "경화된 피를 발사", effect: { type: "DAMAGE", value: 115 } },
      { id: "choso_2", name: "적혈조작 - 혈인", type: "ATTACK", description: "연속으로 피를 발사", effect: { type: "MULTI_HIT", hits: 4, value: 35 } },
      { id: "choso_3", name: "혈갑", type: "DEFENSE", description: "피로 갑옷을 형성", effect: { type: "DAMAGE_REDUCE", value: 50 } }
    ],
    ultimateSkill: { id: "choso_ult", name: "초노바", description: "혈액을 독으로 변환하여 폭발", effect: { type: "POISON_EXPLOSION", damage: 220, dotDamage: 35, duration: 2 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "todo_aoi",
    name: { ko: "토도 아오이", ja: "東堂葵", en: "Todo Aoi" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("todo_aoi", "토도 아오이", "BODY"),
    baseStats: { atk: 20, def: 16, spd: 17, ce: 17, hp: 90 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "부기우기", description: "위치 교체 기습", effect: { type: "SWAP_ATTACK", damage: 200, guaranteed_first: true } },
    basicSkills: [
      { id: "todo_1", name: "강타", type: "ATTACK", description: "압도적인 신체 능력으로 강타", effect: { type: "DAMAGE", value: 115 } },
      { id: "todo_2", name: "박수", type: "UTILITY", description: "부기우기 준비", effect: { type: "CHARGE", gaugeBonus: 25 } },
      { id: "todo_3", name: "연속 타격", type: "ATTACK", description: "빠른 연속 공격", effect: { type: "MULTI_HIT", hits: 2, value: 60 } }
    ],
    ultimateSkill: { id: "todo_ult", name: "부기우기", description: "박수로 위치를 바꿔 기습", effect: { type: "SWAP_ATTACK", damage: 200, guaranteed_first: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "uraume",
    name: { ko: "우라우메", ja: "裏梅", en: "Uraume" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("uraume", "우라우메", "CONVERT"),
    baseStats: { atk: 17, def: 17, spd: 18, ce: 20, hp: 85 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "빙응", description: "절대 영도로 모든 것을 동결", effect: { type: "STUN", damage: 180, duration: 2 } },
    basicSkills: [
      { id: "uraume_1", name: "빙결", type: "ATTACK", description: "얼음으로 공격", effect: { type: "DAMAGE", value: 100, element: "ICE" } },
      { id: "uraume_2", name: "서리 방벽", type: "DEFENSE", description: "얼음 방벽 생성", effect: { type: "DAMAGE_REDUCE", value: 45 } },
      { id: "uraume_3", name: "동결", type: "UTILITY", description: "상대를 느리게", effect: { type: "SLOW", value: 40 } }
    ],
    ultimateSkill: { id: "uraume_ult", name: "빙응", description: "절대 영도로 모든 것을 동결", effect: { type: "STUN", damage: 180, duration: 2 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "yorozu",
    name: { ko: "요로즈", ja: "万", en: "Yorozu" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("yorozu", "요로즈", "CONVERT"),
    baseStats: { atk: 19, def: 15, spd: 17, ce: 21, hp: 83 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "진구", description: "완벽한 구체로 공격", effect: { type: "DAMAGE", value: 220 } },
    basicSkills: [
      { id: "yorozu_1", name: "구축술식", type: "ATTACK", description: "무기를 구축하여 공격", effect: { type: "DAMAGE", value: 110 } },
      { id: "yorozu_2", name: "갑충 소환", type: "ATTACK", description: "갑충을 소환하여 공격", effect: { type: "SUMMON_DAMAGE", value: 95 } },
      { id: "yorozu_3", name: "갑충 갑옷", type: "DEFENSE", description: "갑충으로 갑옷 형성", effect: { type: "DAMAGE_REDUCE", value: 40 } }
    ],
    ultimateSkill: { id: "yorozu_ult", name: "진구 (真球)", description: "완벽한 구체로 공격", effect: { type: "DAMAGE", value: 220 }, gaugeRequired: 100 },
    achievements: []
  },
  // ========================================
  // 준1급 → 1급 승급
  // ========================================
  {
    id: "mahito",
    name: { ko: "마히토", ja: "真人", en: "Mahito" },
    grade: "1급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("mahito", "마히토", "SOUL"),
    baseStats: { atk: 17, def: 14, spd: 18, ce: 20, hp: 80 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "자폐원둔리득체기", description: "영역 내 모든 영혼을 만진다", effect: { type: "DOMAIN", damage: 200, ignoreDefense: true } },
    basicSkills: [
      { id: "mahito_1", name: "무위전변", type: "ATTACK", description: "영혼을 직접 건드려 공격", effect: { type: "TRUE_DAMAGE", value: 100 } },
      { id: "mahito_2", name: "형태 변화", type: "DEFENSE", description: "자신의 영혼을 변형", effect: { type: "DODGE", chance: 55 } },
      { id: "mahito_3", name: "분신", type: "UTILITY", description: "작은 분신들을 생성", effect: { type: "CLONE", damage: 45, count: 2 } }
    ],
    ultimateSkill: { id: "mahito_ult", name: "자폐원둔리득체기 (自閉圓頓裹)", description: "영역 내 모든 존재의 영혼을 만질 수 있다", effect: { type: "DOMAIN", damage: 200, ignoreDefense: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "mei_mei",
    name: { ko: "메이메이", ja: "冥冥", en: "Mei Mei" },
    grade: "1급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("mei_mei", "메이메이", "RANGE"),
    baseStats: { atk: 16, def: 15, spd: 16, ce: 18, hp: 80 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "조의 송장", description: "까마귀에 120% 저주력을 실어 돌격", effect: { type: "SACRIFICE_ATTACK", damage: 260 } },
    basicSkills: [
      { id: "meimei_1", name: "흑조 조작", type: "ATTACK", description: "까마귀들을 조종하여 공격", effect: { type: "SUMMON_DAMAGE", value: 85 } },
      { id: "meimei_2", name: "도끼 공격", type: "ATTACK", description: "전투 도끼로 근접 공격", effect: { type: "DAMAGE", value: 105 } },
      { id: "meimei_3", name: "정찰", type: "UTILITY", description: "까마귀로 적의 약점 파악", effect: { type: "WEAKNESS_FIND", critRate: 35 } }
    ],
    ultimateSkill: { id: "meimei_ult", name: "조의 송장 (鳥の屍)", description: "까마귀에 120%의 저주력을 부여하여 돌격", effect: { type: "SACRIFICE_ATTACK", damage: 260 }, gaugeRequired: 100 },
    achievements: []
  },
  // ========================================
  // 신규 1급 캐릭터
  // ========================================
  {
    id: "dagon",
    name: { ko: "다곤", ja: "陀艮", en: "Dagon" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("dagon", "다곤", "CONVERT"),
    baseStats: { atk: 18, def: 18, spd: 14, ce: 22, hp: 92 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "사미세유도", description: "열대의 해변 영역전개, 필중 물고기떼", effect: { type: "DOMAIN", damage: 210 } },
    basicSkills: [
      { id: "dagon_1", name: "사도대해", type: "ATTACK", description: "바다의 저주력을 소환하여 공격", effect: { type: "DAMAGE", value: 110 } },
      { id: "dagon_2", name: "식신 물고기떼", type: "ATTACK", description: "무수한 식신 물고기로 공격", effect: { type: "MULTI_HIT", hits: 5, value: 25 } },
      { id: "dagon_3", name: "파도 방벽", type: "DEFENSE", description: "물의 벽으로 방어", effect: { type: "DAMAGE_REDUCE", value: 50 } }
    ],
    ultimateSkill: { id: "dagon_ult", name: "사미세유도 (蕩蘊平線)", description: "영역 내 필중의 물고기떼 공격", effect: { type: "DOMAIN", damage: 210 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "mechamaru",
    name: { ko: "메카마루 (무타 코키치)", ja: "与幸吉 (メカ丸)", en: "Mechamaru (Kokichi Muta)" },
    grade: "1급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("mechamaru", "메카마루", "RANGE"),
    baseStats: { atk: 19, def: 17, spd: 14, ce: 21, hp: 85 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "궁극 메카마루", description: "17년분 저주력을 모은 절대 병기", effect: { type: "TRANSFORM", damage: 220, defBonus: 50, duration: 3 } },
    basicSkills: [
      { id: "mecha_1", name: "저주력 포", type: "ATTACK", description: "인형 팔의 저주력 포격", effect: { type: "DAMAGE", value: 110 } },
      { id: "mecha_2", name: "실드", type: "DEFENSE", description: "기계 갑옷으로 방어", effect: { type: "DAMAGE_REDUCE", value: 50 } },
      { id: "mecha_3", name: "울트라 캐논", type: "ATTACK", description: "최대 출력 저주력 방출", effect: { type: "DAMAGE", value: 130 } }
    ],
    ultimateSkill: { id: "mecha_ult", name: "궁극 메카마루 (究極メカ丸)", description: "17년분 저주력을 모은 절대 병기로 변신", effect: { type: "TRANSFORM", damage: 220, defBonus: 50, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "miguel",
    name: { ko: "미겔", ja: "ミゲル", en: "Miguel" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("miguel", "미겔", "BODY"),
    baseStats: { atk: 20, def: 16, spd: 19, ce: 18, hp: 88 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "흑승포 최종격", description: "흑승포의 힘을 극대화한 일격", effect: { type: "DAMAGE", value: 240, ignoreBarrier: true } },
    basicSkills: [
      { id: "miguel_1", name: "흑승포 (黒縄)", type: "ATTACK", description: "무한을 상쇄하는 밧줄로 공격", effect: { type: "DAMAGE", value: 120, ignoreBarrier: true } },
      { id: "miguel_2", name: "체술", type: "ATTACK", description: "아프리카 전통 격투기", effect: { type: "DAMAGE", value: 100 } },
      { id: "miguel_3", name: "민첩한 회피", type: "DEFENSE", description: "빠른 몸놀림으로 회피", effect: { type: "DODGE", chance: 55 } }
    ],
    ultimateSkill: { id: "miguel_ult", name: "흑승포 최종격 (黒縄極)", description: "흑승포의 힘을 극대화, 무한도 상쇄", effect: { type: "DAMAGE", value: 240, ignoreBarrier: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "smallpox_deity",
    name: { ko: "포창신", ja: "疱瘡神", en: "Smallpox Deity" },
    grade: "1급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("smallpox_deity", "포창신", "CURSE"),
    baseStats: { atk: 16, def: 18, spd: 12, ce: 22, hp: 90 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "포창 영역", description: "관에 갇힌 자에게 3카운트 내 사형", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 230 } },
    basicSkills: [
      { id: "smallpox_1", name: "관 가두기", type: "UTILITY", description: "대상을 관에 가둔다", effect: { type: "STUN", duration: 1 } },
      { id: "smallpox_2", name: "포창", type: "ATTACK", description: "질병의 저주로 공격", effect: { type: "POISON_EXPLOSION", damage: 100, dotDamage: 30, duration: 2 } },
      { id: "smallpox_3", name: "저주 방벽", type: "DEFENSE", description: "질병의 기운으로 방어", effect: { type: "DAMAGE_REDUCE", value: 45 } }
    ],
    ultimateSkill: { id: "smallpox_ult", name: "포창 영역전개", description: "관에 갇힌 자에게 3카운트 내 사형 선고", effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 230 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "kurourushi",
    name: { ko: "쿠로우루시", ja: "黒漆", en: "Kurourushi" },
    grade: "1급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("kurourushi", "쿠로우루시", "CURSE"),
    baseStats: { atk: 18, def: 14, spd: 18, ce: 20, hp: 82 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "곤충 폭풍", description: "무한한 곤충 대군의 공격", effect: { type: "CONTINUOUS_DAMAGE", value: 70, duration: 3 } },
    basicSkills: [
      { id: "kuro_1", name: "곤충 대군", type: "ATTACK", description: "바퀴벌레 대군으로 공격", effect: { type: "AOE_DAMAGE", value: 90 } },
      { id: "kuro_2", name: "산예도", type: "ATTACK", description: "저주도구 산예도로 참격", effect: { type: "DAMAGE", value: 110 } },
      { id: "kuro_3", name: "군체 방어", type: "DEFENSE", description: "곤충으로 몸을 감싸 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } }
    ],
    ultimateSkill: { id: "kuro_ult", name: "곤충 폭풍 (蟲嵐)", description: "무한한 곤충 대군의 끝없는 공격", effect: { type: "CONTINUOUS_DAMAGE", value: 70, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "bansho",
    name: { ko: "만상", ja: "万象", en: "Banshō" },
    grade: "1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("bansho", "만상", "CONVERT"),
    baseStats: { atk: 17, def: 16, spd: 15, ce: 20, hp: 85 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "삼라만상", description: "만물을 지배하는 힘", effect: { type: "AOE_DAMAGE", value: 220 } },
    basicSkills: [
      { id: "bansho_1", name: "만물 조작", type: "ATTACK", description: "자연물을 조종하여 공격", effect: { type: "DAMAGE", value: 105 } },
      { id: "bansho_2", name: "물의 창", type: "ATTACK", description: "물을 창처럼 형성하여 공격", effect: { type: "DAMAGE", value: 100 } },
      { id: "bansho_3", name: "대지 방어", type: "DEFENSE", description: "대지를 융기시켜 방어", effect: { type: "DAMAGE_REDUCE", value: 50 } }
    ],
    ultimateSkill: { id: "bansho_ult", name: "삼라만상 (森羅万象)", description: "십종영법 식신, 만물을 지배하는 힘", effect: { type: "AOE_DAMAGE", value: 220 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "tsurugi_okkotsu",
    name: { ko: "옷코츠 츠루기", ja: "乙骨真剣", en: "Tsurugi Okkotsu" },
    grade: "1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("tsurugi_okkotsu", "옷코츠 츠루기", "BODY"),
    baseStats: { atk: 22, def: 14, spd: 23, ce: 0, hp: 85 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "리카 융합", description: "리카와 융합하여 초월적 힘을 발현", effect: { type: "TRANSFORM", damage: 200, atkBonus: 60, spdBonus: 40, duration: 3 } },
    basicSkills: [
      { id: "tsurugi_1", name: "검영류 발도", type: "ATTACK", description: "호노야기의 화염 발도술", effect: { type: "DAMAGE", value: 130, element: "FIRE" } },
      { id: "tsurugi_2", name: "초인적 반사", type: "DEFENSE", description: "천여체의 초인적 동체시력", effect: { type: "DODGE", chance: 65 } },
      { id: "tsurugi_3", name: "연속 참격", type: "ATTACK", description: "고속 연속 베기", effect: { type: "MULTI_HIT", hits: 3, value: 50 } }
    ],
    ultimateSkill: { id: "tsurugi_ult", name: "리카 융합 (里香融合)", description: "할아버지의 반지를 통해 리카와 융합", effect: { type: "TRANSFORM", damage: 200, atkBonus: 60, spdBonus: 40, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  }
];

// ========================================
// 준1급 캐릭터 (17명)
// 기존 11명 (마히토/메이메이 1급 승급) + 신규 5명 + 야가 이동
// ========================================

import type { CharacterCard } from '../../types';
import { getCharacterImage } from '../../utils/imageHelper';

export const SEMI_FIRST_GRADE: CharacterCard[] = [
  {
    id: "fushiguro_megumi",
    name: { ko: "후시구로 메구미", ja: "伏黒恵", en: "Fushiguro Megumi" },
    grade: "준1급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("fushiguro_megumi", "후시구로 메구미", "SOUL"),
    baseStats: { atk: 14, def: 15, spd: 17, ce: 19, hp: 80 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "질풍암영정", description: "그림자를 지배하는 영역전개", effect: { type: "DOMAIN", damage: 170, summonBoost: 50 } },
    basicSkills: [
      { id: "megumi_1", name: "옥견", type: "ATTACK", description: "신성한 개를 소환", effect: { type: "SUMMON_DAMAGE", value: 85 } },
      { id: "megumi_2", name: "대사", type: "ATTACK", description: "두꺼비를 소환", effect: { type: "DAMAGE", value: 95 } },
      { id: "megumi_3", name: "눌", type: "DEFENSE", description: "올빼미로 시야 차단", effect: { type: "DODGE", chance: 50 } }
    ],
    ultimateSkill: { id: "megumi_ult", name: "질풍암영정", description: "그림자를 지배하는 영역전개", effect: { type: "DOMAIN", damage: 170, summonBoost: 50 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "inumaki_toge",
    name: { ko: "이누마키 토게", ja: "狗巻棘", en: "Inumaki Toge" },
    grade: "준1급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("inumaki_toge", "이누마키 토게", "CURSE"),
    baseStats: { atk: 15, def: 13, spd: 16, ce: 21, hp: 77 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "죽어", description: "최강의 주언, 치명적 부작용", effect: { type: "INSTANT_DAMAGE", damage: 300, selfDamage: 60 } },
    basicSkills: [
      { id: "inumaki_1", name: "움직이지 마", type: "UTILITY", description: "상대의 움직임을 봉쇄", effect: { type: "STUN", duration: 1 } },
      { id: "inumaki_2", name: "도망쳐", type: "UTILITY", description: "상대를 강제로 물러나게 함", effect: { type: "KNOCKBACK" } },
      { id: "inumaki_3", name: "터져라", type: "ATTACK", description: "주언으로 폭발", effect: { type: "TRUE_DAMAGE", value: 90 } }
    ],
    ultimateSkill: { id: "inumaki_ult", name: "죽어", description: "최강의 주언, 치명적인 부작용 동반", effect: { type: "INSTANT_DAMAGE", damage: 300, selfDamage: 60 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "maki_zenin",
    name: { ko: "젠인 마키", ja: "禪院真希", en: "Maki Zenin" },
    grade: "준1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("maki_zenin", "젠인 마키", "BODY"),
    baseStats: { atk: 17, def: 15, spd: 18, ce: 5, hp: 82 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "연속 참격", description: "저주도구 연속 공격", effect: { type: "MULTI_HIT", hits: 5, value: 45 } },
    basicSkills: [
      { id: "maki_1", name: "창술", type: "ATTACK", description: "창을 이용한 공격", effect: { type: "DAMAGE", value: 95 } },
      { id: "maki_2", name: "저주도구 - 검", type: "ATTACK", description: "특급 검으로 참격", effect: { type: "DAMAGE", value: 100 } },
      { id: "maki_3", name: "회피", type: "DEFENSE", description: "민첩하게 회피", effect: { type: "DODGE", chance: 45 } }
    ],
    ultimateSkill: { id: "maki_ult", name: "연속 참격", description: "저주도구 연속 공격", effect: { type: "MULTI_HIT", hits: 5, value: 45 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "angel_hana",
    name: { ko: "천사/쿠루스 하나", ja: "天使/来栖華", en: "Angel/Hana Kurusu" },
    grade: "준1급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("angel_hana", "천사", "BARRIER"),
    baseStats: { atk: 15, def: 17, spd: 16, ce: 22, hp: 79 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "천사의 심판", description: "모든 술식과 저주를 정화", effect: { type: "SKILL_NULLIFY", damage: 200 } },
    basicSkills: [
      { id: "angel_1", name: "야곱의 사다리", type: "ATTACK", description: "빛의 기둥으로 공격", effect: { type: "DAMAGE", value: 105 } },
      { id: "angel_2", name: "술식 소멸", type: "UTILITY", description: "상대 술식 봉인", effect: { type: "SKILL_NULLIFY", duration: 2 } },
      { id: "angel_3", name: "비행", type: "DEFENSE", description: "날개로 회피", effect: { type: "DODGE", chance: 50 } }
    ],
    ultimateSkill: { id: "angel_ult", name: "천사의 심판", description: "모든 술식과 저주를 정화", effect: { type: "SKILL_NULLIFY", damage: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "reggie_star",
    name: { ko: "레지 스타", ja: "レジー・スター", en: "Reggie Star" },
    grade: "준1급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("reggie_star", "레지 스타", "RANGE"),
    baseStats: { atk: 16, def: 14, spd: 17, ce: 19, hp: 78 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "대량 소환", description: "모든 영수증으로 대규모 소환", effect: { type: "MULTI_SUMMON", damage: 220 } },
    basicSkills: [
      { id: "reggie_1", name: "영수증 소환", type: "ATTACK", description: "영수증으로 물체 소환", effect: { type: "SUMMON_DAMAGE", value: 90 } },
      { id: "reggie_2", name: "차량 소환", type: "ATTACK", description: "차량을 소환하여 충돌", effect: { type: "DAMAGE", value: 110 } },
      { id: "reggie_3", name: "칼 소환", type: "ATTACK", description: "다수의 칼을 소환", effect: { type: "MULTI_HIT", hits: 4, value: 30 } }
    ],
    ultimateSkill: { id: "reggie_ult", name: "대량 소환", description: "모든 영수증으로 대규모 소환", effect: { type: "MULTI_SUMMON", damage: 220 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "fumihiko_takaba",
    name: { ko: "타카바 후미히코", ja: "高羽史彦", en: "Fumihiko Takaba" },
    grade: "준1급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("fumihiko_takaba", "타카바 후미히코", "SOUL"),
    baseStats: { atk: 14, def: 18, spd: 15, ce: 20, hp: 83 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "코미디", description: "재밌으면 모든 것이 가능", effect: { type: "DAMAGE", value: 200 } },
    basicSkills: [
      { id: "takaba_1", name: "개그", type: "UTILITY", description: "랜덤 효과 발동", effect: { type: "HEAL", value: 50 } },
      { id: "takaba_2", name: "츳코미", type: "ATTACK", description: "도구로 타격", effect: { type: "DAMAGE", value: 85 } },
      { id: "takaba_3", name: "보케", type: "DEFENSE", description: "웃기면 무효화", effect: { type: "DAMAGE_REDUCE", value: 40 } }
    ],
    ultimateSkill: { id: "takaba_ult", name: "코미디", description: "재밌으면 모든 것이 가능", effect: { type: "DAMAGE", value: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "jinichi_zenin",
    name: { ko: "젠인 진이치", ja: "禪院甚壱", en: "Jinichi Zenin" },
    grade: "준1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("jinichi_zenin", "젠인 진이치", "BODY"),
    baseStats: { atk: 17, def: 16, spd: 15, ce: 16, hp: 85 },
    growthStats: { primary: "atk", secondary: "def" },
    skill: { name: "무궤도 타격", description: "예측 불가능한 연속 공격", effect: { type: "MULTI_HIT", hits: 4, value: 55 } },
    basicSkills: [
      { id: "jinichi_1", name: "미궤도", type: "ATTACK", description: "예측 불가 공격", effect: { type: "DAMAGE", value: 100 } },
      { id: "jinichi_2", name: "궤도 조작", type: "DEFENSE", description: "궤도를 바꿔 회피", effect: { type: "DODGE", chance: 45 } },
      { id: "jinichi_3", name: "연속 타격", type: "ATTACK", description: "빠른 연타", effect: { type: "MULTI_HIT", hits: 3, value: 40 } }
    ],
    ultimateSkill: { id: "jinichi_ult", name: "무궤도 타격", description: "예측 불가능한 연속 공격", effect: { type: "MULTI_HIT", hits: 4, value: 55 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "ogi_zenin",
    name: { ko: "젠인 오기", ja: "禪院扇", en: "Ogi Zenin" },
    grade: "준1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("ogi_zenin", "젠인 오기", "CONVERT"),
    baseStats: { atk: 18, def: 14, spd: 16, ce: 17, hp: 82 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "화염 검술 오의", description: "젠인가 비전 화염검술의 극의", effect: { type: "DAMAGE", value: 220, element: "FIRE" } },
    basicSkills: [
      { id: "ogi_1", name: "화참", type: "ATTACK", description: "불꽃을 두른 참격", effect: { type: "DAMAGE", value: 105, element: "FIRE" } },
      { id: "ogi_2", name: "검술", type: "ATTACK", description: "기본 검술", effect: { type: "DAMAGE", value: 95 } },
      { id: "ogi_3", name: "방어 태세", type: "DEFENSE", description: "검으로 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } }
    ],
    ultimateSkill: { id: "ogi_ult", name: "화염 검술 오의 (火焔剣)", description: "젠인가 비전 화염검술의 극의", effect: { type: "DAMAGE", value: 220, element: "FIRE" }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "noritoshi_kamo",
    name: { ko: "카모 노리토시", ja: "加茂憲紀", en: "Noritoshi Kamo" },
    grade: "준1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("noritoshi_kamo", "카모 노리토시", "CONVERT"),
    baseStats: { atk: 15, def: 14, spd: 17, ce: 18, hp: 78 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "유도 혈탄", description: "무한 분열 유도 공격", effect: { type: "MULTI_HIT", hits: 5, value: 40 } },
    basicSkills: [
      { id: "kamo_1", name: "적혈조작", type: "ATTACK", description: "피를 조작하여 공격", effect: { type: "DAMAGE", value: 90 } },
      { id: "kamo_2", name: "혈도", type: "UTILITY", description: "혈액으로 강화", effect: { type: "STAT_BOOST", atkBonus: 30 } },
      { id: "kamo_3", name: "궁도", type: "ATTACK", description: "활로 공격", effect: { type: "DAMAGE", value: 85 } }
    ],
    ultimateSkill: { id: "kamo_ult", name: "유도 혈탄", description: "무한 분열 유도 공격", effect: { type: "MULTI_HIT", hits: 5, value: 40 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "iori_hazenoki",
    name: { ko: "하제노키 이오리", ja: "波野木伊織", en: "Iori Hazenoki" },
    grade: "준1급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("iori_hazenoki", "하제노키 이오리", "RANGE"),
    baseStats: { atk: 16, def: 12, spd: 17, ce: 17, hp: 75 },
    growthStats: { primary: "atk", secondary: "spd" },
    skill: { name: "전신 폭발", description: "몸 전체를 폭탄으로 대폭발", effect: { type: "DAMAGE", value: 250, selfDamage: 50 } },
    basicSkills: [
      { id: "hazenoki_1", name: "폭발 - 이빨", type: "ATTACK", description: "이빨을 폭탄으로", effect: { type: "DAMAGE", value: 95 } },
      { id: "hazenoki_2", name: "폭발 - 눈알", type: "ATTACK", description: "눈알을 폭탄으로", effect: { type: "AOE_DAMAGE", value: 80 } },
      { id: "hazenoki_3", name: "자폭", type: "ATTACK", description: "일부 자폭 공격", effect: { type: "DAMAGE", value: 110, selfDamage: 20 } }
    ],
    ultimateSkill: { id: "hazenoki_ult", name: "전신 폭발", description: "몸 전체를 폭탄으로 대폭발", effect: { type: "DAMAGE", value: 250, selfDamage: 50 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "kusakabe_atsuya",
    name: { ko: "쿠사카베 아츠야", ja: "日下部篤也", en: "Atsuya Kusakabe" },
    grade: "준1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("kusakabe_atsuya", "쿠사카베 아츠야", "BODY"),
    baseStats: { atk: 16, def: 16, spd: 15, ce: 14, hp: 85 },
    growthStats: { primary: "def", secondary: "atk" },
    skill: { name: "신음류 오의", description: "간단한 영역 + 검술 결합", effect: { type: "DAMAGE", value: 200 } },
    basicSkills: [
      { id: "kusakabe_1", name: "간단한 영역", type: "DEFENSE", description: "간이 영역으로 방어", effect: { type: "DAMAGE_REDUCE", value: 55 } },
      { id: "kusakabe_2", name: "검술", type: "ATTACK", description: "기본 검술", effect: { type: "DAMAGE", value: 95 } },
      { id: "kusakabe_3", name: "발도", type: "ATTACK", description: "빠른 발도술", effect: { type: "CRITICAL_ATTACK", value: 100, critRate: 35 } }
    ],
    ultimateSkill: { id: "kusakabe_ult", name: "신음류 오의", description: "간단한 영역 + 검술 결합", effect: { type: "DAMAGE", value: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  // ========================================
  // 신규 준1급 캐릭터
  // ========================================
  {
    id: "ui_ui",
    name: { ko: "우이우이", ja: "憂憂", en: "Ui Ui" },
    grade: "준1급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("ui_ui", "우이우이", "BARRIER"),
    baseStats: { atk: 14, def: 14, spd: 18, ce: 21, hp: 75 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "연속 공간 전송", description: "연속으로 순간이동을 발동하여 교란", effect: { type: "SWAP_ATTACK", damage: 180, guaranteed_first: true } },
    basicSkills: [
      { id: "uiui_1", name: "공간 전송", type: "UTILITY", description: "대상을 순간이동시킨다", effect: { type: "SWAP_ATTACK", damage: 80, guaranteed_first: true } },
      { id: "uiui_2", name: "결계 보조", type: "DEFENSE", description: "보조 결계로 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } },
      { id: "uiui_3", name: "저주력 공격", type: "ATTACK", description: "순수한 저주력으로 공격", effect: { type: "DAMAGE", value: 70 } }
    ],
    ultimateSkill: { id: "uiui_ult", name: "연속 공간 전송 (空間転送)", description: "신주쿠 결전 핵심 전술, 연속 순간이동", effect: { type: "SWAP_ATTACK", damage: 180, guaranteed_first: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "yuka_okkotsu",
    name: { ko: "옷코츠 유카", ja: "乙骨憂花", en: "Yuka Okkotsu" },
    grade: "준1급",
    attribute: "BODY",
    imageUrl: getCharacterImage("yuka_okkotsu", "옷코츠 유카", "BODY"),
    baseStats: { atk: 14, def: 13, spd: 18, ce: 17, hp: 74 },
    growthStats: { primary: "spd", secondary: "atk" },
    skill: { name: "광폭화", description: "생명의 마지막 불꽃, 한계를 초월", effect: { type: "STAT_BOOST", atkBonus: 60, spdBonus: 40, damage: 200 } },
    basicSkills: [
      { id: "yuka_1", name: "야수 발톱", type: "ATTACK", description: "주력으로 손톱을 발톱으로 변형", effect: { type: "DAMAGE", value: 95 } },
      { id: "yuka_2", name: "물어뜯기", type: "ATTACK", description: "비틀어 물어뜯는 근접 공격", effect: { type: "DAMAGE", value: 100 } },
      { id: "yuka_3", name: "회피", type: "DEFENSE", description: "민첩하게 회피", effect: { type: "DODGE", chance: 50 } }
    ],
    ultimateSkill: { id: "yuka_ult", name: "광폭화 (狂暴化)", description: "여명 6개월의 마지막 불꽃, 한계 초월", effect: { type: "STAT_BOOST", atkBonus: 60, spdBonus: 40, damage: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "cross",
    name: { ko: "크로스", ja: "クロス", en: "Cross Val Vol Yelvori" },
    grade: "준1급",
    attribute: "CONVERT",
    imageUrl: getCharacterImage("cross", "크로스", "CONVERT"),
    baseStats: { atk: 18, def: 15, spd: 17, ce: 19, hp: 80 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "공존의 결의", description: "평화를 위한 최후의 전투", effect: { type: "DAMAGE", value: 220 } },
    basicSkills: [
      { id: "cross_1", name: "시무리아 주술", type: "ATTACK", description: "외계 주력을 이용한 공격", effect: { type: "DAMAGE", value: 100 } },
      { id: "cross_2", name: "전술 지휘", type: "UTILITY", description: "지휘 능력으로 아군 강화", effect: { type: "STAT_BOOST", atkBonus: 25 } },
      { id: "cross_3", name: "방어 태세", type: "DEFENSE", description: "전투 경험으로 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } }
    ],
    ultimateSkill: { id: "cross_ult", name: "공존의 결의 (共存決意)", description: "시무리아 파견 장교, 평화를 위한 최후의 전투", effect: { type: "DAMAGE", value: 220 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "marulu",
    name: { ko: "마루", ja: "マル", en: "Marulu Val Vol Yelvori" },
    grade: "준1급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("marulu", "마루", "BARRIER"),
    baseStats: { atk: 15, def: 16, spd: 16, ce: 23, hp: 79 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "혼돈과 조화", description: "혼돈과 조화를 동시에 발동하여 현실을 왜곡", effect: { type: "DOMAIN", damage: 200 } },
    basicSkills: [
      { id: "marulu_1", name: "혼돈 (Chaos)", type: "ATTACK", description: "물질의 상태를 변경하여 공격", effect: { type: "TRUE_DAMAGE", value: 90 } },
      { id: "marulu_2", name: "조화 (Harmony)", type: "DEFENSE", description: "조화의 힘으로 방어", effect: { type: "DAMAGE_REDUCE", value: 55 } },
      { id: "marulu_3", name: "중력 전환", type: "UTILITY", description: "중력의 방향을 바꾸어 교란", effect: { type: "SLOW", value: 35 } }
    ],
    ultimateSkill: { id: "marulu_ult", name: "혼돈과 조화 (混沌と調和)", description: "시무리아 주술사, 현실을 왜곡하는 영역", effect: { type: "DOMAIN", damage: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "usami",
    name: { ko: "우사미", ja: "宇佐美", en: "Usami" },
    grade: "준1급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("usami", "우사미", "CURSE"),
    baseStats: { atk: 16, def: 14, spd: 16, ce: 21, hp: 79 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "대규모 주언", description: "다수의 대상을 동시에 주언으로 조종", effect: { type: "STUN", damage: 180, duration: 2 } },
    basicSkills: [
      { id: "usami_1", name: "주언 - 멈춰", type: "UTILITY", description: "주언으로 상대를 정지", effect: { type: "STUN", duration: 1 } },
      { id: "usami_2", name: "주언 - 부서져", type: "ATTACK", description: "주언으로 내부 파괴", effect: { type: "TRUE_DAMAGE", value: 90 } },
      { id: "usami_3", name: "주언 - 잠들어", type: "UTILITY", description: "주언으로 행동 봉쇄", effect: { type: "SLOW", value: 40 } }
    ],
    ultimateSkill: { id: "usami_ult", name: "대규모 주언 (呪言)", description: "다수의 대상을 동시에 주언으로 조종", effect: { type: "STUN", damage: 180, duration: 2 }, gaugeRequired: 100 },
    achievements: []
  },
  // ========================================
  // 3급 → 준1급 승급 (자율 인형술이 특급 상당)
  // ========================================
  {
    id: "masamichi_yaga",
    name: { ko: "야가 마사미치", ja: "夜蛾正道", en: "Masamichi Yaga" },
    grade: "준1급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("masamichi_yaga", "야가 마사미치", "SOUL"),
    baseStats: { atk: 16, def: 15, spd: 14, ce: 18, hp: 85 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "자율 인형술", description: "자아를 가진 인형 군단, 특급 상당 술식", effect: { type: "MULTI_SUMMON", damage: 200 } },
    basicSkills: [
      { id: "yaga_1", name: "저주 인형 소환", type: "ATTACK", description: "인형을 소환하여 공격", effect: { type: "SUMMON_DAMAGE", value: 85 } },
      { id: "yaga_2", name: "인형 방어", type: "DEFENSE", description: "인형으로 방어", effect: { type: "DAMAGE_REDUCE", value: 45 } },
      { id: "yaga_3", name: "다중 소환", type: "ATTACK", description: "여러 인형 소환", effect: { type: "MULTI_HIT", hits: 3, value: 35 } }
    ],
    ultimateSkill: { id: "yaga_ult", name: "자율 인형술 (自立人形術)", description: "자아를 가진 인형 군단, 판다의 창조자", effect: { type: "MULTI_SUMMON", damage: 200 }, gaugeRequired: 100 },
    achievements: []
  }
];

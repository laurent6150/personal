// ========================================
// 준1급 캐릭터 (14명)
// ========================================

import type { CharacterCard } from '../../types';
import { getCharacterImage } from '../../utils/imageHelper';

export const SEMI_FIRST_GRADE: CharacterCard[] = [
  {
    id: "fushiguro_megumi",
    name: { ko: "후시구로 메구미", ja: "伏黒恵", en: "Fushiguro Megumi" },
    grade: "준1급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("fushiguro_megumi", "후시구로 메구미", "RANGE"),
    baseStats: { atk: 16, def: 15, spd: 17, ce: 19, hp: 82 },
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
    id: "mahito",
    name: { ko: "마히토", ja: "真人", en: "Mahito" },
    grade: "준1급",
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
    ultimateSkill: { id: "mahito_ult", name: "자폐원둔리득체기", description: "영역 내 모든 존재의 영혼을 만질 수 있다", effect: { type: "DOMAIN", damage: 200, ignoreDefense: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "mei_mei",
    name: { ko: "메이메이", ja: "冥冥", en: "Mei Mei" },
    grade: "준1급",
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
    ultimateSkill: { id: "meimei_ult", name: "조의 송장", description: "까마귀에 120%의 저주력을 부여하여 돌격", effect: { type: "SACRIFICE_ATTACK", damage: 260 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "inumaki_toge",
    name: { ko: "이누마키 토게", ja: "狗巻棘", en: "Inumaki Toge" },
    grade: "준1급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("inumaki_toge", "이누마키 토게", "CURSE"),
    baseStats: { atk: 14, def: 13, spd: 16, ce: 21, hp: 75 },
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
    baseStats: { atk: 15, def: 17, spd: 16, ce: 22, hp: 78 },
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
    baseStats: { atk: 14, def: 18, spd: 15, ce: 23, hp: 85 },
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
    id: "charles_bernard",
    name: { ko: "찰스 버나드", ja: "シャルル", en: "Charles Bernard" },
    grade: "준1급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("charles_bernard", "찰스 버나드", "RANGE"),
    baseStats: { atk: 15, def: 13, spd: 18, ce: 18, hp: 75 },
    growthStats: { primary: "spd", secondary: "ce" },
    skill: { name: "아우터", description: "상대의 미래를 조작", effect: { type: "STUN", damage: 180, duration: 1 } },
    basicSkills: [
      { id: "charles_1", name: "G펜 찌르기", type: "ATTACK", description: "펜으로 공격", effect: { type: "DAMAGE", value: 90 } },
      { id: "charles_2", name: "미래 예지", type: "DEFENSE", description: "미래를 보고 회피", effect: { type: "DODGE", chance: 50 } },
      { id: "charles_3", name: "만화 그리기", type: "ATTACK", description: "만화로 공격 생성", effect: { type: "DAMAGE", value: 95 } }
    ],
    ultimateSkill: { id: "charles_ult", name: "아우터", description: "상대의 미래를 조작", effect: { type: "STUN", damage: 180, duration: 1 }, gaugeRequired: 100 },
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
    skill: { name: "비검 - 낙화", description: "젠인가 비전 화염검술", effect: { type: "DAMAGE", value: 220, element: "FIRE" } },
    basicSkills: [
      { id: "ogi_1", name: "화참", type: "ATTACK", description: "불꽃을 두른 참격", effect: { type: "DAMAGE", value: 105, element: "FIRE" } },
      { id: "ogi_2", name: "검술", type: "ATTACK", description: "기본 검술", effect: { type: "DAMAGE", value: 95 } },
      { id: "ogi_3", name: "방어 태세", type: "DEFENSE", description: "검으로 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } }
    ],
    ultimateSkill: { id: "ogi_ult", name: "비검 - 낙화", description: "젠인가 비전 화염검술", effect: { type: "DAMAGE", value: 220, element: "FIRE" }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "noritoshi_kamo",
    name: { ko: "카모 노리토시", ja: "加茂憲紀", en: "Noritoshi Kamo" },
    grade: "준1급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("noritoshi_kamo", "카모 노리토시", "CURSE"),
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
      { id: "kusakabe_1", name: "간단한 영역", type: "DEFENSE", description: "간이 영역으로 방어", effect: { type: "DAMAGE_REDUCE", value: 70 } },
      { id: "kusakabe_2", name: "검술", type: "ATTACK", description: "기본 검술", effect: { type: "DAMAGE", value: 95 } },
      { id: "kusakabe_3", name: "발도", type: "ATTACK", description: "빠른 발도술", effect: { type: "CRITICAL_ATTACK", value: 100, critRate: 35 } }
    ],
    ultimateSkill: { id: "kusakabe_ult", name: "신음류 오의", description: "간단한 영역 + 검술 결합", effect: { type: "DAMAGE", value: 200 }, gaugeRequired: 100 },
    achievements: []
  }
];

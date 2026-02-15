// ========================================
// 2급 캐릭터 (12명) - 기존 10명 + 신규 2명
// ========================================

import type { CharacterCard } from '../../types';
import { getCharacterImage } from '../../utils/imageHelper';

export const SECOND_GRADE: CharacterCard[] = [
  {
    id: "kugisaki_nobara",
    name: { ko: "쿠기사키 노바라", ja: "釘崎野薔薇", en: "Kugisaki Nobara" },
    grade: "2급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("kugisaki_nobara", "쿠기사키 노바라", "RANGE"),
    baseStats: { atk: 15, def: 13, spd: 15, ce: 17, hp: 75 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "흑섬 공명", description: "흑섬과 공명의 결합", effect: { type: "REFLECT_DAMAGE", reflectPercent: 50, damage: 200 } },
    basicSkills: [
      { id: "nobara_1", name: "공진", type: "ATTACK", description: "못과 망치로 저주력을 공진", effect: { type: "DAMAGE", value: 85 } },
      { id: "nobara_2", name: "간모", type: "ATTACK", description: "짚인형을 통한 원거리 공격", effect: { type: "TRUE_DAMAGE", value: 70 } },
      { id: "nobara_3", name: "화공", type: "ATTACK", description: "저주력을 담은 못을 연사", effect: { type: "MULTI_HIT", hits: 4, value: 25 } }
    ],
    ultimateSkill: { id: "nobara_ult", name: "흑섬 공명", description: "흑섬과 공명의 결합", effect: { type: "REFLECT_DAMAGE", reflectPercent: 50, damage: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "panda",
    name: { ko: "판다", ja: "パンダ", en: "Panda" },
    grade: "2급",
    attribute: "BODY",
    imageUrl: getCharacterImage("panda", "판다", "BODY"),
    baseStats: { atk: 16, def: 15, spd: 14, ce: 15, hp: 82 },
    growthStats: { primary: "def", secondary: "atk" },
    skill: { name: "자매 핵 해방", description: "세 번째 핵의 힘", effect: { type: "TRANSFORM", damage: 200, defBonus: 40, atkBonus: 30 } },
    basicSkills: [
      { id: "panda_1", name: "펀치", type: "ATTACK", description: "강력한 주먹 공격", effect: { type: "DAMAGE", value: 90 } },
      { id: "panda_2", name: "고릴라 모드", type: "ATTACK", description: "고릴라 핵으로 전환", effect: { type: "DAMAGE", value: 120, selfDefReduce: 20 } },
      { id: "panda_3", name: "핵 전환", type: "UTILITY", description: "핵을 전환하여 회복", effect: { type: "HEAL", value: 40 } }
    ],
    ultimateSkill: { id: "panda_ult", name: "자매 핵 해방", description: "숨겨진 세 번째 핵의 힘", effect: { type: "TRANSFORM", damage: 200, defBonus: 40, atkBonus: 30 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "ino_takuma",
    name: { ko: "이노 타쿠마", ja: "猪野琢真", en: "Ino Takuma" },
    grade: "2급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("ino_takuma", "이노 타쿠마", "CURSE"),
    baseStats: { atk: 14, def: 14, spd: 15, ce: 17, hp: 78 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "여제례", description: "모든 가마사 동시 강림", effect: { type: "MULTI_SUMMON", damage: 180 } },
    basicSkills: [
      { id: "ino_1", name: "가마사 - 용어", type: "ATTACK", description: "물고기를 소환하여 공격", effect: { type: "SUMMON_DAMAGE", value: 80 } },
      { id: "ino_2", name: "가마사 - 수호", type: "DEFENSE", description: "소환물로 방어", effect: { type: "DAMAGE_REDUCE", value: 45 } },
      { id: "ino_3", name: "가마사 - 화염", type: "ATTACK", description: "화염 가마사", effect: { type: "DAMAGE", value: 85, element: "FIRE" } }
    ],
    ultimateSkill: { id: "ino_ult", name: "여제례", description: "모든 가마사를 동시에 소환", effect: { type: "MULTI_SUMMON", damage: 180 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "nishimiya_momo",
    name: { ko: "니시미야 모모", ja: "西宮桃", en: "Nishimiya Momo" },
    grade: "2급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("nishimiya_momo", "니시미야 모모", "RANGE"),
    baseStats: { atk: 12, def: 12, spd: 18, ce: 16, hp: 70 },
    growthStats: { primary: "spd", secondary: "ce" },
    skill: { name: "대선풍", description: "거대한 바람으로 광역 공격", effect: { type: "AOE_DAMAGE", damage: 150 } },
    basicSkills: [
      { id: "momo_1", name: "빗자루 공격", type: "ATTACK", description: "빗자루를 휘둘러 공격", effect: { type: "DAMAGE", value: 70 } },
      { id: "momo_2", name: "바람 조작", type: "ATTACK", description: "바람을 일으켜 공격", effect: { type: "DAMAGE", value: 75 } },
      { id: "momo_3", name: "비행", type: "DEFENSE", description: "빗자루로 빠르게 회피", effect: { type: "DODGE", chance: 45 } }
    ],
    ultimateSkill: { id: "momo_ult", name: "대선풍", description: "강력한 바람을 일으켜 공격", effect: { type: "AOE_DAMAGE", damage: 150 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "kasumi_miwa",
    name: { ko: "미와 카스미", ja: "三輪霞", en: "Kasumi Miwa" },
    grade: "2급",
    attribute: "BODY",
    imageUrl: getCharacterImage("kasumi_miwa", "미와 카스미", "BODY"),
    baseStats: { atk: 13, def: 14, spd: 16, ce: 14, hp: 75 },
    growthStats: { primary: "spd", secondary: "def" },
    skill: { name: "신음류 - 발도술", description: "극한 집중력의 발도", effect: { type: "DAMAGE", value: 170, guaranteed_first: true } },
    basicSkills: [
      { id: "miwa_1", name: "신음류 - 발도", type: "ATTACK", description: "발도술 공격", effect: { type: "DAMAGE", value: 85 } },
      { id: "miwa_2", name: "간단한 영역", type: "DEFENSE", description: "간이 영역으로 방어", effect: { type: "DAMAGE_REDUCE", value: 50 } },
      { id: "miwa_3", name: "검격", type: "ATTACK", description: "기본 검술", effect: { type: "DAMAGE", value: 75 } }
    ],
    ultimateSkill: { id: "miwa_ult", name: "신음류 - 발도술", description: "극한 집중력의 발도", effect: { type: "DAMAGE", value: 170, guaranteed_first: true }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "mai_zenin",
    name: { ko: "젠인 마이", ja: "禪院真依", en: "Mai Zenin" },
    grade: "2급",
    attribute: "RANGE",
    imageUrl: getCharacterImage("mai_zenin", "젠인 마이", "RANGE"),
    baseStats: { atk: 14, def: 12, spd: 15, ce: 16, hp: 72 },
    growthStats: { primary: "atk", secondary: "ce" },
    skill: { name: "구축 (構築術式)", description: "생명을 대가로 창조", effect: { type: "DAMAGE", value: 200, selfDamage: 40 } },
    basicSkills: [
      { id: "mai_1", name: "사격", type: "ATTACK", description: "총으로 사격", effect: { type: "DAMAGE", value: 80 } },
      { id: "mai_2", name: "저주력 탄환", type: "ATTACK", description: "저주력 탄환 발사", effect: { type: "DAMAGE", value: 90 } },
      { id: "mai_3", name: "구축 - 탄환", type: "ATTACK", description: "탄환을 구축", effect: { type: "TRUE_DAMAGE", value: 85 } }
    ],
    ultimateSkill: { id: "mai_ult", name: "구축 (構築術式)", description: "생명을 대가로 창조", effect: { type: "DAMAGE", value: 200, selfDamage: 40 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "eso",
    name: { ko: "에소", ja: "壊相", en: "Eso" },
    grade: "2급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("eso", "에소", "CURSE"),
    baseStats: { atk: 15, def: 13, spd: 14, ce: 17, hp: 78 },
    growthStats: { primary: "ce", secondary: "atk" },
    skill: { name: "독혈 극대", description: "최대 농도 독혈 방출", effect: { type: "POISON_EXPLOSION", damage: 160, dotDamage: 40, duration: 3 } },
    basicSkills: [
      { id: "eso_1", name: "비익", type: "ATTACK", description: "날개로 공격", effect: { type: "DAMAGE", value: 85 } },
      { id: "eso_2", name: "독혈 살포", type: "ATTACK", description: "독혈을 뿌림", effect: { type: "AOE_DAMAGE", value: 70 } },
      { id: "eso_3", name: "비행", type: "DEFENSE", description: "날개로 회피", effect: { type: "DODGE", chance: 40 } }
    ],
    ultimateSkill: { id: "eso_ult", name: "독혈 극대 (蝕爛腐術)", description: "비익의 날개에서 최대 농도 독혈 방출", effect: { type: "POISON_EXPLOSION", damage: 160, dotDamage: 40, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "kechizu",
    name: { ko: "케치즈", ja: "血塗", en: "Kechizu" },
    grade: "2급",
    attribute: "CURSE",
    imageUrl: getCharacterImage("kechizu", "케치즈", "CURSE"),
    baseStats: { atk: 14, def: 14, spd: 13, ce: 16, hp: 80 },
    growthStats: { primary: "def", secondary: "ce" },
    skill: { name: "부식의 피", description: "모든 것을 부식시키는 극독", effect: { type: "DAMAGE", value: 150 } },
    basicSkills: [
      { id: "kechizu_1", name: "독혈 토출", type: "ATTACK", description: "독혈을 뱉음", effect: { type: "DAMAGE", value: 80 } },
      { id: "kechizu_2", name: "독혈 폭발", type: "ATTACK", description: "독혈 폭발", effect: { type: "AOE_DAMAGE", value: 75 } },
      { id: "kechizu_3", name: "재생", type: "UTILITY", description: "재생 능력", effect: { type: "HEAL", value: 35 } }
    ],
    ultimateSkill: { id: "kechizu_ult", name: "부식의 피", description: "모든 것을 부식시키는 극독", effect: { type: "DAMAGE", value: 150 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "utahime_iori",
    name: { ko: "이오리 우타히메", ja: "庵歌姫", en: "Utahime Iori" },
    grade: "2급",
    attribute: "BARRIER",
    imageUrl: getCharacterImage("utahime_iori", "이오리 우타히메", "BARRIER"),
    baseStats: { atk: 12, def: 15, spd: 13, ce: 19, hp: 75 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "솔로 금지", description: "모든 아군 대폭 강화", effect: { type: "STAT_BOOST", atkBonus: 50, defBonus: 50 } },
    basicSkills: [
      { id: "utahime_1", name: "단독금지", type: "UTILITY", description: "아군 강화", effect: { type: "STAT_BOOST", atkBonus: 25, defBonus: 25 } },
      { id: "utahime_2", name: "결계술", type: "DEFENSE", description: "결계로 방어", effect: { type: "DAMAGE_REDUCE", value: 45 } },
      { id: "utahime_3", name: "저주력 증폭", type: "UTILITY", description: "저주력 증폭", effect: { type: "CHARGE", gaugeBonus: 30 } }
    ],
    ultimateSkill: { id: "utahime_ult", name: "솔로 금지", description: "모든 아군 대폭 강화", effect: { type: "STAT_BOOST", atkBonus: 50, defBonus: 50 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "shoko_ieiri",
    name: { ko: "이에이리 쇼코", ja: "家入硝子", en: "Shoko Ieiri" },
    grade: "2급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("shoko_ieiri", "이에이리 쇼코", "SOUL"),
    baseStats: { atk: 10, def: 14, spd: 12, ce: 20, hp: 80 },
    growthStats: { primary: "ce", secondary: "hp" },
    skill: { name: "완전 소생", description: "치명상도 완전 회복", effect: { type: "HEAL", value: 200 } },
    basicSkills: [
      { id: "shoko_1", name: "반전술식 - 치료", type: "UTILITY", description: "부상을 치료", effect: { type: "HEAL", value: 60 } },
      { id: "shoko_2", name: "반전술식 - 재생", type: "UTILITY", description: "지속 회복", effect: { type: "HEAL", value: 40 } },
      { id: "shoko_3", name: "저주력 공격", type: "ATTACK", description: "저주력으로 공격", effect: { type: "DAMAGE", value: 60 } }
    ],
    ultimateSkill: { id: "shoko_ult", name: "완전 소생", description: "치명상도 완전 회복", effect: { type: "HEAL", value: 200 }, gaugeRequired: 100 },
    achievements: []
  },
  // ========================================
  // 신규 2급 캐릭터
  // ========================================
  {
    id: "granny_ogami",
    name: { ko: "오가미 할멈", ja: "尾神婆", en: "Granny Ogami" },
    grade: "2급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("granny_ogami", "오가미 할멈", "SOUL"),
    baseStats: { atk: 10, def: 13, spd: 11, ce: 19, hp: 75 },
    growthStats: { primary: "ce", secondary: "def" },
    skill: { name: "완전 강신", description: "사망한 강자의 힘을 완전히 강림", effect: { type: "TRANSFORM", damage: 180, atkBonus: 60, spdBonus: 40, duration: 3 } },
    basicSkills: [
      { id: "ogami_1", name: "강신술 (降神術)", type: "UTILITY", description: "죽은 자의 육체 정보를 부여", effect: { type: "STAT_BOOST", atkBonus: 40 } },
      { id: "ogami_2", name: "저주 방어", type: "DEFENSE", description: "저주의 힘으로 방어", effect: { type: "DAMAGE_REDUCE", value: 40 } },
      { id: "ogami_3", name: "저주력 공격", type: "ATTACK", description: "순수 저주력으로 공격", effect: { type: "DAMAGE", value: 65 } }
    ],
    ultimateSkill: { id: "ogami_ult", name: "완전 강신 (完全降神)", description: "시부야에서 토지의 육체를 강림시킨 술식", effect: { type: "TRANSFORM", damage: 180, atkBonus: 60, spdBonus: 40, duration: 3 }, gaugeRequired: 100 },
    achievements: []
  },
  {
    id: "charles_bernard",
    name: { ko: "찰스 버나드", ja: "チャールズ・バーナード", en: "Charles Bernard" },
    grade: "2급",
    attribute: "SOUL",
    imageUrl: getCharacterImage("charles_bernard", "찰스 버나드", "SOUL"),
    baseStats: { atk: 14, def: 12, spd: 16, ce: 17, hp: 75 },
    growthStats: { primary: "ce", secondary: "spd" },
    skill: { name: "운명의 만화", description: "미래를 완전히 그려내어 극대화", effect: { type: "STAT_BOOST", atkBonus: 40, spdBonus: 40, damage: 160 } },
    basicSkills: [
      { id: "charles_1", name: "미래 예지", type: "DEFENSE", description: "1동작 앞의 미래를 예측", effect: { type: "DODGE", chance: 45 } },
      { id: "charles_2", name: "G펜 공격", type: "ATTACK", description: "G펜을 이용한 공격", effect: { type: "DAMAGE", value: 80 } },
      { id: "charles_3", name: "만화 그리기", type: "UTILITY", description: "그림으로 미래를 시각화", effect: { type: "WEAKNESS_FIND", critRate: 30 } }
    ],
    ultimateSkill: { id: "charles_ult", name: "운명의 만화 (漫画)", description: "미래를 완전히 그려내어 회피와 공격 극대화", effect: { type: "STAT_BOOST", atkBonus: 40, spdBonus: 40, damage: 160 }, gaugeRequired: 100 },
    achievements: []
  }
];

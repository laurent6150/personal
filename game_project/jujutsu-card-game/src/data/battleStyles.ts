// ========================================
// 전투 성향 시스템 (Phase 5)
// 6종 전투 성향 및 상성 관계
// ========================================

import type { BattleStyle, Stats } from '../types';
import {
  BATTLE_STYLE_INFO,
  STYLE_ADVANTAGE,
  STYLE_ADVANTAGE_BONUS,
  STYLE_DISADVANTAGE_PENALTY
} from '../types';

// ========================================
// 상성 계산
// ========================================

/**
 * 공격자가 방어자에 대해 유리한지 확인
 */
export function hasStyleAdvantage(attackerStyle: BattleStyle, defenderStyle: BattleStyle): boolean {
  // 균형형은 상성 없음
  if (attackerStyle === 'BALANCED' || defenderStyle === 'BALANCED') {
    return false;
  }
  return STYLE_ADVANTAGE[attackerStyle] === defenderStyle;
}

/**
 * 공격자가 방어자에 대해 불리한지 확인
 */
export function hasStyleDisadvantage(attackerStyle: BattleStyle, defenderStyle: BattleStyle): boolean {
  // 균형형은 상성 없음
  if (attackerStyle === 'BALANCED' || defenderStyle === 'BALANCED') {
    return false;
  }
  return STYLE_ADVANTAGE[defenderStyle] === attackerStyle;
}

/**
 * 전투 성향 상성 배율 계산
 */
export function getStyleMultiplier(attackerStyle: BattleStyle, defenderStyle: BattleStyle): number {
  if (hasStyleAdvantage(attackerStyle, defenderStyle)) {
    return 1 + STYLE_ADVANTAGE_BONUS;  // +8%
  }
  if (hasStyleDisadvantage(attackerStyle, defenderStyle)) {
    return 1 - STYLE_DISADVANTAGE_PENALTY;  // -8%
  }
  return 1.0;
}

// ========================================
// 캐릭터 전투 성향 배정
// ========================================

// 캐릭터 ID별 전투 성향 매핑
// 스탯 분포 기반으로 배정
export const CHARACTER_BATTLE_STYLES: Record<string, BattleStyle> = {
  // ===== 특급 =====
  gojo_satoru: 'BALANCED',       // 균형형 - 모든 면에서 최강
  ryomen_sukuna: 'AGGRESSIVE',   // 공격형 - 강력한 공격
  yuta_okkotsu: 'CURSED',        // 저주형 - 리카와 함께
  geto_suguru: 'CURSED',         // 저주형 - 저주 조작
  kenjaku: 'TECHNICAL',          // 기술형 - 전략적

  // ===== 1급 =====
  fushiguro_toji: 'SPEED',       // 속공형 - 빠른 암살
  nanami_kento: 'TECHNICAL',     // 기술형 - 7:3
  todo_aoi: 'AGGRESSIVE',        // 공격형 - 파워
  mei_mei: 'TECHNICAL',          // 기술형 - 까마귀 조종
  yuki_tsukumo: 'BALANCED',      // 균형형 - 특급 실력
  choso: 'CURSED',               // 저주형 - 혈액 조작
  naobito_zenin: 'SPEED',        // 속공형 - 투사
  hajime_kashimo: 'AGGRESSIVE',  // 공격형 - 번개
  yorozu: 'TECHNICAL',           // 기술형 - 변환
  uraume: 'DEFENSIVE',           // 수비형 - 얼음
  jogo: 'AGGRESSIVE',            // 공격형 - 화염
  hanami: 'DEFENSIVE',           // 수비형 - 식물
  dagon: 'CURSED',               // 저주형 - 바다
  mahito: 'CURSED',              // 저주형 - 영혼
  takuma_ino: 'BALANCED',        // 균형형
  kusakabe: 'TECHNICAL',         // 기술형 - 검술

  // ===== 준1급 =====
  itadori_yuji: 'SPEED',         // 속공형 - 빠른 타격
  fushiguro_megumi: 'BALANCED',  // 균형형 - 식신
  kugisaki_nobara: 'TECHNICAL',  // 기술형 - 공명
  maki_zenin: 'AGGRESSIVE',      // 공격형 - 신체 강화
  inumaki_toge: 'CURSED',        // 저주형 - 주언
  panda: 'DEFENSIVE',            // 수비형 - 고릴라 모드
  kokichi_muta: 'TECHNICAL',     // 기술형 - 메카마루
  kinji_hakari: 'AGGRESSIVE',    // 공격형 - 도박
  kirara_hoshi: 'TECHNICAL',     // 기술형 - 별자리
  ryu_ishigori: 'AGGRESSIVE',    // 공격형 - 출력
  takako_uro: 'SPEED',           // 속공형 - 하늘
  hiromi_higuruma: 'TECHNICAL',  // 기술형 - 법정
  angel: 'BALANCED',             // 균형형 - 천사

  // ===== 2급 =====
  miwa_kasumi: 'SPEED',          // 속공형 - 신간류
  nishimiya_momo: 'TECHNICAL',   // 기술형 - 빗자루
  kamo_noritoshi: 'TECHNICAL',   // 기술형 - 적조
  mai_zenin: 'DEFENSIVE',        // 수비형 - 총기
  momo_nishimiya: 'TECHNICAL',   // 기술형
  mechamaru_ultimate: 'DEFENSIVE', // 수비형 - 메카
  arata_nitta: 'DEFENSIVE',      // 수비형 - 치료
  atsuya_kusakabe: 'TECHNICAL',  // 기술형
  yoshinobu_gakuganji: 'BALANCED', // 균형형 - 학장
  shoko_ieiri: 'DEFENSIVE',      // 수비형 - 치료
  junpei_yoshino: 'CURSED',      // 저주형
  ogami: 'CURSED',               // 저주형 - 강령

  // ===== 3급 =====
  ijichi: 'DEFENSIVE',           // 수비형 - 지원
  nitta: 'DEFENSIVE',            // 수비형
  utahime_iori: 'TECHNICAL',     // 기술형 - 독창
  aoi_todo_student: 'AGGRESSIVE', // 공격형
  toge_inumaki_child: 'CURSED',  // 저주형
  yuji_child: 'SPEED',           // 속공형
  megumi_child: 'BALANCED',      // 균형형
  nobara_child: 'TECHNICAL',     // 기술형
};

// 기본 전투 성향 (매핑에 없는 경우)
const DEFAULT_BATTLE_STYLE: BattleStyle = 'BALANCED';

/**
 * 캐릭터 ID로 전투 성향 가져오기
 */
export function getCharacterBattleStyle(characterId: string): BattleStyle {
  return CHARACTER_BATTLE_STYLES[characterId] || DEFAULT_BATTLE_STYLE;
}

/**
 * 스탯 기반 전투 성향 추론
 * (매핑에 없는 경우 폴백용)
 */
export function inferBattleStyleFromStats(stats: Stats): BattleStyle {
  const { atk, def, spd, ce } = stats;

  // 가장 높은 스탯 찾기
  const maxStat = Math.max(atk, def, spd, ce);

  if (atk === maxStat && atk > def * 1.2) {
    return 'AGGRESSIVE';
  }
  if (def === maxStat && def > atk * 1.2) {
    return 'DEFENSIVE';
  }
  if (spd === maxStat && spd > def * 1.1) {
    return 'SPEED';
  }
  if (ce === maxStat && ce > atk * 1.1) {
    return 'CURSED';
  }

  // 기술 스탯(tec)이 높으면
  if (stats.tec && stats.tec > 15) {
    return 'TECHNICAL';
  }

  return 'BALANCED';
}

// ========================================
// 전투 성향 정보 헬퍼
// ========================================

/**
 * 전투 성향 라벨 가져오기
 */
export function getBattleStyleLabel(style: BattleStyle): string {
  return BATTLE_STYLE_INFO[style].label;
}

/**
 * 전투 성향 아이콘 가져오기
 */
export function getBattleStyleIcon(style: BattleStyle): string {
  return BATTLE_STYLE_INFO[style].icon;
}

/**
 * 전투 성향 설명 가져오기
 */
export function getBattleStyleDescription(style: BattleStyle): string {
  return BATTLE_STYLE_INFO[style].description;
}

/**
 * 상성 관계 설명 생성
 */
export function getStyleMatchupDescription(
  attackerStyle: BattleStyle,
  defenderStyle: BattleStyle
): string {
  if (hasStyleAdvantage(attackerStyle, defenderStyle)) {
    return `${getBattleStyleLabel(attackerStyle)}이(가) ${getBattleStyleLabel(defenderStyle)}에 유리! (+${STYLE_ADVANTAGE_BONUS * 100}%)`;
  }
  if (hasStyleDisadvantage(attackerStyle, defenderStyle)) {
    return `${getBattleStyleLabel(attackerStyle)}이(가) ${getBattleStyleLabel(defenderStyle)}에 불리! (-${STYLE_DISADVANTAGE_PENALTY * 100}%)`;
  }
  return '상성 중립';
}

// ========================================
// 전투 성향 상성표 UI 데이터
// ========================================

export interface StyleMatchup {
  attackerStyle: BattleStyle;
  defenderStyle: BattleStyle;
  advantage: 'WIN' | 'LOSE' | 'NEUTRAL';
  modifier: number;
}

/**
 * 모든 상성 조합 생성
 */
export function getAllStyleMatchups(): StyleMatchup[] {
  const styles: BattleStyle[] = ['AGGRESSIVE', 'DEFENSIVE', 'TECHNICAL', 'CURSED', 'SPEED', 'BALANCED'];
  const matchups: StyleMatchup[] = [];

  for (const attacker of styles) {
    for (const defender of styles) {
      let advantage: 'WIN' | 'LOSE' | 'NEUTRAL' = 'NEUTRAL';
      let modifier = 1.0;

      if (hasStyleAdvantage(attacker, defender)) {
        advantage = 'WIN';
        modifier = 1 + STYLE_ADVANTAGE_BONUS;
      } else if (hasStyleDisadvantage(attacker, defender)) {
        advantage = 'LOSE';
        modifier = 1 - STYLE_DISADVANTAGE_PENALTY;
      }

      matchups.push({
        attackerStyle: attacker,
        defenderStyle: defender,
        advantage,
        modifier,
      });
    }
  }

  return matchups;
}

/**
 * 특정 성향의 유리/불리 목록 가져오기
 */
export function getStyleAdvantages(style: BattleStyle): {
  strongAgainst: BattleStyle[];
  weakAgainst: BattleStyle[];
} {
  const styles: BattleStyle[] = ['AGGRESSIVE', 'DEFENSIVE', 'TECHNICAL', 'CURSED', 'SPEED', 'BALANCED'];

  const strongAgainst = styles.filter(s => hasStyleAdvantage(style, s));
  const weakAgainst = styles.filter(s => hasStyleDisadvantage(style, s));

  return { strongAgainst, weakAgainst };
}

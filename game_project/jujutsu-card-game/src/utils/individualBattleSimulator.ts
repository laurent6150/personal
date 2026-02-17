// ═══════════════════════════════════════════════════════════
// 개인 리그 1:1 배틀 시뮬레이터
// Step 2: 턴제 전투 시뮬레이션 로직
// ═══════════════════════════════════════════════════════════

import type {
  Participant,
  SimBattleTurn,
  SimSetResult,
  BattleStats,
  ArenaEffect
} from '../types/individualLeague';
import { getArenaById } from '../data/arenaEffects';
import { CHARACTERS_BY_ID } from '../data/characters';
import type { CharacterCard, Attribute } from '../types';
import { getAttributeMultiplier as getAttrMultFromSystem } from './attributeSystem';

// ═══════════════════════════════════════════════════════════
// 헬퍼 함수
// ═══════════════════════════════════════════════════════════

function getCharacterById(id: string): CharacterCard | undefined {
  return CHARACTERS_BY_ID[id];
}

function calculateTotalStats(card: CharacterCard): number {
  const stats = card.baseStats;
  return (stats.atk || 0) + (stats.def || 0) + (stats.spd || 0) +
         (stats.ce || 0) + (stats.hp || 0);
}

/**
 * 속성 상성 배율 계산 (팀리그와 동일 로직 사용)
 * attributeSystem.ts의 getAttributeMultiplier를 그대로 사용
 */
function getAttributeMultiplier(attackerAttr: string, defenderAttr: string): number {
  return getAttrMultFromSystem(attackerAttr as Attribute, defenderAttr as Attribute);
}

// ═══════════════════════════════════════════════════════════
// 경기장 효과 적용
// ═══════════════════════════════════════════════════════════

export function applyArenaEffect(
  participant: Participant,
  arena: ArenaEffect | null
): BattleStats {
  const character = getCharacterById(participant.odId);

  // 기본 스탯 + 장비/레벨 보너스 적용
  const statBonus = participant.statBonus || {};

  const baseStats = {
    atk: (character?.baseStats?.atk || 50) + (statBonus.atk || 0),
    def: (character?.baseStats?.def || 50) + (statBonus.def || 0),
    spd: (character?.baseStats?.spd || 50) + (statBonus.spd || 0),
    ce: (character?.baseStats?.ce || 50) + (statBonus.ce || 0),
    hp: (character?.baseStats?.hp || 50) + (statBonus.hp || 0),
    crt: ((character?.baseStats as { crt?: number })?.crt || 50) + (statBonus.crt || 0),
    tec: ((character?.baseStats as { tec?: number })?.tec || 50) + (statBonus.tec || 0),
    mnt: ((character?.baseStats as { mnt?: number })?.mnt || 50) + (statBonus.mnt || 0),
    total: participant.totalStats || calculateTotalStats(character!),
  };

  let arenaBonus = 0;
  let arenaPenalty = 0;

  // 캐릭터 속성 가져오기
  const attribute = character?.attribute || '';

  if (arena) {
    // 보너스 속성 체크
    if (arena.bonusAttribute && arena.bonusAttribute === attribute) {
      arenaBonus = arena.bonusPercent;
    }
    // 페널티 속성 체크
    if (arena.penaltyAttribute && arena.penaltyAttribute === attribute) {
      arenaPenalty = arena.penaltyPercent;
    }
  }

  // 조정된 총합 계산
  const adjustedTotal = Math.round(
    baseStats.total * (1 + arenaBonus / 100) * (1 - arenaPenalty / 100)
  );

  return {
    odId: participant.odId,
    name: participant.odName,
    attribute,
    baseStats,
    adjustedTotal,
    arenaBonus,
    arenaPenalty,
    currentHp: baseStats.hp,
    maxHp: baseStats.hp,
  };
}


// ═══════════════════════════════════════════════════════════
// 데미지 계산 (Phase 4.3 밸런스 조정 - 10턴 내외 종료 목표)
// ═══════════════════════════════════════════════════════════

// 전투 밸런스 상수 (팀리그와 통일된 로직)
// HP: 100, 목표 종료 턴: 8~12턴, 턴당 평균 데미지: 8~12
// 속성 배율, CE 배율 공식을 팀리그와 동일하게 사용
const BATTLE_BALANCE = {
  // 기본 데미지 계수 (ATK 기반)
  ATK_COEFFICIENT: 0.4,
  BASE_DAMAGE_BONUS: 5,

  // DEF → 피해 감소% (최대 22%)
  DEF_REDUCTION_RATE: 0.7,
  MAX_DEF_REDUCTION_PERCENT: 22,

  // CE → 데미지 배율 (1 + CE×0.006)
  CE_MULTIPLIER_COEFFICIENT: 0.006,

  // CE0 캐릭터 고정 보너스 (토우지, 마키(각성), 츠루기 등)
  CE0_BONUS: 0.12,

  // TEC → 스킬 발동률 (기본20% + TEC×1%)
  TEC_SKILL_BASE_CHANCE: 20,
  TEC_SKILL_RATE: 1.0,
  SKILL_MULTIPLIER: 1.3,      // 스킬: 1.3배
  ULTIMATE_MULTIPLIER: 2.0,   // 필살기: 2.0배

  // CRT → 크리티컬 확률 (CRT/150)
  CRITICAL_RATE_DIVISOR: 150,
  CRITICAL_MULTIPLIER: 1.5,   // 크리티컬: 1.5배

  // MNT → 추가 피해 감소 (MNT×0.5%)
  MNT_REDUCTION_RATE: 0.5,

  // 최소 데미지 보장
  MIN_DAMAGE: 5,

  // 턴 제한
  MAX_TURNS: 30
};

interface DamageResult {
  damage: number;
  isCritical: boolean;
  actionType: 'basic' | 'skill' | 'ultimate';
  actionName: string;
}

export function calculateDamage(
  attacker: BattleStats,
  defender: BattleStats,
  _turnNumber: number,
  forceUltimate: boolean = false
): DamageResult {
  const atkChar = getCharacterById(attacker.odId);

  // Phase 4.4: 속성 상성 + CE 배율 반영 데미지 공식
  // 1. 기본 데미지 (ATK 기반) - ATK 20 기준 약 13 데미지
  const baseAtk = attacker.baseStats.atk;
  const baseDef = defender.baseStats.def;
  let baseDamage = Math.round(baseAtk * BATTLE_BALANCE.ATK_COEFFICIENT + BATTLE_BALANCE.BASE_DAMAGE_BONUS);

  // 2. DEF → 피해 감소% (최대 22%)
  const defenseReduction = Math.min(
    baseDef * BATTLE_BALANCE.DEF_REDUCTION_RATE,
    BATTLE_BALANCE.MAX_DEF_REDUCTION_PERCENT
  );
  baseDamage = Math.round(baseDamage * (1 - defenseReduction / 100));

  // 3. MNT → 추가 피해 감소% (수비자의 정신력)
  const mntReduction = defender.baseStats.mnt * BATTLE_BALANCE.MNT_REDUCTION_RATE;
  baseDamage = Math.round(baseDamage * (1 - mntReduction / 100));

  // 4. 속성 상성 배율 적용 (팀리그와 동일)
  const attrMult = getAttributeMultiplier(attacker.attribute, defender.attribute);
  baseDamage = Math.round(baseDamage * attrMult);

  // 5. CE 배율 적용 (CE0 캐릭터 보너스, 그 외 1 + CE×0.006)
  const ceMultiplier = attacker.baseStats.ce === 0
    ? (1 + BATTLE_BALANCE.CE0_BONUS)
    : (1 + attacker.baseStats.ce * BATTLE_BALANCE.CE_MULTIPLIER_COEFFICIENT);
  baseDamage = Math.round(baseDamage * ceMultiplier);

  // 6. 최소 데미지 보장
  baseDamage = Math.max(baseDamage, BATTLE_BALANCE.MIN_DAMAGE);

  // 7. 총합 차이에 따른 미세 보정 (±20% 범위)
  const statDiff = attacker.adjustedTotal - defender.adjustedTotal;
  const statBonus = 1 + (statDiff / 1000);
  baseDamage = Math.round(baseDamage * Math.max(0.8, Math.min(1.2, statBonus)));

  // 8. 랜덤 변동 (±10%)
  const variance = 0.9 + Math.random() * 0.2;
  baseDamage = Math.round(baseDamage * variance);

  // 9. 액션 타입 결정 (게이지 기반 필살기 + TEC 기반 스킬)
  let actionType: 'basic' | 'skill' | 'ultimate' = 'basic';
  let actionName = atkChar?.basicSkills?.[0]?.name || '기본 공격';
  let multiplier = 1.0;

  if (forceUltimate) {
    // 게이지 100% → 필살기 확정 발동
    actionType = 'ultimate';
    actionName = atkChar?.ultimateSkill?.name || '필살기';
    multiplier = BATTLE_BALANCE.ULTIMATE_MULTIPLIER;
  } else {
    // TEC → 스킬 발동률 (기본20% + TEC×1%)
    const tecSkillChance = BATTLE_BALANCE.TEC_SKILL_BASE_CHANCE + attacker.baseStats.tec * BATTLE_BALANCE.TEC_SKILL_RATE;
    if (Math.random() * 100 < tecSkillChance) {
      actionType = 'skill';
      const skillIndex = Math.floor(Math.random() * (atkChar?.basicSkills?.length || 1));
      actionName = atkChar?.basicSkills?.[skillIndex]?.name || '특수 기술';
      multiplier = BATTLE_BALANCE.SKILL_MULTIPLIER;
    }
  }

  // 10. CRT → 크리티컬 (확률: CRT/150, 배율: ×1.5)
  const critChance = attacker.baseStats.crt / BATTLE_BALANCE.CRITICAL_RATE_DIVISOR;
  const isCritical = Math.random() < critChance;

  // 8. 최종 데미지 계산
  let finalDamage = Math.round(baseDamage * multiplier);

  // 크리티컬은 최종 데미지에 곱하기 (스킬/필살기와 중복)
  if (isCritical) {
    finalDamage = Math.round(finalDamage * BATTLE_BALANCE.CRITICAL_MULTIPLIER);
  }

  // 최소 데미지 보장
  finalDamage = Math.max(BATTLE_BALANCE.MIN_DAMAGE, finalDamage);

  return {
    damage: finalDamage,
    isCritical,
    actionType,
    actionName,
  };
}


// ═══════════════════════════════════════════════════════════
// 단일 세트(게임) 시뮬레이션
// ═══════════════════════════════════════════════════════════

export function simulateSet(
  participant1: Participant,
  participant2: Participant,
  arenaId: string,
  setNumber: number
): SimSetResult {
  const arena = getArenaById(arenaId);

  // 경기장 효과 적용
  const fighter1 = applyArenaEffect(participant1, arena);
  const fighter2 = applyArenaEffect(participant2, arena);

  console.log(`[simulateSet] 세트 ${setNumber} 시작`);
  console.log(`  ${fighter1.name}: ${fighter1.adjustedTotal} (보너스: +${fighter1.arenaBonus}%, 페널티: -${fighter1.arenaPenalty}%)`);
  console.log(`  ${fighter2.name}: ${fighter2.adjustedTotal} (보너스: +${fighter2.arenaBonus}%, 페널티: -${fighter2.arenaPenalty}%)`);

  const turns: SimBattleTurn[] = [];
  let turnNumber = 1;
  const maxTurns = 30; // 무한루프 방지

  // 필살기 게이지 추적 (매 턴 +25, 4턴째 100 도달)
  const GAUGE_CHARGE = 25;
  let f1Gauge = 0;
  let f2Gauge = 0;

  // 선공 결정 (속도 비교)
  let currentAttacker = fighter1.baseStats.spd >= fighter2.baseStats.spd ? fighter1 : fighter2;
  let currentDefender = currentAttacker === fighter1 ? fighter2 : fighter1;

  // 전투 루프
  while (fighter1.currentHp > 0 && fighter2.currentHp > 0 && turnNumber <= maxTurns) {
    // 공격자의 게이지 확인 → 100 이상이면 필살기 강제 발동
    const isAttackerF1 = currentAttacker === fighter1;
    const attackerGauge = isAttackerF1 ? f1Gauge : f2Gauge;
    const forceUltimate = attackerGauge >= 100;

    const damageResult = calculateDamage(currentAttacker, currentDefender, turnNumber, forceUltimate);

    const defenderHpBefore = currentDefender.currentHp;
    currentDefender.currentHp = Math.max(0, currentDefender.currentHp - damageResult.damage);

    // 게이지 업데이트
    if (damageResult.actionType === 'ultimate') {
      // 필살기 사용 시 공격자 게이지 리셋
      if (isAttackerF1) { f1Gauge = 0; } else { f2Gauge = 0; }
    } else {
      // 일반/스킬 시 양측 게이지 충전
      f1Gauge = Math.min(100, f1Gauge + GAUGE_CHARGE);
      f2Gauge = Math.min(100, f2Gauge + GAUGE_CHARGE);
    }

    // 턴 로그 생성
    const turn: SimBattleTurn = {
      turnNumber,
      attackerId: currentAttacker.odId,
      attackerName: currentAttacker.name,
      defenderId: currentDefender.odId,
      defenderName: currentDefender.name,
      actionType: damageResult.actionType,
      actionName: damageResult.actionName,
      damage: damageResult.damage,
      isCritical: damageResult.isCritical,
      attackerHpBefore: currentAttacker.currentHp,
      attackerHpAfter: currentAttacker.currentHp,
      defenderHpBefore,
      defenderHpAfter: currentDefender.currentHp,
    };

    turns.push(turn);

    // 공수 교대
    [currentAttacker, currentDefender] = [currentDefender, currentAttacker];
    turnNumber++;
  }

  // 승자 결정
  const winner = fighter1.currentHp > 0 ? fighter1 : fighter2;
  const loser = fighter1.currentHp > 0 ? fighter2 : fighter1;
  const winnerHpPercent = winner.currentHp;
  const isDominantWin = winnerHpPercent >= 70;

  console.log(`[simulateSet] 세트 ${setNumber} 종료: ${winner.name} 승리 (HP: ${winnerHpPercent}%)`);

  return {
    setNumber,
    arenaId,
    arenaName: arena?.name || '알 수 없는 경기장',
    arenaEffect: arena,
    winnerId: winner.odId,
    winnerName: winner.name,
    loserId: loser.odId,
    loserName: loser.name,
    winnerHpPercent,
    loserHpPercent: 0,
    isDominantWin,
    turns,
    totalTurns: turns.length,
  };
}


// ═══════════════════════════════════════════════════════════
// 전체 매치 시뮬레이션 (단판 또는 다선승)
// ═══════════════════════════════════════════════════════════

export function simulateMatch(
  participant1: Participant,
  participant2: Participant,
  arenaIds: string[],
  bestOf: number
): { winnerId: string; loserId: string; score: [number, number]; sets: SimSetResult[] } {
  const winsNeeded = Math.ceil(bestOf / 2);
  const sets: SimSetResult[] = [];
  let wins1 = 0;
  let wins2 = 0;
  let setNumber = 1;

  console.log(`[simulateMatch] ${participant1.odName} vs ${participant2.odName} (${bestOf}판 ${winsNeeded}선승)`);

  while (wins1 < winsNeeded && wins2 < winsNeeded && setNumber <= bestOf) {
    const arenaId = arenaIds[(setNumber - 1) % arenaIds.length];
    const setResult = simulateSet(participant1, participant2, arenaId, setNumber);
    sets.push(setResult);

    if (setResult.winnerId === participant1.odId) {
      wins1++;
    } else {
      wins2++;
    }

    setNumber++;
  }

  const winnerId = wins1 >= winsNeeded ? participant1.odId : participant2.odId;
  const loserId = winnerId === participant1.odId ? participant2.odId : participant1.odId;

  console.log(`[simulateMatch] 최종 결과: ${winnerId} 승리 (${wins1} : ${wins2})`);

  return {
    winnerId,
    loserId,
    score: [wins1, wins2],
    sets,
  };
}


// ═══════════════════════════════════════════════════════════
// 유틸리티: 참가자 생성 헬퍼
// ═══════════════════════════════════════════════════════════

export function createParticipantFromId(
  odId: string,
  crewId: string = 'AI',
  crewName: string = 'AI 크루',
  isPlayerCrew: boolean = false
): Participant {
  const card = getCharacterById(odId);
  return {
    odId,
    odName: card?.name?.ko || '알 수 없음',
    crewId,
    crewName,
    isPlayerCrew,
    totalStats: card ? calculateTotalStats(card) : 0,
    attribute: card?.attribute,
  };
}

// ═══════════════════════════════════════════════════════════
// 유틸리티: bestOf 값 계산 (라운드별)
// ═══════════════════════════════════════════════════════════

export function getBestOfForRound(round: string): number {
  switch (round) {
    case 'ROUND_64': return 1;       // 64강: 단판
    case 'ROUND_32': return 1;       // 32강: 단판
    case 'ROUND_16': return 3;       // 16강: Bo3
    case 'QUARTER': return 5;        // 8강: Bo5
    case 'SEMI': return 5;           // 4강: Bo5
    case 'FINAL': return 5;          // 결승: Bo5
    case 'THIRD_PLACE': return 5;    // 3/4위전: Bo5
    default: return 1;
  }
}

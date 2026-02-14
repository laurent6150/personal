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
import type { CharacterCard } from '../types';

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

// ═══════════════════════════════════════════════════════════
// 경기장 효과 적용
// ═══════════════════════════════════════════════════════════

export function applyArenaEffect(
  participant: Participant,
  arena: ArenaEffect | null
): BattleStats {
  const character = getCharacterById(participant.odId);

  const baseStats = {
    atk: character?.baseStats?.atk || 50,
    def: character?.baseStats?.def || 50,
    spd: character?.baseStats?.spd || 50,
    ce: character?.baseStats?.ce || 50,
    hp: character?.baseStats?.hp || 50,
    crt: (character?.baseStats as { crt?: number })?.crt || 50,
    tec: (character?.baseStats as { tec?: number })?.tec || 50,
    mnt: (character?.baseStats as { mnt?: number })?.mnt || 50,
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
    currentHp: 100,
    maxHp: 100,
  };
}


// ═══════════════════════════════════════════════════════════
// 데미지 계산 (Phase 4.3 밸런스 조정 - 10턴 내외 종료 목표)
// ═══════════════════════════════════════════════════════════

// 전투 밸런스 상수 (Phase 4.3: 8~12턴 전투를 위한 밸런스 조정)
// HP: 100, 목표 종료 턴: 8~12턴, 턴당 평균 데미지: 8~12
const BATTLE_BALANCE = {
  // 기본 데미지 계수 (ATK 기반)
  ATK_COEFFICIENT: 0.4,
  BASE_DAMAGE_BONUS: 5,

  // 방어력 감소율 (최대 30% 감소)
  DEF_REDUCTION_RATE: 0.3,
  MAX_DEF_REDUCTION_PERCENT: 30,

  // 스킬/필살기 배율
  SKILL_MULTIPLIER: 1.3,      // 스킬: 1.3배
  ULTIMATE_MULTIPLIER: 2.0,   // 필살기: 2.0배

  // 크리티컬 배율
  CRITICAL_MULTIPLIER: 1.5,   // 크리티컬: 1.5배

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

  // Phase 4.3: 새로운 데미지 계산 공식 (10턴 내외 종료 목표)
  // 1. 기본 데미지 (ATK 기반) - ATK 20 기준 약 13 데미지
  const baseAtk = attacker.baseStats.atk;
  const baseDef = defender.baseStats.def;
  let baseDamage = Math.round(baseAtk * BATTLE_BALANCE.ATK_COEFFICIENT + BATTLE_BALANCE.BASE_DAMAGE_BONUS);

  // 2. 방어력 적용 (최대 30% 감소)
  const defenseReduction = Math.min(
    baseDef * BATTLE_BALANCE.DEF_REDUCTION_RATE,
    BATTLE_BALANCE.MAX_DEF_REDUCTION_PERCENT
  );
  baseDamage = Math.round(baseDamage * (1 - defenseReduction / 100));

  // 3. 최소 데미지 보장
  baseDamage = Math.max(baseDamage, BATTLE_BALANCE.MIN_DAMAGE);

  // 4. 총합 차이에 따른 미세 보정 (±20% 범위)
  const statDiff = attacker.adjustedTotal - defender.adjustedTotal;
  const statBonus = 1 + (statDiff / 1000); // 더 약한 보정
  baseDamage = Math.round(baseDamage * Math.max(0.8, Math.min(1.2, statBonus)));

  // 5. 랜덤 변동 (±10%)
  const variance = 0.9 + Math.random() * 0.2;
  baseDamage = Math.round(baseDamage * variance);

  // 6. 액션 타입 결정 (게이지 기반 필살기 + 확률 기반 스킬)
  let actionType: 'basic' | 'skill' | 'ultimate' = 'basic';
  let actionName = atkChar?.basicSkills?.[0]?.name || '기본 공격';
  let multiplier = 1.0;

  if (forceUltimate) {
    // 게이지 100% → 필살기 확정 발동
    actionType = 'ultimate';
    actionName = atkChar?.ultimateSkill?.name || '필살기';
    multiplier = BATTLE_BALANCE.ULTIMATE_MULTIPLIER;
  } else {
    const roll = Math.random() * 100;
    // 스킬: 30%, 나머지: 일반 (필살기는 게이지로만 발동)
    if (roll < 30) {
      actionType = 'skill';
      const skillIndex = Math.floor(Math.random() * (atkChar?.basicSkills?.length || 1));
      actionName = atkChar?.basicSkills?.[skillIndex]?.name || '특수 기술';
      multiplier = BATTLE_BALANCE.SKILL_MULTIPLIER;
    }
  }

  // 7. 크리티컬 체크 (crt 50 기준 ~33% 확률)
  const critChance = attacker.baseStats.crt / 150;
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
    case 'ROUND_32': return 1;       // 32강: 단판
    case 'ROUND_16': return 3;       // 16강: 3판 2선승
    case 'QUARTER': return 5;        // 8강: 5판 3선승
    case 'SEMI': return 5;           // 4강: 5판 3선승
    case 'FINAL': return 5;          // 결승: 5판 3선승
    case 'THIRD_PLACE': return 5;    // 3/4위전: 5판 3선승
    default: return 1;
  }
}

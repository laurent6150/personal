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
// 데미지 계산
// ═══════════════════════════════════════════════════════════

interface DamageResult {
  damage: number;
  isCritical: boolean;
  actionType: 'basic' | 'skill' | 'ultimate';
  actionName: string;
}

export function calculateDamage(
  attacker: BattleStats,
  defender: BattleStats,
  turnNumber: number
): DamageResult {
  const atkChar = getCharacterById(attacker.odId);

  // 기본 데미지 (공격력 기반)
  const baseAtk = attacker.baseStats.atk;
  const baseDef = defender.baseStats.def;

  // 주력(CE) 보너스
  const ceBonus = 1 + (attacker.baseStats.ce / 200);

  // 기본 데미지 계산
  let baseDamage = (baseAtk * ceBonus) - (baseDef * 0.3);
  baseDamage = Math.max(baseDamage, 5); // 최소 데미지

  // 총합 차이에 따른 보정 (조정된 총합 사용)
  const statDiff = attacker.adjustedTotal - defender.adjustedTotal;
  const statBonus = 1 + (statDiff / 500);
  baseDamage *= Math.max(0.5, Math.min(1.5, statBonus));

  // 크리티컬 체크
  const critChance = attacker.baseStats.crt / 150; // crt 50이면 33%
  const isCritical = Math.random() < critChance;
  if (isCritical) {
    baseDamage *= 1.5;
  }

  // 랜덤 변동 (+-15%)
  const variance = 0.85 + Math.random() * 0.3;
  baseDamage *= variance;

  // 액션 타입 결정 (턴에 따라)
  let actionType: 'basic' | 'skill' | 'ultimate' = 'basic';
  let actionName = atkChar?.basicSkills?.[0]?.name || '기본 공격';

  // 3턴마다 스킬 사용 확률 증가
  if (turnNumber % 3 === 0 && Math.random() < 0.6) {
    actionType = 'skill';
    const skillIndex = Math.floor(Math.random() * (atkChar?.basicSkills?.length || 1));
    actionName = atkChar?.basicSkills?.[skillIndex]?.name || '특수 기술';
    baseDamage *= 1.3;
  }

  // 7턴 이후 필살기 확률
  if (turnNumber >= 7 && Math.random() < 0.3) {
    actionType = 'ultimate';
    actionName = atkChar?.ultimateSkill?.name || '필살기';
    baseDamage *= 1.8;
  }

  // 최종 데미지 (HP% 기준, 100 기준)
  const finalDamage = Math.round(baseDamage / 5); // HP 100 기준으로 조정

  return {
    damage: Math.max(1, Math.min(finalDamage, 50)), // 1~50 데미지
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

  // 선공 결정 (속도 비교)
  let currentAttacker = fighter1.baseStats.spd >= fighter2.baseStats.spd ? fighter1 : fighter2;
  let currentDefender = currentAttacker === fighter1 ? fighter2 : fighter1;

  // 전투 루프
  while (fighter1.currentHp > 0 && fighter2.currentHp > 0 && turnNumber <= maxTurns) {
    const damageResult = calculateDamage(currentAttacker, currentDefender, turnNumber);

    const defenderHpBefore = currentDefender.currentHp;
    currentDefender.currentHp = Math.max(0, currentDefender.currentHp - damageResult.damage);

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

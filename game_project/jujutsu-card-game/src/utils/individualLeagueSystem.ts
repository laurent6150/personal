// ========================================
// 개인 리그 토너먼트 시스템 (Phase 3)
// ========================================

import type {
  IndividualLeague,
  IndividualLeagueStatus,
  LeagueParticipant,
  IndividualMatch,
  LeagueGroup,
  IndividualBrackets,
  LeagueMatchFormat,
  CharacterCard,
  PlayerCard,
  CombatStats,
  Arena,
  Stats,
  DualTournamentGroup
} from '../types';
import { CHARACTERS_BY_ID, ALL_CHARACTERS } from '../data/characters';
import { ITEMS_BY_ID } from '../data/items';
import { getRandomArena } from '../data/arenas';
import {
  calculateDamage,
  determineFirstAttacker,
  applySkillEffect,
} from './battleCalculator';
import {
  getSkillSealProbability,
} from './attributeSystem';

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 배열 셔플 (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 랜덤 크루 이름 생성
 */
const AI_CREW_NAMES = [
  '도쿄 주술고전',
  '교토 주술고전',
  '저주사 연합',
  '특급 술사단',
  '비술사 길드',
  '주술 결사대',
  '영역전개 팀',
  '조령 조종사',
  '결계술 마스터',
  '술식 연구회',
  '고대 저주 팀',
  '현대 주술팀',
  '하나미 군단',
  '료멘 스쿠나파',
  '겐지 주술원',
  '천원 수호대',
  '주술 특수반',
  '도주술 연맹'
];

export function getRandomCrewName(): string {
  return AI_CREW_NAMES[Math.floor(Math.random() * AI_CREW_NAMES.length)];
}

// ========================================
// 등급 우선순위
// ========================================

const GRADE_PRIORITY: Record<string, number> = {
  '특급': 9,
  '준특급': 8,
  '1급': 7,
  '준1급': 6,
  '2급': 5,
  '준2급': 4,
  '3급': 3,
  '준3급': 2,
  '비술사': 1,
};

function getGradePriority(grade: string): number {
  return GRADE_PRIORITY[grade] || 0;
}

// ========================================
// 참가자 생성
// ========================================

/**
 * 플레이어 카드의 장비/레벨 보너스 스탯 계산
 */
function calculatePlayerCardBonus(playerCard: PlayerCard): {
  statBonus: LeagueParticipant['statBonus'];
  totalBonus: number;
} {
  const baseCard = CHARACTERS_BY_ID[playerCard.cardId];
  if (!baseCard) return { statBonus: {}, totalBonus: 0 };

  const statBonus: LeagueParticipant['statBonus'] = {};
  let totalBonus = 0;

  // 레벨업 보너스 (레벨당 주요 스탯 +2)
  const levelBonus = (playerCard.level - 1) * 2;
  if (levelBonus > 0) {
    const primaryStat = baseCard.growthStats?.primary;
    const secondaryStat = baseCard.growthStats?.secondary;
    if (primaryStat) {
      statBonus[primaryStat as keyof typeof statBonus] = levelBonus;
      totalBonus += levelBonus;
    }
    if (secondaryStat) {
      statBonus[secondaryStat as keyof typeof statBonus] =
        (statBonus[secondaryStat as keyof typeof statBonus] || 0) + levelBonus;
      totalBonus += levelBonus;
    }
  }

  // 시즌 종료 시 누적된 bonusStats 반영
  if (playerCard.bonusStats) {
    for (const [stat, value] of Object.entries(playerCard.bonusStats)) {
      if (value) {
        const key = stat as keyof typeof statBonus;
        statBonus[key] = (statBonus[key] || 0) + value;
        totalBonus += value;
      }
    }
  }

  // 장비 보너스
  for (const equipId of playerCard.equipment || []) {
    if (equipId) {
      const item = ITEMS_BY_ID[equipId];
      if (item?.statBonus) {
        for (const [stat, value] of Object.entries(item.statBonus)) {
          if (value) {
            const key = stat as keyof typeof statBonus;
            statBonus[key] = (statBonus[key] || 0) + value;
            totalBonus += value;
          }
        }
      }
    }
  }

  return { statBonus, totalBonus };
}

/**
 * 64명 참가자 생성 (듀얼 토너먼트용)
 * - 시즌 1: 64명 전원 64강 시작
 * - 시즌 2+: 시드 8명(전 시즌 1~8위)은 32강 직행, 나머지 56명이 64강(14조)
 *   → 64강에서 28명(조별 1,2위) 진출 + 시드 4명(5~8위) 합산 = 32명 → 32강 8조
 *   → 시드 상위 4명(1~4위)은 32강 각 조 배치
 * - playerCards: 플레이어 크루의 카드 정보 (장비/레벨 반영용)
 */
export function generateParticipants(
  playerCrewIds: string[],
  playerCrewName: string = '내 크루',
  seeds: string[] = [],  // 전 시즌 1~8위 (시즌 2부터)
  playerCards?: PlayerCard[]  // 플레이어 크루 카드 정보
): LeagueParticipant[] {
  // 플레이어 카드 맵 생성
  const playerCardMap = new Map<string, PlayerCard>();
  if (playerCards) {
    for (const pc of playerCards) {
      playerCardMap.set(pc.cardId, pc);
    }
  }

  // 캐릭터 → 참가자 변환 헬퍼
  function createParticipant(card: CharacterCard, groupId?: string): LeagueParticipant {
    const isPlayer = playerCrewIds.includes(card.id);
    const playerCard = isPlayer ? playerCardMap.get(card.id) : undefined;
    const bonus = playerCard ? calculatePlayerCardBonus(playerCard) : { statBonus: {}, totalBonus: 0 };

    return {
      odId: card.id,
      odName: card.name.ko,
      crewId: isPlayer ? 'PLAYER_CREW' : `AI_CREW_${Math.random().toString(36).slice(2, 6)}`,
      crewName: isPlayer ? playerCrewName : getRandomCrewName(),
      isPlayerCrew: isPlayer,
      status: 'ACTIVE',
      totalStats: calculateTotalStat(card) + bonus.totalBonus,
      equipment: playerCard?.equipment,
      level: playerCard?.level,
      statBonus: bonus.statBonus && Object.keys(bonus.statBonus).length > 0 ? bonus.statBonus : undefined,
      groupId,
    };
  }

  // 모든 캐릭터를 등급순 + 스탯순으로 정렬
  const sortedCharacters = [...ALL_CHARACTERS].sort((a, b) => {
    const gradeA = getGradePriority(a.grade);
    const gradeB = getGradePriority(b.grade);
    if (gradeB !== gradeA) return gradeB - gradeA;
    return calculateTotalStat(b) - calculateTotalStat(a);
  });

  // 시드 참가자 (최대 8명)
  const seedIds = new Set<string>();
  for (const seedId of seeds.slice(0, 8)) {
    if (CHARACTERS_BY_ID[seedId]) {
      seedIds.add(seedId);
    }
  }

  // 나머지 참가자 선발 (64명 - 시드 수)
  const neededCount = 64 - seedIds.size;
  const nonSeedParticipants: LeagueParticipant[] = [];

  for (const card of sortedCharacters) {
    if (nonSeedParticipants.length >= neededCount) break;
    if (seedIds.has(card.id)) continue;
    nonSeedParticipants.push(createParticipant(card));
  }

  // 시드 참가자 배열 생성
  const seedParticipants: LeagueParticipant[] = [];
  for (const seedId of seeds.slice(0, 8)) {
    const card = CHARACTERS_BY_ID[seedId];
    if (card) {
      seedParticipants.push(createParticipant(card));
    }
  }

  // 전체 참가자 합산 (시드 + 비시드)
  const allParticipants = [...seedParticipants, ...shuffleArray(nonSeedParticipants)];

  console.log('[generateParticipants] 참가자 생성 완료:', {
    total: allParticipants.length,
    seeds: seedParticipants.length,
    playerCards: allParticipants.filter(p => p.isPlayerCrew).length,
  });

  return allParticipants;
}

// ========================================
// 듀얼 토너먼트 대진표 생성
// ========================================

/**
 * 듀얼 토너먼트 조 생성 (4인 1조, 5경기)
 * 구조:
 *   1차전: A vs B, C vs D (동시)
 *   승자전: 1차전 승자끼리
 *   패자전: 1차전 패자끼리
 *   최종전: 승자전 패자 vs 패자전 승자
 * 결과: 조 1위(승자전 승자), 2위(최종전 승자) 진출 / 3위(최종전 패자), 4위(패자전 패자) 탈락
 */
function createDualTournamentGroup(
  groupId: string,
  participantIds: string[],
  roundPrefix: string,
  format: LeagueMatchFormat,
  seedId?: string | null
): DualTournamentGroup {
  const [a, b, c, d] = participantIds;

  const createMatch = (suffix: string, p1: string, p2: string): IndividualMatch => ({
    id: `${roundPrefix}_${groupId}_${suffix}`,
    participant1: p1,
    participant2: p2,
    winner: null,
    score: { p1: 0, p2: 0 },
    format,
    played: false,
    groupId,
  });

  return {
    id: groupId,
    participants: participantIds,
    matches: {
      match1: createMatch('m1', a, b),
      match2: createMatch('m2', c, d),
      winnersMatch: createMatch('wm', '', ''),    // 1차전 승자끼리 (후에 설정)
      losersMatch: createMatch('lm', '', ''),      // 1차전 패자끼리 (후에 설정)
      finalMatch: createMatch('fm', '', ''),        // 승자전패자 vs 패자전승자 (후에 설정)
    },
    firstPlace: null,
    secondPlace: null,
    thirdPlace: null,
    fourthPlace: null,
    isCompleted: false,
    seedId: seedId || null,
  };
}

/**
 * 듀얼 토너먼트의 모든 매치를 플랫 배열로 반환
 */
function getDualGroupAllMatches(group: DualTournamentGroup): IndividualMatch[] {
  return [
    group.matches.match1,
    group.matches.match2,
    group.matches.winnersMatch,
    group.matches.losersMatch,
    group.matches.finalMatch,
  ];
}

/**
 * 초기 대진표 생성 (듀얼 토너먼트)
 * - 시즌 1: 64명 → 16조 64강 듀얼 토너먼트
 * - 시즌 2+: 시드 8명은 32강 직행, 나머지 56명 → 14조 64강
 *   → 64강 28명 진출 + 시드 4명(5~8위) = 32명 → 8조 32강
 *   → 시드 상위 4명(1~4위)은 32강 각 조 배치
 */
export function generateInitialBrackets(
  participants: LeagueParticipant[],
  seeds: string[] = []
): IndividualBrackets {
  const hasSeed = seeds.length > 0;
  const groupLabels = 'ABCDEFGHIJKLMNOP'.split('');

  if (!hasSeed) {
    // 시즌 1: 64명 전원 → 16조 64강 듀얼 토너먼트 (단판)
    const round64Groups: DualTournamentGroup[] = [];
    const allMatches: IndividualMatch[] = [];

    for (let i = 0; i < 16; i++) {
      const groupId = groupLabels[i];
      const groupMembers = participants.slice(i * 4, (i + 1) * 4).map(p => p.odId);
      const group = createDualTournamentGroup(groupId, groupMembers, 'r64', '1WIN');
      round64Groups.push(group);
      allMatches.push(...getDualGroupAllMatches(group));
    }

    console.log('[generateInitialBrackets] 시즌1: 64강 16조 생성, 총 매치:', allMatches.length);

    return {
      round64Groups,
      round32Groups: [],       // 64강 완료 후 생성
      round32: allMatches,     // 호환성: 플랫 매치 배열
      round16: [],
      round16Matches: [],
      quarter: [],
      semi: [],
      final: null,
    };
  } else {
    // 시즌 2+: 시드 시스템
    // 시드 상위 4명(1~4위): 32강 직행 (각 조 배치)
    // 시드 하위 4명(5~8위): 64강 완료 후 32강 합류
    // 나머지 56명: 14조 64강 듀얼 토너먼트
    const topSeeds = seeds.slice(0, 4);       // 1~4위 → 32강 직행
    const bottomSeeds = seeds.slice(4, 8);    // 5~8위 → 64강 후 32강 합류
    const seedSet = new Set(seeds.slice(0, 8));
    const nonSeedParticipants = participants.filter(p => !seedSet.has(p.odId));

    // 56명 → 14조 64강 듀얼 토너먼트
    const round64Groups: DualTournamentGroup[] = [];
    const allMatches: IndividualMatch[] = [];

    for (let i = 0; i < 14; i++) {
      const groupId = groupLabels[i];
      const groupMembers = nonSeedParticipants.slice(i * 4, (i + 1) * 4).map(p => p.odId);
      if (groupMembers.length < 4) break; // 참가자 부족 시 중단
      const group = createDualTournamentGroup(groupId, groupMembers, 'r64', '1WIN');
      round64Groups.push(group);
      allMatches.push(...getDualGroupAllMatches(group));
    }

    console.log('[generateInitialBrackets] 시즌2+: 64강', round64Groups.length, '조,',
      '시드 상위', topSeeds.length, '명 32강 직행,',
      '시드 하위', bottomSeeds.length, '명 32강 합류 예정');

    return {
      round64Groups,
      round32Groups: [],       // 64강 완료 후 생성
      round32: allMatches,     // 호환성: 플랫 매치 배열
      round16: [],
      round16Matches: [],
      quarter: [],
      semi: [],
      final: null,
    };
  }
}

/**
 * 16강 토너먼트 대진 생성 (교차 대진)
 * A조 1위 vs B조 2위, A조 2위 vs B조 1위
 * C조 1위 vs D조 2위, C조 2위 vs D조 1위 ...
 */
export function generateRound16Matches(
  round32Groups: DualTournamentGroup[],
  _playerCrewIds: string[]
): IndividualMatch[] {
  // 조별 1위, 2위 추출
  const groupRankings: Record<string, { first: string; second: string }> = {};

  round32Groups.forEach(group => {
    groupRankings[group.id] = {
      first: group.firstPlace || '',
      second: group.secondPlace || '',
    };
    console.log(`[generateRound16Matches] ${group.id}조: 1위=${group.firstPlace}, 2위=${group.secondPlace}`);
  });

  // 교차 대진: 인접 조끼리 (A-B, C-D, E-F, G-H)
  const pairs = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']];
  const matchups: [string, string][] = [];

  for (const [g1, g2] of pairs) {
    if (groupRankings[g1] && groupRankings[g2]) {
      matchups.push([groupRankings[g1].first, groupRankings[g2].second]);
      matchups.push([groupRankings[g1].second, groupRankings[g2].first]);
    }
  }

  const matches: IndividualMatch[] = matchups.map((pair, index) => ({
    id: `r16_${index + 1}`,
    participant1: pair[0],
    participant2: pair[1],
    winner: null,
    score: { p1: 0, p2: 0 },
    format: '2WIN',  // 16강: Bo3
    played: false
  }));

  console.log('[generateRound16Matches] 16강 경기 생성 (교차 대진):', matches.length);
  return matches;
}

/**
 * 8강 대진 생성
 */
export function generateQuarterMatches(
  round16Winners: string[],
  _playerCrewIds: string[]
): IndividualMatch[] {
  // 16강 승자 순서대로 매칭: 1-2, 3-4, 5-6, 7-8
  const matchups = [
    [round16Winners[0], round16Winners[1]],
    [round16Winners[2], round16Winners[3]],
    [round16Winners[4], round16Winners[5]],
    [round16Winners[6], round16Winners[7]],
  ];

  return matchups.map((pair, index) => ({
    id: `qf_${index + 1}`,
    participant1: pair[0],
    participant2: pair[1],
    winner: null,
    score: { p1: 0, p2: 0 },
    format: '2WIN',  // 8강: 3판 2선승
    played: false
  }));
}

/**
 * 4강 대진 생성
 */
export function generateSemiMatches(
  quarterWinners: string[],
  _playerCrewIds: string[]
): IndividualMatch[] {
  const matchups = [
    [quarterWinners[0], quarterWinners[1]],
    [quarterWinners[2], quarterWinners[3]],
  ];

  return matchups.map((pair, index) => ({
    id: `sf_${index + 1}`,
    participant1: pair[0],
    participant2: pair[1],
    winner: null,
    score: { p1: 0, p2: 0 },
    format: '3WIN',  // 4강: 5판 3선승
    played: false
  }));
}

/**
 * 결승 대진 생성
 */
export function generateFinalMatch(
  semiWinners: string[],
  _playerCrewIds: string[]
): IndividualMatch {
  return {
    id: 'final',
    participant1: semiWinners[0],
    participant2: semiWinners[1],
    winner: null,
    score: { p1: 0, p2: 0 },
    format: '3WIN',  // 결승: 5판 3선승
    played: false
  };
}

/**
 * 3/4위전 대진 생성 (4강 패자끼리)
 */
export function generateThirdPlaceMatch(
  semiLosers: string[]
): IndividualMatch {
  return {
    id: 'third_place',
    participant1: semiLosers[0],
    participant2: semiLosers[1],
    winner: null,
    score: { p1: 0, p2: 0 },
    format: '3WIN',  // 3/4위전: 5판 3선승
    played: false
  };
}

// ========================================
// 매치 시뮬레이션 (팀 리그 수준 전투 시스템)
// ========================================

/**
 * 캐릭터 총 스탯 계산 (8스탯 전체 합산)
 */
export function calculateTotalStat(card: CharacterCard): number {
  const stats = card.baseStats;
  return (stats.atk || 0) + (stats.def || 0) + (stats.spd || 0) +
         (stats.ce || 0) + (stats.hp || 0) +
         ((stats as Stats).crt || 0) + ((stats as Stats).tec || 0) + ((stats as Stats).mnt || 0);
}

// 참가자 statBonus 캐시 (매치 중 조회 성능 최적화)
let participantBonusCache = new Map<string, LeagueParticipant['statBonus']>();

/**
 * 참가자 보너스 캐시 설정 (리그 시작 시 호출)
 */
export function setParticipantBonusCache(participants: LeagueParticipant[]): void {
  participantBonusCache = new Map();
  for (const p of participants) {
    if (p.statBonus) {
      participantBonusCache.set(p.odId, p.statBonus);
    }
  }
}

/**
 * BaseStats → 8스탯 변환 (레거시 호환)
 */
function ensureFullStats(baseStats: CharacterCard['baseStats']): Stats {
  if ('crt' in baseStats) {
    return { ...baseStats } as Stats;
  }
  return { ...baseStats, crt: 10, tec: 10, mnt: 10 };
}

/**
 * 참가자 → CombatStats 변환 (팀 리그 calculateCombatStats/calculateAICombatStats 동일 수준)
 * - 8스탯 전체 적용
 * - 레벨업 보너스 (statBonus) 적용
 * - 경기장 효과 적용
 * - 스킬 효과 포함
 */
function buildCombatStats(
  card: CharacterCard,
  participantId: string,
  arena: Arena
): CombatStats {
  const stats: Stats = ensureFullStats(card.baseStats);

  // 참가자 보너스 (레벨업 + 장비) 적용
  const bonus = participantBonusCache.get(participantId);
  if (bonus) {
    for (const [stat, value] of Object.entries(bonus)) {
      if (stat in stats && value) {
        stats[stat as keyof Stats] += value;
      }
    }
  }

  // 경기장 스탯 수정자 적용 (CE, DEF, HP 등)
  for (const effect of arena.effects) {
    if (effect.type === 'STAT_MODIFY' && effect.target === 'ALL') {
      const mod = typeof effect.value === 'number' ? effect.value : 0;
      if (effect.description.includes('CE')) {
        stats.ce = Math.max(0, stats.ce + mod);
      } else if (effect.description.includes('DEF')) {
        stats.def = Math.max(0, stats.def + mod);
      } else if (effect.description.includes('HP')) {
        stats.hp = Math.max(1, stats.hp + mod);
      }
    }
  }

  return {
    ...stats,
    attribute: card.attribute,
    skillEffect: card.skill?.effect,
    cardId: card.id
  };
}

/**
 * 단일 세트 시뮬레이션 (팀 리그 resolveRound와 동일한 턴제 전투)
 * - 속성 상성 (1.5x / 0.7x)
 * - CE 배율, 경기장 속성 보너스
 * - 스킬 효과 (방어 무시, 크리티컬, 데미지 변환 등)
 * - 스킬 봉인 확률
 * - SPD 기반 선공 판정 (경기장 역전 포함)
 * - HP 기반 턴제 전투
 */
function simulateSingleGame(
  card1: CharacterCard,
  card2: CharacterCard,
  p1Id: string,
  p2Id: string,
  arena: Arena
): 1 | 2 {
  // CombatStats 구축 (8스탯 + 보너스 + 경기장)
  let stats1 = buildCombatStats(card1, p1Id, arena);
  let stats2 = buildCombatStats(card2, p2Id, arena);

  // 스킬 봉인 확률 체크
  const sealProb = getSkillSealProbability(arena);
  const skill1Sealed = Math.random() < sealProb;
  const skill2Sealed = Math.random() < sealProb;

  // 스킬 효과 적용
  if (stats1.skillEffect) {
    const result = applySkillEffect(stats1, stats2, stats1.skillEffect, skill1Sealed);
    stats1 = result.attacker;
    stats2 = result.defender;
  }
  if (stats2.skillEffect) {
    const result = applySkillEffect(stats2, stats1, stats2.skillEffect, skill2Sealed);
    stats2 = result.attacker;
    stats1 = result.defender;
  }

  // 선공 판정 (SPD 기반, 경기장 역전 적용)
  const firstAttacker = determineFirstAttacker(stats1, stats2, arena);
  const p1First = firstAttacker === 'PLAYER'; // PLAYER = participant1

  // 턴당 데미지 계산 (속성 배율, CE 배율, 경기장 보너스, 스킬 전부 적용)
  const dmg1 = calculateDamage(stats1, stats2, arena);
  const dmg2 = calculateDamage(stats2, stats1, arena);

  // HP 기반 턴제 전투
  let hp1 = stats1.hp;
  let hp2 = stats2.hp;
  const MAX_TURNS = 100;
  let turnCount = 0;

  while (hp1 > 0 && hp2 > 0 && turnCount < MAX_TURNS) {
    turnCount++;
    if (p1First) {
      hp2 -= dmg1;
      if (hp2 <= 0) break;
      hp1 -= dmg2;
    } else {
      hp1 -= dmg2;
      if (hp1 <= 0) break;
      hp2 -= dmg1;
    }
  }

  // 승패 판정
  if (hp2 <= 0 && hp1 <= 0) {
    return Math.random() < 0.5 ? 1 : 2; // 동시 탈진 시 랜덤
  }
  if (hp2 <= 0) return 1;
  if (hp1 <= 0) return 2;
  // MAX_TURNS 도달 시 HP 비교
  return hp1 >= hp2 ? 1 : 2;
}

/**
 * 매치 시뮬레이션 (세트제, 각 세트마다 랜덤 경기장 배정)
 */
export function simulateMatch(
  participant1Id: string,
  participant2Id: string,
  format: LeagueMatchFormat
): { winner: string; score: { p1: number; p2: number } } {
  const card1 = CHARACTERS_BY_ID[participant1Id];
  const card2 = CHARACTERS_BY_ID[participant2Id];

  if (!card1 || !card2) {
    const randomWinner = Math.random() < 0.5 ? participant1Id : participant2Id;
    return {
      winner: randomWinner,
      score: { p1: randomWinner === participant1Id ? 1 : 0, p2: randomWinner === participant2Id ? 1 : 0 }
    };
  }

  const requiredWins = format === '1WIN' ? 1 : format === '2WIN' ? 2 : 3;
  let score1 = 0;
  let score2 = 0;

  while (score1 < requiredWins && score2 < requiredWins) {
    // 각 세트마다 랜덤 경기장 배정
    const arena = getRandomArena();
    const gameWinner = simulateSingleGame(card1, card2, participant1Id, participant2Id, arena);
    if (gameWinner === 1) {
      score1++;
    } else {
      score2++;
    }
  }

  return {
    winner: score1 > score2 ? participant1Id : participant2Id,
    score: { p1: score1, p2: score2 }
  };
}

// ========================================
// 듀얼 토너먼트 매치 진행 및 라운드 처리
// ========================================

/**
 * 듀얼 토너먼트 조 내 매치 결과 반영
 * 1차전 결과 → 승자전/패자전 참가자 설정
 * 승자전/패자전 결과 → 최종전 참가자 설정
 * 최종전 결과 → 조 순위 확정
 */
export function updateDualGroupMatchResult(
  group: DualTournamentGroup,
  matchId: string,
  winner: string,
  score: { p1: number; p2: number },
  arenas?: string[]
): DualTournamentGroup {
  const updatedGroup = { ...group, matches: { ...group.matches } };
  const m = updatedGroup.matches;

  // 매치 결과 기록 함수
  const recordResult = (match: IndividualMatch): IndividualMatch => ({
    ...match,
    winner,
    score,
    played: true,
    arenas: arenas || match.arenas,
  });

  // 어떤 매치인지 판별
  if (m.match1.id === matchId) {
    m.match1 = recordResult(m.match1);
    const loser = winner === m.match1.participant1 ? m.match1.participant2 : m.match1.participant1;
    // 승자전에 승자 배치
    m.winnersMatch = { ...m.winnersMatch, participant1: winner };
    // 패자전에 패자 배치
    m.losersMatch = { ...m.losersMatch, participant1: loser };
  } else if (m.match2.id === matchId) {
    m.match2 = recordResult(m.match2);
    const loser = winner === m.match2.participant1 ? m.match2.participant2 : m.match2.participant1;
    // 승자전에 승자 배치
    m.winnersMatch = { ...m.winnersMatch, participant2: winner };
    // 패자전에 패자 배치
    m.losersMatch = { ...m.losersMatch, participant2: loser };
  } else if (m.winnersMatch.id === matchId) {
    m.winnersMatch = recordResult(m.winnersMatch);
    const loser = winner === m.winnersMatch.participant1 ? m.winnersMatch.participant2 : m.winnersMatch.participant1;
    // 조 1위 확정 (승자전 승자)
    updatedGroup.firstPlace = winner;
    // 최종전에 승자전 패자 배치
    m.finalMatch = { ...m.finalMatch, participant1: loser };
  } else if (m.losersMatch.id === matchId) {
    m.losersMatch = recordResult(m.losersMatch);
    const loser = winner === m.losersMatch.participant1 ? m.losersMatch.participant2 : m.losersMatch.participant1;
    // 조 4위 확정 (패자전 패자)
    updatedGroup.fourthPlace = loser;
    // 최종전에 패자전 승자 배치
    m.finalMatch = { ...m.finalMatch, participant2: winner };
  } else if (m.finalMatch.id === matchId) {
    m.finalMatch = recordResult(m.finalMatch);
    const loser = winner === m.finalMatch.participant1 ? m.finalMatch.participant2 : m.finalMatch.participant1;
    // 조 2위(최종전 승자), 3위(최종전 패자) 확정
    updatedGroup.secondPlace = winner;
    updatedGroup.thirdPlace = loser;
    updatedGroup.isCompleted = true;
  }

  return updatedGroup;
}

/**
 * 듀얼 토너먼트 조에서 다음 진행 가능한 매치 찾기
 */
export function findNextDualGroupMatch(group: DualTournamentGroup): IndividualMatch | null {
  const m = group.matches;

  // 1차전 미완료
  if (!m.match1.played) return m.match1;
  if (!m.match2.played) return m.match2;

  // 승자전/패자전 (1차전 모두 완료 후)
  if (!m.winnersMatch.played && m.winnersMatch.participant1 && m.winnersMatch.participant2) {
    return m.winnersMatch;
  }
  if (!m.losersMatch.played && m.losersMatch.participant1 && m.losersMatch.participant2) {
    return m.losersMatch;
  }

  // 최종전 (승자전+패자전 모두 완료 후)
  if (!m.finalMatch.played && m.finalMatch.participant1 && m.finalMatch.participant2) {
    return m.finalMatch;
  }

  return null; // 조 완료
}

/**
 * 64강 결과 처리 → 32강 듀얼 토너먼트 생성
 * - 시즌 1: 64강 16조 → 각 조 1,2위 32명 → 8조 32강
 * - 시즌 2+: 64강 14조 → 각 조 1,2위 28명 + 시드 4명(5~8위) = 32명 → 8조 32강
 *   시드 상위 4명(1~4위)은 32강 각 조 배치
 */
export function processRound64Results(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[],
  seeds: string[] = []
): { brackets: IndividualBrackets; participants: LeagueParticipant[] } {
  if (!brackets.round64Groups || brackets.round64Groups.length === 0) {
    console.error('[processRound64Results] round64Groups가 없습니다');
    return { brackets, participants };
  }

  const qualifiers: string[] = [];
  const eliminatedIds: string[] = [];

  // 각 조별 1,2위 진출, 3,4위 탈락
  brackets.round64Groups.forEach(group => {
    if (group.firstPlace) qualifiers.push(group.firstPlace);
    if (group.secondPlace) qualifiers.push(group.secondPlace);
    if (group.thirdPlace) eliminatedIds.push(group.thirdPlace);
    if (group.fourthPlace) eliminatedIds.push(group.fourthPlace);
  });

  // 시드 하위 4명(5~8위) 합류
  const bottomSeeds = seeds.slice(4, 8).filter(id => CHARACTERS_BY_ID[id]);
  const round32Participants = [...qualifiers, ...bottomSeeds];

  // 시드 상위 4명(1~4위)은 32강 각 조에 배치
  const topSeeds = seeds.slice(0, 4).filter(id => CHARACTERS_BY_ID[id]);

  console.log('[processRound64Results] 32강 진출:', {
    from64: qualifiers.length,
    bottomSeeds: bottomSeeds.length,
    topSeeds: topSeeds.length,
    total: round32Participants.length + topSeeds.length,
  });

  // 탈락자 처리
  let updatedParticipants = participants.map(p => {
    if (eliminatedIds.includes(p.odId) && p.status !== 'ELIMINATED') {
      return { ...p, status: 'ELIMINATED' as const, eliminatedAt: 'ROUND_64' as const };
    }
    return p;
  });

  // 32강 8조 듀얼 토너먼트 생성
  const groupLabels = 'ABCDEFGH'.split('');
  const shuffledQualifiers = shuffleArray(round32Participants);
  const round32Groups: DualTournamentGroup[] = [];
  const round32AllMatches: IndividualMatch[] = [];
  let qIdx = 0;

  for (let i = 0; i < 8; i++) {
    const groupId = groupLabels[i];
    const groupMembers: string[] = [];

    // 시드 상위 4명은 A~D조에 각 1명 배치
    if (i < topSeeds.length) {
      groupMembers.push(topSeeds[i]);
    }

    // 나머지 멤버 채우기
    while (groupMembers.length < 4 && qIdx < shuffledQualifiers.length) {
      const candidate = shuffledQualifiers[qIdx++];
      if (!groupMembers.includes(candidate)) {
        groupMembers.push(candidate);
      }
    }

    if (groupMembers.length === 4) {
      const seedId = i < topSeeds.length ? topSeeds[i] : null;
      const group = createDualTournamentGroup(groupId, groupMembers, 'r32', '1WIN', seedId);
      round32Groups.push(group);
      round32AllMatches.push(...getDualGroupAllMatches(group));
    }
  }

  console.log('[processRound64Results] 32강', round32Groups.length, '조 생성');

  return {
    brackets: {
      ...brackets,
      round32Groups,
      round32: round32AllMatches,  // 호환성 유지 (플랫 배열)
    },
    participants: updatedParticipants,
  };
}

/**
 * 32강 듀얼 토너먼트 결과 처리 → 16강 싱글 엘리미네이션 생성
 */
export function processRound32Results(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): { brackets: IndividualBrackets; participants: LeagueParticipant[]; round16Qualifiers: string[] } {
  const round16Qualifiers: string[] = [];
  const eliminatedIds: string[] = [];

  if (!brackets.round32Groups || brackets.round32Groups.length === 0) {
    console.error('[processRound32Results] round32Groups가 없습니다');
    return { brackets, participants, round16Qualifiers };
  }

  // 각 조별 1,2위 진출, 3,4위 탈락
  brackets.round32Groups.forEach(group => {
    if (group.firstPlace) round16Qualifiers.push(group.firstPlace);
    if (group.secondPlace) round16Qualifiers.push(group.secondPlace);
    if (group.thirdPlace) eliminatedIds.push(group.thirdPlace);
    if (group.fourthPlace) eliminatedIds.push(group.fourthPlace);

    console.log(`[processRound32Results] ${group.id}조: 1위=${group.firstPlace}, 2위=${group.secondPlace}`);
  });

  // 탈락자 처리
  const updatedParticipants = participants.map(p => {
    if (eliminatedIds.includes(p.odId) && p.status !== 'ELIMINATED') {
      return { ...p, status: 'ELIMINATED' as const, eliminatedAt: 'ROUND_32' as const };
    }
    return p;
  });

  // 16강 대진 생성 (교차 대진)
  const round16Matches = generateRound16Matches(
    brackets.round32Groups,
    participants.filter(p => p.isPlayerCrew).map(p => p.odId)
  );

  console.log('[processRound32Results] 16강 진출자:', round16Qualifiers.length, '명');

  return {
    brackets: { ...brackets, round16Matches },
    participants: updatedParticipants,
    round16Qualifiers
  };
}

/**
 * 16강 토너먼트 결과 처리 및 8강 대진 생성
 */
export function processRound16Results(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): { brackets: IndividualBrackets; participants: LeagueParticipant[] } {
  const quarterParticipants: string[] = [];
  const eliminatedIds: string[] = [];

  const round16Matches = brackets.round16Matches || [];
  for (const match of round16Matches) {
    if (match.winner) {
      quarterParticipants.push(match.winner);
      const loserId = match.winner === match.participant1 ? match.participant2 : match.participant1;
      eliminatedIds.push(loserId);
    }
  }

  const updatedParticipants = participants.map(p => {
    if (eliminatedIds.includes(p.odId) && p.status !== 'ELIMINATED') {
      return { ...p, status: 'ELIMINATED' as const, eliminatedAt: 'ROUND_16' as const };
    }
    return p;
  });

  const playerCrewIds = participants.filter(p => p.isPlayerCrew).map(p => p.odId);
  const quarterMatches = generateQuarterMatches(quarterParticipants, playerCrewIds);

  console.log('[processRound16Results] 8강 진출자:', quarterParticipants.length, '명');

  return {
    brackets: { ...brackets, quarter: quarterMatches },
    participants: updatedParticipants
  };
}

/**
 * 8강 결과 처리 및 4강 대진 생성
 */
export function processQuarterResults(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): { brackets: IndividualBrackets; participants: LeagueParticipant[] } {
  const semiParticipants: string[] = [];

  // 8강 승자 수집 및 탈락자 ID 수집
  const eliminatedIds: string[] = [];
  for (const match of brackets.quarter) {
    if (match.winner) {
      semiParticipants.push(match.winner);

      const loserId = match.winner === match.participant1
        ? match.participant2
        : match.participant1;
      if (loserId) eliminatedIds.push(loserId);
    }
  }

  // 불변 업데이트로 탈락자 처리
  participants = participants.map(p =>
    eliminatedIds.includes(p.odId)
      ? { ...p, status: 'ELIMINATED' as const, eliminatedAt: 'QUARTER' as const }
      : p
  );

  // 4강 대진 생성 (2경기)
  const semiMatches: IndividualMatch[] = [];
  for (let i = 0; i < 2; i++) {
    semiMatches.push({
      id: `semi_${i + 1}`,
      participant1: semiParticipants[i * 2],
      participant2: semiParticipants[i * 2 + 1],
      winner: null,
      score: { p1: 0, p2: 0 },
      format: '3WIN',
      played: false
    });
  }

  return {
    brackets: { ...brackets, semi: semiMatches },
    participants
  };
}

/**
 * 4강 결과 처리 및 결승/3,4위전 대진 생성
 */
export function processSemiResults(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): { brackets: IndividualBrackets; participants: LeagueParticipant[] } {
  const finalParticipants: string[] = [];  // 4강 승자 (결승 진출)
  const thirdPlaceParticipants: string[] = [];  // 4강 패자 (3/4위전 진출)

  // 4강 승자/패자 수집
  for (const match of brackets.semi) {
    if (match.winner) {
      finalParticipants.push(match.winner);

      const loserId = match.winner === match.participant1
        ? match.participant2
        : match.participant1;
      thirdPlaceParticipants.push(loserId);

      // 4강 패자는 아직 ELIMINATED 처리하지 않음 (3/4위전 진행 후 처리)
    }
  }

  // 결승 대진 생성
  const finalMatch: IndividualMatch = {
    id: 'final',
    participant1: finalParticipants[0],
    participant2: finalParticipants[1],
    winner: null,
    score: { p1: 0, p2: 0 },
    format: '3WIN',
    played: false
  };

  // 3/4위전 대진 생성
  const thirdPlaceMatch: IndividualMatch = {
    id: 'third_place',
    participant1: thirdPlaceParticipants[0],
    participant2: thirdPlaceParticipants[1],
    winner: null,
    score: { p1: 0, p2: 0 },
    format: '3WIN',  // 5판 3선승
    played: false
  };

  console.log('[processSemiResults] 결승/3,4위전 생성:', {
    final: [finalParticipants[0], finalParticipants[1]],
    thirdPlace: [thirdPlaceParticipants[0], thirdPlaceParticipants[1]],
  });

  return {
    brackets: { ...brackets, final: finalMatch, thirdPlace: thirdPlaceMatch },
    participants
  };
}

/**
 * 결승/3,4위전 결과 처리
 */
export function processFinalResult(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): {
  brackets: IndividualBrackets;
  participants: LeagueParticipant[];
  champion: string | null;
  runnerUp: string | null;
  thirdPlace: string | null;
  fourthPlace: string | null;
} {
  const finalMatch = brackets.final;
  const thirdPlaceMatch = brackets.thirdPlace;

  let champion: string | null = null;
  let runnerUp: string | null = null;
  let thirdPlace: string | null = null;
  let fourthPlace: string | null = null;

  // 결승 결과 처리
  if (finalMatch && finalMatch.winner) {
    champion = finalMatch.winner;
    runnerUp = finalMatch.winner === finalMatch.participant1
      ? finalMatch.participant2
      : finalMatch.participant1;

    // 준우승자 탈락 처리 (불변 업데이트)
    if (runnerUp) {
      participants = participants.map(p =>
        p.odId === runnerUp
          ? { ...p, status: 'ELIMINATED' as const, eliminatedAt: 'FINAL' as const }
          : p
      );
    }
  }

  // 3/4위전 결과 처리
  if (thirdPlaceMatch && thirdPlaceMatch.winner) {
    thirdPlace = thirdPlaceMatch.winner;
    fourthPlace = thirdPlaceMatch.winner === thirdPlaceMatch.participant1
      ? thirdPlaceMatch.participant2
      : thirdPlaceMatch.participant1;

    // 4위, 3위 탈락 처리 (불변 업데이트)
    participants = participants.map(p => {
      if (p.odId === fourthPlace) {
        return { ...p, status: 'ELIMINATED' as const, eliminatedAt: 'SEMI' as const };
      }
      if (p.odId === thirdPlace) {
        return { ...p, status: 'ELIMINATED' as const };
      }
      return p;
    });
  }

  console.log('[processFinalResult] 최종 결과:', {
    champion,
    runnerUp,
    thirdPlace,
    fourthPlace,
  });

  return { brackets, participants, champion, runnerUp, thirdPlace, fourthPlace };
}

// ========================================
// 다음 경기 찾기
// ========================================

/**
 * 플레이어 카드의 다음 경기 찾기
 */
/**
 * 듀얼 토너먼트 그룹 배열에서 플레이어 매치 찾기 (공통 헬퍼)
 */
function findPlayerMatchInDualGroups(
  groups: DualTournamentGroup[],
  playerCardIds: string[],
  matchType: 'round64' | 'round32'
): {
  match: IndividualMatch;
  matchType: 'round64' | 'round32' | 'round16' | 'quarter' | 'semi' | 'final';
  groupId: string;
  opponentId: string;
  playerCardId: string;
} | null {
  for (const group of groups) {
    const nextMatch = findNextDualGroupMatch(group);
    if (!nextMatch || !nextMatch.participant1 || !nextMatch.participant2) continue;

    const isP1Player = playerCardIds.includes(nextMatch.participant1);
    const isP2Player = playerCardIds.includes(nextMatch.participant2);

    if (isP1Player || isP2Player) {
      const playerCardId = isP1Player ? nextMatch.participant1 : nextMatch.participant2;
      const opponentId = isP1Player ? nextMatch.participant2 : nextMatch.participant1;
      return { match: nextMatch, matchType, groupId: group.id, opponentId, playerCardId };
    }
  }
  return null;
}

export function findNextPlayerMatch(
  league: IndividualLeague
): {
  match: IndividualMatch | null;
  matchType: 'round64' | 'round32' | 'round16' | 'quarter' | 'semi' | 'final' | null;
  groupId?: string;
  opponentId: string | null;
  playerCardId: string | null;
} | null {
  const playerCardIds = league.participants
    .filter(p => p.isPlayerCrew && p.status === 'ACTIVE')
    .map(p => p.odId);

  if (playerCardIds.length === 0) return null;

  const status = league.status;

  // 64강 듀얼 토너먼트
  if (status === 'ROUND_64' && league.brackets.round64Groups) {
    const result = findPlayerMatchInDualGroups(league.brackets.round64Groups, playerCardIds, 'round64');
    if (result) return result;
  }

  // 32강 듀얼 토너먼트
  if (status === 'ROUND_32' && league.brackets.round32Groups && league.brackets.round32Groups.length > 0) {
    const result = findPlayerMatchInDualGroups(league.brackets.round32Groups, playerCardIds, 'round32');
    if (result) return result;
  }

  // 16강 싱글 엘리미네이션
  if (status === 'ROUND_16') {
    const round16Matches = league.brackets.round16Matches || [];
    for (const match of round16Matches) {
      if (!match.played) {
        const isP1Player = playerCardIds.includes(match.participant1);
        const isP2Player = playerCardIds.includes(match.participant2);
        if (isP1Player || isP2Player) {
          const playerCardId = isP1Player ? match.participant1 : match.participant2;
          const opponentId = isP1Player ? match.participant2 : match.participant1;
          return { match, matchType: 'round16', opponentId, playerCardId };
        }
      }
    }
  }

  // 8강
  if (status === 'QUARTER') {
    for (const match of league.brackets.quarter) {
      if (!match.played) {
        const isP1Player = playerCardIds.includes(match.participant1);
        const isP2Player = playerCardIds.includes(match.participant2);
        if (isP1Player || isP2Player) {
          const playerCardId = isP1Player ? match.participant1 : match.participant2;
          const opponentId = isP1Player ? match.participant2 : match.participant1;
          return { match, matchType: 'quarter', opponentId, playerCardId };
        }
      }
    }
  }

  // 4강
  if (status === 'SEMI') {
    for (const match of league.brackets.semi) {
      if (!match.played) {
        const isP1Player = playerCardIds.includes(match.participant1);
        const isP2Player = playerCardIds.includes(match.participant2);
        if (isP1Player || isP2Player) {
          const playerCardId = isP1Player ? match.participant1 : match.participant2;
          const opponentId = isP1Player ? match.participant2 : match.participant1;
          return { match, matchType: 'semi', opponentId, playerCardId };
        }
      }
    }
  }

  // 결승 / 3,4위전
  if (status === 'FINAL') {
    if (league.brackets.final && !league.brackets.final.played) {
      const match = league.brackets.final;
      const isP1Player = playerCardIds.includes(match.participant1);
      const isP2Player = playerCardIds.includes(match.participant2);
      if (isP1Player || isP2Player) {
        const playerCardId = isP1Player ? match.participant1 : match.participant2;
        const opponentId = isP1Player ? match.participant2 : match.participant1;
        return { match, matchType: 'final', opponentId, playerCardId };
      }
    }

    if (league.brackets.thirdPlace && !league.brackets.thirdPlace.played) {
      const match = league.brackets.thirdPlace;
      const isP1Player = playerCardIds.includes(match.participant1);
      const isP2Player = playerCardIds.includes(match.participant2);
      if (isP1Player || isP2Player) {
        const playerCardId = isP1Player ? match.participant1 : match.participant2;
        const opponentId = isP1Player ? match.participant2 : match.participant1;
        return { match, matchType: 'final', opponentId, playerCardId };
      }
    }
  }

  return null;
}

/**
 * 현재 라운드의 모든 경기가 완료되었는지 확인
 */
export function isRoundComplete(league: IndividualLeague): boolean {
  const status = league.status;

  if (status === 'ROUND_64') {
    // 64강 듀얼 토너먼트: 모든 조 완료
    const groups = league.brackets.round64Groups || [];
    return groups.length > 0 && groups.every(g => g.isCompleted);
  }

  if (status === 'ROUND_32') {
    // 32강 듀얼 토너먼트: 모든 조 완료
    const groups = league.brackets.round32Groups || [];
    return groups.length > 0 && groups.every(g => g.isCompleted);
  }

  if (status === 'ROUND_16') {
    const round16Matches = league.brackets.round16Matches || [];
    return round16Matches.length > 0 && round16Matches.every(m => m.played);
  }

  if (status === 'QUARTER') {
    return league.brackets.quarter.every(m => m.played);
  }

  if (status === 'SEMI') {
    return league.brackets.semi.every(m => m.played);
  }

  if (status === 'FINAL') {
    const finalDone = league.brackets.final?.played ?? false;
    const thirdPlaceDone = league.brackets.thirdPlace?.played ?? true;
    return finalDone && thirdPlaceDone;
  }

  return false;
}

/**
 * 다음 라운드 상태 가져오기
 */
export function getNextRoundStatus(current: IndividualLeagueStatus): IndividualLeagueStatus {
  const progression: Record<IndividualLeagueStatus, IndividualLeagueStatus> = {
    'NOT_STARTED': 'ROUND_64',
    'ROUND_64': 'ROUND_32',       // 64강 듀얼 토너먼트 → 32강 듀얼 토너먼트
    'ROUND_32': 'ROUND_16',       // 32강 듀얼 토너먼트 → 16강 싱글 엘리미네이션
    'ROUND_16': 'QUARTER',
    'QUARTER': 'SEMI',
    'SEMI': 'FINAL',
    'FINAL': 'FINISHED',
    'FINISHED': 'FINISHED'
  };
  return progression[current];
}

// ========================================
// 플레이어 카드 현황
// ========================================

/**
 * 플레이어 카드별 현재 상태 가져오기
 */
export function getPlayerCardStatuses(league: IndividualLeague): {
  odId: string;
  odName: string;
  status: 'ACTIVE' | 'ELIMINATED';
  currentStage: IndividualLeagueStatus;
  nextMatchInfo: string | null;
  wins: number;
  matchPlayed: boolean;         // 현재 라운드에서 경기 진행 여부
  matchWon: boolean | null;     // 현재 라운드 경기 승패 (null = 미진행)
  lastOpponentName: string | null;  // 마지막 경기 상대 이름
}[] {
  const results: ReturnType<typeof getPlayerCardStatuses> = [];

  for (const participant of league.participants) {
    if (!participant.isPlayerCrew) continue;

    let wins = 0;
    let nextMatchInfo: string | null = null;
    let matchPlayed = false;
    let matchWon: boolean | null = null;
    let lastOpponentName: string | null = null;

    // 듀얼 토너먼트 매치에서 승수 집계 헬퍼
    const countWinsInDualGroups = (groups: DualTournamentGroup[] | undefined) => {
      if (!groups) return;
      for (const group of groups) {
        const allMatches = getDualGroupAllMatches(group);
        for (const m of allMatches) {
          if (m.played && m.winner === participant.odId) wins++;
        }
      }
    };

    // 64강 경기
    countWinsInDualGroups(league.brackets.round64Groups);

    // 32강 경기 (듀얼 토너먼트)
    countWinsInDualGroups(league.brackets.round32Groups);

    // 16강 싱글 엘리미네이션
    const round16Matches = league.brackets.round16Matches || [];
    for (const m of round16Matches) {
      if (m.played && m.winner === participant.odId) wins++;
    }

    // 8강
    const quarterMatch = league.brackets.quarter.find(
      m => m.participant1 === participant.odId || m.participant2 === participant.odId
    );
    if (quarterMatch?.winner === participant.odId) wins++;
    if (league.status === 'QUARTER' && quarterMatch?.played) {
      matchPlayed = true;
      const opponentId = quarterMatch.participant1 === participant.odId
        ? quarterMatch.participant2
        : quarterMatch.participant1;
      const opponent = CHARACTERS_BY_ID[opponentId];
      lastOpponentName = opponent?.name.ko || '???';
      matchWon = quarterMatch.winner === participant.odId;
    }

    // 4강
    const semiMatch = league.brackets.semi.find(
      m => m.participant1 === participant.odId || m.participant2 === participant.odId
    );
    if (semiMatch?.winner === participant.odId) wins++;
    if (league.status === 'SEMI' && semiMatch?.played) {
      matchPlayed = true;
      const opponentId = semiMatch.participant1 === participant.odId
        ? semiMatch.participant2
        : semiMatch.participant1;
      const opponent = CHARACTERS_BY_ID[opponentId];
      lastOpponentName = opponent?.name.ko || '???';
      matchWon = semiMatch.winner === participant.odId;
    }

    // 결승
    if (league.brackets.final?.winner === participant.odId) wins++;
    if (league.status === 'FINAL' && league.brackets.final?.played) {
      const finalMatch = league.brackets.final;
      if (finalMatch.participant1 === participant.odId || finalMatch.participant2 === participant.odId) {
        matchPlayed = true;
        const opponentId = finalMatch.participant1 === participant.odId
          ? finalMatch.participant2
          : finalMatch.participant1;
        const opponent = CHARACTERS_BY_ID[opponentId];
        lastOpponentName = opponent?.name.ko || '???';
        matchWon = finalMatch.winner === participant.odId;
      }
    }

    // 3/4위전
    if (league.brackets.thirdPlace?.winner === participant.odId) wins++;
    if (league.status === 'FINAL' && league.brackets.thirdPlace?.played) {
      const thirdPlaceMatch = league.brackets.thirdPlace;
      if (thirdPlaceMatch.participant1 === participant.odId || thirdPlaceMatch.participant2 === participant.odId) {
        matchPlayed = true;
        const opponentId = thirdPlaceMatch.participant1 === participant.odId
          ? thirdPlaceMatch.participant2
          : thirdPlaceMatch.participant1;
        const opponent = CHARACTERS_BY_ID[opponentId];
        lastOpponentName = opponent?.name.ko || '???';
        matchWon = thirdPlaceMatch.winner === participant.odId;
      }
    }

    // 다음 경기 정보
    if (participant.status === 'ACTIVE' && !matchPlayed) {
      const nextMatch = findNextPlayerMatch(league);
      if (nextMatch && nextMatch.playerCardId === participant.odId) {
        const opponent = CHARACTERS_BY_ID[nextMatch.opponentId!];
        nextMatchInfo = `vs ${opponent?.name.ko || '???'}`;
      }
    }

    results.push({
      odId: participant.odId,
      odName: participant.odName,
      status: participant.status,
      currentStage: participant.eliminatedAt || league.status,
      nextMatchInfo,
      wins,
      matchPlayed,
      matchWon,
      lastOpponentName,
    });
  }

  return results;
}

/**
 * 16강 조별 승리 수 업데이트
 */
export function updateGroupWins(
  group: LeagueGroup,
  match: IndividualMatch
): LeagueGroup {
  if (!match.winner) return group;

  const newWinsCount = { ...group.winsCount };
  newWinsCount[match.winner] = (newWinsCount[match.winner] || 0) + 1;

  // 2선승 확인
  let groupWinner: string | null = null;
  if (newWinsCount[match.winner] >= 2) {
    groupWinner = match.winner;
  }

  return {
    ...group,
    winsCount: newWinsCount,
    winner: groupWinner
  };
}

// ========================================
// Step 2.5b-1: 순위 및 개인상 시스템
// ========================================

// 최종 순위 인터페이스
export interface FinalRanking {
  rank: number;
  odId: string;
  odName: string;
  crewName: string;
  isPlayerCrew: boolean;
  eliminatedAt: IndividualLeagueStatus | 'CHAMPION';
  wins: number;
  losses: number;
  setDiff: number;      // 세트 득실차
  totalStats: number;   // 총 스탯
  exp: number;          // 획득 경험치
}

// 개인상 인터페이스
export interface LeagueAward {
  type: 'MVP' | 'MOST_WINS' | 'DARK_HORSE';
  title: string;
  icon: string;
  odId: string;
  odName: string;
  description: string;
}

// 개인리그 최종 순위별 경험치
export const INDIVIDUAL_LEAGUE_EXP: Record<string, number> = {
  '1': 350,    // 우승
  '2': 300,    // 준우승
  '3': 250,    // 3위
  '4': 200,    // 4위
  '5-8': 150,  // 8강 탈락 (5~8위)
  '9-16': 100, // 16강 탈락 (9~16위)
  '17-32': 50, // 32강 탈락 (17~32위)
  '33-64': 0,  // 64강 탈락 (경험치 없음)
};

// 순위로 경험치 가져오기
export function getExpByRank(rank: number): number {
  if (rank === 1) return 350;
  if (rank === 2) return 300;
  if (rank === 3) return 250;
  if (rank === 4) return 200;
  if (rank >= 5 && rank <= 8) return 150;
  if (rank >= 9 && rank <= 16) return 100;
  if (rank >= 17 && rank <= 32) return 50;
  return 0; // 33-64위 (64강 탈락)
}

// 참가자별 성적 집계 (듀얼 토너먼트 대응)
export function calculateParticipantStats(
  league: IndividualLeague,
  odId: string
): { wins: number; losses: number; setDiff: number } {
  let wins = 0;
  let losses = 0;
  let setsWon = 0;
  let setsLost = 0;

  // 매치에서 성적 집계하는 헬퍼
  const countFromMatch = (match: IndividualMatch) => {
    if (!match.played) return;
    if (match.participant1 !== odId && match.participant2 !== odId) return;

    const isParticipant1 = match.participant1 === odId;

    if (match.winner === odId) {
      wins++;
    } else if (match.winner) {
      losses++;
    }

    if (isParticipant1) {
      setsWon += match.score.p1;
      setsLost += match.score.p2;
    } else {
      setsWon += match.score.p2;
      setsLost += match.score.p1;
    }
  };

  // 듀얼 토너먼트 그룹에서 집계하는 헬퍼
  const countFromDualGroups = (groups: DualTournamentGroup[] | undefined) => {
    if (!groups) return;
    for (const group of groups) {
      getDualGroupAllMatches(group).forEach(countFromMatch);
    }
  };

  // 1. 64강 듀얼 토너먼트
  countFromDualGroups(league.brackets.round64Groups);

  // 2. 32강 듀얼 토너먼트
  countFromDualGroups(league.brackets.round32Groups);

  // 3. 16강 싱글 엘리미네이션
  const round16Matches = league.brackets.round16Matches || [];
  round16Matches.forEach(countFromMatch);

  // 4. 8강
  league.brackets.quarter.forEach(countFromMatch);

  // 5. 4강
  league.brackets.semi.forEach(countFromMatch);

  // 6. 결승
  if (league.brackets.final) countFromMatch(league.brackets.final);

  // 7. 3,4위전
  if (league.brackets.thirdPlace) countFromMatch(league.brackets.thirdPlace);

  return { wins, losses, setDiff: setsWon - setsLost };
}

// 최종 순위 계산 (공동 순위 없음)
export function calculateFinalRankings(league: IndividualLeague): FinalRanking[] {
  const rankings: FinalRanking[] = [];

  // 참가자별 성적 집계
  league.participants.forEach(participant => {
    const stats = calculateParticipantStats(league, participant.odId);
    const card = CHARACTERS_BY_ID[participant.odId];

    rankings.push({
      rank: 0, // 나중에 계산
      odId: participant.odId,
      odName: participant.odName,
      crewName: participant.crewName,
      isPlayerCrew: participant.isPlayerCrew,
      eliminatedAt: participant.odId === league.champion
        ? 'CHAMPION'
        : participant.eliminatedAt || 'ROUND_64',
      wins: stats.wins,
      losses: stats.losses,
      setDiff: stats.setDiff,
      totalStats: card ? calculateTotalStat(card) : 0,
      exp: 0, // 나중에 계산
    });
  });

  // 정렬: 탈락 라운드 > 승수 > 세트득실차 > 총스탯
  const roundOrder: Record<string, number> = {
    'CHAMPION': 0,
    'FINAL': 1,
    'SEMI': 2,
    'QUARTER': 3,
    'ROUND_16': 4,
    'ROUND_32': 5,
    'ROUND_64': 6,
  };

  rankings.sort((a, b) => {
    // 1순위: 탈락 라운드
    const roundDiff = roundOrder[a.eliminatedAt] - roundOrder[b.eliminatedAt];
    if (roundDiff !== 0) return roundDiff;

    // 2순위: 승수
    if (b.wins !== a.wins) return b.wins - a.wins;

    // 3순위: 세트 득실차
    if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff;

    // 4순위: 총 스탯
    return b.totalStats - a.totalStats;
  });

  // 순위 및 경험치 할당
  rankings.forEach((r, index) => {
    r.rank = index + 1;
    r.exp = getExpByRank(r.rank);
  });

  return rankings;
}

// 압승 횟수 계산 (HP 70% 이상 남기고 승리)
function calculateDominantWins(league: IndividualLeague): Record<string, number> {
  const dominantWins: Record<string, number> = {};

  // 모든 경기 결과에서 압승 집계
  // 참가자별 dominantWins가 있으면 사용
  league.participants.forEach(p => {
    if (p.dominantWins) {
      dominantWins[p.odId] = p.dominantWins;
    } else {
      dominantWins[p.odId] = 0;
    }
  });

  return dominantWins;
}

// 개인상 계산 (Phase 3 - 3개 모두 표시)
export function calculateAwards(
  league: IndividualLeague,
  rankings: FinalRanking[]
): LeagueAward[] {
  const awards: LeagueAward[] = [];

  // MVP: 가장 많은 승리 + 압승 (HP 70%+ 남기고 승리)
  const dominantWins = calculateDominantWins(league);
  const mvpCandidates = rankings.map(r => ({
    ...r,
    dominantWins: dominantWins[r.odId] || 0,
    mvpScore: r.wins * 2 + (dominantWins[r.odId] || 0),
  }));
  mvpCandidates.sort((a, b) => b.mvpScore - a.mvpScore);

  if (mvpCandidates[0]) {
    awards.push({
      type: 'MVP',
      title: 'MVP',
      icon: '🏆',
      odId: mvpCandidates[0].odId,
      odName: mvpCandidates[0].odName,
      description: `${mvpCandidates[0].wins}승, 압승 ${mvpCandidates[0].dominantWins}회`,
    });
  }

  // 최다승: 단순 승수 1위 (항상 표시)
  const mostWins = [...rankings].sort((a, b) => b.wins - a.wins)[0];
  if (mostWins) {
    awards.push({
      type: 'MOST_WINS',
      title: '최다승',
      icon: '🔥',
      odId: mostWins.odId,
      odName: mostWins.odName,
      description: `${mostWins.wins}승`,
    });
  }

  // 다크호스: 세트 득실차 가장 큰 상승 or 낮은 등급에서 높은 순위
  const gradeOrder = ['특급', '준특급', '1급', '준1급', '2급', '준2급', '3급', '준3급', '비술사'];

  // 먼저 낮은 등급에서 높은 순위(8강 이상)를 찾기
  const darkHorseCandidates = rankings
    .filter(r => r.rank <= 8) // 8강 이상
    .map(r => {
      const card = CHARACTERS_BY_ID[r.odId];
      const gradeIndex = gradeOrder.indexOf(card?.grade || '비술사');
      return { ...r, gradeIndex, grade: card?.grade };
    })
    .filter(r => r.gradeIndex >= 4) // 2급 이하
    .sort((a, b) => {
      // 등급이 낮을수록(인덱스 높을수록) + 순위가 높을수록 다크호스
      const gradeScore = b.gradeIndex - a.gradeIndex;
      if (gradeScore !== 0) return gradeScore;
      return a.rank - b.rank;
    });

  if (darkHorseCandidates[0]) {
    awards.push({
      type: 'DARK_HORSE',
      title: '다크호스',
      icon: '🌟',
      odId: darkHorseCandidates[0].odId,
      odName: darkHorseCandidates[0].odName,
      description: `${darkHorseCandidates[0].grade}, ${darkHorseCandidates[0].rank}위`,
    });
  } else {
    // 낮은 등급에서 높은 순위가 없으면, 세트 득실차가 가장 큰 참가자 선정
    const setDiffLeader = [...rankings].sort((a, b) => b.setDiff - a.setDiff)[0];
    if (setDiffLeader && setDiffLeader.setDiff > 0) {
      awards.push({
        type: 'DARK_HORSE',
        title: '다크호스',
        icon: '🌟',
        odId: setDiffLeader.odId,
        odName: setDiffLeader.odName,
        description: `세트 +${setDiffLeader.setDiff}`,
      });
    }
  }

  return awards;
}

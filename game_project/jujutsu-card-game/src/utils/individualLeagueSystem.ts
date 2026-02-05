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
  CharacterCard
} from '../types';
import { CHARACTERS_BY_ID, ALL_CHARACTERS } from '../data/characters';

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
 * 32명 참가자 생성 (등급순 선발 + 시드 시스템)
 * - 등급별 내림차순으로 강한 순 32명 선발
 * - 같은 등급 내에서는 총 스탯 합계 높은 순
 * - 시드 4명은 A, B, C, D조에 각각 배치 (시즌 2부터)
 */
export function generateParticipants(
  playerCrewIds: string[],
  playerCrewName: string = '내 크루',
  seeds: string[] = []  // 전 시즌 1~4위 (시즌 2부터)
): LeagueParticipant[] {
  // 모든 캐릭터를 등급순 + 스탯순으로 정렬
  const sortedCharacters = [...ALL_CHARACTERS].sort((a, b) => {
    const gradeA = getGradePriority(a.grade);
    const gradeB = getGradePriority(b.grade);
    if (gradeB !== gradeA) return gradeB - gradeA;

    // 같은 등급이면 총 스탯으로 비교
    const totalA = calculateTotalStat(a);
    const totalB = calculateTotalStat(b);
    return totalB - totalA;
  });

  // 시드 참가자 먼저 추가 (최대 4명)
  const seedParticipants: LeagueParticipant[] = [];
  const seedIds = new Set<string>();

  for (const seedId of seeds.slice(0, 4)) {
    const card = CHARACTERS_BY_ID[seedId];
    if (card) {
      const isPlayer = playerCrewIds.includes(seedId);
      seedParticipants.push({
        odId: card.id,
        odName: card.name.ko,
        crewId: isPlayer ? 'PLAYER_CREW' : `AI_CREW_${Math.random().toString(36).slice(2, 6)}`,
        crewName: isPlayer ? playerCrewName : getRandomCrewName(),
        isPlayerCrew: isPlayer,
        status: 'ACTIVE',
        totalStats: calculateTotalStat(card),
      });
      seedIds.add(seedId);
    }
  }

  // 나머지 참가자 선발 (32명 - 시드 수)
  const neededCount = 32 - seedParticipants.length;
  const participants: LeagueParticipant[] = [];

  for (const card of sortedCharacters) {
    if (participants.length >= neededCount) break;
    if (seedIds.has(card.id)) continue;  // 시드는 제외

    const isPlayer = playerCrewIds.includes(card.id);
    participants.push({
      odId: card.id,
      odName: card.name.ko,
      crewId: isPlayer ? 'PLAYER_CREW' : `AI_CREW_${Math.random().toString(36).slice(2, 6)}`,
      crewName: isPlayer ? playerCrewName : getRandomCrewName(),
      isPlayerCrew: isPlayer,
      status: 'ACTIVE',
      totalStats: calculateTotalStat(card),
    });
  }

  // 시드 배치: A, B, C, D조 첫 번째 위치에 배치
  // 나머지는 셔플 후 배치
  const shuffledParticipants = shuffleArray(participants);

  // 8조 × 4명 배치
  const finalParticipants: LeagueParticipant[] = [];
  const groupIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  let nonSeedIndex = 0;

  for (let groupIndex = 0; groupIndex < 8; groupIndex++) {
    const groupId = groupIds[groupIndex];

    // 시드 참가자는 A, B, C, D조 첫 번째 위치
    if (groupIndex < seedParticipants.length) {
      const seedP = { ...seedParticipants[groupIndex], groupId };
      finalParticipants.push(seedP);

      // 나머지 3명 추가
      for (let i = 0; i < 3; i++) {
        if (nonSeedIndex < shuffledParticipants.length) {
          finalParticipants.push({ ...shuffledParticipants[nonSeedIndex++], groupId });
        }
      }
    } else {
      // 시드 없는 조: 4명 모두 일반 참가자
      for (let i = 0; i < 4; i++) {
        if (nonSeedIndex < shuffledParticipants.length) {
          finalParticipants.push({ ...shuffledParticipants[nonSeedIndex++], groupId });
        }
      }
    }
  }

  console.log('[generateParticipants] 참가자 생성 완료:', {
    total: finalParticipants.length,
    seeds: seedParticipants.length,
    playerCards: finalParticipants.filter(p => p.isPlayerCrew).length,
  });

  return finalParticipants;
}

// ========================================
// 대진표 생성 (리팩토링 - 조별 풀 리그전)
// ========================================

/**
 * 32강 조별 리그 경기 생성
 * 8조 × 4명 = 32명, 각 조 풀 리그전 6경기 = 총 48경기
 */
function generateRound32GroupMatches(
  participants: LeagueParticipant[]
): { matches: IndividualMatch[]; groups: import('../types').Round32Group[] } {
  const matches: IndividualMatch[] = [];
  const groups: import('../types').Round32Group[] = [];
  const groupIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // 32명을 8개 조에 배분 (4명씩)
  for (let i = 0; i < 8; i++) {
    const groupId = groupIds[i];
    const groupParticipants = participants.slice(i * 4, (i + 1) * 4);
    const participantIds = groupParticipants.map(p => p.odId);

    // 조 정보 생성
    groups.push({
      id: groupId,
      participants: participantIds,
      matches: [],
      standings: participantIds.map(id => ({ odId: id, wins: 0, losses: 0 })),
      isCompleted: false
    });

    // 풀 리그전 경기 생성 (6경기)
    // 1vs2, 3vs4, 1vs3, 2vs4, 1vs4, 2vs3
    const matchups = [
      [0, 1], [2, 3], // 1라운드
      [0, 2], [1, 3], // 2라운드
      [0, 3], [1, 2], // 3라운드
    ];

    matchups.forEach((pair, matchIndex) => {
      const p1 = participantIds[pair[0]];
      const p2 = participantIds[pair[1]];

      matches.push({
        id: `r32_${groupId}_${matchIndex + 1}`,
        participant1: p1,
        participant2: p2,
        winner: null,
        score: { p1: 0, p2: 0 },
        format: '1WIN',  // 단판
        played: false,
        groupId: groupId
      });
    });
  }

  console.log('[generateRound32GroupMatches] 총 경기 수:', matches.length, '(8조 × 6경기)');
  return { matches, groups };
}

/**
 * 초기 대진표 생성 (리팩토링)
 */
export function generateInitialBrackets(participants: LeagueParticipant[]): IndividualBrackets {
  const { matches, groups } = generateRound32GroupMatches(participants);

  return {
    round32: matches,
    round32Groups: groups,
    round16: [],           // 호환성 유지 (사용 안 함)
    round16Matches: [],    // 16강 토너먼트 (32강 완료 후 생성)
    quarter: [],
    semi: [],
    final: null
  };
}

/**
 * 16강 토너먼트 대진 생성 (교차 대진)
 * A조 1위 vs B조 2위, A조 2위 vs B조 1위
 * C조 1위 vs D조 2위, C조 2위 vs D조 1위
 * E조 1위 vs F조 2위, E조 2위 vs F조 1위
 * G조 1위 vs H조 2위, G조 2위 vs H조 1위
 */
export function generateRound16Matches(
  round32Groups: import('../types').Round32Group[],
  _playerCrewIds: string[]
): IndividualMatch[] {
  // 조별로 순위 정렬하여 1위, 2위 추출
  const groupRankings: Record<string, { first: string; second: string }> = {};

  round32Groups.forEach(group => {
    // 순위 정렬 (승수 > 득실차)
    const sorted = [...group.standings].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const diffA = a.wins - a.losses;
      const diffB = b.wins - b.losses;
      return diffB - diffA;
    });

    groupRankings[group.id] = {
      first: sorted[0].odId,
      second: sorted[1].odId,
    };

    console.log(`[generateRound16Matches] ${group.id}조: 1위=${sorted[0].odId}, 2위=${sorted[1].odId}`);
  });

  // 교차 대진: 인접 조끼리 교차 (A-B, C-D, E-F, G-H)
  const matchups = [
    // A-B 교차
    [groupRankings['A'].first, groupRankings['B'].second],   // A1 vs B2
    [groupRankings['A'].second, groupRankings['B'].first],   // A2 vs B1
    // C-D 교차
    [groupRankings['C'].first, groupRankings['D'].second],   // C1 vs D2
    [groupRankings['C'].second, groupRankings['D'].first],   // C2 vs D1
    // E-F 교차
    [groupRankings['E'].first, groupRankings['F'].second],   // E1 vs F2
    [groupRankings['E'].second, groupRankings['F'].first],   // E2 vs F1
    // G-H 교차
    [groupRankings['G'].first, groupRankings['H'].second],   // G1 vs H2
    [groupRankings['G'].second, groupRankings['H'].first],   // G2 vs H1
  ];

  const matches: IndividualMatch[] = matchups.map((pair, index) => ({
    id: `r16_${index + 1}`,
    participant1: pair[0],
    participant2: pair[1],
    winner: null,
    score: { p1: 0, p2: 0 },
    format: '2WIN',  // 16강: 3판 2선승
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
// 매치 시뮬레이션
// ========================================

/**
 * 캐릭터 총 스탯 계산
 */
export function calculateTotalStat(card: CharacterCard): number {
  const stats = card.baseStats;
  return (stats.atk || 0) + (stats.def || 0) + (stats.spd || 0) +
         (stats.ce || 0) + (stats.hp || 0);
}

/**
 * 단일 세트 승패 시뮬레이션
 */
function simulateSingleGame(card1: CharacterCard, card2: CharacterCard): 1 | 2 {
  const totalStat1 = calculateTotalStat(card1);
  const totalStat2 = calculateTotalStat(card2);

  // 스탯 기반 승률 계산
  const winChance1 = totalStat1 / (totalStat1 + totalStat2);

  // 약간의 랜덤 요소 추가 (완전 결정론적이지 않게)
  const adjustedChance = winChance1 * 0.7 + Math.random() * 0.3;

  return Math.random() < adjustedChance ? 1 : 2;
}

/**
 * 매치 시뮬레이션 (AI vs AI)
 */
export function simulateMatch(
  participant1Id: string,
  participant2Id: string,
  format: LeagueMatchFormat
): { winner: string; score: { p1: number; p2: number } } {
  const card1 = CHARACTERS_BY_ID[participant1Id];
  const card2 = CHARACTERS_BY_ID[participant2Id];

  if (!card1 || !card2) {
    // 카드가 없으면 랜덤 승자
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
    const gameWinner = simulateSingleGame(card1, card2);
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
// 라운드 진행 (리팩토링)
// ========================================

/**
 * 32강 조별 리그 결과 처리 및 16강 대진 생성
 * 각 조 상위 2명 진출, 하위 2명 탈락
 */
export function processRound32Results(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): { brackets: IndividualBrackets; participants: LeagueParticipant[]; round16Qualifiers: string[] } {
  const round16Qualifiers: string[] = [];
  const eliminatedIds: string[] = [];

  if (!brackets.round32Groups) {
    console.error('[processRound32Results] round32Groups가 없습니다');
    return { brackets, participants, round16Qualifiers };
  }

  // 각 조별 순위 계산 및 진출/탈락자 결정
  brackets.round32Groups.forEach(group => {
    // 순위 정렬 (승수 > 득실차 > 총합)
    const sorted = [...group.standings].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const diffA = a.wins - a.losses;
      const diffB = b.wins - b.losses;
      if (diffB !== diffA) return diffB - diffA;
      // 총합 비교
      const pA = participants.find(p => p.odId === a.odId);
      const pB = participants.find(p => p.odId === b.odId);
      return (pB?.totalStats || 0) - (pA?.totalStats || 0);
    });

    // 상위 2명 16강 진출
    round16Qualifiers.push(sorted[0].odId);
    round16Qualifiers.push(sorted[1].odId);

    console.log(`[processRound32Results] ${group.id}조: 1위=${sorted[0].odId}(${sorted[0].wins}승), 2위=${sorted[1].odId}(${sorted[1].wins}승)`);

    // 하위 2명 탈락
    eliminatedIds.push(sorted[2].odId);
    eliminatedIds.push(sorted[3].odId);
  });

  // 탈락자 처리
  const updatedParticipants = participants.map(p => {
    if (eliminatedIds.includes(p.odId) && p.status !== 'ELIMINATED') {
      return { ...p, status: 'ELIMINATED' as const, eliminatedAt: 'ROUND_32' as const };
    }
    return p;
  });

  // 16강 대진 생성
  const round16Matches = generateRound16Matches(brackets.round32Groups,
    participants.filter(p => p.isPlayerCrew).map(p => p.odId));

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

  // 16강 매치 결과에서 승자/패자 수집
  const round16Matches = brackets.round16Matches || [];
  for (const match of round16Matches) {
    if (match.winner) {
      quarterParticipants.push(match.winner);
      const loserId = match.winner === match.participant1 ? match.participant2 : match.participant1;
      eliminatedIds.push(loserId);
    }
  }

  // 탈락자 처리
  const updatedParticipants = participants.map(p => {
    if (eliminatedIds.includes(p.odId) && p.status !== 'ELIMINATED') {
      return { ...p, status: 'ELIMINATED' as const, eliminatedAt: 'ROUND_16' as const };
    }
    return p;
  });

  // 8강 대진 생성
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

  // 8강 승자 수집 및 탈락자 처리
  for (const match of brackets.quarter) {
    if (match.winner) {
      semiParticipants.push(match.winner);

      const loserId = match.winner === match.participant1
        ? match.participant2
        : match.participant1;
      const loser = participants.find(p => p.odId === loserId);
      if (loser) {
        loser.status = 'ELIMINATED';
        loser.eliminatedAt = 'QUARTER';
      }
    }
  }

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

    // 준우승자 탈락 처리
    const loser = participants.find(p => p.odId === runnerUp);
    if (loser) {
      loser.status = 'ELIMINATED';
      loser.eliminatedAt = 'FINAL';
    }
  }

  // 3/4위전 결과 처리
  if (thirdPlaceMatch && thirdPlaceMatch.winner) {
    thirdPlace = thirdPlaceMatch.winner;
    fourthPlace = thirdPlaceMatch.winner === thirdPlaceMatch.participant1
      ? thirdPlaceMatch.participant2
      : thirdPlaceMatch.participant1;

    // 4위 탈락 처리
    const loser4th = participants.find(p => p.odId === fourthPlace);
    if (loser4th) {
      loser4th.status = 'ELIMINATED';
      loser4th.eliminatedAt = 'SEMI';  // 4위는 SEMI 탈락으로 처리 (보상 기준)
    }

    // 3위도 탈락 처리 (토너먼트 종료)
    const third = participants.find(p => p.odId === thirdPlace);
    if (third) {
      third.status = 'ELIMINATED';
      // 3위는 별도 처리 필요 - 기존 IndividualLeagueStatus에 THIRD_PLACE 없음
      // 임시로 SEMI로 처리하되, thirdPlace 필드로 구분
    }
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
export function findNextPlayerMatch(
  league: IndividualLeague
): {
  match: IndividualMatch | null;
  matchType: 'round32' | 'round16' | 'quarter' | 'semi' | 'final' | null;
  groupId?: string;
  opponentId: string | null;
  playerCardId: string | null;
} | null {
  const playerCardIds = league.participants
    .filter(p => p.isPlayerCrew && p.status === 'ACTIVE')
    .map(p => p.odId);

  console.log('[findNextPlayerMatch] 현재 상태:', league.status);
  console.log('[findNextPlayerMatch] 활성 플레이어 카드:', playerCardIds);

  if (playerCardIds.length === 0) {
    console.log('[findNextPlayerMatch] 활성 플레이어 카드 없음');
    return null;  // 모든 플레이어 카드 탈락
  }

  // 현재 라운드에 따라 매치 찾기
  const status = league.status;

  if (status === 'ROUND_32') {
    const unplayedMatches = league.brackets.round32.filter(m => !m.played);
    console.log('[findNextPlayerMatch] 32강 미진행 경기 수:', unplayedMatches.length);

    for (const match of league.brackets.round32) {
      if (!match.played) {
        const isP1Player = playerCardIds.includes(match.participant1);
        const isP2Player = playerCardIds.includes(match.participant2);

        if (isP1Player || isP2Player) {
          const playerCardId = isP1Player ? match.participant1 : match.participant2;
          const opponentId = isP1Player ? match.participant2 : match.participant1;
          console.log('[findNextPlayerMatch] 32강 다음 경기 찾음:', { matchId: match.id, playerCardId, opponentId });
          return { match, matchType: 'round32', opponentId, playerCardId };
        }
      }
    }
    console.log('[findNextPlayerMatch] 32강에서 플레이어 경기 없음');
  }

  if (status === 'ROUND_16') {
    console.log('[findNextPlayerMatch] 16강 조 수:', league.brackets.round16.length);

    for (const group of league.brackets.round16) {
      // 4인 토너먼트: 준결승 먼저, 그 다음 조 결승
      // 준결승 1, 2 먼저 체크
      const semis = group.matches.filter(m => m.id.includes('_semi') && !m.played);
      console.log(`[findNextPlayerMatch] ${group.id}조 미진행 준결승:`, semis.map(m => m.id));

      for (const match of semis) {
        // 참가자가 유효한지 확인
        if (!match.participant1 || !match.participant2) {
          console.log(`[findNextPlayerMatch] ${match.id} 참가자 미설정`);
          continue;
        }

        const isP1Player = playerCardIds.includes(match.participant1);
        const isP2Player = playerCardIds.includes(match.participant2);

        if (isP1Player || isP2Player) {
          const playerCardId = isP1Player ? match.participant1 : match.participant2;
          const opponentId = isP1Player ? match.participant2 : match.participant1;
          console.log('[findNextPlayerMatch] 16강 준결승 찾음:', { groupId: group.id, matchId: match.id, playerCardId, opponentId });
          return { match, matchType: 'round16', groupId: group.id, opponentId, playerCardId };
        }
      }

      // 준결승 완료 후 조 결승 체크
      const finalMatch = group.matches.find(m => m.id.includes('_final') && !m.played);
      if (finalMatch) {
        console.log(`[findNextPlayerMatch] ${group.id}조 결승:`, { p1: finalMatch.participant1, p2: finalMatch.participant2 });
      }

      if (finalMatch && finalMatch.participant1 && finalMatch.participant2) {
        const isP1Player = playerCardIds.includes(finalMatch.participant1);
        const isP2Player = playerCardIds.includes(finalMatch.participant2);

        if (isP1Player || isP2Player) {
          const playerCardId = isP1Player ? finalMatch.participant1 : finalMatch.participant2;
          const opponentId = isP1Player ? finalMatch.participant2 : finalMatch.participant1;
          console.log('[findNextPlayerMatch] 16강 조 결승 찾음:', { groupId: group.id, playerCardId, opponentId });
          return { match: finalMatch, matchType: 'round16', groupId: group.id, opponentId, playerCardId };
        }
      }
    }
    console.log('[findNextPlayerMatch] 16강에서 플레이어 경기 없음');
  }

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

  if (status === 'FINAL') {
    // 결승전
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

    // 3/4위전
    if (league.brackets.thirdPlace && !league.brackets.thirdPlace.played) {
      const match = league.brackets.thirdPlace;
      const isP1Player = playerCardIds.includes(match.participant1);
      const isP2Player = playerCardIds.includes(match.participant2);

      if (isP1Player || isP2Player) {
        const playerCardId = isP1Player ? match.participant1 : match.participant2;
        const opponentId = isP1Player ? match.participant2 : match.participant1;
        return { match, matchType: 'final', opponentId, playerCardId };  // matchType은 'final' 유지 (같은 라운드)
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

  if (status === 'ROUND_32') {
    // 조별 리그 48경기 모두 완료
    return league.brackets.round32.every(m => m.played);
  }

  if (status === 'ROUND_16') {
    // 16강 토너먼트 8경기 모두 완료
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
    // 결승과 3/4위전 모두 완료되어야 함
    const finalDone = league.brackets.final?.played ?? false;
    const thirdPlaceDone = league.brackets.thirdPlace?.played ?? true; // 3/4위전 없으면 true
    return finalDone && thirdPlaceDone;
  }

  return false;
}

/**
 * 다음 라운드 상태 가져오기
 */
export function getNextRoundStatus(current: IndividualLeagueStatus): IndividualLeagueStatus {
  const progression: Record<IndividualLeagueStatus, IndividualLeagueStatus> = {
    'NOT_STARTED': 'ROUND_32',
    'ROUND_32': 'ROUND_16',      // 32강 조별리그 → 16강 토너먼트 (지명 단계 제거)
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

    // 32강 경기 정보
    const r32Match = league.brackets.round32.find(
      m => m.participant1 === participant.odId || m.participant2 === participant.odId
    );

    if (r32Match?.played) {
      matchPlayed = true;
      const opponentId = r32Match.participant1 === participant.odId
        ? r32Match.participant2
        : r32Match.participant1;
      const opponent = CHARACTERS_BY_ID[opponentId];
      lastOpponentName = opponent?.name.ko || '???';

      if (r32Match.winner === participant.odId) {
        wins++;
        matchWon = true;
      } else {
        matchWon = false;
      }
    }

    // 16강 그룹 정보
    const r16Group = league.brackets.round16.find(
      g => g.participants.includes(participant.odId)
    );
    if (r16Group) {
      wins += r16Group.winsCount[participant.odId] || 0;

      // 16강 라운드에서 경기 진행 여부 확인
      if (league.status === 'ROUND_16') {
        const myR16Matches = r16Group.matches.filter(
          m => m.participant1 === participant.odId || m.participant2 === participant.odId
        );
        const completedMatch = myR16Matches.find(m => m.played);
        if (completedMatch) {
          matchPlayed = true;
          const opponentId = completedMatch.participant1 === participant.odId
            ? completedMatch.participant2
            : completedMatch.participant1;
          const opponent = CHARACTERS_BY_ID[opponentId];
          lastOpponentName = opponent?.name.ko || '???';
          matchWon = completedMatch.winner === participant.odId;
        }
      }
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

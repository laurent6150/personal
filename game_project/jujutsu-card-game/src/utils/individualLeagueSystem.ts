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
// 참가자 생성
// ========================================

/**
 * 32명 참가자 생성
 * - 플레이어 크루 6장 포함
 * - 나머지 26장은 랜덤 선발
 */
export function generateParticipants(
  playerCrewIds: string[],
  playerCrewName: string = '내 크루'
): LeagueParticipant[] {
  const participants: LeagueParticipant[] = [];

  // 플레이어 크루 카드 추가 (최대 6장 - 5장 크루 + 1장 여유)
  // 실제로는 크루 5장 또는 6장 모두 지원
  for (const cardId of playerCrewIds) {
    const card = CHARACTERS_BY_ID[cardId];
    if (card) {
      participants.push({
        odId: card.id,
        odName: card.name.ko,
        crewId: 'PLAYER_CREW',
        crewName: playerCrewName,
        isPlayerCrew: true,
        status: 'ACTIVE'
      });
    }
  }

  // 나머지 카드 랜덤 선발
  const neededCount = 32 - participants.length;
  const otherCards = ALL_CHARACTERS.filter(
    c => !playerCrewIds.includes(c.id)
  );
  const shuffled = shuffleArray(otherCards);
  const selected = shuffled.slice(0, neededCount);

  for (const card of selected) {
    participants.push({
      odId: card.id,
      odName: card.name.ko,
      crewId: `AI_CREW_${Math.random().toString(36).slice(2, 6)}`,
      crewName: getRandomCrewName(),
      isPlayerCrew: false,
      status: 'ACTIVE'
    });
  }

  // 대진 랜덤 배정
  return shuffleArray(participants);
}

// ========================================
// 대진표 생성
// ========================================

/**
 * 32강 대진표 생성 (16경기)
 */
function generateRound32Matches(participants: LeagueParticipant[]): IndividualMatch[] {
  const matches: IndividualMatch[] = [];

  for (let i = 0; i < 16; i++) {
    const p1 = participants[i * 2];
    const p2 = participants[i * 2 + 1];

    matches.push({
      id: `r32_${i + 1}`,
      participant1: p1.odId,
      participant2: p2.odId,
      winner: null,
      score: { p1: 0, p2: 0 },
      format: '1WIN',  // 32강은 단판
      played: false
    });
  }

  return matches;
}

/**
 * 16강 조별 리그 생성 (A~H 8개 조)
 * 32강 승자 16명을 8개 조에 배정 (Phase 3에서는 지명 시스템으로 배정)
 */
function generateRound16Groups(): LeagueGroup[] {
  const groups: LeagueGroup[] = [];
  const groupIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  for (const groupId of groupIds) {
    groups.push({
      id: groupId,
      participants: [],  // 지명 단계에서 배정
      seedId: null,      // 지명 단계에서 설정
      matches: [],
      winner: null,
      winsCount: {}
    });
  }

  return groups;
}

/**
 * 초기 대진표 생성
 */
export function generateInitialBrackets(participants: LeagueParticipant[]): IndividualBrackets {
  return {
    round32: generateRound32Matches(participants),
    round16: generateRound16Groups(),
    quarter: [],  // 16강 이후 생성
    semi: [],     // 8강 이후 생성
    final: null   // 4강 이후 생성
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
// 라운드 진행
// ========================================

/**
 * 32강 결과 처리 및 16강 조 배정
 */
export function processRound32Results(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): { brackets: IndividualBrackets; participants: LeagueParticipant[] } {
  const round32Winners: string[] = [];

  // 32강 승자 수집 및 탈락자 처리
  for (const match of brackets.round32) {
    if (match.winner) {
      round32Winners.push(match.winner);

      // 패배자 탈락 처리
      const loserId = match.winner === match.participant1
        ? match.participant2
        : match.participant1;
      const loser = participants.find(p => p.odId === loserId);
      if (loser) {
        loser.status = 'ELIMINATED';
        loser.eliminatedAt = 'ROUND_32';
      }
    }
  }

  // 16강 조 배정 (셔플 후 2명씩)
  const shuffledWinners = shuffleArray(round32Winners);
  const newRound16 = brackets.round16.map((group, idx) => {
    const p1 = shuffledWinners[idx * 2];
    const p2 = shuffledWinners[idx * 2 + 1];

    return {
      ...group,
      participants: [p1, p2],
      winsCount: { [p1]: 0, [p2]: 0 },
      matches: [
        // 2선승제 - 최대 3경기
        {
          id: `r16_${group.id}_1`,
          participant1: p1,
          participant2: p2,
          winner: null,
          score: { p1: 0, p2: 0 },
          format: '2WIN' as LeagueMatchFormat,
          played: false
        }
      ]
    };
  });

  return {
    brackets: { ...brackets, round16: newRound16 },
    participants
  };
}

/**
 * 16강 조별 결과 처리 및 8강 대진 생성
 * 4인 토너먼트 구조: 각 조 승자 8명이 8강 진출
 * (탈락자 처리는 playMatch에서 이미 처리됨)
 */
export function processRound16Results(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): { brackets: IndividualBrackets; participants: LeagueParticipant[] } {
  const quarterParticipants: string[] = [];

  // 각 조 승자 수집 (탈락자 처리는 playMatch에서 이미 완료)
  for (const group of brackets.round16) {
    if (group.winner) {
      quarterParticipants.push(group.winner);
    }
  }

  // 8강 대진 생성 (4경기)
  const shuffledQuarter = shuffleArray(quarterParticipants);
  const quarterMatches: IndividualMatch[] = [];

  for (let i = 0; i < 4; i++) {
    quarterMatches.push({
      id: `quarter_${i + 1}`,
      participant1: shuffledQuarter[i * 2],
      participant2: shuffledQuarter[i * 2 + 1],
      winner: null,
      score: { p1: 0, p2: 0 },
      format: '3WIN',  // 8강부터 3선승
      played: false
    });
  }

  return {
    brackets: { ...brackets, quarter: quarterMatches },
    participants
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
 * 4강 결과 처리 및 결승 대진 생성
 */
export function processSemiResults(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): { brackets: IndividualBrackets; participants: LeagueParticipant[] } {
  const finalParticipants: string[] = [];

  // 4강 승자 수집 및 탈락자 처리
  for (const match of brackets.semi) {
    if (match.winner) {
      finalParticipants.push(match.winner);

      const loserId = match.winner === match.participant1
        ? match.participant2
        : match.participant1;
      const loser = participants.find(p => p.odId === loserId);
      if (loser) {
        loser.status = 'ELIMINATED';
        loser.eliminatedAt = 'SEMI';
      }
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

  return {
    brackets: { ...brackets, final: finalMatch },
    participants
  };
}

/**
 * 결승 결과 처리
 */
export function processFinalResult(
  brackets: IndividualBrackets,
  participants: LeagueParticipant[]
): {
  brackets: IndividualBrackets;
  participants: LeagueParticipant[];
  champion: string | null;
  runnerUp: string | null;
} {
  const finalMatch = brackets.final;
  if (!finalMatch || !finalMatch.winner) {
    return { brackets, participants, champion: null, runnerUp: null };
  }

  const champion = finalMatch.winner;
  const runnerUp = finalMatch.winner === finalMatch.participant1
    ? finalMatch.participant2
    : finalMatch.participant1;

  // 준우승자 탈락 처리
  const loser = participants.find(p => p.odId === runnerUp);
  if (loser) {
    loser.status = 'ELIMINATED';
    loser.eliminatedAt = 'FINAL';
  }

  return { brackets, participants, champion, runnerUp };
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

  if (status === 'FINAL' && league.brackets.final) {
    const match = league.brackets.final;
    if (!match.played) {
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

  if (status === 'ROUND_32') {
    return league.brackets.round32.every(m => m.played);
  }

  if (status === 'ROUND_16') {
    return league.brackets.round16.every(g => g.winner !== null);
  }

  if (status === 'QUARTER') {
    return league.brackets.quarter.every(m => m.played);
  }

  if (status === 'SEMI') {
    return league.brackets.semi.every(m => m.played);
  }

  if (status === 'FINAL') {
    return league.brackets.final?.played ?? false;
  }

  return false;
}

/**
 * 다음 라운드 상태 가져오기
 */
export function getNextRoundStatus(current: IndividualLeagueStatus): IndividualLeagueStatus {
  const progression: Record<IndividualLeagueStatus, IndividualLeagueStatus> = {
    'NOT_STARTED': 'ROUND_32',
    'ROUND_32': 'ROUND_16_NOMINATION',  // Phase 3: 32강 후 지명 단계
    'ROUND_16_NOMINATION': 'ROUND_16',
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
}[] {
  const results: ReturnType<typeof getPlayerCardStatuses> = [];

  for (const participant of league.participants) {
    if (!participant.isPlayerCrew) continue;

    let wins = 0;
    let nextMatchInfo: string | null = null;

    // 승리 수 계산
    // 32강
    const r32Match = league.brackets.round32.find(
      m => m.participant1 === participant.odId || m.participant2 === participant.odId
    );
    if (r32Match?.winner === participant.odId) wins++;

    // 16강
    const r16Group = league.brackets.round16.find(
      g => g.participants.includes(participant.odId)
    );
    if (r16Group) {
      wins += r16Group.winsCount[participant.odId] || 0;
    }

    // 8강
    const quarterMatch = league.brackets.quarter.find(
      m => m.participant1 === participant.odId || m.participant2 === participant.odId
    );
    if (quarterMatch?.winner === participant.odId) wins++;

    // 4강
    const semiMatch = league.brackets.semi.find(
      m => m.participant1 === participant.odId || m.participant2 === participant.odId
    );
    if (semiMatch?.winner === participant.odId) wins++;

    // 결승
    if (league.brackets.final?.winner === participant.odId) wins++;

    // 다음 경기 정보
    if (participant.status === 'ACTIVE') {
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
      wins
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

// ========================================
// 시즌 & 리그 스토어 - 랜덤 크루 & 연속 시즌 지원
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Season, LeagueMatch, LeagueStanding, SeasonHistory, MatchResult, AICrew } from '../types';
import { generateAICrewsForSeason, setAICrews, PLAYER_CREW_ID } from '../data/aiCrews';

interface SeasonState {
  // 게임 상태
  isInitialized: boolean;       // 첫 크루 선택 완료 여부
  playerCrew: string[];         // 플레이어 선택 크루 (5장)
  currentAICrews: AICrew[];     // 현재 시즌 AI 크루 (랜덤 배정)

  // 시즌 데이터
  currentSeason: Season | null;
  seasonHistory: SeasonHistory[];

  // 액션
  initializeGame: (playerCrew: string[]) => void;  // 첫 게임 시작 (크루 선택)
  startNewSeason: () => void;                      // 시즌 시작/다음 시즌
  playMatch: (opponentCrewId: string, playerScore: number, opponentScore: number) => void;
  getNextMatch: () => LeagueMatch | null;
  getCurrentStandings: () => LeagueStanding[];
  endSeason: () => void;
  getPlayerRank: () => number;

  // 새로 시작 (리셋)
  resetGame: () => void;                           // 모든 데이터 초기화
  getAICrewById: (crewId: string) => AICrew | null;
}

// 리그 경기 일정 생성 (라운드 로빈)
function generateMatches(aiCrews: AICrew[]): LeagueMatch[] {
  const matches: LeagueMatch[] = [];
  let matchId = 0;

  // 플레이어는 모든 AI 팀과 1회씩 대결
  for (const aiCrew of aiCrews) {
    matches.push({
      id: `match_${matchId++}`,
      homeCrewId: PLAYER_CREW_ID,
      awayCrewId: aiCrew.id,
      result: 'PENDING',
      homeScore: 0,
      awayScore: 0,
      played: false
    });
  }

  // AI 팀들끼리의 경기도 생성 (자동 시뮬레이션용)
  for (let i = 0; i < aiCrews.length; i++) {
    for (let j = i + 1; j < aiCrews.length; j++) {
      matches.push({
        id: `match_${matchId++}`,
        homeCrewId: aiCrews[i].id,
        awayCrewId: aiCrews[j].id,
        result: 'PENDING',
        homeScore: 0,
        awayScore: 0,
        played: false
      });
    }
  }

  return matches;
}

// 초기 순위표 생성
function generateInitialStandings(aiCrews: AICrew[]): LeagueStanding[] {
  const allCrewIds = [PLAYER_CREW_ID, ...aiCrews.map(c => c.id)];
  return allCrewIds.map(crewId => ({
    crewId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0
  }));
}

// AI 경기 시뮬레이션
function simulateAIMatch(): { homeScore: number; awayScore: number } {
  const homeScore = Math.floor(Math.random() * 4); // 0-3
  const awayScore = Math.floor(Math.random() * 4); // 0-3
  return { homeScore, awayScore };
}

// 순위표 업데이트
function updateStandings(
  standings: LeagueStanding[],
  homeId: string,
  awayId: string,
  homeScore: number,
  awayScore: number
): LeagueStanding[] {
  return standings.map(standing => {
    if (standing.crewId === homeId) {
      const isWin = homeScore > awayScore;
      const isDraw = homeScore === awayScore;
      return {
        ...standing,
        played: standing.played + 1,
        wins: standing.wins + (isWin ? 1 : 0),
        draws: standing.draws + (isDraw ? 1 : 0),
        losses: standing.losses + (!isWin && !isDraw ? 1 : 0),
        points: standing.points + (isWin ? 3 : isDraw ? 1 : 0),
        goalsFor: standing.goalsFor + homeScore,
        goalsAgainst: standing.goalsAgainst + awayScore,
        goalDifference: standing.goalsFor + homeScore - standing.goalsAgainst - awayScore
      };
    }
    if (standing.crewId === awayId) {
      const isWin = awayScore > homeScore;
      const isDraw = homeScore === awayScore;
      return {
        ...standing,
        played: standing.played + 1,
        wins: standing.wins + (isWin ? 1 : 0),
        draws: standing.draws + (isDraw ? 1 : 0),
        losses: standing.losses + (!isWin && !isDraw ? 1 : 0),
        points: standing.points + (isWin ? 3 : isDraw ? 1 : 0),
        goalsFor: standing.goalsFor + awayScore,
        goalsAgainst: standing.goalsAgainst + homeScore,
        goalDifference: standing.goalsFor + awayScore - standing.goalsAgainst - homeScore
      };
    }
    return standing;
  });
}

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      playerCrew: [],
      currentAICrews: [],
      currentSeason: null,
      seasonHistory: [],

      // 첫 게임 시작 (플레이어 크루 선택)
      initializeGame: (playerCrew: string[]) => {
        if (playerCrew.length !== 5) {
          console.error('크루는 5장이어야 합니다');
          return;
        }

        // AI 크루 랜덤 생성 (플레이어 카드 제외)
        const aiCrews = generateAICrewsForSeason();
        setAICrews(aiCrews);

        set({
          isInitialized: true,
          playerCrew,
          currentAICrews: aiCrews
        });
      },

      // 시즌 시작 (첫 시즌 또는 다음 시즌)
      startNewSeason: () => {
        const { isInitialized, seasonHistory } = get();

        if (!isInitialized) {
          console.error('먼저 initializeGame을 호출하세요');
          return;
        }

        // 매 시즌마다 AI 크루 랜덤 재배정
        const aiCrews = generateAICrewsForSeason();
        setAICrews(aiCrews);

        const newSeasonNumber = seasonHistory.length + 1;

        const newSeason: Season = {
          id: `season_${newSeasonNumber}`,
          number: newSeasonNumber,
          status: 'IN_PROGRESS',
          matches: generateMatches(aiCrews),
          standings: generateInitialStandings(aiCrews),
          currentMatchIndex: 0
        };

        set({
          currentSeason: newSeason,
          currentAICrews: aiCrews
        });
      },

      // 경기 결과 기록
      playMatch: (opponentCrewId: string, playerScore: number, opponentScore: number) => {
        const { currentSeason } = get();
        if (!currentSeason) return;

        // 해당 상대와의 경기 찾기
        const matchIndex = currentSeason.matches.findIndex(
          m => !m.played &&
            m.homeCrewId === PLAYER_CREW_ID &&
            m.awayCrewId === opponentCrewId
        );
        if (matchIndex === -1) return;

        const match = currentSeason.matches[matchIndex];
        const result: MatchResult = playerScore > opponentScore ? 'WIN'
          : playerScore < opponentScore ? 'LOSE' : 'DRAW';

        const updatedMatches = [...currentSeason.matches];
        updatedMatches[matchIndex] = {
          ...match,
          homeScore: playerScore,
          awayScore: opponentScore,
          result,
          played: true
        };

        // 순위표 업데이트
        let updatedStandings = updateStandings(
          currentSeason.standings,
          match.homeCrewId,
          match.awayCrewId,
          playerScore,
          opponentScore
        );

        // AI 경기들 시뮬레이션 (플레이어 경기 후 AI 경기 2개 진행)
        let aiMatchCount = 0;
        for (let i = 0; i < updatedMatches.length && aiMatchCount < 2; i++) {
          const m = updatedMatches[i];
          if (!m.played && m.homeCrewId !== PLAYER_CREW_ID && m.awayCrewId !== PLAYER_CREW_ID) {
            const simResult = simulateAIMatch();
            updatedMatches[i] = {
              ...m,
              homeScore: simResult.homeScore,
              awayScore: simResult.awayScore,
              result: simResult.homeScore > simResult.awayScore ? 'WIN'
                : simResult.homeScore < simResult.awayScore ? 'LOSE' : 'DRAW',
              played: true
            };
            updatedStandings = updateStandings(
              updatedStandings,
              m.homeCrewId,
              m.awayCrewId,
              simResult.homeScore,
              simResult.awayScore
            );
            aiMatchCount++;
          }
        }

        // 순위표 정렬
        updatedStandings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });

        set({
          currentSeason: {
            ...currentSeason,
            matches: updatedMatches,
            standings: updatedStandings,
            currentMatchIndex: currentSeason.currentMatchIndex + 1
          }
        });
      },

      getNextMatch: () => {
        const { currentSeason } = get();
        if (!currentSeason) return null;

        return currentSeason.matches.find(
          m => !m.played && m.homeCrewId === PLAYER_CREW_ID
        ) || null;
      },

      getCurrentStandings: () => {
        const { currentSeason } = get();
        if (!currentSeason) return [];
        return currentSeason.standings;
      },

      getPlayerRank: () => {
        const { currentSeason } = get();
        if (!currentSeason) return 0;
        const index = currentSeason.standings.findIndex(s => s.crewId === PLAYER_CREW_ID);
        return index + 1;
      },

      endSeason: () => {
        const { currentSeason } = get();
        if (!currentSeason) return;

        // 모든 남은 경기 시뮬레이션
        let updatedMatches = [...currentSeason.matches];
        let updatedStandings = [...currentSeason.standings];

        for (let i = 0; i < updatedMatches.length; i++) {
          const m = updatedMatches[i];
          if (!m.played) {
            const simResult = simulateAIMatch();
            updatedMatches[i] = {
              ...m,
              homeScore: simResult.homeScore,
              awayScore: simResult.awayScore,
              result: simResult.homeScore > simResult.awayScore ? 'WIN'
                : simResult.homeScore < simResult.awayScore ? 'LOSE' : 'DRAW',
              played: true
            };
            updatedStandings = updateStandings(
              updatedStandings,
              m.homeCrewId,
              m.awayCrewId,
              simResult.homeScore,
              simResult.awayScore
            );
          }
        }

        // 순위표 최종 정렬
        updatedStandings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });

        const champion = updatedStandings[0].crewId;
        const playerStanding = updatedStandings.find(s => s.crewId === PLAYER_CREW_ID)!;
        const playerRank = updatedStandings.findIndex(s => s.crewId === PLAYER_CREW_ID) + 1;

        // 히스토리 저장
        const newHistory: SeasonHistory = {
          seasonNumber: currentSeason.number,
          champion,
          playerRank,
          playerPoints: playerStanding.points
        };

        set({
          currentSeason: {
            ...currentSeason,
            matches: updatedMatches,
            standings: updatedStandings,
            status: 'COMPLETED',
            champion
          },
          seasonHistory: [...get().seasonHistory, newHistory]
        });
      },

      // 완전 리셋 (새 게임 시작)
      resetGame: () => {
        set({
          isInitialized: false,
          playerCrew: [],
          currentAICrews: [],
          currentSeason: null,
          seasonHistory: []
        });
      },

      getAICrewById: (crewId: string) => {
        const { currentAICrews } = get();
        return currentAICrews.find(c => c.id === crewId) || null;
      }
    }),
    {
      name: 'jujutsu-season-storage'
    }
  )
);

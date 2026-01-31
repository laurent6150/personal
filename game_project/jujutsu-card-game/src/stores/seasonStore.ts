// ========================================
// 시즌 & 리그 스토어
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Season, LeagueMatch, LeagueStanding, SeasonHistory, MatchResult } from '../types';
import { AI_CREWS, PLAYER_CREW_ID } from '../data/aiCrews';

interface SeasonState {
  currentSeason: Season | null;
  seasonHistory: SeasonHistory[];

  // 액션
  startNewSeason: () => void;
  playMatch: (matchId: string, playerScore: number, opponentScore: number) => void;
  getNextMatch: () => LeagueMatch | null;
  getCurrentStandings: () => LeagueStanding[];
  endSeason: () => void;
  getPlayerRank: () => number;
  getOpponentCrew: (matchId: string) => string | null;
}

// 모든 크루 ID (플레이어 + AI 5팀)
const ALL_CREW_IDS = [PLAYER_CREW_ID, ...AI_CREWS.map(c => c.id)];

// 리그 경기 일정 생성 (라운드 로빈)
function generateMatches(): LeagueMatch[] {
  const matches: LeagueMatch[] = [];
  let matchId = 0;

  // 플레이어는 모든 AI 팀과 1회씩 대결
  for (const aiCrew of AI_CREWS) {
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
  for (let i = 0; i < AI_CREWS.length; i++) {
    for (let j = i + 1; j < AI_CREWS.length; j++) {
      matches.push({
        id: `match_${matchId++}`,
        homeCrewId: AI_CREWS[i].id,
        awayCrewId: AI_CREWS[j].id,
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
function generateInitialStandings(): LeagueStanding[] {
  return ALL_CREW_IDS.map(crewId => ({
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
function simulateAIMatch(_match: LeagueMatch): { homeScore: number; awayScore: number } {
  // 간단한 시뮬레이션: 난이도에 따른 확률
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
      currentSeason: null,
      seasonHistory: [],

      startNewSeason: () => {
        const history = get().seasonHistory;
        const newSeasonNumber = history.length + 1;

        const newSeason: Season = {
          id: `season_${newSeasonNumber}`,
          number: newSeasonNumber,
          status: 'IN_PROGRESS',
          matches: generateMatches(),
          standings: generateInitialStandings(),
          currentMatchIndex: 0
        };

        set({ currentSeason: newSeason });
      },

      playMatch: (matchId: string, playerScore: number, opponentScore: number) => {
        const season = get().currentSeason;
        if (!season) return;

        // 플레이어 경기 결과 업데이트
        const matchIndex = season.matches.findIndex(m => m.id === matchId);
        if (matchIndex === -1) return;

        const match = season.matches[matchIndex];
        const result: MatchResult = playerScore > opponentScore ? 'WIN'
          : playerScore < opponentScore ? 'LOSE' : 'DRAW';

        const updatedMatches = [...season.matches];
        updatedMatches[matchIndex] = {
          ...match,
          homeScore: playerScore,
          awayScore: opponentScore,
          result,
          played: true
        };

        // 순위표 업데이트
        let updatedStandings = updateStandings(
          season.standings,
          match.homeCrewId,
          match.awayCrewId,
          playerScore,
          opponentScore
        );

        // AI 경기들 시뮬레이션 (플레이어 경기 후 AI 경기도 진행)
        for (let i = 0; i < updatedMatches.length; i++) {
          const m = updatedMatches[i];
          if (!m.played && m.homeCrewId !== PLAYER_CREW_ID && m.awayCrewId !== PLAYER_CREW_ID) {
            // AI끼리의 경기 시뮬레이션
            const simResult = simulateAIMatch(m);
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
            break; // 한 번에 하나씩만
          }
        }

        // 순위표 정렬 (포인트 > 골득실 > 다득점)
        updatedStandings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });

        set({
          currentSeason: {
            ...season,
            matches: updatedMatches,
            standings: updatedStandings,
            currentMatchIndex: season.currentMatchIndex + 1
          }
        });
      },

      getNextMatch: () => {
        const season = get().currentSeason;
        if (!season) return null;

        // 플레이어의 다음 경기 찾기
        return season.matches.find(
          m => !m.played && (m.homeCrewId === PLAYER_CREW_ID || m.awayCrewId === PLAYER_CREW_ID)
        ) || null;
      },

      getCurrentStandings: () => {
        const season = get().currentSeason;
        if (!season) return [];
        return season.standings;
      },

      getPlayerRank: () => {
        const season = get().currentSeason;
        if (!season) return 0;
        const index = season.standings.findIndex(s => s.crewId === PLAYER_CREW_ID);
        return index + 1;
      },

      getOpponentCrew: (matchId: string) => {
        const season = get().currentSeason;
        if (!season) return null;
        const match = season.matches.find(m => m.id === matchId);
        if (!match) return null;
        return match.homeCrewId === PLAYER_CREW_ID ? match.awayCrewId : match.homeCrewId;
      },

      endSeason: () => {
        const season = get().currentSeason;
        if (!season) return;

        // 모든 남은 경기 시뮬레이션
        let updatedMatches = [...season.matches];
        let updatedStandings = [...season.standings];

        for (let i = 0; i < updatedMatches.length; i++) {
          const m = updatedMatches[i];
          if (!m.played) {
            const simResult = simulateAIMatch(m);
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
          seasonNumber: season.number,
          champion,
          playerRank,
          playerPoints: playerStanding.points
        };

        set({
          currentSeason: {
            ...season,
            matches: updatedMatches,
            standings: updatedStandings,
            status: 'COMPLETED',
            champion
          },
          seasonHistory: [...get().seasonHistory, newHistory]
        });
      }
    }),
    {
      name: 'jujutsu-season-storage'
    }
  )
);

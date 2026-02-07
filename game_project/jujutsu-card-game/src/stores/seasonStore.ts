// ========================================
// 시즌 & 리그 스토어 - MVP v5: 플레이오프 + 통산 전적
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Season,
  LeagueMatch,
  LeagueStanding,
  SeasonHistory,
  SeasonSummary,
  MatchResult,
  AICrew,
  HeadToHeadRecord,
  Playoff,
  PlayoffMatch
} from '../types';
import { generateAICrewsForSeason, setAICrews, PLAYER_CREW_ID, validatePlayerCrew } from '../data/aiCrews';
import { useTradeStore } from './tradeStore';
import { useNewsFeedStore } from './newsFeedStore';

// Phase 4: 경험치 누적 타입
interface PendingExpData {
  teamLeagueExp: number;
  individualLeagueExp: number;
  details: {
    source: 'TEAM_WIN' | 'TEAM_LOSE' | 'INDIVIDUAL_RANK';
    amount: number;
    description: string;
  }[];
}

interface SeasonState {
  // 게임 상태
  isInitialized: boolean;
  playerCrew: string[];
  currentAICrews: AICrew[];

  // 시즌 데이터
  currentSeason: Season | null;
  seasonHistory: SeasonHistory[];

  // 통산 전적
  headToHeadRecords: Record<string, HeadToHeadRecord>;

  // 시즌 시작 시 캐릭터 레벨 스냅샷 (성장 추적용)
  seasonStartLevels: Record<string, number>;

  // Phase 4: 경험치 누적 (시즌 종료 시 합산 지급)
  pendingExp: Record<string, PendingExpData>;

  // Phase 4: 리그 완료 상태
  teamLeagueCompleted: boolean;
  individualLeagueCompleted: boolean;

  // 액션
  initializeGame: (playerCrew: string[]) => void;
  startNewSeason: () => void;
  playMatch: (opponentCrewId: string, playerScore: number, opponentScore: number) => void;
  getNextMatch: () => LeagueMatch | null;
  getCurrentStandings: () => LeagueStanding[];
  endRegularSeason: () => SeasonSummary | null;
  startPlayoff: () => void;
  playPlayoffMatch: (playerScore: number, opponentScore: number) => void;
  getPlayoffOpponent: () => AICrew | null;
  getPlayerRank: () => number;
  resetGame: () => void;
  getAICrewById: (crewId: string) => AICrew | null;
  getHeadToHead: (opponentId: string) => HeadToHeadRecord | null;
  isRegularSeasonComplete: () => boolean;
  getSeasonSummary: () => SeasonSummary | null;

  // Phase 4: 경험치 누적 및 시즌 동기화
  addPendingExp: (cardId: string, source: 'TEAM_WIN' | 'TEAM_LOSE' | 'INDIVIDUAL_RANK', amount: number, description: string) => void;
  isSeasonComplete: () => boolean;
  markTeamLeagueComplete: () => void;
  markIndividualLeagueComplete: () => void;
  finalizeSeason: () => void;
  isAllKillSeason: () => boolean;
  getPendingExpSummary: () => Record<string, { teamLeagueExp: number; individualLeagueExp: number; totalExp: number }>;
}

// 리그 경기 일정 생성 (홈/어웨이 2회전)
function generateMatches(aiCrews: AICrew[]): LeagueMatch[] {
  const matches: LeagueMatch[] = [];
  let matchId = 0;

  // 플레이어는 모든 AI 팀과 2회씩 대결 (홈/어웨이)
  for (const aiCrew of aiCrews) {
    // 홈 경기 (플레이어 홈)
    matches.push({
      id: `match_${matchId++}`,
      homeCrewId: PLAYER_CREW_ID,
      awayCrewId: aiCrew.id,
      result: 'PENDING',
      homeScore: 0,
      awayScore: 0,
      played: false
    });
    // 어웨이 경기 (AI 홈)
    matches.push({
      id: `match_${matchId++}`,
      homeCrewId: aiCrew.id,
      awayCrewId: PLAYER_CREW_ID,
      result: 'PENDING',
      homeScore: 0,
      awayScore: 0,
      played: false
    });
  }

  // AI 팀들끼리의 경기도 생성 (자동 시뮬레이션용) - 2회전
  for (let i = 0; i < aiCrews.length; i++) {
    for (let j = i + 1; j < aiCrews.length; j++) {
      // 1차전
      matches.push({
        id: `match_${matchId++}`,
        homeCrewId: aiCrews[i].id,
        awayCrewId: aiCrews[j].id,
        result: 'PENDING',
        homeScore: 0,
        awayScore: 0,
        played: false
      });
      // 2차전 (홈/어웨이 반전)
      matches.push({
        id: `match_${matchId++}`,
        homeCrewId: aiCrews[j].id,
        awayCrewId: aiCrews[i].id,
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
  const homeScore = Math.floor(Math.random() * 4);
  const awayScore = Math.floor(Math.random() * 4);
  return { homeScore, awayScore };
}

// 순위표 업데이트 (불변성 유지)
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
      const newGoalsFor = standing.goalsFor + homeScore;
      const newGoalsAgainst = standing.goalsAgainst + awayScore;
      return {
        ...standing,
        played: standing.played + 1,
        wins: standing.wins + (isWin ? 1 : 0),
        draws: standing.draws + (isDraw ? 1 : 0),
        losses: standing.losses + (!isWin && !isDraw ? 1 : 0),
        points: standing.points + (isWin ? 3 : isDraw ? 1 : 0),
        goalsFor: newGoalsFor,
        goalsAgainst: newGoalsAgainst,
        goalDifference: newGoalsFor - newGoalsAgainst
      };
    }
    if (standing.crewId === awayId) {
      const isWin = awayScore > homeScore;
      const isDraw = homeScore === awayScore;
      const newGoalsFor = standing.goalsFor + awayScore;
      const newGoalsAgainst = standing.goalsAgainst + homeScore;
      return {
        ...standing,
        played: standing.played + 1,
        wins: standing.wins + (isWin ? 1 : 0),
        draws: standing.draws + (isDraw ? 1 : 0),
        losses: standing.losses + (!isWin && !isDraw ? 1 : 0),
        points: standing.points + (isWin ? 3 : isDraw ? 1 : 0),
        goalsFor: newGoalsFor,
        goalsAgainst: newGoalsAgainst,
        goalDifference: newGoalsFor - newGoalsAgainst
      };
    }
    return standing;
  });
}

// 순위표 정렬
function sortStandings(standings: LeagueStanding[]): LeagueStanding[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

// 플레이오프 초기화
function initializePlayoff(standings: LeagueStanding[]): Playoff {
  const top4 = standings.slice(0, 4).map(s => s.crewId);

  return {
    qualified: top4,
    semiFinals: [
      {
        homeCrewId: top4[0], // 1위 vs 4위
        awayCrewId: top4[3],
        homeWins: 0,
        awayWins: 0,
        matches: []
      },
      {
        homeCrewId: top4[1], // 2위 vs 3위
        awayCrewId: top4[2],
        homeWins: 0,
        awayWins: 0,
        matches: []
      }
    ]
  };
}

// 플레이오프 경기 결과 업데이트
function updatePlayoffMatch(
  match: PlayoffMatch,
  homeScore: number,
  awayScore: number
): PlayoffMatch {
  const newMatch: LeagueMatch = {
    id: `playoff_${match.matches.length}`,
    homeCrewId: match.homeCrewId,
    awayCrewId: match.awayCrewId,
    result: homeScore > awayScore ? 'WIN' : homeScore < awayScore ? 'LOSE' : 'DRAW',
    homeScore,
    awayScore,
    played: true
  };

  const newHomeWins = match.homeWins + (homeScore > awayScore ? 1 : 0);
  const newAwayWins = match.awayWins + (awayScore > homeScore ? 1 : 0);

  return {
    ...match,
    homeWins: newHomeWins,
    awayWins: newAwayWins,
    matches: [...match.matches, newMatch],
    result: newHomeWins >= 3 ? 'HOME' : newAwayWins >= 3 ? 'AWAY' : undefined
  };
}

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      playerCrew: [],
      currentAICrews: [],
      currentSeason: null,
      seasonHistory: [],
      headToHeadRecords: {},
      seasonStartLevels: {},
      pendingExp: {},
      teamLeagueCompleted: false,
      individualLeagueCompleted: false,

      // 첫 게임 시작 (플레이어 크루 선택)
      initializeGame: (playerCrew: string[]) => {
        // 크루 유효성 검사 (크루 사이즈 + 등급 제한)
        const validation = validatePlayerCrew(playerCrew);
        if (!validation.valid) {
          console.error('[initializeGame]', validation.error);
          return;
        }

        set({
          isInitialized: true,
          playerCrew,
          currentAICrews: [],
          currentSeason: null
        });
      },

      // 시즌 시작 (첫 시즌 또는 다음 시즌)
      startNewSeason: () => {
        const { isInitialized, seasonHistory, playerCrew } = get();

        if (!isInitialized) {
          console.error('먼저 initializeGame을 호출하세요');
          return;
        }

        // AI 크루 랜덤 재배정 (플레이어 크루 제외하여 중복 방지)
        const aiCrews = generateAICrewsForSeason(playerCrew);
        setAICrews(aiCrews);

        const newSeasonNumber = seasonHistory.length + 1;

        const newSeason: Season = {
          id: `season_${newSeasonNumber}`,
          number: newSeasonNumber,
          status: 'REGULAR',
          matches: generateMatches(aiCrews),
          standings: generateInitialStandings(aiCrews),
          currentMatchIndex: 0
        };

        console.log('[Season] 새 시즌 시작:', newSeasonNumber, '경기 수:', newSeason.matches.length);

        set({
          currentSeason: newSeason,
          currentAICrews: aiCrews,
          seasonStartLevels: {} // TODO: playerStore에서 레벨 스냅샷
        });
      },

      // 경기 결과 기록
      playMatch: (opponentCrewId: string, playerScore: number, opponentScore: number) => {
        const { currentSeason, headToHeadRecords } = get();

        if (!currentSeason) {
          console.error('[playMatch] 현재 시즌이 없습니다');
          return;
        }

        // 정규시즌 경기 처리
        if (currentSeason.status === 'REGULAR') {
          // 홈 경기 먼저 찾기
          let matchIndex = currentSeason.matches.findIndex(
            m => !m.played &&
              m.homeCrewId === PLAYER_CREW_ID &&
              m.awayCrewId === opponentCrewId
          );

          let isPlayerHome = true;

          // 홈 경기가 없으면 어웨이 경기 찾기
          if (matchIndex === -1) {
            matchIndex = currentSeason.matches.findIndex(
              m => !m.played &&
                m.homeCrewId === opponentCrewId &&
                m.awayCrewId === PLAYER_CREW_ID
            );
            isPlayerHome = false;
          }

          if (matchIndex === -1) {
            console.error('[playMatch] 경기를 찾을 수 없습니다');
            return;
          }

          const match = currentSeason.matches[matchIndex];
          const result: MatchResult = playerScore > opponentScore ? 'WIN'
            : playerScore < opponentScore ? 'LOSE' : 'DRAW';

          // 경기 목록 업데이트 (홈/어웨이에 따라 점수 배치)
          const updatedMatches = [...currentSeason.matches];
          updatedMatches[matchIndex] = {
            ...match,
            homeScore: isPlayerHome ? playerScore : opponentScore,
            awayScore: isPlayerHome ? opponentScore : playerScore,
            result: isPlayerHome ? result : (result === 'WIN' ? 'LOSE' : result === 'LOSE' ? 'WIN' : 'DRAW'),
            played: true
          };

          // 순위표 업데이트 (홈/어웨이에 따라 점수 배치)
          let updatedStandings = updateStandings(
            currentSeason.standings,
            isPlayerHome ? PLAYER_CREW_ID : opponentCrewId,
            isPlayerHome ? opponentCrewId : PLAYER_CREW_ID,
            isPlayerHome ? playerScore : opponentScore,
            isPlayerHome ? opponentScore : playerScore
          );

          // AI 경기들 시뮬레이션
          let aiMatchCount = 0;
          const aiCrews = get().currentAICrews;
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

              // AI 경기 뉴스 추가
              const homeCrew = aiCrews.find(c => c.id === m.homeCrewId);
              const awayCrew = aiCrews.find(c => c.id === m.awayCrewId);
              if (homeCrew && awayCrew) {
                useNewsFeedStore.getState().addMatchResultNews({
                  seasonNumber: currentSeason.number,
                  homeCrewName: homeCrew.name,
                  awayCrewName: awayCrew.name,
                  homeScore: simResult.homeScore,
                  awayScore: simResult.awayScore,
                  isPlayer: false
                });
              }

              aiMatchCount++;
            }
          }

          const sortedStandings = sortStandings(updatedStandings);

          // 통산 전적 업데이트
          const h2hResult = result === 'WIN' ? 'WIN' : result === 'LOSE' ? 'LOSS' : 'DRAW';
          const existing = headToHeadRecords[opponentCrewId] || {
            vsId: opponentCrewId,
            wins: 0,
            draws: 0,
            losses: 0,
            history: []
          };

          const updatedH2H: HeadToHeadRecord = {
            ...existing,
            wins: existing.wins + (h2hResult === 'WIN' ? 1 : 0),
            draws: existing.draws + (h2hResult === 'DRAW' ? 1 : 0),
            losses: existing.losses + (h2hResult === 'LOSS' ? 1 : 0),
            history: [...existing.history, {
              seasonNumber: currentSeason.number,
              result: h2hResult
            }]
          };

          set({
            currentSeason: {
              ...currentSeason,
              matches: updatedMatches,
              standings: sortedStandings,
              currentMatchIndex: currentSeason.currentMatchIndex + 1
            },
            headToHeadRecords: {
              ...headToHeadRecords,
              [opponentCrewId]: updatedH2H
            }
          });
        }
      },

      getNextMatch: () => {
        const { currentSeason } = get();
        if (!currentSeason) return null;

        if (currentSeason.status === 'REGULAR') {
          // 플레이어가 참여하는 모든 미완료 경기 (홈/어웨이 모두)
          return currentSeason.matches.find(
            m => !m.played && (m.homeCrewId === PLAYER_CREW_ID || m.awayCrewId === PLAYER_CREW_ID)
          ) || null;
        }

        return null;
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

      isRegularSeasonComplete: () => {
        const { currentSeason } = get();
        if (!currentSeason) return false;

        const playerMatches = currentSeason.matches.filter(
          m => m.homeCrewId === PLAYER_CREW_ID || m.awayCrewId === PLAYER_CREW_ID
        );
        return playerMatches.every(m => m.played);
      },

      // 정규시즌 종료 및 요약 생성
      endRegularSeason: () => {
        const { currentSeason } = get();
        if (!currentSeason || currentSeason.status !== 'REGULAR') return null;

        // 모든 남은 AI 경기 시뮬레이션
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

        const sortedStandings = sortStandings(updatedStandings);
        const playerStanding = sortedStandings.find(s => s.crewId === PLAYER_CREW_ID)!;
        const playerRank = sortedStandings.findIndex(s => s.crewId === PLAYER_CREW_ID) + 1;

        // 시즌 요약 생성
        const summary: SeasonSummary = {
          seasonNumber: currentSeason.number,
          finalRank: playerRank,
          wins: playerStanding.wins,
          draws: playerStanding.draws,
          losses: playerStanding.losses,
          points: playerStanding.points,
          characterGrowth: [], // TODO: playerStore에서 성장 데이터
          highlights: [],
          playoffResult: {
            qualified: playerRank <= 4,
            reachedFinal: false,
            isChampion: false
          }
        };

        set({
          currentSeason: {
            ...currentSeason,
            matches: updatedMatches,
            standings: sortedStandings
          }
        });

        return summary;
      },

      // 플레이오프 시작
      startPlayoff: () => {
        const { currentSeason } = get();
        if (!currentSeason) return;

        const sortedStandings = sortStandings(currentSeason.standings);
        const playerRank = sortedStandings.findIndex(s => s.crewId === PLAYER_CREW_ID) + 1;

        if (playerRank > 4) {
          // 플레이오프 진출 실패 - 시즌 종료
          const champion = sortedStandings[0].crewId;
          const playerStanding = sortedStandings.find(s => s.crewId === PLAYER_CREW_ID)!;

          const newHistory: SeasonHistory = {
            seasonNumber: currentSeason.number,
            champion,
            playerRank,
            playerPoints: playerStanding.points,
            playoffResult: 'NOT_QUALIFIED'
          };

          set({
            currentSeason: {
              ...currentSeason,
              status: 'COMPLETED',
              champion
            },
            seasonHistory: [...get().seasonHistory, newHistory]
          });
          return;
        }

        // 플레이오프 시작
        const playoff = initializePlayoff(sortedStandings);

        set({
          currentSeason: {
            ...currentSeason,
            status: 'PLAYOFF_SEMI',
            playoff
          }
        });
      },

      // 플레이오프 경기
      playPlayoffMatch: (playerScore: number, opponentScore: number) => {
        const { currentSeason } = get();
        if (!currentSeason || !currentSeason.playoff) return;

        const { playoff, status } = currentSeason;

        if (status === 'PLAYOFF_SEMI') {
          // 준결승 - 플레이어 경기 찾기
          const semiIndex = playoff.semiFinals.findIndex(
            sf => (sf.homeCrewId === PLAYER_CREW_ID || sf.awayCrewId === PLAYER_CREW_ID)
              && !sf.result
          );

          if (semiIndex === -1) return;

          const semi = playoff.semiFinals[semiIndex];
          const isHome = semi.homeCrewId === PLAYER_CREW_ID;
          const actualHomeScore = isHome ? playerScore : opponentScore;
          const actualAwayScore = isHome ? opponentScore : playerScore;

          const updatedSemi = updatePlayoffMatch(semi, actualHomeScore, actualAwayScore);
          const newSemiFinals: [PlayoffMatch, PlayoffMatch] = [...playoff.semiFinals] as [PlayoffMatch, PlayoffMatch];
          newSemiFinals[semiIndex] = updatedSemi;

          // 다른 준결승도 시뮬레이션
          const otherIndex = 1 - semiIndex;
          if (!newSemiFinals[otherIndex].result) {
            const sim = simulateAIMatch();
            newSemiFinals[otherIndex] = updatePlayoffMatch(
              newSemiFinals[otherIndex],
              sim.homeScore,
              sim.awayScore
            );
          }

          // 양 준결승 모두 종료 확인
          const bothSemisComplete = newSemiFinals[0].result && newSemiFinals[1].result;

          if (bothSemisComplete) {
            // 결승 초기화
            const winner1 = newSemiFinals[0].result === 'HOME'
              ? newSemiFinals[0].homeCrewId
              : newSemiFinals[0].awayCrewId;
            const winner2 = newSemiFinals[1].result === 'HOME'
              ? newSemiFinals[1].homeCrewId
              : newSemiFinals[1].awayCrewId;

            const playerInFinal = winner1 === PLAYER_CREW_ID || winner2 === PLAYER_CREW_ID;

            if (playerInFinal) {
              set({
                currentSeason: {
                  ...currentSeason,
                  status: 'PLAYOFF_FINAL',
                  playoff: {
                    ...playoff,
                    semiFinals: newSemiFinals,
                    final: {
                      homeCrewId: winner1,
                      awayCrewId: winner2,
                      homeWins: 0,
                      awayWins: 0,
                      matches: []
                    }
                  }
                }
              });
            } else {
              // 플레이어 준결승 탈락 - 결승 시뮬레이션 후 종료
              let finalMatch: PlayoffMatch = {
                homeCrewId: winner1,
                awayCrewId: winner2,
                homeWins: 0,
                awayWins: 0,
                matches: []
              };

              while (!finalMatch.result) {
                const sim = simulateAIMatch();
                finalMatch = updatePlayoffMatch(finalMatch, sim.homeScore, sim.awayScore);
              }

              const champion = finalMatch.result === 'HOME' ? winner1 : winner2;
              const playerStanding = currentSeason.standings.find(s => s.crewId === PLAYER_CREW_ID)!;
              const playerRank = currentSeason.standings.findIndex(s => s.crewId === PLAYER_CREW_ID) + 1;

              const newHistory: SeasonHistory = {
                seasonNumber: currentSeason.number,
                champion,
                playerRank,
                playerPoints: playerStanding.points,
                playoffResult: 'SEMI'
              };

              set({
                currentSeason: {
                  ...currentSeason,
                  status: 'COMPLETED',
                  champion,
                  playoff: {
                    ...playoff,
                    semiFinals: newSemiFinals,
                    final: finalMatch,
                    champion
                  }
                },
                seasonHistory: [...get().seasonHistory, newHistory]
              });
            }
          } else {
            set({
              currentSeason: {
                ...currentSeason,
                playoff: {
                  ...playoff,
                  semiFinals: newSemiFinals
                }
              }
            });
          }
        } else if (status === 'PLAYOFF_FINAL' && playoff.final) {
          // 결승
          const final = playoff.final;
          const isHome = final.homeCrewId === PLAYER_CREW_ID;
          const actualHomeScore = isHome ? playerScore : opponentScore;
          const actualAwayScore = isHome ? opponentScore : playerScore;

          const updatedFinal = updatePlayoffMatch(final, actualHomeScore, actualAwayScore);

          if (updatedFinal.result) {
            // 시즌 종료
            const champion = updatedFinal.result === 'HOME'
              ? updatedFinal.homeCrewId
              : updatedFinal.awayCrewId;
            const isChampion = champion === PLAYER_CREW_ID;
            const playerStanding = currentSeason.standings.find(s => s.crewId === PLAYER_CREW_ID)!;
            const playerRank = currentSeason.standings.findIndex(s => s.crewId === PLAYER_CREW_ID) + 1;

            const newHistory: SeasonHistory = {
              seasonNumber: currentSeason.number,
              champion,
              playerRank,
              playerPoints: playerStanding.points,
              playoffResult: isChampion ? 'CHAMPION' : 'FINALIST'
            };

            // 우승 시 보너스 지급
            if (isChampion) {
              const { addChampionshipBonus } = useTradeStore.getState();
              addChampionshipBonus(currentSeason.number);
            }

            set({
              currentSeason: {
                ...currentSeason,
                status: 'COMPLETED',
                champion,
                playoff: {
                  ...playoff,
                  final: updatedFinal,
                  champion
                }
              },
              seasonHistory: [...get().seasonHistory, newHistory]
            });
          } else {
            set({
              currentSeason: {
                ...currentSeason,
                playoff: {
                  ...playoff,
                  final: updatedFinal
                }
              }
            });
          }
        }
      },

      getPlayoffOpponent: () => {
        const { currentSeason, currentAICrews } = get();
        if (!currentSeason || !currentSeason.playoff) return null;

        const { playoff, status } = currentSeason;

        if (status === 'PLAYOFF_SEMI') {
          const semi = playoff.semiFinals.find(
            sf => (sf.homeCrewId === PLAYER_CREW_ID || sf.awayCrewId === PLAYER_CREW_ID)
              && !sf.result
          );
          if (!semi) return null;

          const opponentId = semi.homeCrewId === PLAYER_CREW_ID
            ? semi.awayCrewId
            : semi.homeCrewId;
          return currentAICrews.find(c => c.id === opponentId) || null;
        }

        if (status === 'PLAYOFF_FINAL' && playoff.final) {
          const opponentId = playoff.final.homeCrewId === PLAYER_CREW_ID
            ? playoff.final.awayCrewId
            : playoff.final.homeCrewId;
          return currentAICrews.find(c => c.id === opponentId) || null;
        }

        return null;
      },

      getSeasonSummary: () => {
        const { currentSeason } = get();
        if (!currentSeason) return null;

        const playerStanding = currentSeason.standings.find(s => s.crewId === PLAYER_CREW_ID);
        if (!playerStanding) return null;

        const playerRank = currentSeason.standings.findIndex(s => s.crewId === PLAYER_CREW_ID) + 1;

        return {
          seasonNumber: currentSeason.number,
          finalRank: playerRank,
          wins: playerStanding.wins,
          draws: playerStanding.draws,
          losses: playerStanding.losses,
          points: playerStanding.points,
          characterGrowth: [],
          highlights: [],
          playoffResult: currentSeason.playoff ? {
            qualified: playerRank <= 4,
            reachedFinal: currentSeason.playoff.final?.homeCrewId === PLAYER_CREW_ID ||
              currentSeason.playoff.final?.awayCrewId === PLAYER_CREW_ID,
            isChampion: currentSeason.champion === PLAYER_CREW_ID
          } : undefined
        };
      },

      // 완전 리셋 (새 게임 시작)
      resetGame: () => {
        set({
          isInitialized: false,
          playerCrew: [],
          currentAICrews: [],
          currentSeason: null,
          seasonHistory: [],
          headToHeadRecords: {},
          seasonStartLevels: {},
          pendingExp: {},
          teamLeagueCompleted: false,
          individualLeagueCompleted: false,
        });
      },

      getAICrewById: (crewId: string) => {
        const { currentAICrews } = get();
        return currentAICrews.find(c => c.id === crewId) || null;
      },

      getHeadToHead: (opponentId: string) => {
        const { headToHeadRecords } = get();
        return headToHeadRecords[opponentId] || null;
      },

      // ========================================
      // Phase 4: 경험치 누적 및 시즌 동기화
      // ========================================

      // 경험치 누적 (시즌 종료 시 합산 지급)
      addPendingExp: (cardId: string, source: 'TEAM_WIN' | 'TEAM_LOSE' | 'INDIVIDUAL_RANK', amount: number, description: string) => {
        const { pendingExp } = get();

        const existing = pendingExp[cardId] || {
          teamLeagueExp: 0,
          individualLeagueExp: 0,
          details: []
        };

        // 소스에 따라 적절한 필드에 추가
        if (source === 'TEAM_WIN' || source === 'TEAM_LOSE') {
          existing.teamLeagueExp += amount;
        } else {
          existing.individualLeagueExp += amount;
        }

        existing.details.push({ source, amount, description });

        set({
          pendingExp: {
            ...pendingExp,
            [cardId]: existing
          }
        });

        console.log(`[addPendingExp] ${cardId}: +${amount} (${source}) - ${description}`);
      },

      // 시즌 완료 여부 확인 (두 리그 모두 완료)
      isSeasonComplete: () => {
        const { teamLeagueCompleted, individualLeagueCompleted } = get();
        return teamLeagueCompleted && individualLeagueCompleted;
      },

      // 팀 리그 완료 마킹
      markTeamLeagueComplete: () => {
        set({ teamLeagueCompleted: true });
        console.log('[markTeamLeagueComplete] 팀 리그 완료');
      },

      // 개인 리그 완료 마킹
      markIndividualLeagueComplete: () => {
        set({ individualLeagueCompleted: true });
        console.log('[markIndividualLeagueComplete] 개인 리그 완료');
      },

      // 시즌 종료 처리 (경험치 확정 지급)
      finalizeSeason: () => {
        const { isSeasonComplete, pendingExp, currentSeason } = get();

        if (!isSeasonComplete()) {
          console.warn('[finalizeSeason] 두 리그 모두 완료되어야 시즌 종료 가능');
          return;
        }

        // 1. 누적 경험치 확정 지급
        // playerStore가 circular dependency 가능성 있으므로 dynamic import 사용
        import('./playerStore').then(({ usePlayerStore }) => {
          const { addExpToCard } = usePlayerStore.getState();

          Object.entries(pendingExp).forEach(([cardId, data]) => {
            const totalExp = data.teamLeagueExp + data.individualLeagueExp;
            if (totalExp > 0) {
              addExpToCard(cardId, totalExp);
              console.log(`[finalizeSeason] ${cardId}에게 총 ${totalExp} EXP 지급 (팀:${data.teamLeagueExp}, 개인:${data.individualLeagueExp})`);
            }
          });

          // Note: 컨디션 초기화는 캐릭터 성장 시스템에서 별도 처리
          console.log('[finalizeSeason] 경험치 지급 완료');
        });

        // 3. 상태 초기화
        set({
          teamLeagueCompleted: false,
          individualLeagueCompleted: false,
          pendingExp: {},
        });

        console.log(`[finalizeSeason] 시즌 ${currentSeason?.number || '?'} 종료 처리 완료`);
      },

      // 올킬 시즌 판정 (3의 배수 시즌)
      isAllKillSeason: () => {
        const { currentSeason } = get();
        if (!currentSeason) return false;
        return currentSeason.number % 3 === 0;
      },

      // 경험치 요약 조회
      getPendingExpSummary: () => {
        const { pendingExp } = get();
        const summary: Record<string, { teamLeagueExp: number; individualLeagueExp: number; totalExp: number }> = {};

        Object.entries(pendingExp).forEach(([cardId, data]) => {
          summary[cardId] = {
            teamLeagueExp: data.teamLeagueExp,
            individualLeagueExp: data.individualLeagueExp,
            totalExp: data.teamLeagueExp + data.individualLeagueExp
          };
        });

        return summary;
      }
    }),
    {
      name: 'jujutsu-season-storage',
      version: 8, // v8: Phase 4 경험치 누적 시스템
      migrate: (persistedState: unknown, version: number) => {
        console.log('[Season Store] 마이그레이션:', version, '->', 8);
        const state = persistedState as SeasonState;

        if (version < 7) {
          console.log('[Season Store] v7 업그레이드: 14경기 2회전 체계 - 진행 중 시즌 리셋');
          return {
            ...state,
            currentSeason: null,
            pendingExp: {},
            teamLeagueCompleted: false,
            individualLeagueCompleted: false,
          };
        }

        if (version < 8) {
          console.log('[Season Store] v8 업그레이드: Phase 4 경험치 누적 시스템 추가');
          return {
            ...state,
            pendingExp: {},
            teamLeagueCompleted: false,
            individualLeagueCompleted: false,
          };
        }

        return persistedState as SeasonState;
      }
    }
  )
);

// ========================================
// 개인 리그 상태 관리 (Zustand)
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  IndividualLeague,
  IndividualLeagueStatus,
  IndividualLeagueHistory,
  NominationStep,
  LeagueGroup,
  IndividualMatch,
  LeagueParticipant
} from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';
import {
  generateParticipants,
  generateInitialBrackets,
  simulateMatch,
  processRound16Results,
  processQuarterResults,
  processSemiResults,
  processFinalResult,
  findNextPlayerMatch,
  isRoundComplete,
  getNextRoundStatus,
  getPlayerCardStatuses,
  updateGroupWins,
  calculateTotalStat
} from '../utils/individualLeagueSystem';

interface IndividualLeagueState {
  currentSeason: number;
  currentLeague: IndividualLeague | null;
  history: IndividualLeagueHistory[];
  hallOfFame: {
    season: number;
    championId: string;
    championName: string;
    crewName: string;
  }[];

  // 액션
  startNewLeague: (playerCrewIds: string[], playerCrewName?: string) => void;
  playMatch: (matchId: string, winner: string, score: { p1: number; p2: number }) => void;
  simulateAllRemainingMatches: () => void;
  advanceRound: () => void;
  getNextPlayerMatch: () => ReturnType<typeof findNextPlayerMatch>;
  getPlayerCardStatuses: () => ReturnType<typeof getPlayerCardStatuses>;
  finishLeague: () => void;
  resetLeague: () => void;

  // Phase 3 - 16강 지명 시스템
  startNomination: () => void;
  nominateCard: (nomineeId: string) => void;
  autoNominate: () => void;
  completeNomination: () => void;
  getCurrentNominationStep: () => NominationStep | null;
  getAvailableForNomination: () => LeagueParticipant[];
  getPlayerCrewIds: () => string[];
  createRound16Matches: () => void;
}

export const useIndividualLeagueStore = create<IndividualLeagueState>()(
  persist(
    (set, get) => ({
      currentSeason: 1,
      currentLeague: null,
      history: [],
      hallOfFame: [],

      // 새 리그 시작
      startNewLeague: (playerCrewIds: string[], playerCrewName = '내 크루') => {
        const { currentSeason } = get();

        // 참가자 생성 (32명)
        const participants = generateParticipants(playerCrewIds, playerCrewName);

        // 대진표 생성
        const brackets = generateInitialBrackets(participants);

        // 내 카드 현황 초기화
        const myCardResults = participants
          .filter(p => p.isPlayerCrew)
          .map(p => ({
            odId: p.odId,
            finalResult: 'ROUND_32' as IndividualLeagueStatus,
            rewardClaimed: false
          }));

        const league: IndividualLeague = {
          season: currentSeason,
          status: 'ROUND_32',
          participants,
          brackets,
          champion: null,
          runnerUp: null,
          myCardResults
        };

        set({ currentLeague: league });
      },

      // 경기 결과 기록 (플레이어 직접 플레이 또는 시뮬레이션)
      playMatch: (matchId: string, winner: string, score: { p1: number; p2: number }) => {
        const { currentLeague } = get();
        if (!currentLeague) return;

        const status = currentLeague.status;
        let updatedBrackets = { ...currentLeague.brackets };
        let updatedParticipants = [...currentLeague.participants];

        // 32강 경기
        if (status === 'ROUND_32') {
          updatedBrackets.round32 = updatedBrackets.round32.map(m =>
            m.id === matchId
              ? { ...m, winner, score, played: true }
              : m
          );
        }

        // 16강 조별 경기
        if (status === 'ROUND_16') {
          updatedBrackets.round16 = updatedBrackets.round16.map(group => {
            const matchIndex = group.matches.findIndex(m => m.id === matchId);
            if (matchIndex === -1) return group;

            const updatedMatches = group.matches.map(m =>
              m.id === matchId
                ? { ...m, winner, score, played: true }
                : m
            );

            // 승리 수 업데이트
            const updatedGroup = updateGroupWins(
              { ...group, matches: updatedMatches },
              { ...group.matches[matchIndex], winner, score, played: true }
            );

            // 2선승 미달 시 다음 경기 추가
            if (!updatedGroup.winner && updatedMatches.length < 3) {
              const [p1, p2] = group.participants;
              updatedMatches.push({
                id: `r16_${group.id}_${updatedMatches.length + 1}`,
                participant1: p1,
                participant2: p2,
                winner: null,
                score: { p1: 0, p2: 0 },
                format: '2WIN',
                played: false
              });
            }

            return { ...updatedGroup, matches: updatedMatches };
          });
        }

        // 8강 경기
        if (status === 'QUARTER') {
          updatedBrackets.quarter = updatedBrackets.quarter.map(m =>
            m.id === matchId
              ? { ...m, winner, score, played: true }
              : m
          );
        }

        // 4강 경기
        if (status === 'SEMI') {
          updatedBrackets.semi = updatedBrackets.semi.map(m =>
            m.id === matchId
              ? { ...m, winner, score, played: true }
              : m
          );
        }

        // 결승 경기
        if (status === 'FINAL' && updatedBrackets.final?.id === matchId) {
          updatedBrackets.final = {
            ...updatedBrackets.final,
            winner,
            score,
            played: true
          };
        }

        set({
          currentLeague: {
            ...currentLeague,
            brackets: updatedBrackets,
            participants: updatedParticipants
          }
        });
      },

      // 현재 라운드의 남은 경기 모두 시뮬레이션
      simulateAllRemainingMatches: () => {
        const { currentLeague, playMatch } = get();
        if (!currentLeague) return;

        const status = currentLeague.status;

        if (status === 'ROUND_32') {
          for (const match of currentLeague.brackets.round32) {
            if (!match.played) {
              const result = simulateMatch(match.participant1, match.participant2, match.format);
              playMatch(match.id, result.winner, result.score);
            }
          }
        }

        if (status === 'ROUND_16') {
          for (const group of currentLeague.brackets.round16) {
            // 조별 승자가 결정될 때까지 반복
            while (!group.winner) {
              const unplayedMatch = group.matches.find(m => !m.played);
              if (unplayedMatch) {
                const result = simulateMatch(
                  unplayedMatch.participant1,
                  unplayedMatch.participant2,
                  unplayedMatch.format
                );
                playMatch(unplayedMatch.id, result.winner, result.score);
                // 상태 갱신을 위해 다시 가져오기
                const updatedLeague = get().currentLeague;
                if (!updatedLeague) break;
                const updatedGroup = updatedLeague.brackets.round16.find(g => g.id === group.id);
                if (updatedGroup?.winner) break;
              } else {
                break;
              }
            }
          }
        }

        if (status === 'QUARTER') {
          for (const match of currentLeague.brackets.quarter) {
            if (!match.played) {
              const result = simulateMatch(match.participant1, match.participant2, match.format);
              playMatch(match.id, result.winner, result.score);
            }
          }
        }

        if (status === 'SEMI') {
          for (const match of currentLeague.brackets.semi) {
            if (!match.played) {
              const result = simulateMatch(match.participant1, match.participant2, match.format);
              playMatch(match.id, result.winner, result.score);
            }
          }
        }

        if (status === 'FINAL' && currentLeague.brackets.final && !currentLeague.brackets.final.played) {
          const match = currentLeague.brackets.final;
          const result = simulateMatch(match.participant1, match.participant2, match.format);
          playMatch(match.id, result.winner, result.score);
        }
      },

      // 다음 라운드로 진행
      advanceRound: () => {
        const { currentLeague, startNomination } = get();
        if (!currentLeague) return;

        // 현재 라운드 완료 확인
        if (!isRoundComplete(currentLeague)) {
          console.warn('현재 라운드가 완료되지 않았습니다.');
          return;
        }

        const status = currentLeague.status;

        // Phase 3: 32강 완료 시 지명 단계로 전환
        if (status === 'ROUND_32') {
          // 탈락자 처리
          let updatedParticipants = [...currentLeague.participants];
          for (const match of currentLeague.brackets.round32) {
            if (match.winner) {
              const loserId = match.winner === match.participant1 ? match.participant2 : match.participant1;
              const loser = updatedParticipants.find(p => p.odId === loserId);
              if (loser) {
                loser.status = 'ELIMINATED';
                loser.eliminatedAt = 'ROUND_32';
              }
            }
          }

          set({
            currentLeague: {
              ...currentLeague,
              participants: updatedParticipants,
            }
          });

          // 지명 시작
          startNomination();
          return;
        }

        let updatedBrackets = currentLeague.brackets;
        let updatedParticipants = currentLeague.participants;
        let newStatus = getNextRoundStatus(status);
        let champion: string | null = null;
        let runnerUp: string | null = null;

        if (status === 'ROUND_16') {
          const result = processRound16Results(updatedBrackets, updatedParticipants);
          updatedBrackets = result.brackets;
          updatedParticipants = result.participants;
        }

        if (status === 'QUARTER') {
          const result = processQuarterResults(updatedBrackets, updatedParticipants);
          updatedBrackets = result.brackets;
          updatedParticipants = result.participants;
        }

        if (status === 'SEMI') {
          const result = processSemiResults(updatedBrackets, updatedParticipants);
          updatedBrackets = result.brackets;
          updatedParticipants = result.participants;
        }

        if (status === 'FINAL') {
          const result = processFinalResult(updatedBrackets, updatedParticipants);
          updatedBrackets = result.brackets;
          updatedParticipants = result.participants;
          champion = result.champion;
          runnerUp = result.runnerUp;
        }

        // 내 카드 결과 업데이트
        const myCardResults = currentLeague.myCardResults.map(card => {
          const participant = updatedParticipants.find(p => p.odId === card.odId);
          if (participant && participant.eliminatedAt) {
            return { ...card, finalResult: participant.eliminatedAt };
          }
          if (participant && participant.status === 'ACTIVE' && newStatus === 'FINISHED') {
            // 우승자
            return { ...card, finalResult: 'FINISHED' as IndividualLeagueStatus };
          }
          return card;
        });

        set({
          currentLeague: {
            ...currentLeague,
            status: newStatus,
            brackets: updatedBrackets,
            participants: updatedParticipants,
            champion,
            runnerUp,
            myCardResults
          }
        });
      },

      // 플레이어의 다음 경기 찾기
      getNextPlayerMatch: () => {
        const { currentLeague } = get();
        if (!currentLeague) return null;
        return findNextPlayerMatch(currentLeague);
      },

      // 플레이어 카드 현황 가져오기
      getPlayerCardStatuses: () => {
        const { currentLeague } = get();
        if (!currentLeague) return [];
        return getPlayerCardStatuses(currentLeague);
      },

      // 리그 종료 및 히스토리 저장
      finishLeague: () => {
        const { currentLeague, history, hallOfFame, currentSeason } = get();
        if (!currentLeague || currentLeague.status !== 'FINISHED') return;

        const champion = currentLeague.champion;
        const runnerUp = currentLeague.runnerUp;

        if (!champion || !runnerUp) return;

        const championCard = CHARACTERS_BY_ID[champion];
        const runnerUpCard = CHARACTERS_BY_ID[runnerUp];
        const championParticipant = currentLeague.participants.find(p => p.odId === champion);

        // 히스토리 추가
        const historyEntry: IndividualLeagueHistory = {
          season: currentLeague.season,
          champion,
          championName: championCard?.name.ko || '???',
          runnerUp,
          runnerUpName: runnerUpCard?.name.ko || '???',
          myCardResults: currentLeague.myCardResults.map(card => {
            const cardInfo = CHARACTERS_BY_ID[card.odId];
            return {
              odId: card.odId,
              odName: cardInfo?.name.ko || '???',
              result: card.finalResult,
              isChampion: card.odId === champion,
              isRunnerUp: card.odId === runnerUp
            };
          })
        };

        // 명예의 전당 추가
        const hallEntry = {
          season: currentLeague.season,
          championId: champion,
          championName: championCard?.name.ko || '???',
          crewName: championParticipant?.crewName || '???'
        };

        set({
          history: [...history, historyEntry],
          hallOfFame: [...hallOfFame, hallEntry],
          currentSeason: currentSeason + 1,
          currentLeague: null
        });
      },

      // 리그 초기화
      resetLeague: () => {
        set({ currentLeague: null });
      },

      // ========================================
      // Phase 3 - 16강 지명 시스템
      // ========================================

      // 플레이어 크루 카드 ID 목록
      getPlayerCrewIds: () => {
        const { currentLeague } = get();
        if (!currentLeague) return [];
        return currentLeague.participants
          .filter(p => p.isPlayerCrew)
          .map(p => p.odId);
      },

      // 지명 단계 시작 (32강 완료 후 호출)
      startNomination: () => {
        const { currentLeague } = get();
        if (!currentLeague) return;

        // 32강 통과자 수집 (각 경기 승자)
        const advancerIds: string[] = [];
        for (const match of currentLeague.brackets.round32) {
          if (match.winner) {
            advancerIds.push(match.winner);
          }
        }

        // 참가자 정보 업데이트 (totalStats 계산)
        const updatedParticipants = currentLeague.participants.map(p => {
          const card = CHARACTERS_BY_ID[p.odId];
          const totalStats = card ? calculateTotalStat(card) : 0;
          return { ...p, totalStats, wins: 0, losses: 0, dominantWins: 0 };
        });

        // 32강 결과 기반 wins/losses 업데이트
        for (const match of currentLeague.brackets.round32) {
          if (match.winner) {
            const winner = updatedParticipants.find(p => p.odId === match.winner);
            const loserId = match.winner === match.participant1 ? match.participant2 : match.participant1;
            const loser = updatedParticipants.find(p => p.odId === loserId);

            if (winner) winner.wins = (winner.wins || 0) + 1;
            if (loser) loser.losses = (loser.losses || 0) + 1;
          }
        }

        // 시드 결정 (승리수 → 압승수 → 총능력치)
        const advancerParticipants = advancerIds.map(id =>
          updatedParticipants.find(p => p.odId === id)!
        ).filter(Boolean);

        const sortedSeeds = [...advancerParticipants].sort((a, b) => {
          if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0);
          if ((b.dominantWins || 0) !== (a.dominantWins || 0)) return (b.dominantWins || 0) - (a.dominantWins || 0);
          return (b.totalStats || 0) - (a.totalStats || 0);
        });

        const round16Seeds = sortedSeeds.slice(0, 8).map(p => p.odId);

        // 지명 순서 생성 (A조 → B조 → ... → H조, 각 조 3번씩)
        const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const nominationSteps: NominationStep[] = [];

        groupNames.forEach((groupId, i) => {
          const seedId = round16Seeds[i];

          // 1단계: 시드가 2번 지명
          nominationSteps.push({
            groupId,
            nominatorId: seedId,
            nominatorPosition: 1,
            targetPosition: 2,
            nomineeId: null,
            isCompleted: false,
          });

          // 2단계: 2번이 3번 지명 (2번은 1단계 결과로 결정)
          nominationSteps.push({
            groupId,
            nominatorId: null,
            nominatorPosition: 2,
            targetPosition: 3,
            nomineeId: null,
            isCompleted: false,
          });

          // 3단계: 3번이 4번 지명 (3번은 2단계 결과로 결정)
          nominationSteps.push({
            groupId,
            nominatorId: null,
            nominatorPosition: 3,
            targetPosition: 4,
            nomineeId: null,
            isCompleted: false,
          });
        });

        // 16강 조 초기화 (시드만 배정)
        const round16Groups: LeagueGroup[] = groupNames.map((groupId, i) => ({
          id: groupId,
          participants: [round16Seeds[i]],
          seedId: round16Seeds[i],
          matches: [],
          winner: null,
          winsCount: {},
        }));

        set({
          currentLeague: {
            ...currentLeague,
            participants: updatedParticipants,
            status: 'ROUND_16_NOMINATION',
            nominationSteps,
            currentNominationIndex: 0,
            round16Seeds,
            brackets: {
              ...currentLeague.brackets,
              round16: round16Groups,
            },
          },
        });
      },

      // 현재 지명 단계 가져오기
      getCurrentNominationStep: () => {
        const { currentLeague } = get();
        if (!currentLeague || !currentLeague.nominationSteps) return null;
        const index = currentLeague.currentNominationIndex ?? 0;
        return currentLeague.nominationSteps[index] || null;
      },

      // 지명 가능한 카드 목록 가져오기
      getAvailableForNomination: () => {
        const { currentLeague } = get();
        if (!currentLeague || !currentLeague.nominationSteps) return [];

        // 이미 지명된 카드 ID
        const nominatedIds = new Set<string>();

        // 조에 이미 배정된 참가자
        currentLeague.brackets.round16.forEach(g => {
          g.participants.forEach(id => nominatedIds.add(id));
        });

        // 지명 단계에서 지명된 참가자
        currentLeague.nominationSteps.forEach(step => {
          if (step.nomineeId) nominatedIds.add(step.nomineeId);
        });

        // 지명 가능한 카드 (32강 탈락자 중 아직 지명 안 된 카드)
        return currentLeague.participants.filter(p =>
          p.status === 'ELIMINATED' &&
          p.eliminatedAt === 'ROUND_32' &&
          !nominatedIds.has(p.odId)
        );
      },

      // 카드 지명 (내 카드가 지명할 때)
      nominateCard: (nomineeId: string) => {
        const { currentLeague, getPlayerCrewIds } = get();
        if (!currentLeague || !currentLeague.nominationSteps) return;

        const currentIndex = currentLeague.currentNominationIndex ?? 0;
        const currentStep = currentLeague.nominationSteps[currentIndex];
        if (!currentStep || currentStep.isCompleted) return;

        const playerCardIds = getPlayerCrewIds();

        // 지명 완료 처리
        const updatedSteps = [...currentLeague.nominationSteps];
        updatedSteps[currentIndex] = {
          ...currentStep,
          nomineeId,
          isCompleted: true,
        };

        // 다음 지명자 설정 (같은 조 내 다음 단계)
        const nextStepIndex = currentIndex + 1;
        if (nextStepIndex < updatedSteps.length) {
          const nextStep = updatedSteps[nextStepIndex];

          // 같은 조의 다음 단계면 지명자 설정
          if (nextStep.groupId === currentStep.groupId) {
            updatedSteps[nextStepIndex] = {
              ...nextStep,
              nominatorId: nomineeId,
            };
          }
        }

        // 16강 조에 참가자 추가
        const updatedGroups = currentLeague.brackets.round16.map(g => {
          if (g.id === currentStep.groupId) {
            return {
              ...g,
              participants: [...g.participants, nomineeId],
            };
          }
          return g;
        });

        set({
          currentLeague: {
            ...currentLeague,
            nominationSteps: updatedSteps,
            currentNominationIndex: nextStepIndex,
            brackets: {
              ...currentLeague.brackets,
              round16: updatedGroups,
            },
          },
        });

        // 자동 지명 체크 (다음 지명자가 내 카드가 아니면)
        if (nextStepIndex < updatedSteps.length) {
          const nextStep = updatedSteps[nextStepIndex];
          if (nextStep.nominatorId && !playerCardIds.includes(nextStep.nominatorId)) {
            // 약간의 딜레이 후 자동 지명
            setTimeout(() => get().autoNominate(), 800);
          }
        } else {
          // 모든 지명 완료
          setTimeout(() => get().completeNomination(), 500);
        }
      },

      // AI 자동 지명
      autoNominate: () => {
        const { currentLeague, getAvailableForNomination, nominateCard } = get();
        if (!currentLeague || !currentLeague.nominationSteps) return;

        const currentIndex = currentLeague.currentNominationIndex ?? 0;
        const currentStep = currentLeague.nominationSteps[currentIndex];
        if (!currentStep || currentStep.isCompleted) return;

        const availableCards = getAvailableForNomination();

        if (availableCards.length === 0) {
          console.error('지명 가능한 카드가 없습니다');
          return;
        }

        // AI 지명 로직: 가장 약한 상대 선택 (총 능력치 낮은 순)
        const sorted = [...availableCards].sort((a, b) =>
          (a.totalStats || 0) - (b.totalStats || 0)
        );
        const nomineeId = sorted[0].odId;

        // 지명 처리
        nominateCard(nomineeId);
      },

      // 지명 완료 처리
      completeNomination: () => {
        const { currentLeague, createRound16Matches } = get();
        if (!currentLeague) return;

        // 모든 조가 4명씩 있는지 확인
        const allGroupsComplete = currentLeague.brackets.round16.every(
          g => g.participants.length === 4
        );

        if (!allGroupsComplete) {
          console.error('지명이 완료되지 않았습니다');
          return;
        }

        // 16강 경기 생성
        createRound16Matches();

        set({
          currentLeague: {
            ...currentLeague,
            status: 'ROUND_16',
          },
        });
      },

      // 16강 경기 생성 (조별 4명 토너먼트)
      createRound16Matches: () => {
        const { currentLeague } = get();
        if (!currentLeague) return;

        const updatedGroups = currentLeague.brackets.round16.map(group => {
          const [p1, p2, p3, p4] = group.participants;

          // 1경기: 시드(1번) vs 4번 (2선승)
          const match1: IndividualMatch = {
            id: `r16_${group.id}_semi1`,
            participant1: p1,
            participant2: p4,
            winner: null,
            score: { p1: 0, p2: 0 },
            format: '2WIN',
            played: false,
          };

          // 2경기: 2번 vs 3번 (2선승)
          const match2: IndividualMatch = {
            id: `r16_${group.id}_semi2`,
            participant1: p2,
            participant2: p3,
            winner: null,
            score: { p1: 0, p2: 0 },
            format: '2WIN',
            played: false,
          };

          // 3경기: 1경기 승자 vs 2경기 승자 (2선승, 조 결승)
          const match3: IndividualMatch = {
            id: `r16_${group.id}_final`,
            participant1: '', // 나중에 설정
            participant2: '', // 나중에 설정
            winner: null,
            score: { p1: 0, p2: 0 },
            format: '2WIN',
            played: false,
          };

          return {
            ...group,
            matches: [match1, match2, match3],
            winsCount: { [p1]: 0, [p2]: 0, [p3]: 0, [p4]: 0 },
          };
        });

        set({
          currentLeague: {
            ...currentLeague,
            brackets: {
              ...currentLeague.brackets,
              round16: updatedGroups,
            },
          },
        });
      }
    }),
    {
      name: 'individual-league-storage',
      version: 2
    }
  )
);

// 셀렉터
export const selectCurrentLeague = (state: IndividualLeagueState) => state.currentLeague;
export const selectLeagueStatus = (state: IndividualLeagueState) => state.currentLeague?.status ?? 'NOT_STARTED';
export const selectLeagueHistory = (state: IndividualLeagueState) => state.history;
export const selectHallOfFame = (state: IndividualLeagueState) => state.hallOfFame;
export const selectCurrentSeason = (state: IndividualLeagueState) => state.currentSeason;

// ========================================
// 개인 리그 상태 관리 (Zustand)
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  IndividualLeague,
  IndividualLeagueStatus,
  IndividualLeagueHistory
} from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';
import {
  generateParticipants,
  generateInitialBrackets,
  simulateMatch,
  processRound32Results,
  processRound16Results,
  processQuarterResults,
  processSemiResults,
  processFinalResult,
  findNextPlayerMatch,
  isRoundComplete,
  getNextRoundStatus,
  getPlayerCardStatuses,
  updateGroupWins
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
        const { currentLeague } = get();
        if (!currentLeague) return;

        // 현재 라운드 완료 확인
        if (!isRoundComplete(currentLeague)) {
          console.warn('현재 라운드가 완료되지 않았습니다.');
          return;
        }

        const status = currentLeague.status;
        let updatedBrackets = currentLeague.brackets;
        let updatedParticipants = currentLeague.participants;
        let newStatus = getNextRoundStatus(status);
        let champion: string | null = null;
        let runnerUp: string | null = null;

        // 라운드별 처리
        if (status === 'ROUND_32') {
          const result = processRound32Results(updatedBrackets, updatedParticipants);
          updatedBrackets = result.brackets;
          updatedParticipants = result.participants;
        }

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
      }
    }),
    {
      name: 'individual-league-storage',
      version: 1
    }
  )
);

// 셀렉터
export const selectCurrentLeague = (state: IndividualLeagueState) => state.currentLeague;
export const selectLeagueStatus = (state: IndividualLeagueState) => state.currentLeague?.status ?? 'NOT_STARTED';
export const selectLeagueHistory = (state: IndividualLeagueState) => state.history;
export const selectHallOfFame = (state: IndividualLeagueState) => state.hallOfFame;
export const selectCurrentSeason = (state: IndividualLeagueState) => state.currentSeason;

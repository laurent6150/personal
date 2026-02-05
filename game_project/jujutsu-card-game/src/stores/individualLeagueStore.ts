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
import type {
  BattleState,
  IndividualMatchResult,
  BattleTurn,
  SetResult,
  ArenaEffect
} from '../types/individualLeague';
import { initialBattleState } from '../types/individualLeague';
import { CHARACTERS_BY_ID } from '../data/characters';
import { getRandomArena, applyArenaEffect } from '../data/arenaEffects';
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

  // 1:1 배틀 상태
  currentBattleState: BattleState;
  lastMatchResult: IndividualMatchResult | null;

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

  // 1:1 배틀 액션
  startBattle: (matchId: string, playerCardId: string, opponentId: string) => void;
  executeTurn: () => BattleTurn | null;
  executeSet: () => SetResult | null;
  finishBattle: () => IndividualMatchResult | null;
  resetBattle: () => void;
  getBattleStats: () => {
    playerCard: { id: string; name: string; basePower: number; attribute: string; arenaBonusPercent: number } | null;
    opponentCard: { id: string; name: string; basePower: number; attribute: string; arenaBonusPercent: number } | null;
    arena: ArenaEffect | null;
  };
}

export const useIndividualLeagueStore = create<IndividualLeagueState>()(
  persist(
    (set, get) => ({
      currentSeason: 1,
      currentLeague: null,
      history: [],
      hallOfFame: [],

      // 1:1 배틀 상태 초기값
      currentBattleState: initialBattleState,
      lastMatchResult: null,

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

        // 16강 조별 경기 (4인 토너먼트: 준결승 2경기 + 조 결승 1경기)
        if (status === 'ROUND_16') {
          updatedBrackets.round16 = updatedBrackets.round16.map(group => {
            const matchIndex = group.matches.findIndex(m => m.id === matchId);
            if (matchIndex === -1) return group;

            const updatedMatches = [...group.matches];
            updatedMatches[matchIndex] = { ...updatedMatches[matchIndex], winner, score, played: true };

            // 준결승 경기인지 확인 (semi1 또는 semi2)
            const isSemi1 = matchId.includes('_semi1');
            const isSemi2 = matchId.includes('_semi2');
            const isFinal = matchId.includes('_final');

            // 조 결승 경기가 완료되면 조 승자 결정
            if (isFinal) {
              // 탈락자 처리 (조 결승 패자는 16강 탈락)
              const loserId = winner === updatedMatches[matchIndex].participant1
                ? updatedMatches[matchIndex].participant2
                : updatedMatches[matchIndex].participant1;
              const loserIdx = updatedParticipants.findIndex(p => p.odId === loserId);
              if (loserIdx !== -1) {
                updatedParticipants[loserIdx] = {
                  ...updatedParticipants[loserIdx],
                  status: 'ELIMINATED',
                  eliminatedAt: 'ROUND_16'
                };
              }

              return {
                ...group,
                matches: updatedMatches,
                winner
              };
            }

            // 준결승 경기가 완료되면 조 결승 참가자 업데이트
            if (isSemi1 || isSemi2) {
              // 준결승 패자 탈락 처리
              const loserId = winner === updatedMatches[matchIndex].participant1
                ? updatedMatches[matchIndex].participant2
                : updatedMatches[matchIndex].participant1;
              const loserIdx = updatedParticipants.findIndex(p => p.odId === loserId);
              if (loserIdx !== -1) {
                updatedParticipants[loserIdx] = {
                  ...updatedParticipants[loserIdx],
                  status: 'ELIMINATED',
                  eliminatedAt: 'ROUND_16'
                };
              }

              // 조 결승 매치 찾기 (인덱스 2)
              const finalMatchIdx = updatedMatches.findIndex(m => m.id.includes('_final'));
              if (finalMatchIdx !== -1) {
                const finalMatch = updatedMatches[finalMatchIdx];
                // 준결승1 승자는 조 결승 participant1
                // 준결승2 승자는 조 결승 participant2
                if (isSemi1) {
                  updatedMatches[finalMatchIdx] = {
                    ...finalMatch,
                    participant1: winner
                  };
                } else if (isSemi2) {
                  updatedMatches[finalMatchIdx] = {
                    ...finalMatch,
                    participant2: winner
                  };
                }
              }
            }

            return {
              ...group,
              matches: updatedMatches
            };
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
          // 4인 토너먼트 구조: 각 조별로 준결승 2경기 → 조 결승 1경기
          for (const group of currentLeague.brackets.round16) {
            // 조별 승자가 결정될 때까지 반복
            let loopCount = 0;
            const maxLoops = 10; // 무한 루프 방지

            while (loopCount < maxLoops) {
              loopCount++;

              // 최신 상태 가져오기
              const updatedLeague = get().currentLeague;
              if (!updatedLeague) break;

              const updatedGroup = updatedLeague.brackets.round16.find(g => g.id === group.id);
              if (!updatedGroup) break;
              if (updatedGroup.winner) break;

              // 1. 먼저 준결승 경기 처리 (semi1, semi2)
              const semi1 = updatedGroup.matches.find(m => m.id.includes('_semi1') && !m.played);
              const semi2 = updatedGroup.matches.find(m => m.id.includes('_semi2') && !m.played);

              if (semi1) {
                const result = simulateMatch(semi1.participant1, semi1.participant2, semi1.format);
                playMatch(semi1.id, result.winner, result.score);
                continue;
              }

              if (semi2) {
                const result = simulateMatch(semi2.participant1, semi2.participant2, semi2.format);
                playMatch(semi2.id, result.winner, result.score);
                continue;
              }

              // 2. 준결승 완료 후 조 결승 처리
              const finalMatch = updatedGroup.matches.find(m => m.id.includes('_final'));
              if (finalMatch && !finalMatch.played && finalMatch.participant1 && finalMatch.participant2) {
                const result = simulateMatch(finalMatch.participant1, finalMatch.participant2, finalMatch.format);
                playMatch(finalMatch.id, result.winner, result.score);
                continue;
              }

              break;
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

        console.log('[startNomination] === 16강 지명 시작 ===');

        // 32강 통과자 수집 (각 경기 승자)
        const advancerIds: string[] = [];
        for (const match of currentLeague.brackets.round32) {
          if (match.winner) {
            advancerIds.push(match.winner);
          }
        }

        console.log(`[startNomination] 32강 통과자: ${advancerIds.length}명`);

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

        // 32강 탈락자 수 확인
        const eliminated = updatedParticipants.filter(p =>
          p.status === 'ELIMINATED' && p.eliminatedAt === 'ROUND_32'
        );
        console.log(`[startNomination] 32강 탈락자: ${eliminated.length}명`);

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
        const nonSeedWinners = advancerIds.filter(id => !round16Seeds.includes(id));

        console.log(`[startNomination] 시드 (상위 8명): ${round16Seeds.length}명`);
        console.log(`[startNomination] 비시드 승자 (하위 8명): ${nonSeedWinners.length}명`);
        console.log(`[startNomination] 지명 가능 총합: ${eliminated.length + nonSeedWinners.length}명 (24명이어야 함)`);

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

        // 이미 지명/배정된 카드 ID
        const assignedIds = new Set<string>();

        // 조에 이미 배정된 참가자 (시드 포함)
        currentLeague.brackets.round16.forEach(g => {
          g.participants.forEach(id => assignedIds.add(id));
        });

        // 지명 단계에서 지명된 참가자
        currentLeague.nominationSteps.forEach(step => {
          if (step.nomineeId) assignedIds.add(step.nomineeId);
        });

        // 시드 ID 목록
        const seedIds = new Set(currentLeague.round16Seeds || []);

        // 지명 가능한 카드:
        // 1. 32강 탈락자 (16명)
        // 2. 32강 통과자 중 시드가 아닌 자 (8명) - ACTIVE 상태
        return currentLeague.participants.filter(p => {
          // 이미 배정됨
          if (assignedIds.has(p.odId)) return false;

          // 32강 탈락자
          if (p.status === 'ELIMINATED' && p.eliminatedAt === 'ROUND_32') return true;

          // 32강 통과자 중 시드가 아닌 자 (비시드 승자)
          if (p.status === 'ACTIVE' && !seedIds.has(p.odId)) return true;

          return false;
        });
      },

      // 카드 지명 (내 카드가 지명할 때)
      nominateCard: (nomineeId: string) => {
        const { currentLeague } = get();
        if (!currentLeague || !currentLeague.nominationSteps) return;

        const currentIndex = currentLeague.currentNominationIndex ?? 0;
        const currentStep = currentLeague.nominationSteps[currentIndex];
        if (!currentStep || currentStep.isCompleted) {
          console.log('[nominateCard] 현재 스텝 없거나 완료됨');
          return;
        }

        console.log(`[nominateCard] ${currentStep.nominatorId}가 ${nomineeId}를 지명`);

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
          if (nextStep.groupId === currentStep.groupId && nextStep.nominatorPosition > 1) {
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

        // 지명된 참가자 상태 업데이트: ELIMINATED → ACTIVE (16강 참가)
        const updatedParticipants = currentLeague.participants.map(p => {
          if (p.odId === nomineeId && p.status === 'ELIMINATED') {
            console.log(`[nominateCard] ${p.odName} 상태 변경: ELIMINATED → ACTIVE (16강 지명)`);
            return {
              ...p,
              status: 'ACTIVE' as const,
              eliminatedAt: undefined, // 탈락 단계 초기화
            };
          }
          return p;
        });

        // 상태 업데이트
        set({
          currentLeague: {
            ...currentLeague,
            participants: updatedParticipants,
            nominationSteps: updatedSteps,
            currentNominationIndex: nextStepIndex,
            brackets: {
              ...currentLeague.brackets,
              round16: updatedGroups,
            },
          },
        });

        console.log(`[nominateCard] 다음 인덱스: ${nextStepIndex}, 총 스텝: ${updatedSteps.length}`);

        // 지명 완료 체크 (모든 스텝 완료 시)
        if (nextStepIndex >= updatedSteps.length) {
          console.log('[nominateCard] 모든 지명 완료');
          setTimeout(() => get().completeNomination(), 300);
        }
        // AI 자동 지명은 NominationScreen의 useEffect에서 처리
      },

      // AI 자동 지명 (직접 상태 업데이트)
      autoNominate: () => {
        const { currentLeague, getAvailableForNomination } = get();
        if (!currentLeague || !currentLeague.nominationSteps) {
          console.log('[autoNominate] 리그 또는 지명 스텝 없음');
          return;
        }

        const currentIndex = currentLeague.currentNominationIndex ?? 0;
        const currentStep = currentLeague.nominationSteps[currentIndex];
        if (!currentStep || currentStep.isCompleted) {
          console.log('[autoNominate] 현재 스텝 없거나 완료됨');
          return;
        }

        console.log(`[autoNominate] === 지명 ${currentIndex + 1}/${currentLeague.nominationSteps.length} ===`);
        console.log(`[autoNominate] 지명자: ${currentStep.nominatorId}, 조: ${currentStep.groupId}`);

        const availableCards = getAvailableForNomination();
        console.log(`[autoNominate] 지명 가능 카드 수: ${availableCards.length}`);

        if (availableCards.length === 0) {
          console.error('[autoNominate] ❌ 지명 가능한 카드가 없습니다!');
          console.log('[autoNominate] 디버깅 정보:');
          const seedIds = new Set(currentLeague.round16Seeds || []);
          const eliminated = currentLeague.participants.filter(p =>
            p.status === 'ELIMINATED' && p.eliminatedAt === 'ROUND_32'
          );
          const nonSeedWinners = currentLeague.participants.filter(p =>
            p.status === 'ACTIVE' && !seedIds.has(p.odId)
          );
          console.log(`- 시드: ${seedIds.size}명`);
          console.log(`- 32강 탈락자: ${eliminated.length}명`);
          console.log(`- 비시드 승자: ${nonSeedWinners.length}명`);
          console.log(`- 이미 배정된 카드:`, currentLeague.brackets.round16.flatMap(g => g.participants).length);
          // 지명 완료 체크
          get().completeNomination();
          return;
        }

        // AI 지명 로직: 가장 약한 상대 선택 (총 능력치 낮은 순)
        const sorted = [...availableCards].sort((a, b) =>
          (a.totalStats || 0) - (b.totalStats || 0)
        );
        const nominee = sorted[0];
        const nomineeId = nominee.odId;

        console.log(`[autoNominate] ✅ ${currentStep.nominatorId}가 ${nominee.odName}(${nomineeId})를 지명`);

        // 직접 상태 업데이트 (nominateCard 호출 대신)
        const updatedSteps = [...currentLeague.nominationSteps];
        updatedSteps[currentIndex] = {
          ...currentStep,
          nomineeId,
          isCompleted: true,
        };

        // 다음 지명자 설정
        const nextStepIndex = currentIndex + 1;
        if (nextStepIndex < updatedSteps.length) {
          const nextStep = updatedSteps[nextStepIndex];

          // 같은 조의 다음 단계면 지명자 설정
          if (nextStep.groupId === currentStep.groupId && nextStep.nominatorPosition > 1) {
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

        // 지명된 참가자 상태 업데이트: ELIMINATED → ACTIVE (16강 참가)
        const updatedParticipants = currentLeague.participants.map(p => {
          if (p.odId === nomineeId && p.status === 'ELIMINATED') {
            console.log(`[autoNominate] ${p.odName} 상태 변경: ELIMINATED → ACTIVE (16강 지명)`);
            return {
              ...p,
              status: 'ACTIVE' as const,
              eliminatedAt: undefined, // 탈락 단계 초기화
            };
          }
          return p;
        });

        // 상태 업데이트
        set({
          currentLeague: {
            ...currentLeague,
            participants: updatedParticipants,
            nominationSteps: updatedSteps,
            currentNominationIndex: nextStepIndex,
            brackets: {
              ...currentLeague.brackets,
              round16: updatedGroups,
            },
          },
        });

        console.log(`[autoNominate] 다음 인덱스: ${nextStepIndex}, 총 스텝: ${updatedSteps.length}`);

        // 지명 완료 체크
        if (nextStepIndex >= updatedSteps.length) {
          console.log('[autoNominate] 모든 지명 완료');
          setTimeout(() => get().completeNomination(), 300);
        }
        // 다음 AI 지명은 NominationScreen의 useEffect에서 처리
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
      },

      // ========================================
      // 1:1 배틀 시스템
      // ========================================

      // 배틀 시작
      startBattle: (matchId: string, playerCardId: string, opponentId: string) => {
        const arena = getRandomArena();
        console.log(`[Battle] 배틀 시작: ${playerCardId} vs ${opponentId}, 경기장: ${arena.name}`);

        set({
          currentBattleState: {
            isActive: true,
            matchId,
            playerCardId,
            opponentId,
            arena,
            currentSet: 1,
            currentTurn: 1,
            sets: [],
            currentSetTurns: [],
            playerSetWins: 0,
            opponentSetWins: 0,
            phase: 'READY',
          },
        });
      },

      // 턴 실행 (한 턴 전투)
      executeTurn: () => {
        const { currentBattleState } = get();
        if (!currentBattleState.isActive || !currentBattleState.playerCardId || !currentBattleState.opponentId) {
          return null;
        }

        const playerCard = CHARACTERS_BY_ID[currentBattleState.playerCardId];
        const opponentCard = CHARACTERS_BY_ID[currentBattleState.opponentId];
        const arena = currentBattleState.arena;

        if (!playerCard || !opponentCard || !arena) {
          console.error('[Battle] 카드 또는 경기장 정보 없음');
          return null;
        }

        // 기본 전투력 계산
        const playerBasePower = calculateTotalStat(playerCard);
        const opponentBasePower = calculateTotalStat(opponentCard);

        // 경기장 효과 적용
        const playerResult = applyArenaEffect(playerBasePower, playerCard.attribute, arena);
        const opponentResult = applyArenaEffect(opponentBasePower, opponentCard.attribute, arena);

        // 랜덤 변동 (±15%)
        const playerVariance = 0.85 + Math.random() * 0.30;
        const opponentVariance = 0.85 + Math.random() * 0.30;

        const playerFinalPower = Math.round(playerResult.finalPower * playerVariance);
        const opponentFinalPower = Math.round(opponentResult.finalPower * opponentVariance);

        // 크리티컬 (5% 확률, 1.5배)
        const playerCritical = Math.random() < 0.05;
        const opponentCritical = Math.random() < 0.05;
        const playerPower = playerCritical ? Math.round(playerFinalPower * 1.5) : playerFinalPower;
        const opponentPower = opponentCritical ? Math.round(opponentFinalPower * 1.5) : opponentFinalPower;

        // 승자 결정
        const winner: 'player' | 'opponent' = playerPower >= opponentPower ? 'player' : 'opponent';

        const turn: BattleTurn = {
          turnNumber: currentBattleState.currentTurn,
          playerPower,
          opponentPower,
          winner,
          criticalHit: playerCritical || opponentCritical,
          arenaBonus: {
            player: playerResult.bonusPercent,
            opponent: opponentResult.bonusPercent,
          },
        };

        console.log(`[Battle] 턴 ${turn.turnNumber}: 플레이어 ${playerPower} vs 상대 ${opponentPower} → ${winner} 승`);

        // 상태 업데이트
        const newSetTurns = [...currentBattleState.currentSetTurns, turn];
        const playerTurnWins = newSetTurns.filter(t => t.winner === 'player').length;
        const opponentTurnWins = newSetTurns.filter(t => t.winner === 'opponent').length;

        // 세트 승자 확인 (3판 2선승)
        const setWinner = playerTurnWins >= 2 ? 'player' : opponentTurnWins >= 2 ? 'opponent' : null;

        if (setWinner) {
          // 세트 완료
          const setResult: SetResult = {
            setNumber: currentBattleState.currentSet,
            turns: newSetTurns,
            playerWins: playerTurnWins,
            opponentWins: opponentTurnWins,
            winner: setWinner,
          };

          const newPlayerSetWins = currentBattleState.playerSetWins + (setWinner === 'player' ? 1 : 0);
          const newOpponentSetWins = currentBattleState.opponentSetWins + (setWinner === 'opponent' ? 1 : 0);

          console.log(`[Battle] 세트 ${setResult.setNumber} 완료: ${setWinner} 승 (세트 스코어: ${newPlayerSetWins}-${newOpponentSetWins})`);

          // 경기 승자 확인 (5판 3선승)
          const matchWinner = newPlayerSetWins >= 3 ? 'player' : newOpponentSetWins >= 3 ? 'opponent' : null;

          set({
            currentBattleState: {
              ...currentBattleState,
              sets: [...currentBattleState.sets, setResult],
              currentSetTurns: [],
              currentTurn: 1,
              currentSet: currentBattleState.currentSet + 1,
              playerSetWins: newPlayerSetWins,
              opponentSetWins: newOpponentSetWins,
              phase: matchWinner ? 'MATCH_END' : 'SET_END',
            },
          });
        } else {
          // 세트 진행 중
          set({
            currentBattleState: {
              ...currentBattleState,
              currentSetTurns: newSetTurns,
              currentTurn: currentBattleState.currentTurn + 1,
              phase: 'BATTLING',
            },
          });
        }

        return turn;
      },

      // 세트 전체 실행 (자동 진행)
      executeSet: () => {
        const { executeTurn, currentBattleState } = get();

        // 세트가 끝날 때까지 턴 실행
        while (currentBattleState.phase !== 'SET_END' && currentBattleState.phase !== 'MATCH_END') {
          const turn = executeTurn();
          if (!turn) break;

          // 상태 다시 가져오기
          const newState = get().currentBattleState;
          if (newState.phase === 'SET_END' || newState.phase === 'MATCH_END') break;
        }

        const updatedState = get().currentBattleState;
        if (updatedState.sets.length > 0) {
          return updatedState.sets[updatedState.sets.length - 1];
        }
        return null;
      },

      // 배틀 종료 및 결과 반환
      finishBattle: () => {
        const { currentBattleState, playMatch } = get();
        if (!currentBattleState.isActive || !currentBattleState.matchId) {
          return null;
        }

        const matchWinner = currentBattleState.playerSetWins >= 3 ? 'player' : 'opponent';
        const winnerId = matchWinner === 'player'
          ? currentBattleState.playerCardId!
          : currentBattleState.opponentId!;

        console.log(`[Battle] 경기 종료: ${matchWinner} 승 (${currentBattleState.playerSetWins}-${currentBattleState.opponentSetWins})`);

        // 경기 결과 생성
        const result: IndividualMatchResult = {
          matchId: currentBattleState.matchId,
          playerCardId: currentBattleState.playerCardId!,
          opponentId: currentBattleState.opponentId!,
          arena: currentBattleState.arena!,
          sets: currentBattleState.sets,
          playerSetWins: currentBattleState.playerSetWins,
          opponentSetWins: currentBattleState.opponentSetWins,
          winner: matchWinner,
        };

        // 개인 리그 결과 기록
        playMatch(
          currentBattleState.matchId,
          winnerId,
          { p1: currentBattleState.playerSetWins, p2: currentBattleState.opponentSetWins }
        );

        // 상태 리셋
        set({
          currentBattleState: initialBattleState,
          lastMatchResult: result,
        });

        return result;
      },

      // 배틀 리셋
      resetBattle: () => {
        set({
          currentBattleState: initialBattleState,
        });
      },

      // 배틀 통계 가져오기 (UI용)
      getBattleStats: () => {
        const { currentBattleState } = get();
        if (!currentBattleState.isActive) {
          return { playerCard: null, opponentCard: null, arena: null };
        }

        const playerCard = currentBattleState.playerCardId ? CHARACTERS_BY_ID[currentBattleState.playerCardId] : null;
        const opponentCard = currentBattleState.opponentId ? CHARACTERS_BY_ID[currentBattleState.opponentId] : null;
        const arena = currentBattleState.arena;

        if (!playerCard || !opponentCard || !arena) {
          return { playerCard: null, opponentCard: null, arena: null };
        }

        const playerBasePower = calculateTotalStat(playerCard);
        const opponentBasePower = calculateTotalStat(opponentCard);
        const playerArenaEffect = applyArenaEffect(playerBasePower, playerCard.attribute, arena);
        const opponentArenaEffect = applyArenaEffect(opponentBasePower, opponentCard.attribute, arena);

        return {
          playerCard: {
            id: currentBattleState.playerCardId!,
            name: playerCard.name.ko,
            basePower: playerBasePower,
            attribute: playerCard.attribute,
            arenaBonusPercent: playerArenaEffect.bonusPercent,
          },
          opponentCard: {
            id: currentBattleState.opponentId!,
            name: opponentCard.name.ko,
            basePower: opponentBasePower,
            attribute: opponentCard.attribute,
            arenaBonusPercent: opponentArenaEffect.bonusPercent,
          },
          arena,
        };
      },
    }),
    {
      name: 'individual-league-storage',
      version: 5,
      migrate: (persistedState: unknown, version: number) => {
        console.log('[IndividualLeague] 스토리지 마이그레이션:', { version, persistedState });
        // 버전 4 이하에서 마이그레이션: 배틀 상태 필드 추가
        if (version < 5) {
          console.log('[IndividualLeague] 이전 버전 데이터에 배틀 상태 추가');
          const state = persistedState as Partial<IndividualLeagueState>;
          return {
            currentSeason: state.currentSeason ?? 1,
            currentLeague: state.currentLeague ?? null,
            history: state.history ?? [],
            hallOfFame: state.hallOfFame ?? [],
            currentBattleState: initialBattleState,
            lastMatchResult: null
          };
        }
        return persistedState as IndividualLeagueState;
      }
    }
  )
);

// 셀렉터
export const selectCurrentLeague = (state: IndividualLeagueState) => state.currentLeague;
export const selectLeagueStatus = (state: IndividualLeagueState) => state.currentLeague?.status ?? 'NOT_STARTED';
export const selectLeagueHistory = (state: IndividualLeagueState) => state.history;
export const selectHallOfFame = (state: IndividualLeagueState) => state.hallOfFame;
export const selectCurrentSeason = (state: IndividualLeagueState) => state.currentSeason;

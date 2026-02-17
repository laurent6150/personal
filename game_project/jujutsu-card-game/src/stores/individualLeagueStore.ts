// ========================================
// 개인 리그 상태 관리 (Zustand)
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  IndividualLeague,
  IndividualLeagueStatus,
  IndividualLeagueHistory,
  IndividualMatch,
  IndividualLeagueAward,
  IndividualMatchRecord
} from '../types';
import type {
  BattleState,
  IndividualMatchResult,
  BattleTurn,
  SetResult,
  ArenaEffect,
  SimMatchResult,
  Participant
} from '../types/individualLeague';
import { initialBattleState, getRequiredWins } from '../types/individualLeague';
import type { LeagueMatchFormat } from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';
import { getRandomArena, applyArenaEffect, getRandomArenas } from '../data/arenaEffects';
import { ARENAS_BY_ID } from '../data/arenas';
import {
  generateParticipants,
  generateInitialBrackets,
  simulateMatch,
  setParticipantBonusCache,
  processRound32Results,
  processRound16Results,
  processQuarterResults,
  processSemiResults,
  processFinalResult,
  findNextPlayerMatch,
  isRoundComplete,
  getNextRoundStatus,
  getPlayerCardStatuses,
  calculateTotalStat,
  calculateFinalRankings,
  calculateAwards
} from '../utils/individualLeagueSystem';
import { useCardRecordStore } from './cardRecordStore';
import { useSeasonStore } from './seasonStore';
import { usePlayerStore } from './playerStore';
import type { IndividualSeasonRecord } from '../types';
import {
  simulateMatch as simulateBattle,
  getBestOfForRound
} from '../utils/individualBattleSimulator';

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
  playMatch: (matchId: string, winner: string, score: { p1: number; p2: number }, arenas?: string[]) => void;
  simulateAllRemainingMatches: () => void;
  advanceRound: () => void;
  getNextPlayerMatch: () => ReturnType<typeof findNextPlayerMatch>;
  getPlayerCardStatuses: () => ReturnType<typeof getPlayerCardStatuses>;
  finishLeague: () => void;
  resetLeague: () => void;

  // 유틸리티
  getPlayerCrewIds: () => string[];

  // 1:1 배틀 액션
  startBattle: (matchId: string, playerCardId: string, opponentId: string, format: import('../types').LeagueMatchFormat) => void;
  executeTurn: () => BattleTurn | null;
  executeSet: () => SetResult | null;
  finishBattle: () => IndividualMatchResult | null;
  resetBattle: () => void;
  getBattleStats: () => {
    playerCard: { id: string; name: string; basePower: number; attribute: string; arenaBonusPercent: number } | null;
    opponentCard: { id: string; name: string; basePower: number; attribute: string; arenaBonusPercent: number } | null;
    arena: ArenaEffect | null;
    format: LeagueMatchFormat;
    requiredWins: number;
  };

  // Step 2: 시뮬레이션 기반 배틀
  lastSimMatchResult: SimMatchResult | null;
  simulateIndividualMatch: (matchId: string, preAssignedArenaIds?: string[]) => SimMatchResult | null;
  skipToNextPlayerMatch: () => IndividualMatch | null;
  findNextMatch: () => IndividualMatch | null;
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
      lastSimMatchResult: null,

      // 새 리그 시작
      startNewLeague: (playerCrewIds: string[], playerCrewName = '내 크루') => {
        // seasonStore에서 현재 시즌 번호 가져오기
        const seasonStoreState = useSeasonStore.getState();
        const seasonNumber = seasonStoreState.currentSeason?.number ||
                             seasonStoreState.seasonHistory.length + 1;

        // 개인 리그 완료 여부 체크 (이미 이번 시즌 개인리그를 완료했으면 시작 불가)
        if (seasonStoreState.individualLeagueCompleted) {
          console.warn('[startNewLeague] 이번 시즌 개인 리그가 이미 완료되었습니다. 시즌 종료를 먼저 처리하세요.');
          return;
        }

        const { hallOfFame } = get();

        // 전 시즌 1~4위 시드 계산 (시즌 2부터)
        let seeds: string[] = [];
        if (seasonNumber > 1) {
          // 이전 시즌 결과에서 시드 추출
          const prevSeasonHallOfFame = hallOfFame.filter(h => h.season === seasonNumber - 1);
          if (prevSeasonHallOfFame.length > 0) {
            seeds.push(prevSeasonHallOfFame[0].championId);  // 1위
          }
          // 참고: runnerUp, thirdPlace, fourthPlace는 히스토리에서 가져와야 함
          // 간단히 현재 hallOfFame만 사용 (추후 확장 가능)
        }

        // 플레이어 카드 정보 가져오기 (장비/레벨 반영용)
        const playerStoreState = usePlayerStore.getState();
        const playerCards = playerCrewIds
          .map(cardId => playerStoreState.player.ownedCards[cardId])
          .filter((pc): pc is import('../types').PlayerCard => pc !== undefined);

        // 참가자 생성 (32명, 등급순 선발 + 시드 + 장비/레벨 반영)
        const participants = generateParticipants(playerCrewIds, playerCrewName, seeds, playerCards);

        // 참가자 보너스 캐시 초기화 (전투 시뮬레이션 성능 최적화)
        setParticipantBonusCache(participants);

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
          season: seasonNumber,     // seasonStore 기반 시즌 번호 사용
          status: 'ROUND_32',
          participants,
          brackets,
          champion: null,
          runnerUp: null,
          thirdPlace: null,
          fourthPlace: null,
          seeds,
          myCardResults
        };

        set({
          currentSeason: seasonNumber,
          currentLeague: league
        });
      },

      // 경기 결과 기록 (플레이어 직접 플레이 또는 시뮬레이션)
      playMatch: (matchId: string, winner: string, score: { p1: number; p2: number }, arenas?: string[]) => {
        const { currentLeague } = get();
        if (!currentLeague) return;

        const status = currentLeague.status;
        let updatedBrackets = { ...currentLeague.brackets };
        let updatedParticipants = [...currentLeague.participants];

        // 32강 조별 리그 경기 (풀 리그전)
        if (status === 'ROUND_32') {
          // round32 배열 업데이트
          updatedBrackets.round32 = updatedBrackets.round32.map(m =>
            m.id === matchId
              ? { ...m, winner, score, played: true, arenas: arenas || m.arenas }
              : m
          );

          // round32Groups 순위 업데이트
          if (updatedBrackets.round32Groups) {
            const match = updatedBrackets.round32.find(m => m.id === matchId);
            if (match && match.groupId) {
              updatedBrackets.round32Groups = updatedBrackets.round32Groups.map(group => {
                if (group.id !== match.groupId) return group;

                // standings 업데이트
                const updatedStandings = group.standings.map(s => {
                  if (s.odId === winner) {
                    return { ...s, wins: s.wins + 1 };
                  }
                  const loserId = winner === match.participant1 ? match.participant2 : match.participant1;
                  if (s.odId === loserId) {
                    return { ...s, losses: s.losses + 1 };
                  }
                  return s;
                });

                // 조별 리그 완료 체크 (6경기 모두 완료)
                const groupMatches = updatedBrackets.round32.filter(m => m.groupId === group.id);
                const allPlayed = groupMatches.every(m => m.played);

                return {
                  ...group,
                  standings: updatedStandings,
                  isCompleted: allPlayed
                };
              });
            }
          }
        }

        // 16강 토너먼트 (1:1 녹아웃)
        if (status === 'ROUND_16') {
          if (updatedBrackets.round16Matches) {
            updatedBrackets.round16Matches = updatedBrackets.round16Matches.map(m =>
              m.id === matchId
                ? { ...m, winner, score, played: true, arenas: arenas || m.arenas }
                : m
            );

            // 패자 탈락 처리
            const match = updatedBrackets.round16Matches.find(m => m.id === matchId);
            if (match) {
              const loserId = winner === match.participant1 ? match.participant2 : match.participant1;
              const loserIdx = updatedParticipants.findIndex(p => p.odId === loserId);
              if (loserIdx !== -1) {
                updatedParticipants[loserIdx] = {
                  ...updatedParticipants[loserIdx],
                  status: 'ELIMINATED',
                  eliminatedAt: 'ROUND_16'
                };
              }
            }
          }
        }

        // 8강 경기
        if (status === 'QUARTER') {
          updatedBrackets.quarter = updatedBrackets.quarter.map(m =>
            m.id === matchId
              ? { ...m, winner, score, played: true, arenas: arenas || m.arenas }
              : m
          );
        }

        // 4강 경기
        if (status === 'SEMI') {
          updatedBrackets.semi = updatedBrackets.semi.map(m =>
            m.id === matchId
              ? { ...m, winner, score, played: true, arenas: arenas || m.arenas }
              : m
          );
        }

        // 결승 경기
        if (status === 'FINAL' && updatedBrackets.final?.id === matchId) {
          updatedBrackets.final = {
            ...updatedBrackets.final,
            winner,
            score,
            played: true,
            arenas: arenas || updatedBrackets.final.arenas
          };
        }

        // 3/4위전 경기
        if (status === 'FINAL' && updatedBrackets.thirdPlace?.id === matchId) {
          updatedBrackets.thirdPlace = {
            ...updatedBrackets.thirdPlace,
            winner,
            score,
            played: true,
            arenas: arenas || updatedBrackets.thirdPlace.arenas
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
          // 16강 토너먼트: 1:1 녹아웃 8경기
          const round16Matches = currentLeague.brackets.round16Matches || [];
          for (const match of round16Matches) {
            if (!match.played) {
              const result = simulateMatch(match.participant1, match.participant2, match.format);
              playMatch(match.id, result.winner, result.score);
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

        if (status === 'FINAL') {
          // 결승전
          if (currentLeague.brackets.final && !currentLeague.brackets.final.played) {
            const match = currentLeague.brackets.final;
            const result = simulateMatch(match.participant1, match.participant2, match.format);
            playMatch(match.id, result.winner, result.score);
          }

          // 3/4위전
          if (currentLeague.brackets.thirdPlace && !currentLeague.brackets.thirdPlace.played) {
            const match = currentLeague.brackets.thirdPlace;
            const result = simulateMatch(match.participant1, match.participant2, match.format);
            playMatch(match.id, result.winner, result.score);
          }
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
        let updatedParticipants = [...currentLeague.participants];
        let newStatus = getNextRoundStatus(status);
        let champion: string | null = null;
        let runnerUp: string | null = null;
        let thirdPlace: string | null = null;
        let fourthPlace: string | null = null;

        // 32강 조별 리그 완료 → 16강 토너먼트 생성
        if (status === 'ROUND_32') {
          console.log('[advanceRound] 32강 완료 → 16강 진출자 선발');
          const result = processRound32Results(updatedBrackets, updatedParticipants);
          updatedBrackets = result.brackets;
          updatedParticipants = result.participants;
        }

        // 16강 토너먼트 완료 → 8강 생성
        if (status === 'ROUND_16') {
          console.log('[advanceRound] 16강 완료 → 8강 진출자 선발');
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
          thirdPlace = result.thirdPlace;
          fourthPlace = result.fourthPlace;
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
            thirdPlace,
            fourthPlace,
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

      // 리그 종료 및 히스토리 저장 (Step 2.5b-1: 경험치 지급 추가)
      finishLeague: () => {
        const { currentLeague, history, hallOfFame } = get();
        if (!currentLeague || currentLeague.status !== 'FINISHED') return;

        const champion = currentLeague.champion;
        const runnerUp = currentLeague.runnerUp;

        if (!champion || !runnerUp) return;

        const championCard = CHARACTERS_BY_ID[champion];
        const runnerUpCard = CHARACTERS_BY_ID[runnerUp];
        const championParticipant = currentLeague.participants.find(p => p.odId === champion);

        // Step 2.5b-1: 최종 순위 계산
        const rankings = calculateFinalRankings(currentLeague);

        // Phase 4 Task 4.2: 경험치 누적 (시즌 종료 시 합산 지급)
        const { addPendingExp } = useSeasonStore.getState();
        rankings.forEach(ranking => {
          if (ranking.isPlayerCrew) {
            // 내 크루 카드의 경험치를 누적 (시즌 종료 시 지급)
            addPendingExp(
              ranking.odId,
              'INDIVIDUAL_RANK',
              ranking.exp,
              `개인리그 시즌 ${currentLeague.season} - ${ranking.rank}위`
            );
            console.log(`[finishLeague] ${ranking.odName} 경험치 ${ranking.exp} 누적 (시즌 종료 시 지급)`);
          }
        });

        // Step 2.5b-1: 개인상 계산
        const awards = calculateAwards(currentLeague, rankings);

        // Phase 4 Task 4.1: 개인리그 성적 저장 (cardRecordStore 연동)
        const { saveIndividualLeagueRecord } = useCardRecordStore.getState();

        // 모든 경기 수집 (각 라운드별)
        const allMatches: { match: IndividualMatch; round: string }[] = [];

        // 32강 조별 리그
        currentLeague.brackets.round32.forEach(match => {
          if (match.played) {
            allMatches.push({ match, round: 'ROUND_32' });
          }
        });

        // 16강 토너먼트
        currentLeague.brackets.round16Matches?.forEach(match => {
          if (match.played) {
            allMatches.push({ match, round: 'ROUND_16' });
          }
        });

        // 8강
        currentLeague.brackets.quarter.forEach(match => {
          if (match.played) {
            allMatches.push({ match, round: 'QUARTER' });
          }
        });

        // 4강
        currentLeague.brackets.semi.forEach(match => {
          if (match.played) {
            allMatches.push({ match, round: 'SEMI' });
          }
        });

        // 결승
        if (currentLeague.brackets.final?.played) {
          allMatches.push({ match: currentLeague.brackets.final, round: 'FINAL' });
        }

        // 3/4위전
        if (currentLeague.brackets.thirdPlace?.played) {
          allMatches.push({ match: currentLeague.brackets.thirdPlace, round: 'THIRD_PLACE' });
        }

        // 모든 참가자의 개인리그 성적 저장 (술사명부에서 조회 가능)
        rankings.forEach(ranking => {
          // 경기 기록 수집
          const matchHistory: IndividualMatchRecord[] = allMatches
            .filter(({ match }) =>
              match.participant1 === ranking.odId || match.participant2 === ranking.odId
            )
            .map(({ match, round }) => {
              const isParticipant1 = match.participant1 === ranking.odId;
              const opponentId = isParticipant1 ? match.participant2 : match.participant1;
              const opponent = CHARACTERS_BY_ID[opponentId];
              const isWinner = match.winner === ranking.odId;

              // 경기장 정보 (첫 번째 경기장 사용, 다선제의 경우)
              const arenaId = match.arenas?.[0];
              const arena = arenaId ? ARENAS_BY_ID[arenaId] : undefined;

              return {
                season: currentLeague.season,
                round,
                opponentId,
                opponentName: opponent?.name.ko || '???',
                result: isWinner ? 'WIN' as const : 'LOSE' as const,
                score: {
                  my: isParticipant1 ? match.score.p1 : match.score.p2,
                  opponent: isParticipant1 ? match.score.p2 : match.score.p1
                },
                arenaId,
                arenaName: arena?.name.ko
              };
            });

          // 개인리그 시즌 기록 저장
          const seasonRecord: IndividualSeasonRecord = {
            season: currentLeague.season,
            finalRank: ranking.rank,
            wins: ranking.wins || 0,
            losses: ranking.losses || 0,
            expEarned: ranking.exp,
            awards: awards
              .filter(a => a.odId === ranking.odId)
              .map(a => a.type),
            matchHistory,
          };

          saveIndividualLeagueRecord(ranking.odId, seasonRecord);
          console.log(`[finishLeague] ${ranking.odName} 개인리그 성적 저장 (${ranking.rank}위, ${matchHistory.length}경기)${ranking.isPlayerCrew ? ' [내 크루]' : ''}`);
        });

        // 히스토리 추가 (Step 2.5b-1 확장)
        const historyEntry: IndividualLeagueHistory = {
          season: currentLeague.season,
          champion,
          championName: championCard?.name.ko || '???',
          runnerUp,
          runnerUpName: runnerUpCard?.name.ko || '???',
          rankings: rankings.slice(0, 16), // 상위 16명
          awards: awards as IndividualLeagueAward[],
          myCardResults: currentLeague.myCardResults.map(card => {
            const cardInfo = CHARACTERS_BY_ID[card.odId];
            const ranking = rankings.find(r => r.odId === card.odId);
            return {
              odId: card.odId,
              odName: cardInfo?.name.ko || '???',
              result: card.finalResult,
              rank: ranking?.rank || 32,
              exp: ranking?.exp || 0,
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
          // currentSeason 증가는 finalizeSeason 이후 다음 시즌 시작 시 자동 반영
          currentLeague: null
        });

        // Phase 4: 개인 리그 완료 마킹
        useSeasonStore.getState().markIndividualLeagueComplete();
      },

      // 리그 초기화
      resetLeague: () => {
        set({ currentLeague: null });
      },

      // 플레이어 크루 카드 ID 목록
      getPlayerCrewIds: () => {
        const { currentLeague } = get();
        if (!currentLeague) return [];
        return currentLeague.participants
          .filter(p => p.isPlayerCrew)
          .map(p => p.odId);
      },

      // ========================================
      // 1:1 배틀 시스템
      // ========================================

      // 배틀 시작
      startBattle: (matchId: string, playerCardId: string, opponentId: string, format: LeagueMatchFormat) => {
        const arena = getRandomArena();
        const requiredWins = getRequiredWins(format);
        console.log(`[Battle] 배틀 시작: ${playerCardId} vs ${opponentId}, 경기장: ${arena.name}, 포맷: ${format} (${requiredWins}선승)`);

        set({
          currentBattleState: {
            isActive: true,
            matchId,
            playerCardId,
            opponentId,
            arena,
            format,
            requiredWins,
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

        // 필요 승수 (format에 따라 결정)
        const { requiredWins } = currentBattleState;

        // 경기 승자 확인 (requiredWins 기반)
        const matchWinner = playerTurnWins >= requiredWins ? 'player' : opponentTurnWins >= requiredWins ? 'opponent' : null;

        console.log(`[Battle] 현재 스코어: ${playerTurnWins}-${opponentTurnWins} (${requiredWins}선승)`);

        if (matchWinner) {
          // 경기 완료
          const setResult: SetResult = {
            setNumber: 1,
            turns: newSetTurns,
            playerWins: playerTurnWins,
            opponentWins: opponentTurnWins,
            winner: matchWinner,
          };

          console.log(`[Battle] 경기 완료: ${matchWinner} 승 (${playerTurnWins}-${opponentTurnWins})`);

          set({
            currentBattleState: {
              ...currentBattleState,
              sets: [setResult],
              currentSetTurns: newSetTurns,
              currentTurn: currentBattleState.currentTurn + 1,
              playerSetWins: playerTurnWins,
              opponentSetWins: opponentTurnWins,
              phase: 'MATCH_END',
            },
          });
        } else {
          // 경기 진행 중
          set({
            currentBattleState: {
              ...currentBattleState,
              currentSetTurns: newSetTurns,
              currentTurn: currentBattleState.currentTurn + 1,
              playerSetWins: playerTurnWins,
              opponentSetWins: opponentTurnWins,
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

        const { requiredWins } = currentBattleState;
        const matchWinner = currentBattleState.playerSetWins >= requiredWins ? 'player' : 'opponent';
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

        // 개인 리그 결과 기록 - 경기장 정보 포함
        playMatch(
          currentBattleState.matchId,
          winnerId,
          { p1: currentBattleState.playerSetWins, p2: currentBattleState.opponentSetWins },
          currentBattleState.arena ? [currentBattleState.arena.id] : undefined
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
          return { playerCard: null, opponentCard: null, arena: null, format: '1WIN' as LeagueMatchFormat, requiredWins: 1 };
        }

        const playerCard = currentBattleState.playerCardId ? CHARACTERS_BY_ID[currentBattleState.playerCardId] : null;
        const opponentCard = currentBattleState.opponentId ? CHARACTERS_BY_ID[currentBattleState.opponentId] : null;
        const arena = currentBattleState.arena;

        if (!playerCard || !opponentCard || !arena) {
          return { playerCard: null, opponentCard: null, arena: null, format: currentBattleState.format, requiredWins: currentBattleState.requiredWins };
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
          format: currentBattleState.format,
          requiredWins: currentBattleState.requiredWins,
        };
      },

      // ========================================
      // Step 2: 시뮬레이션 기반 배틀 시스템
      // ========================================

      // 개인전 경기 시뮬레이션
      simulateIndividualMatch: (matchId: string, preAssignedArenaIds?: string[]): SimMatchResult | null => {
        const { currentLeague, playMatch } = get();
        if (!currentLeague) return null;

        const status = currentLeague.status;
        console.log('[simulateIndividualMatch] 시작:', matchId, 'phase:', status);

        // 현재 phase의 매치 배열 선택
        let matches: IndividualMatch[] = [];
        let matchType = '';
        let groupId: string | undefined;

        switch (status) {
          case 'ROUND_32':
            matches = currentLeague.brackets.round32;
            matchType = 'ROUND_32';
            // 32강은 groupId가 있음
            const r32Match = matches.find(m => m.id === matchId);
            if (r32Match) {
              groupId = r32Match.groupId;
            }
            break;
          case 'ROUND_16':
            // 16강 토너먼트 (1:1 녹아웃)
            matches = currentLeague.brackets.round16Matches || [];
            matchType = 'ROUND_16';
            break;
          case 'QUARTER':
            matches = currentLeague.brackets.quarter;
            matchType = 'QUARTER';
            break;
          case 'SEMI':
            matches = currentLeague.brackets.semi;
            matchType = 'SEMI';
            break;
          case 'FINAL':
            // 결승과 3/4위전 모두 포함
            matches = [];
            if (currentLeague.brackets.final) {
              matches.push(currentLeague.brackets.final);
            }
            if (currentLeague.brackets.thirdPlace) {
              matches.push(currentLeague.brackets.thirdPlace);
            }
            matchType = 'FINAL';
            break;
          default:
            return null;
        }

        const match = matches.find(m => m.id === matchId);
        // 3/4위전인 경우 bestOf 계산을 위해 matchType 변경
        const effectiveMatchType = match?.id === 'third_place' ? 'THIRD_PLACE' : matchType;
        if (!match || match.played) {
          console.log('[simulateIndividualMatch] 매치 없거나 완료됨');
          return null;
        }

        // 참가자 정보 가져오기
        const p1Data = currentLeague.participants.find(p => p.odId === match.participant1);
        const p2Data = currentLeague.participants.find(p => p.odId === match.participant2);

        if (!p1Data || !p2Data) {
          console.error('[simulateIndividualMatch] 참가자 없음');
          return null;
        }

        // Participant 형식으로 변환
        const p1Card = CHARACTERS_BY_ID[p1Data.odId];
        const p2Card = CHARACTERS_BY_ID[p2Data.odId];

        const participant1: Participant = {
          odId: p1Data.odId,
          odName: p1Data.odName,
          crewId: p1Data.crewId,
          crewName: p1Data.crewName,
          isPlayerCrew: p1Data.isPlayerCrew,
          totalStats: p1Data.totalStats ?? (p1Card ? calculateTotalStat(p1Card) : 0),
          attribute: p1Card?.attribute,
          equipment: p1Data.equipment,
          level: p1Data.level,
          statBonus: p1Data.statBonus,
        };

        const participant2: Participant = {
          odId: p2Data.odId,
          odName: p2Data.odName,
          crewId: p2Data.crewId,
          crewName: p2Data.crewName,
          isPlayerCrew: p2Data.isPlayerCrew,
          totalStats: p2Data.totalStats ?? (p2Card ? calculateTotalStat(p2Card) : 0),
          attribute: p2Card?.attribute,
          equipment: p2Data.equipment,
          level: p2Data.level,
          statBonus: p2Data.statBonus,
        };

        // bestOf 값 결정 (3/4위전은 별도 처리)
        const bestOf = getBestOfForRound(effectiveMatchType);

        // 경기장 선택: 외부에서 전달된 arenaIds가 있으면 사용, 없으면 랜덤 생성
        const arenaIds = preAssignedArenaIds && preAssignedArenaIds.length >= bestOf
          ? preAssignedArenaIds
          : getRandomArenas(bestOf);

        // 시뮬레이션 실행
        const result = simulateBattle(participant1, participant2, arenaIds, bestOf);

        // 결과 객체 생성
        const playerCardIds = currentLeague.participants
          .filter(p => p.isPlayerCrew)
          .map(p => p.odId);

        const matchResult: SimMatchResult = {
          matchId,
          groupId,
          round: status,
          matchType,
          participant1,
          participant2,
          winnerId: result.winnerId,
          loserId: result.loserId,
          bestOf,
          score: result.score,
          sets: result.sets,
          isPlayerMatch: playerCardIds.includes(participant1.odId) || playerCardIds.includes(participant2.odId),
          isCompleted: true,
        };

        // 경기 완료 처리 (기존 playMatch 사용) - 경기장 정보 포함
        playMatch(matchId, result.winnerId, { p1: result.score[0], p2: result.score[1] }, arenaIds);

        // 세트별 전적을 cardRecordStore에 기록 (개인리그 기록 반영)
        const { recordBattle } = useCardRecordStore.getState();
        const seasonNumber = currentLeague.season;
        for (const setResult of result.sets) {
          recordBattle({
            seasonNumber,
            winnerCardId: setResult.winnerId,
            loserCardId: setResult.loserId,
            arenaId: setResult.arenaId,
            winnerDamage: 0,
            loserDamage: 0,
            winnerSkillActivated: false,
            loserSkillActivated: false,
          });
        }

        // 결과 저장
        set({ lastSimMatchResult: matchResult });

        console.log('[simulateIndividualMatch] 완료:', result.winnerId, '승리');
        return matchResult;
      },

      // 다음 미완료 경기 찾기
      findNextMatch: (): IndividualMatch | null => {
        const { currentLeague } = get();
        if (!currentLeague) return null;

        const status = currentLeague.status;
        console.log('[findNextMatch] 현재 phase:', status);

        let matches: IndividualMatch[] = [];
        switch (status) {
          case 'ROUND_32':
            matches = currentLeague.brackets.round32;
            console.log('[findNextMatch] 32강 경기 수:', matches.length);
            break;
          case 'ROUND_16':
            // 16강 토너먼트 (1:1 녹아웃)
            matches = currentLeague.brackets.round16Matches || [];
            console.log('[findNextMatch] 16강 경기 수:', matches.length);
            break;
          case 'QUARTER':
            matches = currentLeague.brackets.quarter;
            console.log('[findNextMatch] 8강 경기 수:', matches.length);
            break;
          case 'SEMI':
            matches = currentLeague.brackets.semi;
            console.log('[findNextMatch] 4강 경기 수:', matches.length);
            break;
          case 'FINAL':
            // 결승과 3/4위전 모두 포함
            matches = [];
            if (currentLeague.brackets.final) {
              matches.push(currentLeague.brackets.final);
            }
            if (currentLeague.brackets.thirdPlace) {
              matches.push(currentLeague.brackets.thirdPlace);
            }
            console.log('[findNextMatch] 결승/3,4위전 경기 수:', matches.length);
            break;
          default:
            console.log('[findNextMatch] 알 수 없는 phase:', status);
            return null;
        }

        // 미완료 경기 찾기
        const incompleteMatches = matches.filter(m => !m.played);
        console.log('[findNextMatch] 미완료 경기 수:', incompleteMatches.length);

        // 참가자 설정된 경기만
        const validMatches = incompleteMatches.filter(m => m.participant1 && m.participant2);
        console.log('[findNextMatch] 유효한 경기 수:', validMatches.length);

        if (validMatches.length > 0) {
          console.log('[findNextMatch] 다음 경기:', validMatches[0].id);
          return validMatches[0];
        }

        console.log('[findNextMatch] 다음 경기 없음');
        return null;
      },

      // 내 카드 경기까지 자동 스킵
      skipToNextPlayerMatch: (): IndividualMatch | null => {
        const { simulateIndividualMatch, findNextMatch, advanceRound } = get();

        // 현재 상태를 다시 가져오기 (advanceRound 후 변경될 수 있음)
        const getCurrentLeague = () => get().currentLeague;
        const getPlayerCardIds = () => {
          const league = getCurrentLeague();
          if (!league) return [];
          return league.participants
            .filter(p => p.isPlayerCrew)
            .map(p => p.odId);
        };

        const currentLeague = getCurrentLeague();
        if (!currentLeague) return null;

        console.log('[skipToNextPlayerMatch] 시작, phase:', currentLeague.status);
        console.log('[skipToNextPlayerMatch] 내 카드 IDs:', getPlayerCardIds());

        let safetyCounter = 0;
        const maxIterations = 100; // 무한루프 방지

        while (safetyCounter < maxIterations) {
          safetyCounter++;

          let nextMatch = findNextMatch();

          // 다음 경기가 없으면 라운드 완료 체크
          if (!nextMatch) {
            const league = getCurrentLeague();
            if (!league) break;

            console.log('[skipToNextPlayerMatch] 다음 경기 없음 - 라운드 완료 체크, phase:', league.status);

            // 현재 라운드가 완료되었는지 확인
            const roundComplete = isRoundComplete(league);
            console.log('[skipToNextPlayerMatch] 라운드 완료 여부:', roundComplete);

            if (roundComplete && league.status !== 'FINISHED') {
              // 다음 라운드로 자동 진행
              console.log('[skipToNextPlayerMatch] 다음 라운드로 자동 진행');
              advanceRound();

              // 다시 경기 찾기 시도
              nextMatch = get().findNextMatch();
              if (!nextMatch) {
                console.log('[skipToNextPlayerMatch] 다음 라운드에서도 경기 없음');
                break;
              }
            } else {
              console.log('[skipToNextPlayerMatch] 라운드 미완료 또는 리그 종료');
              break;
            }
          }

          const playerCardIds = getPlayerCardIds();
          const isPlayerMatch = playerCardIds.includes(nextMatch.participant1) ||
                                playerCardIds.includes(nextMatch.participant2);

          console.log(`[skipToNextPlayerMatch] 경기: ${nextMatch.id}, 내 카드 경기: ${isPlayerMatch}`);

          if (isPlayerMatch) {
            console.log('[skipToNextPlayerMatch] 내 카드 경기 발견!');
            return nextMatch;
          }

          // 내 카드 경기가 아니면 시뮬레이션 후 다음으로
          console.log('[skipToNextPlayerMatch] 타 카드 경기 스킵:', nextMatch.id);
          simulateIndividualMatch(nextMatch.id);
        }

        console.log('[skipToNextPlayerMatch] 루프 종료');
        return null;
      },
    }),
    {
      name: 'individual-league-storage',
      version: 7, // Step 2.5b-1: 경험치/순위 시스템 추가
      migrate: (persistedState: unknown, version: number) => {
        console.log('[IndividualLeague] 스토리지 마이그레이션:', { version, persistedState });

        // Step 2.5b-1: 버전 7 마이그레이션 - 기존 데이터 초기화
        if (version < 7) {
          console.log('[IndividualLeague] 데이터 초기화 (v7 마이그레이션)');
          return {
            currentSeason: 1,
            currentLeague: null,
            history: [],
            hallOfFame: [],
            currentBattleState: initialBattleState,
            lastMatchResult: null,
            lastSimMatchResult: null
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

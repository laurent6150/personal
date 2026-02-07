// ========================================
// 카드 기록 스토어 - 개인 전적 및 수상 시스템
// Phase 5: 라이벌 시스템 통합
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CardRecord,
  CardSeasonRecord,
  Award,
  AwardType,
  CardStats,
  IndividualSeasonRecord,
  RivalInfo
} from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';
import { RIVAL_MIN_MATCHES, RIVAL_ATK_BONUS } from '../data/constants';

interface CardRecordStore {
  // 카드별 기록
  records: Record<string, CardRecord>;
  // 시즌별 수상 목록
  seasonAwards: Record<number, Award[]>;
  // Phase 5: 라이벌 관계 (cardId -> 라이벌 cardId 목록)
  rivalRelations: Record<string, RivalInfo[]>;

  // 기록 업데이트 (라운드 종료 시 호출)
  recordBattle: (params: {
    seasonNumber: number;
    winnerCardId: string;
    loserCardId: string;
    arenaId: string;
    // 확장 통계 (선택적)
    winnerDamage?: number;       // 승자가 입힌 데미지
    loserDamage?: number;        // 패자가 입힌 데미지
    winnerSkillActivated?: boolean;  // 승자 스킬 발동 여부
    loserSkillActivated?: boolean;   // 패자 스킬 발동 여부
  }) => void;

  // 시즌 종료 시 수상자 선정
  selectSeasonAwards: (seasonNumber: number) => Award[];

  // 조회 함수들
  getCardRecord: (cardId: string) => CardRecord | null;
  getCardSeasonRecord: (cardId: string, seasonNumber: number) => CardSeasonRecord | null;
  getCareerStats: (cardId: string) => CardStats;
  getSeasonStats: (cardId: string, seasonNumber: number) => CardStats;
  getCardAwards: (cardId: string) => Award[];
  getSeasonAwards: (seasonNumber: number) => Award[];

  // 전체 카드 순위 조회
  getAllCardStats: (seasonNumber?: number) => CardStats[];

  // Step 2.5b-1: 개인리그 성적 저장
  saveIndividualLeagueRecord: (
    odId: string,
    seasonRecord: IndividualSeasonRecord
  ) => void;

  // Phase 4.3: 상대전적 조회 (팀 리그 + 개인 리그 통합)
  getHeadToHeadRecord: (myCardId: string, opponentCardId: string) => {
    teamLeague: { wins: number; losses: number };
    individualLeague: { wins: number; losses: number };
    total: { wins: number; losses: number };
  };

  // Phase 5: 라이벌 시스템
  checkAndRegisterRival: (cardId1: string, cardId2: string, seasonNumber: number) => boolean;
  isRival: (cardId1: string, cardId2: string) => boolean;
  getRivals: (cardId: string) => RivalInfo[];
  getRivalMatchCount: (cardId1: string, cardId2: string) => number;
  getRivalBonusMultiplier: (cardId1: string, cardId2: string) => number;

  // 리셋
  resetAllRecords: () => void;
}

// 빈 시즌 기록 생성
function createEmptySeasonRecord(): CardSeasonRecord {
  return {
    wins: 0,
    losses: 0,
    arenaRecords: {},
    vsRecords: {},
    // 확장 통계
    maxWinStreak: 0,
    currentWinStreak: 0,
    totalDamageDealt: 0,
    totalDamageReceived: 0,
    mvpCount: 0,
    ultimateHits: 0
  };
}

// 기존 시즌 기록에 누락된 확장 필드 채우기 (마이그레이션)
function migrateSeasonRecord(record: Partial<CardSeasonRecord>): CardSeasonRecord {
  return {
    wins: record.wins ?? 0,
    losses: record.losses ?? 0,
    arenaRecords: record.arenaRecords ?? {},
    vsRecords: record.vsRecords ?? {},
    // 확장 통계 - 기존 데이터에 없으면 0으로 초기화
    maxWinStreak: record.maxWinStreak ?? 0,
    currentWinStreak: record.currentWinStreak ?? 0,
    totalDamageDealt: record.totalDamageDealt ?? 0,
    totalDamageReceived: record.totalDamageReceived ?? 0,
    mvpCount: record.mvpCount ?? 0,
    ultimateHits: record.ultimateHits ?? 0
  };
}

// 전체 records 마이그레이션
function migrateRecords(records: Record<string, CardRecord>): Record<string, CardRecord> {
  const migrated: Record<string, CardRecord> = {};

  for (const [cardId, cardRecord] of Object.entries(records)) {
    const migratedSeasonRecords: Record<number, CardSeasonRecord> = {};

    for (const [seasonNum, seasonRecord] of Object.entries(cardRecord.seasonRecords)) {
      migratedSeasonRecords[Number(seasonNum)] = migrateSeasonRecord(seasonRecord);
    }

    migrated[cardId] = {
      ...cardRecord,
      seasonRecords: migratedSeasonRecords
    };
  }

  return migrated;
}

// 빈 카드 기록 생성
function createEmptyCardRecord(cardId: string): CardRecord {
  return {
    cardId,
    seasonRecords: {},
    awards: []
  };
}

// MVP 점수 계산
function calculateMVPScore(record: CardSeasonRecord): number {
  const total = record.wins + record.losses;
  const winRate = total > 0 ? record.wins / total : 0;
  // MVP 점수 = 승리수 × 2 + 승률 보너스 (최대 20)
  return (record.wins * 2) + (winRate * 20);
}

export const useCardRecordStore = create<CardRecordStore>()(
  persist(
    (set, get) => ({
      records: {},
      seasonAwards: {},
      rivalRelations: {},

      // 전투 결과 기록
      recordBattle: ({
        seasonNumber,
        winnerCardId,
        loserCardId,
        arenaId,
        winnerDamage = 0,
        loserDamage = 0,
        winnerSkillActivated = false,
        loserSkillActivated = false
      }) => {
        const { records } = get();

        // 승자 기록 업데이트
        const winnerRecord = records[winnerCardId] || createEmptyCardRecord(winnerCardId);
        const winnerSeasonRecord = winnerRecord.seasonRecords[seasonNumber] || createEmptySeasonRecord();

        winnerSeasonRecord.wins++;

        // 연승 추적
        winnerSeasonRecord.currentWinStreak++;
        if (winnerSeasonRecord.currentWinStreak > winnerSeasonRecord.maxWinStreak) {
          winnerSeasonRecord.maxWinStreak = winnerSeasonRecord.currentWinStreak;
        }

        // 데미지 통계
        winnerSeasonRecord.totalDamageDealt += winnerDamage;
        winnerSeasonRecord.totalDamageReceived += loserDamage;

        // 라운드 MVP (더 많은 데미지를 입힌 쪽)
        if (winnerDamage >= loserDamage) {
          winnerSeasonRecord.mvpCount++;
        }

        // 스킬 적중
        if (winnerSkillActivated) {
          winnerSeasonRecord.ultimateHits++;
        }

        // 경기장별 기록
        if (!winnerSeasonRecord.arenaRecords[arenaId]) {
          winnerSeasonRecord.arenaRecords[arenaId] = { wins: 0, losses: 0 };
        }
        winnerSeasonRecord.arenaRecords[arenaId].wins++;

        // 상대 카드별 기록
        if (!winnerSeasonRecord.vsRecords[loserCardId]) {
          winnerSeasonRecord.vsRecords[loserCardId] = { wins: 0, losses: 0 };
        }
        winnerSeasonRecord.vsRecords[loserCardId].wins++;

        // 패자 기록 업데이트
        const loserRecord = records[loserCardId] || createEmptyCardRecord(loserCardId);
        const loserSeasonRecord = loserRecord.seasonRecords[seasonNumber] || createEmptySeasonRecord();

        loserSeasonRecord.losses++;

        // 연승 리셋
        loserSeasonRecord.currentWinStreak = 0;

        // 데미지 통계
        loserSeasonRecord.totalDamageDealt += loserDamage;
        loserSeasonRecord.totalDamageReceived += winnerDamage;

        // 라운드 MVP (패자가 더 많은 데미지를 입힌 경우)
        if (loserDamage > winnerDamage) {
          loserSeasonRecord.mvpCount++;
        }

        // 스킬 적중
        if (loserSkillActivated) {
          loserSeasonRecord.ultimateHits++;
        }

        // 경기장별 기록
        if (!loserSeasonRecord.arenaRecords[arenaId]) {
          loserSeasonRecord.arenaRecords[arenaId] = { wins: 0, losses: 0 };
        }
        loserSeasonRecord.arenaRecords[arenaId].losses++;

        // 상대 카드별 기록
        if (!loserSeasonRecord.vsRecords[winnerCardId]) {
          loserSeasonRecord.vsRecords[winnerCardId] = { wins: 0, losses: 0 };
        }
        loserSeasonRecord.vsRecords[winnerCardId].losses++;

        set({
          records: {
            ...records,
            [winnerCardId]: {
              ...winnerRecord,
              seasonRecords: {
                ...winnerRecord.seasonRecords,
                [seasonNumber]: winnerSeasonRecord
              }
            },
            [loserCardId]: {
              ...loserRecord,
              seasonRecords: {
                ...loserRecord.seasonRecords,
                [seasonNumber]: loserSeasonRecord
              }
            }
          }
        });

        // Phase 5: 라이벌 등록 체크
        get().checkAndRegisterRival(winnerCardId, loserCardId, seasonNumber);
      },

      // 시즌 수상자 선정
      selectSeasonAwards: (seasonNumber: number) => {
        const { records, seasonAwards } = get();
        const awards: Award[] = [];

        // 해당 시즌 기록이 있는 모든 카드 수집
        const seasonCards: { cardId: string; record: CardSeasonRecord }[] = [];
        for (const [cardId, cardRecord] of Object.entries(records)) {
          const seasonRecord = cardRecord.seasonRecords[seasonNumber];
          if (seasonRecord && (seasonRecord.wins > 0 || seasonRecord.losses > 0)) {
            seasonCards.push({ cardId, record: seasonRecord });
          }
        }

        if (seasonCards.length === 0) return [];

        // MVP - 최고 기여도
        const mvpCandidate = seasonCards.sort((a, b) =>
          calculateMVPScore(b.record) - calculateMVPScore(a.record)
        )[0];
        awards.push({
          type: 'MVP' as AwardType,
          seasonNumber,
          cardId: mvpCandidate.cardId
        });

        // 다승왕 - 최다 승리
        const mostWinsCandidate = [...seasonCards].sort((a, b) =>
          b.record.wins - a.record.wins
        )[0];
        awards.push({
          type: 'MOST_WINS' as AwardType,
          seasonNumber,
          cardId: mostWinsCandidate.cardId
        });

        // 카드 기록에 수상 이력 추가
        const updatedRecords = { ...records };
        for (const award of awards) {
          const cardRecord = updatedRecords[award.cardId];
          if (cardRecord) {
            // 중복 수상 방지
            const alreadyHas = cardRecord.awards.some(
              a => a.type === award.type && a.seasonNumber === award.seasonNumber
            );
            if (!alreadyHas) {
              cardRecord.awards = [...cardRecord.awards, award];
            }
          }
        }

        set({
          records: updatedRecords,
          seasonAwards: {
            ...seasonAwards,
            [seasonNumber]: awards
          }
        });

        return awards;
      },

      // 카드 전체 기록 조회
      getCardRecord: (cardId: string) => {
        const { records } = get();
        return records[cardId] || null;
      },

      // 카드 시즌별 기록 조회
      getCardSeasonRecord: (cardId: string, seasonNumber: number) => {
        const { records } = get();
        return records[cardId]?.seasonRecords[seasonNumber] || null;
      },

      // 통산 스탯 계산
      getCareerStats: (cardId: string) => {
        const { records } = get();
        const cardRecord = records[cardId];

        if (!cardRecord) {
          return {
            cardId,
            wins: 0,
            losses: 0,
            totalGames: 0,
            winRate: 0
          };
        }

        let wins = 0;
        let losses = 0;

        for (const seasonRecord of Object.values(cardRecord.seasonRecords)) {
          wins += seasonRecord.wins;
          losses += seasonRecord.losses;
        }

        const totalGames = wins + losses;
        return {
          cardId,
          wins,
          losses,
          totalGames,
          winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0
        };
      },

      // 시즌 스탯 계산
      getSeasonStats: (cardId: string, seasonNumber: number) => {
        const { records } = get();
        const seasonRecord = records[cardId]?.seasonRecords[seasonNumber];

        if (!seasonRecord) {
          return {
            cardId,
            wins: 0,
            losses: 0,
            totalGames: 0,
            winRate: 0
          };
        }

        const totalGames = seasonRecord.wins + seasonRecord.losses;
        return {
          cardId,
          wins: seasonRecord.wins,
          losses: seasonRecord.losses,
          totalGames,
          winRate: totalGames > 0 ? (seasonRecord.wins / totalGames) * 100 : 0
        };
      },

      // 카드 수상 이력 조회
      getCardAwards: (cardId: string) => {
        const { records } = get();
        return records[cardId]?.awards || [];
      },

      // 시즌 수상 목록 조회
      getSeasonAwards: (seasonNumber: number) => {
        const { seasonAwards } = get();
        return seasonAwards[seasonNumber] || [];
      },

      // 전체 카드 순위 조회
      getAllCardStats: (seasonNumber?: number) => {
        const { records } = get();
        const allStats: CardStats[] = [];

        // 모든 캐릭터에 대해 스탯 계산
        for (const cardId of Object.keys(CHARACTERS_BY_ID)) {
          const cardRecord = records[cardId];

          if (seasonNumber !== undefined) {
            // 시즌별 스탯
            const seasonRecord = cardRecord?.seasonRecords[seasonNumber];
            if (seasonRecord && (seasonRecord.wins > 0 || seasonRecord.losses > 0)) {
              const totalGames = seasonRecord.wins + seasonRecord.losses;
              allStats.push({
                cardId,
                wins: seasonRecord.wins,
                losses: seasonRecord.losses,
                totalGames,
                winRate: totalGames > 0 ? (seasonRecord.wins / totalGames) * 100 : 0
              });
            }
          } else {
            // 통산 스탯
            if (cardRecord) {
              let wins = 0;
              let losses = 0;
              for (const sr of Object.values(cardRecord.seasonRecords)) {
                wins += sr.wins;
                losses += sr.losses;
              }
              if (wins > 0 || losses > 0) {
                const totalGames = wins + losses;
                allStats.push({
                  cardId,
                  wins,
                  losses,
                  totalGames,
                  winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0
                });
              }
            }
          }
        }

        return allStats;
      },

      // Step 2.5b-1: 개인리그 성적 저장
      saveIndividualLeagueRecord: (
        odId: string,
        seasonRecord: IndividualSeasonRecord
      ) => {
        set(state => {
          const records = { ...state.records };

          if (!records[odId]) {
            records[odId] = {
              cardId: odId,
              seasonRecords: {},
              awards: [],
              individualLeague: {
                seasons: [],
                totalWins: 0,
                totalLosses: 0,
                bestRank: 32,
                championships: 0,
              },
            };
          }

          const card = records[odId];

          // individualLeague가 없으면 초기화
          if (!card.individualLeague) {
            card.individualLeague = {
              seasons: [],
              totalWins: 0,
              totalLosses: 0,
              bestRank: 32,
              championships: 0,
            };
          }

          card.individualLeague.seasons.push(seasonRecord);
          card.individualLeague.totalWins += seasonRecord.wins;
          card.individualLeague.totalLosses += seasonRecord.losses;
          card.individualLeague.bestRank = Math.min(
            card.individualLeague.bestRank,
            seasonRecord.finalRank
          );
          if (seasonRecord.finalRank === 1) {
            card.individualLeague.championships++;
          }

          return { records };
        });
      },

      // Phase 4.3: 상대전적 조회 (팀 리그 + 개인 리그 통합)
      getHeadToHeadRecord: (myCardId: string, opponentCardId: string) => {
        const { records } = get();
        const myRecord = records[myCardId];

        // 팀 리그 전적 (seasonRecords.vsRecords에서)
        let teamWins = 0;
        let teamLosses = 0;
        Object.values(myRecord?.seasonRecords || {}).forEach(season => {
          teamWins += season.vsRecords?.[opponentCardId]?.wins || 0;
          teamLosses += season.vsRecords?.[opponentCardId]?.losses || 0;
        });

        // 개인 리그 전적 (individualLeague.seasons.matchHistory에서 계산)
        let indivWins = 0;
        let indivLosses = 0;
        myRecord?.individualLeague?.seasons?.forEach(season => {
          // matchHistory에서 상대방과의 대전 기록 추출
          season.matchHistory?.forEach(match => {
            if (match.opponentId === opponentCardId) {
              if (match.result === 'WIN') {
                indivWins++;
              } else if (match.result === 'LOSE') {
                indivLosses++;
              }
            }
          });
        });

        return {
          teamLeague: { wins: teamWins, losses: teamLosses },
          individualLeague: { wins: indivWins, losses: indivLosses },
          total: { wins: teamWins + indivWins, losses: teamLosses + indivLosses }
        };
      },

      // ========================================
      // Phase 5: 라이벌 시스템
      // ========================================

      // 라이벌 등록 체크 및 등록
      checkAndRegisterRival: (cardId1: string, cardId2: string, seasonNumber: number) => {
        const { rivalRelations, getRivalMatchCount, isRival } = get();

        // 이미 라이벌이면 스킵
        if (isRival(cardId1, cardId2)) return false;

        // 대전 횟수 체크
        const matchCount = getRivalMatchCount(cardId1, cardId2);
        if (matchCount < RIVAL_MIN_MATCHES) return false;

        // 라이벌 등록
        const newRivalRelations = { ...rivalRelations };

        // cardId1의 라이벌 목록에 추가
        if (!newRivalRelations[cardId1]) {
          newRivalRelations[cardId1] = [];
        }
        newRivalRelations[cardId1].push({
          rivalCardId: cardId2,
          establishedSeason: seasonNumber,
          totalMatches: matchCount,
          wins: 0,  // 라이벌 등록 후부터 카운트
          losses: 0
        });

        // cardId2의 라이벌 목록에 추가
        if (!newRivalRelations[cardId2]) {
          newRivalRelations[cardId2] = [];
        }
        newRivalRelations[cardId2].push({
          rivalCardId: cardId1,
          establishedSeason: seasonNumber,
          totalMatches: matchCount,
          wins: 0,
          losses: 0
        });

        set({ rivalRelations: newRivalRelations });

        const char1 = CHARACTERS_BY_ID[cardId1];
        const char2 = CHARACTERS_BY_ID[cardId2];
        console.log(`[Rival] 라이벌 성립! ${char1?.name.ko || cardId1} vs ${char2?.name.ko || cardId2} (${matchCount}전)`);

        return true;
      },

      // 라이벌 여부 확인
      isRival: (cardId1: string, cardId2: string) => {
        const { rivalRelations } = get();
        const rivals1 = rivalRelations[cardId1] || [];
        return rivals1.some(r => r.rivalCardId === cardId2);
      },

      // 카드의 라이벌 목록 조회
      getRivals: (cardId: string) => {
        const { rivalRelations } = get();
        return rivalRelations[cardId] || [];
      },

      // 두 카드 간의 총 대전 횟수
      getRivalMatchCount: (cardId1: string, cardId2: string) => {
        const { records } = get();
        const record1 = records[cardId1];

        if (!record1) return 0;

        let totalMatches = 0;

        // 팀 리그 전적
        Object.values(record1.seasonRecords).forEach(season => {
          const vsRecord = season.vsRecords?.[cardId2];
          if (vsRecord) {
            totalMatches += vsRecord.wins + vsRecord.losses;
          }
        });

        // 개인 리그 전적
        record1.individualLeague?.seasons?.forEach(season => {
          season.matchHistory?.forEach(match => {
            if (match.opponentId === cardId2) {
              totalMatches++;
            }
          });
        });

        return totalMatches;
      },

      // 라이벌 보너스 배율 (라이벌이면 +5% ATK)
      getRivalBonusMultiplier: (cardId1: string, cardId2: string) => {
        const { isRival } = get();
        if (isRival(cardId1, cardId2)) {
          return 1 + RIVAL_ATK_BONUS;  // 1.05 (+5%)
        }
        return 1.0;
      },

      // 전체 리셋
      resetAllRecords: () => {
        set({
          records: {},
          seasonAwards: {},
          rivalRelations: {}
        });
      }
    }),
    {
      name: 'jujutsu-card-records',
      version: 3, // v3: Phase 5 라이벌 시스템
      migrate: (persistedState: unknown, version: number) => {
        console.log('[Card Records] 마이그레이션:', version, '->', 3);
        const state = persistedState as CardRecordStore;

        if (version < 3) {
          console.log('[Card Records] Phase 5 라이벌 시스템 추가');
          return {
            ...state,
            rivalRelations: state.rivalRelations || {}
          };
        }
        return state;
      },
      // localStorage에서 데이터 로드 후 마이그레이션 실행
      onRehydrateStorage: () => (state) => {
        if (state && state.records) {
          // 기존 데이터에 확장 필드가 없을 수 있으므로 마이그레이션
          state.records = migrateRecords(state.records);
        }
        // Phase 5: rivalRelations 초기화
        if (state && !state.rivalRelations) {
          state.rivalRelations = {};
        }
      }
    }
  )
);

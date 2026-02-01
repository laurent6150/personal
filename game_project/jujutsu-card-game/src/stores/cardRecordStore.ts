// ========================================
// 카드 기록 스토어 - 개인 전적 및 수상 시스템
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CardRecord,
  CardSeasonRecord,
  Award,
  AwardType,
  CardStats
} from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';

interface CardRecordStore {
  // 카드별 기록
  records: Record<string, CardRecord>;
  // 시즌별 수상 목록
  seasonAwards: Record<number, Award[]>;

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

      // 전체 리셋
      resetAllRecords: () => {
        set({
          records: {},
          seasonAwards: {}
        });
      }
    }),
    {
      name: 'jujutsu-card-records',
      version: 1
    }
  )
);

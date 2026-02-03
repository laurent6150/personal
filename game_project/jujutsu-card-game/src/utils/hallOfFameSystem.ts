// ========================================
// 명예의 전당 시스템
// 역대 기록 및 업적 관리
// ========================================

import type {
  HallOfFameData,
  SeasonChampionRecord,
  IndividualChampionRecord,
  SeasonMvpRecord,
  AllTimeRecord
} from '../types';
import { CHARACTERS_BY_ID } from '../data/characters';

/**
 * 명예의 전당 초기 데이터
 */
export const INITIAL_HALL_OF_FAME: HallOfFameData = {
  seasonChampions: [],
  individualChampions: [],
  seasonMvps: [],
  allTimeRecords: {
    mostWins: [],
    highestWinRate: [],
    longestStreak: []
  }
};

/**
 * 시즌 우승 기록 추가
 */
export function addSeasonChampion(
  data: HallOfFameData,
  record: SeasonChampionRecord
): HallOfFameData {
  return {
    ...data,
    seasonChampions: [...data.seasonChampions, record]
  };
}

/**
 * 개인 리그 우승 기록 추가
 */
export function addIndividualChampion(
  data: HallOfFameData,
  record: IndividualChampionRecord
): HallOfFameData {
  return {
    ...data,
    individualChampions: [...data.individualChampions, record]
  };
}

/**
 * 시즌 MVP 기록 추가
 */
export function addSeasonMvp(
  data: HallOfFameData,
  record: SeasonMvpRecord
): HallOfFameData {
  return {
    ...data,
    seasonMvps: [...data.seasonMvps, record]
  };
}

/**
 * 올타임 기록 업데이트
 */
export function updateAllTimeRecord(
  data: HallOfFameData,
  category: 'mostWins' | 'highestWinRate' | 'longestStreak',
  record: AllTimeRecord
): HallOfFameData {
  const currentRecords = data.allTimeRecords[category];
  const existingIndex = currentRecords.findIndex(r => r.cardId === record.cardId);

  let updatedRecords: AllTimeRecord[];

  if (existingIndex >= 0) {
    // 기존 기록 업데이트 (더 높은 경우만)
    if (record.value > currentRecords[existingIndex].value) {
      updatedRecords = [...currentRecords];
      updatedRecords[existingIndex] = record;
    } else {
      return data;
    }
  } else {
    // 새 기록 추가
    updatedRecords = [...currentRecords, record];
  }

  // 상위 10개만 유지, 정렬
  updatedRecords.sort((a, b) => b.value - a.value);
  updatedRecords = updatedRecords.slice(0, 10);

  return {
    ...data,
    allTimeRecords: {
      ...data.allTimeRecords,
      [category]: updatedRecords
    }
  };
}

/**
 * 카드별 명예의 전당 통계
 */
export interface CardHallOfFameStats {
  cardId: string;
  cardName: string;
  seasonChampionships: number;
  individualChampionships: number;
  mvpAwards: number;
  totalWins: number;
  highestWinRate: number;
  longestStreak: number;
  lastActive: number; // 시즌 번호
}

/**
 * 카드별 통계 계산
 */
export function getCardHallOfFameStats(
  data: HallOfFameData,
  cardId: string
): CardHallOfFameStats {
  const charData = CHARACTERS_BY_ID[cardId];

  // 시즌 우승 횟수 (크루원으로 포함된 경우)
  const seasonChampionships = data.seasonChampions.filter(
    r => r.crewCardIds.includes(cardId)
  ).length;

  // 개인 리그 우승 횟수
  const individualChampionships = data.individualChampions.filter(
    r => r.championId === cardId
  ).length;

  // MVP 횟수
  const mvpAwards = data.seasonMvps.filter(
    r => r.cardId === cardId
  ).length;

  // 올타임 기록에서 가져오기
  const winsRecord = data.allTimeRecords.mostWins.find(r => r.cardId === cardId);
  const winRateRecord = data.allTimeRecords.highestWinRate.find(r => r.cardId === cardId);
  const streakRecord = data.allTimeRecords.longestStreak.find(r => r.cardId === cardId);

  // 마지막 활동 시즌
  const lastSeason = Math.max(
    ...data.seasonChampions
      .filter(r => r.crewCardIds.includes(cardId))
      .map(r => r.season),
    ...data.individualChampions
      .filter(r => r.championId === cardId)
      .map(r => r.season),
    ...data.seasonMvps
      .filter(r => r.cardId === cardId)
      .map(r => r.season),
    0
  );

  return {
    cardId,
    cardName: charData?.name.ko || '???',
    seasonChampionships,
    individualChampionships,
    mvpAwards,
    totalWins: winsRecord?.value || 0,
    highestWinRate: winRateRecord?.value || 0,
    longestStreak: streakRecord?.value || 0,
    lastActive: lastSeason
  };
}

/**
 * 명예의 전당 랭킹 (종합 점수)
 */
export function getHallOfFameRankings(
  data: HallOfFameData,
  limit: number = 10
): CardHallOfFameStats[] {
  // 모든 관련 카드 ID 수집
  const cardIds = new Set<string>();

  data.seasonChampions.forEach(r => r.crewCardIds.forEach(id => cardIds.add(id)));
  data.individualChampions.forEach(r => cardIds.add(r.championId));
  data.seasonMvps.forEach(r => cardIds.add(r.cardId));
  data.allTimeRecords.mostWins.forEach(r => cardIds.add(r.cardId));
  data.allTimeRecords.highestWinRate.forEach(r => cardIds.add(r.cardId));
  data.allTimeRecords.longestStreak.forEach(r => cardIds.add(r.cardId));

  // 각 카드 통계 계산
  const stats = Array.from(cardIds).map(id => getCardHallOfFameStats(data, id));

  // 종합 점수로 정렬
  stats.sort((a, b) => {
    const scoreA = calculateHallOfFameScore(a);
    const scoreB = calculateHallOfFameScore(b);
    return scoreB - scoreA;
  });

  return stats.slice(0, limit);
}

/**
 * 명예의 전당 종합 점수 계산
 */
export function calculateHallOfFameScore(stats: CardHallOfFameStats): number {
  return (
    stats.seasonChampionships * 100 +
    stats.individualChampionships * 80 +
    stats.mvpAwards * 50 +
    stats.totalWins * 1 +
    Math.floor(stats.highestWinRate) * 2 +
    stats.longestStreak * 10
  );
}

/**
 * 시즌별 통계 요약
 */
export interface SeasonSummary {
  season: number;
  champion: SeasonChampionRecord | null;
  individualChampion: IndividualChampionRecord | null;
  mvp: SeasonMvpRecord | null;
}

/**
 * 시즌별 요약 가져오기
 */
export function getSeasonSummaries(data: HallOfFameData): SeasonSummary[] {
  const seasons = new Set<number>();

  data.seasonChampions.forEach(r => seasons.add(r.season));
  data.individualChampions.forEach(r => seasons.add(r.season));
  data.seasonMvps.forEach(r => seasons.add(r.season));

  return Array.from(seasons)
    .sort((a, b) => b - a) // 최신순
    .map(season => ({
      season,
      champion: data.seasonChampions.find(r => r.season === season) || null,
      individualChampion: data.individualChampions.find(r => r.season === season) || null,
      mvp: data.seasonMvps.find(r => r.season === season) || null
    }));
}

/**
 * 연속 기록 확인
 */
export function checkConsecutiveRecords(
  data: HallOfFameData,
  cardId: string
): {
  consecutiveSeasonChampionships: number;
  consecutiveIndividualChampionships: number;
  consecutiveMvps: number;
} {
  // 시즌 우승 연속
  let seasonStreak = 0;
  const seasonChamps = data.seasonChampions
    .filter(r => r.crewCardIds.includes(cardId))
    .map(r => r.season)
    .sort((a, b) => b - a);

  for (let i = 0; i < seasonChamps.length - 1; i++) {
    if (seasonChamps[i] - seasonChamps[i + 1] === 1) {
      seasonStreak++;
    } else {
      break;
    }
  }

  // 개인 리그 연속
  let individualStreak = 0;
  const individualChamps = data.individualChampions
    .filter(r => r.championId === cardId)
    .map(r => r.season)
    .sort((a, b) => b - a);

  for (let i = 0; i < individualChamps.length - 1; i++) {
    if (individualChamps[i] - individualChamps[i + 1] === 1) {
      individualStreak++;
    } else {
      break;
    }
  }

  // MVP 연속
  let mvpStreak = 0;
  const mvps = data.seasonMvps
    .filter(r => r.cardId === cardId)
    .map(r => r.season)
    .sort((a, b) => b - a);

  for (let i = 0; i < mvps.length - 1; i++) {
    if (mvps[i] - mvps[i + 1] === 1) {
      mvpStreak++;
    } else {
      break;
    }
  }

  return {
    consecutiveSeasonChampionships: seasonStreak + 1,
    consecutiveIndividualChampionships: individualStreak + 1,
    consecutiveMvps: mvpStreak + 1
  };
}

/**
 * 명예의 전당 입성 자격 확인
 */
export function isHallOfFameWorthy(stats: CardHallOfFameStats): boolean {
  return (
    stats.seasonChampionships >= 1 ||
    stats.individualChampionships >= 1 ||
    stats.mvpAwards >= 2 ||
    stats.totalWins >= 100 ||
    stats.longestStreak >= 10
  );
}

/**
 * 명예의 전당 타이틀 부여
 */
export function getHallOfFameTitle(stats: CardHallOfFameStats): string | null {
  if (stats.seasonChampionships >= 5) return '레전드';
  if (stats.individualChampionships >= 3) return '개인전의 제왕';
  if (stats.seasonChampionships >= 3) return '다이너스티';
  if (stats.mvpAwards >= 5) return 'MVP 명장';
  if (stats.totalWins >= 500) return '승리의 화신';
  if (stats.longestStreak >= 20) return '무패의 신화';
  if (stats.seasonChampionships >= 1) return '챔피언';
  if (stats.individualChampionships >= 1) return '개인전 챔피언';
  if (stats.mvpAwards >= 1) return 'MVP';
  return null;
}

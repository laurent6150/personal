// ========================================
// 뉴스 피드 스토어
// Phase 5: 스토리라인, 라이벌, 커리어 뉴스
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHARACTERS_BY_ID } from '../data/characters';
import type { NewsItem, CareerPhase } from '../types';

interface NewsFeedStore {
  news: NewsItem[];
  lastReadTimestamp: number;

  // 뉴스 추가
  addNews: (news: Omit<NewsItem, 'id' | 'timestamp'>) => void;

  // 경기 결과 뉴스 생성
  addMatchResultNews: (params: {
    seasonNumber: number;
    homeCrewName: string;
    awayCrewName: string;
    homeScore: number;
    awayScore: number;
    isPlayer: boolean;
    mvpCardId?: string;
    isPlayoff?: boolean;
  }) => void;

  // 연승/연패 뉴스 생성
  addStreakNews: (params: {
    seasonNumber: number;
    crewName: string;
    crewId: string;
    streakType: 'WIN' | 'LOSE';
    count: number;
    isPlayer: boolean;
  }) => void;

  // 기록 경신 뉴스 생성
  addRecordNews: (params: {
    seasonNumber: number;
    cardId: string;
    recordType: 'MOST_WINS' | 'WIN_RATE' | 'TOTAL_GAMES';
    value: number;
  }) => void;

  // 시즌 시작 뉴스
  addSeasonStartNews: (seasonNumber: number) => void;

  // 시즌 종료 뉴스
  addSeasonEndNews: (params: {
    seasonNumber: number;
    championName: string;
    championId: string;
  }) => void;

  // 플레이오프 뉴스
  addPlayoffNews: (params: {
    seasonNumber: number;
    stage: 'SEMI' | 'FINAL' | 'CHAMPION';
    winnerName: string;
    loserName?: string;
    score?: string;
  }) => void;

  // 마지막 읽은 시간 업데이트
  markAsRead: () => void;

  // 안 읽은 뉴스 수
  getUnreadCount: () => number;

  // 최근 뉴스 가져오기
  getRecentNews: (count?: number) => NewsItem[];

  // 시즌별 뉴스 가져오기
  getSeasonNews: (seasonNumber: number) => NewsItem[];

  // 뉴스 초기화
  clearNews: () => void;

  // Phase 5: 스토리라인 뉴스
  addRivalNews: (params: {
    seasonNumber: number;
    cardId1: string;
    cardId2: string;
    matchCount: number;
  }) => void;

  addRivalMatchNews: (params: {
    seasonNumber: number;
    cardId1: string;
    cardId2: string;
    winnerId: string;
  }) => void;

  addCareerPhaseNews: (params: {
    seasonNumber: number;
    cardId: string;
    newPhase: CareerPhase;
  }) => void;

  addRetirementNews: (params: {
    seasonNumber: number;
    cardId: string;
    seasonsPlayed: number;
    totalWins: number;
  }) => void;

  addDraftNews: (params: {
    seasonNumber: number;
    crewName: string;
    cardId: string;
    pickNumber: number;
  }) => void;

  addTradeNews: (params: {
    seasonNumber: number;
    fromCrewName: string;
    toCrewName: string;
    cardIds: string[];
  }) => void;

  addHalfSeasonNews: (params: {
    seasonNumber: number;
    half: 'FIRST' | 'SECOND';
    leaderCrewName: string;
    leaderPoints: number;
  }) => void;
}

export const useNewsFeedStore = create<NewsFeedStore>()(
  persist(
    (set, get) => ({
      news: [],
      lastReadTimestamp: Date.now(),

      addNews: (newsData) => {
        const newNews: NewsItem = {
          ...newsData,
          id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        };

        set(state => ({
          news: [newNews, ...state.news].slice(0, 100) // 최대 100개 유지
        }));
      },

      addMatchResultNews: (params) => {
        const {
          seasonNumber,
          homeCrewName,
          awayCrewName,
          homeScore,
          awayScore,
          isPlayer,
          mvpCardId,
          isPlayoff = false
        } = params;

        const winner = homeScore > awayScore ? homeCrewName : awayCrewName;
        const loser = homeScore > awayScore ? awayCrewName : homeCrewName;
        const mvpCard = mvpCardId ? CHARACTERS_BY_ID[mvpCardId] : null;

        let title = isPlayoff
          ? `[플레이오프] ${winner}, ${loser} 격파!`
          : `${winner}, ${loser}에 승리`;

        let content = `${homeCrewName} ${homeScore} - ${awayScore} ${awayCrewName}`;
        if (mvpCard) {
          content += `\n오늘의 MVP: ${mvpCard.name.ko}`;
        }

        get().addNews({
          type: 'MATCH_RESULT',
          seasonNumber,
          title,
          content,
          highlight: isPlayoff || isPlayer,
          relatedCrews: [homeCrewName, awayCrewName]
        });
      },

      addStreakNews: (params) => {
        const { seasonNumber, crewName, crewId, streakType, count, isPlayer } = params;

        if (count < 3) return; // 3연속부터 뉴스화

        const streakEmoji = streakType === 'WIN' ? '🔥' : '💀';
        const streakText = streakType === 'WIN' ? '연승' : '연패';

        get().addNews({
          type: 'STREAK',
          seasonNumber,
          title: `${streakEmoji} ${crewName}, ${count}${streakText} 기록!`,
          content: streakType === 'WIN'
            ? `${crewName}의 질주가 멈추지 않습니다!`
            : `${crewName}에게 승리가 필요한 시점입니다.`,
          highlight: count >= 5 || isPlayer,
          relatedCrews: [crewId]
        });
      },

      addRecordNews: (params) => {
        const { seasonNumber, cardId, recordType, value } = params;
        const card = CHARACTERS_BY_ID[cardId];
        if (!card) return;

        let title = '';
        let content = '';

        switch (recordType) {
          case 'MOST_WINS':
            title = `🏅 ${card.name.ko}, 시즌 최다승 경신!`;
            content = `이번 시즌 ${value}승 달성`;
            break;
          case 'WIN_RATE':
            title = `📊 ${card.name.ko}, 최고 승률 기록!`;
            content = `승률 ${value.toFixed(1)}% 달성`;
            break;
          case 'TOTAL_GAMES':
            title = `⚔️ ${card.name.ko}, ${value}경기 출전!`;
            content = `풍부한 경험을 쌓아가는 중`;
            break;
        }

        get().addNews({
          type: 'RECORD',
          seasonNumber,
          title,
          content,
          relatedCards: [cardId]
        });
      },

      addSeasonStartNews: (seasonNumber) => {
        get().addNews({
          type: 'SEASON_START',
          seasonNumber,
          title: `🎉 시즌 ${seasonNumber} 개막!`,
          content: `새로운 시즌이 시작되었습니다.\n6개 크루가 정상을 향한 여정을 시작합니다.`,
          highlight: true
        });
      },

      addSeasonEndNews: (params) => {
        const { seasonNumber, championName, championId } = params;

        get().addNews({
          type: 'SEASON_END',
          seasonNumber,
          title: `🏆 시즌 ${seasonNumber} 종료!`,
          content: `${championName}가 우승을 차지했습니다!`,
          highlight: true,
          relatedCrews: [championId]
        });
      },

      addPlayoffNews: (params) => {
        const { seasonNumber, stage, winnerName, loserName, score } = params;

        let title = '';
        let content = '';

        switch (stage) {
          case 'SEMI':
            title = `🎯 ${winnerName}, 결승 진출!`;
            content = `준결승에서 ${loserName}를 ${score}로 꺾고 결승 진출`;
            break;
          case 'FINAL':
            title = `🏆 ${winnerName} 우승!`;
            content = `결승에서 ${loserName}를 ${score}로 제압!`;
            break;
          case 'CHAMPION':
            title = `👑 시즌 ${seasonNumber} 챔피언: ${winnerName}`;
            content = `축하합니다! ${winnerName}가 왕좌에 올랐습니다!`;
            break;
        }

        get().addNews({
          type: 'PLAYOFF',
          seasonNumber,
          title,
          content,
          highlight: true
        });
      },

      markAsRead: () => {
        set({ lastReadTimestamp: Date.now() });
      },

      getUnreadCount: () => {
        const { news, lastReadTimestamp } = get();
        return news.filter(n => n.timestamp > lastReadTimestamp).length;
      },

      getRecentNews: (count = 10) => {
        return get().news.slice(0, count);
      },

      getSeasonNews: (seasonNumber) => {
        return get().news.filter(n => n.seasonNumber === seasonNumber);
      },

      clearNews: () => {
        set({ news: [], lastReadTimestamp: Date.now() });
      },

      // ========================================
      // Phase 5: 스토리라인 뉴스
      // ========================================

      // 라이벌 성립 뉴스
      addRivalNews: (params) => {
        const { seasonNumber, cardId1, cardId2, matchCount } = params;
        const card1 = CHARACTERS_BY_ID[cardId1];
        const card2 = CHARACTERS_BY_ID[cardId2];

        if (!card1 || !card2) return;

        get().addNews({
          type: 'RIVALRY',
          seasonNumber,
          title: `🔥 숙명의 라이벌 탄생!`,
          content: `${card1.name.ko}와 ${card2.name.ko}가 ${matchCount}번의 대결 끝에 라이벌로 인정되었습니다!\n앞으로의 대결에서는 특별한 보너스가 적용됩니다.`,
          highlight: true,
          relatedCards: [cardId1, cardId2]
        });
      },

      // 라이벌 대결 뉴스
      addRivalMatchNews: (params) => {
        const { seasonNumber, cardId1, cardId2, winnerId } = params;
        const card1 = CHARACTERS_BY_ID[cardId1];
        const card2 = CHARACTERS_BY_ID[cardId2];
        const winner = CHARACTERS_BY_ID[winnerId];

        if (!card1 || !card2 || !winner) return;

        const loser = winnerId === cardId1 ? card2 : card1;

        get().addNews({
          type: 'RIVALRY',
          seasonNumber,
          title: `⚔️ 라이벌 대결! ${winner.name.ko} 승리!`,
          content: `${winner.name.ko}가 숙적 ${loser.name.ko}를 상대로 승리를 거머쥐었습니다!`,
          highlight: true,
          relatedCards: [cardId1, cardId2]
        });
      },

      // 커리어 페이즈 변화 뉴스
      addCareerPhaseNews: (params) => {
        const { seasonNumber, cardId, newPhase } = params;
        const card = CHARACTERS_BY_ID[cardId];

        if (!card) return;

        let title = '';
        let content = '';

        switch (newPhase) {
          case 'GROWTH':
            title = `📈 ${card.name.ko}, 성장기 진입`;
            content = `신입 기간을 마치고 본격적인 성장기에 접어들었습니다.`;
            break;
          case 'PEAK':
            title = `⭐ ${card.name.ko}, 전성기 돌입!`;
            content = `${card.name.ko}가 전성기에 접어들었습니다! 최고의 활약이 기대됩니다.`;
            break;
          case 'DECLINE':
            title = `📉 ${card.name.ko}, 쇠퇴기 시작`;
            content = `${card.name.ko}의 기량이 서서히 쇠퇴하기 시작했습니다. 은퇴를 고려해볼 시점입니다.`;
            break;
          case 'RETIREMENT_ELIGIBLE':
            title = `🌅 ${card.name.ko}, 은퇴 권유`;
            content = `${card.name.ko}에게 은퇴가 권유되었습니다. 더 이상의 활동은 스탯 하락으로 이어질 수 있습니다.`;
            break;
          default:
            return;
        }

        get().addNews({
          type: 'CAREER',
          seasonNumber,
          title,
          content,
          highlight: newPhase === 'PEAK' || newPhase === 'RETIREMENT_ELIGIBLE',
          relatedCards: [cardId]
        });
      },

      // 은퇴 뉴스
      addRetirementNews: (params) => {
        const { seasonNumber, cardId, seasonsPlayed, totalWins } = params;
        const card = CHARACTERS_BY_ID[cardId];

        if (!card) return;

        get().addNews({
          type: 'RETIREMENT',
          seasonNumber,
          title: `👋 ${card.name.ko}, 은퇴 선언`,
          content: `${seasonsPlayed}시즌 동안 ${totalWins}승을 기록한 ${card.name.ko}가 은퇴를 선언했습니다.\n팬들의 사랑에 감사드립니다.`,
          highlight: true,
          relatedCards: [cardId]
        });
      },

      // 드래프트 뉴스
      addDraftNews: (params) => {
        const { seasonNumber, crewName, cardId, pickNumber } = params;
        const card = CHARACTERS_BY_ID[cardId];

        if (!card) return;

        const pickSuffix = pickNumber === 1 ? '1순위' : `${pickNumber}순위`;

        get().addNews({
          type: 'DRAFT',
          seasonNumber,
          title: `📋 ${crewName}, ${card.name.ko} 지명`,
          content: `${crewName}가 ${pickSuffix} 지명권으로 ${card.name.ko}를 선택했습니다!`,
          highlight: pickNumber <= 3,
          relatedCards: [cardId],
          relatedCrews: [crewName]
        });
      },

      // 트레이드 뉴스
      addTradeNews: (params) => {
        const { seasonNumber, fromCrewName, toCrewName, cardIds } = params;
        const cardNames = cardIds
          .map(id => CHARACTERS_BY_ID[id]?.name.ko)
          .filter(Boolean)
          .join(', ');

        if (!cardNames) return;

        get().addNews({
          type: 'TRADE',
          seasonNumber,
          title: `🔄 트레이드 성사!`,
          content: `${fromCrewName} → ${toCrewName}: ${cardNames}`,
          highlight: cardIds.length > 1,
          relatedCards: cardIds,
          relatedCrews: [fromCrewName, toCrewName]
        });
      },

      // 반기 종료 뉴스
      addHalfSeasonNews: (params) => {
        const { seasonNumber, half, leaderCrewName, leaderPoints } = params;

        const halfText = half === 'FIRST' ? '전반기' : '후반기';

        get().addNews({
          type: 'HALF_SEASON',
          seasonNumber,
          title: `📊 시즌 ${seasonNumber} ${halfText} 종료`,
          content: `${halfText} 1위: ${leaderCrewName} (${leaderPoints}승점)\n${half === 'FIRST' ? '전환기 이벤트가 시작됩니다!' : '플레이오프가 다가옵니다!'}`,
          highlight: true,
          relatedCrews: [leaderCrewName]
        });
      }
    }),
    {
      name: 'jjk-news-feed',
      version: 2  // v2: Phase 5 스토리라인 뉴스
    }
  )
);

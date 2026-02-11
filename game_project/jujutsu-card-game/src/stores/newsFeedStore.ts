// ========================================
// 뉴스 피드 스토어
// ========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHARACTERS_BY_ID } from '../data/characters';
import type { NewsItem } from '../types';

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
      }
    }),
    {
      name: 'jjk-news-feed',
      version: 1
    }
  )
);

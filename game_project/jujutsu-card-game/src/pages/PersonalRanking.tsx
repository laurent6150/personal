// ========================================
// 개인 순위 화면 - 카드별 랭킹
// ========================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ALL_CHARACTERS } from '../data/characters';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { useCardRecordStore } from '../stores/cardRecordStore';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import { Button } from '../components/UI/Button';
import { GradeBadge } from '../components/UI/Badge';
import type { CardStats } from '../types';

interface PersonalRankingProps {
  onBack: () => void;
  onCardSelect: (cardId: string) => void;
}

type SortOption = 'wins' | 'winRate' | 'totalGames' | 'level' | 'atk' | 'def' | 'spd';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'wins', label: '승리수' },
  { id: 'winRate', label: '승률' },
  { id: 'totalGames', label: '경기수' },
  { id: 'level', label: '레벨' },
  { id: 'atk', label: 'ATK' },
  { id: 'def', label: 'DEF' },
  { id: 'spd', label: 'SPD' }
];

export function PersonalRanking({ onBack, onCardSelect }: PersonalRankingProps) {
  const { currentSeason, seasonHistory, currentAICrews, playerCrew } = useSeasonStore();
  const { player } = usePlayerStore();
  const { getAllCardStats } = useCardRecordStore();

  const [seasonFilter, setSeasonFilter] = useState<'career' | number>('career');
  const [sortBy, setSortBy] = useState<SortOption>('wins');

  // 시즌 옵션 목록
  const seasonOptions = useMemo(() => {
    const options: { id: 'career' | number; label: string }[] = [
      { id: 'career', label: '통산' }
    ];

    if (currentSeason) {
      options.push({ id: currentSeason.number, label: `시즌${currentSeason.number}` });
    }

    for (const history of [...seasonHistory].reverse()) {
      if (!options.find(o => o.id === history.seasonNumber)) {
        options.push({ id: history.seasonNumber, label: `시즌${history.seasonNumber}` });
      }
    }

    return options;
  }, [currentSeason, seasonHistory]);

  // 카드별 소속 크루 매핑
  const cardCrewMap = useMemo(() => {
    const map: Record<string, { crewId: string; crewName: string }> = {};

    for (const cardId of playerCrew) {
      map[cardId] = { crewId: PLAYER_CREW_ID, crewName: player.name };
    }

    for (const aiCrew of currentAICrews) {
      for (const cardId of aiCrew.crew) {
        map[cardId] = { crewId: aiCrew.id, crewName: aiCrew.name };
      }
    }

    return map;
  }, [playerCrew, currentAICrews, player.name]);

  // 랭킹 데이터 계산
  const rankings = useMemo(() => {
    // 기록이 있는 카드들의 스탯 가져오기
    const statsWithRecords = seasonFilter === 'career'
      ? getAllCardStats()
      : getAllCardStats(seasonFilter);

    // 기록이 있는 카드 ID 집합
    const cardIdsWithRecords = new Set(statsWithRecords.map(s => s.cardId));

    // 모든 카드에 대한 완전한 데이터 구축
    const fullRankings: (CardStats & {
      character: typeof ALL_CHARACTERS[0];
      level: number;
      crewName?: string;
    })[] = [];

    for (const card of ALL_CHARACTERS) {
      const stats = cardIdsWithRecords.has(card.id)
        ? statsWithRecords.find(s => s.cardId === card.id)!
        : { cardId: card.id, wins: 0, losses: 0, totalGames: 0, winRate: 0 };

      const playerCard = player.ownedCards[card.id];
      const crewInfo = cardCrewMap[card.id];

      fullRankings.push({
        ...stats,
        character: card,
        level: playerCard?.level || 1,
        crewName: crewInfo?.crewName
      });
    }

    // 정렬
    fullRankings.sort((a, b) => {
      switch (sortBy) {
        case 'wins':
          return b.wins - a.wins || b.winRate - a.winRate;
        case 'winRate':
          // 최소 경기 수 필터 (1경기 이상)
          const aHasGames = a.totalGames > 0;
          const bHasGames = b.totalGames > 0;
          if (aHasGames !== bHasGames) return bHasGames ? 1 : -1;
          return b.winRate - a.winRate || b.wins - a.wins;
        case 'totalGames':
          return b.totalGames - a.totalGames;
        case 'level':
          return b.level - a.level;
        case 'atk':
          return b.character.baseStats.atk - a.character.baseStats.atk;
        case 'def':
          return b.character.baseStats.def - a.character.baseStats.def;
        case 'spd':
          return b.character.baseStats.spd - a.character.baseStats.spd;
        default:
          return 0;
      }
    });

    // 기록이 있는 카드만 필터 (승리수, 승률, 경기수 정렬 시)
    if (['wins', 'winRate', 'totalGames'].includes(sortBy)) {
      return fullRankings.filter(r => r.totalGames > 0);
    }

    return fullRankings;
  }, [seasonFilter, sortBy, getAllCardStats, player.ownedCards, cardCrewMap]);

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-accent">개인 순위</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* 필터 */}
      <div className="max-w-4xl mx-auto mb-6 bg-bg-card rounded-xl p-4 border border-white/10">
        <div className="grid grid-cols-2 gap-4">
          {/* 시즌 선택 */}
          <div>
            <div className="text-sm text-text-secondary mb-2">시즌</div>
            <div className="flex flex-wrap gap-2">
              {seasonOptions.map(opt => (
                <button
                  key={String(opt.id)}
                  onClick={() => setSeasonFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    seasonFilter === opt.id
                      ? 'bg-accent text-white'
                      : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 */}
          <div>
            <div className="text-sm text-text-secondary mb-2">정렬</div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-bg-secondary text-text-primary rounded-lg p-2 border border-white/10"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 랭킹 테이블 */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-bg-card rounded-xl border border-white/10 overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-12 gap-2 p-4 bg-bg-secondary/50 text-sm font-bold text-text-secondary border-b border-white/10">
            <div className="col-span-1 text-center">순위</div>
            <div className="col-span-5">카드</div>
            <div className="col-span-3">크루</div>
            <div className="col-span-3 text-right">전적</div>
          </div>

          {/* 랭킹 목록 */}
          {rankings.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              기록이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {rankings.slice(0, 50).map((item, index) => (
                <motion.div
                  key={item.cardId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onCardSelect(item.cardId)}
                  className={`grid grid-cols-12 gap-2 p-4 items-center cursor-pointer hover:bg-white/5 transition-colors ${
                    item.crewName === player.name ? 'bg-accent/10' : ''
                  }`}
                >
                  {/* 순위 */}
                  <div className="col-span-1 text-center">
                    {index === 0 && <span className="text-xl">🥇</span>}
                    {index === 1 && <span className="text-xl">🥈</span>}
                    {index === 2 && <span className="text-xl">🥉</span>}
                    {index > 2 && <span className="font-bold text-text-secondary">{index + 1}</span>}
                  </div>

                  {/* 카드 정보 */}
                  <div className="col-span-5 flex items-center gap-3">
                    <GradeBadge grade={item.character.grade} size="sm" />
                    <div>
                      <div className="font-bold">{item.character.name.ko}</div>
                      <div className="text-xs text-text-secondary">Lv.{item.level}</div>
                    </div>
                  </div>

                  {/* 소속 크루 */}
                  <div className="col-span-3">
                    {item.crewName ? (
                      <span className={`text-sm ${item.crewName === player.name ? 'text-accent font-bold' : 'text-text-secondary'}`}>
                        {item.crewName}
                      </span>
                    ) : (
                      <span className="text-sm text-text-secondary/50">-</span>
                    )}
                  </div>

                  {/* 전적 */}
                  <div className="col-span-3 text-right">
                    {item.totalGames > 0 ? (
                      <>
                        <div className="font-bold">
                          <span className="text-win">{item.wins}승</span>
                          {' '}
                          <span className="text-lose">{item.losses}패</span>
                        </div>
                        <div className="text-xs text-text-secondary">
                          승률 {item.winRate.toFixed(1)}%
                        </div>
                      </>
                    ) : (
                      <span className="text-text-secondary/50 text-sm">기록 없음</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

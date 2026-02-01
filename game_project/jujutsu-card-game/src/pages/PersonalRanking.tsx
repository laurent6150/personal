// ========================================
// 개인 순위 화면 - 카드별 랭킹 (항목별 TOP 10)
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

type RankingCategory = 'wins' | 'winRate' | 'totalGames' | 'level' | 'atk' | 'def' | 'spd';

interface CategoryConfig {
  id: RankingCategory;
  label: string;
  icon: string;
  getValue: (item: RankingItem) => number;
  formatValue: (item: RankingItem) => string;
  filterCondition?: (item: RankingItem) => boolean;
}

interface RankingItem extends CardStats {
  character: typeof ALL_CHARACTERS[0];
  level: number;
  crewName?: string;
}

const RANKING_CATEGORIES: CategoryConfig[] = [
  {
    id: 'wins',
    label: '승리수',
    icon: '🏆',
    getValue: (item) => item.wins,
    formatValue: (item) => `${item.wins}승`,
    filterCondition: (item) => item.totalGames > 0
  },
  {
    id: 'winRate',
    label: '승률',
    icon: '📈',
    getValue: (item) => item.winRate,
    formatValue: (item) => `${item.winRate.toFixed(1)}%`,
    filterCondition: (item) => item.totalGames >= 3 // 최소 3경기 이상
  },
  {
    id: 'totalGames',
    label: '경기수',
    icon: '⚔️',
    getValue: (item) => item.totalGames,
    formatValue: (item) => `${item.totalGames}경기`,
    filterCondition: (item) => item.totalGames > 0
  },
  {
    id: 'level',
    label: '레벨',
    icon: '⭐',
    getValue: (item) => item.level,
    formatValue: (item) => `Lv.${item.level}`
  },
  {
    id: 'atk',
    label: 'ATK',
    icon: '💥',
    getValue: (item) => item.character.baseStats.atk,
    formatValue: (item) => `${item.character.baseStats.atk}`
  },
  {
    id: 'def',
    label: 'DEF',
    icon: '🛡️',
    getValue: (item) => item.character.baseStats.def,
    formatValue: (item) => `${item.character.baseStats.def}`
  },
  {
    id: 'spd',
    label: 'SPD',
    icon: '⚡',
    getValue: (item) => item.character.baseStats.spd,
    formatValue: (item) => `${item.character.baseStats.spd}`
  }
];

export function PersonalRanking({ onBack, onCardSelect }: PersonalRankingProps) {
  const { currentSeason, seasonHistory, currentAICrews, playerCrew } = useSeasonStore();
  const { player } = usePlayerStore();
  const { getAllCardStats } = useCardRecordStore();

  const [seasonFilter, setSeasonFilter] = useState<'career' | number>('career');

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

  // 전체 카드 데이터 구축
  const allCardData = useMemo(() => {
    const statsWithRecords = seasonFilter === 'career'
      ? getAllCardStats()
      : getAllCardStats(seasonFilter);

    const cardIdsWithRecords = new Set(statsWithRecords.map(s => s.cardId));

    const fullData: RankingItem[] = [];

    for (const card of ALL_CHARACTERS) {
      const stats = cardIdsWithRecords.has(card.id)
        ? statsWithRecords.find(s => s.cardId === card.id)!
        : { cardId: card.id, wins: 0, losses: 0, totalGames: 0, winRate: 0 };

      const playerCard = player.ownedCards[card.id];
      const crewInfo = cardCrewMap[card.id];

      fullData.push({
        ...stats,
        character: card,
        level: playerCard?.level || 1,
        crewName: crewInfo?.crewName
      });
    }

    return fullData;
  }, [seasonFilter, getAllCardStats, player.ownedCards, cardCrewMap]);

  // 카테고리별 TOP 10 계산
  const categoryRankings = useMemo(() => {
    const rankings: Record<RankingCategory, RankingItem[]> = {} as Record<RankingCategory, RankingItem[]>;

    for (const category of RANKING_CATEGORIES) {
      let filtered = category.filterCondition
        ? allCardData.filter(category.filterCondition)
        : [...allCardData];

      filtered.sort((a, b) => category.getValue(b) - category.getValue(a));
      rankings[category.id] = filtered.slice(0, 10);
    }

    return rankings;
  }, [allCardData]);

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-accent">개인 순위</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* 시즌 필터 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {seasonOptions.map(opt => (
            <button
              key={String(opt.id)}
              onClick={() => setSeasonFilter(opt.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                seasonFilter === opt.id
                  ? 'bg-accent text-white'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리별 TOP 10 그리드 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {RANKING_CATEGORIES.map(category => (
          <CategoryRankingCard
            key={category.id}
            category={category}
            rankings={categoryRankings[category.id]}
            playerName={player.name}
            onCardSelect={onCardSelect}
          />
        ))}
      </div>
    </div>
  );
}

// 카테고리별 랭킹 카드 컴포넌트
interface CategoryRankingCardProps {
  category: CategoryConfig;
  rankings: RankingItem[];
  playerName: string;
  onCardSelect: (cardId: string) => void;
}

function CategoryRankingCard({ category, rankings, playerName, onCardSelect }: CategoryRankingCardProps) {
  return (
    <div className="bg-bg-card rounded-xl border border-white/10 overflow-hidden">
      {/* 카테고리 헤더 */}
      <div className="bg-bg-secondary/50 px-4 py-3 border-b border-white/10">
        <h3 className="font-bold text-text-primary flex items-center gap-2">
          <span>{category.icon}</span>
          <span>{category.label} TOP 10</span>
        </h3>
      </div>

      {/* 랭킹 목록 */}
      {rankings.length === 0 ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          기록이 없습니다
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {rankings.map((item, index) => (
            <motion.div
              key={item.cardId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onCardSelect(item.cardId)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-white/5 transition-colors ${
                item.crewName === playerName ? 'bg-accent/10' : ''
              }`}
            >
              {/* 순위 */}
              <div className="w-6 text-center flex-shrink-0">
                {index === 0 && <span className="text-lg">🥇</span>}
                {index === 1 && <span className="text-lg">🥈</span>}
                {index === 2 && <span className="text-lg">🥉</span>}
                {index > 2 && <span className="text-sm font-bold text-text-secondary">{index + 1}</span>}
              </div>

              {/* 등급 뱃지 */}
              <GradeBadge grade={item.character.grade} size="sm" />

              {/* 카드 이름 */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  item.crewName === playerName ? 'text-accent' : 'text-text-primary'
                }`}>
                  {item.character.name.ko}
                </div>
                {item.crewName && (
                  <div className="text-xs text-text-secondary truncate">
                    {item.crewName}
                  </div>
                )}
              </div>

              {/* 수치 */}
              <div className="text-sm font-bold text-accent flex-shrink-0">
                {category.formatValue(item)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

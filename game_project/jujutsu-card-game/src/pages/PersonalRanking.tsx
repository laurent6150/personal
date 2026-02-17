// ========================================
// 순위 화면 - 개인 순위 (카드별) + 팀 순위 (크루별)
// ========================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { ALL_CHARACTERS } from '../data/characters';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { useCardRecordStore } from '../stores/cardRecordStore';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import { Button } from '../components/UI/Button';
import { GradeBadge } from '../components/UI/Badge';
import type { CardStats, LeagueStanding } from '../types';

interface PersonalRankingProps {
  onBack: () => void;
  onCardSelect: (cardId: string) => void;
}

type RankingTab = 'personal' | 'team';

// ========================================
// 개인 순위 (카드별)
// ========================================

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
    filterCondition: (item) => item.totalGames >= 3
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

// ========================================
// 팀 순위 (크루별)
// ========================================

type TeamCategory = 'points' | 'wins' | 'winRate' | 'goalsFor' | 'goalDifference';

interface TeamCategoryConfig {
  id: TeamCategory;
  label: string;
  icon: string;
  getValue: (item: TeamRankingItem) => number;
  formatValue: (item: TeamRankingItem) => string;
}

interface TeamRankingItem {
  crewId: string;
  crewName: string;
  isPlayer: boolean;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  winRate: number;
}

const TEAM_CATEGORIES: TeamCategoryConfig[] = [
  {
    id: 'points',
    label: '승점',
    icon: '🏅',
    getValue: (item) => item.points,
    formatValue: (item) => `${item.points}점`
  },
  {
    id: 'wins',
    label: '승리수',
    icon: '🏆',
    getValue: (item) => item.wins,
    formatValue: (item) => `${item.wins}승`
  },
  {
    id: 'winRate',
    label: '승률',
    icon: '📈',
    getValue: (item) => item.played > 0 ? item.winRate : 0,
    formatValue: (item) => `${item.winRate.toFixed(1)}%`
  },
  {
    id: 'goalsFor',
    label: '득점',
    icon: '⚽',
    getValue: (item) => item.goalsFor,
    formatValue: (item) => `${item.goalsFor}점`
  },
  {
    id: 'goalDifference',
    label: '득실차',
    icon: '📊',
    getValue: (item) => item.goalDifference,
    formatValue: (item) => `${item.goalDifference >= 0 ? '+' : ''}${item.goalDifference}`
  }
];

// ========================================
// 메인 컴포넌트
// ========================================

export function PersonalRanking({ onBack, onCardSelect }: PersonalRankingProps) {
  const { currentSeason, seasonHistory, currentAICrews, playerCrew } = useSeasonStore(useShallow(state => ({
    currentSeason: state.currentSeason,
    seasonHistory: state.seasonHistory,
    currentAICrews: state.currentAICrews,
    playerCrew: state.playerCrew
  })));
  const player = usePlayerStore(state => state.player);
  const getAllCardStats = useCardRecordStore(state => state.getAllCardStats);

  const [activeTab, setActiveTab] = useState<RankingTab>('personal');
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

  // 크루 이름 매핑
  const crewNameMap = useMemo(() => {
    const map: Record<string, string> = { [PLAYER_CREW_ID]: player.name };
    for (const crew of currentAICrews) {
      map[crew.id] = crew.name;
    }
    return map;
  }, [currentAICrews, player.name]);

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

  // ========================================
  // 개인 순위 데이터
  // ========================================

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

  // ========================================
  // 팀 순위 데이터
  // ========================================

  const teamRankingData = useMemo((): TeamRankingItem[] => {
    if (seasonFilter === 'career') {
      // 통산: 현재 시즌 + 히스토리 합산
      const aggregated: Record<string, TeamRankingItem> = {};

      const addStandings = (standings: LeagueStanding[]) => {
        for (const s of standings) {
          if (!aggregated[s.crewId]) {
            aggregated[s.crewId] = {
              crewId: s.crewId,
              crewName: crewNameMap[s.crewId] || s.crewId,
              isPlayer: s.crewId === PLAYER_CREW_ID,
              played: 0, wins: 0, draws: 0, losses: 0,
              points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, winRate: 0
            };
          }
          const a = aggregated[s.crewId];
          a.played += s.played;
          a.wins += s.wins;
          a.draws += s.draws;
          a.losses += s.losses;
          a.points += s.points;
          a.goalsFor += s.goalsFor;
          a.goalsAgainst += s.goalsAgainst;
          a.goalDifference += s.goalDifference;
        }
      };

      if (currentSeason?.standings) addStandings(currentSeason.standings);
      for (const h of seasonHistory) {
        if (h.standings) addStandings(h.standings);
      }

      // 승률 계산
      return Object.values(aggregated).map(a => ({
        ...a,
        winRate: a.played > 0 ? (a.wins / a.played) * 100 : 0
      }));
    } else {
      // 특정 시즌
      let standings: LeagueStanding[] = [];
      if (currentSeason?.number === seasonFilter) {
        standings = currentSeason.standings;
      } else {
        const hist = seasonHistory.find(h => h.seasonNumber === seasonFilter);
        if (hist?.standings) standings = hist.standings;
      }

      return standings.map(s => ({
        crewId: s.crewId,
        crewName: crewNameMap[s.crewId] || s.crewId,
        isPlayer: s.crewId === PLAYER_CREW_ID,
        played: s.played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        points: s.points,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
        winRate: s.played > 0 ? (s.wins / s.played) * 100 : 0
      }));
    }
  }, [seasonFilter, currentSeason, seasonHistory, crewNameMap]);

  const teamCategoryRankings = useMemo(() => {
    const rankings: Record<TeamCategory, TeamRankingItem[]> = {} as Record<TeamCategory, TeamRankingItem[]>;

    for (const category of TEAM_CATEGORIES) {
      const sorted = [...teamRankingData].sort((a, b) => category.getValue(b) - category.getValue(a));
      rankings[category.id] = sorted;
    }

    return rankings;
  }, [teamRankingData]);

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-accent">순위</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* 탭 선택 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'personal'
                ? 'bg-accent text-white'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
            }`}
          >
            개인 순위
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'team'
                ? 'bg-accent text-white'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
            }`}
          >
            팀 순위
          </button>
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
                  ? 'bg-accent/80 text-white'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 개인 순위 */}
      {activeTab === 'personal' && (
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
      )}

      {/* 팀 순위 */}
      {activeTab === 'team' && (
        <div className="max-w-6xl mx-auto space-y-4">
          {/* 종합 순위표 */}
          <TeamStandingsTable
            teams={teamRankingData}
            playerName={player.name}
          />

          {/* 항목별 순위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEAM_CATEGORIES.map(category => (
              <TeamCategoryCard
                key={category.id}
                category={category}
                rankings={teamCategoryRankings[category.id]}
                playerName={player.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// 개인 순위 카테고리 카드
// ========================================

interface CategoryRankingCardProps {
  category: CategoryConfig;
  rankings: RankingItem[];
  playerName: string;
  onCardSelect: (cardId: string) => void;
}

function CategoryRankingCard({ category, rankings, playerName, onCardSelect }: CategoryRankingCardProps) {
  return (
    <div className="bg-bg-card rounded-xl border border-white/10 overflow-hidden">
      <div className="bg-bg-secondary/50 px-4 py-3 border-b border-white/10">
        <h3 className="font-bold text-text-primary flex items-center gap-2">
          <span>{category.icon}</span>
          <span>{category.label} TOP 10</span>
        </h3>
      </div>

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
              <div className="w-6 text-center flex-shrink-0">
                {index === 0 && <span className="text-lg">🥇</span>}
                {index === 1 && <span className="text-lg">🥈</span>}
                {index === 2 && <span className="text-lg">🥉</span>}
                {index > 2 && <span className="text-sm font-bold text-text-secondary">{index + 1}</span>}
              </div>

              <GradeBadge grade={item.character.grade} size="sm" />

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

// ========================================
// 팀 순위 종합 테이블
// ========================================

function TeamStandingsTable({ teams, playerName }: { teams: TeamRankingItem[]; playerName: string }) {
  const sorted = useMemo(() =>
    [...teams].sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor),
    [teams]
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-bg-card rounded-xl border border-white/10 p-8 text-center text-text-secondary">
        팀 순위 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl border border-white/10 overflow-hidden">
      <div className="bg-bg-secondary/50 px-4 py-3 border-b border-white/10">
        <h3 className="font-bold text-text-primary">종합 순위표</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-secondary text-xs">
              <th className="py-2 px-3 text-left w-8">#</th>
              <th className="py-2 px-3 text-left">크루</th>
              <th className="py-2 px-2 text-center">경기</th>
              <th className="py-2 px-2 text-center">승</th>
              <th className="py-2 px-2 text-center">무</th>
              <th className="py-2 px-2 text-center">패</th>
              <th className="py-2 px-2 text-center">승률</th>
              <th className="py-2 px-2 text-center">득점</th>
              <th className="py-2 px-2 text-center">실점</th>
              <th className="py-2 px-2 text-center">득실</th>
              <th className="py-2 px-3 text-center font-bold">승점</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, index) => (
              <motion.tr
                key={team.crewId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`border-b border-white/5 ${
                  team.isPlayer ? 'bg-accent/10' : 'hover:bg-white/5'
                }`}
              >
                <td className="py-2.5 px-3 text-center">
                  {index === 0 && <span>🥇</span>}
                  {index === 1 && <span>🥈</span>}
                  {index === 2 && <span>🥉</span>}
                  {index > 2 && <span className="text-text-secondary">{index + 1}</span>}
                </td>
                <td className={`py-2.5 px-3 font-medium ${team.isPlayer ? 'text-accent' : 'text-text-primary'}`}>
                  {team.crewName}
                </td>
                <td className="py-2.5 px-2 text-center text-text-secondary">{team.played}</td>
                <td className="py-2.5 px-2 text-center text-green-400">{team.wins}</td>
                <td className="py-2.5 px-2 text-center text-text-secondary">{team.draws}</td>
                <td className="py-2.5 px-2 text-center text-red-400">{team.losses}</td>
                <td className="py-2.5 px-2 text-center">{team.winRate.toFixed(1)}%</td>
                <td className="py-2.5 px-2 text-center">{team.goalsFor}</td>
                <td className="py-2.5 px-2 text-center">{team.goalsAgainst}</td>
                <td className={`py-2.5 px-2 text-center font-medium ${
                  team.goalDifference > 0 ? 'text-green-400' :
                  team.goalDifference < 0 ? 'text-red-400' : 'text-text-secondary'
                }`}>
                  {team.goalDifference >= 0 ? '+' : ''}{team.goalDifference}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-accent">{team.points}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========================================
// 팀 순위 항목별 카드
// ========================================

function TeamCategoryCard({ category, rankings, playerName }: {
  category: TeamCategoryConfig;
  rankings: TeamRankingItem[];
  playerName: string;
}) {
  return (
    <div className="bg-bg-card rounded-xl border border-white/10 overflow-hidden">
      <div className="bg-bg-secondary/50 px-4 py-3 border-b border-white/10">
        <h3 className="font-bold text-text-primary flex items-center gap-2">
          <span>{category.icon}</span>
          <span>{category.label} 순위</span>
        </h3>
      </div>

      {rankings.length === 0 ? (
        <div className="text-center py-8 text-text-secondary text-sm">
          기록이 없습니다
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {rankings.map((team, index) => (
            <motion.div
              key={team.crewId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-center gap-3 px-4 py-2.5 ${
                team.isPlayer ? 'bg-accent/10' : ''
              }`}
            >
              <div className="w-6 text-center flex-shrink-0">
                {index === 0 && <span className="text-lg">🥇</span>}
                {index === 1 && <span className="text-lg">🥈</span>}
                {index === 2 && <span className="text-lg">🥉</span>}
                {index > 2 && <span className="text-sm font-bold text-text-secondary">{index + 1}</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  team.isPlayer ? 'text-accent' : 'text-text-primary'
                }`}>
                  {team.crewName}
                </div>
                <div className="text-xs text-text-secondary">
                  {team.wins}승 {team.draws}무 {team.losses}패
                </div>
              </div>

              <div className="text-sm font-bold text-accent flex-shrink-0">
                {category.formatValue(team)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

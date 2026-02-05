// ========================================
// 명예의 전당 화면
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { Button } from '../UI/Button';
import type { HallOfFameData } from '../../types';
import {
  getHallOfFameRankings,
  getSeasonSummaries,
  getHallOfFameTitle,
  calculateHallOfFameScore
} from '../../utils/hallOfFameSystem';
import type { CardHallOfFameStats } from '../../utils/hallOfFameSystem';

interface HallOfFameScreenProps {
  data: HallOfFameData;
  onBack?: () => void;
}

type TabType = 'rankings' | 'seasons' | 'records';

export function HallOfFameScreen({ data, onBack }: HallOfFameScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rankings');
  const [selectedCard, setSelectedCard] = useState<CardHallOfFameStats | null>(null);

  const rankings = useMemo(() => getHallOfFameRankings(data, 20), [data]);
  const seasonSummaries = useMemo(() => getSeasonSummaries(data), [data]);

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">
                명예의 전당
              </h1>
              <p className="text-sm text-text-secondary">
                역대 최고의 술사들
              </p>
            </div>
          </div>
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              뒤로
            </Button>
          )}
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'rankings' as const, label: '종합 랭킹', icon: '👑' },
            { id: 'seasons' as const, label: '시즌별 기록', icon: '📅' },
            { id: 'records' as const, label: '통산 기록', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <AnimatePresence mode="wait">
          {activeTab === 'rankings' && (
            <RankingsTab
              rankings={rankings}
              onSelectCard={setSelectedCard}
            />
          )}
          {activeTab === 'seasons' && (
            <SeasonsTab summaries={seasonSummaries} />
          )}
          {activeTab === 'records' && (
            <RecordsTab data={data} />
          )}
        </AnimatePresence>

        {/* 카드 상세 모달 */}
        {selectedCard && (
          <CardDetailModal
            stats={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </div>
    </div>
  );
}

// 종합 랭킹 탭
function RankingsTab({
  rankings,
  onSelectCard
}: {
  rankings: CardHallOfFameStats[];
  onSelectCard: (card: CardHallOfFameStats) => void;
}) {
  if (rankings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 text-text-secondary"
      >
        아직 기록이 없습니다
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-3"
    >
      {rankings.map((card, index) => {
        const charData = CHARACTERS_BY_ID[card.cardId];
        const title = getHallOfFameTitle(card);
        const score = calculateHallOfFameScore(card);

        return (
          <motion.button
            key={card.cardId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectCard(card)}
            className="w-full flex items-center gap-4 bg-bg-secondary rounded-xl border border-white/10 p-4 text-left hover:border-accent/50 transition-colors"
          >
            {/* 순위 */}
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${
              index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
              index === 1 ? 'bg-gray-400/20 text-gray-400' :
              index === 2 ? 'bg-orange-500/20 text-orange-400' :
              'bg-bg-primary text-text-secondary'
            }`}>
              {index + 1}
            </div>

            {/* 캐릭터 아이콘 */}
            <div className="w-14 h-14 bg-bg-primary rounded-lg flex items-center justify-center text-2xl">
              {charData?.name.ko.charAt(0) || '?'}
            </div>

            {/* 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">
                  {card.cardName}
                </span>
                {title && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                    {title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                {card.seasonChampionships > 0 && (
                  <span>🏆 시즌 우승 {card.seasonChampionships}회</span>
                )}
                {card.individualChampionships > 0 && (
                  <span>👑 개인전 {card.individualChampionships}회</span>
                )}
                {card.mvpAwards > 0 && (
                  <span>⭐ MVP {card.mvpAwards}회</span>
                )}
              </div>
            </div>

            {/* 점수 */}
            <div className="text-right">
              <div className="text-lg font-bold text-accent">{score}</div>
              <div className="text-xs text-text-secondary">점</div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// 시즌별 기록 탭
function SeasonsTab({
  summaries
}: {
  summaries: ReturnType<typeof getSeasonSummaries>;
}) {
  if (summaries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 text-text-secondary"
      >
        아직 완료된 시즌이 없습니다
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {summaries.map(summary => (
        <div
          key={summary.season}
          className="bg-bg-secondary rounded-xl border border-white/10 overflow-hidden"
        >
          {/* 시즌 헤더 */}
          <div className="bg-accent/10 border-b border-white/10 px-4 py-2">
            <span className="font-bold text-accent">시즌 {summary.season}</span>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 시즌 챔피언 */}
            <div className="bg-bg-primary/50 rounded-lg p-3">
              <div className="text-xs text-text-secondary mb-2">🏆 시즌 챔피언</div>
              {summary.champion ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-bg-secondary rounded-lg flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">
                      {summary.champion.crewName}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {summary.champion.wins}승 {summary.champion.losses}패
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-text-secondary text-sm">-</div>
              )}
            </div>

            {/* 개인전 챔피언 */}
            <div className="bg-bg-primary/50 rounded-lg p-3">
              <div className="text-xs text-text-secondary mb-2">👑 개인전 챔피언</div>
              {summary.individualChampion ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-bg-secondary rounded-lg flex items-center justify-center">
                    {CHARACTERS_BY_ID[summary.individualChampion.championId]?.name.ko.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">
                      {summary.individualChampion.cardName}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {summary.individualChampion.crewName}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-text-secondary text-sm">-</div>
              )}
            </div>

            {/* MVP */}
            <div className="bg-bg-primary/50 rounded-lg p-3">
              <div className="text-xs text-text-secondary mb-2">⭐ 시즌 MVP</div>
              {summary.mvp ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-bg-secondary rounded-lg flex items-center justify-center">
                    {CHARACTERS_BY_ID[summary.mvp.cardId]?.name.ko.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">
                      {summary.mvp.cardName}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {summary.mvp.wins}승 {summary.mvp.losses}패 ({summary.mvp.winRate.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-text-secondary text-sm">-</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// 통산 기록 탭
function RecordsTab({ data }: { data: HallOfFameData }) {
  const recordCategories = [
    { key: 'mostWins' as const, label: '최다 승리', icon: '🎯', unit: '승' },
    { key: 'highestWinRate' as const, label: '최고 승률', icon: '📈', unit: '%' },
    { key: 'longestStreak' as const, label: '최장 연승', icon: '🔥', unit: '연승' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {recordCategories.map(category => (
        <div
          key={category.key}
          className="bg-bg-secondary rounded-xl border border-white/10 overflow-hidden"
        >
          <div className="bg-bg-primary/50 border-b border-white/10 px-4 py-3">
            <span className="text-lg font-bold text-text-primary">
              {category.icon} {category.label}
            </span>
          </div>

          <div className="p-4">
            {data.allTimeRecords[category.key].length === 0 ? (
              <div className="text-center py-4 text-text-secondary">
                아직 기록이 없습니다
              </div>
            ) : (
              <div className="space-y-2">
                {data.allTimeRecords[category.key].slice(0, 5).map((record, index) => {
                  const charData = CHARACTERS_BY_ID[record.cardId];
                  return (
                    <div
                      key={record.cardId}
                      className="flex items-center gap-3 bg-bg-primary/30 rounded-lg p-3"
                    >
                      <span className={`w-6 text-center font-bold ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-400' : 'text-text-secondary'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 bg-bg-secondary rounded-lg flex items-center justify-center">
                        {charData?.name.ko.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-text-primary">
                          {record.cardName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-accent">
                          {category.key === 'highestWinRate'
                            ? record.value.toFixed(1)
                            : record.value}
                        </span>
                        <span className="text-xs text-text-secondary ml-1">
                          {category.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// 카드 상세 모달
function CardDetailModal({
  stats,
  onClose
}: {
  stats: CardHallOfFameStats;
  onClose: () => void;
}) {
  const charData = CHARACTERS_BY_ID[stats.cardId];
  const title = getHallOfFameTitle(stats);
  const score = calculateHallOfFameScore(stats);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-bg-secondary rounded-xl border border-yellow-500/30 max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 p-6 text-center">
          <div className="w-20 h-20 mx-auto bg-bg-primary rounded-xl flex items-center justify-center text-4xl mb-3">
            {charData?.name.ko.charAt(0) || '?'}
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            {stats.cardName}
          </h2>
          {title && (
            <div className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
              {title}
            </div>
          )}
        </div>

        {/* 통계 */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="시즌 우승" value={stats.seasonChampionships} icon="🏆" />
            <StatBox label="개인전 우승" value={stats.individualChampionships} icon="👑" />
            <StatBox label="MVP 수상" value={stats.mvpAwards} icon="⭐" />
            <StatBox label="통산 승리" value={stats.totalWins} icon="✓" />
            <StatBox label="최고 승률" value={`${stats.highestWinRate.toFixed(1)}%`} icon="📈" />
            <StatBox label="최장 연승" value={stats.longestStreak} icon="🔥" />
          </div>

          <div className="bg-bg-primary/50 rounded-lg p-3 text-center">
            <div className="text-sm text-text-secondary">종합 점수</div>
            <div className="text-2xl font-bold text-accent">{score}</div>
          </div>

          {stats.lastActive > 0 && (
            <div className="text-center text-xs text-text-secondary">
              마지막 활동: 시즌 {stats.lastActive}
            </div>
          )}
        </div>

        {/* 닫기 버튼 */}
        <div className="p-4 border-t border-white/10">
          <Button variant="primary" onClick={onClose} className="w-full">
            닫기
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatBox({
  label,
  value,
  icon
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="bg-bg-primary/30 rounded-lg p-3 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-lg font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-secondary">{label}</div>
    </div>
  );
}

export default HallOfFameScreen;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { usePlayerStore } from '../stores/playerStore';
import { GENERAL_ACHIEVEMENTS } from '../data/achievements';
import { ITEMS_BY_ID, ALL_ITEMS } from '../data/items';
import { Button } from '../components/UI/Button';
import { RarityBadge } from '../components/UI/Badge';

interface ProfileProps {
  onBack: () => void;
}

type TabType = 'stats' | 'achievements' | 'items';

export function Profile({ onBack }: ProfileProps) {
  const { player, setPlayerName } = usePlayerStore(useShallow(state => ({
    player: state.player,
    setPlayerName: state.setPlayerName
  })));
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player.name);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPlayerName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const totalGames = player.totalStats.totalWins + player.totalStats.totalLosses;
  const winRate = totalGames > 0
    ? Math.round((player.totalStats.totalWins / totalGames) * 100)
    : 0;

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">프로필</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* 프로필 카드 */}
      <div className="max-w-4xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/50 to-accent/20 flex items-center justify-center text-4xl">
              🥋
            </div>

            <div className="flex-1">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="bg-bg-secondary px-3 py-1 rounded border border-white/20 text-lg font-bold"
                    autoFocus
                    maxLength={20}
                  />
                  <Button size="sm" onClick={handleSaveName}>저장</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>취소</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{player.name}</h2>
                  <button
                    onClick={() => {
                      setNameInput(player.name);
                      setIsEditingName(true);
                    }}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <div className="text-sm text-text-secondary">
                총 {totalGames}전 {player.totalStats.totalWins}승 {player.totalStats.totalLosses}패
              </div>
            </div>

            {/* 랭크 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {player.totalStats.totalWins >= 100 ? 'S' :
                 player.totalStats.totalWins >= 50 ? 'A' :
                 player.totalStats.totalWins >= 20 ? 'B' :
                 player.totalStats.totalWins >= 5 ? 'C' : 'D'}
              </div>
              <div className="text-xs text-text-secondary">랭크</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 탭 */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex gap-2">
          {[
            { key: 'stats', label: '통계' },
            { key: 'achievements', label: '업적' },
            { key: 'items', label: '아이템' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`
                px-4 py-2 rounded-lg font-bold transition-colors
                ${activeTab === tab.key
                  ? 'bg-accent text-bg-primary'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard title="총 승리" value={player.totalStats.totalWins} icon="🏆" />
            <StatCard title="총 패배" value={player.totalStats.totalLosses} icon="💔" />
            <StatCard title="승률" value={`${winRate}%`} icon="📊" />
            <StatCard title="현재 연승" value={player.totalStats.winStreak} icon="🔥" />
            <StatCard title="최고 연승" value={player.totalStats.maxWinStreak} icon="⭐" />
            <StatCard title="보유 카드" value={Object.keys(player.ownedCards).length} icon="🃏" />
            <StatCard title="해금 아이템" value={player.unlockedItems.length} icon="💎" />
            <StatCard title="달성 업적" value={player.achievements.length} icon="🎖️" />
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {GENERAL_ACHIEVEMENTS.map(achievement => {
              const isUnlocked = player.achievements.includes(achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`
                    bg-bg-card rounded-lg p-4 border transition-all
                    ${isUnlocked
                      ? 'border-accent/50'
                      : 'border-white/10 opacity-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {isUnlocked ? '🏆' : '🔒'}
                    </div>

                    <div className="flex-1">
                      <div className="font-bold">{achievement.name}</div>
                      <div className="text-sm text-text-secondary">
                        {achievement.description}
                      </div>
                    </div>

                    {achievement.reward && (
                      <div className="text-sm text-right">
                        <div className="text-text-secondary">보상</div>
                        <div className="text-accent">
                          {achievement.reward.type === 'ITEM' && achievement.reward.itemId && (
                            ITEMS_BY_ID[achievement.reward.itemId]?.name.ko || '아이템'
                          )}
                          {achievement.reward.type === 'EXP' && `EXP +${achievement.reward.amount}`}
                          {achievement.reward.type === 'TITLE' && achievement.reward.title}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'items' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {ALL_ITEMS.map(item => {
              const isUnlocked = player.unlockedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`
                    bg-bg-card rounded-lg p-4 border transition-all
                    ${isUnlocked
                      ? 'border-white/20'
                      : 'border-white/5 opacity-40'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {isUnlocked ? '💎' : '🔒'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <RarityBadge rarity={item.rarity} size="sm" />
                        <span className="font-bold">{item.name.ko}</span>
                      </div>
                      <div className="text-sm text-text-secondary mb-2">
                        {item.description}
                      </div>
                      <div className="text-xs">
                        {Object.entries(item.statBonus).map(([stat, value]) => (
                          <span key={stat} className="mr-2 text-win">
                            {stat.toUpperCase()} +{value}
                          </span>
                        ))}
                      </div>
                      {item.specialEffect && (
                        <div className="text-xs text-accent mt-1">
                          {item.specialEffect.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-bg-card rounded-lg p-4 border border-white/10 text-center"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-text-secondary">{title}</div>
    </motion.div>
  );
}

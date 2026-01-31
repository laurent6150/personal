import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../stores/playerStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { ITEMS_BY_ID, ALL_ITEMS } from '../data/items';
import { EXP_TABLE, STAT_ICONS } from '../data/constants';
import { getLevelProgress, getExpToNextLevel } from '../utils/battleCalculator';
import { Button } from '../components/UI/Button';
import { GradeBadge, AttributeBadge, RarityBadge } from '../components/UI/Badge';
import { StatBar } from '../components/UI/StatBar';
import type { Item } from '../types';

interface CardDetailProps {
  cardId: string;
  onBack: () => void;
}

export function CardDetail({ cardId, onBack }: CardDetailProps) {
  const { player, equipItem, unequipItem } = usePlayerStore();
  const [selectedSlot, setSelectedSlot] = useState<0 | 1 | null>(null);

  const playerCard = player.ownedCards[cardId];
  const character = CHARACTERS_BY_ID[cardId];

  if (!playerCard || !character) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-text-secondary">카드를 찾을 수 없습니다</div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(playerCard.exp, playerCard.level);
  const expToNext = getExpToNextLevel(playerCard.exp, playerCard.level);
  const maxExp = playerCard.level < 10 ? EXP_TABLE[playerCard.level] : playerCard.exp;

  // 레벨업 보너스가 적용된 스탯
  const levelBonus = (playerCard.level - 1) * 2;
  const enhancedStats = {
    ...character.baseStats,
    [character.growthStats.primary]: character.baseStats[character.growthStats.primary] + levelBonus,
    [character.growthStats.secondary]: character.baseStats[character.growthStats.secondary] + levelBonus
  };

  // 장비 보너스 계산
  const equipmentBonus = { atk: 0, def: 0, spd: 0, ce: 0, hp: 0 };
  for (const equipId of playerCard.equipment) {
    if (equipId) {
      const item = ITEMS_BY_ID[equipId];
      if (item) {
        for (const [stat, value] of Object.entries(item.statBonus)) {
          if (stat in equipmentBonus && value !== undefined) {
            equipmentBonus[stat as keyof typeof equipmentBonus] += value;
          }
        }
      }
    }
  }

  // 장착 가능한 아이템 필터링
  const availableItems = ALL_ITEMS.filter(item => {
    // 이미 장착된 아이템 제외
    if (playerCard.equipment.includes(item.id)) return false;
    // 해금된 아이템만
    return player.unlockedItems.includes(item.id);
  });

  const handleEquip = (item: Item) => {
    if (selectedSlot !== null) {
      equipItem(cardId, item.id, selectedSlot);
      setSelectedSlot(null);
    }
  };

  const handleUnequip = (slot: 0 | 1) => {
    unequipItem(cardId, slot);
  };

  const winRate = playerCard.stats.totalWins + playerCard.stats.totalLosses > 0
    ? Math.round((playerCard.stats.totalWins / (playerCard.stats.totalWins + playerCard.stats.totalLosses)) * 100)
    : 0;

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-xl font-bold text-text-primary">{character.name.ko}</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카드 이미지 & 기본 정보 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          {/* 카드 프레임 */}
          <div className={`
            relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4
            bg-gradient-to-br
            ${character.grade === '특급' ? 'from-grade-s/30 to-grade-s/10' : ''}
            ${character.grade === '1급' ? 'from-grade-a/30 to-grade-a/10' : ''}
            ${character.grade === '준1급' ? 'from-grade-b/30 to-grade-b/10' : ''}
            ${character.grade === '2급' ? 'from-grade-c/30 to-grade-c/10' : ''}
          `}>
            <div className="absolute top-4 left-4 flex gap-2">
              <GradeBadge grade={character.grade} />
              <AttributeBadge attribute={character.attribute} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-lg font-bold">{character.name.ko}</div>
              <div className="text-sm text-text-secondary">{character.name.en}</div>
            </div>

            {/* 레벨 배지 */}
            <div className="absolute top-4 right-4 bg-accent px-3 py-1 rounded-full text-sm font-bold">
              Lv.{playerCard.level}
            </div>
          </div>

          {/* 경험치 바 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">경험치</span>
              <span>
                {playerCard.exp} / {maxExp}
                {expToNext > 0 && <span className="text-text-secondary"> (다음 레벨까지 {expToNext})</span>}
              </span>
            </div>
            <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                className="h-full bg-gradient-to-r from-accent to-accent/70"
              />
            </div>
          </div>

          {/* 스킬 정보 */}
          <div className="bg-bg-secondary/50 rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-1">스킬</div>
            <div className="font-bold text-accent">{character.skill.name}</div>
            <div className="text-sm text-text-secondary mt-1">{character.skill.description}</div>
          </div>
        </motion.div>

        {/* 스탯 & 장비 */}
        <div className="space-y-4">
          {/* 스탯 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-bg-card rounded-xl p-6 border border-white/10"
          >
            <h3 className="font-bold mb-4">스탯</h3>
            <div className="space-y-3">
              {(['atk', 'def', 'spd', 'ce', 'hp'] as const).map(stat => {
                const base = character.baseStats[stat];
                const enhanced = enhancedStats[stat];
                const bonus = equipmentBonus[stat];
                const total = enhanced + bonus;
                const isPrimary = character.growthStats.primary === stat;
                const isSecondary = character.growthStats.secondary === stat;

                return (
                  <div key={stat} className="flex items-center gap-3">
                    <span className="w-8 text-lg">{STAT_ICONS[stat]}</span>
                    <span className="w-12 text-sm text-text-secondary uppercase">{stat}</span>
                    <div className="flex-1">
                      <StatBar stat={stat} value={total} maxValue={50} showLabel={false} showIcon={false} />
                    </div>
                    <div className="w-24 text-right text-sm">
                      <span className="font-bold">{total}</span>
                      {(enhanced > base || bonus > 0) && (
                        <span className="text-win ml-1">
                          (+{enhanced - base + bonus})
                        </span>
                      )}
                    </div>
                    {(isPrimary || isSecondary) && (
                      <span className="text-xs text-accent">
                        {isPrimary ? '★' : '☆'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-text-secondary">
              ★ 주성장 스탯 / ☆ 부성장 스탯 (레벨당 +2)
            </div>
          </motion.div>

          {/* 장비 슬롯 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-card rounded-xl p-6 border border-white/10"
          >
            <h3 className="font-bold mb-4">장비</h3>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map(slot => {
                const equipId = playerCard.equipment[slot as 0 | 1];
                const item = equipId ? ITEMS_BY_ID[equipId] : null;

                return (
                  <div
                    key={slot}
                    className={`
                      p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all
                      ${selectedSlot === slot
                        ? 'border-accent bg-accent/10'
                        : item
                          ? 'border-white/20 bg-bg-secondary/50'
                          : 'border-white/10 hover:border-white/30'
                      }
                    `}
                    onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot as 0 | 1)}
                  >
                    {item ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <RarityBadge rarity={item.rarity} size="sm" />
                          <span className="font-bold text-sm">{item.name.ko}</span>
                        </div>
                        <div className="text-xs text-text-secondary mb-2">
                          {Object.entries(item.statBonus).map(([stat, val]) => (
                            <span key={stat} className="mr-2">{stat.toUpperCase()} +{val}</span>
                          ))}
                        </div>
                        {item.specialEffect && (
                          <div className="text-xs text-accent">{item.specialEffect.description}</div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnequip(slot as 0 | 1);
                          }}
                          className="mt-2 text-xs text-lose hover:underline"
                        >
                          해제
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-2xl text-text-secondary mb-1">+</div>
                        <div className="text-xs text-text-secondary">슬롯 {slot + 1}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 장착 가능한 아이템 목록 */}
            <AnimatePresence>
              {selectedSlot !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="text-sm text-text-secondary mb-2">
                    장착 가능한 아이템 ({availableItems.length}개)
                  </div>
                  {availableItems.length === 0 ? (
                    <div className="text-center py-4 text-text-secondary text-sm">
                      해금된 아이템이 없습니다
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleEquip(item)}
                          className="w-full p-3 bg-bg-secondary/50 rounded-lg text-left hover:bg-bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <RarityBadge rarity={item.rarity} size="sm" />
                            <span className="font-bold text-sm">{item.name.ko}</span>
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            {Object.entries(item.statBonus).map(([stat, val]) => (
                              <span key={stat} className="mr-2">{stat.toUpperCase()} +{val}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 전적 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-bg-card rounded-xl p-6 border border-white/10"
          >
            <h3 className="font-bold mb-4">전적</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-win">{playerCard.stats.totalWins}</div>
                <div className="text-xs text-text-secondary">승리</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-lose">{playerCard.stats.totalLosses}</div>
                <div className="text-xs text-text-secondary">패배</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{winRate}%</div>
                <div className="text-xs text-text-secondary">승률</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

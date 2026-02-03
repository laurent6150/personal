// ========================================
// 아이템 페이지
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../stores/playerStore';
import { ALL_ITEMS, ITEMS_BY_RARITY } from '../data/items';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { RarityBadge } from '../components/UI/Badge';
import { RARITY_COLORS, STAT_NAMES, STAT_ICONS } from '../data/constants';
import type { Item, ItemRarity } from '../types';

interface ItemsProps {
  onBack: () => void;
}

type FilterType = 'ALL' | ItemRarity;
type OwnershipFilter = 'all' | 'owned' | 'unowned';

export function Items({ onBack }: ItemsProps) {
  const player = usePlayerStore(state => state.player);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // 필터링된 아이템 목록
  const filteredItems = useMemo(() => {
    let items = filter === 'ALL' ? ALL_ITEMS : ITEMS_BY_RARITY[filter];

    if (ownershipFilter === 'owned') {
      items = items.filter(item => player.unlockedItems.includes(item.id));
    } else if (ownershipFilter === 'unowned') {
      items = items.filter(item => !player.unlockedItems.includes(item.id));
    }

    return items;
  }, [filter, ownershipFilter, player.unlockedItems]);

  // 등급별 개수
  const rarityCount = useMemo(() => ({
    LEGENDARY: ITEMS_BY_RARITY.LEGENDARY.length,
    EPIC: ITEMS_BY_RARITY.EPIC.length,
    RARE: ITEMS_BY_RARITY.RARE.length,
    COMMON: ITEMS_BY_RARITY.COMMON.length
  }), []);

  // 보유 아이템 수
  const ownedCount = player.unlockedItems.length;

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">아이템</h1>
          <div className="text-sm text-text-secondary">
            {ownedCount}/{ALL_ITEMS.length} 보유
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="max-w-4xl mx-auto mb-4 space-y-3">
        {/* 등급 필터 */}
        <div className="flex gap-2 flex-wrap">
          <FilterButton
            active={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
          >
            전체 ({ALL_ITEMS.length})
          </FilterButton>
          <FilterButton
            active={filter === 'LEGENDARY'}
            onClick={() => setFilter('LEGENDARY')}
            color={RARITY_COLORS.LEGENDARY}
          >
            전설 ({rarityCount.LEGENDARY})
          </FilterButton>
          <FilterButton
            active={filter === 'EPIC'}
            onClick={() => setFilter('EPIC')}
            color={RARITY_COLORS.EPIC}
          >
            영웅 ({rarityCount.EPIC})
          </FilterButton>
          <FilterButton
            active={filter === 'RARE'}
            onClick={() => setFilter('RARE')}
            color={RARITY_COLORS.RARE}
          >
            희귀 ({rarityCount.RARE})
          </FilterButton>
          <FilterButton
            active={filter === 'COMMON'}
            onClick={() => setFilter('COMMON')}
            color={RARITY_COLORS.COMMON}
          >
            일반 ({rarityCount.COMMON})
          </FilterButton>
        </div>

        {/* 보유 필터 */}
        <div className="flex gap-2">
          <FilterButton
            active={ownershipFilter === 'all'}
            onClick={() => setOwnershipFilter('all')}
            size="sm"
          >
            전체
          </FilterButton>
          <FilterButton
            active={ownershipFilter === 'owned'}
            onClick={() => setOwnershipFilter('owned')}
            size="sm"
          >
            보유
          </FilterButton>
          <FilterButton
            active={ownershipFilter === 'unowned'}
            onClick={() => setOwnershipFilter('unowned')}
            size="sm"
          >
            미보유
          </FilterButton>
        </div>
      </div>

      {/* 아이템 그리드 */}
      <div className="max-w-4xl mx-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            조건에 맞는 아이템이 없습니다
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
          >
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                isUnlocked={player.unlockedItems.includes(item.id)}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* 아이템 상세 모달 */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            isUnlocked={player.unlockedItems.includes(selectedItem.id)}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// 필터 버튼 컴포넌트
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md';
}

function FilterButton({ active, onClick, children, color, size = 'md' }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        ${size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'}
        rounded-lg font-medium transition-all
        ${active
          ? 'bg-accent text-bg-primary'
          : 'bg-bg-card text-text-secondary hover:text-text-primary border border-white/10'
        }
      `}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {children}
    </button>
  );
}

// 아이템 카드 컴포넌트
interface ItemCardProps {
  item: Item;
  isUnlocked: boolean;
  onClick: () => void;
}

function ItemCard({ item, isUnlocked, onClick }: ItemCardProps) {
  const rarityColor = RARITY_COLORS[item.rarity];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        bg-bg-card rounded-lg p-4 border-2 cursor-pointer transition-all
        ${isUnlocked
          ? 'border-white/20 hover:border-white/40'
          : 'border-white/5 opacity-50'
        }
      `}
      style={{ borderColor: isUnlocked ? `${rarityColor}50` : undefined }}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center text-2xl
            ${isUnlocked ? '' : 'grayscale'}
          `}
          style={{ backgroundColor: `${rarityColor}20` }}
        >
          {isUnlocked ? '💎' : '🔒'}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <RarityBadge rarity={item.rarity} size="sm" />
            <span className="font-bold text-text-primary truncate">{item.name.ko}</span>
          </div>

          <p className="text-xs text-text-secondary mb-2 line-clamp-2">
            {item.description}
          </p>

          {/* 스탯 보너스 */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.statBonus).map(([stat, value]) => (
              <span
                key={stat}
                className="text-xs px-2 py-0.5 rounded bg-win/20 text-win"
              >
                {STAT_ICONS[stat as keyof typeof STAT_ICONS] || ''} {stat.toUpperCase()} +{value}
              </span>
            ))}
          </div>

          {/* 특수 효과 */}
          {item.specialEffect && (
            <div className="text-xs text-accent mt-1">
              {item.specialEffect.description}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// 아이템 상세 모달
interface ItemDetailModalProps {
  item: Item;
  isUnlocked: boolean;
  onClose: () => void;
}

function ItemDetailModal({ item, isUnlocked, onClose }: ItemDetailModalProps) {
  const rarityColor = RARITY_COLORS[item.rarity];

  return (
    <Modal isOpen={true} onClose={onClose} title={item.name.ko}>
      <div className="flex flex-col items-center gap-4">
        {/* 아이콘 */}
        <div
          className={`
            w-24 h-24 rounded-xl flex items-center justify-center text-5xl
            ${isUnlocked ? '' : 'grayscale'}
          `}
          style={{ backgroundColor: `${rarityColor}30`, border: `2px solid ${rarityColor}` }}
        >
          {isUnlocked ? '💎' : '🔒'}
        </div>

        {/* 등급 */}
        <RarityBadge rarity={item.rarity} size="lg" />

        {/* 설명 */}
        <p className="text-center text-text-secondary">
          {item.description}
        </p>

        {/* 스탯 보너스 */}
        <div className="w-full bg-black/30 rounded-lg p-4">
          <h4 className="text-sm text-accent mb-3">스탯 보너스</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(item.statBonus).map(([stat, value]) => (
              <div
                key={stat}
                className="flex items-center justify-between bg-win/10 rounded px-3 py-2"
              >
                <span className="text-text-secondary">
                  {STAT_ICONS[stat as keyof typeof STAT_ICONS] || ''} {STAT_NAMES[stat] || stat.toUpperCase()}
                </span>
                <span className="text-win font-bold">+{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 특수 효과 */}
        {item.specialEffect && (
          <div className="w-full bg-accent/20 rounded-lg p-4 border border-accent/30">
            <h4 className="text-sm text-accent mb-2">특수 효과</h4>
            <p className="text-text-primary">{item.specialEffect.description}</p>
          </div>
        )}

        {/* 해금 조건 */}
        {!isUnlocked && item.unlockCondition && (
          <div className="w-full bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-sm text-text-secondary mb-2">해금 조건</h4>
            <p className="text-text-primary">
              {item.unlockCondition.characterId && item.unlockCondition.characterId !== 'any'
                ? `${item.unlockCondition.characterId} 관련 업적 달성`
                : '업적 달성 시 해금'}
            </p>
          </div>
        )}

        {/* 보유 상태 */}
        <div className={`
          w-full text-center py-2 rounded-lg font-bold
          ${isUnlocked ? 'bg-win/20 text-win' : 'bg-white/5 text-text-secondary'}
        `}>
          {isUnlocked ? '보유 중' : '미보유'}
        </div>

        <Button onClick={onClose} variant="ghost" className="w-full">
          닫기
        </Button>
      </div>
    </Modal>
  );
}

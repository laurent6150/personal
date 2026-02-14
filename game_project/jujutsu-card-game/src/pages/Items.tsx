// ========================================
// 아이템 페이지
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../stores/playerStore';
import { useEconomyStore } from '../stores/economyStore';
import { useSeasonStore } from '../stores/seasonStore';
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
  const { cp, buyItem, inventory } = useEconomyStore();
  const currentSeason = useSeasonStore(state => state.currentSeason);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 아이템 보유 여부 확인 (인벤토리 + 해금된 아이템)
  const isItemOwned = (itemId: string) => {
    return inventory.includes(itemId) || player.unlockedItems.includes(itemId);
  };

  // 필터링된 아이템 목록
  const filteredItems = useMemo(() => {
    let items = filter === 'ALL' ? ALL_ITEMS : ITEMS_BY_RARITY[filter];

    if (ownershipFilter === 'owned') {
      items = items.filter(item => isItemOwned(item.id));
    } else if (ownershipFilter === 'unowned') {
      items = items.filter(item => !isItemOwned(item.id));
    }

    return items;
  }, [filter, ownershipFilter, player.unlockedItems, inventory]);

  // 아이템 구매 핸들러
  const handlePurchase = (item: Item) => {
    const seasonNumber = currentSeason?.number || 1;

    if (isItemOwned(item.id)) {
      setPurchaseMessage({ text: '이미 보유한 아이템입니다.', type: 'error' });
      return;
    }

    if (cp < item.price) {
      setPurchaseMessage({ text: `CP가 부족합니다. (필요: ${item.price} CP, 보유: ${cp} CP)`, type: 'error' });
      return;
    }

    const success = buyItem(item.id, item.price, seasonNumber);
    if (success) {
      setPurchaseMessage({ text: `${item.name.ko}을(를) 구매했습니다!`, type: 'success' });
    } else {
      setPurchaseMessage({ text: '구매에 실패했습니다.', type: 'error' });
    }

    // 3초 후 메시지 제거
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  // 등급별 개수
  const rarityCount = useMemo(() => ({
    LEGENDARY: ITEMS_BY_RARITY.LEGENDARY.length,
    EPIC: ITEMS_BY_RARITY.EPIC.length,
    RARE: ITEMS_BY_RARITY.RARE.length,
    COMMON: ITEMS_BY_RARITY.COMMON.length
  }), []);

  // 보유 아이템 수 (인벤토리 + 해금된 아이템, 중복 제거)
  const ownedCount = useMemo(() => {
    const allOwned = new Set([...inventory, ...player.unlockedItems]);
    return allOwned.size;
  }, [inventory, player.unlockedItems]);

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">아이템</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
              {cp.toLocaleString()} CP
            </div>
            <div className="text-sm text-text-secondary">
              {ownedCount}/{ALL_ITEMS.length} 보유
            </div>
          </div>
        </div>
      </div>

      {/* 구매 메시지 */}
      {purchaseMessage && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className={`
            p-3 rounded-lg text-center text-sm
            ${purchaseMessage.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }
          `}>
            {purchaseMessage.text}
          </div>
        </div>
      )}

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
                isOwned={isItemOwned(item.id)}
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
            isOwned={isItemOwned(selectedItem.id)}
            currentCP={cp}
            onClose={() => setSelectedItem(null)}
            onPurchase={() => handlePurchase(selectedItem)}
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
  isOwned: boolean;
  onClick: () => void;
}

function ItemCard({ item, isOwned, onClick }: ItemCardProps) {
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
        ${isOwned
          ? 'border-white/20 hover:border-white/40'
          : 'border-white/5 hover:border-white/20'
        }
      `}
      style={{ borderColor: isOwned ? `${rarityColor}50` : undefined }}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center text-2xl
            ${isOwned ? '' : 'grayscale-[50%]'}
          `}
          style={{ backgroundColor: `${rarityColor}20` }}
        >
          {isOwned ? '💎' : '🛒'}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <RarityBadge rarity={item.rarity} size="sm" />
              <span className="font-bold text-text-primary truncate">{item.name.ko}</span>
            </div>
            {/* 가격 표시 */}
            {!isOwned && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 whitespace-nowrap">
                {item.price.toLocaleString()} CP
              </span>
            )}
            {isOwned && (
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 whitespace-nowrap">
                보유중
              </span>
            )}
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
  isOwned: boolean;
  currentCP: number;
  onClose: () => void;
  onPurchase: () => void;
}

function ItemDetailModal({ item, isOwned, currentCP, onClose, onPurchase }: ItemDetailModalProps) {
  const rarityColor = RARITY_COLORS[item.rarity];
  const canAfford = currentCP >= item.price;

  return (
    <Modal isOpen={true} onClose={onClose} title={item.name.ko}>
      <div className="flex flex-col items-center gap-4">
        {/* 아이콘 */}
        <div
          className={`
            w-24 h-24 rounded-xl flex items-center justify-center text-5xl
            ${isOwned ? '' : 'grayscale-[30%]'}
          `}
          style={{ backgroundColor: `${rarityColor}30`, border: `2px solid ${rarityColor}` }}
        >
          {isOwned ? '💎' : '🛒'}
        </div>

        {/* 등급 및 가격 */}
        <div className="flex items-center gap-3">
          <RarityBadge rarity={item.rarity} size="lg" />
          <span className="text-lg font-bold text-yellow-400">
            {item.price.toLocaleString()} CP
          </span>
        </div>

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

        {/* 구매 또는 보유 상태 */}
        {isOwned ? (
          <div className="w-full text-center py-3 rounded-lg font-bold bg-green-500/20 text-green-400 border border-green-500/30">
            보유 중
          </div>
        ) : (
          <div className="w-full space-y-2">
            <div className="text-center text-sm text-text-secondary">
              보유 CP: <span className={canAfford ? 'text-green-400' : 'text-red-400'}>{currentCP.toLocaleString()}</span> / 필요: {item.price.toLocaleString()} CP
            </div>
            <Button
              onClick={() => {
                onPurchase();
                if (canAfford) onClose();
              }}
              variant={canAfford ? 'primary' : 'ghost'}
              className={`w-full ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!canAfford}
            >
              {canAfford ? `${item.price.toLocaleString()} CP로 구매` : 'CP 부족'}
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full">
          닫기
        </Button>
      </div>
    </Modal>
  );
}

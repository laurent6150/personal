// ========================================
// 트레이드 화면
// Phase 5: CP 기반 패키지 트레이드 시스템
// 다중 카드 + 아이템 + CP 복합 거래 지원
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { useTradeStore } from '../stores/tradeStore';
import { useEconomyStore } from '../stores/economyStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { ALL_ITEMS, ITEMS_BY_ID } from '../data/items';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { RarityBadge } from '../components/UI/Badge';
import { getCharacterImage, getPlaceholderImage } from '../utils/imageHelper';
import { ATTRIBUTES } from '../data';
import type { AICrew, CharacterCard, TradeOffer } from '../types';

interface TradeProps {
  onBack: () => void;
}

export function Trade({ onBack }: TradeProps) {
  const { currentSeason, playerCrew, currentAICrews } = useSeasonStore(useShallow(state => ({
    currentSeason: state.currentSeason,
    playerCrew: state.playerCrew,
    currentAICrews: state.currentAICrews
  })));
  const player = usePlayerStore(state => state.player);
  const { cp, inventory } = useEconomyStore(useShallow(state => ({
    cp: state.cp,
    inventory: state.inventory
  })));
  const {
    proposeTrade,
    forceTrade,
    getCardCPValue,
    validateTradeBalance,
    getTradeHistory
  } = useTradeStore(useShallow(state => ({
    proposeTrade: state.proposeTrade,
    forceTrade: state.forceTrade,
    getCardCPValue: state.getCardCPValue,
    validateTradeBalance: state.validateTradeBalance,
    getTradeHistory: state.getTradeHistory
  })));

  // 다중 선택 상태
  const [selectedPlayerCards, setSelectedPlayerCards] = useState<Set<string>>(new Set());
  const [selectedTargetCrew, setSelectedTargetCrew] = useState<AICrew | null>(null);
  const [selectedTargetCards, setSelectedTargetCards] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [addedCP, setAddedCP] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [tradeResult, setTradeResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 플레이어 크루 카드 정보
  const playerCards = useMemo(() => {
    return playerCrew.map(id => CHARACTERS_BY_ID[id]).filter(Boolean) as CharacterCard[];
  }, [playerCrew]);

  // 플레이어 소유 아이템
  const playerItems = useMemo(() => {
    const allOwned = new Set([...inventory, ...player.unlockedItems]);
    return ALL_ITEMS.filter(item => allOwned.has(item.id));
  }, [inventory, player.unlockedItems]);

  // 트레이드 히스토리
  const recentTrades = useMemo(() => {
    return getTradeHistory(currentSeason?.number).slice(0, 5);
  }, [getTradeHistory, currentSeason?.number]);

  // 내 패키지 가치 계산
  const myPackageValue = useMemo(() => {
    let total = addedCP;
    selectedPlayerCards.forEach(cardId => {
      total += getCardCPValue(cardId);
    });
    selectedItems.forEach(itemId => {
      const item = ITEMS_BY_ID[itemId];
      if (item) total += item.price;
    });
    return total;
  }, [selectedPlayerCards, selectedItems, addedCP, getCardCPValue]);

  // 상대 패키지 가치 계산
  const targetPackageValue = useMemo(() => {
    let total = 0;
    selectedTargetCards.forEach(cardId => {
      total += getCardCPValue(cardId);
    });
    return total;
  }, [selectedTargetCards, getCardCPValue]);

  // 트레이드 밸런스 계산
  const tradeBalance = useMemo(() => {
    if (selectedPlayerCards.size === 0 && selectedItems.size === 0 && addedCP === 0) {
      return { valid: true, proposerValue: 0, targetValue: 0, difference: 0, differencePercent: 0 };
    }
    if (selectedTargetCards.size === 0) {
      return { valid: true, proposerValue: myPackageValue, targetValue: 0, difference: myPackageValue, differencePercent: 100 };
    }
    return validateTradeBalance(
      { cards: Array.from(selectedPlayerCards), cp: addedCP, items: Array.from(selectedItems), draftPicks: [] },
      { cards: Array.from(selectedTargetCards), cp: 0, items: [], draftPicks: [] }
    );
  }, [selectedPlayerCards, selectedTargetCards, selectedItems, addedCP, validateTradeBalance, myPackageValue]);

  // 트레이드 가능 여부
  const canTrade = (selectedPlayerCards.size > 0 || selectedItems.size > 0 || addedCP > 0) &&
                   selectedTargetCrew &&
                   selectedTargetCards.size > 0;
  const isValidTrade = tradeBalance.differencePercent <= 20;

  // 카드 선택 토글 (플레이어)
  const togglePlayerCard = (cardId: string) => {
    setSelectedPlayerCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // 카드 선택 토글 (상대)
  const toggleTargetCard = (cardId: string) => {
    setSelectedTargetCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // 아이템 선택 토글
  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // 트레이드 제안 (첫 번째 카드 기준으로 레거시 API 사용)
  const handleProposeTrade = () => {
    if (!canTrade || !currentSeason || !selectedTargetCrew) return;

    const playerCardArray = Array.from(selectedPlayerCards);
    const targetCardArray = Array.from(selectedTargetCards);

    // 레거시 API는 1:1 교환만 지원하므로 첫 번째 카드 사용
    const result = proposeTrade({
      seasonNumber: currentSeason.number,
      targetCrewId: selectedTargetCrew.id,
      offeredCardId: playerCardArray[0] || '',
      requestedCardId: targetCardArray[0] || '',
      playerCrew,
      targetCrew: selectedTargetCrew
    });

    if (result.shouldAccept) {
      setTradeResult({
        success: true,
        message: `트레이드 성공! ${result.reason === 'GOOD_DEAL' ? '좋은 거래였습니다!' : '공정한 거래였습니다.'}`
      });
    } else {
      const reasonMessages: Record<string, string> = {
        'POINT_DIFF_TOO_HIGH': 'CP 가치 차이가 너무 큽니다.',
        'NEED_THIS_CARD': '상대가 해당 카드를 필요로 합니다.',
        'GRADE_LIMIT': '등급 제한을 초과합니다.',
        'NOT_INTERESTED': '상대가 관심이 없습니다.'
      };
      setTradeResult({
        success: false,
        message: reasonMessages[result.reason] || '트레이드가 거절되었습니다.'
      });
    }

    setShowConfirmModal(false);
  };

  // 강제 트레이드
  const handleForceTrade = () => {
    if (!canTrade || !currentSeason || !selectedTargetCrew) return;

    const playerCardArray = Array.from(selectedPlayerCards);
    const targetCardArray = Array.from(selectedTargetCards);

    forceTrade({
      seasonNumber: currentSeason.number,
      targetCrewId: selectedTargetCrew.id,
      offeredCardId: playerCardArray[0] || '',
      requestedCardId: targetCardArray[0] || ''
    });

    setTradeResult({
      success: true,
      message: '강제 트레이드가 완료되었습니다!'
    });

    setShowConfirmModal(false);
  };

  // 선택 초기화
  const resetSelection = () => {
    setSelectedPlayerCards(new Set());
    setSelectedTargetCrew(null);
    setSelectedTargetCards(new Set());
    setSelectedItems(new Set());
    setAddedCP(0);
    setTradeResult(null);
  };

  // CP 포맷팅
  const formatCP = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // 배경 이미지 스타일
  const bgStyle = {
    backgroundImage: 'url(/images/backgrounds/menu_bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    <div className="min-h-screen p-4" style={bgStyle}>
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-black/40 rounded-xl p-4 backdrop-blur-sm">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-accent text-shadow-strong">🔄 트레이드</h1>
          <div className="text-sm text-text-secondary">
            보유 CP: <span className="text-accent font-bold">{formatCP(cp)}</span>
          </div>
        </div>
      </div>

      {/* 트레이드 규칙 안내 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-bg-card rounded-xl p-3 border border-white/10">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-accent/20 text-accent">
              CP 가치 ±20% 이내
            </span>
            <span className="px-2 py-1 rounded bg-white/10 text-text-secondary">
              다중 카드 선택 가능
            </span>
            <span className="px-2 py-1 rounded bg-white/10 text-text-secondary">
              카드 + 아이템 + CP 조합 가능
            </span>
          </div>
        </div>
      </div>

      {/* 메인 트레이드 패널 */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-4 mb-4">
        {/* 내 패키지 */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-text-primary">내가 주는 것</h3>
            <span className="text-sm text-accent font-bold">{formatCP(myPackageValue)} CP</span>
          </div>

          {/* 내 크루 카드 */}
          <div className="mb-3">
            <div className="text-xs text-text-secondary mb-2">카드 ({selectedPlayerCards.size}개 선택)</div>
            <div className="grid grid-cols-6 gap-1">
              {playerCards.map(card => (
                <MiniTradeCard
                  key={card.id}
                  card={card}
                  cpValue={getCardCPValue(card.id)}
                  isSelected={selectedPlayerCards.has(card.id)}
                  onClick={() => togglePlayerCard(card.id)}
                />
              ))}
            </div>
          </div>

          {/* 아이템 추가 버튼 */}
          <div className="mb-3">
            <div className="text-xs text-text-secondary mb-2">아이템 ({selectedItems.size}개 선택)</div>
            <Button
              onClick={() => setShowItemModal(true)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              + 아이템 추가
            </Button>
            {selectedItems.size > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from(selectedItems).map(itemId => {
                  const item = ITEMS_BY_ID[itemId];
                  return item ? (
                    <span
                      key={itemId}
                      onClick={() => toggleItem(itemId)}
                      className="px-2 py-1 bg-accent/20 rounded text-xs cursor-pointer hover:bg-accent/40"
                    >
                      {item.name.ko} ✕
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* CP 추가 */}
          <div>
            <div className="text-xs text-text-secondary mb-2">추가 CP</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={addedCP}
                onChange={(e) => setAddedCP(Math.max(0, Math.min(cp, parseInt(e.target.value) || 0)))}
                className="flex-1 px-3 py-2 bg-black/30 rounded border border-white/10 text-sm"
                min={0}
                max={cp}
                step={100}
              />
              <Button
                onClick={() => setAddedCP(0)}
                variant="ghost"
                size="sm"
              >
                초기화
              </Button>
            </div>
          </div>
        </div>

        {/* 교환 표시 */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl mb-4">↔️</div>

          {/* 밸런스 표시 */}
          {canTrade && (
            <div className={`text-center px-4 py-3 rounded-lg ${
              isValidTrade ? 'bg-win/20 text-win' : 'bg-lose/20 text-lose'
            }`}>
              <div className="text-xs mb-1">가치 차이</div>
              <div className="text-2xl font-bold">
                {tradeBalance.differencePercent.toFixed(1)}%
              </div>
              <div className="text-xs">
                {isValidTrade ? '적합 (±20%)' : '부적합'}
              </div>
            </div>
          )}

          {/* 버튼들 */}
          {canTrade && (
            <div className="mt-4 space-y-2 w-full px-4">
              <Button
                onClick={() => setShowConfirmModal(true)}
                variant="primary"
                className="w-full"
                disabled={!isValidTrade}
              >
                트레이드 제안
              </Button>
              <Button
                onClick={handleForceTrade}
                variant="secondary"
                className="w-full"
              >
                ⚡ 강제 트레이드
              </Button>
              <Button onClick={resetSelection} variant="ghost" className="w-full">
                초기화
              </Button>
            </div>
          )}
        </div>

        {/* 상대 패키지 */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-text-primary">내가 받는 것</h3>
            <span className="text-sm text-accent font-bold">{formatCP(targetPackageValue)} CP</span>
          </div>

          {/* 크루 선택 */}
          <div className="mb-3">
            <div className="text-xs text-text-secondary mb-2">상대 크루</div>
            <select
              value={selectedTargetCrew?.id || ''}
              onChange={(e) => {
                const crew = currentAICrews.find(c => c.id === e.target.value);
                setSelectedTargetCrew(crew || null);
                setSelectedTargetCards(new Set());
              }}
              className="w-full px-3 py-2 bg-black/30 rounded border border-white/10 text-sm"
            >
              <option value="">크루 선택...</option>
              {currentAICrews.map(crew => (
                <option key={crew.id} value={crew.id}>{crew.name}</option>
              ))}
            </select>
          </div>

          {/* 상대 크루 카드 */}
          {selectedTargetCrew && (
            <div>
              <div className="text-xs text-text-secondary mb-2">카드 ({selectedTargetCards.size}개 선택)</div>
              <div className="grid grid-cols-6 gap-1">
                {selectedTargetCrew.crew.map(cardId => {
                  const card = CHARACTERS_BY_ID[cardId];
                  if (!card) return null;
                  return (
                    <MiniTradeCard
                      key={cardId}
                      card={card}
                      cpValue={getCardCPValue(cardId)}
                      isSelected={selectedTargetCards.has(cardId)}
                      onClick={() => toggleTargetCard(cardId)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 선택된 패키지 요약 */}
      {canTrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-4"
        >
          <div className="bg-bg-card rounded-xl p-4 border border-white/10">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 내가 주는 것 요약 */}
              <div>
                <div className="text-sm text-text-secondary mb-2">📤 내가 주는 것</div>
                <div className="space-y-1 text-sm">
                  {Array.from(selectedPlayerCards).map(cardId => (
                    <div key={cardId} className="flex justify-between">
                      <span>{CHARACTERS_BY_ID[cardId]?.name.ko}</span>
                      <span className="text-text-secondary">{formatCP(getCardCPValue(cardId))} CP</span>
                    </div>
                  ))}
                  {Array.from(selectedItems).map(itemId => {
                    const item = ITEMS_BY_ID[itemId];
                    return item ? (
                      <div key={itemId} className="flex justify-between text-yellow-400">
                        <span>🎁 {item.name.ko}</span>
                        <span>{formatCP(item.price)} CP</span>
                      </div>
                    ) : null;
                  })}
                  {addedCP > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>💰 CP</span>
                      <span>{formatCP(addedCP)} CP</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-1 font-bold flex justify-between">
                    <span>합계</span>
                    <span className="text-accent">{formatCP(myPackageValue)} CP</span>
                  </div>
                </div>
              </div>

              {/* 내가 받는 것 요약 */}
              <div>
                <div className="text-sm text-text-secondary mb-2">📥 내가 받는 것</div>
                <div className="space-y-1 text-sm">
                  {Array.from(selectedTargetCards).map(cardId => (
                    <div key={cardId} className="flex justify-between">
                      <span>{CHARACTERS_BY_ID[cardId]?.name.ko}</span>
                      <span className="text-text-secondary">{formatCP(getCardCPValue(cardId))} CP</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-1 font-bold flex justify-between">
                    <span>합계</span>
                    <span className="text-accent">{formatCP(targetPackageValue)} CP</span>
                  </div>
                </div>
              </div>
            </div>

            {!isValidTrade && (
              <div className="mt-3 text-sm text-lose text-center">
                가치 차이가 ±20%를 초과합니다. CP를 추가하거나 강제 트레이드를 사용하세요.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 트레이드 결과 */}
      <AnimatePresence>
        {tradeResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto mb-4"
          >
            <div className={`p-4 rounded-xl ${
              tradeResult.success
                ? 'bg-win/20 border border-win/50'
                : 'bg-lose/20 border border-lose/50'
            }`}>
              <div className={`text-lg font-bold ${
                tradeResult.success ? 'text-win' : 'text-lose'
              }`}>
                {tradeResult.success ? '✅ 성공!' : '❌ 실패'}
              </div>
              <div className="text-text-secondary">{tradeResult.message}</div>
              <Button
                onClick={resetSelection}
                variant="ghost"
                size="sm"
                className="mt-2"
              >
                새 트레이드 시작
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 최근 트레이드 히스토리 */}
      {recentTrades.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-bg-card rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              최근 트레이드
            </h3>
            <div className="space-y-2">
              {recentTrades.map(trade => (
                <TradeHistoryItem key={trade.id} trade={trade} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 확인 모달 */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="트레이드 확인"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            이 트레이드를 제안하시겠습니까?
            <br />
            상대방이 거절할 수 있습니다.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleProposeTrade} variant="primary" className="flex-1">
              제안
            </Button>
            <Button onClick={() => setShowConfirmModal(false)} variant="ghost" className="flex-1">
              취소
            </Button>
          </div>
        </div>
      </Modal>

      {/* 아이템 선택 모달 */}
      <Modal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        title="아이템 선택"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {playerItems.length === 0 ? (
            <div className="text-center text-text-secondary py-4">
              보유한 아이템이 없습니다.
            </div>
          ) : (
            playerItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedItems.has(item.id)
                    ? 'bg-accent/20 border border-accent'
                    : 'bg-black/20 hover:bg-black/40 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RarityBadge rarity={item.rarity} size="sm" />
                    <span className="font-bold">{item.name.ko}</span>
                  </div>
                  <span className="text-sm text-accent">{formatCP(item.price)} CP</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  {Object.entries(item.statBonus).map(([stat, val]) => (
                    <span key={stat} className="mr-2">{stat.toUpperCase()} +{val}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <Button onClick={() => setShowItemModal(false)} variant="primary" className="w-full mt-4">
          완료
        </Button>
      </Modal>
    </div>
  );
}

// 미니 트레이드 카드 컴포넌트
interface MiniTradeCardProps {
  card: CharacterCard;
  cpValue: number;
  isSelected: boolean;
  onClick: () => void;
}

function MiniTradeCard({ card, cpValue, isSelected, onClick }: MiniTradeCardProps) {
  const [imageError, setImageError] = useState(false);
  const attrInfo = ATTRIBUTES[card.attribute];

  const formatCP = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const imageUrl = imageError
    ? getPlaceholderImage(card.name.ko, card.attribute)
    : getCharacterImage(card.id, card.name.ko, card.attribute);

  return (
    <div
      onClick={onClick}
      className={`
        aspect-[3/4] rounded cursor-pointer transition-all overflow-hidden
        flex flex-col
        ${isSelected
          ? 'ring-2 ring-accent scale-105 z-10'
          : 'border border-white/10 hover:border-accent/50 opacity-70 hover:opacity-100'
        }
      `}
    >
      <div className="flex-1 relative overflow-hidden bg-black/20">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm">{attrInfo.icon}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={card.name.ko}
            className="w-full h-full object-cover object-top"
            onError={() => setImageError(true)}
          />
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-accent/30 flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
        )}
      </div>
      <div className="p-0.5 bg-black/60 text-center">
        <div className="text-[8px] font-bold truncate">{card.name.ko}</div>
        <div className="text-[7px] text-accent">{formatCP(cpValue)}</div>
      </div>
    </div>
  );
}

// 트레이드 히스토리 아이템
interface TradeHistoryItemProps {
  trade: TradeOffer;
}

function TradeHistoryItem({ trade }: TradeHistoryItemProps) {
  const offeredCard = CHARACTERS_BY_ID[trade.offeredCardId];
  const requestedCard = CHARACTERS_BY_ID[trade.requestedCardId];

  const isPlayerTrade = trade.proposerCrewId === PLAYER_CREW_ID;

  return (
    <div className="flex items-center gap-3 p-2 bg-black/20 rounded-lg text-sm">
      <div className={`w-2 h-2 rounded-full ${
        trade.status === 'ACCEPTED' ? 'bg-win' : 'bg-lose'
      }`} />
      <div className="flex-1">
        <span className={isPlayerTrade ? 'text-accent' : 'text-text-secondary'}>
          {offeredCard?.name.ko}
        </span>
        <span className="text-text-secondary mx-2">↔️</span>
        <span className="text-text-primary">{requestedCard?.name.ko}</span>
      </div>
      <div className="text-xs text-text-secondary">
        {trade.isForced && <span className="text-yellow-400 mr-1">⚡</span>}
        {trade.status === 'ACCEPTED' ? '성사' : '거절'}
      </div>
    </div>
  );
}

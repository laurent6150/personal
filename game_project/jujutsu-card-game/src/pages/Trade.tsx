// ========================================
// 트레이드 화면
// Phase 5: CP 기반 트레이드 시스템
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { useTradeStore } from '../stores/tradeStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { GradeBadge } from '../components/UI/Badge';
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

  const [selectedPlayerCard, setSelectedPlayerCard] = useState<string | null>(null);
  const [selectedTargetCrew, setSelectedTargetCrew] = useState<AICrew | null>(null);
  const [selectedTargetCard, setSelectedTargetCard] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tradeResult, setTradeResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 플레이어 크루 카드 정보
  const playerCards = useMemo(() => {
    return playerCrew.map(id => CHARACTERS_BY_ID[id]).filter(Boolean) as CharacterCard[];
  }, [playerCrew]);

  // 트레이드 히스토리
  const recentTrades = useMemo(() => {
    return getTradeHistory(currentSeason?.number).slice(0, 5);
  }, [getTradeHistory, currentSeason?.number]);

  // CP 가치 차이 계산
  const tradeBalance = useMemo(() => {
    if (!selectedPlayerCard || !selectedTargetCard) {
      return { valid: true, proposerValue: 0, targetValue: 0, difference: 0, differencePercent: 0 };
    }
    return validateTradeBalance(
      { cards: [selectedPlayerCard], cp: 0, items: [], draftPicks: [] },
      { cards: [selectedTargetCard], cp: 0, items: [], draftPicks: [] }
    );
  }, [selectedPlayerCard, selectedTargetCard, validateTradeBalance]);

  // 트레이드 가능 여부 (±20% 이내)
  const canTrade = selectedPlayerCard && selectedTargetCrew && selectedTargetCard;
  const isValidTrade = tradeBalance.differencePercent <= 20;

  // 트레이드 제안
  const handleProposeTrade = () => {
    if (!canTrade || !currentSeason) return;

    const result = proposeTrade({
      seasonNumber: currentSeason.number,
      targetCrewId: selectedTargetCrew.id,
      offeredCardId: selectedPlayerCard,
      requestedCardId: selectedTargetCard,
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
    if (!canTrade || !currentSeason) return;

    forceTrade({
      seasonNumber: currentSeason.number,
      targetCrewId: selectedTargetCrew.id,
      offeredCardId: selectedPlayerCard,
      requestedCardId: selectedTargetCard
    });

    setTradeResult({
      success: true,
      message: '강제 트레이드가 완료되었습니다!'
    });

    setShowConfirmModal(false);
  };

  // 선택 초기화
  const resetSelection = () => {
    setSelectedPlayerCard(null);
    setSelectedTargetCrew(null);
    setSelectedTargetCard(null);
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
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 rounded-xl p-4 backdrop-blur-sm">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-accent text-shadow-strong">🔄 트레이드</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Phase 5: 트레이드 안내 (CP 기반) */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <h3 className="text-sm text-text-secondary mb-2">트레이드 규칙</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-accent/20 text-accent">
              CP 가치 ±20% 이내
            </span>
            <span className="px-2 py-1 rounded bg-white/10 text-text-secondary">
              샐러리캡 준수 필요
            </span>
            <span className="px-2 py-1 rounded bg-white/10 text-text-secondary">
              강제 트레이드 가능
            </span>
          </div>
        </div>
      </div>

      {/* 트레이드 패널 */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-6">
        {/* 내 크루 */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            내 크루 ({player.name})
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {playerCards.map(card => (
              <TradeCard
                key={card.id}
                card={card}
                cpValue={getCardCPValue(card.id)}
                isSelected={selectedPlayerCard === card.id}
                onClick={() => setSelectedPlayerCard(
                  selectedPlayerCard === card.id ? null : card.id
                )}
              />
            ))}
          </div>
          {selectedPlayerCard && (
            <div className="mt-4 p-3 bg-accent/20 rounded-lg">
              <div className="text-sm text-accent">
                내보낼 카드: {CHARACTERS_BY_ID[selectedPlayerCard]?.name.ko}
                <span className="ml-2 text-xs">
                  ({formatCP(getCardCPValue(selectedPlayerCard))} CP)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 상대 크루 선택 */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            상대 크루 선택
          </h3>

          {/* 크루 목록 */}
          <div className="space-y-2 mb-4">
            {currentAICrews.map(crew => (
              <button
                key={crew.id}
                onClick={() => {
                  setSelectedTargetCrew(
                    selectedTargetCrew?.id === crew.id ? null : crew
                  );
                  setSelectedTargetCard(null);
                }}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedTargetCrew?.id === crew.id
                    ? 'bg-accent/20 border border-accent'
                    : 'bg-black/20 hover:bg-black/40'
                }`}
              >
                <div className="font-bold">{crew.name}</div>
                <div className="text-xs text-text-secondary">
                  {crew.crew.map(id => CHARACTERS_BY_ID[id]?.name.ko).join(', ')}
                </div>
              </button>
            ))}
          </div>

          {/* 상대 카드 선택 */}
          {selectedTargetCrew && (
            <>
              <h4 className="text-sm text-text-secondary mb-2">
                받을 카드 선택
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {selectedTargetCrew.crew.map(cardId => {
                  const card = CHARACTERS_BY_ID[cardId];
                  if (!card) return null;
                  return (
                    <TradeCard
                      key={cardId}
                      card={card}
                      cpValue={getCardCPValue(cardId)}
                      isSelected={selectedTargetCard === cardId}
                      onClick={() => setSelectedTargetCard(
                        selectedTargetCard === cardId ? null : cardId
                      )}
                    />
                  );
                })}
              </div>
              {selectedTargetCard && (
                <div className="mt-4 p-3 bg-accent/20 rounded-lg">
                  <div className="text-sm text-accent">
                    받을 카드: {CHARACTERS_BY_ID[selectedTargetCard]?.name.ko}
                    <span className="ml-2 text-xs">
                      ({formatCP(getCardCPValue(selectedTargetCard))} CP)
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 트레이드 요약 및 버튼 */}
      {canTrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto mb-6"
        >
          <div className="bg-bg-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* 내보낼 카드 */}
                <div className="text-center">
                  <div className="text-xs text-text-secondary mb-1">내보냄</div>
                  <div className="text-lg font-bold">
                    {CHARACTERS_BY_ID[selectedPlayerCard]?.name.ko}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {formatCP(tradeBalance.proposerValue)} CP
                  </div>
                </div>

                <div className="text-2xl">↔️</div>

                {/* 받을 카드 */}
                <div className="text-center">
                  <div className="text-xs text-text-secondary mb-1">받음</div>
                  <div className="text-lg font-bold">
                    {CHARACTERS_BY_ID[selectedTargetCard]?.name.ko}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {formatCP(tradeBalance.targetValue)} CP
                  </div>
                </div>
              </div>

              {/* 가치 차이 */}
              <div className={`text-center px-4 py-2 rounded-lg ${
                isValidTrade ? 'bg-win/20 text-win' : 'bg-lose/20 text-lose'
              }`}>
                <div className="text-xs">가치 차이</div>
                <div className="text-xl font-bold">
                  {tradeBalance.differencePercent.toFixed(1)}%
                </div>
                <div className="text-xs">
                  {isValidTrade ? '적합 (±20%)' : '부적합'}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmModal(true)}
                variant="primary"
                className="flex-1"
                disabled={!isValidTrade}
              >
                트레이드 제안
              </Button>
              <Button
                onClick={handleForceTrade}
                variant="secondary"
                className="flex-1"
              >
                ⚡ 강제 트레이드
              </Button>
              <Button onClick={resetSelection} variant="ghost">
                취소
              </Button>
            </div>

            {!isValidTrade && (
              <div className="mt-3 text-sm text-lose text-center">
                가치 차이가 ±20%를 초과하여 일반 트레이드가 불가능합니다.
                강제 트레이드를 사용해주세요.
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
            className="max-w-5xl mx-auto mb-6"
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
        <div className="max-w-5xl mx-auto">
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
    </div>
  );
}

// 트레이드 카드 컴포넌트
interface TradeCardProps {
  card: CharacterCard;
  cpValue: number;
  isSelected: boolean;
  onClick: () => void;
}

function TradeCard({ card, cpValue, isSelected, onClick }: TradeCardProps) {
  const [imageError, setImageError] = useState(false);
  const attrInfo = ATTRIBUTES[card.attribute];

  // CP 포맷팅
  const formatCP = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // 이미지 URL (실제 이미지 또는 폴백)
  const imageUrl = imageError
    ? getPlaceholderImage(card.name.ko, card.attribute)
    : getCharacterImage(card.id, card.name.ko, card.attribute);

  return (
    <div
      onClick={onClick}
      className={`
        aspect-[3/4] rounded-lg cursor-pointer transition-all overflow-hidden
        flex flex-col
        ${isSelected
          ? 'border-2 border-accent scale-105'
          : 'border border-white/10 hover:border-accent/50'
        }
      `}
    >
      {/* 이미지 영역 */}
      <div className="flex-1 relative overflow-hidden bg-black/20">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl">{attrInfo.icon}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={card.name.ko}
            className="w-full h-full object-cover object-top"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      {/* 정보 영역 */}
      <div className="p-1 bg-black/40 text-center">
        <GradeBadge grade={card.grade} size="sm" />
        <div className="text-xs font-bold mt-0.5 truncate">{card.name.ko}</div>
        <div className="text-[10px] text-text-secondary">
          {formatCP(cpValue)} CP
        </div>
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

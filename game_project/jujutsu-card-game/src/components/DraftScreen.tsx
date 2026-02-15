// ========================================
// 드래프트 화면 (Phase 5D)
// NBA 스타일 역순위 드래프트
// ========================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useDraftStore } from '../stores/draftStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { PLAYER_CREW_ID, AI_CREWS_BY_ID } from '../data/aiCrews';
import { Button } from './UI/Button';
import { GradeBadge } from './UI/Badge';
import { getCharacterImage, getPlaceholderImage } from '../utils/imageHelper';
import { ATTRIBUTES } from '../data/constants';
import type { CharacterCard, LegacyGrade } from '../types';

interface DraftScreenProps {
  onComplete: () => void;
  standings: Array<{ crewId: string; points: number; goalDifference: number }>;
  seasonNumber: number;
}

export function DraftScreen({ onComplete, standings, seasonNumber }: DraftScreenProps) {
  const {
    draftPool,
    isDraftInProgress,
    currentPickIndex,
    draftOrder,
    startDraft,
    makePlayerPick,
    makeAIPick,
    finishDraft,
  } = useDraftStore(useShallow(state => ({
    draftPool: state.draftPool,
    isDraftInProgress: state.isDraftInProgress,
    currentPickIndex: state.currentPickIndex,
    draftOrder: state.draftOrder,
    startDraft: state.startDraft,
    makePlayerPick: state.makePlayerPick,
    makeAIPick: state.makeAIPick,
    finishDraft: state.finishDraft,
  })));

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [aiPickingAnimation, setAiPickingAnimation] = useState(false);
  const [lastPickedCard, setLastPickedCard] = useState<{ crewId: string; cardId: string } | null>(null);
  const [draftComplete, setDraftComplete] = useState(false);

  // 현재 픽하는 크루
  const currentCrewId = draftOrder[currentPickIndex] || null;
  const isPlayerTurn = currentCrewId === PLAYER_CREW_ID;

  // 드래프트 풀 카드 정보
  const poolCards = useMemo(() => {
    return draftPool
      .map(poolCard => ({
        ...poolCard,
        character: CHARACTERS_BY_ID[poolCard.cardId],
      }))
      .filter(item => item.character)
      .sort((a, b) => {
        // 등급 순으로 정렬
        const gradeOrder: LegacyGrade[] = ['특급', '준특급', '1급', '준1급', '2급', '준2급', '3급'];
        const aIndex = gradeOrder.indexOf(a.character!.grade as LegacyGrade);
        const bIndex = gradeOrder.indexOf(b.character!.grade as LegacyGrade);
        return aIndex - bIndex;
      });
  }, [draftPool]);

  // 드래프트 시작
  useEffect(() => {
    if (!isDraftInProgress && draftPool.length > 0) {
      startDraft(seasonNumber, standings);
    }
  }, [isDraftInProgress, draftPool.length, seasonNumber, standings, startDraft]);

  // AI 턴 자동 처리
  useEffect(() => {
    if (!isDraftInProgress || isPlayerTurn || aiPickingAnimation || draftComplete) return;
    if (currentPickIndex >= draftOrder.length) {
      setDraftComplete(true);
      return;
    }

    // AI 픽 애니메이션
    setAiPickingAnimation(true);
    const timer = setTimeout(() => {
      const pickedCardId = makeAIPick(currentCrewId!);
      if (pickedCardId) {
        setLastPickedCard({ crewId: currentCrewId!, cardId: pickedCardId });
      }
      setAiPickingAnimation(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isDraftInProgress, isPlayerTurn, currentPickIndex, draftOrder, currentCrewId, aiPickingAnimation, draftComplete, makeAIPick]);

  // 드래프트 완료 체크
  useEffect(() => {
    if (currentPickIndex >= draftOrder.length && draftOrder.length > 0 && !draftComplete) {
      setDraftComplete(true);
    }
  }, [currentPickIndex, draftOrder.length, draftComplete]);

  // 플레이어 픽 처리
  const handlePlayerPick = useCallback(() => {
    if (!selectedCard || !isPlayerTurn) return;
    makePlayerPick(selectedCard);
    setLastPickedCard({ crewId: PLAYER_CREW_ID, cardId: selectedCard });
    setSelectedCard(null);
  }, [selectedCard, isPlayerTurn, makePlayerPick]);

  // 드래프트 종료
  const handleFinishDraft = useCallback(() => {
    finishDraft();
    onComplete();
  }, [finishDraft, onComplete]);

  // 크루 이름 가져오기
  const getCrewName = (crewId: string) => {
    if (crewId === PLAYER_CREW_ID) return '내 크루';
    return AI_CREWS_BY_ID[crewId]?.name || crewId;
  };

  // 배경 스타일
  const bgStyle = {
    backgroundImage: 'url(/images/backgrounds/menu_bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="min-h-screen p-4" style={bgStyle}>
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-black/60 rounded-xl p-4 backdrop-blur-sm border border-accent/30">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-accent">
              🎯 시즌 {seasonNumber} 드래프트
            </h1>
            <div className="text-text-secondary">
              가용 카드: {poolCards.length}장
            </div>
          </div>
        </div>
      </div>

      {/* 드래프트 순서 표시 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <h3 className="text-sm text-text-secondary mb-3">드래프트 순서 (역순위)</h3>
          <div className="flex flex-wrap gap-2">
            {draftOrder.map((crewId, index) => (
              <div
                key={crewId}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  index === currentPickIndex
                    ? 'bg-accent text-white font-bold scale-110'
                    : index < currentPickIndex
                    ? 'bg-white/10 text-text-secondary line-through'
                    : 'bg-white/5 text-text-primary'
                }`}
              >
                {index + 1}. {getCrewName(crewId)}
                {crewId === PLAYER_CREW_ID && ' ⭐'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 현재 턴 표시 */}
      <div className="max-w-6xl mx-auto mb-6">
        <AnimatePresence mode="wait">
          {!draftComplete && currentCrewId && (
            <motion.div
              key={currentPickIndex}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`p-6 rounded-xl text-center ${
                isPlayerTurn
                  ? 'bg-accent/20 border-2 border-accent'
                  : 'bg-blue-500/20 border border-blue-500/50'
              }`}
            >
              {isPlayerTurn ? (
                <>
                  <div className="text-2xl font-bold text-accent mb-2">
                    🎯 당신의 차례입니다!
                  </div>
                  <div className="text-text-secondary">
                    아래에서 카드를 선택하세요 ({currentPickIndex + 1}순위 픽)
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-blue-400 mb-2">
                    {aiPickingAnimation ? '🤔' : '⏳'} {getCrewName(currentCrewId)}의 차례
                  </div>
                  {aiPickingAnimation && (
                    <div className="text-text-secondary animate-pulse">
                      카드를 선택하는 중...
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {draftComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-xl text-center bg-win/20 border-2 border-win"
            >
              <div className="text-2xl font-bold text-win mb-2">
                🎉 드래프트 완료!
              </div>
              <div className="text-text-secondary mb-4">
                모든 팀이 선택을 완료했습니다.
              </div>
              <Button onClick={handleFinishDraft} variant="primary" size="lg">
                시즌 시작하기
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 마지막 픽 알림 */}
      <AnimatePresence>
        {lastPickedCard && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-6xl mx-auto mb-6"
          >
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 flex items-center gap-4">
              <div className="text-2xl">📢</div>
              <div>
                <span className="font-bold text-blue-400">
                  {getCrewName(lastPickedCard.crewId)}
                </span>
                <span className="text-text-secondary">이(가) </span>
                <span className="font-bold text-text-primary">
                  {CHARACTERS_BY_ID[lastPickedCard.cardId]?.name.ko}
                </span>
                <span className="text-text-secondary">을(를) 선택했습니다!</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 드래프트 풀 */}
      {!draftComplete && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-bg-card rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              드래프트 풀
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {poolCards.map(({ cardId, character }) => (
                <DraftCard
                  key={cardId}
                  cardId={cardId}
                  character={character!}
                  isSelected={selectedCard === cardId}
                  isSelectable={isPlayerTurn && !aiPickingAnimation}
                  onClick={() => isPlayerTurn && !aiPickingAnimation && setSelectedCard(cardId)}
                />
              ))}
            </div>

            {/* 플레이어 픽 버튼 */}
            {isPlayerTurn && selectedCard && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-center"
              >
                <Button
                  onClick={handlePlayerPick}
                  variant="primary"
                  size="lg"
                  className="px-8"
                >
                  {CHARACTERS_BY_ID[selectedCard]?.name.ko} 선택하기
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 드래프트 카드 컴포넌트
interface DraftCardProps {
  cardId: string;
  character: CharacterCard;
  isSelected: boolean;
  isSelectable: boolean;
  onClick: () => void;
}

function DraftCard({ cardId, character, isSelected, isSelectable, onClick }: DraftCardProps) {
  const [imageError, setImageError] = useState(false);
  const attrInfo = ATTRIBUTES[character.attribute];

  const imageUrl = imageError
    ? getPlaceholderImage(character.name.ko, character.attribute)
    : getCharacterImage(cardId, character.name.ko, character.attribute);

  return (
    <motion.div
      whileHover={isSelectable ? { scale: 1.05 } : {}}
      whileTap={isSelectable ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`
        aspect-[3/4] rounded-lg overflow-hidden transition-all
        ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
        ${isSelected
          ? 'ring-4 ring-accent shadow-lg shadow-accent/30 scale-105'
          : 'border border-white/20 hover:border-accent/50'
        }
      `}
    >
      {/* 이미지 */}
      <div className="relative h-2/3 bg-black/20">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/5 to-black/20">
            <span className="text-3xl">{attrInfo.icon}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={character.name.ko}
            className="w-full h-full object-cover object-top"
            onError={() => setImageError(true)}
          />
        )}
        {/* 선택 체크 마크 */}
        {isSelected && (
          <div className="absolute inset-0 bg-accent/30 flex items-center justify-center">
            <span className="text-4xl">✓</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="h-1/3 p-2 bg-black/60 flex flex-col justify-center">
        <GradeBadge grade={character.grade as LegacyGrade} size="sm" />
        <div className="text-xs font-bold mt-1 truncate text-center">
          {character.name.ko}
        </div>
      </div>
    </motion.div>
  );
}
